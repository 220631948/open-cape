import React from "react";
import { ThreeDMapBackground } from "@/src/components/landing/ThreeDMapBackground";
import { HeroSection } from "@/src/components/landing/HeroSection";
import { FeatureCards } from "@/src/components/landing/FeatureCards";
import { SpatialStorySection } from "@/src/components/landing/SpatialStorySection";
import { WorkflowSection } from "@/src/components/landing/WorkflowSection";
import { CTASection } from "@/src/components/landing/CTASection";
import { FlythroughScrollScene } from "@/src/components/landing/FlythroughScrollScene";

// Lazy load AnalyticsPreview since it uses Recharts
const AnalyticsPreview = React.lazy(() => import("@/src/components/landing/AnalyticsPreview"));

export const LandingPage = () => {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-slate-950 text-white selection:bg-cyan-500/30">
      <ThreeDMapBackground />
      
      <div className="relative z-10">
        <HeroSection />
        <FlythroughScrollScene />
        <FeatureCards />
        <SpatialStorySection />
        
        <React.Suspense fallback={<div className="h-96 flex items-center justify-center p-6"><div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div></div>}>
          <AnalyticsPreview />
        </React.Suspense>
        
        <WorkflowSection />
        <CTASection />
      </div>

      {/* Subtle Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
    </main>
  );
};

