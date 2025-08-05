import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, QrCode } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const mfaSchema = z.object({
  code: z.string().length(6, 'El código debe tener 6 dígitos'),
});

type AuthForm = z.infer<typeof authSchema>;
type MFAForm = z.infer<typeof mfaSchema>;

export default function Auth() {
  const { user, signUp, signIn, setupMFA, enableMFA } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mfaSetup, setMfaSetup] = useState<{ qrCode: string; secret: string; factorId: string } | null>(null);
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [requiresMFAVerification, setRequiresMFAVerification] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState<{ challengeId: string; factorId: string } | null>(null);

  const authForm = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mfaForm = useForm<MFAForm>({
    resolver: zodResolver(mfaSchema),
    defaultValues: {
      code: '',
    },
  });

  useEffect(() => {
    if (user && !showMFASetup) {
      navigate('/');
    }
  }, [user, navigate, showMFASetup]);

  const handleSignUp = async (data: AuthForm) => {
    setLoading(true);
    await signUp(data.email, data.password);
    setLoading(false);
  };

  const handleSignIn = async (data: AuthForm) => {
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    
    if (!error) {
      // Check if user already has MFA configured
      const { data: factors } = await supabase.auth.mfa.listFactors();
      console.log('MFA factors:', factors);
      
      // Check if there are any verified TOTP factors
      const hasVerifiedMFA = factors && factors.totp && factors.totp.length > 0 && 
        factors.totp.some((factor: any) => factor.status === 'verified');
      
      console.log('Has verified MFA:', hasVerifiedMFA);
      
      if (hasVerifiedMFA) {
        // User has MFA enabled, we need to challenge them
        const verifiedFactor = factors.totp.find((factor: any) => factor.status === 'verified');
        if (verifiedFactor) {
          try {
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
              factorId: verifiedFactor.id
            });
            
            if (!challengeError && challengeData) {
              setMfaChallenge({
                challengeId: challengeData.id,
                factorId: verifiedFactor.id
              });
              setRequiresMFAVerification(true);
            }
          } catch (challengeError) {
            console.error('MFA Challenge error:', challengeError);
          }
        }
      } else {
        // User doesn't have MFA, show setup option
        setShowMFASetup(true);
      }
    }
    setLoading(false);
  };

  const handleSetupMFA = async () => {
    setLoading(true);
    const mfaData = await setupMFA();
    console.log('MFA data received:', mfaData);
    if (mfaData) {
      setMfaSetup({
        qrCode: mfaData.qrCode,
        secret: mfaData.secret,
        factorId: mfaData.factorId
      });
      console.log('MFA setup state set with factorId:', mfaData.factorId);
    }
    setLoading(false);
  };

  const handleEnableMFA = async (data: MFAForm) => {
    if (!mfaSetup) return;
    
    setLoading(true);
    const { error } = await enableMFA(data.code, mfaSetup.factorId);
    if (!error) {
      setShowMFASetup(false);
      navigate('/');
    }
    setLoading(false);
  };

  const handleVerifyMFA = async (data: MFAForm) => {
    if (!mfaChallenge) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId: mfaChallenge.factorId,
        challengeId: mfaChallenge.challengeId,
        code: data.code
      });
      
      if (!error) {
        setRequiresMFAVerification(false);
        navigate('/');
      }
    } catch (error) {
      console.error('MFA verification error:', error);
    }
    setLoading(false);
  };

  const handleSkipMFA = () => {
    setShowMFASetup(false);
    navigate('/');
  };

  if (requiresMFAVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle>Verificación 2FA</CardTitle>
            <CardDescription>
              Ingresa el código de tu aplicación de autenticación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={mfaForm.handleSubmit(handleVerifyMFA)} className="space-y-4">
              <div>
                <Label htmlFor="verify-code">Código de verificación</Label>
                <Input
                  id="verify-code"
                  placeholder="123456"
                  {...mfaForm.register('code')}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
                {mfaForm.formState.errors.code && (
                  <p className="text-sm text-destructive mt-1">
                    {mfaForm.formState.errors.code.message}
                  </p>
                )}
              </div>
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Verificar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showMFASetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
            <CardTitle>Configurar Autenticación 2FA</CardTitle>
            <CardDescription>
              Mejora la seguridad de tu cuenta con autenticación de dos factores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!mfaSetup ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Configura la autenticación de dos factores para proteger tu cuenta
                </p>
                <Button onClick={handleSetupMFA} disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <QrCode className="h-4 w-4 mr-2" />
                  )}
                  Configurar 2FA
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Escanea este código QR con tu aplicación de autenticación
                  </p>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img src={mfaSetup.qrCode} alt="QR Code" className="w-40 h-40" />
                  </div>
                  <Alert className="mt-4">
                    <AlertDescription>
                      Código secreto: <code className="font-mono text-xs">{mfaSetup.secret}</code>
                    </AlertDescription>
                  </Alert>
                </div>
                
                <form onSubmit={mfaForm.handleSubmit(handleEnableMFA)} className="space-y-4">
                  <div>
                    <Label htmlFor="code">Código de verificación</Label>
                    <Input
                      id="code"
                      placeholder="123456"
                      {...mfaForm.register('code')}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                    {mfaForm.formState.errors.code && (
                      <p className="text-sm text-destructive mt-1">
                        {mfaForm.formState.errors.code.message}
                      </p>
                    )}
                  </div>
                  
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Habilitar 2FA
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleSkipMFA} className="w-full">
              Omitir por ahora
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Bienvenido</CardTitle>
          <CardDescription>
            Inicia sesión o regístrate para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={authForm.handleSubmit(handleSignIn)} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="tu@email.com"
                    {...authForm.register('email')}
                  />
                  {authForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {authForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="signin-password">Contraseña</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    {...authForm.register('password')}
                  />
                  {authForm.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">
                      {authForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Iniciar Sesión
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={authForm.handleSubmit(handleSignUp)} className="space-y-4">
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="tu@email.com"
                    {...authForm.register('email')}
                  />
                  {authForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {authForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="signup-password">Contraseña</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    {...authForm.register('password')}
                  />
                  {authForm.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">
                      {authForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Registrarse
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}