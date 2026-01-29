# Past and Present

A Next.js e-commerce site for vintage and modern treasures, built using components from the Riverside Herald project.

## Features

- **Hybrid Theme**: Vintage olive/cream colors for second-hand items, modern navy/gold for new products
- **E-commerce**: Full shopping cart and checkout with Yoco payments
- **Content Management**: Articles and content pages managed via Django CRM backend
- **Authentication**: User registration and login
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS with custom vintage/modern theme
- **Backend**: Django CRM API (shared with other sites)
- **Payments**: Yoco integration
- **Fonts**: Inter (body), Playfair Display (headings)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` from template:
   ```bash
   cp env-template.txt .env.local
   ```

3. Configure environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://3pillars.pythonanywhere.com/api
   NEXT_PUBLIC_COMPANY_SLUG=past-and-present
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3001](http://localhost:3001)

## Project Structure

```
past-and-present/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── products/        # Product listing and detail pages
│   │   ├── articles/        # Article/blog pages
│   │   ├── cart/            # Shopping cart
│   │   ├── checkout/        # Checkout flow
│   │   └── ...              # Other pages
│   ├── components/          # React components
│   │   ├── layout/          # Header, Footer, Navigation
│   │   ├── ui/              # Toast, Modal, etc.
│   │   └── ...
│   ├── contexts/            # React contexts (Auth, Toast)
│   ├── lib/                 # API client, types, utilities
│   └── styles/              # Global CSS
├── public/                  # Static assets
└── ...config files
```

## Color Palette

### Vintage Section
- Primary: Olive Green `#2C5F2D`
- Background: Cream `#FAF5E9`
- Accent: Terracotta `#B85042`

### Modern Section
- Primary: Navy Blue `#002349`
- Background: Light Gray `#F1F1F2`
- Accent: Gold `#D4AF37`

## Backend Requirements

This site connects to the Django CRM backend. Ensure:

1. Company `past-and-present` is registered in the backend
2. Products are created with `is_vintage` flag for categorization
3. Articles are created for content pages (home, about, etc.)
4. Yoco integration is configured for payments

## Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
