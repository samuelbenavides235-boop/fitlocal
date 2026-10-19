import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  DailyWellnessLog,
  ExpenseLog,
  FitLocalDatabase,
  FoodItem,
  MealLog,
  Recipe,
  RunCardioLog,
  ShoppingListItem,
  UserProfile,
  WeeklyPlanItem,
  WorkoutRoutine,
  WorkoutSession
} from '../types/fitlocal';
import { storageRepository } from '../services/storageService';
import { supabase } from '../services/supabaseClient';
import {
  buildConsolidatedShoppingList,
  validateBackupJson
} from '../utils/calculations';

interface FitLocalContextValue {
  db: FitLocalDatabase;
  userEmail: string | null;
  cloudSyncStatus: 'local' | 'syncing' | 'synced';
  signOutUser: () => Promise<void>;
  toastMessage: string | null;
  notify: (msg: string) => void;
  updateProfile: (profile: UserProfile) => void;
  addOrUpdateFood: (food: FoodItem) => void;
  addOrUpdateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  addMealLog: (log: MealLog) => void;
  deleteMealLog: (id: string) => void;
  addOrUpdatePlanItem: (item: WeeklyPlanItem) => void;
  togglePlanItemComplete: (id: string) => void;
  deletePlanItem: (id: string) => void;
  generateAutomaticWeekPlan: () => void;
  regenerateShoppingListFromPlan: () => void;
  updateShoppingList: (items: ShoppingListItem[]) => void;
  saveCurrentShoppingListSnapshot: (name: string) => void;
  applyCheaperSwapInShoppingList: (itemId: string) => void;
  addOrUpdateRoutine: (routine: WorkoutRoutine) => void;
  deleteRoutine: (id: string) => void;
  addWorkoutSession: (session: WorkoutSession) => void;
  deleteWorkoutSession: (id: string) => void;
  addCardioLog: (log: RunCardioLog) => void;
  deleteCardioLog: (id: string) => void;
  upsertWellnessLog: (log: DailyWellnessLog) => void;
  toggleHabitConfig: (id: string) => void;
  addCustomHabit: (label: string) => void;
  addExpense: (expense: ExpenseLog) => void;
  deleteExpense: (id: string) => void;
  clearDemoData: () => void;
  resetAllData: (includeDemo: boolean) => void;
  importDatabaseJson: (rawJson: string) => { ok: boolean; message: string };
}

const FitLocalContext = createContext<FitLocalContextValue | undefined>(undefined);

