# CineVerse AI — Master Development Prompt
> Use with: OpenAI GPT-4o | Build phase by phase | UI/UX included in every phase

---

## CONTEXT (paste this at the top of every chat)

You are a senior full-stack engineer and UI/UX designer helping build **CineVerse AI** — an AI-powered entertainment discovery platform.

CineVerse AI builds a unique **Entertainment DNA** profile for every user and recommends movies, anime, TV shows, music, and podcasts using AI. It does NOT host content — it redirects users to Netflix, Spotify, Crunchyroll, YouTube, etc.

Core features:
- Entertainment DNA (personalized genre/mood profile)
- AI recommendations with match % scores + explanations
- Mood-based discovery ("I feel sad" → movies + music + podcasts)
- Cross-domain recommendations (Interstellar fan → Sci-Fi anime + space podcasts)
- Conversational AI assistant for natural language queries
- Watchlists, collections, ratings, reviews
- Social following, shared lists, community reviews
- Gamification (badges: Movie Explorer, Anime Master, Sci-Fi Guru)
- Analytics dashboard (genre trends, monthly listening time, DNA radar chart)
- Free and Premium subscription tiers

Tech stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (auth + DB + realtime), Prisma ORM, PostgreSQL + pgvector, OpenAI GPT-4o, Redis (caching), Stripe (payments), Vercel (deployment).

Always produce:
1. Full working code (no placeholders, no TODOs)
2. UI components using Tailwind CSS with dark mode support
3. TypeScript types for everything
4. Supabase/Prisma schema when relevant
5. OpenAI API integration using the latest SDK
6. Mobile-responsive layouts
7. Error handling and loading states

