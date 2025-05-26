import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Logo } from '@/components/Logo';
import { Footer } from '@/components/Footer';
import { AppProvider } from '@/components/AppProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RateZilla - Web3 Project Discovery Platform",
  description: "Discover, rate, and review Web3 projects across multiple blockchain ecosystems including Stellar, Aptos, Bahamut, and Polkadot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <div className="min-h-screen flex flex-col bg-background">
            <header className="bg-white shadow-sm">
              <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <Logo />
              </nav>
            </header>
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
          <ToastContainer position="bottom-right" />
        </AppProvider>
        <Toaster />
      </body>
    </html>
  );
}
