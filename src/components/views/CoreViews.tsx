import React, { useMemo, useRef, useState } from 'react';
import {
  Activity,
  BookmarkPlus,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
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
  FoodItem,
  MealSlot,
  NavigationTab,
  PlannedActivityType,
  Recipe,
  RecipeIngredient,
  StoreName,
  UserProfile
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

type ProfileWithAvatar = UserProfile & { avatarUrl?: string };

const PRESET_AVATARS = [
  {
    label: 'Atleta Verde',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="#131B26"/><circle cx="60" cy="45" r="22" fill="#A3E635"/><path d="M24 108c6-24 24-36 36-36s30 12 36 36" fill="#A3E635"/></svg>'
    )}`
  },
  {
    label: 'Fuerza Pro',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="#0F172A"/><circle cx="60" cy="45" r="22" fill="#38BDF8"/><path d="M24 108c6-24 24-36 36-36s30 12 36 36" fill="#38BDF8"/></svg>'
    )}`
  },
  {
    label: 'Runner Urbano',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="#1E1B4B"/><circle cx="60" cy="45" r="22" fill="#F59E0B"/><path d="M24 108c6-24 24-36 36-36s30 12 36 36" fill="#F59E0B"/></svg>'
    )}`
  },
  {
    label: 'Energía Fit',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="#31102F"/><circle cx="60" cy="45" r="22" fill="#F43F5E"/><path d="M24 108c6-24 24-36 36-36s30 12 36 36" fill="#F43F5E"/></svg>'
    )}`
  }
];

