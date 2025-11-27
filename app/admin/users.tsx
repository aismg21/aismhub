"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [user] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    // Only allow admins (basic check)
    if (!user) {
      router.push("/login");
    } else {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCol = collection(db, "users"); // Make sure your users are in 'users' collection
      const userSnapshot = await getDocs(usersCol);
      const usersList: User[] = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>Admin - Users</h1>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Name</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Email</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Phone</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{u.id}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{u.name}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{u.email}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{u.phone || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
