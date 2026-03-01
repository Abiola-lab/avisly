This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📊 Analytics Monitoring

This project includes a dual analytics system for maximum insight:

### 1. In-App Dashboard (`/dashboard`)
*   **Performance Metrics**: Real-time QR scans and spin participations.
*   **Conversion Funnel**: Visual tracking from Scan to Google Review.
*   **ROI Estimation**: Direct impact analysis (Potential Revenue based on coupon usage).

### 2. PostHog (Advanced Product Analysis)
For behavior analysis, heatmaps, and session replays:
1.  Log in to your [PostHog Dashboard](https://posthog.com).
2.  **Live Events**: Check the activity feed to see real-time interaction events (`spin_started`, `rating_submitted`, `google_clicked`).
3.  **Session Replay**: Watch how users interact with the wheel on mobile.
4.  **Heatmaps**: Visualize where users click (using the PostHog toolbar).

Ensure your `NEXT_PUBLIC_POSTHOG_KEY` is correctly set in Vercel environment variables to enable these features.
