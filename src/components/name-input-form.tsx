"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { parseNames, parseNamesWithNicknames, getNicknameVariants, countCombinations } from "@/utils/name-combinations";

interface NameInputFormProps {
  firstNames: string[];
  middleNames: string[];
  lastNames: string[];
  onNamesUpdate: (firstNames: string[], middleNames: string[], lastNames: string[]) => void;
}

export function NameInputForm({ 
  firstNames, 
  middleNames, 
  lastNames, 
  onNamesUpdate 
}: NameInputFormProps) {
  const [firstNamesInput, setFirstNamesInput] = useState(firstNames.join('\n'));
  const [middleNamesInput, setMiddleNamesInput] = useState(middleNames.join('\n'));
  const [lastNamesInput, setLastNamesInput] = useState(lastNames.join('\n'));
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleUpdate = () => {
    const parsedFirstNames = parseNames(firstNamesInput);
    const parsedMiddleNames = parseNames(middleNamesInput);
    const parsedLastNames = parseNames(lastNamesInput);
    
    onNamesUpdate(parsedFirstNames, parsedMiddleNames, parsedLastNames);
  };

  const handleReset = () => {
    setFirstNamesInput('');
    setMiddleNamesInput('');
    setLastNamesInput('');
    onNamesUpdate([], [], []);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Enter Names</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-names">First Names</Label>
            <Textarea
              id="first-names"
              placeholder="Enter first names, one per line...&#10;Example: Thomas (Tom)&#10;Elizabeth (Liz, Beth)"
              value={firstNamesInput}
              onChange={(e) => setFirstNamesInput(e.target.value)}
              className="min-h-32 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {isClient ? `${parseNamesWithNicknames(firstNamesInput).reduce((total, parsed) => total + getNicknameVariants(parsed).length, 0)} names • ` : ''}Use (nickname) syntax for short names
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="middle-names">Middle Names</Label>
            <Textarea
              id="middle-names"
              placeholder="Enter middle names, one per line...&#10;Example: Alexander (Alex)&#10;Marie"
              value={middleNamesInput}
              onChange={(e) => setMiddleNamesInput(e.target.value)}
              className="min-h-32 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {isClient ? `${parseNamesWithNicknames(middleNamesInput).reduce((total, parsed) => total + getNicknameVariants(parsed).length, 0)} names • ` : ''}Use (nickname) syntax for short names
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last-names">Last Names</Label>
            <Textarea
              id="last-names"
              placeholder="Enter last names, one per line...&#10;Example: Johnson&#10;Smith"
              value={lastNamesInput}
              onChange={(e) => setLastNamesInput(e.target.value)}
              className="min-h-32 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {isClient ? `${parseNamesWithNicknames(lastNamesInput).reduce((total, parsed) => total + getNicknameVariants(parsed).length, 0)} names` : 'Enter last names above'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleUpdate} className="flex-1">
            Update Combinations
          </Button>
          <Button onClick={handleReset} variant="outline">
            Clear All
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>
            Total possible combinations: {' '}
            <span className="font-medium">
              {isClient ? countCombinations(firstNamesInput, middleNamesInput, lastNamesInput) : '0'}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}