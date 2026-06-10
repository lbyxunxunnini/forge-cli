import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type { AppConfig, ModelConfig, ProviderConfig, ProviderInfo } from './types.js';
import { PROVIDER_PRESETS, MAX_CUSTOM_PROVIDERS, DEFAULT_CONFIG, DEFAULT_PROVIDER, DEFAULT_MODEL } from './types.js';

const MODULE_NAME = 'forge-cli';
const CONFIG_DIR = join(homedir(), `.${MODULE_NAME}`);
const CONFIG_FILE = join(CONFIG_DIR, 'config.yaml');

export class ConfigManager {
  private config: AppConfig;
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || CONFIG_FILE;
    this.config = structuredClone(DEFAULT_CONFIG);
  }

  async load(): Promise<AppConfig> {
    if (existsSync(this.configPath)) {
      const content = readFileSync(this.configPath, 'utf-8');
      const parsed = parseYaml(content);
      this.config = this.mergeConfig(parsed);
    }
    return this.config;
  }

  async save(): Promise<void> {
    const dir = this.configPath.replace(/[^/\\]+$/, '');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const content = stringifyYaml(this.config);
    writeFileSync(this.configPath, content, 'utf-8');
  }

  get(): AppConfig {
    return this.config;
  }

  // ─── Provider 查询 ─────────────────────────────────────────

  // 获取所有 provider（预设 + 自定义）
  getAllProviders(): Array<{ key: string; info: ProviderInfo; isPreset: boolean }> {
    const result: Array<{ key: string; info: ProviderInfo; isPreset: boolean }> = [];
    // 预设固定顺序
    for (const [key, preset] of Object.entries(PROVIDER_PRESETS)) {
      const saved = this.config.providers[key];
      result.push({
        key,
        info: {
          base_url: saved?.base_url || preset.base_url,
          api_key: saved?.api_key || '',
          models: saved?.models || preset.models,
          selected: saved?.selected || '',
        },
        isPreset: true,
      });
    }
    // 自定义
    for (const [key, cp] of Object.entries(this.config.custom_providers)) {
      const saved = this.config.providers[key];
      result.push({
        key,
        info: {
          base_url: saved?.base_url || cp.base_url,
          api_key: saved?.api_key || cp.api_key,
          models: saved?.models || cp.models,
          selected: saved?.selected || '',
        },
        isPreset: false,
      });
    }
    return result;
  }

  // 获取指定 provider
  getProvider(key: string): ProviderInfo | null {
    if (PROVIDER_PRESETS[key]) {
      const preset = PROVIDER_PRESETS[key];
      const saved = this.config.providers[key];
      return {
        base_url: saved?.base_url || preset.base_url,
        api_key: saved?.api_key || '',
        models: saved?.models || preset.models,
        selected: saved?.selected || '',
      };
    }
    const cp = this.config.custom_providers[key];
    if (cp) {
      const saved = this.config.providers[key];
      return {
        base_url: saved?.base_url || cp.base_url,
        api_key: saved?.api_key || cp.api_key,
        models: saved?.models || cp.models,
        selected: saved?.selected || '',
      };
    }
    return null;
  }

  // 获取当前默认 provider key
  getDefaultProvider(): string {
    return this.config.defaults.provider;
  }

  // 获取当前默认模型的完整配置
  getModel(providerKey?: string, modelName?: string): ModelConfig {
    const pk = providerKey || this.config.defaults.provider;
    const info = this.getProvider(pk);
    if (!info) {
      throw new Error(`Provider "${pk}" not found`);
    }
    const mn = modelName || info.selected || this.config.defaults.model || info.models[0];
    // 环境变量 fallback
    const apiKey = process.env.FORGE_API_KEY || info.api_key;
    const baseUrl = process.env.FORGE_BASE_URL || info.base_url;
    return {
      name: mn,
      base_url: baseUrl,
      api_key: apiKey,
      provider_key: pk,
    };
  }

  // ─── Provider 设置 ─────────────────────────────────────────

  // 设置 provider API Key
  setApiKey(providerKey: string, apiKey: string): void {
    if (!this.config.providers[providerKey]) {
      this.config.providers[providerKey] = { base_url: '', api_key: '', models: [], selected: '' };
    }
    this.config.providers[providerKey].api_key = apiKey;
  }

  // 设置 provider 选择的模型
  setSelectedModel(providerKey: string, modelName: string): void {
    if (!this.config.providers[providerKey]) {
      this.config.providers[providerKey] = { base_url: '', api_key: '', models: [], selected: '' };
    }
    this.config.providers[providerKey].selected = modelName;
    this.config.defaults.provider = providerKey;
    this.config.defaults.model = modelName;
  }

  // 添加自定义 provider
  addCustomProvider(key: string, config: ProviderConfig): void {
    const customCount = Object.keys(this.config.custom_providers).length;
    if (customCount >= MAX_CUSTOM_PROVIDERS) {
      throw new Error(`最多支持 ${MAX_CUSTOM_PROVIDERS} 个自定义 provider`);
    }
    this.config.custom_providers[key] = config;
    this.config.providers[key] = {
      base_url: config.base_url,
      api_key: config.api_key,
      models: config.models,
      selected: '',
    };
  }

  // 删除自定义 provider
  removeCustomProvider(key: string): void {
    delete this.config.custom_providers[key];
    delete this.config.providers[key];
    // 如果删的是当前默认，切回 deepseek
    if (this.config.defaults.provider === key) {
      this.config.defaults.provider = DEFAULT_PROVIDER;
      this.config.defaults.model = DEFAULT_MODEL;
    }
  }

  // ─── 废弃兼容 ─────────────────────────────────────────────

  getProvider_legacy(): ProviderConfig {
    const pk = this.config.defaults.provider;
    const info = this.getProvider(pk);
    return {
      name: pk,
      base_url: info?.base_url || '',
      api_key: info?.api_key || '',
      models: info?.models || [],
    };
  }

  setBaseUrl(url: string): void {
    const pk = this.config.defaults.provider;
    if (!this.config.providers[pk]) {
      this.config.providers[pk] = { base_url: '', api_key: '', models: [], selected: '' };
    }
    this.config.providers[pk].base_url = url;
  }

  setDefaultModel(name: string): void {
    const pk = this.config.defaults.provider;
    if (!this.config.providers[pk]) {
      this.config.providers[pk] = { base_url: '', api_key: '', models: [], selected: '' };
    }
    this.config.providers[pk].selected = name;
    this.config.defaults.model = name;
  }

  setProjectRoot(root: string): void {
    this.config.project.root = resolve(root);
  }

  getConfigPath(): string {
    return this.configPath;
  }

  // 当前默认 provider 是否已配置 API Key
  isConfigured(): boolean {
    const pk = this.config.defaults.provider;
    const info = this.getProvider(pk);
    return !!(info?.api_key || process.env.FORGE_API_KEY);
  }

  // 获取可用模型列表
  getAvailableModels(): string[] {
    const pk = this.config.defaults.provider;
    const info = this.getProvider(pk);
    return info?.models || [];
  }

  getConfiguredModels(): ModelConfig[] {
    const pk = this.config.defaults.provider;
    const info = this.getProvider(pk);
    if (!info || (!info.api_key && !process.env.FORGE_API_KEY)) return [];
    return info.models.map(name => ({
      name,
      base_url: info.base_url,
      api_key: info.api_key,
      provider_key: pk,
    }));
  }

  // ─── 合并配置 ─────────────────────────────────────────────

  private mergeConfig(overrides: Partial<AppConfig>): AppConfig {
    const defaults = structuredClone(DEFAULT_CONFIG);
    return {
      providers: overrides.providers || defaults.providers,
      defaults: {
        provider: overrides.defaults?.provider || defaults.defaults.provider,
        model: overrides.defaults?.model || defaults.defaults.model,
      },
      custom_providers: overrides.custom_providers || defaults.custom_providers,
      project: { root: overrides.project?.root || defaults.project.root },
    };
  }
}

export const configManager = new ConfigManager();
