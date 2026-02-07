# Review Email System Design

## Overview

Periodically send the blog owner an email with a blog post to re-read,
using a Leitner Box spaced repetition algorithm. Runs as a Netlify Scheduled
Function, stores state in Netlify Blobs, sends email via Resend.

## Architecture

```
[Netlify Cron 0 0 * * *] --> [send-review-email.mts]
                                      |
                   +------------------+------------------+
                   |                  |                  |
            [Netlify Blobs]    [Blog content]       [Resend API]
            Read/write          Load post list       Send email
            review history      Select post
```

- Schedule: Daily at 0:00 UTC (09:00 KST)
- Only sends when there are posts due for review

## Leitner Box Algorithm

3-box system with increasing review intervals:

| Box | Interval | Description              |
|-----|----------|--------------------------|
| 1   | 1 day    | New or recently added     |
| 2   | 3 days   | Reviewed once             |
| 3   | 7 days   | Reviewed twice or more    |

Selection priority:
1. Posts never seen (new posts enter Box 1)
2. Box 1 posts overdue (1+ days since last seen)
3. Box 2 posts overdue (3+ days since last seen)
4. Box 3 posts overdue (7+ days since last seen)
5. No email sent if nothing is due

After each review email, the post moves up one box (max Box 3).

## State Storage (Netlify Blobs)

Store name: "blog-reviews"
Key: "post-history"

```json
{
  "hello-world": {
    "slug": "hello-world",
    "title": "Hello World",
    "box": 2,
    "lastSeen": "2026-02-05T00:00:00Z",
    "timesReviewed": 3
  }
}
```

## Email Template

Minimal 29CM-style design:
- Black/white with accent orange
- System sans-serif (email-safe)
- Shows: title, description, "Read Again" CTA button
- Footer: current box, review count, next review interval

## File Structure

```
netlify/functions/
  send-review-email.mts       # Scheduled function entry point
  utils/
    leitner.ts                 # Leitner Box algorithm
    review-storage.ts          # Netlify Blobs state management
    email-template.ts          # HTML email generation
```

## Environment Variables (Netlify)

- RESEND_API_KEY: Resend API key
- REVIEW_EMAIL_TO: Recipient email address
- SITE_URL: Blog base URL (https://chan99k.github.io)

## Dependencies

New: `resend` (npm install)
Existing: `@netlify/blobs`, `@netlify/functions`

## External Setup Required

1. Create Resend account (resend.com)
2. Verify sending domain or use onboarding@resend.dev for testing
3. Add environment variables to Netlify dashboard
4. Deploy to Netlify (scheduled functions only run on published deploys)

## Implementation Order

1. netlify/functions/utils/leitner.ts
2. netlify/functions/utils/leitner.test.ts (unit tests)
3. netlify/functions/utils/review-storage.ts
4. netlify/functions/utils/email-template.ts
5. netlify/functions/send-review-email.mts
6. Install resend package
