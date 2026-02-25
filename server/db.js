import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'mysql-quizzbros.alwaysdata.net',
  user: 'quizzbros_admin',
  password: 'Recuerda.333',
  database: 'quizzbros_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database
async function initDB() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado a la base de datos MySQL en Alwaysdata');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`preguntas\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`pregunta\` TEXT NOT NULL,
        \`respuesta_a\` VARCHAR(255) NOT NULL,
        \`respuesta_b\` VARCHAR(255) NOT NULL,
        \`respuesta_c\` VARCHAR(255) NOT NULL,
        \`respuesta_d\` VARCHAR(255) NOT NULL,
        \`respuesta_correcta\` ENUM('A', 'B', 'C', 'D') NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    connection.release();
  } catch (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
  }
}

initDB();

export async function getAllQuestions() {
  const [rows] = await pool.query('SELECT * FROM preguntas ORDER BY id DESC');
  return rows;
}

export async function getQuestionById(id) {
  const [rows] = await pool.execute('SELECT * FROM preguntas WHERE id = ?', [id]);
  return rows[0];
}

export async function addQuestion({ text, option_a, option_b, option_c, option_d, correct_option }) {
  const [result] = await pool.execute(`
    INSERT INTO preguntas (pregunta, respuesta_a, respuesta_b, respuesta_c, respuesta_d, respuesta_correcta)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [text, option_a, option_b, option_c, option_d, correct_option.toUpperCase()]);

  return { id: result.insertId, text, option_a, option_b, option_c, option_d, correct_option };
}

export async function updateQuestion(id, { text, option_a, option_b, option_c, option_d, correct_option }) {
  await pool.execute(`
    UPDATE preguntas 
    SET pregunta = ?, respuesta_a = ?, respuesta_b = ?, respuesta_c = ?, respuesta_d = ?, respuesta_correcta = ?
    WHERE id = ?
  `, [text, option_a, option_b, option_c, option_d, correct_option.toUpperCase(), id]);

  return getQuestionById(id);
}

export async function deleteQuestion(id) {
  await pool.execute('DELETE FROM preguntas WHERE id = ?', [id]);
}

export async function getRandomQuestions(count) {
  const [rows] = await pool.execute(`SELECT * FROM preguntas ORDER BY RAND() LIMIT ?`, [count]);
  return rows;
}

export async function getQuestionCount() {
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM preguntas');
  return rows[0].count;
}

export default pool;

