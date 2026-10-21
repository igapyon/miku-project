import { getV1CommandSpec, V1_WORKFLOW_COMMANDS } from "./cli-v1-argv.mjs";

const V1_USAGE_LINES = Object.freeze({
  inspect: "inspect --project <path|-> --purpose <project_overview|task_change_context> [--task-uid <uid>] [--result <path|->]",
  validate: "validate --project <path|-> [--result <path|->]",
  "plan-change": "plan-change --project <path|-> --request <path|-> --destination <new-directory> [--result <path|->]",
  "apply-change": "apply-change --project <path|-> --request <path|-> --plan-result <path|-> --approval <path|-> [--result <path|->]",
  "verify-artifact": "verify-artifact --artifact-set <directory> [--expect-plan-result <path|->] [--result <path|->]"
});

export function writeV1Control(invocation, { version, stdout }) {
  if (invocation.control === "version") {
    stdout.write(`miku-project ${version || "unknown"}\n`);
    return { exit_code: 0 };
  }
  const commands = invocation.command ? [invocation.command] : V1_WORKFLOW_COMMANDS;
  const lines = [
    "miku-project - v1 project inspection and approved artifact workflows",
    "",
    "Usage:",
    ...commands.map((command) => `  miku-project ${V1_USAGE_LINES[command]}`),
    "  miku-project <command> --help",
    "  miku-project --version"
  ];
  if (invocation.command) {
    const spec = getV1CommandSpec(invocation.command);
    lines.push("", "Options:", ...spec.allowed.map((option) =>
      `  --${option} <value>${spec.required.includes(option) ? " (required)" : ""}`
    ));
    lines.push("", `Effect: ${spec.sideEffectClass}`);
  }
  lines.push(
    "",
    "Inputs:",
    "  Paths resolve from the current working directory. Stdin must be explicit (-); at most one input may use it.",
    "  --project accepts external XML files, committed artifact set directories, or UTF-8 XML on stdin.",
    "  --request, --plan-result, --approval, and --expect-plan-result accept one JSON document.",
    "  inspect --purpose task_change_context requires --task-uid; project_overview forbids it.",
    "",
    "Outputs:",
    "  Workflows return one miku_project_cli_result/v1 JSON document; --result defaults to stdout (-).",
    "  --result <path> exclusively creates a new file and refuses an existing entry.",
    "  plan-change reserves no project output; apply-change requires approval bound to the saved plan.",
    "  Project output is a new artifact set directory; inputs and existing output files are preserved.",
    "",
    "Exit codes:",
    "  0 success; 1 rejected or incomplete workflow; 2 invalid usage; 3 runtime failure.",
    "",
    "Control operations:",
    "  Help and version print text without reading project inputs, verifying runtime assets, or creating files.",
    "  Workflow execution requires a manifest-verified versioned runtime.",
    "",
    "References:",
    "  docs/miku-project-cli-contract-v1.md, docs/miku-project-cli-result-contract-v1.md"
  );
  stdout.write(`${lines.join("\n")}\n`);
  return { exit_code: 0 };
}