Design style: Dark-first, cinematic aesthetic. Deep navy/black backgrounds (#0A0F1E base), electric blue accents (#3B82F6), warm gold for highlights (#F59E0B), glassmorphism cards (backdrop-blur + border opacity). Smooth animations with Framer Motion. Think: a premium streaming app crossed with a smart assistant.

---

---

# PHASE 1 — Foundation & Onboarding

## Prompt 1.1 — Project Setup

```
Set up the CineVerse AI Next.js 14 project from scratch.

Create:
1. next.config.js with image domains for TMDB, Spotify, and Crunchyroll poster URLs
2. tailwind.config.ts with the CineVerse design system:
   - Colors: background (#0A0F1E, #111827, #1E2A3A), accent blue (#3B82F6), gold (#F59E0B), coral (#EF4444), success (#10B981)
   - Custom fonts: Outfit (headings) + Inter (body) from Google Fonts
   - Custom animations: fadeIn, slideUp, glow, shimmer
3. globals.css with base styles, scrollbar styling, and CSS variables
4. Folder structure:
   /app (pages), /components (ui/ + features/), /lib (utils, db, ai, api), /hooks, /types, /actions (server actions)
5. Prisma schema with models: User, EntertainmentDNA, WatchlistItem, Collection, Review, Rating, Achievement, Follow
6. Supabase client setup (server + client components)
7. Environment variables template (.env.example)

Design: Dark cinematic theme. The app should feel like opening Netflix but smarter.
```

---

## Prompt 1.2 — Landing Page UI

```
Build the CineVerse AI landing page at app/page.tsx.

Sections:
1. HERO: Full-screen with animated floating movie/anime poster cards in the background (use placeholder images from TMDB). Headline: "Your Entertainment, Finally Understood." Subheadline about AI-powered discovery. Two CTAs: "Get Started Free" and "See How It Works".

2. PROBLEM: "You spend 30 minutes choosing what to watch." Three pain points with icons: Decision fatigue, Switching between 5 apps, Generic recommendations.

3. FEATURES: Bento grid layout showing Entertainment DNA, Mood Discovery, AI Match Score, Cross-Domain Recs, AI Assistant, and Social features. Each card has an icon, title, description, and subtle animated gradient border on hover.

4. HOW IT WORKS: 3-step process (Build your DNA → Get AI recommendations → Discover across all platforms) with animated connecting lines.

5. SOCIAL PROOF: Fake testimonials with avatars, ratings, and quotes about discovering hidden gems.

6. PRICING: Free vs Premium cards with feature comparison. Premium card has a gold border glow.

7. FOOTER: Logo, links, social icons.

Use Framer Motion for: hero text staggered reveal, feature cards sliding up on scroll, floating poster animation loop.
Design: Dark (#0A0F1E background), electric blue and gold accents, glassmorphism cards.
```

---

## Prompt 1.3 — Auth System

```
Build the complete authentication system for CineVerse AI using Supabase Auth.

Create:
1. app/(auth)/signup/page.tsx — Sign up with email/password + Google OAuth
   - Animated form with email, username, password fields
   - Password strength indicator
   - "Continue with Google" button
   - After signup → redirect to /onboarding

2. app/(auth)/login/page.tsx — Login page
   - Email/password + Google OAuth
   - "Forgot password" link
   - After login → redirect to /dashboard or /onboarding if DNA not set

3. lib/auth.ts — Server-side auth helpers using Supabase SSR
4. middleware.ts — Protect /dashboard, /onboarding, /profile routes
5. components/ui/AuthButton.tsx — Reusable auth state button (login/logout + avatar)

Design: Centered card on dark background with a blurred movie collage behind it. Glassmorphism form card with subtle border glow. Smooth transitions between login/signup.
```

---

## Prompt 1.4 — Onboarding Wizard (Entertainment DNA Builder)

```
Build the multi-step onboarding wizard at app/onboarding/page.tsx.

This is the most important UX in the app. Users build their Entertainment DNA here.

Steps (with animated progress bar at top):

STEP 1 — "What do you enjoy?" 
Grid of content type cards: Movies, Anime, TV Shows, Music, Podcasts. 
Each card has a large icon, label, and toggles selected (glowing border + checkmark).
Multi-select, at least 1 required.

STEP 2 — "Your favorite genres"
Show genres based on Step 1 selections. 
Movies: Action, Sci-Fi, Horror, Comedy, Romance, Crime, Fantasy, Documentary, Thriller, Adventure
Anime: Shonen, Seinen, Isekai, Sports, Romance, Fantasy, Psychological, Adventure
Music: Hip Hop, Rap, R&B, Pop, Rock, EDM, Afrobeats, Classical, Lo-fi
Multi-select pill buttons with color coding per category.

STEP 3 — "Your all-time favorites"
Input fields with autocomplete (mock TMDB search):
- Favorite movies (up to 5, searchable)
- Favorite anime (up to 5, searchable)
- Favorite artists (up to 5, searchable)
- Favorite actors (up to 3)

STEP 4 — "Your mood preferences"
Mood cards in a 4x2 grid: Emotional, Funny, Inspirational, Dark, Mind-blowing, Relaxing, Intense, Family-friendly.
Each card has an emoji, label, description of what it means.

STEP 5 — "Your Entertainment DNA" (results screen)
Animated radar/bar chart showing their DNA profile.
Example: Action 95%, Sci-Fi 91%, Dark Themes 82%, Adventure 76%, Comedy 40%, Romance 15%
"Your profile is ready!" with confetti animation. CTA: "Start Discovering →"

Save DNA scores to Supabase EntertainmentDNA table on completion.

Design: Each step slides in from the right. Selected items have a glowing electric blue border. The DNA result screen has a pulsing glow animation around the chart.
```

---

---

# PHASE 2 — AI Recommendation Engine

## Prompt 2.1 — Database & API Layer

```
Build the data layer for CineVerse AI recommendations.

1. lib/tmdb.ts — TMDB API client
   Functions: searchMovies(query), getMovieDetails(id), getMovieRecommendations(id), searchTV(query), getTVDetails(id), getPopularMovies(genre), discoverMovies(filters)
   Types: TMDBMovie, TMDBShow, TMDBCredits, TMDBGenre

2. lib/anime.ts — Jikan API (MyAnimeList) client
   Functions: searchAnime(query), getAnimeDetails(id), getTopAnime(genre), getAnimeRecommendations(id)
   Types: AnimeResult, AnimeDetails

3. lib/spotify.ts — Spotify API client (Client Credentials flow)
   Functions: searchArtists(query), getArtistTopTracks(id), searchPlaylists(mood), getRecommendations(seedArtists, seedGenres)
   Types: SpotifyArtist, SpotifyTrack, SpotifyPlaylist

4. lib/content.ts — Unified content normalizer
   Normalize TMDB + Jikan + Spotify results into a single ContentItem type:
   { id, title, type (movie|anime|tv|music|podcast), posterUrl, rating, genres, platforms[], streamingUrl, description, year, matchScore? }

5. Prisma migrations for: ContentCache (cache API results), UserInteraction (track clicks/ratings/time)

All with proper TypeScript types, error handling, and response caching with Redis (1 hour TTL).
```

---

## Prompt 2.2 — OpenAI Recommendation Engine

```
Build the AI recommendation engine using OpenAI GPT-4o.

1. lib/ai/recommendations.ts

Function: generateRecommendations(user: UserWithDNA, context: RecommendationContext)

Context includes: mood (optional), time of day, recent activity, content types requested.

System prompt for OpenAI:
"You are CineVerse AI's recommendation engine. You have deep knowledge of movies, anime, TV shows, music, and podcasts. Given a user's Entertainment DNA profile and context, recommend content they will love. Always explain WHY you're recommending each item based on their specific taste profile. Return structured JSON."

Build OpenAI call with function calling to return:
{
  recommendations: [{
    title: string,
    type: "movie"|"anime"|"tv"|"music"|"podcast",
    matchScore: number (0-100),
    explanation: string (personalized, max 2 sentences),
    searchQuery: string (to find on TMDB/Jikan/Spotify),
    platforms: string[],
    genres: string[],
    mood: string
  }],
  insight: string (one line about the user's taste pattern today)
}

2. lib/ai/matchScore.ts
Calculate match score using:
- Genre overlap with DNA profile (weighted)
- Mood alignment
- Collaborative signal (other users with similar DNA loved this)
- Recency boost (trending content gets +5%)
Return 0-100 score.

3. lib/ai/explanation.ts
Generate personalized explanation: "Because you gave Interstellar 5 stars and love Sci-Fi (91% DNA match), you'll love this mind-bending journey through..."

4. app/api/recommendations/route.ts — API endpoint
POST /api/recommendations with { userId, mood?, contentTypes?, limit? }
Returns cached or freshly generated recommendations.
Cache in Redis for 30 minutes per user+context combination.
```

---

## Prompt 2.3 — Home Feed & Discovery UI

```
Build the main dashboard/home feed at app/dashboard/page.tsx.

Layout (dark cinematic design):

TOP BAR: Logo, search icon, notifications bell, user avatar. 

HERO SECTION: 
"Good evening, [name]. Here's what we think you'll love tonight."
Large featured recommendation card (first item) with:
- Full-width background using poster image with gradient overlay
- Title, match score badge (e.g. "98% Match"), genre tags
- AI explanation text in italic
- Two buttons: "Watch on Netflix" (or relevant platform) + "Save to Watchlist"
- Animated shimmer loading state

HORIZONTAL SCROLL ROWS (each with a title + "See all" link):
1. "Picked For You" — top 10 AI recommendations
2. "Because You Love Sci-Fi" — genre-specific row
3. "Trending Now" — popular content
4. "Anime That Matches Your DNA" — anime row (if user selected anime)
5. "Your Vibe Tonight" — mood-based row

CONTENT CARD component (components/features/ContentCard.tsx):
- 2:3 aspect ratio poster
- Hover: scale up + show overlay with title, match score, quick-add-to-watchlist button
- Match score badge (color: green 90%+, blue 80-90%, yellow 70-80%)
- Platform logos at bottom (Netflix, Spotify icons)
- Click → content detail modal or page

MOOD QUICK-SELECT: 
Horizontal pill buttons at top of feed: "😢 Sad", "😂 Funny", "💪 Intense", "🤔 Mind-blowing", "😌 Relaxing", "🌟 Inspiring"
Clicking one refreshes the feed with mood-filtered recommendations.

All data from /api/recommendations. Show skeleton loaders while loading. Implement infinite scroll for rows.
```

---

## Prompt 2.4 — Content Detail Page

```
Build the content detail page at app/content/[type]/[id]/page.tsx.

This page shows full details for a movie, anime, TV show, song, or podcast.

Layout:

HERO (full width, 40vh):
Backdrop image with heavy gradient overlay (bottom-to-top dark fade).
Poster thumbnail floating left. Title, year, genres, runtime.
Match score: Large "94% Match" badge with explanation tooltip.
AI Explanation box: "🤖 Why we think you'll love this: Because you rated Dune 5 stars and your DNA shows 91% Sci-Fi affinity..."

ACTION BUTTONS ROW:
- Primary: "Watch on Netflix" / "Listen on Spotify" (platform-specific, opens in new tab)
- Secondary buttons: "+ Watchlist", "★ Rate", "✍ Review", "Share"

TABS below hero:
1. Overview — description, cast/crew (from TMDB), trailer embed (YouTube)
2. Similar Content — 6 content cards recommended by AI
3. Reviews — community reviews with ratings
4. Where to Watch — all available platforms with links

ENTERTAINMENT DNA MATCH section:
Radar chart showing this content's genre profile vs the user's DNA.
"This matches your Action (95%), Sci-Fi (91%), Dark Themes (82%) profile."

Fetch data: TMDB/Jikan/Spotify API based on [type]. 
Generate AI match score + explanation for this specific user + content pair.
Show platform availability (mock data is fine, with TMDB watch providers for movies).
```

---

---

# PHASE 3 — AI Chat Assistant & Watchlists

## Prompt 3.1 — AI Chat Assistant

```
Build the CineVerse AI conversational assistant.

1. components/features/AIAssistant/ChatPanel.tsx
A slide-out panel (right side, 400px wide on desktop, full-screen on mobile).

UI:
- Dark panel with subtle border
- Chat history (scrollable)
- Message bubbles: User (right, blue), AI (left, dark card with avatar)
- Streaming text effect for AI responses (character by character)
- Input bar at bottom with send button and mic icon placeholder
- "Suggested questions" chips when chat is empty:
  "Find me something like Interstellar"
  "I'm feeling sad, what should I watch?"
  "Recommend a gym playlist"
  "Best dark anime with amazing fights"
  "What's trending in anime this week?"

2. app/api/chat/route.ts — Streaming chat endpoint
POST with { messages: ChatMessage[], userId }

System prompt:
"You are CineVerse AI, a friendly and knowledgeable entertainment discovery assistant. You know the user's Entertainment DNA profile: [inject DNA]. You have access to movies, anime, TV shows, music, and podcasts. When recommending, always:
1. Personalize based on their DNA
2. Explain WHY in 1 sentence  
3. Give match scores (e.g. 94% match)
4. Tell them where to watch/listen
5. Keep responses conversational and enthusiastic but concise
Return recommendations as a mix of text and structured data."

Use OpenAI streaming (stream: true) and return SSE.
Parse streaming response and render in real time.

3. Tool calling: give the assistant tools:
- search_content(query, type) — searches TMDB/Jikan/Spotify
- get_user_dna() — returns user's Entertainment DNA
- add_to_watchlist(contentId, contentType) — saves to DB
- get_trending(type, genre) — fetches trending content

4. Message persistence: save chat history to Supabase (last 50 messages per user).

Design: The assistant icon is a glowing brain/star. Typing indicator with three bouncing dots. Smooth slide-in animation for the panel.
```

---

## Prompt 3.2 — Watchlists & Collections

```
Build the watchlist and collections system.

1. app/watchlist/page.tsx — Main watchlist page

TABS: All | Movies | Anime | TV Shows | Music | Completed

WATCHLIST GRID:
- Content cards in a responsive grid (4 cols desktop, 2 mobile)
- Each card: poster, title, type badge, "Mark Complete" button, remove button
- Drag and drop to reorder (using @dnd-kit/core)
- Filter bar: by type, by genre, by platform

COLLECTION SIDEBAR (left on desktop, drawer on mobile):
List of user's collections with item count.
"+ New Collection" button opens a modal.
Click collection → filters grid to that collection.

Collections: Weekend Watchlist, Best Anime Ever, Gym Music, Date Night Movies, etc.

2. components/features/WatchlistButton.tsx
Reusable "+ Save" button used across the app.
On click: dropdown to choose which collection (or create new).
Shows checkmark if already saved.
Optimistic UI update.

3. app/api/watchlist/route.ts — CRUD API
GET /api/watchlist?userId=&type=&collection=
POST /api/watchlist (add item)
DELETE /api/watchlist/:id
PATCH /api/watchlist/:id (mark complete, move collection)

4. components/features/CollectionModal.tsx
Create/edit collection: name, emoji picker, privacy toggle (public/private).

5. Completed tracker:
When marked complete: add to "Completed" tab, prompt for rating + quick review.

All with optimistic updates, toast notifications, and skeleton loading states.
```

---

## Prompt 3.3 — Rating & Review System

```
Build the rating and review system.

1. components/features/RatingModal.tsx
Triggered after marking content as complete or from content page.

UI:
- 5-star rating with hover animation (stars fill with gold glow)
- Quick tags: "Mind-blowing", "Overrated", "Hidden gem", "Cried my eyes out", "Watch with friends", "Late night perfection"
- Optional text review (max 500 chars, char counter)
- Submit button

2. app/reviews/[contentId]/page.tsx or section within content detail
Show all community reviews for a piece of content.

Review card:
- User avatar + name + Entertainment DNA snippet ("Sci-Fi enthusiast 91%")
- Star rating + quick tags
- Review text
- Like button (heart with count)
- "Helpful?" thumbs up/down
- Spoiler toggle (blur review text if contains spoiler)

Sort options: Most liked, Most recent, Highest rated, Lowest rated.

3. lib/ai/reviewSentiment.ts
After review submission, use OpenAI to:
- Detect spoilers (flag for blur)
- Extract sentiment and key themes
- Generate a one-line summary for the review card preview

4. Prisma schema additions:
Review model: userId, contentId, contentType, rating, text, tags[], sentiment, isSpoiler, likes
ReviewLike model: userId, reviewId

5. Server actions for: createReview, likeReview, flagReview
All with proper auth checks.
```

---

---

# PHASE 4 — Social, Gamification & Analytics

## Prompt 4.1 — Social Features

```
Build the social layer for CineVerse AI.

1. app/profile/[username]/page.tsx — Public profile page

Sections:
- Avatar, name, username, bio, join date
- Entertainment DNA radar chart (public)
- Stats: X movies watched, X anime completed, X reviews written, X followers, X following
- Public watchlists and collections grid
- Recent reviews
- Taste compatibility: "You and [user] have 78% taste overlap" (shown when viewing someone else's profile)

2. app/social/page.tsx — Social discovery feed

TABS: Following | Discover | Trending Lists

Following feed shows:
- "[User] added Interstellar to 'Best Sci-Fi Ever' collection"
- "[User] rated Attack on Titan ★★★★★"
- "[User] wrote a review for Dune"
Each activity card has: avatar, action text, content poster thumbnail, time ago, like + comment buttons.

Discover tab: Suggested users based on Entertainment DNA similarity.
"Users with 90%+ DNA match" section.

3. Follow system (app/api/follow/route.ts):
POST /api/follow { followerId, followingId }
DELETE /api/follow { followerId, followingId }
GET /api/followers/:userId
GET /api/following/:userId

With Supabase Realtime for live follower count updates.

4. Activity feed (Supabase Realtime):
Real-time updates when someone you follow adds/rates/reviews.
Bell notification icon shows unread count.
```

---

## Prompt 4.2 — Gamification & Achievements

```
Build the achievement and gamification system.

1. lib/achievements.ts — Achievement definitions and checker

Define all achievements:
{
  id: "movie_explorer",
  title: "Movie Explorer",
  description: "Rate 10 movies",
  icon: "🎬",
  rarity: "common",
  condition: (stats) => stats.moviesRated >= 10
},
{
  id: "anime_master", 
  title: "Anime Master",
  description: "Complete 20 anime series",
  icon: "🎌",
  rarity: "rare",
  condition: (stats) => stats.animeCompleted >= 20
},
// Add 20+ achievements total covering:
// Content milestones (watched 50 movies, 100 anime)
// Genre specialists (Sci-Fi Guru, Horror Connoisseur, Romance Expert)
// Social (First follower, Trusted Critic - 50 likes on a review)
// Discovery (Hidden Gem - rated something with <1000 ratings highly)
// Streaks (Reviewed 7 days in a row)

2. lib/achievements/checker.ts
checkAndAwardAchievements(userId): runs after any user action.
Returns newly earned achievements to trigger celebration UI.

3. components/features/AchievementToast.tsx
Full-screen celebration overlay when earning an achievement:
- Confetti animation
- Achievement icon (large, bouncing in)
- "Achievement Unlocked!" heading
- Achievement title + description
- Rarity badge (Common/Rare/Legendary)
- Share button
Auto-dismisses after 4 seconds.

4. app/achievements/page.tsx — Achievements gallery
Grid of all achievements: earned (full color) vs locked (grayscale + lock icon).
Progress bars for "in progress" achievements (e.g. "7/10 movies rated").
Rarity sections: Legendary, Epic, Rare, Common.

5. User XP system:
Rate content: +10 XP, Write review: +25 XP, Earn achievement: +50-200 XP.
Show XP bar in profile header. Levels: Casual Viewer → Enthusiast → Critic → Guru → Legend.
```

---

## Prompt 4.3 — Analytics Dashboard

```
Build the personal analytics dashboard at app/analytics/page.tsx.

Using Recharts for all charts. Dark themed charts.

HEADER STATS ROW (4 metric cards):
- Total content consumed (number)
- Favorite genre (top DNA category)  
- Hours of content watched (estimated)
- Reviews written

SECTION 1 — Entertainment DNA (full width):
Radar chart showing all genre scores.
Axes: Action, Sci-Fi, Anime, Comedy, Romance, Dark Themes, Adventure, Horror.
Two overlapping areas: "This month" vs "All time" (toggle).
Animated on load (draws the polygon).

SECTION 2 — Taste Timeline (full width):
Line chart: months on X axis, genre % on Y axis. 
Multiple lines (one per top genre) showing how taste evolved over time.
Tooltip: hover to see exact % per genre per month.

SECTION 3 — Two column:
LEFT: Content Type Breakdown — Donut chart: Movies 45%, Anime 30%, TV 15%, Music 10%.
RIGHT: Platform Usage — Horizontal bar chart showing Netflix, Crunchyroll, Spotify usage.

SECTION 4 — Top Content:
Three side-by-side lists: Top 5 Movies, Top 5 Anime, Top 5 Artists (from ratings/listening).
Each with poster thumbnail, title, star rating.

SECTION 5 — Monthly Report Card:
"Your June 2025 in Entertainment"
Generated by OpenAI: personalized paragraph about the month's consumption patterns.
"You went deep on psychological anime this month, watched 3 Satoshi Kon films, and your taste for dark themes grew from 78% to 85%..."

All data from Supabase aggregation queries. Show loading skeletons. Add date range picker (7d / 30d / 90d / All time).
```

---

---

# PHASE 5 — Premium, Polish & Launch

## Prompt 5.1 — Premium Subscription with Stripe

```
Build the premium subscription system using Stripe.

1. app/pricing/page.tsx — Pricing page

Two cards side by side:
FREE PLAN (left):
- Basic AI recommendations
- Watchlists (up to 3 collections)
- Ratings & reviews
- Basic analytics
- "Current plan" button (if on free)

PREMIUM PLAN (right, gold border glow):
- "Most Popular" badge
- Advanced AI recommendations (more personalized, cross-domain)
- Unlimited collections
- AI Chat Assistant (unlimited messages)
- Deep analytics + monthly reports
- Entertainment DNA insights
- Early access to new features
- $9.99/month or $79.99/year (2 months free)
"Upgrade to Premium" → Stripe Checkout

2. lib/stripe.ts — Stripe helpers
createCheckoutSession(userId, priceId): create Stripe session
createPortalSession(userId): billing portal for managing subscription
getSubscriptionStatus(userId): check active subscription

3. app/api/stripe/webhook/route.ts — Stripe webhook handler
Handle: checkout.session.completed → update user to premium
Handle: customer.subscription.deleted → downgrade to free
Handle: invoice.payment_failed → send warning email

4. middleware.ts updates — Premium feature gating
Create withPremium() wrapper for premium-only routes.
Redirect free users to pricing page with "This is a Premium feature" message.

5. components/features/PremiumGate.tsx
Overlay component for premium-gated features:
Shows blurred content behind, "Unlock with Premium" CTA, feature description.
Use on: advanced AI recommendations, unlimited collections, monthly reports.

6. Premium badge in UI:
Add gold "PRO" badge to premium users' profiles and avatars.
```

---

## Prompt 5.2 — Settings, PWA & Final Polish

```
Build the settings page and final production polish for CineVerse AI.

1. app/settings/page.tsx — Settings page

TABS:
Profile: Edit avatar (upload to Supabase Storage), username, bio, social links.
Notifications: Toggle email/push notifications for: new followers, review likes, weekly AI recommendations email, achievement unlocks.
Entertainment DNA: Re-take the onboarding quiz to reset DNA. View DNA history.
Privacy: Profile public/private, watchlist visibility, block users.
Subscription: Current plan, upgrade/downgrade, billing portal link (Stripe), invoice history.
Danger Zone: Delete account (with confirmation dialog).

2. PWA setup (next.config.js + manifest):
next-pwa configuration.
manifest.json: name "CineVerse AI", dark theme color, icons in multiple sizes.
Service worker for offline caching of dashboard shell.
Install prompt: "Add CineVerse to Home Screen" banner after 3 visits.

3. Performance optimizations:
- next/image for all posters with blur placeholder
- React.lazy + Suspense for analytics charts
- Implement virtual scrolling for long content lists (react-virtual)
- Prefetch top 5 recommendations on dashboard load
- Preload fonts in layout.tsx

4. SEO:
Dynamic metadata for content pages: "Interstellar (2014) — 94% Match for You | CineVerse AI"
Open Graph images for shareable watchlists
Sitemap.xml and robots.txt

5. Error pages:
app/not-found.tsx — custom 404 with "Lost in the multiverse?" theme
app/error.tsx — custom error boundary with "Something broke in the matrix" theme

6. Loading states throughout:
Consistent skeleton loader components for: content cards, profile pages, analytics charts.
Global loading indicator in navigation.

7. Toast notification system (using react-hot-toast):
Success, error, info toasts styled to match dark CineVerse theme.
```

---

## Prompt 5.3 — Launch Checklist & Deployment

```
Prepare CineVerse AI for production launch on Vercel.

Create a final production checklist and setup:

1. Environment variables audit:
List all required env vars with descriptions:
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
OPENAI_API_KEY, TMDB_API_KEY, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET,
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET,
REDIS_URL, NEXTAUTH_SECRET

2. Supabase production setup:
- Row Level Security (RLS) policies for all tables (users can only read/write their own data)
- Database indexes for performance: (userId, contentType), (contentId), (username)
- Supabase Edge Functions for: weekly recommendation email, achievement checker cron

3. Vercel deployment config (vercel.json):
- Build command, output directory
- Environment variable mapping
- Edge runtime for API routes that need low latency
- Cron jobs for: daily DNA recalculation, weekly email reports

4. Monitoring setup:
- Sentry error tracking: wrap app in Sentry provider, capture API errors
- PostHog analytics: track key events: recommendation_clicked, watchlist_added, chat_message_sent, upgrade_clicked
- Uptime monitoring with Vercel Analytics

5. Rate limiting (app/api middleware):
Implement rate limiting using Upstash Redis:
- /api/recommendations: 20 requests/minute per user
- /api/chat: 30 messages/hour for free users, unlimited for premium
- /api/reviews: 10 reviews/day per user

6. Security hardening:
- Content Security Policy headers
- SQL injection prevention (Prisma handles this)
- Input sanitization for review text (strip HTML)
- CORS configuration for API routes

7. Launch email template (using Resend):
Welcome email sent after signup + DNA completion:
"Your Entertainment DNA is ready! Here are your first 5 personalized picks..."
Include top 5 recommendations with posters and match scores.

Generate a production-ready README.md with: setup instructions, environment variables, deployment guide, API documentation.
```

---

---

## DESIGN SYSTEM REFERENCE

Use these consistently across all prompts:

```typescript
// Colors
const colors = {
  bg: {
    primary: '#0A0F1E',    // Main dark background
    secondary: '#111827',  // Card backgrounds  
    tertiary: '#1E2A3A',   // Hover states
  },
  accent: {
    blue: '#3B82F6',       // Primary CTA, links
    gold: '#F59E0B',       // Premium, ratings, highlights
    coral: '#EF4444',      // Warnings, remove actions
    success: '#10B981',    // Completed, success states
    purple: '#8B5CF6',     // Anime category
  },
  text: {
    primary: '#F9FAFB',    // Main text
    secondary: '#9CA3AF',  // Muted text
    tertiary: '#6B7280',   // Placeholder text
  }
}

// Glassmorphism card style
const glassCard = `
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 16px;
`

// Match score colors
const matchScoreColor = (score: number) => {
  if (score >= 90) return '#10B981' // green
  if (score >= 80) return '#3B82F6' // blue
  if (score >= 70) return '#F59E0B' // gold
  return '#6B7280' // gray
}
```

---

## OPENAI API USAGE GUIDE

Since you're using OpenAI (not Copilot), use these patterns:

```typescript
// Recommendation generation
import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Standard completion
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
  response_format: { type: 'json_object' }, // for structured data
  max_tokens: 1000,
})

// Streaming (for chat assistant)
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: conversationHistory,
  stream: true,
})
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '')
}

// Embeddings (for content similarity / pgvector)
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: contentDescription,
})
// Store in PostgreSQL pgvector column for similarity search
```

---

## HOW TO USE THIS PROMPT FILE

1. Open a new OpenAI ChatGPT-4o conversation for each prompt
2. Start EVERY conversation by pasting the CONTEXT block at the top
3. Then paste the specific prompt you're working on
4. Build in order: Phase 1 → 2 → 3 → 4 → 5
5. Within each phase, build prompts in order (2.1 before 2.2)
6. Save all generated code to your VS Code project before moving on
7. Test each component before moving to the next prompt

Tips:
- If a response is cut off, say: "Continue from where you left off"
- If code has bugs, paste the error and say: "Fix this error, here's the full context: [paste relevant code]"
- For UI improvements, say: "Make this more cinematic and premium looking"
- For performance: "Optimize this component, it's rendering too slowly"
