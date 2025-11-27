"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/firebase/config";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string; // <- Correct field
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [user] = useAuthState(auth);
  const router = useRouter();

  // Redirect non-logged-in users
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      fetchUsers();
    }
  }, [user]);

  // Filter users on search input
  useEffect(() => {
    setFilteredUsers(
      users.filter(
        (u) =>
          (u.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
          (u.email?.toLowerCase() || "").includes(search.toLowerCase()) ||
          (u.phoneNumber?.includes(search) || false)
      )
    );
  }, [search, users]);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCol = collection(db, "users");
      const userSnapshot = await getDocs(usersCol);
      const usersList: User[] = userSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber, // <- use correct field
        };
      }) as User[];
      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(users.filter((u) => u.id !== userId));
      setFilteredUsers(filteredUsers.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Open edit modal
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditPhone(user.phoneNumber || "");
  };

  // Save edits
  const handleEditSave = async () => {
    if (!editingUser) return;
    try {
      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, {
        name: editName,
        email: editEmail,
        phoneNumber: editPhone, // <- update correct field
      });

      // Update local state
      const updatedUser = { ...editingUser, name: editName, email: editEmail, phoneNumber: editPhone };
      setUsers(users.map((u) => (u.id === editingUser.id ? updatedUser : u)));
      setFilteredUsers(filteredUsers.map((u) => (u.id === editingUser.id ? updatedUser : u)));

      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleModalClose = () => setEditingUser(null);

  return (
    <div className="p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6">Admin - Users</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded w-full md:w-1/3"
        />
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2 text-left">ID</th>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
                <th className="border px-4 py-2 text-left">Phone</th>
                <th className="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{u.id}</td>
                  <td className="border px-4 py-2">{u.name || "-"}</td>
                  <td className="border px-4 py-2">{u.email || "-"}</td>
                  <td className="border px-4 py-2">{u.phoneNumber || "-"}</td>
                  <td className="border px-4 py-2 flex gap-2">
                    <button
                      onClick={() => handleEditClick(u)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Name"
                className="px-3 py-2 border rounded w-full"
              />
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Email"
                className="px-3 py-2 border rounded w-full"
              />
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Phone"
                className="px-3 py-2 border rounded w-full"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
