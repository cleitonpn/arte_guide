import React from 'react';
import { COLORS, SVG } from '../constants';
import { parseNum, toCm, bleedToCm, isLandscape, formatDim } from '../utils/units';

// Gabarito técnico individual (caderno A4 com sangria e áreas de interferência).
const ArtPreview = React.forwardRef(function ArtPreview({ art }, ref) {
  const {
    clientName,
    itemName,
    title,
    widthStr,
    heightStr,
    unit,
    bleedStr,
    bleedUnit,
    zones,
    markerRef,
  } = art;

  const inputW = parseNum(widthStr);
  const inputH = parseNum(heightStr);
  const inputBleed = parseNum(bleedStr);

  const w_cm = toCm(widthStr, unit);
  const h_cm = toCm(heightStr, unit);
  const b_cm = bleedToCm(bleedStr, bleedUnit);

  const maxDim_cm = Math.max(w_cm, h_cm) || 1;
  const scale = SVG.scaleTarget / maxDim_cm;

  const w = w_cm * scale;
  const h = h_cm * scale;
  const b = b_cm * scale;

  const { strokeThin, strokeThick, offset, crossSize, tickSize } = SVG;

  const titleFontSize = 22;
  const dimFontSize = 18;
  const baseCenterFontSize = 16;

  const safeW = Math.max(0, w - 2 * b);
  const safeH = Math.max(0, h - 2 * b);

  let boxW = 260;
  let boxH = 60;
  let centerFontSize = baseCenterFontSize;
  let showCenterBox = true;

  if (safeW > 0 && safeH > 0) {
    const scaleBox = Math.min(1, (safeW * 0.8) / boxW, (safeH * 0.8) / boxH);
    boxW *= scaleBox;
    boxH *= scaleBox;
    centerFontSize *= scaleBox;
    if (scaleBox < 0.2) showCenterBox = false;
  } else {
    showCenterBox = false;
  }

  const padX = offset + 80;
  const padY = offset + 80;
  const landscape = isLandscape(widthStr, heightStr);
  const hasMeasures = w > 0 && h > 0;

  // Proteção para o plural de marcadores ("A, B" -> agrupado).
  const hasMultipleMarkers = typeof markerRef === 'string' && markerRef.includes(',');

  return (
    <div
      ref={ref}
      className="bg-white shadow-2xl flex flex-col"
      style={{
        width: '100%',
        maxWidth: landscape ? '950px' : '650px',
        aspectRatio: landscape ? '297 / 210' : '210 / 297',
      }}
    >
      <div className="w-full h-full p-[4%] flex flex-col">
        <div className="w-full h-full border-[3px] border-slate-800 flex flex-col relative">
          <div className="flex-1 w-full p-[4%] flex items-center justify-center overflow-hidden">
            {hasMeasures ? (
              <svg
                viewBox={`${-padX} ${-padY} ${w + 2 * padX} ${h + 2 * padY}`}
                className="w-full h-full drop-shadow-sm"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="hatchPattern" width="18" height="18" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="18" stroke={COLORS.hatch} strokeWidth="1.5" opacity="0.6" />
                  </pattern>
                  <pattern id="interfPattern" width="14" height="14" patternTransform="rotate(-45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="14" stroke={COLORS.cut} strokeWidth="2.5" opacity="0.7" />
                  </pattern>
                </defs>

                <text x="0" y={-offset - 25} fill="#666666" fontSize={titleFontSize} fontFamily="sans-serif" textAnchor="start" fontWeight="bold">
                  {title.toUpperCase()}
                </text>

                {/* Selo do marcador */}
                {markerRef && (
                  <g transform={`translate(${w}, ${-offset - 40})`}>
                    {hasMultipleMarkers ? (
                      <rect
                        x={-40 - markerRef.length * 5}
                        y={-20}
                        width={80 + markerRef.length * 10}
                        height="40"
                        rx="20"
                        fill={COLORS.marker}
                      />
                    ) : (
                      <circle cx="0" cy="0" r="28" fill={COLORS.marker} />
                    )}
                    <text x="0" y="8" fill="#ffffff" fontSize={hasMultipleMarkers ? '18' : '24'} fontFamily="sans-serif" textAnchor="middle" fontWeight="900">
                      {markerRef.toUpperCase()}
                    </text>
                  </g>
                )}

                <rect x="0" y="0" width={w} height={h} fill="#fcfcfc" stroke="#888888" strokeWidth={strokeThin} strokeDasharray="8,8" />

                <g stroke={COLORS.dim} strokeWidth={strokeThin}>
                  <path d={`M${-crossSize},0 L${crossSize},0 M0,${-crossSize} L0,${crossSize}`} />
                  <path d={`M${w - crossSize},0 L${w + crossSize},0 M${w},${-crossSize} L${w},${crossSize}`} />
                  <path d={`M${-crossSize},${h} L${crossSize},${h} M0,${h - crossSize} L0,${h + crossSize}`} />
                  <path d={`M${w - crossSize},${h} L${w + crossSize},${h} M${w},${h - crossSize} L${w},${h + crossSize}`} />
                </g>

                {safeW > 0 && safeH > 0 && (
                  <rect x={b} y={b} width={safeW} height={safeH} fill="url(#hatchPattern)" stroke="#000000" strokeWidth={strokeThick} />
                )}

                {/* Áreas de interferência com coordenadas precisas */}
                {safeW > 0 && safeH > 0 && zones.map((z) => {
                  const zw = toCm(z.w, unit) * scale;
                  const zh = toCm(z.h, unit) * scale;
                  if (zw <= 0 || zh <= 0) return null;

                  const textYOffset = z.label ? -6 : 0;
                  const isDiagonal = z.type === 'diagonal';

                  if (!isDiagonal) {
                    let zx = b;
                    const cX = toCm(z.customX, unit) * scale;
                    if (z.alignX === 'center') zx = b + safeW / 2 - zw / 2;
                    else if (z.alignX === 'right') zx = b + safeW - zw;
                    else if (z.alignX === 'customLeft') zx = b + cX;
                    else if (z.alignX === 'customRight') zx = b + safeW - cX - zw;

                    let zy = b;
                    const cY = toCm(z.customY, unit) * scale;
                    if (z.alignY === 'center') zy = b + safeH / 2 - zh / 2;
                    else if (z.alignY === 'bottom') zy = b + safeH - zh;
                    else if (z.alignY === 'customTop') zy = b + cY;
                    else if (z.alignY === 'customBottom') zy = b + safeH - cY - zh;

                    return (
                      <g key={z.id}>
                        <rect x={zx} y={zy} width={zw} height={zh} fill="url(#interfPattern)" stroke={COLORS.cut} strokeWidth={strokeThin} />
                        {z.label && (
                          <text x={zx + zw / 2} y={zy + zh / 2 + textYOffset} fill={COLORS.cutText} fontSize={Math.max(12, centerFontSize * 0.7)} fontFamily="sans-serif" textAnchor="middle" fontWeight="900" stroke="#ffffff" strokeWidth="4" paintOrder="stroke" strokeLinejoin="round">
                            {z.label.toUpperCase()}
                          </text>
                        )}
                        <text x={zx + zw / 2} y={zy + zh / 2 + textYOffset + (z.label ? centerFontSize * 0.8 : 6)} fill={COLORS.cutText} fontSize={Math.max(10, centerFontSize * 0.6)} fontFamily="sans-serif" textAnchor="middle" fontWeight="bold" stroke="#ffffff" strokeWidth="3" paintOrder="stroke" strokeLinejoin="round">
                          ({z.w} x {z.h} {unit})
                        </text>
                      </g>
                    );
                  }

                  // Corte diagonal (chanfro) por canto.
                  let pts = '';
                  let cx = 0;
                  let cy = 0;
                  if (z.corner === 'tl') {
                    pts = `${b},${b} ${b + zw},${b} ${b},${b + zh}`;
                    cx = b + zw / 3;
                    cy = b + zh / 3;
                  } else if (z.corner === 'tr') {
                    pts = `${b + safeW - zw},${b} ${b + safeW},${b} ${b + safeW},${b + zh}`;
                    cx = b + safeW - zw / 3;
                    cy = b + zh / 3;
                  } else if (z.corner === 'bl') {
                    pts = `${b},${b + safeH - zh} ${b + zw},${b + safeH} ${b},${b + safeH}`;
                    cx = b + zw / 3;
                    cy = b + safeH - zh / 3;
                  } else if (z.corner === 'br') {
                    pts = `${b + safeW - zw},${b + safeH} ${b + safeW},${b + safeH - zh} ${b + safeW},${b + safeH}`;
                    cx = b + safeW - zw / 3;
                    cy = b + safeH - zh / 3;
                  }
                  return (
                    <g key={z.id}>
                      <polygon points={pts} fill="url(#interfPattern)" stroke={COLORS.cut} strokeWidth={strokeThick} />
                      {z.label && (
                        <text x={cx} y={cy + textYOffset} fill={COLORS.cutText} fontSize={Math.max(10, centerFontSize * 0.55)} fontFamily="sans-serif" textAnchor="middle" fontWeight="900" stroke="#ffffff" strokeWidth="4" paintOrder="stroke" strokeLinejoin="round">
                          {z.label.toUpperCase()}
                        </text>
                      )}
                      <text x={cx} y={cy + textYOffset + (z.label ? centerFontSize * 0.6 : 6)} fill={COLORS.cutText} fontSize={Math.max(9, centerFontSize * 0.45)} fontFamily="sans-serif" textAnchor="middle" fontWeight="bold" stroke="#ffffff" strokeWidth="3" paintOrder="stroke" strokeLinejoin="round">
                        ({z.w} x {z.h} {unit})
                      </text>
                    </g>
                  );
                })}

                <g stroke={COLORS.dim} strokeWidth={strokeThin}>
                  <line x1="0" y1={-offset} x2={w} y2={-offset} />
                  <line x1="0" y1={-offset - tickSize} x2="0" y2={-offset + tickSize} />
                  <line x1={w} y1={-offset - tickSize} x2={w} y2={-offset + tickSize} />
                  <line x1="0" y1={0} x2="0" y2={-offset} stroke="#888888" strokeDasharray="6,6" />
                  <line x1={w} y1={0} x2={w} y2={-offset} stroke="#888888" strokeDasharray="6,6" />

                  <line x1={-offset} y1="0" x2={-offset} y2={h} />
                  <line x1={-offset - tickSize} y1="0" x2={-offset + tickSize} y2="0" />
                  <line x1={-offset - tickSize} y1={h} x2={-offset + tickSize} y2={h} />
                  <line x1={0} y1={0} x2={-offset} y2={0} stroke="#888888" strokeDasharray="6,6" />
                  <line x1={0} y1={h} x2={-offset} y2={h} stroke="#888888" strokeDasharray="6,6" />
                </g>

                <text x={w / 2} y={-offset - 10} fill={COLORS.dim} fontSize={dimFontSize} fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                  {formatDim(widthStr, unit)} {unit}
                </text>
                <text x={-offset - 10} y={h / 2} fill={COLORS.dim} fontSize={dimFontSize} fontFamily="sans-serif" textAnchor="middle" fontWeight="bold" transform={`rotate(-90 ${-offset - 10} ${h / 2})`}>
                  {formatDim(heightStr, unit)} {unit}
                </text>

                {showCenterBox && (
                  <g transform={`translate(${w / 2 - boxW / 2}, ${h / 2 - boxH / 2})`}>
                    <rect x="0" y="0" width={boxW} height={boxH} fill="#ffffff" stroke={COLORS.bleed} strokeWidth={strokeThin} />
                    <text x={boxW / 2} y={boxH * 0.45} fill={COLORS.bleed} fontSize={centerFontSize} fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                      PREVÊ SANGRIA DE {inputBleed}
                      {bleedUnit.toUpperCase()}
                    </text>
                    <text x={boxW / 2} y={boxH * 0.8} fill={COLORS.bleed} fontSize={centerFontSize} fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                      EM AMBOS OS LADOS
                    </text>
                  </g>
                )}
              </svg>
            ) : (
              <div className="text-center text-slate-400 px-6">
                <p className="font-semibold text-sm uppercase tracking-wide">Informe largura e altura</p>
                <p className="text-xs mt-1">O gabarito aparece aqui assim que as medidas forem preenchidas.</p>
              </div>
            )}
          </div>

          <div className="h-[100px] min-h-[100px] border-t-[3px] border-slate-800 flex bg-white text-slate-800 shrink-0 relative">
            {markerRef && (
              <div className="absolute top-0 left-0 bg-[#ea580c] text-white font-black text-xs px-2 py-1 transform -translate-y-full border-t-[3px] border-r-[3px] border-slate-800">
                {hasMultipleMarkers ? 'MARCADORES' : 'MARCADOR'}: {markerRef.toUpperCase()}
              </div>
            )}

            <div className="flex-[2] border-r-[3px] border-slate-800 p-3 pt-4 flex flex-col justify-start overflow-hidden">
              <span className="text-[10px] font-bold text-slate-500 leading-none mb-1.5 uppercase">Cliente</span>
              <span className="font-extrabold text-[12px] leading-snug uppercase">{clientName || 'NÃO INFORMADO'}</span>
            </div>
            <div className="flex-[2] border-r-[3px] border-slate-800 p-3 pt-4 flex flex-col justify-start overflow-hidden">
              <span className="text-[10px] font-bold text-slate-500 leading-none mb-1.5 uppercase">Item / Projeto</span>
              <span className="font-extrabold text-[12px] leading-snug uppercase text-[#ea580c]">
                {markerRef ? `[${markerRef.toUpperCase()}] ` : ''}
                <span className="text-slate-800">{itemName || 'NÃO INFORMADO'}</span>
              </span>
            </div>
            <div className="flex-[2] border-r-[3px] border-slate-800 p-3 pt-4 flex flex-col justify-start overflow-hidden">
              <span className="text-[10px] font-bold text-slate-500 leading-none mb-1.5 uppercase">Material</span>
              <span className="font-extrabold text-[12px] leading-snug uppercase">{title || '-'}</span>
            </div>
            <div className="flex-[1.5] border-r-[3px] border-slate-800 p-3 pt-4 flex flex-col justify-start items-center bg-slate-50 overflow-hidden">
              <span className="text-[10px] font-bold text-slate-500 leading-none mb-1.5 uppercase">Medida Final</span>
              <span className="font-extrabold text-[14px] leading-snug uppercase text-red-600 text-center whitespace-nowrap">
                {formatDim(widthStr, unit)}
                {unit} x {formatDim(heightStr, unit)}
                {unit}
              </span>
            </div>
            <div className="flex-[1] p-3 pt-4 flex flex-col justify-start items-center bg-slate-50 overflow-hidden">
              <span className="text-[10px] font-bold text-slate-500 leading-none mb-1.5 uppercase">Sangria</span>
              <span className="font-extrabold text-[14px] leading-snug uppercase text-purple-600 text-center whitespace-nowrap">
                {inputBleed}
                {bleedUnit}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ArtPreview;
