import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MindMap from "./components/MindMap";
import ApiKeyDialog from "./components/ApiKeyDialog";
import { fetchMindMaps, createMindMap } from "./data";
import "./styles.css";

function App() {
  const [mindMaps, setMindMaps] = useState([]);
  const [selectedMapId, setSelectedMapId] = useState(null);
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("openai_api_key") ||
      process.env.REACT_APP_OPENAI_API_KEY ||
      ""
  ); // Check for the key in local storage first
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false); // Control dialog visibility
  const [isLoading, setIsLoading] = useState(false); // Control loading animation
  const [pendingGenerationNode, setPendingGenerationNode] = useState(null); // Track the node awaiting generation

  useEffect(() => {
    const loadedMindMaps = fetchMindMaps();
    setMindMaps(loadedMindMaps);
    setSelectedMapId(loadedMindMaps[0]?.id || null); // Load the first map by default
  }, []);

  const handleCreateNewMindMap = () => {
    const title = prompt("Enter the title for your new mind map:");
    if (title) {
      const newMap = createMindMap(title);
      setMindMaps((prevMindMaps) => [...prevMindMaps, newMap]);
      setSelectedMapId(newMap.id); // Set the new map as the selected one
    }
  };

  const handleMapChange = (updatedMap) => {
    setMindMaps((prevMindMaps) =>
      prevMindMaps.map((map) => (map.id === updatedMap.id ? updatedMap : map))
    );

    const storedMaps = fetchMindMaps();
    const mapIndex = storedMaps.findIndex((map) => map.id === updatedMap.id);
    if (mapIndex !== -1) {
      storedMaps[mapIndex] = updatedMap;
    }
  };

  const handleSelectMap = (mapId) => {
    const storedMaps = fetchMindMaps();
    const selectedMap = storedMaps.find((map) => map.id === mapId);

    if (selectedMap) {
      setSelectedMapId(selectedMap.id);
    }
  };

  const handleExportMindMap = () => {
    if (selectedMap) {
      const json = JSON.stringify(selectedMap, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedMap.title}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImportMindMap = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedMap = JSON.parse(e.target.result);
          importedMap.id = `map-${Math.random().toString(36).substr(2, 9)}`; // Assign a new ID
          setMindMaps((prevMindMaps) => {
            const updatedMaps = [...prevMindMaps, importedMap];
            setSelectedMapId(importedMap.id); // Set the imported map as the selected one
            return updatedMaps;
          });
        } catch (error) {
          alert("Invalid file format. Please upload a valid JSON file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleOpenApiKeyDialog = () => {
    setIsApiKeyDialogOpen(true); // Open the dialog
  };

  const handleSaveApiKey = (key) => {
    setApiKey(key); // Save the API key in state
    localStorage.setItem("openai_api_key", key); // Also store it in localStorage
  };

  const handleGenerateChildren = async (parentNode) => {
    if (!apiKey) {
      setPendingGenerationNode(parentNode); // Track the node that needs generation
      setIsApiKeyDialogOpen(true); // Open the dialog if the key is missing
      return;
    }

    setIsLoading(true); // Start loading animation
    try {
      // Simulate API call to generate children using OpenAI API
      const newChildren = await generateChildrenUsingGPT(
        parentNode.title,
        [],
        apiKey
      );

      // Append the new children to the mind map
      const updatedMap = addGeneratedChildrenToMap(
        selectedMap,
        parentNode.id,
        newChildren
      );
      handleMapChange(updatedMap);

      setIsLoading(false); // Stop loading animation
    } catch (error) {
      console.error("Error fetching data from OpenAI API:", error);
      setIsLoading(false);
    }
  };

  const addGeneratedChildrenToMap = (map, parentNodeId, children) => {
    const updatedNodes = map.children.map((node) =>
      node.id === parentNodeId
        ? { ...node, children: [...node.children, ...children] }
        : node
    );

    return { ...map, children: updatedNodes };
  };

  const selectedMap = mindMaps.find((map) => map.id === selectedMapId);

  return (
    <div className="app">
      <ApiKeyDialog
        isOpen={isApiKeyDialogOpen}
        onClose={() => setIsApiKeyDialogOpen(false)}
        onSave={(key) => {
          handleSaveApiKey(key);
          setIsApiKeyDialogOpen(false);
        }}
      />

      <Header
        onCreateNewMindMap={handleCreateNewMindMap}
        onExportMindMap={handleExportMindMap}
        onImportMindMap={handleImportMindMap}
        onOpenApiKeyDialog={handleOpenApiKeyDialog} // Correctly wired function
      />
      <div className="main-content">
        <Sidebar
          mindMaps={mindMaps}
          selectedMapId={selectedMapId}
          onSelectMap={handleSelectMap}
        />
        {selectedMap && (
          <MindMap
            key={selectedMap.id}
            mindMap={selectedMap}
            onMindMapChange={handleMapChange}
            onGenerateChildren={handleGenerateChildren}
            isLoading={isLoading} // Pass loading state to show the animation
            apiKey={apiKey} // Pass the API key to MindMap
            setApiKey={setApiKey} // Pass setApiKey to allow updating the key
          />
        )}
      </div>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
}

export default App;
