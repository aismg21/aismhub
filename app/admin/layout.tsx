"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // ✅ Admin UID(s)
  const ADMIN_UIDS = ["nwIpLPLwtcWu5osZ5yUHBxmb3m83"];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);

      // Normal users ko login page pe redirect karo
      if (u && !ADMIN_UIDS.includes(u.uid)) {
        router.replace("/login");
      }

      // Agar logged out hai aur /admin/login nahi hai
      if (!u && pathname !== "/admin/login") {
        router.replace("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) return null;

  const isAdmin = user && ADMIN_UIDS.includes(user.uid);
  const isLoginPage = pathname === "/admin/login";

  // Login page ko bina layout ke dikhao
  if (isLoginPage) return <>{children}</>;

  // Agar admin nahi hai, sirf children dikhao (sidebar hide)
  if (!isAdmin) return <div>{children}</div>;

  // ✅ Admin layout
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "240px",
          background: "#1E1E2D",
          color: "white",
          padding: "20px",
        }}
      >
        <h2 style={{ marginBottom: "20px", fontSize: "20px" }}>Admin Panel</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link href="/admin" style={linkStyle}>Dashboard</Link>
          <Link href="/admin/categories" style={linkStyle}>Categories</Link>
          <Link href="/admin/templates" style={linkStyle}>Templates</Link>
          <Link href="/admin/users" style={linkStyle}>Users</Link>
        </nav>

        <button
          onClick={async () => { await signOut(auth); router.push("/"); }}
          style={{
            marginTop: "30px",
            background: "red",
            padding: "8px 14px",
            borderRadius: "5px",
            width: "100%",
            color: "white",
          }}
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, background: "#F5F6FA" }}>
        <div
          style={{
            background: "#fff",
            padding: "15px 25px",
            borderBottom: "1px solid #ddd",
            fontSize: "18px",
            fontWeight: "500",
          }}
        >
          {pathname.includes("categories")
            ? "Categories"
            : pathname.includes("templates")
            ? "Templates"
            : pathname.includes("users")
            ? "Users"
            : "Admin Dashboard"}
        </div>

        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  color: "#ddd",
  fontSize: "16px",
  textDecoration: "none",
  padding: "8px 10px",
  borderRadius: "4px",
  background: "#2A2A40",
};
