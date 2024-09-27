// src/App.js
import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MindMap from "./components/MindMap";
import ApiKeyDialog from "./components/ApiKeyDialog";
import WizardDialog from "./components/WizardDialog";
import ConfirmDialog from "./components/ConfirmDialog";
import DonationDialog from "./components/DonationDialog";
import DonationPanel from "./components/DonationPanel";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { auth, firestore } from "./firebase";
import { collection, addDoc, getDocs, query, where, doc, setDoc, deleteDoc } from "firebase/firestore";
import { generateChildrenUsingGPT } from "./api/chatgpt";
import { inject } from "@vercel/analytics";
import "./styles.css";

inject();

function App() {
  const [mindMaps, setMindMaps] = useState([]);
  const [selectedMapId, setSelectedMapId] = useState(null);
  const [apiKey, setApiKey] = useState(
    localStorage.getItem("openai_api_key") || process.env.REACT_APP_OPENAI_API_KEY || ""
  );
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isWizardDialogOpen, setIsWizardDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);
  const [mapToDelete, setMapToDelete] = useState(null);
  const [generationCount, setGenerationCount] = useState(0);

  // Authentication state
  const [user, setUser] = useState(null);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    // Monitor authentication state
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setShowAuthPage(false);
        // Load user's mind maps from Firestore
        loadMindMaps(currentUser.uid);
      } else {
        setMindMaps([]);
        setSelectedMapId(null);
      }
    });
    return unsubscribe;
  }, []);

  const loadMindMaps = async (userId) => {
    try {
      const q = query(collection(firestore, "mindMaps"), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const loadedMindMaps = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMindMaps(loadedMindMaps);
      setSelectedMapId(loadedMindMaps[0]?.id || null);
    } catch (error) {
      console.error("Error loading mind maps:", error);
    }
  };

  const handleCreateNewMindMap = () => {
    if (user) {
      setIsWizardDialogOpen(true);
    } else {
      setShowAuthPage(true);
      setIsSigningUp(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowAuthPage(false);
  };

  const handleSignUpSuccess = () => {
    setShowAuthPage(false);
  };

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
    setMindMaps([]);
    setSelectedMapId(null);
  };

  const handleWizardComplete = async (payload) => {
    if (!user || !user.uid) {
      console.error("User is not authenticated.");
      return;
    }

    setIsLoading(true);

    const newMap = {
      title: payload.mainTopic || payload.description,
      userId: user.uid,
      children: [],
      notes: [],
    };

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

      const docRef = await addDoc(collection(firestore, "mindMaps"), newMap);
      newMap.id = docRef.id;

      setMindMaps((prevMindMaps) => [...prevMindMaps, newMap]);
      setSelectedMapId(newMap.id);
    } catch (error) {
      console.error("Error generating mind map:", error);
    } finally {
      setIsLoading(false);
    }

    setIsWizardDialogOpen(false);

    setGenerationCount((prevCount) => {
      if (prevCount + 1 >= 3) {
        setIsDonationDialogOpen(true);
        return 0;
      }
      return prevCount + 1;
    });
  };

  const handleMapChange = async (updatedMap) => {
    setMindMaps((prevMindMaps) =>
      prevMindMaps.map((map) => (map.id === updatedMap.id ? updatedMap : map))
    );

    try {
      await setDoc(doc(firestore, "mindMaps", updatedMap.id), updatedMap);
    } catch (error) {
      console.error("Error updating mind map:", error);
    }
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

      setIsDonationDialogOpen(true);
    }
  };

  const handleImportMindMap = (event) => {
    const file = event.target.files[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedMap = JSON.parse(e.target.result);
          importedMap.userId = user.uid;
          const docRef = await addDoc(collection(firestore, "mindMaps"), importedMap);
          importedMap.id = docRef.id;
          setMindMaps((prevMindMaps) => [...prevMindMaps, importedMap]);
          setSelectedMapId(importedMap.id);
        } catch (error) {
          alert("Invalid file format. Please upload a valid JSON file.");
        }
      };
      reader.readAsText(file);
    } else if (!user) {
      setShowAuthPage(true);
      setIsSigningUp(false);
    }
  };

  const handleDeleteMindMap = (mapId) => {
    setMapToDelete(mapId);
    setIsConfirmDialogOpen(true);
  };

  const confirmDeleteMindMap = async () => {
    try {
      await deleteDoc(doc(firestore, "mindMaps", mapToDelete));
      setMindMaps((prevMindMaps) =>
        prevMindMaps.filter((map) => map.id !== mapToDelete)
      );
      if (mapToDelete === selectedMapId) {
        setSelectedMapId(null);
      }
      setMapToDelete(null);
      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error deleting mind map:", error);
    }
  };

  const cancelDeleteMindMap = () => {
    setMapToDelete(null);
    setIsConfirmDialogOpen(false);
  };

  const handleOpenDonationDialog = () => {
    setIsDonationDialogOpen(true);
  };

  const handleCloseDonationDialog = () => {
    setIsDonationDialogOpen(false);
  };

  const handleShowAuthPage = () => {
    setShowAuthPage(true);
    setIsSigningUp(false);
  };

  const handleSwitchToSignUp = () => {
    setShowAuthPage(true);
    setIsSigningUp(true);
  };

  const selectedMap = mindMaps.find((map) => map.id === selectedMapId);

  return (
    <div className="app">
      {showAuthPage ? (
        isSigningUp ? (
          <SignUp
            onSignUpSuccess={handleSignUpSuccess}
            onSwitchToLogin={() => setIsSigningUp(false)}
          />
        ) : (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToSignUp={() => setIsSigningUp(true)}
          />
        )
      ) : (
        <>
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
            onClose={handleCloseDonationDialog}
          />

          <Header
            user={user}
            onLogout={handleLogout}
            onShowAuthPage={handleShowAuthPage}
            onSwitchToSignUp={handleSwitchToSignUp}
          />

          <div className="main-content">
            <Sidebar
              user={user}
              mindMaps={mindMaps}
              selectedMapId={selectedMapId}
              onSelectMap={handleSelectMap}
              onCreateNewMindMap={handleCreateNewMindMap}
              onDeleteMindMap={handleDeleteMindMap}
              onShowAuthPage={() => {
                setShowAuthPage(true);
                setIsSigningUp(false);
              }}
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

          <DonationPanel />
        </>
      )}
    </div>
  );
}

export default App;
