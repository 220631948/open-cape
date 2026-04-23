import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/Card';

export const SourcesPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Source Catalog</h1>
        <p className="text-surface-600 text-lg">
          We believe in complete data transparency. Every map layer and data point points back to its source.
        </p>
      </div>

      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Data Source Placeholder {i}</CardTitle>
              <CardDescription>Source URL and retrieval date will appear here.</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="mt-8 p-4 bg-surface-100 rounded-lg text-surface-600 text-center text-sm">
        No real data ingested yet. The catalog is in placeholder mode.
      </div>
    </div>
  );
};
