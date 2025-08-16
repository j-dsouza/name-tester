"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2 } from "lucide-react";
import { NameCombination } from "@/utils/name-combinations";

interface ShortlistDisplayProps {
  shortlistedCombinations: NameCombination[];
  nameDisplayMode: "full" | "short" | "both";
  onRemoveFromShortlist: (combinationId: string) => void;
  onClearShortlist: () => void;
}

export function ShortlistDisplay({
  shortlistedCombinations,
  nameDisplayMode,
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
            <Badge variant="outline">0</Badge>
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
            <Badge variant="outline">{shortlistedCombinations.length}</Badge>
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
        <div className="space-y-2">
          <div className="hidden sm:flex items-center justify-between p-3 border-b bg-muted/20">
            <div
              className={`flex-1 grid gap-4 ${
                nameDisplayMode === "both" ? "grid-cols-4" : "grid-cols-3"
              }`}
            >
              <div className="text-sm font-semibold text-muted-foreground">
                {nameDisplayMode === "short" ? "Short Name" : "Legal Name"}
              </div>
              {nameDisplayMode === "both" && (
                <div className="text-sm font-semibold text-muted-foreground">
                  Short Name
                </div>
              )}
              <div className="text-sm font-semibold text-muted-foreground">
                First & Last
              </div>
              <div className="text-sm font-semibold text-muted-foreground">
                Initials
              </div>
            </div>
            <div className="w-16 text-sm font-semibold text-muted-foreground text-center">
              Remove
            </div>
          </div>
          {shortlistedCombinations.map((combination) => (
            <div
              key={combination.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-accent/20"
            >
              <div
                className={`flex-1 grid gap-2 sm:gap-4 ${
                  nameDisplayMode === "both"
                    ? "grid-cols-1 sm:grid-cols-4"
                    : "grid-cols-1 sm:grid-cols-3"
                }`}
              >
                <div className="font-medium">
                  {nameDisplayMode === "short" ? (
                    // Show short names
                    <>
                      <span>{combination.firstNameShort}</span>
                      {combination.middleNameShort && (
                        <span className="text-muted-foreground">
                          {" "}
                          {combination.middleNameShort}
                        </span>
                      )}
                      <span> {combination.lastNameShort}</span>
                    </>
                  ) : (
                    // Show full names
                    <>
                      <span>{combination.firstName}</span>
                      {combination.middleName && (
                        <span className="text-muted-foreground">
                          {" "}
                          {combination.middleName}
                        </span>
                      )}
                      <span> {combination.lastName}</span>
                    </>
                  )}
                </div>
                {nameDisplayMode === "both" && (
                  <div className="font-medium text-sm">
                    <span>{combination.firstNameShort}</span>
                    {combination.middleNameShort && (
                      <span className="text-muted-foreground">
                        {" "}
                        {combination.middleNameShort}
                      </span>
                    )}
                    <span> {combination.lastNameShort}</span>
                  </div>
                )}
                <div className="font-medium text-sm">
                  {nameDisplayMode === "short"
                    ? `${combination.firstNameShort} ${combination.lastNameShort}`
                    : `${combination.firstName} ${combination.lastName}`}
                </div>
                <div className="text-muted-foreground font-mono text-sm">
                  {nameDisplayMode === "short"
                    ? combination.shortInitials
                    : combination.initials}
                </div>
              </div>
              <Button
                onClick={() => onRemoveFromShortlist(combination.id)}
                variant="ghost"
                size="sm"
                className="ml-4 text-destructive hover:text-destructive"
              >
                <Heart className="h-4 w-4 fill-current" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
