import { NodeFieldList } from "@/components/nodes/node-field-list";
import { NodeShell } from "@/components/nodes/node-shell";
import type { ClaimNode, ProcessNode } from "@/store/claim-store";

type ProcessField<TNode extends ProcessNode> = {
  label: string;
  value: (node: TNode) => string;
};

export function createConfiguredProcessNode<TTitle extends ProcessNode["title"]>(
  title: TTitle,
  fields: ProcessField<Extract<ProcessNode, { title: TTitle }>>[],
) {
  return function ConfiguredProcessNode({ node }: { node: ClaimNode }) {
    if (node.kind !== "process" || node.title !== title) {
      return null;
    }

    const typedNode = node as Extract<ProcessNode, { title: TTitle }>;
    return (
      <NodeShell node={typedNode}>
        <NodeFieldList
          fields={fields.map((field) => ({
            label: field.label,
            value: field.value(typedNode),
          }))}
        />
      </NodeShell>
    );
  };
}
