"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import CategoryModal from "./CategoryModal";

interface Category {
  id: string;
  name: string;
}

export default function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "categories"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Category[];
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openModal = (id?: string) => { setSelectedCategoryId(id); setModalOpen(true); };
  const closeModal = () => { setSelectedCategoryId(undefined); setModalOpen(false); };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try { await deleteDoc(doc(db, "categories", id)); fetchCategories(); }
    catch(err) { console.error(err); }
  };

  return (
    <div>
      <button onClick={() => openModal()} className="px-3 py-1 bg-blue-500 text-white rounded mb-2">
        Add Category
      </button>

      {categories.length > 0 && (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">#</th>
              <th className="border px-2 py-1">Category</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, idx) => (
              <tr key={cat.id}>
                <td className="border px-2 py-1">{idx + 1}</td>
                <td className="border px-2 py-1">{cat.name}</td>
                <td className="border px-2 py-1 flex space-x-2">
                  <button onClick={() => openModal(cat.id)} className="px-2 py-1 bg-green-500 text-white rounded">Edit</button>
                  <button onClick={() => handleDelete(cat.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <CategoryModal
        isOpen={modalOpen}
        onClose={closeModal}
        categoryId={selectedCategoryId}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
