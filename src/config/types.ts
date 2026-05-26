export interface ModelConfig {
  name: string;
  base_url: string;
  api_key: string;
  max_tokens?: number;
  temperature?: number;
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
  provider: ProviderConfig;
  models: {
    default: string;
  };
  project: ProjectConfig;
}

export const DEFAULT_CONFIG: AppConfig = {
  provider: {
    name: 'deepseek',
    base_url: 'https://api.deepseek.com',
    api_key: '',
    models: ['deepseek-v4-flash', 'deepseek-v4-pro'],
  },
  models: {
    default: 'deepseek-v4-flash',
  },
  project: {
    root: '.',
  },
};
