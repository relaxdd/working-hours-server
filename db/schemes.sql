CREATE TABLE IF NOT EXISTS users
(
    id        SERIAL PRIMARY KEY NOT NULL,
    login     varchar(50) UNIQUE NOT NULL,
    email     varchar(191)       NOT NULL,
    password  varchar(255)       NOT NULL,
    created   TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activated BOOLEAN            NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS tables
(
    id       SERIAL PRIMARY KEY NOT NULL,
    name     varchar(50) UNIQUE NOT NULL,
    password varchar(255)       NULL,
    count    INTEGER            NOT NULL DEFAULT 0,
    created  TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id  INTEGER            NULL,

    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS table_rows
(
    id SERIAL PRIMARY KEY NOT NULL
);

# INSERT INTO `tables` (name, password, user_id) VALUES ('', NULL, '');
INSERT INTO users (login, email, password)
VALUES ('awenn2015', 'awenn2015@gmail.com', '$2y$10$tMzJkczY.AKQLWhlrjLtZOmNVrah1.MuFTR/Q/L5AuzaE1rbY4.FW');

# add new column in table
# ALTER TABLE `users` ADD `activated` TINYINT(1) NOT NULL DEFAULT 0 after `created`

# Deleting users
# DELETE
# FROM `users`
# WHERE (`id` = '1');
