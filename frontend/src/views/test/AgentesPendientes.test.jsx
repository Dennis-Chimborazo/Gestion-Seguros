import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import { AgentesPendientes } from "../agentes/AgentesPendientes";
import AgenteFun from "../agentes/AgenteFun";

// Mock de AgenteFun
jest.mock("../agentes/AgenteFun");

// Mock de useNavigate de react-router-dom
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => jest.fn(),
  };
});

const mockAgentes = {
  rows: [
    {
      ced_agente: "1234567890",
      nom_agente: "Carlos",
      ape_agente: "Perez",
      email_agente: "carlos@email.com",
      dire_agente: "Quito",
      tel_agente: "0999999999",
    },
  ],
};

describe("AgentesPendientes", () => {
  const mostrarSeccion = jest.fn();

  beforeEach(() => {
    AgenteFun.obtenerAgentesPendientes.mockResolvedValue(mockAgentes);
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("Renderizado y carga", () => {
    it("debería renderizar la tabla con los agentes", async () => {
      render(
        <MemoryRouter>
          <AgentesPendientes mostrarSeccion={mostrarSeccion} />
        </MemoryRouter>
      );

      expect(screen.getByText("Validación de cuenta Pendiente")).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText("Carlos")).toBeInTheDocument();
      });
    });

    it("muestra un spinner mientras carga", async () => {
      let resolver;
      AgenteFun.obtenerAgentesPendientes.mockImplementation(
        () => new Promise(resolve => (resolver = resolve))
      );

      render(
        <MemoryRouter>
          <AgentesPendientes mostrarSeccion={mostrarSeccion} />
        </MemoryRouter>
      );

      expect(screen.getByTestId("cargar-tablas")).toBeInTheDocument();
      resolver(mockAgentes);
      await waitFor(() => {
        expect(screen.getByText("Carlos")).toBeInTheDocument();
      });
    });
  });

  describe("Filtrado", () => {
    it("filtra por cédula correctamente", async () => {
      render(
        <MemoryRouter>
          <AgentesPendientes mostrarSeccion={mostrarSeccion} />
        </MemoryRouter>
      );

      await waitFor(() => expect(screen.getByText("Carlos")).toBeInTheDocument());

      const input = screen.getByPlaceholderText(/Ingrese número de cédula/i);
      fireEvent.change(input, { target: { value: "999" } });

      expect(screen.queryByText("Carlos")).not.toBeInTheDocument();
    });

    it("restaura datos al borrar filtro", async () => {
      render(
        <MemoryRouter>
          <AgentesPendientes mostrarSeccion={mostrarSeccion} />
        </MemoryRouter>
      );

      await waitFor(() => expect(screen.getByText("Carlos")).toBeInTheDocument());

      const input = screen.getByPlaceholderText(/Ingrese número de cédula/i);
      fireEvent.change(input, { target: { value: "999" } });
      fireEvent.click(screen.getByTestId("clear-filtro"));

      await waitFor(() => expect(screen.getByText("Carlos")).toBeInTheDocument());
    });

    it("restablece filtro cuando input se vacía", async () => {
      render(
        <MemoryRouter>
          <AgentesPendientes mostrarSeccion={mostrarSeccion} />
        </MemoryRouter>
      );

      await waitFor(() => expect(screen.getByText("Carlos")).toBeInTheDocument());

      const input = screen.getByPlaceholderText(/Ingrese número de cédula/i);
      fireEvent.change(input, { target: { value: "123" } });
      fireEvent.change(input, { target: { value: "" } });

      await waitFor(() => expect(screen.getByText("Carlos")).toBeInTheDocument());
    });
  });

  describe("Refrescar", () => {
    it("actualiza la lista al hacer clic en el botón refrescar", async () => {
      render(
        <MemoryRouter>
          <AgentesPendientes mostrarSeccion={mostrarSeccion} />
        </MemoryRouter>
      );

      await waitFor(() => expect(screen.getByText("Carlos")).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("btn-actualizar"));

      await waitFor(() => {
        expect(AgenteFun.obtenerAgentesPendientes).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe("Errores y mensajes vacíos", () => {
    it("muestra mensaje cuando no hay datos", async () => {
      AgenteFun.obtenerAgentesPendientes.mockResolvedValueOnce({ rows: [] });

      render(
        <MemoryRouter>
          <AgentesPendientes mostrarSeccion={mostrarSeccion} />
        </MemoryRouter>
      );

      await waitFor(() =>
        expect(screen.getByText("No hay agentes pendientes de validación")).toBeInTheDocument()
      );
    });

    it("maneja errores de red sin romper", async () => {
      AgenteFun.obtenerAgentesPendientes.mockRejectedValueOnce(new Error("Error de red"));

      render(
        <MemoryRouter>
          <AgentesPendientes mostrarSeccion={mostrarSeccion} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByText("Carlos")).not.toBeInTheDocument();
      });
    });
  });

  describe("Estilos y elementos gráficos", () => {
    it("verifica que el icono de correo esté presente y sea SVG", async () => {
      render(
        <MemoryRouter>
          <AgentesPendientes mostrarSeccion={mostrarSeccion} />
        </MemoryRouter>
      );

      await waitFor(() => expect(screen.getByTestId("icono-correo-0")).toBeInTheDocument());

      const iconoCorreo = screen.getByTestId("icono-correo-0");
      expect(iconoCorreo.tagName.toLowerCase()).toBe("svg");
    });

    it("verifica que el botón actualizar esté presente", async () => {
      render(
        <MemoryRouter>
          <AgentesPendientes mostrarSeccion={mostrarSeccion} />
        </MemoryRouter>
      );

      await waitFor(() => expect(screen.getByTestId("btn-actualizar")).toBeInTheDocument());
    });
  });

  describe("Modal", () => {
    it("abre el modal al hacer clic en el ícono de correo", async () => {
      await act(async () => {
        render(
          <MemoryRouter>
            <AgentesPendientes mostrarSeccion={mostrarSeccion} />
          </MemoryRouter>
        );
      });

      await waitFor(() => expect(screen.getByTestId("icono-correo-0")).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("icono-correo-0"));

      await waitFor(() => expect(screen.getByTestId("modal-contenido")).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("btn-cerrar-modal"));

      await waitFor(() => {
        expect(screen.queryByTestId("modal-contenido")).not.toBeInTheDocument();
      });
    });
  });
});
