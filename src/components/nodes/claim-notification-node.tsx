import { createConfiguredProcessNode } from "@/components/nodes/configured-process-node";

export const ClaimNotificationNode = createConfiguredProcessNode("Claim Notification", [
  { label: "Date & Time", value: (node) => node.dateTime },
  { label: "Report Type", value: (node) => node.reportType },
  { label: "Damage Reason", value: (node) => node.reasonForDamage },
  { label: "Reported By", value: (node) => node.reportingParty },
  { label: "Contact", value: (node) => node.contact },
]);
