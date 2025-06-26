import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RevisionPagoAdmin from "../pagos/RevisionPagoAdmin";
import PagosFun from "../pagos/PagosFun";
import Archivos from "../../services/Archivos";
import swal from "sweetalert2";

jest.mock("../pagos/PagosFun");
jest.mock("../../services/Archivos");

jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));

describe("RevisionPagoAdmin", () => {
  const pagoMock = {
    id_pago: 123,
    nombre: "Juan Perez",
    cedr_cli: "1234567890",
    fecha_pago: "2025-06-26",
    nonto_pago: 100,
    comprobante_pago: "comp123",
    nom_tip_seg: "Seguro A",
    nom_estado: "Pendiente",
    id_archivos_cliente: 555,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("revisionPagos", JSON.stringify({ revision: pagoMock }));
  });

  afterEach(() => {
    localStorage.clear();
  });


  test("muestra mensaje de carga si no hay datos", () => {
    localStorage.removeItem("revisionPagos");
    render(<RevisionPagoAdmin mostrarSeccion={jest.fn()} />);
    expect(screen.getByText(/Cargando datos del reembolso/i)).toBeInTheDocument();
  });

  test("carga y muestra datos y PDF", async () => {
    Archivos.traerArchivo.mockResolvedValue("http://fakeurl.com/archivo.pdf");

    render(<RevisionPagoAdmin mostrarSeccion={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Juan Perez")).toBeInTheDocument();
      expect(screen.getByText(/\$100/)).toBeInTheDocument();
      expect(screen.getByTestId("pdf-embed")).toHaveAttribute("src", "http://fakeurl.com/archivo.pdf");
    });
  });

  test("maneja acción aceptado con confirmación y llamada a PagosFun", async () => {
    Archivos.traerArchivo.mockResolvedValue(null);
    PagosFun.aceptarRevisionPago.mockResolvedValue({ success: true });

    // Mockear swal.fire para que siempre devuelva isConfirmed: true
    swal.fire.mockImplementation(() => Promise.resolve({ isConfirmed: true }));

    const mostrarSeccionMock = jest.fn();
    render(<RevisionPagoAdmin mostrarSeccion={mostrarSeccionMock} />);

    await waitFor(() => screen.getByText("Aceptado"));

    fireEvent.click(screen.getByText("Aceptado"));

    // Esperar a que swal.fire sea llamado y PagosFun también
    await waitFor(() => {
      expect(swal.fire).toHaveBeenCalledWith(expect.objectContaining({
        title: expect.stringContaining("Confirmacion"),
      }));
    });

    await waitFor(() => {
      expect(PagosFun.aceptarRevisionPago).toHaveBeenCalledWith(
        expect.objectContaining({
          descripcion_revision_pago: expect.any(String),
          id_pago: pagoMock.id_pago,
        }),
        expect.anything()
      );
      expect(mostrarSeccionMock).toHaveBeenCalledWith("reviPagosAdmin");
    });
  });

  test("no hace nada si usuario cancela confirmación en acción aceptado", async () => {
    Archivos.traerArchivo.mockResolvedValue(null);

    // Simula que el usuario cancela la confirmación
    swal.fire.mockImplementation(() => Promise.resolve({ isConfirmed: false }));

    const mostrarSeccionMock = jest.fn();
    render(<RevisionPagoAdmin mostrarSeccion={mostrarSeccionMock} />);

    await waitFor(() => screen.getByText("Aceptado"));

    fireEvent.click(screen.getByText("Aceptado"));

    // Espera que swal.fire se haya llamado
    await waitFor(() => {
      expect(swal.fire).toHaveBeenCalledWith(expect.objectContaining({
        title: expect.stringContaining("Confirmacion"),
      }));
    });

    // Verifica que PagosFun no se llame y mostrarSeccion tampoco
    await waitFor(() => {
      expect(PagosFun.aceptarRevisionPago).not.toHaveBeenCalled();
      expect(mostrarSeccionMock).not.toHaveBeenCalled();
    });
  });
  test("no muestra embed si no hay pdfUrl", async () => {
    Archivos.traerArchivo.mockResolvedValue(null);
    render(<RevisionPagoAdmin mostrarSeccion={jest.fn()} />);

    await waitFor(() => screen.getByText("Juan Perez"));

    // El embed con testid 'pdf-embed' no debe existir
    expect(screen.queryByTestId("pdf-embed")).not.toBeInTheDocument();
  });
  test("muestra alerta de error si falla llamada a PagosFun en aceptado", async () => {
    Archivos.traerArchivo.mockResolvedValue(null);
    PagosFun.aceptarRevisionPago.mockRejectedValue(new Error("Fallo en la API"));

    // Simula que el usuario confirma la alerta
    swal.fire.mockImplementation(() => Promise.resolve({ isConfirmed: true }));

    render(<RevisionPagoAdmin mostrarSeccion={jest.fn()} />);

    await waitFor(() => screen.getByText("Aceptado"));

    fireEvent.click(screen.getByText("Aceptado"));

    // Espera que la alerta de confirmación aparezca
    await waitFor(() => {
      expect(swal.fire).toHaveBeenCalledWith(expect.objectContaining({
        title: expect.stringContaining("Confirmacion"),
      }));
    });

    // Espera que la alerta de error aparezca tras el fallo
    await waitFor(() => {
      expect(swal.fire).toHaveBeenCalledWith(expect.objectContaining({
        title: expect.stringContaining("Advertencia"),
        text: expect.stringContaining("Verifique los datos"),
      }));
    });
  });


});
