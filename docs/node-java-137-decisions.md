# Node / Java #137 decision record

Status: **active.** Proposals are evidence for review; an undecided item is not an approval.

## DEC-01 / G-HELP — legacy help and option position

Related row: B03. State: **awaiting maintainer decision**.

### Observed behavior

| Invocation | Node legacy CLI | Java legacy CLI | Input/output effect |
| --- | --- | --- | --- |
| no arguments | root help, exit 0 | root help, exit 0 | help on stdout; stderr empty; no project input read |
| root `--help` | root help, exit 0 | root help, exit 0 | help on stdout; stderr empty |
| root `help` / `-h` | treated as command and rejected, exit 2 | root help, exit 0 | Java aliases are tested and documented |
| root `version` | treated as command and rejected, exit 2 | version, exit 0 | Java alias is tested as an established entrypoint |
| recognized command followed by `--help` | root help, exit 0 | usage error, exit 2 (`unknown_option`) | Node resolves the control flag before command dispatch; Java validates it against the command allowlist |
| unknown command followed by `--help` | root help, exit 0 | unknown-command usage error, exit 2 | Neither runtime reads project inputs before this response |
| option placed before the command, e.g. `--in file ai detect-kind` | parsed as an option and command, then dispatched | first token is treated as the command; usage error, exit 2 | Java's CLI grammar requires the command first |
| `--version` after a command | version, exit 0 | usage error, exit 2 | Node resolves `--version` before legacy dispatch; Java recognizes the version control only as the first token |

Evidence: Node `scripts/miku-project-cli.mjs` (`main`) and `scripts/lib/cli-argv.mjs` (`parseArgs`); Java `MikuprojectCli.run`, `inspectInvocation`, `allowedOptions`, `isHelp`, and `isVersion`; Java tests `printsUsageForHelp`, `printsUsageForHelpAliases`, `printsVersion`, and `rejectsLegacyFlatCommands`. Published consumer examples use root help and command-first invocations; no inspected example requires options before the command or command-specific help.

### Options

| Option | Change | Compatibility effect |
| --- | --- | --- |
| A. Retain the current grammar and document the runtime-specific controls | No product code changes | Lowest risk; Java's tested aliases stay. Command-level help and pre-command options remain unavailable in Java. |
| B. Add help after recognized shared commands in Java | Java accepts `--help` after a shared command and returns help without reading input | Improves command discoverability; changes the existing `unknown_option` result for those invocations. Java-only commands need an explicit policy. |
| C. Align command/control grammar across both runtimes | Add command-specific help and option-position handling, then define alias/version behavior for Java and Node | Broadest CLI compatibility change; requires decisions about Java's tested `help`, `-h`, and `version` aliases and user scripts. |

### Recommendation and decision

Recommendation: **A, unless a concrete consumer requires command-specific help or options before the command.** Existing Java aliases have explicit tests/docs, while inspected examples are command-first. The issue requires differences to be classified; it does not by itself require every CLI grammar detail to be identical.

Decision: **未決定**. Decision maker/date: **未決定**. G-HELP remains closed. APPLY-01 cannot start until this section records an adopted option and affected command list.

## DEC-02 / G-PARENT — output parent-directory creation

Related row: B16. State: **proposal ready; maintainer decision pending before APPLY-02**.

### Observed behavior

| Case | Node shared CLI | Java shared CLI | Evidence and effect |
| --- | --- | --- | --- |
| Text/binary output with an existing parent | Writes the named file | Writes the named file; `createDirectories` on the existing parent is a no-op | Node `writeOutput` and Java `writeTextOutput` / `writeBinaryOutput` both write after command processing |
| Text/binary output with a missing parent | Fails; does not create the parent | Creates the parent path, then writes the file | Node's `mikuproject-cli-review-regressions.test.js` exercises `state summarize` and `export xlsx` with a missing parent and expects exit 1, empty stdout, and one error JSON. Java source calls `Files.createDirectories(parent)` for both paths; no Java missing-parent regression exists yet |
| Output target is an existing directory | `fs.writeFileSync` fails while writing a file to a directory | `Files.write` fails; Java `MikuprojectCliRegressionTest.emitsOnlyErrorDiagnosticsWhenTextAndBinaryOutputsTargetDirectories` covers text and binary and checks error-only diagnostics/input preservation | Java test run in LEG-J17's focused CLI suite did not fail this case; the Node target-directory result is source-derived rather than separately tested here |
| Output file already exists | Direct `fs.writeFileSync` overwrites it | `Files.write` uses the default create/truncate/write behavior and overwrites it | No inspected consumer example requires either behavior to be atomic; atomic replacement is not claimed |

