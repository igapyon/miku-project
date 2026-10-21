import {
  buildIoDiagnostics,
  ensureBinaryOutputTarget,
  ensureSingleStdinSource
} from "./cli-io.mjs";
import { buildResultDiagnostics, parseDiagnosticsFormat } from "./cli-diagnostics.mjs";
import { loadWorkbookInput } from "./cli-command-utils.mjs";

export async function runReportCommand(command, options, api) {
  const [scope, action, subject] = command;
  if (scope !== "report" || subject !== undefined) {
    return undefined;
  }

  ensureSingleStdinSource([
    { optionName: "--in", value: options.in, allowImplicitStdin: true }
  ]);
  const diagnosticsFormat = parseDiagnosticsFormat(options.diagnostics);
  const { model, warnings } = await loadWorkbookInput(api, options.in, `report ${action}`);

  if (action === "wbs-xlsx") {
    ensureBinaryOutputTarget(options, "report wbs-xlsx");
    const output = api.report.wbsXlsx.exportBytes(model);
    return binaryResult("report wbs-xlsx", "wbs_xlsx", output, options, diagnosticsFormat, warnings);
  }

  if (action === "daily-svg") {
    return textResult("report daily-svg", "daily_svg", `${api.report.svg.exportDaily(model)}\n`, options, diagnosticsFormat, warnings);
  }

  if (action === "weekly-svg") {
    return textResult("report weekly-svg", "weekly_svg", `${api.report.svg.exportWeekly(model)}\n`, options, diagnosticsFormat, warnings);
  }

  if (action === "monthly-calendar-svg") {
    ensureBinaryOutputTarget(options, "report monthly-calendar-svg");
    return binaryResult(
      "report monthly-calendar-svg",
      "monthly_calendar_svg_zip",
      api.report.svg.exportMonthlyCalendar(model).zipBytes,
      options,
      diagnosticsFormat,
      warnings
    );
  }

  if (action === "all") {
    ensureBinaryOutputTarget(options, "report all");
    return binaryResult("report all", "report_bundle_zip", api.report.all.export(model).zipBytes, options, diagnosticsFormat, warnings);
  }

  if (action === "wbs-markdown") {
    return textResult("report wbs-markdown", "wbs_markdown", `${api.report.wbsMarkdown.export(model)}\n`, options, diagnosticsFormat, warnings);
  }

  if (action === "mermaid") {
    return textResult("report mermaid", "mermaid", `${api.report.mermaid.exportGantt(model)}\n`, options, diagnosticsFormat, warnings);
  }

  return undefined;
}

function textResult(command, outputKind, output, options, diagnosticsFormat, warnings) {
  return {
    output,
    diagnostics: buildResultDiagnostics(command, diagnosticsFormat, {
      warnings,
      io: buildIoDiagnostics({
        inputs: [{ optionName: "--in", value: options.in, allowImplicitStdin: true }],
        output: options.out
      }),
      output_kind: outputKind,
      output_length: output.length
    })
  };
}

function binaryResult(command, outputKind, output, options, diagnosticsFormat, warnings) {
  return {
    output,
    diagnostics: buildResultDiagnostics(command, diagnosticsFormat, {
      warnings,
      io: buildIoDiagnostics({
        inputs: [{ optionName: "--in", value: options.in, allowImplicitStdin: true }],
        output: options.out,
        outputBase64: options["out-base64"]
      }),
      output_kind: outputKind,
      byte_length: output.length
    })
  };
}
