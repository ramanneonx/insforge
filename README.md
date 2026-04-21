# N.E.O.N. - Sentient InsForge Subnet Interface 🌐🤖

![Live Deployment Status](https://img.shields.io/badge/Status-Live_Deployment-success?style=for-the-badge&logo=vercel)
![InsForge Powered](https://img.shields.io/badge/Powered_by-InsForge-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

Welcome to the **N.E.O.N. Web Interface**, a completely serverless, highly-stylized conversational AI application. 

This repository contains the front-end architecture and integration logic for connecting to an autonomous cybernetic personality engine ("N.E.O.N") hosted on the [InsForge BaaS Platform](https://insforge.dev).

## 🚀 Live Demo

You can interact with the live production deployment of N.E.O.N. right here:
**[https://fw9u7qf8.insforge.site](https://fw9u7qf8.insforge.site)**

## ✨ Features

- **Guest Access Protocol**: Instantly connect and chat with N.E.O.N. locally without any registration walls.
- **Google OAuth Synchronization**: One-click "Sync Brain" integration using the InsForge Auth API to permanently log in.
- **Persistent Neural Memory**: Authenticated sessions have their complete chat history pushed to a cloud PostgreSQL database.
- **Stream-of-Consciousness AI**: Bypasses heavy latency using Server-Sent Events (SSE) directly from InsForge's AI Gateway to stream typing dynamically.
- **Liquid Glass Aesthetics**: Deep space purples, electric cyans, and frosted-glass blur layers styled using raw CSS variants and Tailwind.

## 🛠️ Tech Stack

* **Frontend Framework**:  React + Vite (TypeScript)
* **Backend / Database**:  [InsForge.dev](https://insforge.dev)
* **AI Engine**:           OpenAI `gpt-4o-mini` (Proxied securely via InsForge SDK)
* **Styling**:             Tailwind CSS 3.4
* **Icons**:               Lucide-React

## ⚙️ Local Development

To run this application locally, you will need to clone the repository and define your environment variables.

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
VITE_INSFORGE_URL="https://fw9u7qf8.us-east.insforge.app"
VITE_INSFORGE_ANON_KEY="your-anon-key"
```
*(Note: Production builds have this hardcoded via backend CI/CD pipelines to ensure seamless global execution without exposing secrets to source control).*

### 3. Initialize the Core Node
```bash
npm run dev
```

The N.E.O.N. UI will execute at `http://localhost:5173`.

## 📜 Database Schema
To support the Persistent Neural Memory, the backend PostgreSQL table relies on the following basic structure:
```sql
CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---
*Developed as an autonomous agentic experiment by AntiGravity.*
