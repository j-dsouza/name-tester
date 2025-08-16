"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Search, Settings, SlidersHorizontal } from "lucide-react";
import { NameCombination, filterCombinations, sampleCombinations, filterDuplicateMiddleLastNames, sortCombinations } from "@/utils/name-combinations";
import { COMBINATION_THRESHOLD, DEFAULT_SAMPLE_SIZE } from "@/consts/app";

interface NameCombinationDisplayProps {
  combinations: NameCombination[];
  shortlistedCombinations: string[];
  hideDuplicateMiddleLastNames: boolean;
  showAlphabetical: boolean;
  nameDisplayMode: 'full' | 'short' | 'both';
  onToggleShortlist: (combinationId: string) => void;
  onToggleHideDuplicates: (hide: boolean) => void;
  onToggleAlphabetical: (alphabetical: boolean) => void;
  onOpenNameManager: () => void;
  onOpenSettings: () => void;
}

export function NameCombinationDisplay({
  combinations,
  shortlistedCombinations,
  hideDuplicateMiddleLastNames,
  showAlphabetical,
  nameDisplayMode,
  onToggleShortlist,
  onToggleHideDuplicates,
  onToggleAlphabetical,
  onOpenNameManager,
  onOpenSettings
}: NameCombinationDisplayProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);

  if (combinations.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground mb-4">No name combinations to display</p>
          <p className="text-sm text-muted-foreground text-center">
            Enter some first names, middle names, and last names above to see combinations
          </p>
        </CardContent>
      </Card>
    );
  }

  let processedCombinations = combinations;
  
  // Apply duplicate filtering if enabled
  if (hideDuplicateMiddleLastNames) {
    processedCombinations = filterDuplicateMiddleLastNames(processedCombinations);
  }
  
  // Apply search filtering
  const filteredCombinations = filterCombinations(processedCombinations, searchTerm);
  
  // Apply sorting
  const sortedCombinations = sortCombinations(filteredCombinations, showAlphabetical);
  
  const shouldSample = sortedCombinations.length > COMBINATION_THRESHOLD && !showAll;
  const displayedCombinations = shouldSample 
    ? sampleCombinations(sortedCombinations, DEFAULT_SAMPLE_SIZE)
    : sortedCombinations;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <CardTitle className="flex items-center gap-2">
              Name Combinations
              <Badge variant="outline">
                {sortedCombinations.length}{combinations.length !== sortedCombinations.length ? ` of ${combinations.length}` : ''} total
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
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
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search combinations or initials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {shouldSample && (
            <Alert>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span>
                  Showing {displayedCombinations.length} {showAlphabetical ? 'alphabetically arranged' : 'random'} combinations out of {sortedCombinations.length} total
                </span>
                <Button
                  onClick={() => setShowAll(true)}
                  variant="outline"
                  size="sm"
                >
                  Show All
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {sortedCombinations.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No combinations match your search</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className={`hidden sm:flex items-center justify-between p-3 border-b bg-muted/20`}>
                <div className={`flex-1 grid gap-4 ${
                  nameDisplayMode === 'both' ? 'grid-cols-4' : 'grid-cols-3'
                }`}>
                  <div className="text-sm font-semibold text-muted-foreground">
                    {nameDisplayMode === 'short' ? 'Short Name' : 'Full Name'}
                  </div>
                  {nameDisplayMode === 'both' && (
                    <div className="text-sm font-semibold text-muted-foreground">Short Name</div>
                  )}
                  <div className="text-sm font-semibold text-muted-foreground">First & Last</div>
                  <div className="text-sm font-semibold text-muted-foreground">Initials</div>
                </div>
                <div className="w-16 text-sm font-semibold text-muted-foreground text-center">
                  Shortlist
                </div>
              </div>
              {displayedCombinations.map((combination) => {
                const isShortlisted = shortlistedCombinations.includes(combination.id);
                
                return (
                  <div
                    key={combination.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className={`flex-1 grid gap-2 sm:gap-4 ${
                      nameDisplayMode === 'both' 
                        ? 'grid-cols-1 sm:grid-cols-4' 
                        : 'grid-cols-1 sm:grid-cols-3'
                    }`}>
                      <div className="font-medium">
                        {nameDisplayMode === 'short' ? (
                          // Show short names
                          <>
                            <span>{combination.firstNameShort}</span>
                            {combination.middleNameShort && (
                              <span className="text-muted-foreground"> {combination.middleNameShort}</span>
                            )}
                            <span> {combination.lastNameShort}</span>
                          </>
                        ) : (
                          // Show full names
                          <>
                            <span>{combination.firstName}</span>
                            {combination.middleName && (
                              <span className="text-muted-foreground"> {combination.middleName}</span>
                            )}
                            <span> {combination.lastName}</span>
                          </>
                        )}
                      </div>
                      {nameDisplayMode === 'both' && (
                        <div className="font-medium text-sm">
                          <span>{combination.firstNameShort}</span>
                          {combination.middleNameShort && (
                            <span className="text-muted-foreground"> {combination.middleNameShort}</span>
                          )}
                          <span> {combination.lastNameShort}</span>
                        </div>
                      )}
                      <div className="font-medium text-sm">
                        {nameDisplayMode === 'short' 
                          ? `${combination.firstNameShort} ${combination.lastNameShort}`
                          : `${combination.firstName} ${combination.lastName}`
                        }
                      </div>
                      <div className="text-muted-foreground font-mono text-sm">
                        {nameDisplayMode === 'short' ? combination.shortInitials : combination.initials}
                      </div>
                    </div>
                    <Button
                      onClick={() => onToggleShortlist(combination.id)}
                      variant={isShortlisted ? "default" : "outline"}
                      size="sm"
                      className="ml-4"
                    >
                      <Heart 
                        className={`h-4 w-4 ${isShortlisted ? 'fill-current' : ''}`} 
                      />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {searchTerm && (
            <div className="text-sm text-muted-foreground">
              Found {sortedCombinations.length} combinations matching &quot;{searchTerm}&quot;
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}