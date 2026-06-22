import React from 'react';
import { COVER_WIDTH, COVER_HEIGHT } from '../constants';

const STATUS_COLORS = {
  APROVADO: '#16a34a',
  'EM APROVAÇÃO': '#d97706',
  PENDENTE: '#d97706',
  REPROVADO: '#dc2626',
};

// Define a quantidade de colunas da grade conforme o número de cards.
const columnsFor = (n) => {
  if (n <= 1) return 1;
  if (n <= 2) return 2;
  if (n <= 6) return 3;
  if (n <= 12) return 4;
  return 5;
};

// "Print de Aprovação": página A4 paisagem com as artes finais por marcador.
const ApprovalPrint = React.forwardRef(function ApprovalPrint({ config, cards }, ref) {
  const {
    logo,
    projectTitle,
    venue,
    standType,
    section,
    status,
    footerCols,
  } = config;

  const statusColor = STATUS_COLORS[status] || '#16a34a';
  const cols = columnsFor(cards.length);

  return (
    <div
      ref={ref}
      className="bg-white flex flex-col"
      style={{ width: `${COVER_WIDTH}px`, height: `${COVER_HEIGHT}px` }}
    >
      <div className="p-6 flex flex-col h-full w-full gap-3">
        {/* Cabeçalho — linha 1 */}
        <div className="flex gap-2 h-[68px] shrink-0">
          <div className="w-[210px] bg-white border border-slate-200 rounded flex items-center justify-center overflow-hidden">
            {logo ? (
              <img src={logo} alt="Logo" className="max-w-[85%] max-h-[80%] object-contain" />
            ) : (
              <span className="text-slate-300 font-black tracking-widest text-sm">LOGO</span>
            )}
          </div>
          <div
            className="flex-1 rounded flex items-center justify-center px-4"
            style={{ background: 'linear-gradient(90deg,#14532d 0%,#16a34a 100%)' }}
          >
            <span className="text-white font-black uppercase text-3xl tracking-tight text-center leading-none">
              {projectTitle || 'PROJETO'}
            </span>
          </div>
          <div className="w-[210px] bg-slate-900 rounded flex items-center justify-center px-3">
            <span className="text-white font-black uppercase text-2xl tracking-tight text-center leading-none">
              {venue || '—'}
            </span>
          </div>
        </div>

        {/* Cabeçalho — linha 2 */}
        <div className="flex gap-2 h-[40px] shrink-0">
          <div className="w-[210px] rounded flex items-center justify-center" style={{ backgroundColor: '#16a34a' }}>
            <span className="text-white font-black uppercase text-lg leading-none">{standType || '—'}</span>
          </div>
          <div className="flex-1 bg-white border border-slate-200 rounded flex items-center justify-center">
            <span className="text-slate-900 font-black uppercase text-xl tracking-wide leading-none">
              {section || 'MATERIAIS COMUNICAÇÃO VISUAL'}
            </span>
          </div>
          <div className="w-[210px] rounded flex items-center justify-center" style={{ backgroundColor: statusColor }}>
            <span className="text-white font-black uppercase text-xl leading-none">{status || 'APROVADO'}</span>
          </div>
        </div>

        {/* Grade de cards */}
        <div className="flex-1 min-h-0">
          {cards.length === 0 ? (
            <div className="h-full border-2 border-dashed border-slate-200 rounded flex items-center justify-center text-slate-300 font-bold uppercase tracking-wider">
              Suba as artes finais para montar o print
            </div>
          ) : (
            <div
              className="grid gap-3 h-full"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoRows: '1fr' }}
            >
              {cards.map((card) => (
                <div key={card.id} className="border border-slate-200 rounded p-2 flex flex-col min-h-0">
                  <div className="flex items-center gap-2 mb-1.5 shrink-0">
                    {card.marker && (
                      <span
                        className="w-7 h-7 shrink-0 rounded-full text-white flex items-center justify-center font-black text-sm"
                        style={{ backgroundColor: '#16a34a' }}
                      >
                        {card.marker}
                      </span>
                    )}
                    <span className="font-bold text-slate-800 uppercase text-sm leading-tight truncate">
                      {card.title || 'SEM TÍTULO'}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 flex items-center justify-center bg-slate-50 rounded overflow-hidden">
                    {card.image ? (
                      <img src={card.image} alt={card.title} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-slate-300 font-bold uppercase text-xs tracking-wider">Arte pendente</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé — colunas de produção */}
        <div className="h-[40px] shrink-0 flex bg-slate-900 rounded overflow-hidden">
          {(footerCols && footerCols.length ? footerCols : ['IMPRESSÃO']).map((col, i, arr) => (
            <div
              key={`${col}-${i}`}
              className={`flex-1 flex items-center justify-center ${i < arr.length - 1 ? 'border-r border-white/20' : ''}`}
            >
              <span className="text-white font-bold uppercase text-base tracking-wide">{col}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ApprovalPrint;
