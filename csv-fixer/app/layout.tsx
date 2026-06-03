import React from "react";

export const metadata = {
  title: "Shopify CSV Price Fixer & Handle Sanitizer",
  description: "1-Click to adjust product prices by 1.5x and auto-generate clean Shopify Handles locally. 100% Secure.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: "#fafafa" }}>
        {children}
      </body>
    </html>
  );
}
