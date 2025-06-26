// __tests__/ClientesInformacion.test.jsx
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { ClientesInformacion } from '../clientes/ClientesInformacion'; // Ajusta si tu ruta es distinta

const mockCliente = {
    cedr_cli: "1234567890",
    tipo_cedr_cli: "Cédula",
    nacion_cli: "Ecuatoriana",
    nom_cli: "Juan",
    ape_cli: "Pérez",
    fecha_naci_cli: "1990-01-01",
    sexo_cli: "Masculino",
    edad_pers: 35,
    estatura_cli: "1.75m",
    peso_cli: "70kg",
    estado_civil_pers: "Soltero",
    lugar_naci_cli: "Quito",
    email_pers: "juan.perez@example.com",
    tel_pers: "022345678",
    cel_pers: "0998765432",
    parroq_cli: "Centro",
    calle_princ_pers: "Av. Amazonas",
    calle_secun_pers: "Av. Colón"
};

describe('ClientesInformacion', () => {
    beforeEach(() => {
        localStorage.setItem('clientesInformacion', JSON.stringify({ cliente: mockCliente }));
    });

    afterEach(() => {
        localStorage.clear();
        cleanup();
    });

    test('renderiza todos los campos del cliente', () => {
        render(<ClientesInformacion />);

        // Título
        expect(screen.getByText('Información del Cliente')).toBeInTheDocument();

        // Sección de identificación
        expect(screen.getByText('Cédula:')).toBeInTheDocument();
        expect(screen.getByText('1234567890')).toBeInTheDocument();

        expect(screen.getByText('Tipo de Cédula:')).toBeInTheDocument();
        expect(screen.getByText('Cédula')).toBeInTheDocument();

        // Datos personales
        expect(screen.getByText('Nacionalidad:')).toBeInTheDocument();
        expect(screen.getByText('Ecuatoriana')).toBeInTheDocument();

        expect(screen.getByText('Nombres:')).toBeInTheDocument();
        expect(screen.getByText('Juan')).toBeInTheDocument();
        expect(screen.getByText('Apellidos:')).toBeInTheDocument();
        expect(screen.getByText('Pérez')).toBeInTheDocument();
        expect(screen.getByText('Fecha de Nacimiento:')).toBeInTheDocument();
        expect(screen.getByText('1990-01-01')).toBeInTheDocument();
        expect(screen.getByText('Sexo:')).toBeInTheDocument();
        expect(screen.getByText('Masculino')).toBeInTheDocument();
        expect(screen.getByText('Edad:')).toBeInTheDocument();
        expect(screen.getByText('35')).toBeInTheDocument();
        expect(screen.getByText('Estatura:')).toBeInTheDocument();
        expect(screen.getByText('1.75m')).toBeInTheDocument();
        expect(screen.getByText('Peso:')).toBeInTheDocument();
        expect(screen.getByText('70kg')).toBeInTheDocument();
        expect(screen.getByText('Estado Civil:')).toBeInTheDocument();
        expect(screen.getByText('Soltero')).toBeInTheDocument();
        expect(screen.getByText('Lugar de Nacimiento:')).toBeInTheDocument();
        expect(screen.getByText('Quito')).toBeInTheDocument();;
        expect(screen.getByText('Email:')).toBeInTheDocument();
        expect(screen.getByText('juan.perez@example.com')).toBeInTheDocument();
        expect(screen.getByText('Teléfono:')).toBeInTheDocument();
        expect(screen.getByText('022345678')).toBeInTheDocument();
        expect(screen.getByText('Celular:')).toBeInTheDocument();
        expect(screen.getByText('0998765432')).toBeInTheDocument();
        expect(screen.getByText('Parroquia:')).toBeInTheDocument();
        expect(screen.getByText('Centro')).toBeInTheDocument();
        const direccionLabel = screen.getByText('Dirección:');
        const direccionContainer = direccionLabel.closest('div'); // accede al contenedor
        expect(direccionContainer).toHaveTextContent('Dirección: Av. Amazonas y Av. Colón');



    });

    test('aplica estilos correctamente', () => {
        const { container } = render(<ClientesInformacion />);

        expect(container.querySelector('.clientInfoContainer')).toBeInTheDocument();
        expect(container.querySelector('.clientInfoTitle')).toBeInTheDocument();
        expect(container.querySelector('.clientInfoCard')).toBeInTheDocument();
        expect(container.querySelector('.clientInfoGrid')).toBeInTheDocument();
    });

    test('muestra componente de carga si no hay datos en localStorage', () => {
        localStorage.removeItem('clientesInformacion');
        render(<ClientesInformacion />);

        expect(screen.getByTestId("cargar-tablas")).toBeInTheDocument(); // Ajusta si CargarTablas tiene otro texto
    });
    test('elimina clientesInformacion de localStorage después de montar', () => {
        render(<ClientesInformacion />);
        expect(localStorage.getItem('clientesInformacion')).toBeNull();
    });
    test('no muestra campos del cliente mientras se carga', () => {
        localStorage.removeItem('clientesInformacion');
        render(<ClientesInformacion />);

        // Asegura que el título no aparece aún
        expect(screen.queryByText('Información del Cliente')).not.toBeInTheDocument();
    });
    test('muestra todos los campos clave del cliente', () => {
        render(<ClientesInformacion />);

        const labels = [
            'Cédula:',
            'Tipo de Cédula:',
            'Nacionalidad:',
            'Nombres:',
            'Apellidos:',
            'Fecha de Nacimiento:',
            'Sexo:',
            'Edad:',
            'Estatura:',
            'Peso:',
            'Estado Civil:',
            'Lugar de Nacimiento:',
            'Email:',
            'Teléfono:',
            'Celular:',
            'Parroquia:',
            'Dirección:',
        ];

        labels.forEach(label => {
            expect(screen.getByText(label)).toBeInTheDocument();
        });
    });
    test('renderiza dirección solo con calle principal', () => {
        const clienteSinSecundaria = { ...mockCliente, calle_secun_pers: '' };
        localStorage.setItem('clientesInformacion', JSON.stringify({ cliente: clienteSinSecundaria }));

        render(<ClientesInformacion />);

        const direccionDiv = screen.getByText('Dirección:').closest('div');
        expect(direccionDiv).toHaveTextContent('Dirección: Av. Amazonas');
    });
    test('muestra componente sin romper si cliente está vacío', () => {
        localStorage.setItem('clientesInformacion', JSON.stringify({ cliente: {} }));
        render(<ClientesInformacion />);

        expect(screen.getByText('Información del Cliente')).toBeInTheDocument();
    });
    test('todos los campos están dentro del contenedor principal', () => {
        render(<ClientesInformacion />);
        const container = screen.getByText('Información del Cliente').closest('div');
        expect(container).toContainElement(screen.getByText('Cédula:'));
        expect(container).toContainElement(screen.getByText('Nombres:'));
    });

});
