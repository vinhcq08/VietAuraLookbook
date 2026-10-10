import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  QrCode,
  Link2,
  Columns2,
  Code2,
  Smartphone,
  Globe,
  RotateCw,
  Wand2,
  ShieldCheck,
  AlertTriangle,
  Box,
  Loader2,
  MapPin,
  Navigation,
} from 'lucide-react';
import {
  StudioSelection,
  LookbookCardData,
  LookbookExportSchema,
  LookbookComparisonResult,
  DeepLinkPayload,
  HERITAGE_GARMENTS,
  HERITAGE_MAP_SITES,
  POETIC_OUTFIT_TITLES,
  buildLookbookExportFromSelection,
  compareTwoLookbooksLocal,
  get2DModelImageForSelection,
  getGenderAwareGarmentInfo,
} from '../data/vietPhucData';
import { ResilientImage } from './ResilientImage';

interface LookbookStudioModalProps {
  isOpen: boolean;
  initialTab?: 'export' | 'compare';
  selection: StudioSelection;
  customPrimaryHex?: string | null;
  allLookbooks: LookbookCardData[];
  initialCompareIds?: [string, string];
  onClose: () => void;
  onApplyCardToStudio: (card: LookbookCardData) => void;
  onApplyDeepLinkPayload: (payload: DeepLinkPayload, mode: 'app-installed' | 'web-preview') => void;
}

type SocialRatioPreset = '9:16' | '1:1' | '4:5';

