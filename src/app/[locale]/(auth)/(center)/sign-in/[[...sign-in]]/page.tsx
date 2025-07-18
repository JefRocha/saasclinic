import { SignIn } from '@clerk/nextjs';
import { getI18nPath } from '@/utils/Helpers';

export default async function SignInPage({ params }: { params: any }) {
  const awaitedParams = await params;
  console.log('SignInPage component rendered'); // Adicionado para depuração
  return (
    <SignIn path={getI18nPath('/sign-in', awaitedParams.locale)} />
  );
}