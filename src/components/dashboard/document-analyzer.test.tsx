import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DocumentAnalyzer } from "@/components/dashboard/document-analyzer";
import { defaultAnalyzerState } from "@/lib/claim/analyzer";
import { getClaimInsights } from "@/lib/claim/actionability";
import { createInsertedNode } from "@/lib/claim/nodes";
import { mockClaimData } from "@/lib/data/mock-claim";
import { useClaimStore } from "@/store/claim-store";

describe("document analyzer", () => {
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

  it("links a successful analysis to the latest attachment and updates the flow message", async () => {
    vi.useFakeTimers();

    const attachmentNode = createInsertedNode("additional-attachment", "step-anchor", 0);
    useClaimStore.setState({ insertedNodes: [attachmentNode] });

    const insights = getClaimInsights(
      mockClaimData,
      useClaimStore.getState().insertedNodes,
      useClaimStore.getState().documentAnalyzer,
    );

    render(<DocumentAnalyzer insights={insights} />);
    const file = new File(["proof"], "occupational-certificate.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(screen.getByLabelText(/Upload Occupational Certificate/i), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Analyze document" }));

    expect(screen.getByRole("button", { name: "Analyzing..." })).toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByText(/validation passed/i)).toBeInTheDocument();
    expect(screen.getByText(/Attach the validated file to the claim timeline/i)).toBeInTheDocument();

    const updatedAttachment = useClaimStore.getState().insertedNodes[0];
    expect(updatedAttachment?.nodeType).toBe("additional-attachment");
    if (updatedAttachment?.nodeType === "additional-attachment") {
      expect(updatedAttachment.validation).toBe("Validated by simulated AI");
      expect(updatedAttachment.status).toBe("Ready for review");
    }
  });
});