Both runtimes write the artifact before emitting their command's success diagnostic. Checked-in README, docs, scripts, and test invocations did not show a consumer example that depends on creating a missing output parent. This is an absence of evidence, not proof that no external consumer relies on Java's behavior. `report dir` is a separate Java extension that writes a set of entries and is outside the shared single-file output contract.

### Options

| Option | Change | Compatibility effect |
| --- | --- | --- |
| A. Preserve the current runtime-specific behavior | No code change; document that Node requires an existing parent while Java creates it | Avoids changing either runtime while external consumer dependence is unknown; shared commands keep a filesystem difference |
| B. Make Java reject a missing parent | Remove parent creation from Java shared file writers and preserve Node's error behavior | Aligns the shared command with Node; may break Java scripts that currently rely on the convenience |
| C. Make Node create missing parents | Create parent directories in Node before writing and match Java | Aligns the shared command with Java; may create directories for misspelled paths and changes Node's existing failure contract |

Recommendation: **A until a concrete shared-command consumer requirement is identified.** The available repository evidence does not show external reliance either way, so convenience alone does not justify expanding Node's side effects. If a consumer requires a common contract, choose B or C explicitly and list the affected commands before changing either shared writer.

Decision: **未決定**. Decision maker/date: **未決定**. G-PARENT remains open. APPLY-02 cannot start until an option is explicitly adopted.

## DEC-03 / G-REPORT — Java report option combinations

Related row: B17. State: **awaiting maintainer decision**.

### Historical and current evidence

At Java commit `fa5f421`, report dispatch constructed `WbsMarkdownOptions`, `WbsExportOptions`, and `NativeSvgOptions` and passed them to reports without a per-command option allowlist. At `ae71a6a` the CLI added strict per-command validation; all six tuning options are absent from every current `report` allowlist, while the parsing helpers and report API calls remain. The `ae71a6a` commit message records upstream v1.1.1 follow-up and feature-difference documentation, but does not state that these Java tuning options were intentionally removed.

`docs/runtime-java-cli.md` names the six shared option spellings without a command matrix. `docs/remaining-migration-items.md` still says the options reach WBS Markdown/XLSX, SVG, report bundle, and report directory. Thus the documents conflict with the current allowlist. Existing tests exercise the report APIs directly; no current CLI test contains these six report option names.

### Option-to-command effects in the last inspected implementation before the allowlist

| Option | Reports where the value is passed into the output implementation | Values/default observed in source |
| --- | --- | --- |
| `--before`, `--after` | `report wbs-markdown`, `report wbs-xlsx`, `report all`, Java-only `report dir` | optional integer; unset by default |
| `--display-mode` | same four reports | `business` or `calendar`; unset selects the renderer's calendar-day default |
| `--progress-mode` | same four reports | `business` or `calendar`; unset selects the renderer's calendar-day default |
| `--holiday-dates` | `report wbs-markdown`, `report wbs-xlsx`, `report daily-svg`, `report weekly-svg`, `report monthly-calendar-svg`, `report all`, Java-only `report dir` | comma-separated dates; empty by default |
| `--label-mode` | `report daily-svg`, `report weekly-svg`, `report monthly-calendar-svg`, `report all`, Java-only `report dir` | `uid` and `wbs` alter labels; unset/other values use the default task name |

`report mermaid` does not receive any of these values. `--before`, `--after`, display/progress mode, and label mode have no identified effect on standalone daily/weekly/monthly SVG beyond the holiday/label combinations listed above. `report dir` and `report all` produce the combined outputs, so their supported set is the union of applicable report options. In the current CLI, all six names are rejected before these helpers execute.

Evidence paths: Java `MikuprojectCli.allowedOptions`, `runReportCommand`, `parseWbsMarkdownOptions`, `parseWbsXlsxOptions`, `parseSvgOptions`, `parseCalendarMode`; `WbsMarkdown`, `WbsXlsxExport`, and `WbsSvgRender`; commits `fa5f421` and `ae71a6a`; `docs/runtime-java-cli.md`; `docs/remaining-migration-items.md`; `WbsMarkdownTest`, `WbsXlsxTest`, `WbsSvgTest`, and `MikuprojectCliTest`.

### Options

| Option | Change | Compatibility effect |
| --- | --- | --- |
| A. Restore only the historically effective combinations above | Add the named options to the applicable Java report allowlists and add CLI regression tests for each effect and non-target rejection | Re-enables the documented Java extension; Node command surface remains unchanged. |
| B. Retire the CLI options and update all Java docs | Keep the current strict allowlist; document the API-only option support where it remains available | Keeps current rejection behavior, but changes the documented Java CLI contract and can break older scripts. |
| C. Accept all six options on every report command | Broaden every report allowlist | Preserves some permissive parsing, but would accept irrelevant combinations with no output effect. |

