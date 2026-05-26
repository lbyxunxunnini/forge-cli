#!/usr/bin/env node
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/cli/repl.ts
import * as readline2 from "readline";
import chalk5 from "chalk";

// src/config/manager.ts
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { homedir } from "os";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

// src/config/types.ts
var DEFAULT_CONFIG = {
  provider: {
    name: "deepseek",
    base_url: "https://api.deepseek.com",
    api_key: "",
    models: ["deepseek-v4-flash", "deepseek-v4-pro"]
  },
  models: {
    default: "deepseek-v4-flash"
  },
  project: {
    root: "."
  }
};

// src/config/manager.ts
var MODULE_NAME = "flutter-forge";
var CONFIG_DIR = join(homedir(), `.${MODULE_NAME}`);
var CONFIG_FILE = join(CONFIG_DIR, "config.yaml");
var ConfigManager = class {
  config;
  configPath;
  constructor(configPath) {
    this.configPath = configPath || CONFIG_FILE;
    this.config = structuredClone(DEFAULT_CONFIG);
  }
  async load() {
    if (existsSync(this.configPath)) {
      const content = readFileSync(this.configPath, "utf-8");
      const parsed = parseYaml(content);
      this.config = this.mergeConfig(parsed);
    }
    return this.config;
  }
  async save() {
    const dir = this.configPath.replace(/[^/\\]+$/, "");
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const content = stringifyYaml(this.config);
    writeFileSync(this.configPath, content, "utf-8");
  }
  get() {
    return this.config;
  }
  // 获取 provider 配置
  getProvider() {
    return this.config.provider;
  }
  // 获取当前默认模型的完整配置（含 provider 的 base_url 和 api_key）
  getModel(name) {
    const modelName = name || this.config.models.default;
    if (!this.config.provider.models.includes(modelName)) {
      throw new Error(`Model "${modelName}" not available`);
    }
    return {
      name: modelName,
      base_url: this.config.provider.base_url,
      api_key: this.config.provider.api_key
    };
  }
  // 获取所有可用模型
  getAvailableModels() {
    return this.config.provider.models;
  }
  // 设置 provider API Key（所有模型共享）
  setApiKey(apiKey) {
    this.config.provider.api_key = apiKey;
  }
  // 设置 provider base_url
  setBaseUrl(url) {
    this.config.provider.base_url = url;
  }
  // 设置默认模型
  setDefaultModel(name) {
    if (!this.config.provider.models.includes(name)) {
      throw new Error(`Model "${name}" not available`);
    }
    this.config.models.default = name;
  }
  // 设置项目根目录
  setProjectRoot(root) {
    this.config.project.root = resolve(root);
  }
  getConfigPath() {
    return this.configPath;
  }
  // API Key 是否已配置
  isConfigured() {
    return !!this.config.provider.api_key;
  }
  // 获取已配置的模型列表（有 API Key 的）
  getConfiguredModels() {
    if (!this.config.provider.api_key) return [];
    return this.config.provider.models.map((name) => ({
      name,
      base_url: this.config.provider.base_url,
      api_key: this.config.provider.api_key
    }));
  }
  mergeConfig(overrides) {
    const defaults = structuredClone(DEFAULT_CONFIG);
    const provider = {
      name: overrides.provider?.name || defaults.provider.name,
      base_url: overrides.provider?.base_url || defaults.provider.base_url,
      api_key: overrides.provider?.api_key || defaults.provider.api_key,
      models: overrides.provider?.models || defaults.provider.models
    };
    let defaultModel = overrides.models?.default || defaults.models.default;
    if (!provider.models.includes(defaultModel)) {
      defaultModel = provider.models[0];
    }
    return {
      provider,
      models: { default: defaultModel },
      project: { root: overrides.project?.root || defaults.project.root }
    };
  }
};
var configManager = new ConfigManager();

// src/llm/context.ts
var ContextManager = class _ContextManager {
  messages = [];
  systemPrompt = "";
  maxMessages;
  constructor(maxMessages = 100) {
    this.maxMessages = maxMessages;
  }
  setSystemPrompt(prompt) {
    this.systemPrompt = prompt;
  }
  addMessage(message) {
    this.messages.push(message);
    this.truncateIfNeeded();
  }
  addUserMessage(content) {
    this.addMessage({ role: "user", content });
  }
  addAssistantMessage(content) {
    this.addMessage({ role: "assistant", content });
  }
  addToolResult(toolCallId, content) {
    this.addMessage({ role: "tool", content, tool_call_id: toolCallId });
  }
  getMessages() {
    const messages = [];
    if (this.systemPrompt) {
      messages.push({ role: "system", content: this.systemPrompt });
    }
    messages.push(...this.messages);
    return messages;
  }
  getHistory() {
    return [...this.messages];
  }
  clear() {
    this.messages = [];
  }
  getLength() {
    return this.messages.length;
  }
  getSummary() {
    const userMessages = this.messages.filter((m) => m.role === "user").length;
    const assistantMessages = this.messages.filter((m) => m.role === "assistant").length;
    const toolMessages = this.messages.filter((m) => m.role === "tool").length;
    return `\u6D88\u606F\u6570: ${this.messages.length} (\u7528\u6237: ${userMessages}, \u52A9\u624B: ${assistantMessages}, \u5DE5\u5177: ${toolMessages})`;
  }
  isEmpty() {
    return this.messages.length === 0;
  }
  getLastUserMessage() {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].role === "user") {
        return this.messages[i].content;
      }
    }
    return void 0;
  }
  getLastAssistantMessage() {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].role === "assistant") {
        return this.messages[i].content;
      }
    }
    return void 0;
  }
  toJSON() {
    return JSON.stringify({
      systemPrompt: this.systemPrompt,
      messages: this.messages
    }, null, 2);
  }
  static fromJSON(json) {
    const data = JSON.parse(json);
    const manager = new _ContextManager();
    manager.systemPrompt = data.systemPrompt || "";
    manager.messages = data.messages || [];
    return manager;
  }
  truncateIfNeeded() {
    if (this.messages.length <= this.maxMessages) return;
    const prefixSize = Math.min(10, Math.floor(this.maxMessages * 0.2));
    const windowSize = this.maxMessages - prefixSize;
    const prefix = this.messages.slice(0, prefixSize);
    const recent = this.messages.slice(this.messages.length - windowSize);
    this.messages = [...prefix, ...recent];
  }
};
var contextManager = new ContextManager();

// src/llm/client-v2.ts
import { generateText, streamText, tool, stepCountIs } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
function createCompatFetch() {
  return async (url, options) => {
    if (options?.body && typeof options.body === "string") {
      try {
        const parsed = JSON.parse(options.body);
        if (!parsed.thinking) {
          parsed.thinking = { type: "disabled" };
        }
        options = { ...options, body: JSON.stringify(parsed) };
      } catch {
      }
    }
    return fetch(url, options);
  };
}
var AIClient = class {
  provider;
  modelName;
  constructor(config) {
    this.provider = createOpenAI({
      apiKey: config.api_key,
      baseURL: config.base_url,
      fetch: createCompatFetch()
    });
    this.modelName = config.name;
  }
  setModel(config) {
    this.provider = createOpenAI({
      apiKey: config.api_key,
      baseURL: config.base_url,
      fetch: createCompatFetch()
    });
    this.modelName = config.name;
  }
  getModel() {
    return this.modelName;
  }
  // 将自定义工具转换为 AI SDK 工具格式
  convertTools(tools) {
    const converted = {};
    for (const t of tools) {
      const schemaObj = {};
      for (const [key, prop] of Object.entries(t.parameters)) {
        if (prop.type === "string") {
          schemaObj[key] = z.string().describe(prop.description);
        } else if (prop.type === "number") {
          schemaObj[key] = z.number().describe(prop.description);
        } else if (prop.type === "boolean") {
          schemaObj[key] = z.boolean().describe(prop.description);
        } else {
          schemaObj[key] = z.string().describe(prop.description);
        }
      }
      const schema = z.object(schemaObj);
      converted[t.name] = tool({
        description: t.description,
        inputSchema: schema,
        execute: async (args) => {
          const result = await t.execute(args);
          return result;
        }
      });
    }
    return converted;
  }
  // 单次生成
  async generate(prompt, systemPrompt, tools, maxSteps) {
    const convertedTools = tools ? this.convertTools(tools) : void 0;
    const result = await generateText({
      model: this.provider.chat(this.modelName),
      prompt,
      system: systemPrompt,
      tools: convertedTools,
      temperature: 0.7,
      stopWhen: maxSteps ? stepCountIs(maxSteps) : void 0
    });
    return {
      text: result.text,
      toolCalls: result.steps.flatMap((s) => s.toolCalls),
      toolResults: result.steps.flatMap((s) => s.toolResults)
    };
  }
  // 流式生成
  async *stream(prompt, systemPrompt, tools, maxSteps) {
    const convertedTools = tools ? this.convertTools(tools) : void 0;
    const result = streamText({
      model: this.provider.chat(this.modelName),
      prompt,
      system: systemPrompt,
      tools: convertedTools,
      temperature: 0.7,
      stopWhen: maxSteps ? stepCountIs(maxSteps) : void 0
    });
    for await (const chunk of result.textStream) {
      yield { type: "text", content: chunk };
    }
  }
  // 带上下文的生成
  async generateWithMessages(messages, tools, maxSteps) {
    const convertedTools = tools ? this.convertTools(tools) : void 0;
    const systemMsg = messages.find((m) => m.role === "system");
    const otherMsgs = messages.filter((m) => m.role !== "system");
    const result = await generateText({
      model: this.provider.chat(this.modelName),
      messages: otherMsgs.map((m) => ({
        role: m.role,
        content: m.content
      })),
      system: systemMsg?.content,
      tools: convertedTools,
      temperature: 0.7,
      stopWhen: maxSteps ? stepCountIs(maxSteps) : void 0
    });
    return {
      text: result.text,
      toolCalls: result.steps.flatMap((s) => s.toolCalls),
      toolResults: result.steps.flatMap((s) => s.toolResults)
    };
  }
  // 流式生成带上下文
  async *streamWithMessages(messages, tools, maxSteps) {
    const convertedTools = tools ? this.convertTools(tools) : void 0;
    const systemMsg = messages.find((m) => m.role === "system");
    const otherMsgs = messages.filter((m) => m.role !== "system");
    const result = streamText({
      model: this.provider.chat(this.modelName),
      messages: otherMsgs.map((m) => ({
        role: m.role,
        content: m.content
      })),
      system: systemMsg?.content,
      tools: convertedTools,
      temperature: 0.7,
      stopWhen: maxSteps ? stepCountIs(maxSteps) : void 0
    });
    for await (const chunk of result.textStream) {
      yield { type: "text", content: chunk };
    }
  }
};

// src/agents/registry.ts
import { readFileSync as readFileSync2 } from "fs";
import { join as join2 } from "path";
var ROLES_DIR = join2(import.meta.dirname, "..", "..", "references", "roles");
var AGENT_CONFIGS = {
  controller: {
    role: "controller",
    name: "\u4E3B\u63A7",
    description: "\u8DEF\u7531\u5224\u65AD\u3001\u9636\u6BB5\u63A8\u8FDB\u3001\u5B50 Agent \u8C03\u5EA6\u3001\u72B6\u6001\u7BA1\u7406",
    allowedTools: ["*"],
    forbiddenTools: []
  },
  requirement_analyst: {
    role: "requirement_analyst",
    name: "\u9700\u6C42\u5206\u6790\u5E08",
    description: "\u76EE\u6807\u51BB\u7ED3\u3001\u8303\u56F4\u786E\u8BA4\u3001\u9A8C\u6536\u6807\u51C6\u3001\u7EA6\u675F\u5B9A\u4E49",
    allowedTools: ["read_file", "list_files", "search_files", "scan_project", "detect_project_state"],
    forbiddenTools: ["write_file", "edit_file", "run_command"]
  },
  ui_designer: {
    role: "ui_designer",
    name: "UI \u8BBE\u8BA1\u5E08",
    description: "\u89C6\u89C9\u65B9\u6848\u3001\u4EA4\u4E92\u8BBE\u8BA1\u3001\u6837\u5F0F\u89C4\u8303",
    allowedTools: ["read_file", "list_files", "search_files", "scan_project"],
    forbiddenTools: ["write_file", "edit_file", "run_command"]
  },
  architecture_designer: {
    role: "architecture_designer",
    name: "\u67B6\u6784\u8BBE\u8BA1\u5E08",
    description: "\u67B6\u6784\u8BBE\u8BA1\u3001\u6A21\u5757\u5212\u5206\u3001\u6280\u672F\u9009\u578B",
    allowedTools: ["read_file", "list_files", "search_files", "scan_project", "detect_project_state"],
    forbiddenTools: ["write_file", "edit_file", "run_command"]
  },
  page_engineer: {
    role: "page_engineer",
    name: "\u9875\u9762\u5DE5\u7A0B\u5E08",
    description: "\u4EE3\u7801\u5B9E\u73B0\u3001\u6587\u4EF6\u8BFB\u5199\u3001\u547D\u4EE4\u6267\u884C",
    allowedTools: ["*"],
    forbiddenTools: []
  },
  verify_agent: {
    role: "verify_agent",
    name: "\u9A8C\u8BC1\u5DE5\u7A0B\u5E08",
    description: "\u529F\u80FD\u9A8C\u8BC1\u3001\u6D4B\u8BD5\u6267\u884C\u3001\u8D28\u91CF\u68C0\u67E5",
    allowedTools: ["read_file", "list_files", "search_files", "run_command", "validate_output", "validate_docs_sync"],
    forbiddenTools: ["write_file", "edit_file"]
  }
};
var AgentRegistry = class {
  configs = /* @__PURE__ */ new Map();
  constructor() {
    this.loadConfigs();
  }
  loadConfigs() {
    for (const [role, config] of Object.entries(AGENT_CONFIGS)) {
      const systemPrompt = this.loadRolePrompt(role);
      this.configs.set(role, {
        ...config,
        systemPrompt
      });
    }
  }
  loadRolePrompt(role) {
    if (role === "controller") {
      return this.getControllerPrompt();
    }
    const roleFile = join2(ROLES_DIR, `${role}.md`);
    try {
      return readFileSync2(roleFile, "utf-8");
    } catch {
      return this.getDefaultPrompt(role);
    }
  }
  getControllerPrompt() {
    return `\u4F60\u662F Flutter Forge \u7684\u4E3B\u63A7 Agent\uFF0C\u8D1F\u8D23\u8DEF\u7531\u5224\u65AD\u3001\u9636\u6BB5\u63A8\u8FDB\u3001\u5B50 Agent \u8C03\u5EA6\u548C\u72B6\u6001\u7BA1\u7406\u3002

## \u6838\u5FC3\u804C\u8D23

1. **\u8DEF\u7531\u5224\u65AD** \u2014 \u6839\u636E\u7528\u6237\u8F93\u5165\u5224\u65AD\u4EFB\u52A1\u7C7B\u578B\uFF08\u76F4\u901A\u3001\u8F7B\u91CF\u3001\u4E2D\u7B49\u3001UI\u4F18\u5316\u3001\u67B6\u6784\u7EA7\u3001\u529F\u80FD\u5F00\u53D1\u3001\u9875\u9762\u5F00\u53D1\u3001\u65B0\u9879\u76EE\u5171\u521B\uFF09
2. **\u9636\u6BB5\u63A8\u8FDB** \u2014 \u7BA1\u7406 S1\u2192S2\u2192S3\u2192S4\u2192S5\u2192S6 \u9636\u6BB5\u6D41\u7A0B
3. **\u5B50 Agent \u8C03\u5EA6** \u2014 \u6839\u636E\u9636\u6BB5\u548C\u4EFB\u52A1\u7C7B\u578B\u8C03\u7528\u5BF9\u5E94\u7684\u5B50 Agent
4. **\u72B6\u6001\u7BA1\u7406** \u2014 \u7EF4\u62A4 session \u72B6\u6001\u3001\u7528\u6237\u786E\u8BA4\u72B6\u6001
5. **\u95E8\u7981\u68C0\u67E5** \u2014 \u786E\u4FDD\u9636\u6BB5\u8F6C\u6362\u7B26\u5408\u89C4\u5219

## \u5B50 Agent \u8C03\u7528\u89C4\u5219

- S1 \u9700\u6C42\u5206\u6790 \u2192 \u8C03\u7528 requirement_analyst
- S2 \u65B9\u6848\u8BBE\u8BA1 \u2192 \u8C03\u7528 ui_designer \u6216 architecture_designer\uFF08\u6839\u636E\u4EFB\u52A1\u7C7B\u578B\uFF09
- S4 \u5B9E\u73B0 \u2192 \u8C03\u7528 page_engineer
- S5 \u9A8C\u8BC1 \u2192 \u8C03\u7528 verify_agent

## \u8F93\u51FA\u89C4\u8303

\u6240\u6709\u65E5\u5FD7\u5FC5\u987B\u4EE5 [f-forge] \u5F00\u5934\uFF1A
- [f-forge] \u8FDB\u5165 controller
- [f-forge] \u6A21\u5F0F\uFF1A<\u6A21\u5F0F\u540D>
- [f-forge] \u9636\u6BB5\uFF1A<\u9636\u6BB5\u540D>
- [f-forge] \u89D2\u8272\u5207\u6362\uFF1Axxx \u2192 yyy
- [f-forge] \u672C\u8F6E\u5B8C\u6210\uFF1A<\u5185\u5BB9>

## \u94C1\u5F8B

1. \u672A\u786E\u8BA4\u7684\u76EE\u6807\u3001\u8303\u56F4\u3001\u9A8C\u6536\u3001\u7EA6\u675F\uFF0C\u4E0D\u5F97\u4F5C\u4E3A\u6267\u884C\u4F9D\u636E
2. \u5B58\u5728\u4E24\u79CD\u53CA\u4EE5\u4E0A\u5408\u7406\u89E3\u8BFB\u65F6\uFF0C\u5FC5\u987B\u6682\u505C\u786E\u8BA4
3. \u672A\u51BB\u7ED3\u5F53\u524D\u5B50\u5355\u5143\uFF0C\u4E0D\u5F97\u8FDB\u5165\u5B9E\u73B0
4. \u672A\u5B8C\u6210\u5F53\u524D\u5B50\u5355\u5143\u9A8C\u8BC1\uFF0C\u4E0D\u5F97\u8FDB\u5165\u4E0B\u4E00\u5B50\u5355\u5143
5. \u672A\u7ECF\u5B9E\u9645\u9A8C\u8BC1\uFF0C\u4E0D\u5F97\u5BA3\u79F0\u5B8C\u6210`;
  }
  getDefaultPrompt(role) {
    const names = {
      controller: "\u4E3B\u63A7",
      requirement_analyst: "\u9700\u6C42\u5206\u6790\u5E08",
      ui_designer: "UI \u8BBE\u8BA1\u5E08",
      architecture_designer: "\u67B6\u6784\u8BBE\u8BA1\u5E08",
      page_engineer: "\u9875\u9762\u5DE5\u7A0B\u5E08",
      verify_agent: "\u9A8C\u8BC1\u5DE5\u7A0B\u5E08"
    };
    return `\u4F60\u662F Flutter Forge \u7684${names[role]}\uFF0C\u8D1F\u8D23\u6267\u884C\u7279\u5B9A\u9636\u6BB5\u7684\u4EFB\u52A1\u3002`;
  }
  get(role) {
    return this.configs.get(role);
  }
  getAll() {
    return Array.from(this.configs.values());
  }
  isToolAllowed(role, toolName) {
    const config = this.configs.get(role);
    if (!config) return false;
    if (config.forbiddenTools.includes(toolName)) {
      return false;
    }
    if (config.allowedTools.includes("*")) {
      return true;
    }
    return config.allowedTools.includes(toolName);
  }
  getFilteredTools(role, allTools) {
    return allTools.filter((tool2) => this.isToolAllowed(role, tool2));
  }
};
var agentRegistry = new AgentRegistry();

