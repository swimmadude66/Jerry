CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE table if not EXISTS "user" (
	id uuid DEFAULT uuid_generate_v4()::UUID NOT NULL,
	email varchar NOT NULL,
	pass_hash varchar NULL,
	pass_salt varchar NULL,
	user_name text NULL,
	avatar_url text NULL,
	is_admin bool NOT NULL DEFAULT FALSE
	CONSTRAINT user_pk PRIMARY KEY (id),
	CONSTRAINT user_unique UNIQUE (email)
);

CREATE TABLE "session" (
	id int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
	"key" varchar NOT NULL,
	expires int8 NOT NULL,
	user_id uuid NOT NULL,
	active bool DEFAULT true NOT NULL,
	CONSTRAINT session_pk PRIMARY KEY (key),
	CONSTRAINT session_unique UNIQUE (id),
	CONSTRAINT session_user_fk FOREIGN KEY (user_id) REFERENCES "user"(id)
);

CREATE TABLE "resource" (
	rowid bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
	id uuid DEFAULT uuid_generate_v4()::UUID NOT NULL,
	"name" varchar NOT NULL,
	description text NULL,
	default_reserve_time int DEFAULT 21600 NOT NULL,
	CONSTRAINT resource_pk PRIMARY KEY (id)
);