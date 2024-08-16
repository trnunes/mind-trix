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

      // Ensure the map is not already present before adding
      setMindMaps((prevMindMaps) => {
        const isAlreadyPresent = prevMindMaps.some(
          (map) => map.id === newMap.id
        );
        if (isAlreadyPresent) return prevMindMaps; // Avoid duplicate addition

        return [...prevMindMaps, newMap];
      });

      setSelectedMapId(newMap.id); // Set the new map as the selected one
    }
  };

  const handleMapChange = (updatedMap) => {
    setMindMaps((prevMindMaps) =>
      prevMindMaps.map((map) => (map.id === updatedMap.id ? updatedMap : map))
    );
  };

  const handleSelectMap = (mapId) => {
    setSelectedMapId(mapId);
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

  const selectedMap = mindMaps.find((map) => map.id === selectedMapId);

  return (
    <div className="app">
      <ApiKeyDialog
        isOpen={isApiKeyDialogOpen}
        onClose={() => setIsApiKeyDialogOpen(false)}
        onSave={(key) => {
          setApiKey(key);
          setIsApiKeyDialogOpen(false);
        }}
      />

      <Header
        onCreateNewMindMap={handleCreateNewMindMap}
        onExportMindMap={handleExportMindMap}
        onImportMindMap={handleImportMindMap}
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
            apiKey={apiKey}
            setApiKey={setApiKey}
            isLoading={isLoading}
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