// src/agents/base-agent.ts
var BaseAgent = class {
  role;
  config;
  aiClient;
  contextManager;
  toolRegistry;
  constructor(role, aiClient, contextManager2, toolRegistry2) {
    this.role = role;
    this.config = agentRegistry.get(role);
    this.aiClient = aiClient;
    this.contextManager = contextManager2;
    this.toolRegistry = toolRegistry2;
  }
  // 获取当前角色允许的工具
  getAllowedTools() {
    const allTools = this.toolRegistry.getAll();
    return allTools.filter((t) => agentRegistry.isToolAllowed(this.role, t.definition.name)).map((t) => ({
      name: t.definition.name,
      description: t.definition.description,
      parameters: t.definition.parameters.properties,
      execute: t.execute
    }));
  }
  // 执行任务
  async execute(userInput, context) {
    const tools = this.getAllowedTools();
    const systemPrompt = this.buildSystemPrompt(context);
    try {
      const result = await this.aiClient.generate(
        userInput,
        systemPrompt,
        tools,
        5
        // 最多5步
      );
      return {
        success: true,
        output: result.text
      };
    } catch (error) {
      const raw = error instanceof Error ? error.message : String(error);
      const status = error?.status || error?.statusCode;
      const url = error?.url || error?.request?.url;
      const modelName = this.aiClient.getModel();
      let detail = `\u6A21\u578B ${modelName} \u8C03\u7528\u5931\u8D25: ${raw}`;
      if (status) detail += ` (HTTP ${status})`;
      if (url) detail += `
  URL: ${url}`;
      return {
        success: false,
        output: "",
        error: detail
      };
    }
  }
  // 流式执行
  async *executeStream(userInput, context) {
    const tools = this.getAllowedTools();
    const systemPrompt = this.buildSystemPrompt(context);
    yield* this.aiClient.stream(
      userInput,
      systemPrompt,
      tools,
      5
    );
  }
  // 构建系统提示
  buildSystemPrompt(context) {
    const parts = [
      this.config.systemPrompt,
      "",
      "## \u5F53\u524D\u4E0A\u4E0B\u6587",
      `- \u9879\u76EE\u8DEF\u5F84: ${context.projectRoot}`,
      `- \u5F53\u524D\u9636\u6BB5: ${context.currentPhase}`,
      `- \u5F53\u524D\u6A21\u5F0F: ${context.currentMode}`,
      `- \u7528\u6237\u786E\u8BA4: ${context.userConfirmed ? "\u662F" : "\u5426"}`,
      `- \u8BBE\u8BA1\u786E\u8BA4: ${context.designConfirmed ? "\u662F" : "\u5426"}`
    ];
    return parts.join("\n");
  }
  // 获取角色名称
  getName() {
    return this.config.name;
  }
  // 获取角色描述
  getDescription() {
    return this.config.description;
  }
  // 检查工具是否允许
  isToolAllowed(toolName) {
    return agentRegistry.isToolAllowed(this.role, toolName);
  }
};

// src/agents/controller.ts
import chalk from "chalk";
var ControllerAgent = class extends BaseAgent {
  currentAgent = null;
  constructor(aiClient, contextManager2, toolRegistry2) {
    super("controller", aiClient, contextManager2, toolRegistry2);
  }
  // 路由判断（仅 Flutter 任务会进入此方法）
  route(userInput) {
    const input = userInput.toLowerCase().trim();
    if (this.isRequirementStart(input)) {
      return "requirement_analyst";
    }
    if (this.isUIRelated(input)) {
      return "ui_designer";
    }
    if (this.isArchitectureRelated(input)) {
      return "architecture_designer";
    }
    return "page_engineer";
  }
  // 调度子 Agent
  async dispatch(targetAgent, userInput, context) {
    if (this.currentAgent && this.currentAgent !== targetAgent) {
      console.log(chalk.blue(`
[f-forge] \u89D2\u8272\u5207\u6362\uFF1A${this.currentAgent} \u2192 ${targetAgent}`));
    }
    this.currentAgent = targetAgent;
    if (targetAgent === "controller") {
      return this.execute(userInput, context);
    }
    const config = agentRegistry.get(targetAgent);
    if (!config) {
      return {
        success: false,
        output: "",
        error: `\u672A\u77E5\u7684 Agent \u89D2\u8272: ${targetAgent}`
      };
    }
    const subAgent = new BaseAgent(targetAgent, this.aiClient, this.contextManager, this.toolRegistry);
    console.log(chalk.blue(`
[f-forge] \u8C03\u7528 ${config.name}\uFF1A${config.description}`));
    return subAgent.execute(userInput, context);
  }
  // 获取当前 Agent
  getCurrentAgent() {
    return this.currentAgent;
  }
  // 判断是否直通模式
  isDirectMode(input) {
    const keywords = [
      "\u600E\u4E48",
      "\u5982\u4F55",
      "\u4E3A\u4EC0\u4E48",
      "\u89E3\u91CA",
      "\u67E5\u770B",
      "\u67E5\u8BE2",
      "\u6587\u6863",
      "\u914D\u7F6E",
      "\u6253\u5305",
      "\u90E8\u7F72",
      "ci",
      "cd",
      "\u4F60\u597D",
      "\u8C22\u8C22",
      "\u518D\u89C1"
    ];
    return keywords.some((kw) => input.includes(kw)) && !input.includes("\u6539") && !input.includes("\u505A");
  }
  // 判断是否需求起步
  isRequirementStart(input) {
    const keywords = [
      "prd",
      "\u9700\u6C42",
      "\u8BBE\u8BA1",
      "\u89C4\u5212",
      "\u65B9\u6848",
      "\u5148\u8BBE\u8BA1",
      "\u5148\u62C6",
      "\u5148\u7406\u89E3"
    ];
    return keywords.some((kw) => input.includes(kw));
  }
  // 判断是否 UI 相关
  isUIRelated(input) {
    const keywords = [
      "ui",
      "\u6837\u5F0F",
      "\u989C\u8272",
      "\u5B57\u4F53",
      "\u95F4\u8DDD",
      "\u5E03\u5C40",
      "\u4F18\u5316",
      "\u7F8E\u5316",
      "\u8C03\u6574",
      "\u622A\u56FE",
      "\u5934\u50CF"
    ];
    return keywords.some((kw) => input.includes(kw));
  }
  // 判断是否架构相关
  isArchitectureRelated(input) {
    const keywords = [
      "\u8FC1\u79FB",
      "\u91CD\u6784",
      "\u4F9D\u8D56",
      "\u6CBB\u7406",
      "\u6027\u80FD",
      "\u4F18\u5316",
      "\u7B80\u5316",
      "\u62BD\u53D6",
      "\u590D\u7528",
      "\u6536\u655B",
      "\u67B6\u6784",
      "\u6A21\u5757\u5316"
    ];
    return keywords.some((kw) => input.includes(kw));
  }
};

