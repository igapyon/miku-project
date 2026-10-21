# CLI command review fixes — 2026-10-21

## Baseline and purpose

The review baseline is commit `2f24dd31642b8dddfb55e1874d4b00aa83af1fa1`.
At planning time, `package.json` and the root entries in `package-lock.json`
already contained an uncommitted version increment from `1.1.0` to `1.1.1`.
That version increment was preserved. The user subsequently requested and
authorized implementation in this checkout. This document records the
implementation decisions, acceptance criteria, and completed verification.

The five reviewed defects are: incomplete state comparison reported as noop,
ignored unknown options, discarded import warnings, success diagnostics emitted
before a failed output write, and v1 command help dispatched as a workflow.

## 1. Compare workbook documents in the product core

- Add `workbookJson.diffDocuments(before, after)` through
  `src/ts/project-workbook-json.ts` and `src/ts/core-api-workbook.ts`.
- The comparison reads the workbook representation directly. Keep the existing
  partial-update semantics of `importIntoProjectModel` for its merge callers.
- Compare Project rows by `Field`; Tasks, Resources, Assignments and Calendars
  by `UID`; NonWorkingDays by the tuple `(CalendarUID, Index)`.
- Reject missing or duplicate row identities and non-scalar known cell values.
- Treat fully blank exporter placeholder rows as empty. A row with meaningful
  data and no identity remains an error.
- Compare every known column, including fields that merge import does not edit.
  Missing cells and JSON null are equivalent; `0`, `false`, and the empty
  string are distinct from null. Preserve other scalar types.
- Compare the order of surviving Tasks. Insertions/deletions alone do not
  classify every following task as moved. Treat the remaining sheets as keyed
  sets; their row order and Project field order are irrelevant.
- Preserve both input documents and produce deterministic changes in schema
  sheet/column order and input row order.
- Propagate unknown-sheet/column warnings, marked `before` or `after`. Unknown
  Project field names also produce a warning. Set `comparison_complete: false`
  when data is outside the comparison's known schema.

Keep `kind: state_diff_summary`, `warnings`, `changes_summary`, and
`changed_items`. Add `comparison_complete`. Each change retains `uid`, `label`,
`field`, `before`, and `after`, with additive `change_type`, `sheet`, and
`row_key` metadata:

| change_type | field | before / after |
| --- | --- | --- |
| `field-updated` | existing workbook field name | scalar or null |
| `row-added` | `$row` | null / known-column row snapshot |
| `row-removed` | `$row` | known-column row snapshot / null |
| `order-changed` | `$position` | indices among surviving tasks |

Row changes also expose `before_position` and `after_position`, using null for
the absent side. NonWorkingDays changes use the calendar UID for the existing
`calendars` scope and a tuple-encoded `row_key` to distinguish exception rows.
`total_changes` counts these events; `affected_items` counts distinct UIDs per
scope. An incomplete comparison has warning status, including when its known
field change count is zero. A complete unchanged comparison remains noop.

Acceptance: additions/deletions in all five tabular sheets, task order,
non-merge fields, Project changes, scalar distinctions, unknown data, duplicate
keys, and input immutability are tested. Existing project Name/Title comparison
and summary fields remain compatible.

## 2. Validate command and option names before opening input

Add `scripts/lib/cli-command-specs.mjs` with an exact command-to-option registry.
Call it from the source entrypoint after existing help/version handling and
before core loading. Use the same module in the standalone CLI bundle.

- Accept documented options and the existing common text `--out` capability.
- Reject unknown options and options belonging to another command with
  `CliUsageError`, `error_code: unknown_option`, and exit code 2.
- Resolve the command before loading input; `report typo` must not wait on
  stdin or return an unrelated ENOENT.
- Validate binary input/output option conflicts before reading domain data.
- Preserve repeated-option last-value behavior, existing legacy help/version,
  and the compatibility test for invalid diagnostics preceding an unknown
  import command. Keep the v1 grammar separate.
- Reject `--task_uid 3` and `--dry-run true`; neither spelling gains a new
  implicit meaning.

Acceptance: a rejected invocation produces no primary output and leaves the
input/output fixture unchanged, including when both paths name the same file.

## 3. Carry import warnings to command diagnostics

Replace the CLI model-only loading helper with `loadWorkbookInput`, returning
the core `{ model, warnings }` result. Update AI projection, summary, report,
and export callers. Preserve warnings from direct workbook imports as well.

Use a common `buildResultDiagnostics` helper: JSON diagnostics include warning
items/count and warning status; text diagnostics emit warning lines only when
there are warnings. Normal warning-free primary output remains unchanged.
Combine base-workbook warnings with patch warnings for both validation and
application. Keep warnings as nonfatal partial-success information (exit 0).

