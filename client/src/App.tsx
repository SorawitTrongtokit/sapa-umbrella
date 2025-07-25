import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { NetworkStatus } from "@/components/network-status";
import { BottomNavigation } from "@/components/bottom-navigation";
import UmbrellaStatus from "@/pages/umbrella-status";
import BorrowForm from "@/pages/borrow-form";
import ReturnForm from "@/pages/return-form";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={UmbrellaStatus} />
        <Route path="/borrow" component={BorrowForm} />
        <Route path="/return" component={ReturnForm} />
        <Route path="/admin" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
      
      {/* Show bottom navigation on all pages except admin */}
      <Route path="/admin">
        {() => null}
      </Route>
      <Route>
        {() => <BottomNavigation />}
      </Route>
    </>
  );
}

function App() {
  useEffect(() => {
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Add manifest link if not exists
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (!existingManifest) {
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/manifest.json';
      document.head.appendChild(manifestLink);
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-gray-50">
            <NetworkStatus />
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
