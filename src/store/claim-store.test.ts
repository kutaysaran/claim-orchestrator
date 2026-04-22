import { beforeEach, describe, expect, it } from "vitest";

import { defaultAnalyzerState } from "@/lib/claim/analyzer";
import { mockClaimData } from "@/lib/data/mock-claim";
import { selectTimelineNodes, useClaimStore } from "@/store/claim-store";

describe("claim store node actions", () => {
  beforeEach(() => {
    localStorage.clear();
    useClaimStore.setState({
      baseNodes: [],
      insertedNodes: [],
      explanations: {},
      documentAnalyzer: defaultAnalyzerState,
      initializedForFileNo: null,
      nextPlacementOrder: 0,
    });
  });

  it("inserts multiple nodes after the same process step in a stable order", () => {
    const state = useClaimStore.getState();
    state.initializeNodes("file-1", mockClaimData.processDetails.slice(0, 2));

    const firstStepId = useClaimStore.getState().baseNodes[0]?.id;
    if (!firstStepId) {
      throw new Error("Expected a base node to exist.");
    }

    useClaimStore.getState().insertNodeAfter(firstStepId, "information-note");
    useClaimStore.getState().insertNodeAfter(firstStepId, "additional-attachment");

    const orderedNodes = selectTimelineNodes(useClaimStore.getState());

    expect(orderedNodes.map((node) => node.title)).toEqual([
      "Towing Service",
      "Information Note",
      "Additional Attachment",
      "Claim Notification",
    ]);
  });

  it("removes only inserted nodes and keeps process steps intact", () => {
    const state = useClaimStore.getState();
    state.initializeNodes("file-2", mockClaimData.processDetails.slice(0, 2));

    const firstStepId = useClaimStore.getState().baseNodes[0]?.id;
    if (!firstStepId) {
      throw new Error("Expected a base node to exist.");
    }

    useClaimStore.getState().insertNodeAfter(firstStepId, "information-note");
    const insertedNodeId = useClaimStore.getState().insertedNodes[0]?.id;

    if (!insertedNodeId) {
      throw new Error("Expected an inserted node to exist.");
    }

    useClaimStore.getState().removeInsertedNode(insertedNodeId);

    expect(useClaimStore.getState().insertedNodes).toHaveLength(0);
    expect(selectTimelineNodes(useClaimStore.getState()).map((node) => node.title)).toEqual([
      "Towing Service",
      "Claim Notification",
    ]);
  });

  it("preserves inserted nodes when the same file is re-initialized", () => {
    const state = useClaimStore.getState();
    state.initializeNodes("file-3", mockClaimData.processDetails.slice(0, 2));

    const firstStepId = useClaimStore.getState().baseNodes[0]?.id;
    if (!firstStepId) {
      throw new Error("Expected a base node to exist.");
    }

    useClaimStore.getState().insertNodeAfter(firstStepId, "information-note");

    useClaimStore.getState().initializeNodes("file-3", mockClaimData.processDetails.slice(0, 2));

    expect(useClaimStore.getState().insertedNodes).toHaveLength(1);
    expect(selectTimelineNodes(useClaimStore.getState()).map((node) => node.title)).toEqual([
      "Towing Service",
      "Information Note",
      "Claim Notification",
    ]);
  });
});
