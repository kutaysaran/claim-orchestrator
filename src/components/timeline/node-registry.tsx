import type { ComponentType } from "react";

import { AppraisalNode } from "@/components/nodes/appraisal-node";
import { AttachmentNode } from "@/components/nodes/attachment-node";
import { ClaimNotificationNode } from "@/components/nodes/claim-notification-node";
import { ClosedNode } from "@/components/nodes/closed-node";
import { DeductionNode } from "@/components/nodes/deduction-node";
import { FileReviewNode } from "@/components/nodes/file-review-node";
import { GenericProcessNode } from "@/components/nodes/generic-process-node";
import { NoteNode } from "@/components/nodes/note-node";
import { PaymentNode } from "@/components/nodes/payment-node";
import { SubstituteRentalNode } from "@/components/nodes/substitute-rental-node";
import { TowingNode } from "@/components/nodes/towing-node";
import type { ClaimNode } from "@/store/claim-store";

type NodeComponent = ComponentType<{ node: ClaimNode }>;

export const nodeRegistry: Partial<Record<ClaimNode["descriptor"], NodeComponent>> = {
  "process:Towing Service": TowingNode,
  "process:Claim Notification": ClaimNotificationNode,
  "process:Appraisal": AppraisalNode,
  "process:Substitute Rental Vehicle": SubstituteRentalNode,
  "process:File Review": FileReviewNode,
  "process:Deduction Reason": DeductionNode,
  "process:Payment Information": PaymentNode,
  "process:Closed": ClosedNode,
  "inserted:information-note": NoteNode,
  "inserted:additional-attachment": AttachmentNode,
};

export function resolveNodeComponent(node: ClaimNode) {
  return nodeRegistry[node.descriptor] ?? GenericProcessNode;
}