// src/session/manager.ts
import { readFileSync as readFileSync3, writeFileSync as writeFileSync2, existsSync as existsSync2, mkdirSync as mkdirSync2 } from "fs";
import { join as join3, resolve as resolve2 } from "path";
import { homedir as homedir2 } from "os";
import { parse as parseYaml2, stringify as stringifyYaml2 } from "yaml";
var SESSION_DIR = join3(homedir2(), ".flutter-forge", "sessions");
var SessionManager = class {
  session = null;
  sessionPath = null;
  // 初始化 session
  init(projectRoot, userInput) {
    const id = this.generateId();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.session = {
      id,
      state: "init",
      mode: null,
      phase: "S0",
      activeAgent: "controller",
      projectRoot: resolve2(projectRoot),
      userInput,
      createdAt: now,
      updatedAt: now,
      metadata: {},
      history: []
    };
    this.sessionPath = join3(SESSION_DIR, `${id}.yaml`);
    this.save();
    return this.session;
  }
  // 加载 session
  load(sessionId) {
    const sessionPath = join3(SESSION_DIR, `${sessionId}.yaml`);
    if (!existsSync2(sessionPath)) {
      return null;
    }
    try {
      const content = readFileSync3(sessionPath, "utf-8");
      this.session = parseYaml2(content);
      this.sessionPath = sessionPath;
      return this.session;
    } catch {
      return null;
    }
  }
  // 保存 session
  save() {
    if (!this.session || !this.sessionPath) {
      return;
    }
    this.session.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const dir = this.sessionPath.replace(/[^/\\]+$/, "");
    if (!existsSync2(dir)) {
      mkdirSync2(dir, { recursive: true });
    }
    const content = stringifyYaml2(this.session);
    writeFileSync2(this.sessionPath, content, "utf-8");
  }
  // 获取当前 session
  get() {
    return this.session;
  }
  // 更新状态
  setState(state) {
    if (this.session) {
      this.session.state = state;
      this.save();
    }
  }
  // 更新模式
  setMode(mode) {
    if (this.session) {
      this.session.mode = mode;
      this.save();
    }
  }
  // 更新阶段
  setPhase(phase) {
    if (this.session) {
      this.session.phase = phase;
      this.save();
    }
  }
  // 更新活跃 Agent
  setActiveAgent(agent) {
    if (this.session) {
      this.session.activeAgent = agent;
      this.save();
    }
  }
  // 添加历史记录
  addHistory(action, agent, output) {
    if (this.session) {
      this.session.history.push({
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        action,
        agent,
        output
      });
      this.save();
    }
  }
  // 设置元数据
  setMetadata(key, value) {
    if (this.session) {
      this.session.metadata[key] = value;
      this.save();
    }
  }
  // 获取元数据
  getMetadata(key) {
    return this.session?.metadata[key];
  }
  // 等待用户输入
  waitForInput() {
    this.setState("waiting");
  }
  // 恢复执行
  resume() {
    this.setState("executing");
  }
  // 完成
  complete() {
    this.setState("completed");
  }
  // 失败
  fail() {
    this.setState("failed");
  }
  // 生成 ID
  generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ff-${timestamp}-${random}`;
  }
  // 列出所有 session
  static list() {
    if (!existsSync2(SESSION_DIR)) {
      return [];
    }
    const { readdirSync: readdirSync4 } = __require("fs");
    const files = readdirSync4(SESSION_DIR).filter((f) => f.endsWith(".yaml"));
    const sessions = [];
    for (const file of files) {
      try {
        const content = readFileSync3(join3(SESSION_DIR, file), "utf-8");
        sessions.push(parseYaml2(content));
      } catch {
      }
    }
    return sessions.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
};
var sessionManager = new SessionManager();

// src/gate/checker.ts
var GateChecker = class {
  // 检查是否允许写入实现类文件
  checkWriteAllowed(session, targetFile, activeAgent) {
    if (!session) {
      return {
        passed: false,
        gateId: "G01",
        reason: "session \u4E0D\u5B58\u5728\uFF0C\u5FC5\u987B\u5148\u521D\u59CB\u5316 session"
      };
    }
    if (!this.isImplementationPhase(session.phase) && !this.isAllowedFile(targetFile)) {
      return {
        passed: false,
        gateId: "G05",
        reason: `\u5F53\u524D\u9636\u6BB5 ${session.phase} \u672A\u8FDB\u5165 S4\uFF0C\u7981\u6B62\u5199\u5165\u5B9E\u73B0\u7C7B\u6587\u4EF6`
      };
    }
    if (session.phase === "S5" && this.isImplementationFile(targetFile)) {
      return {
        passed: false,
        gateId: "G07",
        reason: "S5 \u9A8C\u8BC1\u9636\u6BB5\u7981\u6B62\u5199\u5165\u5B9E\u73B0\u7C7B\u6587\u4EF6"
      };
    }
    if (!this.isAgentAllowedToWrite(activeAgent, targetFile)) {
      return {
        passed: false,
        gateId: "G08",
        reason: `Agent ${activeAgent} \u65E0\u6743\u5199\u5165 ${targetFile}`
      };
    }
    return { passed: true };
  }
  // 检查是否允许进入实现阶段
  checkCanEnterImplementation(session, userConfirmed, designConfirmed) {
    if (!session) {
      return {
        passed: false,
        gateId: "G01",
        reason: "session \u4E0D\u5B58\u5728"
      };
    }
    if (!userConfirmed || !designConfirmed) {
      return {
        passed: false,
        gateId: "G10",
        reason: "\u76EE\u6807/\u8303\u56F4/\u9A8C\u6536/\u7EA6\u675F\u672A\u786E\u8BA4\uFF0C\u7981\u6B62\u8FDB\u5165\u5B9E\u73B0"
      };
    }
    return { passed: true };
  }
  // 检查是否允许进入下一阶段
  checkCanAdvancePhase(session, currentPhase, nextPhase) {
    if (!session) {
      return {
        passed: false,
        gateId: "G01",
        reason: "session \u4E0D\u5B58\u5728"
      };
    }
    const validTransitions = {
      "S0": ["S1"],
      "S1": ["S2"],
      "S2": ["S3", "S4"],
      "S3": ["S4"],
      "S4": ["S5"],
      "S5": ["S6"],
      "S6": []
    };
    const allowed = validTransitions[currentPhase] || [];
    if (!allowed.includes(nextPhase)) {
      return {
        passed: false,
        gateId: "G06",
        reason: `\u4E0D\u5141\u8BB8\u4ECE ${currentPhase} \u8F6C\u6362\u5230 ${nextPhase}`
      };
    }
    return { passed: true };
  }
  // 检查是否是实现阶段
  isImplementationPhase(phase) {
    return ["S4", "S5", "S6"].includes(phase);
  }
  // 检查是否是允许的文件（非实现类）
  isAllowedFile(file) {
    const allowedPatterns = [
      /\.md$/,
      /\.yaml$/,
      /\.json$/,
      /test\//,
      /spec\//,
      /__tests__\//
    ];
    return allowedPatterns.some((pattern) => pattern.test(file));
  }
  // 检查是否是实现文件
  isImplementationFile(file) {
    const implPatterns = [
      /\.dart$/,
      /\.ts$/,
      /\.js$/
    ];
    return implPatterns.some((pattern) => pattern.test(file));
  }
  // 检查 Agent 是否允许写入
  isAgentAllowedToWrite(agent, file) {
    const readOnlyAgents = ["requirement_analyst", "ui_designer", "architecture_designer"];
    if (readOnlyAgents.includes(agent)) {
      return this.isAllowedFile(file);
    }
    if (agent === "page_engineer") {
      return true;
    }
    if (agent === "verify_agent") {
      return file.includes("test") || file.includes("spec") || this.isAllowedFile(file);
    }
    return true;
  }
};
var gateChecker = new GateChecker();

// src/output/logger.ts
import chalk2 from "chalk";
var ForgeLogger = class {
  prefix = "[f-forge]";
  // 进入日志
  enterController() {
    console.log(chalk2.blue(`${this.prefix} \u8FDB\u5165 controller`));
  }
  // 模式日志
  logMode(mode) {
    console.log(chalk2.blue(`${this.prefix} \u6A21\u5F0F\uFF1A${mode}`));
  }
  // 阶段日志
  logPhase(phase) {
    console.log(chalk2.blue(`${this.prefix} \u9636\u6BB5\uFF1A${phase}`));
  }
  // 角色切换日志
  logRoleSwitch(from, to) {
    console.log(chalk2.blue(`${this.prefix} \u89D2\u8272\u5207\u6362\uFF1A${from} \u2192 ${to}`));
  }
  // 角色结果日志
  logAgentResult(agent, result) {
    console.log(chalk2.blue(`${this.prefix} ${agent}\uFF1A${result}`));
  }
  // 完成日志
  logComplete(content) {
    console.log(chalk2.green(`${this.prefix} \u672C\u8F6E\u5B8C\u6210\uFF1A${content}`));
  }
  // 升级日志
  logUpgrade(fromMode, toMode, reason) {
    console.log(chalk2.yellow(`${this.prefix} \u5347\u7EA7\uFF1A${fromMode} \u2192 ${toMode}\uFF0C\u539F\u56E0\uFF1A${reason}`));
  }
  // 跳过 S3 日志
  logSkipS3() {
    console.log(chalk2.blue(`${this.prefix} \u4E3B\u63A7\uFF1A\u9996\u6279\u8303\u56F4\u8DB3\u591F\u5C0F\uFF0C\u8DF3\u8FC7 S3 \u62C6\u5206\u4EFB\u52A1\u51BB\u7ED3\uFF0C\u76F4\u63A5\u8FDB\u5165 S4 \u5B9E\u73B0\u3002`));
  }
  // 等待日志
  logWaiting(reason) {
    console.log(chalk2.yellow(`${this.prefix} \u7B49\u5F85\uFF1A${reason}`));
  }
  // 错误日志
  logError(error) {
    console.error(chalk2.red(`${this.prefix} \u9519\u8BEF\uFF1A${error}`));
  }
  // 警告日志
  logWarning(warning) {
    console.warn(chalk2.yellow(`${this.prefix} \u8B66\u544A\uFF1A${warning}`));
  }
  // 信息日志
  logInfo(message) {
    console.log(chalk2.dim(`${this.prefix} ${message}`));
  }
  // 验证日志
  logVerification(result) {
    console.log(chalk2.blue(`${this.prefix} \u9A8C\u8BC1\uFF1A${result}`));
  }
  // 门禁日志
  logGate(gateId, passed, reason) {
    if (passed) {
      console.log(chalk2.green(`${this.prefix} \u95E8\u7981 ${gateId}\uFF1A\u901A\u8FC7`));
    } else {
      console.log(chalk2.red(`${this.prefix} \u95E8\u7981 ${gateId}\uFF1A\u963B\u65AD - ${reason}`));
    }
  }
  // 格式化输出（带前缀）
  formatOutput(output) {
    if (output.includes(this.prefix)) {
      return output;
    }
    return `${this.prefix} ${output}`;
  }
  // 检查输出是否符合规范
  validateOutput(output) {
    const requiredLogs = [
      this.prefix
    ];
    return requiredLogs.every((log) => output.includes(log));
  }
};
var forgeLogger = new ForgeLogger();

// src/modes/fast.ts
var FastMode = class {
  config;
  constructor() {
    this.config = {
      enabled: false,
      autoScan: true,
      upgradeOnRisk: true
    };
  }
  // 启用快速模式
  enable() {
    this.config.enabled = true;
  }
  // 禁用快速模式
  disable() {
    this.config.enabled = false;
  }
  // 检查是否启用
  isEnabled() {
    return this.config.enabled;
  }
  // 获取配置
  getConfig() {
    return { ...this.config };
  }
  // 判断是否应该升级
  shouldUpgrade(userInput, scanResult) {
    if (!this.config.upgradeOnRisk) {
      return false;
    }
    const riskSignals = [
      "\u9700\u6C42\u7F3A\u53E3",
      "UI \u7ED3\u6784\u51B3\u7B56",
      "\u67B6\u6784\u8FB9\u754C\u98CE\u9669",
      "\u94FE\u8DEF\u6536\u655B\u98CE\u9669"
    ];
    const combined = `${userInput} ${scanResult || ""}`;
    return riskSignals.some((signal) => combined.includes(signal));
  }
  // 获取推荐模式
  getRecommendedMode(userInput) {
    const input = userInput.toLowerCase();
    if (this.isLightweight(input)) {
      return "lightweight";
    }
    if (this.isMedium(input)) {
      return "medium";
    }
    return "medium";
  }
  // 判断是否轻量任务
  isLightweight(input) {
    const keywords = [
      "\u6309\u94AE",
      "\u989C\u8272",
      "\u5B57\u4F53",
      "\u5927\u5C0F",
      "\u6587\u6848",
      "\u4FEE\u6539",
      "\u8C03\u6574",
      "\u6539\u4E00\u4E0B"
    ];
    return keywords.some((kw) => input.includes(kw));
  }
  // 判断是否中等任务
  isMedium(input) {
    const keywords = [
      "\u9875\u9762",
      "\u5217\u8868",
      "\u8BE6\u60C5",
      "\u8868\u5355",
      "\u65B0\u589E",
      "\u6DFB\u52A0",
      "\u521B\u5EFA"
    ];
    return keywords.some((kw) => input.includes(kw));
  }
};
var fastMode = new FastMode();

// src/modes/autonomous.ts
var AutonomousMode = class {
  config;
  constructor() {
    this.config = {
      enabled: false,
      autoAssume: true,
      highRiskInterrupt: true
    };
  }
  // 启用全自动模式
  enable() {
    this.config.enabled = true;
  }
  // 禁用全自动模式
  disable() {
    this.config.enabled = false;
  }
  // 检查是否启用
  isEnabled() {
    return this.config.enabled;
  }
  // 获取配置
  getConfig() {
    return { ...this.config };
  }
  // 判断是否需要中断
  shouldInterrupt(userInput, context) {
    if (!this.config.highRiskInterrupt) {
      return false;
    }
    const highRiskSignals = [
      "\u5B89\u5168",
      "\u4E0D\u53EF\u9006",
      "\u751F\u4EA7\u73AF\u5883",
      "\u5168\u9879\u76EE\u7EA7\u67B6\u6784\u5207\u6362",
      "\u5220\u9664",
      "\u8FC1\u79FB"
    ];
    const combined = `${userInput} ${context}`;
    return highRiskSignals.some((signal) => combined.includes(signal));
  }
  // 获取自动假设
  getAutoAssumption(context) {
    if (!this.config.autoAssume) {
      return null;
    }
    if (context.includes("\u7F3A\u5C11")) {
      return "\u81EA\u52A8\u91C7\u7528\u63A8\u8350\u65B9\u6848";
    }
    return null;
  }
  // 判断是否可以自动推进
  canAutoProceed(userInput) {
    if (this.shouldInterrupt(userInput, "")) {
      return false;
    }
    return true;
  }
};
var autonomousMode = new AutonomousMode();

// src/hooks/manager.ts
import { readFileSync as readFileSync4, writeFileSync as writeFileSync3, existsSync as existsSync3, mkdirSync as mkdirSync3, readdirSync } from "fs";
import { join as join4 } from "path";
import { homedir as homedir3 } from "os";
import { parse as parseYaml3, stringify as stringifyYaml3 } from "yaml";
var HOOKS_DIR = join4(homedir3(), ".flutter-forge", "hooks");
var PROJECT_HOOKS_DIR = ".flutter-forge/hooks";
var HookManager = class {
  hooks = /* @__PURE__ */ new Map();
  builtinHooks = [];
  constructor() {
    this.initBuiltinHooks();
    this.loadUserHooks();
    this.loadProjectHooks();
  }
  // 初始化内置钩子
  initBuiltinHooks() {
    this.register({
      name: "dangerous-commands",
      description: "\u68C0\u6D4B\u5371\u9669\u547D\u4EE4\u5E76\u8B66\u544A",
      event: "PreToolUse",
      matcher: "runCommand|runCommandWithOutput",
      enabled: true,
      handler: async (ctx) => this.checkDangerousCommands(ctx)
    });
    this.register({
      name: "sensitive-files",
      description: "\u68C0\u6D4B\u654F\u611F\u6587\u4EF6\u64CD\u4F5C",
      event: "PreToolUse",
      matcher: "writeFile|editFile",
      enabled: true,
      handler: async (ctx) => this.checkSensitiveFiles(ctx)
    });
    this.register({
      name: "session-start-log",
      description: "\u4F1A\u8BDD\u5F00\u59CB\u65E5\u5FD7",
      event: "SessionStart",
      enabled: true,
      handler: async (ctx) => this.logSessionStart(ctx)
    });
  }
  // 加载用户钩子
  loadUserHooks() {
    if (!existsSync3(HOOKS_DIR)) {
      mkdirSync3(HOOKS_DIR, { recursive: true });
      return;
    }
    const files = readdirSync(HOOKS_DIR).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));
    for (const file of files) {
      try {
        const content = readFileSync4(join4(HOOKS_DIR, file), "utf-8");
        const config = parseYaml3(content);
        if (config.enabled) {
          this.registerFromConfig(config);
        }
      } catch {
      }
    }
  }
  // 加载项目钩子
  loadProjectHooks() {
    if (!existsSync3(PROJECT_HOOKS_DIR)) {
      return;
    }
    const files = readdirSync(PROJECT_HOOKS_DIR).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));
    for (const file of files) {
      try {
        const content = readFileSync4(join4(PROJECT_HOOKS_DIR, file), "utf-8");
        const config = parseYaml3(content);
        if (config.enabled) {
          this.registerFromConfig(config);
        }
      } catch {
      }
    }
  }
  // 从配置注册钩子
  registerFromConfig(config) {
    const handler = this.createHandlerFromConfig(config);
    this.register({
      name: config.name,
      description: config.description,
      event: config.event,
      matcher: config.matcher,
      enabled: config.enabled,
      handler
    });
  }
  // 根据配置创建处理器
  createHandlerFromConfig(config) {
    return async (ctx) => {
      return { action: "allow" };
    };
  }
  // 注册钩子
  register(hook) {
    this.hooks.set(hook.name, hook);
  }
  // 注销钩子
  unregister(name) {
    this.hooks.delete(name);
  }
  // 启用钩子
  enable(name) {
    const hook = this.hooks.get(name);
    if (hook) {
      hook.enabled = true;
      return true;
    }
    return false;
  }
  // 禁用钩子
  disable(name) {
    const hook = this.hooks.get(name);
    if (hook) {
      hook.enabled = false;
      return true;
    }
    return false;
  }
  // 执行钩子
  async execute(event, context) {
    const matchingHooks = Array.from(this.hooks.values()).filter((hook) => {
      if (!hook.enabled) return false;
      if (hook.event !== event) return false;
      if (hook.matcher && context.toolName) {
        const regex = new RegExp(hook.matcher);
        return regex.test(context.toolName);
      }
      return true;
    });
    for (const hook of matchingHooks) {
      try {
        const result = await hook.handler(context);
        if (result.action === "block") {
          return result;
        }
      } catch (error) {
        console.error(`[f-forge] \u94A9\u5B50\u6267\u884C\u5931\u8D25: ${hook.name}`, error);
      }
    }
    return { action: "allow" };
  }
  // 获取所有钩子
  getHooks() {
    return Array.from(this.hooks.values());
  }
  // 获取指定事件的钩子
  getHooksByEvent(event) {
    return Array.from(this.hooks.values()).filter((h) => h.event === event);
  }
  // 检查危险命令
  async checkDangerousCommands(ctx) {
    const command = ctx.toolArgs?.command;
    if (!command) return { action: "allow" };
    const dangerousPatterns = [
      { pattern: /rm\s+-rf/, message: "\u5371\u9669\u7684\u9012\u5F52\u5220\u9664\u64CD\u4F5C" },
      { pattern: /dd\s+if=/, message: "dd \u547D\u4EE4\u53EF\u80FD\u8986\u76D6\u78C1\u76D8" },
      { pattern: /mkfs/, message: "\u683C\u5F0F\u5316\u6587\u4EF6\u7CFB\u7EDF\u547D\u4EE4" },
      { pattern: /chmod\s+777/, message: "\u8FC7\u4E8E\u5BBD\u677E\u7684\u6743\u9650\u8BBE\u7F6E" },
      { pattern: />\s*\/dev\/sd[a-z]/, message: "\u76F4\u63A5\u5199\u5165\u78C1\u76D8\u8BBE\u5907" },
      { pattern: /eval\s*\(/, message: "eval \u6267\u884C\u98CE\u9669" },
      { pattern: /exec\s*\(/, message: "exec \u6267\u884C\u98CE\u9669" }
    ];
    for (const { pattern, message } of dangerousPatterns) {
      if (pattern.test(command)) {
        return {
          action: "warn",
          message: `\u26A0\uFE0F \u68C0\u6D4B\u5230${message}\uFF1A${command}`
        };
      }
    }
    return { action: "allow" };
  }
  // 检查敏感文件
  async checkSensitiveFiles(ctx) {
    const filePath = ctx.toolArgs?.file_path;
    if (!filePath) return { action: "allow" };
    const sensitivePatterns = [
      /\.env$/,
      /\.env\.local$/,
      /credentials/i,
      /secrets/i,
      /\.pem$/,
      /\.key$/,
      /id_rsa/,
      /id_ed25519/
    ];
    for (const pattern of sensitivePatterns) {
      if (pattern.test(filePath)) {
        return {
          action: "warn",
          message: `\u{1F510} \u68C0\u6D4B\u5230\u654F\u611F\u6587\u4EF6\u64CD\u4F5C\uFF1A${filePath}`
        };
      }
    }
    return { action: "allow" };
  }
  // 会话开始日志
  async logSessionStart(ctx) {
    return {
      action: "allow",
      message: "[f-forge] \u4F1A\u8BDD\u5DF2\u5F00\u59CB"
    };
  }
  // 保存钩子配置
  saveHook(config) {
    const dir = config.type === "user" ? HOOKS_DIR : PROJECT_HOOKS_DIR;
    if (!existsSync3(dir)) {
      mkdirSync3(dir, { recursive: true });
    }
    const filePath = join4(dir, `${config.name}.yaml`);
    const content = stringifyYaml3(config);
    writeFileSync3(filePath, content, "utf-8");
  }
  // 列出所有钩子配置
  listConfigs() {
    return Array.from(this.hooks.values()).map((hook) => ({
      name: hook.name,
      description: hook.description,
      event: hook.event,
      matcher: hook.matcher,
      enabled: hook.enabled,
      type: "builtin",
      source: "builtin"
    }));
  }
};
var hookManager = new HookManager();

// src/plugins/loader.ts
import { readFileSync as readFileSync5, existsSync as existsSync4, readdirSync as readdirSync2, statSync } from "fs";
import { join as join5 } from "path";
import { homedir as homedir4 } from "os";
import { parse as parseYaml4 } from "yaml";
var PLUGINS_DIR = join5(homedir4(), ".flutter-forge", "plugins");
var PROJECT_PLUGINS_DIR = ".flutter-forge/plugins";
var PluginLoader = class {
  loadedPlugins = /* @__PURE__ */ new Map();
  // 加载所有插件
  async loadAll() {
    const plugins = [];
    const userPlugins = await this.loadFromDirectory(PLUGINS_DIR);
    plugins.push(...userPlugins);
    const projectPlugins = await this.loadFromDirectory(PROJECT_PLUGINS_DIR);
    plugins.push(...projectPlugins);
    return plugins;
  }
  // 从目录加载插件
  async loadFromDirectory(dir) {
    if (!existsSync4(dir)) {
      return [];
    }
    const plugins = [];
    const entries = readdirSync2(dir);
    for (const entry of entries) {
      const pluginDir = join5(dir, entry);
      const stat = statSync(pluginDir);
      if (!stat.isDirectory()) continue;
      try {
        const plugin = await this.loadPlugin(pluginDir);
        if (plugin) {
          plugins.push(plugin);
          this.loadedPlugins.set(plugin.id, plugin);
        }
      } catch (error) {
        console.error(`[f-forge] \u52A0\u8F7D\u63D2\u4EF6\u5931\u8D25: ${entry}`, error);
      }
    }
    return plugins;
  }
  // 加载单个插件
  async loadPlugin(pluginDir) {
    const configPaths = [
      join5(pluginDir, ".plugin.json"),
      join5(pluginDir, "plugin.json"),
      join5(pluginDir, ".claude-plugin", "plugin.json")
    ];
    let configPath = null;
    for (const path of configPaths) {
      if (existsSync4(path)) {
        configPath = path;
        break;
      }
    }
    if (!configPath) {
      return null;
    }
    try {
      const content = readFileSync5(configPath, "utf-8");
      const metadata = JSON.parse(content);
      const config = await this.buildPluginConfig(pluginDir, metadata);
      return {
        id: metadata.name,
        path: pluginDir,
        config,
        enabled: true,
        loadedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error(`[f-forge] \u89E3\u6790\u63D2\u4EF6\u914D\u7F6E\u5931\u8D25: ${configPath}`, error);
      return null;
    }
  }
  // 构建插件配置
  async buildPluginConfig(pluginDir, metadata) {
    const config = { metadata };
    const commandsDir = join5(pluginDir, "commands");
    if (existsSync4(commandsDir)) {
      config.commands = this.loadCommands(commandsDir);
    }
    const agentsDir = join5(pluginDir, "agents");
    if (existsSync4(agentsDir)) {
      config.agents = this.loadAgents(agentsDir);
    }
    const skillsDir = join5(pluginDir, "skills");
    if (existsSync4(skillsDir)) {
      config.skills = this.loadSkills(skillsDir);
    }
    const hooksDir = join5(pluginDir, "hooks");
    if (existsSync4(hooksDir)) {
      config.hooks = this.loadHooks(hooksDir);
    }
    const mcpConfigPath = join5(pluginDir, ".mcp.json");
    if (existsSync4(mcpConfigPath)) {
      config.mcpServers = this.loadMCPConfig(mcpConfigPath);
    }
    return config;
  }
  // 加载命令
  loadCommands(dir) {
    const commands = [];
    const files = readdirSync2(dir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      try {
        const content = readFileSync5(join5(dir, file), "utf-8");
        const name = file.replace(".md", "");
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (frontmatterMatch) {
          const frontmatter = parseYaml4(frontmatterMatch[1]);
          commands.push({
            name: frontmatter.name || name,
            description: frontmatter.description || "",
            usage: frontmatter.usage,
            handler: join5(dir, file)
          });
        }
      } catch {
      }
    }
    return commands;
  }
  // 加载 Agent
  loadAgents(dir) {
    const agents = [];
    const files = readdirSync2(dir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      try {
        const content = readFileSync5(join5(dir, file), "utf-8");
        const name = file.replace(".md", "");
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (frontmatterMatch) {
          const frontmatter = parseYaml4(frontmatterMatch[1]);
          agents.push({
            name: frontmatter.name || name,
            description: frontmatter.description || "",
            systemPrompt: frontmatterMatch[2].trim(),
            allowedTools: frontmatter.allowedTools,
            forbiddenTools: frontmatter.forbiddenTools
          });
        }
      } catch {
      }
    }
    return agents;
  }
  // 加载技能
  loadSkills(dir) {
    const skills = [];
    const entries = readdirSync2(dir);
    for (const entry of entries) {
      const skillDir = join5(dir, entry);
      const stat = statSync(skillDir);
      if (stat.isDirectory()) {
        const skillFile = join5(skillDir, "SKILL.md");
        if (existsSync4(skillFile)) {
          try {
            const content = readFileSync5(skillFile, "utf-8");
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
            if (frontmatterMatch) {
              const frontmatter = parseYaml4(frontmatterMatch[1]);
              skills.push({
                name: frontmatter.name || entry,
                description: frontmatter.description || "",
                autoInvoke: frontmatter.autoInvoke,
                triggers: frontmatter.triggers,
                content: frontmatterMatch[2].trim()
              });
            }
          } catch {
          }
        }
      }
    }
    return skills;
  }
  // 加载钩子
  loadHooks(dir) {
    const hooks = [];
    const hooksJsonPath = join5(dir, "hooks.json");
    if (existsSync4(hooksJsonPath)) {
      try {
        const content = readFileSync5(hooksJsonPath, "utf-8");
        const hooksConfig = JSON.parse(content);
        if (hooksConfig.hooks) {
          for (const [event, handlers] of Object.entries(hooksConfig.hooks)) {
            const handlersArray = handlers;
            for (const handler of handlersArray) {
              for (const hook of handler.hooks) {
                hooks.push({
                  event,
                  matcher: handler.matcher,
                  handler: hook.command
                });
              }
            }
          }
        }
      } catch {
      }
    }
    return hooks;
  }
  // 加载 MCP 配置
  loadMCPConfig(path) {
    try {
      const content = readFileSync5(path, "utf-8");
      return JSON.parse(content);
    } catch {
      return {};
    }
  }
  // 获取已加载的插件
  getLoadedPlugins() {
    return Array.from(this.loadedPlugins.values());
  }
  // 获取插件
  getPlugin(id) {
    return this.loadedPlugins.get(id);
  }
  // 重新加载插件
  async reload(pluginId) {
    const existing = this.loadedPlugins.get(pluginId);
    if (!existing) return null;
    const plugin = await this.loadPlugin(existing.path);
    if (plugin) {
      this.loadedPlugins.set(pluginId, plugin);
    }
    return plugin;
  }
};
var pluginLoader = new PluginLoader();

// src/plugins/manager.ts
var PluginManager = class {
  state = {
    plugins: [],
    activeCommands: /* @__PURE__ */ new Map(),
    activeAgents: /* @__PURE__ */ new Map(),
    activeSkills: /* @__PURE__ */ new Map()
  };
  initialized = false;
  // 初始化插件管理器
  async init() {
    if (this.initialized) return;
    const plugins = await pluginLoader.loadAll();
    this.state.plugins = plugins;
    for (const plugin of plugins) {
      if (plugin.enabled) {
        this.indexPluginResources(plugin);
      }
    }
    this.initialized = true;
  }
  // 索引插件资源
  indexPluginResources(plugin) {
    const { config } = plugin;
    if (config.commands) {
      for (const cmd of config.commands) {
        this.state.activeCommands.set(`/${cmd.name}`, cmd);
      }
    }
    if (config.agents) {
      for (const agent of config.agents) {
        this.state.activeAgents.set(agent.name, agent);
      }
    }
    if (config.skills) {
      for (const skill of config.skills) {
        this.state.activeSkills.set(skill.name, skill);
      }
    }
  }
  // 获取所有插件
  getPlugins() {
    return this.state.plugins;
  }
  // 获取活跃插件
  getActivePlugins() {
    return this.state.plugins.filter((p) => p.enabled);
  }
  // 启用插件
  enable(pluginId) {
    const plugin = this.state.plugins.find((p) => p.id === pluginId);
    if (plugin) {
      plugin.enabled = true;
      this.indexPluginResources(plugin);
      return true;
    }
    return false;
  }
  // 禁用插件
  disable(pluginId) {
    const plugin = this.state.plugins.find((p) => p.id === pluginId);
    if (plugin) {
      plugin.enabled = false;
      this.removePluginResources(plugin);
      return true;
    }
    return false;
  }
  // 移除插件资源
  removePluginResources(plugin) {
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
  getCommand(name) {
    return this.state.activeCommands.get(name);
  }
  // 获取所有命令
  getCommands() {
    return Array.from(this.state.activeCommands.values());
  }
  // 获取 Agent
  getAgent(name) {
    return this.state.activeAgents.get(name);
  }
  // 获取所有 Agent
  getAgents() {
    return Array.from(this.state.activeAgents.values());
  }
  // 获取技能
  getSkill(name) {
    return this.state.activeSkills.get(name);
  }
  // 获取所有技能
  getSkills() {
    return Array.from(this.state.activeSkills.values());
  }
  // 获取自动触发的技能
  getAutoInvokeSkills() {
    return Array.from(this.state.activeSkills.values()).filter((s) => s.autoInvoke);
  }
  // 匹配技能
  matchSkills(input) {
    const matched = [];
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
  async reload(pluginId) {
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
  getState() {
    return { ...this.state };
  }
  // 获取摘要
  getSummary() {
    const active = this.getActivePlugins();
    return `\u5DF2\u52A0\u8F7D ${this.state.plugins.length} \u4E2A\u63D2\u4EF6\uFF0C${active.length} \u4E2A\u6D3B\u8DC3`;
  }
};
var pluginManager = new PluginManager();

// src/mcp/client.ts
import { spawn } from "child_process";
import { EventEmitter } from "events";
var MCPClient = class extends EventEmitter {
  servers = /* @__PURE__ */ new Map();
  requestId = 0;
  pendingRequests = /* @__PURE__ */ new Map();
  // 连接到 MCP 服务器
  async connect(serverId, config) {
    if (this.servers.has(serverId)) {
      return true;
    }
    try {
      const childProcess = spawn(config.command, config.args || [], {
        env: { ...process.env, ...config.env },
        cwd: config.cwd,
        stdio: ["pipe", "pipe", "pipe"]
      });
      const server = {
        id: serverId,
        config,
        tools: [],
        resources: [],
        connected: false,
        process: childProcess
      };
      this.setupMessageHandling(server, childProcess);
      await this.waitForReady(server);
      server.tools = await this.listTools(server);
      server.resources = await this.listResources(server);
      server.connected = true;
      this.servers.set(serverId, server);
      return true;
    } catch (error) {
      console.error(`[f-forge] MCP \u670D\u52A1\u5668\u8FDE\u63A5\u5931\u8D25: ${serverId}`, error);
      return false;
    }
  }
  // 设置消息处理
  setupMessageHandling(server, process2) {
    let buffer = "";
    process2.stdout?.on("data", (data) => {
      buffer += data.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.trim()) {
          try {
            const message = JSON.parse(line);
            this.handleMessage(message);
          } catch {
          }
        }
      }
    });
    process2.stderr?.on("data", (data) => {
      console.error(`[f-forge] MCP ${server.id}: ${data.toString()}`);
    });
    process2.on("exit", (code) => {
      server.connected = false;
      this.servers.delete(server.id);
      this.emit("serverDisconnected", server.id, code);
    });
  }
  // 处理消息
  handleMessage(message) {
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
  async waitForReady(server) {
    return new Promise((resolve8, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("MCP \u670D\u52A1\u5668\u8FDE\u63A5\u8D85\u65F6"));
      }, 1e4);
      this.sendRequest(server, "initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "flutter-forge",
          version: "0.4.0"
        }
      }).then(() => {
        clearTimeout(timeout);
        resolve8();
      }).catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }
  // 发送请求
  async sendRequest(server, method, params) {
    return new Promise((resolve8, reject) => {
      const id = ++this.requestId;
      const request = {
        jsonrpc: "2.0",
        id,
        method,
        params
      };
      this.pendingRequests.set(id, { resolve: resolve8, reject });
      const process2 = server.process;
      process2.stdin?.write(JSON.stringify(request) + "\n");
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error("\u8BF7\u6C42\u8D85\u65F6"));
        }
      }, 3e4);
    });
  }
  // 列出工具
  async listTools(server) {
    try {
      const result = await this.sendRequest(server, "tools/list");
      return result.tools || [];
    } catch {
      return [];
    }
  }
  // 列出资源
  async listResources(server) {
    try {
      const result = await this.sendRequest(server, "resources/list");
      return result.resources || [];
    } catch {
      return [];
    }
  }
  // 调用工具
  async callTool(call) {
    const server = this.servers.get(call.server);
    if (!server || !server.connected) {
      throw new Error(`MCP \u670D\u52A1\u5668\u672A\u8FDE\u63A5: ${call.server}`);
    }
    try {
      const result = await this.sendRequest(server, "tools/call", {
        name: call.tool,
        arguments: call.arguments
      });
      return result;
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `\u5DE5\u5177\u8C03\u7528\u5931\u8D25: ${error}`
        }],
        isError: true
      };
    }
  }
  // 获取所有可用工具
  getAllTools() {
    const tools = [];
    for (const server of this.servers.values()) {
      if (server.connected) {
        for (const tool2 of server.tools) {
          tools.push({ ...tool2, server: server.id });
        }
      }
    }
    return tools;
  }
  // 获取所有可用资源
  getAllResources() {
    const resources = [];
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
  getServer(serverId) {
    return this.servers.get(serverId);
  }
  // 获取所有服务器
  getServers() {
    return Array.from(this.servers.values());
  }
  // 断开连接
  async disconnect(serverId) {
    const server = this.servers.get(serverId);
    if (server) {
      const process2 = server.process;
      process2.kill();
      server.connected = false;
      this.servers.delete(serverId);
    }
  }
  // 断开所有连接
  async disconnectAll() {
    for (const server of this.servers.values()) {
      const process2 = server.process;
      process2.kill();
      server.connected = false;
    }
    this.servers.clear();
  }
  // 检查服务器是否已连接
  isConnected(serverId) {
    const server = this.servers.get(serverId);
    return server?.connected || false;
  }
  // 获取连接状态
  getStatus() {
    const status = {};
    for (const [id, server] of this.servers) {
      status[id] = server.connected;
    }
    return status;
  }
};
var mcpClient = new MCPClient();

// src/agents/pool.ts
var AgentPool = class {
  maxConcurrent;
  running = /* @__PURE__ */ new Map();
  queue = [];
  agents = /* @__PURE__ */ new Map();
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
  }
  // 注册 Agent
  registerAgent(role, agent) {
    this.agents.set(role, agent);
  }
  // 并行执行多个任务
  async parallel(tasks) {
    const results = [];
    const executing = [];
    for (const task of tasks) {
      if (this.running.size >= this.maxConcurrent) {
        await Promise.race(this.running.values());
      }
      const promise = this.executeTask(task).then((result) => {
        this.running.delete(task.id);
        return result;
      });
      this.running.set(task.id, promise);
      executing.push(promise);
    }
    const completedResults = await Promise.all(executing);
    results.push(...completedResults);
    return results;
  }
  // 执行单个任务
  async executeTask(task) {
    const startTime = Date.now();
    const agent = this.agents.get(task.role);
    if (!agent) {
      return {
        taskId: task.id,
        role: task.role,
        result: {
          success: false,
          output: "",
          error: `\u672A\u627E\u5230 Agent: ${task.role}`
        },
        duration: Date.now() - startTime
      };
    }
    try {
      const result = await agent.execute(task.input, task.context);
      return {
        taskId: task.id,
        role: task.role,
        result,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        taskId: task.id,
        role: task.role,
        result: {
          success: false,
          output: "",
          error: `\u6267\u884C\u5931\u8D25: ${error}`
        },
        duration: Date.now() - startTime
      };
    }
  }
  // 添加任务到队列
  enqueue(task) {
    this.queue.push(task);
    this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  // 处理队列中的任务
  async processQueue() {
    const results = [];
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.maxConcurrent);
      const batchResults = await this.parallel(batch);
      results.push(...batchResults);
    }
    return results;
  }
  // 获取运行中的任务数
  getRunningCount() {
    return this.running.size;
  }
  // 获取队列中的任务数
  getQueueLength() {
    return this.queue.length;
  }
  // 清空队列
  clearQueue() {
    this.queue = [];
  }
  // 等待所有任务完成
  async waitAll() {
    await Promise.all(this.running.values());
  }
  // 取消所有任务
  cancelAll() {
    this.queue = [];
  }
};
var agentPool = new AgentPool();

// src/security/checker.ts
var SecurityChecker = class {
  patterns = [];
  config;
  constructor(config) {
    this.config = {
      enabled: true,
      severityThreshold: "medium",
      categories: [
        "command_injection",
        "path_traversal",
        "xss",
        "sql_injection",
        "code_injection",
        "file_operation",
        "credential_exposure",
        "dangerous_config",
        "unsafe_deserialization"
      ],
      customPatterns: [],
      ...config
    };
    this.initBuiltinPatterns();
  }
  // 初始化内置安全模式
  initBuiltinPatterns() {
    this.patterns.push({
      id: "cmd-injection-1",
      name: "\u547D\u4EE4\u6CE8\u5165 - rm -rf",
      description: "\u68C0\u6D4B\u5371\u9669\u7684\u9012\u5F52\u5220\u9664\u547D\u4EE4",
      pattern: /rm\s+(-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r)\s/,
      severity: "critical",
      category: "command_injection",
      message: "\u68C0\u6D4B\u5230\u5371\u9669\u7684\u9012\u5F52\u5220\u9664\u547D\u4EE4",
      suggestion: "\u8BF7\u786E\u8BA4\u8DEF\u5F84\u662F\u5426\u6B63\u786E\uFF0C\u907F\u514D\u5220\u9664\u91CD\u8981\u6587\u4EF6"
    });
    this.patterns.push({
      id: "cmd-injection-2",
      name: "\u547D\u4EE4\u6CE8\u5165 - dd",
      description: "\u68C0\u6D4B dd \u547D\u4EE4\u53EF\u80FD\u8986\u76D6\u78C1\u76D8",
      pattern: /dd\s+if=/,
      severity: "critical",
      category: "command_injection",
      message: "dd \u547D\u4EE4\u53EF\u80FD\u8986\u76D6\u78C1\u76D8\u6570\u636E",
      suggestion: "\u8BF7\u786E\u8BA4\u8F93\u5165\u8F93\u51FA\u8DEF\u5F84\u662F\u5426\u6B63\u786E"
    });
    this.patterns.push({
      id: "cmd-injection-3",
      name: "\u547D\u4EE4\u6CE8\u5165 - mkfs",
      description: "\u68C0\u6D4B\u6587\u4EF6\u7CFB\u7EDF\u683C\u5F0F\u5316\u547D\u4EE4",
      pattern: /mkfs\./,
      severity: "critical",
      category: "command_injection",
      message: "\u68C0\u6D4B\u5230\u6587\u4EF6\u7CFB\u7EDF\u683C\u5F0F\u5316\u547D\u4EE4",
      suggestion: "\u683C\u5F0F\u5316\u4F1A\u6C38\u4E45\u5220\u9664\u6570\u636E\uFF0C\u8BF7\u786E\u8BA4\u8BBE\u5907\u8DEF\u5F84"
    });
    this.patterns.push({
      id: "cmd-injection-4",
      name: "\u547D\u4EE4\u6CE8\u5165 - chmod 777",
      description: "\u68C0\u6D4B\u8FC7\u4E8E\u5BBD\u677E\u7684\u6743\u9650\u8BBE\u7F6E",
      pattern: /chmod\s+777/,
      severity: "high",
      category: "command_injection",
      message: "\u8BBE\u7F6E\u8FC7\u4E8E\u5BBD\u677E\u7684\u6587\u4EF6\u6743\u9650",
      suggestion: "\u5EFA\u8BAE\u4F7F\u7528\u66F4\u4E25\u683C\u7684\u6743\u9650\uFF0C\u5982 755 \u6216 644"
    });
    this.patterns.push({
      id: "cmd-injection-5",
      name: "\u547D\u4EE4\u6CE8\u5165 - eval",
      description: "\u68C0\u6D4B eval \u6267\u884C",
      pattern: /eval\s*\(/,
      severity: "high",
      category: "code_injection",
      message: "eval \u6267\u884C\u5B58\u5728\u5B89\u5168\u98CE\u9669",
      suggestion: "\u907F\u514D\u4F7F\u7528 eval\uFF0C\u8003\u8651\u4F7F\u7528\u66F4\u5B89\u5168\u7684\u66FF\u4EE3\u65B9\u6848"
    });
    this.patterns.push({
      id: "cmd-injection-6",
      name: "\u547D\u4EE4\u6CE8\u5165 - exec",
      description: "\u68C0\u6D4B exec \u6267\u884C",
      pattern: /exec\s*\(/,
      severity: "high",
      category: "code_injection",
      message: "exec \u6267\u884C\u5B58\u5728\u5B89\u5168\u98CE\u9669",
      suggestion: "\u786E\u4FDD\u8F93\u5165\u7ECF\u8FC7\u4E25\u683C\u9A8C\u8BC1"
    });
    this.patterns.push({
      id: "path-traversal-1",
      name: "\u8DEF\u5F84\u904D\u5386",
      description: "\u68C0\u6D4B\u8DEF\u5F84\u904D\u5386\u653B\u51FB",
      pattern: /\.\.\//,
      severity: "high",
      category: "path_traversal",
      message: "\u68C0\u6D4B\u5230\u8DEF\u5F84\u904D\u5386\u5C1D\u8BD5",
      suggestion: "\u4F7F\u7528\u7EDD\u5BF9\u8DEF\u5F84\u6216\u9A8C\u8BC1\u8DEF\u5F84\u8FB9\u754C"
    });
    this.patterns.push({
      id: "xss-1",
      name: "XSS - innerHTML",
      description: "\u68C0\u6D4B innerHTML \u4F7F\u7528",
      pattern: /\.innerHTML\s*=/,
      severity: "medium",
      category: "xss",
      message: "innerHTML \u53EF\u80FD\u5BFC\u81F4 XSS",
      suggestion: "\u4F7F\u7528 textContent \u6216 DOMPurify \u6E05\u7406"
    });
    this.patterns.push({
      id: "xss-2",
      name: "XSS - document.write",
      description: "\u68C0\u6D4B document.write \u4F7F\u7528",
      pattern: /document\.write\s*\(/,
      severity: "medium",
      category: "xss",
      message: "document.write \u53EF\u80FD\u5BFC\u81F4 XSS",
      suggestion: "\u4F7F\u7528 DOM API \u66FF\u4EE3"
    });
    this.patterns.push({
      id: "sql-injection-1",
      name: "SQL \u6CE8\u5165 - \u5B57\u7B26\u4E32\u62FC\u63A5",
      description: "\u68C0\u6D4B SQL \u5B57\u7B26\u4E32\u62FC\u63A5",
      pattern: /(?:SELECT|INSERT|UPDATE|DELETE|DROP)\s+.*\$\{|(?:SELECT|INSERT|UPDATE|DELETE|DROP)\s+.*\+/i,
      severity: "critical",
      category: "sql_injection",
      message: "SQL \u5B57\u7B26\u4E32\u62FC\u63A5\u5B58\u5728\u6CE8\u5165\u98CE\u9669",
      suggestion: "\u4F7F\u7528\u53C2\u6570\u5316\u67E5\u8BE2\u6216 ORM"
    });
    this.patterns.push({
      id: "credential-1",
      name: "\u51ED\u8BC1\u66B4\u9732 - API Key",
      description: "\u68C0\u6D4B\u786C\u7F16\u7801\u7684 API Key",
      pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/i,
      severity: "critical",
      category: "credential_exposure",
      message: "\u68C0\u6D4B\u5230\u786C\u7F16\u7801\u7684 API Key",
      suggestion: "\u4F7F\u7528\u73AF\u5883\u53D8\u91CF\u5B58\u50A8\u654F\u611F\u4FE1\u606F"
    });
    this.patterns.push({
      id: "credential-2",
      name: "\u51ED\u8BC1\u66B4\u9732 - \u5BC6\u7801",
      description: "\u68C0\u6D4B\u786C\u7F16\u7801\u7684\u5BC6\u7801",
      pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]/i,
      severity: "critical",
      category: "credential_exposure",
      message: "\u68C0\u6D4B\u5230\u786C\u7F16\u7801\u7684\u5BC6\u7801",
      suggestion: "\u4F7F\u7528\u73AF\u5883\u53D8\u91CF\u6216\u5BC6\u94A5\u7BA1\u7406\u670D\u52A1"
    });
    this.patterns.push({
      id: "credential-3",
      name: "\u51ED\u8BC1\u66B4\u9732 - \u79C1\u94A5",
      description: "\u68C0\u6D4B\u79C1\u94A5\u6587\u4EF6",
      pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/,
      severity: "critical",
      category: "credential_exposure",
      message: "\u68C0\u6D4B\u5230\u79C1\u94A5\u5185\u5BB9",
      suggestion: "\u79C1\u94A5\u4E0D\u5E94\u51FA\u73B0\u5728\u4EE3\u7801\u4E2D"
    });
    this.patterns.push({
      id: "file-op-1",
      name: "\u6587\u4EF6\u64CD\u4F5C - \u654F\u611F\u6587\u4EF6",
      description: "\u68C0\u6D4B\u654F\u611F\u6587\u4EF6\u64CD\u4F5C",
      pattern: /\.(env|pem|key|p12|pfx|jks)$/i,
      severity: "high",
      category: "file_operation",
      message: "\u68C0\u6D4B\u5230\u654F\u611F\u6587\u4EF6\u64CD\u4F5C",
      suggestion: "\u786E\u4FDD\u654F\u611F\u6587\u4EF6\u4E0D\u88AB\u63D0\u4EA4\u5230\u7248\u672C\u63A7\u5236"
    });
    this.patterns.push({
      id: "dangerous-config-1",
      name: "\u5371\u9669\u914D\u7F6E - CORS",
      description: "\u68C0\u6D4B\u8FC7\u4E8E\u5BBD\u677E\u7684 CORS \u914D\u7F6E",
      pattern: /Access-Control-Allow-Origin.*\*/,
      severity: "medium",
      category: "dangerous_config",
      message: "CORS \u914D\u7F6E\u8FC7\u4E8E\u5BBD\u677E",
      suggestion: "\u9650\u5236\u5141\u8BB8\u7684\u6E90"
    });
    this.patterns.push({
      id: "unsafe-deser-1",
      name: "\u4E0D\u5B89\u5168\u53CD\u5E8F\u5217\u5316 - pickle",
      description: "\u68C0\u6D4B pickle \u53CD\u5E8F\u5217\u5316",
      pattern: /pickle\.loads?\(/,
      severity: "critical",
      category: "unsafe_deserialization",
      message: "pickle \u53CD\u5E8F\u5217\u5316\u5B58\u5728\u5B89\u5168\u98CE\u9669",
      suggestion: "\u4F7F\u7528\u66F4\u5B89\u5168\u7684\u5E8F\u5217\u5316\u65B9\u5F0F\uFF0C\u5982 JSON"
    });
    this.patterns.push({
      id: "unsafe-deser-2",
      name: "\u4E0D\u5B89\u5168\u53CD\u5E8F\u5217\u5316 - eval",
      description: "\u68C0\u6D4B eval \u53CD\u5E8F\u5217\u5316",
      pattern: /JSON\.parse\(.*\+|eval\(.*JSON/,
      severity: "high",
      category: "unsafe_deserialization",
      message: "JSON \u89E3\u6790\u53EF\u80FD\u5B58\u5728\u6CE8\u5165\u98CE\u9669",
      suggestion: "\u786E\u4FDD\u8F93\u5165\u6765\u6E90\u53EF\u4FE1"
    });
    this.patterns.push(...this.config.customPatterns);
  }
  // 检查代码
  checkCode(code, location) {
    if (!this.config.enabled) {
      return { passed: true, issues: [], score: 100 };
    }
    const issues = [];
    for (const pattern of this.patterns) {
      if (!this.isCategoryEnabled(pattern.category)) continue;
      if (!this.isSeverityAboveThreshold(pattern.severity)) continue;
      const matches = code.match(new RegExp(pattern.pattern, "g"));
      if (matches) {
        for (const match of matches) {
          issues.push({
            pattern,
            match,
            location,
            context: this.extractContext(code, match)
          });
        }
      }
    }
    const score = this.calculateScore(issues);
    return {
      passed: issues.length === 0,
      issues,
      score
    };
  }
  // 检查命令
  checkCommand(command) {
    return this.checkCode(command, "command");
  }
  // 检查文件路径
  checkFilePath(filePath) {
    const issues = [];
    if (filePath.includes("..")) {
      issues.push({
        pattern: this.patterns.find((p) => p.id === "path-traversal-1"),
        match: filePath,
        location: "file_path"
      });
    }
    if (/\.(env|pem|key|p12|pfx|jks)$/i.test(filePath)) {
      issues.push({
        pattern: this.patterns.find((p) => p.id === "file-op-1"),
        match: filePath,
        location: "file_path"
      });
    }
    const score = this.calculateScore(issues);
    return {
      passed: issues.length === 0,
      issues,
      score
    };
  }
  // 检查是否启用类别
  isCategoryEnabled(category) {
    return this.config.categories.includes(category);
  }
  // 检查严重性是否高于阈值
  isSeverityAboveThreshold(severity) {
    const levels = ["info", "low", "medium", "high", "critical"];
    const thresholdIndex = levels.indexOf(this.config.severityThreshold);
    const severityIndex = levels.indexOf(severity);
    return severityIndex >= thresholdIndex;
  }
  // 提取上下文
  extractContext(code, match) {
    const index = code.indexOf(match);
    if (index === -1) return "";
    const start = Math.max(0, index - 50);
    const end = Math.min(code.length, index + match.length + 50);
    return code.substring(start, end);
  }
  // 计算安全分数
  calculateScore(issues) {
    if (issues.length === 0) return 100;
    let deductions = 0;
    for (const issue of issues) {
      switch (issue.pattern.severity) {
        case "critical":
          deductions += 25;
          break;
        case "high":
          deductions += 15;
          break;
        case "medium":
          deductions += 10;
          break;
        case "low":
          deductions += 5;
          break;
        case "info":
          deductions += 2;
          break;
      }
    }
    return Math.max(0, 100 - deductions);
  }
  // 获取所有模式
  getPatterns() {
    return [...this.patterns];
  }
  // 添加自定义模式
  addPattern(pattern) {
    this.patterns.push(pattern);
  }
  // 移除模式
  removePattern(id) {
    this.patterns = this.patterns.filter((p) => p.id !== id);
  }
  // 更新配置
  updateConfig(config) {
    this.config = { ...this.config, ...config };
  }
  // 获取配置
  getConfig() {
    return { ...this.config };
  }
};
var securityChecker = new SecurityChecker();

// src/confidence/scorer.ts
var ConfidenceScorer = class {
  config;
  constructor(config) {
    this.config = {
      confidenceThreshold: 80,
      categories: [
        "bug",
        "performance",
        "security",
        "maintainability",
        "style",
        "documentation",
        "test",
        "accessibility",
        "compatibility"
      ],
      maxIssues: 50,
      ...config
    };
  }
  // 计算置信度分数
  calculateConfidence(params) {
    let score = 50;
    const evidence = [];
    let reasoning = "";
    if (params.hasEvidence) {
      score += 20;
      evidence.push("\u6709\u660E\u786E\u8BC1\u636E");
    }
    if (params.evidenceCount >= 3) {
      score += 15;
      evidence.push(`\u591A\u5904\u8BC1\u636E (${params.evidenceCount})`);
    } else if (params.evidenceCount >= 2) {
      score += 10;
      evidence.push(`\u591A\u5904\u8BC1\u636E (${params.evidenceCount})`);
    }
    if (params.isVerified) {
      score += 10;
      evidence.push("\u5DF2\u9A8C\u8BC1");
    }
    if (params.isReproducible) {
      score += 10;
      evidence.push("\u53EF\u590D\u73B0");
    }
    switch (params.contextQuality) {
      case "high":
        score += 10;
        evidence.push("\u4E0A\u4E0B\u6587\u5B8C\u6574");
        break;
      case "medium":
        score += 5;
        evidence.push("\u4E0A\u4E0B\u6587\u4E00\u822C");
        break;
      case "low":
        evidence.push("\u4E0A\u4E0B\u6587\u4E0D\u8DB3");
        break;
    }
    score = Math.min(100, Math.max(0, score));
    reasoning = this.generateReasoning(score, params);
    return {
      score,
      level: this.scoreToLevel(score),
      evidence,
      reasoning
    };
  }
  // 生成推理说明
  generateReasoning(score, params) {
    const parts = [];
    if (score >= 80) {
      parts.push("\u9AD8\u7F6E\u4FE1\u5EA6");
    } else if (score >= 60) {
      parts.push("\u4E2D\u7B49\u7F6E\u4FE1\u5EA6");
    } else {
      parts.push("\u4F4E\u7F6E\u4FE1\u5EA6");
    }
    if (!params.hasEvidence) {
      parts.push("\u7F3A\u4E4F\u76F4\u63A5\u8BC1\u636E");
    }
    if (params.evidenceCount < 2) {
      parts.push("\u8BC1\u636E\u4E0D\u8DB3");
    }
    if (!params.isVerified) {
      parts.push("\u672A\u9A8C\u8BC1");
    }
    return parts.join("\uFF0C");
  }
  // 分数转级别
  scoreToLevel(score) {
    if (score >= 90) return "critical";
    if (score >= 75) return "major";
    if (score >= 50) return "minor";
    return "info";
  }
  // 评估问题
  evaluateIssue(issue) {
    const confidence = this.calculateConfidence({
      hasEvidence: !!issue.description,
      evidenceCount: issue.references?.length || 0,
      isVerified: false,
      isReproducible: true,
      contextQuality: issue.location.line ? "high" : "medium"
    });
    return {
      ...issue,
      confidence
    };
  }
  // 过滤问题
  filterIssues(issues) {
    return issues.filter((issue) => issue.confidence.score >= this.config.confidenceThreshold).filter((issue) => this.config.categories.includes(issue.category)).sort((a, b) => b.confidence.score - a.confidence.score).slice(0, this.config.maxIssues);
  }
  // 生成审查结果
  generateReviewResult(issues) {
    const filtered = this.filterIssues(issues);
    const summary = {
      total: filtered.length,
      critical: filtered.filter((i) => i.severity === "critical").length,
      major: filtered.filter((i) => i.severity === "major").length,
      minor: filtered.filter((i) => i.severity === "minor").length,
      info: filtered.filter((i) => i.severity === "info").length,
      averageConfidence: filtered.length > 0 ? Math.round(filtered.reduce((sum, i) => sum + i.confidence.score, 0) / filtered.length) : 0
    };
    return {
      issues: filtered,
      summary,
      passed: summary.critical === 0 && summary.major === 0
    };
  }
  // 格式式审查结果
  formatReviewResult(result) {
    const lines = [];
    lines.push("## \u4EE3\u7801\u5BA1\u67E5\u7ED3\u679C");
    lines.push("");
    if (result.issues.length === 0) {
      lines.push("\u672A\u53D1\u73B0\u95EE\u9898");
      return lines.join("\n");
    }
    lines.push(`\u53D1\u73B0 ${result.summary.total} \u4E2A\u95EE\u9898\uFF1A`);
    lines.push("");
    const grouped = this.groupBySeverity(result.issues);
    for (const [severity, issues] of Object.entries(grouped)) {
      if (issues.length === 0) continue;
      lines.push(`### ${this.severityToChinese(severity)} (${issues.length})`);
      lines.push("");
      for (const issue of issues) {
        lines.push(`- **${issue.title}** (\u7F6E\u4FE1\u5EA6: ${issue.confidence.score})`);
        lines.push(`  ${issue.description}`);
        if (issue.location.file) {
          lines.push(`  \u4F4D\u7F6E: ${issue.location.file}${issue.location.line ? `:${issue.location.line}` : ""}`);
        }
        if (issue.suggestion) {
          lines.push(`  \u5EFA\u8BAE: ${issue.suggestion}`);
        }
        lines.push("");
      }
    }
    lines.push("### \u7EDF\u8BA1");
    lines.push(`- \u5E73\u5747\u7F6E\u4FE1\u5EA6: ${result.summary.averageConfidence}`);
    lines.push(`- \u4E25\u91CD\u95EE\u9898: ${result.summary.critical}`);
    lines.push(`- \u4E3B\u8981\u95EE\u9898: ${result.summary.major}`);
    lines.push(`- \u6B21\u8981\u95EE\u9898: ${result.summary.minor}`);
    lines.push(`- \u4FE1\u606F: ${result.summary.info}`);
    return lines.join("\n");
  }
  // 按严重性分组
  groupBySeverity(issues) {
    const groups = {
      critical: [],
      major: [],
      minor: [],
      info: []
    };
    for (const issue of issues) {
      groups[issue.severity].push(issue);
    }
    return groups;
  }
  // 严重性转中文
  severityToChinese(severity) {
    const map = {
      critical: "\u4E25\u91CD\u95EE\u9898",
      major: "\u4E3B\u8981\u95EE\u9898",
      minor: "\u6B21\u8981\u95EE\u9898",
      info: "\u4FE1\u606F"
    };
    return map[severity];
  }
  // 更新配置
  updateConfig(config) {
    this.config = { ...this.config, ...config };
  }
  // 获取配置
  getConfig() {
    return { ...this.config };
  }
};
var confidenceScorer = new ConfidenceScorer();

