import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "About AiSMHub – AI Social Media Content Platform",
  description:
    "AiSMHub is an AI-powered platform that helps businesses and creators grow with SEO-optimized content, social media posts, prompts, and captions.",
};

export default function AboutPage(): React.ReactNode {
  return (
    <main className="w-full">
      {/* HERO SECTION */}
      <section className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&q=80"
          alt="AiSMHub Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Hero Text */}
        <div className="relative text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            About AiSMHub
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mt-4 max-w-2xl mx-auto">
            Your All-in-One AI Social Media Content Platform
          </p>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-lg leading-relaxed text-gray-700 mb-8">
          AiSMHub is a leading AI-powered content creation platform built to help
          businesses, creators, and marketers scale faster with high-quality,
          SEO-friendly, and engagement-driven social media content. We combine
          intelligent automation with effective digital marketing principles to
          deliver professional, consistent, and brand-ready content in seconds.
        </p>

        {/* IMAGE + TEXT SECTION */}
        <div className="grid md:grid-cols-2 gap-10 items-center mt-10">
          <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&q=80"
            alt="AiSMHub Workspace"
            className="w-full rounded-xl shadow-lg"
          />

          <div>
            <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>AI-generated social media posts across all categories</li>
              <li>SEO-optimized captions, hashtags & marketing content</li>
              <li>High-quality prompts for images, branding & ad creatives</li>
              <li>Daily trending ideas for organic growth</li>
              <li>Brand-aligned content for all platforms</li>
            </ul>
          </div>
        </div>

        {/* SECOND SECTION */}
        <div className="grid md:grid-cols-2 gap-10 items-center mt-16">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Why AiSMHub?</h2>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Save up to 90% time & cost on content creation</li>
              <li>Create consistent posts with zero creative block</li>
              <li>Boost organic reach, engagement & conversions</li>
              <li>Perfect for creators, agencies & businesses</li>
              <li>Optimized for Instagram, YouTube, Facebook & more</li>
            </ul>
          </div>

          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&q=80"
            alt="AiSMHub AI Content"
            className="w-full rounded-xl shadow-lg"
          />
        </div>

        {/* MISSION */}
        <h2 className="text-2xl font-semibold mt-16 mb-4">Our Mission</h2>
        <p className="text-lg leading-relaxed text-gray-700 mb-10">
          At AiSMHub, we aim to make professional content creation simple and
          accessible. Whether you're launching a new brand or managing multiple
          clients, AiSMHub empowers you to generate high-performing content with
          speed, accuracy, and creativity.
        </p>

        <p className="text-xl font-semibold text-center mt-6">
          AiSMHub — Smart AI. Stronger Growth. Better Results.
        </p>
      </section>
    </main>
  );
}
