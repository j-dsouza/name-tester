"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseNames } from "@/utils/name-combinations";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Names</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="first" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="first">
                First Names ({parseNames(firstNamesInput).length})
              </TabsTrigger>
              <TabsTrigger value="middle">
                Middle Names ({parseNames(middleNamesInput).length})
              </TabsTrigger>
              <TabsTrigger value="last">
                Last Names ({parseNames(lastNamesInput).length})
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 mt-4 overflow-hidden">
              <TabsContent value="first" className="h-full space-y-2 mt-0">
                <Label htmlFor="first-names-modal">First Names</Label>
                <Textarea
                  id="first-names-modal"
                  placeholder="Enter first names, one per line..."
                  value={firstNamesInput}
                  onChange={(e) => setFirstNamesInput(e.target.value)}
                  className="h-80 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {parseNames(firstNamesInput).length} names entered
                </p>
              </TabsContent>
              
              <TabsContent value="middle" className="h-full space-y-2 mt-0">
                <Label htmlFor="middle-names-modal">Middle Names</Label>
                <Textarea
                  id="middle-names-modal"
                  placeholder="Enter middle names, one per line...&#10;(You can use multiple words for compound middle names)"
                  value={middleNamesInput}
                  onChange={(e) => setMiddleNamesInput(e.target.value)}
                  className="h-80 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {parseNames(middleNamesInput).length} names entered
                </p>
              </TabsContent>
              
              <TabsContent value="last" className="h-full space-y-2 mt-0">
                <Label htmlFor="last-names-modal">Last Names</Label>
                <Textarea
                  id="last-names-modal"
                  placeholder="Enter last names, one per line..."
                  value={lastNamesInput}
                  onChange={(e) => setLastNamesInput(e.target.value)}
                  className="h-80 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {parseNames(lastNamesInput).length} names entered
                </p>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Total combinations: {' '}
              <span className="font-medium">
                {parseNames(firstNamesInput).length * 
                 parseNames(middleNamesInput).length * 
                 parseNames(lastNamesInput).length}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleClearAll} variant="outline">
              Clear All
            </Button>
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}