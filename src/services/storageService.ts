import { createInitialDatabase } from '../data/colombiaCatalog';
import { FitLocalDatabase } from '../types/fitlocal';
import { validateBackupJson } from '../utils/calculations';

const STORAGE_KEY = 'fitlocal_colombia_db_v1';

export interface IFitLocalRepository {
  load(): FitLocalDatabase;
  save(db: FitLocalDatabase): void;
  resetToFactory(includeDemo: boolean): FitLocalDatabase;
}

/**
 * Implementación local persistente en navegador con validación de esquema.
 */
export class LocalStorageRepository implements IFitLocalRepository {
  load(): FitLocalDatabase {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = createInitialDatabase();
        this.save(initial);
        return initial;
      }
      const parsed = JSON.parse(raw);
      const validation = validateBackupJson(parsed);
      if (!validation.valid) {
        const fallback = createInitialDatabase();
        this.save(fallback);
        return fallback;
      }
      return parsed as FitLocalDatabase;
    } catch {
      return createInitialDatabase();
    }
  }

  save(db: FitLocalDatabase): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (err) {
      console.error('Error guardando en LocalStorage:', err);
    }
  }

  resetToFactory(includeDemo: boolean): FitLocalDatabase {
    const fresh = createInitialDatabase();
    if (!includeDemo) {
      fresh.hasDemoData = false;
      fresh.mealLogs = [];
      fresh.workoutSessions = [];
      fresh.cardioLogs = [];
      fresh.wellnessLogs = [];
      fresh.expenses = [];
    }
    this.save(fresh);
    return fresh;
  }
}

/**
 * Adaptador preparado para migración futura a Supabase (PostgreSQL + RLS).
 * Para activarlo en una fase posterior, se inyecta el cliente de Supabase
 * sincronizando las colecciones del usuario autenticado (`auth.uid()`).
 */
export class SupabaseReadyAdapter {
  static getMigrationGuide(): string {
    return 'Capa de datos desacoplada mediante IFitLocalRepository. Lista para conectar con @supabase/supabase-js usando Row Level Security (user_id = auth.uid()).';
  }
}

export const storageRepository = new LocalStorageRepository();