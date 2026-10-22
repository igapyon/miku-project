import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loadMikuprojectCoreApi } from "../scripts/lib/core-api-loader.mjs";

const root = path.resolve(import.meta.dirname, "..");
const cli = path.join(root, "scripts/miku-project-cli.mjs");
let directory;
let state;
let input;
let unknownInput;
let patch;

function write(name, value) {
  const target = path.join(directory, name);
  fs.writeFileSync(target, `${JSON.stringify(value)}\n`);
  return target;
}
function run(args, entry = cli) {
  return spawnSync(process.execPath, [entry, ...args], {
    cwd: directory, input: "", encoding: "utf8", timeout: 10000
  });
}
beforeAll(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), "miku-project-cli-review-regressions-"));
  const loaded = loadMikuprojectCoreApi({ rootDir: root });
  try {
    state = loaded.api.workbookJson.exportDocument(loaded.api.importExternal({
      source: { format: "ms_project_xml", text: fs.readFileSync(path.join(root, "testdata/hierarchy.xml"), "utf8") },
      mode: "replace"
    }).model);
  } finally {
    loaded.dispose();
  }
  input = write("state.json", state);
  const unknown = structuredClone(state);
  unknown.sheets.Tasks[1].AgentNote = "extra";
  unknown.sheets.CustomData = [];
  unknownInput = write("unknown.json", unknown);
  patch = write("patch.json", { operations: [{ op: "update_project", fields: { name: "Updated project" } }] });
});
afterAll(() => fs.rmSync(directory, { recursive: true, force: true }));

