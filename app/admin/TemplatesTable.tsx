"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import TemplateModal from "./TemplateModal";

interface Template {
  id: string;
  title: string;
  categoryId: string;
  category?: string;
  imageUrl?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function TemplatesTable() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<string | undefined>(undefined);

  // Fetch categories first, then templates
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const catSnap = await getDocs(collection(db, "categories"));
      const catData = catSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(catData);

      // Fetch templates
      const tempSnap = await getDocs(collection(db, "templates"));
      const tempData = tempSnap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title || "Untitled",
          categoryId: d.categoryId || "",
          category:
            d.category?.toLowerCase() ||
            catData.find((c) => c.id === d.categoryId)?.name.toLowerCase() ||
            "Unassigned",
          imageUrl: d.imageUrl?.replace("\\", "/") || undefined,
        } as Template;
      });
      setTemplates(tempData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (id?: string) => {
    setSelectedTemplateId(id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTemplateId(undefined);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      await deleteDoc(doc(db, "templates", id));
      fetchData();
    } catch (err) {
      console.error("Error deleting template:", err);
    }
  };

  // ✅ Duplicate Template Function
  const handleDuplicate = async (id: string) => {
    try {
      const ref = doc(db, "templates", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("Template not found!");
        return;
      }

      const data = snap.data();

      await addDoc(collection(db, "templates"), {
        title: data.title + " (copy)",
        categoryId: data.categoryId || "",
        category: data.category || "",
        imageUrl: data.imageUrl || "",
        createdAt: serverTimestamp(),
      });

      alert("Template duplicated!");
      fetchData();
    } catch (e) {
      console.error("Duplicate error:", e);
      alert("Failed to duplicate template.");
    }
  };

  const getCategoryName = (template: Template) => {
    return template.category || "Unassigned";
  };

  if (loading) return <p>Loading templates...</p>;

  return (
    <div>
      <button
        onClick={() => openModal()}
        className="px-3 py-1 bg-blue-500 text-white rounded mb-2"
      >
        Add Template
      </button>

      {templates.length > 0 ? (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">#</th>
              <th className="border px-2 py-1">Thumbnail</th>
              <th className="border px-2 py-1">Title</th>
              <th className="border px-2 py-1">Category</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>

          <tbody>
            {templates.map((temp, idx) => (
              <tr key={temp.id} className="hover:bg-gray-100">
                <td className="border px-2 py-1">{idx + 1}</td>

                <td className="border px-2 py-1">
                  {temp.imageUrl ? (
                    <img
                      src={temp.imageUrl}
                      alt={temp.title}
                      className="w-12 h-12 object-cover"
                    />
                  ) : (
                    "No Image"
                  )}
                </td>

                <td className="border px-2 py-1">{temp.title}</td>

                <td className="border px-2 py-1">{getCategoryName(temp)}</td>

                <td className="border px-2 py-1 flex gap-2">
                  <button
                    onClick={() => openModal(temp.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(temp.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => handleDuplicate(temp.id)}
                    className="px-2 py-1 bg-purple-500 text-white rounded"
                  >
                    Duplicate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No templates found.</p>
      )}

      <TemplateModal
        isOpen={modalOpen}
        onClose={closeModal}
        templateId={selectedTemplateId}
        onSuccess={fetchData}
      />
    </div>
  );
}
