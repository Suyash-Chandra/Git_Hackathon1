"use client";

import { useEffect } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
  type Edge,
  type Node,
} from "@xyflow/react";

function IdeaNode({ data }: { data: Record<string, unknown> }) {
  const isRoot = data.is_root as boolean;
  const mood = data.mood as string | null;
  const genre = data.genre as string | null;
  const bpm = data.bpm as number | null;
  const keySignature = data.key_signature as string | null;
  const createdAt = data.created_at as string;
  const versionId = data.versionId as number;

  return (
    <div
      style={{
        minWidth: 220,
        padding: "14px 16px",
        borderRadius: 20,
        background: isRoot
          ? "linear-gradient(135deg, rgba(207,236,243,0.6), rgba(255,252,247,0.98))"
          : "rgba(255,252,247,0.96)",
        border: isRoot
          ? "1px solid rgba(207,236,243,0.95)"
          : "1px solid rgba(68,54,40,0.14)",
        boxShadow: isRoot
          ? "0 18px 34px rgba(143,61,27,0.12)"
          : "0 14px 28px rgba(55,33,11,0.08)",
        transition: "all 0.2s",
        cursor: "pointer",
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#CFECF3",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#221b16",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {data.displayVersion as string || `v${versionId}`}
        </span>
        {isRoot ? (
          <span
            style={{
              fontSize: 9,
              padding: "3px 8px",
              borderRadius: 99,
              background: "rgba(207,236,243,0.5)",
              color: "#221b16",
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Root
          </span>
        ) : null}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
        {mood ? (
          <span
            style={{
              fontSize: 10,
              padding: "4px 9px",
              borderRadius: 99,
              background: "rgba(207,236,243,0.46)",
              border: "1px solid rgba(207,236,243,0.9)",
              color: "#221b16",
              fontWeight: 700,
            }}
          >
            {mood}
          </span>
        ) : null}
        {genre ? (
          <span
            style={{
              fontSize: 10,
              padding: "4px 9px",
              borderRadius: 99,
              background: "rgba(43,108,127,0.08)",
              border: "1px solid rgba(43,108,127,0.16)",
              color: "#24596a",
              fontWeight: 700,
            }}
          >
            {genre}
          </span>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          fontSize: 10,
          color: "#726254",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 700,
        }}
      >
        {bpm ? <span>{Math.round(bpm)} BPM</span> : null}
        {keySignature ? <span>{keySignature}</span> : null}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 10,
          color: "#9a897a",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {new Date(createdAt).toLocaleDateString()}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { ideaNode: IdeaNode };

interface EvolutionGraphProps {
  nodes: Node[];
  edges: Edge[];
  title?: string;
}

export default function EvolutionGraph({
  nodes: initialNodes,
  edges: initialEdges,
}: EvolutionGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const parentMap = new Map<string, string>();
    initialEdges.forEach((edge) => parentMap.set(edge.target, edge.source));

    const getDepth = (id: string): number => {
      let depth = 0;
      let current = id;
      while (parentMap.has(current)) {
        depth++;
        current = parentMap.get(current)!;
      }
      return depth;
    };

    const layoutNodes = initialNodes.map((node) => {
      const depth = getDepth(node.id);
      const siblings = initialNodes.filter((candidate) => getDepth(candidate.id) === depth);
      const siblingIndex = siblings.findIndex((candidate) => candidate.id === node.id);

      return {
        ...node,
        position: {
          x: siblingIndex * 260 - (siblings.length - 1) * 130,
          y: depth * 180,
        },
      } as Node;
    });

    setNodes(layoutNodes);
    setEdges(
      initialEdges.map((edge) => ({
        ...edge,
        style: { stroke: "#9a897a", strokeWidth: 3 },
        animated: true,
        markerEnd: { type: "arrowclosed", color: "#9a897a" },
      })),
    );
  }, [initialEdges, initialNodes, setEdges, setNodes]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="rgba(68,54,40,0.08)"
        />
      </ReactFlow>
    </div>
  );
}
