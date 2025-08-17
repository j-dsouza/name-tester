"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2 } from "lucide-react";
import { NameCombination } from "@/utils/name-combinations";
import { NameCombinationTable } from "@/components/name-combination-table";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-current" />
            Shortlist
            <Badge variant="secondary">{shortlistedCombinations.length}</Badge>
          </CardTitle>
          <Button
            onClick={onClearShortlist}
            variant="outline"
            size={isMobile ? "default" : "sm"}
            className={`text-destructive hover:text-destructive ${isMobile ? 'min-h-[44px] touch-manipulation' : ''}`}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <NameCombinationTable
          combinations={shortlistedCombinations}
          useShortNames={useShortNames}
          headerActionLabel="Remove"
          renderAction={(combination) => (
            <Button
              onClick={() => onRemoveFromShortlist(combination.id)}
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive min-h-[44px] min-w-[44px] touch-manipulation"
            >
              <Heart className="h-5 w-5 fill-current" />
            </Button>
          )}
        />
      </CardContent>
    </Card>
  );
}
