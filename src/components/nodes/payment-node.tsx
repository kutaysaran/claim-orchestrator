import { createConfiguredProcessNode } from "@/components/nodes/configured-process-node";

export const PaymentNode = createConfiguredProcessNode("Payment Information", [
  { label: "Paid To", value: (node) => node.paidTo },
  { label: "IBAN", value: (node) => node.iban },
  { label: "Payment Amount", value: (node) => node.paymentAmount },
  { label: "Note", value: (node) => node.note },
]);
