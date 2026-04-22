"use client";

import { useState } from "react";

import { NodeFieldList } from "@/components/nodes/node-field-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NodeShell } from "@/components/nodes/node-shell";
import type { ClaimNode } from "@/store/claim-store";
import { useClaimStore } from "@/store/claim-store";

export function AttachmentNode({ node }: { node: ClaimNode }) {
  const autoEditingNodeId = useClaimStore((state) => state.autoEditingNodeId);
  const clearAutoEditingNode = useClaimStore((state) => state.clearAutoEditingNode);
  const [isEditing, setIsEditing] = useState(() => autoEditingNodeId === node.id);
  const updateInsertedNode = useClaimStore((state) => state.updateInsertedNode);

  function handleFileSelect(file: File | null) {
    if (!file) {
      return;
    }

    updateInsertedNode(node.id, {
      documentName: file.name,
      validation: "File selected locally",
      status: "Draft evidence",
    });
  }

  if (node.kind !== "inserted" || node.nodeType !== "additional-attachment") {
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
      <div className="grid gap-4">
        <div className="flex justify-end">
          <Button size="sm" variant={isEditing ? "secondary" : "outline"} onClick={handleToggleEdit}>
            {isEditing ? "Done" : "Edit attachment"}
          </Button>
        </div>

        {isEditing ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor={`${node.id}-file`}>
                Select file
              </label>
              <Input
                id={`${node.id}-file`}
                type="file"
                className="cursor-pointer"
                onChange={(event) => handleFileSelect(event.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-slate-500">
                The selected file is not uploaded yet, but its name is stored locally in the
                timeline.
              </p>
              {node.linkedAction ? (
                <p className="text-xs font-medium text-violet-700">
                  This attachment is currently mapped to: {node.linkedAction}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor={`${node.id}-documentName`}
              >
                Document name
              </label>
              <Input
                id={`${node.id}-documentName`}
                value={node.documentName}
                onChange={(event) =>
                  updateInsertedNode(node.id, { documentName: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor={`${node.id}-description`}
              >
                Description
              </label>
              <Textarea
                id={`${node.id}-description`}
                value={node.description}
                onChange={(event) =>
                  updateInsertedNode(node.id, { description: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor={`${node.id}-validation`}
              >
                Validation status
              </label>
              <Input
                id={`${node.id}-validation`}
                value={node.validation}
                onChange={(event) =>
                  updateInsertedNode(node.id, { validation: event.target.value })
                }
              />
            </div>
          </>
        ) : (
          <>
            <NodeFieldList
              fields={[
                { label: "Document Name", value: node.documentName },
                { label: "Validation Status", value: node.validation },
              ]}
            />
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Description
              </div>
              <p className="mt-1 text-sm text-slate-700">{node.description}</p>
            </div>
            {node.linkedAction ? (
              <div className="rounded-xl border border-violet-100 bg-violet-50 p-3 text-sm text-violet-900">
                This attachment is currently mapped to: {node.linkedAction}
              </div>
            ) : null}
          </>
        )}
      </div>
    </NodeShell>
  );
}
