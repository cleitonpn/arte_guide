// Converte um índice (0,1,2,...) em rótulo alfabético bijetivo:
// 0->A, 25->Z, 26->AA, 27->AB ... (não estoura em caracteres inválidos como '[').
export const indexToLabel = (index) => {
  let label = '';
  let n = index;
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
};
