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
    bleedNotePos = 'center',
    safeWidthStr,
    safeHeightStr,
    zones,
    markerRef,
  } = art;

  const inputBleed = parseNum(bleedStr);

  const w_cm = toCm(widthStr, unit);
  const h_cm = toCm(heightStr, unit);
  const b_cm = bleedToCm(bleedStr, bleedUnit);
  const sw_cm = toCm(safeWidthStr, unit);
  const sh_cm = toCm(safeHeightStr, unit);

  // Scale relative to the total canvas (art + bleed on every side).
  // The art rect (w × h) is immutable; bleed expands OUTSIDE it.
  const totalW_cm = w_cm + 2 * b_cm;
  const totalH_cm = h_cm + 2 * b_cm;
  const maxDim_cm = Math.max(totalW_cm, totalH_cm) || Math.max(w_cm, h_cm) || 1;
  const scale = SVG.scaleTarget / maxDim_cm;

  const w = w_cm * scale;
  const h = h_cm * scale;
  const b = b_cm * scale;
  const sw = sw_cm * scale;
  const sh = sh_cm * scale;

  const hasSafeArea = sw > 0 && sh > 0 && sw <= w && sh <= h;

  const { strokeThin, strokeThick, offset, crossSize, tickSize } = SVG;

  const titleFontSize = 22;
  const dimFontSize = 18;
  const baseCenterFontSize = 16;

  // Dimension callout lines must sit outside the bleed outer box.
  // dimOffset is the distance from the art edge to the callout line.
  const dimOffset = b + offset;

  // Symmetric padding around the total canvas (bleed + art) for labels and callouts.
  const padX = dimOffset + 80;
  const padY = dimOffset + 80;

  // Center info box for the sangria notice — sized relative to the art area.
  let boxW = 260;
  let boxH = 60;
  let centerFontSize = baseCenterFontSize;
  let showCenterBox = false;

  if (b > 0 && w > 0 && h > 0) {
    const scaleBox = Math.min(1, (w * 0.8) / boxW, (h * 0.8) / boxH);
    boxW *= scaleBox;
    boxH *= scaleBox;
    centerFontSize *= scaleBox;
    showCenterBox = scaleBox >= 0.2;
  }

  const landscape = isLandscape(widthStr, heightStr);
  const hasMeasures = w > 0 && h > 0;

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
                viewBox={`${-padX} ${-padY} ${w + 2 * b + 2 * padX} ${h + 2 * b + 2 * padY}`}
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

                {/* Title above the art area */}
                <text x="0" y={-(dimOffset + 25)} fill="#666666" fontSize={titleFontSize} fontFamily="sans-serif" textAnchor="start" fontWeight="bold">
                  {title.toUpperCase()}
                </text>

                {/* Marker badge (top-right of art) */}
                {markerRef && (
                  <g transform={`translate(${w}, ${-(dimOffset + 40)})`}>
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

                {/* Bleed region: outer dashed box filled with hatch.
                    The art rect drawn afterwards visually masks the center. */}
                {b > 0 && (
                  <rect x={-b} y={-b} width={w + 2 * b} height={h + 2 * b} fill="url(#hatchPattern)" stroke="#888888" strokeWidth={strokeThin} strokeDasharray="8,8" />
                )}

                {/* Art area — the immutable final print dimensions */}
                <rect x="0" y="0" width={w} height={h} fill="#fcfcfc" stroke="#555555" strokeWidth={strokeThick} />

                {/* Corner crop marks at the art boundary */}
                <g stroke={COLORS.dim} strokeWidth={strokeThin}>
                  <path d={`M${-crossSize},0 L${crossSize},0 M0,${-crossSize} L0,${crossSize}`} />
                  <path d={`M${w - crossSize},0 L${w + crossSize},0 M${w},${-crossSize} L${w},${crossSize}`} />
                  <path d={`M${-crossSize},${h} L${crossSize},${h} M0,${h - crossSize} L0,${h + crossSize}`} />
                  <path d={`M${w - crossSize},${h} L${w + crossSize},${h} M${w},${h - crossSize} L${w},${h + crossSize}`} />
                </g>

                {/* Interference zones — positioned relative to art area origin (0, 0) */}
                {zones.map((z) => {
                  const zw = toCm(z.w, unit) * scale;
                  const zh = toCm(z.h, unit) * scale;
                  if (zw <= 0 || zh <= 0) return null;

                  const textYOffset = z.label ? -6 : 0;
                  const isDiagonal = z.type === 'diagonal';

                  if (!isDiagonal) {
                    const cX = toCm(z.customX, unit) * scale;
                    let zx = 0;
                    if (z.alignX === 'center') zx = w / 2 - zw / 2;
                    else if (z.alignX === 'right') zx = w - zw;
                    else if (z.alignX === 'customLeft') zx = cX;
                    else if (z.alignX === 'customRight') zx = w - cX - zw;

                    const cY = toCm(z.customY, unit) * scale;
                    let zy = 0;
                    if (z.alignY === 'center') zy = h / 2 - zh / 2;
                    else if (z.alignY === 'bottom') zy = h - zh;
                    else if (z.alignY === 'customTop') zy = cY;
                    else if (z.alignY === 'customBottom') zy = h - cY - zh;

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

                  // Diagonal cut (chamfer) by corner — within art area.
                  let pts = '';
                  let cx = 0;
                  let cy = 0;
                  if (z.corner === 'tl') {
                    pts = `0,0 ${zw},0 0,${zh}`;
                    cx = zw / 3;
                    cy = zh / 3;
                  } else if (z.corner === 'tr') {
                    pts = `${w - zw},0 ${w},0 ${w},${zh}`;
                    cx = w - zw / 3;
                    cy = zh / 3;
                  } else if (z.corner === 'bl') {
                    pts = `0,${h - zh} ${zw},${h} 0,${h}`;
                    cx = zw / 3;
                    cy = h - zh / 3;
                  } else if (z.corner === 'br') {
                    pts = `${w - zw},${h} ${w},${h - zh} ${w},${h}`;
                    cx = w - zw / 3;
                    cy = h - zh / 3;
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

                {/* Safe area — optional green guide line centered in the art */}
                {hasSafeArea && (
                  <g>
                    <rect
                      x={(w - sw) / 2}
                      y={(h - sh) / 2}
                      width={sw}
                      height={sh}
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth={strokeThick}
                      strokeDasharray="10,5"
                    />
                    <text
                      x={w / 2}
                      y={(h - sh) / 2 - 8}
                      fill="#16a34a"
                      fontSize={Math.max(10, dimFontSize * 0.75)}
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      fontWeight="bold"
                      stroke="#ffffff"
                      strokeWidth="3"
                      paintOrder="stroke"
                    >
                      ÁREA DE SEGURANÇA ({safeWidthStr} x {safeHeightStr} {unit})
                    </text>
                  </g>
                )}

                {/* Dimension callout lines — always outside the bleed outer box */}
                <g stroke={COLORS.dim} strokeWidth={strokeThin}>
                  <line x1="0" y1={-dimOffset} x2={w} y2={-dimOffset} />
                  <line x1="0" y1={-dimOffset - tickSize} x2="0" y2={-dimOffset + tickSize} />
                  <line x1={w} y1={-dimOffset - tickSize} x2={w} y2={-dimOffset + tickSize} />
                  <line x1="0" y1="0" x2="0" y2={-dimOffset} stroke="#888888" strokeDasharray="6,6" />
                  <line x1={w} y1="0" x2={w} y2={-dimOffset} stroke="#888888" strokeDasharray="6,6" />

                  <line x1={-dimOffset} y1="0" x2={-dimOffset} y2={h} />
                  <line x1={-dimOffset - tickSize} y1="0" x2={-dimOffset + tickSize} y2="0" />
                  <line x1={-dimOffset - tickSize} y1={h} x2={-dimOffset + tickSize} y2={h} />
                  <line x1="0" y1="0" x2={-dimOffset} y2="0" stroke="#888888" strokeDasharray="6,6" />
                  <line x1="0" y1={h} x2={-dimOffset} y2={h} stroke="#888888" strokeDasharray="6,6" />
                </g>

                <text x={w / 2} y={-dimOffset - 10} fill={COLORS.dim} fontSize={dimFontSize} fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                  {formatDim(widthStr, unit)} {unit}
                </text>
                <text x={-dimOffset - 10} y={h / 2} fill={COLORS.dim} fontSize={dimFontSize} fontFamily="sans-serif" textAnchor="middle" fontWeight="bold" transform={`rotate(-90 ${-dimOffset - 10} ${h / 2})`}>
                  {formatDim(heightStr, unit)} {unit}
                </text>

                {/* Sangria info box — posição configurável dentro da arte */}
                {showCenterBox && (() => {
                  const pad = 16;
                  const posX = {
                    tl: pad, top: w / 2 - boxW / 2, tr: w - boxW - pad,
                    left: pad, center: w / 2 - boxW / 2, right: w - boxW - pad,
                    bl: pad, bottom: w / 2 - boxW / 2, br: w - boxW - pad,
                  }[bleedNotePos] ?? w / 2 - boxW / 2;
                  const posY = {
                    tl: pad, top: pad, tr: pad,
                    left: h / 2 - boxH / 2, center: h / 2 - boxH / 2, right: h / 2 - boxH / 2,
                    bl: h - boxH - pad, bottom: h - boxH - pad, br: h - boxH - pad,
                  }[bleedNotePos] ?? h / 2 - boxH / 2;
                  return (
                  <g transform={`translate(${posX}, ${posY})`}>
                    <rect x="0" y="0" width={boxW} height={boxH} fill="#ffffff" stroke={COLORS.bleed} strokeWidth={strokeThin} />
                    <text x={boxW / 2} y={boxH * 0.45} fill={COLORS.bleed} fontSize={centerFontSize} fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                      PREVÊ SANGRIA DE {inputBleed}
                      {bleedUnit.toUpperCase()}
                    </text>
                    <text x={boxW / 2} y={boxH * 0.8} fill={COLORS.bleed} fontSize={centerFontSize} fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                      EM AMBOS OS LADOS
                    </text>
                  </g>
                  );
                })()}
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
