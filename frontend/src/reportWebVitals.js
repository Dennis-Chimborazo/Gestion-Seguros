const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals')
      .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
      })
      .catch((error) => {
        // Manejar errores silenciosamente si web-vitals no está disponible
        // En desarrollo podrías hacer console.warn(error) si necesitas debug
      });
  }
};

export default reportWebVitals;