// src/learning/manager.ts
var LearningMode = class {
  config;
  currentSession = null;
  promptCounter = 0;
  constructor(config) {
    this.config = {
      enabled: false,
      frequency: "sometimes",
      minCodeLines: 5,
      maxCodeLines: 10,
      showHints: true,
      trackContributions: true,
      ...config
    };
  }
  // 开始学习会话
  startSession() {
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: (/* @__PURE__ */ new Date()).toISOString(),
      prompts: [],
      userContributions: [],
      insights: []
    };
    return this.currentSession;
  }
  // 结束学习会话
  endSession() {
    if (!this.currentSession) return null;
    const session = { ...this.currentSession };
    this.currentSession = null;
    return session;
  }
  // 生成学习提示
  generatePrompt(params) {
    if (!this.config.enabled) return null;
    if (!this.shouldGeneratePrompt()) return null;
    const prompt = {
      id: `prompt-${++this.promptCounter}`,
      trigger: params.trigger,
      message: this.generateMessage(params.trigger, params.context, params.topic),
      codeSnippet: params.codeSnippet,
      expectedLines: this.getRandomExpectedLines(),
      hints: this.config.showHints ? this.generateHints(params.trigger, params.topic) : void 0
    };
    if (this.currentSession) {
      this.currentSession.prompts.push(prompt);
    }
    return prompt;
  }
  // 是否应该生成提示
  shouldGeneratePrompt() {
    const random = Math.random();
    switch (this.config.frequency) {
      case "always":
        return true;
      case "often":
        return random < 0.7;
      case "sometimes":
        return random < 0.4;
      case "rarely":
        return random < 0.2;
      default:
        return false;
    }
  }
  // 生成消息
  generateMessage(trigger, context, topic) {
    const messages = {
      decision_point: [
        "\u73B0\u5728\u662F\u4E00\u4E2A\u51B3\u7B56\u70B9\u3002\u4F60\u8BA4\u4E3A\u5E94\u8BE5\u600E\u4E48\u505A\uFF1F",
        "\u8FD9\u91CC\u6709\u51E0\u4E2A\u9009\u62E9\uFF0C\u4F60\u4F1A\u600E\u4E48\u9009\uFF1F",
        "\u8FD9\u662F\u4E00\u4E2A\u5F88\u597D\u7684\u5B66\u4E60\u673A\u4F1A\uFF0C\u4F60\u6765\u51B3\u5B9A\u4E0B\u4E00\u6B65\u3002"
      ],
      code_review: [
        "\u4EE3\u7801\u5BA1\u67E5\u5B8C\u6210\u3002\u4F60\u80FD\u5199\u4E00\u6BB5\u6539\u8FDB\u4EE3\u7801\u5417\uFF1F",
        "\u57FA\u4E8E\u5BA1\u67E5\u7ED3\u679C\uFF0C\u4F60\u6765\u5B9E\u73B0\u4FEE\u590D\u3002",
        "\u8FD9\u662F\u6539\u8FDB\u7684\u673A\u4F1A\uFF0C\u4F60\u6765\u5199\u4EE3\u7801\u3002"
      ],
      error_explanation: [
        "\u9519\u8BEF\u5DF2\u89E3\u91CA\u3002\u4F60\u80FD\u5199\u4E00\u4E2A\u6B63\u786E\u7684\u7248\u672C\u5417\uFF1F",
        "\u7406\u89E3\u4E86\u9519\u8BEF\u539F\u56E0\uFF0C\u4F60\u6765\u4FEE\u590D\u5B83\u3002",
        "\u8FD9\u662F\u5B66\u4E60\u7684\u597D\u673A\u4F1A\uFF0C\u4F60\u6765\u5B9E\u73B0\u6B63\u786E\u65B9\u6848\u3002"
      ],
      concept_intro: [
        "\u4ECB\u7ECD\u4E86\u65B0\u6982\u5FF5\u3002\u4F60\u80FD\u5199\u4E00\u4E2A\u793A\u4F8B\u5417\uFF1F",
        "\u6982\u5FF5\u5DF2\u89E3\u91CA\uFF0C\u4F60\u6765\u5B9E\u8DF5\u4E00\u4E0B\u3002",
        "\u7406\u8BBA\u5DF2\u8BB2\u5B8C\uFF0C\u4F60\u6765\u5199\u4EE3\u7801\u3002"
      ],
      pattern_detected: [
        "\u68C0\u6D4B\u5230\u4EE3\u7801\u6A21\u5F0F\u3002\u4F60\u80FD\u5199\u4E00\u4E2A\u9075\u5FAA\u8FD9\u4E2A\u6A21\u5F0F\u7684\u4EE3\u7801\u5417\uFF1F",
        "\u8FD9\u662F\u9879\u76EE\u7684\u4EE3\u7801\u6A21\u5F0F\uFF0C\u4F60\u6765\u5B9E\u73B0\u4E00\u4E2A\u793A\u4F8B\u3002",
        "\u6A21\u5F0F\u5DF2\u8BC6\u522B\uFF0C\u4F60\u6765\u5B9E\u8DF5\u3002"
      ]
    };
    const options = messages[trigger];
    const message = options[Math.floor(Math.random() * options.length)];
    if (topic) {
      return `${message}

\u4E3B\u9898: ${topic}`;
    }
    return message;
  }
  // 生成提示
  generateHints(trigger, topic) {
    const hints = [];
    switch (trigger) {
      case "decision_point":
        hints.push("\u8003\u8651\u4EE3\u7801\u7684\u53EF\u7EF4\u62A4\u6027");
        hints.push("\u8003\u8651\u6027\u80FD\u5F71\u54CD");
        hints.push("\u8003\u8651\u9519\u8BEF\u5904\u7406");
        break;
      case "code_review":
        hints.push("\u53C2\u8003\u5BA1\u67E5\u5EFA\u8BAE");
        hints.push("\u4FDD\u6301\u4EE3\u7801\u7B80\u6D01");
        hints.push("\u6DFB\u52A0\u5FC5\u8981\u7684\u6CE8\u91CA");
        break;
      case "error_explanation":
        hints.push("\u7406\u89E3\u9519\u8BEF\u6839\u56E0");
        hints.push("\u6DFB\u52A0\u8FB9\u754C\u68C0\u67E5");
        hints.push("\u8003\u8651\u5F02\u5E38\u60C5\u51B5");
        break;
      case "concept_intro":
        hints.push("\u4ECE\u7B80\u5355\u793A\u4F8B\u5F00\u59CB");
        hints.push("\u9010\u6B65\u589E\u52A0\u590D\u6742\u5EA6");
        hints.push("\u6D4B\u8BD5\u4F60\u7684\u4EE3\u7801");
        break;
      case "pattern_detected":
        hints.push("\u9075\u5FAA\u9879\u76EE\u89C4\u8303");
        hints.push("\u4FDD\u6301\u4E00\u81F4\u6027");
        hints.push("\u53C2\u8003\u73B0\u6709\u4EE3\u7801");
        break;
    }
    if (topic) {
      hints.push(`\u805A\u7126\u4E8E ${topic}`);
    }
    return hints;
  }
  // 获取随机期望行数
  getRandomExpectedLines() {
    const { minCodeLines, maxCodeLines } = this.config;
    return Math.floor(Math.random() * (maxCodeLines - minCodeLines + 1)) + minCodeLines;
  }
  // 记录用户贡献
  recordContribution(contribution) {
    if (!this.config.trackContributions || !this.currentSession) return;
    this.currentSession.userContributions.push(contribution);
  }
  // 评估用户贡献
  evaluateContribution(code, expectedLines) {
    const lines = code.split("\n").filter((l) => l.trim()).length;
    if (lines < expectedLines * 0.5) {
      return {
        quality: "needs_improvement",
        feedback: `\u4EE3\u7801\u884C\u6570\u8F83\u5C11\uFF0C\u671F\u671B\u7EA6 ${expectedLines} \u884C\uFF0C\u5B9E\u9645 ${lines} \u884C\u3002`
      };
    }
    if (lines > expectedLines * 2) {
      return {
        quality: "needs_improvement",
        feedback: `\u4EE3\u7801\u884C\u6570\u8F83\u591A\uFF0C\u671F\u671B\u7EA6 ${expectedLines} \u884C\uFF0C\u5B9E\u9645 ${lines} \u884C\u3002\u8003\u8651\u7B80\u5316\u3002`
      };
    }
    if (code.includes("TODO") || code.includes("FIXME")) {
      return {
        quality: "needs_improvement",
        feedback: "\u4EE3\u7801\u4E2D\u5305\u542B TODO/FIXME\uFF0C\u8BF7\u5B8C\u6210\u5B9E\u73B0\u3002"
      };
    }
    return {
      quality: "good",
      feedback: "\u4EE3\u7801\u770B\u8D77\u6765\u4E0D\u9519\uFF01"
    };
  }
  // 生成学习洞察
  generateInsight(topic, codeExamples) {
    const insight = {
      topic,
      description: this.generateInsightDescription(topic),
      examples: codeExamples,
      bestPractices: this.generateBestPractices(topic)
    };
    if (this.currentSession) {
      this.currentSession.insights.push(topic);
    }
    return insight;
  }
  // 生成洞察描述
  generateInsightDescription(topic) {
    return `\u5173\u4E8E ${topic} \u7684\u5B66\u4E60\u6D1E\u5BDF`;
  }
  // 生成最佳实践
  generateBestPractices(topic) {
    return [
      "\u9075\u5FAA\u9879\u76EE\u4EE3\u7801\u89C4\u8303",
      "\u7F16\u5199\u6E05\u6670\u7684\u6CE8\u91CA",
      "\u4FDD\u6301\u51FD\u6570\u7B80\u6D01",
      "\u5904\u7406\u8FB9\u754C\u60C5\u51B5"
    ];
  }
  // 格式式学习提示
  formatPrompt(prompt) {
    const lines = [];
    lines.push("## \u5B66\u4E60\u65F6\u523B");
    lines.push("");
    lines.push(prompt.message);
    lines.push("");
    if (prompt.codeSnippet) {
      lines.push("```");
      lines.push(prompt.codeSnippet);
      lines.push("```");
      lines.push("");
    }
    if (prompt.expectedLines) {
      lines.push(`\u671F\u671B\u4EE3\u7801\u884C\u6570: \u7EA6 ${prompt.expectedLines} \u884C`);
      lines.push("");
    }
    if (prompt.hints && prompt.hints.length > 0) {
      lines.push("\u63D0\u793A:");
      for (const hint of prompt.hints) {
        lines.push(`- ${hint}`);
      }
      lines.push("");
    }
    return lines.join("\n");
  }
  // 格式式学习洞察
  formatInsight(insight) {
    const lines = [];
    lines.push(`## \u5B66\u4E60\u6D1E\u5BDF: ${insight.topic}`);
    lines.push("");
    lines.push(insight.description);
    lines.push("");
    if (insight.examples.length > 0) {
      lines.push("### \u793A\u4F8B");
      lines.push("");
      for (const example of insight.examples) {
        lines.push("```");
        lines.push(example);
        lines.push("```");
        lines.push("");
      }
    }
    if (insight.bestPractices.length > 0) {
      lines.push("### \u6700\u4F73\u5B9E\u8DF5");
      lines.push("");
      for (const practice of insight.bestPractices) {
        lines.push(`- ${practice}`);
      }
    }
    return lines.join("\n");
  }
  // 生成会话 ID
  generateSessionId() {
    return `learning-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }
  // 获取当前会话
  getCurrentSession() {
    return this.currentSession;
  }
  // 获取配置
  getConfig() {
    return { ...this.config };
  }
  // 更新配置
  updateConfig(config) {
    this.config = { ...this.config, ...config };
  }
  // 检查是否启用
  isEnabled() {
    return this.config.enabled;
  }
  // 启用
  enable() {
    this.config.enabled = true;
  }
  // 禁用
  disable() {
    this.config.enabled = false;
  }
};
var learningMode = new LearningMode();

// src/agents/orchestrator.ts
var AgentOrchestrator = class {
  constructor(aiClient, contextManager2, toolRegistry2, projectRoot) {
    this.aiClient = aiClient;
    this.contextManager = contextManager2;
    this.toolRegistry = toolRegistry2;
    this.projectRoot = projectRoot;
    this.controller = new ControllerAgent(aiClient, contextManager2, toolRegistry2);
    this.context = {
      projectRoot,
      currentPhase: "S0",
      currentMode: "unknown",
      userConfirmed: false,
      designConfirmed: false,
      sessionData: {}
    };
    this.initPluginManager();
  }
  aiClient;
  contextManager;
  toolRegistry;
  projectRoot;
  controller;
  context;
  sessionInitialized = false;
  // 初始化插件管理器
  async initPluginManager() {
    try {
      await pluginManager.init();
      forgeLogger.logInfo(pluginManager.getSummary());
    } catch (error) {
      forgeLogger.logError(`\u63D2\u4EF6\u7BA1\u7406\u5668\u521D\u59CB\u5316\u5931\u8D25: ${error}`);
    }
  }
  // 执行用户输入
  async execute(userInput) {
    const isFlutterTask = await this.classifyTask(userInput);
    if (isFlutterTask === null) {
      return {
        success: false,
        output: "",
        error: "\u6A21\u578B\u4E0D\u53EF\u7528\uFF0C\u8BF7\u68C0\u67E5 API \u914D\u7F6E\uFF08/model\uFF09"
      };
    }
    if (!isFlutterTask) {
      return await this.directResponse(userInput);
    }
    const promptHookResult = await hookManager.execute("PromptSubmit", {
      event: "PromptSubmit",
      userPrompt: userInput
    });
    if (promptHookResult.action === "block") {
      return {
        success: false,
        output: "",
        error: promptHookResult.message || "\u64CD\u4F5C\u88AB\u94A9\u5B50\u963B\u6B62"
      };
    }
    const securityResult = securityChecker.checkCode(userInput);
    if (!securityResult.passed && securityResult.score < 50) {
      forgeLogger.logWarning(`\u5B89\u5168\u68C0\u67E5\u8B66\u544A (\u5206\u6570: ${securityResult.score})`);
      for (const issue of securityResult.issues) {
        forgeLogger.logWarning(`  - ${issue.pattern.message}: ${issue.match}`);
      }
    }
    if (!this.sessionInitialized) {
      sessionManager.init(this.context.projectRoot, userInput);
      this.sessionInitialized = true;
      await hookManager.execute("SessionStart", {
        event: "SessionStart",
        sessionState: sessionManager.get()
      });
    }
    sessionManager.setState("executing");
    sessionManager.addHistory("user_input", "user", userInput);
    if (autonomousMode.isEnabled() && !autonomousMode.canAutoProceed(userInput)) {
      forgeLogger.logWaiting("\u68C0\u6D4B\u5230\u9AD8\u98CE\u9669\u64CD\u4F5C\uFF0C\u7B49\u5F85\u7528\u6237\u786E\u8BA4");
      sessionManager.waitForInput();
      return {
        success: true,
        output: "[f-forge] \u68C0\u6D4B\u5230\u9AD8\u98CE\u9669\u64CD\u4F5C\uFF0C\u8BF7\u786E\u8BA4\u662F\u5426\u7EE7\u7EED",
        needsUserInput: true
      };
    }
    const targetAgent = this.controller.route(userInput);
    this.updateContext(targetAgent);
    sessionManager.setActiveAgent(targetAgent);
    sessionManager.setPhase(this.context.currentPhase);
    forgeLogger.enterController();
    forgeLogger.logPhase(this.context.currentPhase);
    const result = await this.controller.dispatch(targetAgent, userInput, this.context);
    this.processResult(result);
    sessionManager.addHistory("agent_result", targetAgent, result.output);
    return result;
  }
  // 非工作流任务：直接回答（带上下文和工具）
  async directResponse(userInput) {
    this.contextManager.addUserMessage(userInput);
    try {
      const tools = this.toolRegistry.getAll().map((t) => ({
        name: t.definition.name,
        description: t.definition.description,
        parameters: t.definition.parameters.properties,
        execute: t.execute
      }));
      const result = await this.aiClient.generateWithMessages(
        this.contextManager.getMessages(),
        tools,
        5
      );
      this.contextManager.addAssistantMessage(result.text);
      return { success: true, output: result.text };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, output: "", error: msg };
    }
  }
  // 用大模型判断是否需要进入 f-forge 工作流
  async classifyTask(userInput) {
    try {
      const result = await this.aiClient.generate(
        `\u5224\u65AD\u4EE5\u4E0B\u7528\u6237\u8F93\u5165\u662F\u5426\u9700\u8981\u8FDB\u5165\u7ED3\u6784\u5316\u5F00\u53D1\u5DE5\u4F5C\u6D41\uFF08\u9700\u6C42\u5206\u6790\u2192\u65B9\u6848\u8BBE\u8BA1\u2192\u5B9E\u73B0\u2192\u9A8C\u8BC1\uFF09\u3002
\u9700\u8981\u8FDB\u5165\u5DE5\u4F5C\u6D41\u7684\uFF1A\u521B\u5EFA\u9875\u9762\u3001\u5F00\u53D1\u529F\u80FD\u3001\u91CD\u6784\u4EE3\u7801\u3001UI\u8BBE\u8BA1\u3001\u67B6\u6784\u8BBE\u8BA1\u7B49\u9700\u8981\u591A\u6B65\u9AA4\u89C4\u5212\u7684\u5F00\u53D1\u4EFB\u52A1\u3002
\u4E0D\u9700\u8981\u8FDB\u5165\u5DE5\u4F5C\u6D41\u7684\uFF1A\u95F2\u804A\u3001\u7B80\u5355\u95EE\u7B54\u3001\u76F4\u63A5\u6267\u884C\u547D\u4EE4\u3001\u67E5\u770B\u4FE1\u606F\u3001\u7B80\u5355\u7684\u6587\u4EF6\u64CD\u4F5C\u7B49\u3002

\u7528\u6237\u8F93\u5165\uFF1A${userInput}

\u53EA\u56DE\u590D\u4E00\u4E2A\u5B57\uFF1A"\u662F"\u6216"\u5426"\u3002`,
        '\u4F60\u662F\u4E00\u4E2A\u4EFB\u52A1\u5206\u7C7B\u5668\u3002\u53EA\u56DE\u590D"\u662F"\u6216"\u5426"\uFF0C\u4E0D\u8981\u56DE\u590D\u5176\u4ED6\u5185\u5BB9\u3002',
        void 0,
        1
      );
      const text = result.text.trim();
      return text.startsWith("\u662F");
    } catch {
      return null;
    }
  }
  // 流式执行
  async *executeStream(userInput) {
    if (!this.sessionInitialized) {
      sessionManager.init(this.context.projectRoot, userInput);
      this.sessionInitialized = true;
    }
    sessionManager.setState("executing");
    sessionManager.addHistory("user_input", "user", userInput);
    const targetAgent = this.controller.route(userInput);
    this.updateContext(targetAgent);
    sessionManager.setActiveAgent(targetAgent);
    sessionManager.setPhase(this.context.currentPhase);
    forgeLogger.enterController();
    forgeLogger.logPhase(this.context.currentPhase);
    yield* this.controller.executeStream(userInput, this.context);
    sessionManager.addHistory("stream_complete", targetAgent, "");
  }
  // 更新上下文
  updateContext(targetAgent) {
    switch (targetAgent) {
      case "requirement_analyst":
        this.context.currentPhase = "S1";
        break;
      case "ui_designer":
      case "architecture_designer":
        this.context.currentPhase = "S2";
        break;
      case "page_engineer":
        this.context.currentPhase = "S4";
        break;
      case "verify_agent":
        this.context.currentPhase = "S5";
        break;
    }
  }
  // 处理结果
  processResult(result) {
    if (result.success) {
      const formattedOutput = forgeLogger.formatOutput(result.output);
      if (result.output.includes("[f-forge] \u9636\u6BB5\uFF1A")) {
        this.advancePhase();
      }
      if (result.needsUserInput) {
        this.context.userConfirmed = false;
        sessionManager.waitForInput();
      }
      forgeLogger.logComplete(formattedOutput.substring(0, 100));
    } else {
      forgeLogger.logError(result.error || "\u6267\u884C\u5931\u8D25");
    }
  }
  // 推进阶段
  advancePhase() {
    const phases = ["S0", "S1", "S2", "S3", "S4", "S5", "S6"];
    const currentIndex = phases.indexOf(this.context.currentPhase);
    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1];
      const session = sessionManager.get();
      const gateResult = gateChecker.checkCanAdvancePhase(session, this.context.currentPhase, nextPhase);
      if (!gateResult.passed) {
        forgeLogger.logGate(gateResult.gateId, false, gateResult.reason);
        return;
      }
      this.context.currentPhase = nextPhase;
      sessionManager.setPhase(nextPhase);
      forgeLogger.logPhase(nextPhase);
    }
  }
  // 获取当前阶段
  getCurrentPhase() {
    return this.context.currentPhase;
  }
  // 获取当前 Agent
  getCurrentAgent() {
    return this.controller.getCurrentAgent();
  }
  // 设置用户确认
  setUserConfirmed(confirmed) {
    this.context.userConfirmed = confirmed;
  }
  // 设置设计确认
  setDesignConfirmed(confirmed) {
    this.context.designConfirmed = confirmed;
  }
  // 获取上下文
  getContext() {
    return { ...this.context };
  }
  // 获取 session 信息
  getSessionInfo() {
    const session = sessionManager.get();
    if (!session) return null;
    return {
      id: session.id,
      state: session.state,
      mode: session.mode
    };
  }
  // 启用/禁用 ff-fast 模式
  enableFastMode() {
    fastMode.enable();
    forgeLogger.logMode("ff-fast");
  }
  disableFastMode() {
    fastMode.disable();
    forgeLogger.logMode("standard");
  }
  isFastModeEnabled() {
    return fastMode.isEnabled();
  }
  // 启用/禁用 ff-a 模式
  enableAutonomousMode() {
    autonomousMode.enable();
    forgeLogger.logMode("ff-a (autonomous)");
  }
  disableAutonomousMode() {
    autonomousMode.disable();
    forgeLogger.logMode("standard");
  }
  isAutonomousModeEnabled() {
    return autonomousMode.isEnabled();
  }
  // 获取推荐模式（ff-fast）
  getRecommendedMode(userInput) {
    return fastMode.getRecommendedMode(userInput);
  }
  // 检查是否应该升级模式
  shouldUpgradeMode(userInput, scanResult) {
    return fastMode.shouldUpgrade(userInput, scanResult);
  }
  // 获取插件管理器
  getPluginManager() {
    return pluginManager;
  }
  // 获取 MCP 客户端
  getMCPClient() {
    return mcpClient;
  }
  // 获取 Agent 池
  getAgentPool() {
    return agentPool;
  }
  // 获取安全检查器
  getSecurityChecker() {
    return securityChecker;
  }
  // 获取置信度评分器
  getConfidenceScorer() {
    return confidenceScorer;
  }
  // 获取学习模式
  getLearningMode() {
    return learningMode;
  }
  // 获取钩子管理器
  getHookManager() {
    return hookManager;
  }
  // 并行执行多个任务
  async parallelExecute(tasks) {
    const agentTasks = tasks.map((task, index) => ({
      id: `task-${index}`,
      role: task.role,
      input: task.input,
      context: this.context
    }));
    const results = await agentPool.parallel(agentTasks);
    return results.map((r) => r.result);
  }
  // 连接 MCP 服务器
  async connectMCPServer(serverId, config) {
    return mcpClient.connect(serverId, config);
  }
  // 获取 MCP 工具
  getMCPTools() {
    return mcpClient.getAllTools();
  }
  // 启用/禁用学习模式
  enableLearningMode() {
    learningMode.enable();
    forgeLogger.logMode("learning");
  }
  disableLearningMode() {
    learningMode.disable();
    forgeLogger.logMode("standard");
  }
  isLearningModeEnabled() {
    return learningMode.isEnabled();
  }
};

// src/tools/registry.ts
var ToolRegistry = class {
  tools = /* @__PURE__ */ new Map();
  register(tool2) {
    this.tools.set(tool2.definition.name, tool2);
  }
  get(name) {
    return this.tools.get(name);
  }
  getAll() {
    return Array.from(this.tools.values());
  }
  getDefinitions() {
    return this.getAll().map((tool2) => tool2.definition);
  }
  async execute(name, args) {
    const tool2 = this.tools.get(name);
    if (!tool2) {
      return {
        success: false,
        output: "",
        error: `Tool "${name}" not found`
      };
    }
    try {
      return await tool2.execute(args);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        output: "",
        error: errorMessage
      };
    }
  }
  has(name) {
    return this.tools.has(name);
  }
  size() {
    return this.tools.size;
  }
};
var toolRegistry = new ToolRegistry();

// src/tools/scanner.ts
import { join as join6 } from "path";

// src/tools/executor.ts
import { exec } from "child_process";
import { promisify } from "util";
import { resolve as resolve5 } from "path";
var execAsync = promisify(exec);
async function executeScript(scriptPath, args = [], cwd) {
  const resolvedPath = resolve5(scriptPath);
  const command = `${resolvedPath} ${args.join(" ")}`;
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: cwd || process.cwd(),
      timeout: 3e4,
      // 30 秒超时
      encoding: "utf-8"
    });
    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0
    };
  } catch (error) {
    const execError = error;
    return {
      stdout: execError.stdout?.trim() || "",
      stderr: execError.stderr?.trim() || "",
      exitCode: execError.code || 1
    };
  }
}
async function executePython(scriptPath, args = [], cwd) {
  return executeScript(`python3 ${scriptPath}`, args, cwd);
}
async function executeShell(scriptPath, args = [], cwd) {
  return executeScript(`bash ${scriptPath}`, args, cwd);
}

// src/tools/scanner.ts
var SCRIPTS_DIR = join6(import.meta.dirname, "..", "..", "scripts");
var scanProjectTool = {
  definition: {
    name: "scan_project",
    description: "\u626B\u63CF Flutter \u9879\u76EE\u7ED3\u6784\uFF0C\u8BC6\u522B\u6280\u672F\u6808\u3001\u76EE\u5F55\u7ED3\u6784\u3001\u72B6\u6001\u7BA1\u7406\u65B9\u6848\u7B49",
    parameters: {
      type: "object",
      properties: {
        project_root: {
          type: "string",
          description: "Flutter \u9879\u76EE\u6839\u76EE\u5F55\u8DEF\u5F84"
        }
      },
      required: ["project_root"]
    }
  },
  async execute(args) {
    const { project_root } = args;
    const scriptPath = join6(SCRIPTS_DIR, "flutter_stack_scan.py");
    const result = await executePython(scriptPath, [project_root]);
    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : void 0
    };
  }
};
var detectProjectStateTool = {
  definition: {
    name: "detect_project_state",
    description: "\u68C0\u6D4B\u9879\u76EE\u6839\u76EE\u5F55\u72B6\u6001\uFF1Aempty_new\uFF08\u7A7A\u76EE\u5F55\uFF09\u3001flutter_existing\uFF08Flutter \u9879\u76EE\uFF09\u3001non_flutter\uFF08\u5176\u4ED6\uFF09",
    parameters: {
      type: "object",
      properties: {
        project_root: {
          type: "string",
          description: "\u9879\u76EE\u6839\u76EE\u5F55\u8DEF\u5F84"
        }
      },
      required: ["project_root"]
    }
  },
  async execute(args) {
    const { project_root } = args;
    const scriptPath = join6(SCRIPTS_DIR, "detect_project_root_state.py");
    const result = await executePython(scriptPath, [project_root]);
    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : void 0
    };
  }
};

// src/tools/validator.ts
import { join as join7 } from "path";
var SCRIPTS_DIR2 = join7(import.meta.dirname, "..", "..", "scripts");
var validateOutputTool = {
  definition: {
    name: "validate_output",
    description: "\u9A8C\u8BC1\u8F93\u51FA\u662F\u5426\u7B26\u5408 flutter-forge \u89C4\u8303\uFF08\u65E5\u5FD7\u524D\u7F00\u3001\u9636\u6BB5\u6807\u8BB0\u7B49\uFF09",
    parameters: {
      type: "object",
      properties: {
        output: {
          type: "string",
          description: "\u5F85\u9A8C\u8BC1\u7684\u8F93\u51FA\u6587\u672C"
        },
        require_s4: {
          type: "boolean",
          description: "\u662F\u5426\u8981\u6C42\u5305\u542B S4 \u9636\u6BB5\u6807\u8BB0"
        },
        require_complete: {
          type: "boolean",
          description: "\u662F\u5426\u8981\u6C42\u5305\u542B\u5B8C\u6210\u6807\u8BB0"
        }
      },
      required: ["output"]
    }
  },
  async execute(args) {
    const { output, require_s4, require_complete } = args;
    const scriptPath = join7(SCRIPTS_DIR2, "validate_output.sh");
    const scriptArgs = [];
    if (require_s4 === "true") scriptArgs.push("--require-s4");
    if (require_complete === "true") scriptArgs.push("--require-complete");
    const result = await executeShell(
      `echo ${JSON.stringify(output)} | ${scriptPath}`,
      scriptArgs
    );
    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : void 0
    };
  }
};
var validateDocsSyncTool = {
  definition: {
    name: "validate_docs_sync",
    description: "\u9A8C\u8BC1\u6587\u6863\u4E0E\u4EE3\u7801\u662F\u5426\u540C\u6B65",
    parameters: {
      type: "object",
      properties: {
        project_root: {
          type: "string",
          description: "\u9879\u76EE\u6839\u76EE\u5F55\u8DEF\u5F84"
        }
      },
      required: ["project_root"]
    }
  },
  async execute(args) {
    const { project_root } = args;
    const scriptPath = join7(SCRIPTS_DIR2, "validate_docs_sync.py");
    const result = await executeShell(scriptPath, [project_root]);
    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : void 0
    };
  }
};

// src/tools/guardrails.ts
import { join as join8 } from "path";
var SCRIPTS_DIR3 = join8(import.meta.dirname, "..", "..", "scripts");
var checkGuardrailsTool = {
  definition: {
    name: "check_guardrails",
    description: "\u68C0\u67E5\u9879\u76EE\u62A4\u680F\u72B6\u6001\uFF08project_guardrails \u662F\u5426\u5B58\u5728\u3001\u662F\u5426\u6709\u6548\uFF09",
    parameters: {
      type: "object",
      properties: {
        project_root: {
          type: "string",
          description: "\u9879\u76EE\u6839\u76EE\u5F55\u8DEF\u5F84"
        },
        cached: {
          type: "boolean",
          description: "\u662F\u5426\u4F7F\u7528\u7F13\u5B58\uFF08\u9ED8\u8BA4 true\uFF09"
        }
      },
      required: ["project_root"]
    }
  },
  async execute(args) {
    const { project_root, cached } = args;
    const scriptPath = join8(SCRIPTS_DIR3, "check_project_guardrails.sh");
    const scriptArgs = [project_root];
    if (cached !== "false") {
      scriptArgs.push("--cached", "300");
    }
    const result = await executeShell(scriptPath, scriptArgs);
    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : void 0
    };
  }
};
var initGuardrailsTool = {
  definition: {
    name: "init_guardrails",
    description: "\u521D\u59CB\u5316\u9879\u76EE\u62A4\u680F\uFF08\u521B\u5EFA project_guardrails \u6587\u4EF6\uFF09",
    parameters: {
      type: "object",
      properties: {
        project_root: {
          type: "string",
          description: "\u9879\u76EE\u6839\u76EE\u5F55\u8DEF\u5F84"
        }
      },
      required: ["project_root"]
    }
  },
  async execute(args) {
    const { project_root } = args;
    const scriptPath = join8(SCRIPTS_DIR3, "init_project_guardrails.py");
    const result = await executePython(scriptPath, [project_root]);
    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : void 0
    };
  }
};

// src/tools/classifier.ts
import { join as join9 } from "path";
var SCRIPTS_DIR4 = join9(import.meta.dirname, "..", "..", "scripts");
var classifyTaskTool = {
  definition: {
    name: "classify_task",
    description: "\u5206\u7C7B\u4EFB\u52A1\u7C7B\u578B\u548C\u590D\u6742\u5EA6",
    parameters: {
      type: "object",
      properties: {
        user_input: {
          type: "string",
          description: "\u7528\u6237\u8F93\u5165\u7684\u4EFB\u52A1\u63CF\u8FF0"
        },
        project_root: {
          type: "string",
          description: "\u9879\u76EE\u6839\u76EE\u5F55\u8DEF\u5F84\uFF08\u53EF\u9009\uFF09"
        }
      },
      required: ["user_input"]
    }
  },
  async execute(args) {
    const { user_input, project_root } = args;
    const scriptPath = join9(SCRIPTS_DIR4, "classify_task.sh");
    const scriptArgs = [JSON.stringify(user_input)];
    if (project_root) {
      scriptArgs.push("--project-root", project_root);
    }
    const result = await executeShell(scriptPath, scriptArgs);
    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : void 0
    };
  }
};

// src/tools/filesystem.ts
import { readFileSync as readFileSync6, writeFileSync as writeFileSync4, existsSync as existsSync5, mkdirSync as mkdirSync4, readdirSync as readdirSync3, statSync as statSync2 } from "fs";
import { join as join10, resolve as resolve6, dirname } from "path";
var readFileTool = {
  definition: {
    name: "read_file",
    description: "\u8BFB\u53D6\u6587\u4EF6\u5185\u5BB9",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "\u6587\u4EF6\u8DEF\u5F84\uFF08\u7EDD\u5BF9\u6216\u76F8\u5BF9\u8DEF\u5F84\uFF09"
        },
        start_line: {
          type: "number",
          description: "\u8D77\u59CB\u884C\u53F7\uFF08\u4ECE1\u5F00\u59CB\uFF0C\u53EF\u9009\uFF09"
        },
        end_line: {
          type: "number",
          description: "\u7ED3\u675F\u884C\u53F7\uFF08\u53EF\u9009\uFF09"
        }
      },
      required: ["path"]
    }
  },
  async execute(args) {
    const { path, start_line, end_line } = args;
    const resolvedPath = resolve6(path);
    if (!existsSync5(resolvedPath)) {
      return {
        success: false,
        output: "",
        error: `\u6587\u4EF6\u4E0D\u5B58\u5728: ${resolvedPath}`
      };
    }
    try {
      const content = readFileSync6(resolvedPath, "utf-8");
      const lines = content.split("\n");
      let result;
      if (start_line || end_line) {
        const start = (start_line ? parseInt(String(start_line)) : 1) - 1;
        const end = end_line ? parseInt(String(end_line)) : lines.length;
        const selectedLines = lines.slice(start, end);
        result = selectedLines.map((line, i) => `${start + i + 1}: ${line}`).join("\n");
      } else {
        result = lines.map((line, i) => `${i + 1}: ${line}`).join("\n");
      }
      return {
        success: true,
        output: result
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        output: "",
        error: `\u8BFB\u53D6\u6587\u4EF6\u5931\u8D25: ${errorMessage}`
      };
    }
  }
};
var writeFileTool = {
  definition: {
    name: "write_file",
    description: "\u5199\u5165\u6587\u4EF6\u5185\u5BB9\uFF08\u521B\u5EFA\u65B0\u6587\u4EF6\u6216\u8986\u76D6\u5DF2\u6709\u6587\u4EF6\uFF09",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "\u6587\u4EF6\u8DEF\u5F84"
        },
        content: {
          type: "string",
          description: "\u6587\u4EF6\u5185\u5BB9"
        }
      },
      required: ["path", "content"]
    }
  },
  async execute(args) {
    const { path, content } = args;
    const resolvedPath = resolve6(path);
    try {
      const dir = dirname(resolvedPath);
      if (!existsSync5(dir)) {
        mkdirSync4(dir, { recursive: true });
      }
      writeFileSync4(resolvedPath, content, "utf-8");
      return {
        success: true,
        output: `\u6587\u4EF6\u5DF2\u5199\u5165: ${resolvedPath}`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        output: "",
        error: `\u5199\u5165\u6587\u4EF6\u5931\u8D25: ${errorMessage}`
      };
    }
  }
};
var editFileTool = {
  definition: {
    name: "edit_file",
    description: "\u7F16\u8F91\u6587\u4EF6\uFF08\u66FF\u6362\u6307\u5B9A\u5185\u5BB9\uFF09",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "\u6587\u4EF6\u8DEF\u5F84"
        },
        old_text: {
          type: "string",
          description: "\u8981\u66FF\u6362\u7684\u539F\u59CB\u6587\u672C"
        },
        new_text: {
          type: "string",
          description: "\u66FF\u6362\u540E\u7684\u65B0\u6587\u672C"
        }
      },
      required: ["path", "old_text", "new_text"]
    }
  },
  async execute(args) {
    const { path, old_text, new_text } = args;
    const resolvedPath = resolve6(path);
    if (!existsSync5(resolvedPath)) {
      return {
        success: false,
        output: "",
        error: `\u6587\u4EF6\u4E0D\u5B58\u5728: ${resolvedPath}`
      };
    }
    try {
      const content = readFileSync6(resolvedPath, "utf-8");
      if (!content.includes(old_text)) {
        return {
          success: false,
          output: "",
          error: "\u672A\u627E\u5230\u8981\u66FF\u6362\u7684\u6587\u672C"
        };
      }
      const newContent = content.replace(old_text, new_text);
      writeFileSync4(resolvedPath, newContent, "utf-8");
      return {
        success: true,
        output: `\u6587\u4EF6\u5DF2\u7F16\u8F91: ${resolvedPath}`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        output: "",
        error: `\u7F16\u8F91\u6587\u4EF6\u5931\u8D25: ${errorMessage}`
      };
    }
  }
};
var listFilesTool = {
  definition: {
    name: "list_files",
    description: "\u5217\u51FA\u76EE\u5F55\u4E0B\u7684\u6587\u4EF6\u548C\u5B50\u76EE\u5F55",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "\u76EE\u5F55\u8DEF\u5F84\uFF08\u9ED8\u8BA4\u5F53\u524D\u76EE\u5F55\uFF09"
        },
        recursive: {
          type: "boolean",
          description: "\u662F\u5426\u9012\u5F52\u5217\u51FA\uFF08\u9ED8\u8BA4 false\uFF09"
        }
      },
      required: []
    }
  },
  async execute(args) {
    const { path, recursive } = args;
    const resolvedPath = resolve6(path || ".");
    if (!existsSync5(resolvedPath)) {
      return {
        success: false,
        output: "",
        error: `\u76EE\u5F55\u4E0D\u5B58\u5728: ${resolvedPath}`
      };
    }
    try {
      const items = listDirectory(resolvedPath, String(recursive).toLowerCase() === "true");
      return {
        success: true,
        output: items.join("\n")
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        output: "",
        error: `\u5217\u51FA\u6587\u4EF6\u5931\u8D25: ${errorMessage}`
      };
    }
  }
};
var searchFilesTool = {
  definition: {
    name: "search_files",
    description: "\u5728\u6587\u4EF6\u4E2D\u641C\u7D22\u6587\u672C",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "\u641C\u7D22\u76EE\u5F55"
        },
        pattern: {
          type: "string",
          description: "\u641C\u7D22\u6A21\u5F0F\uFF08\u6B63\u5219\u8868\u8FBE\u5F0F\uFF09"
        },
        file_pattern: {
          type: "string",
          description: "\u6587\u4EF6\u540D\u6A21\u5F0F\uFF08\u5982 *.ts\uFF09"
        }
      },
      required: ["pattern"]
    }
  },
  async execute(args) {
    const { path, pattern, file_pattern } = args;
    const resolvedPath = resolve6(path || ".");
    try {
      const results = searchInFiles(resolvedPath, pattern, file_pattern);
      return {
        success: true,
        output: results.length > 0 ? results.join("\n") : "\u672A\u627E\u5230\u5339\u914D\u5185\u5BB9"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        output: "",
        error: `\u641C\u7D22\u5931\u8D25: ${errorMessage}`
      };
    }
  }
};
function listDirectory(dirPath, recursive, prefix = "") {
  const items = [];
  const entries = readdirSync3(dirPath);
  for (const entry of entries) {
    if (entry.startsWith(".") || entry === "node_modules" || entry === "dist") continue;
    const fullPath = join10(dirPath, entry);
    const stat = statSync2(fullPath);
    const isDir = stat.isDirectory();
    items.push(`${prefix}${isDir ? "\u{1F4C1}" : "\u{1F4C4}"} ${entry}`);
    if (recursive && isDir) {
      items.push(...listDirectory(fullPath, true, `${prefix}  `));
    }
  }
  return items;
}
function searchInFiles(dirPath, pattern, filePattern) {
  const results = [];
  const regex = new RegExp(pattern, "gi");
  function searchDir(currentDir) {
    const entries = readdirSync3(currentDir);
    for (const entry of entries) {
      if (entry.startsWith(".") || entry === "node_modules" || entry === "dist") continue;
      const fullPath = join10(currentDir, entry);
      const stat = statSync2(fullPath);
      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else {
        if (filePattern && !matchGlob(entry, filePattern)) continue;
        try {
          const content = readFileSync6(fullPath, "utf-8");
          const lines = content.split("\n");
          for (let i = 0; i < lines.length; i++) {
            if (regex.test(lines[i])) {
              const relativePath = fullPath.replace(dirPath, "").replace(/^\//, "");
              results.push(`${relativePath}:${i + 1}: ${lines[i].trim()}`);
            }
          }
        } catch {
        }
      }
    }
  }
  searchDir(dirPath);
  return results.slice(0, 50);
}
function matchGlob(filename, pattern) {
  const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${regexPattern}$`).test(filename);
}

