import Link from 'next/link';

const FEATURE_LINKS = [
  { label: 'Register Document',   href: '/register' },
  { label: 'Verify Document',     href: '/verify' },
  { label: 'Blockchain Explorer', href: '/explorer' },
  { label: 'About VeriCourt',     href: '/about' },
];



export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-court-surface border-t border-court-border">
      {/* ── Main grid ──────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {/* ── Brand column ─────────────────────────────────────── */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2 w-fit group" aria-label="VeriCourt Home">
              <span
                className="text-2xl select-none group-hover:rotate-12 transition-transform duration-300"
                role="img"
                aria-hidden="true"
              >
                ⚖️
              </span>
              <span className="font-judicial text-xl tracking-wide leading-none">
                <span className="text-court-gold">Veri</span>
                <span className="text-white">Court</span>
              </span>
            </Link>

            <p className="text-court-text-dim text-sm leading-relaxed max-w-xs">
              Tamper-proof legal document verification on the Ethereum blockchain.
            </p>

            <p className="text-court-text-dim text-xs mt-1 flex items-center gap-1.5">
              <span
                className="text-base"
                role="img"
                aria-label="Ethereum"
              >
                ⟠
              </span>
              Powered by Ethereum &amp; IPFS
            </p>
          </div>

          {/* ── Features column ──────────────────────────────────── */}
          <div>
            <h3 className="text-court-text font-semibold text-sm uppercase tracking-widest mb-4">
              Features
            </h3>
            <ul className="flex flex-col gap-2">
              {FEATURE_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-court-text-dim hover:text-court-gold text-sm transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Legal Notice column ──────────────────────────────── */}
          <div>
            <h3 className="text-court-text font-semibold text-sm uppercase tracking-widest mb-4">
              Legal Notice
            </h3>

            {/* Privacy guarantee callout */}
            <div className="rounded-lg border border-court-amber/30 bg-court-amber/5 p-3 mb-4">
              <div className="flex gap-2">
                <span className="text-court-amber text-base mt-0.5 shrink-0" aria-hidden="true">🔐</span>
                <p className="text-court-text-dim text-xs leading-relaxed">
                  Documents are <strong className="text-court-text">never stored on-chain</strong>.
                  Only SHA-256 fingerprints are committed to the immutable ledger.
                </p>
              </div>
            </div>

            <p className="text-court-text-dim text-xs leading-relaxed">
              VeriCourt is a demonstration application. It is not a substitute for qualified
              legal counsel. Blockchain timestamps serve as cryptographic proof-of-existence only.
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────── */}
      <div className="border-t border-court-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-court-text-dim text-xs">
            &copy; {year} VeriCourt · Developed by <span className="text-court-gold font-bold">Bhargav Patel</span> <span className="text-court-text font-mono font-semibold">(Reg No: 25BCE1528)</span>
          </p>
          <p className="text-court-text-dim text-xs flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-court-green/70" aria-hidden="true" />
            Immutable On-Chain Registry · Sepolia EVM
          </p>
        </div>
      </div>
    </footer>
  );
}
