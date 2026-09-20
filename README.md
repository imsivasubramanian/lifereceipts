# Life Receipts

URGENT HACKATHON BUILD — I HAVE ONLY 90 MINUTES.

Build the complete working WebRush hackathon project NOW.

Project:

LIFE RECEIPTS — Your Life, In Receipts

I have 3 organizer-provided datasets in the project:

1. Spotify dataset

2. India Transactions dataset

3. Daily Household Transactions dataset

USE ALL THREE.

Do NOT ask me to manually normalize or edit the datasets.

Do NOT paste dataset rows into chat.

Read the local files programmatically.

IMPORTANT:

I need a functioning submission in 90 minutes.

Do not over-engineer.

Do not spend time explaining code.

Implement directly in the project.

==================================================

STACK

==================================================

React

Vite

JavaScript

Tailwind CSS

Lucide React

Recharts

No backend.

No database.

Frontend-only.

==================================================

REQUIRED EXPERIENCE

==================================================

The challenge requires:

- explore receipts

- search

- filtering/navigation

- discover relationships/patterns

- interactive storytelling

- visual digital journey

- responsive design

==================================================

BUILD THIS SIMPLE BUT POLISHED PRODUCT

==================================================

APP NAME:

LifeReceipts

TAGLINE:

Small moments. Hidden patterns. One story.

MAIN NAVIGATION:

Overview | Explore | Connections | Story | Insights

==================================================

DATA

==================================================

Programmatically read all 3 datasets.

Create a lightweight common model:

{

  id,

  source,

  timestamp,

  type,

  title,

  description,

  category,

  amount,

  location,

  platform,

  metadata

}

Use:

source = spotify

source = transactions

source = household

Do not invent missing fields.

Do not expose sensitive transaction information.

Never display:

- credit card number

- customer ID

- DOB

- street address

- personal names from transaction data

Keep raw sensitive fields out of the UI.

IMPORTANT PERFORMANCE:

Do not render the complete Spotify dataset.

Use aggregation and only render a small filtered result window.

==================================================

OVERVIEW

==================================================

Create a visually strong hero:

YOUR LIFE, IN RECEIPTS

"Three streams of everyday activity. Patterns hidden between the moments."

Show REAL calculated stats:

Total Records

Spotify Moments

Transactions

Household Records

Categories

Date Span

Create 3 source cards:

🎵 Music

💳 Transactions

💰 Daily Life

Add:

Explore Receipts

Discover Connections

==================================================

EXPLORE

==================================================

Create a unified receipt explorer.

Required:

- search

- source filter

- category filter

- year/date filter

- location filter where available

Show only a limited number of visible results.

Implement pagination such as:

Previous | Page 1 | Next

Each receipt card should show:

source

title

date

category

amount if applicable

location if applicable

platform if applicable

Click a card to open a detail modal.

Filters must work together.

Include a "Clear Filters" button.

==================================================

CONNECTIONS

==================================================

This is the main differentiator.

Create:

CONNECTED MOMENTS

Find meaningful relationships using simple efficient rules:

- same day

- same month

- nearby timestamps

- repeated category

- cross-source same-day activity

DO NOT perform O(n²) comparison over all records.

Use maps/indexes/grouping.

Display a small set of interesting connections.

Example:

🎵 Spotify

      ↓

💳 Transaction

      ↓

💰 Household

Show:

WHY CONNECTED?

✓ Same day

✓ Nearby time

✓ Different source

Every displayed connection must have a reason.

Create a simple interactive relationship visualization.

If React Flow becomes difficult, use an attractive connected-card/list visualization instead.

The feature must remain functional.

==================================================

STORY

==================================================

Create interactive story chapters from REAL calculated patterns.

Examples:

"The Soundtrack"

"The Spending Trail"

"Everyday Rhythm"

"Recurring Patterns"

These are templates only.

Use real data to fill:

- date range

- number of records

- dominant category

- dominant source

- key observation

Avoid unsupported psychological claims.

Example:

GOOD:

"Music activity was concentrated during evening hours."

BAD:

"You are a night person."

Create Story Mode with:

Previous

Next

Explore Moment

The user should experience:

Moment

→ Connection

→ Pattern

→ Chapter

→ Insight

==================================================

INSIGHTS

==================================================

Create a compact dashboard with REAL calculated values.

Show:

- records by source

- records by category

- activity over time

- Spotify top artists

- Spotify activity by hour

- transaction categories

- household income vs expense

Use Recharts.

Use aggregated values only.

Do not create fake statistics.

==================================================

DIGITAL JOURNEY

==================================================

On Overview or Story, include a simple visual timeline.

Show activity density by month/year.

Allow clicking a period to filter/explore.

Do not make it only a plain list.

==================================================

DESIGN

==================================================

Create a premium editorial data-story design.

NOT a generic admin dashboard.

Use:

- strong typography

- dark/light polished visual system

- cards

- subtle borders

- source icons

- clean spacing

- restrained transitions

- beautiful empty states

Keep animations lightweight.

==================================================

RESPONSIVE

==================================================

Must work at:

375px

768px

1024px

1440px

Fix:

- horizontal overflow

- mobile navigation

- filter layout

- chart width

- receipt cards

- story controls

- connection visualization

==================================================

ACCESSIBILITY

==================================================

Use:

- semantic HTML

- real buttons

- labels

- keyboard-accessible controls

- visible focus states

- accessible dialogs

Do not rely only on color.

==================================================

ARCHITECTURE

==================================================

Keep App.jsx reasonably small.

Use components:

Hero

OverviewStats

SourceCards

ReceiptExplorer

ReceiptCard

ReceiptModal

SearchBar

FilterBar

Timeline

Connections

StoryChapters

StoryMode

Insights

ChartCard

Use utility functions for:

data loading

normalization

filtering

analytics

connections

chapters

Do not over-engineer.

==================================================

PERFORMANCE

==================================================

VERY IMPORTANT:

Spotify is large.

Do not put 150K cards into the DOM.

Do not perform all-record-to-all-record relationship comparisons.

Use:

- aggregation

- grouping

- maps

- filtering

- pagination

Keep initial UI responsive.

==================================================

IMPLEMENTATION ORDER

==================================================

BUILD IN THIS EXACT ORDER:

1. Load all 3 datasets

2. Overview

3. Explore + search/filter

4. Insights

5. Connections

6. Story

7. Timeline

8. Responsive fixes

9. Accessibility

10. Final polish

Do not stop after creating a mockup.

==================================================

FINAL QA

==================================================

Before finishing test:

[ ] All 3 datasets are used

[ ] Overview loads

[ ] Search works

[ ] Filters work

[ ] Combined filters work

[ ] Receipt details work

[ ] Insights work

[ ] Charts work

[ ] Connections work

[ ] Connection reason shown

[ ] Story works

[ ] Story navigation works

[ ] Timeline works

[ ] Mobile works

[ ] Desktop works

[ ] No horizontal overflow

[ ] No sensitive fields displayed

[ ] No console errors

[ ] npm run build succeeds

Run:

npm run build

Fix build errors.

IMPORTANT:

DO NOT explain what you could build later.

DO NOT give me a plan.

BUILD THE APPLICATION NOW.

When finished, report only:

1. Build status

2. Main files created/changed

3. Remaining critical issues

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://lifereceipts.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a6788c9f-aff4-4413-b707-522640bffe6a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