// src/tools/command.ts
import { exec as exec2 } from "child_process";
import { promisify as promisify2 } from "util";
import { resolve as resolve7 } from "path";
var execAsync2 = promisify2(exec2);
var runCommandTool = {
  definition: {
    name: "run_command",
    description: "\u6267\u884C shell \u547D\u4EE4",
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "\u8981\u6267\u884C\u7684\u547D\u4EE4"
        },
        cwd: {
          type: "string",
          description: "\u5DE5\u4F5C\u76EE\u5F55\uFF08\u53EF\u9009\uFF09"
        },
        timeout: {
          type: "number",
          description: "\u8D85\u65F6\u65F6\u95F4\uFF08\u79D2\uFF0C\u9ED8\u8BA4 30\uFF09"
        }
      },
      required: ["command"]
    }
  },
  async execute(args) {
    const { command, cwd, timeout } = args;
    const resolvedCwd = cwd ? resolve7(cwd) : process.cwd();
    const timeoutMs = (timeout ? parseInt(String(timeout)) : 30) * 1e3;
    try {
      const { stdout, stderr } = await execAsync2(command, {
        cwd: resolvedCwd,
        timeout: timeoutMs,
        encoding: "utf-8",
        maxBuffer: 1024 * 1024 * 10
        // 10MB
      });
      return {
        success: true,
        output: stdout || stderr || "\u547D\u4EE4\u6267\u884C\u5B8C\u6210\uFF08\u65E0\u8F93\u51FA\uFF09"
      };
    } catch (error) {
      const execError = error;
      return {
        success: false,
        output: execError.stdout || "",
        error: execError.stderr || execError.message || "\u547D\u4EE4\u6267\u884C\u5931\u8D25"
      };
    }
  }
};
var runCommandWithOutputTool = {
  definition: {
    name: "run_command_with_output",
    description: "\u6267\u884C\u547D\u4EE4\u5E76\u83B7\u53D6\u8F93\u51FA\uFF08\u9002\u5408\u9700\u8981\u89E3\u6790\u8F93\u51FA\u7684\u573A\u666F\uFF09",
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "\u8981\u6267\u884C\u7684\u547D\u4EE4"
        },
        cwd: {
          type: "string",
          description: "\u5DE5\u4F5C\u76EE\u5F55"
        }
      },
      required: ["command"]
    }
  },
  async execute(args) {
    const { command, cwd } = args;
    const resolvedCwd = cwd ? resolve7(cwd) : process.cwd();
    try {
      const { stdout, stderr } = await execAsync2(command, {
        cwd: resolvedCwd,
        encoding: "utf-8"
      });
      return {
        success: true,
        output: stdout.trim() || stderr.trim() || ""
      };
    } catch (error) {
      const execError = error;
      return {
        success: false,
        output: execError.stdout?.trim() || "",
        error: execError.stderr?.trim() || execError.message || "\u547D\u4EE4\u6267\u884C\u5931\u8D25"
      };
    }
  }
};

