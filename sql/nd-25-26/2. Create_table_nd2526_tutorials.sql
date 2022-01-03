CREATE TABLE IF NOT EXISTS nd2526_Tutorials (
            id INTEGER AUTO_INCREMENT NOT NULL,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            is_private boolean not null default 0,
             PRIMARY KEY (id),
             FOREIGN KEY (user_id) REFERENCES nd2526_Users (id)
);