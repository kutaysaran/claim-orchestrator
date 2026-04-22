import { createConfiguredProcessNode } from "@/components/nodes/configured-process-node";

export const TowingNode = createConfiguredProcessNode("Towing Service", [
  { label: "Pickup Location", value: (node) => node.pickupLocation },
  { label: "Towing Date", value: (node) => node.towingDate },
]);
