#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/cli/theme.ts
import chalk4 from "chalk";
function getTheme() {
  return currentTheme;
}
function getThemeName() {
  return currentThemeName;
}
function setTheme(name) {
  currentThemeName = name;
  currentTheme = themes[name];
}
function getAvailableThemes() {
  return Object.keys(themes);
}
var darkTheme, lightTheme, ansiTheme, themes, currentThemeName, currentTheme;
var init_theme = __esm({
  "src/cli/theme.ts"() {
    "use strict";
    darkTheme = {
      claude: chalk4.hex("#E8A0BF"),
      // 粉紫色
      claudeShimmer: chalk4.hex("#F0C0D0"),
      // 浅粉紫
      text: chalk4.white,
      inverseText: chalk4.black,
      subtle: chalk4.gray,
      inactive: chalk4.dim.gray,
      success: chalk4.green,
      error: chalk4.red,
      warning: chalk4.yellow,
      promptBorder: chalk4.hex("#E8A0BF"),
      promptBorderShimmer: chalk4.hex("#F0C0D0"),
      background: chalk4.bgBlack,
      permission: chalk4.hex("#FFD700"),
      // 金色
      planMode: chalk4.hex("#87CEEB"),
      // 天蓝色
      ide: chalk4.hex("#98FB98"),
      // 浅绿色
      userMessageBackground: chalk4.bgHex("#1A1A2E"),
      bashMessageBackgroundColor: chalk4.bgHex("#16213E"),
      fastMode: chalk4.hex("#FF6B6B"),
      // 红色
      fastModeShimmer: chalk4.hex("#FF8E8E"),
      // 浅红色
      diffAdded: chalk4.green,
      diffRemoved: chalk4.red,
      diffAddedDimmed: chalk4.dim.green,
      diffRemovedDimmed: chalk4.dim.red
    };
    lightTheme = {
      claude: chalk4.hex("#8B5CF6"),
      // 紫色
      claudeShimmer: chalk4.hex("#A78BFA"),
      // 浅紫色
      text: chalk4.black,
      inverseText: chalk4.white,
      subtle: chalk4.gray,
      inactive: chalk4.dim.gray,
      success: chalk4.green,
      error: chalk4.red,
      warning: chalk4.yellow,
      promptBorder: chalk4.hex("#8B5CF6"),
      promptBorderShimmer: chalk4.hex("#A78BFA"),
      background: chalk4.bgWhite,
      permission: chalk4.hex("#D97706"),
      // 橙色
      planMode: chalk4.hex("#2563EB"),
      // 蓝色
      ide: chalk4.hex("#059669"),
      // 绿色
      userMessageBackground: chalk4.bgHex("#F3F4F6"),
      bashMessageBackgroundColor: chalk4.bgHex("#E5E7EB"),
      fastMode: chalk4.hex("#DC2626"),
      // 红色
      fastModeShimmer: chalk4.hex("#EF4444"),
      // 浅红色
      diffAdded: chalk4.green,
      diffRemoved: chalk4.red,
      diffAddedDimmed: chalk4.dim.green,
      diffRemovedDimmed: chalk4.dim.red
    };
    ansiTheme = {
      claude: chalk4.cyan,
      claudeShimmer: chalk4.cyanBright,
      text: chalk4.white,
      inverseText: chalk4.black,
      subtle: chalk4.gray,
      inactive: chalk4.dim,
      success: chalk4.green,
      error: chalk4.red,
      warning: chalk4.yellow,
      promptBorder: chalk4.cyan,
      promptBorderShimmer: chalk4.cyanBright,
      background: chalk4.bgBlack,
      permission: chalk4.yellow,
      planMode: chalk4.blue,
      ide: chalk4.green,
      userMessageBackground: chalk4.bgBlue,
      bashMessageBackgroundColor: chalk4.bgCyan,
      fastMode: chalk4.red,
      fastModeShimmer: chalk4.redBright,
      diffAdded: chalk4.green,
      diffRemoved: chalk4.red,
      diffAddedDimmed: chalk4.dim,
      diffRemovedDimmed: chalk4.dim
    };
    themes = {
      dark: darkTheme,
      light: lightTheme,
      "light-daltonized": lightTheme,
      // 简化实现
      "dark-daltonized": darkTheme,
      // 简化实现
      "light-ansi": ansiTheme,
      "dark-ansi": ansiTheme
    };
    currentThemeName = "dark";
    currentTheme = darkTheme;
  }
});

// src/cli/structured-edit.ts
var structured_edit_exports = {};
__export(structured_edit_exports, {
  DiffGenerator: () => DiffGenerator,
  LintChecker: () => LintChecker,
  TestRunner: () => TestRunner,
  createDiffGenerator: () => createDiffGenerator,
  createLintChecker: () => createLintChecker,
  createTestRunner: () => createTestRunner,
  default: () => structured_edit_default,
  diffGenerator: () => diffGenerator,
  lintChecker: () => lintChecker,
  testRunner: () => testRunner
});
function createDiffGenerator() {
  return new DiffGenerator();
}
function createLintChecker() {
  return new LintChecker();
}
function createTestRunner() {
  return new TestRunner();
}
var DiffGenerator, LintChecker, TestRunner, diffGenerator, lintChecker, testRunner, structured_edit_default;
var init_structured_edit = __esm({
  "src/cli/structured-edit.ts"() {
    "use strict";
    init_theme();
    DiffGenerator = class {
      /**
       * 生成文件 Diff
       */
      generateDiff(oldContent, newContent, filePath) {
        const oldLines = oldContent.split("\n");
        const newLines = newContent.split("\n");
        const hunks = this.computeDiff(oldLines, newLines);
        let type = "modify";
        if (oldContent === "") {
          type = "add";
        } else if (newContent === "") {
          type = "remove";
        }
        return {
          filePath,
          hunks,
          oldContent,
          newContent,
          type
        };
      }
      /**
       * 计算 Diff
       */
      computeDiff(oldLines, newLines) {
        const hunks = [];
        let currentHunk = null;
        const maxLines = Math.max(oldLines.length, newLines.length);
        let oldIndex = 0;
        let newIndex = 0;
        while (oldIndex < oldLines.length || newIndex < newLines.length) {
          const oldLine = oldLines[oldIndex];
          const newLine = newLines[newIndex];
          if (oldIndex >= oldLines.length) {
            if (!currentHunk) {
              currentHunk = {
                oldStart: oldIndex + 1,
                oldLines: 0,
                newStart: newIndex + 1,
                newLines: 0,
                lines: []
              };
            }
            currentHunk.lines.push({
              type: "add",
              content: newLine,
              newLineNumber: newIndex + 1
            });
            currentHunk.newLines++;
            newIndex++;
          } else if (newIndex >= newLines.length) {
            if (!currentHunk) {
              currentHunk = {
                oldStart: oldIndex + 1,
                oldLines: 0,
                newStart: newIndex + 1,
                newLines: 0,
                lines: []
              };
            }
            currentHunk.lines.push({
              type: "remove",
              content: oldLine,
              oldLineNumber: oldIndex + 1
            });
            currentHunk.oldLines++;
            oldIndex++;
          } else if (oldLine === newLine) {
            if (currentHunk) {
              currentHunk.lines.push({
                type: "context",
                content: oldLine,
                oldLineNumber: oldIndex + 1,
                newLineNumber: newIndex + 1
              });
              currentHunk.oldLines++;
              currentHunk.newLines++;
              if (currentHunk.lines.filter((l) => l.type !== "context").length === 0) {
                hunks.push(currentHunk);
                currentHunk = null;
              }
            }
            oldIndex++;
            newIndex++;
          } else {
            if (!currentHunk) {
              currentHunk = {
                oldStart: oldIndex + 1,
                oldLines: 0,
                newStart: newIndex + 1,
                newLines: 0,
                lines: []
              };
            }
            currentHunk.lines.push({
              type: "remove",
              content: oldLine,
              oldLineNumber: oldIndex + 1
            });
            currentHunk.lines.push({
              type: "add",
              content: newLine,
              newLineNumber: newIndex + 1
            });
            currentHunk.oldLines++;
            currentHunk.newLines++;
            oldIndex++;
            newIndex++;
          }
        }
        if (currentHunk) {
          hunks.push(currentHunk);
        }
        return hunks;
      }
      /**
       * 渲染 Diff
       */
      renderDiff(diff) {
        const theme = getTheme();
        const lines = [];
        lines.push(theme.claude(`--- ${diff.filePath}`));
        lines.push(theme.claude(`+++ ${diff.filePath}`));
        for (const hunk of diff.hunks) {
          lines.push(theme.subtle(`@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`));
          for (const line of hunk.lines) {
            switch (line.type) {
              case "add":
                lines.push(theme.success(`+ ${line.content}`));
                break;
              case "remove":
                lines.push(theme.error(`- ${line.content}`));
                break;
              case "context":
                lines.push(`  ${line.content}`);
                break;
            }
          }
        }
        return lines.join("\n");
      }
      /**
       * 统计 Diff
       */
      getStats(diff) {
        let additions = 0;
        let deletions = 0;
        for (const hunk of diff.hunks) {
          for (const line of hunk.lines) {
            if (line.type === "add") additions++;
            if (line.type === "remove") deletions++;
          }
        }
        return {
          additions,
          deletions,
          changes: additions + deletions
        };
      }
    };
    LintChecker = class {
      /**
       * 检查 TypeScript 代码
       */
      checkTypeScript(content, filePath) {
        const results = [];
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineNum = i + 1;
          if (line.includes("console.log")) {
            results.push({
              filePath,
              line: lineNum,
              column: line.indexOf("console.log") + 1,
              severity: "warning",
              message: "Avoid using console.log in production code",
              rule: "no-console"
            });
          }
          if (line.includes(": any")) {
            results.push({
              filePath,
              line: lineNum,
              column: line.indexOf(": any") + 1,
              severity: "warning",
              message: 'Avoid using "any" type',
              rule: "no-any"
            });
          }
          if (line.match(/(?:const|let|var)\s+\w+\s*=/) && !line.includes("//")) {
          }
          if (line.trim().endsWith(";") && !line.trim().startsWith("//")) {
          }
        }
        return results;
      }
      /**
       * 检查 Dart 代码
       */
      checkDart(content, filePath) {
        const results = [];
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineNum = i + 1;
          if (line.includes("print(")) {
            results.push({
              filePath,
              line: lineNum,
              column: line.indexOf("print(") + 1,
              severity: "warning",
              message: "Avoid using print in production code",
              rule: "avoid_print"
            });
          }
          if (line.includes("dynamic ")) {
            results.push({
              filePath,
              line: lineNum,
              column: line.indexOf("dynamic ") + 1,
              severity: "info",
              message: "Consider using a more specific type",
              rule: "avoid_dynamic"
            });
          }
        }
        return results;
      }
      /**
       * 渲染 Lint 结果
       */
      renderResults(results) {
        const theme = getTheme();
        const lines = [];
        if (results.length === 0) {
          lines.push(theme.success("\u2713 No issues found"));
          return lines.join("\n");
        }
        const byFile = /* @__PURE__ */ new Map();
        for (const result of results) {
          const fileResults = byFile.get(result.filePath) || [];
          fileResults.push(result);
          byFile.set(result.filePath, fileResults);
        }
        for (const [filePath, fileResults] of byFile) {
          lines.push(theme.text.bold(`
${filePath}`));
          for (const result of fileResults) {
            const severityIcon = this.getSeverityIcon(result.severity);
            const severityColor = this.getSeverityColor(result.severity);
            const location = `${result.line}:${result.column}`;
            const rule = result.rule ? theme.subtle(` (${result.rule})`) : "";
            lines.push(`  ${severityColor(severityIcon)} ${theme.subtle(location)} ${result.message}${rule}`);
          }
        }
        const errorCount = results.filter((r) => r.severity === "error").length;
        const warningCount = results.filter((r) => r.severity === "warning").length;
        const infoCount = results.filter((r) => r.severity === "info").length;
        lines.push("");
        lines.push(theme.text.bold("Summary:"));
        if (errorCount > 0) lines.push(theme.error(`  ${errorCount} error(s)`));
        if (warningCount > 0) lines.push(theme.warning(`  ${warningCount} warning(s)`));
        if (infoCount > 0) lines.push(theme.subtle(`  ${infoCount} info(s)`));
        return lines.join("\n");
      }
      getSeverityIcon(severity) {
        switch (severity) {
          case "error":
            return "\u2717";
          case "warning":
            return "\u26A0";
          case "info":
            return "\u2139";
          case "hint":
            return "\u{1F4A1}";
        }
      }
      getSeverityColor(severity) {
        const theme = getTheme();
        switch (severity) {
          case "error":
            return theme.error;
          case "warning":
            return theme.warning;
          case "info":
            return theme.subtle;
          case "hint":
            return theme.subtle;
        }
      }
    };
    TestRunner = class {
      /**
       * 解析 Jest 输出
       */
      parseJestOutput(output) {
        const tests = [];
        const lines = output.split("\n");
        let currentTest = null;
        for (const line of lines) {
          const passMatch = line.match(/✓\s+(.+?)\s+\((\d+)\s*ms\)/);
          const failMatch = line.match(/✗\s+(.+?)(?:\s+\((\d+)\s*ms\))?/);
          const skipMatch = line.match(/○\s+(.+?)/);
          if (passMatch) {
            tests.push({
              name: passMatch[1],
              status: "passed",
              duration: parseInt(passMatch[2])
            });
          } else if (failMatch) {
            currentTest = {
              name: failMatch[1],
              status: "failed",
              duration: failMatch[2] ? parseInt(failMatch[2]) : void 0
            };
          } else if (skipMatch) {
            tests.push({
              name: skipMatch[1],
              status: "skipped"
            });
          } else if (currentTest && line.trim().startsWith("Error:")) {
            currentTest.error = line.trim();
            tests.push(currentTest);
            currentTest = null;
          }
        }
        if (currentTest) {
          tests.push(currentTest);
        }
        const passed = tests.filter((t) => t.status === "passed").length;
        const failed = tests.filter((t) => t.status === "failed").length;
        const skipped = tests.filter((t) => t.status === "skipped").length;
        return {
          name: "Test Suite",
          tests,
          passed,
          failed,
          skipped
        };
      }
      /**
       * 解析 Dart/Flutter test 输出
       */
      parseDartTestOutput(output) {
        const tests = [];
        const lines = output.split("\n");
        for (const line of lines) {
          const passMatch = line.match(/✓\s+(.+?)(?:\s+(\d+)ms)?/);
          const failMatch = line.match(/✗\s+(.+?)(?:\s+(\d+)ms)?/);
          const skipMatch = line.match(/○\s+(.+?)/);
          if (passMatch) {
            tests.push({
              name: passMatch[1],
              status: "passed",
              duration: passMatch[2] ? parseInt(passMatch[2]) : void 0
            });
          } else if (failMatch) {
            tests.push({
              name: failMatch[1],
              status: "failed",
              duration: failMatch[2] ? parseInt(failMatch[2]) : void 0
            });
          } else if (skipMatch) {
            tests.push({
              name: skipMatch[1],
              status: "skipped"
            });
          }
        }
        const passed = tests.filter((t) => t.status === "passed").length;
        const failed = tests.filter((t) => t.status === "failed").length;
        const skipped = tests.filter((t) => t.status === "skipped").length;
        return {
          name: "Dart Test Suite",
          tests,
          passed,
          failed,
          skipped
        };
      }
      /**
       * 渲染测试结果
       */
      renderResults(suite) {
        const theme = getTheme();
        const lines = [];
        lines.push(theme.text.bold(`
${suite.name}`));
        lines.push(theme.inactive("\u2500".repeat(40)));
        for (const test of suite.tests) {
          const icon = this.getStatusIcon(test.status);
          const color = this.getStatusColor(test.status);
          const duration = test.duration ? theme.subtle(` (${test.duration}ms)`) : "";
          lines.push(`  ${color(icon)} ${test.name}${duration}`);
          if (test.error) {
            lines.push(theme.error(`    ${test.error}`));
          }
        }
        lines.push("");
        lines.push(theme.text.bold("Summary:"));
        lines.push(theme.success(`  \u2713 ${suite.passed} passed`));
        if (suite.failed > 0) {
          lines.push(theme.error(`  \u2717 ${suite.failed} failed`));
        }
        if (suite.skipped > 0) {
          lines.push(theme.subtle(`  \u25CB ${suite.skipped} skipped`));
        }
        return lines.join("\n");
      }
      getStatusIcon(status) {
        switch (status) {
          case "passed":
            return "\u2713";
          case "failed":
            return "\u2717";
          case "skipped":
            return "\u25CB";
          case "pending":
            return "\u25CC";
        }
      }
      getStatusColor(status) {
        const theme = getTheme();
        switch (status) {
          case "passed":
            return theme.success;
          case "failed":
            return theme.error;
          case "skipped":
            return theme.subtle;
          case "pending":
            return theme.warning;
        }
      }
    };
    diffGenerator = createDiffGenerator();
    lintChecker = createLintChecker();
    testRunner = createTestRunner();
    structured_edit_default = {
      DiffGenerator,
      LintChecker,
      TestRunner,
      createDiffGenerator,
      createLintChecker,
      createTestRunner,
      diffGenerator,
      lintChecker,
      testRunner
    };
  }
});

// src/cli/tree-sitter-parser.ts
var tree_sitter_parser_exports = {};
__export(tree_sitter_parser_exports, {
  TreeSitterParserManager: () => TreeSitterParserManager,
  createTreeSitterParserManager: () => createTreeSitterParserManager,
  default: () => tree_sitter_parser_default,
  treeSitterParserManager: () => treeSitterParserManager
});
function createTreeSitterParserManager() {
  return new TreeSitterParserManager();
}
var TreeSitterParserManager, treeSitterParserManager, tree_sitter_parser_default;
var init_tree_sitter_parser = __esm({
  "src/cli/tree-sitter-parser.ts"() {
    "use strict";
    TreeSitterParserManager = class {
      parser = null;
      languages = /* @__PURE__ */ new Map();
      initialized = false;
      /**
       * 初始化解析器
       */
      async initialize() {
        if (this.initialized) return;
        try {
          const TreeSitter = __require("tree-sitter");
          this.parser = new TreeSitter();
          await this.loadLanguages();
          this.initialized = true;
        } catch (error) {
          console.error("\u521D\u59CB\u5316 tree-sitter \u5931\u8D25:", error);
          throw error;
        }
      }
      /**
       * 加载语言 grammar
       */
      async loadLanguages() {
        const languageConfigs = [
          {
            name: "typescript",
            extensions: [".ts", ".tsx"],
            module: "tree-sitter-typescript",
            nodeTypes: {
              function: ["function_declaration", "arrow_function", "function"],
              class: ["class_declaration", "class"],
              method: ["method_definition", "method"],
              variable: ["variable_declaration", "lexical_declaration", "variable"],
              import: ["import_statement", "import"],
              export: ["export_statement", "export"],
              interface: ["interface_declaration", "interface"],
              type: ["type_alias_declaration", "type"],
              enum: ["enum_declaration", "enum"],
              parameter: ["required_parameter", "optional_parameter", "parameter"],
              return_type: ["type_annotation", "return_type"]
            }
          },
          {
            name: "javascript",
            extensions: [".js", ".jsx"],
            module: "tree-sitter-javascript",
            nodeTypes: {
              function: ["function_declaration", "arrow_function", "function"],
              class: ["class_declaration", "class"],
              method: ["method_definition", "method"],
              variable: ["variable_declaration", "lexical_declaration", "variable"],
              import: ["import_statement", "import"],
              export: ["export_statement", "export"],
              interface: [],
              type: [],
              enum: [],
              parameter: ["required_parameter", "optional_parameter", "parameter"],
              return_type: []
            }
          },
          {
            name: "java",
            extensions: [".java"],
            module: "tree-sitter-java",
            nodeTypes: {
              function: ["method_declaration", "constructor_declaration"],
              class: ["class_declaration"],
              method: ["method_declaration"],
              variable: ["field_declaration", "local_variable_declaration"],
              import: ["import_declaration"],
              export: [],
              interface: ["interface_declaration"],
              type: [],
              enum: ["enum_declaration"],
              parameter: ["formal_parameter"],
              return_type: ["type"]
            }
          },
          {
            name: "swift",
            extensions: [".swift"],
            module: "tree-sitter-swift",
            nodeTypes: {
              function: ["function_declaration"],
              class: ["class_declaration"],
              method: ["function_declaration"],
              variable: ["property_declaration", "variable_declaration"],
              import: ["import_declaration"],
              export: [],
              interface: ["protocol_declaration"],
              type: ["type_alias_declaration"],
              enum: ["enum_declaration"],
              parameter: ["parameter"],
              return_type: ["type_annotation"]
            }
          },
          {
            name: "dart",
            extensions: [".dart"],
            module: "tree-sitter-dart",
            nodeTypes: {
              function: ["function_declaration", "method_declaration"],
              class: ["class_declaration"],
              method: ["method_declaration"],
              variable: ["field_declaration", "variable_declaration"],
              import: ["import_specification"],
              export: [],
              interface: [],
              type: ["type_alias"],
              enum: ["enum_declaration"],
              parameter: ["formal_parameter"],
              return_type: ["type_annotation"]
            }
          },
          {
            name: "python",
            extensions: [".py"],
            module: "tree-sitter-python",
            nodeTypes: {
              function: ["function_definition"],
              class: ["class_definition"],
              method: ["function_definition"],
              variable: ["assignment", "augmented_assignment"],
              import: ["import_statement", "import_from_statement"],
              export: [],
              interface: [],
              type: [],
              enum: [],
              parameter: ["parameters", "default_parameter", "typed_parameter"],
              return_type: ["type"]
            }
          },
          {
            name: "go",
            extensions: [".go"],
            module: "tree-sitter-go",
            nodeTypes: {
              function: ["function_declaration", "method_declaration"],
              class: ["type_declaration"],
              method: ["method_declaration"],
              variable: ["var_declaration", "short_var_declaration"],
              import: ["import_declaration"],
              export: [],
              interface: ["interface_type"],
              type: ["type_declaration"],
              enum: [],
              parameter: ["parameter_declaration"],
              return_type: ["type"]
            }
          },
          {
            name: "rust",
            extensions: [".rs"],
            module: "tree-sitter-rust",
            nodeTypes: {
              function: ["function_item"],
              class: ["impl_item", "struct_item"],
              method: ["function_item"],
              variable: ["let_declaration", "const_item", "static_item"],
              import: ["use_declaration"],
              export: [],
              interface: ["trait_item"],
              type: ["type_alias"],
              enum: ["enum_item"],
              parameter: ["parameter"],
              return_type: ["type"]
            }
          },
          {
            name: "ruby",
            extensions: [".rb"],
            module: "tree-sitter-ruby",
            nodeTypes: {
              function: ["method", "singleton_method"],
              class: ["class"],
              method: ["method"],
              variable: ["assignment"],
              import: ["call"],
              export: [],
              interface: [],
              type: [],
              enum: [],
              parameter: ["method_parameters", "block_parameters"],
              return_type: []
            }
          },
          {
            name: "php",
            extensions: [".php"],
            module: "tree-sitter-php",
            nodeTypes: {
              function: ["function_definition", "method_declaration"],
              class: ["class_declaration"],
              method: ["method_declaration"],
              variable: ["property_declaration", "simple_parameter"],
              import: [],
              export: [],
              interface: ["interface_declaration"],
              type: [],
              enum: ["enum_declaration"],
              parameter: ["simple_parameter"],
              return_type: ["type_list"]
            }
          },
          {
            name: "kotlin",
            extensions: [".kt", ".kts"],
            module: "tree-sitter-kotlin",
            nodeTypes: {
              function: ["function_declaration"],
              class: ["class_declaration"],
              method: ["function_declaration"],
              variable: ["property_declaration", "variable_declaration"],
              import: ["import_header"],
              export: [],
              interface: ["class_declaration"],
              type: ["type_alias"],
              enum: ["class_declaration"],
              parameter: ["parameter", "value_parameter"],
              return_type: ["type_reference"]
            }
          },
          {
            name: "c",
            extensions: [".c", ".h"],
            module: "tree-sitter-c",
            nodeTypes: {
              function: ["function_definition"],
              class: ["struct_specifier"],
              method: ["function_definition"],
              variable: ["declaration"],
              import: ["preproc_include"],
              export: [],
              interface: [],
              type: ["type_definition"],
              enum: ["enum_specifier"],
              parameter: ["parameter_declaration"],
              return_type: ["type"]
            }
          },
          {
            name: "cpp",
            extensions: [".cpp", ".cc", ".cxx", ".hpp", ".hxx"],
            module: "tree-sitter-cpp",
            nodeTypes: {
              function: ["function_definition"],
              class: ["class_specifier"],
              method: ["function_definition"],
              variable: ["declaration"],
              import: ["preproc_include"],
              export: [],
              interface: [],
              type: ["type_definition", "alias_declaration"],
              enum: ["enum_specifier"],
              parameter: ["parameter_declaration"],
              return_type: ["type"]
            }
          }
        ];
        for (const config of languageConfigs) {
          try {
            const grammar = __require(config.module);
            this.languages.set(config.name, {
              ...config,
              grammar: grammar.default || grammar
            });
          } catch (error) {
            console.warn(`\u672A\u5B89\u88C5 ${config.name} \u7684 tree-sitter grammar`);
          }
        }
      }
      /**
       * 获取支持的语言
       */
      getSupportedLanguages() {
        return Array.from(this.languages.keys());
      }
      /**
       * 根据文件扩展名获取语言
       */
      getLanguageByExtension(ext) {
        for (const [lang, config] of this.languages) {
          if (config.extensions.includes(ext)) {
            return lang;
          }
        }
        return null;
      }
      /**
       * 解析代码
       */
      parseCode(code, language) {
        if (!this.parser || !this.initialized) {
          throw new Error("\u89E3\u6790\u5668\u672A\u521D\u59CB\u5316");
        }
        const config = this.languages.get(language);
        if (!config) {
          throw new Error(`\u4E0D\u652F\u6301\u7684\u8BED\u8A00: ${language}`);
        }
        this.parser.setLanguage(config.grammar);
        return this.parser.parse(code);
      }
      /**
       * 提取 AST 节点
       */
      extractASTNodes(tree, language, filePath) {
        const config = this.languages.get(language);
        if (!config) return [];
        const nodes = [];
        const cursor = tree.rootNode.walk();
        this.traverseCursor(cursor, config, filePath, nodes);
        return nodes;
      }
      /**
       * 遍历游标
       */
      traverseCursor(cursor, config, filePath, nodes) {
        const nodeType = cursor.nodeType;
        const nodeText = cursor.nodeText;
        const startPos = cursor.startPosition;
        const endPos = cursor.endPosition;
        let astType = null;
        if (config.nodeTypes.function.includes(nodeType)) {
          astType = "function";
        } else if (config.nodeTypes.class.includes(nodeType)) {
          astType = "class";
        } else if (config.nodeTypes.method.includes(nodeType)) {
          astType = "method";
        } else if (config.nodeTypes.variable.includes(nodeType)) {
          astType = "variable";
        } else if (config.nodeTypes.import.includes(nodeType)) {
          astType = "import";
        } else if (config.nodeTypes.interface.includes(nodeType)) {
          astType = "interface";
        } else if (config.nodeTypes.type.includes(nodeType)) {
          astType = "type";
        } else if (config.nodeTypes.enum.includes(nodeType)) {
          astType = "enum";
        }
        if (astType) {
          const name = this.extractNodeName(cursor, config, astType);
          const metadata = this.extractMetadata(cursor, config, astType);
          nodes.push({
            type: astType,
            name: name || nodeText.slice(0, 50),
            filePath,
            startLine: startPos.row + 1,
            endLine: endPos.row + 1,
            startColumn: startPos.column,
            endColumn: endPos.column,
            metadata
          });
        }
        if (cursor.gotoFirstChild()) {
          do {
            this.traverseCursor(cursor, config, filePath, nodes);
          } while (cursor.gotoNextSibling());
          cursor.gotoParent();
        }
      }
      /**
       * 提取节点名称
       */
      extractNodeName(cursor, config, astType) {
        const text = cursor.nodeText;
        if (astType === "function" || astType === "method") {
          const match = text.match(/(?:function|func|def|fn)\s+(\w+)/);
          if (match) return match[1];
        }
        if (astType === "class") {
          const match = text.match(/(?:class|struct|interface)\s+(\w+)/);
          if (match) return match[1];
        }
        if (astType === "variable") {
          const match = text.match(/(?:const|let|var|final|val|int|String|bool)\s+(\w+)/);
          if (match) return match[1];
        }
        return null;
      }
      /**
       * 提取元数据
       */
      extractMetadata(cursor, config, astType) {
        const metadata = {};
        const text = cursor.nodeText;
        if (astType === "function" || astType === "method") {
          const paramMatch = text.match(/\(([^)]*)\)/);
          if (paramMatch) {
            metadata.parameters = paramMatch[1].split(",").map((p) => p.trim()).filter(Boolean);
          }
          metadata.isAsync = text.includes("async") || text.includes("Future");
        }
        if (astType === "function" || astType === "method") {
          const returnMatch = text.match(/(?:->|:)\s*(\w+)/);
          if (returnMatch) {
            metadata.returnType = returnMatch[1];
          }
        }
        metadata.isExported = text.includes("export") || text.includes("public");
        metadata.isAbstract = text.includes("abstract");
        if (astType === "variable") {
          metadata.isConstant = text.includes("const") || text.includes("final");
        }
        return metadata;
      }
    };
    treeSitterParserManager = createTreeSitterParserManager();
    tree_sitter_parser_default = {
      TreeSitterParserManager,
      createTreeSitterParserManager,
      treeSitterParserManager
    };
  }
});

