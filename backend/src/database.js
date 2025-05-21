import pkg from 'pg';          
const { Client } = pkg;

 class DataBase{
  static instancia;
  constructor (){
    if (DataBase.instancia) {
      return DataBase.instancia;
    }

    this.client = new Client({
      user: 'admin',
      host: 'dpg-d0j12bd6ubrc73cko57g-a.oregon-postgres.render.com',
      database: 'gestionpruebas',
      password: 'cTbyF9p3fcC4Yo7xpFNzcLwtvK6TboTH',
      port: 5432, 
       ssl: {
        rejectUnauthorized: false // ⚠ Importante para Render
      }
    });

    this.#connect(); 
    DataBase.instancia=this;
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




