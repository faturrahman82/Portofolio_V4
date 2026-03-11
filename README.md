<div align="center">

# 🚀 Portfolio V4

### _Modern Developer Portfolio — Built with Next.js, TypeScript & AI-Driven Workflow_

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-ff69b4?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br />

> _A sleek, performant, and fully internationalized personal portfolio showcasing my projects, skills, and journey as a developer who embraces AI-driven development._

<br />

[🌐 Live Demo](https://yourportfolio.vercel.app) · [🐛 Report Bug](https://github.com/faturrahman82/PortofolioV4/issues) · [✨ Request Feature](https://github.com/faturrahman82/PortofolioV4/issues)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎨 **Premium Dark UI** | Glassmorphism design with smooth gradients, glow effects, and micro-animations |
| 🌍 **Internationalization** | Full English & Bahasa Indonesia support via `next-intl` |
| 📊 **Live GitHub Stats** | Real-time repository count, stars, followers, top languages & contribution calendar |
| ⚡ **Blazing Fast** | Optimized with Next.js App Router, dynamic imports, and edge-ready architecture |
| 📱 **Fully Responsive** | Pixel-perfect on mobile, tablet, and desktop |
| 🧩 **Atomic Design** | Components organized into atoms, molecules, and organisms for clean architecture |
| 🎭 **Rich Animations** | Scroll-triggered animations, typewriter effects, and interactive hover states |
| 🔍 **SEO Optimized** | Meta tags, Open Graph, JSON-LD structured data, and semantic HTML |
| ♿ **Accessible** | ARIA labels, keyboard navigation, skip-nav links, and focus indicators |

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **i18n** | next-intl |
| **State** | Zustand |
| **Data Fetching** | SWR |
| **Icons** | React Icons (Feather + Simple Icons) |
| **Deployment** | Vercel |

</div>

---

## 📁 Project Structure

```
src/
├── app/
│   └── [locale]/           # Locale-based routing
│       ├── page.tsx         # Home page
│       ├── about/           # About page
│       ├── projects/        # Projects page
│       └── contact/         # Contact page
├── components/
│   ├── layout/              # Navbar, Footer
│   ├── sections/            # Hero, About, Skills, GitHub Stats
│   └── ui/
│       ├── atoms/           # SectionLabel, GradientDivider
│       ├── molecules/       # QuickInfoCard, FaqItem, AvailabilityBanner
│       └── organisms/       # ContactHeroVisual
├── hooks/                   # Custom React hooks
├── i18n/                    # Internationalization config
├── lib/                     # Utility functions & API helpers
├── store/                   # Zustand state management
├── styles/                  # Global CSS
└── types/                   # TypeScript type definitions
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **GitHub Personal Access Token** ([Create one here](https://github.com/settings/tokens))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/faturrahman82/PortofolioV4.git
cd PortofolioV4

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Then edit .env.local with your actual values

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_GITHUB_USERNAME` | ✅ | Your GitHub username |
| `GITHUB_TOKEN` | ✅ | GitHub PAT for API access |
| `NEXT_PUBLIC_SITE_URL` | ⬚ | Your deployed site URL |
| `NEXT_PUBLIC_AUTHOR_NAME` | ⬚ | Your display name |
| `NEXT_PUBLIC_CONTACT_EMAIL` | ⬚ | Your contact email |
| `NEXT_PUBLIC_GITHUB_URL` | ⬚ | GitHub profile link |
| `NEXT_PUBLIC_LINKEDIN_URL` | ⬚ | LinkedIn profile link |
| `NEXT_PUBLIC_INSTAGRAM_URL` | ⬚ | Instagram profile link |

> See `.env.example` for the full template.

---

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Start production server locally
npm run start
```

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/faturrahman82/PortofolioV4)

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard
4. Deploy! 🎉

---

## 🌍 Internationalization

This portfolio supports **English** and **Bahasa Indonesia**. Translation files are located in:

```
public/locales/
├── en/common.json    # English translations
└── id/common.json    # Indonesian translations
```

Switch languages using the globe icon in the navbar.

---

## 🧑‍💻 About Me

I'm **Maulvi**, a developer who loves building applications with elegant code and AI-driven workflows. I embrace the era of **vibe coding** — leveraging AI agents and LLMs to accelerate development while focusing on high-level problem solving and rapid prototyping.

- 🎓 **Studying** Informatics Engineering at UIN Maulana Malik Ibrahim Malang
- 💼 **Working** as a Junior Developer & Freelancer
- 🤖 **Passionate** about AI, LLMs, and automated coding
- 🌐 **Building** full-stack web applications with modern technologies

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ and ☕ by [Maulvi](https://github.com/faturrahman82)**

_If you found this helpful, consider giving it a ⭐!_

</div>