// src/cli/repl.ts
import * as readline2 from "readline";
import chalk6 from "chalk";

// src/config/manager.ts
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { homedir } from "os";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

// src/config/types.ts
var PROVIDER_PRESETS = {
  "deepseek": {
    name: "deepseek",
    base_url: "https://api.deepseek.com",
    models: ["deepseek-v4-flash", "deepseek-v4-pro"]
  },
  "infini-ai": {
    name: "infini-ai",
    base_url: "https://cloud.infini-ai.com/maas/coding/v1",
    models: ["deepseek-v3.2", "kimi-k2.5", "minimax-m2.7", "glm-5.1", "glm-5"]
  },
  "xiaomi": {
    name: "xiaomi",
    base_url: "https://token-plan-cn.xiaomimimo.com/v1",
    models: ["mimo-v2.5-pro", "mimo-v2.5"]
  },
  "xoai": {
    name: "xoai",
    base_url: "https://code-api.x-aio.com/v1",
    models: ["Qwen3.5-397B-A17B", "MiniMax-M2.5", "Qwen3.5-Flash", "DeepSeek-V4-Flash", "Qwen3-Coder-Next", "Kimi-K2.5", "GLM-5.1"]
  }
};
var MAX_CUSTOM_PROVIDERS = 3;
var DEFAULT_PROVIDER = "deepseek";
var DEFAULT_MODEL = "deepseek-v4-flash";
var DEFAULT_CONFIG = {
  providers: {},
  defaults: {
    provider: DEFAULT_PROVIDER,
    model: DEFAULT_MODEL
  },
  custom_providers: {},
  project: {
    root: "."
  }
};

