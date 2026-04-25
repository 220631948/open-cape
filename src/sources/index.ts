import { MapSourceContract } from '../contracts/MapSourceContract';
import { OpenAerialMapSource, NasaGibsSource } from './AerialSources';
import { SaDeedsSource, Property24Source } from './DataSources';
import { CctErfBoundariesSource, CctZoningSource } from './CctSources';
import { EnvironmentalNdviSource } from './EnvironmentalSources';

export const ALL_SOURCES: MapSourceContract[] = [
  OpenAerialMapSource,
  NasaGibsSource,
  SaDeedsSource,
  Property24Source,
  CctErfBoundariesSource,
  CctZoningSource,
  EnvironmentalNdviSource
];

export function getSourceById(id: string): MapSourceContract | undefined {
  return ALL_SOURCES.find(s => s.id === id);
}

export function getSourcesByCategory(category: string): MapSourceContract[] {
  return ALL_SOURCES.filter(s => s.category === category);
}
