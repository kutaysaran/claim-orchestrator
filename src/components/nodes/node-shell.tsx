"use client";

import { useId } from "react";
import { BrainCircuit, NotebookText, Paperclip, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExplainButtonLabel } from "@/lib/claim/ai-explanations";
import {
  canInsertAfter,
  canRemoveNode,
  getAnchorNodeTitle,
  isInsertedNode,
} from "@/lib/claim/nodes";
import { cn } from "@/lib/utils";
import { type ClaimNode, useClaimStore } from "@/store/claim-store";

type NodeShellProps = {
  node: ClaimNode;
  children: React.ReactNode;
  className?: string;
};

function getStatusVariant(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("completed")) {
    return "success" as const;
  }

  if (normalized.includes("progress")) {
    return "info" as const;
  }

  if (normalized.includes("pending") || normalized.includes("awaiting")) {
    return "warning" as const;
  }

  return "default" as const;
}

export function NodeShell({ node, children, className }: NodeShellProps) {
  const headingId = useId();
  const explanationId = useId();
  const explanation = useClaimStore((state) => state.explanations[node.id]);
  const explainNode = useClaimStore((state) => state.explainNode);
  const insertNodeAfter = useClaimStore((state) => state.insertNodeAfter);
  const removeInsertedNode = useClaimStore((state) => state.removeInsertedNode);
  const baseNodes = useClaimStore((state) => state.baseNodes);
  const anchorTitle =
    isInsertedNode(node) && node.anchorAfterId
      ? getAnchorNodeTitle(baseNodes, node.anchorAfterId)
      : null;
  const contributionHint =
    node.kind === "inserted"
      ? node.nodeType === "information-note"
        ? node.contributionHint
        : node.linkedAction
          ? `Supports the "${node.linkedAction}" request in the current claim flow.`
          : "Provides supporting evidence for the current review."
      : null;

  return (
    <Card
      className={cn("overflow-hidden border-slate-200", className)}
      role="article"
      aria-labelledby={headingId}
    >
      <CardHeader className="gap-3 border-b border-slate-100 pb-3 md:gap-4 md:pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-sky-600">
              {node.kind === "process" ? "Timeline Step" : "Inserted Node"}
            </div>
            <CardTitle id={headingId}>{node.title}</CardTitle>
            {anchorTitle ? (
              <p className="text-xs text-slate-500 md:text-sm">Added after {anchorTitle}</p>
            ) : null}
          </div>
          <Badge variant={getStatusVariant(node.status)}>{node.status}</Badge>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label={`${node.title} actions`}>
          {canInsertAfter(node) ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                disabled={explanation?.status === "loading"}
                aria-describedby={explanation?.status ? explanationId : undefined}
                onClick={() => {
                  void explainNode(node);
                }}
              >
                <BrainCircuit aria-hidden="true" className="size-4" />
                {getExplainButtonLabel(
                  explanation?.requestCount ?? 0,
                  explanation?.status ?? "idle",
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => insertNodeAfter(node.id, "information-note")}
              >
                <NotebookText aria-hidden="true" className="size-4" />
                Insert Information Note
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => insertNodeAfter(node.id, "additional-attachment")}
              >
                <Paperclip aria-hidden="true" className="size-4" />
                Insert Additional Attachment
              </Button>
            </>
          ) : null}
          {canRemoveNode(node) ? (
            <Button
              size="sm"
              variant="outline"
              className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              onClick={() => removeInsertedNode(node.id)}
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Remove
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4 md:pt-6">
        {contributionHint ? (
          <div className="rounded-xl border border-violet-100 bg-violet-50 p-3 text-xs text-violet-950 md:text-sm">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-700">
              Product Context
            </div>
            <p>{contributionHint}</p>
          </div>
        ) : null}

        {children}

        {explanation?.status === "loading" ? (
          <div
            id={explanationId}
            role="status"
            aria-live="polite"
            className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-xs text-sky-950 md:p-4 md:text-sm"
          >
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
              AI Summary
            </div>
            <p>Summarizing this step in plain language...</p>
          </div>
        ) : null}

        {explanation?.status === "ready" ? (
          <div
            id={explanationId}
            role="status"
            aria-live="polite"
            className="rounded-xl border border-sky-100 bg-sky-50 p-3 text-xs text-sky-950 md:p-4 md:text-sm"
          >
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
              AI Summary
            </div>
            <p>{explanation.text}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