// src/config/manager.ts
var MODULE_NAME = "forge-cli";
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
  // ─── Provider 查询 ─────────────────────────────────────────
  // 获取所有 provider（预设 + 自定义）
  getAllProviders() {
    const result = [];
    for (const [key, preset] of Object.entries(PROVIDER_PRESETS)) {
      const saved = this.config.providers[key];
      result.push({
        key,
        info: {
          base_url: saved?.base_url || preset.base_url,
          api_key: saved?.api_key || "",
          models: saved?.models || preset.models,
          selected: saved?.selected || ""
        },
        isPreset: true
      });
    }
    for (const [key, cp] of Object.entries(this.config.custom_providers)) {
      const saved = this.config.providers[key];
      result.push({
        key,
        info: {
          base_url: saved?.base_url || cp.base_url,
          api_key: saved?.api_key || cp.api_key,
          models: saved?.models || cp.models,
          selected: saved?.selected || ""
        },
        isPreset: false
      });
    }
    return result;
  }
  // 获取指定 provider
  getProvider(key) {
    if (PROVIDER_PRESETS[key]) {
      const preset = PROVIDER_PRESETS[key];
      const saved = this.config.providers[key];
      return {
        base_url: saved?.base_url || preset.base_url,
        api_key: saved?.api_key || "",
        models: saved?.models || preset.models,
        selected: saved?.selected || ""
      };
    }
    const cp = this.config.custom_providers[key];
    if (cp) {
      const saved = this.config.providers[key];
      return {
        base_url: saved?.base_url || cp.base_url,
        api_key: saved?.api_key || cp.api_key,
        models: saved?.models || cp.models,
        selected: saved?.selected || ""
      };
    }
    return null;
  }
  // 获取当前默认 provider key
  getDefaultProvider() {
    return this.config.defaults.provider;
  }
  // 获取当前默认模型的完整配置
  getModel(providerKey, modelName) {
    const pk = providerKey || this.config.defaults.provider;
    const info = this.getProvider(pk);
    if (!info) {
      throw new Error(`Provider "${pk}" not found`);
    }
    const mn = modelName || info.selected || this.config.defaults.model || info.models[0];
    const apiKey = process.env.FORGE_API_KEY || info.api_key;
    const baseUrl = process.env.FORGE_BASE_URL || info.base_url;
    return {
      name: mn,
      base_url: baseUrl,
      api_key: apiKey,
      provider_key: pk
    };
  }
  // ─── Provider 设置 ─────────────────────────────────────────
  // 设置 provider API Key
  setApiKey(providerKey, apiKey) {
    if (!this.config.providers[providerKey]) {
      this.config.providers[providerKey] = { base_url: "", api_key: "", models: [], selected: "" };
    }
    this.config.providers[providerKey].api_key = apiKey;
  }
  // 设置 provider 选择的模型
  setSelectedModel(providerKey, modelName) {
    if (!this.config.providers[providerKey]) {
      this.config.providers[providerKey] = { base_url: "", api_key: "", models: [], selected: "" };
    }
    this.config.providers[providerKey].selected = modelName;
    this.config.defaults.provider = providerKey;
    this.config.defaults.model = modelName;
  }
  // 添加自定义 provider
  addCustomProvider(key, config) {
    const customCount = Object.keys(this.config.custom_providers).length;
    if (customCount >= MAX_CUSTOM_PROVIDERS) {
      throw new Error(`\u6700\u591A\u652F\u6301 ${MAX_CUSTOM_PROVIDERS} \u4E2A\u81EA\u5B9A\u4E49 provider`);
    }
    this.config.custom_providers[key] = config;
    this.config.providers[key] = {
      base_url: config.base_url,
      api_key: config.api_key,
      models: config.models,
      selected: ""
    };
  }
  // 删除自定义 provider
  removeCustomProvider(key) {
    delete this.config.custom_providers[key];
    delete this.config.providers[key];
    if (this.config.defaults.provider === key) {
      this.config.defaults.provider = DEFAULT_PROVIDER;
      this.config.defaults.model = DEFAULT_MODEL;
    }
  }
  // ─── 废弃兼容 ─────────────────────────────────────────────
  getProvider_legacy() {
    const pk = this.config.defaults.provider;
    const info = this.getProvider(pk);
    return {
      name: pk,
      base_url: info?.base_url || "",
      api_key: info?.api_key || "",
      models: info?.models || []
    };
  }
  setBaseUrl(url) {
    const pk = this.config.defaults.provider;
    if (!this.config.providers[pk]) {
      this.config.providers[pk] = { base_url: "", api_key: "", models: [], selected: "" };
    }
    this.config.providers[pk].base_url = url;
  }
  setDefaultModel(name) {
    const pk = this.config.defaults.provider;
    if (!this.config.providers[pk]) {
      this.config.providers[pk] = { base_url: "", api_key: "", models: [], selected: "" };
    }
    this.config.providers[pk].selected = name;
    this.config.defaults.model = name;
  }
  setProjectRoot(root) {
    this.config.project.root = resolve(root);
  }
  getConfigPath() {
    return this.configPath;
  }
  // 当前默认 provider 是否已配置 API Key
  isConfigured() {
    const pk = this.config.defaults.provider;
    const info = this.getProvider(pk);
    return !!(info?.api_key || process.env.FORGE_API_KEY);
  }
  // 获取可用模型列表
  getAvailableModels() {
    const pk = this.config.defaults.provider;
    const info = this.getProvider(pk);
    return info?.models || [];
  }
  getConfiguredModels() {
    const pk = this.config.defaults.provider;
    const info = this.getProvider(pk);
    if (!info || !info.api_key && !process.env.FORGE_API_KEY) return [];
    return info.models.map((name) => ({
      name,
      base_url: info.base_url,
      api_key: info.api_key,
      provider_key: pk
    }));
  }
  // ─── 合并配置 ─────────────────────────────────────────────
  mergeConfig(overrides) {
    const defaults = structuredClone(DEFAULT_CONFIG);
    return {
      providers: overrides.providers || defaults.providers,
      defaults: {
        provider: overrides.defaults?.provider || defaults.defaults.provider,
        model: overrides.defaults?.model || defaults.defaults.model
      },
      custom_providers: overrides.custom_providers || defaults.custom_providers,
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
  maxTokens;
  summarizer;
  constructor(maxMessages = 100, maxTokens = 32e3) {
    this.maxMessages = maxMessages;
    this.maxTokens = maxTokens;
  }
  // 设置摘要生成器（需要 LLM 客户端）
  setSummarizer(fn) {
    this.summarizer = fn;
  }
  setSystemPrompt(prompt) {
    this.systemPrompt = prompt;
  }
  addMessage(message) {
    if (!message.tokenEstimate) {
      message.tokenEstimate = estimateTokens(message.content);
    }
    if (!message.importance) {
      message.importance = classifyImportance(message);
    }
    this.messages.push(message);
    this.compressIfNeeded();
  }
  addUserMessage(content) {
    this.addMessage({ role: "user", content });
  }
  addAssistantMessage(content) {
    this.addMessage({ role: "assistant", content });
  }
  addToolResult(toolCallId, content) {
    const trimmed = trimToolResult(content);
    this.addMessage({ role: "tool", content: trimmed, tool_call_id: toolCallId, importance: "low" });
  }
  getMessages() {
    const messages = [];
    if (this.systemPrompt) {
      messages.push({ role: "system", content: this.systemPrompt });
    }
    messages.push(...this.messages.map((m) => ({
      role: m.role,
      content: m.content,
      ...m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}
    })));
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
  getTotalTokens() {
    return this.messages.reduce((sum, m) => sum + (m.tokenEstimate || 0), 0);
  }
  getSummary() {
    const userMessages = this.messages.filter((m) => m.role === "user").length;
    const assistantMessages = this.messages.filter((m) => m.role === "assistant").length;
    const toolMessages = this.messages.filter((m) => m.role === "tool").length;
    const tokens = this.getTotalTokens();
    const pct = Math.min(100, Math.round(tokens / this.maxTokens * 100));
    return `\u6D88\u606F\u6570: ${this.messages.length} (\u7528\u6237: ${userMessages}, \u52A9\u624B: ${assistantMessages}, \u5DE5\u5177: ${toolMessages}) | Token: ~${tokens} (${pct}%)`;
  }
  // 获取上下文使用百分比（用于状态栏）
  getContextPercent() {
    return Math.min(100, Math.round(this.getTotalTokens() / this.maxTokens * 100));
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
  // ─── 压缩策略 ───────────────────────────────────────────────
  compressIfNeeded() {
    if (this.messages.length > this.maxMessages) {
      this.truncateByCount();
    }
    if (this.getTotalTokens() > this.maxTokens) {
      this.compressByTokens();
    }
  }
  truncateByCount() {
    const prefixSize = Math.min(10, Math.floor(this.maxMessages * 0.2));
    const windowSize = this.maxMessages - prefixSize;
    const prefix = this.messages.slice(0, prefixSize);
    const recent = this.messages.slice(this.messages.length - windowSize);
    this.messages = [...prefix, ...recent];
  }
  compressByTokens() {
    for (const msg of this.messages) {
      if (msg.importance === "low" && (msg.tokenEstimate || 0) > 500) {
        msg.content = msg.content.slice(0, 500) + "\n... [\u5DF2\u88C1\u526A]";
        msg.tokenEstimate = estimateTokens(msg.content);
        msg.compressed = true;
      }
    }
    if (this.getTotalTokens() > this.maxTokens && this.summarizer) {
      this.summarizeOldMessages();
    }
  }
  async summarizeOldMessages() {
    if (!this.summarizer) return;
    const prefixSize = Math.min(5, Math.floor(this.messages.length * 0.1));
    const summarizeEnd = Math.floor(this.messages.length * 0.5);
    const toSummarize = this.messages.slice(prefixSize, summarizeEnd);
    if (toSummarize.length < 3) return;
    try {
      const summary = await this.summarizer(toSummarize);
      const summaryMsg = {
        role: "assistant",
        content: `[\u5BF9\u8BDD\u6458\u8981] ${summary}`,
        importance: "high",
        tokenEstimate: estimateTokens(summary),
        compressed: true
      };
      const prefix = this.messages.slice(0, prefixSize);
      const recent = this.messages.slice(summarizeEnd);
      this.messages = [...prefix, summaryMsg, ...recent];
    } catch {
      this.truncateByCount();
    }
  }
};
function estimateTokens(text) {
  const cjkChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
  const otherChars = text.length - cjkChars;
  return Math.ceil(cjkChars / 2 + otherChars / 4);
}
function classifyImportance(msg) {
  if (msg.role === "system") return "critical";
  if (msg.role === "tool") return "low";
  if (msg.role === "user") return "high";
  return "normal";
}
function trimToolResult(content, maxChars = 2e3) {
  if (content.length <= maxChars) return content;
  const head = content.slice(0, maxChars * 0.7);
  const tail = content.slice(-maxChars * 0.2);
  return `${head}

... [\u5DF2\u88C1\u526A ${content.length - maxChars} \u5B57\u7B26] ...

${tail}`;
}
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
  providerKey;
  constructor(config) {
    this.providerKey = config.provider_key || "";
    this.provider = createOpenAI({
      apiKey: config.api_key,
      baseURL: config.base_url,
      fetch: this.providerKey === "deepseek" ? createCompatFetch() : void 0
    });
    this.modelName = config.name;
  }
  setModel(config) {
    this.providerKey = config.provider_key || "";
    this.provider = createOpenAI({
      apiKey: config.api_key,
      baseURL: config.base_url,
      fetch: this.providerKey === "deepseek" ? createCompatFetch() : void 0
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
    for await (const event of result.fullStream) {
      if (event.type === "text-delta") {
        yield { type: "text", content: event.text ?? event.textDelta ?? "" };
      } else if (event.type === "tool-call") {
        yield { type: "tool-call", content: JSON.stringify({ name: event.toolName, args: event.args ?? event.input ?? {} }) };
      } else if (event.type === "tool-result") {
        yield { type: "tool-result", content: JSON.stringify({ name: event.toolName, result: event.result ?? event.output ?? "" }) };
      }
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
    for await (const event of result.fullStream) {
      if (event.type === "text-delta") {
        yield { type: "text", content: event.text ?? event.textDelta ?? "" };
      } else if (event.type === "tool-call") {
        yield { type: "tool-call", content: JSON.stringify({ name: event.toolName, args: event.args ?? event.input ?? {} }) };
      } else if (event.type === "tool-result") {
        yield { type: "tool-result", content: JSON.stringify({ name: event.toolName, result: event.result ?? event.output ?? "" }) };
      }
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
    allowedTools: ["read_file", "list_files", "search_files", "glob", "grep", "ls", "scan_project", "detect_project_state", "save_memory", "read_memory"],
    forbiddenTools: ["write_file", "edit_file", "run_command"]
  },
  ui_designer: {
    role: "ui_designer",
    name: "UI \u8BBE\u8BA1\u5E08",
    description: "\u89C6\u89C9\u65B9\u6848\u3001\u4EA4\u4E92\u8BBE\u8BA1\u3001\u6837\u5F0F\u89C4\u8303",
    allowedTools: ["read_file", "list_files", "search_files", "glob", "grep", "ls", "scan_project", "save_memory", "read_memory"],
    forbiddenTools: ["write_file", "edit_file", "run_command"]
  },
  architecture_designer: {
    role: "architecture_designer",
    name: "\u67B6\u6784\u8BBE\u8BA1\u5E08",
    description: "\u67B6\u6784\u8BBE\u8BA1\u3001\u6A21\u5757\u5212\u5206\u3001\u6280\u672F\u9009\u578B",
    allowedTools: ["read_file", "list_files", "search_files", "glob", "grep", "ls", "scan_project", "detect_project_state", "save_memory", "read_memory"],
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
    allowedTools: ["read_file", "list_files", "search_files", "glob", "grep", "ls", "run_command", "validate_output", "validate_docs_sync", "save_memory", "read_memory"],
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
    return `\u4F60\u662F Forge CLI \u7684\u4E3B\u63A7 Agent\uFF0C\u8D1F\u8D23\u8DEF\u7531\u5224\u65AD\u3001\u9636\u6BB5\u63A8\u8FDB\u3001\u5B50 Agent \u8C03\u5EA6\u548C\u72B6\u6001\u7BA1\u7406\u3002

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
    return `\u4F60\u662F Forge CLI \u7684${names[role]}\uFF0C\u8D1F\u8D23\u6267\u884C\u7279\u5B9A\u9636\u6BB5\u7684\u4EFB\u52A1\u3002`;
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
  // 路由判断（仅项目任务会进入此方法）
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
var SESSION_DIR = join3(homedir2(), ".forge-cli", "sessions");
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
    const { readdirSync: readdirSync5 } = __require("fs");
    const files = readdirSync5(SESSION_DIR).filter((f) => f.endsWith(".yaml"));
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
var HOOKS_DIR = join4(homedir3(), ".forge-cli", "hooks");
var PROJECT_HOOKS_DIR = ".forge-cli/hooks";
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
var PLUGINS_DIR = join5(homedir4(), ".forge-cli", "plugins");
var PROJECT_PLUGINS_DIR = ".forge-cli/plugins";
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
          name: "forge-cli",
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

// src/utils/trace.ts
import { writeFileSync as writeFileSync4, existsSync as existsSync5, mkdirSync as mkdirSync4 } from "fs";
import { join as join6 } from "path";
import { homedir as homedir5 } from "os";
var DEFAULT_CONFIG2 = {
  enabled: true,
  persistToDisk: true,
  dir: join6(homedir5(), ".forge-cli", "traces"),
  maxEvents: 500,
  consoleOutput: false
};
var Tracer = class {
  session;
  config;
  startTime;
  eventCounter = 0;
  constructor(sessionId, config) {
    this.config = { ...DEFAULT_CONFIG2, ...config };
    this.startTime = Date.now();
    this.session = {
      sessionId,
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      events: [],
      metadata: {}
    };
  }
  // 记录事件
  record(type, data, tags) {
    if (!this.config.enabled) {
      return this.createEvent(type, data, tags);
    }
    const event = this.createEvent(type, data, tags);
    this.session.events.push(event);
    if (this.session.events.length > this.config.maxEvents) {
      this.session.events = this.session.events.slice(-this.config.maxEvents);
    }
    if (this.config.consoleOutput) {
      this.printEvent(event);
    }
    return event;
  }
  // 便捷方法
  traceLLMCall(model, messageCount, toolCount) {
    this.record("llm_call", { model, messageCount, toolCount });
  }
  traceLLMResponse(content, toolCalls, duration) {
    this.record("llm_response", {
      contentLength: content.length,
      toolCallCount: toolCalls,
      duration
    });
  }
  traceToolCall(name, args) {
    this.record("tool_call", { toolName: name, args });
  }
  traceToolResult(name, success, outputLength, duration) {
    this.record("tool_result", {
      toolName: name,
      success,
      outputLength,
      duration
    });
  }
  traceStateChange(from, to, reason) {
    this.record("state_change", { from, to, reason });
  }
  tracePhaseAdvance(from, to) {
    this.record("phase_advance", { from, to });
  }
  traceError(error, context) {
    this.record("error", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context
    }, ["error"]);
  }
  traceRetry(attempt, maxAttempts, error, delay) {
    this.record("retry", { attempt, maxAttempts, error, delay }, ["retry"]);
  }
  traceWarning(message, context) {
    this.record("warning", { message, ...context }, ["warning"]);
  }
  // 设置元数据
  setMetadata(key, value) {
    this.session.metadata[key] = value;
  }
  // 获取当前会话数据
  getSession() {
    return { ...this.session };
  }
  // 获取统计信息
  getStats() {
    const events = this.session.events;
    const toolCalls = events.filter((e) => e.type === "tool_call");
    const toolResults = events.filter((e) => e.type === "tool_result");
    const errors = events.filter((e) => e.type === "error");
    const retries = events.filter((e) => e.type === "retry");
    const llmCalls = events.filter((e) => e.type === "llm_call");
    const successfulTools = toolResults.filter((e) => e.data.success === true);
    const failedTools = toolResults.filter((e) => e.data.success === false);
    const totalDuration = this.session.endedAt ? new Date(this.session.endedAt).getTime() - new Date(this.session.startedAt).getTime() : Date.now() - this.startTime;
    return {
      totalEvents: events.length,
      llmCallCount: llmCalls.length,
      toolCallCount: toolCalls.length,
      toolSuccessCount: successfulTools.length,
      toolFailCount: failedTools.length,
      errorCount: errors.length,
      retryCount: retries.length,
      totalDuration,
      toolSuccessRate: toolResults.length > 0 ? successfulTools.length / toolResults.length : 0
    };
  }
  // 结束会话
  end() {
    this.session.endedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (this.config.persistToDisk) {
      this.persist();
    }
  }
  // 持久化到磁盘
  persist() {
    if (!existsSync5(this.config.dir)) {
      mkdirSync4(this.config.dir, { recursive: true });
    }
    const filename = `trace-${this.session.sessionId}.json`;
    const filepath = join6(this.config.dir, filename);
    try {
      writeFileSync4(filepath, JSON.stringify(this.session, null, 2), "utf-8");
    } catch {
    }
  }
  // 创建事件对象
  createEvent(type, data, tags) {
    this.eventCounter++;
    return {
      id: `${this.session.sessionId}-${this.eventCounter}`,
      type,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      elapsed: Date.now() - this.startTime,
      data,
      tags
    };
  }
  // 控制台输出（调试用）
  printEvent(event) {
    const elapsed = (event.elapsed / 1e3).toFixed(2);
    const prefix = `[Trace ${elapsed}s]`;
    const dataStr = JSON.stringify(event.data, null, 0);
    console.log(`${prefix} ${event.type}: ${dataStr}`);
  }
};
var globalTracer = null;
function initTracer(sessionId, config) {
  globalTracer = new Tracer(sessionId, config);
  return globalTracer;
}

// src/utils/retry.ts
var DEFAULT_TOOL_RETRY = {
  maxAttempts: 2,
  baseDelay: 500,
  retryableErrors: [
    "timeout",
    "ECONNRESET",
    "rate limit",
    "429"
  ]
};
var ToolRetryExecutor = class {
  config;
  tracer;
  constructor(config, tracer) {
    this.config = { ...DEFAULT_TOOL_RETRY, ...config };
    this.tracer = tracer;
  }
  async execute(toolName, fn) {
    let lastError;
    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const retryable = this.config.retryableErrors.some(
          (pattern) => lastError.message.toLowerCase().includes(pattern.toLowerCase())
        );
        if (!retryable || attempt >= this.config.maxAttempts) {
          throw lastError;
        }
        const delay = this.config.baseDelay * attempt;
        if (this.tracer) {
          this.tracer.traceRetry(attempt, this.config.maxAttempts, lastError.message, delay);
        }
        await new Promise((resolve8) => setTimeout(resolve8, delay));
      }
    }
    throw lastError;
  }
};

// src/utils/summary.ts
function generateSummary(session, stats) {
  const toolBreakdown = buildToolBreakdown(session);
  const errorSummary = buildErrorSummary(session);
  const phaseProgression = buildPhaseProgression(session);
  const recommendations = generateRecommendations(stats, errorSummary);
  let status = "success";
  if (stats.errorCount > 0 && stats.toolSuccessRate < 0.5) {
    status = "failed";
  } else if (stats.errorCount > 0 || stats.toolSuccessRate < 1) {
    status = "partial";
  }
  return {
    sessionId: session.sessionId,
    status,
    duration: formatDuration(stats.totalDuration),
    stats: {
      llmCalls: stats.llmCallCount,
      toolCalls: stats.toolCallCount,
      toolSuccessRate: (stats.toolSuccessRate * 100).toFixed(1) + "%",
      errors: stats.errorCount,
      retries: stats.retryCount
    },
    toolBreakdown,
    errorSummary,
    phaseProgression,
    recommendations
  };
}
function formatSummary(summary) {
  const lines = [];
  lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  lines.push("  Agent \u6267\u884C\u6458\u8981");
  lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  lines.push("");
  const statusIcon = summary.status === "success" ? "\u2713" : summary.status === "partial" ? "\u26A0" : "\u2717";
  lines.push(`  ${statusIcon} \u72B6\u6001: ${summary.status}`);
  lines.push(`  \u23F1 \u8017\u65F6: ${summary.duration}`);
  lines.push("");
  lines.push("  \u2500\u2500 \u7EDF\u8BA1 \u2500\u2500");
  lines.push(`  LLM \u8C03\u7528:     ${summary.stats.llmCalls}`);
  lines.push(`  \u5DE5\u5177\u8C03\u7528:     ${summary.stats.toolCalls}`);
  lines.push(`  \u5DE5\u5177\u6210\u529F\u7387:   ${summary.stats.toolSuccessRate}`);
  lines.push(`  \u9519\u8BEF\u6570:       ${summary.stats.errors}`);
  lines.push(`  \u91CD\u8BD5\u6B21\u6570:     ${summary.stats.retries}`);
  lines.push("");
  if (summary.toolBreakdown.length > 0) {
    lines.push("  \u2500\u2500 \u5DE5\u5177\u660E\u7EC6 \u2500\u2500");
    for (const tool2 of summary.toolBreakdown) {
      const icon = tool2.failures > 0 ? "\u26A0" : "\u2713";
      lines.push(`  ${icon} ${tool2.name}: ${tool2.calls}\u6B21 (${tool2.successes}\u6210\u529F/${tool2.failures}\u5931\u8D25)`);
    }
    lines.push("");
  }
  if (summary.errorSummary.length > 0) {
    lines.push("  \u2500\u2500 \u9519\u8BEF\u6458\u8981 \u2500\u2500");
    for (const err of summary.errorSummary) {
      lines.push(`  \u2717 ${err.message} (${err.count}\u6B21, ${err.category})`);
    }
    lines.push("");
  }
  if (summary.phaseProgression.length > 0) {
    lines.push("  \u2500\u2500 \u9636\u6BB5\u8FDB\u5C55 \u2500\u2500");
    lines.push(`  ${summary.phaseProgression.join(" \u2192 ")}`);
    lines.push("");
  }
  if (summary.recommendations.length > 0) {
    lines.push("  \u2500\u2500 \u5EFA\u8BAE \u2500\u2500");
    for (const rec of summary.recommendations) {
      lines.push(`  \u2192 ${rec}`);
    }
    lines.push("");
  }
  lines.push("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  return lines.join("\n");
}
function buildToolBreakdown(session) {
  const toolMap = /* @__PURE__ */ new Map();
  for (const event of session.events) {
    if (event.type === "tool_call") {
      const name = event.data.toolName;
      const existing = toolMap.get(name) || { calls: 0, successes: 0, failures: 0 };
      existing.calls++;
      toolMap.set(name, existing);
    }
    if (event.type === "tool_result") {
      const name = event.data.toolName;
      const existing = toolMap.get(name) || { calls: 0, successes: 0, failures: 0 };
      if (event.data.success) {
        existing.successes++;
      } else {
        existing.failures++;
      }
      toolMap.set(name, existing);
    }
  }
  return Array.from(toolMap.entries()).map(([name, stats]) => ({
    name,
    ...stats
  }));
}
function buildErrorSummary(session) {
  const errorMap = /* @__PURE__ */ new Map();
  for (const event of session.events) {
    if (event.type === "error") {
      const msg = event.data.message || "Unknown error";
      const existing = errorMap.get(msg) || { count: 0, category: "unknown" };
      existing.count++;
      if (event.tags?.includes("retry")) {
        existing.category = "transient";
      }
      errorMap.set(msg, existing);
    }
  }
  return Array.from(errorMap.entries()).map(([message, stats]) => ({
    message,
    ...stats
  }));
}
function buildPhaseProgression(session) {
  const phases = [];
  for (const event of session.events) {
    if (event.type === "phase_advance") {
      const from = event.data.from;
      const to = event.data.to;
      if (phases.length === 0) phases.push(from);
      phases.push(to);
    }
  }
  return phases;
}
function generateRecommendations(stats, errorSummary) {
  const recs = [];
  if (stats.toolSuccessRate < 0.8 && stats.toolCallCount > 0) {
    recs.push("\u5DE5\u5177\u6210\u529F\u7387\u504F\u4F4E\uFF0C\u68C0\u67E5\u5DE5\u5177\u53C2\u6570\u5B9A\u4E49\u662F\u5426\u6E05\u6670\uFF0C\u6216\u589E\u52A0\u8F93\u5165\u6821\u9A8C");
  }
  if (stats.retryCount > 3) {
    recs.push("\u91CD\u8BD5\u6B21\u6570\u8FC7\u591A\uFF0C\u8003\u8651\u589E\u52A0\u8D85\u65F6\u65F6\u95F4\u6216\u68C0\u67E5\u7F51\u7EDC\u7A33\u5B9A\u6027");
  }
  if (stats.llmCallCount > 8) {
    recs.push("LLM \u8C03\u7528\u6B21\u6570\u8F83\u591A\uFF0C\u8003\u8651\u4F18\u5316 prompt \u51CF\u5C11\u4E0D\u5FC5\u8981\u7684\u5FAA\u73AF");
  }
  const hasPermanentErrors = errorSummary.some((e) => e.category === "permanent");
  if (hasPermanentErrors) {
    recs.push("\u5B58\u5728\u6C38\u4E45\u6027\u9519\u8BEF\uFF08\u5982\u8BA4\u8BC1\u5931\u8D25\uFF09\uFF0C\u8BF7\u68C0\u67E5 API Key \u6216\u6743\u9650\u914D\u7F6E");
  }
  if (stats.totalDuration > 12e4) {
    recs.push("\u6267\u884C\u65F6\u95F4\u8D85\u8FC7 2 \u5206\u949F\uFF0C\u8003\u8651\u62C6\u5206\u4EFB\u52A1\u6216\u51CF\u5C11\u4E0A\u4E0B\u6587\u957F\u5EA6");
  }
  return recs;
}
function formatDuration(ms) {
  if (ms < 1e3) return `${ms}ms`;
  if (ms < 6e4) return `${(ms / 1e3).toFixed(1)}s`;
  const minutes = Math.floor(ms / 6e4);
  const seconds = Math.floor(ms % 6e4 / 1e3);
  return `${minutes}m ${seconds}s`;
}

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
    this.toolRetry = new ToolRetryExecutor({ maxAttempts: 2 });
    this.initPluginManager();
  }
  aiClient;
  contextManager;
  toolRegistry;
  projectRoot;
  controller;
  context;
  sessionInitialized = false;
  tracer = null;
  toolRetry;
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
    const startTime = Date.now();
    const session = sessionManager.get();
    const traceId = session?.id || `orch-${Date.now()}`;
    this.tracer = initTracer(traceId, { consoleOutput: false });
    this.tracer.record("user_input", { input: userInput });
    this.toolRetry = new ToolRetryExecutor({ maxAttempts: 2 }, this.tracer);
    try {
      this.tracer.traceLLMCall("classifier", 1, 0);
      const classifyStart = Date.now();
      const isProjectTask = await this.classifyTask(userInput);
      this.tracer.traceLLMResponse(
        isProjectTask ? "\u662F" : "\u5426",
        0,
        Date.now() - classifyStart
      );
      if (isProjectTask === null) {
        this.tracer.traceError(new Error("\u6A21\u578B\u4E0D\u53EF\u7528"), "classifyTask");
        this.finishTrace();
        return {
          success: false,
          output: "",
          error: "\u6A21\u578B\u4E0D\u53EF\u7528\uFF0C\u8BF7\u68C0\u67E5 API \u914D\u7F6E\uFF08/model\uFF09"
        };
      }
      if (!isProjectTask) {
        this.tracer.record("state_change", { from: "classify", to: "direct_response", reason: "\u975E\u9879\u76EE\u4EFB\u52A1" });
        const result2 = await this.directResponse(userInput);
        this.finishTrace();
        return result2;
      }
      const promptHookResult = await hookManager.execute("PromptSubmit", {
        event: "PromptSubmit",
        userPrompt: userInput
      });
      if (promptHookResult.action === "block") {
        this.tracer.traceWarning("PromptSubmit hook blocked", { message: promptHookResult.message });
        this.finishTrace();
        return {
          success: false,
          output: "",
          error: promptHookResult.message || "\u64CD\u4F5C\u88AB\u94A9\u5B50\u963B\u6B62"
        };
      }
      const securityResult = securityChecker.checkCode(userInput);
      if (!securityResult.passed && securityResult.score < 50) {
        this.tracer.traceWarning(`\u5B89\u5168\u68C0\u67E5\u8B66\u544A (\u5206\u6570: ${securityResult.score})`);
        forgeLogger.logWarning(`\u5B89\u5168\u68C0\u67E5\u8B66\u544A (\u5206\u6570: ${securityResult.score})`);
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
        this.tracer.traceWarning("\u9AD8\u98CE\u9669\u64CD\u4F5C\uFF0C\u7B49\u5F85\u7528\u6237\u786E\u8BA4");
        forgeLogger.logWaiting("\u68C0\u6D4B\u5230\u9AD8\u98CE\u9669\u64CD\u4F5C\uFF0C\u7B49\u5F85\u7528\u6237\u786E\u8BA4");
        sessionManager.waitForInput();
        this.finishTrace();
        return {
          success: true,
          output: "[f-forge] \u68C0\u6D4B\u5230\u9AD8\u98CE\u9669\u64CD\u4F5C\uFF0C\u8BF7\u786E\u8BA4\u662F\u5426\u7EE7\u7EED",
          needsUserInput: true
        };
      }
      const targetAgent = this.controller.route(userInput);
      this.tracer.record("state_change", { from: "classify", to: "route", agent: targetAgent });
      const prevPhase = this.context.currentPhase;
      this.updateContext(targetAgent);
      if (this.context.currentPhase !== prevPhase) {
        this.tracer.tracePhaseAdvance(prevPhase, this.context.currentPhase);
      }
      sessionManager.setActiveAgent(targetAgent);
      sessionManager.setPhase(this.context.currentPhase);
      forgeLogger.enterController();
      forgeLogger.logPhase(this.context.currentPhase);
      const dispatchStart = Date.now();
      const result = await this.controller.dispatch(targetAgent, userInput, this.context);
      this.tracer.record("state_change", {
        from: "dispatch",
        to: result.success ? "success" : "failed",
        agent: targetAgent,
        duration: Date.now() - dispatchStart
      });
      this.processResult(result);
      sessionManager.addHistory("agent_result", targetAgent, result.output);
      this.finishTrace();
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.tracer.traceError(err, "orchestrator.execute");
      this.finishTrace();
      throw err;
    }
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
  // 流式执行（完整流程：分类 → 路由 → 流式输出）
  async *executeStream(userInput) {
    const startTime = Date.now();
    const session = sessionManager.get();
    const traceId = session?.id || `stream-${Date.now()}`;
    this.tracer = initTracer(traceId, { consoleOutput: false });
    this.tracer.record("user_input", { input: userInput });
    try {
      this.tracer.traceLLMCall("classifier", 1, 0);
      const classifyStart = Date.now();
      const isProjectTask = await this.classifyTask(userInput);
      this.tracer.traceLLMResponse(isProjectTask ? "\u662F" : "\u5426", 0, Date.now() - classifyStart);
      if (isProjectTask === null) {
        this.tracer.traceError(new Error("\u6A21\u578B\u4E0D\u53EF\u7528"), "classifyTask");
        this.finishTrace();
        yield { type: "text", content: "\u6A21\u578B\u4E0D\u53EF\u7528\uFF0C\u8BF7\u68C0\u67E5 API \u914D\u7F6E\uFF08/model\uFF09" };
        return;
      }
      if (!isProjectTask) {
        this.tracer.record("state_change", { from: "classify", to: "direct_response" });
        yield* this.directResponseStream(userInput);
        this.finishTrace();
        return;
      }
      const promptHookResult = await hookManager.execute("PromptSubmit", {
        event: "PromptSubmit",
        userPrompt: userInput
      });
      if (promptHookResult.action === "block") {
        this.tracer.traceWarning("PromptSubmit hook blocked");
        this.finishTrace();
        yield { type: "text", content: promptHookResult.message || "\u64CD\u4F5C\u88AB\u94A9\u5B50\u963B\u6B62" };
        return;
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
      const targetAgent = this.controller.route(userInput);
      this.tracer.record("state_change", { from: "classify", to: "route", agent: targetAgent });
      const prevPhase = this.context.currentPhase;
      this.updateContext(targetAgent);
      if (this.context.currentPhase !== prevPhase) {
        this.tracer.tracePhaseAdvance(prevPhase, this.context.currentPhase);
      }
      sessionManager.setActiveAgent(targetAgent);
      sessionManager.setPhase(this.context.currentPhase);
      forgeLogger.enterController();
      forgeLogger.logPhase(this.context.currentPhase);
      yield* this.controller.executeStream(userInput, this.context);
      this.tracer.record("state_change", {
        from: "stream",
        to: "complete",
        agent: targetAgent,
        duration: Date.now() - startTime
      });
      sessionManager.addHistory("stream_complete", targetAgent, "");
      this.finishTrace();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.tracer.traceError(err, "orchestrator.executeStream");
      this.finishTrace();
      throw err;
    }
  }
  // 非工作流流式回答
  async *directResponseStream(userInput) {
    this.contextManager.addUserMessage(userInput);
    const tools = this.toolRegistry.getAll().map((t) => ({
      name: t.definition.name,
      description: t.definition.description,
      parameters: t.definition.parameters.properties,
      execute: t.execute
    }));
    let fullText = "";
    for await (const event of this.aiClient.streamWithMessages(
      this.contextManager.getMessages(),
      tools,
      5
    )) {
      if (event.type === "text") fullText += event.content;
      yield event;
    }
    this.contextManager.addAssistantMessage(fullText);
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
  // 结束 trace 并输出摘要
  finishTrace() {
    if (!this.tracer) return;
    const session = this.tracer.getSession();
    const stats = this.tracer.getStats();
    const summary = generateSummary(session, stats);
    sessionManager.setMetadata("traceStats", stats);
    sessionManager.setMetadata("traceSummary", summary);
    this.tracer.end();
  }
  // 获取 trace 统计（供 /status 命令使用）
  getTraceStats() {
    return this.tracer?.getStats() || null;
  }
  // 获取当前 tracer 实例
  getTracer() {
    return this.tracer;
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
import { join as join7 } from "path";

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
var SCRIPTS_DIR = join7(import.meta.dirname, "..", "..", "scripts");
var scanProjectTool = {
  definition: {
    name: "scan_project",
    description: "\u626B\u63CF\u9879\u76EE\u7ED3\u6784\uFF0C\u8BC6\u522B\u6280\u672F\u6808\u3001\u76EE\u5F55\u7ED3\u6784\u3001\u4F9D\u8D56\u5173\u7CFB\u7B49",
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
    const scriptPath = join7(SCRIPTS_DIR, "scan_project.py");
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
    description: "\u68C0\u6D4B\u9879\u76EE\u6839\u76EE\u5F55\u72B6\u6001\uFF1Aempty_new\uFF08\u7A7A\u76EE\u5F55\uFF09\u3001existing\uFF08\u5DF2\u6709\u9879\u76EE\uFF09\u3001unknown\uFF08\u672A\u77E5\uFF09",
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
    const scriptPath = join7(SCRIPTS_DIR, "detect_project_state.py");
    const result = await executePython(scriptPath, [project_root]);
    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : void 0
    };
  }
};

// src/tools/validator.ts
import { join as join8 } from "path";
var SCRIPTS_DIR2 = join8(import.meta.dirname, "..", "..", "scripts");
var validateOutputTool = {
  definition: {
    name: "validate_output",
    description: "\u9A8C\u8BC1\u8F93\u51FA\u662F\u5426\u7B26\u5408\u89C4\u8303\uFF08\u65E5\u5FD7\u524D\u7F00\u3001\u9636\u6BB5\u6807\u8BB0\u7B49\uFF09",
    parameters: {
      type: "object",
      properties: {
        output: {
          type: "string",
          description: "\u5F85\u9A8C\u8BC1\u7684\u8F93\u51FA\u6587\u672C"
        },
        require_stage: {
          type: "boolean",
          description: "\u662F\u5426\u8981\u6C42\u5305\u542B\u9636\u6BB5\u6807\u8BB0"
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
    const scriptPath = join8(SCRIPTS_DIR2, "validate_output.sh");
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
    const scriptPath = join8(SCRIPTS_DIR2, "validate_docs_sync.py");
    const result = await executeShell(scriptPath, [project_root]);
    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : void 0
    };
  }
};

// src/tools/guardrails.ts
import { join as join9 } from "path";
var SCRIPTS_DIR3 = join9(import.meta.dirname, "..", "..", "scripts");
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
    const scriptPath = join9(SCRIPTS_DIR3, "check_project_guardrails.sh");
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
    const scriptPath = join9(SCRIPTS_DIR3, "init_project_guardrails.py");
    const result = await executePython(scriptPath, [project_root]);
    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : void 0
    };
  }
};

// src/tools/classifier.ts
import { join as join10 } from "path";
var SCRIPTS_DIR4 = join10(import.meta.dirname, "..", "..", "scripts");
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
    const scriptPath = join10(SCRIPTS_DIR4, "classify_task.sh");
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
import { readFileSync as readFileSync6, writeFileSync as writeFileSync5, existsSync as existsSync6, mkdirSync as mkdirSync5, readdirSync as readdirSync3, statSync as statSync2 } from "fs";
import { join as join11, resolve as resolve6, dirname } from "path";
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
    if (!existsSync6(resolvedPath)) {
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
      if (!existsSync6(dir)) {
        mkdirSync5(dir, { recursive: true });
      }
      writeFileSync5(resolvedPath, content, "utf-8");
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
    if (!existsSync6(resolvedPath)) {
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
      writeFileSync5(resolvedPath, newContent, "utf-8");
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
    if (!existsSync6(resolvedPath)) {
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
    const fullPath = join11(dirPath, entry);
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
      const fullPath = join11(currentDir, entry);
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
var globTool = {
  definition: {
    name: "glob",
    description: "\u6309\u6A21\u5F0F\u641C\u7D22\u6587\u4EF6\uFF08\u652F\u6301 **/*.dart\u3001src/**/*.ts \u7B49 glob \u6A21\u5F0F\uFF09",
    parameters: {
      type: "object",
      properties: {
        pattern: {
          type: "string",
          description: "glob \u6A21\u5F0F\uFF0C\u5982 **/*.dart\u3001src/**/*.ts"
        },
        path: {
          type: "string",
          description: "\u641C\u7D22\u6839\u76EE\u5F55\uFF08\u9ED8\u8BA4\u5F53\u524D\u76EE\u5F55\uFF09"
        }
      },
      required: ["pattern"]
    }
  },
  async execute(args) {
    const { pattern, path: rootPath } = args;
    const root = resolve6(rootPath || ".");
    if (!existsSync6(root)) {
      return { success: false, output: "", error: `\u76EE\u5F55\u4E0D\u5B58\u5728: ${root}` };
    }
    try {
      const files = globMatch(root, pattern);
      return {
        success: true,
        output: files.length > 0 ? files.join("\n") : "\u672A\u627E\u5230\u5339\u914D\u6587\u4EF6"
      };
    } catch (error) {
      return { success: false, output: "", error: `\u641C\u7D22\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
};
function globMatch(root, pattern) {
  const results = [];
  const parts = pattern.split("/");
  const ignoreDirs = /* @__PURE__ */ new Set(["node_modules", ".git", "dist", "build", ".dart_tool", ".idea", ".vscode"]);
  function walk(dir, depth) {
    if (depth > 20) return;
    let entries;
    try {
      entries = readdirSync3(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (ignoreDirs.has(entry)) continue;
      const fullPath = join11(dir, entry);
      let stat;
      try {
        stat = statSync2(fullPath);
      } catch {
        continue;
      }
      const relativePath = fullPath.slice(root.length + 1);
      if (stat.isDirectory()) {
        if (parts.includes("**") || depth < parts.length - 1) {
          walk(fullPath, depth + 1);
        }
      } else {
        if (matchGlobPattern(relativePath, pattern)) {
          results.push(relativePath);
        }
      }
    }
    if (results.length > 200) return;
  }
  walk(root, 0);
  return results.slice(0, 200);
}
function matchGlobPattern(filePath, pattern) {
  const regexStr = pattern.replace(/\./g, "\\.").replace(/\*\*\//g, "(.+/)?").replace(/\*/g, "[^/]*").replace(/\?/g, "[^/]");
  return new RegExp(`^${regexStr}$`).test(filePath);
}
var grepTool = {
  definition: {
    name: "grep",
    description: "\u5728\u6587\u4EF6\u4E2D\u641C\u7D22\u5185\u5BB9\uFF08\u652F\u6301\u6B63\u5219\u3001\u6587\u4EF6\u7C7B\u578B\u8FC7\u6EE4\u3001\u4E0A\u4E0B\u6587\u884C\uFF09",
    parameters: {
      type: "object",
      properties: {
        pattern: {
          type: "string",
          description: "\u641C\u7D22\u6A21\u5F0F\uFF08\u6B63\u5219\u8868\u8FBE\u5F0F\uFF09"
        },
        path: {
          type: "string",
          description: "\u641C\u7D22\u76EE\u5F55\uFF08\u9ED8\u8BA4\u5F53\u524D\u76EE\u5F55\uFF09"
        },
        glob: {
          type: "string",
          description: "\u6587\u4EF6\u540D\u8FC7\u6EE4\uFF0C\u5982 *.ts\u3001*.dart"
        },
        context: {
          type: "number",
          description: "\u663E\u793A\u5339\u914D\u884C\u524D\u540E N \u884C\u4E0A\u4E0B\u6587\uFF08\u9ED8\u8BA4 0\uFF09"
        }
      },
      required: ["pattern"]
    }
  },
  async execute(args) {
    const { pattern, path: searchPath, glob: fileGlob, context: ctxLines } = args;
    const root = resolve6(searchPath || ".");
    const contextN = ctxLines ? parseInt(String(ctxLines)) : 0;
    if (!existsSync6(root)) {
      return { success: false, output: "", error: `\u76EE\u5F55\u4E0D\u5B58\u5728: ${root}` };
    }
    try {
      const results = grepSearch(root, pattern, fileGlob, contextN);
      return {
        success: true,
        output: results.length > 0 ? results.join("\n") : "\u672A\u627E\u5230\u5339\u914D\u5185\u5BB9"
      };
    } catch (error) {
      return { success: false, output: "", error: `\u641C\u7D22\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
};
function grepSearch(root, pattern, fileGlob, contextN = 0) {
  const results = [];
  const regex = new RegExp(pattern, "gi");
  const ignoreDirs = /* @__PURE__ */ new Set(["node_modules", ".git", "dist", "build", ".dart_tool", ".idea", ".vscode"]);
  function walk(dir) {
    if (results.length >= 100) return;
    let entries;
    try {
      entries = readdirSync3(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (results.length >= 100) return;
      if (ignoreDirs.has(entry)) continue;
      const fullPath = join11(dir, entry);
      let stat;
      try {
        stat = statSync2(fullPath);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        if (fileGlob && !matchGlob(entry, fileGlob)) continue;
        if (stat.size > 1024 * 1024) continue;
        try {
          const content = readFileSync6(fullPath, "utf-8");
          const lines = content.split("\n");
          const relativePath = fullPath.slice(root.length + 1).replace(/^\//, "");
          for (let i = 0; i < lines.length; i++) {
            if (regex.test(lines[i])) {
              regex.lastIndex = 0;
              if (contextN > 0) {
                const start = Math.max(0, i - contextN);
                for (let j = start; j < i; j++) {
                  results.push(`${relativePath}:${j + 1}- ${lines[j]}`);
                }
              }
              results.push(`${relativePath}:${i + 1}: ${lines[i]}`);
              if (contextN > 0) {
                const end = Math.min(lines.length - 1, i + contextN);
                for (let j = i + 1; j <= end; j++) {
                  results.push(`${relativePath}:${j + 1}- ${lines[j]}`);
                }
                results.push("");
              }
            } else {
              regex.lastIndex = 0;
            }
          }
        } catch {
        }
      }
    }
  }
  walk(root);
  return results.slice(0, 200);
}
var lsTool = {
  definition: {
    name: "ls",
    description: "\u5217\u51FA\u76EE\u5F55\u7ED3\u6784\uFF08\u6811\u5F62\u5C55\u793A\uFF09",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "\u76EE\u5F55\u8DEF\u5F84\uFF08\u9ED8\u8BA4\u5F53\u524D\u76EE\u5F55\uFF09"
        },
        depth: {
          type: "number",
          description: "\u9012\u5F52\u6DF1\u5EA6\uFF08\u9ED8\u8BA4 2\uFF09"
        }
      },
      required: []
    }
  },
  async execute(args) {
    const { path: dirPath, depth: depthStr } = args;
    const root = resolve6(dirPath || ".");
    const maxDepth = depthStr ? parseInt(String(depthStr)) : 2;
    if (!existsSync6(root)) {
      return { success: false, output: "", error: `\u76EE\u5F55\u4E0D\u5B58\u5728: ${root}` };
    }
    try {
      const lines = lsTree(root, maxDepth);
      return { success: true, output: lines.join("\n") };
    } catch (error) {
      return { success: false, output: "", error: `\u5217\u51FA\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
};
function lsTree(root, maxDepth) {
  const ignoreDirs = /* @__PURE__ */ new Set(["node_modules", ".git", "dist", "build", ".dart_tool"]);
  const lines = [root + "/"];
  function walk(dir, prefix, depth) {
    if (depth >= maxDepth) return;
    let entries;
    try {
      entries = readdirSync3(dir).sort((a, b) => {
        const aIsDir = statSync2(join11(dir, a)).isDirectory();
        const bIsDir = statSync2(join11(dir, b)).isDirectory();
        if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
        return a.localeCompare(b);
      });
    } catch {
      return;
    }
    entries = entries.filter((e) => !ignoreDirs.has(e));
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const isLast = i === entries.length - 1;
      const connector = isLast ? "\u2514\u2500\u2500 " : "\u251C\u2500\u2500 ";
      const fullPath = join11(dir, entry);
      let stat;
      try {
        stat = statSync2(fullPath);
      } catch {
        continue;
      }
      const isDir = stat.isDirectory();
      const display = isDir ? entry + "/" : entry;
      lines.push(prefix + connector + display);
      if (isDir) {
        const nextPrefix = prefix + (isLast ? "    " : "\u2502   ");
        walk(fullPath, nextPrefix, depth + 1);
      }
    }
  }
  walk(root, "", 0);
  return lines;
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

// src/memory/manager.ts
import { readFileSync as readFileSync7, writeFileSync as writeFileSync6, existsSync as existsSync7, mkdirSync as mkdirSync6, readdirSync as readdirSync4, unlinkSync } from "fs";
import { join as join12 } from "path";
import { homedir as homedir6 } from "os";

// src/memory/types.ts
var DEFAULT_THRESHOLD = {
  minConfidence: 0.6,
  minOccurrences: 2,
  blockTypes: ["temporary", "one_time"],
  maxEntries: 100
};

// src/memory/threshold.ts
function checkThreshold(name, type, content, existingEntries, config) {
  const threshold = { ...DEFAULT_THRESHOLD, ...config };
  const suggestions = [];
  let confidence = 0.5;
  if (content.trim().length < 10) {
    return {
      allowed: false,
      reason: "\u5185\u5BB9\u592A\u77ED\uFF0C\u4E0D\u503C\u5F97\u4F5C\u4E3A\u957F\u671F\u8BB0\u5FC6",
      confidence: 0,
      suggestions: ["\u8BF7\u63D0\u4F9B\u66F4\u8BE6\u7EC6\u7684\u4FE1\u606F"]
    };
  }
  const oneTimePatterns = [
    /^(帮我|请|现在|马上|立刻|赶紧)/,
    /^(运行|执行|启动|停止|重启)/,
    /^(查看|显示|列出|打印)/,
    /一下$/,
    /看看$/
  ];
  for (const pattern of oneTimePatterns) {
    if (pattern.test(content.trim())) {
      confidence -= 0.3;
      suggestions.push("\u8FD9\u770B\u8D77\u6765\u662F\u4E00\u6B21\u6027\u6307\u4EE4\uFF0C\u4E0D\u9002\u5408\u4F5C\u4E3A\u957F\u671F\u8BB0\u5FC6");
    }
  }
  const similarCount = countSimilarEntries(content, existingEntries);
  if (similarCount >= threshold.minOccurrences) {
    confidence += 0.3;
  } else if (similarCount >= 1) {
    confidence += 0.1;
    suggestions.push("\u5DF2\u6709\u7C7B\u4F3C\u8BB0\u5FC6\uFF0C\u5EFA\u8BAE\u5408\u5E76\u800C\u975E\u65B0\u5EFA");
  }
  const typeWeights = {
    user: 0.2,
    // 用户偏好通常稳定
    project: 0.15,
    // 项目知识较稳定
    feedback: 0.1,
    // 反馈可能变化
    reference: 0.1
    // 参考资料较稳定
  };
  confidence += typeWeights[type] || 0;
  const keywords = extractKeywords(content);
  if (keywords.length >= 3) {
    confidence += 0.15;
  } else if (keywords.length <= 1) {
    confidence -= 0.1;
    suggestions.push("\u4FE1\u606F\u5BC6\u5EA6\u8F83\u4F4E\uFF0C\u5EFA\u8BAE\u8865\u5145\u66F4\u591A\u7EC6\u8282");
  }
  const explicitRemember = [
    /记住/,
    /记下/,
    /以后/,
    /每次都/,
    /总是/,
    /不要/,
    /不喜欢/,
    /偏好/
  ];
  for (const pattern of explicitRemember) {
    if (pattern.test(content)) {
      confidence += 0.2;
      break;
    }
  }
  if (existingEntries.length >= threshold.maxEntries) {
    return {
      allowed: true,
      reason: `\u8BB0\u5FC6\u5DF2\u6EE1\uFF08${existingEntries.length}/${threshold.maxEntries}\uFF09\uFF0C\u5C06\u89E6\u53D1\u538B\u7F29`,
      confidence: Math.max(0, Math.min(1, confidence)),
      suggestions: ["\u5EFA\u8BAE\u5148\u538B\u7F29\u6216\u6E05\u7406\u65E7\u8BB0\u5FC6"]
    };
  }
  confidence = Math.max(0, Math.min(1, confidence));
  const allowed = confidence >= threshold.minConfidence;
  return {
    allowed,
    reason: allowed ? `\u7F6E\u4FE1\u5EA6 ${confidence.toFixed(2)} >= ${threshold.minConfidence}\uFF0C\u5141\u8BB8\u5199\u5165` : `\u7F6E\u4FE1\u5EA6 ${confidence.toFixed(2)} < ${threshold.minConfidence}\uFF0C\u5EFA\u8BAE\u6807\u8BB0\u4E3A\u4E0D\u7A33\u5B9A`,
    confidence,
    suggestions
  };
}
function countSimilarEntries(content, entries) {
  const contentLower = content.toLowerCase();
  const contentKeywords = extractKeywords(content);
  let count = 0;
  for (const entry of entries) {
    const entryLower = entry.content.toLowerCase();
    if (entryLower.includes(contentLower) || contentLower.includes(entryLower)) {
      count++;
      continue;
    }
    const entryKeywords = extractKeywords(entry.content);
    const overlap = contentKeywords.filter((k) => entryKeywords.includes(k));
    if (overlap.length >= Math.min(contentKeywords.length, entryKeywords.length) * 0.6) {
      count++;
    }
  }
  return count;
}
function extractKeywords(text) {
  const stopWords = /* @__PURE__ */ new Set([
    "\u7684",
    "\u4E86",
    "\u662F",
    "\u5728",
    "\u6211",
    "\u6709",
    "\u548C",
    "\u5C31",
    "\u4E0D",
    "\u4EBA",
    "\u90FD",
    "\u4E00",
    "\u4E00\u4E2A",
    "\u4E0A",
    "\u4E5F",
    "\u5F88",
    "\u5230",
    "\u8BF4",
    "\u8981",
    "\u53BB",
    "\u4F60",
    "\u4F1A",
    "\u7740",
    "\u6CA1\u6709",
    "\u770B",
    "\u597D",
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "to",
    "of",
    "in",
    "for",
    "on",
    "with"
  ]);
  const words = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !stopWords.has(w));
  return [...new Set(words)];
}

// src/memory/dedup.ts
function detectDuplicate(name, content, existingEntries) {
  if (existingEntries.length === 0) {
    return { isDuplicate: false, action: "create" };
  }
  const contentLower = content.toLowerCase().trim();
  const contentKeywords = extractKeywords2(contentLower);
  let bestMatch = null;
  let bestSimilarity = 0;
  for (const entry of existingEntries) {
    if (entry.name === name) continue;
    const similarity = calculateSimilarity(contentLower, entry.content.toLowerCase(), contentKeywords, entry);
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = entry;
    }
  }
  if (bestSimilarity > 0.85 && bestMatch) {
    return {
      isDuplicate: true,
      duplicateOf: bestMatch.name,
      similarity: bestSimilarity,
      action: "skip"
    };
  }
  if (bestSimilarity > 0.6 && bestMatch) {
    return {
      isDuplicate: true,
      duplicateOf: bestMatch.name,
      similarity: bestSimilarity,
      action: "merge"
    };
  }
  return { isDuplicate: false, action: "create" };
}
function mergeMemories(existing, newContent) {
  const existingLines = existing.content.split("\n").filter((l) => l.trim());
  const newLines = newContent.split("\n").filter((l) => l.trim());
  const mergedSet = /* @__PURE__ */ new Set([...existingLines, ...newLines]);
  const mergedContent = Array.from(mergedSet).join("\n");
  return {
    content: mergedContent,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    confidence: Math.min(1, existing.confidence + 0.1),
    // 合并后置信度略升
    source: "merge"
  };
}
function calculateSimilarity(content1, content2, keywords1, entry2) {
  if (content1 === content2) return 1;
  if (content2.includes(content1) || content1.includes(content2)) return 0.9;
  const keywords2 = extractKeywords2(content2);
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  const overlap = keywords1.filter((k) => keywords2.includes(k));
  const unionSize = (/* @__PURE__ */ new Set([...keywords1, ...keywords2])).size;
  const jaccardSimilarity = overlap.length / unionSize;
  let tagBonus = 0;
  if (entry2.tags && entry2.tags.length > 0) {
    const content1Tags = extractTags(content1);
    const tagOverlap = content1Tags.filter((t) => entry2.tags.includes(t));
    if (tagOverlap.length > 0) {
      tagBonus = 0.1;
    }
  }
  const typeBonus = 0.05;
  return Math.min(1, jaccardSimilarity + tagBonus + typeBonus);
}
function extractKeywords2(text) {
  const stopWords = /* @__PURE__ */ new Set([
    "\u7684",
    "\u4E86",
    "\u662F",
    "\u5728",
    "\u6211",
    "\u6709",
    "\u548C",
    "\u5C31",
    "\u4E0D",
    "\u4EBA",
    "\u90FD",
    "\u4E00",
    "\u4E00\u4E2A",
    "\u4E0A",
    "\u4E5F",
    "\u5F88",
    "\u5230",
    "\u8BF4",
    "\u8981",
    "\u53BB",
    "\u4F60",
    "\u4F1A",
    "\u7740",
    "\u6CA1\u6709",
    "\u770B",
    "\u597D",
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "to",
    "of",
    "in",
    "for",
    "on",
    "with"
  ]);
  return text.toLowerCase().replace(/[^\w\u4e00-\u9fff]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !stopWords.has(w));
}
function extractTags(text) {
  const tags = [];
  const patterns = [
    [/typescript|ts/i, "typescript"],
    [/javascript|js/i, "javascript"],
    [/python/i, "python"],
    [/java/i, "java"],
    [/react/i, "react"],
    [/vue/i, "vue"],
    [/api/i, "api"],
    [/数据库|database|sqlite/i, "database"],
    [/测试|test/i, "testing"],
    [/部署|deploy|ci\/cd/i, "deployment"],
    [/性能|performance/i, "performance"],
    [/安全|security/i, "security"],
    [/ui|界面|布局|layout/i, "ui"],
    [/架构|architecture/i, "architecture"],
    [/配置|config/i, "config"]
  ];
  for (const [pattern, tag] of patterns) {
    if (pattern.test(text)) tags.push(tag);
  }
  return tags;
}

// src/memory/compress.ts
function compressMemories(entries, options) {
  const maxEntries = options?.maxEntries || 100;
  const expireDays = options?.expireDays || 30;
  const minAccessCount = options?.minAccessCount || 0;
  const removed = [];
  let compressed = [...entries];
  compressed = expireOldMemories(compressed, expireDays, removed);
  compressed = expireLowValueMemories(compressed, minAccessCount, removed);
  compressed = mergeSimilarMemories(compressed, removed);
  if (compressed.length > maxEntries) {
    compressed = evictByPriority(compressed, maxEntries, removed);
  }
  const summary = generateCompressSummary(entries.length, compressed.length, removed);
  return { compressed, removed, summary };
}
function expireOldMemories(entries, expireDays, removed) {
  const cutoff = /* @__PURE__ */ new Date();
  cutoff.setDate(cutoff.getDate() - expireDays);
  return entries.filter((entry) => {
    const lastAccess = new Date(entry.lastAccessedAt || entry.updatedAt);
    if (lastAccess < cutoff && entry.accessCount === 0) {
      removed.push(entry.name);
      return false;
    }
    return true;
  });
}
function expireLowValueMemories(entries, minAccessCount, removed) {
  return entries.filter((entry) => {
    if (!entry.stable && entry.accessCount < minAccessCount && entry.confidence < 0.4) {
      removed.push(entry.name);
      return false;
    }
    return true;
  });
}
function mergeSimilarMemories(entries, removed) {
  const merged = [];
  const processed = /* @__PURE__ */ new Set();
  for (let i = 0; i < entries.length; i++) {
    if (processed.has(entries[i].name)) continue;
    let current = entries[i];
    const similar = [];
    for (let j = i + 1; j < entries.length; j++) {
      if (processed.has(entries[j].name)) continue;
      if (entries[j].type !== current.type) continue;
      const similarity = calculateContentSimilarity(current.content, entries[j].content);
      if (similarity > 0.5) {
        similar.push(entries[j]);
      }
    }
    if (similar.length > 0) {
      const toMerge = [current, ...similar];
      current = mergeEntries(toMerge);
      for (const entry of similar) {
        processed.add(entry.name);
        removed.push(entry.name);
      }
    }
    processed.add(current.name);
    merged.push(current);
  }
  return merged;
}
function evictByPriority(entries, maxEntries, removed) {
  const scored = entries.map((entry) => ({
    entry,
    score: calculatePriorityScore(entry)
  }));
  scored.sort((a, b) => b.score - a.score);
  const kept = scored.slice(0, maxEntries);
  const evicted = scored.slice(maxEntries);
  for (const { entry } of evicted) {
    removed.push(entry.name);
  }
  return kept.map((s) => s.entry);
}
function calculatePriorityScore(entry) {
  let score = 0;
  score += entry.confidence * 40;
  score += Math.min(30, entry.accessCount * 5);
  score += entry.stable ? 15 : 0;
  const typeWeights = {
    user: 15,
    project: 12,
    feedback: 10,
    reference: 8
  };
  score += typeWeights[entry.type] || 5;
  return score;
}
function mergeEntries(entries) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const base = sorted[0];
  const allLines = entries.flatMap((e) => e.content.split("\n").filter((l) => l.trim()));
  const uniqueLines = [...new Set(allLines)];
  const mergedContent = uniqueLines.join("\n");
  const allTags = [...new Set(entries.flatMap((e) => e.tags || []))];
  const maxConfidence = Math.max(...entries.map((e) => e.confidence));
  const totalAccess = entries.reduce((sum, e) => sum + e.accessCount, 0);
  return {
    ...base,
    content: mergedContent,
    tags: allTags,
    confidence: maxConfidence,
    accessCount: totalAccess,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    source: "merge"
  };
}
function calculateContentSimilarity(content1, content2) {
  const words1 = new Set(content1.toLowerCase().split(/\s+/).filter((w) => w.length > 1));
  const words2 = new Set(content2.toLowerCase().split(/\s+/).filter((w) => w.length > 1));
  if (words1.size === 0 || words2.size === 0) return 0;
  let overlap = 0;
  for (const word of words1) {
    if (words2.has(word)) overlap++;
  }
  const union = (/* @__PURE__ */ new Set([...words1, ...words2])).size;
  return overlap / union;
}
function generateCompressSummary(before, after, removed) {
  const diff = before - after;
  if (diff === 0) {
    return `\u8BB0\u5FC6\u6570\u91CF ${before} \u6761\uFF0C\u65E0\u9700\u538B\u7F29`;
  }
  return `\u538B\u7F29\u5B8C\u6210\uFF1A${before} \u2192 ${after} \u6761\uFF08\u51CF\u5C11 ${diff} \u6761\uFF09\u3002\u79FB\u9664\u9879\uFF1A${removed.join("\u3001")}`;
}

// src/memory/manager.ts
var MEMORY_DIR = join12(homedir6(), ".forge-cli", "memory");
var INDEX_FILE = join12(MEMORY_DIR, "MEMORY.md");
var MemoryManager = class {
  entries = /* @__PURE__ */ new Map();
  initialized = false;
  threshold;
  constructor(config) {
    this.threshold = { ...DEFAULT_THRESHOLD, ...config };
  }
  // ─── 初始化 ────────────────────────────────────────────
  init() {
    if (this.initialized) return;
    this.initialized = true;
    if (!existsSync7(MEMORY_DIR)) {
      mkdirSync6(MEMORY_DIR, { recursive: true });
    }
    const files = readdirSync4(MEMORY_DIR).filter((f) => f.endsWith(".md") && f !== "MEMORY.md");
    for (const file of files) {
      try {
        const filePath = join12(MEMORY_DIR, file);
        const content = readFileSync7(filePath, "utf-8");
        const entry = this.parseMemoryFile(file, content);
        if (entry) {
          this.entries.set(entry.name, entry);
        }
      } catch {
      }
    }
  }
  // ─── 查询 ──────────────────────────────────────────────
  getAll() {
    this.init();
    return Array.from(this.entries.values());
  }
  getByType(type) {
    this.init();
    return this.getAll().filter((e) => e.type === type);
  }
  get(name) {
    this.init();
    return this.entries.get(name);
  }
  // ─── 召回（增强版） ────────────────────────────────────
  /**
   * 按需召回记忆
   * 支持：关键词匹配 + 类型过滤 + 标签过滤 + 置信度过滤 + 多种排序
   */
  recall(options = {}) {
    this.init();
    let entries = this.getAll();
    if (options.type) {
      entries = entries.filter((e) => e.type === options.type);
    }
    if (options.tags && options.tags.length > 0) {
      entries = entries.filter(
        (e) => e.tags && options.tags.some((t) => e.tags.includes(t))
      );
    }
    const minConf = options.minConfidence ?? 0;
    if (minConf > 0) {
      entries = entries.filter((e) => e.confidence >= minConf);
    }
    let results = entries.map((entry) => {
      const score = this.calculateRelevanceScore(entry, options.query);
      return {
        entry,
        score,
        matchReason: this.getMatchReason(entry, options.query)
      };
    });
    switch (options.sortBy) {
      case "recency":
        results.sort(
          (a, b) => new Date(b.entry.updatedAt).getTime() - new Date(a.entry.updatedAt).getTime()
        );
        break;
      case "frequency":
        results.sort((a, b) => b.entry.accessCount - a.entry.accessCount);
        break;
      case "relevance":
      default:
        results.sort((a, b) => b.score - a.score);
        break;
    }
    if (options.limit) {
      results = results.slice(0, options.limit);
    }
    for (const result of results) {
      this.recordAccess(result.entry.name);
    }
    return results;
  }
  /**
   * 简单搜索（向后兼容）
   */
  search(query) {
    return this.recall({ query, sortBy: "relevance" }).map((r) => r.entry);
  }
  /**
   * 计算相关性分数
   */
  calculateRelevanceScore(entry, query) {
    if (!query) {
      return entry.confidence * 0.7 + Math.min(0.3, entry.accessCount * 0.05);
    }
    const queryLower = query.toLowerCase();
    const contentLower = entry.content.toLowerCase();
    const nameLower = entry.name.toLowerCase();
    const descLower = entry.description.toLowerCase();
    let score = 0;
    if (nameLower.includes(queryLower)) score += 0.4;
    if (descLower.includes(queryLower)) score += 0.2;
    if (contentLower.includes(queryLower)) score += 0.2;
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 1);
    const matchedWords = queryWords.filter(
      (w) => contentLower.includes(w) || nameLower.includes(w) || descLower.includes(w)
    );
    if (queryWords.length > 0) {
      score += matchedWords.length / queryWords.length * 0.2;
    }
    score *= 0.5 + entry.confidence * 0.5;
    return Math.min(1, score);
  }
  /**
   * 获取匹配原因
   */
  getMatchReason(entry, query) {
    if (!query) return "\u9ED8\u8BA4\u6392\u5E8F";
    const queryLower = query.toLowerCase();
    const reasons = [];
    if (entry.name.toLowerCase().includes(queryLower)) reasons.push("\u540D\u79F0\u5339\u914D");
    if (entry.description.toLowerCase().includes(queryLower)) reasons.push("\u63CF\u8FF0\u5339\u914D");
    if (entry.content.toLowerCase().includes(queryLower)) reasons.push("\u5185\u5BB9\u5339\u914D");
    return reasons.length > 0 ? reasons.join("+") : "\u5173\u952E\u8BCD\u5339\u914D";
  }
  /**
   * 记录访问
   */
  recordAccess(name) {
    const entry = this.entries.get(name);
    if (entry) {
      entry.accessCount++;
      entry.lastAccessedAt = (/* @__PURE__ */ new Date()).toISOString();
      this.saveEntryFile(entry);
    }
  }
  // ─── 写入（增强版） ────────────────────────────────────
  /**
   * 带门槛检查的写入
   */
  save(name, type, description, content) {
    this.init();
    const thresholdResult = checkThreshold(name, type, content, this.getAll(), this.threshold);
    const dedupResult = detectDuplicate(name, content, this.getAll());
    if (dedupResult.action === "skip") {
      return {
        entry: null,
        action: "skipped",
        message: `\u4E0E\u8BB0\u5FC6 "${dedupResult.duplicateOf}" \u9AD8\u5EA6\u91CD\u590D\uFF08${(dedupResult.similarity * 100).toFixed(0)}%\uFF09\uFF0C\u8DF3\u8FC7`
      };
    }
    if (dedupResult.action === "merge" && dedupResult.duplicateOf) {
      const existing = this.entries.get(dedupResult.duplicateOf);
      if (existing) {
        const merged = mergeMemories(existing, content);
        Object.assign(existing, merged);
        this.saveEntryFile(existing);
        this.updateIndex();
        return {
          entry: existing,
          action: "merged",
          message: `\u5DF2\u5408\u5E76\u5230\u8BB0\u5FC6 "${dedupResult.duplicateOf}"\uFF08\u76F8\u4F3C\u5EA6 ${(dedupResult.similarity * 100).toFixed(0)}%\uFF09`
        };
      }
    }
    const confidence = thresholdResult.confidence;
    const stable = confidence >= this.threshold.minConfidence;
    const entry = this.createEntry(name, type, description, content, confidence, stable);
    if (this.entries.size >= this.threshold.maxEntries) {
      this.autoCompress();
    }
    this.entries.set(name, entry);
    this.saveEntryFile(entry);
    this.updateIndex();
    return {
      entry,
      action: "created",
      message: stable ? `\u5DF2\u4FDD\u5B58\uFF08\u7F6E\u4FE1\u5EA6 ${confidence.toFixed(2)}\uFF0C\u7A33\u5B9A\uFF09` : `\u5DF2\u4FDD\u5B58\u4E3A\u4E0D\u7A33\u5B9A\u8BB0\u5FC6\uFF08\u7F6E\u4FE1\u5EA6 ${confidence.toFixed(2)}\uFF09\uFF0C\u9700\u8981\u66F4\u591A\u9A8C\u8BC1`
    };
  }
  /**
   * 直接写入（跳过门槛检查，用于用户明确要求的记忆）
   */
  saveDirect(name, type, description, content) {
    this.init();
    const existing = this.entries.get(name);
    if (existing) {
      existing.content = content;
      existing.description = description;
      existing.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      existing.confidence = 1;
      existing.stable = true;
      this.saveEntryFile(existing);
      this.updateIndex();
      return existing;
    }
    const entry = this.createEntry(name, type, description, content, 1, true);
    this.entries.set(name, entry);
    this.saveEntryFile(entry);
    this.updateIndex();
    return entry;
  }
  // ─── 删除 ──────────────────────────────────────────────
  delete(name) {
    this.init();
    const entry = this.entries.get(name);
    if (!entry) return false;
    try {
      if (existsSync7(entry.filePath)) {
        unlinkSync(entry.filePath);
      }
    } catch {
    }
    this.entries.delete(name);
    this.updateIndex();
    return true;
  }
  // ─── 压缩 ──────────────────────────────────────────────
  /**
   * 手动触发压缩
   */
  compress(options) {
    this.init();
    const result = compressMemories(this.getAll(), {
      maxEntries: options?.maxEntries || this.threshold.maxEntries,
      expireDays: options?.expireDays || 30
    });
    this.applyCompressResult(result);
    return result;
  }
  /**
   * 自动压缩（写入时触发）
   */
  autoCompress() {
    const result = compressMemories(this.getAll(), {
      maxEntries: this.threshold.maxEntries - 10,
      // 留出空间
      expireDays: 30
    });
    this.applyCompressResult(result);
  }
  /**
   * 应用压缩结果
   */
  applyCompressResult(result) {
    for (const name of result.removed) {
      const entry = this.entries.get(name);
      if (entry && existsSync7(entry.filePath)) {
        try {
          unlinkSync(entry.filePath);
        } catch {
        }
      }
      this.entries.delete(name);
    }
    for (const entry of result.compressed) {
      this.entries.set(entry.name, entry);
      this.saveEntryFile(entry);
    }
    this.updateIndex();
  }
  // ─── 内部方法 ──────────────────────────────────────────
  createEntry(name, type, description, content, confidence, stable) {
    const fileName = `${type}_${name.replace(/[^a-zA-Z0-9_-]/g, "_")}.md`;
    const filePath = join12(MEMORY_DIR, fileName);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return {
      name,
      description,
      type,
      content,
      filePath,
      createdAt: now,
      updatedAt: now,
      confidence,
      accessCount: 0,
      lastAccessedAt: now,
      tags: this.extractTags(content),
      source: "user_input",
      stable
    };
  }
  extractTags(text) {
    const tags = [];
    const patterns = [
      [/typescript|ts/i, "typescript"],
      [/javascript|js/i, "javascript"],
      [/python/i, "python"],
      [/java/i, "java"],
      [/api/i, "api"],
      [/数据库|database|sqlite/i, "database"],
      [/测试|test/i, "testing"],
      [/ui|界面|布局/i, "ui"],
      [/架构|architecture/i, "architecture"],
      [/配置|config/i, "config"],
      [/部署|deploy/i, "deploy"]
    ];
    for (const [pattern, tag] of patterns) {
      if (pattern.test(text)) tags.push(tag);
    }
    return tags;
  }
  saveEntryFile(entry) {
    const fileContent = [
      "---",
      `name: ${entry.name}`,
      `description: ${entry.description}`,
      `type: ${entry.type}`,
      `confidence: ${entry.confidence}`,
      `stable: ${entry.stable}`,
      `accessCount: ${entry.accessCount}`,
      `source: ${entry.source}`,
      `tags: [${entry.tags.join(", ")}]`,
      "---",
      "",
      entry.content
    ].join("\n");
    writeFileSync6(entry.filePath, fileContent, "utf-8");
  }
  updateIndex() {
    const lines = ["# MEMORY.md", "", "> \u8BB0\u5FC6\u7CFB\u7EDF\u7D22\u5F15\uFF0C\u81EA\u52A8\u7EF4\u62A4", ""];
    const byType = {
      user: [],
      project: [],
      feedback: [],
      reference: []
    };
    for (const entry of this.entries.values()) {
      byType[entry.type].push(entry);
    }
    const typeLabels = {
      user: "\u7528\u6237\u4FE1\u606F",
      project: "\u9879\u76EE\u4FE1\u606F",
      feedback: "\u7528\u6237\u53CD\u9988",
      reference: "\u53C2\u8003\u8D44\u6599"
    };
    for (const [type, entries] of Object.entries(byType)) {
      if (entries.length === 0) continue;
      lines.push(`## ${typeLabels[type]}`);
      for (const e of entries) {
        const file = e.filePath.split("/").pop() || e.filePath;
        const stableTag = e.stable ? "" : " \u26A0\uFE0F";
        const confTag = ` [${(e.confidence * 100).toFixed(0)}%]`;
        lines.push(`- [${e.name}](${file}) \u2014 ${e.description}${confTag}${stableTag}`);
      }
      lines.push("");
    }
    writeFileSync6(INDEX_FILE, lines.join("\n"), "utf-8");
  }
  parseMemoryFile(fileName, content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return null;
    const metaStr = match[1];
    const body = match[2].trim();
    const name = metaStr.match(/name:\s*(.+)/)?.[1]?.trim() || fileName.replace(".md", "");
    const description = metaStr.match(/description:\s*(.+)/)?.[1]?.trim() || "";
    const type = metaStr.match(/type:\s*(\w+)/)?.[1] || "user";
    const confidence = parseFloat(metaStr.match(/confidence:\s*([\d.]+)/)?.[1] || "0.5");
    const stable = metaStr.match(/stable:\s*(true|false)/)?.[1] === "true";
    const accessCount = parseInt(metaStr.match(/accessCount:\s*(\d+)/)?.[1] || "0", 10);
    const source = metaStr.match(/source:\s*(\w+)/)?.[1] || "user_input";
    const tagsStr = metaStr.match(/tags:\s*\[(.+?)\]/)?.[1] || "";
    const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
    return {
      name,
      description,
      type,
      content: body,
      filePath: join12(MEMORY_DIR, fileName),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      confidence,
      accessCount,
      lastAccessedAt: (/* @__PURE__ */ new Date()).toISOString(),
      tags,
      source,
      stable
    };
  }
  // ─── 上下文注入 ────────────────────────────────────────
  getContextString() {
    this.init();
    if (this.entries.size === 0) return "";
    const lines = ["## \u8BB0\u5FC6\u7CFB\u7EDF"];
    const userMemories = this.getByType("user");
    if (userMemories.length > 0) {
      lines.push("### \u7528\u6237\u4FE1\u606F");
      for (const m of userMemories) {
        const stableTag = m.stable ? "" : " [\u5F85\u9A8C\u8BC1]";
        lines.push(`- ${m.description}: ${m.content.split("\n")[0]}${stableTag}`);
      }
    }
    const projectMemories = this.getByType("project");
    if (projectMemories.length > 0) {
      lines.push("### \u9879\u76EE\u4FE1\u606F");
      for (const m of projectMemories) {
        lines.push(`- ${m.description}: ${m.content.split("\n")[0]}`);
      }
    }
    const feedbackMemories = this.getByType("feedback");
    if (feedbackMemories.length > 0) {
      lines.push("### \u7528\u6237\u53CD\u9988");
      for (const m of feedbackMemories) {
        lines.push(`- ${m.content.split("\n")[0]}`);
      }
    }
    return lines.join("\n");
  }
  // ─── 统计 ──────────────────────────────────────────────
  getStats() {
    this.init();
    const all = this.getAll();
    const byType = {
      user: 0,
      project: 0,
      feedback: 0,
      reference: 0
    };
    let totalConfidence = 0;
    let totalAccess = 0;
    let stable = 0;
    for (const entry of all) {
      byType[entry.type]++;
      totalConfidence += entry.confidence;
      totalAccess += entry.accessCount;
      if (entry.stable) stable++;
    }
    return {
      total: all.length,
      byType,
      stable,
      unstable: all.length - stable,
      avgConfidence: all.length > 0 ? totalConfidence / all.length : 0,
      totalAccess
    };
  }
};
var memoryManager = new MemoryManager();

// src/tools/memory.ts
var saveMemoryTool = {
  definition: {
    name: "save_memory",
    description: "\u4FDD\u5B58\u8BB0\u5FC6\u5230\u8DE8\u4F1A\u8BDD\u6301\u4E45\u5316\u5B58\u50A8\u3002\u7528\u4E8E\u8BB0\u4F4F\u7528\u6237\u504F\u597D\u3001\u9879\u76EE\u77E5\u8BC6\u3001\u91CD\u8981\u51B3\u7B56\u7B49\u3002",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "\u8BB0\u5FC6\u540D\u79F0\uFF08\u7B80\u77ED\u6807\u8BC6\uFF0C\u5982 user_role\u3001project_arch\uFF09"
        },
        type: {
          type: "string",
          description: "\u8BB0\u5FC6\u7C7B\u578B\uFF1Auser\uFF08\u7528\u6237\u4FE1\u606F\uFF09\u3001project\uFF08\u9879\u76EE\u4FE1\u606F\uFF09\u3001feedback\uFF08\u53CD\u9988\u7EA0\u6B63\uFF09\u3001reference\uFF08\u53C2\u8003\u8D44\u6599\uFF09"
        },
        description: {
          type: "string",
          description: "\u4E00\u884C\u63CF\u8FF0\uFF0C\u7528\u4E8E\u7D22\u5F15\u548C\u68C0\u7D22"
        },
        content: {
          type: "string",
          description: "\u8BB0\u5FC6\u5185\u5BB9\uFF08Markdown \u683C\u5F0F\uFF09"
        }
      },
      required: ["name", "type", "description", "content"]
    }
  },
  async execute(args) {
    const { name, type, description, content } = args;
    if (!name || !type || !description || !content) {
      return { success: false, output: "", error: "\u7F3A\u5C11\u5FC5\u586B\u53C2\u6570" };
    }
    const validTypes = ["user", "project", "feedback", "reference"];
    if (!validTypes.includes(type)) {
      return { success: false, output: "", error: `\u65E0\u6548\u7684\u8BB0\u5FC6\u7C7B\u578B: ${type}\uFF0C\u53EF\u9009: ${validTypes.join(", ")}` };
    }
    try {
      const result = memoryManager.save(name, type, description, content);
      if (result.action === "blocked" || result.action === "skipped") {
        return { success: true, output: result.message };
      }
      return {
        success: true,
        output: result.message
      };
    } catch (error) {
      return { success: false, output: "", error: `\u4FDD\u5B58\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
};
var readMemoryTool = {
  definition: {
    name: "read_memory",
    description: "\u8BFB\u53D6\u8BB0\u5FC6\u3002\u53EF\u6309\u540D\u79F0\u3001\u7C7B\u578B\u641C\u7D22\uFF0C\u6216\u5217\u51FA\u6240\u6709\u8BB0\u5FC6\u3002",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "\u641C\u7D22\u5173\u952E\u8BCD\uFF08\u53EF\u9009\uFF0C\u4E0D\u586B\u5219\u5217\u51FA\u6240\u6709\u8BB0\u5FC6\u7D22\u5F15\uFF09"
        },
        type: {
          type: "string",
          description: "\u6309\u7C7B\u578B\u8FC7\u6EE4\uFF1Auser\u3001project\u3001feedback\u3001reference\uFF08\u53EF\u9009\uFF09"
        },
        name: {
          type: "string",
          description: "\u6309\u540D\u79F0\u7CBE\u786E\u8BFB\u53D6\uFF08\u53EF\u9009\uFF09"
        }
      },
      required: []
    }
  },
  async execute(args) {
    const { query, type, name } = args;
    try {
      if (name) {
        const entry = memoryManager.get(name);
        if (!entry) {
          return { success: false, output: "", error: `\u8BB0\u5FC6\u4E0D\u5B58\u5728: ${name}` };
        }
        const stableTag = entry.stable ? "\u2713 \u7A33\u5B9A" : "\u26A0\uFE0F \u5F85\u9A8C\u8BC1";
        const confPct = (entry.confidence * 100).toFixed(0);
        return {
          success: true,
          output: `# ${entry.name}

**\u7C7B\u578B**: ${entry.type} | **\u63CF\u8FF0**: ${entry.description} | **\u7F6E\u4FE1\u5EA6**: ${confPct}% | ${stableTag} | **\u8BBF\u95EE\u6B21\u6570**: ${entry.accessCount}

${entry.content}`
        };
      }
      if (type) {
        const entries2 = memoryManager.getByType(type);
        if (entries2.length === 0) {
          return { success: true, output: `\u65E0 ${type} \u7C7B\u578B\u7684\u8BB0\u5FC6` };
        }
        const lines2 = entries2.map((e) => {
          const stableTag = e.stable ? "\u2713" : "\u26A0\uFE0F";
          return `- ${stableTag} **${e.name}** [${(e.confidence * 100).toFixed(0)}%]: ${e.description}`;
        });
        return { success: true, output: lines2.join("\n") };
      }
      if (query) {
        const results = memoryManager.recall({ query, limit: 10 });
        if (results.length === 0) {
          return { success: true, output: `\u672A\u627E\u5230\u4E0E "${query}" \u76F8\u5173\u7684\u8BB0\u5FC6` };
        }
        const lines2 = results.map((r) => {
          const e = r.entry;
          const stableTag = e.stable ? "\u2713" : "\u26A0\uFE0F";
          return `- ${stableTag} **${e.name}** (${e.type}) [${(r.score * 100).toFixed(0)}%]: ${e.description} \u2014 ${r.matchReason}`;
        });
        return { success: true, output: lines2.join("\n") };
      }
      const entries = memoryManager.getAll();
      if (entries.length === 0) {
        return { success: true, output: "\u6682\u65E0\u8BB0\u5FC6" };
      }
      const lines = entries.map((e) => {
        const stableTag = e.stable ? "\u2713" : "\u26A0\uFE0F";
        return `- ${stableTag} **${e.name}** (${e.type}) [${(e.confidence * 100).toFixed(0)}%]: ${e.description}`;
      });
      const stats = memoryManager.getStats();
      lines.push(`
**\u7EDF\u8BA1**: \u5171 ${stats.total} \u6761 | \u7A33\u5B9A ${stats.stable} | \u5F85\u9A8C\u8BC1 ${stats.unstable} | \u5E73\u5747\u7F6E\u4FE1\u5EA6 ${(stats.avgConfidence * 100).toFixed(0)}%`);
      return { success: true, output: lines.join("\n") };
    } catch (error) {
      return { success: false, output: "", error: `\u8BFB\u53D6\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
};
var compressMemoryTool = {
  definition: {
    name: "compress_memory",
    description: "\u538B\u7F29\u8BB0\u5FC6\uFF1A\u5408\u5E76\u76F8\u4F3C\u6761\u76EE\u3001\u6DD8\u6C70\u8FC7\u671F/\u4F4E\u4EF7\u503C\u8BB0\u5FC6\u3002\u5F53\u8BB0\u5FC6\u6570\u91CF\u8F83\u591A\u65F6\u81EA\u52A8\u8C03\u7528\u3002",
    parameters: {
      type: "object",
      properties: {
        expireDays: {
          type: "number",
          description: "\u8FC7\u671F\u5929\u6570\uFF08\u8D85\u8FC7\u6B64\u5929\u6570\u4E14\u672A\u88AB\u8BBF\u95EE\u7684\u8BB0\u5FC6\u5C06\u88AB\u6DD8\u6C70\uFF0C\u9ED8\u8BA4 30\uFF09"
        }
      },
      required: []
    }
  },
  async execute(args) {
    const expireDays = args.expireDays ? parseInt(args.expireDays, 10) : 30;
    try {
      const result = memoryManager.compress({ expireDays });
      return {
        success: true,
        output: result.summary
      };
    } catch (error) {
      return { success: false, output: "", error: `\u538B\u7F29\u5931\u8D25: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
};
var deleteMemoryTool = {
  definition: {
    name: "delete_memory",
    description: "\u5220\u9664\u6307\u5B9A\u540D\u79F0\u7684\u8BB0\u5FC6",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "\u8981\u5220\u9664\u7684\u8BB0\u5FC6\u540D\u79F0"
        }
      },
      required: ["name"]
    }
  },
  async execute(args) {
    const { name } = args;
    if (!name) {
      return { success: false, output: "", error: "\u7F3A\u5C11\u8BB0\u5FC6\u540D\u79F0" };
    }
    const deleted = memoryManager.delete(name);
    if (!deleted) {
      return { success: false, output: "", error: `\u8BB0\u5FC6\u4E0D\u5B58\u5728: ${name}` };
    }
    return { success: true, output: `\u5DF2\u5220\u9664\u8BB0\u5FC6: ${name}` };
  }
};

// src/tools/index.ts
function registerAllTools() {
  toolRegistry.register(readFileTool);
  toolRegistry.register(writeFileTool);
  toolRegistry.register(editFileTool);
  toolRegistry.register(listFilesTool);
  toolRegistry.register(searchFilesTool);
  toolRegistry.register(globTool);
  toolRegistry.register(grepTool);
  toolRegistry.register(lsTool);
  toolRegistry.register(runCommandTool);
  toolRegistry.register(runCommandWithOutputTool);
  toolRegistry.register(saveMemoryTool);
  toolRegistry.register(readMemoryTool);
  toolRegistry.register(deleteMemoryTool);
  toolRegistry.register(compressMemoryTool);
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
import chalk5 from "chalk";

// src/cli/renderer.ts
import chalk3 from "chalk";
function renderBanner(version, model, projectRoot) {
  const lines = [
    chalk3.cyan("\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557"),
    chalk3.cyan("\u2551") + chalk3.bold("  Forge CLI ") + chalk3.dim(`v${version}`) + "                         " + chalk3.cyan("\u2551"),
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
    ["/memory", "\u67E5\u770B\u5DF2\u4FDD\u5B58\u7684\u8BB0\u5FC6"],
    ["/hook", "\u67E5\u770B\u5DF2\u6CE8\u518C\u94A9\u5B50"],
    ["/trace", "\u67E5\u770B\u6700\u8FD1\u4E00\u6B21\u6267\u884C\u7684 Trace \u6458\u8981"],
    ["/theme", "\u5207\u6362\u4E3B\u9898"],
    ["/git", "Git \u64CD\u4F5C\uFF1Astatus/log/branch/add/commit/diff/remote"],
    ["/diff", "\u67E5\u770B Diff\uFF1A/diff <old> <new> \u6216 /diff --staged"],
    ["/lint", "Lint \u68C0\u67E5\uFF1A/lint \u6216 /lint <file>"],
    ["/test", "\u8FD0\u884C\u6D4B\u8BD5\uFF1A/test \u6216 /test <args>"],
    ["/ast", "\u67E5\u770B\u6587\u4EF6\u7ED3\u6784\uFF1A/ast <file> \u6216 /ast --init"],
    ["/symbol", "\u641C\u7D22\u7B26\u53F7\uFF1A/symbol <query> \u6216 /sym <query>"],
    ["/fetch", "\u83B7\u53D6\u7F51\u9875\uFF1A/fetch <url> \u6216 /web <url>"],
    ["/search", "\u7F51\u7EDC\u641C\u7D22\uFF1A/search <query> \u6216 /s <query>"],
    ["/state", "\u72B6\u6001\u673A\u7BA1\u7406\uFF1A/state status/history/graph/snapshot/restore/reset"],
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
function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}

// src/cli/commands.ts
init_theme();

// src/cli/git.ts
init_theme();
import { execSync, exec as exec3 } from "child_process";
var GitManager = class {
  cwd;
  constructor(cwd) {
    this.cwd = cwd || process.cwd();
  }
  /**
   * 执行 Git 命令
   */
  exec(command) {
    try {
      return execSync(`git ${command}`, {
        cwd: this.cwd,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"]
      }).trim();
    } catch (error) {
      throw new Error(`Git command failed: ${error.message}`);
    }
  }
  /**
   * 异步执行 Git 命令
   */
  execAsync(command) {
    return new Promise((resolve8, reject) => {
      exec3(`git ${command}`, {
        cwd: this.cwd,
        encoding: "utf-8"
      }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Git command failed: ${stderr || error.message}`));
        } else {
          resolve8(stdout.trim());
        }
      });
    });
  }
  /**
   * 检查是否是 Git 仓库
   */
  isRepository() {
    try {
      this.exec("rev-parse --git-dir");
      return true;
    } catch {
      return false;
    }
  }
  /**
   * 获取当前分支
   */
  getCurrentBranch() {
    return this.exec("rev-parse --abbrev-ref HEAD");
  }
  /**
   * 获取 Git 状态
   */
  getStatus() {
    const branch = this.getCurrentBranch();
    let upstream;
    let ahead = 0;
    let behind = 0;
    try {
      upstream = this.exec(`rev-parse --abbrev-ref ${branch}@{upstream}`);
      const aheadBehind = this.exec(`rev-list --left-right --count ${branch}...${upstream}`).split("	");
      ahead = parseInt(aheadBehind[0]) || 0;
      behind = parseInt(aheadBehind[1]) || 0;
    } catch {
    }
    const statusOutput = this.exec("status --porcelain");
    const staged = [];
    const unstaged = [];
    const untracked = [];
    for (const line of statusOutput.split("\n")) {
      if (!line.trim()) continue;
      const indexStatus = line[0];
      const workTreeStatus = line[1];
      const filePath = line.slice(3);
      if (indexStatus !== " " && indexStatus !== "?") {
        staged.push({
          path: filePath,
          status: this.parseFileStatus(indexStatus),
          staged: true
        });
      }
      if (workTreeStatus !== " " && workTreeStatus !== "?") {
        unstaged.push({
          path: filePath,
          status: this.parseFileStatus(workTreeStatus),
          staged: false
        });
      }
      if (indexStatus === "?" && workTreeStatus === "?") {
        untracked.push(filePath);
      }
    }
    return {
      branch,
      upstream,
      ahead,
      behind,
      staged,
      unstaged,
      untracked
    };
  }
  /**
   * 解析文件状态
   */
  parseFileStatus(status) {
    switch (status) {
      case "A":
        return "added";
      case "M":
        return "modified";
      case "D":
        return "deleted";
      case "R":
        return "renamed";
      case "C":
        return "copied";
      case "U":
        return "unmerged";
      default:
        return "modified";
    }
  }
  /**
   * 获取提交历史
   */
  async getLog(count = 10) {
    const output = await this.execAsync(
      `log --oneline --format="%H|%h|%an|%ai|%s" -n ${count}`
    );
    return output.split("\n").filter(Boolean).map((line) => {
      const [hash, shortHash, author, date, message] = line.split("|");
      return { hash, shortHash, author, date, message };
    });
  }
  /**
   * 获取分支列表
   */
  getBranches() {
    const output = this.exec("branch -vv");
    const currentBranch = this.getCurrentBranch();
    return output.split("\n").filter(Boolean).map((line) => {
      const isCurrent = line.startsWith("*");
      const match = line.match(/^\*?\s+(\S+)\s+(\S+)\s+(?:\[(.+?)\])?\s*(.*)$/);
      if (!match) {
        return {
          name: line.replace(/^\*?\s+/, "").split(/\s+/)[0],
          current: isCurrent
        };
      }
      return {
        name: match[1],
        current: isCurrent,
        upstream: match[3]
      };
    });
  }
  /**
   * 获取远程仓库列表
   */
  getRemotes() {
    const output = this.exec("remote -v");
    const remotes = [];
    const seen = /* @__PURE__ */ new Set();
    for (const line of output.split("\n").filter(Boolean)) {
      const match = line.match(/^(\S+)\s+(\S+)\s+\((\w+)\)$/);
      if (match && !seen.has(match[1])) {
        remotes.push({ name: match[1], url: match[2] });
        seen.add(match[1]);
      }
    }
    return remotes;
  }
  /**
   * 暂存文件
   */
  stage(files) {
    if (files.length === 0) return;
    this.exec(`add ${files.map((f) => `"${f}"`).join(" ")}`);
  }
  /**
   * 暂存所有文件
   */
  stageAll() {
    this.exec("add -A");
  }
  /**
   * 取消暂存文件
   */
  unstage(files) {
    if (files.length === 0) return;
    this.exec(`reset HEAD ${files.map((f) => `"${f}"`).join(" ")}`);
  }
  /**
   * 提交
   */
  commit(message) {
    return this.exec(`commit -m "${message.replace(/"/g, '\\"')}"`);
  }
  /**
   * 创建分支
   */
  createBranch(name) {
    this.exec(`branch ${name}`);
  }
  /**
   * 切换分支
   */
  checkout(branch) {
    this.exec(`checkout ${branch}`);
  }
  /**
   * 合并分支
   */
  merge(branch) {
    return this.exec(`merge ${branch}`);
  }
  /**
   * 拉取
   */
  pull() {
    return this.exec("pull");
  }
  /**
   * 推送
   */
  push() {
    return this.exec("push");
  }
  /**
   * 获取文件 Diff
   */
  getDiff(file, staged = false) {
    const stagedFlag = staged ? "--staged" : "";
    const fileArg = file ? `-- "${file}"` : "";
    return this.exec(`diff ${stagedFlag} ${fileArg}`);
  }
  /**
   * 获取文件内容（指定版本）
   */
  getFileAtRevision(filePath, revision = "HEAD") {
    return this.exec(`show ${revision}:"${filePath}"`);
  }
  /**
   * 获取当前文件内容
   */
  getFileContent(filePath) {
    try {
      return this.exec(`show HEAD:"${filePath}"`);
    } catch {
      const fs = __require("fs");
      const path = __require("path");
      return fs.readFileSync(path.join(this.cwd, filePath), "utf-8");
    }
  }
  /**
   * 渲染 Git 状态
   */
  renderStatus(status) {
    const theme = getTheme();
    const lines = [];
    lines.push(theme.text.bold("\u5206\u652F\u4FE1\u606F:"));
    lines.push(`  ${theme.claude("\u5F53\u524D\u5206\u652F:")} ${theme.text(status.branch)}`);
    if (status.upstream) {
      lines.push(`  ${theme.claude("\u4E0A\u6E38\u5206\u652F:")} ${theme.text(status.upstream)}`);
      if (status.ahead > 0) {
        lines.push(`  ${theme.warning("\u9886\u5148:")} ${status.ahead} \u4E2A\u63D0\u4EA4`);
      }
      if (status.behind > 0) {
        lines.push(`  ${theme.warning("\u843D\u540E:")} ${status.behind} \u4E2A\u63D0\u4EA4`);
      }
    }
    if (status.staged.length > 0) {
      lines.push("");
      lines.push(theme.text.bold("\u5DF2\u6682\u5B58\u7684\u6587\u4EF6:"));
      for (const file of status.staged) {
        const icon = this.getStatusIcon(file.status);
        lines.push(`  ${theme.success(icon)} ${file.path}`);
      }
    }
    if (status.unstaged.length > 0) {
      lines.push("");
      lines.push(theme.text.bold("\u672A\u6682\u5B58\u7684\u6587\u4EF6:"));
      for (const file of status.unstaged) {
        const icon = this.getStatusIcon(file.status);
        lines.push(`  ${theme.error(icon)} ${file.path}`);
      }
    }
    if (status.untracked.length > 0) {
      lines.push("");
      lines.push(theme.text.bold("\u672A\u8DDF\u8E2A\u7684\u6587\u4EF6:"));
      for (const file of status.untracked) {
        lines.push(`  ${theme.subtle("?")} ${file}`);
      }
    }
    if (status.staged.length === 0 && status.unstaged.length === 0 && status.untracked.length === 0) {
      lines.push("");
      lines.push(theme.success("\u2713 \u5DE5\u4F5C\u76EE\u5F55\u5E72\u51C0"));
    }
    return lines.join("\n");
  }
  /**
   * 渲染提交历史
   */
  renderLog(commits) {
    const theme = getTheme();
    const lines = [];
    lines.push(theme.text.bold("\u63D0\u4EA4\u5386\u53F2:"));
    lines.push(theme.inactive("\u2500".repeat(60)));
    for (const commit of commits) {
      const hash = theme.subtle(commit.shortHash);
      const date = theme.subtle(commit.date.split(" ")[0]);
      const message = commit.message;
      lines.push(`${hash} ${date} ${message}`);
    }
    return lines.join("\n");
  }
  /**
   * 渲染分支列表
   */
  renderBranches(branches) {
    const theme = getTheme();
    const lines = [];
    lines.push(theme.text.bold("\u5206\u652F\u5217\u8868:"));
    lines.push(theme.inactive("\u2500".repeat(40)));
    for (const branch of branches) {
      const prefix = branch.current ? theme.success("* ") : "  ";
      const upstream = branch.upstream ? theme.subtle(` (${branch.upstream})`) : "";
      lines.push(`${prefix}${theme.text(branch.name)}${upstream}`);
    }
    return lines.join("\n");
  }
  /**
   * 渲染 Diff
   */
  renderDiff(diff) {
    const theme = getTheme();
    const lines = diff.split("\n");
    const result = [];
    for (const line of lines) {
      if (line.startsWith("+")) {
        result.push(theme.success(line));
      } else if (line.startsWith("-")) {
        result.push(theme.error(line));
      } else if (line.startsWith("@@")) {
        result.push(theme.claude(line));
      } else if (line.startsWith("diff --git")) {
        result.push(theme.text.bold(line));
      } else {
        result.push(line);
      }
    }
    return result.join("\n");
  }
  getStatusIcon(status) {
    switch (status) {
      case "added":
        return "+";
      case "modified":
        return "~";
      case "deleted":
        return "-";
      case "renamed":
        return "\u2192";
      case "copied":
        return "\u2295";
      case "unmerged":
        return "!";
    }
  }
};
function createGitManager(cwd) {
  return new GitManager(cwd);
}
var gitManager = createGitManager();

// src/cli/commands.ts
init_structured_edit();

// src/cli/ast-parser.ts
init_theme();
var TypeScriptParser = class {
  /**
   * 解析 TypeScript 代码
   */
  parse(content, filePath) {
    const lines = content.split("\n");
    const children = [];
    children.push(...this.parseImports(lines, filePath));
    children.push(...this.parseExports(lines, filePath));
    children.push(...this.parseFunctions(lines, filePath));
    children.push(...this.parseClasses(lines, filePath));
    children.push(...this.parseInterfaces(lines, filePath));
    children.push(...this.parseTypes(lines, filePath));
    children.push(...this.parseEnums(lines, filePath));
    children.push(...this.parseVariables(lines, filePath));
    return {
      type: "program",
      name: filePath,
      filePath,
      startLine: 1,
      endLine: lines.length,
      startColumn: 0,
      endColumn: 0,
      children
    };
  }
  /**
   * 解析导入语句
   */
  parseImports(lines, filePath) {
    const nodes = [];
    const importRegex = /^import\s+(?:(?:\{([^}]+)\}|(\w+)|\*\s+as\s+(\w+))\s+from\s+)?['"]([^'"]+)['"]/;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(importRegex);
      if (match) {
        const namedImports = match[1]?.split(",").map((s) => s.trim()) || [];
        const defaultImport = match[2];
        const namespaceImport = match[3];
        const importPath = match[4];
        const importNames = [...namedImports];
        if (defaultImport) importNames.unshift(defaultImport);
        if (namespaceImport) importNames.push(`* as ${namespaceImport}`);
        nodes.push({
          type: "import",
          name: importPath,
          filePath,
          startLine: i + 1,
          endLine: i + 1,
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            importPath,
            importNames,
            isDefault: !!defaultImport
          }
        });
      }
    }
    return nodes;
  }
  /**
   * 解析导出语句
   */
  parseExports(lines, filePath) {
    const nodes = [];
    const exportRegex = /^export\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+(\w+)/;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(exportRegex);
      if (match) {
        nodes.push({
          type: "export",
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: i + 1,
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            isExported: true
          }
        });
      }
    }
    return nodes;
  }
  /**
   * 解析函数
   */
  parseFunctions(lines, filePath) {
    const nodes = [];
    const functionRegex = /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*(\w+))?/;
    const arrowFunctionRegex = /^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)(?:\s*:\s*(\w+))?\s*=>/;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match = line.match(functionRegex);
      if (match) {
        const isAsync = line.includes("async");
        const parameters = match[2].split(",").map((p) => p.trim()).filter(Boolean);
        nodes.push({
          type: "function",
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: this.findBlockEnd(lines, i),
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            parameters,
            returnType: match[3],
            isAsync,
            isExported: line.startsWith("export")
          }
        });
        continue;
      }
      match = line.match(arrowFunctionRegex);
      if (match) {
        const isAsync = line.includes("async");
        const parameters = match[2].split(",").map((p) => p.trim()).filter(Boolean);
        nodes.push({
          type: "function",
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: this.findBlockEnd(lines, i),
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            parameters,
            returnType: match[3],
            isAsync,
            isExported: line.startsWith("export")
          }
        });
      }
    }
    return nodes;
  }
  /**
   * 解析类
   */
  parseClasses(lines, filePath) {
    const nodes = [];
    const classRegex = /^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?/;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(classRegex);
      if (match) {
        const isAbstract = line.includes("abstract");
        const implementsList = match[3]?.split(",").map((s) => s.trim()).filter(Boolean) || [];
        nodes.push({
          type: "class",
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: this.findBlockEnd(lines, i),
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            superClass: match[2],
            implements: implementsList,
            isAbstract,
            isExported: line.startsWith("export")
          }
        });
      }
    }
    return nodes;
  }
  /**
   * 解析接口
   */
  parseInterfaces(lines, filePath) {
    const nodes = [];
    const interfaceRegex = /^(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+([^{]+))?/;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(interfaceRegex);
      if (match) {
        nodes.push({
          type: "interface",
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: this.findBlockEnd(lines, i),
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            isExported: line.startsWith("export")
          }
        });
      }
    }
    return nodes;
  }
  /**
   * 解析类型
   */
  parseTypes(lines, filePath) {
    const nodes = [];
    const typeRegex = /^(?:export\s+)?type\s+(\w+)\s*=/;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(typeRegex);
      if (match) {
        nodes.push({
          type: "type",
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: i + 1,
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            isExported: line.startsWith("export")
          }
        });
      }
    }
    return nodes;
  }
  /**
   * 解析枚举
   */
  parseEnums(lines, filePath) {
    const nodes = [];
    const enumRegex = /^(?:export\s+)?enum\s+(\w+)/;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(enumRegex);
      if (match) {
        nodes.push({
          type: "enum",
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: this.findBlockEnd(lines, i),
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            isExported: line.startsWith("export")
          }
        });
      }
    }
    return nodes;
  }
  /**
   * 解析变量
   */
  parseVariables(lines, filePath) {
    const nodes = [];
    const variableRegex = /^(?:export\s+)?(?:const|let|var)\s+(\w+)(?:\s*:\s*(\w+))?/;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(variableRegex);
      if (match) {
        const isConstant = line.includes("const");
        nodes.push({
          type: "variable",
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: i + 1,
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            dataType: match[2],
            isConstant,
            isExported: line.startsWith("export")
          }
        });
      }
    }
    return nodes;
  }
  /**
   * 查找代码块结束位置
   */
  findBlockEnd(lines, startLine) {
    let braceCount = 0;
    let foundOpen = false;
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      for (const char of line) {
        if (char === "{") {
          braceCount++;
          foundOpen = true;
        } else if (char === "}") {
          braceCount--;
        }
      }
      if (foundOpen && braceCount === 0) {
        return i + 1;
      }
    }
    return startLine + 1;
  }
};
var DartParser = class {
  /**
   * 解析 Dart 代码
   */
  parse(content, filePath) {
    const lines = content.split("\n");
    const children = [];
    children.push(...this.parseImports(lines, filePath));
    children.push(...this.parseClasses(lines, filePath));
    children.push(...this.parseFunctions(lines, filePath));
    children.push(...this.parseVariables(lines, filePath));
    return {
      type: "program",
      name: filePath,
      filePath,
      startLine: 1,
      endLine: lines.length,
      startColumn: 0,
      endColumn: 0,
      children
    };
  }
  /**
   * 解析导入
   */
  parseImports(lines, filePath) {
    const nodes = [];
    const importRegex = /^import\s+['"]([^'"]+)['"](?:\s+as\s+(\w+))?/;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(importRegex);
      if (match) {
        nodes.push({
          type: "import",
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: i + 1,
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            importPath: match[1],
            importNames: match[2] ? [match[2]] : []
          }
        });
      }
    }
    return nodes;
  }
  /**
   * 解析类
   */
  parseClasses(lines, filePath) {
    const nodes = [];
    const classRegex = /^(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?(?:\s+with\s+([^{]+))?/;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(classRegex);
      if (match) {
        const isAbstract = line.includes("abstract");
        nodes.push({
          type: "class",
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: this.findBlockEnd(lines, i),
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            superClass: match[2],
            implements: match[3]?.split(",").map((s) => s.trim()).filter(Boolean),
            isAbstract
          }
        });
      }
    }
    return nodes;
  }
  /**
   * 解析函数
   */
  parseFunctions(lines, filePath) {
    const nodes = [];
    const functionRegex = /^(?:(?:static|abstract|external)\s+)?(?:async\s+)?(?:Future<[^>]+>|void|int|String|bool|double|List|Map|Set|dynamic)?\s+(\w+)\s*\(([^)]*)\)/;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(functionRegex);
      if (match && !line.includes("class ") && !line.includes("if ") && !line.includes("for ")) {
        const isAsync = line.includes("async");
        const parameters = match[2].split(",").map((p) => p.trim()).filter(Boolean);
        nodes.push({
          type: "function",
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: this.findBlockEnd(lines, i),
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            parameters,
            isAsync
          }
        });
      }
    }
    return nodes;
  }
  /**
   * 解析变量
   */
  parseVariables(lines, filePath) {
    const nodes = [];
    const variableRegex = /^(?:final|const|var|late\s+)?(?:\w+\s+)?(\w+)\s*(?:=\s*[^;]+)?;/;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(variableRegex);
      if (match && !line.includes("class ") && !line.includes("void ") && !line.includes("Future")) {
        const isConstant = line.includes("const") || line.includes("final");
        nodes.push({
          type: "variable",
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: i + 1,
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            isConstant
          }
        });
      }
    }
    return nodes;
  }
  /**
   * 查找代码块结束位置
   */
  findBlockEnd(lines, startLine) {
    let braceCount = 0;
    let foundOpen = false;
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      for (const char of line) {
        if (char === "{") {
          braceCount++;
          foundOpen = true;
        } else if (char === "}") {
          braceCount--;
        }
      }
      if (foundOpen && braceCount === 0) {
        return i + 1;
      }
    }
    return startLine + 1;
  }
};
var SymbolSearcher = class {
  symbols = [];
  /**
   * 从 AST 节点提取符号
   */
  extractSymbols(node) {
    const symbols = [];
    const traverse = (node2) => {
      if (node2.type !== "program") {
        symbols.push({
          name: node2.name,
          type: node2.type,
          filePath: node2.filePath,
          line: node2.startLine,
          column: node2.startColumn,
          documentation: node2.metadata?.documentation,
          dataType: node2.metadata?.returnType || node2.metadata?.dataType,
          isExported: node2.metadata?.isExported
        });
      }
      if (node2.children) {
        for (const child of node2.children) {
          traverse(child);
        }
      }
    };
    traverse(node);
    return symbols;
  }
  /**
   * 添加符号到索引
   */
  addSymbols(symbols) {
    this.symbols.push(...symbols);
  }
  /**
   * 搜索符号
   */
  search(query, options = {}) {
    const { limit = 10, type, filePath, exact = false } = options;
    const lowerQuery = query.toLowerCase();
    let results = [];
    for (const symbol of this.symbols) {
      if (type && symbol.type !== type) continue;
      if (filePath && !symbol.filePath.includes(filePath)) continue;
      let score = 0;
      const lowerName = symbol.name.toLowerCase();
      if (exact) {
        if (lowerName !== lowerQuery) continue;
        score = 100;
      } else {
        if (lowerName === lowerQuery) {
          score = 100;
        } else if (lowerName.startsWith(lowerQuery)) {
          score = 80;
        } else if (lowerName.includes(lowerQuery)) {
          score = 60;
        } else if (this.fuzzyMatch(lowerName, lowerQuery)) {
          score = 40;
        } else {
          continue;
        }
      }
      if (symbol.isExported) {
        score += 10;
      }
      results.push({
        symbol,
        score,
        matches: [{
          line: symbol.line,
          column: symbol.column
        }]
      });
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
  /**
   * 模糊匹配
   */
  fuzzyMatch(text, query) {
    let queryIndex = 0;
    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        queryIndex++;
      }
    }
    return queryIndex === query.length;
  }
  /**
   * 清空符号索引
   */
  clear() {
    this.symbols = [];
  }
  /**
   * 获取符号数量
   */
  count() {
    return this.symbols.length;
  }
};
var ASTManager = class {
  tsParser;
  dartParser;
  searcher;
  astCache = /* @__PURE__ */ new Map();
  treeSitterManager = null;
  useTreeSitter = false;
  constructor() {
    this.tsParser = new TypeScriptParser();
    this.dartParser = new DartParser();
    this.searcher = new SymbolSearcher();
  }
  /**
   * 初始化 tree-sitter 解析器
   */
  async initializeTreeSitter() {
    try {
      const { treeSitterParserManager: treeSitterParserManager2 } = (init_tree_sitter_parser(), __toCommonJS(tree_sitter_parser_exports));
      this.treeSitterManager = treeSitterParserManager2;
      await this.treeSitterManager.initialize();
      this.useTreeSitter = true;
      return true;
    } catch (error) {
      console.warn("tree-sitter \u521D\u59CB\u5316\u5931\u8D25\uFF0C\u4F7F\u7528\u6B63\u5219\u89E3\u6790\u5668:", error);
      this.useTreeSitter = false;
      return false;
    }
  }
  /**
   * 解析文件
   */
  parseFile(content, filePath) {
    const cacheKey = `${filePath}:${content.length}`;
    if (this.astCache.has(cacheKey)) {
      return this.astCache.get(cacheKey);
    }
    const ext = filePath.split(".").pop()?.toLowerCase();
    let ast;
    if (this.useTreeSitter && this.treeSitterManager) {
      const language = this.treeSitterManager.getLanguageByExtension(ext || "");
      if (language) {
        try {
          const tree = this.treeSitterManager.parseCode(content, language);
          if (tree) {
            const nodes = this.treeSitterManager.extractASTNodes(tree, language, filePath);
            ast = {
              type: "program",
              name: filePath,
              filePath,
              startLine: 1,
              endLine: content.split("\n").length,
              startColumn: 0,
              endColumn: 0,
              children: nodes
            };
          } else {
            ast = this.parseWithRegex(content, filePath, ext);
          }
        } catch (error) {
          ast = this.parseWithRegex(content, filePath, ext);
        }
      } else {
        ast = this.parseWithRegex(content, filePath, ext);
      }
    } else {
      ast = this.parseWithRegex(content, filePath, ext);
    }
    this.astCache.set(cacheKey, ast);
    const symbols = this.searcher.extractSymbols(ast);
    this.searcher.addSymbols(symbols);
    return ast;
  }
  /**
   * 使用正则解析器
   */
  parseWithRegex(content, filePath, ext) {
    if (ext === "dart") {
      return this.dartParser.parse(content, filePath);
    } else {
      return this.tsParser.parse(content, filePath);
    }
  }
  /**
   * 搜索符号
   */
  searchSymbol(query, options) {
    return this.searcher.search(query, options);
  }
  /**
   * 获取文件结构
   */
  getFileStructure(filePath, content) {
    const ast = this.parseFile(content, filePath);
    return this.renderAST(ast);
  }
  /**
   * 渲染 AST
   */
  renderAST(node, indent = 0) {
    const theme = getTheme();
    const lines = [];
    const prefix = "  ".repeat(indent);
    if (node.type !== "program") {
      const icon = this.getNodeIcon(node.type);
      const name = theme.claude(node.name);
      const location = theme.subtle(`:${node.startLine}`);
      const typeInfo = node.metadata?.returnType || node.metadata?.dataType || "";
      let line = `${prefix}${icon} ${name}`;
      if (typeInfo) {
        line += theme.subtle(`: ${typeInfo}`);
      }
      line += location;
      lines.push(line);
    }
    if (node.children) {
      for (const child of node.children) {
        lines.push(this.renderAST(child, indent + 1));
      }
    }
    return lines.join("\n");
  }
  /**
   * 获取节点图标
   */
  getNodeIcon(type) {
    switch (type) {
      case "function":
        return "\u0192";
      case "class":
        return "\u24B8";
      case "method":
        return "\u24DC";
      case "property":
        return "\u24DF";
      case "variable":
        return "\u24E5";
      case "import":
        return "\u24D8";
      case "export":
        return "\u24D4";
      case "interface":
        return "\u24BE";
      case "type":
        return "\u24E3";
      case "enum":
        return "\u24BA";
      case "decorator":
        return "\u24D3";
      case "comment":
        return "\u24D2";
      default:
        return "\u2022";
    }
  }
  /**
   * 渲染搜索结果
   */
  renderSearchResults(results) {
    const theme = getTheme();
    const lines = [];
    if (results.length === 0) {
      lines.push(theme.subtle("\u672A\u627E\u5230\u5339\u914D\u7684\u7B26\u53F7"));
      return lines.join("\n");
    }
    lines.push(theme.text.bold(`\u627E\u5230 ${results.length} \u4E2A\u7B26\u53F7:`));
    lines.push(theme.inactive("\u2500".repeat(60)));
    for (const result of results) {
      const { symbol, score } = result;
      const icon = this.getNodeIcon(symbol.type);
      const name = theme.claude(symbol.name);
      const type = theme.subtle(`(${symbol.type})`);
      const file = theme.subtle(symbol.filePath);
      const line = theme.subtle(`:${symbol.line}`);
      lines.push(`${icon} ${name} ${type} ${file}${line}`);
      if (symbol.dataType) {
        lines.push(`  ${theme.subtle("\u7C7B\u578B:")} ${symbol.dataType}`);
      }
      if (symbol.documentation) {
        lines.push(`  ${theme.subtle("\u6587\u6863:")} ${symbol.documentation}`);
      }
    }
    return lines.join("\n");
  }
  /**
   * 清空缓存
   */
  clearCache() {
    this.astCache.clear();
    this.searcher.clear();
  }
  /**
   * 获取统计信息
   */
  getStats() {
    return {
      files: this.astCache.size,
      symbols: this.searcher.count()
    };
  }
};
function createASTManager() {
  return new ASTManager();
}
var astManager = createASTManager();

