create table if not exists shirts(
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand TEXT,
  model varchar(20),
  size varchar(2),
  price DECIMAL(5,2)
);