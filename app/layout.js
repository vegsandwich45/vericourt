import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AIAssistantBot from '../components/AIAssistantBot';

export const metadata = {
  title: 'VeriCourt — Decentralized Legal Verification',
  description:
    'VeriCourt lets you register, verify, and audit legal documents on the Ethereum blockchain. Only SHA-256 fingerprints are committed — your documents stay private.',
  keywords: ['blockchain', 'legal', 'document verification', 'ethereum', 'IPFS', 'decentralized'],
  authors: [{ name: 'VeriCourt' }],
  openGraph: {
    title: 'VeriCourt — Decentralized Legal Verification',
    description:
      'Register and verify legal documents on the Ethereum blockchain. Tamper-proof. Private. Permanent.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-court-bg text-court-text antialiased">
        <Navbar />
        <main className="min-h-screen bg-court-bg">{children}</main>
        <AIAssistantBot />
        <Footer />
      </body>
    </html>
  );
}