Recommendation: **A**, restricted to the exact effective combinations above. The previous parser and current documentation support a retained Java extension; the strict allowlist's addition has no recorded removal decision. Do not accept values on `report mermaid` or pretend that ignored values affect SVG output.

Decision: **未決定**. Decision maker/date: **未決定**. G-REPORT remains closed. APPLY-03 cannot start until the selected command/option matrix is explicitly adopted.

<a id="leg-j08-max-depth-upper-range"></a>

## LEG-J08 — `--max-depth` upper range

Related row: B10. State: **2026-10-23 adopted and implemented for the Node / Java CLI and MCP input boundary; direct core API remains unchanged**.

The existing lexical contract accepts strings of decimal digits as non-negative integers. Java's phase-detail API accepts `Integer`; Node converts the same string to JavaScript `Number`. In the focused observation, omitted, `0`, and `2` worked in Java; `-1`, `1.5`, and `abc` now return usage error `invalid_integer_option`. A 200-digit positive decimal was accepted by Node 20 and emitted as a finite numeric `max_depth` larger than `Integer.MAX_VALUE`; Java failed conversion with exit 1 / `command_error` because its current API is int-bounded.

### Consumer / API evidence

The local `mikuproject-mcp` tool schema (`packages/node/src/tools/registerTools.ts`) accepts `maxDepth` as an optional integer greater than or equal to zero, but declares no upper bound. Its runtime operation passes the value to the CLI (`packages/node/src/runtime/runtimeOperation.ts`). The inspected `mikuproject-skills` operation map documents `--max-depth` without specifying a maximum. This does not establish how external clients handle extreme values. Current Node parsing converts to a finite JavaScript `Number` and floors it; Java's public API uses `int`.

### Options

| Option | Change | Compatibility effect |
| --- | --- | --- |
| A. Bound both runtimes to Java's supported integer range | Reject values above `2147483647` in Node and Java as usage errors | Defines a clear shared bound but narrows Node's currently accepted inputs. |
| B. Widen Java's depth type end-to-end | Change the Java API and its depth comparisons to a wider numeric representation | Preserves more Node inputs, but still needs a precise shared numeric bound and rounding policy. |
| C. Preserve runtime-specific range behavior and document it | Keep Java `Integer` and Node `Number` behavior | Lowest immediate change; very large values remain a cross-runtime difference and Java currently reports overflow as processing error. |

The original recommendation below was written before the user selected a practical hierarchy limit. Its proposed `2,147,483,647` limit is superseded by the adopted value recorded next; it remains only as historical context.

Historical recommendation: cap the shared CLI at `2,147,483,647` and report larger values as usage errors. This proposal was not adopted.

### Adopted decision and implementation (2026-10-23)

The user selected **100** as a practical maximum for task nesting. Node CLI, Java CLI, and MCP `maxDepth` now accept integer values from 0 through 100 inclusive. Omitted depth keeps the existing unlimited behavior. Zero-padded decimal digits are accepted as their numeric value. Negative, fractional, exponential, signed, whitespace-padded, nonnumeric, over-100, and extremely long values are rejected before output as `invalid_integer_option` at the CLIs; MCP rejects out-of-range values at schema validation. The depth measures descendants from the selected root, not total tasks.

Node CLI full build/tests passed 374 tests. Java CLI boundary and current-Node parity cases passed as part of I137, and the full Java test-all run passed with 238 tests, 0 failures, 0 errors, and 14 opt-in skips. MCP schema/runtime boundary tests passed 3/3. See [I137 implementation plan and results](node-java-work-plan-v20261022/implementation-plan-v20261023.md). The direct Java core API and Node core API were not changed by this decision.

## DEC-04 / G-META — frozen output metadata for detect-kind and validate-patch

Related row: B13 / F-S4. State: **proposal ready; maintainer decision pending before APPLY-04**.

### Observed behavior

The Node compatibility test `tests/mikuproject-cli-compatibility-contract.test.js` (`keeps named file output and the legacy overwrite behavior`) pre-creates the `detect-kind --out` target, then verifies exit 0, empty stdout, replacement of the file with `patch_json\n`, and JSON diagnostics with `io.output.mode = stdout`. Its comment explicitly says the legacy diagnostics envelope does not reflect `--out` and keeps this observed behavior separate from the v1 result contract. This expectation is frozen; it is not treated as a mistaken test.

Node `scripts/lib/cli-ai-commands.mjs` builds `detect-kind` diagnostics with `output: null`; `validatePatchCommand` does the same for both successful and failed validation reports. The CLI's outer output writer still sends the primary artifact to the requested `--out` file. Therefore with a named output both commands write the artifact to the file while their Node metadata says stdout. Without `--out` or with `--out -`, the primary output is stdout and the metadata also says stdout.

