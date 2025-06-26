// __tests__/ListaPagoCliente.test.jsx
import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import ListaPagoCliente from "../pagos/ListaPagoCliente";
import PagosFun from "../pagos/PagosFun";
import InfoPagoRechazado from "../pagos/InfoPagoRechazado";
import { BrowserRouter } from "react-router-dom";

jest.mock("../pagos/PagosFun");
jest.mock("../pagos/InfoPagoRechazado", () => {
  return function DummyInfoPagoRechazado({ cerrarModalRechazado }) {
    return (
      <div data-testid="modal-info-pago-rechazado">
        <button onClick={cerrarModalRechazado}>Cerrar Modal</button>
      </div>
    );
  };
});

const mockDatosPagos = [
  {
    id_pago: 1,
    comprobante_pago: "ABC123",
    nom_tip_seg: "Seguro Dental",
    fecha_pago: "2023-01-01",
    nonto_pago: "100.00",
    nom_estado: "rechazado",
    cedr_cli: "1712345678",
  },
  {
    id_pago: 2,
    comprobante_pago: "XYZ789",
    nom_tip_seg: "Seguro Médico",
    fecha_pago: "2023-02-01",
    nonto_pago: "200.00",
    nom_estado: "aprobado",
    cedr_cli: "1712345679",
  },
  {
    id_pago: 3,
    comprobante_pago: "DEF456",
    nom_tip_seg: "Seguro Vida",
    fecha_pago: "2023-03-01",
    nonto_pago: "300.00",
    nom_estado: "pendiente",
    cedr_cli: "1712345680",
  },
];

const renderComponent = (props = {}) =>
  render(
    <BrowserRouter>
      <ListaPagoCliente {...props} />
    </BrowserRouter>
  );

