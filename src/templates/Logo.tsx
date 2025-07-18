import { AppConfig } from '@/utils/AppConfig';

export const Logo = (props: {
  isTextHidden?: boolean;
}) => (
  <div className="flex items-center text-xl font-semibold">
    <svg
      className="mr-1 size-8 stroke-current stroke-2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect x="5" y="5" width="14" height="14" fill="green" />
    </svg>
    {!props.isTextHidden && AppConfig.name}
  </div>
);
