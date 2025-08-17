"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, Share, Loader2 } from "lucide-react";
import { AppState } from "@/consts/app";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRetryWithWarmup } from "@/hooks/use-retry-with-warmup";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
}

export function ShareModal({ isOpen, onClose, appState }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { isLoading, isWarmingUp, retryCount, error, execute, reset } = useRetryWithWarmup();
  const maxRetries = 3;

  const handleCreateLink = async () => {
    try {
      const data = await execute(() => 
        fetch('/api/share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(appState),
        })
      );
      
      setShareUrl(data.url);
    } catch (err) {
      // Error is already handled by the hook
      console.error('Error creating share link:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Baby Name Combinations',
          text: 'Check out these baby name combinations I created!',
          url: shareUrl,
        });
        toast({
          title: "Shared!",
          description: "The link has been shared successfully.",
        });
      } catch (err) {
        // User cancelled sharing or error occurred
        if ((err as Error).name !== 'AbortError') {
          console.error('Failed to share:', err);
          handleCopyToClipboard();
        }
      }
    } else {
      handleCopyToClipboard();
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast({
        title: "Link copied!",
        description: "The share link has been copied to your clipboard.",
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard. Please copy manually.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setShareUrl("");
    setIsCopied(false);
    reset();
    onClose();
  };

  const content = (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Create a shareable link to share your name lists and shortlisted combinations with others.
      </p>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!shareUrl ? (
        <div className="space-y-3">
          <Button
            onClick={handleCreateLink}
            disabled={isLoading}
            className={`w-full ${isMobile ? 'min-h-[44px] touch-manipulation' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isWarmingUp ? (
                  retryCount === 0 ? 'Warming up database...' : `Retrying... (${retryCount}/${maxRetries})`
                ) : (
                  'Creating Link...'
                )}
              </>
            ) : (
              <>
                <Share className="mr-2 h-4 w-4" />
                Create Share Link
              </>
            )}
          </Button>
          
          {isLoading && isWarmingUp && (
            <Alert>
              <AlertDescription className="text-center">
                {retryCount === 0 ? (
                  <>
                    The database is starting up. This may take up to 30 seconds.
                    <br />
                    <span className="text-sm text-muted-foreground">
                      Please wait while we prepare your shareable link...
                    </span>
                  </>
                ) : (
                  <>
                    Database is taking longer than expected to start.
                    <br />
                    <span className="text-sm text-muted-foreground">
                      Attempt {retryCount} of {maxRetries} - retrying automatically...
                    </span>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className={`flex ${isMobile ? 'flex-col gap-2' : 'space-x-2'}`}>
            <Input
              value={shareUrl}
              readOnly
              className={`flex-1 ${isMobile ? 'text-sm' : ''}`}
            />
            <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
              {isMobile && navigator.share && (
                <Button
                  onClick={handleNativeShare}
                  className="flex-1 min-h-[44px] touch-manipulation"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
              <Button
                size={isMobile ? "default" : "sm"}
                onClick={handleCopyToClipboard}
                variant={isCopied ? "default" : "outline"}
                className={`${isMobile ? 'flex-1 min-h-[44px] touch-manipulation' : ''}`}
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    {isMobile && <span className="ml-2">Copied!</span>}
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    {isMobile && <span className="ml-2">Copy</span>}
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <Alert>
            <AlertDescription>
              Share this link with others to let them view your name combinations and shortlist.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={handleClose}
          className={isMobile ? 'w-full min-h-[44px] touch-manipulation' : ''}
        >
          Close
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent side="bottom" className="h-fit max-h-[80vh]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Share className="h-5 w-5" />
              Share Your Name Combinations
            </SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Share Your Name Combinations
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}