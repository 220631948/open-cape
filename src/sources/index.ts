import { MapSourceContract } from '../contracts/MapSourceContract';
import { OpenAerialMapSource, NasaGibsSource } from './AerialSources';
import { SaDeedsSource, Property24Source } from './DataSources';
import { CctErfBoundariesSource, CctZoningSource } from './CctSources';
import { EnvironmentalNdviSource } from './EnvironmentalSources';
import { WcgpCadastreSource, WcgpZoningSource, WcgpTopoSource, WcgpAerialSource, WcgpAdminBoundariesSource, OsmGeofabrikSaSource } from './WcgpSources';
import { FloodRiskSource, ComplianceRiskSource } from './RiskSources';

export const ALL_SOURCES: MapSourceContract[] = [
  OpenAerialMapSource,
  NasaGibsSource,
  SaDeedsSource,
  Property24Source,
  CctErfBoundariesSource,
  CctZoningSource,
  EnvironmentalNdviSource,
  WcgpCadastreSource,
  WcgpZoningSource,
  WcgpTopoSource,
  WcgpAerialSource,
  WcgpAdminBoundariesSource,
  OsmGeofabrikSaSource,
  FloodRiskSource,
  ComplianceRiskSource
];

export function getSourceById(id: string): MapSourceContract | undefined {
  return ALL_SOURCES.find(s => s.id === id);
}

export function getSourcesByCategory(category: string): MapSourceContract[] {
  return ALL_SOURCES.filter(s => s.category === category);
}