Java `MikuprojectCli.buildIoDiagnostics` reads the parsed `out` option. `detect-kind` diagnostics and both `validate-patch` reports consequently say `file` and include the path for a named file, and say `stdout` when output is implicit or `-`. LEG-J14 reproduced the named-file case: detect-kind's stderr differed at `$.io.output`; validate-patch's file report differed at `$.io.output` and Java also included `context: "ai validate-patch"`. The primary artifacts otherwise matched for detect-kind; the validate-patch artifact difference also includes the documented `context` field.

### Consumer scope inspected

- Node CLI source and tests: `scripts/lib/cli-ai-commands.mjs`, `scripts/lib/cli-io.mjs`, `tests/mikuproject-cli-compatibility-contract.test.js`, and `tests/mikuproject-cli-review-regressions.test.js`.
- Java CLI source and parity tests: `MikuprojectCli.runAiCommand`, `writePatchValidationOutput`, `buildIoDiagnostics`, and `MikuprojectNodeParityTest`'s LEG-J14 success cases.
- MCP source: `/Users/igapyon/Documents/git/mikuproject-mcp/packages/node/src/runtime/runtimeOperation.ts`, `tools/registerTools.ts`, and `test/serverSmoke.test.ts`. `ai_detect_kind` and `ai_validate_patch` do not accept an output path and do not add `--out`; the registered tools pass raw stdout/stderr through and do not parse `io.output`.
- Skill source: `/Users/igapyon/Documents/git/mikuproject-skills/skills/igapyon-miku-project/references/workflow/patch-import.md`, `references/runtime/operations-map.md`, and `lib/backend-operations.mjs`. The documented validate-patch examples omit `--out`; the inspected operation mapping has no `io.output` consumer. The installed workflow reference under `/Users/igapyon/.codex/skills/igapyon-miku-project/references/workflow/patch-import.md` likewise invokes validation without a file output.

No inspected Skill or MCP consumer branches on `io.output`, and the actual MCP operations cannot request the named-file case. This is limited to the listed local repository/reference paths; it does not establish that no external CLI consumer reads the field.

### Options

| Option | Change | Compatibility effect |
| --- | --- | --- |
| A. Make Java reproduce Node's frozen metadata | For detect-kind and validate-patch, report `stdout` even when the primary artifact is written to a file | Produces matching legacy JSON but makes Java metadata describe a different destination from the one actually used. |
| B. Preserve Java's actual-destination metadata and document the Node exception | No runtime change; record that Node freezes `stdout` for these two command diagnostics while Java reports the actual destination | Preserves both current contracts and accurate Java destination metadata; parity remains intentionally different for named-file invocations. |

Recommendation: **B**. The known consumers use stdout for these commands and do not inspect `io.output`; the named-file metadata discrepancy is an observable legacy exception in Node, while Java currently reports the actual writer destination. Revisit if a concrete shared-command consumer requires byte-identical metadata. This recommendation does not adopt the option.

Decision: **未決定**. Decision maker/date: **未決定**. G-META remains open. APPLY-04 cannot start until a maintainer adopts A or B and confirms the affected command scope.

## DEC-10 / G-XML — legacy XML field decisions

Related row: D08 / F-S3. State: **inventory and decision proposals ready; field-level maintainer decisions pending before APPLY-05**. The detailed tag/model/read/write/test map is in [the XML field inventory](node-java-137-xml-field-inventory.md).

### Scope and history reviewed

This decision applies to the current **legacy ProjectModel XML codecs**. It does not extend or revise `miku-project-ms-project-xml-subset/v1`. The v1 [format and loss contract](miku-project-format-and-loss-contract-v1.md) is a separately approved, strict supported subset with `unsupported-error` behavior; its guarantees and rejection rules must not be silently imported into legacy.

The Node codec was extracted into `msproject-codec.ts` as part of refactor commit `c1d5c17` (2026-04-16). Java model/codec history starts at `5f32601` (2026-04-19), followed by XML codec/validation expansion at `0ac4b4e`, additional model/validation work at `e3a2bbb`, and validator refactoring at `64002e0`. These messages describe first-cut migration and expansion; none of the reviewed commit subjects or checked-in legacy docs says the observed unset/default, forward-reference, or unknown-tag behavior was an intentional removal policy. No XML-specific changelog entry was found in the inspected repository. This is missing intent evidence, not proof of a defect.

### Field-difference classification and proposals

