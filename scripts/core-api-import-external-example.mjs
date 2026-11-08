import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadMikuprojectCoreApi } from "./lib/core-api-loader.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const dependencyXmlPath = path.resolve(repoRoot, "testdata/dependency.xml");

const { api, dispose } = loadMikuprojectCoreApi({ rootDir: repoRoot });

try {
  const xmlText = fs.readFileSync(dependencyXmlPath, "utf8");
  const xmlResult = await api.importExternal({
    source: { format: "ms_project_xml", text: xmlText },
    mode: "replace"
  });

  const workbookJson = api.workbookJson.exportDocument(xmlResult.model);
  workbookJson.sheets.Project.find((row) => row.Field === "Name").Value = "Example Merge Import";

  const mergeResult = await api.importExternal({
    source: { format: "workbook_json", document: workbookJson },
    mode: "merge",
    baseModel: xmlResult.model
  });

  process.stdout.write(JSON.stringify({
    replaceKind: xmlResult.kind,
    replaceMode: xmlResult.mode,
    mergedProjectName: mergeResult.model.project.name,
    mergedChangeCount: Array.isArray(mergeResult.changes) ? mergeResult.changes.length : 0
  }, null, 2));
  process.stdout.write("\n");
} finally {
  dispose();
}
