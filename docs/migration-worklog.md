---
title: mikuproject miku-soft standardization worklog
description: Post-standardization alignment record for the historical combined mikuproject repository.
topics:
  - mikuproject
  - miku-soft
  - migration
  - release
  - web-app
category: workflow
status: active
audience:
  - maintainer
  - developer
  - agent
created: 2026-08-05
updated: 2026-10-22
sources:
  - type: upstream-doc
    role: primary
    url: https://github.com/igapyon/igapyon-agent-skills/tree/devel/skills/igapyon-miku-soft-developer
    label: current miku-soft shared policy
    checked: 2026-08-05
  - type: manual-verification
    role: verification
    label: npm run test:fast and bundled CLI version/help smoke
    checked: 2026-08-05
---

# mikuproject miku-soft Standardization Worklog

## 2026-10-22 Node / Java Feature Comparison (#137)

- Added the [feature union and difference decisions](node-java-feature-union-v20261022.md): 90 rows with evidence, retained differences, implementation candidates, unresolved specification decisions, and thirteen follow-up records after LEG-J14-J16 added B22-B25 and F-S5/F-S6/F-J5.
- Baselines: Node `9a9f562c03d28f1b0f3c809226dc61d0cd9d5f7e`; Java `aca9809a94b6e15915729c90f1a57a04e66c85de`. Existing uncommitted version increments to `1.1.2` were preserved.
- Connected Node README/TODO and Java TODO/the earlier Java comparison note to the detailed table. Product source, immutable contract snapshots, and dated G4 evidence remain the inspected baseline.
- Main workflow: `igapyon-miku-soft-developer` maintenance, with the main-application and Java straight-conversion references and `igapyon-repo-conventions` baseline checked on 2026-10-22. The installed skill copy has no Git metadata, so its commit could not be resolved; its `SKILL.md` SHA-256 is `e3c8a776f14791de46e59f8d3f3bb2987fc2b90a1fd866736a981d0cbf624ae4`.
- Verification: static extraction found 22 shared legacy commands, seven Java-only commands, and no shared option-name-set mismatch. Document row IDs, table columns, local/pinned-source reference targets, source hashes, and both repositories' diffs were checked. No product tests or builds were run for this documentation change.
- Maintenance uplift was limited to evidence and tracking-document alignment; runtime, CI, and release changes require their own scope and verification.
- Prepared the [Luna work breakdown](node-java-work-plan-v20261022/README.md): 75 task cards with dependencies, decision/Gate inputs, fixture cases, completion criteria, and future check commands. Documentation checks covered all 86 union rows, unique task IDs, an acyclic dependency graph, index links, and table structure. At plan creation, all cards were unstarted at the user's explicit request; no implementation, product tests/builds, snapshot import, or GitHub operation was executed during planning.

## 2026-10-22 Node / Java Issue #137 execution

