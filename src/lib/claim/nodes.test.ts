import { describe, expect, it } from "vitest";

import { mockClaimData } from "@/lib/data/mock-claim";
import {
  canInsertAfter,
  canRemoveNode,
  createInsertedNode,
  mergeTimelineNodes,
  toProcessNodes,
} from "@/lib/claim/nodes";

describe("node management helpers", () => {
  it("merges inserted nodes after their anchor in placement order", () => {
    const baseNodes = toProcessNodes(mockClaimData.processDetails.slice(0, 2));
    const noteNode = createInsertedNode("information-note", baseNodes[0].id, 0);
    const attachmentNode = createInsertedNode(
      "additional-attachment",
      baseNodes[0].id,
      1,
    );

    const mergedNodes = mergeTimelineNodes(baseNodes, [attachmentNode, noteNode]);

    expect(mergedNodes.map((node) => node.title)).toEqual([
      baseNodes[0].title,
      "Information Note",
      "Additional Attachment",
      baseNodes[1].title,
    ]);
  });

  it("exposes insert and remove permissions by node kind", () => {
    const [processNode] = toProcessNodes(mockClaimData.processDetails.slice(0, 1));
    const noteNode = createInsertedNode("information-note", processNode.id, 0);

    expect(canInsertAfter(processNode)).toBe(true);
    expect(canInsertAfter(noteNode)).toBe(false);
    expect(canRemoveNode(processNode)).toBe(false);
    expect(canRemoveNode(noteNode)).toBe(true);
  });
});
