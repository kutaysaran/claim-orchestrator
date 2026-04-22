"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NodeShell } from "@/components/nodes/node-shell";
import type { ClaimNode } from "@/store/claim-store";
import { useClaimStore } from "@/store/claim-store";

export function NoteNode({ node }: { node: ClaimNode }) {
  const autoEditingNodeId = useClaimStore((state) => state.autoEditingNodeId);
  const clearAutoEditingNode = useClaimStore((state) => state.clearAutoEditingNode);
  const [isEditing, setIsEditing] = useState(() => autoEditingNodeId === node.id);
  const updateInsertedNode = useClaimStore((state) => state.updateInsertedNode);

  if (node.kind !== "inserted" || node.nodeType !== "information-note") {
    return null;
  }

  function handleToggleEdit() {
    const next = !isEditing;

    setIsEditing(next);

    if (!next || autoEditingNodeId === node.id) {
      clearAutoEditingNode(node.id);
    }
  }

  return (
    <NodeShell node={node}>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button size="sm" variant={isEditing ? "secondary" : "outline"} onClick={handleToggleEdit}>
            {isEditing ? "Done" : "Edit note"}
          </Button>
        </div>

        {isEditing ? (
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
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Note title
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-950">{node.noteTitle}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Note details
              </div>
              <p className="mt-1 text-sm text-slate-700">{node.content}</p>
            </div>
          </div>
        )}
      </div>
    </NodeShell>
  );
}
