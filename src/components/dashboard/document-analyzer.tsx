"use client";

import { useId, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAnalyzerTargetLabel } from "@/lib/claim/analyzer";
import type { ClaimInsights } from "@/lib/claim/actionability";
import { useClaimStore } from "@/store/claim-store";

export function DocumentAnalyzer({ insights }: { insights: ClaimInsights }) {
  const titleId = useId();
  const fileHelpId = useId();
  const fileMetaId = useId();
  const resultId = useId();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const documentAnalyzer = useClaimStore((state) => state.documentAnalyzer);
  const selectAnalyzerFile = useClaimStore((state) => state.selectAnalyzerFile);
  const runDocumentAnalysis = useClaimStore((state) => state.analyzeDocument);
  const targetLabel = getAnalyzerTargetLabel(insights.targetDocument);

  const selectedMeta = useMemo(
    () =>
      selectedFile
        ? `${selectedFile.name} · ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
        : documentAnalyzer.selectedFileName
          ? `${documentAnalyzer.selectedFileName} · waiting for local re-selection`
          : "No file selected",
    [documentAnalyzer.selectedFileName, selectedFile],
  );

  function handleAnalyzeDocument() {
    if (!selectedFile) {
      selectAnalyzerFile(null, insights.targetDocument);
      return;
    }

    void runDocumentAnalysis(
      {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
      },
      insights.targetDocument,
    );
  }

  return (
    <Card className="border-slate-200" role="region" aria-labelledby={titleId}>
      <CardHeader>
        <Badge variant="info" className="w-fit">
          Simulated AI
        </Badge>
        <CardTitle id={titleId}>Document Analyzer</CardTitle>
        <CardDescription>
          Validate the exact document that is blocking the current claim step before
          submission.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-xs text-sky-950 md:text-sm">
          <div className="font-semibold text-sky-700">Requested document</div>
          <p className="mt-1">{targetLabel}</p>
          <p className="mt-2 text-sky-800">{insights.activeTaskSummary}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="document-upload">
            Upload {targetLabel}
          </label>
          <Input
            id="document-upload"
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp"
            aria-describedby={`${fileHelpId} ${fileMetaId} ${resultId}`}
            aria-invalid={documentAnalyzer.status === "error"}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setSelectedFile(file);
              selectAnalyzerFile(file?.name ?? null, insights.targetDocument);
            }}
          />
          <p id={fileHelpId} className="text-xs text-slate-500">
            Accepted formats: PDF, PNG, JPG, JPEG, and WEBP up to 5 MB.
          </p>
          <p id={fileMetaId} className="text-xs text-slate-500">
            {selectedMeta}
          </p>
        </div>

        <Button
          className="w-full"
          disabled={documentAnalyzer.status === "loading"}
          aria-describedby={resultId}
          onClick={handleAnalyzeDocument}
        >
          {documentAnalyzer.status === "loading" ? "Analyzing..." : "Analyze document"}
        </Button>

        <div
          id={resultId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={`rounded-2xl border p-4 text-sm ${
            documentAnalyzer.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
              : documentAnalyzer.status === "error"
                ? "border-rose-200 bg-rose-50 text-rose-950"
                : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {documentAnalyzer.message}
          {documentAnalyzer.suggestedNextAction ? (
            <p className="mt-2 text-xs font-medium md:text-sm">
              Next: {documentAnalyzer.suggestedNextAction}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
