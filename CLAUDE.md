# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

My2026 is a goal tracking and calendar management web application for setting yearly/monthly goals and tracking daily tasks. It's a vanilla JavaScript SPA with Firebase Realtime Database backend.

## Development

**No build tools required** - This is a pure HTML/CSS/JS application with no package manager or bundler.

**To run locally:**
- Open `index.html` directly in a browser
- Or use any local HTTP server (e.g., `python -m http.server`)

## Tech Stack

- Vanilla JavaScript (ES6 modules)
- Firebase Realtime Database (SDK loaded from CDN)
- Pure CSS3 with CSS custom properties

## Architecture

### File Structure
- `index.html` - Page structure and all modal dialogs
- `app.js` - All application logic (~2200 lines)
- `style.css` - Styling and responsive design

### Firebase Data Structure
```
users/{phoneNumber}/
├── yearlyGoals/         # Yearly goal items
├── {year}-{month}/
│   └── goals/           # Monthly goals
└── {year}-{month}-{day}/
    └── items/           # Daily tasks with completion status
```

### Key Modules in app.js

**Authentication** (lines 145-230): Phone-based login with whitelist stored in Firebase `loginWhitelist/`

**Calendar System** (lines 341-430): Monthly grid view, renders daily items with color coding and completion status

**Daily Items** (lines 564-760): CRUD operations for daily tasks, supports drag-drop reordering and "apply to month" feature

**Goal Management**:
- Yearly goals (lines 1223-1525)
- Monthly goals (lines 1529-1870)
- Both support completion tracking and progress calculation

**Statistics Dashboard** (lines 1988-2230): Grid and chart views showing completion rates across all months

### Color System
Items support 8 colors: blue, red, orange, yellow, cyan, purple, pink, gray (default: blue)

### Key Features
- Drag-drop reordering within and between days
- "Apply to month" - adds an item to all remaining days
- Real-time sync via Firebase `onValue` listeners
- Progress rate calculation per month
- Multi-user statistics view

## Code Conventions

- All Firebase operations are async functions
- DOM elements are cached in global variables at module top
- Date keys follow format: `{year}-{month}-{day}` (month is 0-indexed)
- Items have structure: `{ id, text, completed, color, order }`
