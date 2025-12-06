"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const homeLink = user ? "/home" : "/";

  return (
    <header
      className="
        sticky top-0 z-50 
        shadow-md
        bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 
        text-white
      "
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        
        {/* Logo + Text */}
        <Link href={homeLink} className="flex items-center space-x-2">
          <Image
            src="/aismhub-logo.png"
            alt="AiSMHub Logo"
            width={134}
            height={30}
            className="rounded-md"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4 items-center">
          <Link href={homeLink} className="hover:underline">Home</Link>

          <Link href="/about" className="hover:underline">About</Link>

          {/* ✅ Added Contact Page Link */}
          <Link href="/contact" className="hover:underline">Contact Us</Link>

          {user && <Link href="/profile" className="hover:underline">Profile</Link>}

          {user ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-red-500 px-4 py-1 rounded hover:bg-red-600"
            >
              Logout
            </motion.button>
          ) : (
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-500 px-4 py-1 rounded hover:bg-green-600"
              >
                Login
              </motion.button>
            </Link>
          )}
        </nav>

        {/* Mobile Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl"
          >
            {menuOpen ? "✖" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-blue-600/90 text-white flex flex-col px-4 pb-4 space-y-2 overflow-hidden"
          >
            <Link href={homeLink} onClick={() => setMenuOpen(false)}>Home</Link>

            <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>

            {/* ✅ Added Contact Page Link */}
            <Link href="/contact" onClick={() => setMenuOpen(false)}>
              Contact Us
            </Link>

            {user && (
              <Link href="/profile" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
            )}

            {user ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="bg-red-500 px-4 py-1 rounded hover:bg-red-600"
              >
                Logout
              </motion.button>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-500 px-4 py-1 rounded hover:bg-green-600"
                >
                  Login
                </motion.button>
              </Link>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
