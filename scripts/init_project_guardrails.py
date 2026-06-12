#!/usr/bin/env python3
"""Create a Forge CLI project-guardrails file from project snapshot evidence.

Supports profile detection (--profile auto), interactive wizard (--interactive),
and generates a full guardrails file with evidence and confidence scores.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
from pathlib import Path


def compute_pubspec_hash(project_root: Path) -> str:
    pubspec = project_root / "pubspec.yaml"
    if not pubspec.exists():
        return "-"
    return hashlib.sha256(pubspec.read_bytes()).hexdigest()[:16]


def compute_lib_top_dirs_snapshot(project_root: Path) -> list[str]:
    lib = project_root / "lib"
    if not lib.is_dir():
        return []
    return sorted(d.name for d in lib.iterdir() if d.is_dir() and not d.name.startswith("."))


PROFILE_NAMES = {
    "auto",
    "riverpod_feature_profile",
    "bloc_module_profile",
    "go_router_dio_freezed_profile",
    "getx_mvp_profile",
    "lean_mvp_profile",
}


def load_snapshot(root: Path):
    path = root / "scripts" / "project_snapshot.py"
    spec = importlib.util.spec_from_file_location("project_snapshot", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load snapshot script: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def signal_exists(signals: dict[str, object], category: str, tool: str) -> bool:
    return tool in signals.get(category, {})


def choose_profile(signals: dict[str, object], requested: str) -> tuple[str, str]:
    if requested != "auto":
        return requested, "explicit"

    if signal_exists(signals, "state_management", "bloc"):
        return "bloc_module_profile", "detected bloc/cubit signals"
    if signal_exists(signals, "state_management", "riverpod"):
        return "riverpod_feature_profile", "detected riverpod signals"
    if signal_exists(signals, "state_management", "getx"):
        return "getx_mvp_profile", "detected getx signals"
    if (
        signal_exists(signals, "routing", "go_router")
        and signal_exists(signals, "networking", "dio")
        and (
            signal_exists(signals, "serialization", "freezed")
            or signal_exists(signals, "serialization", "json_serializable")
        )
    ):
        return "go_router_dio_freezed_profile", "detected go_router + dio + serialization signals"
    return "lean_mvp_profile", "no dominant stack detected"


def profile_defaults(profile_name: str) -> dict[str, str]:
    defaults = {
        "riverpod_feature_profile": {
            "directory_structure": "lib/features/<feature>/{pages,widgets,state,models}",
            "module_boundaries": "Keep feature-local UI and state inside each feature; shared only for cross-feature reuse.",
            "component_boundaries": "Extract shared widgets only after 2+ real usages or consistency requirements.",
            "page_split_style": "feature-first",
        },
        "bloc_module_profile": {
            "directory_structure": "lib/modules/<module>/{views,bloc,models,repository}",
            "module_boundaries": "Keep Bloc/Cubit, repository and views aligned by business module.",
            "component_boundaries": "Prefer module-private widgets unless reuse is already proven.",
            "page_split_style": "module-first",
        },
        "go_router_dio_freezed_profile": {
            "directory_structure": "feature-first with shared core routing/network/model layers",
            "module_boundaries": "Feature owns UI/state; core owns routing, network client and cross-feature primitives.",
            "component_boundaries": "Shared components require real reuse or consistency constraints.",
            "page_split_style": "feature-first",
        },
        "getx_mvp_profile": {
            "directory_structure": "feature/page folders with view/controller/binding grouped together",
            "module_boundaries": "Keep GetxController lifecycle scoped to the owning page or feature.",
            "component_boundaries": "Avoid global widgets until reuse is real.",
            "page_split_style": "page-first",
        },
        "lean_mvp_profile": {
            "directory_structure": "lib/pages, lib/widgets, lib/models, lib/services until complexity requires feature-first",
            "module_boundaries": "Keep boundaries simple; migrate to feature-first when reuse or state sharing grows.",
            "component_boundaries": "Prefer local widgets first.",
            "page_split_style": "simple-layered",
        },
    }
    return defaults[profile_name]


def best_signal(signals: dict[str, object], category: str) -> tuple[str, dict[str, object]] | None:
    tools = signals.get(category, {})
    if not tools:
        return None
    ranked = sorted(
        tools.items(),
        key=lambda item: ({"high": 3, "medium": 2, "low": 1}.get(item[1]["confidence"], 0), len(item[1]["evidence"])),
        reverse=True,
    )
    return ranked[0]


def evidence_lines(info: dict[str, object], indent: str = "      ") -> str:
    evidence = info.get("evidence", [])[:5]
    if not evidence:
        return f"{indent}evidence: []"
    lines = [f"{indent}evidence:"]
    for item in evidence:
        lines.append(f'{indent}  - "{item["source"]}: {item["value"]}"')
    return "\n".join(lines)


def render_guardrails(project_root: Path, data: dict[str, object], profile_name: str, profile_reason: str, pubspec_hash: str = "-", lib_dirs_snapshot: list[str] | None = None) -> str:
    signals = data["stack_signals"]
    state = best_signal(signals, "state_management")
    routing = best_signal(signals, "routing")
    network = best_signal(signals, "networking")
    serialization = best_signal(signals, "serialization")
    di = best_signal(signals, "dependency_injection")
    localization = best_signal(signals, "localization")

    state_name, state_info = state if state else ("", {"confidence": "low", "evidence": []})
    routing_name, routing_info = routing if routing else ("", {"confidence": "low", "evidence": []})
    network_name, network_info = network if network else ("", {"confidence": "low", "evidence": []})
    serialization_name, _ = serialization if serialization else ("", {"confidence": "low", "evidence": []})
    di_name, di_info = di if di else ("", {"confidence": "low", "evidence": []})
    localization_name, loc_info = localization if localization else ("", {"confidence": "low", "evidence": []})
    defaults = profile_defaults(profile_name)

    project_name = project_root.name.replace("-", "_")
    return f"""project_guardrails:
  project:
    name: "{project_name}"
    type: "project"
    status: "existing"
    root_type: "existing"
    overall_confidence: "medium"
    source_rules:
      - "project_snapshot"
      - "project_stack_scan"
      - "{profile_name}"

  team_rules:
    directory_structure:
      rule: "{defaults['directory_structure']}"
      confidence: "low"
      evidence: []

    module_boundaries:
      rule: "{defaults['module_boundaries']}"
      confidence: "low"
      evidence: []

    naming_conventions:
      pages: "*_page.dart / XxxPage"
      widgets: "*_widget.dart / XxxWidget"
      states: "follow detected state-management files"
      models: "*_model.dart / XxxModel"
      helpers: "*_utils.dart or project-local helper naming"
      confidence: "low"
      evidence: []

    state_management:
      primary_pattern: "{state_name}"
      scope_rules: "Follow project-mainstream {state_name or 'state management'} pattern"
      confidence: "{state_info['confidence']}"
{evidence_lines(state_info)}

    component_boundaries:
      shared_component_rule: "{defaults['component_boundaries']}"
      page_private_component_rule: "Keep widgets private to page/feature until reuse is proven"
      confidence: "low"
      evidence: []

    api_integration:
      request_layer_rule: "{network_name}"
      model_mapping_rule: "{serialization_name}"
      error_handling_rule: ""
      confidence: "{network_info['confidence']}"
{evidence_lines(network_info)}

    routing_and_navigation:
      route_definition_rule: "{routing_name}"
      route_naming_rule: ""
      navigation_trigger_rule: ""
      confidence: "{routing_info['confidence']}"
{evidence_lines(routing_info)}

    localization:
      localization_strategy: "{localization_name}"
      string_management_rule: ""
      confidence: "{loc_info['confidence']}"
{evidence_lines(loc_info)}

    dependency_injection:
      di_strategy: "{di_name}"
      injection_boundary_rule: ""
      confidence: "{di_info['confidence']}"
{evidence_lines(di_info)}

  personal_preferences:
    page_split_style:
      rule: "{defaults['page_split_style']}"
      confidence: "low"

    private_widget_naming:
      rule: "Use business semantic names, avoid generic ContentWidget names"
      confidence: "low"

  quick_context:
    snapshot_generated_by: "scripts/init_project_guardrails.py"
    recommended_profile: "{profile_name}"
    profile_reason: "{profile_reason}"
    lib_top_dirs: {data['lib_top_dirs']}
    routing_entries: {data['routing_entries']}
    state_entries: {data['state_entries']}
    network_entries: {data['network_entries']}
    test_entries: {data['test_entries']}
    pubspec_hash: "{pubspec_hash}"
    lib_top_dirs_snapshot: {lib_dirs_snapshot if lib_dirs_snapshot is not None else data['lib_top_dirs']}
    confirmation_checklist:
      - "Confirm directory_structure.rule"
      - "Confirm state_management.primary_pattern"
      - "Confirm routing_and_navigation.route_definition_rule"
      - "Confirm api_integration.request_layer_rule"
      - "Confirm component_boundaries.shared_component_rule"

  inferred_rules:
    active_rules: []
    low_confidence_rules: []
    conflicts_to_watch: []

  reuse_knowledge:
    similar_pages: []
    reusable_patterns: []
    avoid_reuse_targets: []

  task_only_context:
    temporary_business_rules: []
    field_special_cases: []
    api_compat_notes: []

  quality_preferences:
    analyze_required: true
    widget_test_expectation: "when behavior changes"
    integration_test_expectation: "for critical flows"
    preview_expectation: "for reusable UI components"
