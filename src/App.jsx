import React, { useState, useRef, useEffect } from 'react';
import {
  Download, FileImage, FileType, User, Tag, Plus, Trash2,
  Layers, Scissors, MapPin, Upload, Image as ImageIcon, X,
} from 'lucide-react';

import ProjectCover from './components/ProjectCover';
import ArtPreview from './components/ArtPreview';
import { useLocalStorage } from './hooks/useLocalStorage';
import { indexToLabel } from './utils/labels';
import { generatePdf } from './utils/pdf';

export default function App() {
  const [activeTab, setActiveTab] = useState('projeto');

  // Projeto (capa com múltiplas vistas) — persistido.
  const [projectViews, setProjectViews] = useLocalStorage('ag.projectViews', []);
  const [activeViewId, setActiveViewId] = useState(null);

  // Gabarito atual — persistido (exceto markerRef, que é transitório).
  const [clientName, setClientName] = useLocalStorage('ag.clientName', '');
  const [itemName, setItemName] = useLocalStorage('ag.itemName', '');
  const [markerRef, setMarkerRef] = useState('');
  const [title, setTitle] = useLocalStorage('ag.title', 'ADESIVO IMPRESSO');
  const [widthStr, setWidthStr] = useLocalStorage('ag.widthStr', '18.0');
  const [heightStr, setHeightStr] = useLocalStorage('ag.heightStr', '28.0');
  const [unit, setUnit] = useLocalStorage('ag.unit', 'cm');
  const [bleedStr, setBleedStr] = useLocalStorage('ag.bleedStr', '3');
  const [bleedUnit, setBleedUnit] = useLocalStorage('ag.bleedUnit', 'cm');
  const [zones, setZones] = useLocalStorage('ag.zones', []);

  const [savedArts, setSavedArts] = useLocalStorage('ag.savedArts', []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total }
  const [toast, setToast] = useState(null); // { type, message }

  // Refs por id (não desalinham quando um item é removido do meio da lista).
  const previewRef = useRef(null);
  const coverRefs = useRef(new Map());
  const artRefs = useRef(new Map());
  const imageInputRef = useRef(null);

  const currentArt = {
    id: 'current', clientName, itemName, markerRef, title,
    widthStr, heightStr, unit, bleedStr, bleedUnit, zones,
  };

  // Garante uma vista ativa válida sempre que a lista muda.
  useEffect(() => {
    if (projectViews.length === 0) {
      if (activeViewId !== null) setActiveViewId(null);
    } else if (!projectViews.some((v) => v.id === activeViewId)) {
      setActiveViewId(projectViews[0].id);
    }
  }, [projectViews, activeViewId]);

  const showToast = (type, message) => {
    setToast({ type, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 5000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newId = Date.now().toString();
        setProjectViews((prev) => [...prev, { id: newId, image: event.target.result, markers: [] }]);
        setActiveViewId(newId);
      };
      reader.readAsDataURL(file);
    }
    // Permite subir o mesmo arquivo novamente.
    e.target.value = '';
  };

  const handleImageClick = (e) => {
    if (!activeViewId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const totalMarkers = projectViews.reduce((acc, view) => acc + view.markers.length, 0);
    const nextLabel = indexToLabel(totalMarkers);

    setProjectViews((prev) => prev.map((v) =>
      v.id === activeViewId ? { ...v, markers: [...v.markers, { id: Date.now(), x, y, label: nextLabel }] } : v,
    ));
  };

  const updateMarkerLabel = (viewId, markerId, newLabel) => {
    setProjectViews((prev) => prev.map((v) =>
      v.id === viewId ? { ...v, markers: v.markers.map((m) => (m.id === markerId ? { ...m, label: newLabel } : m)) } : v,
    ));
  };

  const removeMarker = (viewId, markerId) => {
    setProjectViews((prev) => prev.map((v) =>
      v.id === viewId ? { ...v, markers: v.markers.filter((m) => m.id !== markerId) } : v,
    ));
  };

  const removeView = (viewId) => {
    setProjectViews((prev) => prev.filter((v) => v.id !== viewId));
  };

  const handleSaveToQueue = () => {
    setSavedArts((prev) => [...prev, { ...currentArt, id: Date.now() }]);
    setMarkerRef('');
    showToast('success', 'Arte adicionada à lista de peças.');
  };

  const handleRemoveFromQueue = (id) => {
    setSavedArts((prev) => prev.filter((art) => art.id !== id));
  };

  const addZone = () => {
    setZones((prev) => [...prev, {
      id: Date.now(), label: 'Corte/Furo', type: 'rect',
      w: '5.0', h: '5.0', alignX: 'left', alignY: 'bottom',
      corner: 'bl', customX: '0', customY: '0',
    }]);
  };

  const updateZone = (id, field, value) => {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, [field]: value } : z)));
  };

  const removeZone = (id) => {
    setZones((prev) => prev.filter((z) => z.id !== id));
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    setProgress(null);
    try {
      const coverEls = projectViews.map((v) => coverRefs.current.get(v.id));
      const artItems = savedArts.length > 0 ? savedArts : [currentArt];
      const artEls = savedArts.length > 0
        ? savedArts.map((a) => artRefs.current.get(a.id))
        : [previewRef.current];

      const fileName = clientName
        ? `Projeto_${clientName.replace(/\s+/g, '_')}.pdf`
        : 'Projeto_Gabaritos.pdf';

      await generatePdf({
        coverEls,
        artItems,
        artEls,
        fileName,
        onProgress: (done, total) => setProgress({ done, total }),
      });
      showToast('success', 'PDF gerado com sucesso.');
    } catch (err) {
      console.error('Erro ao gerar PDF', err);
      showToast('error', 'Não foi possível gerar o PDF. Veja o console para detalhes.');
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  };

  const activeView = projectViews.find((v) => v.id === activeViewId);
  const totalPages = projectViews.length + (savedArts.length > 0 ? savedArts.length : 1);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 font-sans text-slate-800">

      {/* --- MENU LATERAL (SIDEBAR) --- */}
      <div className="w-full md:w-[420px] bg-white border-r border-slate-200 flex flex-col shadow-xl z-10 shrink-0">

        <div className="p-6 pb-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-slate-800 p-2 rounded-lg text-white">
              <MapPin size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Caderno de Produção</h1>
              <p className="text-xs text-slate-500">Mapeamento e Gabaritos A4</p>
            </div>
          </div>

          <div className="flex border-b border-slate-200 mb-4" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'projeto'}
              onClick={() => setActiveTab('projeto')}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'projeto' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              1. Projeto Visual
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'gabaritos'}
              onClick={() => setActiveTab('gabaritos')}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'gabaritos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              2. Criar Gabaritos
            </button>
          </div>
        </div>

        <div className="space-y-5 flex-1 pb-6 px-6 overflow-y-auto">

          {/* ABA 1: PROJETO / REFERÊNCIA */}
          {activeTab === 'projeto' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-bold text-orange-800 mb-2">Imagens do Projeto 3D</h3>
                <p className="text-xs text-orange-700 mb-4 leading-relaxed">
                  Suba uma ou mais vistas do estande. Clique na imagem para espalhar os marcadores (A, B, C...).
                </p>

                {projectViews.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-3 mb-3 border-b border-orange-200/50">
                    {projectViews.map((view, idx) => (
                      <div
                        key={view.id}
                        onClick={() => setActiveViewId(view.id)}
                        className={`relative w-16 h-16 shrink-0 rounded-md cursor-pointer overflow-hidden border-2 transition-all shadow-sm ${activeViewId === view.id ? 'border-orange-600 ring-2 ring-orange-200' : 'border-slate-300 opacity-60 hover:opacity-100'}`}
                      >
                        <img src={view.image} className="w-full h-full object-cover" alt={`Vista ${idx + 1}`} />
                        <button
                          aria-label={`Remover vista ${idx + 1}`}
                          onClick={(e) => { e.stopPropagation(); removeView(view.id); }}
                          className="absolute top-0 right-0 bg-red-600/90 hover:bg-red-600 text-white p-1 rounded-bl-md backdrop-blur-sm transition-colors"
                        >
                          <Trash2 size={10} />
                        </button>
                        <div className="absolute bottom-0 w-full bg-slate-900/80 text-white text-[9px] font-bold text-center py-0.5 backdrop-blur-sm">Vista {idx + 1}</div>
                      </div>
                    ))}
                  </div>
                )}

                <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />
                <button
                  onClick={() => imageInputRef.current.click()}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold transition-colors shadow-md"
                >
                  <Upload size={16} /> Adicionar Nova Vista
                </button>
              </div>

              {activeView && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                    <span>Marcadores Desta Vista</span>
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[9px]">Total: {activeView.markers.length}</span>
                  </h3>

                  {activeView.markers.length === 0 && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded border border-slate-200">
                      Clique na imagem ao lado para adicionar o primeiro marcador.
                    </p>
                  )}

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {activeView.markers.map((m) => (
                      <div key={m.id} className="flex gap-2 items-center bg-white border border-slate-200 p-2 rounded shadow-sm hover:border-orange-300 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-inner">
                          {m.label}
                        </div>
                        <input
                          type="text"
                          value={m.label}
                          onChange={(e) => updateMarkerLabel(activeView.id, m.id, e.target.value)}
                          placeholder="Ex: A1"
                          aria-label="Rótulo do marcador"
                          className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded outline-none focus:border-orange-500 text-sm font-bold uppercase transition-colors"
                        />
                        <button aria-label="Remover marcador" onClick={() => removeMarker(activeView.id, m.id)} className="text-slate-400 hover:text-red-500 p-1 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ABA 2: GABARITOS TÉCNICOS */}
          {activeTab === 'gabaritos' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-sm">
                <h3 className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2 mb-3">
                  <Layers size={16} /> Lista de Peças ({savedArts.length})
                </h3>
                {savedArts.length > 0 && (
                  <div className="space-y-2 mb-3 max-h-32 overflow-y-auto pr-1">
                    {savedArts.map((art, i) => (
                      <div key={art.id} className="flex justify-between items-center text-xs bg-white p-2 border border-blue-200 rounded shadow-sm text-slate-700">
                        <span className="font-bold truncate max-w-[200px]">
                          {art.markerRef && <span className="text-orange-600 mr-1">[{art.markerRef}]</span>}
                          {art.itemName || `Arte ${i + 1}`}
                        </span>
                        <button aria-label="Remover arte da lista" onClick={() => handleRemoveFromQueue(art.id)} className="text-slate-400 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={handleSaveToQueue} className="w-full text-xs bg-blue-600 text-white py-2.5 rounded font-bold hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2">
                  <Plus size={16} /> SALVAR ARTE ATUAL NA LISTA
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Identificação</h2>

                <div className="relative">
                  <label className="flex items-center gap-2 text-sm font-bold text-orange-700 mb-1"><MapPin size={16} /> Marcador Ref. na Foto</label>
                  <input
                    type="text"
                    value={markerRef}
                    onChange={(e) => setMarkerRef(e.target.value)}
                    placeholder="Ex: A, B, C1..."
                    className="w-full px-3 py-2 border-2 border-orange-300 rounded focus:ring-2 focus:ring-orange-600 outline-none text-sm font-bold uppercase text-orange-800 placeholder:text-orange-300"
                  />
                  <p className="text-[10px] text-orange-600 mt-1">Separe por vírgula para agrupar (ex: A, B, C)</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1"><User size={12} /> Cliente</label>
                    <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded outline-none text-xs uppercase" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1"><Tag size={12} /> Item/Projeto</label>
                    <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded outline-none text-xs uppercase" />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1"><FileType size={12} /> Tipo de Material</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded outline-none text-xs uppercase" />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Medidas da Peça</h2>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="radio" value="m" checked={unit === 'm'} onChange={(e) => setUnit(e.target.value)} className="text-slate-800" /> Metros (m)</label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer"><input type="radio" value="cm" checked={unit === 'cm'} onChange={(e) => setUnit(e.target.value)} className="text-slate-800" /> Centímetros (cm)</label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Largura</label>
                    <input type="number" step={unit === 'm' ? '0.1' : '1'} min="0.1" value={widthStr} onChange={(e) => setWidthStr(e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Altura</label>
                    <input type="number" step={unit === 'm' ? '0.1' : '1'} min="0.1" value={heightStr} onChange={(e) => setHeightStr(e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sangria Externa</label>
                  <div className="flex">
                    <input type="number" step={bleedUnit === 'cm' ? '1' : '5'} min="0" value={bleedStr} onChange={(e) => setBleedStr(e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded-l outline-none text-sm" />
                    <select value={bleedUnit} onChange={(e) => setBleedUnit(e.target.value)} aria-label="Unidade da sangria" className="px-2 border-y border-r border-slate-300 rounded-r bg-slate-100 outline-none text-xs">
                      <option value="cm">cm</option>
                      <option value="mm">mm</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ÁREAS DE INTERFERÊNCIA */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1"><Scissors size={14} /> Áreas de Interferência</h2>
                </div>
                <p className="text-[10px] text-red-700 leading-tight">Adicione cortes ou furos em posições matemáticas exatas.</p>

                {zones.map((zone) => {
                  const showCustomX = zone.alignX === 'customLeft' || zone.alignX === 'customRight';
                  const showCustomY = zone.alignY === 'customTop' || zone.alignY === 'customBottom';

                  return (
                    <div key={zone.id} className="bg-white p-3 rounded border border-red-200 shadow-sm space-y-3 relative">
                      <div className="flex gap-2">
                        <input type="text" value={zone.label} onChange={(e) => updateZone(zone.id, 'label', e.target.value)} placeholder="Nome do Corte" className="w-full px-2 py-1 text-sm border-b border-slate-200 outline-none focus:border-red-500 font-semibold" />
                        <button aria-label="Remover área de corte" onClick={() => removeZone(zone.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                      <div>
                        <select value={zone.type} onChange={(e) => updateZone(zone.id, 'type', e.target.value)} aria-label="Tipo de corte" className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:border-red-500">
                          <option value="rect">Retângulo (Bloqueio / Furo)</option>
                          <option value="diagonal">Corte Diagonal (Chanfro)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Larg. ({unit})</label><input type="number" step="0.1" value={zone.w} onChange={(e) => updateZone(zone.id, 'w', e.target.value)} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:border-red-500" /></div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Alt. ({unit})</label><input type="number" step="0.1" value={zone.h} onChange={(e) => updateZone(zone.id, 'h', e.target.value)} className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:border-red-500" /></div>
                      </div>

                      {zone.type === 'rect' ? (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <select value={zone.alignX} onChange={(e) => updateZone(zone.id, 'alignX', e.target.value)} aria-label="Alinhamento horizontal" className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:border-red-500">
                              <option value="left">Esq</option>
                              <option value="center">Centro</option>
                              <option value="right">Dir</option>
                              <option value="customLeft">Exato Esq.</option>
                              <option value="customRight">Exato Dir.</option>
                            </select>
                            <select value={zone.alignY} onChange={(e) => updateZone(zone.id, 'alignY', e.target.value)} aria-label="Alinhamento vertical" className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:border-red-500">
                              <option value="top">Topo</option>
                              <option value="center">Meio</option>
                              <option value="bottom">Base</option>
                              <option value="customTop">Exato Topo</option>
                              <option value="customBottom">Exato Base</option>
                            </select>
                          </div>

                          {(showCustomX || showCustomY) && (
                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-red-100">
                              {showCustomX ? (
                                <div>
                                  <label className="text-[10px] font-bold text-red-700 uppercase leading-none block mb-1">
                                    Da {zone.alignX === 'customLeft' ? 'Esquerda' : 'Direita'} ({unit})
                                  </label>
                                  <input type="number" step="0.1" value={zone.customX} onChange={(e) => updateZone(zone.id, 'customX', e.target.value)} className="w-full px-2 py-1 bg-white border border-red-300 rounded text-xs outline-none focus:border-red-600 shadow-sm" />
                                </div>
                              ) : <div />}

                              {showCustomY ? (
                                <div>
                                  <label className="text-[10px] font-bold text-red-700 uppercase leading-none block mb-1">
                                    D{zone.alignY === 'customTop' ? 'o Topo' : 'a Base'} ({unit})
                                  </label>
                                  <input type="number" step="0.1" value={zone.customY} onChange={(e) => updateZone(zone.id, 'customY', e.target.value)} className="w-full px-2 py-1 bg-white border border-red-300 rounded text-xs outline-none focus:border-red-600 shadow-sm" />
                                </div>
                              ) : <div />}
                            </div>
                          )}
                        </>
                      ) : (
                        <select value={zone.corner} onChange={(e) => updateZone(zone.id, 'corner', e.target.value)} aria-label="Canto do chanfro" className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:border-red-500">
                          <option value="tl">Superior Esquerdo</option>
                          <option value="tr">Superior Direito</option>
                          <option value="bl">Inferior Esquerdo</option>
                          <option value="br">Inferior Direito</option>
                        </select>
                      )}
                    </div>
                  );
                })}
                <button onClick={addZone} className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 rounded"><Plus size={14} /> Nova Área de Corte</button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do menu (botão de PDF) */}
        <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0 z-10">
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center gap-2 py-4 px-4 rounded font-bold text-white transition-all shadow-md
              ${isGenerating ? 'bg-slate-400 cursor-not-allowed' : savedArts.length > 0 ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-slate-800 hover:bg-slate-900 shadow-slate-300'}`}
          >
            {isGenerating ? (
              progress ? `Processando PDF... ${progress.done}/${progress.total}` : 'Processando PDF...'
            ) : savedArts.length > 0 ? (
              <><Download size={20} /> Baixar PDF Completo ({totalPages} Págs)</>
            ) : (
              <><Download size={20} /> Baixar PDF Atual</>
            )}
          </button>
        </div>

      </div>
      {/* --- FIM DO MENU LATERAL --- */}


      {/* --- ÁREA CENTRAL DE PREVIEW --- */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8 bg-slate-200 shadow-inner relative">

        {activeTab === 'projeto' ? (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            <div className="absolute top-0 left-0 flex items-center gap-2 text-slate-500 font-bold tracking-wide text-sm bg-white/80 px-3 py-1 rounded shadow-sm backdrop-blur z-10">
              <ImageIcon size={18} /> REFERÊNCIA VISUAL DO PROJETO
            </div>

            {activeView ? (
              <div
                className="relative shadow-2xl rounded border-4 border-white cursor-crosshair max-w-full max-h-full bg-slate-900 flex items-center justify-center overflow-hidden"
                onClick={handleImageClick}
              >
                <img src={activeView.image} alt="Referência" className="max-w-full max-h-[85vh] object-contain pointer-events-none" />

                {activeView.markers.map((m) => (
                  <div
                    key={m.id}
                    className="absolute bg-[#ea580c] text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-lg pointer-events-auto"
                    style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)', width: '32px', height: '32px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {m.label}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 flex flex-col items-center gap-4">
                <ImageIcon size={64} className="opacity-50" />
                <p className="font-medium text-lg">Adicione uma ou mais imagens 3D na barra lateral.</p>
              </div>
            )}

            {activeView && activeView.markers.length === 0 && (
              <div className="absolute bottom-10 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold animate-bounce pointer-events-none">
                <MapPin size={18} /> Clique na imagem para adicionar marcadores
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="absolute top-4 left-6 flex items-center gap-2 text-slate-500 font-bold tracking-wide text-sm">
              <FileImage size={18} /> PRÉ-VISUALIZAÇÃO DE CORTES E SANGRIA
              {savedArts.length > 0 && (
                <span className="text-blue-500 text-xs bg-blue-100 px-2 py-0.5 rounded-full ml-2">
                  Pág. {totalPages + 1} (Não Salva)
                </span>
              )}
            </div>
            <ArtPreview ref={previewRef} art={currentArt} />
          </>
        )}
      </div>
      {/* --- FIM DA ÁREA CENTRAL --- */}


      {/* Toast de feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl text-sm font-semibold text-white animate-in fade-in slide-in-from-bottom-2
            ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}
          role="status"
        >
          {toast.message}
          <button aria-label="Fechar aviso" onClick={() => setToast(null)} className="opacity-80 hover:opacity-100"><X size={16} /></button>
        </div>
      )}

      {/* RENDERIZAÇÃO OCULTA (para o PDF capturar tudo em alta resolução) */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', opacity: 0, pointerEvents: 'none' }}>
        {projectViews.map((view, index) => (
          <div key={`cover-${view.id}`} style={{ marginBottom: '100px' }}>
            <ProjectCover
              ref={(el) => { if (el) coverRefs.current.set(view.id, el); else coverRefs.current.delete(view.id); }}
              image={view.image}
              markers={view.markers}
              clientName={clientName}
              viewIndex={index + 1}
              totalViews={projectViews.length}
            />
          </div>
        ))}
        {savedArts.map((art) => (
          <div key={art.id} style={{ marginBottom: '100px' }}>
            <ArtPreview
              art={art}
              ref={(el) => { if (el) artRefs.current.set(art.id, el); else artRefs.current.delete(art.id); }}
            />
          </div>
        ))}
      </div>

    </div>
  );
}
