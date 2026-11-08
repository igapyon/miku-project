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

  type ScopedWarning = {
    message: string;
    scope?: "project" | "tasks" | "resources" | "assignments" | "calendars";
    uid?: string;
    label?: string;
  };

  type AiJsonDocumentKind = "workbook_json" | "project_draft_view" | "patch_json";
  type ExternalImportMode = "replace" | "merge" | "patch";

  const mikuprojectCoreApiExternalBinary = (globalThis as typeof globalThis & {
    __mikuprojectCoreApiExternalBinary?: {
      importMsProjectXml: (sourceText: string, mode: "replace") => {
        kind: "ms_project_xml";
        mode: "replace";
        model: ProjectModel;
        warnings: [];
      };
      importXlsx: (
        sourceBytes: Uint8Array,
        mode: "replace" | "merge",
        baseModel?: ProjectModel
      ) =>
        | {
          kind: "xlsx";
          mode: "replace";
          model: ProjectModel;
          warnings: [];
        }
        | {
          kind: "xlsx";
          mode: "merge";
          model: ProjectModel;
          changes: ImportChange[];
          warnings: [];
        };
    };
  }).__mikuprojectCoreApiExternalBinary;

  if (!mikuprojectCoreApiExternalBinary) {
    throw new Error("mikuproject core api external binary module is not loaded");
  }

  const mikuprojectCoreApiExternalDocument = (globalThis as typeof globalThis & {
    __mikuprojectCoreApiExternalDocument?: {
      importDocument: (
        format: AiJsonDocumentKind,
        document: unknown,
        mode: "replace" | "merge" | "patch",
        baseModel?: ProjectModel
      ) => unknown;
    };
  }).__mikuprojectCoreApiExternalDocument;

  if (!mikuprojectCoreApiExternalDocument) {
    throw new Error("mikuproject core api external document module is not loaded");
  }

  type ExternalImportSource =
    | { format: "ms_project_xml"; text: string }
    | { format: "xlsx"; bytes: Uint8Array }
    | { format: "workbook_json"; document: unknown }
    | { format: "project_draft_view"; document: unknown }
    | { format: "patch_json"; document: unknown };

  function formatAllowedModes(modes: ExternalImportMode[]): string {
    return modes.map((mode) => `mode=${mode}`).join(" / ");
  }

  function assertImportMode(
    sourceFormat: ExternalImportSource["format"],
    mode: ExternalImportMode,
    allowedModes: ExternalImportMode[]
  ): void {
    if (allowedModes.includes(mode)) {
      return;
    }
    throw new Error(
      `importExternal: format=${sourceFormat} は ${formatAllowedModes(allowedModes)} のみ対応です (received: mode=${mode})`
    );
  }

  function assertBaseModelRequired(
    sourceFormat: ExternalImportSource["format"],
    mode: ExternalImportMode,
    baseModel?: ProjectModel
  ): void {
    if (baseModel) {
      return;
    }
    throw new Error(`importExternal: format=${sourceFormat} mode=${mode} には baseModel が必要です`);
  }

  async function importExternal(input: {
    source: ExternalImportSource;
    mode: ExternalImportMode;
    baseModel?: ProjectModel;
  }) {
    const { source, mode, baseModel } = input;

    if (source.format === "ms_project_xml") {
      assertImportMode(source.format, mode, ["replace"]);
      return mikuprojectCoreApiExternalBinary.importMsProjectXml(source.text, mode);
    }

    if (source.format === "xlsx") {
      assertImportMode(source.format, mode, ["replace", "merge"]);
      if (mode === "merge") {
        assertBaseModelRequired(source.format, mode, baseModel);
      }
      return await mikuprojectCoreApiExternalBinary.importXlsx(source.bytes, mode, baseModel);
    }

    if (
      source.format === "workbook_json" ||
      source.format === "project_draft_view" ||
      source.format === "patch_json"
    ) {
      if (source.format === "workbook_json") {
        assertImportMode(source.format, mode, ["replace", "merge"]);
        if (mode === "merge") {
          assertBaseModelRequired(source.format, mode, baseModel);
        }
      }
      if (source.format === "project_draft_view") {
        assertImportMode(source.format, mode, ["replace"]);
      }
      if (source.format === "patch_json") {
        assertImportMode(source.format, mode, ["patch"]);
        assertBaseModelRequired(source.format, mode, baseModel);
      }
      return mikuprojectCoreApiExternalDocument.importDocument(source.format, source.document, mode, baseModel) as
        | {
          kind: "project_draft_view";
          mode: "replace";
          model: ProjectModel;
          warnings: [];
        }
        | {
          kind: "workbook_json";
          mode: "replace";
          model: ProjectModel;
          warnings: Array<{ message: string }>;
        }
        | {
          kind: "workbook_json";
          mode: "merge";
          model: ProjectModel;
          changes: ImportChange[];
          warnings: Array<{ message: string }>;
        }
        | {
          kind: "patch_json";
          mode: "patch";
          model: ProjectModel;
          changes: ImportChange[];
          warnings: ScopedWarning[];
        };
    }

    throw new Error(`未対応の import format です: ${(source as { format?: string }).format || "unknown"}`);
  }

  (globalThis as typeof globalThis & {
    __mikuprojectCoreApiExternalImport?: {
      importExternal: typeof importExternal;
    };
  }).__mikuprojectCoreApiExternalImport = {
    importExternal
  };
})();
