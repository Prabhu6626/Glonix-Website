import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { SessionMonitor } from "@/components/auth/session-monitor"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CartProvider } from "@/hooks/use-cart"
import { WishlistProvider } from "@/hooks/use-wishlist"
import WhatsAppFloat from "@/components/WhatsAppFloat" // Add this import

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Glonix Electronics - PCB Fabrication & Assembly Services",
  description:
    "Professional PCB fabrication, assembly, component sourcing, and custom hardware development services. Trusted by startups to global OEMs.",
  generator: "Glonix Electronics",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${dmSans.style.fontFamily};
  --font-heading: ${spaceGrotesk.variable};
  --font-body: ${dmSans.variable};
}
        `}</style>
      </head>
      <body className={`${spaceGrotesk.variable} ${dmSans.variable} font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <SessionMonitor />
              <WhatsAppFloat phoneNumber="+1234567890" /> {/* Add this line */}
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}