- Executed the residual plan: Java README/CLI test corrections and the F-J5 header-based XLSX import fix are complete in the Java worktree. Targeted CLI/XLSX tests passed 22/22, Node 20.20.2 J-PARITY passed 9/9, and `sh scripts/test-all.sh` completed: importer 12/12, Maven 225 tests, 0 failures/errors, 11 expected opt-in skips, and dedicated snapshot verification 8/8.
- The Node 26.12.0 WBS XLSX byte mismatch did not reproduce in two repeated focused runs. No cause is established; REM-05 remains parked and no byte comparison was weakened.
- Repaired the canonical miku-scm reader by removing the incompatible `--comments` flag while retaining the JSON `comments` field; regenerated contracts, passed 180 fast / 293 full miku-scm tests, synchronized the installed skill, and read #137 through the fixed workflow. #137 is OPEN with 0 comments. The evidence workflow was complete and untruncated.
- Reviewed local `mikuproject-mcp` and `mikuproject-skills` consumer paths for F-S5/F-S6. MCP exposes task-edit projection output without normalizing its values; Skills provide date-only schedule examples but do not define unset `notes` / `calendar_uid` or null/empty rules. External consumers remain unverified. The [adoption packet](node-java-137-adoption-packet-v20261022.md) now collects options, impacts, and acceptance cases; no decision was adopted.
- Historical END-03 handoff record: four follow-up issue scopes were checked against open Issues, the F-J5 draft reflected its then-local implementation/test state, and a paste-ready #137 comment draft was saved. At that earlier point the Java implementation was uncommitted; it is now preserved in Java HEAD `c0b4421`. Current RPF-03 public regression additions and tracking edits remain uncommitted. No GitHub Issue/comment was created or updated.
- Current counts: original 75 cards — 37 complete, 2 awaiting maintainer decisions, 36 unstarted; END-03 complete. Supplemental REM-01–04, REM-06–12, REM-16–18 complete; REM-05 parked pending reproducible cause; REM-13–15 await adoption. No GitHub mutation, commit, or push occurred.
- RPF-00–08 self-review correction execution: preserved the captured 1.1.2/version and F-J5 worktree state; Java's concurrent `c0b4421` commit now contains that implementation and version work. Added public XLSX header-boundary regressions (RPF-03 additions remain uncommitted) and strengthened six legacy-command text/JSON refusal assertions. RPF-02/03 document current Java-vs-Node header behavior without adopting policy. F-S5 now distinguishes Node's existing patch-input contract from unset projection output; Java `update_task` dispatch is absent and recorded as a separate candidate. F-S6 documents the spec boundary: draft dates may cover normal/summary/milestone tasks, but 09:00/18:00 completion is for normal tasks only and is skipped for `is_milestone=true`; summary has no general time default. No unresolved behavior was adopted.
- RPF-08 current final verification supersedes earlier historical J-ALL totals: `sh scripts/test-all.sh` exit 0, Node snapshot importer 12/12, full Maven 229 tests (0 failures, 0 errors, 11 opt-in skips), dedicated snapshot verifier 8/8; Node 20.20.2 parity 9/9, 0 failures/errors/skips. Distinct logs: `workplace/node-java-137/RPF-08/test-all.log` and `node-parity.log`. The prior 225-test F-J5 result and the earlier 224-test / two-baseline-failure run remain historical records only.
- RPF-06/07 refreshed the named comparison rows and individually audited all 90 stable IDs. Expected ID set matched exactly (0 duplicate, missing, or unexpected); 325 relative targets in the feature-union/evidence documents exist. Every result is scoped to its listed fixed revision, source path, fixture, or test; no whole-product parity claim is inferred from suite success.

- Planning-stage record (before execution began): created [the residual execution plan](node-java-work-plan-v20261022/remaining-work.md) with 18 supplemental REM cards for the two Java baseline failures, the unresolved Node 26 XLSX byte mismatch, F-J5 header mapping, F-S5/F-S6/depth decisions, the fixed Issue-reader recovery, and END-03 drafting. Reused the original 36 unstarted APPLY/REF/V1 cards and their gates, and clarified the source-adoption → REF-02 build → digest-adoption → REF-03 sequence and REF-05's P5-C1 review role. At that planning stage, no product code, tests, build, runtime, snapshot, or GitHub operation was executed. The subsequent execution outcomes are recorded above.

- Self-review corrections: gated the two remaining Java tests that invoke Node behind `MIKUPROJECT_RUN_NODE_PARITY=true` plus the vendored `node_modules` check; fixed repeated missing-option handling, empty `--state`, and `ai validate-patch` malformed-JSON / input-read reporting; moved union result references to this tracked worklog and staged REF-02/REF-03 adoption requirements to remove the circular gate. Updated the LEG-J06/J11 task contracts. Normal targeted Maven ran 25 tests with 0 failures/errors and 2 opt-in skips. The final opt-in run passed 34/34 on Node 20.20.2, including the 9-case J-PARITY suite. System Node 26.12.0 produced a WBS XLSX byte mismatch in J-PARITY, so the documented byte-parity procedure uses Node 20. `sh scripts/test-all.sh` reran the importer tests (12/12 passed) and 224 Maven tests; the same two PRE-02 CLI baseline failures remained, with 0 errors and 11 opt-in skips. `ContractSnapshotVerifierTest` passed 8/8 within that suite; the script's final dedicated snapshot-verifier step was not reached. `git diff --check` passed in both repositories. No GitHub writes, commits, or staging occurred.

