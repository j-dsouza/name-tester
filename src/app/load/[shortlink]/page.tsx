"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { LoadWarningModal } from "@/components/load-warning-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Home } from "lucide-react";
import { AppState, STORAGE_KEY } from "@/consts/app";
import { useRetryWithWarmup } from "@/hooks/use-retry-with-warmup";

interface LoadedData {
  data: AppState;
  createdAt: string;
  accessCount: number;
}

export default function LoadSharedPage() {
  const router = useRouter();
  const params = useParams();
  const shortlink = params.shortlink as string;
  
  const [loadedData, setLoadedData] = useState<LoadedData | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const { isLoading, isWarmingUp, retryCount, error, execute, reset } = useRetryWithWarmup();
  const maxRetries = 3;

  useEffect(() => {
    if (!shortlink) {
      return;
    }

    const fetchSharedData = async () => {
      try {
        const data = await execute(() => fetch(`/api/load/${shortlink}`));
        
        setLoadedData(data);
        setShowWarning(true);
      } catch (err) {
        // All errors are handled by the hook
        console.error('Error fetching shared data:', err);
      }
    };

    fetchSharedData();
  }, [shortlink, execute]);

  const handleConfirmLoad = () => {
    if (!loadedData) return;

    try {
      // Save the loaded data to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedData.data));
      
      // Navigate to home page which will pick up the new data
      router.push('/');
    } catch (err) {
      console.error('Error saving data to localStorage:', err);
      setError("Failed to save shared data to your session.");
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                {isWarmingUp ? (
                  retryCount === 0 ? 'Warming up database...' : `Retrying connection... (${retryCount}/${maxRetries})`
                ) : (
                  'Loading shared data...'
                )}
              </p>
              
              {isWarmingUp && (
                <Alert>
                  <AlertDescription className="text-center">
                    {retryCount === 0 ? (
                      <>
                        The database is starting up. This may take up to 30 seconds.
                        <br />
                        <span className="text-sm text-muted-foreground">
                          Please wait while we load your shared name combinations...
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!shortlink || error) {
    const errorMessage = !shortlink 
      ? "Invalid shortlink" 
      : error === "Resource not found" 
        ? "This shared link does not exist or has expired."
        : error;
        
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Error Loading Shared Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            
            <Button onClick={() => router.push('/')} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Shared Name Combinations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadedData && (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>First names:</strong> {loadedData.data.firstNames.length} names
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Middle names:</strong> {loadedData.data.middleNames.length} names
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Last names:</strong> {loadedData.data.lastNames.length} names
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Shortlisted:</strong> {loadedData.data.shortlistedCombinations.length} combinations
                  </p>
                </div>
                
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <p>Created: {new Date(loadedData.createdAt).toLocaleDateString()}</p>
                  <p>Viewed {loadedData.accessCount} times</p>
                </div>
              </>
            )}

            <div className="flex space-x-2 pt-4">
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setShowWarning(true)} className="flex-1">
                Load Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <LoadWarningModal
        isOpen={showWarning}
        onConfirm={handleConfirmLoad}
        onCancel={() => setShowWarning(false)}
      />
    </>
  );
}