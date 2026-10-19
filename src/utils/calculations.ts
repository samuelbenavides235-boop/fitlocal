import {
  FitLocalDatabase,
  FoodItem,
  Recipe,
  RecipeIngredient,
  ShoppingListItem,
  UserProfile,
  WeeklyPlanItem,
  WorkoutSession
} from '../types/fitlocal';

export function formatCOP(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(safe);
}

export function calculateNutritionalTargets(profile: UserProfile): {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
} {
  const weight = Math.max(30, Math.min(250, Number(profile.weightKg) || 70));
  const height = Math.max(120, Math.min(230, Number(profile.heightCm) || 170));
  const age = Math.max(14, Math.min(100, Number(profile.age) || 25));

  const sexOffset =
    profile.physiologicalSex === 'male'
      ? 5
      : profile.physiologicalSex === 'female'
      ? -161
      : -78;

  const bmr = Math.round(10 * weight + 6.25 * height - 5 * age + sexOffset);

  const multipliers: Record<UserProfile['activityLevel'], number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };

  const tdee = Math.round(bmr * (multipliers[profile.activityLevel] || 1.55));

  let goalDelta = 0;
  if (profile.goal === 'fat_loss') goalDelta = -400;
  if (profile.goal === 'muscle_gain') goalDelta = 300;

  const targetCalories = profile.customCalorieTarget
    ? Math.max(1200, profile.customCalorieTarget)
    : Math.max(1200, tdee + goalDelta);

  const proteinPerKg =
    profile.goal === 'muscle_gain' || profile.goal === 'fat_loss' ? 2.0 : 1.6;

  const proteinGrams = profile.customProteinTargetG
    ? Math.max(40, profile.customProteinTargetG)
    : Math.round(weight * proteinPerKg);

  const fatsGrams = Math.round((targetCalories * 0.26) / 9);
  const remainingCalories = Math.max(
    200,
    targetCalories - proteinGrams * 4 - fatsGrams * 9
  );
  const carbsGrams = Math.round(remainingCalories / 4);

  return { bmr, tdee, targetCalories, proteinGrams, carbsGrams, fatsGrams };
}

export function calculateIngredientsTotals(
  items: RecipeIngredient[],
  foodsCatalog: FoodItem[]
): {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  costCOP: number;
} {
  const foodMap = new Map(foodsCatalog.map((f) => [f.id, f]));
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fats = 0;
  let costCOP = 0;

  for (const item of items) {
    const food = foodMap.get(item.foodId);
    const grams = Math.max(0, Number(item.grams) || 0);
    if (!food || grams <= 0) continue;

    const factor = grams / 100;
    calories += food.caloriesPer100g * factor;
    protein += food.proteinPer100g * factor;
    carbs += food.carbsPer100g * factor;
    fats += food.fatsPer100g * factor;

    const unitWeight = Math.max(1, food.unitWeightGrams || 1000);
    costCOP += (grams / unitWeight) * food.estimatedPricePerKgOrUnitCOP;
  }

  return {
    calories: Math.round(calories),
    protein: Number(protein.toFixed(1)),
    carbs: Number(carbs.toFixed(1)),
    fats: Number(fats.toFixed(1)),
    costCOP: Math.round(costCOP)
  };
}

export function calculateRunningMetrics(
  distanceKm: number,
  durationMinutes: number
): {
  paceFormatted: string;
  paceDecimalMinPerKm: number;
  speedKmH: number;
} {
  const dist = Number(distanceKm);
  const dur = Number(durationMinutes);

  if (!Number.isFinite(dist) || !Number.isFinite(dur) || dist <= 0 || dur <= 0) {
    return { paceFormatted: '0:00 /km', paceDecimalMinPerKm: 0, speedKmH: 0 };
  }

  const paceDecimal = dur / dist;
  const paceMinutes = Math.floor(paceDecimal);
  const paceSeconds = Math.round((paceDecimal - paceMinutes) * 60);
  const adjustedMinutes = paceSeconds === 60 ? paceMinutes + 1 : paceMinutes;
  const adjustedSeconds = paceSeconds === 60 ? 0 : paceSeconds;

  const speedKmH = Number(((dist / dur) * 60).toFixed(1));

  return {
    paceFormatted: `${adjustedMinutes}:${String(adjustedSeconds).padStart(2, '0')} /km`,
    paceDecimalMinPerKm: Number(paceDecimal.toFixed(2)),
    speedKmH
  };
}

