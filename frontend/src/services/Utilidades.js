
class Utilidades {

  static async crearRutaAleatoria() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let cadenaAleatoria = '';
    for (let i = 0; i < 20; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      cadenaAleatoria += caracteres.charAt(indiceAleatorio);
    }
    return cadenaAleatoria;
  }

  static async crearPassAleatoria() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let cadenaAleatoria = '';
    for (let i = 0; i < 7; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      cadenaAleatoria += caracteres.charAt(indiceAleatorio);
    }
    return cadenaAleatoria;
  }

  static async correoValido(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  }

  static async validarNumeros(valor) {
    const regex = /^[0-9]+$/;
    return regex.test(valor);
}

static async validarCantidad(valor) {
    const regex = /^\d+(\.\d+)?$/;
    return regex.test(valor);
}



}

export default Utilidades;