describe("reviewed CLI failure paths", () => {
  it("shows the allowed --out option in all affected legacy usage lines", () => {
    const result = run(["--help"]);
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    for (const usage of [
      "miku-project ai spec [--out spec.md|-]",
      "miku-project ai detect-kind [--in document.json|-] [--diagnostics text|json] [--out kind.txt|-]",
      "miku-project ai validate-patch --state workbook.json [--in patch.json] [--diagnostics text|json] [--out report.json|-]",
      "miku-project state diff --before workbook.before.json --after workbook.after.json [--diagnostics text|json] [--out diff.json|-]"
    ]) {
      expect(result.stdout).toContain(usage);
    }
  });

  it.each(["added", "removed"])("reports a task %s as a real diff", (kind) => {
    const after = structuredClone(state);
    if (kind === "added") after.sheets.Tasks.push({ ...after.sheets.Tasks.at(-1), UID: "900", Name: "New task" });
    else after.sheets.Tasks.pop();
    const result = run(["state", "diff", "--before", input, "--after", write(`${kind}.json`, after), "--diagnostics", "json"]);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({ comparison_complete: true, changes_summary: { total_changes: 1 } });
    expect(JSON.parse(result.stdout).changed_items.tasks[0].change_type).toBe(`row-${kind}`);
    expect(JSON.parse(result.stderr).status).toBe("success");
  });

  it.each([
    ["ai", "export", "task-edit", "--task_uid", "3"],
    ["state", "summarize", "--task-uid", "3"],
    ["state", "summarize", "--__proto__", "ignored"]
  ])("rejects unknown and inapplicable options before reading input: %j", (...args) => {
    const result = run([...args, "--in", path.join(directory, "missing.json"), "--diagnostics", "json"]);
    expect(result.status).toBe(2);
    expect(result.stdout).toBe("");
    expect(JSON.parse(result.stderr).error_code).toBe("unknown_option");
  });

  it("rejects a fabricated dry-run option without overwriting the input", () => {
    const target = write("protected.json", state);
    const original = fs.readFileSync(target, "utf8");
    const result = run(["state", "apply-patch", "--state", target, "--in", patch, "--out", target, "--dry-run", "true", "--diagnostics", "json"]);
    expect(result.status).toBe(2);
    expect(JSON.parse(result.stderr).error_code).toBe("unknown_option");
    expect(fs.readFileSync(target, "utf8")).toBe(original);
  });

  it("rejects an unknown report command before attempting to read its input", () => {
    const result = run(["report", "typo", "--in", path.join(directory, "missing.json"), "--diagnostics", "json"]);
    expect(result.status).toBe(2);
    expect(JSON.parse(result.stderr).error_code).toBe("unsupported_command");
  });

  it("keeps the final repeated option value", () => {
    const result = run(["state", "summarize", "--in", input, "--diagnostics", "text", "--diagnostics", "json"]);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stderr).ok).toBe(true);
  });

  it("limits phase-detail --max-depth to 100 without changing the omitted default", () => {
    const deepState = structuredClone(state);
    const taskRows = deepState.sheets.Tasks;
    const root = taskRows.find((task) => task.UID === "2");
    const sibling = taskRows.find((task) => task.UID === "3");
    const descendants = Array.from({ length: 101 }, (_, index) => ({
      ...root,
      UID: String(index + 4),
      ID: index + 4,
      Name: `Child ${index + 1}`,
      OutlineLevel: index + 3,
      OutlineNumber: `1.${"1.".repeat(index + 1)}${index + 1}`,
      WBS: `1.${"1.".repeat(index + 1)}${index + 1}`
    }));
    const deepInput = write("phase-detail-depth.json", {
      ...deepState,
      sheets: {
        ...deepState.sheets,
        Tasks: [taskRows[0], root, ...descendants, sibling]
      }
    });

    const readUids = (maxDepth, name) => {
      const output = path.join(directory, name);
      const args = ["ai", "export", "phase-detail", "--in", deepInput, "--phase-uid", "1", "--root-task-uid", "2"];
      if (maxDepth !== undefined) args.push("--max-depth", maxDepth);
      args.push("--out", output, "--diagnostics", "json");
      const result = run(args);
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toBe("");
      const projection = JSON.parse(fs.readFileSync(output, "utf8"));
      return projection.tasks.map((task) => task.uid);
    };

    expect(readUids(undefined, "phase-depth-unlimited.json")).toHaveLength(102);
    expect(readUids("0", "phase-depth-0.json")).toEqual(["2"]);
    expect(readUids("1", "phase-depth-1.json")).toEqual(["2", "4"]);
    expect(readUids("100", "phase-depth-100.json")).toHaveLength(101);
    expect(readUids("000", "phase-depth-zero-padded.json")).toEqual(["2"]);
    expect(readUids(`0${"0".repeat(200)}100`, "phase-depth-long-zero-prefix.json")).toHaveLength(101);
  });

  it.each([
    "101", "2147483647", "2147483648", "9007199254740991", "9007199254740992",
    "9".repeat(200), "-1", "1.5", "1e2", "+1", " 1 ", "abc"
  ])("rejects invalid phase-detail --max-depth %s as usage error before output", (value) => {
    const output = path.join(directory, "phase-depth-invalid.json");
    fs.writeFileSync(output, "sentinel\n");
    const original = fs.readFileSync(output, "utf8");
    const result = run([
      "ai", "export", "phase-detail", "--in", input, "--phase-uid", "1", "--root-task-uid", "2",
      "--max-depth", value, "--out", output, "--diagnostics", "json"
    ]);
    expect(result.status).toBe(2);
    expect(result.stdout).toBe("");
    expect(JSON.parse(result.stderr)).toMatchObject({
      error_code: "invalid_integer_option",
      error_details: {
        option: "--max-depth",
        expected: "integer_between_0_and_100"
      }
    });
    expect(fs.readFileSync(output, "utf8")).toBe(original);
  });

  it.each([
    ["export", "workbook-json"], ["export", "xml"], ["report", "wbs-markdown"],
    ["ai", "export", "task-edit"], ["state", "summarize"]
  ])("preserves input warnings for %j", (...command) => {
    for (const format of ["text", "json"]) {
      const result = run([...command, "--in", unknownInput, "--diagnostics", format]);
      expect(result.status).toBe(0);
      if (format === "json") {
        expect(JSON.parse(result.stderr)).toMatchObject({ status: "warning", warning_count: 2 });
      } else {
        expect(result.stderr.match(/\[warning\]/g)).toHaveLength(2);
      }
    }
  });

  it("combines workbook and patch warnings consistently for validation and application", () => {
    const warningPatch = write("warning-patch.json", { operations: [{ op: "unknown_op" }] });
    const validation = run(["ai", "validate-patch", "--state", unknownInput, "--in", warningPatch, "--diagnostics", "json"]);
    const application = run(["state", "apply-patch", "--state", unknownInput, "--in", warningPatch, "--diagnostics", "json"]);
    expect(validation.status).toBe(0);
    expect(application.status).toBe(0);
    const report = JSON.parse(validation.stdout);
    const diagnostics = JSON.parse(application.stderr);
    expect(report.warning_count).toBe(3);
    expect(diagnostics.warning_count).toBe(report.warning_count);
    expect(diagnostics.status).toBe("warning");
  });

  it.each([["export", "xlsx"], ["report", "wbs-xlsx"]])("preserves import warnings for binary %j", (...command) => {
    const result = run([...command, "--in", unknownInput, "--out-base64", "-", "--diagnostics", "json"]);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stderr)).toMatchObject({ status: "warning", warning_count: 2 });
    expect(result.stdout).toMatch(/^UEsDB/);
  });

  it("marks unknown comparison data as incomplete rather than noop", () => {
    const result = run(["state", "diff", "--before", input, "--after", unknownInput, "--diagnostics", "json"]);
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({ comparison_complete: false, changes_summary: { total_changes: 0 } });
    expect(JSON.parse(result.stderr)).toMatchObject({ status: "warning", comparison_complete: false, warning_count: 2 });
  });

  it.each([["state", "summarize"], ["export", "xlsx"]])("emits one error JSON when %j cannot save output", (...command) => {
    const result = run([...command, "--in", input, "--out", path.join(directory, "absent", "output"), "--diagnostics", "json"]);
    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(JSON.parse(result.stderr)).toMatchObject({ ok: false, status: "error", exit_code: 1 });
  });

  it.each(["inspect", "validate", "plan-change", "apply-change", "verify-artifact"])("supports source CLI %s --help without domain input", (command) => {
    const result = run([command, "--help"]);
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain(`miku-project ${command}`);
  });

  it("keeps the fixes in a standalone development bundle", () => {
    const removed = structuredClone(state);
    removed.sheets.Tasks.pop();
    const removedPath = write("bundle-removed.json", removed);
    const entry = path.join(directory, "bundle", "miku-project.mjs");
    const build = spawnSync(process.execPath, ["scripts/build-cli-bundle.mjs", "--out", entry, "--sources-out", path.join(directory, "sources.tgz")], { cwd: root, encoding: "utf8" });
    expect(build.status, build.stderr).toBe(0);
    const rejected = run(["state", "summarize", "--in", input, "--typo", "value", "--diagnostics", "json"], entry);
    expect(rejected.status).toBe(2);
    expect(JSON.parse(rejected.stderr).error_code).toBe("unknown_option");
    const compared = run(["state", "diff", "--before", input, "--after", removedPath, "--diagnostics", "json"], entry);
    expect(compared.status).toBe(0);
    expect(JSON.parse(compared.stdout).changes_summary.total_changes).toBe(1);
    const warning = run(["export", "workbook-json", "--in", unknownInput, "--diagnostics", "json"], entry);
    expect(warning.status).toBe(0);
    expect(JSON.parse(warning.stderr).warning_count).toBe(2);
    expect(run(["inspect", "--help"], entry).status).toBe(0);
  }, 30000);
});
