"use client";

import { Suspense } from "react";
import PostEditor from "@/app/components/PostEditor/PostEditor";
import { useSearchParams } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/config";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading editor...</p>}>
      <InnerPage />
    </Suspense>
  );
}

function InnerPage() {
  const searchParams = useSearchParams();
  const templateUrl = searchParams.get("templateUrl") || "";

  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please login to edit posts.</p>;

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-md rounded-lg p-6 my-4 mx-4 md:mx-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome to Post Editor
        </h2>
        <p className="text-gray-600 mt-2">
          Customize your template and create stunning posts!
        </p>
      </div>

      <div className="flex-1 p-4">
        <PostEditor userId={user.uid} templateUrl={templateUrl} />
      </div>
    </div>
  );
}
