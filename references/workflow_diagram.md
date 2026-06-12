# Forge CLI Reference - 主工作流可视化

本文档包含 forge-cli 主工作流的 digraph 流程图，帮助 agent 快速定位自己在流程中的位置。

## 主工作流

```dot
digraph forge_cli_workflow {
    rankdir=TB;
    node [shape=box];

    start [label="用户输入" shape=doublecircle];
    trigger [label="触发词匹配?" shape=diamond];
    exit_early [label="不触发，退出" shape=doublecircle];

    session_check [label="Session 恢复检查\n[Rigid]"];
    session_match [label="恢复 session\n回到记录的阶段" shape=diamond];
    enter [label="[f-forge] 进入 controller"];

    classify [label="任务分类\nscripts/classify_task.sh\n[Flexible]"];
    guardrails_check [label="guardrails 检查\n按任务类型分级\n[Rigid]"];

    wait [label="等待态\n追问用户目标"];
    passthrough [label="直通模式\n主控直做，完成退出"];
    lightweight [label="轻量任务\n读→改→验证"];
    medium [label="中等任务\n扫描→改动契约→确认/执行"];
    ui_opt [label="UI 优化\n范围确认→UI判断→实现"];
    arch [label="架构级任务\n架构判断→实现→验证"];
    feature [label="功能开发\nS1→S2→S4→S5"];
    page [label="页面开发\nS1→S2→S4→S5"];
    cocreate [label="新项目共创\nC0→C1→C2→C3→S3"];

    s1 [label="S1 需求确认\n[Rigid]" shape=box];
    s2 [label="S2 方案确认\n[Rigid]" shape=box];
    s2_s4 [label="S2→S4 硬阻断\n必须继续，不允许退出\n[Rigid]" shape=diamond];
    s4 [label="S4 实现中" shape=box];
    s5 [label="S5 验证中" shape=box];
    s6 [label="S6 完成\n输出完成日志，退出\n[Rigid]" shape=doublecircle];

    upgrade [label="发现风险？\n升级到对应模式\n[Flexible]" shape=diamond];
    downgrade [label="复杂度低于预期？\n降级回中等\n[Flexible]" shape=diamond];

    // 主流程
    start -> trigger;
    trigger -> exit_early [label="不匹配"];
    trigger -> session_check [label="匹配"];

    session_check -> session_match;
    session_match -> s4 [label="恢复成功\n回到记录阶段"];
    session_match -> enter [label="不恢复"];

    enter -> classify;
    classify -> guardrails_check;

    guardrails_check -> wait [label="任务不明确"];
    guardrails_check -> passthrough [label="直通"];
    guardrails_check -> lightweight [label="轻量"];
    guardrails_check -> medium [label="中等"];
    guardrails_check -> ui_opt [label="UI 优化"];
    guardrails_check -> arch [label="架构级"];
    guardrails_check -> feature [label="功能开发"];
    guardrails_check -> page [label="页面开发"];
    guardrails_check -> cocreate [label="新项目共创"];

    // 轻量路径
    lightweight -> upgrade [label="发现边界风险"];
    upgrade -> medium [label="是"];
    upgrade -> s6 [label="否，直接完成"];

    // 中等路径
    medium -> upgrade;
    medium -> s6 [label="未升级，完成"];

    // 重流程路径
    feature -> s1;
    page -> s1;
    ui_opt -> s2;
    arch -> s2;
    cocreate -> s1;

    s1 -> s2;
    s2 -> s2_s4;
    s2_s4 -> s4 [label="已确认\n或 ff-a 自动放行"];
    s4 -> s5;
    s5 -> s6;

    // 升级/降级
    upgrade -> feature [label="需求缺口"];
    upgrade -> page [label="UI 结构决策"];
    upgrade -> arch [label="架构边界风险"];
    downgrade -> medium [label="复杂度低于预期"];
}
```

## 阶段门禁流程

```dot
digraph phase_gates {
    rankdir=TB;
    node [shape=box];

    s1_done [label="S1 完成\n需求已冻结？" shape=diamond];
    s1_block [label="回到 S1\n补全需求" shape=box];

    s2_done [label="S2 完成\n方案已稳定？" shape=diamond];
    s2_block [label="回到 S2\n补全方案" shape=box];

    contract [label="写前改动契约\n已确认？\n[Rigid]" shape=diamond];
    contract_wait [label="写入等待态\n等待用户确认" shape=box];

    s4_impl [label="S4 实现"];
    s4_verify [label="S5 验证"];
    s4_pass [label="验证通过？" shape=diamond];
    s4_fail [label="回到 S4\n修复问题" shape=box];

    done [label="S6 完成\n输出完成日志" shape=doublecircle];

    s1_done -> s2 [label="是"];
    s1_done -> s1_block [label="否"];
    s1_block -> s1_done;

    s2_done -> contract [label="是"];
    s2_done -> s2_block [label="否"];
    s2_block -> s2_done;

    contract -> s4_impl [label="用户已确认\n或 ff-a 自动放行"];
    contract -> contract_wait [label="未确认\n且非豁免模式"];
    contract_wait -> contract [label="用户补充确认"];

    s4_impl -> s4_verify;
    s4_verify -> s4_pass;
    s4_pass -> done [label="是"];
    s4_pass -> s4_fail [label="否"];
    s4_fail -> s4_pass;
}
```

## 策略选择流程

```dot
digraph strategy_selection {
    rankdir=TB;
    node [shape=box];

    input [label="用户输入" shape=doublecircle];
    check_fast [label="ff-fast 开头？" shape=diamond];
    check_auto [label="ff-a / ff a 开头？" shape=diamond];
    check_explicit [label="明确说'全自动'？" shape=diamond];
    check_fast_explicit [label="明确说'快速处理'？" shape=diamond];

    standard [label="标准策略 ff-\n完整门禁"];
    fast [label="快速策略 ff-fast\n轻量优先\n发现风险再升级\n[Flexible]"];
    auto [label="全自动策略 ff-a\n缺口自动补\n高风险才中断\n[Flexible]"];

    input -> check_fast;
    check_fast -> fast [label="是"];
    check_fast -> check_auto [label="否"];
    check_auto -> auto [label="是"];
    check_auto -> check_explicit [label="否"];
    check_explicit -> auto [label="是"];
    check_explicit -> check_fast_explicit [label="否"];
    check_fast_explicit -> fast [label="是"];
    check_fast_explicit -> standard [label="否"];
}
```

## 使用说明

agent 在执行过程中可随时参考本文件判断：
1. 当前在流程图的哪个节点
2. 下一步应该走向哪个分支
3. 是否有 [Rigid] 标注（不可跳过）或 [Flexible] 标注（可适应上下文）
