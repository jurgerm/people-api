CREATE TABLE IF NOT EXISTS nd2526_Users (
            id INTEGER AUTO_INCREMENT NOT NULL,
            email VARCHAR (50) NOT NULL,
            password CHAR (60) NOT NULL,
            reg_timestamp INTEGER,
            PRIMARY KEY (id),
            username VARCHAR (50) NOT NULL,
            UNIQUE (username)
);
            