import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QR Code Generator API | Developer Platform',
  description: 'Production-ready REST API for generating customizable QR codes with authentication, batch processing, SVG/PNG formats, and interactive API explorer.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0F1115] text-slate-300 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200 min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

