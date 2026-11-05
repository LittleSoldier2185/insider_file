
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL DEFAULT '',
  department VARCHAR(100) NOT NULL DEFAULT '',
  role ENUM('admin','evaluatee','evaluator') NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS periods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  FOREIGN KEY (period_id) REFERENCES periods(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS indicators (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topic_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  detail TEXT,
  weight DECIMAL(6,2) NOT NULL DEFAULT 1,
  score_type ENUM('yesno','scale') NOT NULL DEFAULT 'scale',
  evidence VARCHAR(255) NOT NULL DEFAULT '',
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period_id INT NOT NULL,
  evaluatee_id INT NOT NULL,
  evaluator_id INT NOT NULL,
  committee_role ENUM('chair','member') NOT NULL DEFAULT 'member',
  status ENUM('pending','draft','confirmed') NOT NULL DEFAULT 'pending',
  comment TEXT,
  signature VARCHAR(255),
  UNIQUE (period_id, evaluatee_id, evaluator_id),
  FOREIGN KEY (period_id) REFERENCES periods(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluatee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS self_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evaluatee_id INT NOT NULL,
  indicator_id INT NOT NULL,
  score INT NOT NULL,
  UNIQUE (evaluatee_id, indicator_id),
  FOREIGN KEY (evaluatee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS self_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evaluatee_id INT NOT NULL,
  indicator_id INT NOT NULL,
  detail TEXT NOT NULL,
  url VARCHAR(500) NOT NULL DEFAULT '',
  file_name VARCHAR(255) NOT NULL DEFAULT '',
  FOREIGN KEY (evaluatee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  indicator_id INT NOT NULL,
  score INT NOT NULL,
  UNIQUE (assignment_id, indicator_id),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE
);
