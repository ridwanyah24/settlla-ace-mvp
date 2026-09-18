"use client";

import React, { useEffect } from "react";
import { TenancyAgreement } from "@/types/agreement";
import { openAgreementDocumentInNewTab } from "@/utils/agreementDocument";
import { X, Printer, Scale, Check, ExternalLink } from "lucide-react";

interface AgreementFocusReaderProps {
  agreement: TenancyAgreement;
  onClose: () => void;
}

export const AgreementFocusReader: React.FC<AgreementFocusReaderProps> = ({
  agreement,
  onClose,
}) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const openPrintableDocument = () => openAgreementDocumentInNewTab(agreement);

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col overflow-x-hidden bg-slate-800/95 backdrop-blur-sm animate-fade-in agreement-focus-reader"
      role="dialog"
      aria-modal="true"
      aria-label="Tenancy agreement document reader"
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-700 bg-slate-900 px-4 py-3 text-white sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Document reader</p>
          <p className="truncate font-mono text-xs text-slate-400">{agreement.agreement_id}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={openPrintableDocument}
            className="btn btn-secondary btn-sm hidden sm:inline-flex"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            New tab
          </button>
          <button type="button" onClick={openPrintableDocument} className="btn btn-secondary btn-sm">
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Save PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            aria-label="Close document reader"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-8 sm:px-6">
        <article className="agreement-pdf-page mx-auto agreement-focus-print-target">
          <div className="mb-8 border-b border-slate-200 pb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-blue-50">
              <Scale className="h-6 w-6 text-blue-700" />
            </div>
            <h1 className="text-lg font-bold uppercase tracking-wide text-slate-900 sm:text-xl">
              Kaduna State Residential Tenancy Indenture
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-xs text-slate-600">
              Read the full lease here or use Save PDF for a print-ready copy. Close this reader
              (Esc) to return to signature and tenant details.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-slate-600">
              <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono">
                {agreement.agreement_id}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800">
                <Check className="h-3.5 w-3.5" />
                Verified mandate
              </span>
            </div>
          </div>

          <div className="agreement-pdf-body whitespace-pre-wrap text-[11pt] leading-relaxed text-slate-800">
            {agreement.full_legal_text}
          </div>

          <footer className="mt-10 grid gap-4 border-t border-slate-200 pt-8 text-xs sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase text-slate-400">Tenant</p>
              <p className="mt-1 font-semibold text-slate-900">{agreement.tenant.full_name}</p>
              <p className="text-slate-500">NIN: {agreement.tenant.nin_number || "—"}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <p className="text-[10px] font-bold uppercase text-blue-600">Attorney-in-fact</p>
              <p className="mt-1 font-semibold text-slate-900">{agreement.manager_name}</p>
              <p className="text-slate-600">{agreement.manager_mandate_ref}</p>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
};
