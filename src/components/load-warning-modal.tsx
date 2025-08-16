"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface LoadWarningModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LoadWarningModal({ isOpen, onConfirm, onCancel }: LoadWarningModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Load Shared Data
          </DialogTitle>
          <DialogDescription>
            You are about to load shared name combinations from another user.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Beware:</strong> Loading this will remove your current session. If you wish to save your current session, create a share link before loading.
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground">
            This action will replace all your current:
          </p>
          
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>First names, middle names, and last names</li>
            <li>Shortlisted combinations</li>
            <li>Display preferences and settings</li>
          </ul>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Go Back
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Load Shared Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}