export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  homepage?: string;
  keywords?: string[];
}

export interface PluginCommand {
  name: string;
  description: string;
  usage?: string;
  handler: string; // 文件路径或内联函数名
}

export interface PluginAgent {
  name: string;
  description: string;
  systemPrompt: string;
  allowedTools?: string[];
  forbiddenTools?: string[];
}

export interface PluginSkill {
  name: string;
  description: string;
  autoInvoke?: boolean;
  triggers?: string[];
  content: string; // 技能内容
}

export interface PluginHook {
  event: string;
  matcher?: string;
  handler: string; // 文件路径或内联函数名
}

export interface PluginConfig {
  metadata: PluginMetadata;
  commands?: PluginCommand[];
  agents?: PluginAgent[];
  skills?: PluginSkill[];
  hooks?: PluginHook[];
  mcpServers?: Record<string, MCPServerConfig>;
}

export interface MCPServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface Plugin {
  id: string;
  path: string;
  config: PluginConfig;
  enabled: boolean;
  loadedAt: string;
}

export interface PluginState {
  plugins: Plugin[];
  activeCommands: Map<string, PluginCommand>;
  activeAgents: Map<string, PluginAgent>;
  activeSkills: Map<string, PluginSkill>;
}
