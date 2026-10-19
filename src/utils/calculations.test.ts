import { describe, expect, it } from 'vitest';
import { INITIAL_COLOMBIAN_FOODS, INITIAL_RECIPES, createInitialDatabase } from '../data/colombiaCatalog';
import {
  buildConsolidatedShoppingList,
  calculateIngredientsTotals,
  calculateRunningMetrics,
  detectScheduleConflicts,
  validateBackupJson
} from './calculations';

describe('Motor de Cálculos FITLOCAL', () => {
  it('calcula proporcionalmente calorías, macros y costo en COP por gramos', () => {
    const result = calculateIngredientsTotals(
      [{ foodId: 'food-pollo', grams: 200 }],
      INITIAL_COLOMBIAN_FOODS
    );
    expect(result.calories).toBe(240);
    expect(result.protein).toBe(46);
    expect(result.costCOP).toBeGreaterThan(0);
  });

  it('evita NaN y división por cero en el cálculo de ritmo de carrera', () => {
    const zeroResult = calculateRunningMetrics(0, 0);
    expect(zeroResult.paceFormatted).toBe('0:00 /km');
    expect(zeroResult.speedKmH).toBe(0);

    const fiveK = calculateRunningMetrics(5, 25);
    expect(fiveK.paceFormatted).toBe('5:00 /km');
    expect(fiveK.speedKmH).toBe(12);
  });

  it('consolida ingredientes repetidos del plan semanal sin duplicar entradas', () => {
    const list = buildConsolidatedShoppingList(
      [
        {
          id: 'p1',
          day: 'Lunes',
          time: '08:00',
          type: 'meal',
          title: 'Desayuno 1',
          recipeId: 'rec-desayuno-costeno-fit',
          durationMinutes: 20,
          completed: false
        },
        {
          id: 'p2',
          day: 'Martes',
          time: '08:00',
          type: 'meal',
          title: 'Desayuno 2',
          recipeId: 'rec-desayuno-costeno-fit',
          durationMinutes: 20,
          completed: false
        }
      ],
      INITIAL_RECIPES,
      INITIAL_COLOMBIAN_FOODS,
      []
    );
    const eggs = list.find((i) => i.foodId === 'food-huevos');
    expect(eggs?.totalGramsNeeded).toBe(360);
  });

  it('detecta conflictos de horario en el mismo día', () => {
    const conflicts = detectScheduleConflicts([
      {
        id: '1',
        day: 'Lunes',
        time: '18:00',
        type: 'gym',
        title: 'Rutina A',
        durationMinutes: 60,
        completed: false
      },
      {
        id: '2',
        day: 'Lunes',
        time: '18:30',
        type: 'running',
        title: 'Carrera 5K',
        durationMinutes: 30,
        completed: false
      }
    ]);
    expect(conflicts.length).toBe(1);
  });

  it('valida correctamente la estructura de copias de seguridad JSON', () => {
    const validDb = createInitialDatabase();
    expect(validateBackupJson(validDb).valid).toBe(true);
    expect(validateBackupJson({ invalid: true }).valid).toBe(false);
  });
});