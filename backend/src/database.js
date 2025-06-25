import pkg from 'pg';          
const { Client } = pkg;

 class DataBase{
  static instancia;
  constructor (){
    if (DataBase.instancia) {
      return DataBase.instancia;
    }

   this.client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'gestionPruebas',
      password: 'admin',
      port: 5432, 
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




