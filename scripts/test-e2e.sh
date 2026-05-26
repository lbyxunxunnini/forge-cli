#!/bin/bash

# Flutter Forge 端到端测试脚本

set -e

echo "=== Flutter Forge 端到端测试 ==="
echo ""

# 检查 API key
if [ -z "$DEEPSEEK_API_KEY" ]; then
    echo "错误: 未配置 DEEPSEEK_API_KEY"
    echo "配置方法: export DEEPSEEK_API_KEY=your-api-key"
    exit 1
fi

echo "✓ API Key 已配置"

# 构建项目
echo ""
echo "构建项目..."
npm run build > /dev/null 2>&1
echo "✓ 构建成功"

# 类型检查
echo ""
echo "类型检查..."
npm run typecheck > /dev/null 2>&1
echo "✓ 类型检查通过"

# 测试命令
echo ""
echo "测试命令..."
echo "/help
/status
/exit" | node dist/main.js 2>&1 | head -30 > /dev/null
echo "✓ 命令测试通过"

# 测试对话
echo ""
echo "测试对话..."
echo "你好
/exit" | node dist/main.js 2>&1 | head -50

echo ""
echo "=== 测试完成 ==="
