import type { Metadata } from 'next';
import { JetBrains_Mono, Outfit, Sora } from 'next/font/google';
import './globals.css';
import Nav from '@/components/layout/Nav';
import Footer from '@/components/layout/Footer';
import { LiteModeProvider } from '@/components/layout/LiteModeProvider';
import { GlobalDottedSurface } from '@/components/ui/global-dotted-surface';

// font setup
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['400', '500', '600', '700'] });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['500', '600', '700', '800'] });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', weight: ['400', '600', '700'] });

export const metadata: Metadata = {
  title: { default: 'Zayaan Bhanwadia', template: '%s | Zayaan Bhanwadia' },
  description: 'Portfolio of Zayaan Bhanwadia - CS student at UTSC building practical software with a clear focus on impact.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${outfit.variable} ${sora.variable} ${jetbrains.variable} min-h-screen flex flex-col`}>
        <LiteModeProvider>
          {/* binary 1/0 wave background stays fixed behind all content */}
          <GlobalDottedSurface />
          <Nav />
          <div className="flex-1">{children}</div>
          <Footer />
        </LiteModeProvider>
      </body>
    </html>
  );
}
