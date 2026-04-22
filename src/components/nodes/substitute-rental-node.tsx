import { createConfiguredProcessNode } from "@/components/nodes/configured-process-node";

export const SubstituteRentalNode = createConfiguredProcessNode("Substitute Rental Vehicle", [
  { label: "Vehicle Duration", value: (node) => node.vehicleDuration },
  { label: "Vehicle Model", value: (node) => node.vehicleModel },
  { label: "Extra Duration", value: (node) => node.extraDuration },
]);
