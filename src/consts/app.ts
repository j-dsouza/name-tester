export const COMBINATION_THRESHOLD = 50;
export const DEFAULT_SAMPLE_SIZE = 30;
export const STORAGE_KEY = 'name-tester-data';

export const DEFAULT_STATE = {
  firstNames: [] as string[],
  middleNames: [] as string[],
  lastNames: [] as string[],
  shortlistedCombinations: [] as string[],
  hideDuplicateMiddleLastNames: false,
  showAlphabetical: true,
  nameDisplayMode: 'both' as 'full' | 'short' | 'both',
};

export type AppState = typeof DEFAULT_STATE;