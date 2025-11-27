"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import Image from "next/image";

// TYPES
interface SocialLinks {
  facebook?: string;
  instagram?: string;
  x?: string;
  youtube?: string;
  linkedin?: string;
  whatsapp?: string;
}

export default function ProfilePage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const [profileData, setProfileData] = useState<any>({
    phoneNumber: "",
    messageText: "",
    socialLinks: {} as SocialLinks,
  });

  const [saving, setSaving] = useState(false);

  // REDIRECT IF NOT LOGGED IN
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  // FETCH PROFILE DATA
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setProfileData((prev: any) => ({
          ...prev,
          ...snap.data(),
        }));
      }
    };

    fetchProfile();
  }, [user]);

  // SAVE PROFILE
  const handleProfileSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      await setDoc(doc(db, "users", user.uid), profileData, { merge: true });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving profile!");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/");
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return null;

  const avatarUrl =
    user.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.displayName || "User"
    )}&background=0D8ABC&color=fff&size=128`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      {/* BANNER */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center mt-16 shadow-md">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-20 h-20">
            <Image
              src={avatarUrl}
              alt="User Profile"
              fill
              className="rounded-full object-cover border-2 border-white shadow-md"
            />
          </div>

          <h2 className="text-3xl font-bold">
            Hello, {user.displayName || "User"} 👋
          </h2>

          <p className="opacity-80 text-sm">
            Manage your profile details
          </p>
        </div>
      </section>

      {/* SETTINGS ONLY */}
      <main className="flex-1 p-6">
        <div className="max-w-md mx-auto space-y-5 bg-white p-6 rounded-xl shadow">
          <label className="block">
            <span className="font-semibold">Name</span>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mt-1"
              value={profileData.displayName || user.displayName || ""}
              onChange={(e) =>
                setProfileData((p: any) => ({
                  ...p,
                  displayName: e.target.value,
                }))
              }
            />
          </label>

          <label className="block">
            <span className="font-semibold">Email</span>
            <input
              type="email"
              disabled
              className="w-full border rounded px-3 py-2 mt-1 bg-gray-100 cursor-not-allowed"
              value={user.email || ""}
            />
          </label>

          {/* MULTI-LINE MESSAGE */}
          <label className="block">
            <span className="font-semibold">Message Text</span>
            <textarea
              className="w-full border rounded px-3 py-2 mt-1"
              style={{ minHeight: "200px", resize: "vertical" }}
              placeholder="Write your message here..."
              value={profileData.messageText || ""}
              onChange={(e) =>
                setProfileData((p: any) => ({
                  ...p,
                  messageText: e.target.value,
                }))
              }
            ></textarea>
          </label>

          <label className="block">
            <span className="font-semibold">Phone Number</span>
            <input
              type="tel"
              className="w-full border rounded px-3 py-2 mt-1"
              value={profileData.phoneNumber || ""}
              onChange={(e) =>
                setProfileData((p: any) => ({
                  ...p,
                  phoneNumber: e.target.value,
                }))
              }
            />
          </label>

          <div>
            <p className="font-semibold mb-2">Social Links</p>

            {["facebook", "instagram", "x", "youtube", "linkedin", "whatsapp"].map(
              (platform) => (
                <label key={platform} className="block capitalize mb-2">
                  {platform}
                  <input
                    type="text"
                    value={profileData.socialLinks?.[platform] || ""}
                    onChange={(e) =>
                      setProfileData((p: any) => ({
                        ...p,
                        socialLinks: {
                          ...p.socialLinks,
                          [platform]: e.target.value,
                        },
                      }))
                    }
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </label>
              )
            )}
          </div>

          <button
            onClick={handleProfileSave}
            disabled={saving}
            className="bg-blue-600 text-white w-full p-2 rounded hover:bg-blue-700"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white w-full p-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}
