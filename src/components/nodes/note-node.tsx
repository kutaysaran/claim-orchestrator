"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NodeShell } from "@/components/nodes/node-shell";
import type { ClaimNode } from "@/store/claim-store";
import { useClaimStore } from "@/store/claim-store";

export function NoteNode({ node }: { node: ClaimNode }) {
  const updateInsertedNode = useClaimStore((state) => state.updateInsertedNode);

  if (node.kind !== "inserted" || node.nodeType !== "information-note") {
    return null;
  }

  return (
    <NodeShell node={node}>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor={`${node.id}-title`}>
            Note title
          </label>
          <Input
            id={`${node.id}-title`}
            value={node.noteTitle}
            onChange={(event) =>
              updateInsertedNode(node.id, { noteTitle: event.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor={node.id}>
            Note details
          </label>
          <Textarea
            id={node.id}
            value={node.content}
            onChange={(event) => updateInsertedNode(node.id, { content: event.target.value })}
          />
        </div>
      </div>
    </NodeShell>
  );
}
