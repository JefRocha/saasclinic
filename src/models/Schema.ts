import { relations } from 'drizzle-orm';
import { pgEnum } from "drizzle-orm/pg-core";import {
  bigint,
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  char,
  date,
} from 'drizzle-orm/pg-core';

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

/* ---------- Clerk Organization ---------- */
export const organizationSchema = pgTable(
  'organization',
  {
    id: text('id').primaryKey(), // ex.: "org_123"
    nome: text("nome").notNull(),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripeSubscriptionPriceId: text('stripe_subscription_price_id'),
    stripeSubscriptionStatus: text('stripe_subscription_status'),
    stripeSubscriptionCurrentPeriodEnd: bigint(
      'stripe_subscription_current_period_end',
      { mode: 'number' },
    ),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    stripeCustomerIdIdx: uniqueIndex('stripe_customer_id_idx').on(
      table.stripeCustomerId,
    ),
  }),
);

// Add relations for organizationSchema
export const organizationRelations = relations(organizationSchema, ({ many }) => ({
  clients: many(clientsTable),
}));

/* ---------- To-do de exemplo (template) ---------- */
export const todoSchema = pgTable('todo', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

/* ---------- Clínicas ---------- */

/* ---------- Pacientes ---------- */
export const patientsTable = pgTable("patients", {
  organizationId: text("organization_id").notNull(),
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/* ---------- Médicos ---------- */
export const doctorsTable = pgTable("doctors", {
  organizationId: text("organization_id").notNull(),
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/* ---------- Usuários ---------- */
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  organizationId: text("organization_id").notNull(),
  name: text("name"),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});


// 📅 Agendamentos


export const permissionsTable = pgTable("permissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(), // exemplo: "view_clients", "edit_exams"
  description: text("description"),
});


// 🧑‍💼 Clientes
export const clientsTable = pgTable("clients", {
  id: serial("id").primaryKey(),
  organizationId: text("organization_id").notNull(),
  razaoSocial: text("razao_social"),
  fantasia: text("fantasia"),
  endereco: text("endereco"),
  numero: text("numero"),
  bairro: text("bairro"),
  cidade: text("cidade"),
  uf: text("uf"),
  cep: text("cep"),
  complemento: text("complemento"),
  moradia: integer("moradia"),
  tipo: integer("tipo"),
  situacao: integer("situacao"),
  telefone1: text("telefone1"),
  telefone2: text("telefone2"),
  telefone3: text("telefone3"),
  celular: text("celular"),
  email: text("email"),
  rg: text("rg"),
  cpf: text("cpf"),
  estadoCivil: text("estado_civil"),
  empresa: text("empresa"),
  dataCadastro: timestamp("data_cadastro"),
  dataUltimaCompra: timestamp("data_ultima_compra"),
  previsao: timestamp("previsao"),
  cnae: text("cnae"),
  codMunicipioIbge: text("cod_municipio_ibge"),
  ibge: text("ibge"),
  correspEndereco: text("corresp_endereco"),
  correspBairro: text("corresp_bairro"),
  correspCidade: text("corresp_cidade"),
  correspUf: text("corresp_uf"),
  correspCep: text("corresp_cep"),
  correspComplemento: text("corresp_complemento"),
  foto: text("foto"),
  tipoCadastro: text("tipo_cadastro"),
  ie: text("ie"),
  mdia: text("mdia"),
  tDocumento: text("t_documento"),
  tVencimento: text("t_vencimento"),
  tCobranca: text("t_cobranca"),
  retencoes: text("retencoes"),
  simples: text("simples"),
  correios: text("correios"),
  email1: text("email1"),
  email2: text("email2"),
  email3: text("email3"),
  email4: text("email4"),
  email5: text("email5"),
  contribuinte: text("contribuinte"),
  vlrMens: numeric("vlr_mens", { precision: 15, scale: 2, mode: 'number' }),
  observacao: text("observacao"),
  usaFor: integer("usa_for"),
  crt: text("crt"),
  melhorDia: text("melhor_dia"),
  vendedor: text("vendedor"),
  travado: boolean("travado").default(false),
  ativo: boolean("ativo").default(false),
  inadimplente: boolean("inadimplente").default(false),
  especial: boolean("especial").default(false),
  bloqueado: boolean("bloqueado").default(false),
  pessoa: text("pessoa").default("J"),
  documentosPdf: text("documentos_pdf"),
  codigoAnterior: text("codigo_anterior"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});


/* ---------- Exames ---------- */
export const examesTable = pgTable("exames", {
  id: serial("id").primaryKey(),
  organizationId: text("organization_id").notNull(),
  descricao: text("descricao").notNull(),
  validade: integer("validade").notNull(),
  validade1: integer("validade1").notNull(),
  valor: numeric("valor", { precision: 15, scale: 2 }).notNull(),
  pedido: pedido_enum("pedido").notNull(),
  codigo_anterior: text("codigo_anterior"),
  tipo: exametipo_enum("tipo").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/* ---------- Medicos ---------- */
export const medicosTable = pgTable("medicos", {
  id: serial("codigo").primaryKey(),
  organizationId: text("organization_id").notNull(),
  nome: text("nome").notNull(),
  endereco: text("endereco").notNull(),
  bairro: text("bairro").notNull(),
  cidade: text("cidade").notNull(),
  uf: text("uf").notNull(),
  cep: text("cep").notNull(),
  cpf: text("cpf").notNull(),
  telefone: text("telefone").notNull(),
  celular: text("celular").notNull(),
  crm: text("crm").notNull(),
  usaAgenda: integer("usa_agenda").notNull(),
  codAgenda: integer("cod_agenda").notNull(),
  numero: text("numero").notNull(),
  complemento: text("complemento").notNull(),
  codiIbge: integer("codiibge").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const colaboradorTable = pgTable("colaboradores", {
  id: serial("codigo").primaryKey(),
  organizationId: text("organization_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  endereco: text("endereco"),
  numero: text("numero"),
  complemento: text("complemento"),
  bairro: text("bairro"),
  cidade: text("cidade"),
  uf: text("uf"),
  cep: text("cep"),
  telefone: text("telefone"),
  celular: text("celular"),
  cpf: text("cpf"),
  rg: text("rg"),
  ctps: text("ctps"),
  data_admissao: timestamp("data_admissao"),
  data_demissao: timestamp("data_demissao"),
  situacao: text("situacao"),
  obs1: text("obs1"),
  data_nascimento: timestamp("data_nascimento"),
  setor: text("setor"),
  cargahoraria: text("cargahoraria"),
  prontuario: text("prontuario"),
  observacao: text("observacao"),
  pcd: text("pcd"),
  cod_anterior: text("cod_anterior"),
  phoneNumber: text("phone_number").notNull(),
  sex: colaborador_sex_enum("sex").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const examesCliTable = pgTable("examescli", {
  id: serial("id").primaryKey(),
  idcliente: integer("idcliente").notNull().references(() => clientsTable.id),
  idexame: integer("codiexame").notNull().references(() => examesTable.id),
  descricao: text("descricao"),
  valor: numeric("valor", { precision: 15, scale: 2 }).notNull(),
  cargo: text("cargo"),
  codExameAnt: text("codexameant"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
export const clientsRelations = relations(clientsTable, ({ many }) => ({
  examesRealizados: many(examesCliTable) // Um cliente tem muitos exames realizados
}));

export const examesRelations = relations(examesTable, ({ many }) => ({
  examesRealizados: many(examesCliTable) // Um tipo de exame pode ser realizado por muitos clientes
}));

export const examesCliRelations = relations(examesCliTable, ({ one }) => ({
  cliente: one(clientsTable, {
    fields: [examesCliTable.idcliente],
    references: [clientsTable.id]
  }),
  tipoExame: one(examesTable, {
    fields: [examesCliTable.idexame],
    references: [examesTable.id]
  })
}));



// Se seus usuários do Clerk estiverem em uma tabela `users`:
// import { usersTable }        from "./users";

/* ================================================================== */
/*  ANAMNESE  – ficha principal                                       */
/* ================================================================== */
export const anamneseTable = pgTable("anamnese", {
  id: serial("id").primaryKey(),
  organizationId: text("organization_id").notNull(),

  /* --- Foreign Keys -------------------------------------------------- */
  clienteId:     integer("id_cliente").notNull()
                   .references(() => clientsTable.id, { onDelete: "restrict" }),

  colaboradorId: integer("id_colaborador").notNull()
                   .references(() => colaboradorTable.id, { onDelete: "restrict" }),

  atendenteId:   text("id_atendente").notNull(),
  // Se houver tabela de usuários:
  // atendenteId: integer("id_atendente").notNull()
  //                .references(() => usersTable.id, { onDelete: "restrict" }),

  /* --- Dados do atendimento ----------------------------------------- */
  data:          timestamp("data"),
  formapagto:    formapagto_enum("formapagto").notNull(),
  total:         numeric("total", { precision: 15, scale: 2 }),
  tipo:          exametipo_enum("tipo").notNull(),
  vlcaixa:       numeric("vl_caixa", { precision: 15, scale: 2 }),
  cargo:         text("cargo"),        // mantive uma única coluna cargo
  prazo:         char("prazo", { length: 1 }),
  status:        text("status"),
  cpf:           text("cpf"),
  solicitante:   text("solicitante"),
  situacao:      char("situacao", { length: 1 }),
  dataLanc:      timestamp("data_lanc"),
  setor:         text("setor"),
  efetivo:       text("efetivo"),

  /* --- Auditoria ---------------------------------------------------- */
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
               .defaultNow()
               .$onUpdate(() => new Date()),
});

/* =======================================================================
 *  anamneseItems  (filha) – exames / procedimentos por ficha
 * ===================================================================== */
export const anamneseItemsTable = pgTable("anamnese_items", {
  id: serial("id").primaryKey(),

  /* --- Foreign Keys -------------------------------------------------- */
  anamneseId: integer("id_anamnese").notNull()
                .references(() => anamneseTable.id, { onDelete: "cascade" }),

  exameId:     integer("id_exame").notNull()
                .references(() => examesTable.id, { onDelete: "restrict" }),

  medicoId:    integer("id_medico").notNull()
                .references(() => medicosTable.id, { onDelete: "restrict" }),

  /* --- Dados do item ------------------------------------------------- */
  valor:       numeric("valor", { precision: 15, scale: 2 }),
  faturar:     char("faturar", { length: 1 }),
  vencto:      date("vencto"),
  prazo:       char("prazo", { length: 1 }),
  dataLanc:    timestamp("data_lanc"),
  data:        date("data"),
  dataLiberacao: date("data_liberacao"),
  apto:        integer("apto"),
  status:      integer("status"),

  /* --- Auditoria ---------------------------------------------------- */
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
               .defaultNow()
               .$onUpdate(() => new Date()),
});

/* =======================================================================
 *  Helpers de relação tipada (Drizzle `relations`)
 * ===================================================================== */
export const anamneseRelations = relations(anamneseTable, ({ one, many }) => ({
  items: many(anamneseItemsTable),
  cliente: one(clientsTable, {
    fields: [anamneseTable.clienteId],
    references: [clientsTable.id],
  }),
  colaborador: one(colaboradorTable, {
    fields: [anamneseTable.colaboradorId],
    references: [colaboradorTable.id],
  }),
}));

export const anamneseItemsRelations = relations(
  anamneseItemsTable,
  ({ one }) => ({
    anamnese: one(anamneseTable, {
      fields:     [anamneseItemsTable.anamneseId],
      references: [anamneseTable.id],
    }),
    exame: one(examesTable, {
      fields:     [anamneseItemsTable.exameId],
      references: [examesTable.id],
    }),
    medico: one(medicosTable, {
      fields:     [anamneseItemsTable.medicoId],
      references: [medicosTable.id],
    }),
  }),
);

export const employmentTable = pgTable("colaborador_clientes", {
  id:            serial("id").primaryKey(),
  colaboradorId: integer("colaborador_id")
                   .references(() => colaboradorTable.id, { onDelete: "cascade" })
                   .notNull(),
  clientId:      integer("client_id")
                   .references(() => clientsTable.id, { onDelete: "cascade" })
                   .notNull(),
  dataAdmissao:  date("data_admissao").notNull(),
  dataDemissao:  date("data_demissao"),            // null = vínculo ativo
  createdAt:     timestamp("created_at").defaultNow().notNull(),
  updatedAt:     timestamp("updated_at")
                   .defaultNow()
                   .$onUpdate(() => new Date()),
}, tbl => ({
  uniq: uniqueIndex("uniq_colab_client_adm")
          .on(tbl.colaboradorId, tbl.clientId, tbl.dataAdmissao),
}));