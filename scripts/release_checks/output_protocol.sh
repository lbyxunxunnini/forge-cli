#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 页面工程师：轻量任务，直接执行' \
  '[f-forge] 页面工程师：已完成修改并完成基本验证' \
  | scripts/validate_output.sh --require-complete >/dev/null

printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 全自动：已启用 ff-a，非阻塞缺口将采用推荐方案推进；安全、不可逆或高风险架构决策才中断确认。' \
  '[f-forge] 模式：页面开发' \
  '[f-forge] 阶段：S1 需求确认' \
  '[f-forge] 需求分析师：商品详情页目标已冻结，首屏包含轮播图、价格区和底部购买栏。' \
  '[f-forge] 阶段：S2 方案确认' \
  '[f-forge] UI 设计师：未提供设计图，自动采用推荐方案：沿用项目现有卡片列表风格。' \
  '[f-forge] 阶段：S4 实现中' \
  '[f-forge] 页面工程师：按自动冻结方案实现' \
  '[f-forge] 阶段：S5 验证中' \
  '[f-forge] 验证工程师：已覆盖首屏结构、规格联动和底部购买按钮状态。' \
  '[f-forge] 全自动摘要：本轮自动采用 2 项推荐方案：详情页卡片风格；页面级状态接入沿用项目主流方案。' \
  '[f-forge] 本轮完成：已完成自动实现和验证' \
  | scripts/validate_output.sh --require-complete --require-s4 --expect-autonomous >/dev/null

if printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 页面工程师：中等任务，先扫描后执行' \
  '[f-forge] 页面工程师：已完成修改' \
  | scripts/validate_output.sh --require-complete >/dev/null 2>&1; then
  fail "validate_output accepted medium task without analysis role result"
fi

printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 页面工程师：中等任务，先扫描后执行' \
  '[f-forge] 页面工程师：扫描结论：已定位 third_party_handler.dart 与 share_action_utils.dart，重复点集中在分享链接生成和邀请弹窗入口。' \
  '[f-forge] 页面工程师：执行策略：复用 share_action_utils 的链接生成与统一入口，只改 2 个文件，保持原弹窗触发时机和分享参数不变。' \
  '[f-forge] 页面工程师：改动契约：允许改动 third_party_handler.dart、share_action_utils.dart；禁止改动授权、登录、路由和埋点；确认状态：用户已确认。' \
  '[f-forge] 页面工程师：已完成修改' \
  | scripts/validate_output.sh --require-complete >/dev/null

if printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 页面工程师：中等任务，先扫描后执行' \
  '[f-forge] 页面工程师：扫描结论：已定位 third_party_handler.dart 与 share_action_utils.dart，重复点集中在分享链接生成和邀请弹窗入口。' \
  '[f-forge] 页面工程师：执行策略：复用 share_action_utils 的链接生成与统一入口，只改 2 个文件，保持原弹窗触发时机和分享参数不变。' \
  '[f-forge] 页面工程师：已完成修改' \
  | scripts/validate_output.sh --require-complete >/dev/null 2>&1; then
  fail "validate_output accepted medium task without pre-write change contract"
fi

if printf '%s\n' \
  '[f-forge] 页面工程师：轻量任务，直接执行' \
  '[f-forge] 页面工程师：改动契约：允许改动首页购买按钮点击处理；禁止改动路由表、支付流程和登录状态；行为不变项：按钮样式和埋点保持一致；确认状态：用户已确认。' \
  '[f-forge] 页面工程师：已完成修改并完成基本验证' \
  | scripts/validate_output.sh --require-complete >/dev/null 2>&1; then
  fail "validate_output accepted missing entry log"
fi

if printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 模式：页面开发' \
  '[f-forge] 阶段：S1 需求确认' \
  | scripts/validate_output.sh --require-complete >/dev/null 2>&1; then
  fail "validate_output accepted missing completion log"
fi

if printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 模式：页面开发' \
  '[f-forge] 阶段：S1 需求分析' \
  | scripts/validate_output.sh >/dev/null 2>&1; then
  fail "validate_output accepted invalid full phase name"
fi

if printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 模式：页面开发' \
  '[f-forge] 阶段：S1 需求确认' \
  '需求分析师：需求已确认' \
  | scripts/validate_output.sh >/dev/null 2>&1; then
  fail "validate_output accepted bare role result without [f-forge] prefix"
fi

if printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 模式：页面开发' \
  '[f-forge] 阶段：S1 需求确认' \
  '分析结论：需求已确认' \
  | scripts/validate_output.sh >/dev/null 2>&1; then
  fail "validate_output accepted bare conclusion without role prefix"
fi

if printf '%s\n' \
  '模式：页面开发' \
  '阶段：S1 需求确认' \
  '需求分析师：需求已确认' \
  '本轮完成：任务已完成' \
  | scripts/validate_output.sh --require-complete >/dev/null 2>&1; then
  fail "validate_output accepted workflow output without any [f-forge] prefix"
fi

printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 模式：页面开发' \
  '[f-forge] 阶段：S2 方案确认' \
  '[f-forge] 页面工程师：方案已确认，继续进入实现' \
  | scripts/validate_output.sh >/dev/null

if printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 模式：页面开发' \
  '[f-forge] 阶段：S2 方案确认' \
  '[f-forge] 页面工程师：方案已确认，继续进入实现' \
  | scripts/validate_output.sh --require-s4 >/dev/null 2>&1; then
  fail "validate_output accepted S2 without S4 under --require-s4"
fi

if printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 模式：UI 优化' \
  '[f-forge] 阶段：S4 实现中' \
  '[f-forge] 页面工程师：直接实现' \
  | scripts/validate_output.sh --require-s4 >/dev/null 2>&1; then
  fail "validate_output accepted UI optimization S4 without S2 under --require-s4"
fi

if printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 模式：页面开发' \
  '[f-forge] 阶段：S2 方案确认' \
  '[f-forge] 阶段：S4 实现中' \
  '[f-forge] 页面工程师：直接实现' \
  | scripts/validate_output.sh --require-s4 >/dev/null 2>&1; then
  fail "validate_output accepted S2 to S4 without role result"
fi

if printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 模式：页面开发' \
  '[f-forge] 阶段：S2 方案确认' \
  '[f-forge] 页面工程师：改动契约：允许改动商品详情页相关文件；禁止改动支付、登录和全局主题；行为不变项：购买按钮行为保持一致；确认状态：等待用户确认。' \
  '[f-forge] 阶段：S4 实现中' \
  '[f-forge] 页面工程师：直接实现' \
  | scripts/validate_output.sh --require-s4 >/dev/null 2>&1; then
  fail "validate_output accepted S4 before user-confirmed change contract"
fi

if printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 模式：页面开发' \
  '[f-forge] 阶段：S2 方案确认' \
  '[f-forge] 架构设计师：方案已冻结，继续进入实现' \
  '[f-forge] 页面工程师：改动契约：允许改动商品详情页相关文件；禁止改动全局路由表以外的业务模块；确认状态：用户已确认。' \
  '[f-forge] 阶段：S4 实现中' \
  '[f-forge] 阶段：S5 验证中' \
  '[f-forge] 验证工程师：已完成验证' \
  '[f-forge] 本轮完成：已完成实现和验证' \
  | scripts/validate_output.sh --require-complete --require-s4 >/dev/null 2>&1; then
  fail "validate_output accepted page development chain without S1"
fi

if printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 模式：功能开发' \
  '[f-forge] 阶段：S1 需求确认' \
  '[f-forge] 需求分析师：需求已冻结' \
  '[f-forge] 阶段：S2 方案确认' \
  '[f-forge] 架构设计师：方案已冻结' \
  '[f-forge] 页面工程师：改动契约：允许改动登录流程相关文件；禁止改动支付与埋点；确认状态：用户已确认。' \
  '[f-forge] 阶段：S4 实现中' \
  '[f-forge] 本轮完成：已完成实现和验证' \
  | scripts/validate_output.sh --require-complete --require-s4 >/dev/null 2>&1; then
  fail "validate_output accepted heavy workflow without S5"
fi

if printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 模式：页面开发' \
  '[f-forge] 阶段：S1 需求确认' \
  '[f-forge] 阶段：S2 方案确认' \
  '[f-forge] 架构设计师：方案已冻结' \
  '[f-forge] 页面工程师：改动契约：允许改动商品详情页相关文件；禁止改动全局路由表以外的业务模块；确认状态：用户已确认。' \
  '[f-forge] 阶段：S4 实现中' \
  '[f-forge] 阶段：S5 验证中' \
  '[f-forge] 验证工程师：已完成验证' \
  '[f-forge] 本轮完成：已完成实现和验证' \
  | scripts/validate_output.sh --require-complete --require-s4 >/dev/null 2>&1; then
  fail "validate_output accepted page development without S1 role result"
