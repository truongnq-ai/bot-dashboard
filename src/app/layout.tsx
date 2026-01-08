import { Inter } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import Toaster from '@/components/common/Toaster';
import QueryProvider from '@/components/providers/QueryProvider';

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body 
        className={`${inter.variable} font-inter dark:bg-gray-900`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <QueryProvider>
            <SidebarProvider>
              <AuthProvider>
                {children}
                <Toaster />
              </AuthProvider>
            </SidebarProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
