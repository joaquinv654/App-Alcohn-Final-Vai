


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "next_auth";


ALTER SCHEMA "next_auth" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."contact_channel" AS ENUM (
    'WHATSAPP',
    'INSTAGRAM',
    'FACEBOOK',
    'MAIL',
    'OTRO'
);


ALTER TYPE "public"."contact_channel" OWNER TO "postgres";


CREATE TYPE "public"."fabrication_state" AS ENUM (
    'SIN_HACER',
    'HACIENDO',
    'VERIFICAR',
    'HECHO',
    'REHACER',
    'RETOCAR'
);


ALTER TYPE "public"."fabrication_state" OWNER TO "postgres";


CREATE TYPE "public"."machine_type" AS ENUM (
    'C',
    'G',
    'XL',
    'ABC'
);


ALTER TYPE "public"."machine_type" OWNER TO "postgres";


CREATE TYPE "public"."production_state" AS ENUM (
    'PENDIENTE',
    'EN_PROGRESO',
    'COMPLETADO',
    'REVISAR',
    'REHACER'
);


ALTER TYPE "public"."production_state" OWNER TO "postgres";


CREATE TYPE "public"."program_type" AS ENUM (
    'ILLUSTRATOR',
    'PHOTOSHOP',
    'COREL',
    'AUTOCAD',
    'OTRO'
);


ALTER TYPE "public"."program_type" OWNER TO "postgres";


CREATE TYPE "public"."sale_state" AS ENUM (
    'SEÑADO',
    'FOTO_ENVIADA',
    'TRANSFERIDO',
    'DEUDOR'
);


ALTER TYPE "public"."sale_state" OWNER TO "postgres";


CREATE TYPE "public"."shipping_carrier" AS ENUM (
    'ANDREANI',
    'CORREO_ARGENTINO',
    'VIA_CARGO',
    'OTRO'
);


ALTER TYPE "public"."shipping_carrier" OWNER TO "postgres";


CREATE TYPE "public"."shipping_service" AS ENUM (
    'DOMICILIO',
    'SUCURSAL'
);


ALTER TYPE "public"."shipping_service" OWNER TO "postgres";


CREATE TYPE "public"."shipping_state" AS ENUM (
    'SIN_ENVIO',
    'HACER_ETIQUETA',
    'ETIQUETA_LISTA',
    'DESPACHADO',
    'SEGUIMIENTO_ENVIADO'
);


ALTER TYPE "public"."shipping_state" OWNER TO "postgres";


CREATE TYPE "public"."stamp_type" AS ENUM (
    '3MM',
    'ALIMENTO',
    'CLASICO',
    'ABC',
    'LACRE'
);


ALTER TYPE "public"."stamp_type" OWNER TO "postgres";


CREATE TYPE "public"."task_status" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED'
);


ALTER TYPE "public"."task_status" OWNER TO "postgres";


CREATE TYPE "public"."vectorization_state" AS ENUM (
    'BASE',
    'VECTORIZADO',
    'DESCARGADO',
    'EN_PROCESO'
);


ALTER TYPE "public"."vectorization_state" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "next_auth"."uid"() RETURNS "uuid"
    LANGUAGE "sql" STABLE
    AS $$
  select
    coalesce(
        nullif(current_setting('request.jwt.claim.sub', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid
$$;


ALTER FUNCTION "next_auth"."uid"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "next_auth"."accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "provider" "text" NOT NULL,
    "providerAccountId" "text" NOT NULL,
    "refresh_token" "text",
    "access_token" "text",
    "expires_at" bigint,
    "token_type" "text",
    "scope" "text",
    "id_token" "text",
    "session_state" "text",
    "oauth_token_secret" "text",
    "oauth_token" "text",
    "userId" "uuid"
);


ALTER TABLE "next_auth"."accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "next_auth"."sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "expires" timestamp with time zone NOT NULL,
    "sessionToken" "text" NOT NULL,
    "userId" "uuid"
);


ALTER TABLE "next_auth"."sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "next_auth"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "email" "text",
    "emailVerified" timestamp with time zone,
    "image" "text"
);


ALTER TABLE "next_auth"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "next_auth"."verification_tokens" (
    "identifier" "text",
    "token" "text" NOT NULL,
    "expires" timestamp with time zone NOT NULL
);


