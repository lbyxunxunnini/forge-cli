#!/bin/bash
# 将 flutter-forge 资源从 forge-cli 项目复制到全局工作流目录
# 用法: bash scripts/setup-workflow-flutter-forge.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
WORKFLOW_DIR="$HOME/.forge-cli/workflows/flutter-forge"

echo "=== 安装 flutter-forge 工作流 ==="
echo "源目录: $PROJECT_DIR"
echo "目标目录: $WORKFLOW_DIR"
echo ""

# 创建目录
mkdir -p "$WORKFLOW_DIR"/{references/roles,scripts,profiles}

# 复制角色定义
echo "复制角色定义..."
cp -v "$PROJECT_DIR"/references/roles/*.md "$WORKFLOW_DIR/references/roles/" 2>/dev/null || echo "  (无角色文件)"

# 复制参考文档（不覆盖 manifest.yaml）
echo "复制参考文档..."
if [ -d "$PROJECT_DIR/references" ]; then
  rsync -av --exclude='roles/' --exclude='archive/' --exclude='roadmaps/' \
    "$PROJECT_DIR/references/" "$WORKFLOW_DIR/references/" 2>/dev/null || true
fi

# 复制脚本
echo "复制脚本..."
cp -v "$PROJECT_DIR"/scripts/*.sh "$WORKFLOW_DIR/scripts/" 2>/dev/null || echo "  (无 .sh 文件)"
cp -v "$PROJECT_DIR"/scripts/*.py "$WORKFLOW_DIR/scripts/" 2>/dev/null || echo "  (无 .py 文件)"

# 复制 profiles
echo "复制 profiles..."
if [ -d "$PROJECT_DIR/memory/profiles" ]; then
  cp -v "$PROJECT_DIR"/memory/profiles/*.yaml "$WORKFLOW_DIR/profiles/" 2>/dev/null || echo "  (无 profile 文件)"
fi

echo ""
echo "=== 安装完成 ==="
echo ""
echo "目录结构:"
find "$WORKFLOW_DIR" -type f | head -30 | sed "s|$WORKFLOW_DIR|  .|"
echo ""
echo "工作流已注册到 ~/.forge-cli/workflows/flutter-forge/"
echo "使用方式: 在 forge-cli 中输入 ff-xxx 触发"
