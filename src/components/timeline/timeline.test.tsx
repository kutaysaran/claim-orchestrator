import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { defaultAnalyzerState } from "@/lib/claim/analyzer";
import { Timeline } from "@/components/timeline/timeline";
import { useClaimStore } from "@/store/claim-store";

describe("timeline", () => {
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

  it("shows an empty state when there are no nodes to render", () => {
    render(<Timeline />);

    expect(screen.getByText("Timeline is empty")).toBeInTheDocument();
    expect(
      screen.getByText(/Claim steps will appear here once the local claim payload is loaded./i),
    ).toBeInTheDocument();
  });
});