- Completed DEC-09: added the Calendar XML inventory for identity/base refs, weekdays/working times, exceptions, and workweeks. Both codecs preserve mapped collection order; validation handles CalendarUID references. It records missing DayType/unset representations, container lookup paths, default-calendar edge behavior, and the partial NonWorkingDays workbook projection. No product source changed. Evidence: [DEC-09 card record](../workplace/node-java-137/DEC-09/result.md).
- Completed DEC-08: added the Assignment XML field inventory for Task/Resource references, period/variance, units, work/cost, baselines, timephased data, and extended attributes. Both codecs map the fields; number representations and unset values differ, refs remain string IDs until validation, and Java native workbook columns are documented separately. No product source changed. Evidence: [DEC-08 card record](../workplace/node-java-137/DEC-08/result.md).
- Completed DEC-07: added the Resource XML field inventory, including identity, calendar reference, rate/cost/work values, extended attributes, baselines, and timephased data. All mapped XML Resource fields appear in both codecs; optional representation/numeric conversion and unknown-tag loss are recorded, and Java workbook-only columns are kept separate from XML support. No product source changed. Evidence: [DEC-07 card record](../workplace/node-java-137/DEC-07/result.md).
- Completed DEC-06: added the Task field inventory for hierarchy, planned/actual/variance/work/cost/status fields, extended attributes, baselines, timephased data, and predecessor links. It records Node defaults versus Java nullable fields, Number/Integer/Double conversions, unknown-tag loss, and the validator difference for forward PredecessorUID references. No product source changed. Evidence: [DEC-06 card record](../workplace/node-java-137/DEC-06/result.md).
- Completed DEC-05: created the Project section of the XML field inventory. All currently modeled Project scalar/nested fields are read and written in both codecs; optional unset representations and Node `Number` versus Java `Integer` conversion are implementation differences, while generic unknown Project XML is discarded by both without an explicit exclusion policy. No product source changed. Evidence: [DEC-05 card record](../workplace/node-java-137/DEC-05/result.md).
- Completed DEC-04: confirmed the frozen Node `detect-kind --out` metadata expectation and inspected the CLI, Java parity paths, mikuproject MCP operations, and miku-project Skill examples. The inspected consumers neither request file output for these commands nor parse `io.output`; recommendation is to preserve Java's actual destination metadata and document the Node exception. G-META remains open for maintainer adoption; no runtime or test source changed. Evidence: [DEC-04 card record](../workplace/node-java-137/DEC-04/result.md).
- Completed DEC-02: Node's text/binary CLI output path fails when the parent is missing; Java's shared text/binary writers create the parent first. Existing file overwrite is a separate behavior and both implementations replace file contents. Repository consumer examples did not establish a dependency, so the proposal recommends preserving the current runtime difference pending maintainer review. G-PARENT remains open for APPLY-02; no implementation changed. Evidence: [DEC-02 card record](../workplace/node-java-137/DEC-02/result.md).
- Completed LEG-J17: mapped all seven shared report commands to standalone and aggregate coverage. Added byte parity for the five missing standalone paths, non-empty report directory checks, and explicit ZIP entry names/content checks. A dated `dependency.xml` fixture passed Node/Java parity; a separate `WbsSvgTest` locks Java's no-usable-date fallback without treating it as dated parity. Report-focused suites passed 23/23; the full opt-in parity class passed 9/9 with no skips. The required combined focus ran 39 tests with 2 pre-existing CLI failures (README/help list and legacy flat-command error expectation). B17/G-REPORT remains untouched. Evidence: [LEG-J17 card record](../workplace/node-java-137/LEG-J17/result.md).
- Completed LEG-J16: compared workbook JSON, XML, XLSX, and XLSX import. Workbook JSON/dates and null cells showed recorded differences; XML bytes differed but the Java-decoded common workbook projections matched for the fixture. Node XLSX had 17/14/12 standard Task/Resource/Assignment headers; Java preserved 22/21/22 with documented extensions. Importing Node XLSX in Java reproduced a Notes-to-CalendarUID mis-mapping, tracked separately as B25/F-J5. Core/import-focused tests passed 22/22 and the full opt-in parity class passed 8/8 with no skips. Evidence: [LEG-J16 card record](../workplace/node-java-137/LEG-J16/result.md).
- Completed LEG-J15: compared `state from-draft`, `summarize`, `apply-patch`, and `diff` in one flow. `from-draft` and `diff` artifacts matched byte-for-byte; summarize/apply outputs reproduced Java's 09:00/18:00 datetime enrichment and null-to-empty cell differences. Diagnostics, diff outputs, and input immutability checks passed. Java focused suites passed 39/39 and the opt-in parity class passed 7/7 with no skips. Added B24/F-S6 as an unresolved, out-of-plan decision candidate. Evidence: [LEG-J15 card record](../workplace/node-java-137/LEG-J15/result.md).
- Completed LEG-J14: compared nine AI success paths across `ai spec`, `detect-kind`, project overview, auto/UID task-edit, scoped/full phase-detail, bundle, and validate-patch. The full opt-in parity class passed 6/6 with no skips. Recorded integer-vs-decimal JSON number spelling, task `notes`/`calendar_uid` shape differences, validate-patch context, and the frozen B13 output metadata in the artifact/diagnostics. Added B22/B23 and follow-up F-S5; B23 remains undecided and is outside the original 75 cards. Evidence: [LEG-J14 card record](../workplace/node-java-137/LEG-J14/result.md).
- Completed LEG-J13: the Java CLI entrypoint now writes stdout/stderr as UTF-8 independent of the JVM default charset. Japanese JSON stdout, diagnostics, and file bytes matched Node byte-for-byte and used LF on the current macOS runtime; an ISO-8859-1 child JVM also passed. RegressionTest and opt-in NodeParityTest passed 27/27. Java help retains its Java-only extension wording. Evidence: [LEG-J13 card record](../workplace/node-java-137/LEG-J13/result.md).
- Completed LEG-J12: Java binary I/O preflight now matches Node's rejection codes and required-option details; empty, invalid, and unpadded Base64 are rejected before XLSX decoding. Node 20's eight boundary observations matched the expected channels/metadata. Java RegressionTest passed 21/21; the CLI class still has the two previously recorded README/help and legacy-command text failures. Evidence: [LEG-J12 card record](../workplace/node-java-137/LEG-J12/result.md).
- Completed LEG-J11 and corrected in self-review: Java `ai validate-patch` sends malformed JSON (`invalid_json_input`), input-read failures, invalid kind, and structural failures to the primary report (exit 1), while usage failures stay on stderr (exit 2). Structural failures retain base warnings; unknown operations remain successful warnings. The opt-in regression and J-PARITY evidence is recorded above.
- Completed LEG-J10: Java `ai detect-kind` now routes indeterminate `{}` input through the shared processing-error path before writing primary output or success diagnostics. Text/JSON failures return exit 1 with empty stdout; normal `PATCH_OK` output remains `patch_json`. Regression focus passed 16/16; B13 success metadata was left unchanged. Evidence: [LEG-J10 card record](../workplace/node-java-137/LEG-J10/result.md).
- Completed LEG-J09: draft and patch inputs now use the existing AI JSON extractor; workbook JSON remains strict plain JSON. Plain, fenced, and last-of-two-fences cases passed along with CoreApiImport tests (25 total). Evidence: [LEG-J09 card record](../workplace/node-java-137/LEG-J09/result.md).
- Completed LEG-J08: Java now rejects invalid `--max-depth` lexemes as usage errors and preserves omitted/0/positive behavior. The 11 regression tests passed, including a direct 200-digit Node 20 vs Java observation. Node accepts a finite number beyond Java's `Integer` range; the bound remains undecided and is recorded without blocking unrelated work. Evidence: [LEG-J08 card record](../workplace/node-java-137/LEG-J08/result.md) and [range decision note](node-java-137-decisions.md#leg-j08-max-depth-upper-range).
- Completed LEG-J07: added a shared Java stdin-source guard for diff, validate-patch, and apply-patch. All three duplicate-source cases were rejected before reading, while one implicit stdin source still worked. Regression tests passed 8/8. Evidence: [LEG-J07 card record](../workplace/node-java-137/LEG-J07/result.md).
- Completed LEG-J06 and corrected in self-review: Java rejects any missing option occurrence before I/O, even if a later duplicate supplies a value; fully valued duplicates still use the last value. Extra positionals and unknown options remain preflight errors. Empty `--state` is again a structured usage error. Targeted Maven and Node 20 parity outcomes are recorded above.
- Completed LEG-J05: text and binary save failures to existing directories each return exit 1 with empty stdout and one error diagnostic, while preserving input bytes. The new regression class passed 4/4; no production change was needed. Evidence: [LEG-J05 card record](../workplace/node-java-137/LEG-J05/result.md).
- Completed LEG-J04: added Java CLI warning checks for projections, summary, XML, WBS Markdown, and validate/apply patch combinations. Text/JSON warning counts and messages passed; clean primary output remained intact. Corrected the stale phase-detail test expectation for Java-only columns. New regression class passed 3/3; two unrelated pre-existing CLI test failures remain. Evidence: [LEG-J04 card record](../workplace/node-java-137/LEG-J04/result.md).
- Completed LEG-J03: covered unknown sheet/column/Project field, side-specific warnings, invalid identities, non-scalars, blank placeholders, incomplete comparisons, and input immutability. The focused diff/workbook suite passed (26 tests); Java behavior matched Node without production changes. Evidence: [LEG-J03 card record](../workplace/node-java-137/LEG-J03/result.md).
- Completed LEG-J02: verified row addition/removal and positions for all five entity sheets, Project Field identity, NonWorkingDays tuple keys, task reorder/front insertion, and keyed-set order for other sheets. The 11 diff tests passed; Java behavior matched Node without production changes. Evidence: [LEG-J02 card record](../workplace/node-java-137/LEG-J02/result.md).
- Completed LEG-J01: added seven isolated Java diff scalar-contract cases using `BASE.json`. Existing Java behavior matches the Node contract; no production change was needed. `ProjectWorkbookJsonDiffTest` plus `ProjectWorkbookJsonTest` passed (16 tests). Evidence: [LEG-J01 card record](../workplace/node-java-137/LEG-J01/result.md).
- Completed PRE-02: added repeatable Node/Java legacy observation fixtures and helper in the Java test tree. `NodeJavaLegacyCasesTest` passed (1/1); opt-in `MikuprojectNodeParityTest` passed (4/4). The baseline `MikuprojectCliTest` run had three existing failures: README/help usage mismatch, a legacy-command error-text expectation, and warnings for Java-only workbook columns. These are preserved for card-specific follow-up. Evidence: [PRE-02 card record](../workplace/node-java-137/PRE-02/result.md).
- Completed LEG-N01: added the already-accepted `--out` syntax to the help lines for `ai spec`, `ai detect-kind`, `ai validate-patch`, and `state diff`, with assertions in the existing CLI review regression suite. The focused run passed: 2 files, 33 tests. No registry or execution behavior changed; B13's frozen metadata test remains unchanged.
- Completed KEEP-01 through KEEP-05 by source/document inspection. Java's seven legacy extensions and aliases remain Java-only; its ten native workbook columns remain outside the Node-shaped CLI projection; dated SVG parity and the intentionally retained undated Java fallback remain distinct; zero-duration cluster warnings remain validation-only; MJS/JAR, browser/Web, legacy/v1, snapshot, and #135 boundaries remain separate. No product tests were needed for these documentation-only cards. The undated fallback has no focused test in `WbsSvgTest`; LEG-J17 will account for that coverage gap. Evidence: [KEEP card record](../workplace/node-java-137/KEEP/results.md).
- Started the approved plan. PRE-01 baseline: Node `devel-tiga1021ubc` at `9a9f562c03d28f1b0f3c809226dc61d0cd9d5f7e`; Java `devel-tiga1022a` at `aca9809a94b6e15915729c90f1a57a04e66c85de`.
- RPF-00 captured the initial status: Node README/TODO/worklog/package version files and comparison docs were dirty; Java TODO, historical parity note, and POM were dirty, alongside the previously identified CLI/core/test changes. The Java HEAD later advanced to `c0b4421` with the existing implementation/version work; that is a current-state transition, not a change to the captured baseline. The Node `1.1.2` work remains in its worktree. Current RPF-03 Java public regression additions remain uncommitted.
- Both package metadata files currently report `1.1.2`; the comparison table retains its historical `1.1.1` source identity. No existing changes were reset, stashed, or overwritten. Detailed status and HEAD evidence: [PRE-01 record](../workplace/node-java-137/PRE-01/result.md).

