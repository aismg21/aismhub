"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string;
  onSuccess?: () => void;
}

export default function CategoryModal({ isOpen, onClose, categoryId, onSuccess }: CategoryModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      if (categoryId) {
        const docRef = doc(db, "categories", categoryId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setName(docSnap.data().name || "");
      } else {
        setName("");
      }
    };

    if (isOpen) fetchCategory();
  }, [categoryId, isOpen]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      if (categoryId) {
        await updateDoc(doc(db, "categories", categoryId), { name });
      } else {
        await addDoc(collection(db, "categories"), { name });
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
    }}>
      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", width: "300px" }}>
        <h2 style={{ marginBottom: "10px" }}>{categoryId ? "Edit Category" : "Add Category"}</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category Name"
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onClose} disabled={loading}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
