import React from 'react';
import AppRoutes from './AppRoutes';
import Login from './views/Login';

function App() {
  const user = sessionStorage.getItem('user');

  if (user) {
    return <AppRoutes />;
  }
  return <Login />;
}

export default App;
