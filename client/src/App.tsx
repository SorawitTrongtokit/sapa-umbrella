import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNavigation } from "@/components/bottom-navigation";
import UmbrellaStatus from "@/pages/umbrella-status";
import BorrowForm from "@/pages/borrow-form";
import ReturnForm from "@/pages/return-form";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
