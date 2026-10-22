import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool=mysql.createPool({

    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query('SELECT 1 + 1 AS solution');
    console.log('¡Conexión exitosa a MySQL! Resultado de prueba:', rows);
    
    connection.release();
  } catch (error) {
    console.error('Error al conectar a la base de datos MySQL :', error);
  }
};