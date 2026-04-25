import React from 'react';
import { Button } from '@/src/components/ui/Button';
import { Link } from 'react-router';
import { Map, Layers, Search, MapPin, ChevronRight, ShieldCheck } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface-50 pt-16 pb-32 border-b border-surface-200">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-multiply"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/50 border border-rose-200 text-rose-800 text-xs font-semibold mb-8 tracking-wide cursor-default shadow-sm">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            SOME VERIFIED SOURCES ARE NOW LIVE. OTHER DATASETS ARE STILL PENDING.
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-surface-900 mb-6 max-w-4xl leading-[1.1]">
            The Mother City’s property intelligence, <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-primary-600">secure and verified.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-surface-600 mb-10 max-w-2xl leading-relaxed">
            A private, map-centric workspace to discover accurate, source‑verifiable spatial and cadastral data across the Cape. Provenance-first data, private workspaces, and role-gated features for professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
            <Button size="lg" asChild className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-95 transition-all">
              <Link to="/app/map">
                Explore the Map <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto h-12 px-8 text-base bg-white hover:bg-surface-50 active:scale-95 transition-all">
              <Link to="/sign-in">Sign In</Link>
            </Button>
          </div>
          
          <div className="mt-16 relative w-full max-w-5xl mx-auto perspective-[1200px]">
            <div className="relative rounded-2xl overflow-hidden border border-surface-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] bg-surface-100 aspect-video flex items-center justify-center transform hover:scale-[1.01] transition-transform duration-700">
              {/* High-Quality Map/UI Image Background */}
              <div className="absolute inset-0 z-0">
                <img 
                   src="https://images.unsplash.com/photo-1542223616-959bc24ebf95?auto=format&fit=crop&q=80&w=1600" 
                   alt="Modern map dashboard" 
                   className="w-full h-full object-cover opacity-90 saturate-50"
                />
                <div className="absolute inset-0 bg-surface-900/40 mix-blend-multiply"></div>
              </div>
              
              {/* UI Overlay Placeholders to hint at the app's capability */}
              <div className="relative z-10 w-full h-full p-6 md:p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className="h-12 w-48 bg-white/95 backdrop-blur-md rounded-lg shadow-sm border border-surface-200 p-3 hidden sm:block">
                      <div className="h-2 w-32 bg-surface-200 rounded animate-pulse mb-2"></div>
                      <div className="h-1.5 w-24 bg-surface-100 rounded animate-pulse"></div>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-surface-200 text-xs font-semibold text-surface-700 ml-auto transition-transform hover:scale-105">
                     <ShieldCheck className="w-4 h-4 text-emerald-500" /> Authorized Source
                   </div>
                </div>
                
                <div className="flex justify-end">
                   <div className="h-40 w-48 md:w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-surface-200 p-4 space-y-3 transform translate-y-4 sm:translate-y-0">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-rose-500"></div>
                        <div className="h-2.5 w-20 bg-surface-200 rounded"></div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <div className="h-2 w-full bg-surface-100 rounded"></div>
                        <div className="h-2 w-5/6 bg-surface-100 rounded"></div>
                        <div className="h-2 w-4/6 bg-surface-100 rounded"></div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="px-6 py-3 bg-white/95 backdrop-blur-md rounded-full shadow-xl border border-surface-200 text-sm font-medium text-surface-900 flex items-center gap-2 transform translate-y-12">
                    <MapPin className="h-4 w-4 text-rose-500 animate-bounce" />
                    City of Cape Town Spatial Data
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-surface-900 mb-4">Built for spatial professionals</h2>
            <p className="text-lg text-surface-600">We aggregate strictly verified public datasets from the City of Cape Town into a seamless canvas, ensuring every element is auditable.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="flex flex-col group">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-6 shadow-sm group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
                 <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-surface-900 mb-3 leading-snug">Source-Verifiable Data</h3>
              <p className="text-surface-600 leading-relaxed">Every dataset supports provenance tracking. We never fabricate identifiers, zoning rights, or values. If a value isn't on the official scheme, we tell you.</p>
            </div>
            
            <div className="flex flex-col group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                 <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-surface-900 mb-3 leading-snug">Cadastral Deep Search</h3>
              <p className="text-surface-600 leading-relaxed">Interrogate the city through powerful cadastral queries. Locate planning districts, specific ERFs, or active development zones instantly using the latest records.</p>
            </div>
            
            <div className="flex flex-col group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                 <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-surface-900 mb-3 leading-snug">Private & Role-Gated</h3>
              <p className="text-surface-600 leading-relaxed">Save interactive map states and draw secure annotations privately. Advanced predictive models and OSINT verification tools are restricted strictly to verified analyst roles.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

