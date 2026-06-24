# Orbit CTO X

**The Autonomous Operating System For Software Companies**

Orbit CTO X is a next-generation command center that simulates how AI agents can manage, monitor, and orchestrate an entire software engineering organization. It combines real-time dashboards, predictive analytics, security wargaming, incident response simulation, and GitLab CI/CD integration into one immersive interface.

Built for the **GitLab Transcend Hackathon 2026** (Showcase Track) — an AI-native agent built on the GitLab Duo Agent Platform that leverages the GitLab Orbit context graph to provide intelligent orchestration across the software development lifecycle.

> **Devpost Submission:** [gitlab-transcend.devpost.com](https://gitlab-transcend.devpost.com/)

---

## 🚀 Features

| Module | Description |
|---|---|
| **Mission Control** | Real-time engineering health dashboard with active agent monitoring, incident radar, and business impact tracking. |
| **Digital Twin** | Interactive 3D codebase and deployment topology visualizer. Rotate, pan, and inspect service nodes. |
| **Parallel Universe Simulator** | Forecast the impact of critical decisions across multiple future branches (velocity, cost, incidents, revenue). |
| **AI Boardroom** | Virtual executive meetings with 6 AI agents (CEO, CTO, CISO, QA, DevOps, Product) debating key decisions. |
| **Doom Predictor** | Multi-vector release risk analysis with radar charts and confidence scoring. |
| **Security Arena** | Live red-team vs blue-team cyber wargame simulation. |
| **Incident Commander** | Automated incident response simulation with self-healing agent coordination. |
| **Time Machine** | Scrub through the project's historical development timeline. |
| **Self-Healing Pipeline** | Simulated CI/CD pipeline with autonomous failure detection and code patching. |
| **GitLab Integrator** | Real GitLab API integration for pipeline monitoring, triggering, and commit tracking. |

---

## 🧰 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Fonts:** Outfit + JetBrains Mono (via Next.js Font Optimization)
- **Testing:** [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd orbit-cto-x

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Video

<!-- TODO: Replace <your-video-id> with your actual YouTube video ID before submission -->
[▶️ Watch the demo on YouTube](https://youtu.be/mjrQOzDj9Yc) — under 3 minutes showing the full command center in action.

### GitLab Integration (Optional)

1. Create a GitLab Personal Access Token at `https://gitlab.com/-/user_settings/personal_access_tokens`
2. Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```
3. Enter your Project ID and token in the GitLab Connector panel

> **No credentials?** The app runs in **Demo Mode** with mock data so you can explore all features immediately.

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

---

## 🏗️ Build

```bash
npm run build
```

The production build outputs to the `.next` directory. You can run it with:

```bash
npm start
```

---

## 🏛️ Architecture

```
src/
├── app/
│   ├── api/gitlab/       # GitLab API proxy routes
│   ├── globals.css       # Global styles + custom CSS
│   ├── layout.tsx        # Root layout with fonts + metadata
│   └── page.tsx          # Main app (landing + dashboard views)
├── components/
│   ├── ActivityStream.tsx       # Real-time agent activity feed
│   ├── BoardroomModule.tsx      # AI executive debate simulator
│   ├── DashboardModule.tsx      # Mission control dashboard
│   ├── DigitalTwinModule.tsx    # 3D topology visualization
│   ├── GitLabConnector.tsx      # GitLab CI/CD integration
│   ├── HackerArenaModule.tsx    # Security wargame
│   ├── IncidentCommander.tsx    # Incident response simulation
│   ├── ParallelSimulator.tsx    # What-if scenario engine
│   ├── ParticleSpace.tsx        # Dynamic particle background
│   ├── ReleasePredictor.tsx     # Risk analysis engine
│   ├── SelfHealingPipeline.tsx  # Automated CI/CD healing
│   ├── TimeMachine.tsx          # Historical timeline scrubber
│   └── VoiceCTOOrb.tsx          # Voice command interface
└── test/                        # Unit tests
```

---

## 🌟 Key Highlights

- **Real-time 3D visualization** with custom canvas rendering and orbital controls
- **Speech recognition** for hands-free command center navigation
- **Text-to-speech** AI assistant (Voice CTO Jarvis)
- **Mock GitLab API** with full fallback mode — works offline out of the box
- **Responsive design** with glassmorphism UI and ambient particle effects
- **Zero external AI dependencies** — all AI agent conversations and simulations are deterministic and self-contained

---

## 📄 License

This project is submitted for the **GitLab Transcend Hackathon 2026** (Showcase Track).

Licensed under the [MIT License](LICENSE) — see the [LICENSE](LICENSE) file for details.
