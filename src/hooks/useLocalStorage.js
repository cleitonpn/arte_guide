import { useEffect, useRef, useState } from 'react';

/**
 * useState que persiste no localStorage (com debounce).
 * Falha silenciosamente quando a cota é estourada — útil porque as imagens
 * das vistas são base64 e podem ser grandes demais para o localStorage.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const timeout = useRef();
  useEffect(() => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        console.warn(`Não foi possível salvar "${key}" (cota do navegador?):`, err?.message);
      }
    }, 300);
    return () => clearTimeout(timeout.current);
  }, [key, value]);

  return [value, setValue];
}
