import React, { useMemo, useState } from 'react';
import {
  Download,
  History,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Upload,
  Wallet
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useFitLocal } from '../../context/FitLocalContext';
import { SupabaseReadyAdapter } from '../../services/storageService';
import { FoodCategory, StoreName } from '../../types/fitlocal';
import { formatCOP } from '../../utils/calculations';
import {
  Badge,
  Card,
  DisclaimerBanner,
  EmptyState,
  SectionHeader,
  StatCard
} from '../ui/CommonUI';

// ============================================================================
// 9. PROGRESO Y ESTADÍSTICAS
// ============================================================================
export const ProgressStatsView: React.FC = () => {
  const { db } = useFitLocal();
  const [range, setRange] = useState<'week' | 'month'>('week');

  const weightChartData = useMemo(() => {
    return [...db.wellnessLogs]
      .filter((w) => typeof w.weightKg === 'number')
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((w) => ({
        fecha: w.date.slice(5),
        PesoKg: w.weightKg,
        AguaLitros: Number((w.waterMl / 1000).toFixed(1))
      }));
  }, [db.wellnessLogs]);

  const avgCostPerMeal = useMemo(() => {
    if (db.mealLogs.length === 0) return 0;
    const sum = db.mealLogs.reduce((a, m) => a + m.estimatedCostCOP, 0);
    return Math.round(sum / db.mealLogs.length);
  }, [db.mealLogs]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Progreso y Estadísticas Reales"
        subtitle="Visualizaciones construidas exclusivamente a partir de tus mediciones y registros guardados."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRange('week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                range === 'week'
                  ? 'bg-lime-400 text-charcoal-950'
                  : 'bg-charcoal-800 text-slate-300'
              }`}
            >
              Vista Semanal
            </button>
            <button
              type="button"
              onClick={() => setRange('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                range === 'month'
                  ? 'bg-lime-400 text-charcoal-950'
                  : 'bg-charcoal-800 text-slate-300'
              }`}
            >
              Vista Mensual
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Coste Medio por Comida (Est.)"
          value={formatCOP(avgCostPerMeal)}
          subvalue={`Calculado sobre ${db.mealLogs.length} comidas`}
          icon={<Wallet className="w-5 h-5" />}
          accent
        />
        <StatCard
          label="Volumen Total Gimnasio"
          value={`${db.workoutSessions.reduce(
            (a, s) => a + s.totalVolumeKg,
            0
          )} kg`}
          subvalue={`${db.workoutSessions.length} sesiones completadas`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Cumplimiento de Hábitos"
          value={`${db.wellnessLogs.length} registros`}
          subvalue={`Filtro activo: ${range === 'week' ? '7 días' : '30 días'}`}
          icon={<ShieldCheck className="w-5 h-5" />}
        />
      </div>

      <Card className="space-y-4">
        <h2 className="text-base font-bold text-white">
          Evolución Medida del Peso Corporal (kg)
        </h2>
        {weightChartData.length < 2 ? (
          <EmptyState
            title="Historial insuficiente para trazar curva"
            description="Registra al menos 2 mediciones de peso en distintos días dentro de la sección 'Hábitos y Bienestar' para visualizar la tendencia real sin curvas ficticias."
          />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="fecha" stroke="#94A3B8" fontSize={12} />
                <YAxis
                  domain={['dataMin - 1', 'dataMax + 1']}
                  stroke="#94A3B8"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F141C',
                    borderColor: '#334155',
                    borderRadius: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="PesoKg"
                  stroke="#A3E635"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#A3E635' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};

// ============================================================================
// 10. PRESUPUESTO FITNESS (COP)
// ============================================================================
export const FitnessBudgetView: React.FC = () => {
  const { db, addExpense, deleteExpense } = useFitLocal();
  const [description, setDescription] = useState('');
  const [amountCOP, setAmountCOP] = useState(45000);
  const [store, setStore] = useState<StoreName>('D1');
  const [category, setCategory] = useState<
    FoodCategory | 'Suplementos' | 'Gimnasio'
  >('Proteínas');

  const realSpend = useMemo(
    () =>
      db.expenses
        .filter((e) => e.isRealExpense)
        .reduce((a, e) => a + e.amountCOP, 0),
    [db.expenses]
  );

  const estimatedShoppingSpend = useMemo(
    () => db.shoppingList.reduce((a, i) => a + i.estimatedCostCOP, 0),
    [db.shoppingList]
  );

  const availableWeekly = db.profile.weeklyBudgetCOP - realSpend;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amountCOP <= 0) return;
    addExpense({
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: description.trim(),
      category,
      store,
      amountCOP: Number(amountCOP),
      isRealExpense: true
    });
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Presupuesto Fitness y Control de Gastos (COP)"
        subtitle="Compara tu gasto real en supermercados frente al costo estimado del catálogo."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Gasto Real Registrado"
          value={formatCOP(realSpend)}
          subvalue={`Presupuesto semanal: ${formatCOP(
            db.profile.weeklyBudgetCOP
          )}`}
          icon={<Wallet className="w-5 h-5" />}
          accent
        />
        <StatCard
          label="Saldo Semanal Disponible"
          value={formatCOP(Math.max(0, availableWeekly))}
          subvalue={
            availableWeekly < 0
              ? `Excedido por ${formatCOP(Math.abs(availableWeekly))}`
              : 'Dentro del límite semanal'
          }
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Costo Estimado Lista de Compras"
          value={formatCOP(estimatedShoppingSpend)}
          subvalue={`Presupuesto mensual: ${formatCOP(
            db.profile.monthlyBudgetCOP
          )}`}
          icon={<ShieldCheck className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="space-y-4">
          <h2 className="text-base font-bold text-white">
            Registrar Compra Real en Supermercado
          </h2>
          <form onSubmit={handleAddExpense} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Descripción de la compra
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Mercado proteico quincenal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Tienda
                </label>
                <select
                  value={store}
                  onChange={(e) => setStore(e.target.value as StoreName)}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
                >
                  <option value="D1">D1</option>
                  <option value="Ara">Ara</option>
                  <option value="Olímpica">Olímpica</option>
                  <option value="Éxito">Éxito</option>
                  <option value="Mercado Local">Mercado Local</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as typeof category)
                  }
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
                >
                  <option value="Proteínas">Proteínas</option>
                  <option value="Carbohidratos">Carbohidratos</option>
                  <option value="Verduras">Verduras y Frutas</option>
                  <option value="Lácteos">Lácteos</option>
                  <option value="Suplementos">Suplementos</option>
                  <option value="Gimnasio">Mensualidad Gimnasio</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Valor pagado (COP)
              </label>
              <input
                type="number"
                step={1000}
                min={500}
                value={amountCOP}
                onChange={(e) => setAmountCOP(Number(e.target.value))}
                className="w-full rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 text-charcoal-950 font-extrabold text-xs transition"
            >
              Registrar Gasto Real
            </button>
          </form>
        </Card>

        <Card className="lg:col-span-2 space-y-3">
          <h2 className="text-base font-bold text-white">
            Movimientos de Presupuesto Registrados
          </h2>
          {db.expenses.length === 0 ? (
            <EmptyState
              title="Sin compras registradas"
              description="Añade tus facturas de mercado para comparar el gasto real con el presupuesto planificado."
            />
          ) : (
            <div className="space-y-2">
              {db.expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 rounded-xl bg-charcoal-800 border border-slate-700/80 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="lime">{exp.store}</Badge>
                      <Badge variant="slate">{exp.category}</Badge>
                      <span className="text-xs text-slate-400">{exp.date}</span>
                    </div>
                    <p className="text-sm font-bold text-white mt-1">
                      {exp.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-lime-400">
                      {formatCOP(exp.amountCOP)}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteExpense(exp.id)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// 11. HISTORIAL CENTRALIZADO, BÚSQUEDA Y EXPORTACIÓN (JSON / CSV)
// ============================================================================
export const HistoryView: React.FC = () => {
  const {
    db,
    deleteMealLog,
    deleteWorkoutSession,
    deleteCardioLog,
    deleteExpense,
    importDatabaseJson
  } = useFitLocal();

  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<
    'all' | 'meals' | 'workouts' | 'cardio' | 'expenses'
  >('all');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  const unifiedRecords = useMemo(() => {
    const items: {
      id: string;
      date: string;
      module: 'meals' | 'workouts' | 'cardio' | 'expenses';
      moduleLabel: string;
      title: string;
      detail: string;
      onDelete: () => void;
    }[] = [];

    db.mealLogs.forEach((m) =>
      items.push({
        id: m.id,
        date: m.date,
        module: 'meals',
        moduleLabel: 'Alimentación',
        title: `${m.slot}: ${m.title}`,
        detail: `${m.totalCalories} kcal • ${m.totalProtein}g Prot • ${formatCOP(
          m.estimatedCostCOP
        )}`,
        onDelete: () => deleteMealLog(m.id)
      })
    );

    db.workoutSessions.forEach((w) =>
      items.push({
        id: w.id,
        date: w.date,
        module: 'workouts',
        moduleLabel: 'Gimnasio',
        title: w.routineName,
        detail: `${w.durationMinutes} min • Volumen: ${w.totalVolumeKg} kg • RPE ${w.rpeEffort}`,
        onDelete: () => deleteWorkoutSession(w.id)
      })
    );

    db.cardioLogs.forEach((c) =>
      items.push({
        id: c.id,
        date: c.date,
        module: 'cardio',
        moduleLabel: 'Running/Cardio',
        title: `${c.type} (${c.distanceKm} km)`,
        detail: `${c.durationMinutes} min • ${c.notes}`,
        onDelete: () => deleteCardioLog(c.id)
      })
    );

    db.expenses.forEach((e) =>
      items.push({
        id: e.id,
        date: e.date,
        module: 'expenses',
        moduleLabel: 'Presupuesto',
        title: e.description,
        detail: `${e.store} • ${formatCOP(e.amountCOP)}`,
        onDelete: () => deleteExpense(e.id)
      })
    );

    return items
      .filter((item) =>
        moduleFilter === 'all' ? true : item.module === moduleFilter
      )
      .filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.detail.toLowerCase().includes(query.toLowerCase()) ||
          item.date.includes(query)
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [
    db.mealLogs,
    db.workoutSessions,
    db.cardioLogs,
    db.expenses,
    moduleFilter,
    query,
    deleteMealLog,
    deleteWorkoutSession,
    deleteCardioLog,
    deleteExpense
  ]);

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitlocal-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['Fecha,Modulo,Titulo,Detalle'];
    const rows = unifiedRecords.map(
      (r) =>
        `"${r.date}","${r.moduleLabel}","${r.title.replace(
          /"/g,
          '""'
        )}","${r.detail.replace(/"/g, '""')}"`
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitlocal-registros-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '');
      const res = importDatabaseJson(content);
      setImportFeedback(res.message);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Historial Centralizado y Copias de Seguridad"
        subtitle="Busca, filtra o elimina registros y exporta/importa toda tu información en formatos JSON y CSV."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportJSON}
              className="px-3.5 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-charcoal-950 font-extrabold text-xs flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Exportar JSON
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-lime-400" /> Exportar CSV
            </button>
            <label className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-4 h-4 text-sky-400" /> Importar JSON
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        }
      />

      {importFeedback && (
        <div className="p-3 rounded-xl bg-charcoal-800 border border-lime-400/40 text-xs text-lime-300">
          {importFeedback}
        </div>
      )}

      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="search"
              placeholder="Buscar por comida, rutina, fecha (YYYY-MM-DD) o tienda..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl bg-charcoal-800 border border-slate-700 pl-9 pr-3 py-2 text-xs text-white"
            />
          </div>
          <select
            value={moduleFilter}
            onChange={(e) =>
              setModuleFilter(e.target.value as typeof moduleFilter)
            }
            className="rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
          >
            <option value="all">Todos los módulos</option>
            <option value="meals">Alimentación</option>
            <option value="workouts">Gimnasio</option>
            <option value="cardio">Running y Cardio</option>
            <option value="expenses">Gastos COP</option>
          </select>
        </div>

        {unifiedRecords.length === 0 ? (
          <EmptyState
            title="No se encontraron registros"
            description="Prueba cambiando el término de búsqueda o el filtro de módulo."
          />
        ) : (
          <div className="space-y-2">
            {unifiedRecords.map((rec) => (
              <div
                key={`${rec.module}-${rec.id}`}
                className="p-3 rounded-xl bg-charcoal-800 border border-slate-700/80 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="lime">{rec.moduleLabel}</Badge>
                    <span className="text-xs text-slate-400">{rec.date}</span>
                  </div>
                  <p className="text-sm font-bold text-white mt-1">
                    {rec.title}
                  </p>
                  <p className="text-xs text-slate-400">{rec.detail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `¿Confirmas eliminar el registro "${rec.title}"?`
                      )
                    ) {
                      rec.onDelete();
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

// ============================================================================
// 12. CONFIGURACIÓN, PRIVACIDAD Y RESTABLECIMIENTO
// ============================================================================
export const SettingsView: React.FC = () => {
  const { db, clearDemoData, resetAllData } = useFitLocal();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Configuración, Privacidad y Almacenamiento"
        subtitle="Gestiona tus datos locales, consulta el estado del almacenamiento y restablece la plataforma."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-lime-400" /> Privacidad y
            Almacenamiento en el Navegador
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            En esta versión inicial (Esquema <strong>{db.schemaVersion}</strong>),
            todos tus registros de perfil, peso, medidas corporales, comidas,
            entrenamientos y gastos se guardan localmente en el{' '}
            <strong>LocalStorage de este navegador</strong> sin enviarse a
            servidores externos ni requerir claves privadas.
          </p>
          <div className="p-3.5 rounded-xl bg-charcoal-800 border border-slate-700 text-xs text-slate-300 space-y-1">
            <p className="font-bold text-amber-300">
              Importante sobre la persistencia local:
            </p>
            <p>
              • Si borras los datos de navegación del sitio o cambias de
              dispositivo/navegador, no verás esta información a menos que
              exportes una copia JSON desde la sección <strong>Historial</strong>.
            </p>
            <p>• {SupabaseReadyAdapter.getMigrationGuide()}</p>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-rose-400" /> Gestión de Datos de
            Demostración y Restablecimiento
          </h2>

          <div className="space-y-3">
            <button
              type="button"
              onClick={clearDemoData}
              className="w-full py-2.5 px-4 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-lime-400 font-bold text-xs border border-lime-400/30 transition text-left"
            >
              1. Eliminar únicamente los registros de demostración ([DEMO])
            </button>

            <button
              type="button"
              onClick={() => resetAllData(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 font-bold text-xs border border-slate-700 transition text-left"
            >
              2. Restaurar catálogo original y recargar datos de demostración
            </button>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold text-xs border border-rose-500/30 transition text-left"
              >
                3. Dejar aplicación completamente en cero (Sin registros de
                ejemplo)
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/50 space-y-2">
                <p className="text-xs text-rose-200 font-bold">
                  ¿Estás seguro? Esta acción borrará tus comidas, entrenamientos y
                  gastos actuales.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetAllData(false);
                      setConfirmReset(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold"
                  >
                    Sí, borrar registros
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-charcoal-800 text-slate-300 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};