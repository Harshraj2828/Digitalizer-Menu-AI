# DIGIDISH — AI Menu Digitizer (Web & Mobile)

DIGIDISH is a production-ready AI SaaS that turns physical paper menus into structured, Zomato-style digital menus. It consists of a responsive Next.js 15 web application, an Expo mobile application, a shared API client library, and an automated visual OCR AI parsing engine.

---

## Features

1. **AI Visual Extraction:** Uses OpenAI GPT Vision models to convert food menu images/PDFs into structured JSON matching Zod validation contracts.
2. **Robust Fallbacks:** Integrates local `Tesseract.js` OCR and text heuristics parsing so that the digitization engine remains operational out-of-the-box even without a configured OpenAI API Key.
3. **Zomato-Style Viewer:** Features horizontal sticky categories, search fuzzy filters, vegetarian/non-vegetarian badging, and availability stock toggles.
4. **Interactive Editor:** Drag-and-drop handles for sections and items, inline edits, addition/removal of entries, and debounced auto-saving.
5. **Expo Mobile App:** Uses native camera views and image selectors to snap menus, uploading them straight to the Next.js API.
6. **Dual Database Access:** Employs Prisma PostgreSQL with automatic fallback to a local JSON-based mock database file if DB connection is refused.

---

## Directory Structure

```text
/AI Digitalizer
├── packages/
│   └── api-client/          # Shared API client and TS Zod types
├── web/                     # Next.js 15 Web App (App Router, Zustand, Prisma, Supabase)
├── mobile/                  # React Native Expo Mobile App (Camera, Image Picker)
├── README.md                # This setup guide
└── .env.example             # Environment variable template
```

---

## Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Configure Environment Variables
Copy `.env.example` in the root workspace to `web/.env`:
```bash
cp .env.example web/.env
```
Open `web/.env` and update credentials (e.g. `DATABASE_URL` and `OPENAI_API_KEY`). If left empty, the application will automatically enter **Mock/Fallback Mode** (storing data in `web/src/lib/mock-db.json` and using `Tesseract.js` + heuristics), ensuring a fully functional demo without external service requirements.

---

### 2. Next.js Web Application

Navigate into the `web` folder:
```bash
cd web
```

#### Run Database Migrations (PostgreSQL)
If database variables are configured:
```bash
npx prisma migrate dev --name init
node prisma/seed.js
```

#### Run Development Server
```bash
npm run dev
```
The web application is now active at `http://localhost:3000`.

---

### 3. Expo Mobile Application

Navigate into the `mobile` folder:
```bash
cd mobile
```

#### Start Expo bundler
```bash
npm run start
```

Press **`w`** to run in a browser emulator, or install the **Expo Go** app on your physical iOS/Android phone and scan the QR code displayed in the terminal to run it natively.

> [!TIP]
> **Connecting Mobile to Localhost:** 
> Tap **"Config Server"** on the mobile home screen and set your computer's local Wi-Fi IP address (e.g., `http://192.168.1.100:3000`) so the app can communicate with the Next.js backend server.

---

## AI Extraction Contract

The AI extraction structures food items using this validated contract:

```json
{
  "menuTitle": "Restaurant Menu Name",
  "currency": "INR",
  "sections": [
    {
      "name": "Starters",
      "items": [
        {
          "name": "Paneer Tikka",
          "description": "Char-grilled cottage cheese with spices",
          "price": 249,
          "isVeg": true
        }
      ]
    }
  ]
}
```
If the OpenAI validation fails, our pipeline catches the error and retries the Visual Vision call once with the formatting error appended.
