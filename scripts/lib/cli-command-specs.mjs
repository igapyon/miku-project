import { CliUsageError } from "./cli-errors.mjs";
import { parseDiagnosticsFormat } from "./cli-diagnostics.mjs";
import { ensureBinaryInputSource, ensureBinaryOutputTarget } from "./cli-io.mjs";

const LEGACY_TEXT_OPTIONS = ["in", "out", "diagnostics"];
const LEGACY_BINARY_OPTIONS = [...LEGACY_TEXT_OPTIONS, "out-base64"];

const LEGACY_COMMAND_OPTIONS = new Map([
  ["ai spec", ["out"]],
  ["ai detect-kind", LEGACY_TEXT_OPTIONS],
  ["ai export project-overview", LEGACY_TEXT_OPTIONS],
  ["ai export task-edit", [...LEGACY_TEXT_OPTIONS, "task-uid", "select"]],
  ["ai export phase-detail", [...LEGACY_TEXT_OPTIONS, "phase-uid", "select", "mode", "root-task-uid", "max-depth"]],
  ["ai export bundle", LEGACY_TEXT_OPTIONS],
  ["ai validate-patch", [...LEGACY_TEXT_OPTIONS, "state"]],
  ["state from-draft", ["in", "out"]],
  ["state summarize", LEGACY_TEXT_OPTIONS],
  ["state diff", ["before", "after", "out", "diagnostics"]],
  ["state apply-patch", [...LEGACY_TEXT_OPTIONS, "state"]],
  ["import xlsx", [...LEGACY_TEXT_OPTIONS, "in-base64"]],
  ["export workbook-json", LEGACY_TEXT_OPTIONS],
  ["export xml", LEGACY_TEXT_OPTIONS],
  ["export xlsx", LEGACY_BINARY_OPTIONS],
  ["report wbs-xlsx", LEGACY_BINARY_OPTIONS],
  ["report daily-svg", LEGACY_TEXT_OPTIONS],
  ["report weekly-svg", LEGACY_TEXT_OPTIONS],
  ["report monthly-calendar-svg", LEGACY_BINARY_OPTIONS],
  ["report all", LEGACY_BINARY_OPTIONS],
  ["report wbs-markdown", LEGACY_TEXT_OPTIONS],
  ["report mermaid", LEGACY_TEXT_OPTIONS]
]);

export function validateLegacyInvocation(command, options) {
  // Preserve the existing invalid-diagnostics precedence, including for an
  // unknown command, before dispatching or opening any domain input.
  parseDiagnosticsFormat(options.diagnostics);
  const commandName = command.join(" ");
  const allowed = LEGACY_COMMAND_OPTIONS.get(commandName);
  if (!allowed) {
    if (command[0] === "ai" && command[1] === "export" && command.length <= 3) {
      throw new CliUsageError(`未対応の ai export コマンドです: ${command[2] || "(missing)"}`, "unsupported_ai_export_command");
    }
    throw new CliUsageError(`未対応のコマンドです: ${commandName}`, "unsupported_command");
  }
  for (const key of Object.keys(options)) {
    if (!allowed.includes(key)) {
      throw new CliUsageError(`${commandName} では --${key} を使えません`, "unknown_option", {
        command: commandName,
        option: `--${key}`,
        allowed_options: allowed.map((name) => `--${name}`)
      });
    }
  }
  if (commandName === "import xlsx") {
    ensureBinaryInputSource(options, commandName);
  }
  if (allowed.includes("out-base64")) {
    ensureBinaryOutputTarget(options, commandName);
  }
}
