export interface ParsedName {
  full: string;
  nicknames: string[];
}

export interface NameCombination {
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  initials: string;
  id: string;
  // For nickname support
  firstNameShort?: string;
  middleNameShort?: string;
  lastNameShort?: string;
  shortName?: string;
  shortInitials?: string;
}

export function parseNames(input: string): string[] {
  return input
    .split('\n')
    .map(name => name.trim())
    .filter(name => name.length > 0);
}

export function parseNameWithNicknames(nameEntry: string): ParsedName {
  // Handle syntax like "Thomas (Tom)" or "Elizabeth (Liz, Beth, Betty)"
  const match = nameEntry.match(/^([^(]+)(?:\s*\(([^)]+)\))?$/);
  
  if (!match) {
    return { full: nameEntry.trim(), nicknames: [] };
  }
  
  const full = match[1].trim();
  const nicknamesPart = match[2];
  
  if (!nicknamesPart) {
    return { full, nicknames: [] };
  }
  
  const nicknames = nicknamesPart
    .split(',')
    .map(nick => nick.trim())
    .filter(nick => nick.length > 0);
  
  return { full, nicknames };
}

export function parseNamesWithNicknames(input: string): ParsedName[] {
  return input
    .split('\n')
    .map(name => name.trim())
    .filter(name => name.length > 0)
    .map(parseNameWithNicknames);
}

export function getDisplayName(parsedName: ParsedName, useShort: boolean): string {
  if (useShort && parsedName.nicknames.length > 0) {
    return parsedName.nicknames[0]; // Use first nickname
  }
  return parsedName.full;
}

export function generateInitials(firstName: string, middleNames: string[], lastName: string): string {
  const firstInitial = firstName.charAt(0).toUpperCase();
  const middleInitials = middleNames.map(name => name.charAt(0).toUpperCase()).join('');
  const lastInitial = lastName.charAt(0).toUpperCase();
  
  return `${firstInitial}${middleInitials}${lastInitial}`;
}

export function generateCombinations(
  firstNames: string[],
  middleNames: string[],
  lastNames: string[]
): NameCombination[] {
  const combinations: NameCombination[] = [];
  
  // Parse names with nickname support
  const parsedFirstNames = firstNames.map(parseNameWithNicknames);
  const parsedMiddleNames = middleNames.map(parseNameWithNicknames);
  const parsedLastNames = lastNames.map(parseNameWithNicknames);
  
  for (const parsedFirst of parsedFirstNames) {
    for (const parsedMiddle of parsedMiddleNames) {
      for (const parsedLast of parsedLastNames) {
        const firstName = parsedFirst.full;
        const middleName = parsedMiddle.full;
        const lastName = parsedLast.full;
        
        const firstNameShort = getDisplayName(parsedFirst, true);
        const middleNameShort = getDisplayName(parsedMiddle, true);
        const lastNameShort = getDisplayName(parsedLast, true);
        
        const middleNameParts = middleName.split(' ').filter(part => part.trim());
        const middleNameShortParts = middleNameShort.split(' ').filter(part => part.trim());
        
        const fullName = `${firstName} ${middleName} ${lastName}`;
        const shortName = `${firstNameShort} ${middleNameShort} ${lastNameShort}`;
        
        const initials = generateInitials(firstName, middleNameParts, lastName);
        const shortInitials = generateInitials(firstNameShort, middleNameShortParts, lastNameShort);
        
        const id = `${firstName}-${middleName.replace(/\s+/g, '-')}-${lastName}`.toLowerCase();
        
        combinations.push({
          firstName,
          middleName,
          lastName,
          fullName,
          initials,
          id,
          firstNameShort,
          middleNameShort,
          lastNameShort,
          shortName,
          shortInitials
        });
      }
    }
  }
  
  return combinations;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function sampleCombinations(combinations: NameCombination[], sampleSize: number): NameCombination[] {
  const shuffled = shuffleArray(combinations);
  const sampled = shuffled.slice(0, sampleSize);
  return sampled.sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export function filterCombinations(combinations: NameCombination[], searchTerm: string): NameCombination[] {
  if (!searchTerm.trim()) {
    return combinations;
  }
  
  const term = searchTerm.toLowerCase();
  return combinations.filter(combination => 
    combination.fullName.toLowerCase().includes(term) ||
    combination.initials.toLowerCase().includes(term) ||
    (combination.shortName && combination.shortName.toLowerCase().includes(term)) ||
    (combination.shortInitials && combination.shortInitials.toLowerCase().includes(term))
  );
}

export function filterDuplicateMiddleLastNames(combinations: NameCombination[]): NameCombination[] {
  return combinations.filter(combination => {
    // Check if any part of the middle name matches the last name
    const middleNameParts = combination.middleName.split(' ').filter(part => part.trim());
    return !middleNameParts.some(part => 
      part.toLowerCase() === combination.lastName.toLowerCase()
    );
  });
}

export function sortCombinations(combinations: NameCombination[], alphabetical: boolean): NameCombination[] {
  if (alphabetical) {
    return [...combinations].sort((a, b) => a.fullName.localeCompare(b.fullName));
  } else {
    return shuffleArray(combinations);
  }
}