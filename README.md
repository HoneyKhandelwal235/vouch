# Vouch - Premium Finance Studio

A beautiful, modern expense tracking application built with Next.js, Supabase, and Tailwind CSS.

## Features

- 📊 Track expenses with categories
- 💾 Persistent storage with Supabase
- 🎨 Beautiful glassmorphism UI
- 📱 Responsive design
- ⚡ Real-time updates

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials to .env

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=your-database-url
NEXTAUTH_SECRET=your-secret
```

## Database Setup

Run this SQL in Supabase SQL Editor:

```sql
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/vouch)

1. Push code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Supabase
- Framer Motion

## License

MIT
