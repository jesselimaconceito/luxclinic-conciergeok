import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        // Verificar se há token na URL (pode vir como query param ou hash fragment)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = searchParams.get('access_token') || hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('🔍 Verificando token de recuperação:', { 
          accessToken: !!accessToken, 
          refreshToken: !!refreshToken,
          type,
          hashLength: window.location.hash.length
        });

        // Se houver tokens no hash, o Supabase já autenticou o usuário
        if (accessToken && refreshToken && type === 'recovery') {
          console.log('✅ Tokens de recuperação encontrados, definindo sessão...');
          
          // Definir a sessão manualmente
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('❌ Erro ao definir sessão:', sessionError);
            if (mounted) {
              setError('Link inválido ou expirado. Por favor, solicite um novo link de recuperação.');
            }
            return;
          }

          if (session && mounted) {
            console.log('✅ Sessão definida com sucesso para:', session.user.email);
            // Limpar o hash da URL para evitar problemas
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else {
          // Verificar se há sessão ativa (usuário pode ter clicado no link antes)
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session && mounted) {
            // Se não há sessão e não há tokens, o link pode estar inválido
            if (!accessToken && !refreshToken) {
              setError('Link inválido ou expirado. Por favor, solicite um novo link de recuperação.');
            }
          } else if (session && mounted) {
            console.log('✅ Sessão já existe:', session.user.email);
          }
        }
      } catch (err: any) {
        console.error('Erro ao verificar autenticação:', err);
        if (mounted) {
          setError('Erro ao processar o link de recuperação. Por favor, tente novamente.');
        }
      }
    };

    // Aguardar um pouco para garantir que o AuthContext não interfira
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      // Verificar se há sessão ativa antes de atualizar
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Erro ao obter sessão:', sessionError);
        throw new Error('Erro ao verificar autenticação. Por favor, use o link do email novamente.');
      }
      
      if (!session) {
        throw new Error('Sessão inválida. Por favor, use o link do email novamente.');
      }

      console.log('🔐 Atualizando senha para usuário:', session.user.id);

      // Atualizar senha usando o Supabase Auth
      // Nota: updateUser requer que o usuário esteja autenticado (o que já está garantido pelo link de recuperação)
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('❌ Erro ao atualizar senha:', updateError);
        throw updateError;
      }

      console.log('✅ Senha atualizada com sucesso');

      setSuccess(true);
      toast.success('Senha redefinida com sucesso!');

      // Fazer logout para limpar a sessão temporária de recuperação
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.warn('Aviso ao fazer logout:', signOutError);
        // Não bloquear o fluxo se o logout falhar
      }

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      // Ignorar erros de abort
      if (err.name === 'AbortError') {
        console.log('⚠️ Requisição cancelada');
        return;
      }
      
      console.error('Erro ao redefinir senha:', err);
      const errorMessage = err.message || 'Erro ao redefinir senha. Por favor, tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
        <Card className="w-full max-w-md card-luxury">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="font-display text-2xl font-bold tracking-tight text-green-600">
              Senha Redefinida!
            </CardTitle>
            <CardDescription className="text-base">
              Sua senha foi alterada com sucesso
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Você será redirecionado para a página de login em instantes...
            </p>
          </CardContent>

          <CardFooter>
            <Link to="/login" className="w-full">
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Ir para Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <Card className="w-full max-w-md card-luxury">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="font-display text-2xl font-bold tracking-tight">
            Redefinir Senha
          </CardTitle>
          <CardDescription className="text-base">
            Digite sua nova senha
          </CardDescription>
        </CardHeader>

        {error && (
          <CardContent>
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          </CardContent>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo de 6 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={loading}
            >
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>

            <Link to="/login" className="w-full">
              <Button variant="ghost" className="w-full">
                Voltar para o Login
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
