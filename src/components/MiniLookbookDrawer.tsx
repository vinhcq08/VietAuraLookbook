import React, { useState, useRef, useMemo } from 'react';
import { Bookmark, Check, Plus, Search, X } from 'lucide-react';
import { LookbookCardData, HERITAGE_IMAGES } from '../data/vietPhucData';
import { ResilientImage } from './ResilientImage';

interface MiniLookbookDrawerProps {
  lookbooks: LookbookCardData[];
  savedIds: string[];
  onApplyCard: (card: LookbookCardData) => void;
  onToggleSave: (card: LookbookCardData) => void;
  onClose: () => void;
  title?: string;
  onSaveCurrentOutfit?: () => void;
  isCurrentSaved?: boolean;
}

export const MiniLookbookDrawer: React.FC<MiniLookbookDrawerProps> = ({
  lookbooks,
  savedIds,
  onApplyCard,
  onToggleSave,
  onClose,
  title = 'Bộ sưu tập',
  onSaveCurrentOutfit,
  isCurrentSaved = false,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [justSavedCurrent, setJustSavedCurrent] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return lookbooks;
    return lookbooks.filter(
      (card) =>
        card.outfitName.toLowerCase().includes(q) ||
        card.mainGarment.toLowerCase().includes(q) ||
        card.accessories.some((a) => a.toLowerCase().includes(q)) ||
        card.palette.some((p) => p.name.toLowerCase().includes(q))
    );
  }, [lookbooks, searchQuery]);

  const handleSaveCurrent = () => {
    if (!onSaveCurrentOutfit) return;
    onSaveCurrentOutfit();
    setJustSavedCurrent(true);
    setTimeout(() => setJustSavedCurrent(false), 2000);
  };

  const handleToggleSearch = () => {
    setSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 40);
      } else {
        setSearchQuery('');
      }
      return next;
    });
  };

  const getCardThumb = (card: LookbookCardData) => {
    if (card.imageUrl) return card.imageUrl;
    if (card.garmentId === 'ao-nhat-binh') return HERITAGE_IMAGES.model2DNuNhatBinh;
    if (card.garmentId === 'ao-tu-than') return HERITAGE_IMAGES.model2DNuTuThan;
    if (card.garmentId === 'ao-dai-ba-ba') return HERITAGE_IMAGES.model2DNuBaBa;
    return HERITAGE_IMAGES.model2DNuNguThan;
  };

  return (
    <div className="p-4 bg-white rounded-2xl border border-zinc-200 space-y-3 text-xs">
      {/* Minimalist Header: Only "Lưu Bộ sưu tập" button and "Tìm kiếm" button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-zinc-950">{title}</span>
          <span className="text-zinc-400 font-mono-tabular">({filtered.length})</span>
        </div>

        <div className="flex items-center gap-2">
          {onSaveCurrentOutfit && (
            <button
              type="button"
              onClick={handleSaveCurrent}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isCurrentSaved || justSavedCurrent
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
              title="Lưu bộ phối hiện tại vào Bộ sưu tập"
            >
              {isCurrentSaved || justSavedCurrent ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã lưu Bộ sưu tập</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Lưu Bộ sưu tập</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleSearch}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              searchOpen || searchQuery
                ? 'bg-zinc-950 text-white border-zinc-950'
                : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50'
            }`}
            title="Tìm kiếm trong Bộ sưu tập"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tìm kiếm</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Đóng"
            className="p-1.5 text-zinc-400 hover:text-zinc-950 rounded-lg hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Search Input Bar */}
      {searchOpen && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nhập tên trang phục, chất liệu hoặc sắc màu..."
            className="w-full pl-8 pr-8 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-950"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Minimalist Outfit Grid */}
      {filtered.length === 0 ? (
        <div className="py-6 text-center text-zinc-400">
          Không tìm thấy bộ trang phục phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
          {filtered.map((card) => {
            const isSaved = savedIds.includes(card.id);

            return (
              <div
                key={card.id}
                className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 flex items-center justify-between gap-2.5 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onApplyCard(card)}
                  title="Chạm để thử bộ trang phục này"
                  className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer"
                >
                  <div className="w-11 h-14 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 shrink-0">
                    <ResilientImage
                      src={getCardThumb(card)}
                      alt={card.outfitName}
                      fallbackTitle={card.outfitName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-zinc-950 truncate">{card.outfitName}</h5>
                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                      {card.mainGarment}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {card.palette.slice(0, 3).map((sw, idx) => (
                        <span
                          key={`${sw.hex}-${idx}`}
                          title={`${sw.name} (${sw.hex})`}
                          className="w-2.5 h-2.5 rounded-full border border-zinc-300"
                          style={{ backgroundColor: sw.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleSave(card)}
                  title={isSaved ? 'Đã lưu trong Bộ sưu tập' : 'Lưu vào Bộ sưu tập'}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold shrink-0 transition-colors cursor-pointer ${
                    isSaved
                      ? 'bg-zinc-950 border-zinc-950 text-white'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Đã lưu' : 'Lưu'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