describe("ListaPagoCliente", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("muestra loading inicialmente", async () => {
    PagosFun.pagoRevisionCliente.mockResolvedValue([]);
    renderComponent({ id: "1" });
    expect(screen.getByText(/Revision de Pagos/i)).toBeInTheDocument();
    expect(screen.getByTestId("cargar-tablas")).toBeInTheDocument();
    await waitFor(() => {
      expect(PagosFun.pagoRevisionCliente).toHaveBeenCalled();
    });
  });

  test("carga y muestra datos en la tabla", async () => {
    PagosFun.pagoRevisionCliente.mockResolvedValue(mockDatosPagos);
    renderComponent({ id: "1" });

    await waitFor(() => {
      expect(screen.getByText("ABC123")).toBeInTheDocument();
      expect(screen.getByText("Seguro Dental")).toBeInTheDocument();
      expect(screen.getByText("100.00")).toBeInTheDocument();
      expect(screen.getByText("rechazado")).toBeInTheDocument();
    });

    // Verifica que no muestre el texto noDataComponent
    expect(
      screen.queryByText(/No hay Solicitudes de Reembolsos para mostrar/i)
    ).not.toBeInTheDocument();
  });

  test("filtra datos por cedr_cli", async () => {
    PagosFun.pagoRevisionCliente.mockResolvedValue(mockDatosPagos);
    renderComponent({ id: "1" });

    await waitFor(() => screen.getByText("ABC123"));

    const input = screen.getByPlaceholderText(/Ingrese numero de reembolso/i);

    // Filtro que coincida con solo un cliente
    fireEvent.change(input, { target: { value: "1712345678" } });

    await waitFor(() => {
      expect(screen.getByText("ABC123")).toBeInTheDocument();
      expect(screen.queryByText("XYZ789")).not.toBeInTheDocument();
      expect(screen.queryByText("DEF456")).not.toBeInTheDocument();
    });
  });

  test("borrar filtro muestra todos los datos", async () => {
    PagosFun.pagoRevisionCliente.mockResolvedValue(mockDatosPagos);
    renderComponent({ id: "1" });

    await waitFor(() => screen.getByText("ABC123"));

    const input = screen.getByPlaceholderText(/Ingrese numero de reembolso/i);
    fireEvent.change(input, { target: { value: "1712345678" } });

    await waitFor(() => {
      expect(screen.queryByText("XYZ789")).not.toBeInTheDocument();
    });

    const btnLimpiar = screen.getByRole("button", { name: /limpiar filtros/i });
    fireEvent.click(btnLimpiar);

    // Vuelven todos los datos
    await waitFor(() => {
      expect(screen.getByText("XYZ789")).toBeInTheDocument();
      expect(screen.getByText("DEF456")).toBeInTheDocument();
    });
  });

  test("muestra modal al hacer click en icono de estado rechazado y lo cierra", async () => {
    PagosFun.pagoRevisionCliente.mockResolvedValue(mockDatosPagos);
    renderComponent({ id: "1" });

    await waitFor(() => screen.getByText("ABC123"));

    // El primer elemento con estado rechazado debe mostrar icono
    const icono = screen.getByTestId("icono-estado-0");
    expect(icono).toBeInTheDocument();

    fireEvent.click(icono);

    // Modal aparece
    await waitFor(() => {
      expect(screen.getByTestId("modal-info-pago-rechazado")).toBeInTheDocument();
    });

    // Cerrar modal
    const btnCerrarModal = screen.getByText(/Cerrar Modal/i);
    fireEvent.click(btnCerrarModal);

    await waitFor(() => {
      expect(screen.queryByTestId("modal-info-pago-rechazado")).not.toBeInTheDocument();
    });
  });

  test("muestra 'Sin resolución' para pagos pendientes", async () => {
    PagosFun.pagoRevisionCliente.mockResolvedValue(mockDatosPagos);
    renderComponent({ id: "1" });

    await waitFor(() => screen.getByText("DEF456"));

    expect(screen.getByText("Sin resolución")).toBeInTheDocument();
  });

  test("muestra mensaje cuando no hay datos", async () => {
    PagosFun.pagoRevisionCliente.mockResolvedValue([]);
    renderComponent({ id: "1" });

    await waitFor(() => screen.getByText(/No hay Solicitudes de Reembolsos para mostrar/i));
  });

  test("maneja error en la carga sin romper", async () => {
    PagosFun.pagoRevisionCliente.mockRejectedValue(new Error("Error en carga"));
    jest.spyOn(console, "log").mockImplementation(() => {});

    renderComponent({ id: "1" });

    await waitFor(() => {
      // Aunque error, debe terminar loading y mostrar noDataComponent
      expect(screen.getByText(/No hay Solicitudes de Reembolsos para mostrar/i)).toBeInTheDocument();
    });

    console.log.mockRestore();
  });
});
describe("ListaPagoCliente - pruebas adicionales", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("no filtra si el input está vacío", async () => {
    PagosFun.pagoRevisionCliente.mockResolvedValue(mockDatosPagos);
    renderComponent({ id: "1" });

    await waitFor(() => screen.getByText("ABC123"));

    const input = screen.getByPlaceholderText(/Ingrese numero de reembolso/i);
    fireEvent.change(input, { target: { value: "" } });

    // Esperamos que los datos completos sigan ahí (sin filtrar)
    await waitFor(() => {
      expect(screen.getByText("ABC123")).toBeInTheDocument();
      expect(screen.getByText("XYZ789")).toBeInTheDocument();
      expect(screen.getByText("DEF456")).toBeInTheDocument();
    });
  });

  test("filtra con valores que no existen, muestra noDataComponent", async () => {
    PagosFun.pagoRevisionCliente.mockResolvedValue(mockDatosPagos);
    renderComponent({ id: "1" });

    await waitFor(() => screen.getByText("ABC123"));

    const input = screen.getByPlaceholderText(/Ingrese numero de reembolso/i);
    fireEvent.change(input, { target: { value: "0000000000" } });

    await waitFor(() => {
      expect(screen.queryByText("ABC123")).not.toBeInTheDocument();
      expect(screen.queryByText("XYZ789")).not.toBeInTheDocument();
      expect(screen.queryByText("DEF456")).not.toBeInTheDocument();

      // Aparece mensaje no data
      expect(screen.getByText(/No hay Solicitudes de Reembolsos para mostrar/i)).toBeInTheDocument();
    });
  });

  test("abrirModalRechazado guarda datos correctos en localStorage", async () => {
    PagosFun.pagoRevisionCliente.mockResolvedValue(mockDatosPagos);
    renderComponent({ id: "1" });

    await waitFor(() => screen.getByText("ABC123"));

    const icono = screen.getByTestId("icono-estado-0");

    // Limpiar localStorage antes
    localStorage.clear();

    fireEvent.click(icono);

    // Verifica localStorage
    const item = JSON.parse(localStorage.getItem("revisionPago"));
    expect(item).toEqual({
      edit: true,
      revision: mockDatosPagos[0],
    });
  });

  test("modal se cierra con el botón X que usa clase stylesmod.closeBtn", async () => {
    PagosFun.pagoRevisionCliente.mockResolvedValue(mockDatosPagos);
    renderComponent({ id: "1" });

    await waitFor(() => screen.getByText("ABC123"));

    const icono = screen.getByTestId("icono-estado-0");
    fireEvent.click(icono);

    // Aparece modal
    await waitFor(() => screen.getByTestId("modal-info-pago-rechazado"));

    const btnCerrar = screen.getByText("X");
    fireEvent.click(btnCerrar);

    await waitFor(() => {
      expect(screen.queryByTestId("modal-info-pago-rechazado")).not.toBeInTheDocument();
    });
  });

  test("los estados distintos a 'aprobado' y 'pendiente' muestran icono para abrir modal", async () => {
    const datosEstados = [
      { ...mockDatosPagos[0], nom_estado: "rechazado" },
      { ...mockDatosPagos[1], nom_estado: "cancelado" },
      { ...mockDatosPagos[2], nom_estado: "pendiente" },
    ];
    PagosFun.pagoRevisionCliente.mockResolvedValue(datosEstados);
    renderComponent({ id: "1" });

    await waitFor(() => screen.getByText("rechazado"));

    // Icono para rechazado y cancelado
    expect(screen.getByTestId("icono-estado-0")).toBeInTheDocument();
    expect(screen.getByTestId("icono-estado-1")).toBeInTheDocument();

    // Para pendiente debe mostrar "Sin resolución"
    expect(screen.getByText("Sin resolución")).toBeInTheDocument();
  });

});

