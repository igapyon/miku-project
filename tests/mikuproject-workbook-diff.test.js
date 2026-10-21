import { afterAll, beforeAll, describe, expect, it } from "vitest";
import path from "node:path";
import { loadMikuprojectCoreApi } from "../scripts/lib/core-api-loader.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
let loaded;
let diff;
beforeAll(() => {
  loaded = loadMikuprojectCoreApi({ rootDir: repoRoot });
  diff = loaded.api.workbookJson.diffDocuments;
});
afterAll(() => loaded?.dispose());

function document() {
  return {
    format: "mikuproject_workbook_json", version: 1,
    sheets: {
      Project: [{ Field: "Name", Value: "Project" }, { Field: "Title", Value: "Project" }],
      Tasks: [{ UID: "1", Name: "First", OutlineLevel: 1 }, { UID: "2", Name: "Second", OutlineLevel: 1 }],
      Resources: [{ UID: "1", Name: "Person" }, { UID: "2", Name: "Other" }],
      Assignments: [{ UID: "1", TaskUID: "1", ResourceUID: "1" }],
      Calendars: [{ UID: "1", Name: "Calendar", WeekDays: "[]" }],
      NonWorkingDays: [{ CalendarUID: "1", Index: 0, Name: "Holiday" }]
    }
  };
}

describe("workbook document diff", () => {
  it("compares identical documents without mutating either input", () => {
    const before = document();
    const after = structuredClone(before);
    const original = JSON.stringify(before);
    expect(diff(before, after)).toEqual({ changes: [], warnings: [], comparison_complete: true });
    expect(JSON.stringify(before)).toBe(original);
    expect(after).toEqual(before);
  });

  it.each(["Tasks", "Resources", "Assignments", "Calendars", "NonWorkingDays"])("detects added and removed %s rows", (sheet) => {
    const before = document();
    const after = structuredClone(before);
    after.sheets[sheet].pop();
    const removed = diff(before, after).changes;
    expect(removed).toHaveLength(1);
    expect(removed[0]).toMatchObject({ change_type: "row-removed", sheet, field: "$row", after: null, after_position: null });
    const added = diff(after, before).changes;
    expect(added).toHaveLength(1);
    expect(added[0]).toMatchObject({ change_type: "row-added", sheet, field: "$row", before: null, before_position: null });
  });

  it("compares all known fields, including fields that merge import does not edit", () => {
    const before = document();
    const after = structuredClone(before);
    after.sheets.Tasks[0].OutlineLevel = 2;
    after.sheets.Resources[0].StandardRate = "123";
    after.sheets.Assignments[0].TaskUID = "2";
    after.sheets.Calendars[0].WeekDays = "[1]";
    after.sheets.NonWorkingDays[0].Name = "New holiday";
    expect(diff(before, after).changes.map(({ sheet, field }) => [sheet, field])).toEqual([
      ["Tasks", "OutlineLevel"], ["Resources", "StandardRate"], ["Assignments", "TaskUID"],
      ["Calendars", "WeekDays"], ["NonWorkingDays", "Name"]
    ]);
  });

  it("reports task order while treating other sheets as keyed sets", () => {
    const before = document();
    const after = structuredClone(before);
    after.sheets.Tasks.reverse();
    after.sheets.Resources.reverse();
    expect(diff(before, after).changes).toMatchObject([
      { uid: "1", field: "$position", before: 0, after: 1, change_type: "order-changed" },
      { uid: "2", field: "$position", before: 1, after: 0, change_type: "order-changed" }
    ]);
  });

  it("does not classify shifts caused solely by insertion as task moves", () => {
    const before = document();
    const after = structuredClone(before);
    after.sheets.Tasks.unshift({ UID: "new", Name: "New" });
    expect(diff(before, after).changes).toMatchObject([{ uid: "new", change_type: "row-added", after_position: 0 }]);
  });

  it("preserves scalar types and treats absent cells as null", () => {
    const before = document();
    const after = structuredClone(before);
    before.sheets.Tasks[0].Notes = null;
    expect(diff(before, after).changes).toEqual([]);
    after.sheets.Tasks[0].PercentComplete = 0;
    after.sheets.Tasks[0].Milestone = false;
    after.sheets.Tasks[0].Notes = "";
    expect(diff(before, after).changes).toMatchObject([
      { field: "PercentComplete", before: null, after: 0 },
      { field: "Milestone", before: null, after: false },
      { field: "Notes", before: null, after: "" }
    ]);
  });

  it("compares Project by Field, including removal of a value", () => {
    const before = document();
    const after = structuredClone(before);
    after.sheets.Project.reverse();
    expect(diff(before, after).changes).toEqual([]);
    after.sheets.Project = after.sheets.Project.filter((row) => row.Field !== "Name");
    expect(diff(before, after).changes).toMatchObject([{ scope: "project", field: "Name", before: "Project", after: null }]);
  });

  it("marks unknown data as an incomplete comparison, with source warnings", () => {
    const before = document();
    const after = structuredClone(before);
    before.sheets.Tasks[0].Extra = "note";
    after.sheets.CustomData = [];
    after.sheets.Project.push({ Field: "CustomField", Value: "value" });
    const result = diff(before, after);
    expect(result.comparison_complete).toBe(false);
    expect(result.warnings).toHaveLength(3);
    expect(result.warnings.map((warning) => warning.message)).toEqual(expect.arrayContaining([
      expect.stringContaining("before:"), expect.stringContaining("after:"), expect.stringContaining("CustomField")
    ]));
  });

  it.each(["Tasks", "Resources", "Assignments", "Calendars", "NonWorkingDays", "Project"])("rejects duplicate %s identities", (sheet) => {
    const before = document();
    const after = structuredClone(before);
    after.sheets[sheet].push(structuredClone(after.sheets[sheet][0]));
    expect(() => diff(before, after)).toThrow("重複");
  });

  it("rejects unidentifiable rows and non-scalar known cells", () => {
    const before = document();
    const after = structuredClone(before);
    delete after.sheets.Tasks[0].UID;
    expect(() => diff(before, after)).toThrow("行識別子");
    after.sheets.Tasks[0].UID = "1";
    after.sheets.Tasks[0].Name = { nested: "invalid" };
    expect(() => diff(before, after)).toThrow("scalar");
  });

  it("treats exporter placeholder rows as empty without accepting unidentified data", () => {
    const empty = { format: "mikuproject_workbook_json", version: 1, sheets: {} };
    const placeholders = structuredClone(empty);
    placeholders.sheets = {
      Project: [{ Field: null, Value: null }], Tasks: [{ UID: null, Name: "" }],
      Resources: [{ UID: null, Name: null }], Assignments: [{ UID: null }],
      Calendars: [{ UID: null }], NonWorkingDays: [{ CalendarUID: null, Index: null }]
    };
    expect(diff(empty, placeholders)).toEqual({ changes: [], warnings: [], comparison_complete: true });
    placeholders.sheets.Resources[0].Name = "A real resource";
    expect(() => diff(empty, placeholders)).toThrow("行識別子");
  });
});