| Difference / fields | Current impact | Classification | Options and proposal | Acceptance fixture if adopted |
| --- | --- | --- | --- | --- |
| Modeled Project, Task, Resource, Assignment, and Calendar fields listed in the inventory | Every currently modeled field has a read/write path in both codecs. Java-native workbook columns do not indicate XML-only support; Node XML maps those tags too. | **Equivalent XML field coverage** | No XML implementation is proposed. Keep the workbook projection/XLSX extension decision in D02/D03/B25. | Existing Project metadata, Task detail/cost/variance, Resource/Assignment, Calendar, hierarchy, and dependency fixtures remain the mapping basis. |
| Missing-value representation across optional scalar fields | Node commonly uses `undefined`; Java text fields commonly use `""`, optional numeric/boolean fields use null. XML writers omit these empty/unset forms. The in-memory/workbook projection can still expose a different shape. | **Difference retained** pending a concrete consumer needing a common object shape | Preserve current behavior. A future shared object contract would need to name the fields and decide absent versus empty/null; do not normalize all model fields as a side effect of XML work. | For any adopted field, test absent, explicit empty, and populated XML, then test re-export and the relevant downstream projection separately. |
| `Task/OutlineLevel` when omitted | Node reads `1` and writes it; Java leaves the nullable field unset and omits the tag. | **Specification decision**, G-XML: `Task/OutlineLevel` | A: Java adopts Node's default; B: Node preserves omission like Java; C: retain the runtime difference. **Proposal C** until a consumer requires a shared omitted-field meaning; changing either side changes observed output. | One Task with OutlineLevel absent, explicit `1`, and a non-default value; compare parsed model and re-export independently. |
| `Task/PercentComplete` when omitted | Node reads `0` and writes it; Java leaves the nullable field unset and omits the tag. | **Specification decision**, G-XML: `Task/PercentComplete` | A: Java adopts Node's default; B: Node preserves omission; C: retain the runtime difference. **Proposal C** pending a consumer requirement; do not conflate absent with explicit zero without an adopted rule. | One Task with the tag absent, `0`, and a non-zero value; assert the selected absent/explicit-zero semantics and re-export. |
| `PredecessorLink/Type` when omitted | Node reads `0` and writes it; Java leaves the nullable Type unset and omits it. | **Specification decision**, G-XML: `PredecessorLink/Type` | A: Java adopts Node's default; B: Node preserves omission; C: retain the runtime difference. **Proposal C** until type omission has an explicit shared meaning. | One predecessor link with Type absent and with explicit Type `0`; verify parsed state and output. |
| `Resource/Type` when omitted | Node reads `0`; Java leaves nullable Type unset. XML output differs on re-export. | **Specification decision**, G-XML: `Resource/Type` | A: Java adopts Node's default; B: Node preserves omission; C: retain the runtime difference. **Proposal C** pending a shared type/default requirement. Keep material/work/cost type semantics separate from workbook columns. | One Resource with Type absent, `0`, `1`, and a supported explicit type; assert the selected model/output behavior. |
| `Calendar/WeekDays/WeekDay/DayType` when omitted | Node reads `0`; Java leaves nullable DayType unset. | **Specification decision**, G-XML: `Calendar/WeekDays/WeekDay/DayType` | A: Java adopts Node's default; B: Node preserves omission; C: retain the runtime difference. **Proposal C** until the missing DayType meaning is specified. | One WeekDay with DayType absent and explicit boundary values; verify model/output and that list order is preserved. |
| Integer-like and decimal XML numerics across the five domains | Node `Number` accepts finite fractions and large values; Java uses `Integer` for integer fields and `Double` for decimal fields. Numeric XML text can also serialize with runtime-specific spelling. No shared range/precision rule was found. | **Difference retained** for current legacy interfaces; tag-specific future decision if required | Do not add a blanket parser conversion. If parity is required for a named tag, first choose schema-valid lexical forms, bounds, precision, and error/fallback behavior for that field. | Per-tag valid integer/decimal, boundary, fractional integer-like value, and out-of-range fixture; compare parsed meaning separately from XML bytes. |
| `Task/PredecessorLink/PredecessorUID` validation order | Node collects all Task UIDs before link validation. Java validates each Task's links while still constructing the UID set, so a forward reference to a later Task can be reported missing. | **Implementation candidate**, G-XML: `Task/PredecessorLink/PredecessorUID` | Adopt a two-pass Java validator: collect all Task UIDs, then validate links. Keep unknown UID rejection. This fixes list-order-dependent reference resolution without rewriting the XML reader or reordering Tasks. | Two Tasks where an earlier XML item refers to a later UID must validate; replacing that UID with an unknown UID must still fail. Preserve task and link order. |
| Unmodeled/unknown child elements and attributes in Project/Task/Resource/Assignment/Calendar | Both fixed models/codecs ignore fields outside their mapped model and do not retain opaque XML. Full-schema round-trip is not provided. No legacy statement clearly labels every omitted field intentionally unsupported. | **Specification decision**, G-XML: `unmodeled XML elements` | A: reject/warn on detected unknown data; B: document the legacy codecs as a mapped, lossy subset and keep current drop behavior; C: add opaque preservation. **Proposal B**: no generic extension container or known consumer requirement supports C, while A changes legacy acceptance. The v1 strict rejection rule remains separate. | One unknown direct child and one unknown nested extension for each domain; assert the adopted warning/rejection/drop behavior and confirm modeled siblings remain intact. |
| Calendar collection lookup and default-calendar edge paths | For valid direct-child structure, both preserve order and references. Node selects descendant containers; Java selects direct children. Default-calendar date fallback uses JS `Date` versus Java `LocalDate`; invalid bounds and whitespace-only direct-model times were not covered. | **Difference retained** for current legacy paths; edge contract remains open only if these inputs become supported requirements | Keep the current valid-input mapping. Do not normalize date/time behavior speculatively. If malformed/nested or invalid-date input is to be supported, define a profile and add a dedicated fixture first. | A valid direct-child calendar stays covered by existing fixtures. Any broader claim needs nested duplicate containers, invalid leap/day, timezone boundary, and whitespace-time fixtures. |
| XML artifact bytes for the LEG-J16 hierarchy fixture | Node and Java XML bytes differed; both artifacts parsed through Java to the same common workbook projection for that fixture. The exact first byte/value difference was not isolated. | **Byte difference retained**; semantic scope remains fixture-limited | No byte-identical XML requirement is adopted. Compare modeled meaning on import; do not infer complete semantic equivalence from one fixture. Isolate the first differing path before making a broader parity claim. | Existing LEG-J16 semantic re-import comparison plus a per-domain field fixture for any later adopted implementation. |

