import { spawn, type ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import type {
  MCPServerConfig,
  MCPServer,
  MCPTool,
  MCPResource,
  MCPToolCall,
  MCPToolResult,
  MCPRequest,
  MCPResponse,
} from './types.js';

export class MCPClient extends EventEmitter {
  private servers: Map<string, MCPServer> = new Map();
  private requestId = 0;
  private pendingRequests: Map<number, {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
  }> = new Map();

  // 连接到 MCP 服务器
  async connect(serverId: string, config: MCPServerConfig): Promise<boolean> {
    if (this.servers.has(serverId)) {
      return true;
    }

    try {
      const childProcess = spawn(config.command, config.args || [], {
        env: { ...process.env, ...config.env },
        cwd: config.cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const server: MCPServer = {
        id: serverId,
        config,
        tools: [],
        resources: [],
        connected: false,
        process: childProcess,
      };

      // 设置消息处理
      this.setupMessageHandling(server, childProcess);

      // 等待连接就绪
      await this.waitForReady(server);

      // 获取可用工具
      server.tools = await this.listTools(server);

      // 获取可用资源
      server.resources = await this.listResources(server);

      server.connected = true;
      this.servers.set(serverId, server);

      return true;
    } catch (error) {
      console.error(`[f-forge] MCP 服务器连接失败: ${serverId}`, error);
      return false;
    }
  }

  // 设置消息处理
  private setupMessageHandling(server: MCPServer, process: ChildProcess): void {
    let buffer = '';

    process.stdout?.on('data', (data: Buffer) => {
      buffer += data.toString();

      // 处理 JSON-RPC 消息
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const message = JSON.parse(line) as MCPResponse;
            this.handleMessage(message);
          } catch {
            // 忽略非 JSON 消息
          }
        }
      }
    });

    process.stderr?.on('data', (data: Buffer) => {
      // MCP 服务器错误日志
      console.error(`[f-forge] MCP ${server.id}: ${data.toString()}`);
    });

    process.on('exit', (code) => {
      server.connected = false;
      this.servers.delete(server.id);
      this.emit('serverDisconnected', server.id, code);
    });
  }

  // 处理消息
  private handleMessage(message: MCPResponse): void {
    const pending = this.pendingRequests.get(message.id);
    if (pending) {
      this.pendingRequests.delete(message.id);

      if (message.error) {
        pending.reject(new Error(message.error.message));
      } else {
        pending.resolve(message.result);
      }
    }
  }

  // 等待服务器就绪
  private async waitForReady(server: MCPServer): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('MCP 服务器连接超时'));
      }, 10000);

      // 发送初始化请求
      this.sendRequest(server, 'initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'flutter-forge',
          version: '0.4.0',
        },
      }).then(() => {
        clearTimeout(timeout);
        resolve();
      }).catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  // 发送请求
  private async sendRequest(server: MCPServer, method: string, params?: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      const request: MCPRequest = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      this.pendingRequests.set(id, { resolve, reject });

      const process = server.process as ChildProcess;
      process.stdin?.write(JSON.stringify(request) + '\n');

      // 超时处理
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('请求超时'));
        }
      }, 30000);
    });
  }

  // 列出工具
  private async listTools(server: MCPServer): Promise<MCPTool[]> {
    try {
      const result = await this.sendRequest(server, 'tools/list') as { tools: MCPTool[] };
      return result.tools || [];
    } catch {
      return [];
    }
  }

  // 列出资源
  private async listResources(server: MCPServer): Promise<MCPResource[]> {
    try {
      const result = await this.sendRequest(server, 'resources/list') as { resources: MCPResource[] };
      return result.resources || [];
    } catch {
      return [];
    }
  }

  // 调用工具
  async callTool(call: MCPToolCall): Promise<MCPToolResult> {
    const server = this.servers.get(call.server);
    if (!server || !server.connected) {
      throw new Error(`MCP 服务器未连接: ${call.server}`);
    }

    try {
      const result = await this.sendRequest(server, 'tools/call', {
        name: call.tool,
        arguments: call.arguments,
      }) as MCPToolResult;

      return result;
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `工具调用失败: ${error}`,
        }],
        isError: true,
      };
    }
  }

  // 获取所有可用工具
  getAllTools(): Array<MCPTool & { server: string }> {
    const tools: Array<MCPTool & { server: string }> = [];

    for (const server of this.servers.values()) {
      if (server.connected) {
        for (const tool of server.tools) {
          tools.push({ ...tool, server: server.id });
        }
      }
    }

    return tools;
  }

  // 获取所有可用资源
  getAllResources(): Array<MCPResource & { server: string }> {
    const resources: Array<MCPResource & { server: string }> = [];

    for (const server of this.servers.values()) {
      if (server.connected) {
        for (const resource of server.resources) {
          resources.push({ ...resource, server: server.id });
        }
      }
    }

    return resources;
  }

  // 获取服务器
  getServer(serverId: string): MCPServer | undefined {
    return this.servers.get(serverId);
  }

  // 获取所有服务器
  getServers(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  // 断开连接
  async disconnect(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (server) {
      const process = server.process as ChildProcess;
      process.kill();
      server.connected = false;
      this.servers.delete(serverId);
    }
  }

  // 断开所有连接
  async disconnectAll(): Promise<void> {
    for (const server of this.servers.values()) {
      const process = server.process as ChildProcess;
      process.kill();
      server.connected = false;
    }
    this.servers.clear();
  }

  // 检查服务器是否已连接
  isConnected(serverId: string): boolean {
    const server = this.servers.get(serverId);
    return server?.connected || false;
  }

  // 获取连接状态
  getStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    for (const [id, server] of this.servers) {
      status[id] = server.connected;
    }
    return status;
  }
}

export const mcpClient = new MCPClient();
