#!/usr/bin/env python3
"""Detect Flutter project stack signals for rule-card initialization."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


STACK_RULES = {
    "state_management": {
        "riverpod": {
            "dependencies": ("riverpod", "flutter_riverpod", "hooks_riverpod"),
            "content": ("ProviderScope", "WidgetRef", "ConsumerWidget", "StateNotifier", "NotifierProvider"),
            "files": ("provider.dart", "notifier.dart"),
        },
        "bloc": {
            "dependencies": ("bloc", "flutter_bloc", "hydrated_bloc"),
            "content": ("BlocProvider", "BlocBuilder", "Cubit<", "Bloc<"),
            "files": ("bloc.dart", "cubit.dart"),
        },
        "provider": {
            "dependencies": ("provider",),
            "content": ("ChangeNotifierProvider", "Consumer<", "context.watch", "context.read"),
            "files": (),
        },
        "getx": {
            "dependencies": ("get",),
            "content": ("GetMaterialApp", "GetxController", "Obx(", "Get.put"),
            "files": ("controller.dart",),
        },
    },
    "routing": {
        "go_router": {
            "dependencies": ("go_router",),
            "content": ("GoRouter", "GoRoute", "context.go", "context.push"),
            "files": ("router.dart", "app_router.dart"),
        },
        "auto_route": {
            "dependencies": ("auto_route",),
            "content": ("AutoRouter", "@AutoRouterConfig", "AutoRoute("),
            "files": (),
        },
        "navigator_2": {
            "dependencies": (),
            "content": ("RouterDelegate", "RouteInformationParser"),
            "files": (),
        },
        "named_routes": {
            "dependencies": (),
            "content": ("Navigator.pushNamed", "onGenerateRoute"),
            "files": (),
        },
    },
    "networking": {
        "dio": {
            "dependencies": ("dio",),
            "content": ("Dio(", "InterceptorsWrapper", "BaseOptions"),
            "files": ("api_client.dart", "dio_client.dart"),
        },
        "http": {
            "dependencies": ("http",),
            "content": ("package:http", "http.get", "http.post"),
            "files": (),
        },
        "retrofit": {
            "dependencies": ("retrofit", "retrofit_generator"),
            "content": ("@RestApi", "@GET(", "@POST("),
            "files": (),
        },
    },
    "serialization": {
        "freezed": {
            "dependencies": ("freezed", "freezed_annotation"),
            "content": ("@freezed", "with _$"),
            "files": ("freezed.dart",),
        },
        "json_serializable": {
            "dependencies": ("json_serializable", "json_annotation"),
            "content": ("@JsonSerializable", "fromJson", "toJson"),
            "files": ("g.dart",),
        },
    },
    "dependency_injection": {
        "get_it": {
            "dependencies": ("get_it",),
            "content": ("GetIt.instance", "GetIt.I", "registerSingleton", "registerFactory"),
            "files": ("injection.dart", "service_locator.dart"),
        },
        "injectable": {
            "dependencies": ("injectable", "injectable_generator"),
            "content": ("@injectable", "@module", "@InjectableInit"),
            "files": ("injection.config.dart",),
        },
    },
    "localization": {
        "flutter_localizations": {
            "dependencies": ("flutter_localizations", "intl"),
            "content": ("AppLocalizations", "localizationsDelegates", "supportedLocales"),
            "files": ("l10n.yaml", ".arb"),
        },
    },
    "testing": {
        "flutter_test": {
            "dependencies": ("flutter_test",),
            "content": ("testWidgets", "WidgetTester"),
            "files": (),
        },
        "mocktail": {
            "dependencies": ("mocktail",),
            "content": ("Mocktail", "when(() =>"),
            "files": (),
        },
        "mockito": {
            "dependencies": ("mockito",),
            "content": ("@GenerateMocks",),
            "files": (),
        },
        "integration_test": {
            "dependencies": ("integration_test",),
            "content": ("IntegrationTestWidgetsFlutterBinding",),
            "files": ("integration_test",),
        },
    },
    "code_generation": {
        "build_runner": {
            "dependencies": ("build_runner",),
            "content": (),
            "files": ("build.yaml",),
        },
    },
}


def parse_pubspec_dependencies(pubspec: Path) -> set[str]:
    dependencies: set[str] = set()
    if not pubspec.exists():
        return dependencies

    section = None
    for raw_line in pubspec.read_text(encoding="utf-8").splitlines():
        line = raw_line.split("#", 1)[0].rstrip()
        if not line:
            continue
        if re.match(r"^[A-Za-z_][A-Za-z0-9_]*:\s*$", line):
            key = line.split(":", 1)[0]
            section = key if key in {"dependencies", "dev_dependencies"} else None
            continue
        if section and raw_line.startswith(("  ", "\t")):
            indent = len(raw_line) - len(raw_line.lstrip(" "))
            if indent != 2:
                continue
            match = re.match(r"^\s{1,}([A-Za-z_][A-Za-z0-9_]*):", raw_line)
            if match:
                dependencies.add(match.group(1))
    return dependencies


def collect_project_files(root: Path) -> list[Path]:
    candidates: list[Path] = []
    for directory_name in ("lib", "test", "integration_test"):
        directory = root / directory_name
        if not directory.exists():
            continue
        for path in directory.rglob("*"):
            if path.is_file() and path.suffix in {".dart", ".yaml", ".arb"}:
                candidates.append(path)

    for filename in ("l10n.yaml", "build.yaml", "analysis_options.yaml"):
        path = root / filename
        if path.exists():
            candidates.append(path)
    return candidates


def read_text_sample(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")[:200_000]
    except OSError:
        return ""


def add_evidence(evidence: list[dict[str, str]], source: str, value: str) -> None:
    item = {"source": source, "value": value}
    if item not in evidence:
        evidence.append(item)


def confidence_for(count: int) -> str:
    if count >= 3:
        return "high"
    if count >= 1:
        return "medium"
    return "low"


def scan(root: Path) -> dict[str, object]:
    pubspec = root / "pubspec.yaml"
    dependencies = parse_pubspec_dependencies(pubspec)
    files = collect_project_files(root)
    file_text = {path: read_text_sample(path) for path in files}

    result: dict[str, object] = {
        "project_root": str(root),
        "is_flutter_project": pubspec.exists() and (root / "lib").exists(),
        "dependencies": sorted(dependencies),
        "signals": {},
    }

    signals: dict[str, object] = {}
    for category, tools in STACK_RULES.items():
        category_signals: dict[str, object] = {}
        for tool, rule in tools.items():
            evidence: list[dict[str, str]] = []

            for dep in rule["dependencies"]:
                if dep in dependencies:
                    add_evidence(evidence, "pubspec.yaml", dep)

            for path in files:
                lower_name = path.name.lower()
                relative = str(path.relative_to(root))

                for filename_hint in rule["files"]:
                    if filename_hint in lower_name or filename_hint in relative:
                        add_evidence(evidence, relative, f"file:{filename_hint}")

                text = file_text[path]
                for token in rule["content"]:
                    if token in text:
                        add_evidence(evidence, relative, token)

            if evidence:
                category_signals[tool] = {
                    "confidence": confidence_for(len(evidence)),
                    "evidence": evidence[:8],
                }

        signals[category] = category_signals

    result["signals"] = signals
    return result


def print_summary(result: dict[str, object]) -> None:
    print(f"project_root: {result['project_root']}")
    print(f"is_flutter_project: {str(result['is_flutter_project']).lower()}")
    print(f"dependencies: {', '.join(result['dependencies'])}")
    print("signals:")
    for category, tools in result["signals"].items():
        if not tools:
            continue
        print(f"  {category}:")
        for tool, info in tools.items():
            evidence_values = ", ".join(item["value"] for item in info["evidence"][:3])
            print(f"    - {tool}: {info['confidence']} ({evidence_values})")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project_root", type=Path)
    parser.add_argument("--json", action="store_true", help="Print JSON output.")
    args = parser.parse_args()

    root = args.project_root.resolve()
    if not root.exists():
        print(f"project root does not exist: {root}", file=sys.stderr)
        return 2

    result = scan(root)
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print_summary(result)

    return 0


if __name__ == "__main__":
    sys.exit(main())
