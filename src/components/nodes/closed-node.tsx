import { createConfiguredProcessNode } from "@/components/nodes/configured-process-node";

export const ClosedNode = createConfiguredProcessNode("Closed", [
  { label: "Completion Date", value: (node) => node.completionDate },
]);