### Proposed decision set and Gate

Recommended path: keep the current mapped XML field set and runtime representation differences; record unknown legacy XML as a documented lossy limitation; prepare the one-field Java forward-reference candidate; require field-specific maintainer adoption before each APPLY-05 work key. No current row authorizes a broad XML migration, opaque preservation, or v1 contract reuse.

Decision: **未決定**. Decision maker/date: **未決定**. G-XML remains open for `Task/OutlineLevel`, `Task/PercentComplete`, `PredecessorLink/Type`, `Resource/Type`, `Calendar/WeekDays/WeekDay/DayType`, and unknown legacy XML policy. The forward-reference candidate also requires adoption before APPLY-05. APPLY-05 may start only for a specific adopted field and its fixture; the remaining XML fields stay outside that change.

## Execution finding / B23 — AI projection optional task fields

Related rows: B22, B23, B19; follow-up candidate F-S5. State: **仕様未決定**. This was discovered while executing LEG-J14 and is not one of the original 75 cards.

### Observed behavior

On the same generated `STATE.json`, Node and Java both completed the nine AI command success cases with exit 0 and empty stdout. `ai export task-edit` (auto and explicit UID) and the task views in `ai export bundle` differ semantically for an unset task: Node omits `target_task.notes` and emits `calendar_uid: null`; Java emits `notes: ""` and `calendar_uid: ""`. The full `phase-detail` and `project-overview` values otherwise matched semantically, with integer-valued `*_hours` serialized as `8` / `24` by Node and `8.0` / `24.0` by Java. `bundle` combines both types of difference.

The spec describes projection fields as values that “may” be included and does not define a rule for omitted, null, or empty-string values. This matters because AI consumers may treat those as different instructions. The number formatting difference is lexical only for the observed equal numeric values. LEG-J14's machine-readable expected-difference list is in [its result](../workplace/node-java-137/LEG-J14/result.md).

### Patch input is a separate, existing contract

The Node AI JSON spec's `update_task.notes` and `update_task.calendar_uid` rules (lines 474–476) say empty string clears the field and an unknown calendar UID is warned and ignored. Node patch code leaves omitted fields unchanged and warns on supplied non-string values, including JSON null. These input semantics do not define how an AI projection serializes an unset field.

RPF-04 confirmed that the Java baseline had no `update_task` dispatch or task-update method. I137 subsequently added the dispatch and nine fields in a separate patch-input implementation. A 2026-10-23 follow-up added both progress fields to Node and Java: each accepts integer values from 0 through 100, while fractional, nonnumeric, and out-of-range values warn and preserve the existing value. Supplied task dates use the existing Java helper and retain a documented parser difference. These implementation results do not define projection output shape. The decision in this section remains about projection output and remains undecided.

R2F-03 D07 directly exercised baseline `state apply-patch`: Node updated UID `1` name to `REVIEW-UPDATED` with no warning; Java retained `First`, returned exit 0 with one unsupported-op warning. I137 added the dispatch and nine fields; the 2026-10-23 follow-up added integer 0–100 handling for both progress fields. F-J6 remains **partially implemented** because Java's date-parser behavior still differs. Supported fields, warnings, milestone behavior, and date-parser differences are summarized in the implementation plan. This patch-input work does not change the F-S5 projection decision.

