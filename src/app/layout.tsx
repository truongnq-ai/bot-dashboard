import { Outfit, Poppins } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

const outfit = Outfit({
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: '--font-poppins',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${outfit.className} ${poppins.variable} dark:bg-gray-900`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <SidebarProvider>
            <AuthProvider>{children}</AuthProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
