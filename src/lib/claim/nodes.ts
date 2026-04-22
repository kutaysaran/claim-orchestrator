import type { ProcessDetail } from "@/lib/schemas/claim";

export type ProcessNode = ProcessDetail & {
  id: string;
  kind: "process";
  descriptor: `process:${ProcessDetail["title"]}`;
  removable: false;
};

export type InformationNoteNode = {
  id: string;
  kind: "inserted";
  nodeType: "information-note";
  descriptor: "inserted:information-note";
  title: "Information Note";
  status: string;
  removable: true;
  anchorAfterId: string;
  createdAt: string;
  placementOrder: number;
  noteTitle: string;
  content: string;
  contributionHint: string;
};

export type AdditionalAttachmentNode = {
  id: string;
  kind: "inserted";
  nodeType: "additional-attachment";
  descriptor: "inserted:additional-attachment";
  title: "Additional Attachment";
  status: string;
  removable: true;
  anchorAfterId: string;
  createdAt: string;
  placementOrder: number;
  documentName: string;
  description: string;
  validation: string;
  linkedAction: string | null;
};

export type InsertedNode = InformationNoteNode | AdditionalAttachmentNode;
export type ClaimNode = ProcessNode | InsertedNode;
export type InsertableNodeType = InsertedNode["nodeType"];
export type NodeDescriptor = ClaimNode["descriptor"];

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toProcessNodes(processDetails: ProcessDetail[]): ProcessNode[] {
  return processDetails.map((detail, index) => ({
    ...detail,
    id: `step-${index}-${slugify(detail.title)}`,
    kind: "process",
    descriptor: `process:${detail.title}`,
    removable: false,
  }));
}

export function createInsertedNode(
  type: InsertableNodeType,
  anchorAfterId: string,
  placementOrder: number,
): InsertedNode {
  const createdAt = new Date().toISOString();

  if (type === "information-note") {
    return {
      id: createId("note"),
      kind: "inserted",
      nodeType: "information-note",
      descriptor: "inserted:information-note",
      title: "Information Note",
      status: "User added",
      removable: true,
      anchorAfterId,
      createdAt,
      placementOrder,
      noteTitle: "Claimant update",
      content: "Customer requested a callback once the review team confirms the deduction.",
      contributionHint: "Adds claimant context for the current review step.",
    };
  }

  return {
    id: createId("attachment"),
    kind: "inserted",
    nodeType: "additional-attachment",
    descriptor: "inserted:additional-attachment",
    title: "Additional Attachment",
    status: "Awaiting review",
    removable: true,
    anchorAfterId,
    createdAt,
    placementOrder,
    documentName: "occupational-certificate.pdf",
    description: "Supporting document added between process steps.",
    validation: "Not uploaded yet",
    linkedAction: "Upload Occupational Certificate",
  };
}

export function mergeTimelineNodes(
  baseNodes: ProcessNode[],
  insertedNodes: InsertedNode[],
): ClaimNode[] {
  const insertedByAnchor = new Map<string, InsertedNode[]>();

  for (const node of insertedNodes) {
    const bucket = insertedByAnchor.get(node.anchorAfterId) ?? [];
    bucket.push(node);
    insertedByAnchor.set(node.anchorAfterId, bucket);
  }

  for (const bucket of insertedByAnchor.values()) {
    bucket.sort((left, right) => left.placementOrder - right.placementOrder);
  }

  const merged: ClaimNode[] = [];

  for (const baseNode of baseNodes) {
    merged.push(baseNode);

    const anchoredNodes = insertedByAnchor.get(baseNode.id);
    if (anchoredNodes) {
      merged.push(...anchoredNodes);
    }
  }

  return merged;
}

export function filterInsertedNodesForAnchors(
  baseNodes: ProcessNode[],
  insertedNodes: InsertedNode[],
) {
  const validAnchorIds = new Set(baseNodes.map((node) => node.id));

  return insertedNodes.filter((node) => validAnchorIds.has(node.anchorAfterId));
}

export function isProcessNode(node: ClaimNode): node is ProcessNode {
  return node.kind === "process";
}

export function isInsertedNode(node: ClaimNode): node is InsertedNode {
  return node.kind === "inserted";
}

export function canInsertAfter(node: ClaimNode) {
  return isProcessNode(node);
}

export function canRemoveNode(node: ClaimNode) {
  return isInsertedNode(node) && node.removable;
}

export function getAnchorNodeTitle(baseNodes: ProcessNode[], anchorAfterId: string) {
  return baseNodes.find((node) => node.id === anchorAfterId)?.title ?? null;
}
