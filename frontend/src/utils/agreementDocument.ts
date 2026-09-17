import { TenancyAgreement } from "@/types/agreement";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Opens a print-ready HTML document in a new browser tab (Save as PDF via print dialog). */
export function openAgreementDocumentInNewTab(agreement: TenancyAgreement): void {
  const agreementId = escapeHtml(agreement.agreement_id);
  const propertyTitle = escapeHtml(agreement.property_title);
  const body = escapeHtml(agreement.full_legal_text);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${agreementId} — Tenancy Indenture</title>
  <style>
    body { margin: 0; background: #525659; font-family: Georgia, "Times New Roman", serif; }
    .toolbar { position: sticky; top: 0; z: 10; background: #1e293b; color: #f8fafc; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; font-family: system-ui, sans-serif; font-size: 13px; }
    .toolbar button { background: #fff; border: none; border-radius: 8px; padding: 8px 14px; font-weight: 600; cursor: pointer; }
    .canvas { padding: 32px 16px 48px; display: flex; justify-content: center; }
    .page { width: 210mm; max-width: 100%; min-height: 297mm; background: #fff; box-shadow: 0 8px 32px rgb(0 0 0 / 0.35); padding: 18mm 16mm; box-sizing: border-box; color: #0f172a; font-size: 11pt; line-height: 1.55; }
    .page h1 { font-size: 16pt; text-align: center; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.04em; }
    .page .meta { text-align: center; font-size: 9pt; color: #64748b; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
    .page pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; margin: 0; }
    @media print { body { background: #fff; } .toolbar { display: none; } .canvas { padding: 0; } .page { box-shadow: none; width: 100%; min-height: auto; } }
  </style>
</head>
<body>
  <div class="toolbar">
    <span>Settlla — ${agreementId}</span>
    <button type="button" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="canvas">
    <article class="page">
      <h1>Kaduna State Residential Tenancy Indenture</h1>
      <p class="meta">Instrument Ref: ${agreementId} · ${propertyTitle}</p>
      <pre>${body}</pre>
    </article>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
