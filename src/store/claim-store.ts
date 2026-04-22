"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { buildAiExplanation } from "@/lib/claim/ai-explanations";
import {
  analyzeMockDocument,
  defaultAnalyzerState,
  type AnalyzerInput,
  type AnalyzerState,
} from "@/lib/claim/analyzer";
import {
  createInsertedNode,
  filterInsertedNodesForAnchors,
  mergeTimelineNodes,
  toProcessNodes,
  type AdditionalAttachmentNode,
  type ClaimNode,
  type InformationNoteNode,
  type InsertableNodeType,
  type InsertedNode,
  type ProcessNode,
} from "@/lib/claim/nodes";
import type { ProcessDetail } from "@/lib/schemas/claim";

type ExplanationEntry = {
  status: "idle" | "loading" | "ready";
  text: string;
  requestCount: number;
};

type ClaimStore = {
  baseNodes: ProcessNode[];
  insertedNodes: InsertedNode[];
  explanations: Record<string, ExplanationEntry>;
  documentAnalyzer: AnalyzerState;
  autoEditingNodeId: string | null;
  initializedForFileNo: string | null;
  nextPlacementOrder: number;
  initializeNodes: (fileNo: string, processDetails: ProcessDetail[]) => void;
  insertNodeAfter: (afterId: string, type: InsertableNodeType) => void;
  updateInsertedNode: (
    nodeId: string,
    updater: Partial<InformationNoteNode> | Partial<AdditionalAttachmentNode>,
  ) => void;
  removeInsertedNode: (nodeId: string) => void;
  clearAutoEditingNode: (nodeId: string) => void;
  selectAnalyzerFile: (fileName: string | null, targetDocument: string | null) => void;
  analyzeDocument: (input: AnalyzerInput, targetDocument: string | null) => Promise<void>;
  explainNode: (node: ClaimNode) => Promise<void>;
};

export const selectTimelineNodes = (state: ClaimStore) =>
  mergeTimelineNodes(state.baseNodes, state.insertedNodes);

