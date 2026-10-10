import React, { useState } from 'react';
import {
  Check,
  Copy,
  Bookmark,
  Box,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { LookbookCardData } from '../data/vietPhucData';

interface LookbookCardViewProps {
  card: LookbookCardData;
  onApplyToStudio?: (card: LookbookCardData) => void;
  onSaveLookbook?: (card: LookbookCardData) => void;
  isSaved?: boolean;
  compact?: boolean;
}

export const LookbookCardView: React.FC<LookbookCardViewProps> = ({
  card,
  onApplyToStudio,
  onSaveLookbook,
  isSaved = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(Boolean(card.hasViolation));

  const handleCopyFormatted = () => {
    const paletteText = card.palette.map((p) => `${p.name} (${p.hex})`).join(' - ');
    const formatted = [
      `LOOKBOOK: "${card.outfitName.toUpperCase()}"`,
      `Trang phục chính: ${card.mainGarment}`,
      `Phụ kiện đi kèm: ${card.accessories.join(', ')}.`,
      `Bảng màu (Palette): ${paletteText}`,
      `Bối cảnh phù hợp: ${card.occasionAndWeather}`,
      `Ý nghĩa văn hóa: ${card.culturalMeaning}`,
      `Lưu ý văn hóa (Culture Guard): ${card.cultureGuardNote}`,
    ].join('\n');

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="bg-white border border-zinc-200/90 rounded-2xl p-4 transition-colors space-y-3">
      {/* Top Row: Title + Swatches + Embedded Action Icons */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            {card.hasViolation ? (
              <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Cảnh báo</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Chuẩn điển chế</span>
              </span>
            )}
            <span>·</span>
            <span className="truncate">{card.occasionAndWeather.split('·')[0].trim()}</span>
          </div>

          <h3 className="text-base font-bold tracking-tight text-zinc-950 mt-0.5 truncate">
            {card.outfitName}
          </h3>
        </div>

        {/* Swatches + Action Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center -space-x-1 mr-1">
            {card.palette.map((swatch, index) => (
              <span
                key={`${swatch.hex}-${index}`}
                className="w-4 h-4 rounded-full border border-white ring-1 ring-zinc-200 block"
                style={{ backgroundColor: swatch.hex }}
                title={`${swatch.name} (${swatch.hex})`}
              />
            ))}
          </div>

          {onApplyToStudio && (
            <button
              type="button"
              onClick={() => onApplyToStudio(card)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Đưa bộ phối này vào Phòng thử"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Phòng thử</span>
            </button>
          )}

          {onSaveLookbook && (
            <button
              type="button"
              onClick={() => onSaveLookbook(card)}
              title={isSaved ? 'Đã lưu' : 'Lưu vào Bộ sưu tập'}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-950'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emerald-600' : ''}`} />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyFormatted}
            title="Sao chép thông tin bộ phối"
            className="p-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Garment 2-Line Summary */}
      <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">{card.mainGarment}</p>

      {/* Single Minimalist Extend Toggle for Accessories, Meaning & Culture Guard */}
      <div className="pt-2 border-t border-zinc-100">
        <button
          type="button"
          onClick={() => setDetailsOpen((prev) => !prev)}
          aria-expanded={detailsOpen}
          className="w-full flex items-center justify-between text-xs font-medium text-zinc-500 hover:text-zinc-950 transition-colors cursor-pointer"
        >
          <span>
            Phụ kiện ({card.accessories.length}) · Ý nghĩa văn hóa &amp; Lưu ý
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              detailsOpen ? 'rotate-180 text-zinc-950' : ''
            }`}
          />
        </button>

        {detailsOpen && (
          <div className="mt-2.5 pt-2.5 border-t border-zinc-100 space-y-2 text-xs text-zinc-600 leading-relaxed">
            <div className="flex flex-wrap gap-1">
              {card.accessories.map((acc) => (
                <span
                  key={acc}
                  className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[11px] font-medium"
                >
                  {acc}
                </span>
              ))}
            </div>
            <p>
              <strong className="text-zinc-900">Ý nghĩa: </strong>
              {card.culturalMeaning}
            </p>
            <p className={card.hasViolation ? 'text-rose-700 font-medium' : 'text-zinc-500'}>
              <strong className={card.hasViolation ? 'text-rose-700' : 'text-zinc-800'}>
                Culture Guard:{' '}
              </strong>
              {card.cultureGuardNote}
            </p>
          </div>
        )}
      </div>
    </article>
  );
};
