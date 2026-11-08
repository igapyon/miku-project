/*
 * Copyright 2026 Toshiki Iga
 * SPDX-License-Identifier: Apache-2.0
 */
(() => {
    const mikuprojectCoreApiExternalBinary = globalThis.__mikuprojectCoreApiExternalBinary;
    if (!mikuprojectCoreApiExternalBinary) {
        throw new Error("mikuproject core api external binary module is not loaded");
    }
    const mikuprojectCoreApiExternalDocument = globalThis.__mikuprojectCoreApiExternalDocument;
    if (!mikuprojectCoreApiExternalDocument) {
        throw new Error("mikuproject core api external document module is not loaded");
    }
    function formatAllowedModes(modes) {
        return modes.map((mode) => `mode=${mode}`).join(" / ");
    }
    function assertImportMode(sourceFormat, mode, allowedModes) {
        if (allowedModes.includes(mode)) {
            return;
        }
        throw new Error(`importExternal: format=${sourceFormat} は ${formatAllowedModes(allowedModes)} のみ対応です (received: mode=${mode})`);
    }
    function assertBaseModelRequired(sourceFormat, mode, baseModel) {
        if (baseModel) {
            return;
        }
        throw new Error(`importExternal: format=${sourceFormat} mode=${mode} には baseModel が必要です`);
    }
    async function importExternal(input) {
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
        if (source.format === "workbook_json" ||
            source.format === "project_draft_view" ||
            source.format === "patch_json") {
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
            return mikuprojectCoreApiExternalDocument.importDocument(source.format, source.document, mode, baseModel);
        }
        throw new Error(`未対応の import format です: ${source.format || "unknown"}`);
    }
    globalThis.__mikuprojectCoreApiExternalImport = {
        importExternal
    };
})();