// src/tools/index.ts
function registerAllTools() {
  toolRegistry.register(readFileTool);
  toolRegistry.register(writeFileTool);
  toolRegistry.register(editFileTool);
  toolRegistry.register(listFilesTool);
  toolRegistry.register(searchFilesTool);
  toolRegistry.register(runCommandTool);
  toolRegistry.register(runCommandWithOutputTool);
  toolRegistry.register(scanProjectTool);
  toolRegistry.register(detectProjectStateTool);
  toolRegistry.register(validateOutputTool);
  toolRegistry.register(validateDocsSyncTool);
  toolRegistry.register(checkGuardrailsTool);
  toolRegistry.register(initGuardrailsTool);
  toolRegistry.register(classifyTaskTool);
}

// src/cli/commands.ts
import * as readline from "readline";
import chalk4 from "chalk";

// src/cli/renderer.ts
import chalk3 from "chalk";
function renderBanner(version, model, projectRoot) {
  const lines = [
    chalk3.cyan("\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557"),
    chalk3.cyan("\u2551") + chalk3.bold("  Flutter Forge ") + chalk3.dim(`v${version}`) + "                    " + chalk3.cyan("\u2551"),
    chalk3.cyan("\u2551") + chalk3.dim("  \u6A21\u578B: ") + chalk3.yellow(model) + " ".repeat(Math.max(0, 30 - model.length)) + chalk3.cyan("\u2551"),
    chalk3.cyan("\u2551") + chalk3.dim("  \u9879\u76EE: ") + chalk3.white(truncate(projectRoot, 28)) + " ".repeat(Math.max(0, 30 - Math.min(projectRoot.length, 28))) + chalk3.cyan("\u2551"),
    chalk3.cyan("\u2551") + chalk3.dim("  \u8F93\u5165 /help \u67E5\u770B\u547D\u4EE4") + "                  " + chalk3.cyan("\u2551"),
    chalk3.cyan("\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D")
  ];
  return lines.join("\n");
}
function renderHelp() {
  const commands = [
    ["/help", "\u663E\u793A\u5E2E\u52A9\u4FE1\u606F"],
    ["/model", "\u6A21\u578B\u7BA1\u7406\uFF1A\u67E5\u770B/\u5207\u6362/\u914D\u7F6E/\u6DFB\u52A0\u6A21\u578B"],
    ["/model <name>", "\u5207\u6362\u6A21\u578B\uFF08\u672A\u914D\u7F6E\u65F6\u8FDB\u5165\u914D\u7F6E\uFF09"],
    ["/model <name> <key>", "\u5FEB\u6377\u914D\u7F6E\u6A21\u578B API Key"],
    ["/config", "\u67E5\u770B\u5F53\u524D\u914D\u7F6E"],
    ["/clear", "\u6E05\u7A7A\u5BF9\u8BDD\u4E0A\u4E0B\u6587"],
    ["/status", "\u663E\u793A\u5F53\u524D\u72B6\u6001"],
    ["/fast", "\u5207\u6362 ff-fast \u5FEB\u901F\u6A21\u5F0F"],
    ["/auto", "\u5207\u6362 ff-a \u5168\u81EA\u52A8\u6A21\u5F0F"],
    ["/session", "\u67E5\u770B\u5F53\u524D session \u4FE1\u606F"],
    ["/plugins", "\u67E5\u770B\u5DF2\u52A0\u8F7D\u63D2\u4EF6"],
    ["/mcp", "\u67E5\u770B MCP \u670D\u52A1\u5668\u72B6\u6001"],
    ["/security", "\u67E5\u770B\u5B89\u5168\u68C0\u67E5\u914D\u7F6E"],
    ["/learn", "\u5207\u6362\u5B66\u4E60\u6A21\u5F0F"],
    ["/review", "\u67E5\u770B\u4EE3\u7801\u5BA1\u67E5\u914D\u7F6E"],
    ["/hook", "\u67E5\u770B\u5DF2\u6CE8\u518C\u94A9\u5B50"],
    ["/exit", "\u9000\u51FA\u7A0B\u5E8F"]
  ];
  const lines = [
    chalk3.bold("\n\u53EF\u7528\u547D\u4EE4:"),
    ...commands.map(([cmd, desc]) => `  ${chalk3.cyan(cmd)}  ${chalk3.dim(desc)}`),
    "",
    chalk3.dim("\u63D0\u793A: \u76F4\u63A5\u8F93\u5165\u5185\u5BB9\u5F00\u59CB\u5BF9\u8BDD")
  ];
  return lines.join("\n");
}
function renderStatus(contextSummary, model, phase) {
  const lines = [
    chalk3.bold("\n\u5F53\u524D\u72B6\u6001:"),
    `  ${chalk3.dim("\u6A21\u578B:")} ${chalk3.yellow(model)}`,
    `  ${chalk3.dim("\u4E0A\u4E0B\u6587:")} ${contextSummary}`
  ];
  if (phase) {
    lines.push(`  ${chalk3.dim("\u9636\u6BB5:")} ${chalk3.green(phase)}`);
  }
  return lines.join("\n");
}
function renderError(error) {
  return chalk3.red(`
\u9519\u8BEF: ${error}`);
}
function renderSuccess(message) {
  return chalk3.green(`
\u2713 ${message}`);
}
function renderAssistantStart() {
  return chalk3.green("\n\u25B8 ");
}
function renderMarkdown(text) {
  const lines = text.split("\n");
  const result = [];
  let inCodeBlock = false;
  let codeLang = "";
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.trimStart().startsWith("```")) {
      if (inCodeBlock) {
        result.push(chalk3.dim("\u2514" + "\u2500".repeat(40)));
        inCodeBlock = false;
      } else {
        codeLang = line.trimStart().slice(3).trim();
        const label = codeLang ? ` ${chalk3.dim(codeLang)}` : "";
        result.push(chalk3.dim("\u250C" + "\u2500".repeat(40)) + label);
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      result.push(chalk3.dim("\u2502 ") + chalk3.green(line));
      continue;
    }
    if (/^#{1,3}\s/.test(line)) {
      const level = line.match(/^(#{1,3})/)[1].length;
      const text2 = line.replace(/^#{1,3}\s+/, "");
      if (level === 1) result.push(chalk3.bold.cyan(text2));
      else if (level === 2) result.push(chalk3.bold.blue(text2));
      else result.push(chalk3.bold.white(text2));
      continue;
    }
    line = line.replace(/\*\*(.+?)\*\*/g, (_, t) => chalk3.bold(t));
    line = line.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, (_, t) => chalk3.italic(t));
    line = line.replace(/`([^`]+)`/g, (_, t) => chalk3.bgGray.white(` ${t} `));
    line = line.replace(/~~(.+?)~~/g, (_, t) => chalk3.dim.strikethrough(t));
    if (/^\s*[-*+]\s/.test(line)) {
      line = line.replace(/^(\s*)([-*+])\s/, `$1${chalk3.cyan("\u2022")} `);
    }
    if (/^\s*\d+\.\s/.test(line)) {
      line = line.replace(/^(\s*)(\d+)\.\s/, `$1${chalk3.cyan("$2.")} `);
    }
    if (/^\s*>\s/.test(line)) {
      line = line.replace(/^(\s*)>\s/, chalk3.dim("\u2502 "));
      line = chalk3.dim(line);
    }
    if (/^[-*_]{3,}\s*$/.test(line.trim())) {
      line = chalk3.dim("\u2500".repeat(40));
    }
    result.push(line);
  }
  if (inCodeBlock) result.push(chalk3.dim("\u2514" + "\u2500".repeat(40)));
  return result.join("\n");
}
function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}

// src/cli/commands.ts
function ask(prompt) {
  const forge = globalThis.__forgeRL;
  forge?.pause();
  const qrl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve8) => {
    qrl.question(prompt, (answer) => {
      qrl.close();
      forge?.resume();
      resolve8(answer);
    });
  });
}
async function selectOption(prompt, options) {
  console.log(chalk4.bold(`
${prompt}`));
  options.forEach((opt, i) => {
    console.log(`  ${chalk4.cyan(i + 1 + "")}. ${opt}`);
  });
  console.log(chalk4.dim("  0. \u53D6\u6D88"));
  const answer = await ask(chalk4.cyan("\n> "));
  const num = parseInt(answer.trim());
  if (isNaN(num) || num < 0 || num > options.length) return null;
  return num === 0 ? null : num - 1;
}
async function promptInput(label) {
  const answer = await ask(chalk4.cyan(`${label} > `));
  return answer.trim() || null;
}
async function handleCommand(input, configManager2, contextManager2, aiClient, orchestrator) {
  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) return { handled: false };
  const [command, ...args] = trimmed.split(/\s+/);
  switch (command) {
    case "/help":
      return { handled: true, output: renderHelp() };
    case "/exit":
    case "/quit":
      return { handled: true, shouldExit: true, output: chalk4.dim("\n\u518D\u89C1\uFF01") };
    case "/model":
      return await handleModelCommand(args, configManager2, aiClient);
    case "/config":
      return handleConfigCommand(configManager2);
    case "/clear":
      contextManager2.clear();
      return { handled: true, output: renderSuccess("\u4E0A\u4E0B\u6587\u5DF2\u6E05\u7A7A") };
    case "/status":
      return { handled: true, output: renderStatus(contextManager2.getSummary(), aiClient.getModel()) };
    case "/fast":
      return handleFastCommand(orchestrator);
    case "/auto":
      return handleAutoCommand(orchestrator);
    case "/session":
      return handleSessionCommand(orchestrator);
    case "/plugins":
      return handlePluginsCommand(orchestrator);
    case "/mcp":
      return handleMCPCommand(args, orchestrator);
    case "/security":
      return handleSecurityCommand(args, orchestrator);
    case "/learn":
      return handleLearnCommand(orchestrator);
    case "/review":
      return handleReviewCommand(args, orchestrator);
    case "/hook":
      return handleHookCommand(args, orchestrator);
    default:
      return { handled: true, output: renderError(`\u672A\u77E5\u547D\u4EE4: ${command}
\u8F93\u5165 /help \u67E5\u770B\u53EF\u7528\u547D\u4EE4`) };
  }
}
async function handleModelCommand(args, cm, ai) {
  if (args.length >= 1) {
    const modelName = args[0];
    try {
      const model = cm.getModel(modelName);
      if (!model.api_key) {
        return { handled: true, output: renderError(`\u672A\u914D\u7F6E API Key\uFF0C\u8BF7\u5148\u7528 /model \u914D\u7F6E`) };
      }
      ai.setModel(model);
      cm.setDefaultModel(modelName);
      cm.save().catch(() => {
      });
      return { handled: true, output: renderSuccess(`\u5DF2\u5207\u6362\u5230\u6A21\u578B: ${modelName}`) };
    } catch {
      return { handled: true, output: renderError(`\u6A21\u578B "${modelName}" \u4E0D\u53EF\u7528`) };
    }
  }
  return await flowModelManager(cm, ai);
}
async function flowModelManager(cm, ai) {
  const config = cm.get();
  const isConfigured = cm.isConfigured();
  const provider = config.provider;
  const status = isConfigured ? chalk4.green("\u2713 \u5DF2\u914D\u7F6E") : chalk4.red("\u2717 \u672A\u914D\u7F6E");
  console.log(chalk4.bold(`
\u63D0\u4F9B\u5546: ${chalk4.cyan(provider.name)}`));
  console.log(`  ${chalk4.dim("Base URL:")} ${provider.base_url}`);
  console.log(`  ${chalk4.dim("API Key:")} ${status}`);
  const modelOptions = provider.models.map((m) => {
    const isDefault = m === config.models.default;
    return `${chalk4.cyan(m)}${isDefault ? chalk4.yellow(" [\u5F53\u524D]") : ""}`;
  });
  if (!isConfigured) {
    console.log(chalk4.yellow("\n\u8BF7\u5148\u914D\u7F6E API Key"));
    const apiKey = await promptInput("API Key");
    if (!apiKey) return { handled: true, output: chalk4.dim("\u5DF2\u53D6\u6D88") };
    cm.setApiKey(apiKey);
    cm.save().catch(() => {
    });
    const sel2 = await selectOption("\u9009\u62E9\u9ED8\u8BA4\u6A21\u578B:", modelOptions);
    if (sel2 !== null) {
      cm.setDefaultModel(provider.models[sel2]);
      ai.setModel(cm.getModel());
      cm.save().catch(() => {
      });
    }
    return { handled: true, output: renderSuccess(`\u5DF2\u914D\u7F6E API Key\uFF0C\u5F53\u524D\u6A21\u578B: ${cm.get().models.default}`) };
  }
  const actions = [
    ...modelOptions,
    chalk4.yellow("\u91CD\u65B0\u914D\u7F6E API Key"),
    chalk4.red("\u6E05\u9664 API Key")
  ];
  const sel = await selectOption("\u6A21\u578B\u7BA1\u7406:", actions);
  if (sel === null) return { handled: true, output: chalk4.dim("\u5DF2\u53D6\u6D88") };
  if (sel < provider.models.length) {
    const modelName = provider.models[sel];
    cm.setDefaultModel(modelName);
    ai.setModel(cm.getModel());
    cm.save().catch(() => {
    });
    return { handled: true, output: renderSuccess(`\u5DF2\u5207\u6362\u5230\u6A21\u578B: ${modelName}`) };
  }
  if (sel === provider.models.length) {
    const apiKey = await promptInput("API Key");
    if (!apiKey) return { handled: true, output: chalk4.dim("\u5DF2\u53D6\u6D88") };
    cm.setApiKey(apiKey);
    ai.setModel(cm.getModel());
    cm.save().catch(() => {
    });
    return { handled: true, output: renderSuccess("API Key \u5DF2\u66F4\u65B0") };
  }
  cm.setApiKey("");
  cm.save().catch(() => {
  });
  return { handled: true, output: renderSuccess("API Key \u5DF2\u6E05\u9664") };
}
function handleConfigCommand(cm) {
  const config = cm.get();
  const p = config.provider;
  const lines = [
    chalk4.bold("\n\u5F53\u524D\u914D\u7F6E:"),
    `  ${chalk4.dim("\u63D0\u4F9B\u5546:")} ${chalk4.cyan(p.name)}`,
    `  ${chalk4.dim("Base URL:")} ${p.base_url}`,
    `  ${chalk4.dim("API Key:")} ${p.api_key ? chalk4.green("\u2713 \u5DF2\u914D\u7F6E") : chalk4.red("\u2717 \u672A\u914D\u7F6E")}`,
    `  ${chalk4.dim("\u9ED8\u8BA4\u6A21\u578B:")} ${chalk4.yellow(config.models.default)}`,
    `  ${chalk4.dim("\u53EF\u7528\u6A21\u578B:")}`,
    ...p.models.map((m) => {
      const tag = m === config.models.default ? chalk4.yellow(" [\u5F53\u524D]") : "";
      return `    ${chalk4.cyan(m)}${tag}`;
    }),
    `  ${chalk4.dim("\u9879\u76EE\u8DEF\u5F84:")} ${config.project.root}`,
    `  ${chalk4.dim("\u914D\u7F6E\u6587\u4EF6:")} ${cm.getConfigPath()}`
  ];
  return { handled: true, output: lines.join("\n") };
}
function handleFastCommand(orchestrator) {
  if (!orchestrator) return { handled: true, output: renderError("\u7F16\u6392\u5668\u672A\u521D\u59CB\u5316") };
  if (orchestrator.isFastModeEnabled()) {
    orchestrator.disableFastMode();
    return { handled: true, output: renderSuccess("\u5DF2\u7981\u7528 ff-fast \u6A21\u5F0F") };
  }
  orchestrator.enableFastMode();
  return { handled: true, output: renderSuccess("\u5DF2\u542F\u7528 ff-fast \u6A21\u5F0F") };
}
function handleAutoCommand(orchestrator) {
  if (!orchestrator) return { handled: true, output: renderError("\u7F16\u6392\u5668\u672A\u521D\u59CB\u5316") };
  if (orchestrator.isAutonomousModeEnabled()) {
    orchestrator.disableAutonomousMode();
    return { handled: true, output: renderSuccess("\u5DF2\u7981\u7528 ff-a \u5168\u81EA\u52A8\u6A21\u5F0F") };
  }
  orchestrator.enableAutonomousMode();
  return { handled: true, output: renderSuccess("\u5DF2\u542F\u7528 ff-a \u5168\u81EA\u52A8\u6A21\u5F0F") };
}
function handleSessionCommand(orchestrator) {
  if (!orchestrator) return { handled: true, output: renderError("\u7F16\u6392\u5668\u672A\u521D\u59CB\u5316") };
  const info = orchestrator.getSessionInfo();
  if (!info) return { handled: true, output: chalk4.dim("\n\u65E0\u6D3B\u8DC3 session") };
  return { handled: true, output: [
    chalk4.bold("\nSession \u4FE1\u606F:"),
    `  ${chalk4.dim("ID:")} ${chalk4.cyan(info.id)}`,
    `  ${chalk4.dim("\u72B6\u6001:")} ${chalk4.yellow(info.state)}`,
    `  ${chalk4.dim("\u6A21\u5F0F:")} ${info.mode || chalk4.dim("\u672A\u8BBE\u7F6E")}`
  ].join("\n") };
}
function handlePluginsCommand(orchestrator) {
  if (!orchestrator) return { handled: true, output: renderError("\u7F16\u6392\u5668\u672A\u521D\u59CB\u5316") };
  const plugins = orchestrator.getPluginManager().getPlugins();
  if (plugins.length === 0) return { handled: true, output: chalk4.dim("\n\u65E0\u5DF2\u52A0\u8F7D\u63D2\u4EF6") };
  return { handled: true, output: [
    chalk4.bold("\n\u5DF2\u52A0\u8F7D\u63D2\u4EF6:"),
    ...plugins.map((p) => {
      const s = p.enabled ? chalk4.green("\u2713") : chalk4.red("\u2717");
      return `  ${s} ${chalk4.cyan(p.config.metadata.name)} ${chalk4.dim(`v${p.config.metadata.version}`)}`;
    })
  ].join("\n") };
}
function handleMCPCommand(args, orchestrator) {
  if (!orchestrator) return { handled: true, output: renderError("\u7F16\u6392\u5668\u672A\u521D\u59CB\u5316") };
  const servers = orchestrator.getMCPClient().getServers();
  if (servers.length === 0) return { handled: true, output: chalk4.dim("\n\u65E0\u5DF2\u8FDE\u63A5 MCP \u670D\u52A1\u5668") };
  return { handled: true, output: [
    chalk4.bold("\nMCP \u670D\u52A1\u5668:"),
    ...servers.map((s) => {
      const st = s.connected ? chalk4.green("\u2713") : chalk4.red("\u2717");
      return `  ${st} ${chalk4.cyan(s.id)} ${chalk4.dim(`(${s.tools.length} \u5DE5\u5177)`)}`;
    })
  ].join("\n") };
}
function handleSecurityCommand(args, orchestrator) {
  if (!orchestrator) return { handled: true, output: renderError("\u7F16\u6392\u5668\u672A\u521D\u59CB\u5316") };
  const config = orchestrator.getSecurityChecker().getConfig();
  return { handled: true, output: [
    chalk4.bold("\n\u5B89\u5168\u68C0\u67E5\u914D\u7F6E:"),
    `  ${chalk4.dim("\u542F\u7528:")} ${config.enabled ? chalk4.green("\u662F") : chalk4.red("\u5426")}`,
    `  ${chalk4.dim("\u4E25\u91CD\u6027\u9608\u503C:")} ${chalk4.yellow(config.severityThreshold)}`,
    `  ${chalk4.dim("\u68C0\u67E5\u7C7B\u522B:")} ${config.categories.length} \u4E2A`
  ].join("\n") };
}
function handleLearnCommand(orchestrator) {
  if (!orchestrator) return { handled: true, output: renderError("\u7F16\u6392\u5668\u672A\u521D\u59CB\u5316") };
  if (orchestrator.isLearningModeEnabled()) {
    orchestrator.disableLearningMode();
    return { handled: true, output: renderSuccess("\u5DF2\u7981\u7528\u5B66\u4E60\u6A21\u5F0F") };
  }
  orchestrator.enableLearningMode();
  return { handled: true, output: renderSuccess("\u5DF2\u542F\u7528\u5B66\u4E60\u6A21\u5F0F") };
}
function handleReviewCommand(args, orchestrator) {
  if (!orchestrator) return { handled: true, output: renderError("\u7F16\u6392\u5668\u672A\u521D\u59CB\u5316") };
  const config = orchestrator.getConfidenceScorer().getConfig();
  return { handled: true, output: [
    chalk4.bold("\n\u4EE3\u7801\u5BA1\u67E5\u914D\u7F6E:"),
    `  ${chalk4.dim("\u7F6E\u4FE1\u5EA6\u9608\u503C:")} ${chalk4.yellow(config.confidenceThreshold)}`,
    `  ${chalk4.dim("\u6700\u5927\u95EE\u9898\u6570:")} ${config.maxIssues}`
  ].join("\n") };
}
function handleHookCommand(args, orchestrator) {
  if (!orchestrator) return { handled: true, output: renderError("\u7F16\u6392\u5668\u672A\u521D\u59CB\u5316") };
  const hooks = orchestrator.getHookManager().getHooks();
  if (hooks.length === 0) return { handled: true, output: chalk4.dim("\n\u65E0\u5DF2\u6CE8\u518C\u94A9\u5B50") };
  return { handled: true, output: [
    chalk4.bold("\n\u5DF2\u6CE8\u518C\u94A9\u5B50:"),
    ...hooks.map((h) => {
      const s = h.enabled ? chalk4.green("\u2713") : chalk4.red("\u2717");
      return `  ${s} ${chalk4.cyan(h.name)} ${chalk4.dim(`[${h.event}]`)}`;
    })
  ].join("\n") };
}

// src/cli/repl.ts
import ora from "ora";

// src/version.ts
var VERSION = "0.5.0";

// src/cli/repl.ts
async function startREPL() {
  process.on("uncaughtException", (err) => {
    console.error(chalk5.red(`
\u672A\u6355\u83B7\u5F02\u5E38: ${err.message}`));
    console.error(err.stack);
  });
  process.on("unhandledRejection", (reason) => {
    console.error(chalk5.red(`
\u672A\u5904\u7406\u7684\u62D2\u7EDD: ${reason}`));
    if (reason instanceof Error) console.error(reason.stack);
  });
  const config = await configManager.load();
  const currentModel = configManager.getModel();
  const aiClient = new AIClient(currentModel);
  registerAllTools();
  const orchestrator = new AgentOrchestrator(
    aiClient,
    contextManager,
    toolRegistry,
    config.project.root
  );
  contextManager.setSystemPrompt(
    `\u4F60\u662F Flutter Forge\uFF0C\u4E00\u4E2A\u4E13\u4E1A\u7684 Flutter \u5F00\u53D1\u52A9\u624B\u3002\u4F60\u5E2E\u52A9\u7528\u6237\u5B8C\u6210 Flutter \u9879\u76EE\u7684\u5F00\u53D1\u4EFB\u52A1\uFF0C\u5305\u62EC\u9700\u6C42\u5206\u6790\u3001\u65B9\u6848\u8BBE\u8BA1\u3001\u4EE3\u7801\u5B9E\u73B0\u548C\u9A8C\u8BC1\u3002
\u4F60\u9075\u5FAA\u7ED3\u6784\u5316\u5DE5\u4F5C\u6D41\uFF1AS1 \u9700\u6C42\u5206\u6790 \u2192 S2 \u65B9\u6848\u8BBE\u8BA1 \u2192 S3 \u4EFB\u52A1\u62C6\u5206\uFF08\u53EF\u9009\uFF09\u2192 S4 \u5B9E\u73B0 \u2192 S5 \u9A8C\u8BC1\u3002
\u4F60\u53EF\u4EE5\u4F7F\u7528\u5DE5\u5177\u6765\u8BFB\u5199\u6587\u4EF6\u3001\u6267\u884C\u547D\u4EE4\u3001\u626B\u63CF\u9879\u76EE\u7B49\u3002
\u8BF7\u7528\u4E2D\u6587\u56DE\u590D\u3002`
  );
  console.log(renderBanner(VERSION, currentModel.name, config.project.root));
  if (!configManager.isConfigured()) {
    console.log(chalk5.yellow("\n\u26A0 \u672A\u914D\u7F6E API Key"));
    console.log(chalk5.dim("\u4F7F\u7528 /model \u8FDB\u5165\u4EA4\u4E92\u5F0F\u914D\u7F6E"));
  }
  const stripAnsi = (s) => s.replace(/\x1B\[[0-9;]*m/g, "");
  function printInputBar() {
    const w = process.stdout.columns || 80;
    const modelName = aiClient.getModel() || configManager.get().models.default;
    const pct = Math.min(100, Math.round(contextManager.getLength() / 100 * 100));
    const pctColor = pct > 80 ? chalk5.red : pct > 50 ? chalk5.yellow : chalk5.green;
    const sep = chalk5.dim("\u2500".repeat(w));
    const left = ` ${chalk5.yellow(modelName)}`;
    const right = `\u4E0A\u4E0B\u6587: ${pctColor(pct + "%")} `;
    const gap = Math.max(1, w - stripAnsi(left).length - stripAnsi(right).length - 1);
    const statusLine = left + " ".repeat(gap) + "\u2502" + right;
    console.log(sep);
    console.log(statusLine);
  }
  const rl = readline2.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk5.cyan("\u276F ")
  });
  printInputBar();
  rl.prompt();
  let sigintState = 0;
  function pauseRL() {
    rl.pause();
  }
  function resumeRL() {
    rl.resume();
  }
  globalThis.__forgeRL = { pause: pauseRL, resume: resumeRL };
  rl.on("line", async (line) => {
    sigintState = 0;
    const input = line.trim();
    if (!input) {
      printInputBar();
      rl.prompt();
      return;
    }
    try {
      const result = await handleCommand(input, configManager, contextManager, aiClient, orchestrator);
      if (result.handled) {
        if (result.output) console.log(result.output);
        if (result.shouldExit) {
          rl.close();
          return;
        }
        printInputBar();
        rl.prompt();
        return;
      }
      if (!configManager.isConfigured()) {
        console.log(renderError("\u672A\u914D\u7F6E API Key\n\u4F7F\u7528 /model \u8FDB\u5165\u4EA4\u4E92\u5F0F\u914D\u7F6E"));
        printInputBar();
        rl.prompt();
        return;
      }
      let spinner = null;
      try {
        spinner = ora({ text: chalk5.dim("\u601D\u8003\u4E2D..."), spinner: "dots", color: "cyan", discardStdin: false }).start();
        const agentResult = await orchestrator.execute(input);
        if (spinner.isSpinning) spinner.stop();
        process.stdout.write(renderAssistantStart());
        if (agentResult.success) {
          if (agentResult.output) {
            console.log(renderMarkdown(agentResult.output));
          }
        } else {
          console.log(renderError(agentResult.error || "\u6267\u884C\u5931\u8D25"));
        }
      } catch (execError) {
        if (spinner?.isSpinning) spinner.stop();
        console.log(renderError(execError instanceof Error ? execError.message : String(execError)));
      }
      try {
        printInputBar();
        rl.prompt();
      } catch {
      }
    } catch (err) {
      console.log(renderError(err instanceof Error ? err.message : String(err)));
      try {
        printInputBar();
        rl.prompt();
      } catch {
      }
    }
  });
  process.stdin.on("end", () => {
    console.error(chalk5.red("\nstdin \u5DF2\u5173\u95ED"));
  });
  rl.on("close", () => {
    if (sigintState >= 1) {
      process.stdout.write(chalk5.dim("\n\u518D\u89C1\uFF01\n"));
    } else {
      process.stdout.write(chalk5.dim("\n(readline \u5DF2\u5173\u95ED)\n"));
    }
    process.exit(0);
  });
  rl.on("error", (err) => {
    console.error(chalk5.red(`
readline \u9519\u8BEF: ${err.message}`));
  });
  rl.on("SIGINT", () => {
    if (sigintState >= 1) {
      rl.close();
    } else {
      sigintState = 1;
      console.log(chalk5.dim("\n(\u518D\u6309\u4E00\u6B21 Ctrl+C \u9000\u51FA\uFF0C\u6216\u8F93\u5165 /exit)"));
      printInputBar();
      rl.prompt();
    }
  });
}

// src/main.ts
startREPL().catch(console.error);
//# sourceMappingURL=main.js.map