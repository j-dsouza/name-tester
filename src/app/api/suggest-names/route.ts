import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

interface SuggestNamesRequest {
  nameType: 'first' | 'middle' | 'last';
  existingNames: {
    firstNames: string[];
    middleNames: string[];
    lastNames: string[];
  };
}

interface SuggestNamesResponse {
  suggestions: string[];
  error?: string;
}

// Zod schema for OpenAI structured output
const NameSuggestionsSchema = z.object({
  suggestions: z.array(z.string()).length(5).describe("Exactly 5 name suggestions, each as a clean string without numbers, bullets, or extra formatting. May include nickname syntax like 'Alexander (Alex)' if appropriate.")
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Regex to validate nickname syntax: "Name" or "Name (Nick1, Nick2)"
const NICKNAME_SYNTAX_REGEX = /^[A-Za-z\s'-]+(?:\s*\([A-Za-z\s,'-]+\))?$/;

function buildPrompt(nameType: 'first' | 'middle' | 'last', existingNames: SuggestNamesRequest['existingNames']): string {
  const basePrompt = `You are a baby name expert helping parents find names that work well together. Suggest exactly 5 ${nameType} names that complement the existing names provided.

REQUIREMENTS:
- Names should flow well phonetically with the existing names
- Consider similar style, origin, and cultural background
- Avoid names that are too similar or rhyme awkwardly
- Include a mix of popular and unique options

NICKNAME SYNTAX:
- You may optionally include nicknames using this exact format: "Full Name (Nickname1, Nickname2)"
- Examples: "Alexander" or "Alexander (Alex)" or "Alexander (Alex, Al)"
- Only use this format if nicknames are commonly associated with the full name

EXISTING NAMES:`;

  let contextNames = '';
  
  // Build context based on name type being requested
  switch (nameType) {
    case 'first':
      if (existingNames.firstNames.length > 0) {
        contextNames += `\nExisting First Names: ${existingNames.firstNames.join(', ')}`;
      }
      if (existingNames.middleNames.length > 0) {
        contextNames += `\nMiddle Names: ${existingNames.middleNames.join(', ')}`;
      }
      if (existingNames.lastNames.length > 0) {
        contextNames += `\nLast Names: ${existingNames.lastNames.join(', ')}`;
      }
      break;
      
    case 'middle':
      if (existingNames.firstNames.length > 0) {
        contextNames += `\nFirst Names: ${existingNames.firstNames.join(', ')}`;
      }
      if (existingNames.middleNames.length > 0) {
        contextNames += `\nExisting Middle Names: ${existingNames.middleNames.join(', ')}`;
      }
      if (existingNames.lastNames.length > 0) {
        contextNames += `\nLast Names: ${existingNames.lastNames.join(', ')}`;
      }
      break;
      
    case 'last':
      if (existingNames.firstNames.length > 0) {
        contextNames += `\nFirst Names: ${existingNames.firstNames.join(', ')}`;
      }
      if (existingNames.middleNames.length > 0) {
        contextNames += `\nMiddle Names: ${existingNames.middleNames.join(', ')}`;
      }
      if (existingNames.lastNames.length > 0) {
        contextNames += `\nExisting Last Names: ${existingNames.lastNames.join(', ')}`;
      }
      break;
  }

  const instructions = `

Please provide exactly 5 clean name suggestions that would work well with these existing names. Each suggestion should be provided as a clean string without numbers, bullets, or extra formatting.`;

  return basePrompt + contextNames + instructions;
}

function validateNameSyntax(name: string): boolean {
  return NICKNAME_SYNTAX_REGEX.test(name.trim());
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: SuggestNamesRequest = await request.json();
    const { nameType, existingNames } = body;

    // Validate request
    if (!nameType || !['first', 'middle', 'last'].includes(nameType)) {
      return NextResponse.json(
        { error: 'Invalid name type. Must be "first", "middle", or "last".' },
        { status: 400 }
      );
    }

    if (!existingNames) {
      return NextResponse.json(
        { error: 'Missing existingNames in request body' },
        { status: 400 }
      );
    }

    // Check minimum requirements
    const { firstNames, middleNames, lastNames } = existingNames;
    
    switch (nameType) {
      case 'first':
        if (middleNames.length === 0 || lastNames.length === 0) {
          return NextResponse.json(
            { error: 'Need at least one middle name and one last name to suggest first names' },
            { status: 400 }
          );
        }
        break;
      case 'middle':
        if (firstNames.length === 0 || lastNames.length === 0) {
          return NextResponse.json(
            { error: 'Need at least one first name and one last name to suggest middle names' },
            { status: 400 }
          );
        }
        break;
      case 'last':
        if (firstNames.length === 0 || middleNames.length === 0) {
          return NextResponse.json(
            { error: 'Need at least one first name and one middle name to suggest last names' },
            { status: 400 }
          );
        }
        break;
    }

    // Build prompt
    const prompt = buildPrompt(nameType, existingNames);

    // Call OpenAI API with structured output
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: zodResponseFormat(NameSuggestionsSchema, "name_suggestions"),
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    // Parse the structured JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', response);
      return NextResponse.json(
        { error: 'Invalid response format from OpenAI' },
        { status: 500 }
      );
    }

    // Validate with Zod schema
    const validationResult = NameSuggestionsSchema.safeParse(parsedResponse);
    if (!validationResult.success) {
      console.error('OpenAI response failed schema validation:', validationResult.error);
      return NextResponse.json(
        { error: 'Invalid response structure from OpenAI' },
        { status: 500 }
      );
    }

    // The suggestions are now guaranteed to be in the correct format
    const suggestions = validationResult.data.suggestions;

    // Still validate syntax as an extra safety check
    const validSuggestions = suggestions.filter(validateNameSyntax);

    // If no valid suggestions after validation, return error
    if (validSuggestions.length === 0) {
      console.error('No valid suggestions from OpenAI structured response:', suggestions);
      return NextResponse.json(
        { error: 'Unable to generate valid name suggestions. Please try again.' },
        { status: 500 }
      );
    }

    // Log filtered suggestions for monitoring
    if (validSuggestions.length < suggestions.length) {
      console.warn(`Filtered ${suggestions.length - validSuggestions.length} invalid suggestions from structured response:`, 
        suggestions.filter(s => !validateNameSyntax(s))
      );
    }

    const responseData: SuggestNamesResponse = {
      suggestions: validSuggestions
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in suggest-names API:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }
      
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Request timed out. Please try again.' },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Unable to generate name suggestions. Please try again.' },
      { status: 500 }
    );
  }
}