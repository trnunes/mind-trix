import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MindMap from "./components/MindMap";
import ApiKeyDialog from "./components/ApiKeyDialog";
import ConfirmDialog from "./components/ConfirmDialog";
import DonationDialog from "./components/DonationDialog";
import DonationPanel from "./components/DonationPanel";
import ButtonBar from "./components/ButtonBar";
import { fetchMindMaps, createMindMap } from "./data";
import "./styles.css";

function App() {
  const [mindMaps, setMindMaps] = useState([]);
  const [selectedMapId, setSelectedMapId] = useState(null);
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("openai_api_key") ||
      process.env.REACT_APP_OPENAI_API_KEY ||
      ""
  );
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingGenerationNode, setPendingGenerationNode] = useState(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [mapToDelete, setMapToDelete] = useState(null);
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);
  const [hasShownDonationDialog, setHasShownDonationDialog] = useState(false);

  useEffect(() => {
    const loadedMindMaps = fetchMindMaps();
    setMindMaps(loadedMindMaps);
    setSelectedMapId(loadedMindMaps[0]?.id || null);
  }, []);

  const handleCreateNewMindMap = () => {
    const title = prompt("Enter the title for your new mind map:");
    if (title) {
      const newMap = createMindMap(title);
      setMindMaps((prevMindMaps) => [...prevMindMaps, newMap]);
      setSelectedMapId(newMap.id);
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

      if (!hasShownDonationDialog) {
        setIsDonationDialogOpen(true);
        setHasShownDonationDialog(true);
      }
    }
  };

  const handleImportMindMap = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedMap = JSON.parse(e.target.result);
          importedMap.id = `map-${Math.random().toString(36).substr(2, 9)}`;
          setMindMaps((prevMindMaps) => {
            const updatedMaps = [...prevMindMaps, importedMap];
            setSelectedMapId(importedMap.id);
            return updatedMaps;
          });
        } catch (error) {
          alert("Invalid file format. Please upload a valid JSON file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteMindMap = (mapId) => {
    setIsConfirmDialogOpen(true);
    setMapToDelete(mapId);
  };

  const confirmDelete = () => {
    if (mapToDelete) {
      setMindMaps((prevMindMaps) =>
        prevMindMaps.filter((map) => map.id !== mapToDelete)
      );
      if (mapToDelete === selectedMapId) {
        const remainingMaps = mindMaps.filter((map) => map.id !== mapToDelete);
        setSelectedMapId(remainingMaps.length > 0 ? remainingMaps[0].id : null);
      }
      setMapToDelete(null);
    }
    setIsConfirmDialogOpen(false);
  };

  const cancelDelete = () => {
    setMapToDelete(null);
    setIsConfirmDialogOpen(false);
  };

  const handleOpenDonationDialog = () => {
    if (!hasShownDonationDialog) {
      setIsDonationDialogOpen(true);
      setHasShownDonationDialog(true);
    }
  };

  const handleCloseDonationDialog = () => {
    setIsDonationDialogOpen(false);
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

      <Header onCreateNewMindMap={handleCreateNewMindMap} />

      <div className="main-content">
        <Sidebar
          mindMaps={mindMaps}
          selectedMapId={selectedMapId}
          onSelectMap={handleSelectMap}
          onCreateNewMindMap={handleCreateNewMindMap}
          onDeleteMindMap={handleDeleteMindMap}
        />

        <div className="mindmap-area">
          {/* Button Bar for Import/Export Actions */}
          <ButtonBar
            onExportMindMap={handleExportMindMap}
            onImportMindMap={handleImportMindMap}
          />

          {selectedMap && (
            <MindMap
              key={selectedMap.id}
              mindMap={selectedMap}
              onMindMapChange={handleMapChange}
              apiKey={apiKey}
              setApiKey={setApiKey}
              isLoading={isLoading}
              onOpenDonationDialog={handleOpenDonationDialog}
            />
          )}
        </div>
      </div>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this mind map? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <DonationDialog
        isOpen={isDonationDialogOpen}
        onClose={handleCloseDonationDialog}
      />

      <DonationPanel />
    </div>
  );
}

export default App;
