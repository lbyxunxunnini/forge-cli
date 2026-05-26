import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type { AppConfig, ModelConfig, ProviderConfig } from './types.js';
import { DEFAULT_CONFIG } from './types.js';

const MODULE_NAME = 'flutter-forge';
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

  // 获取 provider 配置
  getProvider(): ProviderConfig {
    return this.config.provider;
  }

  // 获取当前默认模型的完整配置（含 provider 的 base_url 和 api_key）
  getModel(name?: string): ModelConfig {
    const modelName = name || this.config.models.default;
    if (!this.config.provider.models.includes(modelName)) {
      throw new Error(`Model "${modelName}" not available`);
    }
    return {
      name: modelName,
      base_url: this.config.provider.base_url,
      api_key: this.config.provider.api_key,
    };
  }

  // 获取所有可用模型
  getAvailableModels(): string[] {
    return this.config.provider.models;
  }

  // 设置 provider API Key（所有模型共享）
  setApiKey(apiKey: string): void {
    this.config.provider.api_key = apiKey;
  }

  // 设置 provider base_url
  setBaseUrl(url: string): void {
    this.config.provider.base_url = url;
  }

  // 设置默认模型
  setDefaultModel(name: string): void {
    if (!this.config.provider.models.includes(name)) {
      throw new Error(`Model "${name}" not available`);
    }
    this.config.models.default = name;
  }

  // 设置项目根目录
  setProjectRoot(root: string): void {
    this.config.project.root = resolve(root);
  }

  getConfigPath(): string {
    return this.configPath;
  }

  // API Key 是否已配置
  isConfigured(): boolean {
    return !!this.config.provider.api_key;
  }

  // 获取已配置的模型列表（有 API Key 的）
  getConfiguredModels(): ModelConfig[] {
    if (!this.config.provider.api_key) return [];
    return this.config.provider.models.map(name => ({
      name,
      base_url: this.config.provider.base_url,
      api_key: this.config.provider.api_key,
    }));
  }

  private mergeConfig(overrides: Partial<AppConfig>): AppConfig {
    const defaults = structuredClone(DEFAULT_CONFIG);
    const provider = {
      name: overrides.provider?.name || defaults.provider.name,
      base_url: overrides.provider?.base_url || defaults.provider.base_url,
      api_key: overrides.provider?.api_key || defaults.provider.api_key,
      models: overrides.provider?.models || defaults.provider.models,
    };
    // 确保 default 模型在 provider.models 中
    let defaultModel = overrides.models?.default || defaults.models.default;
    if (!provider.models.includes(defaultModel)) {
      defaultModel = provider.models[0];
    }
    return {
      provider,
      models: { default: defaultModel },
      project: { root: overrides.project?.root || defaults.project.root },
    };
  }
}

export const configManager = new ConfigManager();
