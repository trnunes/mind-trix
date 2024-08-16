import React, { useState } from "react";
import Node from "./Node";
import { generateChildrenUsingGPT } from "../api/chatgpt";
import ApiKeyDialog from "./ApiKeyDialog";

function MindMap({ mindMap, onMindMapChange, apiKey, setApiKey }) {
  const [rootNode, setRootNode] = useState({
    id: "root",
    title: mindMap.title,
    children: mindMap.children || [],
    notes: [],
  });

  const [isLoading, setIsLoading] = useState(false); // State for loading animation
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false); // Control the visibility of the API key dialog
  const [pendingNodeForGeneration, setPendingNodeForGeneration] =
    useState(null); // Track the node awaiting generation

  // Function to add a child node using the API
  const handleAddChild = async (parentNode) => {
    if (!apiKey) {
      setPendingNodeForGeneration(parentNode); // Track the node requesting generation
      setIsApiKeyDialogOpen(true); // Open the dialog if the API key is missing
      return;
    }

    setIsLoading(true); // Start loading animation

    const existingTitles = parentNode.children.map((child) => child.title);

    try {
      // Generate new children using GPT, excluding existing titles
      const generatedChildren = await generateChildrenUsingGPT(
        parentNode.title,
        existingTitles,
        apiKey
      );

      // Map the generated children to node objects
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

      setRootNode(updatedRootNode); // Trigger re-render with updated root node
      onMindMapChange(updatedRootNode); // Update the parent with the new mind map state
    } catch (error) {
      console.error("Error generating children nodes:", error);
    } finally {
      setIsLoading(false); // Stop loading animation
    }
  };

  // Function to add a manual child node
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

    setRootNode(updatedRootNode); // Trigger re-render with updated root node
    onMindMapChange(updatedRootNode); // Update the parent with the new mind map state
  };

  // Recursive function to add children to the correct node
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
      setRootNode(updatedRootNode); // Trigger re-render with updated node title
      onMindMapChange(updatedRootNode); // Update the parent with the new mind map state
    }
  };

  // Recursive function to update a node's title
  const updateNodeTitle = (node, nodeId, newTitle) => {
    if (node.id === nodeId) {
      return {
        ...node,
        title: newTitle,
      };
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
  };

  const handleDeleteNode = (nodeToDelete) => {
    const updatedRootNode = deleteNodeRecursive(rootNode, nodeToDelete.id);
    setRootNode(updatedRootNode); // Update the state with the new node list
    onMindMapChange(updatedRootNode); // Update the parent with the new mind map state
  };

  const deleteNodeRecursive = (node, nodeId) => {
    if (node.id === nodeId) {
      return null; // If it's the node to delete, return null
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: node.children
          .map((child) => deleteNodeRecursive(child, nodeId))
          .filter((child) => child !== null), // Filter out deleted nodes
      };
    }
    return node;
  };

  // Retry generation after the API key is saved
  const handleApiKeySave = (key) => {
    setApiKey(key); // Save the API key in the parent component
    setIsApiKeyDialogOpen(false); // Close the dialog

    if (pendingNodeForGeneration) {
      handleAddChild(pendingNodeForGeneration); // Retry generation for the pending node
      setPendingNodeForGeneration(null); // Clear the pending node tracker
    }
  };

  return (
    <div className="mindmap">
      <Node
        node={rootNode}
        onAddChild={handleAddChild}
        onEdit={handleEditNode}
        onDelete={handleDeleteNode}
        onAddManualChild={handleAddManualChild} // Pass down manual addition handler
      />

      {/* Show the loading spinner if the state is loading */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* API Key Dialog */}
      <ApiKeyDialog
        isOpen={isApiKeyDialogOpen}
        onClose={() => setIsApiKeyDialogOpen(false)}
        onSave={handleApiKeySave}
      />
    </div>
  );
}

export default MindMap;
