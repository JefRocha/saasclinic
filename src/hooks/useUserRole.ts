import { useOrganization } from "@clerk/nextjs";

export function useUserRole() {
  const { membership } = useOrganization();
  return membership?.role ?? "user";
}
