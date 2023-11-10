CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "login" varchar(50) UNIQUE NOT NULL,
  "email" varchar(191) NOT NULL,
  "password" varchar(255) NOT NULL,
  "created" timestamp NOT NULL DEFAULT (current_timestamp)
);

CREATE TABLE "tables" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "name" varchar(50) UNIQUE NOT NULL,
  "count" integer NOT NULL DEFAULT 0,
  "created" timestamp NOT NULL DEFAULT (current_timestamp),
  "password" varchar(255) DEFAULT null
);

CREATE TABLE "options" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "table_id" integer NOT NULL,
  "type_adding" varchar(10) NOT NULL DEFAULT 'fast',
  "round_step" integer NOT NULL DEFAULT 10,
  "hidden_cols" json NOT NULL DEFAULT '{"number":false,"entity":false,"description":false}',
  "using_keys" json NOT NULL DEFAULT '{"delete":"Delete","up":"ArrowUp","down":"ArrowDown"}'
);

CREATE TABLE "entities" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "option_id" integer NOT NULL,
  "table_id" integer NOT NULL,
  "key" varchar(50) NOT NULL,
  "rate" integer NOT NULL,
  "text" varchar(50) NOT NULL
);

CREATE TABLE "table_rows" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "table_id" integer NOT NULL,
  "entity_id" integer NOT NULL,
  "start" timestamp NOT NULL,
  "finish" timestamp NOT NULL,
  "is_paid" boolean NOT NULL DEFAULT false,
  "title" varchar(191) NOT NULL DEFAULT '',
  "description" varchar(255) NOT NULL DEFAULT '',
  "order" INTEGER GENERATED BY DEFAULT AS IDENTITY
);

ALTER TABLE
  "tables"
ADD
  FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE
  "options"
ADD
  FOREIGN KEY ("table_id") REFERENCES "tables" ("id");

ALTER TABLE
  "entities"
ADD
  FOREIGN KEY ("option_id") REFERENCES "options" ("id");

ALTER TABLE
  "table_rows"
ADD
  FOREIGN KEY ("table_id") REFERENCES "tables" ("id");

ALTER TABLE
  "table_rows"
ADD
  FOREIGN KEY ("entity_id") REFERENCES "entities" ("id");

ALTER TABLE
  "entities"
ADD
  FOREIGN KEY ("table_id") REFERENCES "tables" ("id");