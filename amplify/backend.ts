import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource'; // ← Importación correcta

export const backend = defineBackend({
  auth,
  data,
  storage, // ← Incluir storage
});