function buildExtendedColombianMenuBank(foods: FoodItem[], existingRecipes: Recipe[]): Recipe[] {
  const findFoodId = (keywords: string[], fallbackIndex = 0): string => {
    for (const kw of keywords) {
      const match = foods.find((f) => f.name.toLowerCase().includes(kw.toLowerCase()));
      if (match) return match.id;
    }
    return foods[fallbackIndex % Math.max(1, foods.length)]?.id || 'food-1';
  };

  const eggId = findFoodId(['huevo'], 0);
  const arepaId = findFoodId(['arepa', 'maíz', 'maiz'], 1);
  const cheeseId = findFoodId(['queso', 'cuajada', 'costeño'], 2);
  const chickenId = findFoodId(['pechuga', 'pollo'], 3);
  const riceId = findFoodId(['arroz'], 4);
  const avocadoId = findFoodId(['aguacate'], 5);
  const oatsId = findFoodId(['avena'], 6);
  const bananaId = findFoodId(['banano', 'plátano', 'platano'], 7);
  const lentilId = findFoodId(['lenteja', 'fríjol', 'frijol'], 8);
  const tunaId = findFoodId(['atún', 'atun', 'pescado', 'tilapia'], 9);
  const beefId = findFoodId(['carne', 'res', 'lomo'], 10);
  const potatoId = findFoodId(['papa', 'yuca'], 11);
  const yogurtId = findFoodId(['yogur', 'leche'], 12);

  const extraProposals: Recipe[] = [
    {
      id: 'prop-col-1',
      name: 'Arepa Asada con Pericos Proteicos y Queso',
      slot: 'Desayuno',
      prepTimeMinutes: 12,
      servings: 1,
      ingredients: [
        { foodId: eggId, grams: 150 },
        { foodId: arepaId, grams: 100 },
        { foodId: cheeseId, grams: 45 }
      ],
      instructions: ['Asar la arepa, preparar huevos revueltos con tomate y cebolla y acompañar con queso.'],
      tags: ['Económico', 'Tradicional', 'Alta proteína']
    },
    {
      id: 'prop-col-2',
      name: 'Pancakes de Avena, Banano y Huevo',
      slot: 'Desayuno',
      prepTimeMinutes: 15,
      servings: 1,
      ingredients: [
        { foodId: oatsId, grams: 70 },
        { foodId: bananaId, grams: 100 },
        { foodId: eggId, grams: 120 }
      ],
      instructions: ['Licuar o mezclar la avena con el banano y los huevos, y dorar en sartén antiadherente.'],
      tags: ['Energía', 'Rápido', 'Sin azúcar añadida']
    },
    {
      id: 'prop-col-3',
      name: 'Calentado Fit de Arroz, Pollo Desmechado y Huevo',
      slot: 'Desayuno',
      prepTimeMinutes: 14,
      servings: 1,
      ingredients: [
        { foodId: riceId, grams: 130 },
        { foodId: chickenId, grams: 120 },
        { foodId: eggId, grams: 60 }
      ],
      instructions: ['Saltear el arroz con la pechuga desmechada y coronar con huevo a la plancha.'],
      tags: ['Ganancia muscular', 'Colombiano']
    },
    {
      id: 'prop-col-4',
      name: 'Corrientazo Fit: Pechuga a la Plancha, Arroz y Aguacate',
      slot: 'Almuerzo',
      prepTimeMinutes: 22,
      servings: 1,
      ingredients: [
        { foodId: chickenId, grams: 180 },
        { foodId: riceId, grams: 150 },
        { foodId: avocadoId, grams: 80 }
      ],
      instructions: ['Dorar la pechuga con especias y servir con arroz blanco y tajadas de aguacate.'],
      tags: ['Alta proteína', 'Almuerzo base']
    },
    {
      id: 'prop-col-5',
      name: 'Cazuela Proteica de Lentejas con Carne Magra y Arroz',
      slot: 'Almuerzo',
      prepTimeMinutes: 25,
      servings: 1,
      ingredients: [
        { foodId: lentilId, grams: 140 },
        { foodId: beefId, grams: 140 },
        { foodId: riceId, grams: 120 }
      ],
      instructions: ['Servir las lentejas guisadas acompañadas de carne asada en tiras y porción medida de arroz.'],
      tags: ['Económico', 'Hierro y Fibra']
    },
    {
      id: 'prop-col-6',
      name: 'Carne Asada con Papa al Vapor y Aguacate',
      slot: 'Almuerzo',
      prepTimeMinutes: 25,
      servings: 1,
      ingredients: [
        { foodId: beefId, grams: 180 },
        { foodId: potatoId, grams: 180 },
        { foodId: avocadoId, grams: 70 }
      ],
      instructions: ['Cocinar la papa al vapor con sal marina y acompañar con carne magra a la plancha.'],
      tags: ['Saciedad', 'Fuerza']
    },
    {
      id: 'prop-col-7',
      name: 'Bowl Costeño de Atún, Arroz y Aguacate',
      slot: 'Cena',
      prepTimeMinutes: 10,
      servings: 1,
      ingredients: [
        { foodId: tunaId, grams: 140 },
        { foodId: riceId, grams: 110 },
        { foodId: avocadoId, grams: 75 }
      ],
      instructions: ['Mezclar el atún escurrido con limón, cilantro, aguacate en cubos y base de arroz.'],
      tags: ['Rápido', 'Definición']
    },
    {
      id: 'prop-col-8',
      name: 'Tortilla Nocturna de Pollo, Huevo y Queso',
      slot: 'Cena',
      prepTimeMinutes: 12,
      servings: 1,
      ingredients: [
        { foodId: chickenId, grams: 130 },
        { foodId: eggId, grams: 100 },
        { foodId: cheeseId, grams: 40 }
      ],
      instructions: ['Batir los huevos, rellenar con pollo previamente cocido y gratinar con el queso.'],
      tags: ['Baja en carbohidratos', 'Pérdida de grasa']
    },
    {
      id: 'prop-col-9',
      name: 'Pescado / Atún a la Plancha con Papa Cocida',
      slot: 'Cena',
      prepTimeMinutes: 18,
      servings: 1,
      ingredients: [
        { foodId: tunaId, grams: 170 },
        { foodId: potatoId, grams: 150 },
        { foodId: avocadoId, grams: 60 }
      ],
      instructions: ['Sellar el filete o lomo en sartén con ajo y servir con papa al vapor.'],
      tags: ['Ligero', 'Recuperación']
    },
    {
      id: 'prop-col-10',
      name: 'Bowl Post-Entreno de Yogur/Leche, Avena y Banano',
      slot: 'Snack',
      prepTimeMinutes: 5,
      servings: 1,
      ingredients: [
        { foodId: yogurtId, grams: 200 },
        { foodId: oatsId, grams: 50 },
        { foodId: bananaId, grams: 100 }
      ],
      instructions: ['Servir frío con rodajas de banano y hojuelas de avena.'],
      tags: ['Post-entreno', 'Rápido']
    },
    {
      id: 'prop-col-11',
      name: 'Tostada de Arepa con Queso y Huevo Cocido',
      slot: 'Snack',
      prepTimeMinutes: 8,
      servings: 1,
      ingredients: [
        { foodId: arepaId, grams: 80 },
        { foodId: cheeseId, grams: 50 },
        { foodId: eggId, grams: 60 }
      ],
      instructions: ['Tostar la arepa y colocar encima el queso fresco y huevo duro en rodajas.'],
      tags: ['Media tarde', 'Económico']
    }
  ];

  const existingNames = new Set(existingRecipes.map((r) => r.name.toLowerCase()));
  const filteredExtras = extraProposals.filter((p) => !existingNames.has(p.name.toLowerCase()));
  return [...existingRecipes, ...filteredExtras];
}

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
  const profileWithAvatar = db.profile as ProfileWithAvatar;

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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal-900/90 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="relative group shrink-0"
            title="Cambiar foto de perfil"
          >
            {profileWithAvatar.avatarUrl ? (
              <img
                src={profileWithAvatar.avatarUrl}
                alt={db.profile.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-lime-400 shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-lime-400/20 border-2 border-lime-400/50 text-lime-300 font-black text-lg flex items-center justify-center">
                {db.profile.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-lime-400 text-charcoal-950 flex items-center justify-center shadow">
              <Camera className="w-3.5 h-3.5" />
            </span>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Hola, {db.profile.name}
            </h1>
            <p className="text-xs text-slate-400">
              {new Date().toLocaleDateString('es-CO', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}{' '}
              • {db.profile.city}, Colombia • Objetivo: {GOAL_LABELS[db.profile.goal]}
            </p>
          </div>
        </div>

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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Proteína de Hoy"
          value={`${Math.round(todayNutrition.protein)}g / ${targets.proteinGrams}g`}
          subvalue={`${todayNutrition.calories} kcal de${targets.targetCalories} kcal est.`}
          icon={<Flame className="w-5 h-5" />}
          accent
        />
        <StatCard
          label="Entrenamientos y Cardio"
          value={`${db.workoutSessions.length} sesiones`}
          subvalue={`${weeklyKm.toFixed(1)} /${db.profile.weeklyRunningGoalKm} km running • ${totalActivityMinutes} min`}
          icon={<Dumbbell className="w-5 h-5" />}
        />
        <StatCard
          label="Peso e Hidratación"
          value={`${db.profile.weightKg} kg`}
          subvalue={`Agua hoy: ${latestWellness?.waterMl \vert{}\vert{} 0} /${
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
                ? `${nextPlannedMeal.day} (${nextPlannedMeal.time}) —${nextPlannedMeal.title}`
                : 'Sin comidas pendientes en el planificador'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-charcoal-800/90 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase">
              <Calendar className="w-4 h-4" /> Próxima Sesión Deportiva
            </div>
            <p className="text-sm font-bold text-white mt-1">
              {nextPlannedWorkout
                ? `${nextPlannedWorkout.day} (${nextPlannedWorkout.time}) —${nextPlannedWorkout.title}`
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
  const { db, updateProfile, notify } = useFitLocal();
  const [form, setForm] = useState<ProfileWithAvatar>(
    db.profile as ProfileWithAvatar
  );
  const [excludedInput, setExcludedInput] = useState(
    db.profile.excludedFoods.join(', ')
  );
  const [allergiesInput, setAllergiesInput] = useState(
    db.profile.allergies.join(', ')
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const targets = useMemo(() => calculateNutritionalTargets(form), [form]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 240;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          const updated = { ...form, avatarUrl: compressedDataUrl };
          setForm(updated);
          updateProfile(updated);
          notify('Foto de perfil actualizada y sincronizada.');
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = (url: string) => {
    const updated = { ...form, avatarUrl: url };
    setForm(updated);
    updateProfile(updated);
    notify('Avatar deportivo aplicado.');
  };

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
        title="Mi Perfil, Foto y Objetivos"
        subtitle="Personaliza tu foto de usuario, biometría, ciudad en Colombia y presupuesto."
      />

      <DisclaimerBanner text="Aviso de transparencia: Las necesidades calóricas y de macronutrientes se calculan mediante la ecuación predictiva de Mifflin-St Jeor como estimaciones orientativas. FITLOCAL no reemplaza el diagnóstico de un médico o nutricionista clínico." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-lime-400" /> Foto de Perfil e Identidad
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-charcoal-800/70 border border-slate-800">
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt={form.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-lime-400 shadow-lg shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-lime-400/20 border-2 border-lime-400/40 text-lime-300 font-black text-2xl flex items-center justify-center shrink-0">
                  {form.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-charcoal-950 font-extrabold text-xs flex items-center gap-1.5 transition"
                  >
                    <Camera className="w-4 h-4" /> Subir Foto desde Celular / PC
                  </button>
                  {form.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...form, avatarUrl: '' };
                        setForm(updated);
                        updateProfile(updated);
                      }}
                      className="px-3 py-2 rounded-xl bg-charcoal-900 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition"
                    >
                      Quitar foto
                    </button>
                  )}
                </div>

                <div>
                  <p className="text-[11px] text-slate-400 mb-1.5">
                    O elige un avatar rápido:
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av.label}
                        type="button"
                        onClick={() => handleSelectPresetAvatar(av.url)}
                        title={av.label}
                        className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-700 hover:border-lime-400 transition"
                      >
                        <img src={av.url} alt={av.label} className="w-full h-full" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

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

  const [proposalFilterSlot, setProposalFilterSlot] = useState<MealSlot | 'Todos'>('Todos');
  const [visibleProposalsCount, setVisibleProposalsCount] = useState(4);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const allMenuProposals = useMemo(() => {
    const bank = buildExtendedColombianMenuBank(db.foods, db.recipes);
    const excluded = db.profile.excludedFoods.map((s) => s.toLowerCase());
    const valid = bank.filter((rec) => {
      const matchesSlot =
        proposalFilterSlot === 'Todos' || rec.slot === proposalFilterSlot;
      const hasExcluded = rec.ingredients.some((ing) => {
        const f = db.foods.find((fo) => fo.id === ing.foodId);
        return f && excluded.some((ex) => f.name.toLowerCase().includes(ex));
      });
      return matchesSlot && !hasExcluded;
    });

    const listToUse = valid.length > 0 ? valid : bank;
    if (shuffleSeed === 0) return listToUse;
    return [...listToUse].sort((a, b) => {
      const hashA = (a.id.charCodeAt(0) + shuffleSeed * 17) % 13;
      const hashB = (b.id.charCodeAt(0) + shuffleSeed * 31) % 13;
      return hashA - hashB;
    });
  }, [db.foods, db.recipes, db.profile.excludedFoods, proposalFilterSlot, shuffleSeed]);

  const displayedProposals = allMenuProposals.slice(0, visibleProposalsCount);

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

  const handleShuffleProposals = () => {
    setShuffleSeed((s) => s + 1);
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
        subtitle="Registra tus comidas en gramos, calcula macros y costos por porción en COP o explora propuestas de menú."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4 h-fit">
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
                <Sparkles className="w-4 h-4 text-lime-400" /> Propuestas de Menú ({allMenuProposals.length})
              </h2>
              <p className="text-xs text-slate-400">
                Adaptadas a {formatCOP(db.profile.weeklyBudgetCOP)}/sem
              </p>
            </div>
            <button
              type="button"
              onClick={handleShuffleProposals}
              className="px-2.5 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-lime-400 border border-slate-700 text-xs font-bold flex items-center gap-1"
              title="Rotar orden de propuestas"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Rotar
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(['Todos', 'Desayuno', 'Almuerzo', 'Cena', 'Snack'] as const).map(
              (slotOption) => (
                <button
                  key={slotOption}
                  type="button"
                  onClick={() => {
                    setProposalFilterSlot(slotOption);
                    setVisibleProposalsCount(4);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                    proposalFilterSlot === slotOption
                      ? 'bg-lime-400 text-charcoal-950 border-lime-400'
                      : 'bg-charcoal-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {slotOption}
                </button>
              )
            )}
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {displayedProposals.map((rec) => {
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
                    • {macros.carbs}g Carbs • {macros.fats}g Grasas
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
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
                      className="py-1.5 px-2 rounded-lg bg-lime-400/15 hover:bg-lime-400/25 text-lime-300 text-xs font-bold border border-lime-400/30 transition"
                    >
                      + Consumir hoy
                    </button>
                    <button
                      type="button"
                      onClick={() => addOrUpdateRecipe(rec)}
                      className="py-1.5 px-2 rounded-lg bg-charcoal-900 hover:bg-charcoal-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1 transition"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5 text-lime-400" /> Guardar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleProposalsCount < allMenuProposals.length ? (
            <button
              type="button"
              onClick={() => setVisibleProposalsCount((c) => c + 4)}
              className="w-full py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-lime-400 font-extrabold text-xs border border-lime-400/30 flex items-center justify-center gap-1.5 transition"
            >
              <ChevronDown className="w-4 h-4" /> Cargar más propuestas (
              {allMenuProposals.length - visibleProposalsCount} restantes)
            </button>
          ) : (
            allMenuProposals.length > 4 && (
              <button
                type="button"
                onClick={() => setVisibleProposalsCount(4)}
                className="w-full py-2 rounded-xl bg-charcoal-900 text-slate-400 hover:text-white text-xs border border-slate-800 transition"
              >
                Mostrar menos propuestas
              </button>
            )
          )}
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
            <p key={idx}>{c}</p>
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