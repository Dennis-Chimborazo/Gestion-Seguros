import React from 'react';
import { render, screen } from '@testing-library/react';
import CargarInf from '../cargando/CargarInf';

describe('CargarInf', () => {
    test('renderiza 5 puntos animados', () => {
        render(<CargarInf />);
        const dots = screen.getAllByTestId('dot');
        expect(dots).toHaveLength(5);
      });
      
});
