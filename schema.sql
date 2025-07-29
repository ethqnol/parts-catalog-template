-- Part Types table
CREATE TABLE part_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Parts table
CREATE TABLE parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part_type_id INTEGER NOT NULL,
    current_count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (part_type_id) REFERENCES part_types (id)
);

-- Transaction logs table
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    part_id INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('add', 'remove')),
    quantity INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    reason TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES parts (id)
);