export const useClaimStore = create<ClaimStore>()(
  persist(
    (set, get) => ({
      baseNodes: [],
      insertedNodes: [],
      explanations: {},
      documentAnalyzer: defaultAnalyzerState,
      autoEditingNodeId: null,
      initializedForFileNo: null,
      nextPlacementOrder: 0,
      initializeNodes: (fileNo, processDetails) =>
        set((state) => {
          const baseNodes = toProcessNodes(processDetails);

          if (state.initializedForFileNo === fileNo) {
            return {
              baseNodes,
              insertedNodes: filterInsertedNodesForAnchors(baseNodes, state.insertedNodes),
            };
          }

          return {
            baseNodes,
            insertedNodes: [],
            explanations: {},
            documentAnalyzer: defaultAnalyzerState,
            autoEditingNodeId: null,
            initializedForFileNo: fileNo,
            nextPlacementOrder: 0,
          };
        }),
      insertNodeAfter: (afterId, type) =>
        set((state) => {
          const anchorNode = state.baseNodes.find((node) => node.id === afterId);

          if (!anchorNode) {
            return state;
          }

          const newNode = createInsertedNode(type, afterId, state.nextPlacementOrder);

          return {
            insertedNodes: [...state.insertedNodes, newNode],
            autoEditingNodeId: newNode.id,
            nextPlacementOrder: state.nextPlacementOrder + 1,
          };
        }),
      updateInsertedNode: (nodeId, updater) =>
        set((state) => ({
          insertedNodes: state.insertedNodes.map((node) => {
            if (node.id !== nodeId) {
              return node;
            }

            if (node.nodeType === "information-note") {
              return { ...node, ...(updater as Partial<InformationNoteNode>) };
            }

            return { ...node, ...(updater as Partial<AdditionalAttachmentNode>) };
          }),
          autoEditingNodeId:
            state.autoEditingNodeId === nodeId ? null : state.autoEditingNodeId,
        })),
      removeInsertedNode: (nodeId) =>
        set((state) => ({
          insertedNodes: state.insertedNodes.filter((node) => node.id !== nodeId),
          explanations: Object.fromEntries(
            Object.entries(state.explanations).filter(([id]) => id !== nodeId),
          ),
          autoEditingNodeId:
            state.autoEditingNodeId === nodeId ? null : state.autoEditingNodeId,
          documentAnalyzer:
            state.documentAnalyzer.linkedAttachmentId === nodeId
              ? { ...state.documentAnalyzer, linkedAttachmentId: null }
              : state.documentAnalyzer,
        })),
      clearAutoEditingNode: (nodeId) =>
        set((state) => ({
          autoEditingNodeId:
            state.autoEditingNodeId === nodeId ? null : state.autoEditingNodeId,
        })),
      selectAnalyzerFile: (fileName, targetDocument) =>
        set((state) => ({
          documentAnalyzer: {
            ...state.documentAnalyzer,
            targetDocument,
            selectedFileName: fileName,
            status: fileName ? "selected" : targetDocument ? "error" : "idle",
            message: fileName
              ? `${fileName} selected. Run the analyzer to confirm it matches the requested document.`
              : "Choose a file before running the simulated AI validation.",
            suggestedNextAction: fileName
              ? "Run the analyzer before submitting the document."
              : targetDocument
                ? `Select the ${targetDocument} file first.`
                : null,
          },
        })),
      analyzeDocument: async (input, targetDocument) => {
        set((state) => ({
          documentAnalyzer: {
            ...state.documentAnalyzer,
            targetDocument,
            selectedFileName: input.name,
            status: "loading",
            message: `Reviewing ${input.name} against the ${targetDocument ?? "required document"} requirement...`,
            suggestedNextAction: null,
          },
        }));

        await new Promise((resolve) => {
          setTimeout(resolve, 700);
        });

        const result = analyzeMockDocument(input, targetDocument);
        const latestAttachment = [...get().insertedNodes]
          .filter((node) => node.nodeType === "additional-attachment")
          .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))[0];

        set((state) => ({
          documentAnalyzer: {
            ...state.documentAnalyzer,
            targetDocument,
            selectedFileName: input.name,
            status: result.status,
            message: result.message,
            suggestedNextAction: result.suggestedNextAction,
            linkedAttachmentId: latestAttachment?.id ?? null,
          },
          insertedNodes: state.insertedNodes.map((node) => {
            if (node.id !== latestAttachment?.id || node.nodeType !== "additional-attachment") {
              return node;
            }

            return {
              ...node,
              documentName: input.name,
              validation:
                result.status === "success" ? "Validated by simulated AI" : "Needs replacement",
              status: result.status === "success" ? "Ready for review" : "Action needed",
              description:
                node.description ||
                "This document was linked to the current deduction review request.",
            };
          }),
        }));
      },
      explainNode: async (node) => {
        const currentExplanation = get().explanations[node.id];
        const requestCount = currentExplanation?.requestCount ?? 0;

        set((state) => ({
          explanations: {
            ...state.explanations,
            [node.id]:
              {
                status: "loading",
                text: currentExplanation?.text ?? "",
                requestCount,
              },
          },
        }));

        await new Promise((resolve) => {
          setTimeout(resolve, 550);
        });

        set((state) => ({
          explanations: {
            ...state.explanations,
            [node.id]: {
              status: "ready",
              text: buildAiExplanation(node, requestCount),
              requestCount: requestCount + 1,
            },
          },
        }));
      },
    }),
    {
      name: "claim-orchestrator-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        insertedNodes: state.insertedNodes,
        explanations: state.explanations,
        documentAnalyzer: state.documentAnalyzer,
        initializedForFileNo: state.initializedForFileNo,
        nextPlacementOrder: state.nextPlacementOrder,
      }),
    },
  ),
);

export type {
  AdditionalAttachmentNode,
  ClaimNode,
  InformationNoteNode,
  InsertableNodeType,
  InsertedNode,
  ProcessNode,
} from "@/lib/claim/nodes";

export type { ExplanationEntry };
export type { AnalyzerInput, AnalyzerState } from "@/lib/claim/analyzer";
