import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    // Só redirecionar se não estiver carregando e tiver user e profile
    if (!authLoading && user && profile) {
      // Pequeno delay para garantir que tudo está sincronizado
      const timer = setTimeout(() => {
        // Redirecionar baseado no tipo de usuário
        if (profile.is_super_admin) {
          navigate('/super-admin/dashboard', { replace: true });
        } else {
          navigate('/app/dashboard', { replace: true });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, profile, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      // Aguardar um pouco para garantir que o profile foi carregado
      // O redirecionamento será feito pelo useEffect acima
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      // Erro já tratado no AuthContext
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <Card className="w-full max-w-md card-luxury">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="font-display text-3xl font-bold tracking-tight">
            LuxClinic Concierge
          </CardTitle>
          <CardDescription className="text-base">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-accent hover:underline"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-accent font-semibold hover:underline">
                Cadastre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

