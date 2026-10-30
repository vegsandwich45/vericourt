'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function IPFSExplorerPage() {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pinning, setPinning] = useState(false);
  const [alert, setAlert] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchPins = async () => {
    try {
      const res = await fetch('/api/ipfs/pin');
      const data = await res.json();
      let serverPins = data.success ? data.pins : [];
      let localPins = [];
      if (typeof window !== 'undefined') {
        try {
          localPins = JSON.parse(localStorage.getItem('vericourt_user_pinned_files') || '[]');
        } catch (_) {}
      }
      const existingCids = new Set(serverPins.map((p) => p.cid));
      setPins([...localPins.filter((lp) => !existingCids.has(lp.cid)), ...serverPins]);
    } catch (err) {
      console.error('Failed to fetch IPFS pins:', err);
      if (typeof window !== 'undefined') {
        try {
          setPins(JSON.parse(localStorage.getItem('vericourt_user_pinned_files') || '[]'));
        } catch (_) {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePinFile = async () => {
    if (!selectedFile) return;
    setPinning(true);
    setAlert(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result;
        const res = await fetch('/api/ipfs/pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64,
            fileName: selectedFile.name,
            mimeType: selectedFile.type || 'application/pdf',
          }),
        });
        const data = await res.json();
        if (data.success) {
          const newPin = {
            cid: data.cid,
            file_name: selectedFile.name,
            mime_type: selectedFile.type || 'application/pdf',
            byte_size: data.byteSize || selectedFile.size,
            storage_driver: data.storageDriver || 'LOCAL_NODE',
            pin_status: 'PINNED',
            pinned_at: new Date().toISOString(),
          };
          try {
            const stored = JSON.parse(localStorage.getItem('vericourt_user_pinned_files') || '[]');
            localStorage.setItem(
              'vericourt_user_pinned_files',
              JSON.stringify([newPin, ...stored.filter((x) => x.cid !== data.cid)])
            );
          } catch (_) {}

          setAlert({
            type: 'success',
            message: data.isLocalDisk
              ? `✅ Pinned & Stored Locally on Disk at ${data.localPath} (CID: ${data.cid})`
              : `✅ Pinned to IPFS Node (CID: ${data.cid}). Click "💾 Save to Disk" in the table below to download your copy.`,
          });
          setSelectedFile(null);
          await fetchPins();
        } else {
          setAlert({ type: 'error', message: data.error || 'Pinning failed' });
        }
        setPinning(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
      setPinning(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-8 bg-court-bg text-court-text">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="border-b border-court-border pb-6">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-3 py-1 mb-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-widest">
              100% Phase · Decentralized Storage Cluster
            </span>
          </div>
          <h1 className="font-judicial text-3xl md:text-4xl text-court-gold font-bold">
            IPFS Decentralized Storage &amp; Pinning Gateway
          </h1>
          <p className="text-court-text-dim text-sm mt-1 max-w-3xl">
            Content-addressed peer-to-peer storage repository for canonical court decrees. Documents are addressed by their immutable cryptographic CID (Content Identifier) rather than centralized server URLs.
          </p>
        </div>

        {/* Alert */}
        {alert && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 animate-slide-up ${
            alert.type === 'success'
              ? 'bg-court-green/10 border-court-green/40 text-court-green'
              : 'bg-court-red/10 border-court-red/40 text-court-red'
          }`}>
            <span className="text-sm font-mono">{alert.message}</span>
            <button onClick={() => setAlert(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* ── Local Disk Directory Info Card ──────────────────────────────── */}
        <div className="p-4 rounded-xl border border-court-gold/30 bg-court-gold/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💾</span>
            <div>
              <h4 className="text-sm font-bold text-court-gold">Local Physical Storage Directory</h4>
              <p className="text-xs text-court-text-dim mt-0.5">
                Files pinned locally via <code className="text-court-gold bg-court-bg px-1.5 py-0.5 rounded">http://localhost:3000</code> are saved directly to your local computer disk:
              </p>
              <code className="text-[11px] font-mono text-cyan-300 block mt-1 bg-court-bg/80 p-1.5 rounded border border-court-border break-all select-all">
                /Users/bhargavpatel/.gemini/antigravity/scratch/vericourt/frontend/data/ipfs_store/
              </code>
            </div>
          </div>
          <div className="text-xs text-court-text-dim shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-court-green/10 text-court-green border border-court-green/30 font-mono">
              <span className="w-2 h-2 rounded-full bg-court-green animate-pulse" />
              Local Storage Active
            </span>
          </div>
        </div>

        {/* ── Pin New Document Card ───────────────────────────────────────── */}
        <div className="vc-card border-cyan-500/30 bg-court-surface/90">
          <h3 className="font-judicial text-lg text-court-gold font-bold mb-2">
            Pin New Decree to Decentralized IPFS Swarm
          </h3>
          <p className="text-xs text-court-text-dim mb-4">
            Upload any judicial decree PDF to distribute its chunks across decentralized nodes and generate an immutable CID.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="vc-input text-xs file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-court-gold file:text-night-black file:font-bold hover:file:bg-court-gold-lt"
            />
            <button
              onClick={handlePinFile}
              disabled={!selectedFile || pinning}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 whitespace-nowrap shadow-lg shadow-cyan-600/20"
            >
              {pinning ? 'Pinning to Swarm...' : '🌐 Pin to IPFS'}
            </button>
          </div>
        </div>

        {/* ── Pinned Files Grid / Table ────────────────────────────────────── */}
        <div className="vc-card p-0 overflow-hidden">
          <div className="px-6 py-3 border-b border-court-border/60 bg-court-bg/50 flex items-center justify-between">
            <p className="font-mono text-xs text-court-text-dim uppercase tracking-widest">
              📦 Canonical Pinned Decrees ({pins.length})
            </p>
            <span className="text-xs font-mono text-court-green flex items-center gap-1.5">
              <span className="vc-dot-green" /> Swarm Connected
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-court-bg/30 text-court-text-dim uppercase text-[10px] border-b border-court-border/40">
                <tr>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Content Identifier (CID)</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-court-border/20">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-court-text-dim">
                      Connecting to IPFS Gateway...
                    </td>
                  </tr>
                ) : pins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-court-text-dim">
                      No documents currently pinned.
                    </td>
                  </tr>
                ) : (
                  pins.map((pin) => (
                    <tr key={pin.cid} className="hover:bg-court-surface/40 transition-colors">
                      <td className="py-3 px-4 text-court-text font-bold">
                        📄 {pin.file_name}
                      </td>
                      <td className="py-3 px-4 text-court-gold font-mono break-all max-w-xs">
                        {pin.cid}
                      </td>
                      <td className="py-3 px-4 text-court-text-dim">
                        {(pin.byte_size / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          {pin.storage_driver}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-court-green font-semibold">
                        ● {pin.pin_status}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <a
                          href={`/api/ipfs/${pin.cid}?download=1`}
                          download={pin.file_name || `${pin.cid}.pdf`}
                          className="px-2.5 py-1 rounded bg-court-green/15 text-court-green hover:bg-court-green hover:text-night-black font-semibold text-[11px] transition-all inline-flex items-center gap-1"
                          title="Save physical PDF copy directly to your local computer"
                        >
                          💾 Save to Disk
                        </a>
                        <a
                          href={`/api/ipfs/${pin.cid}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-court-gold/15 text-court-gold hover:bg-court-gold hover:text-night-black font-semibold text-[11px] transition-all"
                        >
                          👁 Open PDF
                        </a>
                        <a
                          href={`https://ipfs.io/ipfs/${pin.cid}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-court-surface text-court-text-dim hover:text-court-text border border-court-border text-[11px] transition-all"
                        >
                          🌐 Public Gateway
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
