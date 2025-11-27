import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";

interface Template {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  createdAt: any;
}

interface HistoryItem {
  id: string;
  templateId: string;
  action: string;
  createdAt: any;
}

export default function ProfilePageLogic({ user }: { user: any }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchTemplates = async () => {
      try {
        const q = query(
          collection(db, "templates"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data: Template[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Template, "id">),
        }));
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };

    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, "history"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data: HistoryItem[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }));
        setHistory(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchTemplates();
    fetchHistory();
  }, [user]);

  return { templates, history };
}
