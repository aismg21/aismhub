"use client";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-4">
      <div className="max-w-7xl mx-auto text-center">
        &copy; {new Date().getFullYear()} AiSMHub. All rights reserved.
      </div>
    </footer>
  );
}
