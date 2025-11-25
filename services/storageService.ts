import { AnalysisResult } from "../types";
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";

const COLLECTION_NAME = 'analyses';
const LOCAL_STORAGE_KEY = 'equicheck_analyses';

export const saveAnalysis = async (data: AnalysisResult): Promise<void> => {
  try {
    if (db) {
        // Save to Firestore
        await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            createdAt: Timestamp.fromMillis(data.timestamp)
        });
        console.log("Document successfully written to Firestore!");
    } else {
        throw new Error("Firestore not initialized");
    }
  } catch (e) {
    console.warn("Firestore save failed, falling back to LocalStorage:", e);
    // Fallback to LocalStorage
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing: AnalysisResult[] = existingStr ? JSON.parse(existingStr) : [];
    const updated = [data, ...existing];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  }
};

export const getAnalyses = async (): Promise<AnalysisResult[]> => {
  try {
    if (db) {
        const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore timestamp back to number if needed or ensure type safety
            return { ...data, id: doc.id } as unknown as AnalysisResult;
        });
    } else {
        throw new Error("Firestore not initialized");
    }
  } catch (e) {
    console.warn("Firestore fetch failed, falling back to LocalStorage:", e);
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    return existingStr ? JSON.parse(existingStr) : [];
  }
};

export const clearHistory = async (): Promise<void> => {
    // Note: Clearing entire collections in Firestore from client is not recommended/easy.
    // We will just clear local storage and alert the user.
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    alert("Local history cleared. Firestore data remains intact (requires Admin SDK to delete all).");
}