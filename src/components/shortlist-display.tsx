"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2 } from "lucide-react";
import { NameCombination } from "@/utils/name-combinations";

interface ShortlistDisplayProps {
  shortlistedCombinations: NameCombination[];
  useShortNames: boolean;
  onRemoveFromShortlist: (combinationId: string) => void;
  onClearShortlist: () => void;
}

export function ShortlistDisplay({
  shortlistedCombinations,
  useShortNames,
  onRemoveFromShortlist,
  onClearShortlist,
}: ShortlistDisplayProps) {
  if (shortlistedCombinations.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Shortlist
            <Badge variant="secondary">0</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">No names shortlisted yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click the heart icon on combinations you like to add them here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-current" />
            Shortlist
            <Badge variant="secondary">{shortlistedCombinations.length}</Badge>
          </CardTitle>
          <Button
            onClick={onClearShortlist}
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <div className="hidden sm:grid grid-cols-4 gap-4 items-center p-3 border rounded-t-lg bg-background hover:bg-muted/50 transition-colors sticky top-0 z-20 shadow-sm border-b">
            <div className="text-sm font-medium text-muted-foreground">
              Legal Name
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Used Name
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Initials
            </div>
            <div className="text-sm font-medium text-muted-foreground text-center">
              Remove
            </div>
          </div>
          <div className="border border-t-0 rounded-b-lg overflow-hidden">
            {shortlistedCombinations.map((combination, index) => {
            const isLast = index === shortlistedCombinations.length - 1;
            
            return (
              <div
                key={combination.id}
                className={`grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center p-3 hover:bg-muted/50 transition-colors ${
                  !isLast ? 'border-b' : ''
                }`}
              >
                {/* Legal Name - always full names */}
                <div className="font-medium text-foreground">
                  <span>{combination.firstName}</span>
                  {combination.middleName && (
                    <span className="text-muted-foreground">
                      {" "}
                      {combination.middleName}
                    </span>
                  )}
                  <span> {combination.lastName}</span>
                </div>
                
                {/* Used Name - depends on user setting (no middle name) */}
                <div className="font-medium text-foreground">
                  {useShortNames ? (
                    <span>{combination.firstNameShort} {combination.lastNameShort}</span>
                  ) : (
                    <span>{combination.firstName} {combination.lastName}</span>
                  )}
                </div>
                
                {/* Initials - based on legal name */}
                <div className="text-foreground font-mono text-sm">
                  {combination.initials}
                </div>
                
                {/* Remove button */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => onRemoveFromShortlist(combination.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
