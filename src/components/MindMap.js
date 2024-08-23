import React, { useState, useEffect } from "react";
import Node from "./Node";
import { generateChildrenUsingGPT } from "../api/chatgpt";
import ApiKeyDialog from "./ApiKeyDialog";

function MindMap({
  mindMap,
  onMindMapChange,
  apiKey,
  setApiKey,
  onOpenDonationDialog,
}) {
  const [rootNode, setRootNode] = useState({
    id: "root",
    title: mindMap.title,
    children: mindMap.children || [],
    notes: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [pendingNodeForGeneration, setPendingNodeForGeneration] =
    useState(null);
  const [generationClickCount, setGenerationClickCount] = useState(0); // Track the number of clicks

  useEffect(() => {
    setRootNode({
      id: "root",
      title: mindMap.title,
      children: mindMap.children || [],
      notes: [],
    });
  }, [mindMap]);

  const handleAddChild = async (parentNode) => {
    if (!apiKey) {
      setPendingNodeForGeneration(parentNode);
      setIsApiKeyDialogOpen(true);
      return;
    }

    // Increment the generation click counter
    setGenerationClickCount((prevCount) => prevCount + 1);

    // Show the donation dialog on the third click, only once
    if (generationClickCount === 2 && onOpenDonationDialog) {
      onOpenDonationDialog();
    }

    setIsLoading(true);

    const existingTitles = parentNode.children.map((child) => child.title);

    try {
      const generatedChildren = await generateChildrenUsingGPT(
        parentNode.title,
        existingTitles,
        apiKey
      );

      const childNodes = generatedChildren.map((title) => ({
        id: `node-${Math.random().toString(36).substr(2, 9)}`,
        title,
        children: [],
        notes: [],
      }));

      const updatedRootNode = addChildrenToNode(
        rootNode,
        parentNode.id,
        childNodes
      );

      setRootNode(updatedRootNode);
      onMindMapChange({ ...mindMap, children: updatedRootNode.children });
    } catch (error) {
      console.error("Error generating children nodes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddManualChild = (parentNode, title) => {
    const childNode = {
      id: `node-${Math.random().toString(36).substr(2, 9)}`,
      title,
      children: [],
      notes: [],
    };

    const updatedRootNode = addChildrenToNode(rootNode, parentNode.id, [
      childNode,
    ]);

    setRootNode(updatedRootNode);
    onMindMapChange({ ...mindMap, children: updatedRootNode.children });
  };

  const addChildrenToNode = (node, nodeId, children) => {
    if (node.id === nodeId) {
      return {
        ...node,
        children: [...node.children, ...children],
      };
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: node.children.map((child) =>
          addChildrenToNode(child, nodeId, children)
        ),
      };
    }
    return node;
  };

  const handleEditNode = (node) => {
    const newTitle = prompt("Edit Node Title", node.title);
    if (newTitle) {
      const updatedRootNode = updateNodeTitle(rootNode, node.id, newTitle);
      setRootNode(updatedRootNode);
      onMindMapChange({ ...mindMap, children: updatedRootNode.children });
    }
  };

  const handleDeleteNode = (nodeToDelete) => {
    const updatedRootNode = deleteNodeRecursive(rootNode, nodeToDelete.id);
    setRootNode(updatedRootNode);
    onMindMapChange({ ...mindMap, children: updatedRootNode.children });
  };

  const deleteNodeRecursive = (node, nodeId) => {
    if (node.id === nodeId) {
      return null;
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: node.children
          .map((child) => deleteNodeRecursive(child, nodeId))
          .filter((child) => child !== null),
      };
    }
    return node;
  };

  const handleApiKeySave = (key) => {
    setApiKey(key);
    setIsApiKeyDialogOpen(false);

    if (pendingNodeForGeneration) {
      handleAddChild(pendingNodeForGeneration);
      setPendingNodeForGeneration(null);
    }
  };

  // Recursive function to update the node title
  function updateNodeTitle(node, nodeId, newTitle) {
    if (node.id === nodeId) {
      return { ...node, title: newTitle };
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: node.children.map((child) =>
          updateNodeTitle(child, nodeId, newTitle)
        ),
      };
    }
    return node;
  }

  const handleTitleChange = (node, newTitle) => {
    if (node.id === "root") {
      onMindMapChange({ ...mindMap, title: newTitle });
    }

    const updatedRootNode = updateNodeTitle(rootNode, node.id, newTitle);
    setRootNode(updatedRootNode);
    onMindMapChange({ ...mindMap, children: updatedRootNode.children });
  };

  return (
    <div className="mindmap">
      <Node
        node={rootNode}
        onAddChild={handleAddChild}
        onEdit={handleEditNode}
        onDelete={handleDeleteNode}
        onAddManualChild={handleAddManualChild}
        onTitleChange={handleTitleChange} // Pass title change handler
      />

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <ApiKeyDialog
        isOpen={isApiKeyDialogOpen}
        onClose={() => setIsApiKeyDialogOpen(false)}
        onSave={handleApiKeySave}
      />
    </div>
  );
}

export default MindMap;
