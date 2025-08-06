import { AppConfig } from '@/utils/AppConfig';
import Image from 'next/image';

const Logo = () => (
  <div className="flex items-center text-xl font-semibold">
  <Image
    src="/assets/images/logo.png"
    alt="Logo"
    width={134}
    height={43}
    className="mr-1"
  />
</div>
);

export { Logo };
