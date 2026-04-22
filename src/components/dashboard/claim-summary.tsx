import { AlertCircle, Clock3, FileText, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ClaimInsights } from "@/lib/claim/actionability";
import type { ClaimResponse } from "@/lib/schemas/claim";

function SummaryMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof FileText;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 md:p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 md:text-sm">
        <Icon aria-hidden="true" className="size-4 text-sky-600" />
        {label}
      </div>
      <div className="mt-1.5 text-base font-semibold text-slate-950 md:mt-2 md:text-lg">
        {value}
      </div>
    </div>
  );
}

export function ClaimSummary({
  claim,
  insights,
}: {
  claim: ClaimResponse;
  insights: ClaimInsights;
}) {
  return (
    <Card className="border-slate-200 bg-white/95">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge variant="info" className="mb-3">
              AI-Powered Claim Orchestrator
            </Badge>
            <CardTitle className="text-xl md:text-2xl">Claim Overview</CardTitle>
            <CardDescription>
              Core answers surfaced first so the claimant can self-serve quickly.
            </CardDescription>
          </div>
          <div className="rounded-2xl bg-sky-50 px-3 py-2.5 text-xs text-sky-950 md:px-4 md:py-3 md:text-sm">
            <div className="font-medium text-sky-700">Current status</div>
            <div className="mt-1 font-semibold">{claim.currentStatus}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <SummaryMetric label="File Number" value={claim.fileNo} icon={FileText} />
        <SummaryMetric
          label="Remaining Time"
          value={claim.estimatedRemainingTime}
          icon={Clock3}
        />
        <SummaryMetric label="Current Stage" value={claim.currentStatus} icon={ShieldCheck} />

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 md:col-span-2 md:p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-700 md:text-sm">
            <AlertCircle aria-hidden="true" className="size-4" />
            {insights.nextActionLabel}
          </div>
          <p className="mt-2 text-xs font-medium text-amber-950 md:text-sm">
            {insights.nextAction}
          </p>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-3 md:col-span-1 md:p-4">
          <div className="text-xs font-medium text-violet-700 md:text-sm">Claimant input</div>
          <p className="mt-2 text-xs font-medium text-violet-950 md:text-sm">
            {insights.userContributionSummary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
