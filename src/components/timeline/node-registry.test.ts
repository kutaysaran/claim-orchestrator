import { describe, expect, it } from "vitest";

import { AttachmentNode } from "@/components/nodes/attachment-node";
import { GenericProcessNode } from "@/components/nodes/generic-process-node";
import { NoteNode } from "@/components/nodes/note-node";
import { TowingNode } from "@/components/nodes/towing-node";
import { resolveNodeComponent } from "@/components/timeline/node-registry";
import { createInsertedNode, toProcessNodes, type ClaimNode } from "@/lib/claim/nodes";
import { mockClaimData } from "@/lib/data/mock-claim";

describe("node registry", () => {
  it("resolves known process nodes to their dedicated component", () => {
    const [processNode] = toProcessNodes(mockClaimData.processDetails.slice(0, 1));

    expect(resolveNodeComponent(processNode)).toBe(TowingNode);
  });

  it("resolves inserted information notes to the inserted node component", () => {
    const insertedNode = createInsertedNode("information-note", "anchor-1", 0);

    expect(resolveNodeComponent(insertedNode)).toBe(NoteNode);
  });

  it("resolves inserted attachments to the attachment component", () => {
    const insertedNode = createInsertedNode("additional-attachment", "anchor-1", 0);

    expect(resolveNodeComponent(insertedNode)).toBe(AttachmentNode);
  });

  it("falls back to the generic component for unknown descriptors", () => {
    const unknownNode = {
      id: "custom-node",
      kind: "process",
      descriptor: "process:Custom Step",
      removable: false,
      title: "Custom Step",
      status: "Pending",
      detail: "Unknown payload",
    } as ClaimNode;

    expect(resolveNodeComponent(unknownNode)).toBe(GenericProcessNode);
  });
});
