import type React from "react"
import "@/app/globals.css"
import { Quicksand } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SideNav } from "@/components/side-nav"
import { Toaster } from "@/components/ui/toaster"

const quicksand = Quicksand({ 
  subsets: ["latin"],
  variable: "--font-quicksand",
})

export const metadata = {
  title: "Freshom Admin Dashboard",
  description: "Admin dashboard for Freshom Chicken Farm",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <div className="flex flex-1">
              <SideNav />
              <main className="flex-1 ml-64 font-medium bg-white text-gray-700">{children}</main>
            </div>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}