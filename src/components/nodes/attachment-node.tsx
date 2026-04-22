"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NodeShell } from "@/components/nodes/node-shell";
import type { ClaimNode } from "@/store/claim-store";
import { useClaimStore } from "@/store/claim-store";

export function AttachmentNode({ node }: { node: ClaimNode }) {
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

  return (
    <NodeShell node={node}>
      <div className="grid gap-4">
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
      </div>
    </NodeShell>
  );
}
