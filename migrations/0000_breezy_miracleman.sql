CREATE TYPE "public"."colaborador_sex" AS ENUM('masculino', 'feminino', 'outro');--> statement-breakpoint
CREATE TYPE "public"."exame_tipo" AS ENUM('ADMISSIONAL', 'PERIODICO', 'MUDANCA FUNCAO', 'RE. AO TRABALHO', 'DEMISSIONAL', 'OUTROS', 'PCMSO', 'PPRA', 'LCAT', 'PCMAT', 'ART', 'PCA', 'SESMET', 'CONSULTA MEDICA', 'ATESTADO SAN', 'HOMOL. ATESTADO');--> statement-breakpoint
CREATE TYPE "public"."formapagto" AS ENUM('CONVENIO', 'A VISTA', 'C/CORRENTE');--> statement-breakpoint
CREATE TYPE "public"."pedido" AS ENUM('Sim', 'Não');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anamnese_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_anamnese" integer NOT NULL,
	"id_exame" integer NOT NULL,
	"id_medico" integer NOT NULL,
	"valor" numeric(15, 2),
	"faturar" char(1),
	"vencto" date,
	"prazo" char(1),
	"data_lanc" timestamp,
	"data" date,
	"data_liberacao" date,
	"apto" integer,
	"status" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anamnese" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"id_cliente" integer NOT NULL,
	"id_colaborador" integer NOT NULL,
	"id_atendente" text NOT NULL,
	"data" timestamp,
	"formapagto" "formapagto" NOT NULL,
	"total" numeric(15, 2),
	"tipo" "exame_tipo" NOT NULL,
	"vl_caixa" numeric(15, 2),
	"cargo" text,
	"prazo" char(1),
	"status" text,
	"cpf" text,
	"solicitante" text,
	"situacao" char(1),
	"data_lanc" timestamp,
	"setor" text,
	"efetivo" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"razao_social" text,
	"fantasia" text,
	"endereco" text,
	"numero" text,
	"bairro" text,
	"cidade" text,
	"uf" text,
	"cep" text,
	"complemento" text,
	"moradia" integer,
	"tipo" integer,
	"situacao" integer,
	"telefone1" text,
	"telefone2" text,
	"telefone3" text,
	"celular" text,
	"email" text,
	"rg" text,
	"cpf" text,
	"estado_civil" text,
	"empresa" text,
	"data_cadastro" timestamp,
	"data_ultima_compra" timestamp,
	"previsao" timestamp,
	"cnae" text,
	"cod_municipio_ibge" text,
	"ibge" text,
	"corresp_endereco" text,
	"corresp_bairro" text,
	"corresp_cidade" text,
	"corresp_uf" text,
	"corresp_cep" text,
	"corresp_complemento" text,
	"foto" text,
	"tipo_cadastro" text,
	"ie" text,
	"mdia" text,
	"t_documento" text,
	"t_vencimento" text,
	"t_cobranca" text,
	"retencoes" text,
	"simples" text,
	"correios" text,
	"email1" text,
	"email2" text,
	"email3" text,
	"email4" text,
	"email5" text,
	"contribuinte" text,
	"vlr_mens" numeric(15, 2),
	"observacao" text,
	"usa_for" integer,
	"crt" text,
	"melhor_dia" text,
	"vendedor" text,
	"travado" boolean DEFAULT false,
	"ativo" boolean DEFAULT false,
	"inadimplente" boolean DEFAULT false,
	"especial" boolean DEFAULT false,
	"bloqueado" boolean DEFAULT false,
	"pessoa" text DEFAULT 'J',
	"documentos_pdf" text,
	"codigo_anterior" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "colaboradores" (
	"codigo" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"endereco" text,
	"numero" text,
	"complemento" text,
	"bairro" text,
	"cidade" text,
	"uf" text,
	"cep" text,
	"telefone" text,
	"celular" text,
	"cpf" text,
	"rg" text,
	"ctps" text,
	"data_admissao" timestamp,
	"data_demissao" timestamp,
	"situacao" text,
	"obs1" text,
	"data_nascimento" timestamp,
	"setor" text,
	"cargahoraria" text,
	"prontuario" text,
	"observacao" text,
	"pcd" text,
	"cod_anterior" text,
	"phone_number" text NOT NULL,
	"sex" "colaborador_sex" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "doctors" (
	"organization_id" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "colaborador_clientes" (
	"id" serial PRIMARY KEY NOT NULL,
	"colaborador_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"data_admissao" date NOT NULL,
	"data_demissao" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "examescli" (
	"id" serial PRIMARY KEY NOT NULL,
	"idcliente" integer NOT NULL,
	"codiexame" integer NOT NULL,
	"descricao" text,
	"valor" numeric(15, 2) NOT NULL,
	"cargo" text,
	"codexameant" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exames" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"descricao" text NOT NULL,
	"validade" integer NOT NULL,
	"validade1" integer NOT NULL,
	"valor" numeric(15, 2) NOT NULL,
	"pedido" "pedido" NOT NULL,
	"codigo_anterior" text,
	"tipo" "exame_tipo" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "medicos" (
	"codigo" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"nome" text NOT NULL,
	"endereco" text NOT NULL,
	"bairro" text NOT NULL,
	"cidade" text NOT NULL,
	"uf" text NOT NULL,
	"cep" text NOT NULL,
	"cpf" text NOT NULL,
	"telefone" text NOT NULL,
	"celular" text NOT NULL,
	"crm" text NOT NULL,
	"usa_agenda" integer NOT NULL,
	"cod_agenda" integer NOT NULL,
	"numero" text NOT NULL,
	"complemento" text NOT NULL,
	"codiibge" integer NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_subscription_price_id" text,
	"stripe_subscription_status" text,
	"stripe_subscription_current_period_end" bigint,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patients" (
	"organization_id" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "todo" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anamnese_items" ADD CONSTRAINT "anamnese_items_id_anamnese_anamnese_id_fk" FOREIGN KEY ("id_anamnese") REFERENCES "public"."anamnese"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anamnese_items" ADD CONSTRAINT "anamnese_items_id_exame_exames_id_fk" FOREIGN KEY ("id_exame") REFERENCES "public"."exames"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anamnese_items" ADD CONSTRAINT "anamnese_items_id_medico_medicos_codigo_fk" FOREIGN KEY ("id_medico") REFERENCES "public"."medicos"("codigo") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anamnese" ADD CONSTRAINT "anamnese_id_cliente_clients_id_fk" FOREIGN KEY ("id_cliente") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anamnese" ADD CONSTRAINT "anamnese_id_colaborador_colaboradores_codigo_fk" FOREIGN KEY ("id_colaborador") REFERENCES "public"."colaboradores"("codigo") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "colaborador_clientes" ADD CONSTRAINT "colaborador_clientes_colaborador_id_colaboradores_codigo_fk" FOREIGN KEY ("colaborador_id") REFERENCES "public"."colaboradores"("codigo") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "colaborador_clientes" ADD CONSTRAINT "colaborador_clientes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "examescli" ADD CONSTRAINT "examescli_idcliente_clients_id_fk" FOREIGN KEY ("idcliente") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "examescli" ADD CONSTRAINT "examescli_codiexame_exames_id_fk" FOREIGN KEY ("codiexame") REFERENCES "public"."exames"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_colab_client_adm" ON "colaborador_clientes" USING btree ("colaborador_id","client_id","data_admissao");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "stripe_customer_id_idx" ON "organization" USING btree ("stripe_customer_id");