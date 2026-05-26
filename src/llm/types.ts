export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ChatCompletion {
  id: string;
  choices: {
    index: number;
    message: Message;
    finish_reason: string;
  }[];
}

export interface StreamChunk {
  id: string;
  choices: {
    index: number;
    delta: Partial<Message>;
    finish_reason: string | null;
  }[];
}

export interface LLMConfig {
  model: string;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}
