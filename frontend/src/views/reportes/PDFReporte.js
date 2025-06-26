
export class PDFReporte {
  constructor(tipo, id) {
    this.tipo = tipo;
    this.id = id;
    this.doc = null;
    this.jsPDF = null;
    this.imageUrl = 'banner.jpeg';
    this.lugar = "Ambato, Ecuador";
  }

  async init() {
    await this.loadLibraries();
    this.doc = new this.jsPDF();
  }

  async loadLibraries() {
    if (!window.jspdf) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    if (!window.jspdf?.autoTable) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    this.jsPDF = window.jspdf.jsPDF;
  }

  async getImageData() {
    const blob = await fetch(this.imageUrl).then(res => res.blob());
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  async generar() {
    await this.init();

    switch (this.tipo) {
      case "general":
        await this.generarReporteGeneral();
        break;
      case "cliente":
        await this.generarReporteCliente();
        break;
      case "agente":
        await this.generarReporteAgente();
        break;
      default:
        throw new Error("Tipo de reporte no soportado");
    }
  }

  generarPieFirma() {
    const doc = this.doc;
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.text(`${this.lugar} - ${new Date().toLocaleDateString()}`, 14, pageHeight - 15);
    doc.text("_", 150, pageHeight - 20);
    doc.text("Responsable académico", 160, pageHeight - 15);
  }

  abrirPDF() {
    const pdfBlob = this.doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, "_blank");
  }

async generarReporteGeneralConDatos(data) {
  const doc = this.doc;
  const imageData = await this.getImageData();

  doc.addImage(imageData, 'PNG', 0, 0, 210, 30);
  doc.setFontSize(18);
  doc.text("REPORTE GENERAL", 105, 42, { align: "center" });

  let y = 60;
  const detalles = [
    ["Clientes registrados:", data.total_clientes],
    ["Seguros activos:", data.total_seguros],
    ["Fecha del reporte:", new Date().toLocaleDateString()]
  ];
  detalles.forEach(([label, value]) => {
    doc.setFontSize(11);
    doc.text(label, 16, y);
    doc.text(String(value), 70, y);
    y += 6;
  });

  // Filtro para evitar mostrar tipos con total = 0
  const segurosFiltrados = (Array.isArray(data.seguros_por_tipo) ? data.seguros_por_tipo : []).filter(s => Number(s.total) > 0);

  doc.autoTable({
    startY: y + 4,
    head: [["#", "Tipo de Seguro", "Cantidad"]],
    body: segurosFiltrados.map((s, i) => [
      i + 1,
      s.nom_tip_seg,
      s.total
    ]),
    styles: { fontSize: 10 },
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: 255
    }
  });

  this.generarPieFirma();
  this.abrirPDF();
}

async generarReporteClienteConDatos(data) {
  const doc = this.doc;
  const imageData = await this.getImageData();
  const cliente = data[0]; // Es un array con un único objeto
  const personales = cliente.datos_personales;

  // Banner
  doc.addImage(imageData, 'PNG', 0, 0, 210, 30);

  // Título
  doc.setFontSize(18);
  doc.text("REPORTE DETALLADO DE CLIENTE", 105, 42, { align: "center" });

  // Datos personales
  const detalles = [
    ["Nombre:", `${personales.nom_cli} ${personales.ape_cli}`],
    ["Cédula:", personales.cedr_cli],
    ["Email:", personales.email_pers],
    ["Teléfono:", personales.tel_pers || personales.cel_pers],
    ["Sexo:", personales.sexo_cli],
    ["Edad:", personales.edad_pers],
    ["Nacionalidad:", personales.nacion_cli],
    ["Estado Civil:", personales.estado_civil_pers],
    ["Fecha Nac.:", personales.fecha_naci_cli],
    ["Lugar Nac.:", personales.lugar_naci_cli],
    ["Dirección:", `${personales.calle_princ_pers} y ${personales.calle_secun_pers}`],
    ["Parroquia:", personales.parroq_cli],
    ["Ciudad:", `${personales.nom_ciud} - ${personales.nom_provin}`],
    ["Estado actual:", personales.nom_estado]
  ];

  let y = 60;
  detalles.forEach(([label, value]) => {
    doc.setFontSize(11);
    doc.text(label, 16, y);
    doc.text(String(value), 70, y);
    y += 6;
  });

  // Tabla de seguros
  if (cliente.seguros?.length > 0) {
    doc.autoTable({
      startY: y + 4,
      head: [["#", "Tipo de Seguro", "Ciudad", "Fecha", "Monto", "Estado"]],
      body: cliente.seguros.map((s, i) => [
        i + 1,
        s.nom_tip_seg,
        s.ciud_seguro,
        `${s.dia_seguro}/${s.mes_seguro}/${s.anio_seguro}`,
        `$${s.monto_seguro}`,
        s.nom_estado
      ]),
      styles: { fontSize: 9 },
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: 255,
        halign: 'center',
        fontStyle: 'bold'
      }
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Tabla de pagos
  if (cliente.pagos?.length > 0) {
    doc.autoTable({
      startY: y,
      head: [["#", "Fecha", "Monto", "Comprobante", "Estado"]],
      body: cliente.pagos.map((p, i) => [
        i + 1,
        p.fecha_pago,
        `$${p.nonto_pago}`,
        p.comprobante_pago,
        p.nom_estado
      ]),
      styles: { fontSize: 9 },
      headStyles: {
        fillColor: [34, 153, 84],
        textColor: 255,
        halign: 'center',
        fontStyle: 'bold'
      }
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Tabla de reembolsos
  if (cliente.reembolsos?.length > 0) {
    doc.autoTable({
      startY: y,
      head: [["#", "Fecha", "Motivo", "Estado"]],
      body: cliente.reembolsos.map((r, i) => [
        i + 1,
        r.fecha_reemb,
        r.motivo_reemb,
        r.nom_estado
      ]),
      styles: { fontSize: 9 },
      headStyles: {
        fillColor: [255, 153, 0],
        textColor: 0,
        halign: 'center',
        fontStyle: 'bold'
      }
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Tabla de archivos
  if (cliente.archivos?.length > 0) {
    doc.autoTable({
      startY: y,
      head: [["#", "Nombre del Archivo", "Tipo", "MIME"]],
      body: cliente.archivos.map((a, i) => [
        i + 1,
        a.nombre_archivo_cliente,
        a.tipo_archivos_cliente,
        a.mime_type_archivo_cliente
      ]),
      styles: { fontSize: 9 },
      headStyles: {
        fillColor: [100, 100, 100],
        textColor: 255,
        halign: 'center',
        fontStyle: 'bold'
      }
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // Pie de firma
  this.generarPieFirma();
  this.abrirPDF();
}

}
export default PDFReporte;
