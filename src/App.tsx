import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  CheckSquare,
  Cloud,
  Dumbbell,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingBag,
  UserCheck,
  Utensils,
  Wallet
} from 'lucide-react';
import { FitLocalProvider, useFitLocal } from './context/FitLocalContext';
import { NavigationTab } from './types/fitlocal';
import { AuthView } from './components/views/AuthView';
import {
  DashboardView,
  MealPlannerView,
  NutritionView,
  ProfileGoalsView
} from './components/views/CoreViews';
import {
  HabitsWellnessView,
  MarketShoppingView,
  RunningCardioView,
  WorkoutsView
} from './components/views/MarketAndTrainingViews';
import {
  FitnessBudgetView,
  HistoryView,
  ProgressStatsView,
  SettingsView
} from './components/views/AnalyticsBudgetHistoryViews';

const NAV_ITEMS: {
  id: NavigationTab;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}[] = [
  { id: 'dashboard', label: '1. Dashboard', shortLabel: 'Inicio', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'profile', label: '2. Mi Perfil y Objetivos', shortLabel: 'Perfil', icon: <UserCheck className="w-4 h-4" /> },
  { id: 'nutrition', label: '3. Alimentación', shortLabel: 'Comidas', icon: <Utensils className="w-4 h-4" /> },
  { id: 'planner', label: '4. Planificador Semanal', shortLabel: 'Plan', icon: <Calendar className="w-4 h-4" /> },
  { id: 'market', label: '5. Mercado y Compras', shortLabel: 'Mercado', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'workouts', label: '6. Entrenamientos', shortLabel: 'Gym', icon: <Dumbbell className="w-4 h-4" /> },
  { id: 'running', label: '7. Running y Cardio', shortLabel: 'Running', icon: <Activity className="w-4 h-4" /> },
  { id: 'habits', label: '8. Hábitos y Bienestar', shortLabel: 'Hábitos', icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'stats', label: '9. Progreso y Estadísticas', shortLabel: 'Progreso', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'budget', label: '10. Presupuesto Fitness', shortLabel: 'Gastos', icon: <Wallet className="w-4 h-4" /> },
  { id: 'history', label: '11. Historial y Backup', shortLabel: 'Historial', icon: <History className="w-4 h-4" /> },
  { id: 'settings', label: '12. Configuración', shortLabel: 'Ajustes', icon: <Settings className="w-4 h-4" /> }
];

const FitLocalShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [bypassAuthLocal, setBypassAuthLocal] = useState(false);
  const { db, userEmail, cloudSyncStatus, signOutUser, toastMessage } = useFitLocal();

  if (!userEmail && !bypassAuthLocal) {
    return <AuthView onUseLocalMode={() => setBypassAuthLocal(true)} />;
  }

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col lg:flex-row">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-charcoal-900 border-r border-slate-800/80 p-4">
        <div className="flex items-center gap-2.5 px-2 py-3 border-b border-slate-800 mb-4">
          <div className="w-8 h-8 rounded-xl bg-lime-400 flex items-center justify-center text-charcoal-950 font-black text-lg">
            F
          </div>
          <div>
            <span className="font-black tracking-tight text-white text-lg">
              FIT<span className="text-lime-400">LOCAL</span>
            </span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
              {db.profile.city} • COP
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  active
                    ? 'bg-lime-400 text-charcoal-950 shadow-md shadow-lime-400/10'
                    : 'text-slate-300 hover:bg-charcoal-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-20 lg:pb-8">
        <header className="sticky top-0 z-20 bg-charcoal-950/90 backdrop-blur border-b border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-lime-400 flex items-center justify-center text-charcoal-950 font-black text-sm">
              F
            </div>
            <span className="font-black text-white text-base">
              FIT<span className="text-lime-400">LOCAL</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <Cloud className="w-4 h-4 text-lime-400" />
            <span>
              {userEmail
                ? `Cuenta: ${userEmail} (${
                    cloudSyncStatus === 'syncing'
                      ? 'Guardando en la nube...'
                      : 'Sincronizado en la nube'
                  })`
                : 'Modo Local (Navegador)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Cambiar sección"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as NavigationTab)}
              className="lg:hidden rounded-xl bg-charcoal-800 border border-slate-700 px-2.5 py-1.5 text-xs text-white font-semibold"
            >
              {NAV_ITEMS.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 border border-slate-700 text-xs font-bold text-slate-200"
            >
              {db.profile.name} ({db.profile.weightKg} kg)
            </button>

            {userEmail ? (
              <button
                type="button"
                onClick={signOutUser}
                title="Cerrar sesión"
                className="p-2 rounded-xl bg-charcoal-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setBypassAuthLocal(false)}
                className="px-3 py-1.5 rounded-xl bg-lime-400 text-charcoal-950 font-bold text-xs"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </header>

        {toastMessage && (
          <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 bg-lime-400 text-charcoal-950 px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-xl">
            {toastMessage}
          </div>
        )}

        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
          {activeTab === 'profile' && <ProfileGoalsView />}
          {activeTab === 'nutrition' && <NutritionView />}
          {activeTab === 'planner' && <MealPlannerView />}
          {activeTab === 'market' && <MarketShoppingView />}
          {activeTab === 'workouts' && <WorkoutsView />}
          {activeTab === 'running' && <RunningCardioView />}
          {activeTab === 'habits' && <HabitsWellnessView />}
          {activeTab === 'stats' && <ProgressStatsView />}
          {activeTab === 'budget' && <FitnessBudgetView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-charcoal-900/95 backdrop-blur border-t border-slate-800 grid grid-cols-5 py-1.5 px-2">
        {(['dashboard', 'nutrition', 'market', 'workouts', 'running'] as NavigationTab[]).map(
          (tabId) => {
            const item = NAV_ITEMS.find((i) => i.id === tabId)!;
            const active = activeTab === tabId;
            return (
              <button
                key={tabId}
                type="button"
                onClick={() => setActiveTab(tabId)}
                className={`flex flex-col items-center justify-center py-1 rounded-lg text-[11px] font-bold ${
                  active ? 'text-lime-400' : 'text-slate-400'
                }`}
              >
                {item.icon}
                <span className="mt-0.5">{item.shortLabel}</span>
              </button>
            );
          }
        )}
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <FitLocalProvider>
      <FitLocalShell />
    </FitLocalProvider>
  );
}