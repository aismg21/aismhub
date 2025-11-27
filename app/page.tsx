"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

interface Template {
  id: string;
  title: string;
  category?: string;
  imageUrl?: string;
}

export default function LandingPage() {
  const router = useRouter();

  // Categories
  const categories = [
    { name: "Festivals", icon: "🎉" },
    { name: "Business", icon: "💼" },
    { name: "Quotes", icon: "💬" },
    { name: "Birthday", icon: "🎂" },
    { name: "Wedding", icon: "💍" },
    { name: "Food", icon: "🍱" },
    { name: "Offers", icon: "🏷️" },
    { name: "Fashion", icon: "👗" },
  ];

  // Firebase Templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [visibleCount, setVisibleCount] = useState(100);

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

  const handleCategoryClick = (cat: string) => {
    router.push(`/login?category=${encodeURIComponent(cat)}`);
  };

  const handleTemplateClick = (templateUrl: string) => {
    router.push(`/login?templateUrl=${encodeURIComponent(templateUrl)}`);
  };

  const handleLoadMore = () => setVisibleCount((prev) => prev + 100);

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-white to-blue-50 text-gray-800 overflow-hidden">

      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center justify-between px-10 md:px-20 py-16 md:py-24 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Create Stunning Social Media Posts in Seconds 🚀
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Design, customize, and download professional posters with AiSMHub’s AI-powered post maker.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/login")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transition"
          >
            Continue to Login
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex-1 flex justify-center"
        >
          <Image
            src="/banner.jpg"
            alt="AiSMHub Hero Banner"
            width={500}
            height={400}
            className="rounded-2xl shadow-xl"
          />
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="px-8 md:px-16 py-10 bg-white/70 border-y">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-bold mb-6 text-center"
        >
          Browse by Category
        </motion.h3>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm hover:shadow-md border hover:border-blue-400 py-4 cursor-pointer transition"
              onClick={() => handleCategoryClick(cat.name)}
            >
              <span className="text-3xl mb-2">{cat.icon}</span>
              <p className="font-medium text-gray-700">{cat.name}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Templates Grid */}
      <section className="px-8 md:px-16 py-10">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-bold mb-6"
        >
          Explore Templates
        </motion.h3>

        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {templates.slice(0, visibleCount).map((temp) => (
              <motion.div
                key={temp.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                className="relative cursor-pointer overflow-hidden rounded-xl shadow-md bg-white aspect-square"
                onClick={() => handleTemplateClick(temp.imageUrl!)}
              >
                <Image
                  src={temp.imageUrl!}
                  alt={temp.title}
                  fill
                  unoptimized
                  className="object-cover w-full h-full"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm font-medium">
                  {temp.title}
                  <span className="block text-xs">{temp.category}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {visibleCount < templates.length && (
          <div className="flex justify-center mt-10">
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
      </section>
    </main>
  );
}
