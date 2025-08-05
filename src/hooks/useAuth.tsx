import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  mfaInProgress: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; requiresMFA?: boolean; factors?: any[]; email?: string; password?: string; challengeId?: string; factorId?: string }>;
  signOut: () => Promise<void>;
  setupMFA: () => Promise<{ qrCode: string; secret: string; factorId: string } | null>;
  verifyMFA: (token: string, factorId: string) => Promise<{ error: any }>;
  enableMFA: (token: string, factorId: string) => Promise<{ error: any }>;
  setMfaInProgress: (inProgress: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaInProgress, setMfaInProgress] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      toast({
        title: "Error al registrarse",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Registro exitoso",
        description: "Revisa tu email para confirmar tu cuenta",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 [AUTH-V3.0] Iniciando proceso de login para email:', email);
    console.log('🔐 [AUTH-V3.0] Timestamp:', new Date().toISOString());
    
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('🔐 [AUTH] Resultado de signInWithPassword:');
    console.log('🔐 [AUTH] - Data:', signInData);
    console.log('🔐 [AUTH] - Error:', error);
    console.log('🔐 [AUTH] - Session AAL:', (signInData?.session as any)?.aal);
    console.log('🔐 [AUTH] - User ID:', signInData?.user?.id);

    if (error) {
      console.log('❌ [AUTH] Error en signInWithPassword:', error.message);
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }

    console.log('✅ [AUTH] SignInWithPassword exitoso, verificando factores MFA...');

    // Check for MFA factors after successful password auth
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    console.log('🔐 [AUTH] Resultado de listFactors:');
    console.log('🔐 [AUTH] - Factors:', factors);
    console.log('🔐 [AUTH] - Error:', factorsError);
    
    if (factorsError) {
      console.log('❌ [AUTH] Error al obtener factores MFA:', factorsError);
    }
    
    const hasVerifiedMFA = factors && factors.totp && factors.totp.length > 0 && 
      factors.totp.some((factor: any) => factor.status === 'verified');
    
    console.log('🔐 [AUTH] ¿Tiene MFA verificado?:', hasVerifiedMFA);
    console.log('🔐 [AUTH] Factores TOTP encontrados:', factors?.totp?.length || 0);

    if (hasVerifiedMFA) {
      console.log('🔐 [AUTH-V3.0] Usuario tiene MFA habilitado - NUEVA ESTRATEGIA: NO cerrar sesión');
      
      // NEW STRATEGY: Don't sign out, just set MFA in progress
      setMfaInProgress(true);
      
      // Try to create MFA challenge first before signing out
      const verifiedFactor = factors.totp.find((factor: any) => factor.status === 'verified');
      console.log('🔐 [AUTH-V3.0] Factor verificado encontrado:', verifiedFactor);
      
      try {
        console.log('🔐 [AUTH-V3.0] Creando challenge MFA para factor:', verifiedFactor.id);
        
        const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId: verifiedFactor.id
        });

        console.log('🔐 [AUTH-V3.0] Resultado de MFA challenge:');
        console.log('🔐 [AUTH-V3.0] - Challenge Data:', challengeData);
        console.log('🔐 [AUTH-V3.0] - Challenge Error:', challengeError);

        if (challengeError) {
          console.error('❌ [AUTH-V3.0] Error al crear challenge MFA:', challengeError);
          console.log('🔐 [AUTH-V3.0] Permitiendo login sin MFA debido a error en challenge');
          setMfaInProgress(false);
          return { error: null };
        }

        console.log('✅ [AUTH-V3.0] Challenge MFA creado - NO cerrando sesión, manteniendo usuario autenticado');
        console.log('🔐 [AUTH-V3.0] Retornando requiresMFA=true para mostrar pantalla MFA');
        
        // Return special indicator that MFA challenge is needed
        return { 
          error: null, 
          requiresMFA: true, 
          factors: factors.totp,
          email, 
          password,
          challengeId: challengeData.id,
          factorId: verifiedFactor.id
        };
      } catch (error) {
        console.error('❌ [AUTH-V3.0] Excepción en creación de challenge MFA:', error);
        console.log('🔐 [AUTH-V3.0] Permitiendo login sin MFA debido a excepción');
        setMfaInProgress(false);
        return { error: null };
      }
    }

    console.log('✅ [AUTH] Login completado sin MFA (usuario no tiene MFA configurado)');
    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const setupMFA = async () => {
    try {
      // First, check if user already has MFA factors
      const { data: existingFactors, error: listError } = await supabase.auth.mfa.listFactors();
      
      if (listError) {
        console.error('Error listing MFA factors:', listError);
        toast({
          title: "Error al verificar 2FA",
          description: listError.message,
          variant: "destructive"
        });
        return null;
      }

      console.log('Existing MFA factors:', existingFactors);

      // Check for TOTP factors specifically (using any to avoid type issues)
      const factors = existingFactors as any;
      if (factors && factors.totp && factors.totp.length > 0) {
        // Find an unverified TOTP factor
        const existingTotpFactor = factors.totp.find((factor: any) => 
          factor.status === 'unverified'
        );
        
        if (existingTotpFactor) {
          console.log('Found existing unverified TOTP factor:', existingTotpFactor);
          // Check if the factor has the TOTP data needed
          if (existingTotpFactor.totp && existingTotpFactor.totp.qr_code) {
            return {
              qrCode: existingTotpFactor.totp.qr_code,
              secret: existingTotpFactor.totp.secret,
              factorId: existingTotpFactor.id
            };
          }
        }

        // If user has a verified factor, they don't need to set up again
        const verifiedFactor = factors.totp.find((factor: any) => 
          factor.status === 'verified'
        );
        if (verifiedFactor) {
          toast({
            title: "2FA ya configurado",
            description: "Ya tienes la autenticación de dos factores habilitada",
          });
          return null;
        }
      }

      // Only create new factor if none exists or existing one doesn't have QR data
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Autenticación de dos factores'
      });

      if (error) {
        console.error('MFA enrollment error:', error);
        // If error is about existing factor name, try with different name
        if (error.message.includes('friendly name')) {
          const { data: retryData, error: retryError } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
            friendlyName: `Autenticación de dos factores ${Date.now()}`
          });
          
          if (retryError) {
            toast({
              title: "Error al configurar 2FA",
              description: retryError.message,
              variant: "destructive"
            });
            return null;
          }
          
          console.log('MFA enrollment retry data:', retryData);
          return {
            qrCode: retryData.totp.qr_code,
            secret: retryData.totp.secret,
            factorId: retryData.id
          };
        }
        
        toast({
          title: "Error al configurar 2FA",
          description: error.message,
          variant: "destructive"
        });
        return null;
      }

      console.log('MFA enrollment data:', data);
      return {
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        factorId: data.id
      };
    } catch (error) {
      console.error('Error setting up MFA:', error);
      return null;
    }
  };

  const verifyMFA = async (token: string, factorId: string) => {
    // First create a challenge
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId
    });

    if (challengeError) {
      toast({
        title: "Error al crear desafío 2FA",
        description: challengeError.message,
        variant: "destructive"
      });
      return { error: challengeError };
    }

    // Then verify the challenge
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: token
    });

    if (error) {
      toast({
        title: "Error al verificar 2FA",
        description: error.message,
        variant: "destructive"
      });
    }

    return { error };
  };

  const enableMFA = async (token: string, factorId: string) => {
    console.log('enableMFA called with factorId:', factorId, 'token:', token);
    
    // Create a challenge first
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId
    });

    if (challengeError) {
      console.error('MFA challenge error:', challengeError);
      toast({
        title: "Error al habilitar 2FA",
        description: challengeError.message,
        variant: "destructive"
      });
      return { error: challengeError };
    }

    console.log('MFA challenge data:', challengeData);

    // Then verify with the challenge
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code: token
    });

    if (error) {
      console.error('MFA verify error:', error);
      toast({
        title: "Error al habilitar 2FA",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "2FA habilitado",
        description: "La autenticación de dos factores ha sido habilitada exitosamente",
      });
    }

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    mfaInProgress,
    signUp,
    signIn,
    signOut,
    setupMFA,
    verifyMFA,
    enableMFA,
    setMfaInProgress,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};