"use client";

import { useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";   // ← IMPORTANT FIX

export default function LoginPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const addUserToFirestore = async (user: any) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error adding user to Firestore:", error);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      addUserToFirestore(user);
      router.replace("/home");
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Try again!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Checking login status...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-400 via-pink-400 to-yellow-300 px-4 animate-gradientBackground">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-sm w-full flex flex-col items-center gap-6 transform transition duration-500 hover:scale-105">

          <h1 className="text-2xl font-semi-bold text-gray-600 text-center">
            Welcome to
          </h1>

          {/* Logo with Link */}
          <Link href="/">
            <Image
              src="/aismhub-logo2.png"
              alt="AiSMHub Logo"
              width={180}
              height={40}
              className="rounded-lg cursor-pointer"
            />
          </Link>

          <p className="text-gray-400 text-center">
            Continue to your AiSMHub dashboard
          </p>

          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 bg-white text-gray-800 px-6 py-3 rounded-lg shadow-lg border border-gray-300 hover:shadow-xl transition transform hover:-translate-y-1 w-full font-semibold"
          >
            <svg className="w-6 h-6" viewBox="0 0 533.5 544.3">
              <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.4H272v95.5h146.9c-6.3 34.3-25.2 63.5-53.9 83.1v68h87c50.6-46.7 79.5-115.5 79.5-196.2z" />
              <path fill="#34A853" d="M272 544.3c72.6 0 133.5-23.9 178-64.9l-87-68c-24.2 16.2-55.1 25.8-91 25.8-69.9 0-129.2-47.3-150.4-111.2h-89v69.8C67 477.1 161.3 544.3 272 544.3z" />
              <path fill="#FBBC05" d="M121.6 303.9c-5.4-16.2-8.5-33.4-8.5-51 0-17.6 3.1-34.8 8.5-51v-69.8h-89C13.5 197.2 0 235 0 272s13.5 74.8 32.6 108.9l89-69.9z" />
              <path fill="#EA4335" d="M272 107.2c39.5 0 75 13.6 102.8 40.3l77-77C404.7 24.1 343.6 0 272 0 161.3 0 67 67.2 32.6 160.1l89 69.8C142.8 154.5 202.1 107.2 272 107.2z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-gray-400 text-center text-sm mt-2">
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-purple-600 underline hover:text-purple-800">
              Terms & Conditions.
            </a>{" "}
            Go to{" "}
            <a href="/" className="text-purple-600 underline hover:text-purple-800">
              Home page
            </a>.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