export function calculatePersonalRecords(
  sessions: WorkoutSession[]
): { exerciseName: string; maxWeightKg: number; bestSetReps: number; date: string }[] {
  const map = new Map<
    string,
    { exerciseName: string; maxWeightKg: number; bestSetReps: number; date: string }
  >();

  for (const session of sessions) {
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        if (!set.completed) continue;
        const current = map.get(ex.exerciseName);
        if (
          !current ||
          set.weightKg > current.maxWeightKg ||
          (set.weightKg === current.maxWeightKg && set.reps > current.bestSetReps)
        ) {
          map.set(ex.exerciseName, {
            exerciseName: ex.exerciseName,
            maxWeightKg: set.weightKg,
            bestSetReps: set.reps,
            date: session.date
          });
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.maxWeightKg - a.maxWeightKg);
}

export function buildConsolidatedShoppingList(
  weeklyPlan: WeeklyPlanItem[],
  recipes: Recipe[],
  foods: FoodItem[],
  existingList: ShoppingListItem[]
): ShoppingListItem[] {
  const recipeMap = new Map(recipes.map((r) => [r.id, r]));
  const foodMap = new Map(foods.map((f) => [f.id, f]));
  const existingChecked = new Map(existingList.map((i) => [i.foodId || i.name, i.checked]));

  const gramsByFoodId = new Map<string, number>();

  for (const item of weeklyPlan) {
    if (item.type === 'meal' && item.recipeId) {
      const recipe = recipeMap.get(item.recipeId);
      if (!recipe) continue;
      for (const ing of recipe.ingredients) {
        const prev = gramsByFoodId.get(ing.foodId) || 0;
        gramsByFoodId.set(ing.foodId, prev + ing.grams);
      }
    }
  }

  const consolidated: ShoppingListItem[] = [];

  gramsByFoodId.forEach((totalGrams, foodId) => {
    const food = foodMap.get(foodId);
    if (!food) return;

    const unitWeight = Math.max(1, food.unitWeightGrams || 1000);
    const unitsCount = Math.max(1, Math.ceil(totalGrams / unitWeight));
    const estimatedCostCOP = Math.round(unitsCount * food.estimatedPricePerKgOrUnitCOP);

    consolidated.push({
      id: `shop-${food.id}`,
      foodId: food.id,
      name: food.name,
      category: food.category,
      totalGramsNeeded: Math.round(totalGrams),
      purchasableUnitsText: `${unitsCount} x ${food.purchaseUnitLabel}`,
      estimatedCostCOP,
      store: food.commonStores[0] || 'D1',
      checked: existingChecked.get(food.id) ?? false
    });
  });

  for (const manual of existingList) {
    if (!manual.foodId) {
      consolidated.push(manual);
    }
  }

  return consolidated;
}

export function detectScheduleConflicts(plan: WeeklyPlanItem[]): string[] {
  const conflicts: string[] = [];
  const byDay = new Map<string, WeeklyPlanItem[]>();

  for (const item of plan) {
    const list = byDay.get(item.day) || [];
    list.push(item);
    byDay.set(item.day, list);
  }

  byDay.forEach((items, day) => {
    const sorted = [...items].sort((a, b) => a.time.localeCompare(b.time));
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      const [cH, cM] = current.time.split(':').map(Number);
      const [nH, nM] = next.time.split(':').map(Number);
      const currentStart = cH * 60 + cM;
      const currentEnd = currentStart + (current.durationMinutes || 30);
      const nextStart = nH * 60 + nM;

      if (nextStart < currentEnd) {
        conflicts.push(
          `${day}: "${current.title}" (${current.time}) se solapa con "${next.title}" (${next.time}).`
        );
      }
    }
  });

  return conflicts;
}

export function validateBackupJson(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'El archivo no contiene un objeto JSON válido.' };
  }
  const candidate = data as Partial<FitLocalDatabase>;
  if (!candidate.profile || typeof candidate.profile.name !== 'string') {
    return { valid: false, error: 'Falta el perfil de usuario en la copia de seguridad.' };
  }
  if (!Array.isArray(candidate.foods) || !Array.isArray(candidate.mealLogs)) {
    return { valid: false, error: 'Las colecciones de alimentos o registros están corruptas.' };
  }
  return { valid: true };
}