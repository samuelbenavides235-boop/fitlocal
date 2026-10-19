import React, { useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  CheckCircle2,
  Dumbbell,
  Flame,
  Plus,
  RefreshCw,
  Scale,
  Sparkles,
  Trash2,
  Utensils,
  Wallet
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useFitLocal } from '../../context/FitLocalContext';
import { COLOMBIAN_CITIES } from '../../data/colombiaCatalog';
import {
  DayOfWeek,
  MealSlot,
  NavigationTab,
  PlannedActivityType,
  RecipeIngredient,
  StoreName
} from '../../types/fitlocal';
import {
  calculateIngredientsTotals,
  calculateNutritionalTargets,
  detectScheduleConflicts,
  formatCOP
} from '../../utils/calculations';
import {
  Badge,
  Card,
  DisclaimerBanner,
  EmptyState,
  SectionHeader,
  StatCard
} from '../ui/CommonUI';

const DAYS_ORDER: DayOfWeek[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

const GOAL_LABELS = {
  fat_loss: 'Pérdida de grasa',
  maintenance: 'Mantenimiento',
  muscle_gain: 'Ganancia muscular',
  health_habits: 'Mejora de hábitos'
};

export const DashboardView: React.FC<{
  onNavigate: (tab: NavigationTab) => void;
}> = ({ onNavigate }) => {
  const { db, clearDemoData } = useFitLocal();
  const todayStr = new Date().toISOString().split('T')[0];

  const targets = useMemo(
    () => calculateNutritionalTargets(db.profile),
    [db.profile]
  );

  const todayMeals = useMemo(
    () => db.mealLogs.filter((m) => m.date === todayStr),
    [db.mealLogs, todayStr]
  );

  const todayNutrition = useMemo(() => {
    return todayMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.totalCalories,
        protein: acc.protein + m.totalProtein,
        carbs: acc.carbs + m.totalCarbs,
        fats: acc.fats + m.totalFats,
        cost: acc.cost + m.estimatedCostCOP
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, cost: 0 }
    );
  }, [todayMeals]);

  const weeklyKm = useMemo(
    () =>
      db.cardioLogs
        .filter((c) => c.type === 'Running')
        .reduce((acc, c) => acc + c.distanceKm, 0),
    [db.cardioLogs]
  );

  const totalActivityMinutes = useMemo(() => {
    const gymMin = db.workoutSessions.reduce((a, w) => a + w.durationMinutes, 0);
    const cardioMin = db.cardioLogs.reduce((a, c) => a + c.durationMinutes, 0);
    return Math.round(gymMin + cardioMin);
  }, [db.workoutSessions, db.cardioLogs]);

  const latestWellness = db.wellnessLogs[0];
  const totalRealSpend = db.expenses
    .filter((e) => e.isRealExpense)
    .reduce((a, e) => a + e.amountCOP, 0);

  const nextPlannedMeal = db.weeklyPlan.find(
    (p) => p.type === 'meal' && !p.completed
  );
  const nextPlannedWorkout = db.weeklyPlan.find(
    (p) => (p.type === 'gym' || p.type === 'running') && !p.completed
  );

  const last7DaysChartData = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('es-CO', { weekday: 'short' });
      const cals = db.mealLogs
        .filter((m) => m.date === iso)
        .reduce((a, m) => a + m.totalCalories, 0);
      const prot = db.mealLogs
        .filter((m) => m.date === iso)
        .reduce((a, m) => a + m.totalProtein, 0);
      result.push({ day: dayLabel, Calorias: cals, ProteinaG: Math.round(prot) });
    }
    return result;
  }, [db.mealLogs]);

  return (
    <div className="space-y-6">
      {db.hasDemoData && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-lime-400/10 border border-lime-400/30">
          <div className="text-xs sm:text-sm text-slate-200">
            <span className="font-bold text-lime-400">MODO DEMOSTRACIÓN ACTIVO:</span>{' '}
            Estás viendo registros iniciales de ejemplo identificados como{' '}
            <code className="text-lime-300">[DEMO]</code> para explorar las gráficas.
          </div>
          <button
            type="button"
            onClick={clearDemoData}
            className="px-3.5 py-1.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-lime-400 border border-lime-400/40 text-xs font-bold shrink-0 transition"
          >
            Limpiar datos de demostración
          </button>
        </div>
      )}

      <SectionHeader
        title={`Hola, ${db.profile.name}`}
        subtitle={`${new Date().toLocaleDateString('es-CO', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })} • ${db.profile.city}, Colombia • Objetivo: ${
          GOAL_LABELS[db.profile.goal]
        }`}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onNavigate('nutrition')}
              className="px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-charcoal-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Registrar Comida
            </button>
            <button
              type="button"
              onClick={() => onNavigate('workouts')}
              className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition"
            >
              <Dumbbell className="w-4 h-4 text-lime-400" /> Entrenar
            </button>
            <button
              type="button"
              onClick={() => onNavigate('running')}
              className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition"
            >
              <Activity className="w-4 h-4 text-lime-400" /> Añadir Carrera
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Proteína de Hoy"
          value={`${Math.round(todayNutrition.protein)}g / ${targets.proteinGrams}g`}
          subvalue={`${todayNutrition.calories} kcal de ${targets.targetCalories} kcal est.`}
          icon={<Flame className="w-5 h-5" />}
          accent
        />
        <StatCard
          label="Entrenamientos y Cardio"
          value={`${db.workoutSessions.length} sesiones`}
          subvalue={`${weeklyKm.toFixed(1)} / ${db.profile.weeklyRunningGoalKm} km running • ${totalActivityMinutes} min`}
          icon={<Dumbbell className="w-5 h-5" />}
        />
        <StatCard
          label="Peso e Hidratación"
          value={`${db.profile.weightKg} kg`}
          subvalue={`Agua hoy: ${latestWellness?.waterMl || 0} / ${
            db.profile.dailyWaterGoalMl
          } ml`}
          icon={<Scale className="w-5 h-5" />}
        />
        <StatCard
          label="Presupuesto Semanal"
          value={formatCOP(totalRealSpend)}
          subvalue={`Meta semanal: ${formatCOP(db.profile.weeklyBudgetCOP)}`}
          icon={<Wallet className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">
                Balance Nutricional (Últimos 7 días)
              </h2>
              <p className="text-xs text-slate-400">
                Calorías consumidas y gramos de proteína registrados
              </p>
            </div>
            <Badge variant="lime">Meta: {targets.targetCalories} kcal</Badge>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F141C',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#F8FAFC'
                  }}
                />
                <Bar dataKey="Calorias" fill="#A3E635" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-bold text-white">
            Agenda y Próximas Acciones
          </h2>

          <div className="p-3.5 rounded-xl bg-charcoal-800/90 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-lime-400 uppercase">
              <Utensils className="w-4 h-4" /> Próxima Comida Planificada
            </div>
            <p className="text-sm font-bold text-white mt-1">
              {nextPlannedMeal
                ? `${nextPlannedMeal.day} (${nextPlannedMeal.time}) — ${nextPlannedMeal.title}`
                : 'Sin comidas pendientes en el planificador'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-charcoal-800/90 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase">
              <Calendar className="w-4 h-4" /> Próxima Sesión Deportiva
            </div>
            <p className="text-sm font-bold text-white mt-1">
              {nextPlannedWorkout
                ? `${nextPlannedWorkout.day} (${nextPlannedWorkout.time}) — ${nextPlannedWorkout.title}`
                : 'Programa tu próxima rutina en el Planificador'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-charcoal-800/90 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Racha de Hábitos Cumplidos
              </span>
              <Badge variant="lime">{db.wellnessLogs.length} días registrados</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                type="button"
                onClick={() => onNavigate('habits')}
                className="px-3 py-2 rounded-lg bg-charcoal-900 hover:bg-charcoal-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              >
                Registrar Peso / Agua
              </button>
              <button
                type="button"
                onClick={() => onNavigate('budget')}
                className="px-3 py-2 rounded-lg bg-charcoal-900 hover:bg-charcoal-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              >
                Añadir Compra COP
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const ProfileGoalsView: React.FC = () => {
  const { db, updateProfile } = useFitLocal();
  const [form, setForm] = useState(db.profile);
  const [excludedInput, setExcludedInput] = useState(
    db.profile.excludedFoods.join(', ')
  );
  const [allergiesInput, setAllergiesInput] = useState(
    db.profile.allergies.join(', ')
  );

  const targets = useMemo(() => calculateNutritionalTargets(form), [form]);

  const toggleStore = (store: StoreName) => {
    const exists = form.preferredStores.includes(store);
    const preferredStores = exists
      ? form.preferredStores.filter((s) => s !== store)
      : [...form.preferredStores, store];
    setForm({ ...form, preferredStores });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      ...form,
      excludedFoods: excludedInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      allergies: allergiesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Mi Perfil, Biometría y Objetivos"
        subtitle="Configura tus parámetros físicos, ciudad en Colombia y presupuesto para personalizar los cálculos."
      />

      <DisclaimerBanner text="Aviso de transparencia: Las necesidades calóricas y de macronutrientes se calculan mediante la ecuación predictiva de Mifflin-St Jeor como estimaciones orientativas. FITLOCAL no reemplaza el diagnóstico de un médico o nutricionista clínico." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white">
              1. Datos Físicos y Ubicación
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Nombre o Alias
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Ciudad en Colombia
                </label>
                <select
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-sm text-white"
                >
                  {COLOMBIAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Sexo fisiológico (fórmula TMB)
                </label>
                <select
                  value={form.physiologicalSex}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      physiologicalSex: e.target
                        .value as typeof form.physiologicalSex
                    })
                  }
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-sm text-white"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="unspecified">Prefiero no especificar</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Edad (años)
                </label>
                <input
                  type="number"
                  min={14}
                  max={100}
                  value={form.age}
                  onChange={(e) =>
                    setForm({ ...form, age: Number(e.target.value) })
                  }
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Estatura (cm)
                </label>
                <input
                  type="number"
                  min={120}
                  max={230}
                  value={form.heightCm}
                  onChange={(e) =>
                    setForm({ ...form, heightCm: Number(e.target.value) })
                  }
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Peso actual (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={35}
                  max={250}
                  value={form.weightKg}
                  onChange={(e) =>
                    setForm({ ...form, weightKg: Number(e.target.value) })
                  }
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white">
              2. Entrenamiento, Alimentación y Presupuesto (COP)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Objetivo Físico Principal
                </label>
                <select
                  value={form.goal}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      goal: e.target.value as typeof form.goal
                    })
                  }
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-sm text-white"
                >
                  <option value="fat_loss">Pérdida de grasa (-400 kcal)</option>
                  <option value="maintenance">Mantenimiento normocalórico</option>
                  <option value="muscle_gain">Ganancia muscular (+300 kcal)</option>
                  <option value="health_habits">Mejora de hábitos y energía</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Nivel de Actividad Diaria
                </label>
                <select
                  value={form.activityLevel}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      activityLevel: e.target.value as typeof form.activityLevel
                    })
                  }
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-sm text-white"
                >
                  <option value="sedentary">Sedentario (oficina)</option>
                  <option value="light">Ligero (1-2 días entreno)</option>
                  <option value="moderate">Moderado (3-4 días entreno)</option>
                  <option value="active">Activo (5-6 días entreno)</option>
                  <option value="very_active">Muy activo (doble sesión)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Presupuesto Semanal Alimentación (COP)
                </label>
                <input
                  type="number"
                  step={5000}
                  min={30000}
                  value={form.weeklyBudgetCOP}
                  onChange={(e) => {
                    const weekly = Number(e.target.value);
                    setForm({
                      ...form,
                      weeklyBudgetCOP: weekly,
                      monthlyBudgetCOP: weekly * 4
                    });
                  }}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Meta Semanal Running (km)
                </label>
                <input
                  type="number"
                  min={0}
                  max={150}
                  value={form.weeklyRunningGoalKm}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      weeklyRunningGoalKm: Number(e.target.value)
                    })
                  }
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Alimentos que NO consumes (separados por coma)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Atún, Yuca"
                  value={excludedInput}
                  onChange={(e) => setExcludedInput(e.target.value)}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Alergias o intolerancias declaradas
                </label>
                <input
                  type="text"
                  placeholder="Ej: Maní, Lactosa"
                  value={allergiesInput}
                  onChange={(e) => setAllergiesInput(e.target.value)}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">
                Tiendas habituales de compra en {form.city}
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  ['D1', 'Ara', 'Olímpica', 'Éxito', 'Mercado Local'] as StoreName[]
                ).map((store) => {
                  const active = form.preferredStores.includes(store);
                  return (
                    <button
                      type="button"
                      key={store}
                      onClick={() => toggleStore(store)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        active
                          ? 'bg-lime-400 text-charcoal-950 border-lime-400'
                          : 'bg-charcoal-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {store}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-charcoal-950 font-extrabold text-sm transition"
            >
              Guardar Perfil y Recalcular Objetivos
            </button>
          </Card>
        </form>

        <Card className="space-y-4 h-fit">
          <h2 className="text-base font-bold text-white">
            Estimación Energética Personalizada
          </h2>
          <div className="p-4 rounded-xl bg-charcoal-800 border border-slate-700 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Tasa Metabólica Basal (TMB):</span>
              <span className="font-bold text-white">{targets.bmr} kcal</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Gasto Total Diario (TDEE):</span>
              <span className="font-bold text-white">{targets.tdee} kcal</span>
            </div>
            <div className="border-t border-slate-700 pt-2 flex justify-between text-sm">
              <span className="font-bold text-lime-400">Objetivo Diario:</span>
              <span className="font-extrabold text-lime-400">
                {targets.targetCalories} kcal
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-charcoal-800 flex justify-between">
              <span className="text-slate-300">Proteína estimada (2.0g/kg):</span>
              <span className="font-bold text-lime-400">
                {targets.proteinGrams} g / día
              </span>
            </div>
            <div className="p-3 rounded-xl bg-charcoal-800 flex justify-between">
              <span className="text-slate-300">Carbohidratos estimados:</span>
              <span className="font-bold text-sky-400">
                {targets.carbsGrams} g / día
              </span>
            </div>
            <div className="p-3 rounded-xl bg-charcoal-800 flex justify-between">
              <span className="text-slate-300">Grasas saludables:</span>
              <span className="font-bold text-amber-400">
                {targets.fatsGrams} g / día
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const NutritionView: React.FC = () => {
  const { db, addMealLog, deleteMealLog, addOrUpdateRecipe } = useFitLocal();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('Almuerzo');
  const [mealTitle, setMealTitle] = useState('');
  const [selectedFoodId, setSelectedFoodId] = useState(db.foods[0]?.id || '');
  const [gramsInput, setGramsInput] = useState(150);
  const [draftItems, setDraftItems] = useState<RecipeIngredient[]>([]);
  const [searchFood, setSearchFood] = useState('');
  const [generatedMenu, setGeneratedMenu] = useState(db.recipes.slice(0, 3));

  const draftTotals = useMemo(
    () => calculateIngredientsTotals(draftItems, db.foods),
    [draftItems, db.foods]
  );

  const handleAddDraftIngredient = () => {
    if (!selectedFoodId || gramsInput <= 0) return;
    setDraftItems((prev) => [
      ...prev,
      { foodId: selectedFoodId, grams: Number(gramsInput) }
    ]);
  };

  const handleSaveMealLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (draftItems.length === 0) return;
    addMealLog({
      id: `meal-${Date.now()}`,
      date: todayStr,
      slot: selectedSlot,
      title: mealTitle.trim() || `${selectedSlot} personalizado`,
      items: draftItems,
      totalCalories: draftTotals.calories,
      totalProtein: draftTotals.protein,
      totalCarbs: draftTotals.carbs,
      totalFats: draftTotals.fats,
      estimatedCostCOP: draftTotals.costCOP
    });
    setMealTitle('');
    setDraftItems([]);
  };

  const handleSaveDraftAsRecipe = () => {
    if (draftItems.length === 0) return;
    addOrUpdateRecipe({
      id: `rec-custom-${Date.now()}`,
      name: mealTitle.trim() || `Receta Fit (${selectedSlot})`,
      slot: selectedSlot,
      prepTimeMinutes: 15,
      servings: 1,
      ingredients: draftItems,
      instructions: ['Preparación personalizada registrada por el usuario.'],
      tags: ['Personalizada', 'Alta proteína']
    });
  };

  const handleRegenerateSmartMenu = () => {
    const excluded = db.profile.excludedFoods.map((s) => s.toLowerCase());
    const validRecipes = db.recipes.filter((rec) => {
      return !rec.ingredients.some((ing) => {
        const f = db.foods.find((fo) => fo.id === ing.foodId);
        return f && excluded.some((ex) => f.name.toLowerCase().includes(ex));
      });
    });
    const shuffled = [
      ...(validRecipes.length > 0 ? validRecipes : db.recipes)
    ].sort(() => Math.random() - 0.5);
    setGeneratedMenu(shuffled.slice(0, 3));
  };

  const filteredFoods = db.foods.filter(
    (f) =>
      f.name.toLowerCase().includes(searchFood.toLowerCase()) ||
      f.category.toLowerCase().includes(searchFood.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Alimentación Inteligente y Recetario Colombiano"
        subtitle="Registra tus comidas en gramos, calcula macros y costos por porción en COP o genera propuestas automáticas."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-lime-400" /> Registrar Comida o Crear
            Receta Propia
          </h2>

          <form onSubmit={handleSaveMealLog} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Momento del día
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value as MealSlot)}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-sm text-white"
                >
                  <option value="Desayuno">Desayuno</option>
                  <option value="Almuerzo">Almuerzo</option>
                  <option value="Cena">Cena</option>
                  <option value="Snack">Snack / Post-entreno</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">
                  Nombre del plato o comida
                </label>
                <input
                  type="text"
                  placeholder="Ej: Calentado fit con pechuga y huevo"
                  value={mealTitle}
                  onChange={(e) => setMealTitle(e.target.value)}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-charcoal-800/80 border border-slate-700/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">
                    Seleccionar alimento del catálogo colombiano
                  </label>
                  <select
                    value={selectedFoodId}
                    onChange={(e) => setSelectedFoodId(e.target.value)}
                    className="w-full rounded-xl bg-charcoal-900 border border-slate-700 px-3 py-2 text-sm text-white"
                  >
                    {db.foods.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.proteinPer100g}g prot / 100g)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Cantidad (gramos)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={2000}
                    value={gramsInput}
                    onChange={(e) => setGramsInput(Number(e.target.value))}
                    className="w-full rounded-xl bg-charcoal-900 border border-slate-700 px-3 py-2 text-sm text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddDraftIngredient}
                  className="px-4 py-2 rounded-xl bg-lime-400/20 hover:bg-lime-400/30 text-lime-300 border border-lime-400/40 font-bold text-xs transition"
                >
                  + Añadir Ingrediente
                </button>
              </div>

              {draftItems.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-700">
                  {draftItems.map((item, idx) => {
                    const food = db.foods.find((f) => f.id === item.foodId);
                    return (
                      <div
                        key={`${item.foodId}-${idx}`}
                        className="flex items-center justify-between text-xs bg-charcoal-900 px-3 py-2 rounded-lg"
                      >
                        <span className="text-slate-200 font-medium">
                          {food?.name} — <strong>{item.grams}g</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setDraftItems(draftItems.filter((_, i) => i !== idx))
                          }
                          className="text-rose-400 hover:text-rose-300"
                        >
                          Quitar
                        </button>
                      </div>
                    );
                  })}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                    <span className="text-lime-400 font-bold">
                      Total plato: {draftTotals.calories} kcal •{' '}
                      {draftTotals.protein}g Proteína • {draftTotals.carbs}g Carbs
                      • {draftTotals.fats}g Grasas
                    </span>
                    <span className="text-slate-300 font-semibold">
                      Costo est. porción: {formatCOP(draftTotals.costCOP)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={draftItems.length === 0}
                className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 disabled:opacity-40 text-charcoal-950 font-extrabold text-xs transition"
              >
                Registrar Comida Consumida Hoy
              </button>
              <button
                type="button"
                disabled={draftItems.length === 0}
                onClick={handleSaveDraftAsRecipe}
                className="px-4 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 disabled:opacity-40 text-white font-semibold text-xs border border-slate-700 transition"
              >
                Guardar como Receta Frecuente
              </button>
            </div>
          </form>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-lime-400" /> Propuesta de Menú
              </h2>
              <p className="text-xs text-slate-400">
                Adaptado a presupuesto ({formatCOP(db.profile.weeklyBudgetCOP)}/sem)
              </p>
            </div>
            <button
              type="button"
              onClick={handleRegenerateSmartMenu}
              className="p-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-lime-400 border border-slate-700"
              title="Regenerar combinación"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {generatedMenu.map((rec) => {
              const macros = calculateIngredientsTotals(rec.ingredients, db.foods);
              return (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-charcoal-800 border border-slate-700/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="lime">{rec.slot}</Badge>
                    <span className="text-xs text-slate-400">
                      {rec.prepTimeMinutes} min • {formatCOP(macros.costCOP)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{rec.name}</h3>
                  <p className="text-xs text-slate-300">
                    {macros.calories} kcal • <strong>{macros.protein}g Prot</strong>{' '}
                    • {macros.carbs}g Carbs
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      addMealLog({
                        id: `meal-rec-${Date.now()}`,
                        date: todayStr,
                        slot: rec.slot,
                        title: rec.name,
                        items: rec.ingredients,
                        totalCalories: macros.calories,
                        totalProtein: macros.protein,
                        totalCarbs: macros.carbs,
                        totalFats: macros.fats,
                        estimatedCostCOP: macros.costCOP
                      })
                    }
                    className="w-full py-1.5 rounded-lg bg-lime-400/15 hover:bg-lime-400/25 text-lime-300 text-xs font-bold border border-lime-400/30 transition"
                  >
                    + Marcar como consumida hoy
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <h2 className="text-base font-bold text-white">
            Comidas Registradas ({db.mealLogs.length})
          </h2>
          {db.mealLogs.length === 0 ? (
            <EmptyState
              title="Aún no has registrado comidas"
              description="Usa el formulario superior o marca una receta del generador para iniciar tu control nutricional."
            />
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {db.mealLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-charcoal-800 border border-slate-800"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="lime">{log.slot}</Badge>
                      <span className="text-xs text-slate-400">{log.date}</span>
                    </div>
                    <p className="text-sm font-bold text-white mt-1">{log.title}</p>
                    <p className="text-xs text-slate-400">
                      {log.totalCalories} kcal • {log.totalProtein}g Prot •{' '}
                      {formatCOP(log.estimatedCostCOP)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMealLog(log.id)}
                    className="p-2 text-slate-400 hover:text-rose-400"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-white">
              Base Nutricional Colombia (por 100g)
            </h2>
            <input
              type="search"
              placeholder="Buscar alimento..."
              value={searchFood}
              onChange={(e) => setSearchFood(e.target.value)}
              className="rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-1.5 text-xs text-white"
            />
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredFoods.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-charcoal-800/70 border border-slate-800 text-xs"
              >
                <div>
                  <p className="font-bold text-white">{f.name}</p>
                  <p className="text-slate-400">
                    {f.caloriesPer100g} kcal • Prot: {f.proteinPer100g}g • Carbs:{' '}
                    {f.carbsPer100g}g • Grasas: {f.fatsPer100g}g
                  </p>
                </div>
                <Badge variant="slate">{formatCOP(f.estimatedPricePerKgOrUnitCOP)}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export const MealPlannerView: React.FC = () => {
  const {
    db,
    addOrUpdatePlanItem,
    togglePlanItemComplete,
    deletePlanItem,
    generateAutomaticWeekPlan
  } = useFitLocal();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Lunes');
  const [newTime, setNewTime] = useState('12:30');
  const [newType, setNewType] = useState<PlannedActivityType>('meal');
  const [newTitle, setNewTitle] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState(
    db.recipes[0]?.id || ''
  );

  const conflicts = useMemo(
    () => detectScheduleConflicts(db.weeklyPlan),
    [db.weeklyPlan]
  );

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenRecipe = db.recipes.find((r) => r.id === selectedRecipeId);
    const titleToUse =
      newType === 'meal' && !newTitle.trim() && chosenRecipe
        ? chosenRecipe.name
        : newTitle.trim() || 'Actividad programada';

    addOrUpdatePlanItem({
      id: `plan-${Date.now()}`,
      day: selectedDay,
      time: newTime,
      type: newType,
      title: titleToUse,
      recipeId: newType === 'meal' ? selectedRecipeId : undefined,
      durationMinutes: newType === 'gym' ? 55 : 30,
      completed: false
    });
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Planificador Semanal Inteligente"
        subtitle="Organiza tus comidas, sesiones de gimnasio, running y descansos con detección automática de solapamientos."
        action={
          <button
            type="button"
            onClick={generateAutomaticWeekPlan}
            className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-charcoal-950 font-extrabold text-xs flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-4 h-4" /> Generar Semana Según Objetivos
          </button>
        }
      />

      {conflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
          <p className="font-bold">
            Atención: Se detectaron conflictos de horario en tu semana:
          </p>
          {conflicts.map((c, idx) => (
            <p key={idx}>• {c}</p>
          ))}
        </div>
      )}

      <Card>
        <form
          onSubmit={handleAddPlan}
          className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
        >
          <div>
            <label className="block text-xs text-slate-400 mb-1">Día</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
              className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
            >
              {DAYS_ORDER.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Hora</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Tipo</label>
            <select
              value={newType}
              onChange={(e) =>
                setNewType(e.target.value as PlannedActivityType)
              }
              className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
            >
              <option value="meal">Comida / Receta</option>
              <option value="gym">Entrenamiento Gimnasio</option>
              <option value="running">Running / Cardio</option>
              <option value="walk">Caminata</option>
              <option value="rest">Descanso</option>
            </select>
          </div>
          <div>
            {newType === 'meal' ? (
              <>
                <label className="block text-xs text-slate-400 mb-1">
                  Receta asociada
                </label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
                >
                  {db.recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <label className="block text-xs text-slate-400 mb-1">
                  Título actividad
                </label>
                <input
                  type="text"
                  placeholder="Ej: Rodaje 5K o Rutina Torso"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-charcoal-950 font-bold text-xs transition"
          >
            + Programar
          </button>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DAYS_ORDER.map((day) => {
          const items = db.weeklyPlan
            .filter((p) => p.day === day)
            .sort((a, b) => a.time.localeCompare(b.time));
          return (
            <Card key={day} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-extrabold text-white">{day}</h3>
                <Badge variant="slate">{items.length} activ.</Badge>
              </div>
              {items.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Sin actividades programadas
                </p>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border text-xs transition ${
                        item.completed
                          ? 'bg-lime-400/10 border-lime-400/30 text-slate-300'
                          : 'bg-charcoal-800 border-slate-700 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lime-400">
                          {item.time}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => togglePlanItemComplete(item.id)}
                            className="text-slate-400 hover:text-lime-400"
                            title="Marcar completado"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePlanItem(item.id)}
                            className="text-slate-400 hover:text-rose-400"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p
                        className={`font-semibold mt-1 ${
                          item.completed ? 'line-through opacity-75' : ''
                        }`}
                      >
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};