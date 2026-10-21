# Development

## Setup

```bash
npm ci
```

- CLI XML parsing and serialization prefer `@xmldom/xmldom`.
- `jsdom` provides the remaining Web API compatibility used by the Node.js CLI and tests.
- XML DOM is obtained through `globalThis.__mikuprojectXmlDom` by `msproject-xml` and `excel-io`.

## Common commands

```bash
npm run build
npm test
```

- `npm run build:core` transpiles the core TypeScript files to their tracked `src/js/` runtime modules.
- `npm run build:browser-runtime` creates the browser-compatible downstream artifact at `bundle/miku-project-runtime.mjs`.
- `npm run build:cli-bundle` creates the Node.js CLI artifact at `bundle/miku-project.mjs` and a source archive.
- `npm run build:cli-v1-runtime` creates the versioned v1 Node runtime under `runtime/node/` only from a clean source tree whose HEAD has the exact `v<package.version>` tag. It refuses existing output and is not a Release command. P4.10's test/audit-owned consumer pins the raw `runtime-manifest.json` SHA-256 supplied outside the runtime, verifies the canonical executable/source entries, sizes, and SHA-256 digests before launching Node, and validates the complete result/runtime binding.
- `npm run verify:cli-v1-release-candidate -- --runtime-dir <directory> --lock <lock.json>` verifies an already-built internal reference candidate against a Git-tracked external lock, copies only the three locked members to an isolated consumer, and replays `validate` / `inspect` / `plan-change` / `apply-change` / `verify-artifact`. The Gate G4 `v1.0.3` lock is `docs/miku-project-node-reference-runtime-lock-v1.0.3.json`; its local retained candidate is expected at `workplace/gate-g4/v1.0.3/runtime/` and is intentionally ignored by Git.
- The Gate G4 lock is an internal approval trust anchor, not a public Release checksum or Skills lock. The current `.github/workflows/release-runtime-bundles.yml` does not build or upload this v1 three-member runtime; do not publish `v1.0.3` as that public artifact through the current workflow.
- `npm run build:full` runs the core build, both bundles, and the complete Main Application suite.
- `npm run build:xlsx-sample` writes optional sample XLSX and Markdown output under `local-data/`.

テストsuiteは次の役割に固定する。追加した `*.test.js` は必ずいずれかへ明示的に分類し、`tests/mikuproject-test-suite-topology.test.js` が実行漏れと重複を検出する。

- `npm run test:fast`: 日常開発用。core utility / codec / workbook / core APIとlegacy CLI compatibility contractを検証する。時間のかかるCLI統合testとbrowser runtime testは含めない。
- `npm run test:full`: `fast` にCLI統合testとbrowser runtime contractを加えた完全回帰。
- `npm test` / `npm run test:all`: 現在は `full` と同じ全checked-in test fileを実行する、CI向けの安定した完全suite alias。

## v1 開発における互換性と回帰防止

`v1.0.0` からのゼロベース再設計は、既存の利用者向け機能を退行させずに v1 workflow を追加する。実装とレビューでは次を守る。

- 既存 CLI の command surface、exit code、標準入出力、diagnostics、既存ファイルへの出力を変更しない。これらは `tests/mikuproject-cli-compatibility-contract.test.js` で検証する。
- 新しい v1 workflow は、legacy CLI の実装を置換するのではなく、v1 専用の router / contract / test として追加する。既存の機能を変更する必要がある場合も、先に互換性への影響を確認する。
- 通常の変更では `npm run test:fast` を実行する。CLI統合、browser runtime、runtime artifact、または既存 I/O に触れる変更では、`npm test` による完全回帰を実行する。
- 意図した非互換変更は例外として扱う。変更理由、利用者への影響、移行方法、更新する contract と test を同じ変更に明記し、互換性の破棄を暗黙に混在させない。

Web UI development, browser/UI tests, single-file HTML build, and offline browser verification are maintained in [miku-project-web](https://github.com/igapyon/miku-project-web).

CLIの2026-10-21 review修正では、未知optionの明示的拒否、import warningの伝達、出力失敗時の単一JSON診断、workbook全量diff、v1 control helpを扱う。従来無視されたoptionの拒否とdiff結果の拡張は、理由・移行方法・回帰条件を[修正計画](cli-command-review-fix-plan-v20261021.md#compatibility-and-migration)に明記した意図的な契約修正である。

## local-data

`local-data/` is a disposable workspace for generated samples and verification outputs. It is not tracked by Git and must be reproducible when needed.
