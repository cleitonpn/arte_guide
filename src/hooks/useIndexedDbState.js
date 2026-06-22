import { useEffect, useRef, useState } from 'react';
import { idbGet, idbSet } from '../utils/idb';

/**
 * useState persistido no IndexedDB (assíncrono, com debounce).
 * O valor inicial é o passado; quando o IndexedDB carrega, o estado é
 * atualizado. Gravações só acontecem depois do carregamento inicial,
 * para não sobrescrever os dados salvos com o valor padrão.
 */
export function useIndexedDbState(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const loaded = useRef(false);

  useEffect(() => {
    let active = true;
    idbGet(key)
      .then((stored) => {
        if (active && stored !== undefined) setValue(stored);
      })
      .catch((err) => console.warn(`IndexedDB leitura "${key}" falhou:`, err?.message))
      .finally(() => {
        loaded.current = true;
      });
    return () => {
      active = false;
    };
  }, [key]);

  const timeout = useRef();
  useEffect(() => {
    if (!loaded.current) return undefined;
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      idbSet(key, value).catch((err) =>
        console.warn(`IndexedDB gravação "${key}" falhou:`, err?.message),
      );
    }, 400);
    return () => clearTimeout(timeout.current);
  }, [key, value]);

  return [value, setValue];
}
