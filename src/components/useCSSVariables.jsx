import { useEffect, useState } from 'react';

/**
 * Hook para obtener variables CSS definidas en :root
 * @param {string[]} keys - Lista de nombres de variables (sin los "--")
 * @returns {Object} - Objeto con los valores actuales de esas variables
 */
export const useCSSVariables = (keys) => {
  const [vars, setVars] = useState({});

  useEffect(() => {
    const updateVars = () => {
      const styles = getComputedStyle(document.documentElement);
      const result = {};
      keys.forEach(key => {
        result[key] = styles.getPropertyValue(`--${key}`).trim();
      });
      setVars(result);
    };

    updateVars();

    const observer = new MutationObserver(updateVars);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: keys.map(k => `--${k}`),
    });

    return () => observer.disconnect();
  }, [JSON.stringify(keys)]); // Evita loops si keys cambia de referencia

  return vars;
};
