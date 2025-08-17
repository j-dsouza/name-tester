export const COMBINATION_THRESHOLD = 200;
export const DEFAULT_SAMPLE_SIZE = 200;
export const STORAGE_KEY = "name-tester-data";

export const DEFAULT_STATE = {
  firstNames: [] as string[],
  middleNames: [] as string[],
  lastNames: [] as string[],
  shortlistedCombinations: [] as string[],
  hideDuplicateMiddleLastNames: false,
  showAlphabetical: true,
  useShortNames: false,
};

export type AppState = typeof DEFAULT_STATE;
