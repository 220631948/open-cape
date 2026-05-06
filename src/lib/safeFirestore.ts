/* eslint-disable no-restricted-imports */
import { 
  setDoc as fsSetDoc, 
  addDoc as fsAddDoc, 
  updateDoc as fsUpdateDoc,
  DocumentReference,
  CollectionReference,
  WithFieldValue,
  SetOptions,
  UpdateData
} from 'firebase/firestore';
/* eslint-enable no-restricted-imports */
import { sanitizeForFirestore } from './firestoreUtils';

export const setDoc = async <T extends import('firebase/firestore').DocumentData>(
  reference: DocumentReference<T>,
  data: WithFieldValue<T>,
  options?: SetOptions
): Promise<void> => {
  const sanitizedData = sanitizeForFirestore(data);
  if (options) {
    return fsSetDoc(reference, sanitizedData as any, options);
  }
  return fsSetDoc(reference, sanitizedData as any);
};

export const addDoc = async <T extends import('firebase/firestore').DocumentData>(
  reference: CollectionReference<T>,
  data: WithFieldValue<T>
): Promise<DocumentReference<T>> => {
  const sanitizedData = sanitizeForFirestore(data);
  return fsAddDoc(reference, sanitizedData as any);
};

export const updateDoc = async <T extends import('firebase/firestore').DocumentData>(
  reference: DocumentReference<T>,
  data: UpdateData<T>
): Promise<void> => {
  const sanitizedData = sanitizeForFirestore(data);
  return fsUpdateDoc(reference, sanitizedData);
};
