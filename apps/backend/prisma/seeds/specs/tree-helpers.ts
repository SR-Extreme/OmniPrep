/** Shared Python helpers for level-order tree serialization in solutions. */
export const PY_TREE_HELPERS = `
def _build_tree(arr):
    if not arr:
        return None
    nodes = [None if v is None else {"val": v, "left": None, "right": None} for v in arr]
    kids = nodes[::-1]
    root = kids.pop()
    for i, node in enumerate(nodes):
        if node is None:
            continue
        if i * 2 + 1 < len(nodes):
            node["left"] = nodes[i * 2 + 1]
        if i * 2 + 2 < len(nodes):
            node["right"] = nodes[i * 2 + 2]
    return root

def _tree_val(node):
    return None if node is None else node["val"]
`;
