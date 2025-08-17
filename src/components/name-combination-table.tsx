"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { NameCombination } from "@/utils/name-combinations";
import { useIsMobile } from "@/hooks/use-mobile";

interface NameCombinationTableProps {
  combinations: NameCombination[];
  useShortNames: boolean;
  headerActionLabel: string;
  renderAction: (combination: NameCombination, index: number) => ReactNode;
}

export function NameCombinationTable({
  combinations,
  useShortNames,
  headerActionLabel,
  renderAction,
}: NameCombinationTableProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    // Mobile: Card-based layout
    return (
      <div className="space-y-3">
        {combinations.map((combination, index) => (
          <Card key={combination.id} className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* Legal Name - prominent display */}
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Legal Name
                    </div>
                    <div className="font-medium text-lg leading-tight">
                      <span>{combination.firstName}</span>
                      {combination.middleName && (
                        <span className="text-muted-foreground">
                          {" "}
                          {combination.middleName}
                        </span>
                      )}
                      <span> {combination.lastName}</span>
                    </div>
                  </div>
                  
                  {/* Used Name and Initials row */}
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Used Name
                      </div>
                      <div className="font-medium">
                        {useShortNames ? (
                          <span>{combination.firstNameShort} {combination.lastNameShort}</span>
                        ) : (
                          <span>{combination.firstName} {combination.lastName}</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Initials
                      </div>
                      <div className="font-mono text-sm font-medium">
                        {combination.initials}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action button - larger touch target */}
                <div className="flex-shrink-0">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 text-center">
                    {headerActionLabel}
                  </div>
                  <div className="flex justify-center">
                    {renderAction(combination, index)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop: Table layout (unchanged)
  return (
    <div>
      <div className="grid grid-cols-4 gap-4 items-center p-3 border rounded-t-lg bg-background hover:bg-muted/50 transition-colors sticky top-0 z-20 shadow-sm border-b">
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
          {headerActionLabel}
        </div>
      </div>
      <div className="border border-t-0 rounded-b-lg overflow-hidden">
        {combinations.map((combination, index) => {
          const isLast = index === combinations.length - 1;
          
          return (
            <div
              key={combination.id}
              className={`grid grid-cols-4 gap-4 items-center p-3 hover:bg-muted/50 transition-colors ${
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
              
              {/* Action column */}
              <div className="flex justify-center">
                {renderAction(combination, index)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}