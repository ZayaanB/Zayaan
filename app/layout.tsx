import type { Metadata } from 'next';
import { JetBrains_Mono, Outfit, Sora } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700'],
});
const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['500', '600', '700', '800'],
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: { default: 'Zayaan Bhanwadia', template: '%s | Zayaan Bhanwadia' },
  description:
    'Portfolio of Zayaan Bhanwadia — CS student at UTSC building practical software with a clear focus on impact.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${sora.variable} ${jetbrains.variable}`}>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
