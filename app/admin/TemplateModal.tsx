"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, serverTimestamp } from "firebase/firestore";

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
  onSuccess?: () => void;
}

export default function TemplateModal({ isOpen, onClose, templateId, onSuccess }: TemplateModalProps) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [fileName, setFileName] = useState(""); // user sirf file name dale
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-generate imageUrl when fileName changes
  useEffect(() => {
    if (fileName.trim() === "") {
      setImageUrl("");
    } else {
      setImageUrl(`templates/${fileName.trim()}.jpg`);
    }
  }, [fileName]);

  // Fetch categories
  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "categories"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as { id: string; name: string }[];
    setCategories(data);
  };

  // Fetch template if editing
  const fetchTemplate = async () => {
    if (!templateId) return;
    const docRef = doc(db, "templates", templateId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setTitle(data.title || "");
      setCategoryId(data.categoryId || "");
      // extract file name from existing imageUrl
      if (data.imageUrl) {
        const parts = data.imageUrl.split("/"); 
        setFileName(parts[parts.length - 1].replace(".jpg", ""));
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories().then(fetchTemplate);
    } else {
      setTitle("");
      setCategoryId("");
      setFileName("");
      setImageUrl("");
    }
  }, [isOpen, templateId]);

  const handleSubmit = async () => {
    if (!title.trim() || !categoryId || !fileName.trim()) {
      alert("Please enter title, select category, and file name");
      return;
    }

    setLoading(true);
    try {
      const catRef = doc(db, "categories", categoryId);
      const catSnap = await getDoc(catRef);
      const categoryName = catSnap.exists() ? catSnap.data().name : "other";

      const templateData = {
        title: title.trim(),
        categoryId,
        category: categoryName.toLowerCase(),
        imageUrl: imageUrl.trim().replace("\\", "/"),
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
      <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", width: "300px" }}>
        <h2 style={{ marginBottom: "10px" }}>{templateId ? "Edit Template" : "Add Template"}</h2>

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

        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Enter file name only"
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        {imageUrl && (
          <>
            <p>Preview: {imageUrl}</p>
            <img src={imageUrl.replace("\\", "/")} alt="Preview" style={{ width: "100%", marginBottom: "10px" }} />
          </>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={onClose} disabled={loading}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
