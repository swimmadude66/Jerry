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
	row_id bigint GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
	id uuid DEFAULT uuid_generate_v4()::UUID NOT NULL,
	"name" varchar NOT NULL,
	"description" text NULL,
	default_reserve_time int DEFAULT 21600 NOT NULL,
	CONSTRAINT resource_pk PRIMARY KEY (id)
);


CREATE TABLE "claim" (
	row_id bigint GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	user_id uuid NOT NULL,
	resource_id uuid NOT NULL,
	is_active bool DEFAULT true NOT NULL,
	expires bigint NOT NULL,
	CONSTRAINT claim_unique UNIQUE (id),
	CONSTRAINT claim_unique_1 UNIQUE (user_id, resource_id, is_active),
	CONSTRAINT claim_resource_fk FOREIGN KEY (resource_id) REFERENCES resource(id),
	CONSTRAINT claim_user_fk FOREIGN KEY (user_id) REFERENCES "user"(id)
);
CREATE INDEX claim_is_active_idx ON claim USING btree (is_active);
CREATE INDEX claim_resource_id_idx ON claim USING btree (resource_id);
CREATE INDEX claim_resource_id_user_id_idx ON claim USING btree (resource_id, user_id);
CREATE INDEX claim_user_id_idx ON claim USING btree (user_id);


CREATE TABLE "message" (
	row_id int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
	"id" uuid DEFAULT uuid_generate_v4() NOT NULL,
	recipient_id uuid NOT NULL,
	resource_id uuid null,
	body text not null,
	sent_at int8 not null default FLOOR(EXTRACT(EPOCH from now()) * 1000),
	CONSTRAINT message_pk PRIMARY KEY (id),
	CONSTRAINT message_user_fk FOREIGN KEY (recipient_id) REFERENCES "user"(id),
	CONSTRAINT message_resource_fk FOREIGN KEY (resource_id) REFERENCES "resource"(id)
);




