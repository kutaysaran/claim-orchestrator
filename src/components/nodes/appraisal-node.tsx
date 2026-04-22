import { createConfiguredProcessNode } from "@/components/nodes/configured-process-node";

export const AppraisalNode = createConfiguredProcessNode("Appraisal", [
  { label: "Assignment Date", value: (node) => node.expertAssignmentDate },
  { label: "Expert Info", value: (node) => node.expertInfo },
  { label: "Contact", value: (node) => node.contact },
]);
