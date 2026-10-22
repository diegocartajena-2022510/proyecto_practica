import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Cargar las variables de entorno al inicio de todo
dotenv.config();

// Crear el pool de conexiones usando process.env
const pool = mysql.createPool({
    host: 'localhost',
    user: "root",
    password: "090417",
    database: "proyecto_practicas",
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función para probar la conexión
export const testConnection = async () => {
    try {
        console.log('Intentando conectar con el usuario:', process.env.DB_USER);
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT 1 + 1 AS solution');
        console.log('¡Conexión a MySQL exitosa! 🚀 Resultado:', rows);
        connection.release();
    } catch (error) {
        console.error('Error al conectar a la base de datos MySQL ❌:', error);
    }
};

export default pool;