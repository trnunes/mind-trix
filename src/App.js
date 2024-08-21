import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MindMap from "./components/MindMap";
import ApiKeyDialog from "./components/ApiKeyDialog";
import WizardDialog from "./components/WizardDialog";
import ConfirmDialog from "./components/ConfirmDialog";
import DonationDialog from "./components/DonationDialog"; // Import the donation dialog
import DonationPanel from "./components/DonationPanel";
import { fetchMindMaps, createMindMap } from "./data";
import { generateChildrenUsingGPT } from "./api/chatgpt";
import { inject } from "@vercel/analytics";

import "./styles.css";
inject();
function App() {
  const [mindMaps, setMindMaps] = useState([]);
  const [selectedMapId, setSelectedMapId] = useState(null);
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("openai_api_key") ||
      process.env.REACT_APP_OPENAI_API_KEY ||
      ""
  );
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isWizardDialogOpen, setIsWizardDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false); // Control donation dialog
  const [mapToDelete, setMapToDelete] = useState(null);
  const [generationCount, setGenerationCount] = useState(0); // Track the number of generations

  useEffect(() => {
    const loadedMindMaps = fetchMindMaps();
    setMindMaps(loadedMindMaps);
    setSelectedMapId(loadedMindMaps[0]?.id || null);
  }, []);

  const handleCreateNewMindMap = () => {
    setIsWizardDialogOpen(true);
  };

  const confirmDelete = () => {
    if (mapToDelete) {
      setMindMaps((prevMindMaps) =>
        prevMindMaps.filter((map) => map.id !== mapToDelete)
      );
      // Reset selected map if it’s the one being deleted
      if (mapToDelete === selectedMapId) {
        const remainingMaps = mindMaps.filter((map) => map.id !== mapToDelete);
        setSelectedMapId(remainingMaps.length > 0 ? remainingMaps[0].id : null);
      }
      setMapToDelete(null); // Clear the map to delete
    }
    setIsConfirmDialogOpen(false); // Close the confirmation dialog
  };

  const cancelDelete = () => {
    setMapToDelete(null);
    setIsConfirmDialogOpen(false);
  };

  const handleWizardComplete = async (payload) => {
    setIsLoading(true);

    const newMap = createMindMap(payload.mainTopic || payload.description);

    try {
      const subtopics = await generateChildrenUsingGPT(
        payload.mainTopic || payload.description,
        [],
        apiKey,
        payload.subtopicCount
      );

      const childNodes = subtopics.map((title) => ({
        id: `node-${Math.random().toString(36).substr(2, 9)}`,
        title,
        children: [],
        notes: [],
      }));

      newMap.children = childNodes;

      setMindMaps((prevMindMaps) => {
        const isAlreadyPresent = prevMindMaps.some(
          (map) => map.id === newMap.id
        );
        if (isAlreadyPresent) return prevMindMaps;

        return [...prevMindMaps, newMap];
      });

      setSelectedMapId(newMap.id);
    } catch (error) {
      console.error("Error generating mind map:", error);
    } finally {
      setIsLoading(false);
    }

    setIsWizardDialogOpen(false);

    // Show the donation dialog after the third generation
    setGenerationCount((prevCount) => {
      if (prevCount + 1 >= 3) {
        setIsDonationDialogOpen(true);
        return 0; // Reset the counter after showing the donation dialog
      }
      return prevCount + 1;
    });
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
    const selectedMap = mindMaps.find((map) => map.id === selectedMapId);
    if (selectedMap) {
      const json = JSON.stringify(selectedMap, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedMap.title}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Show the donation dialog on export
      setIsDonationDialogOpen(true);
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
    setMapToDelete(mapId);
    setIsConfirmDialogOpen(true); // Open the confirmation dialog
  };

  const confirmDeleteMindMap = () => {
    setMindMaps((prevMindMaps) =>
      prevMindMaps.filter((map) => map.id !== mapToDelete)
    );
    if (mapToDelete === selectedMapId) {
      setSelectedMapId(mindMaps[0]?.id || null); // Reset selected map if the deleted map was the active one
    }
    setMapToDelete(null);
    setIsConfirmDialogOpen(false);
  };

  const cancelDeleteMindMap = () => {
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

      <WizardDialog
        isOpen={isWizardDialogOpen}
        onClose={() => setIsWizardDialogOpen(false)}
        onComplete={handleWizardComplete}
      />

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this mind map? This action cannot be undone."
        onConfirm={confirmDeleteMindMap}
        onCancel={cancelDeleteMindMap}
      />

      <DonationDialog
        isOpen={isDonationDialogOpen}
        onClose={() => setIsDonationDialogOpen(false)}
      />

      <Header />

      <div className="main-content">
        <Sidebar
          mindMaps={mindMaps}
          selectedMapId={selectedMapId}
          onSelectMap={handleSelectMap}
          onCreateNewMindMap={handleCreateNewMindMap}
          onDeleteMindMap={handleDeleteMindMap}
        />

        <div className="mindmap-area">
          <div className="button-bar">
            <button className="button-bar-item" onClick={handleExportMindMap}>
              Save Map
            </button>
            <input
              type="file"
              accept=".json"
              onChange={handleImportMindMap}
              id="import-input"
              style={{ display: "none" }}
            />
            <button
              className="button-bar-item"
              onClick={() => document.getElementById("import-input").click()}
            >
              Open Map
            </button>
          </div>

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
