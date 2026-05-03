import { useSearchParams } from 'react-router';
import { useCallback } from 'react';

export interface MapFilters {
  locations: string[];
  priceMin: number | null;
  priceMax: number | null;
  propertyTypes: string[];
  bedrooms: string | null;
  features: string[];
  listingStatus: string;
}

export function useMapFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getFilters = useCallback((): MapFilters => {
    return {
      locations: searchParams.getAll('location'),
      priceMin: searchParams.has('priceMin') ? Number(searchParams.get('priceMin')) : null,
      priceMax: searchParams.has('priceMax') ? Number(searchParams.get('priceMax')) : null,
      propertyTypes: searchParams.getAll('type'),
      bedrooms: searchParams.get('bedrooms') || null,
      features: searchParams.getAll('feature'),
      listingStatus: searchParams.get('status') || 'All',
    };
  }, [searchParams]);

  const setFilters = useCallback((filters: Partial<MapFilters>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      
      if ('locations' in filters && filters.locations) {
        next.delete('location');
        filters.locations.forEach(loc => next.append('location', loc));
      }
      
      if ('priceMin' in filters) {
        if (filters.priceMin === null || isNaN(filters.priceMin)) next.delete('priceMin');
        else next.set('priceMin', filters.priceMin.toString());
      }
      
      if ('priceMax' in filters) {
        if (filters.priceMax === null || isNaN(filters.priceMax)) next.delete('priceMax');
        else next.set('priceMax', filters.priceMax.toString());
      }
      
      if ('propertyTypes' in filters && filters.propertyTypes) {
        next.delete('type');
        filters.propertyTypes.forEach(t => next.append('type', t));
      }
      
      if ('bedrooms' in filters) {
        if (!filters.bedrooms) next.delete('bedrooms');
        else next.set('bedrooms', filters.bedrooms);
      }
      
      if ('features' in filters && filters.features) {
        next.delete('feature');
        filters.features.forEach(f => next.append('feature', f));
      }
      
      if ('listingStatus' in filters) {
        if (!filters.listingStatus || filters.listingStatus === 'All') next.delete('status');
        else next.set('status', filters.listingStatus);
      }

      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const activeCount = Array.from(searchParams.keys()).filter(k => k !== 'view').length;

  return {
    filters: getFilters(),
    setFilters,
    clearFilters,
    activeCount,
  };
}
