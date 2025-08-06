export const formatCnpjCpf = (value: string | null, type: 'P' | 'J' | null | undefined) => {
  if (!value) return "";
  const cleanedValue = value.replace(/\D/g, "");

  if (type === 'P' || (type === undefined && cleanedValue.length === 11)) {
    return cleanedValue.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      "$1.$2.$3-$4",
    );
  }

  if (type === 'J' || (type === undefined && cleanedValue.length === 14)) {
    return cleanedValue.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  }

  return value;
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
};
