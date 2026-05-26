import { pluginLoader } from './loader.js';
import type {
  Plugin,
  PluginCommand,
  PluginAgent,
  PluginSkill,
  PluginConfig,
  PluginState,
} from './types.js';

export class PluginManager {
  private state: PluginState = {
    plugins: [],
    activeCommands: new Map(),
    activeAgents: new Map(),
    activeSkills: new Map(),
  };

  private initialized = false;

  // 初始化插件管理器
  async init(): Promise<void> {
    if (this.initialized) return;

    const plugins = await pluginLoader.loadAll();
    this.state.plugins = plugins;

    // 索引所有活跃资源
    for (const plugin of plugins) {
      if (plugin.enabled) {
        this.indexPluginResources(plugin);
      }
    }

    this.initialized = true;
  }

  // 索引插件资源
  private indexPluginResources(plugin: Plugin): void {
    const { config } = plugin;

    // 索引命令
    if (config.commands) {
      for (const cmd of config.commands) {
        this.state.activeCommands.set(`/${cmd.name}`, cmd);
      }
    }

    // 索引 Agent
    if (config.agents) {
      for (const agent of config.agents) {
        this.state.activeAgents.set(agent.name, agent);
      }
    }

    // 索引技能
    if (config.skills) {
      for (const skill of config.skills) {
        this.state.activeSkills.set(skill.name, skill);
      }
    }
  }

  // 获取所有插件
  getPlugins(): Plugin[] {
    return this.state.plugins;
  }

  // 获取活跃插件
  getActivePlugins(): Plugin[] {
    return this.state.plugins.filter(p => p.enabled);
  }

  // 启用插件
  enable(pluginId: string): boolean {
    const plugin = this.state.plugins.find(p => p.id === pluginId);
    if (plugin) {
      plugin.enabled = true;
      this.indexPluginResources(plugin);
      return true;
    }
    return false;
  }

  // 禁用插件
  disable(pluginId: string): boolean {
    const plugin = this.state.plugins.find(p => p.id === pluginId);
    if (plugin) {
      plugin.enabled = false;
      this.removePluginResources(plugin);
      return true;
    }
    return false;
  }

  // 移除插件资源
  private removePluginResources(plugin: Plugin): void {
    const { config } = plugin;

    if (config.commands) {
      for (const cmd of config.commands) {
        this.state.activeCommands.delete(`/${cmd.name}`);
      }
    }

    if (config.agents) {
      for (const agent of config.agents) {
        this.state.activeAgents.delete(agent.name);
      }
    }

    if (config.skills) {
      for (const skill of config.skills) {
        this.state.activeSkills.delete(skill.name);
      }
    }
  }

  // 获取命令
  getCommand(name: string): PluginCommand | undefined {
    return this.state.activeCommands.get(name);
  }

  // 获取所有命令
  getCommands(): PluginCommand[] {
    return Array.from(this.state.activeCommands.values());
  }

  // 获取 Agent
  getAgent(name: string): PluginAgent | undefined {
    return this.state.activeAgents.get(name);
  }

  // 获取所有 Agent
  getAgents(): PluginAgent[] {
    return Array.from(this.state.activeAgents.values());
  }

  // 获取技能
  getSkill(name: string): PluginSkill | undefined {
    return this.state.activeSkills.get(name);
  }

  // 获取所有技能
  getSkills(): PluginSkill[] {
    return Array.from(this.state.activeSkills.values());
  }

  // 获取自动触发的技能
  getAutoInvokeSkills(): PluginSkill[] {
    return Array.from(this.state.activeSkills.values()).filter(s => s.autoInvoke);
  }

  // 匹配技能
  matchSkills(input: string): PluginSkill[] {
    const matched: PluginSkill[] = [];

    for (const skill of this.state.activeSkills.values()) {
      if (skill.triggers) {
        for (const trigger of skill.triggers) {
          if (input.toLowerCase().includes(trigger.toLowerCase())) {
            matched.push(skill);
            break;
          }
        }
      }
    }

    return matched;
  }

  // 重新加载插件
  async reload(pluginId: string): Promise<boolean> {
    const plugin = await pluginLoader.reload(pluginId);
    if (plugin) {
      if (plugin.enabled) {
        this.indexPluginResources(plugin);
      }
      return true;
    }
    return false;
  }

  // 获取状态
  getState(): PluginState {
    return { ...this.state };
  }

  // 获取摘要
  getSummary(): string {
    const active = this.getActivePlugins();
    return `已加载 ${this.state.plugins.length} 个插件，${active.length} 个活跃`;
  }
}

export const pluginManager = new PluginManager();