"""


def print_wizard_summary(project_root: Path, data: dict[str, object], profile_name: str, profile_reason: str, output: Path) -> None:
    print("Forge CLI project-guardrails initialization")
    print(f"project: {project_root}")
    print(f"profile: {profile_name} ({profile_reason})")
    print(f"output: {output}")
    print(f"lib_top_dirs: {', '.join(data['lib_top_dirs']) if data['lib_top_dirs'] else 'none'}")
    print(f"routing_entries: {', '.join(data['routing_entries']) if data['routing_entries'] else 'none'}")
    print(f"state_entries: {', '.join(data['state_entries']) if data['state_entries'] else 'none'}")
    print("confirmation checklist:")
    print("  - directory structure")
    print("  - state management")
    print("  - routing entry")
    print("  - network layer")
    print("  - shared component rule")


def main() -> int:
    repo = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project_root", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument(
        "--profile",
        choices=sorted(PROFILE_NAMES),
        default="auto",
        help="Profile to apply. Defaults to auto-detection.",
    )
    parser.add_argument("--interactive", action="store_true", help="Print wizard summary and confirmation checklist.")
    args = parser.parse_args()

    project_root = args.project_root.resolve()
    snapshot_module = load_snapshot(repo)
    data = snapshot_module.snapshot(project_root)
    if not data["is_project"]:
        print(f"FAIL not a project: {project_root}")
        return 1

    profile_name, profile_reason = choose_profile(data["stack_signals"], args.profile)
    pubspec_hash = compute_pubspec_hash(project_root)
    lib_dirs_snapshot = compute_lib_top_dirs_snapshot(project_root)

    output = args.output or project_root / ".forge-cli" / "projects" / f"{project_root.name}.project_guardrails.yaml"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(render_guardrails(project_root, data, profile_name, profile_reason, pubspec_hash, lib_dirs_snapshot), encoding="utf-8")
    if args.interactive:
        print_wizard_summary(project_root, data, profile_name, profile_reason, output)
    print(f"PASS project-guardrails written: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
