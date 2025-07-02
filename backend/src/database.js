import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pkg;

class DataBase {
  static instancia;
  constructor() {
    if (DataBase.instancia) {
      return DataBase.instancia;
    }

    this.client = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      ssl: {
        rejectUnauthorized: false
      }
    });

    this.#connect();
    DataBase.instancia = this;
  }

  async #connect() {
    try {
      await this.client.connect();
      console.log('✅ Conectado a PostgreSQL correctamente');
    } catch (error) {
      console.error('❌ Error al conectar a PostgreSQL:', error);
    }
  }

  getConexion() {
    return this.client;
  }
}
export { DataBase };
