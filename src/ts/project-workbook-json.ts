/*
 * Copyright 2026 Toshiki Iga
 * SPDX-License-Identifier: Apache-2.0
 */
(() => {
  type ImportChange = {
    scope: "project" | "tasks" | "resources" | "assignments" | "calendars";
    uid: string;
    label: string;
    field: string;
    before: string | number | boolean | undefined;
    after: string | number | boolean;
  };

  type WorkbookJsonWarning = {
    message: string;
  };

  type WorkbookJsonRow = Record<string, string | number | boolean | null>;

  type WorkbookJsonDocument = {
    format: "mikuproject_workbook_json";
    version: 1;
    sheets: {
      Project?: WorkbookJsonRow[];
      Tasks?: WorkbookJsonRow[];
      Resources?: WorkbookJsonRow[];
      Assignments?: WorkbookJsonRow[];
      Calendars?: WorkbookJsonRow[];
      NonWorkingDays?: WorkbookJsonRow[];
      [sheetName: string]: WorkbookJsonRow[] | undefined;
    };
  };

  const projectWorkbookJsonExport = (globalThis as typeof globalThis & {
    __mikuprojectProjectWorkbookJsonExport?: {
      exportProjectWorkbookJson: (model: ProjectModel) => WorkbookJsonDocument;
    };
  }).__mikuprojectProjectWorkbookJsonExport;

  if (!projectWorkbookJsonExport) {
    throw new Error("mikuproject Project Workbook JSON export module is not loaded");
  }

  const projectWorkbookJsonImport = (globalThis as typeof globalThis & {
    __mikuprojectProjectWorkbookJsonImport?: {
      importProjectWorkbookJson: (documentLike: unknown, baseModel: ProjectModel) => {
        model: ProjectModel;
        changes: ImportChange[];
        warnings: WorkbookJsonWarning[];
      };
      importProjectWorkbookJsonAsProjectModel: (documentLike: unknown) => {
        model: ProjectModel;
        warnings: WorkbookJsonWarning[];
      };
      validateWorkbookJsonDocument: (documentLike: unknown) => {
        document: WorkbookJsonDocument;
        warnings: WorkbookJsonWarning[];
      };
    };
  }).__mikuprojectProjectWorkbookJsonImport;

  if (!projectWorkbookJsonImport) {
    throw new Error("mikuproject Project Workbook JSON import module is not loaded");
  }

  type WorkbookDiffChange = {
    scope: "project" | "tasks" | "resources" | "assignments" | "calendars";
    uid: string;
    label: string;
    field: string;
    before: unknown;
    after: unknown;
    change_type: "field-updated" | "row-added" | "row-removed" | "order-changed";
    sheet: string;
    row_key: string;
    before_position?: number | null;
    after_position?: number | null;
  };

  // Compare the workbook representation, not the subset supported by merge
  // import. Neither input is normalized through ProjectModel or modified.
  function diffProjectWorkbookJson(beforeLike: unknown, afterLike: unknown): {
    changes: WorkbookDiffChange[];
    warnings: WorkbookJsonWarning[];
    comparison_complete: boolean;
  } {
    const schema = (globalThis as typeof globalThis & {
      __mikuprojectProjectWorkbookSchema?: {
        PROJECT_FIELD_ORDER: readonly string[];
        SHEET_HEADERS: Record<string, readonly string[]>;
      };
    }).__mikuprojectProjectWorkbookSchema;
    if (!schema) {
      throw new Error("mikuproject Project Workbook Schema module is not loaded");
    }
    const before = projectWorkbookJsonImport.validateWorkbookJsonDocument(beforeLike);
    const after = projectWorkbookJsonImport.validateWorkbookJsonDocument(afterLike);
    const warnings = [
      ...before.warnings.map((warning) => ({ message: `before: ${warning.message}` })),
      ...after.warnings.map((warning) => ({ message: `after: ${warning.message}` }))
    ];
    const changes: WorkbookDiffChange[] = [];
    const scalar = (value: unknown, location: string): string | number | boolean | null => {
      if (value === undefined || value === null) return null;
      if (typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) return value;
      throw new Error(`workbook diff の値は scalar である必要があります: ${location}`);
    };
    const identity = (value: unknown, location: string): string => {
      if ((typeof value !== "string" && typeof value !== "number") || (typeof value === "number" && !Number.isFinite(value)) || String(value).trim() === "") {
        throw new Error(`workbook diff の行識別子がありません: ${location}`);
      }
      return String(value).trim();
    };
    const indexRows = (document: WorkbookJsonDocument, sheet: string, side: string) => {
      const indexed = new Map<string, { row: WorkbookJsonRow; position: number; uid: string }>();
      for (const [position, row] of (document.sheets[sheet] || []).entries()) {
        const location = `${side}.${sheet}[${position}]`;
        // The XLSX-backed exporter emits a fully blank placeholder row for
        // empty entity sheets. Keep that valid representation equivalent to [].
        const rowFields = sheet === "Project" ? ["Field", "Value"] : schema.SHEET_HEADERS[sheet];
        if (rowFields.every((field) => row[field] === undefined || row[field] === null || row[field] === "")) continue;
        const uid = identity(row[sheet === "Project" ? "Field" : sheet === "NonWorkingDays" ? "CalendarUID" : "UID"], location);
        const key = sheet === "NonWorkingDays" ? JSON.stringify([uid, identity(row.Index, `${location}.Index`)]) : uid;
        if (indexed.has(key)) throw new Error(`workbook diff の行識別子が重複しています: ${location} (${key})`);
        if (sheet === "Project" && !schema.PROJECT_FIELD_ORDER.includes(uid)) {
          warnings.push({ message: `${side}: 未知の Project field は比較しません: ${uid}` });
        }
        const fields = sheet === "Project" ? ["Value"] : schema.SHEET_HEADERS[sheet];
        for (const field of fields) scalar(row[field], `${location}.${field}`);
        indexed.set(key, { row, position, uid });
      }
      return indexed;
    };
    const beforeProject = indexRows(before.document, "Project", "before");
    const afterProject = indexRows(after.document, "Project", "after");
    const projectLabel = String(beforeProject.get("Name")?.row.Value ?? afterProject.get("Name")?.row.Value ?? "project");
    for (const field of schema.PROJECT_FIELD_ORDER) {
      const oldValue = scalar(beforeProject.get(field)?.row.Value, `before.Project.${field}`);
      const newValue = scalar(afterProject.get(field)?.row.Value, `after.Project.${field}`);
      if (oldValue !== newValue) changes.push({
        scope: "project", uid: "project", label: projectLabel, field,
        before: oldValue, after: newValue, change_type: "field-updated", sheet: "Project", row_key: field
      });
    }
    const definitions: Array<[string, WorkbookDiffChange["scope"]]> = [
      ["Tasks", "tasks"], ["Resources", "resources"], ["Assignments", "assignments"],
      ["Calendars", "calendars"], ["NonWorkingDays", "calendars"]
    ];
    for (const [sheet, scope] of definitions) {
      const oldRows = indexRows(before.document, sheet, "before");
      const newRows = indexRows(after.document, sheet, "after");
      const fields = schema.SHEET_HEADERS[sheet];
      const snapshot = (row: WorkbookJsonRow) => Object.fromEntries(fields.map((field) => [field, scalar(row[field], `${sheet}.${field}`)]));
      const label = (row: WorkbookJsonRow, uid: string) => String(row.Name ?? row.TaskName ?? row.CalendarName ?? uid);
      for (const [key, item] of oldRows) {
        if (!newRows.has(key)) changes.push({
          scope, uid: item.uid, label: label(item.row, item.uid), field: "$row",
          before: snapshot(item.row), after: null, change_type: "row-removed", sheet, row_key: key,
          before_position: item.position, after_position: null
        });
      }
      for (const [key, item] of newRows) {
        const oldItem = oldRows.get(key);
        if (!oldItem) {
          changes.push({
            scope, uid: item.uid, label: label(item.row, item.uid), field: "$row",
            before: null, after: snapshot(item.row), change_type: "row-added", sheet, row_key: key,
            before_position: null, after_position: item.position
          });
          continue;
        }
        for (const field of fields) {
          if (field === "UID" || (sheet === "NonWorkingDays" && (field === "CalendarUID" || field === "Index"))) continue;
          const oldValue = scalar(oldItem.row[field], `${sheet}.${field}`);
          const newValue = scalar(item.row[field], `${sheet}.${field}`);
          if (oldValue !== newValue) changes.push({
            scope, uid: item.uid, label: label(oldItem.row, item.uid), field,
            before: oldValue, after: newValue, change_type: "field-updated", sheet, row_key: key
          });
        }
      }
      if (sheet === "Tasks") {
        // Compare surviving rows so inserting/deleting a task does not mark
        // every later task as reordered. All other sheets are keyed sets.
        const oldOrder = [...oldRows.keys()].filter((key) => newRows.has(key));
        const newPositions = new Map([...newRows.keys()].filter((key) => oldRows.has(key)).map((key, position) => [key, position]));
        oldOrder.forEach((key, position) => {
          const nextPosition = newPositions.get(key)!;
          if (position === nextPosition) return;
          const item = oldRows.get(key)!;
          changes.push({
            scope, uid: item.uid, label: label(item.row, item.uid), field: "$position",
            before: position, after: nextPosition, change_type: "order-changed", sheet, row_key: key
          });
        });
      }
    }
    return { changes, warnings, comparison_complete: warnings.length === 0 };
  }

  (globalThis as typeof globalThis & {
    __mikuprojectProjectWorkbookJson?: {
      diffProjectWorkbookJson: typeof diffProjectWorkbookJson;
      exportProjectWorkbookJson: (model: ProjectModel) => WorkbookJsonDocument;
      importProjectWorkbookJsonAsProjectModel: (documentLike: unknown) => {
        model: ProjectModel;
        warnings: WorkbookJsonWarning[];
      };
      importProjectWorkbookJson: (documentLike: unknown, baseModel: ProjectModel) => {
        model: ProjectModel;
        changes: ImportChange[];
        warnings: WorkbookJsonWarning[];
      };
      validateWorkbookJsonDocument: (documentLike: unknown) => {
        document: WorkbookJsonDocument;
        warnings: WorkbookJsonWarning[];
      };
    };
  }).__mikuprojectProjectWorkbookJson = {
    diffProjectWorkbookJson,
    exportProjectWorkbookJson: (model: ProjectModel): WorkbookJsonDocument =>
      projectWorkbookJsonExport.exportProjectWorkbookJson(model),
    importProjectWorkbookJsonAsProjectModel: (documentLike: unknown): {
      model: ProjectModel;
      warnings: WorkbookJsonWarning[];
    } => projectWorkbookJsonImport.importProjectWorkbookJsonAsProjectModel(documentLike),
    importProjectWorkbookJson: (documentLike: unknown, baseModel: ProjectModel): {
      model: ProjectModel;
      changes: ImportChange[];
      warnings: WorkbookJsonWarning[];
    } => projectWorkbookJsonImport.importProjectWorkbookJson(documentLike, baseModel),
    validateWorkbookJsonDocument: (documentLike: unknown): {
      document: WorkbookJsonDocument;
      warnings: WorkbookJsonWarning[];
    } => projectWorkbookJsonImport.validateWorkbookJsonDocument(documentLike)
  };
})();
