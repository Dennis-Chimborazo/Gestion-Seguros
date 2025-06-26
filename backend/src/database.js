import pkg from 'pg';
const { Client } = pkg;

class DataBase {
  static instancia;
  constructor() {
    if (DataBase.instancia) {
      return DataBase.instancia;
    }
    this.client = new Client({
      user: 'gestorseguros_user',
      host: 'dpg-d1dsn3umcj7s73bf4dkg-a.oregon-postgres.render.com',
      database: 'gestorseguros',
      password: 'a5bTM4ZbC49Fc9K5ulaSGvNwCFlj7vKF',
      port: 5432, 
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




