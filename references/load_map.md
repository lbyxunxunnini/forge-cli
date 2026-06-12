# Forge CLI Reference - Load Map

这个文件定义主 skill 之外的按需加载映射。主 `SKILL.md` 不再重复列出大量"遇到什么就读什么"的声明。

归档文件（案例、模板、调试手册等低频参考）已移入 [archive/](archive/) 目录，需要时可直接读取。

## 场景 -> 参考文件

### 迭代中项目首次接入

- [project_init_flow.md](project_init_flow.md)
- [existing_project_entry.md](existing_project_entry.md)
- [existing_project_scan.md](existing_project_scan.md)
- [project_stack_detection.md](project_stack_detection.md)
- [stack_profiles.md](stack_profiles.md)
- [project_guardrails_template.yaml](project_guardrails_template.yaml)
- [example_project_guardrails.yaml](example_project_guardrails.yaml)
- [existing_rules_discovery.md](existing_rules_discovery.md)

### 新应用从 0 到 1

- [new_project_cocreation_mode.md](new_project_cocreation_mode.md)
- [stack_profiles.md](stack_profiles.md)
- [project_init_flow.md](project_init_flow.md)
- [project_guardrails_template.yaml](project_guardrails_template.yaml)

### 进入具体任务执行

- [fast_mode.md](fast_mode.md)
- [autonomous_mode.md](autonomous_mode.md)
- [decision_and_question_protocol.md](decision_and_question_protocol.md)
- [task_runtime_prompt.md](task_runtime_prompt.md)

### 需要记忆读写规则

- [memory_protocol.md](memory_protocol.md)
- [core_contracts.yaml](core_contracts.yaml)

### 需要工程判断标准或 项目专项规则

- [engineering_heuristics.md](engineering_heuristics.md)
- [project_stack_detection.md](project_stack_detection.md)
- [stack_profiles.md](stack_profiles.md)

### 需要 项目 skills 委托规则

- [official_project_skills.md](official_project_skills.md)
- [delegation_map.yaml](delegation_map.yaml)

### 需要判断宿主对子代理的支持与降级路径

- [host_subagent_support.md](host_subagent_support.md)
- [agent_isolation_protocol.md](agent_isolation_protocol.md)

### 需要网络层项目规则

- [network_and_api.md](network_and_api.md)

### 需要路由层项目规则

- [routing_and_navigation.md](routing_and_navigation.md)

### 需要测试与质量建议

- [roles/verify_agent.md](roles/verify_agent.md)

### 需要决策、提问或阶段门禁细则

- [decision_and_question_protocol.md](decision_and_question_protocol.md)
- [fast_mode.md](fast_mode.md)
- [autonomous_mode.md](autonomous_mode.md)
- [phase_checkpoint.md](phase_checkpoint.md)

### 需要可见性标记或当前大任务状态规则

- [skill_visibility.md](skill_visibility.md)
- [session_management.md](session_management.md)

### 需要启动握手输出格式

- [startup_handshake.md](startup_handshake.md)

### 需要 Project Guardrails 协议

- [project_guardrails_protocol.md](project_guardrails_protocol.md)

### 需要项目初始化流程

- [project_init_flow.md](project_init_flow.md)

### 需要触发词权威列表

- [trigger_words.md](trigger_words.md)

### 需要主工作流可视化

- [workflow_diagram.md](workflow_diagram.md)

### 需要维护者修改导航

- [maintenance_map.md](maintenance_map.md)

## 反向索引：每个参考文件被哪些上层文件引用

维护时用此表检查引用完整性。新增 reference 文件时同步更新此表。

| 参考文件 | 被引用方 |
|---------|---------|
| task_runtime_prompt.md | SKILL.md（执行协议）、load_map.md |
| phase_checkpoint.md | task_runtime_prompt.md（阶段转换自检）、load_map.md |
| fast_mode.md | SKILL.md（ff-fast）、load_map.md |
| autonomous_mode.md | SKILL.md（ff-a）、load_map.md |
| decision_and_question_protocol.md | task_runtime_prompt.md、skill_visibility.md、load_map.md |
| skill_visibility.md | SKILL.md（输出日志）、load_map.md |
| session_management.md | SKILL.md（上下文恢复）、load_map.md |
| startup_handshake.md | SKILL.md（启动判定）、load_map.md |
| project_guardrails_protocol.md | SKILL.md（guardrails 检查）、load_map.md |
| project_init_flow.md | SKILL.md（项目初始化）、load_map.md |
| memory_protocol.md | SKILL.md（记忆机制）、load_map.md |
| core_contracts.yaml | maintenance_map.md、load_map.md |
| engineering_heuristics.md | load_map.md |
| project_stack_detection.md | load_map.md |
| stack_profiles.md | load_map.md |
| official_project_skills.md | SKILL.md（项目 skills）、load_map.md |
| delegation_map.yaml | load_map.md |
| host_subagent_support.md | SKILL.md（并行协议）、load_map.md |
| agent_isolation_protocol.md | SKILL.md（角色隔离执行）、load_map.md |
| network_and_api.md | load_map.md |
| routing_and_navigation.md | load_map.md |
| roles/verify_agent.md | load_map.md |
| trigger_words.md | SKILL.md（命中路由）、README.md、QUICKSTART.md、CHEATSHEET.md、load_map.md |
| workflow_diagram.md | SKILL.md（按需加载）、load_map.md |
| maintenance_map.md | load_map.md |
