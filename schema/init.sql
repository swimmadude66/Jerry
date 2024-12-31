CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE table if not EXISTS "user" (
	id uuid DEFAULT uuid_generate_v4()::UUID NOT NULL,
	email varchar NOT NULL,
	pass_hash varchar NULL,
	pass_salt varchar NULL,
	CONSTRAINT user_pk PRIMARY KEY (id),
	CONSTRAINT user_unique UNIQUE (email)
);

CREATE TABLE "session" (
	id int8 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
	"key" varchar NOT NULL,
	expires int8 NOT NULL,
	user_id uuid NOT NULL,
	CONSTRAINT session_pk PRIMARY KEY (key),
	CONSTRAINT session_unique UNIQUE (id),
	CONSTRAINT session_user_fk FOREIGN KEY (user_id) REFERENCES "user"(id)
);