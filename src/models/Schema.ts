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

/* ---------- Clientes da clínica ---------- */
export const clientsTable = pgTable('clients', {
  id: serial('id').primaryKey(),

  /** Relaciona diretamente à Organization do Clerk */
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizationSchema.id, { onDelete: 'cascade' }),

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
