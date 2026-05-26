# Flutter Forge Maintenance Map

这份文档只服务维护者。它回答一件事：**想改某类规则时，最少需要同步哪些文件。**

不要把它写成协议文档。它是维护导航图，不是行为规范。

## 1. 改阶段门禁

必看：

- [SKILL.md](../SKILL.md)
- [decision_and_question_protocol.md](decision_and_question_protocol.md)
- [task_runtime_prompt.md](task_runtime_prompt.md)

必改：

- [SKILL.md](../SKILL.md)
- [scripts/gate_check.py](../scripts/gate_check.py)
- [scripts/validate_release.sh](../scripts/validate_release.sh) 或对应 `scripts/release_checks/*.sh`

如果门禁依赖 session 状态，还要改：

- [session_management.md](session_management.md)
- [scripts/ff_session.sh](../scripts/ff_session.sh)
- [scripts/controller.py](../scripts/controller.py)

## 2. 改 session 字段

必改：

- [session_management.md](session_management.md)
- [scripts/ff_session.sh](../scripts/ff_session.sh)

通常还要改：

- [scripts/gate_check.py](../scripts/gate_check.py)
- [scripts/controller.py](../scripts/controller.py)
- [scripts/release_checks/session.sh](../scripts/release_checks/session.sh)
- [scripts/release_checks/gates.sh](../scripts/release_checks/gates.sh)

## 3. 改角色边界

必改：

- [roles/requirement_analyst.md](roles/requirement_analyst.md)
- [roles/ui_designer.md](roles/ui_designer.md)
- [roles/architecture_designer.md](roles/architecture_designer.md)
- [roles/page_engineer.md](roles/page_engineer.md)
- [roles/verify_agent.md](roles/verify_agent.md)

如果角色边界涉及文件写入权限，还要改：

- [scripts/gate_check.py](../scripts/gate_check.py)
- [agent_isolation_protocol.md](agent_isolation_protocol.md)

## 4. 改 `ff-fast` / `ff-a` 豁免边界

必改：

- [SKILL.md](../SKILL.md)
- [fast_mode.md](fast_mode.md)
- [autonomous_mode.md](autonomous_mode.md)
- [decision_and_question_protocol.md](decision_and_question_protocol.md)

通常还要改：

- [scripts/gate_check.py](../scripts/gate_check.py)
- [scripts/release_checks/gates.sh](../scripts/release_checks/gates.sh)
- [scripts/release_checks/output_protocol.sh](../scripts/release_checks/output_protocol.sh)

## 5. 改 output protocol / 日志协议

必改：

- [skill_visibility.md](skill_visibility.md)
- [task_runtime_prompt.md](task_runtime_prompt.md)
- [scripts/validate_output.sh](../scripts/validate_output.sh)

通常还要改：

- [scripts/release_checks/output_protocol.sh](../scripts/release_checks/output_protocol.sh)
- [README.md](../README.md)

## 6. 改 project guardrails 协议

必改：

- [project_guardrails_protocol.md](project_guardrails_protocol.md)
- [scripts/check_project_guardrails.sh](../scripts/check_project_guardrails.sh)
- [scripts/init_project_guardrails.py](../scripts/init_project_guardrails.py)

通常还要改：

- [scripts/hook_check_project_guardrails.sh](../scripts/hook_check_project_guardrails.sh)
- [scripts/release_checks/guardrails.sh](../scripts/release_checks/guardrails.sh)

## 7. 改发布校验

入口：

- [scripts/validate_release.sh](../scripts/validate_release.sh)

按领域改对应模块：

- 元数据与版本：`scripts/release_checks/metadata.sh`
- guardrails 与路由：`scripts/release_checks/guardrails.sh`
- session：`scripts/release_checks/session.sh`
- gate 与 controller：`scripts/release_checks/gates.sh`
- 日志与输出协议：`scripts/release_checks/output_protocol.sh`

原则：

- 不要再把新的大段逻辑直接塞回 `validate_release.sh`
- 优先在对应模块文件里新增/修改断言

## 8. 改入口文档

用户入口：

- [README.md](../README.md)
- [QUICKSTART.md](../QUICKSTART.md)
- [CHEATSHEET.md](../CHEATSHEET.md)

维护入口：

- [load_map.md](load_map.md)
- [maintenance_map.md](maintenance_map.md)

## 9. 先查哪里，再动哪里

推荐顺序：

1. 先看 [core_contracts.yaml](core_contracts.yaml) 确认当前主数据项
2. 再看这份 `maintenance_map.md` 找出受影响文件
3. 最后跑 `bash scripts/validate_release.sh`
