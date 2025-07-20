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
} from 'drizzle-orm/pg-core';

/* ---------- Clerk Organization ---------- */
export const organizationSchema = pgTable(
  'organization',
  {
    id: text('id').primaryKey(), // ex.: "org_123"
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
export const clinicsTable = pgTable('clinics', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  // Adicione outras colunas relevantes para a tabela de clínicas aqui
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/* ---------- Clientes da clínica ---------- */
export const clientsTable = pgTable('clients', {
  id: serial('id').primaryKey(),

  /** Relaciona diretamente à Organization do Clerk */
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizationSchema.id, { onDelete: 'cascade' }),

  clinicId: uuid('clinic_id')
    .notNull()
    .references(() => clinicsTable.id, { onDelete: 'cascade' }),

  razaoSocial: text('razao_social'),
  fantasia: text('fantasia'),

  /* Endereço principal */
  endereco: text('endereco'),
  numero: text('numero'),
  bairro: text('bairro'),
  cidade: text('cidade'),
  uf: text('uf'),
  cep: text('cep'),
  complemento: text('complemento'),

  /* Dados extras vindos do Firebird */
  moradia: integer('moradia'),
  tipo: integer('tipo'),
  situacao: integer('situacao'),
  telefone1: text('telefone1'),
  telefone2: text('telefone2'),
  telefone3: text('telefone3'),
  celular: text('celular'),
  email: text('email'),
  rg: text('rg'),
  cpf: text('cpf'),
  estadoCivil: text('estado_civil'),
  empresa: text('empresa'),
  dataCadastro: timestamp('data_cadastro'),
  dataUltimaCompra: timestamp('data_ultima_compra'),
  previsao: timestamp('previsao'),
  cnae: text('cnae'),
  codMunicipioIbge: text('cod_municipio_ibge'),
  ibge: text('ibge'),

  /* Endereço de correspondência */
  correspEndereco: text('corresp_endereco'),
  correspBairro: text('corresp_bairro'),
  correspCidade: text('corresp_cidade'),
  correspUf: text('corresp_uf'),
  correspCep: text('corresp_cep'),
  correspComplemento: text('corresp_complemento'),
  correspNumero: text('corresp_numero'),

  foto: text('foto'),
  tipoCadastro: text('tipo_cadastro'),
  ie: text('ie'),
  mdia: text('mdia'),
  tDocumento: text('t_documento'),
  tVencimento: text('t_vencimento'),
  tCobranca: text('t_cobranca'),
  retencoes: text('retencoes'),
  simples: text('simples'),
  correios: text('correios'),

  /* E-mails alternativos */
  email1: text('email1'),
  email2: text('email2'),
  email3: text('email3'),
  email4: text('email4'),
  email5: text('email5'),

  contribuinte: text('contribuinte'),
  vlrMens: numeric('vlr_mens', { precision: 15, scale: 2 }),

  observacao: text('observacao'),

  usaFor: integer('usa_for'),
  crt: text('crt'),
  melhorDia: text('melhor_dia'),
  vendedor: text('vendedor'),
  teste: text('teste'),

  /* Flags */
  travado: boolean('travado').default(false),
  ativo: boolean('ativo').default(false),
  inadimplente: boolean('inadimplente').default(false),
  especial: boolean('especial').default(false),
  bloqueado: boolean('bloqueado').default(false),

  pessoa: text('pessoa').default('J'),
  documentosPdf: text('documentos_pdf'),
  codigoAnterior: text('codigo_anterior'),

  /** Timestamps */
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
});


// Add relations for clientsTable
export const clientsTableRelations = relations(clientsTable, ({ one }) => ({
  clinic: one(clinicsTable, {
    fields: [clientsTable.clinicId],
    references: [clinicsTable.id],
  }),
}));

// 🔗 Relações de Clínica
export const clinicsTableRelations = relations(clinicsTable, ({ many }) => ({
  doctors: many(doctorsTable),
  patients: many(patientsTable),
  appointments: many(appointmentsTable),
  usersToClinics: many(usersToClinicsTable),
  exames: many(examesTable),
  clients: many(clientsTable),
}));

/* ---------- Pacientes ---------- */
export const patientsTable = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/* ---------- Médicos ---------- */
export const doctorsTable = pgTable("doctors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/* ---------- Exames ---------- */
export const examesTable = pgTable("exames", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/* ---------- Usuários ---------- */
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  name: text("name"),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

/* ---------- Usuários para Clínicas (Tabela de Junção) ---------- */
export const usersToClinicsTable = pgTable("users_to_clinics", {
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// 📅 Agendamentos
export const appointmentsTable = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: timestamp("date").notNull(),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
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
    clinic: one(clinicsTable, {
      fields: [appointmentsTable.clinicId],
      references: [clinicsTable.id],
    }),
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
  }),
);

export const permissionsTable = pgTable("permissions", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(), // exemplo: "view_clients", "edit_exams"
  description: text("description"),
});

export const userPermissionsTable = pgTable("user_permissions", {
  userId: text("user_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  permissionId: text("permission_id").references(() => permissionsTable.id, { onDelete: "cascade" }).notNull(),
  clinicId: uuid("clinic_id").references(() => clinicsTable.id, { onDelete: "cascade" }).notNull(), // 👈 opcional por clínica
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Client = typeof clientsTable.$inferSelect;
export type NewClient = typeof clientsTable.$inferInsert;