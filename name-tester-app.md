# Overview

This is a basic application which my girlfriend and I will use to help us choose names for our upcoming baby. We need to be able to see multiple combinations of names to understand what they look like when combined.

# High-level user journey

The user needs to:
1. Enter first names, middle names, and last names
2. View combinations of those names
3. Be able to re-visit the initial lists of names, and add/remove things, based on the combined view that they have seen
4. Shortlist certain combinations of names that the user likes

# Features

1. **Name Input & Storage**
   - Users can enter multiple names in text areas, separated by newlines
   - Names are categorized into first names, middle names, and last names
   - Multiple middle names are supported per combination
   - Names are stored client-side with persistence across browser refreshes

2. **Name Combination Display**
   - Generate all possible combinations of first + middle + last names
   - Display combinations side-by-side with initials in a separate column
   - **Small number threshold**: If ≤50 combinations, display all on one page
   - **Large number threshold**: If >50 combinations, show random sample arranged alphabetically
   - When sampling is active, clearly indicate that names are being sampled
   - Provide user-controlled filtering options alongside sampling

3. **Name Management**
   - Users can edit name lists through both:
     - Inline editing in the combination view
     - Separate "manage names" page/modal
   - Add/remove names from lists and see immediate updates to combinations

4. **Shortlisting**
   - Users can shortlist favorite name combinations
   - No limit on number of shortlisted names
   - Simple add/remove functionality (no ratings, notes, or sharing features)

# Technical details

- **State Management**: All state stored client-side using browser localStorage
- **Data Persistence**: State persists across browser refreshes and sessions
- **Project Scope**: Single active set of names (no multiple projects support)
- **No Backend**: Entirely client-side application with no database or server requirements
