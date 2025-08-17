"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseNames, parseNamesWithNicknames, getNicknameVariants, countCombinations } from "@/utils/name-combinations";
import { useIsMobile } from "@/hooks/use-mobile";

interface NameManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  firstNames: string[];
  middleNames: string[];
  lastNames: string[];
  onNamesUpdate: (firstNames: string[], middleNames: string[], lastNames: string[]) => void;
}

export function NameManagerModal({
  isOpen,
  onClose,
  firstNames,
  middleNames,
  lastNames,
  onNamesUpdate
}: NameManagerModalProps) {
  const [firstNamesInput, setFirstNamesInput] = useState(firstNames.join('\n'));
  const [middleNamesInput, setMiddleNamesInput] = useState(middleNames.join('\n'));
  const [lastNamesInput, setLastNamesInput] = useState(lastNames.join('\n'));
  const [isClient, setIsClient] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSave = () => {
    const parsedFirstNames = parseNames(firstNamesInput);
    const parsedMiddleNames = parseNames(middleNamesInput);
    const parsedLastNames = parseNames(lastNamesInput);
    
    onNamesUpdate(parsedFirstNames, parsedMiddleNames, parsedLastNames);
    onClose();
  };

  const handleCancel = () => {
    setFirstNamesInput(firstNames.join('\n'));
    setMiddleNamesInput(middleNames.join('\n'));
    setLastNamesInput(lastNames.join('\n'));
    onClose();
  };

  const handleClearAll = () => {
    setFirstNamesInput('');
    setMiddleNamesInput('');
    setLastNamesInput('');
  };

  // Form content that will be shared between Dialog and Sheet
  const formContent = (
    <>
      <div className="flex-1 overflow-auto px-1">
        <div className="space-y-6">
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-6' : 'md:grid-cols-3'} gap-4`}>
            <div className="space-y-2">
              <Label htmlFor="first-names-modal">First Names</Label>
              <Textarea
                id="first-names-modal"
                placeholder="Enter first names, one per line...&#10;Example: Thomas (Tom)&#10;Elizabeth (Liz, Beth)"
                value={firstNamesInput}
                onChange={(e) => setFirstNamesInput(e.target.value)}
                className={`${isMobile ? 'min-h-32' : 'min-h-48'} resize-none`}
              />
              <p className="text-xs text-muted-foreground">
                {isClient ? `${parseNamesWithNicknames(firstNamesInput).reduce((total, parsed) => total + getNicknameVariants(parsed).length, 0)} names • ` : ''}Use (nickname) syntax for short names
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="middle-names-modal">Middle Names</Label>
              <Textarea
                id="middle-names-modal"
                placeholder="Enter middle names, one per line...&#10;Example: Alexander (Alex)&#10;Marie"
                value={middleNamesInput}
                onChange={(e) => setMiddleNamesInput(e.target.value)}
                className={`${isMobile ? 'min-h-32' : 'min-h-48'} resize-none`}
              />
              <p className="text-xs text-muted-foreground">
                {isClient ? `${parseNamesWithNicknames(middleNamesInput).reduce((total, parsed) => total + getNicknameVariants(parsed).length, 0)} names • ` : ''}Use (nickname) syntax for short names
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last-names-modal">Last Names</Label>
              <Textarea
                id="last-names-modal"
                placeholder="Enter last names, one per line...&#10;Example: Johnson&#10;Smith"
                value={lastNamesInput}
                onChange={(e) => setLastNamesInput(e.target.value)}
                className={`${isMobile ? 'min-h-32' : 'min-h-48'} resize-none`}
              />
              <p className="text-xs text-muted-foreground">
                {isClient ? `${parseNamesWithNicknames(lastNamesInput).reduce((total, parsed) => total + getNicknameVariants(parsed).length, 0)} names` : 'Enter last names above'}
              </p>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>
              Total possible combinations: {' '}
              <span className="font-medium">
                {isClient ? countCombinations(firstNamesInput, middleNamesInput, lastNamesInput) : '0'}
              </span>
            </p>
          </div>
        </div>
      </div>
      
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-2 pt-4 border-t justify-end`}>
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-2`}>
          <Button 
            onClick={handleClearAll} 
            variant="outline"
            className={isMobile ? 'min-h-[44px] touch-manipulation' : ''}
          >
            Clear All
          </Button>
          <Button 
            onClick={handleCancel} 
            variant="outline"
            className={isMobile ? 'min-h-[44px] touch-manipulation' : ''}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className={`${isMobile ? 'min-h-[44px] touch-manipulation' : 'flex-1 sm:flex-none'}`}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] flex flex-col">
          <SheetHeader>
            <SheetTitle>Manage Names</SheetTitle>
          </SheetHeader>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Names</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}