"use client";

import { useState, useMemo, useEffect } from "react";
import { NameCombinationDisplay } from "@/components/name-combination-display";
import { ShortlistDisplay } from "@/components/shortlist-display";
import { NameManagerModal } from "@/components/name-manager-modal";
import { SettingsModal } from "@/components/settings-modal";
import { ShareModal } from "@/components/share-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  generateCombinations,
  filterDuplicateMiddleLastNames,
  NameCombination,
} from "@/utils/name-combinations";
import { DEFAULT_STATE, STORAGE_KEY, type AppState } from "@/consts/app";

export default function HomePage() {
  const [appState, setAppState, isLoadingState] = useLocalStorage<AppState>(
    STORAGE_KEY,
    DEFAULT_STATE
  );
  const [isNameManagerOpen, setIsNameManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Mark as initialized after first render to avoid SSR/client mismatch
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Auto-open name manager modal when no names are present
  useEffect(() => {
    if (!isInitialized) return;
    
    const hasAnyNames = 
      appState.firstNames.length > 0 || 
      appState.middleNames.length > 0 || 
      appState.lastNames.length > 0;
    
    if (!hasAnyNames && !isNameManagerOpen) {
      setIsNameManagerOpen(true);
    }
  }, [isInitialized, appState.firstNames.length, appState.middleNames.length, appState.lastNames.length, isNameManagerOpen]);

  const combinations = useMemo(() => {
    if (
      appState.firstNames.length === 0 ||
      appState.middleNames.length === 0 ||
      appState.lastNames.length === 0
    ) {
      return [];
    }
    return generateCombinations(
      appState.firstNames,
      appState.middleNames,
      appState.lastNames
    );
  }, [appState.firstNames, appState.middleNames, appState.lastNames]);

  const filteredCombinations = useMemo(() => {
    let processed = combinations;
    if (appState.hideDuplicateMiddleLastNames) {
      processed = filterDuplicateMiddleLastNames(processed);
    }
    return processed;
  }, [combinations, appState.hideDuplicateMiddleLastNames]);

  const shortlistedCombinations = useMemo(() => {
    return combinations.filter((combination) =>
      appState.shortlistedCombinations.includes(combination.id)
    );
  }, [combinations, appState.shortlistedCombinations]);

  const handleNamesUpdate = (
    firstNames: string[],
    middleNames: string[],
    lastNames: string[]
  ) => {
    setAppState((prev) => ({
      ...prev,
      firstNames,
      middleNames,
      lastNames,
      shortlistedCombinations: prev.shortlistedCombinations.filter((id) => {
        const newCombinations = generateCombinations(
          firstNames,
          middleNames,
          lastNames
        );
        return newCombinations.some((combo) => combo.id === id);
      }),
    }));
  };

  const handleToggleShortlist = (combinationId: string) => {
    setAppState((prev) => ({
      ...prev,
      shortlistedCombinations: prev.shortlistedCombinations.includes(
        combinationId
      )
        ? prev.shortlistedCombinations.filter((id) => id !== combinationId)
        : [...prev.shortlistedCombinations, combinationId],
    }));
  };

  const handleRemoveFromShortlist = (combinationId: string) => {
    setAppState((prev) => ({
      ...prev,
      shortlistedCombinations: prev.shortlistedCombinations.filter(
        (id) => id !== combinationId
      ),
    }));
  };

  const handleClearShortlist = () => {
    setAppState((prev) => ({
      ...prev,
      shortlistedCombinations: [],
    }));
  };

  // Don't render until after hydration to prevent SSR mismatch
  if (!isInitialized || isLoadingState) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Baby Name Tester
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore different combinations of first names, middle names, and last
            names to find the perfect name for your baby.
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Baby Name Tester
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore different combinations of first names, middle names, and last
          names to find the perfect name for your baby.
        </p>
      </div>

      <Tabs defaultValue="combinations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="combinations">
            All Combinations ({filteredCombinations.length}
            {combinations.length !== filteredCombinations.length
              ? ` of ${combinations.length}`
              : ""}
            )
          </TabsTrigger>
          <TabsTrigger value="shortlist">
            Shortlist ({shortlistedCombinations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="combinations" className="mt-6">
          <NameCombinationDisplay
            combinations={combinations}
            shortlistedCombinations={appState.shortlistedCombinations}
            hideDuplicateMiddleLastNames={appState.hideDuplicateMiddleLastNames}
            showAlphabetical={appState.showAlphabetical}
            useShortNames={appState.useShortNames}
            onToggleShortlist={handleToggleShortlist}
            onToggleHideDuplicates={(hide) =>
              setAppState((prev) => ({
                ...prev,
                hideDuplicateMiddleLastNames: hide,
              }))
            }
            onToggleAlphabetical={(alphabetical) =>
              setAppState((prev) => ({
                ...prev,
                showAlphabetical: alphabetical,
              }))
            }
            onOpenNameManager={() => setIsNameManagerOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenShare={() => setIsShareOpen(true)}
          />
        </TabsContent>

        <TabsContent value="shortlist" className="mt-6">
          <ShortlistDisplay
            shortlistedCombinations={shortlistedCombinations}
            useShortNames={appState.useShortNames}
            onRemoveFromShortlist={handleRemoveFromShortlist}
            onClearShortlist={handleClearShortlist}
          />
        </TabsContent>
      </Tabs>

      <NameManagerModal
        isOpen={isNameManagerOpen}
        onClose={() => setIsNameManagerOpen(false)}
        firstNames={appState.firstNames}
        middleNames={appState.middleNames}
        lastNames={appState.lastNames}
        onNamesUpdate={handleNamesUpdate}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        hideDuplicateMiddleLastNames={appState.hideDuplicateMiddleLastNames}
        showAlphabetical={appState.showAlphabetical}
        useShortNames={appState.useShortNames}
        onToggleHideDuplicates={(hide) =>
          setAppState((prev) => ({
            ...prev,
            hideDuplicateMiddleLastNames: hide,
          }))
        }
        onToggleAlphabetical={(alphabetical) =>
          setAppState((prev) => ({ ...prev, showAlphabetical: alphabetical }))
        }
        onToggleUseShortNames={(useShort) =>
          setAppState((prev) => ({ ...prev, useShortNames: useShort }))
        }
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        appState={appState}
      />
    </div>
  );
}
