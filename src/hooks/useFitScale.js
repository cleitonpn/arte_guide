import { useEffect, useState } from 'react';

// Calcula o fator de escala para encaixar um elemento de tamanho fixo (w×h)
// dentro do container observado, mantendo a proporção.
export function useFitScale(ref, w, h) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) {
        setScale(Math.max(0.1, Math.min(r.width / w, r.height / h)));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, w, h]);

  return scale;
}
