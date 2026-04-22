import type { ClaimResponse } from "@/lib/schemas/claim";

import type { AnalyzerState } from "@/lib/claim/analyzer";
import type { InsertedNode } from "@/lib/claim/nodes";

export type ClaimInsights = {
  nextAction: string;
  nextActionLabel: string;
  targetDocument: string | null;
  blockerTitle: string | null;
  activeTaskSummary: string;
  userContributionSummary: string;
};

function getLatestInsertedNodeSummary(insertedNodes: InsertedNode[]) {
  const latestNode = [...insertedNodes].sort((left, right) =>
    left.createdAt < right.createdAt ? 1 : -1,
  )[0];

  if (!latestNode) {
    return "No extra claimant context added yet.";
  }

  if (latestNode.nodeType === "information-note") {
    return `Latest note: ${latestNode.noteTitle}.`;
  }

  return `Latest attachment: ${latestNode.documentName} (${latestNode.validation}).`;
}

export function getClaimInsights(
  claim: ClaimResponse,
  insertedNodes: InsertedNode[],
  analyzerState: AnalyzerState,
): ClaimInsights {
  const deductionStep = claim.processDetails.find(
    (detail): detail is Extract<(typeof claim.processDetails)[number], { title: "Deduction Reason" }> =>
      detail.title === "Deduction Reason" && detail.status === "Pending",
  );

  const targetDocument = deductionStep?.actionRequired?.replace(/^Upload\s+/i, "") ?? null;
  const latestAttachment = [...insertedNodes]
    .filter((node) => node.nodeType === "additional-attachment")
    .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))[0];

  if (targetDocument && analyzerState.status === "success") {
    return {
      nextAction:
        analyzerState.suggestedNextAction ??
        `${targetDocument} is validated. Add it to the timeline and the file review can continue.`,
      nextActionLabel: "Ready to submit",
      targetDocument,
      blockerTitle: deductionStep?.title ?? null,
      activeTaskSummary: `${targetDocument} has been checked and is ready for reviewer follow-up.`,
      userContributionSummary: latestAttachment
        ? `Supporting attachment ready: ${latestAttachment.documentName}.`
        : getLatestInsertedNodeSummary(insertedNodes),
    };
  }

  if (targetDocument && analyzerState.selectedFileName) {
    return {
      nextAction:
        analyzerState.suggestedNextAction ??
        `Analyze the selected ${targetDocument} before you send it for review.`,
      nextActionLabel: "Validation required",
      targetDocument,
      blockerTitle: deductionStep?.title ?? null,
      activeTaskSummary: `${targetDocument} is selected but still waiting for analyzer confirmation.`,
      userContributionSummary: getLatestInsertedNodeSummary(insertedNodes),
    };
  }

  if (deductionStep) {
    return {
      nextAction: deductionStep.actionRequired,
      nextActionLabel: "Action needed",
      targetDocument,
      blockerTitle: deductionStep.title,
      activeTaskSummary: "File review is waiting on claimant-provided proof.",
      userContributionSummary: getLatestInsertedNodeSummary(insertedNodes),
    };
  }

  return {
    nextAction: "No immediate action required",
    nextActionLabel: "On track",
    targetDocument: null,
    blockerTitle: null,
    activeTaskSummary: "The current claim milestones are progressing without a blocking document.",
    userContributionSummary: getLatestInsertedNodeSummary(insertedNodes),
  };
}