export const FitLocalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<FitLocalDatabase>(() => storageRepository.load());
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'local' | 'syncing' | 'synced'>('local');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isInitialCloudLoad = useRef(false);

  const notify = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  useEffect(() => {
    if (!supabase) return;

    const loadUserSession = async () => {
      const { data } = await supabase!.auth.getSession();
      const sessionUser = data.session?.user;
      if (sessionUser) {
        setUserId(sessionUser.id);
        setUserEmail(sessionUser.email || null);
        await fetchCloudDatabase(sessionUser.id, sessionUser.email || '');
      }
    };

    loadUserSession();

    const { data: listener } = supabase!.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user;
      if (sessionUser) {
        setUserId(sessionUser.id);
        setUserEmail(sessionUser.email || null);
        await fetchCloudDatabase(sessionUser.id, sessionUser.email || '');
      } else {
        setUserId(null);
        setUserEmail(null);
        setCloudSyncStatus('local');
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchCloudDatabase = async (uid: string, email: string) => {
    if (!supabase) return;
    setCloudSyncStatus('syncing');
    isInitialCloudLoad.current = true;

    const { data, error } = await supabase!
      .from('fitlocal_user_data')
      .select('db_data')
      .eq('user_id', uid)
      .maybeSingle();

    if (!error && data?.db_data) {
      const remoteDb = data.db_data as FitLocalDatabase;
      setDb(remoteDb);
      storageRepository.save(remoteDb);
      setCloudSyncStatus('synced');
    } else {
      const currentLocal = storageRepository.load();
      await supabase!.from('fitlocal_user_data').upsert({
        user_id: uid,
        email,
        db_data: currentLocal,
        updated_at: new Date().toISOString()
      });
      setCloudSyncStatus('synced');
    }

    window.setTimeout(() => {
      isInitialCloudLoad.current = false;
    }, 400);
  };

  useEffect(() => {
    storageRepository.save(db);

    if (!supabase || !userId || isInitialCloudLoad.current) return;

    setCloudSyncStatus('syncing');
    const timer = window.setTimeout(async () => {
      await supabase!.from('fitlocal_user_data').upsert({
        user_id: userId,
        email: userEmail,
        db_data: db,
        updated_at: new Date().toISOString()
      });
      setCloudSyncStatus('synced');
    }, 600);

    return () => window.clearTimeout(timer);
  }, [db, userId, userEmail]);

  const signOutUser = async () => {
    if (supabase) {
      await supabase!.auth.signOut();
    }
    setUserId(null);
    setUserEmail(null);
    notify('Sesión cerrada correctamente.');
  };

  const updateProfile = (profile: UserProfile) => {
    setDb((prev) => ({ ...prev, profile }));
    notify('Perfil y objetivos guardados en tu cuenta.');
  };

  const addOrUpdateFood = (food: FoodItem) => {
    setDb((prev) => {
      const exists = prev.foods.some((f) => f.id === food.id);
      const foods = exists
        ? prev.foods.map((f) => (f.id === food.id ? food : f))
        : [food, ...prev.foods];
      return { ...prev, foods };
    });
    notify(`Alimento "${food.name}" guardado.`);
  };

  const addOrUpdateRecipe = (recipe: Recipe) => {
    setDb((prev) => {
      const exists = prev.recipes.some((r) => r.id === recipe.id);
      const recipes = exists
        ? prev.recipes.map((r) => (r.id === recipe.id ? recipe : r))
        : [recipe, ...prev.recipes];
      return { ...prev, recipes };
    });
    notify(`Receta "${recipe.name}" guardada.`);
  };

  const deleteRecipe = (id: string) => {
    setDb((prev) => ({
      ...prev,
      recipes: prev.recipes.filter((r) => r.id !== id)
    }));
    notify('Receta eliminada.');
  };

  const addMealLog = (log: MealLog) => {
    setDb((prev) => ({
      ...prev,
      mealLogs: [log, ...prev.mealLogs]
    }));
    notify(`Comida "${log.title}" registrada.`);
  };

  const deleteMealLog = (id: string) => {
    setDb((prev) => ({
      ...prev,
      mealLogs: prev.mealLogs.filter((m) => m.id !== id)
    }));
    notify('Registro de comida eliminado.');
  };

  const addOrUpdatePlanItem = (item: WeeklyPlanItem) => {
    setDb((prev) => {
      const exists = prev.weeklyPlan.some((p) => p.id === item.id);
      const weeklyPlan = exists
        ? prev.weeklyPlan.map((p) => (p.id === item.id ? item : p))
        : [...prev.weeklyPlan, item];
      return { ...prev, weeklyPlan };
    });
    notify('Actividad actualizada en el planificador.');
  };

  const togglePlanItemComplete = (id: string) => {
    setDb((prev) => ({
      ...prev,
      weeklyPlan: prev.weeklyPlan.map((p) =>
        p.id === id ? { ...p, completed: !p.completed } : p
      )
    }));
  };

  const deletePlanItem = (id: string) => {
    setDb((prev) => ({
      ...prev,
      weeklyPlan: prev.weeklyPlan.filter((p) => p.id !== id)
    }));
    notify('Elemento eliminado del planificador.');
  };

  const generateAutomaticWeekPlan = () => {
    const days: WeeklyPlanItem['day'][] = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo'
    ];
    const breakfast = db.recipes.find((r) => r.slot === 'Desayuno') || db.recipes[0];
    const lunch = db.recipes.find((r) => r.slot === 'Almuerzo') || db.recipes[1] || db.recipes[0];
    const dinner = db.recipes.find((r) => r.slot === 'Cena') || db.recipes[2] || db.recipes[0];

    const generated: WeeklyPlanItem[] = [];
    days.forEach((day, idx) => {
      if (breakfast) {
        generated.push({
          id: `auto-bf-${idx}-${Date.now()}`,
          day,
          time: '07:30',
          type: 'meal',
          title: breakfast.name,
          recipeId: breakfast.id,
          durationMinutes: 20,
          completed: false
        });
      }
      if (lunch) {
        generated.push({
          id: `auto-lu-${idx}-${Date.now()}`,
          day,
          time: '13:00',
          type: 'meal',
          title: lunch.name,
          recipeId: lunch.id,
          durationMinutes: 30,
          completed: false
        });
      }
      if (dinner) {
        generated.push({
          id: `auto-di-${idx}-${Date.now()}`,
          day,
          time: '19:30',
          type: 'meal',
          title: dinner.name,
          recipeId: dinner.id,
          durationMinutes: 25,
          completed: false
        });
      }

      if (idx < db.profile.availableDaysPerWeek && db.routines.length > 0) {
        const routine = db.routines[idx % db.routines.length];
        generated.push({
          id: `auto-gym-${idx}-${Date.now()}`,
          day,
          time: '17:30',
          type: 'gym',
          title: routine.name,
          routineId: routine.id,
          durationMinutes: routine.estimatedDurationMin,
          completed: false
        });
      } else if (idx === 5) {
        generated.push({
          id: `auto-run-${idx}-${Date.now()}`,
          day,
          time: '07:00',
          type: 'running',
          title: 'Sesión de Running Aeróbico',
          durationMinutes: 35,
          completed: false
        });
      } else if (idx === 6) {
        generated.push({
          id: `auto-rest-${idx}-${Date.now()}`,
          day,
          time: '10:00',
          type: 'rest',
          title: 'Descanso Activo y Movilidad',
          durationMinutes: 30,
          completed: false
        });
      }
    });

    setDb((prev) => ({ ...prev, weeklyPlan: generated }));
    notify('Semana generada según tus objetivos.');
  };

  const regenerateShoppingListFromPlan = () => {
    setDb((prev) => {
      const consolidated = buildConsolidatedShoppingList(
        prev.weeklyPlan,
        prev.recipes,
        prev.foods,
        prev.shoppingList
      );
      return { ...prev, shoppingList: consolidated };
    });
    notify('Lista de compras consolidada.');
  };

  const updateShoppingList = (items: ShoppingListItem[]) => {
    setDb((prev) => ({ ...prev, shoppingList: items }));
  };

  const saveCurrentShoppingListSnapshot = (name: string) => {
    const totalCOP = db.shoppingList.reduce((acc, i) => acc + i.estimatedCostCOP, 0);
    setDb((prev) => ({
      ...prev,
      savedShoppingLists: [
        {
          id: `saved-list-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          name: name.trim() || 'Mercado Semanal',
          totalCOP,
          itemsCount: prev.shoppingList.length
        },
        ...prev.savedShoppingLists
      ]
    }));
    notify('Lista guardada en el historial.');
  };

  const applyCheaperSwapInShoppingList = (itemId: string) => {
    setDb((prev) => {
      const item = prev.shoppingList.find((i) => i.id === itemId);
      if (!item || !item.foodId) return prev;
      const currentFood = prev.foods.find((f) => f.id === item.foodId);
      if (!currentFood || !currentFood.cheaperAlternativeId) return prev;
      const altFood = prev.foods.find((f) => f.id === currentFood.cheaperAlternativeId);
      if (!altFood) return prev;

      const unitWeight = Math.max(1, altFood.unitWeightGrams || 1000);
      const unitsCount = Math.max(1, Math.ceil(item.totalGramsNeeded / unitWeight));
      const newCost = Math.round(unitsCount * altFood.estimatedPricePerKgOrUnitCOP);

      const updated = prev.shoppingList.map((i) =>
        i.id === itemId
          ? {
              ...i,
              foodId: altFood.id,
              name: `${altFood.name} (Sustituto económico)`,
              purchasableUnitsText: `${unitsCount} x ${altFood.purchaseUnitLabel}`,
              estimatedCostCOP: newCost,
              store: altFood.commonStores[0] || 'D1'
            }
          : i
      );
      return { ...prev, shoppingList: updated };
    });
    notify('Producto reemplazado por alternativa económica.');
  };

  const addOrUpdateRoutine = (routine: WorkoutRoutine) => {
    setDb((prev) => {
      const exists = prev.routines.some((r) => r.id === routine.id);
      const routines = exists
        ? prev.routines.map((r) => (r.id === routine.id ? routine : r))
        : [routine, ...prev.routines];
      return { ...prev, routines };
    });
    notify(`Rutina "${routine.name}" guardada.`);
  };

  const deleteRoutine = (id: string) => {
    setDb((prev) => ({
      ...prev,
      routines: prev.routines.filter((r) => r.id !== id)
    }));
    notify('Rutina eliminada.');
  };

  const addWorkoutSession = (session: WorkoutSession) => {
    setDb((prev) => ({
      ...prev,
      workoutSessions: [session, ...prev.workoutSessions]
    }));
    notify(`Entrenamiento "${session.routineName}" registrado.`);
  };

  const deleteWorkoutSession = (id: string) => {
    setDb((prev) => ({
      ...prev,
      workoutSessions: prev.workoutSessions.filter((w) => w.id !== id)
    }));
    notify('Sesión eliminada.');
  };

  const addCardioLog = (log: RunCardioLog) => {
    setDb((prev) => ({
      ...prev,
      cardioLogs: [log, ...prev.cardioLogs]
    }));
    notify(`Actividad de ${log.type} registrada.`);
  };

  const deleteCardioLog = (id: string) => {
    setDb((prev) => ({
      ...prev,
      cardioLogs: prev.cardioLogs.filter((c) => c.id !== id)
    }));
    notify('Actividad eliminada.');
  };

  const upsertWellnessLog = (log: DailyWellnessLog) => {
    setDb((prev) => {
      const exists = prev.wellnessLogs.some((w) => w.date === log.date);
      const wellnessLogs = exists
        ? prev.wellnessLogs.map((w) => (w.date === log.date ? log : w))
        : [log, ...prev.wellnessLogs];
      const updatedProfile = log.weightKg
        ? { ...prev.profile, weightKg: log.weightKg }
        : prev.profile;
      return { ...prev, wellnessLogs, profile: updatedProfile };
    });
    notify(`Registro del día ${log.date} guardado.`);
  };

  const toggleHabitConfig = (id: string) => {
    setDb((prev) => ({
      ...prev,
      habitConfigs: prev.habitConfigs.map((h) =>
        h.id === id ? { ...h, active: !h.active } : h
      )
    }));
  };

  const addCustomHabit = (label: string) => {
    if (!label.trim()) return;
    setDb((prev) => ({
      ...prev,
      habitConfigs: [
        ...prev.habitConfigs,
        { id: `hab-${Date.now()}`, label: label.trim(), active: true }
      ]
    }));
    notify('Hábito personalizado añadido.');
  };

  const addExpense = (expense: ExpenseLog) => {
    setDb((prev) => ({
      ...prev,
      expenses: [expense, ...prev.expenses]
    }));
    notify(`Gasto registrado.`);
  };

  const deleteExpense = (id: string) => {
    setDb((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id)
    }));
    notify('Gasto eliminado.');
  };

  const clearDemoData = () => {
    setDb((prev) => ({
      ...prev,
      hasDemoData: false,
      mealLogs: prev.mealLogs.filter((m) => !m.isDemo),
      workoutSessions: prev.workoutSessions.filter((w) => !w.isDemo),
      cardioLogs: prev.cardioLogs.filter((c) => !c.isDemo),
      wellnessLogs: prev.wellnessLogs.filter((w) => !w.isDemo),
      expenses: prev.expenses.filter((e) => !e.isDemo)
    }));
    notify('Datos de demostración eliminados.');
  };

  const resetAllData = (includeDemo: boolean) => {
    const fresh = storageRepository.resetToFactory(includeDemo);
    setDb(fresh);
    notify('Aplicación restablecida.');
  };

  const importDatabaseJson = (rawJson: string): { ok: boolean; message: string } => {
    try {
      const parsed = JSON.parse(rawJson);
      const check = validateBackupJson(parsed);
      if (!check.valid) {
        return { ok: false, message: check.error || 'Archivo inválido.' };
      }
      setDb(parsed as FitLocalDatabase);
      notify('Copia de seguridad restaurada.');
      return { ok: true, message: 'Copia de seguridad importada.' };
    } catch {
      return { ok: false, message: 'Error al leer el archivo JSON.' };
    }
  };

  return (
    <FitLocalContext.Provider
      value={{
        db,
        userEmail,
        cloudSyncStatus,
        signOutUser,
        toastMessage,
        notify,
        updateProfile,
        addOrUpdateFood,
        addOrUpdateRecipe,
        deleteRecipe,
        addMealLog,
        deleteMealLog,
        addOrUpdatePlanItem,
        togglePlanItemComplete,
        deletePlanItem,
        generateAutomaticWeekPlan,
        regenerateShoppingListFromPlan,
        updateShoppingList,
        saveCurrentShoppingListSnapshot,
        applyCheaperSwapInShoppingList,
        addOrUpdateRoutine,
        deleteRoutine,
        addWorkoutSession,
        deleteWorkoutSession,
        addCardioLog,
        deleteCardioLog,
        upsertWellnessLog,
        toggleHabitConfig,
        addCustomHabit,
        addExpense,
        deleteExpense,
        clearDemoData,
        resetAllData,
        importDatabaseJson
      }}
    >
      {children}
    </FitLocalContext.Provider>
  );
};

export function useFitLocal(): FitLocalContextValue {
  const ctx = useContext(FitLocalContext);
  if (!ctx) throw new Error('useFitLocal debe usarse dentro de FitLocalProvider');
  return ctx;
}