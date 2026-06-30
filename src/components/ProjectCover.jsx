import React from 'react';
import { COVER_WIDTH, COVER_HEIGHT, COLORS } from '../constants';

// Página de rosto / capa: a referência visual do projeto com os marcadores.
// Área útil para a imagem dentro da capa (px fixos = html2canvas não estica).
const HEADER_H = 144;
const AREA_W = COVER_WIDTH - 80; // padding p-10 nos dois lados
const AREA_H = COVER_HEIGHT - 80 - HEADER_H;

const ProjectCover = React.forwardRef(function ProjectCover(
  { image, markers, ratio, clientName, viewIndex, totalViews },
  ref,
) {
  if (!image) return null;

  // Encaixa a imagem na área mantendo a proporção real (sem distorcer).
  const r = ratio && ratio > 0 ? ratio : AREA_W / AREA_H;
  let boxW = AREA_W;
  let boxH = Math.round(AREA_W / r);
  if (boxH > AREA_H) {
    boxH = AREA_H;
    boxW = Math.round(AREA_H * r);
  }

  return (
    <div
      ref={ref}
      className="bg-slate-900 flex flex-col"
      style={{ width: `${COVER_WIDTH}px`, height: `${COVER_HEIGHT}px` }}
    >
      <div className="p-10 flex flex-col h-full w-full">
        <div style={{ height: `${HEADER_H}px` }} className="mb-6 flex justify-between items-end border-b border-slate-700 pb-4 shrink-0">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">
              Mapa de Instalação {totalViews > 1 ? `- Vista ${viewIndex}` : ''}
            </h1>
            <p className="text-xl text-slate-400 mt-2 font-medium uppercase">
              {clientName || 'PROJETO GERAL'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-slate-500 font-bold tracking-widest text-sm uppercase">
              Página de Referência
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div
            className="relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-2xl"
            style={{ width: `${boxW}px`, height: `${boxH}px` }}
          >
            <img src={image} alt="Projeto 3D" style={{ width: '100%', height: '100%', display: 'block' }} />

            {markers.map((m) => (
              <div
                key={m.id}
                className="absolute text-white rounded-full flex items-center justify-center font-black border-[3px] border-white shadow-xl"
                style={{
                  left: `${m.x}%`,
                  top: `${m.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '50px',
                  height: '50px',
                  fontSize: '22px',
                  backgroundColor: COLORS.marker,
                }}
              >
                {m.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProjectCover;