Acceptance: unknown sheet and column warnings reach stderr in both formats for
representative command families. Validation and application report the same
combined warnings. This change propagates existing warnings; it does not claim
to validate every possible lossy conversion in the legacy core.

## 4. Emit success only after primary file output succeeds

In `scripts/miku-project-cli.mjs`, call `writeOutput` before emitting command
diagnostics. A synchronous file write failure reaches the existing error
handler before any success envelope is emitted.

Acceptance: missing-parent output failures for text and binary commands emit
one parseable error JSON with exit code 1 and empty stdout. Preserve the
documented legacy overwrite policy and known legacy diagnostics metadata
contracts. Stream transport redesign is outside this reviewed failure case.

## 5. Handle v1 help and version as control operations

Add `scripts/lib/v1/cli-v1-presentation.mjs`; use command specs for the help
option list. Add shared control dispatch in the v1 router and source entrypoint.

- Versioned runtime root help describes the five v1 workflows. Root version
  returns the embedded runtime version. Each `<command> --help` succeeds.
- Source/development CLI root help stays the legacy help; exact v1 command
  help is available as metadata even when v1 workflows remain unavailable.
- Help/version read no domain input, reserve no result file, and do not require
  runtime asset verification. Their text does not attest runtime integrity.
- Workflow execution retains manifest verification and source/development
  fail-closed behavior. Mixed help/workflow invocations retain existing v1
  grammar errors.
- Register the new presentation module and exports in the bundle builder.

Acceptance: direct router tests deny filesystem access for controls; a freshly
built temporary versioned bundle supports root and all command help even with
its manifest removed, while a workflow on that bundle still fails verification.
Keep the retained v1.0.3 candidate and its immutable lock unchanged.

## Implementation and verification order

1. Install dependencies with `npm ci` so tests use the lockfile's Vitest 4.
2. Implement registry/diagnostics changes, then workbook comparison and v1 help.
3. Regenerate tracked core JavaScript with `npm run build:core`.
4. Run focused core/CLI/control regression tests; repair failures before broader
   validation. New test files must be assigned in
   `scripts/lib/test-suite-topology.mjs` and its topology contract.
5. Run `npm run build:full`, covering core, browser runtime, standalone CLI,
   complete regression, outside-checkout bundle smoke, and temporary v1 builds.
6. Run `git diff --check`, inspect the final diff and status, and record results.

Relevant tests are `mikuproject-workbook-diff.test.js`,
`mikuproject-cli-review-regressions.test.js`, existing legacy argv/I/O/diagnostics
and compatibility tests, and v1 argv/I/O and runtime-manifest tests. Test
fixtures must be self-contained temporary data, not depend on review-session
files under `/tmp`, and not require a new tag or published Release.

## Implementation record

Implemented in this checkout:

- Added `workbookJson.diffDocuments` and routed `state diff` through it. The
  comparison covers all known workbook columns, task ordering, structural row
  changes, duplicate/missing identities, unknown data warnings, and blank
  exporter placeholder rows.
- Added early command/option validation and rejected prototype-shaped option
  names safely.
- Preserved workbook import warnings across text and JSON diagnostics for
  projection, summary, report, exchange, and patch commands.
- Moved successful diagnostics after primary output writing so a failed file
  write emits only the error report.
- Added v1 root/command help and version control handling without runtime asset
  or domain input access; workflow manifest verification remains in place.
- Updated CLI contracts and migration notes. The pre-existing `1.1.1` version
  increment remains intact.

Verification on 2026-10-21:

- `npm ci --no-audit --no-fund` installed the lockfile versions, including
  Vitest 4.1.12.
- Focused regression run: 3 test files, 48 tests passed.
- `npm run build:full`: core, browser runtime, and standalone CLI bundles built;
  full suite passed with 32 test files and 360 tests.
- `git diff --check` passed.

## Compatibility and migration

Existing documented successful invocations retain their command names, output
destinations, and exit codes. Three intentional corrections affect callers:

- Formerly ignored unknown/inapplicable options now fail with exit 2; remove
  the option or use the documented spelling. No dry-run flag is introduced.
- Previously discarded warnings now appear on stderr. JSON consumers should
  read the final diagnostic envelope and inspect its status/counts.
- `state diff` now compares full known workbook state rather than editable
  merge fields. Consumers must accept structural events, null/object row
  values, and the additive comparison-completeness field. Consumers requiring
  equality must check both completeness and a zero change count.

Document these corrections with the regression tests; do not silently alter
the established merge importer or the unrelated frozen legacy metadata.
