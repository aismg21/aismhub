import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";

export const metadata = {
  title: {
    default: "AiSMHub – AI Social Media Post Maker",
    template: "%s | AiSMHub",
  },

  description:
    "AiSMHub is an AI-powered social media post maker that helps you create festival posts, business promotions, quotes, invitations, marketing templates, and more in seconds.",

  keywords: [
    "AI post maker",
    "social media templates",
    "festival post maker",
    "AI graphic design",
    "business post maker",
    "aismhub",
    "instagram post maker",
    "ai template generator",
    "post generator app",
  ],

  icons: {
    icon: "/aismhub_favicon.png",
    shortcut: "/aismhub_favicon.png",
    apple: "/aismhub_favicon.png",
  },

  openGraph: {
    title: "AiSMHub – AI Social Media Post Maker",
    description:
      "Create stunning festival posts, business ads, quotes, invitations, and marketing graphics with AI.",
    url: "https://aismhub.com",
    siteName: "AiSMHub",
    images: [
      {
        url: "/aismhub-og-banner.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "AiSMHub – AI Post Maker",
    description:
      "Create amazing posts for social media instantly using AI-powered templates.",
    images: ["/aismhub-og-banner.png"],
  },

  metadataBase: new URL("https://aismhub.com"),
};

// 👇 Client Component Wrapper for JS blocking
function ClientScripts({ children }: { children: React.ReactNode }) {
  return (
    <div
      suppressHydrationWarning
    >
      {children}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener("contextmenu", function(e) {
              e.preventDefault();
            });

            document.addEventListener("keydown", function(e) {
              if (e.key === "F12") e.preventDefault();
              if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) e.preventDefault();
              if (e.ctrlKey && e.key === "U") e.preventDefault();
            });
          `,
        }}
      />
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <ClientScripts>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClientScripts>
      </body>
    </html>
  );
}
