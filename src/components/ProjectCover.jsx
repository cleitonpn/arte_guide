import React from 'react';
import { COVER_WIDTH, COVER_HEIGHT, COLORS } from '../constants';

// Página de rosto / capa: a referência visual do projeto com os marcadores.
const ProjectCover = React.forwardRef(function ProjectCover(
  { image, markers, clientName, viewIndex, totalViews },
  ref,
) {
  if (!image) return null;

  return (
    <div
      ref={ref}
      className="bg-slate-900 flex flex-col"
      style={{ width: `${COVER_WIDTH}px`, height: `${COVER_HEIGHT}px` }}
    >
      <div className="p-10 flex flex-col h-full w-full">
        <div className="mb-6 flex justify-between items-end border-b border-slate-700 pb-4">
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

        <div className="flex-1 bg-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-700 shadow-2xl">
          <img src={image} alt="Projeto 3D" className="w-full h-full object-contain" />

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
  );
});

export default ProjectCover;