export const LookbookStudioModal: React.FC<LookbookStudioModalProps> = ({
  isOpen,
  initialTab = 'export',
  selection,
  customPrimaryHex,
  allLookbooks,
  initialCompareIds,
  onClose,
  onApplyCardToStudio,
  onApplyDeepLinkPayload,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'compare'>(initialTab);
  const [ratioPreset, setRatioPreset] = useState<SocialRatioPreset>('9:16');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [locationQuery, setLocationQuery] = useState<string>(
    'Văn Miếu - Quốc Tử Giám, Hà Nội'
  );
  const [exportPackage, setExportPackage] = useState<LookbookExportSchema>(() =>
    buildLookbookExportFromSelection(
      selection,
      customPrimaryHex,
      undefined,
      'Văn Miếu - Quốc Tử Giám, Hà Nội'
    )
  );
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [dualRoutingMode, setDualRoutingMode] = useState<'app-installed' | 'web-preview'>(
    'app-installed'
  );
  const [webPreviewAngle, setWebPreviewAngle] = useState<number>(0);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Comparison Engine State
  const [outfitAId, setOutfitAId] = useState<string>(
    initialCompareIds?.[0] || allLookbooks[0]?.id || 'lb-khue-van-tri-thuc'
  );
  const [outfitBId, setOutfitBId] = useState<string>(
    initialCompareIds?.[1] || allLookbooks[1]?.id || 'lb-chu-sa-ngu-uyen'
  );
  const [compareContext, setCompareContext] = useState<string>(
    'Lễ tốt nghiệp & Chụp ảnh di tích'
  );
  const [comparisonData, setComparisonData] = useState<LookbookComparisonResult | null>(null);
  const [isComparingAI, setIsComparingAI] = useState<boolean>(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (initialCompareIds && initialCompareIds[0] && initialCompareIds[1]) {
      setOutfitAId(initialCompareIds[0]);
      setOutfitBId(initialCompareIds[1]);
    }
  }, [initialCompareIds]);

  // Rebuild export package whenever Studio selection, custom title, or locationQuery changes
  useEffect(() => {
    const built = buildLookbookExportFromSelection(
      selection,
      customPrimaryHex,
      customTitle.trim() || undefined,
      locationQuery.trim() || 'Văn Miếu - Quốc Tử Giám, Hà Nội'
    );
    setExportPackage(built);
  }, [selection, customPrimaryHex, customTitle, locationQuery]);

  // Compute local comparison immediately & enhance with AI
  useEffect(() => {
    const cardA = allLookbooks.find((c) => c.id === outfitAId) || allLookbooks[0];
    const cardB =
      allLookbooks.find((c) => c.id === outfitBId) || allLookbooks[1] || allLookbooks[0];
    if (!cardA || !cardB) return;

    const localComp = compareTwoLookbooksLocal(cardA, cardB, compareContext);
    setComparisonData(localComp);
  }, [outfitAId, outfitBId, compareContext, allLookbooks]);

  if (!isOpen) return null;

  const activeGarment = getGenderAwareGarmentInfo(selection.garmentId, selection.gender);
  const model2D = get2DModelImageForSelection(selection.gender, selection.garmentId, 'studio');
  const titlePresets =
    POETIC_OUTFIT_TITLES[selection.garmentId] || POETIC_OUTFIT_TITLES['ao-ngu-than'];

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Trigger AI Outfit Title Engine + Palette Extractor + Culture Micro-Card
  const handleGenerateAIPackage = async () => {
    setIsGeneratingAI(true);
    try {
      const basePkg = buildLookbookExportFromSelection(selection, customPrimaryHex);
      const res = await fetch('/api/lookbook/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePackage: basePkg,
          garmentName: activeGarment.name,
          gender: selection.gender,
          primaryHex: basePkg.outfit_details.primary_color,
          secondaryHex: basePkg.outfit_details.secondary_color,
          accentHex: basePkg.outfit_details.accent_color,
          accessories: basePkg.outfit_details.accessories_list,
          contextLabel: basePkg.context_recommended,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCustomTitle(data.title || basePkg.title);
        setExportPackage((prev) => ({
          ...prev,
          title: data.title || prev.title,
          palette_colors: data.palette_colors || prev.palette_colors,
          cultural_note: data.cultural_note || prev.cultural_note,
        }));
      }
    } catch {
      // Fallback already populated
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Trigger AI Lookbook Comparison Advice
  const handleAskAIComparison = async () => {
    if (!comparisonData) return;
    setIsComparingAI(true);
    try {
      const res = await fetch('/api/lookbook/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localComparison: comparisonData,
          userContext: compareContext,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setComparisonData(data);
      }
    } catch {
      // Keep local comparison
    } finally {
      setIsComparingAI(false);
    }
  };

  // Download High-Res Social Canvas PNG (9:16, 1:1, or 4:5)
  const handleDownloadSocialCanvasPNG = () => {
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = ratioPreset === '9:16' ? 1920 : ratioPreset === '4:5' ? 1350 : 1080;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#121215';
    ctx.fillRect(0, 0, width, height);

    // Top Accent Bar with Primary Color
    ctx.fillStyle = exportPackage.outfit_details.primary_color;
    ctx.fillRect(0, 0, width, 18);

    // Header Kicker
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '600 26px Inter, sans-serif';
    ctx.fillText(
      `VIETAURA · ${exportPackage.lookbook_id} · TỈ LỆ ${ratioPreset}`,
      64,
      86
    );

    // Outfit Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px Inter, sans-serif';
    ctx.fillText(exportPackage.title.slice(0, 34), 64, 162);

    // Garment & Context Subtitle
    ctx.fillStyle = '#D4D4D8';
    ctx.font = '500 28px Inter, sans-serif';
    ctx.fillText(exportPackage.outfit_details.type.slice(0, 58), 64, 214);
    ctx.fillStyle = '#60A5FA';
    ctx.fillText(`Bối cảnh: ${exportPackage.context_recommended}`, 64, 258);

    // Palette Swatches Box
    const swatchTop = 310;
    exportPackage.palette_colors.forEach((sw, idx) => {
      const x = 64 + idx * 320;
      ctx.fillStyle = '#1F1F23';
      ctx.fillRect(x, swatchTop, 300, 110);
      ctx.fillStyle = sw.hex;
      ctx.fillRect(x + 18, swatchTop + 20, 70, 70);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillText(sw.name.slice(0, 16), x + 104, swatchTop + 52);
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '500 22px JetBrains Mono, monospace';
      ctx.fillText(sw.hex, x + 104, swatchTop + 84);
    });

    // Cultural Micro-Card Box
    const noteTop = swatchTop + 150;
    ctx.fillStyle = '#18181B';
    ctx.fillRect(64, noteTop, width - 128, 220);
    ctx.fillStyle = '#34D399';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText('THÔNG ĐIỆP VĂN HÓA & PHỤ KIỆN ĐI KÈM', 92, noteTop + 48);

    ctx.fillStyle = '#E4E4E7';
    ctx.font = '400 25px Inter, sans-serif';
    const words = exportPackage.cultural_note.split(' ');
    let line = '';
    let y = noteTop + 94;
    for (const w of words) {
      const test = line + w + ' ';
      if (ctx.measureText(test).width > width - 190) {
        ctx.fillText(line, 92, y);
        line = w + ' ';
        y += 38;
        if (y > noteTop + 175) break;
      } else {
        line = test;
      }
    }
    if (line && y <= noteTop + 175) ctx.fillText(line, 92, y);

    ctx.fillStyle = '#A1A1AA';
    ctx.font = '500 23px Inter, sans-serif';
    ctx.fillText(
      `Phụ kiện: ${exportPackage.outfit_details.accessories_list.join(' · ')}`,
      92,
      noteTop + 198
    );

    // Deep Link Footer
    const footerY = height - 120;
    ctx.fillStyle = '#27272A';
    ctx.fillRect(64, footerY, width - 128, 76);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 23px JetBrains Mono, monospace';
    ctx.fillText(
      `Deep Link: https://vietphuclookbook.app/look/${exportPackage.lookbook_id}`,
      92,
      footerY + 46
    );

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `VietPhuc-Lookbook-${exportPackage.lookbook_id}-${ratioPreset.replace(':', 'x')}.png`;
    a.click();
  };

  // Strictly formatted JSON Output matching Section III schema
  const strictJsonOutput = {
    lookbook_id: exportPackage.lookbook_id,
    title: exportPackage.title,
    creator_info: exportPackage.creator_info,
    outfit_details: exportPackage.outfit_details,
    palette_colors: exportPackage.palette_colors.map((c) => ({
      hex: c.hex,
      name: c.name,
    })),
    cultural_note: exportPackage.cultural_note,
    context_recommended: exportPackage.context_recommended,
    sharing_links: {
      deep_link: `https://vietphuclookbook.app/look/${exportPackage.lookbook_id}`,
      web_preview_url: `https://vietphuclookbook.app/preview/${exportPackage.lookbook_id}`,
      qr_code_url: exportPackage.sharing_links.qr_code_url,
    },
    social_export_presets: {
      story_9_16_ratio: exportPackage.social_export_presets.story_9_16_ratio,
      post_1_1_ratio: exportPackage.social_export_presets.post_1_1_ratio,
    },
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white border border-zinc-200 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header + Mode Switcher Tabs */}
        <div className="px-5 py-3.5 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-zinc-200/80 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('export')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'export'
                    ? 'bg-zinc-950 text-white shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Xuất Lookbook &amp; Deep Link</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('compare')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'compare'
                    ? 'bg-zinc-950 text-white shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>So sánh Lookbook</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'export' ? (
            /* =================================================================
               TAB 1: LOOKBOOK CARD GENERATOR & DEEP LINK ENGINE
               ================================================================= */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT 5 COLUMNS: Live Social Canvas Preview (9:16 | 1:1 | 4:5) */}
              <div className="lg:col-span-5 flex flex-col items-center space-y-3">
                {/* 4. Social Canvas Ratio Selector */}
                <div className="w-full flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-zinc-700">
                    Khung hình:
                  </span>
                  <div className="inline-flex items-center gap-1 p-1 bg-zinc-100 rounded-xl">
                    {(
                      [
                        { id: '9:16', label: '9:16 Story' },
                        { id: '1:1', label: '1:1 Vuông' },
                        { id: '4:5', label: '4:5 Dọc' },
                      ] as const
                    ).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRatioPreset(r.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                          ratioPreset === r.id
                            ? 'bg-zinc-950 text-white'
                            : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Visual Lookbook Card Frame */}
                <div
                  className={`w-full max-w-[350px] bg-zinc-950 text-white rounded-2xl overflow-hidden border border-zinc-800 shadow-xl flex flex-col justify-between transition-all ${
                    ratioPreset === '9:16'
                      ? 'min-h-[540px]'
                      : ratioPreset === '4:5'
                      ? 'min-h-[450px]'
                      : 'min-h-[380px]'
                  }`}
                >
                  {/* Top Color Strip */}
                  <div
                    className="h-2 w-full"
                    style={{ backgroundColor: exportPackage.outfit_details.primary_color }}
                  />

                  {/* Visual Stage: 2D Garment + 2D Model + QR */}
                  <div className="relative flex-1 min-h-[210px] bg-zinc-900 overflow-hidden flex items-center justify-center p-3 gap-2">
                    <ResilientImage
                      src={model2D.garment2DUrl}
                      alt={activeGarment.name}
                      className="w-1/2 h-48 object-cover rounded-xl border border-white/10"
                    />
                    <ResilientImage
                      src={model2D.studioUrl}
                      alt={exportPackage.title}
                      className="w-1/2 h-48 object-cover rounded-xl border border-white/10"
                    />
                    <div className="absolute top-2.5 left-3 px-2 py-0.5 rounded-md bg-zinc-950/85 backdrop-blur-xs border border-white/15 text-[10px] font-mono-tabular text-zinc-200">
                      {exportPackage.lookbook_id} · {ratioPreset}
                    </div>
                  </div>

                  {/* Packaged Card Details */}
                  <div className="p-4 space-y-3 bg-zinc-950">
                    <div>
                      <div className="text-[10px] text-blue-400 font-medium">
                        {exportPackage.context_recommended}
                      </div>
                      <h3 className="text-base font-bold tracking-tight text-white mt-0.5">
                        {exportPackage.title}
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                        {exportPackage.outfit_details.type}
                      </p>
                    </div>

                    {/* Extracted HEX Swatches */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {exportPackage.palette_colors.map((sw, i) => (
                        <div
                          key={`${sw.hex}-${i}`}
                          className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 flex items-center gap-1.5"
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-white/30 shrink-0"
                            style={{ backgroundColor: sw.hex }}
                          />
                          <div className="min-w-0">
                            <div className="text-[10px] font-semibold text-zinc-100 truncate">
                              {sw.name}
                            </div>
                            <div className="text-[9px] font-mono-tabular text-zinc-400">
                              {sw.hex}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Culture Micro-Card (1-2 sentences) */}
                    <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-3 bg-zinc-900/90 p-2.5 rounded-xl border border-white/10">
                      {exportPackage.cultural_note}
                    </p>

                    {/* Footer with Creator & QR */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-[10px] text-zinc-400">
                      <div className="truncate">
                        <span className="text-zinc-200 font-semibold">
                          {exportPackage.creator_info.username}
                        </span>{' '}
                        · Phụ kiện: {exportPackage.outfit_details.accessories_list.join(', ')}
                      </div>
                      <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Download PNG Button */}
                <button
                  type="button"
                  onClick={handleDownloadSocialCanvasPNG}
                  className="w-full max-w-[350px] py-2.5 px-4 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Tải thẻ Lookbook PNG ({ratioPreset})</span>
                </button>
              </div>

              {/* RIGHT 7 COLUMNS: 4-Step Packaging Controls + Deep Link Engine + Dual Routing + JSON Output */}
              <div className="lg:col-span-7 space-y-4">
                {/* Step 1, 2, 3 Packaging Summary & AI Title Generator */}
                <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-950">
                        1. Tên bộ phối &amp; Thông điệp
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateAIPackage}
                      disabled={isGeneratingAI}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      )}
                      <span>Gợi ý bằng AI</span>
                    </button>
                  </div>

                  {/* Custom Title Input + East Asian Preset Chips */}
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={customTitle || exportPackage.title}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Nhập tên bộ phối Đông Phương..."
                      className="w-full px-3 py-2 text-xs font-semibold bg-white border border-zinc-200 rounded-xl text-zinc-950 focus:outline-none focus:border-zinc-900"
                    />
                    <div className="flex flex-wrap items-center gap-1.5">
                      {titlePresets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setCustomTitle(preset)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Tagging via Search Query (Google Maps Lite) */}
                  <div className="pt-2 border-t border-zinc-200/70 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-zinc-800 inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                        <span>Gắn thẻ Địa điểm Di tích (Google Maps Lite):</span>
                      </label>
                      {exportPackage.maps_integration_lite && (
                        <div className="flex items-center gap-2">
                          <a
                            href={exportPackage.maps_integration_lite.direct_google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Mở Maps</span>
                          </a>
                          <span className="text-zinc-300">·</span>
                          <a
                            href={exportPackage.maps_integration_lite.directions_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-emerald-700 hover:underline inline-flex items-center gap-0.5"
                          >
                            <Navigation className="w-2.5 h-2.5" />
                            <span>Chỉ đường</span>
                          </a>
                        </div>
                      )}
                    </div>
                    <select
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-900"
                    >
                      {HERITAGE_MAP_SITES.map((s) => (
                        <option key={s.id} value={s.location_query}>
                          📍 {s.location_query} ({s.regionLabel})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section II: Deep Link Engine & Lightweight Payload */}
                <div className="p-4 rounded-2xl border border-zinc-200 bg-white space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-bold text-zinc-950">
                        2. Liên kết chia sẻ nhanh
                      </h4>
                    </div>
                  </div>

                  {/* Shareable Links */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                      <div className="min-w-0">
                        <span className="block text-[10px] text-zinc-400 font-semibold">
                          Deep Link:
                        </span>
                        <span className="font-mono-tabular text-zinc-800 truncate block">
                          {`https://vietphuclookbook.app/look/${exportPackage.lookbook_id}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            'deep-link',
                            `https://vietphuclookbook.app/look/${exportPackage.lookbook_id}`
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-950 text-white text-[11px] font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedKey === 'deep-link' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Chép Link</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                      <div className="min-w-0">
                        <span className="block text-[10px] text-zinc-400 font-semibold">
                          Web Preview URL:
                        </span>
                        <span className="font-mono-tabular text-zinc-800 truncate block">
                          {`https://vietphuclookbook.app/preview/${exportPackage.lookbook_id}`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            'web-link',
                            `https://vietphuclookbook.app/preview/${exportPackage.lookbook_id}`
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-100 text-[11px] font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {copiedKey === 'web-link' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Chép Preview</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Encoded Payload Parameters (Only shown when technical details expanded) */}
                  {showRawJson && exportPackage.encoded_payload && (
                    <div className="p-2.5 rounded-xl bg-zinc-950 text-zinc-200 text-[11px] font-mono-tabular space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>Tham số Mã hóa trong Link (Payload Parameters):</span>
                        <span>creator_id: {exportPackage.encoded_payload.creator_id}</span>
                      </div>
                      <div className="text-emerald-400 truncate">
                        base_outfit: "{exportPackage.encoded_payload.base_outfit}" · context: "
                        {exportPackage.encoded_payload.context}" · accessories: [
                        {exportPackage.encoded_payload.accessories.join(', ')}]
                      </div>
                    </div>
                  )}

                  {/* Dual Routing Rule Simulator (Đã cài App vs Chưa cài App) */}
                  <div className="pt-2 border-t border-zinc-100 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-zinc-900">
                        Chế độ mở link của người nhận:
                      </span>
                      <div className="inline-flex items-center gap-1 p-1 bg-zinc-100 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setDualRoutingMode('app-installed')}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                            dualRoutingMode === 'app-installed'
                              ? 'bg-white text-zinc-950 shadow-2xs'
                              : 'text-zinc-600 hover:text-zinc-950'
                          }`}
                        >
                          <Smartphone className="w-3 h-3 text-emerald-600" />
                          <span>Đã có App</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDualRoutingMode('web-preview')}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                            dualRoutingMode === 'web-preview'
                              ? 'bg-white text-zinc-950 shadow-2xs'
                              : 'text-zinc-600 hover:text-zinc-950'
                          }`}
                        >
                          <Globe className="w-3 h-3 text-blue-600" />
                          <span>Xem trên Web 360°</span>
                        </button>
                      </div>
                    </div>

                    {dualRoutingMode === 'app-installed' ? (
                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="font-bold text-emerald-950">
                          Điều hướng In-App · Magic Re-Fit
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (exportPackage.encoded_payload) {
                              onApplyDeepLinkPayload(
                                exportPackage.encoded_payload,
                                'app-installed'
                              );
                            }
                            onClose();
                          }}
                          className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Thử bộ này lên Avatar của tôi</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-2.5 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-bold text-blue-950">
                            Web Preview 360°
                          </div>
                          <button
                            type="button"
                            onClick={() => setWebPreviewAngle((a) => (a + 45) % 360)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Xoay 360° ({webPreviewAngle}°)</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <span className="text-[11px] font-mono-tabular text-blue-800">
                            Góc nhìn: {webPreviewAngle}°
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (exportPackage.encoded_payload) {
                                onApplyDeepLinkPayload(
                                  exportPackage.encoded_payload,
                                  'web-preview'
                                );
                              }
                              onClose();
                            }}
                            className="px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                          >
                            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                            <span>Tải App để thử lên vóc dáng thực</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section III: Mandatory JSON Output Schema (Hidden behind expand button by default) */}
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 overflow-hidden">
                  <div className="px-4 py-2.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRawJson((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 cursor-pointer"
                    >
                      <Code2 className="w-4 h-4 text-zinc-700" />
                      <span>
                        Chi tiết kỹ thuật &amp; Mã dữ liệu JSON ({showRawJson ? 'Thu' : 'Mở rộng'})
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopy('json-schema', JSON.stringify(strictJsonOutput, null, 2))
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-[11px] font-semibold text-zinc-800 hover:bg-zinc-100 cursor-pointer"
                    >
                      {copiedKey === 'json-schema' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Đã chép JSON</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Chép JSON</span>
                        </>
                      )}
                    </button>
                  </div>

                  {showRawJson && (
                    <pre className="p-4 bg-zinc-950 text-zinc-100 text-[11px] font-mono-tabular overflow-x-auto max-h-60 leading-relaxed border-t border-zinc-800">
                      {JSON.stringify(strictJsonOutput, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* =================================================================
               TAB 2: TÍNH NĂNG SO SÁNH LOOKBOOK (MINIMALIST PRACTICAL COMPARISON)
               ================================================================= */
            <div className="space-y-4">
              {comparisonData && (
                <>
                  {/* Hộp Bộ A & Hộp Bộ B: Chỉ hiển thị thông tin liên quan đến trang phục */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(
                      [
                        {
                          label: 'Bộ A',
                          selectedId: outfitAId,
                          onSelect: setOutfitAId,
                          data: comparisonData.outfit_a,
                        },
                        {
                          label: 'Bộ B',
                          selectedId: outfitBId,
                          onSelect: setOutfitBId,
                          data: comparisonData.outfit_b,
                        },
                      ] as const
                    ).map((box) => (
                      <div
                        key={box.label}
                        className="p-4 rounded-2xl border border-zinc-200 bg-white space-y-3"
                      >
                        {/* Outfit Selector Header inside Box A / Box B */}
                        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-100">
                          <span className="text-xs font-bold text-zinc-950 shrink-0">
                            {box.label}
                          </span>
                          <select
                            value={box.selectedId}
                            onChange={(e) => box.onSelect(e.target.value)}
                            aria-label={`Chọn trang phục ${box.label}`}
                            className="flex-1 max-w-[260px] px-2.5 py-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-zinc-950"
                          >
                            {allLookbooks.map((lb) => (
                              <option key={lb.id} value={lb.id}>
                                {lb.outfitName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Pure Garment Information Only */}
                        <div className="flex items-start gap-3.5">
                          <img
                            src={box.data.imageUrl}
                            alt={box.data.title}
                            referrerPolicy="no-referrer"
                            className="w-16 h-22 rounded-xl object-cover border border-zinc-200 bg-zinc-100 shrink-0"
                          />
                          <div className="min-w-0 flex-1 space-y-1.5 text-xs">
                            <div>
                              <span className="text-[11px] font-medium text-zinc-500">
                                {box.data.garmentCategory}
                              </span>
                              <h4 className="text-sm font-bold text-zinc-950 truncate">
                                {box.data.title}
                              </h4>
                            </div>

                            <p className="text-zinc-600 leading-relaxed">
                              {box.data.mainGarment}
                            </p>

                            <p className="text-[11px] text-zinc-500">
                              <strong className="font-semibold text-zinc-800">Phụ kiện: </strong>
                              {box.data.accessories.join(' · ')}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                              {box.data.palette.map((sw, i) => (
                                <span
                                  key={`${sw.hex}-${i}`}
                                  className="inline-flex items-center gap-1 text-[11px] text-zinc-600"
                                >
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-zinc-300"
                                    style={{ backgroundColor: sw.hex }}
                                  />
                                  <span>{sw.name}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bảng So Sánh Ưu Tiên Các Tiêu Chí Thực Tiễn */}
                  <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                    <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-zinc-950">
                        Bảng đối chiếu tiêu chí thực tiễn
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-500">Nhu cầu:</span>
                        <select
                          value={compareContext}
                          onChange={(e) => setCompareContext(e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-900 focus:outline-none"
                        >
                          <option value="Lễ tốt nghiệp & Chụp ảnh di tích">
                            Lễ tốt nghiệp &amp; Di tích
                          </option>
                          <option value="Lễ cưới hỏi truyền thống">Lễ cưới truyền thống</option>
                          <option value="Đi chùa & Trảy hội mùa xuân">
                            Đi chùa &amp; Hội xuân
                          </option>
                          <option value="Dạo phố & Chụp ảnh ngoại cảnh">
                            Dạo phố &amp; Ngoại cảnh
                          </option>
                        </select>
                        <button
                          type="button"
                          onClick={handleAskAIComparison}
                          disabled={isComparingAI}
                          className="px-2.5 py-1 rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                          title="Phân tích thực tiễn bằng AI"
                        >
                          {isComparingAI ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          <span>Gợi ý AI</span>
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-zinc-200 text-zinc-500 bg-white">
                            <th className="py-2.5 px-4 font-semibold w-[24%]">Tiêu chí thực tiễn</th>
                            <th className="py-2.5 px-4 font-semibold w-[38%] text-zinc-900">
                              Bộ A · {comparisonData.outfit_a.title}
                            </th>
                            <th className="py-2.5 px-4 font-semibold w-[38%] text-zinc-900">
                              Bộ B · {comparisonData.outfit_b.title}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {comparisonData.criteria_rows.map((row) => (
                            <tr key={row.criterion} className="hover:bg-zinc-50/50">
                              <td className="py-3 px-4 font-semibold text-zinc-900 align-top">
                                {row.criterion}
                              </td>
                              <td className="py-3 px-4 text-zinc-700 leading-relaxed align-top font-mono-tabular">
                                {row.outfit_a_value}
                              </td>
                              <td className="py-3 px-4 text-zinc-700 leading-relaxed align-top font-mono-tabular">
                                {row.outfit_b_value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Minimalist Practical Recommendation Summary */}
                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 leading-relaxed">
                    <strong className="text-zinc-950">Nhận định thực tiễn: </strong>
                    {comparisonData.ai_short_advice}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
