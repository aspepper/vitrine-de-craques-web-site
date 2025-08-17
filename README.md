# Vitrine de Craques

Welcome to Vitrine de Craques, a platform designed to connect young soccer talents with agents, scouts, and clubs.

## Getting Started

Follow these steps to get the development environment running.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Prisma and Database

This project uses Prisma with a SQLite database for demonstration purposes.

First, create the database schema:

```bash
npx prisma migrate dev --name init
```

This will create a `dev.db` file in the `prisma` directory.

### 3. Seed the Database

Populate the database with initial dummy data:

```bash
npx prisma db seed
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with CSS Variables
- **UI Components:** shadcn/ui, Radix UI
- **Authentication:** NextAuth.js
- **State Management:** React Server Components + TanStack Query
- **Database ORM:** Prisma
- **Database:** SQLite (for demo)
- **Video Processing:** ffmpeg.wasm
- **File Uploads:** react-dropzone
- **Testing:** Vitest, React Testing Library, Playwright

## Component Examples

Here's how to use some of the main components:

### AlbumCard

Used for displaying athletes, fans, agents, and clubs in a grid.

```tsx
import AlbumCard from "@/components/AlbumCard";

<AlbumCard
  href="/athletes/joao-silva"
  imageUrl="https://placehold.co/400x500"
  name="João Silva"
  details={["Atacante", "São Paulo, SP"]}
/>
```

### Button

Styled buttons from `shadcn/ui`.

```tsx
import { Button } from "@/components/ui/button";

<Button>Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
```

### YouTubePlayer

An embed component for YouTube videos that shows a thumbnail and loads the iframe on click.

```tsx
import YouTubePlayer from "@/components/YouTubePlayer";

<YouTubePlayer videoId="gXWXKjR-qII" />
```

## Limits and Next Steps

This project is a functional prototype. Here are some areas for future development:

-   **Real Club Data**: The `scripts/seed-clubs.ts` script is a placeholder. To populate it with real data, you could use a public API or scrape data from a reliable source like Wikipedia. Ensure you respect the data source's terms of service.
-   **Media Placeholders**: All images, logos, and stadium photos are placeholders from `placehold.co`. These should be replaced with a proper media storage solution (like AWS S3, Cloudinary, etc.). For official logos (clubs, confederations), you may need to source them from repositories with appropriate licenses, such as Wikimedia Commons, and respect trademark usage guidelines.
-   **Copyright Analysis**: The "Analyze copyright" feature is a stub. A real implementation would require integrating with a service like YouTube's Content ID API or another audio/video fingerprinting service to check for copyrighted music or footage. This is a complex and potentially expensive feature.
-   **Password Hashing**: For security, user passwords should be hashed using a library like `bcrypt` before being stored. The current demo uses plaintext for simplicity and should **never** be used in production.
-   **Full API Implementation**: Many API routes and frontend components are placeholders (e.g., messaging, notifications, detailed metrics). These need to be fully implemented.
