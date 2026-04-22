import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { defaultAnalyzerState } from "@/lib/claim/analyzer";
import { toProcessNodes, createInsertedNode } from "@/lib/claim/nodes";
import { mockClaimData } from "@/lib/data/mock-claim";
import { NoteNode } from "@/components/nodes/note-node";
import { TowingNode } from "@/components/nodes/towing-node";
import { useClaimStore } from "@/store/claim-store";

describe("node shell interactions", () => {
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a loading state and then a contextual explanation", async () => {
    vi.useFakeTimers();

    const [processNode] = toProcessNodes(mockClaimData.processDetails.slice(0, 1));
    useClaimStore.setState({ baseNodes: [processNode] });

    render(<TowingNode node={processNode} />);
    fireEvent.click(screen.getByRole("button", { name: "Explain with AI" }));

    expect(screen.getByRole("button", { name: "Thinking..." })).toBeDisabled();
    expect(screen.getByText("Summarizing this step in plain language...")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(
      screen.getByText(/Your vehicle was collected from Istanbul\/Kadikoy/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rephrase with AI" })).toBeInTheDocument();
  });

  it("opens newly inserted notes in edit mode and lets the user close it", () => {
    const insertedNode = createInsertedNode("information-note", "step-anchor", 0);
    useClaimStore.setState({ insertedNodes: [insertedNode], autoEditingNodeId: insertedNode.id });

    render(<NoteNode node={insertedNode} />);

    const titleInput = screen.getByLabelText("Note title");
    const noteTextarea = screen.getByLabelText("Note details");

    fireEvent.change(titleInput, { target: { value: "Callback requested" } });
    fireEvent.change(noteTextarea, {
      target: { value: "Please update the customer after document review." },
    });

    const updatedNode = useClaimStore.getState().insertedNodes[0];

    expect(updatedNode?.nodeType).toBe("information-note");
    if (updatedNode?.nodeType === "information-note") {
      expect(updatedNode.noteTitle).toBe("Callback requested");
      expect(updatedNode.content).toBe("Please update the customer after document review.");
    }

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByLabelText("Note title")).not.toBeInTheDocument();
    expect(useClaimStore.getState().autoEditingNodeId).toBeNull();
  });
});
