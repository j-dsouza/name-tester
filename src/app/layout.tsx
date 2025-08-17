import type { Metadata } from "next"
import { Montserrat, Playfair_Display, Source_Code_Pro } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-sans"
})

const playfairDisplay = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-serif"
})

const sourceCodePro = Source_Code_Pro({ 
  subsets: ["latin"],
  variable: "--font-mono"
})

export const metadata: Metadata = {
  title: "Name Tester",
  description: "Baby name combination explorer",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${playfairDisplay.variable} ${sourceCodePro.variable} font-sans`}>
        <div className="min-h-screen bg-background">
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}