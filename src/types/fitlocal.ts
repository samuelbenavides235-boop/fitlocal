export type NavigationTab =
  | 'dashboard'
  | 'profile'
  | 'nutrition'
  | 'planner'
  | 'market'
  | 'workouts'
  | 'running'
  | 'habits'
  | 'stats'
  | 'budget'
  | 'history'
  | 'settings';

export type PhysicalGoal = 'fat_loss' | 'maintenance' | 'muscle_gain' | 'health_habits';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type TrainingExperience = 'beginner' | 'intermediate' | 'advanced';
export type TrainingPlace = 'gym' | 'home' | 'mixed';
export type PhysiologicalSex = 'male' | 'female' | 'unspecified';

export type FoodCategory =
  | 'Proteínas'
  | 'Carbohidratos'
  | 'Frutas'
  | 'Verduras'
  | 'Lácteos'
  | 'Grasas saludables'
  | 'Otros productos';

export type StoreName = 'D1' | 'Ara' | 'Olímpica' | 'Éxito' | 'Mercado Local' | 'Otra';
export type MealSlot = 'Desayuno' | 'Almuerzo' | 'Cena' | 'Snack';
export type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';

export interface UserProfile {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  physiologicalSex: PhysiologicalSex;
  goal: PhysicalGoal;
  activityLevel: ActivityLevel;
  experience: TrainingExperience;
  availableDaysPerWeek: number;
  trainingPlace: TrainingPlace;
  dietaryPreference: string;
  excludedFoods: string[];
  allergies: string[];
  mealsPerDay: number;
  weeklyBudgetCOP: number;
  monthlyBudgetCOP: number;
  city: string;
  preferredStores: StoreName[];
  weeklyRunningGoalKm: number;
  weeklyRunningSessionsGoal: number;
  customCalorieTarget?: number;
  customProteinTargetG?: number;
  dailyWaterGoalMl: number;
  dailySleepGoalHours: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
  defaultPortionG: number;
  estimatedPricePerKgOrUnitCOP: number;
  purchaseUnitLabel: string; // ej. "1000g (1 kg)", "Cubeta x30 (1800g)"
  unitWeightGrams: number;
  commonStores: StoreName[];
  lastUpdated: string;
  isEstimated: boolean;
  cheaperAlternativeId?: string;
}

export interface RecipeIngredient {
  foodId: string;
  grams: number;
}

export interface Recipe {
  id: string;
  name: string;
  slot: MealSlot;
  prepTimeMinutes: number;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tags: string[];
  isFavorite?: boolean;
}

export interface MealLog {
  id: string;
  date: string; // YYYY-MM-DD
  slot: MealSlot;
  title: string;
  items: RecipeIngredient[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  estimatedCostCOP: number;
  isDemo?: boolean;
}

export type PlannedActivityType = 'meal' | 'gym' | 'running' | 'walk' | 'rest';

export interface WeeklyPlanItem {
  id: string;
  day: DayOfWeek;
  time: string; // HH:MM
  type: PlannedActivityType;
  title: string;
  subtitle?: string;
  recipeId?: string;
  routineId?: string;
  durationMinutes: number;
  completed: boolean;
}

export interface ShoppingListItem {
  id: string;
  foodId?: string;
  name: string;
  category: FoodCategory;
  totalGramsNeeded: number;
  purchasableUnitsText: string;
  estimatedCostCOP: number;
  store: StoreName;
  checked: boolean;
}

export interface RoutineExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: 'Mancuernas' | 'Barra' | 'Máquina' | 'Peso corporal' | 'Polea';
  targetSets: number;
  targetReps: string;
  targetWeightKg: number;
  restSeconds: number;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  muscleGroupFocus: string;
  estimatedDurationMin: number;
  exercises: RoutineExercise[];
}

export interface CompletedSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
}

export interface LoggedExercise {
  exerciseName: string;
  muscleGroup: string;
  sets: CompletedSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  routineId?: string;
  routineName: string;
  durationMinutes: number;
  rpeEffort: number; // 1-10
  notes: string;
  exercises: LoggedExercise[];
  totalVolumeKg: number;
  isDemo?: boolean;
}

export type CardioActivityType = 'Running' | 'Caminata' | 'Ciclismo' | 'Cardio HIIT';

export interface RunCardioLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: CardioActivityType;
  durationMinutes: number;
  distanceKm: number;
  rpeEffort?: number;
  notes: string;
  isDemo?: boolean;
}

export interface HabitConfig {
  id: string;
  label: string;
  active: boolean;
}

export interface DailyWellnessLog {
  id: string;
  date: string; // YYYY-MM-DD
  waterMl: number;
  sleepHours: number;
  weightKg?: number;
  waistCm?: number;
  chestCm?: number;
  armCm?: number;
  walkMinutes: number;
  energyLevel?: number; // 1-5
  completedHabitIds: string[];
  isDemo?: boolean;
}

export interface ExpenseLog {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: FoodCategory | 'Suplementos' | 'Gimnasio';
  store: StoreName;
  amountCOP: number;
  isRealExpense: boolean; // true = pagado real, false = proyectado
  isDemo?: boolean;
}

export interface FitLocalDatabase {
  schemaVersion: string;
  hasDemoData: boolean;
  profile: UserProfile;
  foods: FoodItem[];
  recipes: Recipe[];
  mealLogs: MealLog[];
  weeklyPlan: WeeklyPlanItem[];
  shoppingList: ShoppingListItem[];
  savedShoppingLists: { id: string; date: string; name: string; totalCOP: number; itemsCount: number }[];
  routines: WorkoutRoutine[];
  workoutSessions: WorkoutSession[];
  cardioLogs: RunCardioLog[];
  habitConfigs: HabitConfig[];
  wellnessLogs: DailyWellnessLog[];
  expenses: ExpenseLog[];
}