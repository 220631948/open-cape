# Cape Town Urban Property Intelligence

Enterprise-grade spatial analysis and property intelligence platform for the City of Cape Town and Western Cape region. This application provides users with powerful tools to monitor property trends, perform spatial analysis, and get AI-driven insights into the urban landscape.

## 🚀 Purpose

The Cape Town Urban Property Intelligence platform is designed for property professionals, urban planners, and residents who need to understand the complex property market and spatial dynamics of Cape Town. By integrating real-time data from various sources (City of Cape Town open data, ArcGIS services, and proprietary datasets), the platform offers a "single source of truth" for urban intelligence.

## ✨ Key Features

- **Advanced Property Search**: Fast, relevant search using Algolia, integrated with ERF (parcel) numbering and address lookup.
- **Interactive Maps**: High-performance 2D and 3D mapping using MapLibre GL and React Map GL, featuring custom vector layers for zoning, transport, and infrastructure.
- **Watchlist & Alerts**: Define custom property search criteria (price, location, attributes) and receive notifications when matching properties are updated or added.
- **GeoHub Radius Analysis**: Perform spatial queries to analyze infrastructure (water, electricity, transport) and citizen reports within a defined radius of any property.
- **AI Insights**: Integrated with Google Gemini to provide natural language summaries of market trends, property comparisons, and zoning implications.
- **Tenancy Management**: Enterprise-ready multi-tenant architecture with role-based access control (RBAC).

## 🛠️ Technical Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Motion (animations)
- **Backend / DB**: Firebase (Auth, Firestore, Cloud Functions, Storage)
- **Search**: Algolia v5
- **GIS / Mapping**: MapLibre GL, react-map-gl, Turf.js, GeoJSON-vt
- **AI**: Gemini Pro (@google/generative-ai)

## 📦 Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Firebase Project

### Installation Steps
1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configuration**
   - Copy `.env.example` to `.env` and fill in your API keys (Firebase, Algolia, Gemini).
   - Ensure `firebase-applet-config.json` is correctly populated with your Firebase project details.
4. **Run Development Server**
   ```bash
   npm run dev
   ```
5. **Build for Production**
   ```bash
   npm run build
   ```

## ⚙️ Configuration

The application relies on several key configuration files:
- `firebase-applet-config.json`: Core Firebase configuration.
- `firebase-blueprint.json`: IR for Firestore data structure and security rules generation.
- `metadata.json`: Application metadata and permissions.

## 🤝 Contribution Guidance

1. **Branching**: Use descriptive feature branches (e.g., `feature/map-radius-tool`).
2. **Linting**: Run `npm run lint` before submitting changes.
3. **Type Safety**: Ensure strict TypeScript compliance. No `any` types should be introduced.
4. **Styling**: Use utility-first Tailwind classes. Avoid custom CSS files.

---
Built with ❤️ for the City of Cape Town.
