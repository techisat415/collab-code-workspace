function buildTree(files) {
  const tree = {};

  Object.keys(files).forEach((path) => {
    const parts = path.split("/").filter(Boolean);
    let current = tree;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {
          children: {},
          isFile: index === parts.length - 1,
          path: parts.slice(0, index + 1).join("/"),
        };
      }

      current[part].isFile = index === parts.length - 1;
      current[part].path = parts.slice(0, index + 1).join("/");
      current = current[part].children;
    });
  });

  return tree;
}

function sortEntries(entries) {
  return entries.sort(([leftLabel, leftNode], [rightLabel, rightNode]) => {
    if (leftNode.isFile !== rightNode.isFile) {
      return leftNode.isFile ? 1 : -1;
    }

    return leftLabel.localeCompare(rightLabel);
  });
}

function FileTreeNode({ nodes, depth = 0, activePath, onSelect, onRename, onDelete }) {
  const entries = sortEntries(Object.entries(nodes));

  return entries.map(([label, node]) => {
    const isActive = activePath === node.path;

    if (!node.isFile) {
      return (
        <div key={node.path} style={{ marginLeft: depth ? 14 : 0 }}>
          <div
            style={{
              padding: "6px 8px",
              color: "#c5c5c5",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            📁 {label}
          </div>
          <FileTreeNode
            nodes={node.children}
            depth={depth + 1}
            activePath={activePath}
            onSelect={onSelect}
            onRename={onRename}
            onDelete={onDelete}
          />
        </div>
      );
    }

    return (
      <div
        key={node.path}
        style={{
          marginLeft: depth ? 14 : 0,
          padding: "6px 8px",
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          cursor: "pointer",
          background: isActive ? "#2b2d31" : "transparent",
          color: isActive ? "#ffffff" : "#d7d7d7",
        }}
        onClick={() => onSelect(node.path)}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          📄 {label}
        </span>
        <span style={{ display: "inline-flex", gap: 6, flexShrink: 0 }}>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onRename(node.path);
            }}
          >
            ✏️
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onDelete(node.path);
            }}
          >
            ❌
          </button>
        </span>
      </div>
    );
  });
}

export default function FileTree({ files, activePath, onSelect, onRename, onDelete }) {
  const tree = buildTree(files);

  return <FileTreeNode nodes={tree} activePath={activePath} onSelect={onSelect} onRename={onRename} onDelete={onDelete} />;
}