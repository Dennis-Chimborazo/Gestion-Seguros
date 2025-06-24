import pkg from 'pg';
const { Client } = pkg;

class DataBase {
  static instancia;
  constructor() {
    if (DataBase.instancia) {
      return DataBase.instancia;
    }

    this.client = new Client({
      user: 'root',
      host: 'dpg-d1bio0je5dus73em5fng-a.oregon-postgres.render.com',
      database: 'gestionseguros',
      password: 'qT0zrHI3ph9rIrx2RzvmezVr0qtp4Dp9',
      port: 5432,
      ssl: {
        rejectUnauthorized: false // ⚠ Importante para Render
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




