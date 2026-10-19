import { FitLocalDatabase, FoodItem, Recipe, WorkoutRoutine } from '../types/fitlocal';

export const COLOMBIAN_CITIES = [
  'Barranquilla',
  'Bogotá',
  'Medellín',
  'Cali',
  'Cartagena',
  'Santa Marta',
  'Bucaramanga',
  'Pereira'
];

export const INITIAL_COLOMBIAN_FOODS: FoodItem[] = [
  {
    id: 'food-huevos',
    name: 'Huevo de gallina (unidad ~60g)',
    category: 'Proteínas',
    caloriesPer100g: 155,
    proteinPer100g: 13,
    carbsPer100g: 1.1,
    fatsPer100g: 11,
    defaultPortionG: 120,
    estimatedPricePerKgOrUnitCOP: 18500,
    purchaseUnitLabel: 'Cubeta x30 unidades (1800g)',
    unitWeightGrams: 1800,
    commonStores: ['D1', 'Ara', 'Olímpica', 'Mercado Local'],
    lastUpdated: '2026-10-01',
    isEstimated: true
  },
  {
    id: 'food-pollo',
    name: 'Pechuga de pollo sin piel (cruda)',
    category: 'Proteínas',
    caloriesPer100g: 120,
    proteinPer100g: 23,
    carbsPer100g: 0,
    fatsPer100g: 2.6,
    defaultPortionG: 180,
    estimatedPricePerKgOrUnitCOP: 19800,
    purchaseUnitLabel: '1 Kilogramo (1000g)',
    unitWeightGrams: 1000,
    commonStores: ['Olímpica', 'D1', 'Ara', 'Mercado Local'],
    lastUpdated: '2026-10-01',
    isEstimated: true,
    cheaperAlternativeId: 'food-huevos'
  },
  {
    id: 'food-atun',
    name: 'Atún en agua escurrido',
    category: 'Proteínas',
    caloriesPer100g: 116,
    proteinPer100g: 25.5,
    carbsPer100g: 0,
    fatsPer100g: 1,
    defaultPortionG: 120,
    estimatedPricePerKgOrUnitCOP: 6200,
    purchaseUnitLabel: 'Lata escurrida (120g)',
    unitWeightGrams: 120,
    commonStores: ['D1', 'Ara', 'Olímpica'],
    lastUpdated: '2026-10-01',
    isEstimated: true,
    cheaperAlternativeId: 'food-pollo'
  },
  {
    id: 'food-pescado',
    name: 'Filete de Tilapia / Mojarra',
    category: 'Proteínas',
    caloriesPer100g: 96,
    proteinPer100g: 20.1,
    carbsPer100g: 0,
    fatsPer100g: 1.7,
    defaultPortionG: 200,
    estimatedPricePerKgOrUnitCOP: 22500,
    purchaseUnitLabel: '1 Kilogramo (1000g)',
    unitWeightGrams: 1000,
    commonStores: ['Olímpica', 'Mercado Local', 'Ara'],
    lastUpdated: '2026-10-01',
    isEstimated: true,
    cheaperAlternativeId: 'food-pollo'
  },
  {
    id: 'food-carne-magra',
    name: 'Carne de res magra (Centro de pierna / Bola)',
    category: 'Proteínas',
    caloriesPer100g: 143,
    proteinPer100g: 26,
    carbsPer100g: 0,
    fatsPer100g: 3.5,
    defaultPortionG: 160,
    estimatedPricePerKgOrUnitCOP: 32000,
    purchaseUnitLabel: '1 Kilogramo (1000g)',
    unitWeightGrams: 1000,
    commonStores: ['Olímpica', 'Éxito', 'Mercado Local'],
    lastUpdated: '2026-10-01',
    isEstimated: true,
    cheaperAlternativeId: 'food-pollo'
  },
  {
    id: 'food-leche',
    name: 'Leche semidescremada',
    category: 'Lácteos',
    caloriesPer100g: 47,
    proteinPer100g: 3.3,
    carbsPer100g: 4.8,
    fatsPer100g: 1.6,
    defaultPortionG: 250,
    estimatedPricePerKgOrUnitCOP: 4300,
    purchaseUnitLabel: 'Bolsa / Caja 1 Litro (1000ml)',
    unitWeightGrams: 1000,
    commonStores: ['D1', 'Ara', 'Olímpica'],
    lastUpdated: '2026-10-01',
    isEstimated: true
  },
  {
    id: 'food-yogur',
    name: 'Yogur Griego sin azúcar añadida',
    category: 'Lácteos',
    caloriesPer100g: 73,
    proteinPer100g: 10,
    carbsPer100g: 3.6,
    fatsPer100g: 2,
    defaultPortionG: 150,
    estimatedPricePerKgOrUnitCOP: 16900,
    purchaseUnitLabel: 'Pote 1000g',
    unitWeightGrams: 1000,
    commonStores: ['D1', 'Ara', 'Éxito'],
    lastUpdated: '2026-10-01',
    isEstimated: true,
    cheaperAlternativeId: 'food-leche'
  },
  {
    id: 'food-avena',
    name: 'Avena en hojuelas',
    category: 'Carbohidratos',
    caloriesPer100g: 389,
    proteinPer100g: 16.9,
    carbsPer100g: 66.3,
    fatsPer100g: 6.9,
    defaultPortionG: 60,
    estimatedPricePerKgOrUnitCOP: 6800,
    purchaseUnitLabel: 'Bolsa 1000g',
    unitWeightGrams: 1000,
    commonStores: ['D1', 'Ara', 'Olímpica'],
    lastUpdated: '2026-10-01',
    isEstimated: true
  },
  {
    id: 'food-arroz',
    name: 'Arroz blanco (cocido)',
    category: 'Carbohidratos',
    caloriesPer100g: 130,
    proteinPer100g: 2.7,
    carbsPer100g: 28,
    fatsPer100g: 0.3,
    defaultPortionG: 150,
    estimatedPricePerKgOrUnitCOP: 4900,
    purchaseUnitLabel: '1 Kilogramo (1000g)',
    unitWeightGrams: 1000,
    commonStores: ['D1', 'Ara', 'Olímpica', 'Mercado Local'],
    lastUpdated: '2026-10-01',
    isEstimated: true
  },
  {
    id: 'food-papa',
    name: 'Papa común cocida',
    category: 'Carbohidratos',
    caloriesPer100g: 87,
    proteinPer100g: 1.9,
    carbsPer100g: 20.1,
    fatsPer100g: 0.1,
    defaultPortionG: 200,
    estimatedPricePerKgOrUnitCOP: 4200,
    purchaseUnitLabel: '1 Kilogramo (1000g)',
    unitWeightGrams: 1000,
    commonStores: ['Mercado Local', 'Olímpica', 'Ara'],
    lastUpdated: '2026-10-01',
    isEstimated: true
  },
  {
    id: 'food-yuca',
    name: 'Yuca cocida',
    category: 'Carbohidratos',
    caloriesPer100g: 160,
    proteinPer100g: 1.4,
    carbsPer100g: 38,
    fatsPer100g: 0.3,
    defaultPortionG: 150,
    estimatedPricePerKgOrUnitCOP: 3800,
    purchaseUnitLabel: '1 Kilogramo (1000g)',
    unitWeightGrams: 1000,
    commonStores: ['Mercado Local', 'Olímpica'],
    lastUpdated: '2026-10-01',
    isEstimated: true
  },
  {
    id: 'food-platano',
    name: 'Plátano verde o maduro',
    category: 'Carbohidratos',
    caloriesPer100g: 122,
    proteinPer100g: 1.3,
    carbsPer100g: 31.9,
    fatsPer100g: 0.4,
    defaultPortionG: 150,
    estimatedPricePerKgOrUnitCOP: 4500,
    purchaseUnitLabel: '1 Kilogramo (1000g)',
    unitWeightGrams: 1000,
    commonStores: ['Mercado Local', 'Olímpica', 'Ara'],
    lastUpdated: '2026-10-01',
    isEstimated: true
  },
  {
    id: 'food-lentejas',
    name: 'Lentejas (cocidas)',
    category: 'Carbohidratos',
    caloriesPer100g: 116,
    proteinPer100g: 9,
    carbsPer100g: 20,
    fatsPer100g: 0.4,
    defaultPortionG: 180,
    estimatedPricePerKgOrUnitCOP: 7200,
    purchaseUnitLabel: 'Bolsa 1000g',
    unitWeightGrams: 1000,
    commonStores: ['D1', 'Ara', 'Olímpica'],
    lastUpdated: '2026-10-01',
    isEstimated: true
  },
  {
    id: 'food-frijoles',
    name: 'Fríjol rojo (cocido)',
    category: 'Carbohidratos',
    caloriesPer100g: 127,
    proteinPer100g: 8.7,
    carbsPer100g: 22.8,
    fatsPer100g: 0.5,
    defaultPortionG: 180,
    estimatedPricePerKgOrUnitCOP: 9500,
    purchaseUnitLabel: 'Bolsa 1000g',
    unitWeightGrams: 1000,
    commonStores: ['D1', 'Ara', 'Olímpica'],
    lastUpdated: '2026-10-01',
    isEstimated: true,
    cheaperAlternativeId: 'food-lentejas'
  },
  {
    id: 'food-garbanzos',
    name: 'Garbanzos (cocidos)',
    category: 'Carbohidratos',
    caloriesPer100g: 164,
    proteinPer100g: 8.9,
    carbsPer100g: 27.4,
    fatsPer100g: 2.6,
    defaultPortionG: 160,
    estimatedPricePerKgOrUnitCOP: 8900,
    purchaseUnitLabel: 'Bolsa 1000g',
    unitWeightGrams: 1000,
    commonStores: ['D1', 'Ara', 'Olímpica'],
    lastUpdated: '2026-10-01',
    isEstimated: true,
    cheaperAlternativeId: 'food-lentejas'
  },
  {
    id: 'food-arepa',
    name: 'Arepa de maíz blanca asada',
    category: 'Carbohidratos',
    caloriesPer100g: 218,
    proteinPer100g: 4.9,
    carbsPer100g: 45,
    fatsPer100g: 1.8,
    defaultPortionG: 100,
    estimatedPricePerKgOrUnitCOP: 4600,
    purchaseUnitLabel: 'Paquete Harina / Arepas 1000g',
    unitWeightGrams: 1000,
    commonStores: ['D1', 'Ara', 'Olímpica'],
    lastUpdated: '2026-10-01',
    isEstimated: true
  },
  {
    id: 'food-pan',
    name: 'Pan integral tajado',
    category: 'Carbohidratos',
    caloriesPer100g: 250,
    proteinPer100g: 9.5,
    carbsPer100g: 43,
    fatsPer100g: 3.5,
    defaultPortionG: 60,
    estimatedPricePerKgOrUnitCOP: 6500,
    purchaseUnitLabel: 'Paquete 500g',
    unitWeightGrams: 500,
    commonStores: ['D1', 'Ara', 'Olímpica'],
    lastUpdated: '2026-10-01',
    isEstimated: true,
    cheaperAlternativeId: 'food-arepa'
  },
  {
    id: 'food-banano',
    name: 'Banano criollo',
    category: 'Frutas',
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 22.8,
    fatsPer100g: 0.3,
    defaultPortionG: 120,
    estimatedPricePerKgOrUnitCOP: 3500,
    purchaseUnitLabel: '1 Kilogramo (1000g)',
    unitWeightGrams: 1000,
    commonStores: ['Mercado Local', 'Olímpica', 'Ara'],
    lastUpdated: '2026-10-01',
    isEstimated: true
  },
  {
    id: 'food-papaya',
    name: 'Papaya picada',
    category: 'Frutas',
    caloriesPer100g: 43,
    proteinPer100g: 0.5,
    carbsPer100g: 10.8,
    fatsPer100g: 0.3,
    defaultPortionG: 180,
    estimatedPricePerKgOrUnitCOP: 4000,
    purchaseUnitLabel: '1 Kilogramo (1000g)',
    unitWeightGrams: 1000,
    commonStores: ['Mercado Local', 'Olímpica'],
    lastUpdated: '2026-10-01',
    isEstimated: true
  },
  {
    id: 'food-pina',
    name: 'Piña oro miel',
    category: 'Frutas',
    caloriesPer100g: 50,
    proteinPer100g: 0.5,
    carbsPer100g: 13.1,
    fatsPer100g: 0.1,
    defaultPortionG: 150,
    estimatedPricePerKgOrUnitCOP: 4800,
    purchaseUnitLabel: '1 Kilogramo (1000g)',
    unitWeightGrams: 1000,
    commonStores: ['Mercado Local', 'Olímpica'],
    lastUpdated: '2026-10-01',
    isEstimated: true
  },
  {
    id: 'food-aguacate',
    name: 'Aguacate papelillo / Hass',
    category: 'Grasas saludables',
    caloriesPer100g: 160,
    proteinPer100g: 2,
    carbsPer100g: 8.5,
    fatsPer100g: 14.7,
    defaultPortionG: 80,
    estimatedPricePerKgOrUnitCOP: 9200,
    purchaseUnitLabel: '1 Kilogramo (1000g)',
    unitWeightGrams: 1000,
    commonStores: ['Mercado Local', 'Olímpica', 'Ara'],
    lastUpdated: '2026-10-01',
    isEstimated: true
  },
  {
    id: 'food-mani',
    name: 'Maní natural sin sal / Frutos secos',
    category: 'Grasas saludables',
    caloriesPer100g: 567,
    proteinPer100g: 25.8,
    carbsPer100g: 16.1,
    fatsPer100g: 49.2,
    defaultPortionG: 30,
    estimatedPricePerKgOrUnitCOP: 9800,
    purchaseUnitLabel: 'Bolsa 500g',
    unitWeightGrams: 500,
    commonStores: ['D1', 'Ara'],
    lastUpdated: '2026-10-01',
    isEstimated: true
  },
  {
    id: 'food-verduras',
    name: 'Mix de Tomate, Cebolla, Zanahoria y Espinaca',
    category: 'Verduras',
    caloriesPer100g: 28,
    proteinPer100g: 1.4,
    carbsPer100g: 5.5,
    fatsPer100g: 0.2,
    defaultPortionG: 150,
    estimatedPricePerKgOrUnitCOP: 5200,
    purchaseUnitLabel: '1 Kilogramo surtido (1000g)',
    unitWeightGrams: 1000,
    commonStores: ['Mercado Local', 'Olímpica', 'Ara'],
    lastUpdated: '2026-10-01',
    isEstimated: true
  }
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-desayuno-costeno-fit',
    name: 'Arepa Asada con Pericos Proteicos y Aguacate',
    slot: 'Desayuno',
    prepTimeMinutes: 12,
    servings: 1,
    ingredients: [
      { foodId: 'food-huevos', grams: 180 },
      { foodId: 'food-arepa', grams: 100 },
      { foodId: 'food-verduras', grams: 80 },
      { foodId: 'food-aguacate', grams: 60 }
    ],
    instructions: [
      'Sofríe tomate y cebolla picados en sartén antiadherente durante 2 minutos.',
      'Bate los 3 huevos, agrégalos al guiso y revuelve a fuego medio.',
      'Asa la arepa de maíz hasta dorar por ambos lados y acompaña con aguacate fresco.'
    ],
    tags: ['Alta proteína', 'Económico', 'Tradicional'],
    isFavorite: true
  },
  {
    id: 'rec-avena-power',
    name: 'Bowl de Avena, Yogur Griego, Banano y Maní',
    slot: 'Desayuno',
    prepTimeMinutes: 8,
    servings: 1,
    ingredients: [
      { foodId: 'food-avena', grams: 65 },
      { foodId: 'food-yogur', grams: 160 },
      { foodId: 'food-banano', grams: 110 },
      { foodId: 'food-mani', grams: 25 }
    ],
    instructions: [
      'Hidrata o cocina la avena en agua con canela durante 4 minutos.',
      'Sirve en un tazón y añade el yogur griego frío encima.',
      'Decora con rodajas de banano criollo y el maní natural.'
    ],
    tags: ['Rápido', 'Energía sostenida', 'Sin cocción larga'],
    isFavorite: true
  },
  {
    id: 'rec-almuerzo-pollo-arroz',
    name: 'Pechuga a la Plancha con Arroz, Lentejas y Ensalada',
    slot: 'Almuerzo',
    prepTimeMinutes: 25,
    servings: 1,
    ingredients: [
      { foodId: 'food-pollo', grams: 200 },
      { foodId: 'food-arroz', grams: 140 },
      { foodId: 'food-lentejas', grams: 130 },
      { foodId: 'food-verduras', grams: 140 },
      { foodId: 'food-aguacate', grams: 60 }
    ],
    instructions: [
      'Adoba la pechuga con ajo, limón, sal y pimienta; ásala 5 minutos por lado.',
      'Sirve con la porción medida de arroz blanco y lentejas guisadas.',
      'Acompaña con ensalada fresca de tomate, zanahoria y aguacate.'
    ],
    tags: ['Ganancia muscular', 'Almuerzo completo', 'Batch cooking'],
    isFavorite: true
  },
  {
    id: 'rec-cena-tilapia-patacon',
    name: 'Filete de Tilapia al Horno con Plátano Asado y Verduras',
    slot: 'Cena',
    prepTimeMinutes: 20,
    servings: 1,
    ingredients: [
      { foodId: 'food-pescado', grams: 210 },
      { foodId: 'food-platano', grams: 140 },
      { foodId: 'food-verduras', grams: 150 }
    ],
    instructions: [
      'Sazona el filete de tilapia con finas hierbas y limón; cocínalo en sartén o airfryer 12 min a 190°C.',
      'Asa el plátano en airfryer o horno sin freír en aceite profundo.',
      'Sirve con vegetales salteados al vapor.'
    ],
    tags: ['Ligero', 'Definición', 'Omega y Proteína']
  },
  {
    id: 'rec-snack-atun-papa',
    name: 'Ensalada Proteica de Atún con Papa Cocida',
    slot: 'Snack',
    prepTimeMinutes: 10,
    servings: 1,
    ingredients: [
      { foodId: 'food-atun', grams: 120 },
      { foodId: 'food-papa', grams: 150 },
      { foodId: 'food-verduras', grams: 100 }
    ],
    instructions: [
      'Escurre bien la lata de atún en agua.',
      'Mezcla con cubos de papa previamente cocida, tomate y cebolla picada.',
      'Agrega gotas de limón y cilantro fresco.'
    ],
    tags: ['Post-entreno', 'Rico en proteína']
  }
];

