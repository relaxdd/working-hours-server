CREATE TABLE IF NOT EXISTS users
(
    id        INTEGER(11) UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
    login     VARCHAR(50) UNIQUE                              NOT NULL,
    email     VARCHAR(191)                                    NOT NULL,
    password  VARCHAR(255)                                    NOT NULL,
    created   DATETIME   DEFAULT CURRENT_TIMESTAMP            NOT NULL,
    activated TINYINT(1) DEFAULT 0                            NOT NULL
);

CREATE TABLE IF NOT EXISTS tables
(
    id       INTEGER(11) UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name     VARCHAR(50) UNIQUE                              NOT NULL,
    password VARCHAR(255)                                    NULL,
    created  DATETIME DEFAULT CURRENT_TIMESTAMP              NOT NULL,
    user_id  INTEGER(11) UNSIGNED                            NULL,

    FOREIGN KEY (user_id) references users (id)
);

INSERT INTO `tables` (name, password, user_id)
VALUES ('', NULL, '');

# Creating users
# INSERT INTO users (login, email, password, created)
# VALUES ('', '', '', '');

# add new column
# ALTER TABLE `users` ADD `activated` TINYINT(1) NOT NULL DEFAULT 0 after `created`

# Deleting users
# DELETE
# FROM `users`
# WHERE (`id` = '1');