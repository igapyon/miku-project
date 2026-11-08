/*
 * Copyright 2026 Toshiki Iga
 * SPDX-License-Identifier: Apache-2.0
 */
(() => {
    function createWbsSvgZipHelper() {
        const textEncoder = new TextEncoder();
        const officeCore = globalThis.__mikuprojectMsOfficeCore;
        if (!officeCore) {
            throw new Error("miku-ms-office-core module is not loaded");
        }
        function escapeXml(value) {
            return String(value || "")
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll("\"", "&quot;");
        }
        function encodeUtf8(value) {
            return textEncoder.encode(value);
        }
        async function packZip(entries) {
            return await officeCore.writeZipPackage(entries.map((entry) => ({ path: entry.name, data: entry.data, compression: "store" })), {
                timestamp: new Date("2025-01-01T00:00:00.000Z"),
                compression: "store",
                order: "input"
            });
        }
        return { escapeXml, encodeUtf8, packZip };
    }
    globalThis.__mikuprojectWbsSvgZip = { createWbsSvgZipHelper };
})();
