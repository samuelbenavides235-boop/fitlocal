import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRightLeft,
  CheckSquare,
  Clock,
  HeartPulse,
  Pause,
  Play,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Trash2,
  Trophy
} from 'lucide-react';
import { useFitLocal } from '../../context/FitLocalContext';
import {
  CardioActivityType,
  CompletedSet,
  LoggedExercise,
  StoreName
} from '../../types/fitlocal';
import {
  calculatePersonalRecords,
  calculateRunningMetrics,
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

// ============================================================================
// 5. MERCADO COLOMBIANO Y LISTA DE COMPRAS INTELIGENTE
// ============================================================================
export const MarketShoppingView: React.FC = () => {
  const {
    db,
    addOrUpdateFood,
    regenerateShoppingListFromPlan,
    updateShoppingList,
    saveCurrentShoppingListSnapshot,
    applyCheaperSwapInShoppingList
  } = useFitLocal();

  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState(8000);
  const [manualStore] = useState<StoreName>('D1');
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [editedPrice, setEditedPrice] = useState<number>(0);

  const totalListCOP = useMemo(
    () => db.shoppingList.reduce((acc, i) => acc + i.estimatedCostCOP, 0),
    [db.shoppingList]
  );

  const budgetDiff = db.profile.weeklyBudgetCOP - totalListCOP;

  const handleAddManualShoppingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    updateShoppingList([
      ...db.shoppingList,
      {
        id: `shop-manual-${Date.now()}`,
        name: manualName.trim(),
        category: 'Otros productos',
        totalGramsNeeded: 1000,
        purchasableUnitsText: '1 unidad',
        estimatedCostCOP: Math.max(0, Number(manualPrice) || 0),
        store: manualStore,
        checked: false
      }
    ]);
    setManualName('');
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Mercado Inteligente (${db.profile.city})`}
        subtitle="Precios de referencia editables en pesos colombianos (COP) y lista consolidada a partir de tu menú semanal."
        action={
          <button
            type="button"
            onClick={regenerateShoppingListFromPlan}
            className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-charcoal-950 font-extrabold text-xs flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-4 h-4" /> Consolidar Lista desde Plan Semanal
          </button>
        }
      />

      <DisclaimerBanner text="Regla de transparencia sobre precios: Los precios del catálogo son estimaciones locales editables en COP para tiendas como D1, Ara, Olímpica, Éxito y plazas de mercado. No representan cotizaciones en tiempo real ni promociones verificadas." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-lime-400" /> Lista de Compras
                Consolidada
              </h2>
              <p className="text-xs text-slate-400">
                Total estimado:{' '}
                <strong className="text-white">{formatCOP(totalListCOP)}</strong>{' '}
                vs Presupuesto Semanal:{' '}
                <strong className="text-lime-400">
                  {formatCOP(db.profile.weeklyBudgetCOP)}
                </strong>
              </p>
            </div>
            {db.shoppingList.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  saveCurrentShoppingListSnapshot(
                    `Mercado ${new Date().toLocaleDateString('es-CO')}`
                  )
                }
                className="px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-xs font-bold text-lime-400 border border-slate-700"
              >
                Guardar Copia de Lista
              </button>
            )}
          </div>

          {budgetDiff < 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
              Tu lista supera el presupuesto semanal por{' '}
              <strong>{formatCOP(Math.abs(budgetDiff))}</strong>. Utiliza el botón{' '}
              <strong>"Opción económica"</strong> en productos con alternativa sugerida.
            </div>
          )}

          {db.shoppingList.length === 0 ? (
            <EmptyState
              title="Tu lista de compras está vacía"
              description="Haz clic en 'Consolidar Lista desde Plan Semanal' para sumar todos los ingredientes de tu semana sin duplicados."
              actionLabel="Generar Lista Consolidada Ahora"
              onAction={regenerateShoppingListFromPlan}
            />
          ) : (
            <div className="space-y-2.5">
              {db.shoppingList.map((item) => {
                const foodObj = db.foods.find((f) => f.id === item.foodId);
                const hasCheaper = Boolean(foodObj?.cheaperAlternativeId);
                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      item.checked
                        ? 'bg-charcoal-950/60 border-slate-800 opacity-60'
                        : 'bg-charcoal-800 border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() =>
                          updateShoppingList(
                            db.shoppingList.map((i) =>
                              i.id === item.id ? { ...i, checked: !i.checked } : i
                            )
                          )
                        }
                        className="mt-1 w-4 h-4 accent-lime-400 rounded"
                      />
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            item.checked ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          Requerido: {item.totalGramsNeeded}g • Compra sugerida:{' '}
                          <strong>{item.purchasableUnitsText}</strong> ({item.store})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {hasCheaper && (
                        <button
                          type="button"
                          onClick={() => applyCheaperSwapInShoppingList(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-lime-400/15 hover:bg-lime-400/25 text-lime-300 border border-lime-400/30 text-xs font-semibold flex items-center gap-1"
                          title="Sustituir por alternativa más económica de perfil proteico similar"
                        >
                          <ArrowRightLeft className="w-3 h-3" /> Opción económica
                        </button>
                      )}
                      <span className="text-sm font-extrabold text-lime-400">
                        {formatCOP(item.estimatedCostCOP)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateShoppingList(
                            db.shoppingList.filter((i) => i.id !== item.id)
                          )
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <form
            onSubmit={handleAddManualShoppingItem}
            className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800"
          >
            <input
              type="text"
              placeholder="Añadir artículo extra (ej: Café, Especias)"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className="sm:col-span-2 rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
            />
            <input
              type="number"
              step={500}
              value={manualPrice}
              onChange={(e) => setManualPrice(Number(e.target.value))}
              className="rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-charcoal-700 hover:bg-lime-400 hover:text-charcoal-950 text-white font-bold text-xs transition"
            >
              + Añadir a Lista
            </button>
          </form>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-base font-bold text-white">
            Catálogo Local Editable (COP)
          </h2>
          <p className="text-xs text-slate-400">
            Ajusta el precio según lo que observes en tu tienda habitual.
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {db.foods.map((food) => (
              <div
                key={food.id}
                className="p-2.5 rounded-xl bg-charcoal-800 border border-slate-700/80 text-xs space-y-1.5"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-white">{food.name}</span>
                  <Badge variant="slate">{food.category}</Badge>
                </div>
                <p className="text-slate-400">{food.purchaseUnitLabel}</p>
                <div className="flex items-center justify-between pt-1">
                  {editingFoodId === food.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        step={500}
                        value={editedPrice}
                        onChange={(e) => setEditedPrice(Number(e.target.value))}
                        className="w-24 rounded bg-charcoal-900 border border-lime-400 px-2 py-1 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addOrUpdateFood({
                            ...food,
                            estimatedPricePerKgOrUnitCOP: Math.max(100, editedPrice),
                            lastUpdated: new Date().toISOString().split('T')[0]
                          });
                          setEditingFoodId(null);
                        }}
                        className="px-2 py-1 rounded bg-lime-400 text-charcoal-950 font-bold"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-extrabold text-lime-400">
                        {formatCOP(food.estimatedPricePerKgOrUnitCOP)}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          (Est.)
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFoodId(food.id);
                          setEditedPrice(food.estimatedPricePerKgOrUnitCOP);
                        }}
                        className="text-slate-300 hover:text-lime-400 underline"
                      >
                        Editar precio
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// 6. ENTRENAMIENTOS DE GIMNASIO Y CRONÓMETRO DE DESCANSO
// ============================================================================
export const WorkoutsView: React.FC = () => {
  const { db, addWorkoutSession } = useFitLocal();
  const [selectedRoutineId, setSelectedRoutineId] = useState(
    db.routines[0]?.id || ''
  );
  const [sessionDuration, setSessionDuration] = useState(55);
  const [sessionRpe, setSessionRpe] = useState(8);
  const [sessionNotes, setSessionNotes] = useState('');

  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const activeRoutine = useMemo(
    () => db.routines.find((r) => r.id === selectedRoutineId) || db.routines[0],
    [db.routines, selectedRoutineId]
  );

  const [liveExercises, setLiveExercises] = useState<LoggedExercise[]>([]);

  useEffect(() => {
    if (!activeRoutine) return;
    setLiveExercises(
      activeRoutine.exercises.map((ex) => ({
        exerciseName: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: Array.from({ length: ex.targetSets }, (_, idx) => ({
          setNumber: idx + 1,
          reps: parseInt(ex.targetReps, 10) || 10,
          weightKg: ex.targetWeightKg,
          completed: true
        }))
      }))
    );
  }, [activeRoutine]);

  const personalRecords = useMemo(
    () => calculatePersonalRecords(db.workoutSessions),
    [db.workoutSessions]
  );

  const updateSetField = (
    exIdx: number,
    setIdx: number,
    field: keyof CompletedSet,
    value: number | boolean
  ) => {
    setLiveExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIdx
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, j) =>
                j !== setIdx ? s : { ...s, [field]: value }
              )
            }
      )
    );
  };

  const handleFinishSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoutine) return;
    let totalVolumeKg = 0;
    liveExercises.forEach((ex) =>
      ex.sets.forEach((s) => {
        if (s.completed) totalVolumeKg += s.reps * s.weightKg;
      })
    );

    addWorkoutSession({
      id: `ws-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      routineId: activeRoutine.id,
      routineName: activeRoutine.name,
      durationMinutes: sessionDuration,
      rpeEffort: sessionRpe,
      notes: sessionNotes.trim() || 'Sesión completada.',
      exercises: liveExercises,
      totalVolumeKg
    });
    setSessionNotes('');
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Entrenamientos de Gimnasio y Fuerza"
        subtitle="Registra series, repeticiones, peso levantado en kg, controla tus descansos y consulta tus récords personales."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">
                Sesión Activa de Entrenamiento
              </h2>
              <p className="text-xs text-slate-400">
                Marca las series completadas y ajusta el peso real levantado
              </p>
            </div>
            <select
              value={selectedRoutineId}
              onChange={(e) => setSelectedRoutineId(e.target.value)}
              className="rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white font-semibold"
            >
              {db.routines.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleFinishSession} className="space-y-4">
            {liveExercises.map((ex, exIdx) => (
              <div
                key={ex.exerciseName}
                className="p-3.5 rounded-xl bg-charcoal-800 border border-slate-700/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    {ex.exerciseName}
                  </span>
                  <Badge variant="lime">{ex.muscleGroup}</Badge>
                </div>

                <div className="space-y-1.5">
                  {ex.sets.map((s, setIdx) => (
                    <div
                      key={s.setNumber}
                      className="grid grid-cols-4 gap-2 items-center text-xs bg-charcoal-900/90 px-3 py-1.5 rounded-lg"
                    >
                      <span className="font-bold text-slate-400">
                        Serie #{s.setNumber}
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={500}
                          value={s.weightKg}
                          onChange={(e) =>
                            updateSetField(
                              exIdx,
                              setIdx,
                              'weightKg',
                              Number(e.target.value)
                            )
                          }
                          className="w-16 rounded bg-charcoal-800 border border-slate-700 px-2 py-1 text-white"
                        />
                        <span className="text-slate-400">kg</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={s.reps}
                          onChange={(e) =>
                            updateSetField(
                              exIdx,
                              setIdx,
                              'reps',
                              Number(e.target.value)
                            )
                          }
                          className="w-14 rounded bg-charcoal-800 border border-slate-700 px-2 py-1 text-white"
                        />
                        <span className="text-slate-400">reps</span>
                      </div>
                      <label className="flex items-center justify-end gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={s.completed}
                          onChange={(e) => {
                            updateSetField(
                              exIdx,
                              setIdx,
                              'completed',
                              e.target.checked
                            );
                            if (e.target.checked) {
                              setTimerSeconds(90);
                              setTimerRunning(true);
                            }
                          }}
                          className="w-4 h-4 accent-lime-400"
                        />
                        <span className="text-slate-300">Hecho</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Duración total (min)
                </label>
                <input
                  type="number"
                  min={10}
                  max={240}
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(Number(e.target.value))}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Sensación de Esfuerzo (RPE 1-10)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={sessionRpe}
                  onChange={(e) => setSessionRpe(Number(e.target.value))}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Notas de la sesión
                </label>
                <input
                  type="text"
                  placeholder="Ej: Subí 2.5kg en press"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-charcoal-950 font-extrabold text-xs transition"
            >
              Guardar Entrenamiento y Calcular Volumen
            </button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase text-lime-400">
              <Clock className="w-4 h-4" /> Cronómetro de Descanso
            </div>
            <div className="text-4xl font-extrabold text-white tracking-wider">
              {Math.floor(timerSeconds / 60)}:
              {String(timerSeconds % 60).padStart(2, '0')}
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setTimerRunning(!timerRunning)}
                className="px-3.5 py-1.5 rounded-xl bg-lime-400 text-charcoal-950 font-bold text-xs flex items-center gap-1"
              >
                {timerRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Iniciar
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSeconds(90);
                }}
                className="px-3 py-1.5 rounded-xl bg-charcoal-800 text-slate-200 text-xs border border-slate-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 90s
              </button>
              <button
                type="button"
                onClick={() => setTimerSeconds((s) => s + 30)}
                className="px-2.5 py-1.5 rounded-xl bg-charcoal-800 text-slate-200 text-xs border border-slate-700"
              >
                +30s
              </button>
            </div>
          </Card>

          <Card className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-lime-400" /> Récords Personales (PR)
            </h2>
            {personalRecords.length === 0 ? (
              <p className="text-xs text-slate-400">
                Registra tu primera sesión para calcular tus récords máximos.
              </p>
            ) : (
              <div className="space-y-2">
                {personalRecords.map((pr) => (
                  <div
                    key={pr.exerciseName}
                    className="p-2.5 rounded-xl bg-charcoal-800 border border-slate-700/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{pr.exerciseName}</p>
                      <p className="text-slate-400">{pr.date}</p>
                    </div>
                    <Badge variant="lime">
                      {pr.maxWeightKg} kg x {pr.bestSetReps}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. RUNNING, CARDIO Y ACTIVIDADES
// ============================================================================
export const RunningCardioView: React.FC = () => {
  const { db, addCardioLog, deleteCardioLog } = useFitLocal();
  const [type, setType] = useState<CardioActivityType>('Running');
  const [distanceKm, setDistanceKm] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(28);
  const [notes, setNotes] = useState('');

  const liveMetrics = useMemo(
    () => calculateRunningMetrics(distanceKm, durationMinutes),
    [distanceKm, durationMinutes]
  );

  const runningSummary = useMemo(() => {
    const runs = db.cardioLogs.filter((c) => c.type === 'Running');
    const totalKm = runs.reduce((a, r) => a + r.distanceKm, 0);
    const totalMin = runs.reduce((a, r) => a + r.durationMinutes, 0);
    const bestKm = runs.reduce((max, r) => Math.max(max, r.distanceKm), 0);
    const avgMetrics = calculateRunningMetrics(totalKm, totalMin);
    return { totalKm, totalMin, bestKm, avgPace: avgMetrics.paceFormatted };
  }, [db.cardioLogs]);

  const handleAddRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (durationMinutes <= 0) return;
    addCardioLog({
      id: `run-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      type,
      distanceKm: Math.max(0.1, Number(distanceKm)),
      durationMinutes: Math.max(1, Number(durationMinutes)),
      notes: notes.trim() || 'Registro manual completado.'
    });
    setNotes('');
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Running, Ciclismo y Cardio"
        subtitle="Calcula automáticamente tu ritmo medio (min/km), velocidad (km/h) y progreso hacia tu meta semanal."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Distancia Acumulada Running"
          value={`${runningSummary.totalKm.toFixed(1)} km`}
          subvalue={`Meta semanal: ${db.profile.weeklyRunningGoalKm} km`}
          icon={<Activity className="w-5 h-5" />}
          accent
        />
        <StatCard
          label="Ritmo Medio Global"
          value={runningSummary.avgPace}
          subvalue="Calculado sobre carreras registradas"
          icon={<Clock className="w-5 h-5" />}
        />
        <StatCard
          label="Mejor Distancia"
          value={`${runningSummary.bestKm.toFixed(1)} km`}
          subvalue="Mayor fondo registrado"
          icon={<Trophy className="w-5 h-5" />}
        />
        <StatCard
          label="Tiempo Acumulado"
          value={`${Math.round(runningSummary.totalMin)} min`}
          subvalue={`${db.cardioLogs.length} sesiones totales`}
          icon={<HeartPulse className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="space-y-4">
          <h2 className="text-base font-bold text-white">
            Registrar Carrera o Cardio Manual
          </h2>
          <form onSubmit={handleAddRun} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Tipo de actividad
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CardioActivityType)}
                className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
              >
                <option value="Running">Running / Trote</option>
                <option value="Caminata">Caminata Rápida</option>
                <option value="Ciclismo">Ciclismo / Bicicleta</option>
                <option value="Cardio HIIT">Cardio HIIT</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Distancia (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0.1}
                  max={200}
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={1}
                  max={600}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-charcoal-800 border border-slate-700 text-xs flex justify-between">
              <span>
                Ritmo calculado:{' '}
                <strong className="text-lime-400">
                  {liveMetrics.paceFormatted}
                </strong>
              </span>
              <span>
                Velocidad: <strong>{liveMetrics.speedKmH} km/h</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Observaciones / Ruta
              </label>
              <input
                type="text"
                placeholder="Ej: Malecón del Río - series suaves"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-charcoal-950 font-extrabold text-xs transition"
            >
              Guardar Actividad Cardiovascular
            </button>
          </form>
        </Card>

        <Card className="lg:col-span-2 space-y-3">
          <h2 className="text-base font-bold text-white">
            Historial de Sesiones de Running y Cardio
          </h2>
          {db.cardioLogs.length === 0 ? (
            <EmptyState
              title="Sin actividades registradas"
              description="Registra tu primera sesión de running, caminata o ciclismo en el panel izquierdo."
            />
          ) : (
            <div className="space-y-2.5">
              {db.cardioLogs.map((log) => {
                const m = calculateRunningMetrics(
                  log.distanceKm,
                  log.durationMinutes
                );
                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-charcoal-800 border border-slate-700/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="lime">{log.type}</Badge>
                        <span className="text-xs text-slate-400">
                          {log.date} • {log.time}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white mt-1">
                        {log.distanceKm} km en {log.durationMinutes} min — Ritmo:{' '}
                        <span className="text-lime-400">{m.paceFormatted}</span> (
                        {m.speedKmH} km/h)
                      </p>
                      <p className="text-xs text-slate-400">{log.notes}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteCardioLog(log.id)}
                      className="p-2 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// 8. ACTIVIDADES, HÁBITOS Y BIENESTAR
// ============================================================================
export const HabitsWellnessView: React.FC = () => {
  const { db, upsertWellnessLog, toggleHabitConfig, addCustomHabit } =
    useFitLocal();
  const todayStr = new Date().toISOString().split('T')[0];
  const existingToday =
    db.wellnessLogs.find((w) => w.date === todayStr) || db.wellnessLogs[0];

  const [waterMl, setWaterMl] = useState(existingToday?.waterMl || 2000);
  const [sleepHours, setSleepHours] = useState(existingToday?.sleepHours || 7.5);
  const [weightKg, setWeightKg] = useState(
    existingToday?.weightKg || db.profile.weightKg
  );
  const [waistCm, setWaistCm] = useState(existingToday?.waistCm || 80);
  const [walkMinutes] = useState(existingToday?.walkMinutes || 30);
  const [completedHabits, setCompletedHabits] = useState<string[]>(
    existingToday?.completedHabitIds || []
  );
  const [newHabitLabel, setNewHabitLabel] = useState('');

  const toggleCompletedHabit = (id: string) => {
    setCompletedHabits((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSaveWellness = (e: React.FormEvent) => {
    e.preventDefault();
    upsertWellnessLog({
      id: `well-${todayStr}`,
      date: todayStr,
      waterMl,
      sleepHours,
      weightKg,
      waistCm,
      walkMinutes,
      energyLevel: 4,
      completedHabitIds: completedHabits
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Hábitos Diarios, Hidratación y Bienestar"
        subtitle="Lleva un registro amable y privado de tu descanso, agua, peso corporal y hábitos saludables."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <h2 className="text-base font-bold text-white">
            Registro Biométrico y de Bienestar ({todayStr})
          </h2>
          <form onSubmit={handleSaveWellness} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Agua consumida hoy (ml) — Meta: {db.profile.dailyWaterGoalMl} ml
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step={250}
                    min={0}
                    max={8000}
                    value={waterMl}
                    onChange={(e) => setWaterMl(Number(e.target.value))}
                    className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setWaterMl((w) => w + 250)}
                    className="px-3 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold shrink-0"
                  >
                    +250ml
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Horas de sueño anoche
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  max={16}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Peso corporal hoy (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={35}
                  max={250}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Cintura opcional privada (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={waistCm}
                  onChange={(e) => setWaistCm(Number(e.target.value))}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-charcoal-950 font-extrabold text-xs transition"
            >
              Guardar Registro de Bienestar de Hoy
            </button>
          </form>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-lime-400" /> Mis Hábitos Activos
          </h2>
          <div className="space-y-2">
            {db.habitConfigs.map((hab) => (
              <div
                key={hab.id}
                className="flex items-center justify-between p-3 rounded-xl bg-charcoal-800 border border-slate-700 text-xs"
              >
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!hab.active}
                    checked={completedHabits.includes(hab.id)}
                    onChange={() => toggleCompletedHabit(hab.id)}
                    className="w-4 h-4 accent-lime-400"
                  />
                  <span
                    className={
                      hab.active ? 'text-white font-semibold' : 'text-slate-500'
                    }
                  >
                    {hab.label}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => toggleHabitConfig(hab.id)}
                  className="text-slate-400 hover:text-white underline"
                >
                  {hab.active ? 'Pausar' : 'Activar'}
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Añadir hábito propio (ej: Meditar 10 min)"
              value={newHabitLabel}
              onChange={(e) => setNewHabitLabel(e.target.value)}
              className="flex-1 rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
            />
            <button
              type="button"
              onClick={() => {
                addCustomHabit(newHabitLabel);
                setNewHabitLabel('');
              }}
              className="px-4 py-2 rounded-xl bg-charcoal-700 hover:bg-lime-400 hover:text-charcoal-950 text-white font-bold text-xs transition"
            >
              + Crear Hábito
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};