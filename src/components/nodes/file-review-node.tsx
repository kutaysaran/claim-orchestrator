import { createConfiguredProcessNode } from "@/components/nodes/configured-process-node";

export const FileReviewNode = createConfiguredProcessNode("File Review", [
  { label: "Referral Date", value: (node) => node.reviewReferralDate },
  { label: "Completion Target", value: (node) => node.reviewCompletionDate },
]);
