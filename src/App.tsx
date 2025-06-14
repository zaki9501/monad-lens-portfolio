
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Lending from "./pages/Lending";
import TxVisualizer from "./pages/TxVisualizer";
import BlockVisualizer from "./pages/BlockVisualizer";
import NotFound from "./pages/NotFound";
import { PrivyProvider } from "@privy-io/react-auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PrivyProvider appId="cmbi1huc7000rl10lp4av8plp">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lending" element={<Lending />} />
            <Route path="/tx-visualizer" element={<TxVisualizer />} />
            <Route path="/block-visualizer" element={<BlockVisualizer />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PrivyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
