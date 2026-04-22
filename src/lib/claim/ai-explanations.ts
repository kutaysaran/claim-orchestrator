import type { ClaimNode } from "@/lib/claim/nodes";

function formatCurrencyHint(value: string) {
  return value ? ` The amount currently shown is ${value}.` : "";
}

function getProcessExplanation(node: Extract<ClaimNode, { kind: "process" }>, attempt: number) {
  const nodeTitle = node.title;
  const nodeStatus = node.status.toLowerCase();

  switch (node.title) {
    case "Towing Service":
      return attempt === 0
        ? `In simple terms, the towing step is already finished. Your vehicle was collected from ${node.pickupLocation} on ${node.towingDate}, so there is nothing left for you to do here.`
        : `This step only confirms the vehicle transfer. Because towing is marked ${node.status.toLowerCase()}, the claim has already moved beyond roadside logistics.`;
    case "Claim Notification":
      return attempt === 0
        ? `This means the insurer has officially received the claim. The incident was recorded as ${node.reasonForDamage.toLowerCase()} with a ${node.reportType.toLowerCase()} report, so the file can move into review stages.`
        : `Plain language version: the claim was formally opened at ${node.dateTime}. The report and contact details are already on file, so you do not need to repeat the original notice.`;
    case "Appraisal":
      return attempt === 0
        ? `An expert assessment has already been completed. ${node.expertInfo} was assigned on ${node.expertAssignmentDate}, which means the insurer has the technical damage estimate it needs.`
        : `This step is the damage valuation phase. Because it is marked ${node.status.toLowerCase()}, the file review team can use the expert findings instead of waiting for another inspection.`;
    case "Substitute Rental Vehicle":
      return attempt === 0
        ? `This benefit is already completed. A ${node.vehicleModel} was provided for ${node.vehicleDuration}, so this step is only here as a service history record.`
        : `In short, the replacement vehicle service has already been used and closed. There is no action pending for rental coverage.`;
    case "File Review":
      return attempt === 0
        ? `Your file is currently in the internal review queue. The team received it on ${node.reviewReferralDate}, and they are checking whether any missing documents or payment blockers remain.`
        : `This is the insurer's decision phase. Until review is completed, the file can still ask for extra evidence before payment is released.`;
    case "Deduction Reason":
      return attempt === 0
        ? `This step is important because it can block progress. The insurer is waiting for you to ${node.actionRequired.toLowerCase()} before finalizing the deductions.${formatCurrencyHint(node.policyDeductible)}`
        : `Plain language: the claim is paused on a missing document. Once the requested certificate is validated, the deduction amounts can be reviewed and the file can move forward.`;
    case "Payment Information":
      return attempt === 0
        ? `This step prepares the payout details. If the previous review finishes cleanly, the insurer plans to pay ${node.paymentAmount} to ${node.paidTo}.`
        : `This is the payment setup phase. The bank details and refund note are already recorded, but transfer usually waits until review blockers are cleared.`;
    case "Closed":
      return attempt === 0
        ? `This is the final state of the claim. Because it is still marked ${node.status.toLowerCase()}, the file has not reached full closure yet.`
        : `In simple terms, closure only happens after review and payment are done. This row shows the end state the file is heading toward.`;
    default:
      return attempt === 0
        ? `${nodeTitle} is part of the claim journey and is currently marked ${nodeStatus}.`
        : `This step records a claim milestone so the claimant can understand where the file stands.`;
  }
}

function getInsertedExplanation(node: Extract<ClaimNode, { kind: "inserted" }>, attempt: number) {
  if (node.nodeType === "information-note") {
    return attempt === 0
      ? `This note adds claimant context to the timeline. "${node.noteTitle}" helps the reviewer understand the extra instruction or expectation behind the file.`
      : `Plain language: this is not an insurer milestone, it is user-supplied context. It can help the file owner or support team act with better context.`;
  }

  return attempt === 0
    ? `This attachment is meant to support a pending review task. The current document is "${node.documentName}", and its validation state is "${node.validation}".`
    : `This node keeps supporting evidence visible in the process timeline. It helps connect uploaded documents to the exact step they are meant to unblock.`;
}

export function buildAiExplanation(node: ClaimNode, requestCount: number) {
  const attempt = requestCount % 2;

  if (node.kind === "process") {
    return getProcessExplanation(node, attempt);
  }

  return getInsertedExplanation(node, attempt);
}

export function getExplainButtonLabel(requestCount: number, status: "idle" | "loading" | "ready") {
  if (status === "loading") {
    return "Thinking...";
  }

  return requestCount > 0 ? "Rephrase with AI" : "Explain with AI";
}
