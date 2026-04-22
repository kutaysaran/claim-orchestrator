import { createConfiguredProcessNode } from "@/components/nodes/configured-process-node";

export const DeductionNode = createConfiguredProcessNode("Deduction Reason", [
  { label: "Action Required", value: (node) => node.actionRequired },
  { label: "Occupational Deduction", value: (node) => node.occupationalDeduction },
  { label: "Appreciation Deduction", value: (node) => node.appreciationDeduction },
  { label: "Policy Deductible", value: (node) => node.policyDeductible },
  { label: "Non Damage Amount", value: (node) => node.nonDamageAmount },
]);