- DEC-01 proposal is ready in [Node / Java #137 decisions](node-java-137-decisions.md). It records concrete argv observations and impact options; G-HELP remains explicitly undecided pending maintainer selection.
- DEC-03 records the historical Java report option effects, the current allowlist mismatch, the conflicting maintenance notes, and a bounded restoration proposal. G-REPORT remains undecided; no Java source was changed. Evidence: [DEC-03 card record](../workplace/node-java-137/DEC-03/result.md).

## 2026-08-05 Baseline

`mikuproject` predates the current miku-soft shared standards. It remains a historical combined repository: the `10 Main Application` core and CLI, plus the `11 Web App` source, generated HTML, browser JavaScript, and `lht-cmn` live together.

Verified before alignment work:

- `npm run test:fast`: 12 test files and 210 tests passed.
- `npm run build:cli-bundle`: generated the Node CLI runtime and source archive.
- The generated CLI runtime ran `--version` and `--help` successfully.

## Applied Local Alignment

- Added the repository-local entry point [miku-soft-reference.md](miku-soft-reference.md).
- Added `dist/` to the Node/Web local build-output ignore rules.
- Documented the CLI runtime contract in `--help` and fixed it with CLI tests.
- Replaced locale-sensitive ordering in source-archive, calendar, and AI-view paths with explicit UTF-16 code-unit ordering.

## Historical Reference Snapshots

The following pre-standardization documents remain temporarily as history and must not be treated as current shared policy:

- `docs/miku-soft-00-overview-design-v20260427.md`
- `docs/miku-soft-10-mainapp-design-v20260501.md`
- `docs/miku-soft-20-javaapp-design-v20260501.md`
- `docs/miku-soft-30-straight-conversion-v20260425.md`
- `docs/miku-soft-40-agentskills-design-v20260501.md`
- `docs/miku-soft-50-mcp-design-v20260501.md`

Before moving or removing them, inspect inbound links from published documentation, Agent Skills, and sibling repositories. Preserve only a clearly labelled historical record or project-specific decisions; do not maintain another copy of the shared standard.

## 2026-08-09 Web Separation Foundation

Issue [#124](https://github.com/igapyon/miku-project/issues/124) の Main Application 側 first stage として、Node.js CLI bundle とは独立した browser-compatible runtime bundle を追加した。

- `version`、`embeddedCorePaths`、`loadMikuProjectRuntime(options)`、default loader を公開する。
- Node.js module、`process`、CLI 自動実行、UI event/download 層を runtime から除外する。
- isolated browser smoke と境界検査を fast suite に組み込む。
- Release workflow で CLI、browser runtime、machine-readable runtime lock、sources、SHA-256 を別 asset として生成・検証する。
- downstream の固定 tag / asset / SHA-256 取込規則を [browser-runtime.md](browser-runtime.md) に定義する。

同日、Public repository `igapyon/miku-project-web` が人手で作成され、Web surface の downstream first cut を local checkout に構築した。

- `v0.13.0`、`miku-project-runtime-0.13.0.mjs`、SHA-256 を repository-local lock に固定する。
- cache、明示 local file、固定 GitHub Release URL のすべてで同じ version / SHA-256 検証を必須にする。
- runtime loader を 23 Web modules より先に実行し、runtime、UI、CSS、`lht-cmn` を single-file `miku-project.html` に内包する。
- browser/UI suite は 18 test files、135 tests が成功した。
- jsdom offline smoke で Input / Overview / Output、15 output entries、request-generating asset reference がないことを確認した。
- tests は generated core shim を `src/js/` に置かず、固定・検証済み runtime を helper から直接起動する。
- `.cache` と `node_modules` を持たない clean copy でも、同じ SHA-256 の local Release candidate を入力に `npm ci` と全検証を再現した。

`v0.13.0` Release は CLI、browser runtime、manifest、sources、SHA-256 assets を公開した。cache を持たない Web copy は Release URL から runtime を取得し、Web CI も成功した。Main Application 側の combined Web surface は整理済みであり、以後 Web App の変更は `miku-project-web` で管理する。

## Decisions Required Before the Next Migration

### Node, CI, and Release Policy

The repository currently has a release-only workflow using GitHub Release publication and Node 20. The target Node support range, CI matrix, release build runtime, Action update/pinning policy, and checksum policy must be decided together with the shared miku-soft release profile.

Do not silently adopt Node 22/24 or change the release trigger until that policy is approved. After approval, align `package.json` runtime metadata, normal CI, release workflow, staged-asset checks, and runtime smoke checks as one compatibility change.

### Main Application Rename

The canonical Main Application name is `miku-project`. The package name, canonical CLI command, generated single-file app, CLI runtime/source archive, release asset names, repository URL, and current maintenance documents use that name.

The migration keeps these intentionally bounded compatibility contracts:

- `mikuproject` remains an npm CLI alias for `miku-project`.
- `mikuproject.html` is a lightweight redirect to `miku-project.html`.
- `globalThis.__mikuprojectCoreApi` remains an alias of the canonical `globalThis.__mikuProjectCoreApi`.
- `mikuproject_workbook_json` remains the existing JSON format identifier; changing a persisted data format is out of scope for a product-name migration.

Internal module globals and test file identifiers continue to use their established `__mikuproject...` / `mikuproject-...` names where they are not published contracts. Historical articles and imported miku-soft standard documents are retained as historical records rather than mass-renamed.

### Web Separation

Issue [#123](https://github.com/igapyon/miku-project/issues/123) establishes `miku-project` as the canonical Main Application name and explicitly excludes Web separation from the same rename change. The GitHub repository has been renamed to `igapyon/miku-project`; this repository retains the current combined layout until the follow-up Web migration begins. Web separation requires a human-created `miku-project-web` repository and GitHub Pages / Release decisions. Establish and verify that repository first, using the renamed main application's core API or a documented runtime artifact. Only then may the renamed main application repository relinquish Web-only source, generated HTML, `lht-cmn`, browser tests, and tracked generated browser JavaScript.

The current combined layout is retained until that separate migration is approved and complete.

- Completed DEC-10: synthesized the five-domain legacy XML field inventory and classified every observed difference. All currently modeled XML fields have read/write coverage in both codecs; default-value behavior, optional-value representation, numeric conversion, unknown XML loss, calendar edge paths, and fixture-scoped XML byte differences remain explicit. A two-pass Java predecessor UID validator is the only concrete implementation candidate, pending field-specific G-XML adoption. The v1 strict unsupported-element contract remains a separate boundary. No product source or tests changed. Evidence: [DEC-10 result](../workplace/node-java-137/DEC-10/result.md).
- Completed REF-01: proposed exact source tag `v1.1.1` / `9a9f562c03d28f1b0f3c809226dc61d0cd9d5f7e` for a new internal reference and Java snapshot. Recorded the `CU-USAGE-001` and control help/version source delta, the CLI contract document change, unchanged contract/corpus versions and corpus digest, and the Java importer's immutable snapshot rule. G-REFERENCE remains unadopted; no tag, runtime, lock, snapshot, or release was created. Evidence: [reference update proposal](node-java-137-reference-update.md) and [REF-01 result](../workplace/node-java-137/REF-01/result.md).
- Completed END-01: audited all 90 comparison rows and connected them to source, test, card results, or explicit unresolved decisions. Updated D08/F-S3 with the complete XML synthesis and field-specific G-XML hold, and V09/F-X1 with the exact REF-01 proposal. Updated Node and Java #137 TODO tracking without changing product code or posting issues. Existing source/test changes in both worktrees remain untouched. Evidence: [END-01 result](../workplace/node-java-137/END-01/result.md).
- Historical END-02 run before the self-review correction series: Node source/tests were unchanged since the 32-file / 361-test `npm run build:full` pass. Java `sh scripts/test-all.sh` ran the importer suite (12/12) and 224 Maven tests; two PRE-02 baseline CLI failures remained, with 0 errors and 11 opt-in skips, so that run did not reach the final snapshot verifier. Its Node 20 J-PARITY run was 9/9 and focused opt-in Java regressions were 25/25. These are historical results, superseded for the changed Java worktree by RPF-08's successful 229-test J-ALL and dedicated snapshot verification (recorded above); unresolved `--max-depth` upper bound remains.

## 2026-10-22 R2F self-review follow-up

- Executing R2F-00–07 under the explicit follow-up authorization. Baseline preserved Node `9a9f562c` dirty review work and Java `c0b4421` plus existing dirty `TODO.md`, `docs/remaining-migration-items.md`, and `ProjectXlsxTest.java`. Node 20.20.2 / Java 17.0.21 / Maven 3.10.0.
- R2F-01 added B26 / F-J6 as a separate, unstarted future `update_task` implementation candidate. R2F-03 D07 then measured Node name update with no warning versus Java unchanged name, exit 0, one unsupported-operation warning. F-S5 projection shape remains a separate undecided question.
- R2F-02 strengthened the existing Java XLSX public regression method for UID header absent, one row UID missing, and trailing Notes cell absent. Focused Java suite passed 16/16 with no failures, errors, or skips. R2F-03 completed 22 independent cases / 44 runtime runs; all exit 0, inputs unchanged, outputs present. Blank/date findings and source path are recorded in the [shared evidence](node-java-137-review-evidence-v20261022.md#r2f-03).
- At the R2F-04 checkpoint, RPF-08's 229-test result still preceded R2F-02 assertions and final J-ALL was pending R2F-06. This interim status is superseded by the R2F-06/07 closeout update below. Historical 224 / 225-test results remain dated history.

## 2026-10-22 R2F-06/07 closeout update

- R2F-06 ran after the R2F-02 assertion expansion: snapshot importer 12/12, Maven 229 tests / 0 failures / 0 errors / 11 opt-in skips, and dedicated `ContractSnapshotVerifierTest` 8/8. The three-stage script exited 0. The RPF-08 Node 20 parity 9/9 remains prior evidence. Latest console: `workplace/node-java-137/R2F-06/test-all-closeout.log`; the earlier `test-all.log` is retained as a prior successful run.
- R2F-07 refreshed current status across the evidence, feature union, Node and Java TODO tracking, and work-plan closeout. Current feature union is 91 rows; the RPF-07 90-row audit remains historical. The original 75 cards (37 done / 2 awaiting / 36 unstarted), REM18, RPF10, and R2F8 remain separate counts.
- Fixed read-only `writing.issue.prepare` reader for #137 succeeded at run `20261022132452178-e7723a08-0a5a-4430-93b8-a7746fe032b0`; OPEN, `enhancement`, 0 comments; no mutation. New local comment draft: `workplace/miku-scm/issue-comments/issue-137-comment-202610222224.md`. New Java F-J5 draft and matching Node mirror: `issue-new-202610222225.md`; SHA-256 equality verified. Prior drafts were preserved. No GitHub mutation, commit, or push occurred.

## 2026-10-23 I137 implementation

- Implemented the 0–100 `--max-depth` boundary in the Node CLI, Java CLI, and MCP Zod / public JSON Schema. Omission remains unlimited; the depth counts descendants from the selected root. The Java direct core API remains outside this change. MCP's ignored package-local contract copy was synchronized so runtime schema loading uses the same maximum as the tracked contract.
- Implemented Java Patch JSON `update_task` dispatch and nine fields: `name`, `notes`, `calendar_uid`, `critical`, `is_milestone`, `planned_start`, `planned_finish`, `planned_duration`, and `planned_duration_hours`. Strict types, ordered warnings/changes, milestone coupling, unknown-field warnings, and continued processing after invalid operations are covered. `percent_complete` and `percent_work_complete` remain unsupported pending a type decision; this is partial F-J6.
- Node `npm run build:full` passed: 32 test files, 374 tests. Java `sh scripts/test-all.sh` passed in the implementation copy: snapshot importer 12/12, Maven 238 tests with 0 failures / 0 errors / 14 opt-in skips, and snapshot verifier 8/8. A current-Node Java comparison run passed 41/41 with no skips; it used Node v26.12.0, CLI SHA-256 `32f2e5fb7e263a407ba0d42380dc441fa6dc259cdec40e02ce815befa8d8b9b9`. MCP focused schema/runtime tests passed 3/3 in the implementation copy.
- MCP full build was blocked by a pre-existing uncommitted `packages/node/src/server/createServer.ts` type error: `maxToolInputElements` is absent from the installed `ServerOptions` type. The package full test suite was not run after that build failure. This existing change was preserved.
- Date behavior remains deliberately bounded: Java uses its existing task-date helper; a space-separated datetime accepted by Node is warned by Java, and the T-versus-space output difference remains a tested expected difference. No F-S6 date conversion or null/empty-cell policy was adopted. Issue #138 remains the follow-up for datetime behavior; F-S5 projection shape remains undecided.
- Java/MCP source patches were applied to their actual repositories after explicit write authorization. Build/tests ran in temporary copies containing the same implementation plus baseline dirty changes. Node, Java, and MCP `git diff --check` passed. Existing dirty changes were preserved; no commit, push, or GitHub issue mutation occurred. See the [I137 plan and implementation results](node-java-work-plan-v20261022/implementation-plan-v20261023.md).
