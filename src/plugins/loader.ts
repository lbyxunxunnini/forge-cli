import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';
import { parse as parseYaml } from 'yaml';
import type {
  Plugin,
  PluginConfig,
  PluginMetadata,
  PluginCommand,
  PluginAgent,
  PluginSkill,
  PluginHook,
  MCPServerConfig,
} from './types.js';

const PLUGINS_DIR = join(homedir(), '.forge-cli', 'plugins');
const PROJECT_PLUGINS_DIR = '.forge-cli/plugins';

export class PluginLoader {
  private loadedPlugins: Map<string, Plugin> = new Map();

  // 加载所有插件
  async loadAll(): Promise<Plugin[]> {
    const plugins: Plugin[] = [];

    // 加载用户级插件
    const userPlugins = await this.loadFromDirectory(PLUGINS_DIR);
    plugins.push(...userPlugins);

    // 加载项目级插件
    const projectPlugins = await this.loadFromDirectory(PROJECT_PLUGINS_DIR);
    plugins.push(...projectPlugins);

    return plugins;
  }

  // 从目录加载插件
  async loadFromDirectory(dir: string): Promise<Plugin[]> {
    if (!existsSync(dir)) {
      return [];
    }

    const plugins: Plugin[] = [];
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const pluginDir = join(dir, entry);
      const stat = statSync(pluginDir);

      if (!stat.isDirectory()) continue;

      try {
        const plugin = await this.loadPlugin(pluginDir);
        if (plugin) {
          plugins.push(plugin);
          this.loadedPlugins.set(plugin.id, plugin);
        }
      } catch (error) {
        console.error(`[f-forge] 加载插件失败: ${entry}`, error);
      }
    }

