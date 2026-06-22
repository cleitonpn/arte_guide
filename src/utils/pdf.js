import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { isLandscape } from './units';
import { PDF_SCALE } from '../constants';

/**
 * Gera o PDF combinando as capas (referência visual) e os gabaritos técnicos.
 *
 * @param {object}   params
 * @param {HTMLElement[]} params.coverEls     Elementos das capas, na ordem desejada.
 * @param {HTMLElement[]} params.approvalEls  Páginas "print de aprovação" (paisagem).
 * @param {object[]}      params.artItems     Dados das artes (para decidir orientação).
 * @param {HTMLElement[]} params.artEls       Elementos dos gabaritos, alinhados a artItems.
 * @param {string}        params.fileName     Nome do arquivo final.
 * @param {(done:number,total:number)=>void} [params.onProgress]
 */
export async function generatePdf({
  coverEls,
  approvalEls = [],
  artItems,
  artEls,
  fileName,
  onProgress,
}) {
  const pdf = new jsPDF('l', 'mm', 'a4');

  let pageAdded = false;
  const total = coverEls.length + approvalEls.length + artEls.length;
  let done = 0;
  const tick = () => onProgress?.(++done, total);

  // Capas e prints de aprovação são páginas paisagem capturadas como imagem.
  const addLandscapeImage = async (el) => {
    if (!el) {
      tick();
      return;
    }
    if (pageAdded) pdf.addPage('a4', 'l');
    const canvas = await html2canvas(el, { scale: PDF_SCALE.cover, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    pdf.addImage(imgData, 'JPEG', 0, 0, pageW(pdf), pageH(pdf));
    pageAdded = true;
    tick();
  };

  // 1) Capas / vistas (mapa de instalação).
  for (const el of coverEls) {
    await addLandscapeImage(el);
  }

  // 2) Prints de aprovação (artes finais por marcador).
  for (const el of approvalEls) {
    await addLandscapeImage(el);
  }

  // 3) Gabaritos técnicos (orientação conforme a peça).
  for (let i = 0; i < artEls.length; i++) {
    const el = artEls[i];
    if (!el) {
      tick();
      continue;
    }
    const landscape = isLandscape(artItems[i].widthStr, artItems[i].heightStr);

    if (!pageAdded) {
      // A página 1 já nasce em paisagem; troca para retrato se necessário.
      if (!landscape) {
        pdf.deletePage(1);
        pdf.addPage('a4', 'p');
      }
    } else {
      pdf.addPage('a4', landscape ? 'l' : 'p');
    }

    const canvas = await html2canvas(el, {
      scale: PDF_SCALE.art,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    const imgData = canvas.toDataURL('image/png');

    const props = pdf.getImageProperties(imgData);
    const ratio = Math.min(pageW(pdf) / props.width, pageH(pdf) / props.height);
    const w = props.width * ratio;
    const h = props.height * ratio;
    pdf.addImage(imgData, 'PNG', (pageW(pdf) - w) / 2, (pageH(pdf) - h) / 2, w, h);

    pageAdded = true;
    tick();
  }

  pdf.save(fileName);
}

const pageW = (pdf) => pdf.internal.pageSize.getWidth();
const pageH = (pdf) => pdf.internal.pageSize.getHeight();
