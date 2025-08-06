import { pgEnum } from "drizzle-orm/pg-core";

export const formapagto_enum = pgEnum("formapagto", ["CONVENIO","A VISTA","C/CORRENTE"]);
export const exametipo_enum = pgEnum("exame_tipo", [
  "ADMISSIONAL",
  "PERIODICO",
  "MUDANCA FUNCAO",
  "RE. AO TRABALHO",
  "DEMISSIONAL",
  "OUTROS",
  "PCMSO",
  "PPRA",
  "LCAT",
  "PCMAT",
  "ART",
  "PCA",
  "SESMET",
  "CONSULTA MEDICA",
  "ATESTADO SAN",
  "HOMOL. ATESTADO",
]);
export const pedido_enum     = pgEnum("pedido", ["Sim","Não"]);
export const colaborador_sex_enum = pgEnum("colaborador_sex", ["masculino","feminino","outro"]);