import { useState, useCallback } from 'react';
import { validateVectorTileSchema, SchemaValidationResult } from '../utils/validateVectorTileSchema';

export function useVectorSchemaValidation() {
  const [validationResult, setValidationResult] = useState<SchemaValidationResult | null>(null);

  const validate = useCallback((features: any[]) => {
    const result = validateVectorTileSchema(features);
    setValidationResult(result);
    return result;
  }, []);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return { validationResult, validate, clearValidation };
}
