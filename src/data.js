// data.js
import { firestore } from './firebase'; // Adjust the import path as necessary
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
// data.js

/**
 * Fetches mind maps from Firestore for the specified user.
 * @param {string} userId - The ID of the user whose mind maps to fetch.
 * @returns {Promise<Array>} - A promise that resolves to an array of mind maps.
 */
export async function fetchMindMaps(userId) {
    try {
      const mindMapsRef = collection(firestore, 'mindMaps');
      const q = query(mindMapsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
  
      const mindMaps = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      return mindMaps;
    } catch (error) {
      console.error('Error fetching mind maps:', error);
      return [];
    }
  }

  // data.js

/**
 * Creates a new mind map in Firestore for the specified user.
 * @param {string} title - The title of the new mind map.
 * @param {string} userId - The ID of the user creating the mind map.
 * @returns {Promise<Object>} - A promise that resolves to the new mind map object.
 */
export async function createMindMap(title, userId) {
    try {
      const newMap = {
        title,
        notes: [],
        children: [],
        userId,
        createdAt: new Date(),
      };
  
      const docRef = await addDoc(collection(firestore, 'mindMaps'), newMap);
  
      // Include the generated ID in the returned mind map object
      return { id: docRef.id, ...newMap };
    } catch (error) {
      console.error('Error creating mind map:', error);
      return null;
    }
  }


/**
 * Updates an existing mind map in Firestore.
 * @param {Object} mindMap - The mind map object to update.
 * @returns {Promise<boolean>} - A promise that resolves to true if the update was successful.
 */
export async function updateMindMap(mindMap) {
  try {
    const docRef = doc(firestore, 'mindMaps', mindMap.id);
    await updateDoc(docRef, mindMap);
    return true;
  } catch (error) {
    console.error('Error updating mind map:', error);
    return false;
  }
}

/**
 * Deletes a mind map from Firestore.
 * @param {string} mindMapId - The ID of the mind map to delete.
 * @returns {Promise<boolean>} - A promise that resolves to true if the deletion was successful.
 */
export async function deleteMindMap(mindMapId) {
    try {
      await deleteDoc(doc(firestore, 'mindMaps', mindMapId));
      return true;
    } catch (error) {
      console.error('Error deleting mind map:', error);
      return false;
    }
  }