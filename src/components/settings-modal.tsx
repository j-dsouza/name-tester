"use client";

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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hideDuplicateMiddleLastNames: boolean;
  showAlphabetical: boolean;
  useShortNames: boolean;
  onToggleHideDuplicates: (hide: boolean) => void;
  onToggleAlphabetical: (alphabetical: boolean) => void;
  onToggleUseShortNames: (useShort: boolean) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  hideDuplicateMiddleLastNames,
  showAlphabetical,
  useShortNames,
  onToggleHideDuplicates,
  onToggleAlphabetical,
  onToggleUseShortNames
}: SettingsModalProps) {
  const isMobile = useIsMobile();

  const content = (
    <>
      <div className="space-y-6 py-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Filtering Options</h4>
            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
              <div className="space-y-1">
                <Label htmlFor="hide-duplicates-modal" className="text-sm font-normal">
                  Hide duplicate middle/last names
                </Label>
                <p className="text-xs text-muted-foreground">
                  Remove combinations where middle name equals last name
                </p>
              </div>
              <Switch
                id="hide-duplicates-modal"
                checked={hideDuplicateMiddleLastNames}
                onCheckedChange={onToggleHideDuplicates}
                className={isMobile ? 'self-start' : ''}
              />
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="text-sm font-medium mb-3">Display Options</h4>
            <div className="space-y-4">
              <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
                <div className="space-y-1">
                  <Label htmlFor="use-short-names-modal" className="text-sm font-normal">
                    Use short names for &quot;Used Name&quot;
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {useShortNames ? 'Show nicknames/short names in &quot;Used Name&quot; column' : 'Show full names in &quot;Used Name&quot; column'}
                  </p>
                </div>
                <Switch
                  id="use-short-names-modal"
                  checked={useShortNames}
                  onCheckedChange={onToggleUseShortNames}
                  className={isMobile ? 'self-start' : ''}
                />
              </div>
              
              <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
                <div className="space-y-1">
                  <Label htmlFor="alphabetical-modal" className="text-sm font-normal">
                    Alphabetical order
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {showAlphabetical ? 'Show names A-Z' : 'Show names in random order'}
                  </p>
                </div>
                <Switch
                  id="alphabetical-modal"
                  checked={showAlphabetical}
                  onCheckedChange={onToggleAlphabetical}
                  className={isMobile ? 'self-start' : ''}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={onClose}
          className={isMobile ? 'min-h-[44px] touch-manipulation w-full' : ''}
        >
          Done
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-fit max-h-[80vh]">
          <SheetHeader>
            <SheetTitle>Display Settings</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Display Settings</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}