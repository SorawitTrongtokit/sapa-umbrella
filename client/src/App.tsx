/**
 * PCSHSPL Umbrella Borrowing System
 * 
 * Developed by: Sorawit Trongtokit
 * School: Princess Chulabhorn Science High School Phitsanulok (PCSHSPL)
 * 
 * A real-time umbrella management system built with React, Firebase, and PWA technologies.
 * Designed to help students efficiently borrow and return umbrellas across multiple campus locations.
 */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { NetworkStatus } from "@/components/network-status";
import { BottomNavigation } from "@/components/bottom-navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminProtectedRoute } from "@/components/admin-protected-route";
import UmbrellaStatus from "@/pages/umbrella-status";
import BorrowForm from "@/pages/borrow-form";
import ReturnForm from "@/pages/return-form";
import AdminDashboard from "@/pages/admin-dashboard";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function Router() {
  return (
    <>
      <Switch>
        {/* Public routes */}
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        
        {/* Protected routes */}
        <Route path="/">
          <ProtectedRoute>
            <UmbrellaStatus />
          </ProtectedRoute>
        </Route>
        <Route path="/borrow">
          <ProtectedRoute>
            <BorrowForm />
          </ProtectedRoute>
        </Route>
        <Route path="/return">
          <ProtectedRoute>
            <ReturnForm />
          </ProtectedRoute>
        </Route>
        <Route path="/admin">
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
      
      {/* Show bottom navigation on protected pages except admin */}
      <Route path="/admin">
        {() => null}
      </Route>
      <Route path="/login">
        {() => null}
      </Route>
      <Route path="/register">
        {() => null}
      </Route>
      <Route>
        {() => {
          // Don't show bottom navigation if we're on admin pages
          const currentPath = window.location.pathname;
          if (currentPath === '/admin') {
            return null;
          }
          return <BottomNavigation />;
        }}
      </Route>
    </>
  );
}

function App() {
  useEffect(() => {
    // Register Service Worker for PWA (only in production)
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
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