fi

printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 模式：页面开发' \
  '[f-forge] 阶段：S1 需求确认' \
  '[f-forge] 需求分析师：需求已冻结，首屏包含轮播图、价格区和底部购买栏。' \
  '[f-forge] 阶段：S2 方案确认' \
  '[f-forge] 页面工程师：方案已确认，继续进入实现' \
  '[f-forge] 页面工程师：改动契约：允许改动商品详情页相关文件；禁止改动全局路由表以外的业务模块；确认状态：用户已确认。' \
  '[f-forge] 阶段：S4 实现中' \
  '[f-forge] 阶段：S5 验证中' \
  '[f-forge] 验证工程师：已完成详情页结构和底部购买栏验证。' \
  '[f-forge] 本轮完成：已完成实现和验证' \
  | scripts/validate_output.sh --require-s4 --require-complete >/dev/null

printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 模式：UI 优化' \
  '[f-forge] 阶段：S2 方案确认' \
  '[f-forge] UI 设计师：头像 40x40，第二个压住第一个 8px；禁用播放保留视觉但拦截交互。' \
  '[f-forge] 页面工程师：改动契约：允许改动头像叠放与播放禁用态相关 UI；禁止改动业务状态和播放服务；确认状态：用户已确认。' \
  '[f-forge] 阶段：S4 实现中' \
  '[f-forge] 页面工程师：按已确认 UI 方案实现' \
  '[f-forge] 阶段：S5 验证中' \
  '[f-forge] 验证工程师：已完成头像叠放和禁用态验证。' \
  '[f-forge] 本轮完成：已完成 UI 调整和验证' \
  | scripts/validate_output.sh --require-complete --require-s4 >/dev/null

if printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 页面工程师：中等任务，先扫描后执行' \
  '[f-forge] 页面工程师：扫描结论：已定位订单列表筛选逻辑。' \
  '[f-forge] 页面工程师：执行策略：只改订单筛选渲染和本地文案。' \
  '[f-forge] 页面工程师：改动契约：允许改动 order_page.dart；禁止改动路由、状态管理和接口协议；确认状态：用户已确认。' \
  '[f-forge] 页面工程师：已按 ff-fast 完成修改并完成最小验证。' \
  | scripts/validate_output.sh --require-complete --expect-fast >/dev/null 2>&1; then
  fail "validate_output accepted ff-fast task without startup log"
fi

if printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 全自动：已启用 ff-a，非阻塞缺口将采用推荐方案推进；安全、不可逆或高风险架构决策才中断确认。' \
  '[f-forge] 模式：页面开发' \
  '[f-forge] 阶段：S1 需求确认' \
  '[f-forge] 需求分析师：自动采用推荐方案 A。' \
  '[f-forge] 阶段：S2 方案确认' \
  '[f-forge] UI 设计师：自动采用推荐方案 B。' \
  '[f-forge] 阶段：S4 实现中' \
  '[f-forge] 阶段：S5 验证中' \
  '[f-forge] 验证工程师：已完成验证。' \
  '[f-forge] 本轮完成：已完成自动实现和验证' \
  | scripts/validate_output.sh --require-complete --require-s4 --expect-autonomous >/dev/null 2>&1; then
  fail "validate_output accepted autonomous task without autonomous summary"
fi

printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 模式：启动握手' \
  '[f-forge] 主控：project_guardrails 已初始化：.claude/.forge-cli/projects/app.project_guardrails.yaml' \
  '[f-forge] 本轮完成：已完成项目锚点初始化' \
  | scripts/validate_output.sh --require-complete >/dev/null

printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] 主控：任务描述不明确，请描述你想做什么（例如：新建页面、修改现有功能、修复 bug）。' \
  | scripts/validate_output.sh >/dev/null

if printf '%s\n' \
  '[f-forge] 进入 controller' \
  '[f-forge] project_guardrails 已初始化：.claude/.forge-cli/projects/app.project_guardrails.yaml' \
  '[f-forge] 本轮完成：已完成项目锚点初始化' \
  | scripts/validate_output.sh --require-complete >/dev/null 2>&1; then
  fail "validate_output accepted project_guardrails status without role or mode"
fi

python3 scripts/validate_docs_sync.py
info "documentation links, script references, and required references are synchronized"
