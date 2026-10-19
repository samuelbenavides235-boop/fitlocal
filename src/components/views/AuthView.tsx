import React, { useState } from 'react';
import { Dumbbell, Lock, Mail, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';

export const AuthView: React.FC<{ onUseLocalMode: () => void }> = ({
  onUseLocalMode
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password
        });
        if (error) throw error;
        setInfoMsg('¡Cuenta creada con éxito! Iniciando sesión...');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setErrorMsg(
        err?.message || 'Error de autenticación. Verifica tu correo y contraseña.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-charcoal-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-lime-400 text-charcoal-950 font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-lime-400/20">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            FIT<span className="text-lime-400">LOCAL</span> CLOUD
          </h1>
          <p className="text-xs text-slate-400">
            Guarda tu progreso físico, comidas, rutinas y presupuesto en la nube.
          </p>
        </div>

        {!isSupabaseConfigured ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-3">
            <p className="font-bold">
              Falta pegar tus claves en <code>src/services/supabaseClient.ts</code>
            </p>
            <p>
              Cuando pegues tu Project URL y Anon Key de Supabase, aquí se activará
              el inicio de sesión en la nube para múltiples usuarios.
            </p>
            <button
              type="button"
              onClick={onUseLocalMode}
              className="w-full py-2.5 rounded-xl bg-lime-400 text-charcoal-950 font-extrabold text-xs"
            >
              Continuar en Modo Local por ahora
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-charcoal-800 rounded-xl">
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className={`py-2 rounded-lg text-xs font-bold transition ${
                  !isRegistering
                    ? 'bg-lime-400 text-charcoal-950'
                    : 'text-slate-300'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className={`py-2 rounded-lg text-xs font-bold transition ${
                  isRegistering
                    ? 'bg-lime-400 text-charcoal-950'
                    : 'text-slate-300'
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            {infoMsg && (
              <div className="p-3 rounded-xl bg-lime-400/15 border border-lime-400/30 text-xs text-lime-300">
                {infoMsg}
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 pl-9 pr-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Contraseña (mínimo 6 caracteres)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-charcoal-800 border border-slate-700 pl-9 pr-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-lime-400 hover:bg-lime-500 disabled:opacity-50 text-charcoal-950 font-extrabold text-xs flex items-center justify-center gap-2 transition"
            >
              {isRegistering ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  {loading ? 'Registrando...' : 'Registrarme Gratis'}
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {loading ? 'Entrando...' : 'Entrar a mi Cuenta'}
                </>
              )}
            </button>
          </form>
        )}

        <div className="border-t border-slate-800 pt-4 text-center">
          <button
            type="button"
            onClick={onUseLocalMode}
            className="text-xs text-slate-400 hover:text-lime-400 underline flex items-center justify-center gap-1 mx-auto"
          >
            <Sparkles className="w-3.5 h-3.5" /> Usar sin cuenta (solo en este
            navegador)
          </button>
        </div>
      </div>
    </div>
  );
};