export const INITIAL_ROUTINES: WorkoutRoutine[] = [
  {
    id: 'rout-upper-a',
    name: 'Torso Fuerza e Hipertrofia (Empuje + Tracción)',
    muscleGroupFocus: 'Pecho, Espalda y Hombros',
    estimatedDurationMin: 55,
    exercises: [
      {
        id: 'ex-1',
        name: 'Press de Banca con Mancuernas o Barra',
        muscleGroup: 'Pecho',
        equipment: 'Mancuernas',
        targetSets: 4,
        targetReps: '8-10',
        targetWeightKg: 24,
        restSeconds: 90
      },
      {
        id: 'ex-2',
        name: 'Jalón al Pecho o Dominadas',
        muscleGroup: 'Espalda',
        equipment: 'Polea',
        targetSets: 4,
        targetReps: '10-12',
        targetWeightKg: 55,
        restSeconds: 90
      },
      {
        id: 'ex-3',
        name: 'Press Militar de Hombros',
        muscleGroup: 'Hombros',
        equipment: 'Mancuernas',
        targetSets: 3,
        targetReps: '10',
        targetWeightKg: 16,
        restSeconds: 75
      },
      {
        id: 'ex-4',
        name: 'Remo con Mancuerna a una mano',
        muscleGroup: 'Espalda',
        equipment: 'Mancuernas',
        targetSets: 3,
        targetReps: '12',
        targetWeightKg: 22,
        restSeconds: 75
      }
    ]
  },
  {
    id: 'rout-lower-a',
    name: 'Tren Inferior Completo y Core',
    muscleGroupFocus: 'Cuádriceps, Isquios y Glúteos',
    estimatedDurationMin: 60,
    exercises: [
      {
        id: 'ex-5',
        name: 'Sentadilla Libre o Hack Squat',
        muscleGroup: 'Piernas',
        equipment: 'Barra',
        targetSets: 4,
        targetReps: '8',
        targetWeightKg: 70,
        restSeconds: 120
      },
      {
        id: 'ex-6',
        name: 'Peso Muerto Rumano',
        muscleGroup: 'Isquiosurales',
        equipment: 'Barra',
        targetSets: 4,
        targetReps: '10',
        targetWeightKg: 65,
        restSeconds: 90
      },
      {
        id: 'ex-7',
        name: 'Zancadas Búlgaras con Mancuernas',
        muscleGroup: 'Glúteos y Cuádriceps',
        equipment: 'Mancuernas',
        targetSets: 3,
        targetReps: '10 por pierna',
        targetWeightKg: 16,
        restSeconds: 75
      }
    ]
  }
];

function getRelativeDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export function createInitialDatabase(): FitLocalDatabase {
  const today = getRelativeDate(0);
  const d1 = getRelativeDate(1);
  const d2 = getRelativeDate(2);
  const d3 = getRelativeDate(3);
  const d4 = getRelativeDate(4);

  return {
    schemaVersion: '1.0.0',
    hasDemoData: true,
    profile: {
      name: 'Atleta FitLocal',
      age: 24,
      heightCm: 175,
      weightKg: 74.5,
      physiologicalSex: 'male',
      goal: 'muscle_gain',
      activityLevel: 'moderate',
      experience: 'intermediate',
      availableDaysPerWeek: 4,
      trainingPlace: 'gym',
      dietaryPreference: 'Omnívoro alto en proteína',
      excludedFoods: [],
      allergies: [],
      mealsPerDay: 4,
      weeklyBudgetCOP: 160000,
      monthlyBudgetCOP: 640000,
      city: 'Barranquilla',
      preferredStores: ['D1', 'Ara', 'Olímpica', 'Mercado Local'],
      weeklyRunningGoalKm: 15,
      weeklyRunningSessionsGoal: 3,
      dailyWaterGoalMl: 2800,
      dailySleepGoalHours: 7.5
    },
    foods: INITIAL_COLOMBIAN_FOODS,
    recipes: INITIAL_RECIPES,
    mealLogs: [
      {
        id: 'demo-meal-1',
        date: today,
        slot: 'Desayuno',
        title: 'Arepa Asada con Pericos Proteicos y Aguacate [DEMO]',
        items: [
          { foodId: 'food-huevos', grams: 180 },
          { foodId: 'food-arepa', grams: 100 },
          { foodId: 'food-aguacate', grams: 60 }
        ],
        totalCalories: 593,
        totalProtein: 29.5,
        totalCarbs: 52.1,
        totalFats: 30.4,
        estimatedCostCOP: 2860,
        isDemo: true
      },
      {
        id: 'demo-meal-2',
        date: today,
        slot: 'Almuerzo',
        title: 'Pechuga a la Plancha con Arroz y Lentejas [DEMO]',
        items: [
          { foodId: 'food-pollo', grams: 220 },
          { foodId: 'food-arroz', grams: 150 },
          { foodId: 'food-lentejas', grams: 140 }
        ],
        totalCalories: 621,
        totalProtein: 67.3,
        totalCarbs: 70,
        totalFats: 6.7,
        estimatedCostCOP: 6100,
        isDemo: true
      },
      {
        id: 'demo-meal-3',
        date: d1,
        slot: 'Almuerzo',
        title: 'Almuerzo Completo Fit [DEMO]',
        items: [
          { foodId: 'food-pollo', grams: 200 },
          { foodId: 'food-papa', grams: 200 },
          { foodId: 'food-huevos', grams: 120 }
        ],
        totalCalories: 600,
        totalProtein: 65.4,
        totalCarbs: 41.5,
        totalFats: 18.6,
        estimatedCostCOP: 6033,
        isDemo: true
      }
    ],
    weeklyPlan: [
      {
        id: 'plan-1',
        day: 'Lunes',
        time: '07:30',
        type: 'meal',
        title: 'Arepa Asada con Pericos Proteicos y Aguacate',
        recipeId: 'rec-desayuno-costeno-fit',
        durationMinutes: 20,
        completed: true
      },
      {
        id: 'plan-2',
        day: 'Lunes',
        time: '13:00',
        type: 'meal',
        title: 'Pechuga a la Plancha con Arroz, Lentejas y Ensalada',
        recipeId: 'rec-almuerzo-pollo-arroz',
        durationMinutes: 30,
        completed: true
      },
      {
        id: 'plan-3',
        day: 'Lunes',
        time: '18:00',
        type: 'gym',
        title: 'Torso Fuerza e Hipertrofia',
        routineId: 'rout-upper-a',
        durationMinutes: 55,
        completed: true
      },
      {
        id: 'plan-4',
        day: 'Martes',
        time: '06:30',
        type: 'running',
        title: 'Rodaje Aeróbico 5K',
        subtitle: 'Ritmo cómodo conversacional',
        durationMinutes: 28,
        completed: true
      },
      {
        id: 'plan-5',
        day: 'Miércoles',
        time: '18:00',
        type: 'gym',
        title: 'Tren Inferior Completo y Core',
        routineId: 'rout-lower-a',
        durationMinutes: 60,
        completed: false
      },
      {
        id: 'plan-6',
        day: 'Jueves',
        time: '06:30',
        type: 'running',
        title: 'Series de Velocidad 6K',
        durationMinutes: 34,
        completed: false
      }
    ],
    shoppingList: [],
    savedShoppingLists: [],
    routines: INITIAL_ROUTINES,
    workoutSessions: [
      {
        id: 'demo-ws-1',
        date: d2,
        routineId: 'rout-upper-a',
        routineName: 'Torso Fuerza e Hipertrofia [DEMO]',
        durationMinutes: 52,
        rpeEffort: 8,
        notes: 'Excelente bombeo en press con mancuernas.',
        exercises: [
          {
            exerciseName: 'Press de Banca con Mancuernas o Barra',
            muscleGroup: 'Pecho',
            sets: [
              { setNumber: 1, reps: 10, weightKg: 24, completed: true },
              { setNumber: 2, reps: 10, weightKg: 26, completed: true },
              { setNumber: 3, reps: 8, weightKg: 28, completed: true }
            ]
          },
          {
            exerciseName: 'Jalón al Pecho o Dominadas',
            muscleGroup: 'Espalda',
            sets: [
              { setNumber: 1, reps: 12, weightKg: 55, completed: true },
              { setNumber: 2, reps: 10, weightKg: 60, completed: true }
            ]
          }
        ],
        totalVolumeKg: 1894,
        isDemo: true
      },
      {
        id: 'demo-ws-2',
        date: today,
        routineId: 'rout-lower-a',
        routineName: 'Tren Inferior Completo y Core [DEMO]',
        durationMinutes: 58,
        rpeEffort: 9,
        notes: ' Nuevo récord personal en sentadilla.',
        exercises: [
          {
            exerciseName: 'Sentadilla Libre o Hack Squat',
            muscleGroup: 'Piernas',
            sets: [
              { setNumber: 1, reps: 8, weightKg: 75, completed: true },
              { setNumber: 2, reps: 8, weightKg: 80, completed: true },
              { setNumber: 3, reps: 6, weightKg: 85, completed: true }
            ]
          }
        ],
        totalVolumeKg: 1750,
        isDemo: true
      }
    ],
    cardioLogs: [
      {
        id: 'demo-run-1',
        date: d3,
        time: '06:30',
        type: 'Running',
        durationMinutes: 27.5,
        distanceKm: 5.0,
        rpeEffort: 7,
        notes: 'Malecón / Parque local - clima fresco [DEMO]',
        isDemo: true
      },
      {
        id: 'demo-run-2',
        date: d1,
        time: '06:40',
        type: 'Running',
        durationMinutes: 37.8,
        distanceKm: 7.0,
        rpeEffort: 8,
        notes: 'Ritmo progresivo [DEMO]',
        isDemo: true
      }
    ],
    habitConfigs: [
      { id: 'hab-1', label: 'Alcanzar meta de proteína diaria', active: true },
      { id: 'hab-2', label: 'Caminar mínimo 8.000 pasos / 30 min', active: true },
      { id: 'hab-3', label: 'Dormir al menos 7.5 horas', active: true },
      { id: 'hab-4', label: 'Cero bebidas azucaradas o ultraprocesados', active: true }
    ],
    wellnessLogs: [
      {
        id: 'demo-well-4',
        date: d4,
        waterMl: 2500,
        sleepHours: 7.2,
        weightKg: 75.1,
        waistCm: 81,
        walkMinutes: 30,
        energyLevel: 4,
        completedHabitIds: ['hab-1', 'hab-2', 'hab-4'],
        isDemo: true
      },
      {
        id: 'demo-well-2',
        date: d2,
        waterMl: 2700,
        sleepHours: 7.8,
        weightKg: 74.8,
        waistCm: 80.7,
        walkMinutes: 35,
        energyLevel: 4,
        completedHabitIds: ['hab-1', 'hab-2', 'hab-3', 'hab-4'],
        isDemo: true
      },
      {
        id: 'demo-well-0',
        date: today,
        waterMl: 2400,
        sleepHours: 7.6,
        weightKg: 74.5,
        waistCm: 80.4,
        chestCm: 101,
        armCm: 36.5,
        walkMinutes: 40,
        energyLevel: 5,
        completedHabitIds: ['hab-1', 'hab-2', 'hab-3', 'hab-4'],
        isDemo: true
      }
    ],
    expenses: [
      {
        id: 'demo-exp-1',
        date: d3,
        description: 'Compra semanal proteínas y lácteos (Cubeta huevos, pechuga, yogur) [DEMO]',
        category: 'Proteínas',
        store: 'D1',
        amountCOP: 68500,
        isRealExpense: true,
        isDemo: true
      },
      {
        id: 'demo-exp-2',
        date: d1,
        description: 'Verduras, plátanos, aguacate y frutas de estación [DEMO]',
        category: 'Verduras',
        store: 'Mercado Local',
        amountCOP: 34000,
        isRealExpense: true,
        isDemo: true
      }
    ]
  };
}