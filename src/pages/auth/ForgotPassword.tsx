import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword(email);
      setSent(true);
    } catch (error) {
      // Erro já tratado no AuthContext
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
        <Card className="w-full max-w-md card-luxury">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="font-display text-2xl font-bold tracking-tight">
              Email Enviado!
            </CardTitle>
            <CardDescription className="text-base">
              Verifique sua caixa de entrada
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Se o email <strong>{email}</strong> estiver cadastrado, você receberá
              instruções para redefinir sua senha.
            </p>
          </CardContent>

          <CardFooter>
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Voltar para o Login
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
            Recuperar Senha
          </CardTitle>
          <CardDescription className="text-base">
            Digite seu email para receber instruções
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
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Email'}
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

