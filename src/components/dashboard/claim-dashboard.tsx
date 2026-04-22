"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, FileWarning } from "lucide-react";

import { ClaimSummary } from "@/components/dashboard/claim-summary";
import { DocumentAnalyzer } from "@/components/dashboard/document-analyzer";
import { Timeline } from "@/components/timeline/timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClaimInsights } from "@/lib/claim/actionability";
import { fetchClaimData } from "@/lib/api/claims";
import { useClaimStore } from "@/store/claim-store";

export function ClaimDashboard() {
  const initializeNodes = useClaimStore((state) => state.initializeNodes);
  const insertedNodes = useClaimStore((state) => state.insertedNodes);
  const documentAnalyzer = useClaimStore((state) => state.documentAnalyzer);
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["claim-process"],
    queryFn: fetchClaimData,
  });

  const insights = useMemo(
    () => (data ? getClaimInsights(data, insertedNodes, documentAnalyzer) : null),
    [data, documentAnalyzer, insertedNodes],
  );

  useEffect(() => {
    if (data) {
      initializeNodes(data.fileNo, data.processDetails);
    }
  }, [data, initializeNodes]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl space-y-4">
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900"
          >
            Loading claim data and preparing the timeline.
          </div>
          <div aria-hidden="true" className="animate-pulse space-y-6">
          <div className="h-48 rounded-3xl bg-slate-200" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_320px] xl:grid-cols-[minmax(0,2fr)_360px]">
            <div className="h-[720px] rounded-3xl bg-slate-200" />
            <div className="h-72 rounded-3xl bg-slate-200" />
          </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <Badge variant="warning" className="w-fit">
                Data Error
              </Badge>
              <CardTitle>Claim data could not be loaded</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>
                {error instanceof Error
                  ? error.message
                  : "Unexpected error while loading claim data."}
              </p>
              <p className="text-slate-500">
                Retry the local claim feed and continue once the dashboard is available again.
              </p>
              <Button
                onClick={() => {
                  void refetch();
                }}
                disabled={isFetching}
              >
                {isFetching ? "Retrying..." : "Try again"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe,transparent_38%),linear-gradient(180deg,#f8fafc_0%,#f8fafc_100%)] px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {insights ? <ClaimSummary claim={data} insights={insights} /> : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_320px] lg:items-start xl:grid-cols-[minmax(0,2fr)_360px]">
          <section className="space-y-3 md:space-y-4">
            <div className="flex flex-col gap-2">
              <Badge
                variant="default"
                className="w-fit border border-sky-200 bg-white/85 text-sky-700 shadow-sm backdrop-blur-sm"
              >
                Process Timeline
              </Badge>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">
                Claim journey
              </h2>
              <p className="text-xs text-slate-600 md:text-sm">
                Each step can be explained by AI and enriched with information notes or
                additional attachments.
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-sky-700">
                Changes are saved locally on this device.
              </p>
            </div>
            <Timeline />
          </section>

          <aside className="space-y-4 lg:sticky lg:top-8">
            {insights ? (
              <Card className="border-slate-200">
                <CardHeader className="gap-2">
                  <Badge variant="warning">Action center</Badge>
                  <CardTitle className="flex items-center gap-2">
                    <FileWarning className="size-4 text-amber-600" />
                    Current blocker
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-slate-700 md:text-sm">
                  <p>{insights.activeTaskSummary}</p>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <Activity className="size-3.5" />
                      User contribution
                    </div>
                    <p>{insights.userContributionSummary}</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {insights ? <DocumentAnalyzer insights={insights} /> : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
