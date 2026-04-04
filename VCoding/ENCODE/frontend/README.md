# ENCODE LMS – Frontend

React + Vite + React Router. ENCODE design system (lavender, pink, cream, mint, dark purple).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Flow

- **Home** – Hero, learning paths, features. “Start Learning” / “Explore Courses” → Academy (requires login).
- **Login / Sign up** – Mock auth (no backend). After submit you’re redirected to Academy.
- **Academy** – Course list (Coding & Quran). Course cards: thumbnail, instructor, description, Enroll.
- **Course detail** (`/courses/:id`) – Description, what you’ll learn, lesson count, duration, “Enroll & start”.
- **Course learn** (`/courses/:id/learn`) – Sidebar (sections/lessons), YouTube embed, progress bar, notes, Prev/Next.

Data is mock; backend connection can be added later via `VITE_API_URL`.
