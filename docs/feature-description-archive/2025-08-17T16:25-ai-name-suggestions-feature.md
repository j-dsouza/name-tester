# Overview

This feature adds AI-powered name suggestions that complement existing names in the user's collection. The feature integrates seamlessly into the existing name management workflow and provides contextually appropriate suggestions based on the user's current name choices.

# User Journey

1. The user opens the "Manage Names" modal
2. Next to each textarea label ("First Names", "Middle Names", "Last Names"), there are "Suggest Names" buttons
3. Buttons are enabled/disabled based on minimum requirements:
   - **First Names**: Requires at least one middle name AND one last name
   - **Middle Names**: Requires at least one first name AND one last name  
   - **Last Names**: Requires at least one first name AND one middle name
4. When requirements aren't met:
   - Desktop: Button is greyed out with tooltip explaining missing requirements
   - Mobile: Button shows popup message when tapped explaining why it's disabled
5. When user clicks an enabled button:
   - Loading indicator appears
   - API call is made to generate 5 suggestions
   - Suggested names are appended to the bottom of the corresponding textarea
   - Loading state clears
6. If API errors occur, error message is displayed to the user
7. User can accept, modify, or delete suggested names like any other names
8. When satisfied, user closes modal to see updated name combinations

# Technical Implementation

## API Route
- **Endpoint**: `/api/suggest-names`
- **Method**: POST
- **Authentication**: Server-side OpenAI API key (`OPENAI_API_KEY` environment variable)
- **Security**: API key must never be logged or exposed to client

## Request/Response Format
```typescript
// Request body
interface SuggestNamesRequest {
  nameType: 'first' | 'middle' | 'last';
  existingNames: {
    firstNames: string[];
    middleNames: string[];
    lastNames: string[];
  };
}

// Response body
interface SuggestNamesResponse {
  suggestions: string[];
  error?: string;
}
```

## Minimum Requirements Logic
- **First Names**: `middleNames.length > 0 && lastNames.length > 0`
- **Middle Names**: `firstNames.length > 0 && lastNames.length > 0`
- **Last Names**: `firstNames.length > 0 && middleNames.length > 0`

## UI Integration
- **Button Placement**: Next to textarea labels for optimal visual hierarchy
- **Loading States**: Spinner or loading text during API calls
- **Error Handling**: Toast notifications or inline error messages for API failures
- **Mobile Responsiveness**: Touch-friendly buttons with appropriate feedback
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## Name Format Support
- **Nickname Syntax**: Suggestions support same `"Full Name (Nickname1, Nickname2)"` format
- **Regex Validation**: Server-side validation ensures suggested names match approved nickname syntax
- **Invalid Format Filtering**: Names that don't match the regex pattern are filtered out and not added to the list
- **Parsing**: Generated names are parsed and validated using existing name processing pipeline
- **Integration**: Suggested names work seamlessly with existing combination generation

## Response Processing
1. **OpenAI Response**: Receive 5 suggested names from OpenAI API
2. **Regex Validation**: Apply nickname syntax regex to each suggested name
3. **Filtering**: Remove any names that don't match the expected format
4. **Client Response**: Return only validated names to the client
5. **Fallback**: If no names pass validation, return appropriate error message

# OpenAI Prompt Configuration

## Base Prompt Template
```
You are a baby name expert helping parents find names that work well together. Generate exactly 5 {nameType} names that complement the existing names provided.

REQUIREMENTS:
- Names should flow well phonetically with the existing names
- Consider similar style, origin, and cultural background
- Avoid names that are too similar or rhyme awkwardly
- Include a mix of popular and unique options

NICKNAME SYNTAX:
- You may optionally include nicknames using this exact format: "Full Name (Nickname1, Nickname2)"
- You can include zero nicknames: "Alexander"
- You can include one nickname: "Alexander (Alex)"  
- You can include multiple nicknames: "Alexander (Alex, Al, Xander)"
- Only use this format if nicknames are commonly associated with the full name

EXISTING NAMES:
{contextNames}

INSTRUCTIONS:
- Return ONLY the 5 names, one per line
- No explanations, numbers, or extra text
- Use the format "Full Name" or "Full Name (Nickname1, Nickname2)" when appropriate
- Consider syllable patterns and name origins for harmony
```

## Context Name Building
- **For First Names**: Include all middle and last names as context, plus any existing first names
- **For Middle Names**: Include all first and last names as context, plus any existing middle names
- **For Last Names**: Include all first and middle names as context, plus any existing last names

## Example Prompts

### Requesting Middle Names
```
You are a baby name expert helping parents find names that work well together. Generate exactly 5 middle names that complement the existing names provided.

REQUIREMENTS:
- Names should flow well phonetically with the existing names
- Consider similar style, origin, and cultural background  
- Avoid names that are too similar or rhyme awkwardly
- Include a mix of popular and unique options

NICKNAME SYNTAX:
- You may optionally include nicknames using this exact format: "Full Name (Nickname1, Nickname2)"
- You can include zero nicknames: "Alexander"
- You can include one nickname: "Alexander (Alex)"  
- You can include multiple nicknames: "Alexander (Alex, Al, Xander)"
- Only use this format if nicknames are commonly associated with the full name

EXISTING NAMES:
First Names: James, William, Thomas (Tom)
Last Names: Johnson, Smith
Existing Middle Names: David, Michael (Mike)

INSTRUCTIONS:
- Return ONLY the 5 names, one per line
- No explanations, numbers, or extra text
- Use the format "Full Name" or "Full Name (Nickname1, Nickname2)" when appropriate
- Consider syllable patterns and name origins for harmony
```

## Error Handling
- **API Failures**: Display user-friendly error messages
- **Invalid Responses**: Fallback to generic error if OpenAI response is malformed
- **Rate Limiting**: Handle OpenAI rate limits gracefully with retry logic
- **Network Issues**: Timeout handling with clear user feedback
- **No Valid Names**: If all suggested names fail regex validation, display appropriate error message
- **Partial Validation**: If some names pass validation, return valid names and log filtered ones for monitoring
