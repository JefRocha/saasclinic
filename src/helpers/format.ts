export const formatCnpjCpf = (value: string | null) => {
  if (!value) return "";
  const cleanedValue = value.replace(/\D/g, "");

  if (cleanedValue.length === 11) {
    return cleanedValue.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4",
    );
  }

  if (cleanedValue.length === 14) {
    return cleanedValue.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  }

  return value;
};
