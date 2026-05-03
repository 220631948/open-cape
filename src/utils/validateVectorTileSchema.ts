const REQUIRED_FIELDS = ['parcel_id', 'erf_number', 'municipality', 'zoning'];

export interface SchemaValidationResult {
  isValid: boolean;
  missingFields: string[];
}

export function validateVectorTileSchema(features: any[]): SchemaValidationResult {
  if (!features || features.length === 0) {
    return { isValid: false, missingFields: REQUIRED_FIELDS };
  }

  const missingFields = new Set<string>(REQUIRED_FIELDS);
  const sampleSize = Math.min(features.length, 5);

  for (let i = 0; i < sampleSize; i++) {
    const props = features[i].properties || {};
    
    // Some sources might use different casing
    const lowercaseProps = Object.keys(props).reduce((acc: any, key) => {
      acc[key.toLowerCase()] = props[key];
      return acc;
    }, {});

    for (const field of Array.from(missingFields)) {
      if (lowercaseProps[field] !== undefined || lowercaseProps[field.replace('_', '')] !== undefined) {
        missingFields.delete(field);
      }
    }
    
    if (missingFields.size === 0) break;
  }

  return {
    isValid: missingFields.size === 0,
    missingFields: Array.from(missingFields)
  };
}