// src/cli/commands.ts
init_tree_sitter_parser();

// src/cli/web-fetch.ts
init_theme();
var WebFetchManager = class {
  defaultOptions = {
    extractText: true,
    extractLinks: true,
    extractImages: false,
    maxLength: 5e4,
    timeout: 3e4,
    userAgent: "Mozilla/5.0 (compatible; ForgeCLI/1.0)",
    followRedirects: true
  };
  /**
   * 获取网页内容
   */
  async fetch(options) {
    const startTime = Date.now();
    const mergedOptions = { ...this.defaultOptions, ...options };
    try {
      const axios = __require("axios");
      const cheerio = __require("cheerio");
      const response = await axios.get(mergedOptions.url, {
        timeout: mergedOptions.timeout,
        maxRedirects: mergedOptions.followRedirects ? 5 : 0,
        headers: {
          "User-Agent": mergedOptions.userAgent,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
        }
      });
      const html = response.data;
      const $ = cheerio.load(html);
      const title = $("title").text().trim() || "";
      let text = "";
      if (mergedOptions.extractText) {
        $("script, style, nav, footer, header, aside").remove();
        text = $("body").text().replace(/\s+/g, " ").replace(/\n+/g, "\n").trim();
        if (mergedOptions.maxLength && text.length > mergedOptions.maxLength) {
          text = text.slice(0, mergedOptions.maxLength) + "...";
        }
      }
      const links = [];
      if (mergedOptions.extractLinks) {
        $("a[href]").each((_, element) => {
          const href = $(element).attr("href");
          const text2 = $(element).text().trim();
          if (href && text2) {
            let absoluteHref = href;
            if (href.startsWith("/")) {
              const urlObj = new URL(mergedOptions.url);
              absoluteHref = `${urlObj.origin}${href}`;
            } else if (!href.startsWith("http")) {
              try {
                absoluteHref = new URL(href, mergedOptions.url).toString();
              } catch {
              }
            }
            links.push({ text: text2, href: absoluteHref });
          }
        });
      }
      const images = [];
      if (mergedOptions.extractImages) {
        $("img[src]").each((_, element) => {
          const src = $(element).attr("src");
          const alt = $(element).attr("alt") || "";
          if (src) {
            let absoluteSrc = src;
            if (src.startsWith("/")) {
              const urlObj = new URL(mergedOptions.url);
              absoluteSrc = `${urlObj.origin}${src}`;
            } else if (!src.startsWith("http")) {
              try {
                absoluteSrc = new URL(src, mergedOptions.url).toString();
              } catch {
              }
            }
            images.push({ alt, src: absoluteSrc });
          }
        });
      }
      const metadata = {};
      $("meta").each((_, element) => {
        const name = $(element).attr("name") || $(element).attr("property");
        const content = $(element).attr("content");
        if (name && content) {
          metadata[name] = content;
        }
      });
      return {
        url: mergedOptions.url,
        finalUrl: response.request?.responseURL || mergedOptions.url,
        statusCode: response.status,
        contentType: response.headers["content-type"] || "",
        title,
        html,
        text,
        links,
        images,
        metadata,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        url: mergedOptions.url,
        finalUrl: mergedOptions.url,
        statusCode: 0,
        contentType: "",
        title: "",
        html: "",
        text: "",
        links: [],
        images: [],
        metadata: {},
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }
  /**
   * 快速获取网页文本
   */
  async fetchText(url) {
    const result = await this.fetch({ url, extractText: true, extractLinks: false });
    return result.text;
  }
  /**
   * 获取网页标题
   */
  async fetchTitle(url) {
    const result = await this.fetch({ url, extractText: false, extractLinks: false });
    return result.title;
  }
  /**
   * 渲染获取结果
   */
  renderResult(result) {
    const theme = getTheme();
    const lines = [];
    if (result.title) {
      lines.push(theme.text.bold(result.title));
      lines.push("");
    }
    lines.push(theme.subtle("URL: ") + theme.text(result.url));
    if (result.finalUrl !== result.url) {
      lines.push(theme.subtle("\u91CD\u5B9A\u5411: ") + theme.text(result.finalUrl));
    }
    lines.push(theme.subtle("\u72B6\u6001: ") + theme.success(`${result.statusCode}`));
    lines.push(theme.subtle("\u7C7B\u578B: ") + theme.text(result.contentType));
    lines.push(theme.subtle("\u8017\u65F6: ") + theme.text(`${result.duration}ms`));
    lines.push("");
    if (result.text) {
      lines.push(theme.text.bold("\u5185\u5BB9:"));
      lines.push(theme.inactive("\u2500".repeat(60)));
      lines.push(result.text);
      lines.push("");
    }
    if (result.links.length > 0) {
      lines.push(theme.text.bold(`\u94FE\u63A5 (${result.links.length}):`));
      lines.push(theme.inactive("\u2500".repeat(60)));
      for (const link of result.links.slice(0, 20)) {
        lines.push(`  ${theme.claude(link.text)} ${theme.subtle(link.href)}`);
      }
      if (result.links.length > 20) {
        lines.push(theme.subtle(`  ... \u8FD8\u6709 ${result.links.length - 20} \u4E2A\u94FE\u63A5`));
      }
      lines.push("");
    }
    if (result.images.length > 0) {
      lines.push(theme.text.bold(`\u56FE\u7247 (${result.images.length}):`));
      lines.push(theme.inactive("\u2500".repeat(60)));
      for (const image of result.images.slice(0, 10)) {
        lines.push(`  ${theme.claude(image.alt || "\u65E0\u63CF\u8FF0")} ${theme.subtle(image.src)}`);
      }
      if (result.images.length > 10) {
        lines.push(theme.subtle(`  ... \u8FD8\u6709 ${result.images.length - 10} \u5F20\u56FE\u7247`));
      }
      lines.push("");
    }
    const metadataKeys = Object.keys(result.metadata);
    if (metadataKeys.length > 0) {
      lines.push(theme.text.bold("\u5143\u6570\u636E:"));
      lines.push(theme.inactive("\u2500".repeat(60)));
      for (const key of metadataKeys.slice(0, 10)) {
        lines.push(`  ${theme.subtle(key)}: ${result.metadata[key]}`);
      }
      lines.push("");
    }
    if (result.error) {
      lines.push(theme.error("\u9519\u8BEF: ") + result.error);
    }
    return lines.join("\n");
  }
  /**
   * 渲染简洁结果
   */
  renderCompactResult(result) {
    const theme = getTheme();
    const lines = [];
    if (result.error) {
      lines.push(theme.error(`\u2717 ${result.error}`));
    } else {
      lines.push(theme.success(`\u2713 ${result.title || "\u65E0\u6807\u9898"}`));
      lines.push(theme.subtle(`  ${result.url}`));
      lines.push(theme.subtle(`  ${result.statusCode} | ${result.contentType} | ${result.duration}ms`));
      if (result.text) {
        const preview = result.text.slice(0, 200).replace(/\n/g, " ");
        lines.push(theme.text(`  ${preview}...`));
      }
    }
    return lines.join("\n");
  }
};
function createWebFetchManager() {
  return new WebFetchManager();
}
var webFetchManager = createWebFetchManager();

// src/cli/web-search.ts
init_theme();
var WebSearchManager = class {
  apiKey;
  baseUrl;
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.BAIDU_QIANFAN_API_KEY || "";
    this.baseUrl = "https://qianfan.baidubce.com/v2/ai_search/web_summary";
  }
  /**
   * 设置 API Key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }
  /**
   * 检查是否已配置
   */
  isConfigured() {
    return !!this.apiKey;
  }
  /**
   * 执行搜索
   */
  async search(options) {
    const startTime = Date.now();
    if (!this.apiKey) {
      return {
        requestId: "",
        content: "",
        references: [],
        error: "\u672A\u914D\u7F6E\u767E\u5EA6\u5343\u5E06 API Key\uFF0C\u8BF7\u8BBE\u7F6E\u73AF\u5883\u53D8\u91CF BAIDU_QIANFAN_API_KEY",
        duration: Date.now() - startTime
      };
    }
    try {
      const requestBody = {
        messages: [
          { role: "user", content: options.query }
        ],
        stream: false
      };
      if (options.resourceTypes) {
        requestBody.resource_type_filter = options.resourceTypes;
      } else {
        requestBody.resource_type_filter = [
          { type: "web", top_k: options.topK || 10 }
        ];
      }
      if (options.instruction) {
        requestBody.instruction = options.instruction;
      }
      if (options.temperature !== void 0) {
        requestBody.temperature = options.temperature;
      }
      if (options.topP !== void 0) {
        requestBody.top_p = options.topP;
      }
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Appbuilder-Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        const errorText = await response.text();
        return {
          requestId: "",
          content: "",
          references: [],
          error: `API \u8BF7\u6C42\u5931\u8D25: ${response.status} ${errorText}`,
          duration: Date.now() - startTime
        };
      }
      const data = await response.json();
      const result = {
        requestId: data.request_id || "",
        content: "",
        references: [],
        duration: Date.now() - startTime
      };
      if (data.choices && data.choices.length > 0) {
        const choice = data.choices[0];
        if (choice.message) {
          result.content = choice.message.content || "";
        }
      }
      if (data.references) {
        result.references = data.references.map((ref) => ({
          id: ref.id,
          url: ref.url,
          title: ref.title,
          date: ref.date,
          content: ref.content || ref.snippet || "",
          website: ref.website,
          icon: ref.icon,
          type: ref.type || "web",
          snippet: ref.snippet
        }));
      }
      return result;
    } catch (error) {
      return {
        requestId: "",
        content: "",
        references: [],
        error: `\u641C\u7D22\u5931\u8D25: ${error.message}`,
        duration: Date.now() - startTime
      };
    }
  }
  /**
   * 渲染搜索结果
   */
  renderResult(result) {
    const theme = getTheme();
    const lines = [];
    if (result.error) {
      lines.push(theme.error(`\u2717 ${result.error}`));
      return lines.join("\n");
    }
    if (result.content) {
      lines.push(result.content);
      lines.push("");
    }
    if (result.references.length > 0) {
      lines.push(theme.text.bold(`\u53C2\u8003\u6765\u6E90 (${result.references.length}):`));
      lines.push(theme.inactive("\u2500".repeat(60)));
      for (const ref of result.references) {
        const icon = ref.type === "video" ? "\u25B6" : ref.type === "image" ? "\u{1F5BC}" : "\u{1F517}";
        const title = theme.claude(ref.title || "\u65E0\u6807\u9898");
        const url = theme.subtle(ref.url);
        const website = ref.website ? theme.subtle(` (${ref.website})`) : "";
        const date = ref.date ? theme.subtle(` [${ref.date}]`) : "";
        lines.push(`${icon} ${title}${website}${date}`);
        lines.push(`   ${url}`);
        if (ref.snippet) {
          const snippet = ref.snippet.slice(0, 150);
          lines.push(theme.subtle(`   ${snippet}...`));
        }
        lines.push("");
      }
    }
    lines.push(theme.subtle(`\u641C\u7D22\u65F6\u95F4: ${result.duration}ms`));
    return lines.join("\n");
  }
  /**
   * 渲染简洁结果
   */
  renderCompactResult(result) {
    const theme = getTheme();
    const lines = [];
    if (result.error) {
      lines.push(theme.error(`\u2717 ${result.error}`));
    } else {
      if (result.content) {
        const preview = result.content.slice(0, 300).replace(/\n/g, " ");
        lines.push(theme.text(`${preview}...`));
      }
      if (result.references.length > 0) {
        lines.push(theme.subtle(`  ${result.references.length} \u4E2A\u53C2\u8003\u6765\u6E90`));
      }
      lines.push(theme.subtle(`  ${result.duration}ms`));
    }
    return lines.join("\n");
  }
};
function createWebSearchManager(apiKey) {
  return new WebSearchManager(apiKey);
}
var webSearchManager = createWebSearchManager();

