"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { NameCombination } from "@/utils/name-combinations";

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
  return (
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
          {headerActionLabel}
        </div>
      </div>
      <div className="border border-t-0 rounded-b-lg overflow-hidden">
        {combinations.map((combination, index) => {
          const isLast = index === combinations.length - 1;
          
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