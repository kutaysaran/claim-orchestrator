"use client";

import { useMemo } from "react";

import { resolveNodeComponent } from "@/components/timeline/node-registry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mergeTimelineNodes } from "@/lib/claim/nodes";
import { useClaimStore } from "@/store/claim-store";

export function Timeline() {
  const baseNodes = useClaimStore((state) => state.baseNodes);
  const insertedNodes = useClaimStore((state) => state.insertedNodes);
  const nodes = useMemo(
    () => mergeTimelineNodes(baseNodes, insertedNodes),
    [baseNodes, insertedNodes],
  );

  if (nodes.length === 0) {
    return (
      <Card className="border-dashed border-slate-300 bg-white/90">
        <CardHeader>
          <CardTitle>Timeline is empty</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Claim steps will appear here once the local claim payload is loaded.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" aria-label="Claim process timeline" role="list">
      {nodes.map((node, index) => {
        const NodeComponent = resolveNodeComponent(node);
        const isLast = index === nodes.length - 1;

        return (
          <div key={node.id} className="relative pl-6 md:pl-8" role="listitem">
            {!isLast ? (
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-[7px] top-5 w-px bg-slate-200 md:left-[11px] md:top-6"
              />
            ) : null}
            <div
              aria-hidden="true"
              className="absolute left-0 top-5 size-4 rounded-full border-2 border-white bg-sky-600 shadow-sm md:top-6 md:size-6 md:border-4"
            />
            <NodeComponent node={node} />
          </div>
        );
      })}
    </div>
  );
}