// src/cli/state-machine.ts
init_theme();
var StateMachineError = class extends Error {
  constructor(message, code, currentState, event, targetState) {
    super(message);
    this.code = code;
    this.currentState = currentState;
    this.event = event;
    this.targetState = targetState;
    this.name = "StateMachineError";
  }
  code;
  currentState;
  event;
  targetState;
};
var StateMachine = class {
  currentState;
  states;
  transitions;
  history = [];
  context = {};
  config;
  stateStartTime = Date.now();
  constructor(config) {
    this.config = config;
    this.currentState = config.initialState;
    this.states = new Set(config.states);
    this.transitions = /* @__PURE__ */ new Map();
    for (const transition of config.transitions) {
      const key = `${transition.from}:${transition.event}`;
      if (!this.transitions.has(key)) {
        this.transitions.set(key, []);
      }
      this.transitions.get(key).push(transition);
    }
  }
  /**
   * 获取当前状态
   */
  getCurrentState() {
    return this.currentState;
  }
  /**
   * 获取状态历史
   */
  getHistory() {
    return [...this.history];
  }
  /**
   * 获取上下文
   */
  getContext() {
    return { ...this.context };
  }
  /**
   * 设置上下文
   */
  setContext(context) {
    this.context = { ...this.context, ...context };
  }
  /**
   * 获取当前状态持续时间
   */
  getCurrentStateDuration() {
    return Date.now() - this.stateStartTime;
  }
  /**
   * 触发事件
   */
  send(event, data) {
    const key = `${this.currentState}:${event}`;
    const transitions = this.transitions.get(key) || [];
    if (transitions.length === 0) {
      const error = new StateMachineError(
        `\u65E0\u6548\u7684\u72B6\u6001\u8F6C\u6362: ${this.currentState} + ${event}`,
        "INVALID_TRANSITION",
        this.currentState,
        event
      );
      this.config.onError?.(error);
      throw error;
    }
    const validTransition = transitions.find((t) => {
      if (t.guard) {
        return t.guard({ ...this.context, ...data });
      }
      return true;
    });
    if (!validTransition) {
      const error = new StateMachineError(
        `\u72B6\u6001\u8F6C\u6362\u6761\u4EF6\u4E0D\u6EE1\u8DB3: ${this.currentState} + ${event}`,
        "GUARD_FAILED",
        this.currentState,
        event
      );
      this.config.onError?.(error);
      throw error;
    }
    const from = this.currentState;
    const to = validTransition.to;
    const duration = this.getCurrentStateDuration();
    this.history.push({
      from,
      to,
      event,
      timestamp: Date.now(),
      context: data,
      duration
    });
    if (validTransition.action) {
      validTransition.action({ ...this.context, ...data });
    }
    this.currentState = to;
    this.stateStartTime = Date.now();
    this.config.onStateChange?.(from, to, event);
    return true;
  }
  /**
   * 检查是否可以触发事件
   */
  canSend(event) {
    const key = `${this.currentState}:${event}`;
    const transitions = this.transitions.get(key) || [];
    return transitions.length > 0;
  }
  /**
   * 获取当前状态可用的事件
   */
  getAvailableEvents() {
    const events = [];
    for (const [key] of this.transitions) {
      const [state, event] = key.split(":");
      if (state === this.currentState) {
        events.push(event);
      }
    }
    return events;
  }
  /**
   * 获取状态转换图
   */
  getTransitionGraph() {
    const graph = [];
    for (const transitions of this.transitions.values()) {
      for (const t of transitions) {
        graph.push({ from: t.from, to: t.to, event: t.event });
      }
    }
    return graph;
  }
  /**
   * 创建快照
   */
  createSnapshot() {
    return {
      currentState: this.currentState,
      history: [...this.history],
      context: { ...this.context },
      timestamp: Date.now()
    };
  }
  /**
   * 从快照恢复
   */
  restoreFromSnapshot(snapshot) {
    if (!this.states.has(snapshot.currentState)) {
      throw new StateMachineError(
        `\u5FEB\u7167\u4E2D\u7684\u72B6\u6001\u65E0\u6548: ${snapshot.currentState}`,
        "INVALID_STATE",
        snapshot.currentState
      );
    }
    this.currentState = snapshot.currentState;
    this.history = [...snapshot.history];
    this.context = { ...snapshot.context };
    this.stateStartTime = Date.now();
  }
  /**
   * 重置状态机
   */
  reset() {
    this.currentState = this.config.initialState;
    this.history = [];
    this.context = {};
    this.stateStartTime = Date.now();
  }
  /**
   * 渲染状态机信息
   */
  render() {
    const theme = getTheme();
    const lines = [];
    lines.push(theme.text.bold("\u72B6\u6001\u673A"));
    lines.push(theme.inactive("\u2500".repeat(40)));
    lines.push(`  ${theme.subtle("\u5F53\u524D\u72B6\u6001:")} ${theme.claude(this.currentState)}`);
    lines.push(`  ${theme.subtle("\u6301\u7EED\u65F6\u95F4:")} ${theme.text(`${this.getCurrentStateDuration()}ms`)}`);
    const events = this.getAvailableEvents();
    if (events.length > 0) {
      lines.push(`  ${theme.subtle("\u53EF\u7528\u4E8B\u4EF6:")} ${theme.text(events.join(", "))}`);
    }
    if (this.history.length > 0) {
      lines.push("");
      lines.push(theme.text.bold("\u5386\u53F2\u8BB0\u5F55:"));
      lines.push(theme.inactive("\u2500".repeat(40)));
      const recentHistory = this.history.slice(-10);
      for (const entry of recentHistory) {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        const duration = entry.duration ? ` (${entry.duration}ms)` : "";
        lines.push(`  ${theme.subtle(time)} ${theme.claude(entry.from)} \u2192 ${theme.claude(entry.to)} ${theme.subtle(entry.event)}${duration}`);
      }
      if (this.history.length > 10) {
        lines.push(theme.subtle(`  ... \u8FD8\u6709 ${this.history.length - 10} \u6761\u8BB0\u5F55`));
      }
    }
    return lines.join("\n");
  }
  /**
   * 渲染状态转换图
   */
  renderTransitionGraph() {
    const theme = getTheme();
    const lines = [];
    lines.push(theme.text.bold("\u72B6\u6001\u8F6C\u6362\u56FE"));
    lines.push(theme.inactive("\u2500".repeat(60)));
    const graph = this.getTransitionGraph();
    const states = /* @__PURE__ */ new Set();
    const transitionsByState = /* @__PURE__ */ new Map();
    for (const edge of graph) {
      states.add(edge.from);
      states.add(edge.to);
      if (!transitionsByState.has(edge.from)) {
        transitionsByState.set(edge.from, []);
      }
      transitionsByState.get(edge.from).push({ to: edge.to, event: edge.event });
    }
    for (const state of states) {
      const isCurrent = state === this.currentState;
      const stateLabel = isCurrent ? theme.claude(`[${state}]`) : theme.text(state);
      lines.push(`  ${stateLabel}`);
      const transitions = transitionsByState.get(state) || [];
      for (const t of transitions) {
        const arrow = isCurrent ? theme.claude("\u2192") : theme.subtle("\u2192");
        lines.push(`    ${arrow} ${theme.text(t.to)} ${theme.subtle(`(${t.event})`)}`);
      }
    }
    return lines.join("\n");
  }
};
function createStateMachine(config) {
  return new StateMachine(config);
}
async function saveSnapshot(snapshot, filePath) {
  const fs = __require("fs");
  const content = JSON.stringify(snapshot, null, 2);
  fs.writeFileSync(filePath, content);
}
async function loadSnapshot(filePath) {
  const fs = __require("fs");
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content);
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
  console.log(chalk5.bold(`
${prompt}`));
  options.forEach((opt, i) => {
    console.log(`  ${chalk5.cyan(i + 1 + "")}. ${opt}`);
  });
  console.log(chalk5.dim("  0. \u53D6\u6D88"));
  const answer = await ask(chalk5.cyan("\n> "));
  const num = parseInt(answer.trim());
  if (isNaN(num) || num < 0 || num > options.length) return null;
  return num === 0 ? null : num - 1;
}
async function promptInput(label) {
  const answer = await ask(chalk5.cyan(`${label} > `));
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
      return { handled: true, shouldExit: true, output: chalk5.dim("\n\u518D\u89C1\uFF01") };
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
    case "/memory":
      return handleMemoryCommand();
    case "/trace":
      return handleTraceCommand(orchestrator);
    case "/theme":
      return handleThemeCommand(args);
    case "/git":
      return handleGitCommand(args);
    case "/diff":
      return handleDiffCommand(args);
    case "/lint":
      return handleLintCommand(args);
    case "/test":
      return handleTestCommand(args);
    case "/ast":
      return handleASTCommand(args);
    case "/symbol":
    case "/sym":
      return handleSymbolCommand(args);
    case "/fetch":
    case "/web":
      return handleFetchCommand(args);
    case "/search":
    case "/s":
      return handleSearchCommand(args);
    case "/state":
      return handleStateCommand(args);
    default:
      return { handled: true, output: renderError(`\u672A\u77E5\u547D\u4EE4: ${command}
\u8F93\u5165 /help \u67E5\u770B\u53EF\u7528\u547D\u4EE4`) };
  }
}
async function handleModelCommand(args, cm, ai) {
  if (args.length >= 1) {
    const raw = args[0];
    const [providerKey, ...modelParts] = raw.split(":");
    const modelName = modelParts.join(":");
    try {
      const model = cm.getModel(providerKey, modelName || void 0);
      if (!model.api_key) {
        return { handled: true, output: renderError(`provider "${providerKey}" \u672A\u914D\u7F6E API Key\uFF0C\u8BF7\u5148\u7528 /model \u4EA4\u4E92\u5F0F\u914D\u7F6E`) };
      }
      cm.setSelectedModel(providerKey, model.name);
      ai.setModel(model);
      cm.save().catch(() => {
      });
      return { handled: true, output: renderSuccess(`\u5DF2\u5207\u6362\u5230 ${providerKey} / ${model.name}`) };
    } catch (e) {
      return { handled: true, output: renderError(e instanceof Error ? e.message : String(e)) };
    }
  }
  return await flowModelManager(cm, ai);
}
async function flowModelManager(cm, ai) {
  const defaultPk = cm.getDefaultProvider();
  const defaultInfo = cm.getProvider(defaultPk);
  const currentDisplay = defaultInfo?.selected || cm.get().defaults.model;
  console.log(chalk5.bold("\n  \u6A21\u578B\u7BA1\u7406"));
  console.log(chalk5.dim("  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  console.log(`  \u5F53\u524D: ${chalk5.cyan(defaultPk)} / ${chalk5.yellow(currentDisplay)}
`);
  const providers = cm.getAllProviders();
  const options = [];
  for (const p of providers) {
    const hasKey = !!p.info.api_key;
    const isSelected = p.key === defaultPk;
    const modelDisplay = hasKey ? p.info.selected || p.info.models[0] : chalk5.dim("(\u672A\u914D\u7F6E)");
    const tag = isSelected ? chalk5.yellow(" [\u5F53\u524D]") : "";
    options.push(`${chalk5.cyan(p.key.padEnd(14))} ${modelDisplay}${tag}`);
  }
  options.push(chalk5.dim("\u81EA\u5B9A\u4E49 provider"));
  const sel = await selectOption("", options);
  if (sel === null) return { handled: true, output: chalk5.dim("\u5DF2\u53D6\u6D88") };
  if (sel === providers.length) {
    return await flowAddCustomProvider(cm, ai);
  }
  const chosen = providers[sel];
  return await flowSelectModel(cm, ai, chosen.key);
}
async function flowSelectModel(cm, ai, providerKey) {
  const info = cm.getProvider(providerKey);
  if (!info) return { handled: true, output: renderError(`Provider "${providerKey}" \u4E0D\u5B58\u5728`) };
  if (!info.api_key) {
    console.log(chalk5.yellow(`
  ${providerKey} \u5C1A\u672A\u914D\u7F6E API Key`));
    const apiKey = await promptInput("  API Key");
    if (!apiKey) return { handled: true, output: chalk5.dim("\u5DF2\u53D6\u6D88") };
    cm.setApiKey(providerKey, apiKey);
  }
  const modelOptions = info.models.map((m) => {
    const isCurrent = m === info.selected;
    return `${chalk5.cyan(m)}${isCurrent ? chalk5.yellow(" [\u5F53\u524D]") : ""}`;
  });
  const sel = await selectOption(`${providerKey} - \u9009\u62E9\u6A21\u578B:`, modelOptions);
  if (sel === null) return { handled: true, output: chalk5.dim("\u5DF2\u53D6\u6D88") };
  const modelName = info.models[sel];
  cm.setSelectedModel(providerKey, modelName);
  ai.setModel(cm.getModel(providerKey, modelName));
  cm.save().catch(() => {
  });
  return { handled: true, output: renderSuccess(`\u5DF2\u5207\u6362\u5230 ${providerKey} / ${modelName}`) };
}
async function flowAddCustomProvider(cm, ai) {
  const customCount = Object.keys(cm.get().custom_providers).length;
  if (customCount >= MAX_CUSTOM_PROVIDERS) {
    return { handled: true, output: renderError(`\u6700\u591A\u652F\u6301 ${MAX_CUSTOM_PROVIDERS} \u4E2A\u81EA\u5B9A\u4E49 provider`) };
  }
  console.log(chalk5.bold("\n  \u6DFB\u52A0\u81EA\u5B9A\u4E49 provider"));
  console.log(chalk5.dim("  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  const name = await promptInput("  \u540D\u79F0");
  if (!name) return { handled: true, output: chalk5.dim("\u5DF2\u53D6\u6D88") };
  if (cm.getProvider(name)) {
    return { handled: true, output: renderError(`Provider "${name}" \u5DF2\u5B58\u5728`) };
  }
  const baseUrl = await promptInput("  Base URL");
  if (!baseUrl) return { handled: true, output: chalk5.dim("\u5DF2\u53D6\u6D88") };
  const apiKey = await promptInput("  API Key");
  if (!apiKey) return { handled: true, output: chalk5.dim("\u5DF2\u53D6\u6D88") };
  const modelsStr = await promptInput("  \u6A21\u578B\uFF08\u9017\u53F7\u5206\u9694\uFF09");
  if (!modelsStr) return { handled: true, output: chalk5.dim("\u5DF2\u53D6\u6D88") };
  const models = modelsStr.split(",").map((m) => m.trim()).filter(Boolean);
  if (models.length === 0) return { handled: true, output: renderError("\u81F3\u5C11\u9700\u8981\u4E00\u4E2A\u6A21\u578B") };
  cm.addCustomProvider(name, { name, base_url: baseUrl, api_key: apiKey, models });
  const modelOptions = models.map((m) => chalk5.cyan(m));
  const sel = await selectOption("\u9009\u62E9\u9ED8\u8BA4\u6A21\u578B:", modelOptions);
  const selectedModel = sel !== null ? models[sel] : models[0];
  cm.setSelectedModel(name, selectedModel);
  ai.setModel(cm.getModel(name, selectedModel));
  cm.save().catch(() => {
  });
  return { handled: true, output: renderSuccess(`\u5DF2\u6DFB\u52A0 ${name}\uFF0C\u5F53\u524D\u6A21\u578B: ${selectedModel}`) };
}
function handleConfigCommand(cm) {
  const config = cm.get();
  const defaultPk = config.defaults.provider;
  const defaultInfo = cm.getProvider(defaultPk);
  const currentModel = defaultInfo?.selected || config.defaults.model;
  const lines = [
    chalk5.bold("\n\u5F53\u524D\u914D\u7F6E:"),
    `  ${chalk5.dim("\u9ED8\u8BA4 Provider:")} ${chalk5.cyan(defaultPk)}`,
    `  ${chalk5.dim("\u9ED8\u8BA4\u6A21\u578B:")} ${chalk5.yellow(currentModel)}`,
    `  ${chalk5.dim("\u9879\u76EE\u8DEF\u5F84:")} ${config.project.root}`,
    `  ${chalk5.dim("\u914D\u7F6E\u6587\u4EF6:")} ${cm.getConfigPath()}`,
    "",
    chalk5.bold("Provider \u5217\u8868:")
  ];
  for (const p of cm.getAllProviders()) {
    const hasKey = !!p.info.api_key;
    const status = hasKey ? chalk5.green("\u2713") : chalk5.red("\u2717");
    const selected = p.info.selected || p.info.models[0] || "-";
    const tag = p.key === defaultPk ? chalk5.yellow(" [\u5F53\u524D]") : "";
    const presetTag = p.isPreset ? "" : chalk5.dim(" (\u81EA\u5B9A\u4E49)");
    lines.push(`  ${status} ${chalk5.cyan(p.key)}${presetTag} \u2192 ${selected}${tag}`);
  }
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
  if (!info) return { handled: true, output: chalk5.dim("\n\u65E0\u6D3B\u8DC3 session") };
  return { handled: true, output: [
    chalk5.bold("\nSession \u4FE1\u606F:"),
    `  ${chalk5.dim("ID:")} ${chalk5.cyan(info.id)}`,
    `  ${chalk5.dim("\u72B6\u6001:")} ${chalk5.yellow(info.state)}`,
    `  ${chalk5.dim("\u6A21\u5F0F:")} ${info.mode || chalk5.dim("\u672A\u8BBE\u7F6E")}`
  ].join("\n") };
}
function handlePluginsCommand(orchestrator) {
  if (!orchestrator) return { handled: true, output: renderError("\u7F16\u6392\u5668\u672A\u521D\u59CB\u5316") };
  const plugins = orchestrator.getPluginManager().getPlugins();
  if (plugins.length === 0) return { handled: true, output: chalk5.dim("\n\u65E0\u5DF2\u52A0\u8F7D\u63D2\u4EF6") };
  return { handled: true, output: [
    chalk5.bold("\n\u5DF2\u52A0\u8F7D\u63D2\u4EF6:"),
    ...plugins.map((p) => {
      const s = p.enabled ? chalk5.green("\u2713") : chalk5.red("\u2717");
      return `  ${s} ${chalk5.cyan(p.config.metadata.name)} ${chalk5.dim(`v${p.config.metadata.version}`)}`;
    })
  ].join("\n") };
}
function handleMCPCommand(args, orchestrator) {
  if (!orchestrator) return { handled: true, output: renderError("\u7F16\u6392\u5668\u672A\u521D\u59CB\u5316") };
  const servers = orchestrator.getMCPClient().getServers();
  if (servers.length === 0) return { handled: true, output: chalk5.dim("\n\u65E0\u5DF2\u8FDE\u63A5 MCP \u670D\u52A1\u5668") };
  return { handled: true, output: [
    chalk5.bold("\nMCP \u670D\u52A1\u5668:"),
    ...servers.map((s) => {
      const st = s.connected ? chalk5.green("\u2713") : chalk5.red("\u2717");
      return `  ${st} ${chalk5.cyan(s.id)} ${chalk5.dim(`(${s.tools.length} \u5DE5\u5177)`)}`;
    })
  ].join("\n") };
}
function handleSecurityCommand(args, orchestrator) {
  if (!orchestrator) return { handled: true, output: renderError("\u7F16\u6392\u5668\u672A\u521D\u59CB\u5316") };
  const config = orchestrator.getSecurityChecker().getConfig();
  return { handled: true, output: [
    chalk5.bold("\n\u5B89\u5168\u68C0\u67E5\u914D\u7F6E:"),
    `  ${chalk5.dim("\u542F\u7528:")} ${config.enabled ? chalk5.green("\u662F") : chalk5.red("\u5426")}`,
    `  ${chalk5.dim("\u4E25\u91CD\u6027\u9608\u503C:")} ${chalk5.yellow(config.severityThreshold)}`,
    `  ${chalk5.dim("\u68C0\u67E5\u7C7B\u522B:")} ${config.categories.length} \u4E2A`
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
    chalk5.bold("\n\u4EE3\u7801\u5BA1\u67E5\u914D\u7F6E:"),
    `  ${chalk5.dim("\u7F6E\u4FE1\u5EA6\u9608\u503C:")} ${chalk5.yellow(config.confidenceThreshold)}`,
    `  ${chalk5.dim("\u6700\u5927\u95EE\u9898\u6570:")} ${config.maxIssues}`
  ].join("\n") };
}
function handleMemoryCommand() {
  const entries = memoryManager.getAll();
  if (entries.length === 0) {
    return { handled: true, output: chalk5.dim("\n\u6682\u65E0\u8BB0\u5FC6") };
  }
  const typeLabels = {
    user: chalk5.blue("\u7528\u6237"),
    project: chalk5.green("\u9879\u76EE"),
    feedback: chalk5.yellow("\u53CD\u9988"),
    reference: chalk5.magenta("\u53C2\u8003")
  };
  const lines = [chalk5.bold("\n\u8BB0\u5FC6\u7CFB\u7EDF:")];
  const byType = {};
  for (const e of entries) {
    (byType[e.type] ??= []).push(e);
  }
  for (const [type, items] of Object.entries(byType)) {
    lines.push(`  ${typeLabels[type] || type}:`);
    for (const e of items) {
      lines.push(`    ${chalk5.cyan(e.name)} \u2014 ${chalk5.dim(e.description)}`);
    }
  }
  return { handled: true, output: lines.join("\n") };
}
function handleHookCommand(args, orchestrator) {
  if (!orchestrator) return { handled: true, output: renderError("\u7F16\u6392\u5668\u672A\u521D\u59CB\u5316") };
  const hooks = orchestrator.getHookManager().getHooks();
  if (hooks.length === 0) return { handled: true, output: chalk5.dim("\n\u65E0\u5DF2\u6CE8\u518C\u94A9\u5B50") };
  return { handled: true, output: [
    chalk5.bold("\n\u5DF2\u6CE8\u518C\u94A9\u5B50:"),
    ...hooks.map((h) => {
      const s = h.enabled ? chalk5.green("\u2713") : chalk5.red("\u2717");
      return `  ${s} ${chalk5.cyan(h.name)} ${chalk5.dim(`[${h.event}]`)}`;
    })
  ].join("\n") };
}
function handleTraceCommand(orchestrator) {
  if (!orchestrator) return { handled: true, output: renderError("\u7F16\u6392\u5668\u672A\u521D\u59CB\u5316") };
  const tracer = orchestrator.getTracer();
  if (!tracer) {
    return { handled: true, output: chalk5.dim("\n\u65E0\u6D3B\u8DC3\u7684 Trace \u4F1A\u8BDD\uFF08\u6267\u884C\u4E00\u6B21\u4EFB\u52A1\u540E\u53EF\u67E5\u770B\uFF09") };
  }
  const session = tracer.getSession();
  const stats = tracer.getStats();
  const summary = generateSummary(session, stats);
  return { handled: true, output: "\n" + formatSummary(summary) };
}
function handleThemeCommand(args) {
  const currentTheme2 = getThemeName();
  const availableThemes = getAvailableThemes();
  if (args.length === 0) {
    const lines = [
      chalk5.bold("\n\u4E3B\u9898\u8BBE\u7F6E"),
      chalk5.dim("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"),
      `  \u5F53\u524D\u4E3B\u9898: ${chalk5.cyan(currentTheme2)}`,
      "",
      chalk5.bold("\u53EF\u7528\u4E3B\u9898:"),
      ...availableThemes.map((t) => {
        const isCurrent = t === currentTheme2;
        return `  ${chalk5.cyan(t)}${isCurrent ? chalk5.yellow(" [\u5F53\u524D]") : ""}`;
      }),
      "",
      chalk5.dim("\u4F7F\u7528 /theme <name> \u5207\u6362\u4E3B\u9898")
    ];
    return { handled: true, output: lines.join("\n") };
  }
  const themeName = args[0];
  if (!availableThemes.includes(themeName)) {
    return { handled: true, output: renderError(`\u672A\u77E5\u4E3B\u9898: ${themeName}
\u53EF\u7528\u4E3B\u9898: ${availableThemes.join(", ")}`) };
  }
  setTheme(themeName);
  return { handled: true, output: renderSuccess(`\u5DF2\u5207\u6362\u5230\u4E3B\u9898: ${themeName}`) };
}
function handleGitCommand(args) {
  if (!gitManager.isRepository()) {
    return { handled: true, output: renderError("\u5F53\u524D\u76EE\u5F55\u4E0D\u662F Git \u4ED3\u5E93") };
  }
  const subCommand = args[0];
  if (!subCommand) {
    const status = gitManager.getStatus();
    return { handled: true, output: gitManager.renderStatus(status) };
  }
  switch (subCommand) {
    case "status":
    case "st": {
      const status = gitManager.getStatus();
      return { handled: true, output: gitManager.renderStatus(status) };
    }
    case "log": {
      const count = parseInt(args[1]) || 10;
      const log = gitManager.getLog(count);
      log.then((commits) => {
        console.log(gitManager.renderLog(commits));
      });
      return { handled: true, output: chalk5.dim("\u52A0\u8F7D\u4E2D...") };
    }
    case "branch":
    case "br": {
      const branches = gitManager.getBranches();
      return { handled: true, output: gitManager.renderBranches(branches) };
    }
    case "add": {
      if (args.length < 2) {
        return { handled: true, output: renderError("\u7528\u6CD5: /git add <file> \u6216 /git add .") };
      }
      if (args[1] === ".") {
        gitManager.stageAll();
        return { handled: true, output: renderSuccess("\u5DF2\u6682\u5B58\u6240\u6709\u6587\u4EF6") };
      }
      gitManager.stage(args.slice(1));
      return { handled: true, output: renderSuccess(`\u5DF2\u6682\u5B58\u6587\u4EF6: ${args.slice(1).join(", ")}`) };
    }
    case "commit": {
      if (args.length < 2) {
        return { handled: true, output: renderError("\u7528\u6CD5: /git commit <message>") };
      }
      const message = args.slice(1).join(" ");
      try {
        const result = gitManager.commit(message);
        return { handled: true, output: renderSuccess(result) };
      } catch (error) {
        return { handled: true, output: renderError(error.message) };
      }
    }
    case "diff": {
      const file = args[1];
      const staged = args.includes("--staged") || args.includes("-S");
      const diff = gitManager.getDiff(file, staged);
      return { handled: true, output: gitManager.renderDiff(diff) };
    }
    case "remote": {
      const remotes = gitManager.getRemotes();
      if (remotes.length === 0) {
        return { handled: true, output: chalk5.dim("\u65E0\u8FDC\u7A0B\u4ED3\u5E93") };
      }
      const lines = [
        chalk5.bold("\n\u8FDC\u7A0B\u4ED3\u5E93:"),
        ...remotes.map((r) => `  ${chalk5.cyan(r.name)} ${chalk5.dim(r.url)}`)
      ];
      return { handled: true, output: lines.join("\n") };
    }
    default:
      return { handled: true, output: renderError(`\u672A\u77E5 Git \u5B50\u547D\u4EE4: ${subCommand}
\u53EF\u7528: status, log, branch, add, commit, diff, remote`) };
  }
}
function handleDiffCommand(args) {
  if (args.length < 2) {
    return { handled: true, output: renderError("\u7528\u6CD5: /diff <old-file> <new-file> \u6216 /diff --staged") };
  }
  if (args[0] === "--staged") {
    if (!gitManager.isRepository()) {
      return { handled: true, output: renderError("\u5F53\u524D\u76EE\u5F55\u4E0D\u662F Git \u4ED3\u5E93") };
    }
    const diff = gitManager.getDiff(void 0, true);
    return { handled: true, output: gitManager.renderDiff(diff) };
  }
  const fs = __require("fs");
  const oldFile = args[0];
  const newFile = args[1];
  try {
    const oldContent = fs.existsSync(oldFile) ? fs.readFileSync(oldFile, "utf-8") : "";
    const newContent = fs.existsSync(newFile) ? fs.readFileSync(newFile, "utf-8") : "";
    const diff = diffGenerator.generateDiff(oldContent, newContent, newFile);
    const stats = diffGenerator.getStats(diff);
    const output = [
      diffGenerator.renderDiff(diff),
      "",
      chalk5.bold("\u7EDF\u8BA1:"),
      `  ${chalk5.green(`+${stats.additions} \u884C\u65B0\u589E`)}`,
      `  ${chalk5.red(`-${stats.deletions} \u884C\u5220\u9664`)}`
    ].join("\n");
    return { handled: true, output };
  } catch (error) {
    return { handled: true, output: renderError(error.message) };
  }
}
function handleLintCommand(args) {
  const fs = __require("fs");
  const path = __require("path");
  if (args.length === 0) {
    const files = findFiles(process.cwd(), [".ts", ".tsx"]);
    if (files.length === 0) {
      return { handled: true, output: chalk5.dim("\u672A\u627E\u5230 TypeScript \u6587\u4EF6") };
    }
    const allResults = [];
    for (const file of files.slice(0, 10)) {
      try {
        const content = fs.readFileSync(file, "utf-8");
        const results = lintChecker.checkTypeScript(content, file);
        allResults.push(...results);
      } catch {
      }
    }
    return { handled: true, output: lintChecker.renderResults(allResults) };
  }
  const filePath = args[0];
  if (!fs.existsSync(filePath)) {
    return { handled: true, output: renderError(`\u6587\u4EF6\u4E0D\u5B58\u5728: ${filePath}`) };
  }
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const ext = path.extname(filePath);
    let results;
    if (ext === ".dart") {
      results = lintChecker.checkDart(content, filePath);
    } else {
      results = lintChecker.checkTypeScript(content, filePath);
    }
    return { handled: true, output: lintChecker.renderResults(results) };
  } catch (error) {
    return { handled: true, output: renderError(error.message) };
  }
}
function handleTestCommand(args) {
  const { execSync: execSync2 } = __require("child_process");
  const fs = __require("fs");
  const isDart = fs.existsSync("pubspec.yaml");
  const isNode = fs.existsSync("package.json");
  const isPython = fs.existsSync("pyproject.toml") || fs.existsSync("requirements.txt");
  const isRust = fs.existsSync("Cargo.toml");
  const isGo = fs.existsSync("go.mod");
  let command;
  let parser;
  if (isDart) {
    parser = "dart";
    command = "flutter test";
  } else if (isNode) {
    parser = "jest";
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
    if (packageJson.scripts?.test) {
      command = "npm test";
    } else {
      command = "npx jest";
    }
  } else if (isPython) {
    parser = "pytest";
    command = "pytest";
  } else if (isRust) {
    parser = "cargo";
    command = "cargo test";
  } else if (isGo) {
    parser = "go";
    command = "go test ./...";
  } else {
    return { handled: true, output: renderError("\u672A\u8BC6\u522B\u7684\u9879\u76EE\u7C7B\u578B\uFF08\u9700\u8981 pubspec.yaml\u3001package.json\u3001pyproject.toml\u3001Cargo.toml \u6216 go.mod\uFF09") };
  }
  if (args.length > 0) {
    command += " " + args.join(" ");
  }
  try {
    const output = execSync2(command, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"]
    });
    const { testRunner: testRunner2 } = (init_structured_edit(), __toCommonJS(structured_edit_exports));
    let suite;
    if (parser === "dart") {
      suite = testRunner2.parseDartTestOutput(output);
    } else {
      suite = testRunner2.parseJestOutput(output);
    }
    return { handled: true, output: testRunner2.renderResults(suite) };
  } catch (error) {
    const output = error.stdout || error.stderr || "";
    if (output) {
      const { testRunner: testRunner2 } = (init_structured_edit(), __toCommonJS(structured_edit_exports));
      let suite;
      if (parser === "dart") {
        suite = testRunner2.parseDartTestOutput(output);
      } else {
        suite = testRunner2.parseJestOutput(output);
      }
      return { handled: true, output: testRunner2.renderResults(suite) };
    }
    return { handled: true, output: renderError(`\u6D4B\u8BD5\u6267\u884C\u5931\u8D25: ${error.message}`) };
  }
}
function findFiles(dir, extensions) {
  const fs = __require("fs");
  const path = __require("path");
  const results = [];
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        if (!["node_modules", ".git", "dist", "build"].includes(file)) {
          results.push(...findFiles(filePath, extensions));
        }
      } else {
        const ext = path.extname(file);
        if (extensions.includes(ext)) {
          results.push(filePath);
        }
      }
    }
  } catch {
  }
  return results;
}
function handleASTCommand(args) {
  const fs = __require("fs");
  const path = __require("path");
  if (args.length === 0) {
    const supportedLanguages = treeSitterParserManager.getSupportedLanguages();
    const lines = [
      chalk5.bold("\nAST \u89E3\u6790\u5668"),
      chalk5.dim("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"),
      `  \u652F\u6301\u7684\u8BED\u8A00: ${supportedLanguages.join(", ")}`,
      "",
      chalk5.bold("\u7528\u6CD5:"),
      "  /ast <file>           \u89E3\u6790\u6587\u4EF6\u7ED3\u6784",
      "  /ast --init           \u521D\u59CB\u5316 tree-sitter \u89E3\u6790\u5668",
      "  /ast --languages      \u663E\u793A\u652F\u6301\u7684\u8BED\u8A00"
    ];
    return { handled: true, output: lines.join("\n") };
  }
  if (args[0] === "--init") {
    astManager.initializeTreeSitter().then((success) => {
      if (success) {
        console.log(renderSuccess("tree-sitter \u89E3\u6790\u5668\u521D\u59CB\u5316\u6210\u529F"));
      } else {
        console.log(renderError("tree-sitter \u89E3\u6790\u5668\u521D\u59CB\u5316\u5931\u8D25"));
      }
    });
    return { handled: true, output: chalk5.dim("\u6B63\u5728\u521D\u59CB\u5316 tree-sitter \u89E3\u6790\u5668...") };
  }
  if (args[0] === "--languages") {
    const supportedLanguages = treeSitterParserManager.getSupportedLanguages();
    const lines = [
      chalk5.bold("\n\u652F\u6301\u7684\u8BED\u8A00:"),
      ...supportedLanguages.map((lang) => `  \u2022 ${lang}`)
    ];
    return { handled: true, output: lines.join("\n") };
  }
  const filePath = args[0];
  if (!fs.existsSync(filePath)) {
    return { handled: true, output: renderError(`\u6587\u4EF6\u4E0D\u5B58\u5728: ${filePath}`) };
  }
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const structure = astManager.getFileStructure(filePath, content);
    const stats = astManager.getStats();
    const output = [
      chalk5.bold(`\u6587\u4EF6\u7ED3\u6784: ${filePath}`),
      chalk5.dim("\u2500".repeat(60)),
      structure,
      "",
      chalk5.dim(`\u5DF2\u89E3\u6790 ${stats.files} \u4E2A\u6587\u4EF6\uFF0C\u7D22\u5F15 ${stats.symbols} \u4E2A\u7B26\u53F7`)
    ].join("\n");
    return { handled: true, output };
  } catch (error) {
    return { handled: true, output: renderError(error.message) };
  }
}
function handleSymbolCommand(args) {
  const fs = __require("fs");
  const path = __require("path");
  if (args.length === 0) {
    const lines = [
      chalk5.bold("\n\u7B26\u53F7\u641C\u7D22"),
      chalk5.dim("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"),
      "  /symbol <query>           \u641C\u7D22\u7B26\u53F7",
      "  /symbol <query> --type=f  \u53EA\u641C\u7D22\u51FD\u6570",
      "  /symbol <query> --type=c  \u53EA\u641C\u7D22\u7C7B",
      "  /symbol <query> --exact   \u7CBE\u786E\u5339\u914D",
      "",
      chalk5.dim("\u7C7B\u578B: f=\u51FD\u6570, c=\u7C7B, m=\u65B9\u6CD5, v=\u53D8\u91CF, i=\u63A5\u53E3, t=\u7C7B\u578B, e=\u679A\u4E3E")
    ];
    return { handled: true, output: lines.join("\n") };
  }
  const query = args[0];
  const options = {};
  for (const arg of args.slice(1)) {
    if (arg.startsWith("--type=")) {
      const typeMap = {
        "f": "function",
        "c": "class",
        "m": "method",
        "v": "variable",
        "i": "interface",
        "t": "type",
        "e": "enum"
      };
      const typeChar = arg.slice(7);
      options.type = typeMap[typeChar] || typeChar;
    } else if (arg === "--exact") {
      options.exact = true;
    } else if (arg.startsWith("--file=")) {
      options.filePath = arg.slice(7);
    }
  }
  const stats = astManager.getStats();
  if (stats.symbols === 0) {
    const files = findFiles(process.cwd(), [".ts", ".tsx", ".dart"]);
    for (const file of files.slice(0, 50)) {
      try {
        const content = fs.readFileSync(file, "utf-8");
        astManager.parseFile(content, file);
      } catch {
      }
    }
  }
  const results = astManager.searchSymbol(query, options);
  const output = astManager.renderSearchResults(results);
  return { handled: true, output };
}
function handleFetchCommand(args) {
  if (args.length === 0) {
    const lines = [
      chalk5.bold("\n\u7F51\u9875\u83B7\u53D6"),
      chalk5.dim("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"),
      "  /fetch <url>              \u83B7\u53D6\u7F51\u9875\u5185\u5BB9",
      "  /fetch <url> --text       \u53EA\u83B7\u53D6\u6587\u672C",
      "  /fetch <url> --compact    \u7B80\u6D01\u6A21\u5F0F",
      "  /fetch <url> --links      \u663E\u793A\u94FE\u63A5",
      "",
      chalk5.dim("\u793A\u4F8B:"),
      "  /fetch https://example.com",
      "  /fetch https://example.com --text",
      "  /fetch https://example.com --compact"
    ];
    return { handled: true, output: lines.join("\n") };
  }
  const url = args[0];
  const options = { url };
  for (const arg of args.slice(1)) {
    if (arg === "--text") {
      options.extractText = true;
      options.extractLinks = false;
      options.extractImages = false;
    } else if (arg === "--compact") {
      options.compact = true;
    } else if (arg === "--links") {
      options.extractLinks = true;
    } else if (arg === "--images") {
      options.extractImages = true;
    }
  }
  webFetchManager.fetch(options).then((result) => {
    if (options.compact) {
      console.log(webFetchManager.renderCompactResult(result));
    } else {
      console.log(webFetchManager.renderResult(result));
    }
  }).catch((error) => {
    console.log(renderError(`\u83B7\u53D6\u5931\u8D25: ${error.message}`));
  });
  return { handled: true, output: chalk5.dim("\u6B63\u5728\u83B7\u53D6\u7F51\u9875...") };
}
function handleSearchCommand(args) {
  if (args.length === 0) {
    const isConfigured = webSearchManager.isConfigured();
    const lines = [
      chalk5.bold("\n\u7F51\u7EDC\u641C\u7D22"),
      chalk5.dim("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"),
      `  \u72B6\u6001: ${isConfigured ? chalk5.green("\u2713 \u5DF2\u914D\u7F6E") : chalk5.red("\u2717 \u672A\u914D\u7F6E")}`,
      "",
      chalk5.bold("\u7528\u6CD5:"),
      "  /search <query>           \u641C\u7D22\u7F51\u7EDC",
      "  /search <query> --compact \u7B80\u6D01\u6A21\u5F0F",
      "  /search <query> --top=20  \u8BBE\u7F6E\u7ED3\u679C\u6570\u91CF",
      "  /search --key <key>       \u8BBE\u7F6E API Key",
      "",
      chalk5.dim("\u793A\u4F8B:"),
      "  /search TypeScript AST \u89E3\u6790\u5E93",
      "  /search React \u72B6\u6001\u7BA1\u7406 \u6700\u4F73\u5B9E\u8DF5",
      "  /search --key your-api-key"
    ];
    return { handled: true, output: lines.join("\n") };
  }
  if (args[0] === "--key") {
    if (args.length < 2) {
      return { handled: true, output: renderError("\u7528\u6CD5: /search --key <your-api-key>") };
    }
    webSearchManager.setApiKey(args[1]);
    return { handled: true, output: renderSuccess("API Key \u5DF2\u8BBE\u7F6E") };
  }
  let query = args[0];
  const options = { query };
  for (const arg of args.slice(1)) {
    if (arg === "--compact") {
      options.compact = true;
    } else if (arg.startsWith("--top=")) {
      options.topK = parseInt(arg.slice(6));
    }
  }
  webSearchManager.search(options).then((result) => {
    if (options.compact) {
      console.log(webSearchManager.renderCompactResult(result));
    } else {
      console.log(webSearchManager.renderResult(result));
    }
  }).catch((error) => {
    console.log(renderError(`\u641C\u7D22\u5931\u8D25: ${error.message}`));
  });
  return { handled: true, output: chalk5.dim("\u6B63\u5728\u641C\u7D22...") };
}
function handleStateCommand(args) {
  if (args.length === 0) {
    const lines = [
      chalk5.bold("\n\u72B6\u6001\u673A\u7BA1\u7406"),
      chalk5.dim("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"),
      "  /state status             \u663E\u793A\u5F53\u524D\u72B6\u6001",
      "  /state history            \u663E\u793A\u72B6\u6001\u5386\u53F2",
      "  /state graph              \u663E\u793A\u72B6\u6001\u8F6C\u6362\u56FE",
      "  /state snapshot <file>    \u4FDD\u5B58\u72B6\u6001\u5FEB\u7167",
      "  /state restore <file>     \u6062\u590D\u72B6\u6001\u5FEB\u7167",
      "  /state reset              \u91CD\u7F6E\u72B6\u6001\u673A",
      "",
      chalk5.dim("\u793A\u4F8B:"),
      "  /state status",
      "  /state snapshot state.json",
      "  /state restore state.json"
    ];
    return { handled: true, output: lines.join("\n") };
  }
  const subCommand = args[0];
  const exampleStateMachine = createStateMachine({
    initialState: "idle",
    states: ["idle", "processing", "completed", "error"],
    transitions: [
      { from: "idle", to: "processing", event: "start" },
      { from: "processing", to: "completed", event: "finish" },
      { from: "processing", to: "error", event: "fail" },
      { from: "error", to: "idle", event: "reset" },
      { from: "completed", to: "idle", event: "reset" }
    ]
  });
  switch (subCommand) {
    case "status":
      return { handled: true, output: exampleStateMachine.render() };
    case "history": {
      const history = exampleStateMachine.getHistory();
      if (history.length === 0) {
        return { handled: true, output: chalk5.dim("\u6682\u65E0\u72B6\u6001\u5386\u53F2") };
      }
      const lines = [
        chalk5.bold("\n\u72B6\u6001\u5386\u53F2"),
        chalk5.dim("\u2500".repeat(60)),
        ...history.map((entry) => {
          const time = new Date(entry.timestamp).toLocaleTimeString();
          const duration = entry.duration ? ` (${entry.duration}ms)` : "";
          return `  ${chalk5.gray(time)} ${chalk5.cyan(entry.from)} \u2192 ${chalk5.cyan(entry.to)} ${chalk5.dim(entry.event)}${duration}`;
        })
      ];
      return { handled: true, output: lines.join("\n") };
    }
    case "graph":
      return { handled: true, output: exampleStateMachine.renderTransitionGraph() };
    case "snapshot": {
      if (args.length < 2) {
        return { handled: true, output: renderError("\u7528\u6CD5: /state snapshot <file>") };
      }
      const filePath = args[1];
      const snapshot = exampleStateMachine.createSnapshot();
      saveSnapshot(snapshot, filePath).then(() => {
        console.log(renderSuccess(`\u72B6\u6001\u5FEB\u7167\u5DF2\u4FDD\u5B58: ${filePath}`));
      }).catch((error) => {
        console.log(renderError(`\u4FDD\u5B58\u5931\u8D25: ${error.message}`));
      });
      return { handled: true, output: chalk5.dim("\u6B63\u5728\u4FDD\u5B58\u72B6\u6001\u5FEB\u7167...") };
    }
    case "restore": {
      if (args.length < 2) {
        return { handled: true, output: renderError("\u7528\u6CD5: /state restore <file>") };
      }
      const filePath = args[1];
      loadSnapshot(filePath).then((snapshot) => {
        if (!snapshot) {
          console.log(renderError(`\u5FEB\u7167\u6587\u4EF6\u4E0D\u5B58\u5728: ${filePath}`));
          return;
        }
        exampleStateMachine.restoreFromSnapshot(snapshot);
        console.log(renderSuccess("\u72B6\u6001\u5DF2\u6062\u590D"));
        console.log(exampleStateMachine.render());
      }).catch((error) => {
        console.log(renderError(`\u6062\u590D\u5931\u8D25: ${error.message}`));
      });
      return { handled: true, output: chalk5.dim("\u6B63\u5728\u6062\u590D\u72B6\u6001...") };
    }
    case "reset":
      exampleStateMachine.reset();
      return { handled: true, output: renderSuccess("\u72B6\u6001\u673A\u5DF2\u91CD\u7F6E") };
    default:
      return { handled: true, output: renderError(`\u672A\u77E5\u5B50\u547D\u4EE4: ${subCommand}`) };
  }
}

// src/version.ts
var VERSION = "1.0.0";

// src/cli/input-layout.ts
init_theme();
var InputLayoutManager = class {
  width;
  constructor() {
    this.width = process.stdout.columns || 80;
  }
  /**
   * 渲染输入框布局
   */
  render(options) {
    const theme = getTheme();
    const {
      statusData,
      prompt = "\u276F ",
      showShortcuts = true,
      shortcuts = [],
      width = this.width
    } = options;
    const lines = [];
    lines.push(theme.inactive("\u2500".repeat(width)));
    lines.push(this.renderStatusLine(statusData, width));
    lines.push(theme.inactive("\u2500".repeat(width)));
    lines.push(theme.claude(prompt));
    if (showShortcuts && shortcuts.length > 0) {
      lines.push(this.renderShortcuts(shortcuts, width));
    }
    return lines.join("\n");
  }
  /**
   * 渲染状态行
   */
  renderStatusLine(data, width) {
    const theme = getTheme();
    const parts = [];
    if (data.model) {
      parts.push(theme.warning(data.model));
    }
    if (data.currentDir) {
      const dir = this.truncate(data.currentDir, 30);
      parts.push(theme.subtle(dir));
    }
    if (data.contextPercent !== void 0) {
      const pct = data.contextPercent;
      const pctColor = pct > 80 ? theme.error : pct > 50 ? theme.warning : theme.success;
      parts.push(pctColor(`${pct}%`));
    }
    if (data.permissionMode) {
      parts.push(theme.permission(data.permissionMode));
    }
    if (data.vimMode) {
      parts.push(theme.ide(`[${data.vimMode.toUpperCase()}]`));
    }
    if (data.cost !== void 0) {
      parts.push(theme.subtle(`$${data.cost.toFixed(4)}`));
    }
    if (data.duration !== void 0) {
      const seconds = Math.floor(data.duration / 1e3);
      parts.push(theme.subtle(this.formatDuration(seconds)));
    }
    const content = parts.join(" \u2502 ");
    const contentLength = this.stripAnsi(content).length;
    const padding = Math.max(0, width - contentLength - 2);
    return ` ${content}${" ".repeat(padding)} `;
  }
  /**
   * 渲染快捷键提示
   */
  renderShortcuts(shortcuts, width) {
    const theme = getTheme();
    const parts = [];
    for (const shortcut of shortcuts) {
      parts.push(`${theme.claude(shortcut.key)}${theme.subtle(":")}${theme.text(shortcut.desc)}`);
    }
    const content = parts.join(" \u2502 ");
    const contentLength = this.stripAnsi(content).length;
    const padding = Math.max(0, width - contentLength - 2);
    return theme.subtle(` ${content}${" ".repeat(padding)} `);
  }
  /**
   * 渲染简洁布局
   */
  renderCompact(statusData, prompt = "\u276F ") {
    const theme = getTheme();
    const width = this.width;
    const lines = [];
    lines.push(theme.inactive("\u2500".repeat(width)));
    const parts = [];
    if (statusData.model) {
      parts.push(theme.warning(statusData.model));
    }
    if (statusData.contextPercent !== void 0) {
      const pct = statusData.contextPercent;
      const pctColor = pct > 80 ? theme.error : pct > 50 ? theme.warning : theme.success;
      parts.push(pctColor(`${pct}%`));
    }
    const content = parts.join(" \u2502 ");
    const contentLength = this.stripAnsi(content).length;
    const padding = Math.max(0, width - contentLength - 2);
    lines.push(` ${content}${" ".repeat(padding)} `);
    lines.push(theme.inactive("\u2500".repeat(width)));
    lines.push(theme.claude(prompt));
    return lines.join("\n");
  }
  /**
   * 渲染分隔线
   */
  renderDivider(width) {
    const theme = getTheme();
    return theme.inactive("\u2500".repeat(width || this.width));
  }
  /**
   * 更新终端宽度
   */
  updateWidth(width) {
    this.width = width;
  }
  // 辅助函数
  stripAnsi(str) {
    return str.replace(/\x1B\[[0-9;]*m/g, "");
  }
  truncate(str, maxLen) {
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen - 3) + "...";
  }
  formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
};
function createInputLayoutManager() {
  return new InputLayoutManager();
}
var inputLayoutManager = createInputLayoutManager();

// src/cli/repl.ts
function askSetup(promptText) {
  const rl = readline2.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve8) => {
    rl.question(promptText, (answer) => {
      rl.close();
      resolve8(answer);
    });
  });
}
async function selectSetup(promptText, options) {
  console.log(chalk6.bold(`
${promptText}`));
  options.forEach((opt, i) => {
    console.log(`  ${chalk6.cyan(i + 1 + "")}. ${opt}`);
  });
  console.log(chalk6.dim("  0. \u53D6\u6D88"));
  const answer = await askSetup(chalk6.cyan("\n> "));
  const num = parseInt(answer.trim());
  if (isNaN(num) || num < 0 || num > options.length) return null;
  return num === 0 ? null : num - 1;
}
async function flowFirstSetup(cm, ai) {
  console.log(chalk6.bold("\n  \u6B22\u8FCE\u4F7F\u7528 Forge CLI"));
  console.log(chalk6.dim("  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  console.log("  \u68C0\u6D4B\u5230\u5C1A\u672A\u914D\u7F6E\u6A21\u578B\uFF0C\u8BF7\u9009\u62E9\u4E00\u4E2A provider \u5F00\u59CB:\n");
  const presetEntries = Object.entries(PROVIDER_PRESETS);
  const options = presetEntries.map(([key, preset2]) => {
    const models = preset2.models.slice(0, 3).join(", ") + (preset2.models.length > 3 ? "..." : "");
    return `${chalk6.cyan(key.padEnd(14))} ${models}`;
  });
  options.push(chalk6.dim("\u81EA\u5B9A\u4E49 provider"));
  const sel = await selectSetup("\u9009\u62E9 Provider:", options);
  if (sel === null) return { handled: true, output: chalk6.dim("\u5DF2\u53D6\u6D88") };
  if (sel === presetEntries.length) {
    return await setupCustomProvider(cm, ai);
  }
  const [providerKey, preset] = presetEntries[sel];
  console.log(chalk6.yellow(`
  \u8BF7\u8F93\u5165 ${providerKey} \u7684 API Key`));
  const apiKey = await askSetup(chalk6.cyan("  API Key > "));
  if (!apiKey.trim()) return { handled: true, output: chalk6.dim("\u5DF2\u53D6\u6D88") };
  cm.setApiKey(providerKey, apiKey.trim());
  const modelOptions = preset.models.map((m) => chalk6.cyan(m));
  const modelSel = await selectSetup("\u9009\u62E9\u9ED8\u8BA4\u6A21\u578B:", modelOptions);
  const selectedModel = modelSel !== null ? preset.models[modelSel] : preset.models[0];
  cm.setSelectedModel(providerKey, selectedModel);
  ai.setModel(cm.getModel(providerKey, selectedModel));
  cm.save().catch(() => {
  });
  return { handled: true, output: renderSuccess(`\u914D\u7F6E\u5B8C\u6210\uFF01\u5F53\u524D\u6A21\u578B: ${providerKey} / ${selectedModel}`) };
}
async function setupCustomProvider(cm, ai) {
  console.log(chalk6.bold("\n  \u6DFB\u52A0\u81EA\u5B9A\u4E49 provider"));
  console.log(chalk6.dim("  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
  const name = await askSetup(chalk6.cyan("  \u540D\u79F0 > "));
  if (!name.trim()) return { handled: true, output: chalk6.dim("\u5DF2\u53D6\u6D88") };
  const baseUrl = await askSetup(chalk6.cyan("  Base URL > "));
  if (!baseUrl.trim()) return { handled: true, output: chalk6.dim("\u5DF2\u53D6\u6D88") };
  const apiKey = await askSetup(chalk6.cyan("  API Key > "));
  if (!apiKey.trim()) return { handled: true, output: chalk6.dim("\u5DF2\u53D6\u6D88") };
  const modelsStr = await askSetup(chalk6.cyan("  \u6A21\u578B\uFF08\u9017\u53F7\u5206\u9694\uFF09 > "));
  if (!modelsStr.trim()) return { handled: true, output: chalk6.dim("\u5DF2\u53D6\u6D88") };
  const models = modelsStr.split(",").map((m) => m.trim()).filter(Boolean);
  if (models.length === 0) return { handled: true, output: renderError("\u81F3\u5C11\u9700\u8981\u4E00\u4E2A\u6A21\u578B") };
  cm.addCustomProvider(name.trim(), { name: name.trim(), base_url: baseUrl.trim(), api_key: apiKey.trim(), models });
  const modelOptions = models.map((m) => chalk6.cyan(m));
  const sel = await selectSetup("\u9009\u62E9\u9ED8\u8BA4\u6A21\u578B:", modelOptions);
  const selectedModel = sel !== null ? models[sel] : models[0];
  cm.setSelectedModel(name.trim(), selectedModel);
  ai.setModel(cm.getModel(name.trim(), selectedModel));
  cm.save().catch(() => {
  });
  return { handled: true, output: renderSuccess(`\u914D\u7F6E\u5B8C\u6210\uFF01\u5F53\u524D\u6A21\u578B: ${name.trim()} / ${selectedModel}`) };
}
async function startREPL() {
  process.on("uncaughtException", (err) => {
    console.error(chalk6.red(`
\u672A\u6355\u83B7\u5F02\u5E38: ${err.message}`));
    console.error(err.stack);
  });
  process.on("unhandledRejection", (reason) => {
    console.error(chalk6.red(`
\u672A\u5904\u7406\u7684\u62D2\u7EDD: ${reason}`));
    if (reason instanceof Error) console.error(reason.stack);
  });
  const config = await configManager.load();
  const defaultPk = configManager.getDefaultProvider();
  const currentModel = configManager.getModel();
  const aiClient = new AIClient(currentModel);
  if (!configManager.isConfigured()) {
    const { handled, output } = await flowFirstSetup(configManager, aiClient);
    if (handled && output) console.log(output);
  }
  registerAllTools();
  const orchestrator = new AgentOrchestrator(
    aiClient,
    contextManager,
    toolRegistry,
    config.project.root
  );
  contextManager.setSummarizer(async (messages) => {
    const text = messages.map((m) => `[${m.role}] ${m.content.slice(0, 200)}`).join("\n");
    const result = await aiClient.generate(
      `\u8BF7\u7528\u4E2D\u6587\u5C06\u4EE5\u4E0B\u5BF9\u8BDD\u5386\u53F2\u538B\u7F29\u4E3A\u4E00\u6BB5\u7B80\u660E\u6458\u8981\uFF0C\u4FDD\u7559\u5173\u952E\u4FE1\u606F\uFF08\u7528\u6237\u9700\u6C42\u3001\u51B3\u7B56\u3001\u4EE3\u7801\u53D8\u66F4\u3001\u6587\u4EF6\u8DEF\u5F84\uFF09\uFF1A

${text}`,
      "\u4F60\u662F\u4E00\u4E2A\u5BF9\u8BDD\u6458\u8981\u5668\u3002\u53EA\u8F93\u51FA\u6458\u8981\uFF0C\u4E0D\u8981\u6DFB\u52A0\u989D\u5916\u8BF4\u660E\u3002",
      void 0,
      1
    );
    return result.text;
  });
  const memoryContext = memoryManager.getContextString();
  contextManager.setSystemPrompt(
    `\u4F60\u662F Forge CLI\uFF0C\u4E00\u4E2A\u4E13\u4E1A\u7684 AI \u5F00\u53D1\u52A9\u624B\u3002\u4F60\u5E2E\u52A9\u7528\u6237\u5B8C\u6210\u5404\u79CD\u5F00\u53D1\u4EFB\u52A1\uFF0C\u5305\u62EC\u9700\u6C42\u5206\u6790\u3001\u65B9\u6848\u8BBE\u8BA1\u3001\u4EE3\u7801\u5B9E\u73B0\u548C\u9A8C\u8BC1\u3002
\u4F60\u652F\u6301\u591A\u79CD\u7F16\u7A0B\u8BED\u8A00\u548C\u6846\u67B6\uFF0C\u5305\u62EC\u4F46\u4E0D\u9650\u4E8E TypeScript\u3001JavaScript\u3001Python\u3001Java\u3001Go\u3001Rust\u3001Dart/Flutter \u7B49\u3002
\u4F60\u9075\u5FAA\u7ED3\u6784\u5316\u5DE5\u4F5C\u6D41\uFF1AS1 \u9700\u6C42\u5206\u6790 \u2192 S2 \u65B9\u6848\u8BBE\u8BA1 \u2192 S3 \u4EFB\u52A1\u62C6\u5206\uFF08\u53EF\u9009\uFF09\u2192 S4 \u5B9E\u73B0 \u2192 S5 \u9A8C\u8BC1\u3002
\u4F60\u53EF\u4EE5\u4F7F\u7528\u5DE5\u5177\u6765\u8BFB\u5199\u6587\u4EF6\u3001\u6267\u884C\u547D\u4EE4\u3001\u626B\u63CF\u9879\u76EE\u3001\u641C\u7D22\u4EE3\u7801\u3001\u83B7\u53D6\u7F51\u9875\u5185\u5BB9\u3001\u641C\u7D22\u7F51\u7EDC\u7B49\u3002
\u53EF\u7528\u5DE5\u5177\uFF1A
- read_file: \u8BFB\u53D6\u6587\u4EF6\u5185\u5BB9\uFF08\u652F\u6301\u884C\u53F7\u8303\u56F4\uFF09
- write_file: \u5199\u5165\u6587\u4EF6
- edit_file: \u7F16\u8F91\u6587\u4EF6\uFF08\u66FF\u6362\u6307\u5B9A\u6587\u672C\uFF09
- list_files: \u5217\u51FA\u76EE\u5F55\u5185\u5BB9
- search_files: \u641C\u7D22\u6587\u4EF6\u5185\u5BB9\uFF08\u6B63\u5219\uFF09
- glob: \u6309\u6A21\u5F0F\u641C\u7D22\u6587\u4EF6\uFF08\u5982 **/*.ts\uFF09
- grep: \u5728\u6587\u4EF6\u4E2D\u641C\u7D22\u5185\u5BB9\uFF08\u6B63\u5219\u3001\u652F\u6301\u4E0A\u4E0B\u6587\u884C\uFF09
- ls: \u6811\u5F62\u5217\u51FA\u76EE\u5F55\u7ED3\u6784
- run_command: \u6267\u884C shell \u547D\u4EE4
- save_memory: \u4FDD\u5B58\u8BB0\u5FC6\uFF08\u7528\u6237\u504F\u597D\u3001\u9879\u76EE\u77E5\u8BC6\u3001\u91CD\u8981\u51B3\u7B56\uFF09\uFF0C\u4F1A\u81EA\u52A8\u68C0\u67E5\u5199\u5165\u95E8\u69DB\u548C\u53BB\u91CD
- read_memory: \u8BFB\u53D6/\u641C\u7D22\u8BB0\u5FC6\uFF08\u652F\u6301\u8BED\u4E49\u53EC\u56DE\uFF0C\u8FD4\u56DE\u7F6E\u4FE1\u5EA6\u548C\u7A33\u5B9A\u6027\u6807\u8BB0\uFF09
- delete_memory: \u5220\u9664\u8BB0\u5FC6
- compress_memory: \u538B\u7F29\u8BB0\u5FC6\uFF08\u5408\u5E76\u76F8\u4F3C\u6761\u76EE\u3001\u6DD8\u6C70\u8FC7\u671F\u8BB0\u5FC6\uFF09
\u91CD\u8981\uFF1A\u5148\u7528 glob/grep/ls \u63A2\u7D22\u9879\u76EE\u7ED3\u6784\uFF0C\u518D\u8FDB\u884C\u5F00\u53D1\u3002
\u5F53\u4E86\u89E3\u5230\u7528\u6237\u504F\u597D\u3001\u9879\u76EE\u67B6\u6784\u3001\u91CD\u8981\u51B3\u7B56\u65F6\uFF0C\u4E3B\u52A8\u7528 save_memory \u4FDD\u5B58\u3002
\u8BB0\u5FC6\u6709\u7F6E\u4FE1\u5EA6\u6807\u8BB0\uFF1A\u7A33\u5B9A\u8BB0\u5FC6\u53EF\u76F4\u63A5\u4F7F\u7528\uFF0C\u5F85\u9A8C\u8BC1\u8BB0\u5FC6\u9700\u8981\u66F4\u591A\u786E\u8BA4\u3002
${memoryContext ? "\n" + memoryContext : ""}
\u8BF7\u7528\u4E2D\u6587\u56DE\u590D\u3002`
  );
  const defaultPk2 = configManager.getDefaultProvider();
  const displayModel = configManager.getProvider(defaultPk2)?.selected || currentModel.name;
  console.log(renderBanner(VERSION, `${defaultPk2}/${displayModel}`, config.project.root));
  const stripAnsi = (s) => s.replace(/\x1B\[[0-9;]*m/g, "");
  function printInputBar() {
    const w = process.stdout.columns || 80;
    const pk = configManager.getDefaultProvider();
    const modelName = `${pk}/${aiClient.getModel() || configManager.get().defaults.model}`;
    const pct = contextManager.getContextPercent();
    const output = inputLayoutManager.render({
      statusData: {
        model: modelName,
        contextPercent: pct
      },
      prompt: chalk6.cyan("\u276F "),
      showShortcuts: true,
      shortcuts: [
        { key: "Ctrl+C", desc: "\u4E2D\u65AD" },
        { key: "Ctrl+D", desc: "\u9000\u51FA" },
        { key: "/help", desc: "\u5E2E\u52A9" }
      ],
      width: w
    });
    console.log(output);
  }
  const rl = readline2.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk6.cyan("\u276F ")
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
      try {
        process.stdout.write(renderAssistantStart());
        let fullText = "";
        for await (const event of orchestrator.executeStream(input)) {
          if (event.type === "text") {
            process.stdout.write(event.content);
            fullText += event.content;
          } else if (event.type === "tool-call") {
            try {
              const call = JSON.parse(event.content);
              const argsPreview = Object.entries(call.args || {}).map(([k, v]) => `${k}=${chalk6.dim(truncate(String(v), 40))}`).join(", ");
              console.log(chalk6.yellow(`
\u26A1 ${call.name}`) + (argsPreview ? chalk6.dim(` \u2192 ${argsPreview})`) : ""));
            } catch {
              console.log(chalk6.yellow(`
\u26A1 ${event.content}`));
            }
          } else if (event.type === "tool-result") {
          }
        }
        if (fullText) console.log("");
      } catch (execError) {
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
    console.error(chalk6.red("\nstdin \u5DF2\u5173\u95ED"));
  });
  rl.on("close", () => {
    if (sigintState >= 1) {
      process.stdout.write(chalk6.dim("\n\u518D\u89C1\uFF01\n"));
    } else {
      process.stdout.write(chalk6.dim("\n(readline \u5DF2\u5173\u95ED)\n"));
    }
    process.exit(0);
  });
  rl.on("error", (err) => {
    console.error(chalk6.red(`
readline \u9519\u8BEF: ${err.message}`));
  });
  rl.on("SIGINT", () => {
    if (sigintState >= 1) {
      rl.close();
    } else {
      sigintState = 1;
      console.log(chalk6.dim("\n(\u518D\u6309\u4E00\u6B21 Ctrl+C \u9000\u51FA\uFF0C\u6216\u8F93\u5165 /exit)"));
      printInputBar();
      rl.prompt();
    }
  });
}

// src/main.ts
startREPL().catch(console.error);
//# sourceMappingURL=main.js.map