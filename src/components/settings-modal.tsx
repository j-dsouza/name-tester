"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hideDuplicateMiddleLastNames: boolean;
  showAlphabetical: boolean;
  nameDisplayMode: 'full' | 'short' | 'both';
  onToggleHideDuplicates: (hide: boolean) => void;
  onToggleAlphabetical: (alphabetical: boolean) => void;
  onNameDisplayModeChange: (mode: 'full' | 'short' | 'both') => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  hideDuplicateMiddleLastNames,
  showAlphabetical,
  nameDisplayMode,
  onToggleHideDuplicates,
  onToggleAlphabetical,
  onNameDisplayModeChange
}: SettingsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Display Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Filtering Options</h4>
              <div className="flex items-center justify-between">
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
                />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-3">Display Options</h4>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-normal mb-2 block">
                    Name display mode
                  </Label>
                  <Select value={nameDisplayMode} onValueChange={onNameDisplayModeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full names only</SelectItem>
                      <SelectItem value="short">Short/nicknames only</SelectItem>
                      <SelectItem value="both">Both (separate columns)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {nameDisplayMode === 'full' && 'Show only full legal names'}
                    {nameDisplayMode === 'short' && 'Show only nicknames/short names'}
                    {nameDisplayMode === 'both' && 'Show both full and short names in separate columns'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
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
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}