import React from "react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B5D8FF] via-[#E3F4FF] to-[#FFF5F7] flex justify-center py-24 px-6 animate-fadeIn">
      <div className="w-full max-w-4xl bg-white/60 backdrop-blur-2xl p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 animate-slideUp">

        {/* HEADER */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight drop-shadow-md animate-fadeInSlow">
            Contact Us
          </h1>
          <p className="text-gray-700 mt-3 text-lg animate-fadeInSlow opacity-90">
            We're here to assist you. AISMHub team responds within 24 hours.
          </p>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">

          {/* CARD */}
          <div className="group p-7 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-xl hover:shadow-2xl transition-all text-center hover:-translate-y-1 animate-cardFade">
            <div className="text-4xl mb-3 group-hover:scale-110 transition">📧</div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Email</h3>
            <p className="text-gray-700 text-sm">support@aismhub.com</p>
          </div>

          <div className="group p-7 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-xl hover:shadow-2xl transition-all text-center hover:-translate-y-1 animate-cardFade">
            <div className="text-4xl mb-3 group-hover:scale-110 transition">⏰</div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Business Hours</h3>
            <p className="text-gray-700 text-sm">Mon – Sat</p>
            <p className="text-gray-700 text-sm">10 AM – 6 PM</p>
          </div>

          <div className="group p-7 rounded-2xl bg-white/70 backdrop-blur-md border border-gray-200 shadow-xl hover:shadow-2xl transition-all text-center hover:-translate-y-1 animate-cardFade">
            <div className="text-4xl mb-3 group-hover:scale-110 transition">📍</div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Location</h3>
            <p className="text-gray-700 text-sm">Delhi, India</p>
          </div>
        </div>

        {/* SOCIAL LINKS */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all animate-slideUpDelay">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">🌐 Social Links</h2>

          <div className="space-y-3 text-gray-800 text-lg">
            <a href="https://www.facebook.com/aismhub" target="_blank" className="block hover:text-blue-600 transition-all hover:translate-x-1">Facebook</a>
            <a href="https://www.instagram.com/aismhub/" target="_blank" className="block hover:text-pink-600 transition-all hover:translate-x-1">Instagram</a>
          </div>
        </div>

      </div>

      {/* ANIMATIONS */}
      <style>{`
        .animate-fadeIn { animation: fadeIn 1s ease-in-out; }
        .animate-fadeInSlow { animation: fadeIn 1.8s ease-in-out; }
        .animate-slideUp { animation: slideUp 1.2s ease-out; }
        .animate-slideUpDelay { animation: slideUp 1.6s ease-out; }
        .animate-cardFade { animation: fadeIn 1.2s ease-in-out; }

        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
