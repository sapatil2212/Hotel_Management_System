import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import RootShell from '@/components/layout/root-shell';
import ClientChrome from '@/components/layout/client-chrome';
import { AppSessionProvider } from '@/components/auth/session-provider';
import { HotelProvider } from '@/contexts/hotel-context';

const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair'
});

export const metadata: Metadata = {
  title: 'Grand Luxe Hotel - Experience Luxury Redefined',
  description: 'Discover unparalleled luxury and comfort at Grand Luxe Hotel. Premium accommodations, world-class dining, and exceptional service in the heart of the city.',
  keywords: 'luxury hotel, premium accommodation, fine dining, spa, conference hall, city center',
  openGraph: {
    title: 'Grand Luxe Hotel - Experience Luxury Redefined',
    description: 'Discover unparalleled luxury and comfort at Grand Luxe Hotel.',
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grand Luxe Hotel - Experience Luxury Redefined',
    description: 'Discover unparalleled luxury and comfort at Grand Luxe Hotel.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${playfair.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AppSessionProvider>
            <HotelProvider>
              {/* Hide header/footer conditionally via client wrapper */}
              <ClientChrome>
                {/* In non-dashboard/auth pages, show nav/footer shell */}
              </ClientChrome>
              <RootShell>
                {children}
              </RootShell>
            </HotelProvider>
          </AppSessionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}