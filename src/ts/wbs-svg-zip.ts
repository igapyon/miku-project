/*
 * Copyright 2026 Toshiki Iga
 * SPDX-License-Identifier: Apache-2.0
 */
(() => {
  type ZipEntry = { name: string; data: string | Uint8Array };
  type ZipWriter = {
    writeZipPackage(
      entries: Array<{ path: string; data: string | Uint8Array; compression?: "store" | "deflate" }>,
      options?: { timestamp?: Date; compression?: "store" | "deflate"; order?: "stable" | "input" }
    ): Promise<Uint8Array>;
  };
  type WbsSvgZipHelper = {
    escapeXml(value: string): string;
    packZip(entries: ZipEntry[]): Promise<Uint8Array>;
  };

  function createWbsSvgZipHelper(): WbsSvgZipHelper {
    const officeCore = (globalThis as typeof globalThis & { __mikuprojectMsOfficeCore?: ZipWriter }).__mikuprojectMsOfficeCore;
    if (!officeCore) {
      throw new Error("miku-ms-office-core module is not loaded");
    }

    function escapeXml(value: string): string {
      return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;");
    }

    async function packZip(entries: ZipEntry[]): Promise<Uint8Array> {
      return await officeCore.writeZipPackage(
        entries.map((entry) => ({ path: entry.name, data: entry.data, compression: "store" })),
        {
          timestamp: new Date("2025-01-01T00:00:00.000Z"),
          compression: "store",
          order: "input"
        }
      );
    }

    return { escapeXml, packZip };
  }

  (globalThis as typeof globalThis & {
    __mikuprojectWbsSvgZip?: {
      createWbsSvgZipHelper: () => WbsSvgZipHelper;
    };
  }).__mikuprojectWbsSvgZip = { createWbsSvgZipHelper };
})();
