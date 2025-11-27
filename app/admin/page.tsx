"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";

import CategoriesTable from "./CategoriesTable";
import TemplatesTable from "./TemplatesTable";

export default function AdminDashboard() {
  const [user, loading] = useAuthState(auth);
  const [accessDenied, setAccessDenied] = useState(false);
  const router = useRouter();

  const ADMIN_UIDS = ["jBxsQfq71XMqK3GltStXZXpFEeq1"]; // Add more admins

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!ADMIN_UIDS.includes(user.uid)) {
        setAccessDenied(true);
        setTimeout(() => router.push("/"), 3000);
      }
    }
  }, [user, loading]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (accessDenied)
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-semibold text-red-600">
          Access Denied!
        </h2>
        <p className="mt-2 text-gray-700">
          You do not have permission to view this page. Redirecting to home...
        </p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-green-700">
        Admin Panel
      </h1>

      {/* Categories Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <CategoriesTable />
      </section>

      {/* Templates Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Templates</h2>
        <TemplatesTable />
      </section>
    </div>
  );
}
