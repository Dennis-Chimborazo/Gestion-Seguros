import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';

jest.mock('../../AppRoutes', () => () => <div>Mocked AppRoutes</div>);

describe('App', () => {
  beforeEach(() => {
    sessionStorage.setItem('user', JSON.stringify({ name: 'Test User' }));
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  test('renderiza AppRoutes dentro de BrowserRouter si hay usuario en sessionStorage', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Mocked AppRoutes')).toBeInTheDocument();
  });

  test('renderiza login si no hay usuario en sessionStorage', () => {
    sessionStorage.clear();
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
