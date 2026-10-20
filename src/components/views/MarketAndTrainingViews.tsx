import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRightLeft,
  CheckSquare,
  Clock,
  Dumbbell,
  FileDown,
  HeartPulse,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Share2,
  ShoppingBag,
  Sparkles,
  Trash2,
  Trophy,
  Volume2
} from 'lucide-react';
import { useFitLocal } from '../../context/FitLocalContext';
import {
  CardioActivityType,
  CompletedSet,
  LoggedExercise,
  ShoppingListItem,
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

const GYM_EXERCISE_CATALOG: {
  name: string;
  muscleGroup: string;
  defaultSets: number;
  defaultReps: number;
  defaultWeightKg: number;
}[] = [
  { name: 'Press de Banca Plano con Barra', muscleGroup: 'Pecho', defaultSets: 4, defaultReps: 10, defaultWeightKg: 50 },
  { name: 'Press Inclinado con Mancuernas', muscleGroup: 'Pecho', defaultSets: 4, defaultReps: 10, defaultWeightKg: 20 },
  { name: 'Aperturas en Polea / Peck Deck', muscleGroup: 'Pecho', defaultSets: 3, defaultReps: 12, defaultWeightKg: 25 },
  { name: 'Fondos en Paralelas (Dips)', muscleGroup: 'Pecho', defaultSets: 3, defaultReps: 10, defaultWeightKg: 0 },
  { name: 'Dominadas / Jalón al Pecho en Polea', muscleGroup: 'Espalda', defaultSets: 4, defaultReps: 10, defaultWeightKg: 45 },
  { name: 'Remo con Barra Prono', muscleGroup: 'Espalda', defaultSets: 4, defaultReps: 10, defaultWeightKg: 50 },
  { name: 'Remo Unilateral con Mancuerna', muscleGroup: 'Espalda', defaultSets: 3, defaultReps: 12, defaultWeightKg: 22 },
  { name: 'Remo en Polea Baja (Gironda)', muscleGroup: 'Espalda', defaultSets: 3, defaultReps: 12, defaultWeightKg: 45 },
  { name: 'Sentadilla Libre con Barra', muscleGroup: 'Pierna', defaultSets: 4, defaultReps: 8, defaultWeightKg: 70 },
  { name: 'Prensa de Piernas Inclinada 45°', muscleGroup: 'Pierna', defaultSets: 4, defaultReps: 12, defaultWeightKg: 120 },
  { name: 'Extensión de Cuádriceps en Máquina', muscleGroup: 'Pierna', defaultSets: 3, defaultReps: 15, defaultWeightKg: 45 },
  { name: 'Peso Muerto Rumano con Barra/Mancuernas', muscleGroup: 'Pierna', defaultSets: 4, defaultReps: 10, defaultWeightKg: 60 },
  { name: 'Curl Femoral Tumbado o Sentado', muscleGroup: 'Pierna', defaultSets: 3, defaultReps: 12, defaultWeightKg: 35 },
  { name: 'Elevación de Talones (Pantorrilla)', muscleGroup: 'Pierna', defaultSets: 4, defaultReps: 15, defaultWeightKg: 50 },
  { name: 'Hip Thrust con Barra (Empuje de Cadera)', muscleGroup: 'Glúteo', defaultSets: 4, defaultReps: 10, defaultWeightKg: 80 },
  { name: 'Zancadas / Sentadilla Búlgara con Mancuernas', muscleGroup: 'Glúteo', defaultSets: 3, defaultReps: 10, defaultWeightKg: 16 },
  { name: 'Patada de Glúteo en Polea', muscleGroup: 'Glúteo', defaultSets: 3, defaultReps: 15, defaultWeightKg: 15 },
  { name: 'Press Militar con Barra o Mancuernas', muscleGroup: 'Hombro', defaultSets: 4, defaultReps: 10, defaultWeightKg: 30 },
  { name: 'Elevaciones Laterales con Mancuernas', muscleGroup: 'Hombro', defaultSets: 4, defaultReps: 15, defaultWeightKg: 10 },
  { name: 'Face Pull en Polea Alta (Deltoide Posterior)', muscleGroup: 'Hombro', defaultSets: 3, defaultReps: 15, defaultWeightKg: 20 },
  { name: 'Curl de Bíceps con Barra Z', muscleGroup: 'Brazos', defaultSets: 3, defaultReps: 12, defaultWeightKg: 25 },
  { name: 'Curl Martillo con Mancuernas', muscleGroup: 'Brazos', defaultSets: 3, defaultReps: 12, defaultWeightKg: 14 },
  { name: 'Extensión de Tríceps en Polea con Cuerda', muscleGroup: 'Brazos', defaultSets: 3, defaultReps: 12, defaultWeightKg: 25 },
  { name: 'Press Francés / Rompecráneos', muscleGroup: 'Brazos', defaultSets: 3, defaultReps: 10, defaultWeightKg: 20 },
  { name: 'Plancha Abdominal Isométrica', muscleGroup: 'Core', defaultSets: 3, defaultReps: 45, defaultWeightKg: 0 },
  { name: 'Crunch Abdominal en Polea Alta', muscleGroup: 'Core', defaultSets: 3, defaultReps: 15, defaultWeightKg: 30 },
  { name: 'Elevación de Piernas Colgado', muscleGroup: 'Core', defaultSets: 3, defaultReps: 12, defaultWeightKg: 0 }
];

function playTimerBeep() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    [0, 0.22, 0.44].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime + offset);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.19);
    });
  } catch {
    // Ignorar si el navegador bloquea el audio sin interacción previa
  }
}

