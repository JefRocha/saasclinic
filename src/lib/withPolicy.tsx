import { redirect } from 'next/navigation';
import { currentUser, auth } from '@clerk/nextjs/server';
import { buildAbility } from '@/lib/ability';

/**
 * Envolve uma Server-Page e bloqueia se o usuário não satisfizer `check`.
 */
export function withPolicy<PageProps>(
  Page: (p: PageProps) => React.ReactNode,
  check: (ability: ReturnType<typeof buildAbility>) => boolean,
) {
  return async function PageProtected(props: PageProps) {
    console.log('Iniciando PageProtected...');
    // ── 1. usuário autenticado ───────────────────────────────────────────
    console.log('Chamando currentUser()...');
    const user = await currentUser();
    console.log('currentUser() retornado:', user ? 'usuário encontrado' : 'usuário não encontrado');
    if (!user) redirect('/?needLogin=1');

    // ── 2. pegue o orgId da sessão Clerk ─────────────────────────────────
    console.log('Chamando auth()...');
    const { orgId } = await auth();          // ← aqui vem a clínica atual
    console.log('auth() retornado. orgId:', orgId);

    // ── 3. construa a ability (role + orgId) ─────────────────────────────
    const ability = buildAbility(
      user.publicMetadata?.role as string,
      orgId ?? undefined,
    );

    // ── 4. aplica a regra customizada da página ──────────────────────────
    if (!check(ability)) redirect('/?needLogin=1');

    // ── 5. tudo certo, renderiza a página ────────────────────────────────
    return <Page {...props} />;
  };
}