### Consumer evidence inspected for REM-09

The local MCP implementation uses `ai export task-edit`, returns the generated projection artifact and raw runtime stdout, and does not normalize the JSON values (`mikuproject-mcp/packages/node/src/runtime/runtimeOperation.ts`, `packages/node/src/tools/registerTools.ts`). The `mikuproject-skills` operation map and agent-to-agent runner describe task-edit as a local task-revision input, but the inspected references do not define absent/null/empty handling for `notes` or `calendar_uid`. No external consumer was inspected. This supports a narrow field decision; it does not prove that downstream clients are independent of the exact shape.

### Options

| Option | Change | Compatibility effect |
| --- | --- | --- |
| A. Define a shared representation for unset fields | Specify which fields are omitted, nullable, or empty, then align Node and Java | Removes ambiguity for AI consumers but may change existing JSON projections and prompts. |
| B. Preserve each runtime's current representation as an explicit legacy exception | Document the Node/Java shape differences and require consumers to handle both | Avoids output changes but keeps a semantic difference in the shared projection surface. |
| C. Define only the fields that affect AI edits | Review `notes` and `calendar_uid` consumers and specify only edit-relevant unset semantics | Limits contract change, but the remaining output shape is still runtime-specific. |

Recommendation: **C**, after checking the actual Skills/MCP consumers and existing prompt examples. If no consumer depends on exact shape, record B as the compatibility outcome. Do not infer a rule from one serializer or rewrite the frozen output comparison to hide this difference.

Decision: **未決定**. Decision maker/date: **未決定**. F-S5 projection output has not been adopted or changed. Java `update_task` patch input is tracked separately as F-J6 and is partially implemented under I137.

## Execution finding / B24 — state command date-only and blank cell values

Related rows: C08-C11, B24; follow-up candidate F-S6. State: **日時変換・表記の変更は後続Issue #138へ延期。null / empty cell policy remains undecided.** This was discovered while executing LEG-J15 and is not one of the original 75 cards. [Issue #138](https://github.com/igapyon/miku-project/issues/138) tracks the date/time precision, time-completion, and datetime-separator differences for later review.

### Observed behavior

The `PROJECT_DRAFT.json` fixture produced byte-identical workbook JSON through `state from-draft` on Node and Java. On that same state, `state summarize` reported project start and finish and the milestone date as `2026-04-01` in Node, and `2026-04-01T09:00:00` / `2026-04-01T18:00:00` in Java. `state apply-patch` with the same `PATCH_OK.json` also produced semantic differences: Java emitted those date-time values in workbook cells where Node retained date-only strings, and Java wrote empty strings in some cells where Node retained null. The test then compared the before/after states with `state diff`; its primary JSON bytes and diagnostics matched exactly. The draft, patch, and state inputs remained byte-identical after the commands.

RPF-05 clarified the cited AI JSON spec's scope: planned dates may be supplied during draft generation for normal tasks, summary tasks, and milestones. The 09:00/18:00 completion example is for a normal task only; it is not applied when `is_milestone=true`. The summary-task date allowance does not establish a general summary-task time default. This draft-generation text does not set a rule for Project fields or existing workbook imports. The LEG-J15 fixture observation above does not show that every one of these task types was exercised and does not decide the shared date-precision policy.

The focused evidence is in [LEG-J15 result](../workplace/node-java-137/LEG-J15/result.md). This observation does not by itself establish whether the Java times are intended schedule defaults or an unwanted loss of date-only precision.

LEG-J16 extended the observation to a hierarchy workbook: `export workbook-json` and `import xlsx` formatted equal local datetime values with a space in Node and `T` in Java. The same commands also reproduced null versus empty Project cells. The XML artifacts were byte-different, but importing both through the Java XML reader and comparing the resulting shared workbook projection yielded no semantic differences for this fixture.

### Consumer evidence inspected for REM-10

The local `mikuproject-skills` fixtures and prompts contain date-only examples for `planned_start` / `planned_finish` (including `tests/miku-project-core-api-smoke.test.js` and `skills/igapyon-miku-project/references/prompts/new-wbs-draft.md`). The local MCP manual-check document also uses date-only workbook values. These examples establish that date-only values occur in supported workflows; they do not define whether Java's 09:00 / 18:00 enrichment is intentional or whether all consumers equate null and empty cells. Downstream consumer behavior remains partly unknown.

### Options

| Option | Change | Compatibility effect |
| --- | --- | --- |
| A. Preserve date-only values, local datetime lexical form, and null cells through Java shared CLI paths | Keep the workbook interchange representation when summarizing, exporting, importing, and applying a patch | Aligns observed common JSON values but could discard intentional Java model schedule times. |
| B. Normalize Node to Java's 09:00/18:00 schedule values, `T` separator, and empty-cell conventions | Define the Java output as the shared representation | Changes Node's existing CLI output and requires proof those defaults are part of the legacy contract. |
| C. Preserve runtime-specific transformations and document them | Leave both outputs unchanged | Avoids migration risk but consumers must handle semantic differences by runtime. |