// ============================================================================
// 5. MERCADO COLOMBIANO Y LISTA DE COMPRAS INTELIGENTE (CON PDF Y WHATSAPP)
// ============================================================================
export const MarketShoppingView: React.FC = () => {
  const {
    db,
    notify,
    addOrUpdateFood,
    regenerateShoppingListFromPlan,
    updateShoppingList,
    saveCurrentShoppingListSnapshot,
    applyCheaperSwapInShoppingList
  } = useFitLocal();

  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState(8000);
  const [manualStore, setManualStore] = useState<StoreName>('D1');
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

  const handleExportShoppingListPDF = () => {
    if (db.shoppingList.length === 0) {
      notify('Primero genera o añade productos a tu lista de compras.');
      return;
    }

    const groupedByStore: Record<string, ShoppingListItem[]> = {};
    db.shoppingList.forEach((item) => {
      const storeKey = item.store || 'General';
      if (!groupedByStore[storeKey]) groupedByStore[storeKey] = [];
      groupedByStore[storeKey].push(item);
    });

    const dateFormatted = new Date().toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const storesSectionsHtml = Object.entries(groupedByStore)
      .map(([storeName, items]) => {
        const subtotal = items.reduce((a, b) => a + b.estimatedCostCOP, 0);
        const rowsHtml = items
          .map(
            (i) => `
            <tr style="${i.checked ? 'opacity: 0.55; text-decoration: line-through;' : ''}">
              <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; width: 36px; text-align: center;">
                <span style="display:inline-block; width:16px; height:16px; border:2px solid #0F172A; border-radius:4px; line-height:14px; font-weight:bold;">
                  ${i.checked ? '✓' : ''}
                </span>
              </td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; font-weight: 700; color: #0F172A;">
                ${i.name}
                <div style="font-size: 11px; font-weight: 500; color: #64748B;">Categoría: ${i.category}</div>
              </td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; color: #334155; font-size: 13px;">
                <strong>${i.purchasableUnitsText}</strong>
                <div style="font-size: 11px; color: #64748B;">Req. semanal: ${i.totalGramsNeeded}g</div>
              </td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: 800; color: #0F172A;">
                ${formatCOP(i.estimatedCostCOP)}
              </td>
            </tr>`
          )
          .join('');

        return `
          <div style="margin-bottom: 22px; border: 1px solid #CBD5E1; border-radius: 12px; overflow: hidden;">
            <div style="background: #0F172A; color: #FFFFFF; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 800; font-size: 14px; letter-spacing: 0.4px;">TIENDA / SUPERMERCADO: ${storeName.toUpperCase()}</span>
              <span style="background: #A3E635; color: #0F172A; font-weight: 800; font-size: 12px; padding: 3px 10px; border-radius: 99px;">
                Subtotal: ${formatCOP(subtotal)}
              </span>
            </div>
            <table style="width: 100%; border-collapse: collapse; background: #FFFFFF;">
              <thead>
                <tr style="background: #F8FAFC; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569;">
                  <th style="padding: 8px 12px; border-bottom: 1px solid #CBD5E1; text-align: center;">OK</th>
                  <th style="padding: 8px 12px; border-bottom: 1px solid #CBD5E1;">Producto</th>
                  <th style="padding: 8px 12px; border-bottom: 1px solid #CBD5E1;">Cantidad a Comprar</th>
                  <th style="padding: 8px 12px; border-bottom: 1px solid #CBD5E1; text-align: right;">Costo Est. (COP)</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        `;
      })
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Lista de Compras FITLOCAL - ${db.profile.name}</title>
        <style>
          body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0F172A; background: #F1F5F9; margin: 0; padding: 24px; }
          .sheet { max-width: 820px; margin: 0 auto; background: #FFFFFF; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
          .no-print-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 12px 16px; background: #0F172A; color: #FFF; border-radius: 12px; }
          .btn-print { background: #A3E635; color: #0F172A; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 13px; }
          @media print {
            body { background: #FFFFFF; padding: 0; }
            .sheet { box-shadow: none; padding: 10px; max-width: 100%; }
            .no-print-bar { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="no-print-bar">
            <span style="font-size: 13px;">Listo para guardar como PDF o imprimir desde tu celular o PC</span>
            <button class="btn-print" onclick="window.print()">Guardar en PDF / Imprimir</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0F172A; padding-bottom: 16px; margin-bottom: 20px;">
            <div>
              <div style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">FIT<span style="color: #65A30D;">LOCAL</span> COLOMBIA</div>
              <div style="font-size: 13px; color: #475569; margin-top: 4px;">Lista Inteligente de Mercado Fitness • ${dateFormatted}</div>
            </div>
            <div style="text-align: right; font-size: 13px;">
              <div><strong>Usuario:</strong> ${db.profile.name}</div>
              <div><strong>Ciudad:</strong> ${db.profile.city}, Colombia</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
            <div style="padding: 12px 16px; background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 10px;">
              <div style="font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: 700;">Total Estimado Lista</div>
              <div style="font-size: 20px; font-weight: 900; color: #0F172A; margin-top: 2px;">${formatCOP(totalListCOP)}</div>
            </div>
            <div style="padding: 12px 16px; background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 10px;">
              <div style="font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: 700;">Presupuesto Semanal</div>
              <div style="font-size: 20px; font-weight: 900; color: #65A30D; margin-top: 2px;">${formatCOP(db.profile.weeklyBudgetCOP)}</div>
            </div>
            <div style="padding: 12px 16px; background: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 10px;">
              <div style="font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: 700;">Total Productos</div>
              <div style="font-size: 20px; font-weight: 900; color: #0F172A; margin-top: 2px;">${db.shoppingList.length} ítems</div>
            </div>
          </div>

          ${storesSectionsHtml}

          <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #CBD5E1; font-size: 11px; color: #64748B; display: flex; justify-content: space-between;">
            <span>Generado por FITLOCAL (${window.location.host})</span>
            <span>Precios de referencia en Pesos Colombianos (COP)</span>
          </div>
        </div>
        <script>
          window.onload = function() { setTimeout(function() { window.print(); }, 350); };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      notify('Hoja de mercado en PDF generada.');
    } else {
      notify('Permite las ventanas emergentes para ver el PDF.');
    }
  };

  const handleShareWhatsApp = () => {
    if (db.shoppingList.length === 0) {
      notify('Tu lista está vacía.');
      return;
    }
    const lines = [
      `*LISTA DE MERCADO FITLOCAL (${db.profile.city.toUpperCase()})*`,
      `Usuario: ${db.profile.name}`,
      `-------------------------`,
      ...db.shoppingList.map(
        (i) =>
          `${i.checked ? '✅' : '⬜'} *${i.name}* — ${i.purchasableUnitsText} [${i.store}] (${formatCOP(i.estimatedCostCOP)})`
      ),
      `-------------------------`,
      `*TOTAL ESTIMADO:* ${formatCOP(totalListCOP)}`,
      `*PRESUPUESTO SEMANAL:* ${formatCOP(db.profile.weeklyBudgetCOP)}`
    ];
    const encoded = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Mercado Inteligente (${db.profile.city})`}
        subtitle="Precios editables en COP, exportación en PDF lista para ir a mercar y envío por WhatsApp."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={regenerateShoppingListFromPlan}
              className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-charcoal-950 font-extrabold text-xs flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4" /> Consolidar desde Plan Semanal
            </button>
            <button
              type="button"
              onClick={handleExportShoppingListPDF}
              className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white font-bold text-xs border border-lime-400/40 flex items-center gap-1.5 transition"
            >
              <FileDown className="w-4 h-4 text-lime-400" /> Exportar / Compartir PDF
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Share2 className="w-4 h-4 text-lime-400" /> WhatsApp
            </button>
          </div>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportShoppingListPDF}
                  className="px-3 py-1.5 rounded-xl bg-lime-400/15 hover:bg-lime-400/25 text-xs font-bold text-lime-300 border border-lime-400/30 flex items-center gap-1"
                >
                  <FileDown className="w-3.5 h-3.5" /> Descargar PDF
                </button>
                <button
                  type="button"
                  onClick={() =>
                    saveCurrentShoppingListSnapshot(
                      `Mercado ${new Date().toLocaleDateString('es-CO')}`
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-xs font-bold text-slate-200 border border-slate-700"
                >
                  Guardar en Historial
                </button>
              </div>
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
              description="Haz clic en 'Consolidar desde Plan Semanal' para sumar todos los ingredientes de tu semana sin duplicados."
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
            className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-3 border-t border-slate-800"
          >
            <input
              type="text"
              placeholder="Añadir artículo (ej: Café, Papel aluminio)"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className="sm:col-span-2 rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
            />
            <select
              value={manualStore}
              onChange={(e) => setManualStore(e.target.value as StoreName)}
              className="rounded-xl bg-charcoal-800 border border-slate-700 px-3 py-2 text-xs text-white"
            >
              <option value="D1">D1</option>
              <option value="Ara">Ara</option>
              <option value="Olímpica">Olímpica</option>
              <option value="Éxito">Éxito</option>
              <option value="Mercado Local">Mercado Local</option>
            </select>
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
              + Añadir
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
// 6. ENTRENAMIENTOS DE GIMNASIO, CREADOR DE EJERCICIOS Y CRONÓMETRO PRO
// ============================================================================
export const WorkoutsView: React.FC = () => {
  const { db, addWorkoutSession, addOrUpdateRoutine, notify } = useFitLocal();
  const [selectedRoutineId, setSelectedRoutineId] = useState(
    db.routines[0]?.id || ''
  );
  const [sessionDuration, setSessionDuration] = useState(55);
  const [sessionRpe, setSessionRpe] = useState(8);
  const [sessionNotes, setSessionNotes] = useState('');

  // Estados para agregar ejercicios del catálogo o personalizados
  const [muscleFilter, setMuscleFilter] = useState<string>('Todos');
  const [selectedCatalogExercise, setSelectedCatalogExercise] = useState(
    GYM_EXERCISE_CATALOG[0].name
  );
  const [customExName, setCustomExName] = useState('');
  const [customExMuscle, setCustomExMuscle] = useState('Pecho');
  const [customExSets, setCustomExSets] = useState(4);
  const [customExReps, setCustomExReps] = useState(10);
  const [customExWeight, setCustomExWeight] = useState(20);
  const [savePermanentlyToRoutine, setSavePermanentlyToRoutine] = useState(true);

  // Estados del Cronómetro Pro (Temporizador + Cronómetro Libre)
  const [timerMode, setTimerMode] = useState<'countdown' | 'stopwatch'>('countdown');
  const [selectedRestPreset, setSelectedRestPreset] = useState(90);
  const [customSecondsInput, setCustomSecondsInput] = useState(75);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerFinishedAlert, setTimerFinishedAlert] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setTimerSeconds((prev) => {
        if (timerMode === 'countdown') {
          if (prev <= 1) {
            setTimerRunning(false);
            setTimerFinishedAlert(true);
            playTimerBeep();
            return 0;
          }
          return prev - 1;
        } else {
          return prev + 1;
        }
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning, timerMode]);

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

  const filteredCatalog = useMemo(() => {
    if (muscleFilter === 'Todos') return GYM_EXERCISE_CATALOG;
    return GYM_EXERCISE_CATALOG.filter((e) => e.muscleGroup === muscleFilter);
  }, [muscleFilter]);

  const personalRecords = useMemo(
    () => calculatePersonalRecords(db.workoutSessions),
    [db.workoutSessions]
  );

  const handleAddExerciseFromCatalog = () => {
    const found =
      GYM_EXERCISE_CATALOG.find((e) => e.name === selectedCatalogExercise) ||
      GYM_EXERCISE_CATALOG[0];
    if (!found) return;

    const newLogged: LoggedExercise = {
      exerciseName: found.name,
      muscleGroup: found.muscleGroup,
      sets: Array.from({ length: found.defaultSets }, (_, idx) => ({
        setNumber: idx + 1,
        reps: found.defaultReps,
        weightKg: found.defaultWeightKg,
        completed: true
      }))
    };

    setLiveExercises((prev) => [...prev, newLogged]);

    if (savePermanentlyToRoutine && activeRoutine) {
      addOrUpdateRoutine({
        ...activeRoutine,
        exercises: [
          ...activeRoutine.exercises,
          {
            id: `ex-${Date.now()}`,
            name: found.name,
            muscleGroup: found.muscleGroup,
            targetSets: found.defaultSets,
            targetReps: String(found.defaultReps),
            targetWeightKg: found.defaultWeightKg,
            restSeconds: selectedRestPreset,
            equipment: 'Mancuernas'
          }
        ]
      });
    } else {
      notify(`"${found.name}" añadido a tu sesión de hoy.`);
    }
  };

  const handleAddCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExName.trim()) return;

    const setsCount = Math.max(1, Math.min(12, Number(customExSets) || 3));
    const repsCount = Math.max(1, Number(customExReps) || 10);
    const weightVal = Math.max(0, Number(customExWeight) || 0);

    const newLogged: LoggedExercise = {
      exerciseName: customExName.trim(),
      muscleGroup: customExMuscle,
      sets: Array.from({ length: setsCount }, (_, idx) => ({
        setNumber: idx + 1,
        reps: repsCount,
        weightKg: weightVal,
        completed: true
      }))
    };

    setLiveExercises((prev) => [...prev, newLogged]);

    if (savePermanentlyToRoutine && activeRoutine) {
      addOrUpdateRoutine({
        ...activeRoutine,
        exercises: [
          ...activeRoutine.exercises,
          {
            id: `ex-custom-${Date.now()}`,
            name: customExName.trim(),
            muscleGroup: customExMuscle,
            targetSets: setsCount,
            targetReps: String(repsCount),
            targetWeightKg: weightVal,
            restSeconds: selectedRestPreset,
            equipment: 'Mancuernas'
          }
        ]
      });
    } else {
      notify(`Ejercicio "${customExName.trim()}" añadido a la sesión.`);
    }

    setCustomExName('');
  };

  const handleAddSetToExercise = (exIdx: number) => {
    setLiveExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const lastSet = ex.sets[ex.sets.length - 1] || {
          reps: 10,
          weightKg: 20,
          completed: true
        };
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              setNumber: ex.sets.length + 1,
              reps: lastSet.reps,
              weightKg: lastSet.weightKg,
              completed: true
            }
          ]
        };
      })
    );
  };

  const handleRemoveLastSet = (exIdx: number) => {
    setLiveExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx || ex.sets.length <= 1) return ex;
        return { ...ex, sets: ex.sets.slice(0, -1) };
      })
    );
  };

  const handleRemoveExerciseFromSession = (exIdx: number) => {
    setLiveExercises((prev) => prev.filter((_, i) => i !== exIdx));
  };

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

  const selectTimerPreset = (secs: number) => {
    setTimerMode('countdown');
    setSelectedRestPreset(secs);
    setTimerSeconds(secs);
    setTimerFinishedAlert(false);
    setTimerRunning(true);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Entrenamientos de Gimnasio y Fuerza"
        subtitle="Añade ejercicios del catálogo o crea los tuyos propios, ajusta series en vivo y controla tus descansos con el Cronómetro Pro."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">
                  Sesión Activa de Entrenamiento
                </h2>
                <p className="text-xs text-slate-400">
                  Marca las series completadas, añade series extra o ajusta el peso levantado
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
                  key={`${ex.exerciseName}-${exIdx}`}
                  className="p-3.5 rounded-xl bg-charcoal-800 border border-slate-700/80 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {ex.exerciseName}
                      </span>
                      <Badge variant="lime">{ex.muscleGroup}</Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddSetToExercise(exIdx)}
                        className="px-2 py-1 rounded-lg bg-charcoal-900 hover:bg-charcoal-700 text-lime-400 border border-slate-700 text-[11px] font-bold"
                      >
                        + Serie
                      </button>
                      {ex.sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLastSet(exIdx)}
                          className="px-2 py-1 rounded-lg bg-charcoal-900 hover:bg-charcoal-700 text-slate-300 border border-slate-700 text-[11px]"
                        >
                          - Serie
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveExerciseFromSession(exIdx)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Quitar ejercicio de esta sesión"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                              if (e.target.checked && timerMode === 'countdown') {
                                setTimerSeconds(selectedRestPreset);
                                setTimerFinishedAlert(false);
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

          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-lime-400" /> Añadir Ejercicios o Crear Ejercicio Propio
                </h2>
                <p className="text-xs text-slate-400">
                  Elige de la biblioteca por músculo o escribe cualquier ejercicio específico
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={savePermanentlyToRoutine}
                  onChange={(e) => setSavePermanentlyToRoutine(e.target.checked)}
                  className="w-4 h-4 accent-lime-400 rounded"
                />
                <span>Guardar fijo en esta rutina</span>
              </label>
            </div>

            <div className="p-3.5 rounded-xl bg-charcoal-800/80 border border-slate-700/80 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {(['Todos', 'Pecho', 'Espalda', 'Pierna', 'Glúteo', 'Hombro', 'Brazos', 'Core'] as const).map(
                  (m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMuscleFilter(m);
                        const first =
                          m === 'Todos'
                            ? GYM_EXERCISE_CATALOG[0]
                            : GYM_EXERCISE_CATALOG.find((e) => e.muscleGroup === m);
                        if (first) setSelectedCatalogExercise(first.name);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                        muscleFilter === m
                          ? 'bg-lime-400 text-charcoal-950 border-lime-400'
                          : 'bg-charcoal-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  )
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedCatalogExercise}
                  onChange={(e) => setSelectedCatalogExercise(e.target.value)}
                  className="flex-1 rounded-xl bg-charcoal-900 border border-slate-700 px-3 py-2 text-xs text-white"
                >
                  {filteredCatalog.map((ex) => (
                    <option key={ex.name} value={ex.name}>
                      {ex.name} ({ex.muscleGroup} • {ex.defaultSets}x{ex.defaultReps})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddExerciseFromCatalog}
                  className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-charcoal-950 font-extrabold text-xs shrink-0 transition"
                >
                  + Añadir del Catálogo
                </button>
              </div>
            </div>

            <form
              onSubmit={handleAddCustomExercise}
              className="p-3.5 rounded-xl bg-charcoal-800/80 border border-slate-700/80 space-y-3"
            >
              <p className="text-xs font-bold text-lime-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Crear un ejercicio específico personalizado
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Nombre del ejercicio o máquina
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Sentadilla Hack / Remo T"
                    value={customExName}
                    onChange={(e) => setCustomExName(e.target.value)}
                    className="w-full rounded-xl bg-charcoal-900 border border-slate-700 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Músculo
                  </label>
                  <select
                    value={customExMuscle}
                    onChange={(e) => setCustomExMuscle(e.target.value)}
                    className="w-full rounded-xl bg-charcoal-900 border border-slate-700 px-2.5 py-2 text-xs text-white"
                  >
                    <option value="Pecho">Pecho</option>
                    <option value="Espalda">Espalda</option>
                    <option value="Pierna">Pierna</option>
                    <option value="Glúteo">Glúteo</option>
                    <option value="Hombro">Hombro</option>
                    <option value="Brazos">Brazos</option>
                    <option value="Core">Core</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Series
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={customExSets}
                      onChange={(e) => setCustomExSets(Number(e.target.value))}
                      className="w-full rounded-lg bg-charcoal-900 border border-slate-700 px-2 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Reps
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={customExReps}
                      onChange={(e) => setCustomExReps(Number(e.target.value))}
                      className="w-full rounded-lg bg-charcoal-900 border border-slate-700 px-2 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Kg
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={500}
                      value={customExWeight}
                      onChange={(e) => setCustomExWeight(Number(e.target.value))}
                      className="w-full rounded-lg bg-charcoal-900 border border-slate-700 px-2 py-2 text-xs text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-lime-400/20 hover:bg-lime-400 text-lime-300 hover:text-charcoal-950 border border-lime-400/40 font-extrabold text-xs transition"
                >
                  + Crear y Añadir
                </button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-3.5 text-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-lime-400">
                <Clock className="w-4 h-4" /> Cronómetro Pro
              </div>
              <div className="flex rounded-lg bg-charcoal-800 p-0.5 border border-slate-700 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerMode('countdown');
                    setTimerSeconds(selectedRestPreset);
                  }}
                  className={`px-2 py-1 rounded-md font-bold transition ${
                    timerMode === 'countdown'
                      ? 'bg-lime-400 text-charcoal-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Descanso
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerMode('stopwatch');
                    setTimerSeconds(0);
                    setTimerFinishedAlert(false);
                  }}
                  className={`px-2 py-1 rounded-md font-bold transition ${
                    timerMode === 'stopwatch'
                      ? 'bg-lime-400 text-charcoal-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Libre
                </button>
              </div>
            </div>

            <div
              className={`py-3 rounded-2xl border transition ${
                timerFinishedAlert
                  ? 'bg-lime-400/20 border-lime-400 animate-pulse'
                  : 'bg-charcoal-800/80 border-slate-800'
              }`}
            >
              <div className="text-4xl font-black text-white tracking-wider">
                {Math.floor(timerSeconds / 60)}:
                {String(timerSeconds % 60).padStart(2, '0')}
              </div>
              {timerFinishedAlert && (
                <p className="text-[11px] font-extrabold text-lime-300 mt-1 flex items-center justify-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" /> ¡Tiempo cumplido! Siguiente serie
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setTimerSeconds((s) => Math.max(0, s - 15))
                }
                className="px-2.5 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 text-xs border border-slate-700"
              >
                -15s
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerFinishedAlert(false);
                  setTimerRunning(!timerRunning);
                }}
                className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-charcoal-950 font-extrabold text-xs flex items-center gap-1.5"
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
                  setTimerFinishedAlert(false);
                  setTimerSeconds(
                    timerMode === 'countdown' ? selectedRestPreset : 0
                  );
                }}
                className="p-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 border border-slate-700"
                title="Reiniciar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTimerSeconds((s) => s + 15)}
                className="px-2.5 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 text-xs border border-slate-700"
              >
                +15s
              </button>
            </div>

            {timerMode === 'countdown' && (
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <p className="text-[11px] text-slate-400 font-semibold">
                  Tiempos rápidos de descanso:
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '20s', secs: 20 },
                    { label: '30s', secs: 30 },
                    { label: '45s', secs: 45 },
                    { label: '60s', secs: 60 },
                    { label: '90s', secs: 90 },
                    { label: '2m', secs: 120 },
                    { label: '3m', secs: 180 },
                    { label: '5m', secs: 300 }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => selectTimerPreset(preset.secs)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                        selectedRestPreset === preset.secs
                          ? 'bg-lime-400/20 text-lime-300 border-lime-400/50'
                          : 'bg-charcoal-800 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="number"
                    min={5}
                    max={1800}
                    value={customSecondsInput}
                    onChange={(e) => setCustomSecondsInput(Number(e.target.value))}
                    className="w-full rounded-lg bg-charcoal-800 border border-slate-700 px-2.5 py-1 text-xs text-white"
                    placeholder="Segundos..."
                  />
                  <button
                    type="button"
                    onClick={() =>
                      selectTimerPreset(Math.max(5, Number(customSecondsInput) || 60))
                    }
                    className="px-3 py-1 rounded-lg bg-charcoal-700 hover:bg-lime-400 hover:text-charcoal-950 text-white text-xs font-bold shrink-0 transition"
                  >
                    Fijar seg
                  </button>
                </div>
              </div>
            )}
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