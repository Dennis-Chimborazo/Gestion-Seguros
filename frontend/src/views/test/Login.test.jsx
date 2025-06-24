// __tests__/Login.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Login } from "../Login";
import ApiService from "../../services/ApiService";

// Mock de useNavigate de React Router
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

// Mock de ApiService
jest.mock("../../services/ApiService", () => ({
  login: jest.fn(),
}));

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Login component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("muestra error si los campos están vacíos", async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByText("Ingresar"));
    await waitFor(() => {
      expect(screen.getByText("Complete todos los campos")).toBeInTheDocument();
    });
  });

  test("muestra error si las credenciales son incorrectas", async () => {
    ApiService.login.mockResolvedValueOnce({
      success: false,
      user: "Usuario o contrasena incorrecta",
    });
  
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText("Usuario"), {
      target: { name: "user", value: "usuarioFake" },
    });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { name: "pass", value: "wrongpass" },
    });
  
    fireEvent.click(screen.getByText("Ingresar"));
  
    // findByText ya espera hasta que el texto aparezca (timeout por defecto 1000ms)
    const errorToast = await screen.findByText(/usuario o contrasena incorrecta/i);
    expect(errorToast).toBeInTheDocument();
  });
  
  

  test("redirecciona si el login es exitoso", async () => {
    const mockUser = { nom_rol: "admin" };
    ApiService.login.mockResolvedValueOnce({
      success: true,
      token: "fake-token",
      user: mockUser,
    });

    renderWithRouter(<Login />);
    fireEvent.change(screen.getByPlaceholderText("Usuario"), {
      target: { name: "user", value: "admin" },
    });
    fireEvent.change(screen.getByPlaceholderText("Contraseña"), {
      target: { name: "pass", value: "1234" },
    });

    fireEvent.click(screen.getByText("Ingresar"));

    await waitFor(() => {
      expect(ApiService.login).toHaveBeenCalledWith({
        user: "admin",
        pass: "1234",
      });
      expect(localStorage.getItem("login")).toContain("fake-token");
    });
  });
});
