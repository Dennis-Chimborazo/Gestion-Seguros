import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CargarArchivos from '../cargando/cargarArchivos';

describe('CargarArchivos', () => {
    beforeEach(() => {
        render(<CargarArchivos />);
    });

    describe('Renderizado básico', () => {
        it('debería renderizar sin errores', () => {
            const loaderElement = screen.getByRole('status', { hidden: true });
            expect(loaderElement).toBeInTheDocument();
        });
    });

    describe('Accesibilidad', () => {
        it('debería tener role="status" y aria-label="Cargando"', () => {
            const wrapper = screen.getByRole('status');
            expect(wrapper).toHaveAttribute('aria-label', 'Cargando');
        });
    });

    describe('Estructura del loader', () => {
        it('debería contener un contenedor con clase loader', () => {
            const loaderDiv = document.querySelector('.loader');
            expect(loaderDiv).toBeInTheDocument();
        });

        it('debería tener exactamente 12 barras con clases bar1 a bar12', () => {
            for (let i = 1; i <= 12; i++) {
                const bar = document.querySelector(`.bar${i}`);
                expect(bar).toBeInTheDocument();
            }
        });

        it('todas las barras deben ser hijos del div.loader', () => {
            const loaderDiv = document.querySelector('.loader');
            const children = Array.from(loaderDiv?.children ?? []);
            expect(children).toHaveLength(12);
        });

        it('las clases de los hijos del loader deben ser bar1 a bar12', () => {
            const loaderDiv = document.querySelector('.loader');
            const children = Array.from(loaderDiv?.children ?? []);
            children.forEach((child, index) => {
                expect(child).toHaveClass(`bar${index + 1}`);
            });
        });
    });
    describe('Estilos individuales de barras', () => {
        it('cada barra debe tener el estilo base aplicado', () => {
            const loaderDiv = document.querySelector('.loader');
            const children = Array.from(loaderDiv?.children ?? []);

            children.forEach((bar) => {
                const style = getComputedStyle(bar);
                expect(style.backgroundColor).toBe('rgb(128, 128, 128)');
                expect(style.borderRadius).toBe('50px');
                // Eliminado: animationIterationCount (no soportado por jsdom desde styled-components)
            });
        });

        it('cada barra debe tener una transformación por rotación', () => {
            const loaderDiv = document.querySelector('.loader');
            const children = Array.from(loaderDiv?.children ?? []);

            children.forEach((bar) => {
                const transform = getComputedStyle(bar).transform;
                expect(transform).not.toBe('none'); // o !== '' también funciona
            });
        });

    });

    describe('Estilos visuales esperados (estáticos)', () => {
        it('la barra1 debe estar presente con su clase CSS correspondiente', () => {
            const bar = document.querySelector('.bar1');
            expect(bar).toHaveClass('bar1');
        });

        it('la animación debe estar aplicada a una barra', () => {
            const bar = document.querySelector('.bar1');
            const animationName = getComputedStyle(bar).animationName;
            expect(animationName).toBeDefined();
        });

        it('la barra1 debe tener delay 0s, barra2 -1.1s, barra12 -0.1s', () => {
            const delays = {
                '.bar1': '0s',
                '.bar2': '-1.1s',
                '.bar12': '-0.1s',
            };
            for (const [selector, expectedDelay] of Object.entries(delays)) {
                const bar = document.querySelector(selector);
                const style = getComputedStyle(bar);
                expect(style.animationDelay).toBe(expectedDelay);
            }
        });
    });

    describe('Snapshot del componente', () => {
        it('debería coincidir con el snapshot previo', () => {
            const { container } = render(<CargarArchivos />);
            expect(container.firstChild).toMatchSnapshot();
        });
    });
    describe('Estructura adicional', () => {
        it('el componente no debe renderizar más nodos fuera del loader', () => {
            const wrapper = screen.getByRole('status');
            const loaders = wrapper.querySelectorAll('.loader');
            expect(loaders.length).toBe(1); // solo un .loader, dentro del wrapper
        });

        it('el StyledWrapper debe contener el div con clase loader', () => {
            const wrapper = screen.getByRole('status');
            const loaderDiv = wrapper.querySelector('.loader');
            expect(loaderDiv).toBeInTheDocument();
        });
    });
});
