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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseNames, parseNamesWithNicknames, getNicknameVariants, countCombinations } from "@/utils/name-combinations";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

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
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [mobileAlertOpen, setMobileAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const isMobile = useIsMobile();
  const { toast } = useToast();

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

  // Check if requirements are met for suggestion buttons
  const canSuggestFirst = () => {
    const currentMiddleNames = parseNames(middleNamesInput);
    const currentLastNames = parseNames(lastNamesInput);
    return currentMiddleNames.length > 0 && currentLastNames.length > 0;
  };

  const canSuggestMiddle = () => {
    const currentFirstNames = parseNames(firstNamesInput);
    const currentLastNames = parseNames(lastNamesInput);
    return currentFirstNames.length > 0 && currentLastNames.length > 0;
  };

  const canSuggestLast = () => {
    const currentFirstNames = parseNames(firstNamesInput);
    const currentMiddleNames = parseNames(middleNamesInput);
    return currentFirstNames.length > 0 && currentMiddleNames.length > 0;
  };

  // Get tooltip/alert messages for disabled buttons
  const getDisabledMessage = (nameType: 'first' | 'middle' | 'last'): string => {
    switch (nameType) {
      case 'first':
        return 'Add at least one middle name and one last name to suggest first names';
      case 'middle':
        return 'Add at least one first name and one last name to suggest middle names';
      case 'last':
        return 'Add at least one first name and one middle name to suggest last names';
    }
  };

  // Handle suggestion API call
  const handleSuggestNames = async (nameType: 'first' | 'middle' | 'last') => {
    // Check if enabled
    const canSuggest = nameType === 'first' ? canSuggestFirst() : 
                      nameType === 'middle' ? canSuggestMiddle() : 
                      canSuggestLast();
    
    if (!canSuggest) {
      const message = getDisabledMessage(nameType);
      if (isMobile) {
        setAlertMessage(message);
        setMobileAlertOpen(true);
      }
      return;
    }

    setLoadingStates(prev => ({ ...prev, [nameType]: true }));

    try {
      const existingNames = {
        firstNames: parseNames(firstNamesInput),
        middleNames: parseNames(middleNamesInput),
        lastNames: parseNames(lastNamesInput)
      };

      const response = await fetch('/api/suggest-names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameType,
          existingNames
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get suggestions');
      }

      // Append suggestions to the appropriate textarea
      const suggestions = data.suggestions || [];
      if (suggestions.length > 0) {
        const suggestionsText = suggestions.join('\n');
        
        switch (nameType) {
          case 'first':
            setFirstNamesInput(prev => 
              prev.trim() ? `${prev}\n${suggestionsText}` : suggestionsText
            );
            break;
          case 'middle':
            setMiddleNamesInput(prev => 
              prev.trim() ? `${prev}\n${suggestionsText}` : suggestionsText
            );
            break;
          case 'last':
            setLastNamesInput(prev => 
              prev.trim() ? `${prev}\n${suggestionsText}` : suggestionsText
            );
            break;
        }

        toast({
          title: 'Suggestions added!',
          description: `Added ${suggestions.length} ${nameType} name suggestions.`,
        });
      } else {
        toast({
          title: 'No suggestions',
          description: 'Unable to generate suggestions. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [nameType]: false }));
    }
  };

  // Render suggestion button with conditional tooltip
  const renderSuggestButton = (nameType: 'first' | 'middle' | 'last') => {
    const canSuggest = nameType === 'first' ? canSuggestFirst() : 
                      nameType === 'middle' ? canSuggestMiddle() : 
                      canSuggestLast();
    const isLoading = loadingStates[nameType];
    const disabledMessage = getDisabledMessage(nameType);

    const button = (
      <Button
        onClick={() => handleSuggestNames(nameType)}
        disabled={!canSuggest || isLoading}
        variant="outline"
        size="sm"
        className={`${isMobile ? 'min-h-[36px] touch-manipulation' : ''} flex items-center gap-1`}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3" />
        )}
        {isLoading ? 'Suggesting...' : 'Suggest Names'}
      </Button>
    );

    // On desktop, wrap with tooltip if disabled
    if (!isMobile && !canSuggest) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {button}
            </TooltipTrigger>
            <TooltipContent>
              <p>{disabledMessage}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  };

  // Form content that will be shared between Dialog and Sheet
  const formContent = (
    <>
      <div className="flex-1 overflow-auto px-1">
        <div className="space-y-6">
          <div className={`grid grid-cols-1 ${isMobile ? 'gap-6' : 'md:grid-cols-3'} gap-4`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="first-names-modal">First Names</Label>
                {renderSuggestButton('first')}
              </div>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="middle-names-modal">Middle Names</Label>
                {renderSuggestButton('middle')}
              </div>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="last-names-modal">Last Names</Label>
                {renderSuggestButton('last')}
              </div>
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
      <>
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent side="bottom" className="h-[90vh] flex flex-col">
            <SheetHeader>
              <SheetTitle>Manage Names</SheetTitle>
            </SheetHeader>
            {formContent}
          </SheetContent>
        </Sheet>
        
        <AlertDialog open={mobileAlertOpen} onOpenChange={setMobileAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cannot Suggest Names</AlertDialogTitle>
              <AlertDialogDescription>
                {alertMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setMobileAlertOpen(false)}>
                Got it
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
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