ALTER TABLE "next_auth"."verification_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "phone_e164" "text",
    "email" "text",
    "dni" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "program_id" "uuid",
    "design_name" "text" NOT NULL,
    "requested_width_mm" numeric,
    "requested_height_mm" numeric,
    "stamp_type" "public"."stamp_type",
    "notes" "text",
    "is_priority" boolean DEFAULT false,
    "item_value" numeric DEFAULT 0,
    "deposit_value_item" numeric DEFAULT 0,
    "fabrication_state" "public"."fabrication_state" DEFAULT 'SIN_HACER'::"public"."fabrication_state",
    "sale_state" "public"."sale_state" DEFAULT 'SEÑADO'::"public"."sale_state",
    "shipping_state" "public"."shipping_state" DEFAULT 'SIN_ENVIO'::"public"."shipping_state",
    "vectorization_state" "public"."vectorization_state" DEFAULT 'BASE'::"public"."vectorization_state",
    "program_type" "public"."program_type",
    "contact_channel" "public"."contact_channel",
    "contact_phone_e164" "text",
    "file_base_url" "text",
    "file_vector_url" "text",
    "file_photo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid",
    "order_date" timestamp with time zone DEFAULT "now"(),
    "deadline_at" timestamp with time zone,
    "shipping_carrier" "public"."shipping_carrier",
    "shipping_service" "public"."shipping_service",
    "tracking_number" "text",
    "taken_by_user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."orders_with_totals" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"uuid" AS "customer_id",
    NULL::timestamp with time zone AS "order_date",
    NULL::timestamp with time zone AS "deadline_at",
    NULL::"public"."shipping_carrier" AS "shipping_carrier",
    NULL::"public"."shipping_service" AS "shipping_service",
    NULL::"text" AS "tracking_number",
    NULL::"uuid" AS "taken_by_user_id",
    NULL::timestamp with time zone AS "created_at",
    NULL::bigint AS "item_count",
    NULL::numeric AS "total_value",
    NULL::numeric AS "total_deposit",
    NULL::numeric AS "total_balance";


ALTER VIEW "public"."orders_with_totals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."programs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "production_date" "date" DEFAULT CURRENT_DATE,
    "machine" "public"."machine_type",
    "fabrication_state" "public"."fabrication_state" DEFAULT 'SIN_HACER'::"public"."fabrication_state",
    "is_verified" boolean DEFAULT false,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."programs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "status" "public"."task_status" DEFAULT 'PENDING'::"public"."task_status",
    "due_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


ALTER TABLE ONLY "next_auth"."accounts"
    ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "next_auth"."users"
    ADD CONSTRAINT "email_unique" UNIQUE ("email");



ALTER TABLE ONLY "next_auth"."accounts"
    ADD CONSTRAINT "provider_unique" UNIQUE ("provider", "providerAccountId");



ALTER TABLE ONLY "next_auth"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "next_auth"."sessions"
    ADD CONSTRAINT "sessiontoken_unique" UNIQUE ("sessionToken");



ALTER TABLE ONLY "next_auth"."verification_tokens"
    ADD CONSTRAINT "token_identifier_unique" UNIQUE ("token", "identifier");



ALTER TABLE ONLY "next_auth"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "next_auth"."verification_tokens"
    ADD CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("token");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_phone_e164_key" UNIQUE ("phone_e164");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."programs"
    ADD CONSTRAINT "programs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE VIEW "public"."orders_with_totals" AS
 SELECT "o"."id",
    "o"."customer_id",
    "o"."order_date",
    "o"."deadline_at",
    "o"."shipping_carrier",
    "o"."shipping_service",
    "o"."tracking_number",
    "o"."taken_by_user_id",
    "o"."created_at",
    "count"("oi"."id") AS "item_count",
    COALESCE("sum"("oi"."item_value"), (0)::numeric) AS "total_value",
    COALESCE("sum"("oi"."deposit_value_item"), (0)::numeric) AS "total_deposit",
    (COALESCE("sum"("oi"."item_value"), (0)::numeric) - COALESCE("sum"("oi"."deposit_value_item"), (0)::numeric)) AS "total_balance"
   FROM ("public"."orders" "o"
     LEFT JOIN "public"."order_items" "oi" ON (("o"."id" = "oi"."order_id")))
  GROUP BY "o"."id";



ALTER TABLE ONLY "next_auth"."accounts"
    ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "next_auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "next_auth"."sessions"
    ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "next_auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_taken_by_user_id_fkey" FOREIGN KEY ("taken_by_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."programs"
    ADD CONSTRAINT "programs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



CREATE POLICY "Allow authenticated users to manage customers" ON "public"."customers" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to manage order_items" ON "public"."order_items" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to manage orders" ON "public"."orders" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to manage programs" ON "public"."programs" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to manage tasks" ON "public"."tasks" USING (("auth"."role"() = 'authenticated'::"text")) WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."programs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "next_auth" TO "service_role";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "next_auth"."accounts" TO "service_role";



GRANT ALL ON TABLE "next_auth"."sessions" TO "service_role";



GRANT ALL ON TABLE "next_auth"."users" TO "service_role";



GRANT ALL ON TABLE "next_auth"."verification_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."orders_with_totals" TO "anon";
GRANT ALL ON TABLE "public"."orders_with_totals" TO "authenticated";
GRANT ALL ON TABLE "public"."orders_with_totals" TO "service_role";



GRANT ALL ON TABLE "public"."programs" TO "anon";
GRANT ALL ON TABLE "public"."programs" TO "authenticated";
GRANT ALL ON TABLE "public"."programs" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


  create policy "Allow authenticated deletes"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'order_files'::text));



  create policy "Allow authenticated inserts"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'order_files'::text));



  create policy "Allow authenticated reads"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'order_files'::text));



  create policy "Allow authenticated updates"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'order_files'::text));