Recommendation: **defer date/time behavior changes to Issue #138** until legacy date semantics and downstream consumers are inspected. In particular, determine whether `planned_start` / `planned_finish` are calendar dates or schedule instants for this shared JSON surface. Do not infer intent from `from-draft` byte parity alone. The separate null-to-empty cell question remains in this decision record and is not covered by Issue #138.

Decision: **日時変換・日時表記の変更は後回し**。現行Node / Javaの動作を当面維持し、Javaの09:00 / 18:00補完やspace / `T`区切りを共通仕様として採択したことにはしない。後続検討先は[Issue #138](https://github.com/igapyon/miku-project/issues/138)。null / empty cellの扱いは**未決定**のまま。No production code changed in LEG-J15.

### R2F-03 route-scoped observations and option split

R2F-03 adds 22 fresh Node/Java cases, including an empty patch, an unrelated `update_project`, the unsupported Java `update_task`, and independent null / empty / omitted workbook fields. The [R2F-03 evidence](node-java-137-review-evidence-v20261022.md#r2f-03) records raw outputs and diagnostics. No case changes the original state or patch.

For the observed `state apply-patch` route, Java converts Project and Task date-only values before patch dispatch: Project and Task start become `2026-04-01T09:00:00`, finish becomes `2026-04-01T18:00:00`, including summary and milestone rows. Node preserves `2026-04-01`. Explicit local datetimes serialize with a space in Node output and `T` in Java output. In D07, Java does not call an `update_task` date setter; its warning and unchanged task name are operation-dispatch evidence. These are fixture-scoped current observations, not desired expectations.

| Affected route/entity | Input field / type | A: preserve incoming precision and null | B: align Node output to observed Java form | C: preserve current runtime behavior | Selection |
| --- | --- | --- | --- | --- | --- |
| `state apply-patch` Project | StartDate / FinishDate, date-only | Java retains date-only strings | Node emits start 09:00 / finish 18:00 | Keep Node date-only and Java time enrichment | 変更を後回し（Issue #138） |
| `state apply-patch` Task, normal | Start / Finish, date-only | Java retains date-only strings | Node emits start 09:00 / finish 18:00 | Keep Node date-only and Java time enrichment | 変更を後回し（Issue #138） |
| `state apply-patch` Task, summary | Start / Finish, date-only | Java retains date-only strings | Node emits Java's observed 09:00 / 18:00 | Keep runtime outputs as observed; do not derive a summary default from draft spec | 変更を後回し（Issue #138） |
| `state apply-patch` Task, milestone | Start / Finish, date-only | Java retains date-only strings | Node emits Java's observed 09:00 / 18:00 | Keep runtime outputs as observed; draft-generation milestone exclusion does not settle import behavior | 変更を後回し（Issue #138） |
| `state apply-patch` Project and Task | explicit local datetime, space / `T` | Retain supplied lexical form through export | Standardize output on one separator | Keep Node space / Java `T` output | 変更を後回し（Issue #138） |
| workbook import/export Project | Title / Author, null / empty / omitted | Keep null and distinguish absent where representable | Use Java empty-string output | Keep Node null / Java empty-string output | 未決定 |
| workbook import/export Calendar | UID 1 BaseCalendarUID, null / empty / omitted | Keep null and distinguish absent where representable | Use Java empty-string output | Keep Node null / Java empty-string output | 未決定 |
| workbook import/export Task | Notes / CalendarUID, null / empty / omitted | Define whether explicit empty and omitted remain distinct | Normalize all three states to an adopted value | Keep observed null output for this fixture on both runtimes | 未決定 |
| patch dispatch | Task dates with omitted patch keys | Keep omitted setter fields unchanged, while documenting import-side changes | Treat exported output as full-route contract | Separate import conversion from patch-setter no-op | 未決定（Issue #138とは別） |

The draft-generation AI-spec rule remains scoped to normal-task date completion; the permitted dates for summary/milestone tasks do not establish a default for workbook imports. Java `normalizeDateTime` runs while Project/Task rows are imported; Task start/finish are processed before the milestone flag. Node `normalizeDateTimeInput` and the XLSX workbook export display formatter explain its observed lexical handling, but intermediate model values were not directly measured. Date/time transformation and separator changes are deferred to [Issue #138](https://github.com/igapyon/miku-project/issues/138); this is not adoption of either runtime's behavior as the shared contract. Null / empty cells and omitted patch fields remain undecided.
