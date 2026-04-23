import React from 'react';
import { Button } from '@/src/components/ui/Button';
import { Link } from 'react-router';

export const LandingPage = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center -mt-16">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-surface-900 mb-6">
          Cape Town spatial planning,<br/> <span className="text-rose-500">demystified.</span>
        </h1>
        <p className="text-lg md:text-xl text-surface-600 mb-10 max-w-2xl mx-auto">
          A premium, planning-first, map-centric workspace to discover accurate, source‑verifiable property information without the guesswork.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/app/map">Explore the Map</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
