import { relations } from 'drizzle-orm';
import {
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
  pgEnum,
} from 'drizzle-orm/pg-core';

export const exametipoEnum = pgEnum("exame_tipo", [
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
export const pedidoEnum = pgEnum("pedido", ["Sim", "Não"]);
export const colaboradorSexEnum = pgEnum("patient_sex", ["male", "female"]);



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
export const appointmentsTable = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: text("organization_id").notNull(),
  date: timestamp("date").notNull(),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  examesId: uuid("exames_id")
    .notNull()
    .references(() => examesTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const appointmentsTableRelations = relations(
  appointmentsTable,
  ({ one }) => ({
    patient: one(patientsTable, {
      fields: [appointmentsTable.patientId],
      references: [patientsTable.id],
    }),
    exames: one(examesTable, {
      fields: [appointmentsTable.examesId],
      references: [examesTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [appointmentsTable.doctorId],
      references: [doctorsTable.id],
    }),
    organization: one(organizationSchema, {
      fields: [appointmentsTable.organizationId],
      references: [organizationSchema.id],
    }),
  })
);


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
  vlrMens: numeric("vlr_mens", { precision: 15, scale: 2 }),
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
  pedido: pedidoEnum("pedido").notNull(),
  codigo_anterior: text("codigo_anterior"),
  tipo: exametipoEnum("tipo").notNull(),
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
  sex: colaboradorSexEnum("sex").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});



