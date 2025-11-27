"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

interface Template {
  id: string;
  title: string;
  category?: string;
  imageUrl?: string;
}

export default function HomePage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [visibleCount, setVisibleCount] = useState(100);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        const list = snap.docs
          .map((doc) => (doc.data()?.name || "").trim().toLowerCase())
          .filter((x) => x !== "");
        setCategories(["all", ...list]);
      } catch (e) {
        console.log("Category error:", e);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const q = query(collection(db, "templates"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const data: Template[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            title: d.title || "Untitled",
            category: (d.category?.trim().toLowerCase()) || "other",
            imageUrl: d.imageUrl?.trimStart() || "/no-image.png",
          };
        });

        setTemplates(data);
      } catch (err) {
        console.error("Error fetching templates:", err);
      }
    };

    fetchTemplates();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return null;

  const filteredTemplates = templates.filter((item) => {
    const itemCat = (item.category || "other").toLowerCase();
    const selectedCat = selectedCategory.toLowerCase();
    const matchCategory = selectedCat === "all" || itemCat === selectedCat;
    const matchSearch = item.title.toLowerCase().includes(searchText.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleLoadMore = () => setVisibleCount((prev) => prev + 100);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-md rounded-md mx-4 md:mx-16 my-6 p-6 text-center"
      >
        <h2 className="text-2xl font-semibold mb-2">
          Welcome, {user.displayName || "User"}!
        </h2>
        <p className="text-gray-600">
          Explore your templates and start creating amazing posts.
        </p>
      </motion.div>

      {/* Search Input */}
      <div className="flex justify-center my-4">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-[90%] md:w-[50%] px-4 py-2 border rounded-full shadow-sm focus:outline-blue-500"
        />
      </div>

      {/* Categories */}
      <div className="w-full overflow-x-auto px-4 py-3">
        <div className="flex gap-3 justify-center min-w-max mx-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setVisibleCount(100);
              }}
              className={`px-4 py-2 rounded-full border whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4 md:px-16 mt-4"
      >
        <AnimatePresence>
          {filteredTemplates.slice(0, visibleCount).map((temp) => (
            <motion.div
              key={temp.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              className="relative cursor-pointer overflow-hidden rounded-xl shadow-md bg-white aspect-square group"
              onClick={() =>
                router.push(
                  `/post-editor?templateUrl=${encodeURIComponent(temp.imageUrl!)}`
                )
              }
            >
              <Image
                src={temp.imageUrl!}
                alt={temp.title}
                fill
                unoptimized
                className="object-cover w-full h-full"
              />
              <div
                className="absolute inset-0 flex items-center justify-center text-white font-semibold text-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                Edit Post
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm font-medium">
                {temp.title}
                <span className="block text-xs">{temp.category}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Load More */}
      {visibleCount < filteredTemplates.length && (
        <div className="flex justify-center my-100">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLoadMore}
            className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-blue-700 transition"
          >
            Load More Templates
          </motion.button>
        </div>
      )}
    </div>
  );
}
