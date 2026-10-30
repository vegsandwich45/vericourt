# ⚖️ VeriCourt: Sovereign Decentralized Evidentiary Ledger & Nyaya Seva Platform

> **Live Deployment:** [https://vericourt-xi.vercel.app/](https://vericourt-xi.vercel.app/)  
> **Repository:** [https://github.com/vegsandwich45/vericourt](https://github.com/vegsandwich45/vericourt)  
> **Compliance:** Indian Evidence Act Sec. 65B(4) / Bharatiya Sakshya Adhiniyam (BSA) 2023 Sec. 63 | Supreme Court FASTER Protocol | Article 39A Free Legal Aid

---

## 🏛️ Executive Summary

**VeriCourt** is an enterprise-grade decentralized legal infrastructure platform purpose-built for the Indian Judiciary. It bridges judicial administration, legal advocates, and citizens through a tamper-evident blockchain evidentiary layer, AI-driven anti-hallucination citation verification, and vernacular voice accessibility.

---

## 🎭 1. Role-Based Dashboards & Feature Breakdown

VeriCourt eliminates clutter by partitioning capabilities into **three distinct, access-controlled workspaces**:

```
                       ┌────────────────────────────┐
                       │   VeriCourt Unified Desk   │
                       │   (https://...vercel.app)  │
                       └──────────────┬─────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
      🏛️ Judge Chambers       ⚖️ Lawyer Desk          👤 Nyaya Seva (Citizen)
      • Seal On-Chain         • E-Filing & Stamping   • Voice Assistant (HI/MR)
      • Cause List Roster     • Brief Portfolio       • 4-Stage Docket Tracker
      • FASTER Bail Dispatch  • Sec. 65B Generator    • Plain-Language Explainer
      • Gazette Audit         • Citation Audit        • WhatsApp Case Bot
      • Hallucination Monitor • e-Apostille & Escrow  • Public Document Verify
```

---

### 🏛️ 1. Judge Chambers (`/judge`)
*Designed exclusively for Bench Officers & Registrars with Hardware DSC Token authorization.*

1. **Seal & Register Judgment On-Chain:**
   - Cryptographically hashes judicial decrees locally using client-side **SHA-256**.
   - Commits the immutable hash to the Ethereum EVM smart contract (`VeriCourt.sol`), signed with FIPS 140-2 Level 3 Hardware DSC credentials.
2. **Daily Cause List & Decree Pronouncement:**
   - Real-time hearing roster of the day’s docket items.
   - 1-click **Pronounce Decree** that automatically anchors the final order to the blockchain and updates the case stage.
3. **FASTER Electronic Bail Dispatch:**
   - Implements the Supreme Court of India's **FASTER** (Fast and Secured Transmission of Electronic Records) initiative.
   - Instantly transmits cryptographically signed release orders to prison superintendants, eliminating delays in release.
4. **Chambers Registry Search & Gazette Audit:**
   - Instant search across all indexed judicial orders, cross-referencing published sovereign gazettes to detect tampering.
5. **AI Precedent Anti-Hallucination Monitor:**
   - Scans advocate briefs for fictitious or hallucinated citations (e.g., *Mata v. Avianca* scenarios) against real High Court & Supreme Court law reporters.

---

### ⚖️ 2. Lawyer / Advocate Desk (`/lawyer`)
*Equipped for Bar Council enrolled advocates for case preparation, filing, and evidentiary compliance.*

1. **Secure E-Filing Desk:**
   - File petitions, affidavits, and rejoinders with automatic timestamping and SHA-256 fingerprinting.
2. **Active Brief Portfolio Tracking:**
   - Track case numbers, bench assignments, hearing dates, and opposing counsel details in real-time.
3. **Counsel Evidence Kit — Section 65B / Section 63 BSA Certificate Generator:**
   - Generates statutory certificates under **Section 65B(4) of the Indian Evidence Act** and **Section 63 of the Bharatiya Sakshya Adhiniyam 2023** to make electronic and digital records admissible in court.
   - Downloadable certificate `.txt` detailing the hash, device origin, and non-tamper verification.
4. **Pre-Hearing AI Citation Audit Desk:**
   - Pre-screens advocate drafts to ensure all cited case laws exist, preventing courtroom sanctions.
5. **Precedent Knowledge Graph:**
   - Interactive visual graph connecting constitutional benches, overruled precedents, and binding ratios.
6. **Hague e-Apostille & Commercial Escrow Desk:**
   - International decree validation under Section 44A CPC for cross-border execution and automated dispute escrow.
7. **Decentralized IPFS Storage Explorer:**
   - View content-addressed brief storage on the InterPlanetary File System (IPFS) via Pinata gateways.

---

### 👤 3. Citizen / Nyaya Seva Portal (`/citizen`)
*Public access kiosk empowering ordinary litigants and citizens under Article 39A (Free Legal Aid).*

1. **Voice Speech-to-Speech Assistant (Hindi / Marathi / English):**
   - Natural spoken queries for non-English speakers and semi-literate litigants.
   - Listen to case status updates and next hearing dates in regional languages.
2. **Docket & CNR Search:**
   - Search by case docket number (e.g., `WP(C)-2026-8941`) to view courtroom status and scheduled hearings.
3. **4-Stage Visual Progress Timeline:**
   - Clear visual roadmap of a case: **Filing → Registry Scrutiny → Bench Arguments → Final Pronouncement**.
4. **Plain-Language Case Verdict Explainer:**
   - AI translates convoluted legal jargon (*decree nisi, certiorari, ex parte*) into simple, 6th-grade level vernacular explanations.
5. **FASTER Bail Release Tracker:**
   - Litigants and families can track bail orders from judicial seal to prison delivery in real time.
6. **WhatsApp Nyaya Seva Bot Simulator:**
   - Simulates receiving real-time case alerts directly on mobile messaging apps.
7. **Bhashini AI Vernacular Engine:**
   - Multilingual neural machine translation supporting major Indian languages.
8. **Public Document Authenticity Verifier:**
   - Allows citizens, banks, or employers to verify any official judgment PDF by checking its SHA-256 hash against the Ethereum ledger.

---

## 🔄 2. End-to-End Pipeline Architecture

VeriCourt connects legal workflows into a unified, tamper-proof pipeline:

```
[Litigant / Citizen]
        │
        ▼ 1. Prepares evidence & approaches Advocate
[Advocate Desk]
        │ 2. Pre-screens citations with AI Anti-Hallucination Monitor
        │ 3. Generates Sec. 65B / 63 BSA Electronic Evidence Certificate
        │ 4. Submits E-Filing (Hash computed locally, document pinned to IPFS)
        ▼
[Judicial Bench / Chambers]
        │ 5. Appears on Judge's Daily Cause List
        │ 6. Arguments heard in courtroom
        │ 7. Judge pronounces decree
        │ 8. Sealed on Ethereum EVM Smart Contract with DSC Hardware Token
        │ 9. [If Bail] Instantly dispatched to Prison Superintendent via FASTER
        ▼
[Public Verification & Citizen Accessibility]
        │ 10. Immutable hash committed to blockchain ledger (Block #35+)
        │ 11. Citizen tracks status via Voice Assistant (Hindi/Marathi) or WhatsApp
        │ 12. Plain-language & vernacular summary generated via Bhashini
        │ 13. Public / third-parties verify PDF authenticity against on-chain hash
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js (App Router), React, Tailwind CSS |
| **Blockchain** | Ethereum EVM, Solidity, Hardhat, Ethers.js |
| **Decentralized Storage** | IPFS (InterPlanetary File System), Pinata Gateway |
| **Legal Compliance** | Indian Evidence Act Sec. 65B(4), BSA 2023 Sec. 63 |
| **AI & NLP** | Bhashini Indian Language API, Citation Anti-Hallucination Model |
| **Security** | SHA-256 local client hashing, FIPS 140-2 DSC hardware token simulation |
| **Hosting & CI/CD** | Vercel Global Edge Network, GitHub Actions |

---

## ⚡ Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/vegsandwich45/vericourt.git
cd vericourt

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
http://localhost:3000
```

---

## 📜 Sovereign Evidentiary Seal
*All judicial orders registered through VeriCourt conform to Section 65B(4) of the Indian Evidence Act, 1872 and Section 63 of Bharatiya Sakshya Adhiniyam, 2023 for admissibility in Indian Courts of Law.*
