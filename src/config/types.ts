export interface ModelConfig {
  name: string;
  base_url: string;
  api_key: string;
  provider_key: string;
  max_tokens?: number;
  temperature?: number;
}

export interface ProviderInfo {
  base_url: string;
  api_key: string;
  models: string[];
  selected: string;
}

export interface ProjectConfig {
  root: string;
}

export interface ProviderConfig {
  name: string;
  base_url: string;
  api_key: string;
  models: string[];
}

export interface AppConfig {
  providers: Record<string, ProviderInfo>;
  defaults: {
    provider: string;
    model: string;
  };
  custom_providers: Record<string, ProviderConfig>;
  project: ProjectConfig;
}

// 预设 provider，固定顺序
export const PROVIDER_PRESETS: Record<string, { name: string; base_url: string; models: string[] }> = {
  'deepseek': {
    name: 'deepseek',
    base_url: 'https://api.deepseek.com',
    models: ['deepseek-v4-flash', 'deepseek-v4-pro'],
  },
  'infini-ai': {
    name: 'infini-ai',
    base_url: 'https://cloud.infini-ai.com/maas/coding/v1',
    models: ['deepseek-v3.2', 'kimi-k2.5', 'minimax-m2.7', 'glm-5.1', 'glm-5'],
  },
  'xiaomi': {
    name: 'xiaomi',
    base_url: 'https://token-plan-cn.xiaomimimo.com/v1',
    models: ['mimo-v2.5-pro', 'mimo-v2.5'],
  },
  'xoai': {
    name: 'xoai',
    base_url: 'https://code-api.x-aio.com/v1',
    models: ['Qwen3.5-397B-A17B', 'MiniMax-M2.5', 'Qwen3.5-Flash', 'DeepSeek-V4-Flash', 'Qwen3-Coder-Next', 'Kimi-K2.5', 'GLM-5.1'],
  },
};

export const MAX_CUSTOM_PROVIDERS = 3;
export const DEFAULT_PROVIDER = 'deepseek';
export const DEFAULT_MODEL = 'deepseek-v4-flash';

export const DEFAULT_CONFIG: AppConfig = {
  providers: {},
  defaults: {
    provider: DEFAULT_PROVIDER,
    model: DEFAULT_MODEL,
  },
  custom_providers: {},
  project: {
    root: '.',
  },
};
