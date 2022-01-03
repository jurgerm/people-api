create table if not exists cars(
  id INT AUTO_INCREMENT PRIMARY KEY,
  title TEXT,
  image TEXT,
  price DECIMAL(5,2),
  numberplates VARCHAR(20)
);