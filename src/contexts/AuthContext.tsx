// contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../lib/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // FIX: Evita "carga infinita" si una petición a Supabase se queda colgada.
  // Si excede el tiempo, fallamos de forma controlada y liberamos loading.
  const withTimeout = async <T,>(
    promise: Promise<T>,
    timeoutMs = 10000,
    label = "request",
  ): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      console.log("Fetching role for user:", userId);
      const { data: profile, error } = await withTimeout(
        supabase.from("users").select("role").eq("id", userId).maybeSingle(),
        10000,
        "fetchUserRole",
      ); // ✅ maybeSingle evita error 406; timeout evita carga infinita.

      console.log("Profile data:", profile);

      if (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } else {
        setRole(profile?.role || "student"); // ✅ Valor por defecto
      }
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      setRole(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  // FIX: Si hay token viejo/corrupto en localStorage, limpiamos sesión local para recuperar la app.
  const clearInvalidLocalSession = async () => {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (error) {
      console.error("Error clearing local session:", error);
    } finally {
      setUser(null);
      setSession(null);
      setRole(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      try {
        // Obtener sesión actual
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await withTimeout(supabase.auth.getSession(), 10000, "getSession");

        if (sessionError) {
          console.error("Session error:", sessionError);
          // FIX: Recuperación ante token inválido guardado en localStorage.
          await clearInvalidLocalSession();
          setLoading(false);
          return;
        }

        const currentUser = currentSession?.user ?? null;
        setSession(currentSession);
        setUser(currentUser);

        if (currentUser) {
          await fetchUserRole(currentUser.id);
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("Auth init error:", error);
        // FIX: Ante fallo de inicialización (incluyendo timeout), limpiamos token local inválido.
        await clearInvalidLocalSession();
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Escuchar cambios en autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth event:", event);
      const currentUser = newSession?.user ?? null;
      setSession(newSession);
      setUser(currentUser);

      // FIX: Aseguramos setLoading(false) incluso si fetchUserRole falla o expira.
      try {
        if (
          currentUser &&
          (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
        ) {
          await fetchUserRole(currentUser.id);
        } else if (event === "SIGNED_OUT") {
          setRole(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        // FIX: Si falla al refrescar/leer auth state, forzamos limpieza local para evitar estado colgado.
        await clearInvalidLocalSession();
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
