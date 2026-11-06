# Smart Campus Room Booking System (Assignment #04)

Frontend-only single-page application built for managing and checking room availability across a campus room catalog. Developed as part of Assignment #04 at KBTU.

## Tech Stack
- React / TypeScript / Vite / Tailwind CSS
- Vitest (for automated testing)
- Bolt.new

## Project Structure
- `src/data/room.ts` — Room catalog mock data and initial schedules.
- `src/utils/booking.ts` — Pure validation rules (AC1–AC6) and time utilities.
- `src/utils/roomFilters.ts` — Pure filtering functions (F1–F5).
- `src/utils/*.test.ts` — Automated unit test suite (Vitest).

## Setup & Running Instructions

1. **Install dependencies:**
   `npm install`

2. **Run the development server:**
   `npm run dev`

3. **Run the automated test suite:**
   `npm test`