    return plugins;
  }

  // 加载单个插件
  async loadPlugin(pluginDir: string): Promise<Plugin | null> {
    // 检查 .plugin.json 或 plugin.json
    const configPaths = [
      join(pluginDir, '.plugin.json'),
      join(pluginDir, 'plugin.json'),
      join(pluginDir, '.claude-plugin', 'plugin.json'),
    ];

    let configPath: string | null = null;
    for (const path of configPaths) {
      if (existsSync(path)) {
        configPath = path;
        break;
      }
    }

    if (!configPath) {
      return null;
    }

    try {
      const content = readFileSync(configPath, 'utf-8');
      const metadata = JSON.parse(content) as PluginMetadata;

      // 构建完整配置
      const config = await this.buildPluginConfig(pluginDir, metadata);

      return {
        id: metadata.name,
        path: pluginDir,
        config,
        enabled: true,
        loadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`[f-forge] 解析插件配置失败: ${configPath}`, error);
      return null;
    }
  }

  // 构建插件配置
  private async buildPluginConfig(pluginDir: string, metadata: PluginMetadata): Promise<PluginConfig> {
    const config: PluginConfig = { metadata };

    // 加载命令
    const commandsDir = join(pluginDir, 'commands');
    if (existsSync(commandsDir)) {
      config.commands = this.loadCommands(commandsDir);
    }

    // 加载 Agent
    const agentsDir = join(pluginDir, 'agents');
    if (existsSync(agentsDir)) {
      config.agents = this.loadAgents(agentsDir);
    }

    // 加载技能
    const skillsDir = join(pluginDir, 'skills');
    if (existsSync(skillsDir)) {
      config.skills = this.loadSkills(skillsDir);
    }

    // 加载钩子配置
    const hooksDir = join(pluginDir, 'hooks');
    if (existsSync(hooksDir)) {
      config.hooks = this.loadHooks(hooksDir);
    }

    // 加载 MCP 配置
    const mcpConfigPath = join(pluginDir, '.mcp.json');
    if (existsSync(mcpConfigPath)) {
      config.mcpServers = this.loadMCPConfig(mcpConfigPath);
    }

    return config;
  }

  // 加载命令
  private loadCommands(dir: string): PluginCommand[] {
    const commands: PluginCommand[] = [];
    const files = readdirSync(dir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      try {
        const content = readFileSync(join(dir, file), 'utf-8');
        const name = file.replace('.md', '');

        // 解析 frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (frontmatterMatch) {
          const frontmatter = parseYaml(frontmatterMatch[1]) as Record<string, unknown>;
          commands.push({
            name: (frontmatter.name as string) || name,
            description: (frontmatter.description as string) || '',
            usage: frontmatter.usage as string,
            handler: join(dir, file),
          });
        }
      } catch {
        // 跳过解析失败的命令
      }
    }

    return commands;
  }

  // 加载 Agent
  private loadAgents(dir: string): PluginAgent[] {
    const agents: PluginAgent[] = [];
    const files = readdirSync(dir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      try {
        const content = readFileSync(join(dir, file), 'utf-8');
        const name = file.replace('.md', '');

        // 解析 frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (frontmatterMatch) {
          const frontmatter = parseYaml(frontmatterMatch[1]) as Record<string, unknown>;
          agents.push({
            name: (frontmatter.name as string) || name,
            description: (frontmatter.description as string) || '',
            systemPrompt: frontmatterMatch[2].trim(),
            allowedTools: frontmatter.allowedTools as string[],
            forbiddenTools: frontmatter.forbiddenTools as string[],
          });
        }
      } catch {
        // 跳过解析失败的 Agent
      }
    }

    return agents;
  }

  // 加载技能
  private loadSkills(dir: string): PluginSkill[] {
    const skills: PluginSkill[] = [];
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const skillDir = join(dir, entry);
      const stat = statSync(skillDir);

      if (stat.isDirectory()) {
        const skillFile = join(skillDir, 'SKILL.md');
        if (existsSync(skillFile)) {
          try {
            const content = readFileSync(skillFile, 'utf-8');
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

            if (frontmatterMatch) {
              const frontmatter = parseYaml(frontmatterMatch[1]) as Record<string, unknown>;
              skills.push({
                name: (frontmatter.name as string) || entry,
                description: (frontmatter.description as string) || '',
                autoInvoke: frontmatter.autoInvoke as boolean,
                triggers: frontmatter.triggers as string[],
                content: frontmatterMatch[2].trim(),
              });
            }
          } catch {
            // 跳过解析失败的技能
          }
        }
      }
    }

    return skills;
  }

  // 加载钩子
  private loadHooks(dir: string): PluginHook[] {
    const hooks: PluginHook[] = [];
    const hooksJsonPath = join(dir, 'hooks.json');

    if (existsSync(hooksJsonPath)) {
      try {
        const content = readFileSync(hooksJsonPath, 'utf-8');
        const hooksConfig = JSON.parse(content);

        if (hooksConfig.hooks) {
          for (const [event, handlers] of Object.entries(hooksConfig.hooks)) {
            const handlersArray = handlers as Array<{ hooks: Array<{ type: string; command: string }>; matcher?: string }>;
            for (const handler of handlersArray) {
              for (const hook of handler.hooks) {
                hooks.push({
                  event,
                  matcher: handler.matcher,
                  handler: hook.command,
                });
              }
            }
          }
        }
      } catch {
        // 跳过解析失败的钩子
      }
    }

    return hooks;
  }

  // 加载 MCP 配置
  private loadMCPConfig(path: string): Record<string, MCPServerConfig> {
    try {
      const content = readFileSync(path, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  // 获取已加载的插件
  getLoadedPlugins(): Plugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  // 获取插件
  getPlugin(id: string): Plugin | undefined {
    return this.loadedPlugins.get(id);
  }

  // 重新加载插件
  async reload(pluginId: string): Promise<Plugin | null> {
    const existing = this.loadedPlugins.get(pluginId);
    if (!existing) return null;

    const plugin = await this.loadPlugin(existing.path);
    if (plugin) {
      this.loadedPlugins.set(pluginId, plugin);
    }
    return plugin;
  }
}

export const pluginLoader = new PluginLoader();
