# Overview

This is a new feature of the Name Tester application which allows users to create shortlinks which they can share with friends and family to allow those people to access the lists of names and shortlists that they have created

# User flow

1. User 1 (creator) creates their name list and shortlists as before
2. Creator clicks "share" button, which creates a link for them
3. Creator copies this link and then shares with a friend (they will share it via Whatsapp etc, outside our app)
4. User 2 (viewer) clicks on this link, which hydrates their view of the app with the information that the creator shared
   1. If the link is invalid, do nothing - Don't overwrite the user's own local history
   2. If the link is valid, load this and overwrite the user's local history. Before loading, display a warning telling the user that this will happen and asking them to continue or go back

# Features

1. The share link should rehydrade both the lists of names and the shortlisted names
2. The "share" button should create a modal which includes the shareable URL and a "copy to clipboard" button
3. The shareable URL should be a shortlink
4. Going to a `/load/[shortlink]` URL should rehydrate the lists

# Data Structure

The shareable data structure includes:
- `firstNames`: string[] - Array of first names with optional nickname syntax "Full (Nick1, Nick2)"
- `middleNames`: string[] - Array of middle names with optional nickname syntax
- `lastNames`: string[] - Array of last names with optional nickname syntax
- `shortlistedCombinations`: string[] - Array of combination IDs that were shortlisted
- `hideDuplicateMiddleLastNames`: boolean - Filter setting for hiding duplicates
- `showAlphabetical`: boolean - Sorting preference setting
- `useShortNames`: boolean - Display preference for nicknames vs full names

# Technical Specifications

## Shortlink Generation
- **Algorithm**: Use a collision-resistant hashing algorithm (such as SHA-256 truncated or Base62 encoding)
- **Length**: 16 characters
- **Character set**: Base62 (alphanumeric: a-z, A-Z, 0-9)

## Database Schema
- **Primary table**: `shared_links`
  - `id`: Primary key (auto-increment)
  - `shortlink`: VARCHAR(16) - The 16-character shortlink identifier (unique index)
  - `data`: JSON/JSONB - The complete app state to restore
  - `created_at`: TIMESTAMP - When the link was created
  - `last_accessed`: TIMESTAMP - When the link was last accessed (for usage tracking)
  - `access_count`: INTEGER - Number of times the link has been accessed

## UI Integration
- **Share button placement**: Next to "Settings" and "Manage Names" buttons in the Name Combinations table header
- **Warning modal message**: "Beware: Loading this will remove your current session. If you wish to save your current session, create a share link before loading"
- **Error handling**: If database is unavailable, show "Database unavailable" error message and return user to their session

## Routing Structure
- Uses Next.js 15 App Router (`src/app/` directory structure)
- New route: `/load/[shortlink]` page for loading shared data
- API routes: `/api/share` (POST) and `/api/load/[shortlink]` (GET)

# Implementation

There is a postgres database, with a connection string available in the `DATABASE_URL` environment variable. For testing, this URL will be `postgres://postgres:Password123!@127.0.0.1:5432/name_tester_app`

This should be implemented using URL shortlinks, which are a short hash of the information that is being saved. To do this, we need to create a backend to our application. This backend should have endpoints which let you save and retrieve information from shortlinks.

In the backend, we should create a table which contains the shortlink and the information required to rehydrate the frontend.

# Libraries

- Use Prisma as an ORM and migration tool.
