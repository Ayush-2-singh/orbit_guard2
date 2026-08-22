import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EscalationProvider } from "@/contexts/EscalationContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CapabilitiesPage from "@/pages/capabilities";
import DashboardPage from "@/pages/dashboard";
import ContactPage from "@/pages/contact";
import NotFound from "@/pages/not-found";

function Home() {
  return (
    <main className="relative min-h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
      <Navbar />
      <HeroSection />
    </main>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/capabilities" component={CapabilitiesPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/contact" component={ContactPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <EscalationProvider>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </EscalationProvider>
  );
}

export default App;
