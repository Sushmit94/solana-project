# 🛡️ ZK Email Guardian

**Zero-Knowledge Email Threat Detection with Blockchain Verification**

A decentralized email security system that analyzes emails for phishing, spam, and malware threats, then submits cryptographic proofs to the Solana blockchain for transparent, tamper-proof reputation tracking.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solana](https://img.shields.io/badge/Solana-Devnet-purple.svg)
![React](https://img.shields.io/badge/React-18.x-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Smart Contract](#smart-contract)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

ZK Email Guardian is a privacy-preserving email security platform that combines:

- **📧 Mailchain Integration**: Decentralized email infrastructure
- **🔍 AI-Powered Threat Detection**: Real-time analysis of email content
- **🔐 Zero-Knowledge Proofs**: Privacy-preserving verification without revealing email content
- **⛓️ Blockchain Verification**: Immutable proof storage on Solana
- **📊 Sender Reputation System**: Trust scores based on historical behavior

### Why ZK Email Guardian?

Traditional email security systems:
- ❌ Require trusting centralized providers with your data
- ❌ Lack transparency in threat detection
- ❌ Have no verifiable reputation system
- ❌ Can't prove detection accuracy

**ZK Email Guardian solves these problems** by:
- ✅ Keeping emails private with zero-knowledge proofs
- ✅ Storing threat detection on an immutable blockchain
- ✅ Building transparent sender reputation scores
- ✅ Enabling community-driven threat intelligence

---

## ✨ Features

### Core Features
- 🔐 **Zero-Knowledge Proofs**: Detect threats without revealing email content
- 🌐 **Decentralized Email**: Integration with Mailchain for Web3 email
- 🧠 **Threat Detection Engine**: Analyzes emails for:
  - Phishing attempts
  - Spam content
  - Malware indicators
  - Social engineering attacks
- ⛓️ **Blockchain Verification**: Submit proofs to Solana for transparency
- 📊 **Sender Reputation**: Track trust scores based on historical proofs
- 📱 **Modern Dashboard**: React-based UI with real-time analysis

### Security Features
- 🔒 Client-side email analysis (no server access to content)
- 🎯 Keyword-based threat detection
- 🔗 Suspicious URL scanning
- 📎 Attachment risk assessment
- ⚡ Real-time threat scoring

### User Features
- 📬 Inbox view with threat badges
- 📈 Threat analytics dashboard
- 🔍 Detailed threat analysis per email
- 💼 Wallet integration (Phantom)
- 🌐 Multi-account support

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
│                    (Phantom Wallet)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   REACT DASHBOARD                            │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Inbox Page  │  │ Analysis Page│  │ Reputation   │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└───────┬──────────────────┬──────────────────┬───────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Mailchain   │  │   Analyzer   │  │  Reputation  │
│   Service    │  │   Engine     │  │    Engine    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                  │                  │
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────────────────────────────────────────┐
│              Solana Blockchain                    │
│  ┌─────────────────────────────────────────┐    │
│  │  ZK Email Guardian Program (Rust)       │    │
│  │  - Store Proofs                          │    │
│  │  - Track Reputation                      │    │
│  └─────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Blockchain Layer
- **Solana**: High-performance blockchain for proof storage
- **Anchor Framework**: Rust framework for Solana programs
- **Solana Web3.js**: JavaScript SDK for blockchain interaction

### Frontend
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first styling
- **React Router**: Client-side routing

### Email & Analysis
- **Mailchain SDK**: Decentralized email protocol
- **Custom Threat Detector**: Keyword and pattern matching
- **Crypto (Node.js)**: SHA-256 hashing for proofs

### Development Tools
- **Anchor CLI**: Solana program development
- **Node.js**: JavaScript runtime
- **npm/yarn**: Package management

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** v18+ and npm/yarn
- **Rust** v1.70+ (for Solana program)
- **Solana CLI** v1.17+
- **Anchor CLI** v0.29+
- **Phantom Wallet** browser extension
- **Solana Devnet SOL** (free from faucet)

### Installation Guides

<details>
<summary><b>Install Node.js</b></summary>

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```
</details>

<details>
<summary><b>Install Rust</b></summary>

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```
</details>

<details>
<summary><b>Install Solana CLI</b></summary>

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana --version
```
</details>

<details>
<summary><b>Install Anchor</b></summary>

```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli
anchor --version
```
</details>

<details>
<summary><b>Install Phantom Wallet</b></summary>

1. Visit https://phantom.app/
2. Install browser extension
3. Create or import wallet
4. Switch to **Devnet** in settings
</details>

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/zk-email-guardian.git
cd zk-email-guardian
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install program dependencies
cd program
cargo build

# Install dashboard dependencies
cd ../dashboard
npm install

# Install service dependencies
cd ../mailchain-service
npm install

cd ../analyzer
npm install

cd ../reputation-engine
npm install
```

### 3. Build the Project

```bash
# Build Solana program
anchor build

# Build TypeScript packages
npm run build:all
```

---

## ⚙️ Configuration

### 1. Solana Configuration

```bash
# Generate a new keypair (or use existing)
solana-keygen new --outfile ~/.config/solana/id.json

# Configure Solana CLI for devnet
solana config set --url https://api.devnet.solana.com

# Airdrop SOL for testing
solana airdrop 2
```

### 2. Environment Variables

Create `.env` files in each service:

#### `dashboard/.env`
```bash
REACT_APP_MAILCHAIN_SECRET="your mailchain secret recovery phrase"
REACT_APP_SOLANA_RPC_URL="https://api.devnet.solana.com"
REACT_APP_PROGRAM_ID="your_deployed_program_id"
```

#### `mailchain-service/.env`
```bash
MAILCHAIN_SECRET="your mailchain secret recovery phrase"
```

### 3. Get Mailchain Credentials

1. Visit https://mailchain.com/
2. Create an account
3. Generate a secret recovery phrase
4. Add to `.env` files

### 4. Deploy Solana Program

```bash
# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Copy the Program ID
# Update REACT_APP_PROGRAM_ID in dashboard/.env
```

---

## 🎮 Usage

### Start the Development Environment

```bash
# Terminal 1: Start the dashboard
cd dashboard
npm start

# Terminal 2: Start the analyzer service (if separate)
cd analyzer
npm run dev
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

### Connect Your Wallet

1. Click "Connect Wallet" in the top-right
2. Approve connection in Phantom
3. Ensure you're on **Solana Devnet**
4. Get devnet SOL if needed: https://faucet.solana.com/

### Use the Application

#### **📬 Inbox Page** (`/`)
- View your Mailchain emails
- See threat badges on suspicious emails
- Filter by: All, Safe, Threats
- Click any email to view details

#### **📊 Analysis Page** (`/analysis`)
- View threat statistics
- See breakdown by threat level (Critical, High, Medium, Low)
- See breakdown by threat type (Phishing, Spam, Malware, Social Engineering)
- Submit proofs to blockchain
- Track submission status

#### **👤 Reputation Page** (`/reputation`)
- View sender trust scores
- See historical proof submissions
- Track sender behavior over time

---

## 📂 Project Structure

```
zk-email-guardian/
│
├── program/                          # Solana smart contract
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs                    # Rust program logic
│
├── client/                           # Blockchain interaction
│   └── src/
│       └── index.ts                  # Solana client code
│
├── mailchain-service/                # Email service
│   └── src/
│       ├── mailchain-client.ts       # Fetch emails from Mailchain
│       ├── email-parser.ts           # Parse email content
│       └── types.ts                  # Email interfaces
│
├── analyzer/                         # Threat detection
│   └── src/
│       ├── detector.ts               # Threat detection engine
│       ├── keywords.json             # Threat keywords database
│       ├── scoring.ts                # Calculate threat scores
│       └── proof-generator.ts        # Generate ZK proofs
│
├── reputation-engine/                # Sender reputation
│   └── src/
│       ├── calculator.ts             # Calculate trust scores
│       ├── query-blockchain.ts       # Fetch sender history
│       └── types.ts                  # Reputation interfaces
│
├── dashboard/                        # React UI
│   ├── public/
│   └── src/
│       ├── App.tsx                   # Main app component
│       ├── pages/
│       │   ├── InboxPage.tsx         # Email inbox view
│       │   ├── AnalysisPage.tsx      # Threat analytics
│       │   └── ReputationPage.tsx    # Sender scores
│       ├── components/
│       │   ├── EmailList.tsx         # Email list component
│       │   ├── ThreatBadge.tsx       # Threat indicator
│       │   ├── SenderCard.tsx        # Sender display
│       │   └── WalletConnect.tsx     # Wallet button
│       └── hooks/
│           ├── useMailchain.ts       # Mailchain integration
│           ├── useAnalyzer.ts        # Threat analysis
│           ├── useSolana.ts          # Blockchain interaction
│           └── useReputation.ts      # Reputation queries
│
├── Anchor.toml                       # Anchor configuration
├── package.json                      # Root package config
└── README.md                         # This file
```

---

## 🔍 How It Works

### 1. Email Fetching
```typescript
// User opens dashboard
→ Mailchain SDK fetches inbox
→ Emails displayed in UI
```

### 2. Threat Analysis
```typescript
// For each email:
→ Extract content, subject, sender
→ Scan for threat keywords
→ Analyze URLs and attachments
→ Calculate threat score
→ Assign threat level (Safe/Low/Medium/High/Critical)
```

### 3. Proof Generation
```typescript
// If email is malicious:
→ Hash email content (SHA-256)
→ Generate proof data (256 bytes)
→ Include threat metadata
→ Create ZKProof object
```

### 4. Blockchain Submission
```typescript
// Submit to Solana:
→ Connect Phantom wallet
→ Find PDA for user's proof record
→ Serialize proof with Borsh
→ Add Anchor discriminator
→ Create transaction
→ Sign and submit
→ Wait for confirmation
```

### 5. Reputation Tracking
```typescript
// Calculate sender reputation:
→ Query all proofs from sender
→ Count threat reports
→ Weight by threat severity
→ Calculate trust score (0-100)
```

---

## 🔐 Smart Contract

### Program Details

**Program ID**: `G9DrkqHZj8LwKdTMtCwP9tdLBLf8ZegkwDWUA47wvZzQ`

**Network**: Solana Devnet

### Instructions

#### `submit_proof`
Submit a zero-knowledge proof of email threat detection.

**Parameters**:
- `proof: Vec<u8>` - Proof data (256 bytes)
- `event_type: u8` - Threat type (0=Phishing, 1=Spam, 2=Malware, 3=Social Engineering)

**Accounts**:
- `record`: PDA account storing proof (writable)
- `user`: Signer submitting proof (writable, signer)
- `system_program`: System program for account creation

**Storage**:
```rust
pub struct ProofRecord {
    pub proof: Vec<u8>,      // Proof bytes
    pub event_type: u8,       // Threat category
    pub timestamp: i64,       // Unix timestamp
}
```

### Querying Proofs

```typescript
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const programId = new PublicKey('G9DrkqHZj8LwKdTMtCwP9tdLBLf8ZegkwDWUA47wvZzQ');

// Find PDA for a user
const [proofPDA] = await PublicKey.findProgramAddress(
  [Buffer.from('proof'), userPublicKey.toBuffer()],
  programId
);

// Fetch proof record
const accountInfo = await connection.getAccountInfo(proofPDA);
```

---

## 👨‍💻 Development

### Run in Development Mode

```bash
# Watch mode for TypeScript
npm run dev

# Start dashboard with hot reload
cd dashboard && npm start
```

### Build for Production

```bash
# Build all services
npm run build:all

# Build dashboard
cd dashboard && npm run build
```

### Run Tests

```bash
# Run Anchor tests
anchor test

# Run TypeScript tests
npm test
```

---

## 🧪 Testing

### Test with Mock Data

The Mailchain service provides mock emails if the API is unavailable:

```typescript
// Mock emails include:
// 1. Welcome email (safe)
// 2. Phishing attempt (malicious)
// 3. Newsletter (safe)
```

### Test Blockchain Submission

1. Ensure you have devnet SOL (at least 0.01 SOL)
2. Open `/analysis` page
3. Click "Submit Proofs to Blockchain"
4. Check console for transaction signature
5. View on Solana Explorer: https://explorer.solana.com/

### Manual Testing Checklist

- [ ] Wallet connects successfully
- [ ] Emails load from Mailchain
- [ ] Threat detection analyzes emails
- [ ] Threat badges display correctly
- [ ] Analysis page shows statistics
- [ ] Proof submission succeeds
- [ ] Transaction confirms on blockchain
- [ ] Explorer shows transaction details

---

## 🚢 Deployment

### Deploy Solana Program

```bash
# Build optimized program
anchor build --verifiable

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet (when ready)
anchor deploy --provider.cluster mainnet
```

### Deploy Dashboard

#### Vercel
```bash
cd dashboard
vercel deploy --prod
```

#### Netlify
```bash
cd dashboard
npm run build
netlify deploy --prod --dir=build
```

#### IPFS (Decentralized)
```bash
cd dashboard
npm run build
ipfs add -r build/
```

---

## 🐛 Troubleshooting

### Common Issues

<details>
<summary><b>Wallet Connection Failed</b></summary>

**Problem**: Can't connect Phantom wallet

**Solutions**:
- Install Phantom extension
- Refresh the page
- Check if wallet is unlocked
- Switch to Devnet in Phantom settings
</details>

<details>
<summary><b>Transaction Failed: Insufficient Funds</b></summary>

**Problem**: Not enough SOL for transaction

**Solutions**:
```bash
# Get devnet SOL
solana airdrop 2

# Or visit faucet
https://faucet.solana.com/
```
</details>

<details>
<summary><b>Error: Program Not Deployed</b></summary>

**Problem**: Program ID doesn't exist

**Solutions**:
```bash
# Redeploy program
anchor deploy --provider.cluster devnet

# Update .env with new Program ID
```
</details>

<details>
<summary><b>Mailchain Connection Error</b></summary>

**Problem**: Can't fetch emails

**Solutions**:
- Check `REACT_APP_MAILCHAIN_SECRET` in `.env`
- Verify secret recovery phrase is correct
- Check internet connection
- App will show mock data if Mailchain fails
</details>

<details>
<summary><b>Transaction Simulation Failed</b></summary>

**Problem**: Error code 0x65 (deserialization)

**Solutions**:
- Ensure `js-sha256` is installed
- Check proof data format
- Verify Borsh serialization
- Redeploy program if structure changed
</details>

### Enable Debug Logging

Add to `dashboard/src/hooks/useSolana.ts`:

```typescript
// Add detailed logging
console.log('🔍 Proof bytes:', Array.from(proofBytes));
console.log('🔍 Event type:', eventTypeByte);
console.log('🔍 Discriminator:', discriminator.toString('hex'));
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and well-described

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 ZK Email Guardian

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🔗 Links

- **Solana Explorer**: https://explorer.solana.com/
- **Mailchain**: https://mailchain.com/
- **Phantom Wallet**: https://phantom.app/
- **Solana Docs**: https://docs.solana.com/

---




---

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] Basic threat detection
- [x] Mailchain integration
- [x] Solana proof storage
- [x] React dashboard

### Phase 2: Enhanced Security 🚧
- [ ] Integration with Triton VM for real ZK proofs
- [ ] Advanced ML-based threat detection
- [ ] Multi-signature proof verification
- [ ] Encrypted proof storage

### Phase 3: Community Features 🔮
- [ ] Community-driven threat database
- [ ] Sender reputation marketplace
- [ ] Threat intelligence sharing
- [ ] DAO governance

### Phase 4: Enterprise 🔮
- [ ] Custom threat rules
- [ ] Bulk email analysis
- [ ] API for third-party integration
- [ ] White-label solution

---

<div align="center">

**Built with ❤️ using Solana, React, and Mailchain**

⭐ **Star us on GitHub** — it helps!

[Report Bug](https://github.com/Sushmit94/zk-email-guardian/issues) · [Request Feature](https://github.com/Sushmit94/zk-email-guardian/issues)

</div>
