"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  Search,
  Settings,
  SlidersHorizontal,
  Share,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  NameCombination,
  filterCombinations,
  sampleCombinations,
  filterDuplicateMiddleLastNames,
  sortCombinations,
} from "@/utils/name-combinations";
import { COMBINATION_THRESHOLD, DEFAULT_SAMPLE_SIZE } from "@/consts/app";
import { NameCombinationTable } from "@/components/name-combination-table";

interface NameCombinationDisplayProps {
  combinations: NameCombination[];
  shortlistedCombinations: string[];
  hideDuplicateMiddleLastNames: boolean;
  showAlphabetical: boolean;
  useShortNames: boolean;
  onToggleShortlist: (combinationId: string) => void;
  onToggleHideDuplicates: (hide: boolean) => void;
  onToggleAlphabetical: (alphabetical: boolean) => void;
  onOpenNameManager: () => void;
  onOpenSettings: () => void;
  onOpenShare: () => void;
}

export function NameCombinationDisplay({
  combinations,
  shortlistedCombinations,
  hideDuplicateMiddleLastNames,
  showAlphabetical,
  useShortNames,
  onToggleShortlist,
  onToggleHideDuplicates,
  onToggleAlphabetical,
  onOpenNameManager,
  onOpenSettings,
  onOpenShare,
}: NameCombinationDisplayProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const header = headerRef.current;
      if (!header) return;

      // Get the card and header positions
      const card = header.closest(".space-y-4 > *"); // The card container
      if (!card) return;

      const cardRect = card.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();

      // Calculate how much we've scrolled into the card content
      const cardTop = cardRect.top + currentScrollY;
      const scrolledIntoCard = currentScrollY - cardTop;
      const headerHeight = headerRect.height;

      // Only start hide/show logic when we've scrolled well past the header
      const threshold = headerHeight + 20; // Small buffer to prevent early hiding

      if (scrolledIntoCard > threshold) {
        // We're well past the header - apply hide/show logic
        if (currentScrollY < lastScrollY) {
          // Scrolling up - show header
          setIsHeaderVisible(true);
        } else if (currentScrollY > lastScrollY) {
          // Scrolling down - hide header
          setIsHeaderVisible(false);
        }
      } else {
        // We're not far enough into the card - always show
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMobile]);

  if (combinations.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-4">
            No name combinations to display
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Enter some first names, middle names, and last names above to see
            combinations
          </p>
        </CardContent>
      </Card>
    );
  }

  let processedCombinations = combinations;

  // Apply duplicate filtering if enabled
  if (hideDuplicateMiddleLastNames) {
    processedCombinations = filterDuplicateMiddleLastNames(
      processedCombinations
    );
  }

  // Apply search filtering
  const filteredCombinations = filterCombinations(
    processedCombinations,
    searchTerm
  );

  // Apply sorting
  const sortedCombinations = sortCombinations(
    filteredCombinations,
    showAlphabetical
  );

  const shouldSample =
    sortedCombinations.length > COMBINATION_THRESHOLD && !showAll;
  const displayedCombinations = shouldSample
    ? sampleCombinations(sortedCombinations, DEFAULT_SAMPLE_SIZE)
    : sortedCombinations;

  // Shared header component for mobile
  const MobileHeaderContent = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {sortedCombinations.length}
            {combinations.length !== sortedCombinations.length
              ? ` of ${combinations.length}`
              : ""}{" "}
            names
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onOpenSettings}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button
            onClick={onOpenShare}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Share className="h-4 w-4" />
          </Button>
          <Button
            onClick={onOpenNameManager}
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search combinations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 text-base"
          inputMode="search"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card className={isMobile ? "relative overflow-visible" : ""}>
        <CardHeader>
          <div
            className={`flex ${
              isMobile
                ? "flex-col space-y-3"
                : "flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0"
            }`}
          >
            <CardTitle className="flex items-center gap-2">
              Name Combinations
              {!isMobile && (
                <Badge variant="secondary">
                  {sortedCombinations.length}
                  {combinations.length !== sortedCombinations.length
                    ? ` of ${combinations.length}`
                    : ""}{" "}
                  names
                </Badge>
              )}
            </CardTitle>
            {!isMobile && (
              <div className="flex gap-2">
                <Button
                  onClick={onOpenShare}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  onClick={onOpenSettings}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Settings
                </Button>
                <Button
                  onClick={onOpenNameManager}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Manage Names
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Mobile header that sticks to top of card when scrolling */}
        {isMobile && (
          <div
            ref={headerRef}
            className={`sticky top-0 z-10 bg-white border-b mx-6 mb-6 transition-transform duration-300 ease-out ${
              isHeaderVisible ? "translate-y-0" : "-translate-y-full"
            }`}
          >
            <div className="py-4">
              <MobileHeaderContent />
            </div>
          </div>
        )}

        <CardContent className="space-y-4">
          {!isMobile && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search combinations or initials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                inputMode="search"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>
          )}

          {shouldSample && (
            <Alert>
              <AlertDescription
                className={`flex ${
                  isMobile
                    ? "flex-col gap-3"
                    : "flex-col sm:flex-row sm:items-center sm:justify-between"
                } gap-2`}
              >
                <span>
                  Showing {displayedCombinations.length}{" "}
                  {showAlphabetical ? "alphabetically arranged" : "random"}{" "}
                  combinations out of {sortedCombinations.length} total
                </span>
                <Button
                  onClick={() => setShowAll(true)}
                  variant="outline"
                  size={isMobile ? "default" : "sm"}
                  className={
                    isMobile ? "min-h-[44px] touch-manipulation w-full" : ""
                  }
                >
                  Show All
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {sortedCombinations.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                No combinations match your search
              </p>
            </div>
          ) : (
            <NameCombinationTable
              combinations={displayedCombinations}
              useShortNames={useShortNames}
              headerActionLabel="Shortlist"
              renderAction={(combination) => {
                const isShortlisted = shortlistedCombinations.includes(
                  combination.id
                );

                return (
                  <Button
                    onClick={() => onToggleShortlist(combination.id)}
                    variant={isShortlisted ? "default" : "outline"}
                    size="sm"
                    className="min-h-[44px] min-w-[44px] touch-manipulation"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isShortlisted ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                );
              }}
            />
          )}

          {searchTerm && (
            <div className="text-sm text-muted-foreground">
              Found {sortedCombinations.length} combinations matching &quot;
              {searchTerm}&quot;
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
