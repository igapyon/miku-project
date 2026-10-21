/*
 * Copyright 2026 Toshiki Iga
 * SPDX-License-Identifier: Apache-2.0
 */
(() => {
    const projectWorkbookJsonExport = globalThis.__mikuprojectProjectWorkbookJsonExport;
    if (!projectWorkbookJsonExport) {
        throw new Error("mikuproject Project Workbook JSON export module is not loaded");
    }
    const projectWorkbookJsonImport = globalThis.__mikuprojectProjectWorkbookJsonImport;
    if (!projectWorkbookJsonImport) {
        throw new Error("mikuproject Project Workbook JSON import module is not loaded");
    }
    // Compare the workbook representation, not the subset supported by merge
    // import. Neither input is normalized through ProjectModel or modified.
    function diffProjectWorkbookJson(beforeLike, afterLike) {
        var _a, _b, _c, _d, _e, _f;
        const schema = globalThis.__mikuprojectProjectWorkbookSchema;
        if (!schema) {
            throw new Error("mikuproject Project Workbook Schema module is not loaded");
        }
        const before = projectWorkbookJsonImport.validateWorkbookJsonDocument(beforeLike);
        const after = projectWorkbookJsonImport.validateWorkbookJsonDocument(afterLike);
        const warnings = [
            ...before.warnings.map((warning) => ({ message: `before: ${warning.message}` })),
            ...after.warnings.map((warning) => ({ message: `after: ${warning.message}` }))
        ];
        const changes = [];
        const scalar = (value, location) => {
            if (value === undefined || value === null)
                return null;
            if (typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value)))
                return value;
            throw new Error(`workbook diff の値は scalar である必要があります: ${location}`);
        };
        const identity = (value, location) => {
            if ((typeof value !== "string" && typeof value !== "number") || (typeof value === "number" && !Number.isFinite(value)) || String(value).trim() === "") {
                throw new Error(`workbook diff の行識別子がありません: ${location}`);
            }
            return String(value).trim();
        };
        const indexRows = (document, sheet, side) => {
            const indexed = new Map();
            for (const [position, row] of (document.sheets[sheet] || []).entries()) {
                const location = `${side}.${sheet}[${position}]`;
                // The XLSX-backed exporter emits a fully blank placeholder row for
                // empty entity sheets. Keep that valid representation equivalent to [].
                const rowFields = sheet === "Project" ? ["Field", "Value"] : schema.SHEET_HEADERS[sheet];
                if (rowFields.every((field) => row[field] === undefined || row[field] === null || row[field] === ""))
                    continue;
                const uid = identity(row[sheet === "Project" ? "Field" : sheet === "NonWorkingDays" ? "CalendarUID" : "UID"], location);
                const key = sheet === "NonWorkingDays" ? JSON.stringify([uid, identity(row.Index, `${location}.Index`)]) : uid;
                if (indexed.has(key))
                    throw new Error(`workbook diff の行識別子が重複しています: ${location} (${key})`);
                if (sheet === "Project" && !schema.PROJECT_FIELD_ORDER.includes(uid)) {
                    warnings.push({ message: `${side}: 未知の Project field は比較しません: ${uid}` });
                }
                const fields = sheet === "Project" ? ["Value"] : schema.SHEET_HEADERS[sheet];
                for (const field of fields)
                    scalar(row[field], `${location}.${field}`);
                indexed.set(key, { row, position, uid });
            }
            return indexed;
        };
        const beforeProject = indexRows(before.document, "Project", "before");
        const afterProject = indexRows(after.document, "Project", "after");
        const projectLabel = String((_d = (_b = (_a = beforeProject.get("Name")) === null || _a === void 0 ? void 0 : _a.row.Value) !== null && _b !== void 0 ? _b : (_c = afterProject.get("Name")) === null || _c === void 0 ? void 0 : _c.row.Value) !== null && _d !== void 0 ? _d : "project");
        for (const field of schema.PROJECT_FIELD_ORDER) {
            const oldValue = scalar((_e = beforeProject.get(field)) === null || _e === void 0 ? void 0 : _e.row.Value, `before.Project.${field}`);
            const newValue = scalar((_f = afterProject.get(field)) === null || _f === void 0 ? void 0 : _f.row.Value, `after.Project.${field}`);
            if (oldValue !== newValue)
                changes.push({
                    scope: "project", uid: "project", label: projectLabel, field,
                    before: oldValue, after: newValue, change_type: "field-updated", sheet: "Project", row_key: field
                });
        }
        const definitions = [
            ["Tasks", "tasks"], ["Resources", "resources"], ["Assignments", "assignments"],
            ["Calendars", "calendars"], ["NonWorkingDays", "calendars"]
        ];
        for (const [sheet, scope] of definitions) {
            const oldRows = indexRows(before.document, sheet, "before");
            const newRows = indexRows(after.document, sheet, "after");
            const fields = schema.SHEET_HEADERS[sheet];
            const snapshot = (row) => Object.fromEntries(fields.map((field) => [field, scalar(row[field], `${sheet}.${field}`)]));
            const label = (row, uid) => { var _a, _b, _c; return String((_c = (_b = (_a = row.Name) !== null && _a !== void 0 ? _a : row.TaskName) !== null && _b !== void 0 ? _b : row.CalendarName) !== null && _c !== void 0 ? _c : uid); };
            for (const [key, item] of oldRows) {
                if (!newRows.has(key))
                    changes.push({
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
                    if (field === "UID" || (sheet === "NonWorkingDays" && (field === "CalendarUID" || field === "Index")))
                        continue;
                    const oldValue = scalar(oldItem.row[field], `${sheet}.${field}`);
                    const newValue = scalar(item.row[field], `${sheet}.${field}`);
                    if (oldValue !== newValue)
                        changes.push({
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
                    const nextPosition = newPositions.get(key);
                    if (position === nextPosition)
                        return;
                    const item = oldRows.get(key);
                    changes.push({
                        scope, uid: item.uid, label: label(item.row, item.uid), field: "$position",
                        before: position, after: nextPosition, change_type: "order-changed", sheet, row_key: key
                    });
                });
            }
        }
        return { changes, warnings, comparison_complete: warnings.length === 0 };
    }
    globalThis.__mikuprojectProjectWorkbookJson = {
        diffProjectWorkbookJson,
        exportProjectWorkbookJson: (model) => projectWorkbookJsonExport.exportProjectWorkbookJson(model),
        importProjectWorkbookJsonAsProjectModel: (documentLike) => projectWorkbookJsonImport.importProjectWorkbookJsonAsProjectModel(documentLike),
        importProjectWorkbookJson: (documentLike, baseModel) => projectWorkbookJsonImport.importProjectWorkbookJson(documentLike, baseModel),
        validateWorkbookJsonDocument: (documentLike) => projectWorkbookJsonImport.validateWorkbookJsonDocument(documentLike)
    };
})();
