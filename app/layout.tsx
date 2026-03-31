import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import LanguageToggle from '@/components/LanguageToggle';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import AuthGuard from '@/components/AuthGuard';
import LogoutButton from '@/components/LogoutButton';

export const metadata: Metadata = {
  title: 'Iglesias Dairy',
  description: 'Dairy farm management PWA',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Iglesias Dairy" />
      </head>
      <body className="bg-gray-50 text-gray-900 font-sans">
        <ServiceWorkerRegistrar />
        <AuthGuard>
          <div className="flex flex-col min-h-screen max-w-lg mx-auto">
            <header className="bg-green-700 text-white px-4 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐄</span>
                <div>
                  <span className="font-bold text-lg tracking-tight">Iglesias Dairy</span>
                  <span className="ml-2 text-xs bg-white text-green-700 font-bold px-2 py-0.5 rounded-full">DEMO #7</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <LogoutButton />
                <LanguageToggle />
              </div>
            </header>
            <main className="flex-1 pb-20 px-4 py-4">
              {children}
            </main>
            <Nav />
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}
