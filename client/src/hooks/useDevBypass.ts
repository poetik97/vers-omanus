import { useEffect } from 'react';
import { trpc } from '@/lib/trpc';

/**
 * Hook para bypass de autenticação em desenvolvimento
 * Cria automaticamente um utilizador demo e faz login
 */
export function useDevBypass() {
  const registerMutation = trpc.auth.register.useMutation();
  const loginMutation = trpc.auth.login.useMutation();
  const userQuery = trpc.auth.me.useQuery();

  useEffect(() => {
    // Só funciona em desenvolvimento
    if (import.meta.env.PROD) return;

    // Se já está autenticado, não faz nada
    if (userQuery.data) return;

    // Credenciais do utilizador demo
    const demoUser = {
      name: 'Demo User',
      email: 'demo@organiza-te360.com',
      password: 'demo123456'
    };

    // Tenta fazer login primeiro
    loginMutation.mutate(
      { email: demoUser.email, password: demoUser.password },
      {
        onError: () => {
          // Se login falhar, tenta registar
          registerMutation.mutate(demoUser, {
            onError: (error) => {
              console.log('[Dev Bypass] Não foi possível criar utilizador demo:', error.message);
            },
            onSuccess: () => {
              console.log('[Dev Bypass] Utilizador demo criado e autenticado com sucesso!');
            }
          });
        },
        onSuccess: () => {
          console.log('[Dev Bypass] Login automático realizado com sucesso!');
        }
      }
    );
  }, [userQuery.data]);

  return {
    isAuthenticated: !!userQuery.data,
    user: userQuery.data
  };
}

