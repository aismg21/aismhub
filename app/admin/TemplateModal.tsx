"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
  onSuccess?: () => void;
}

export default function TemplateModal({
  isOpen,
  onClose,
  templateId,
  onSuccess,
}: TemplateModalProps) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [imageName, setImageName] = useState(""); // only file name
  const [loading, setLoading] = useState(false);

  // Base URL
  const buildURL = (name: string) =>
    `https://upnwgxcyyzwqmoyfnint.supabase.co/storage/v1/object/public/aismhub/templates/${name.endsWith(".jpg") ? name : name + ".jpg"}`;

  // Fetch categories
  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "categories"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as { id: string; name: string }[];
    setCategories(data);
  };

  // Fetch template for editing
  const fetchTemplate = async () => {
    if (!templateId) return;

    const docRef = doc(db, "templates", templateId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      setTitle(data.title || "");
      setCategoryId(data.categoryId || "");

      // extract filename from URL
      const parts = data.imageUrl.split("/");
      const file = parts[parts.length - 1];
      setImageName(file);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories().then(fetchTemplate);
    } else {
      setTitle("");
      setCategoryId("");
      setImageName("");
    }
  }, [isOpen, templateId]);

  const handleSubmit = async () => {
    if (!title.trim() || !categoryId || !imageName.trim()) {
      alert("Please enter title, select category, and enter file name");
      return;
    }

    setLoading(true);

    try {
      const catRef = doc(db, "categories", categoryId);
      const catSnap = await getDoc(catRef);
      const categoryName = catSnap.exists()
        ? catSnap.data().name
        : "other";

      const finalUrl = buildURL(imageName.trim());

      const templateData = {
        title: title.trim(),
        categoryId,
        category: categoryName.toLowerCase(),
        imageUrl: finalUrl,
        createdAt: serverTimestamp(),
      };

      if (templateId) {
        await updateDoc(doc(db, "templates", templateId), templateData);
      } else {
        await addDoc(collection(db, "templates"), templateData);
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error saving template:", err);
      alert("Error saving template, check console.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          width: "320px",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>
          {templateId ? "Edit Template" : "Add Template"}
        </h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Template Title"
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* 🔥 Enter only FILE NAME */}
        <input
          type="text"
          value={imageName}
          onChange={(e) => setImageName(e.target.value)}
          placeholder="Enter file name (example: holi.jpg)"
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        {imageName && (
          <>
            <p style={{ fontSize: "12px" }}>Preview:</p>
            <img
              src={buildURL(imageName)}
              alt="Preview"
              style={{
                width: "100%",
                marginBottom: "10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
              }}
            />
          </>
        )}

        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
          <button onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
