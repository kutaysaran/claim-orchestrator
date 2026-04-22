import { NodeFieldList } from "@/components/nodes/node-field-list";
import { NodeShell } from "@/components/nodes/node-shell";
import type { ClaimNode } from "@/store/claim-store";

type GenericProcessNodeProps = {
  node: ClaimNode;
};

export function GenericProcessNode({ node }: GenericProcessNodeProps) {
  const fields = Object.entries(node)
    .filter(
      ([key, value]) =>
        !["id", "kind", "title", "status", "descriptor", "removable"].includes(key) &&
        typeof value === "string",
    )
    .map(([key, value]) => ({
      label: key.replace(/([A-Z])/g, " $1").trim(),
      value,
    }));

  return (
    <NodeShell node={node}>
      <NodeFieldList
        fields={
          fields.length > 0
            ? fields
            : [{ label: "Details", value: "No additional details available." }]
        }
      />
    </NodeShell>
  );
}
