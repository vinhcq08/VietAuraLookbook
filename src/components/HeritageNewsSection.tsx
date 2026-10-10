import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Box,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  Bookmark,
  Bell,
  BellRing,
  X,
  ShoppingBag,
} from 'lucide-react';
import {
  HERITAGE_NEWS_ARTICLES,
  UPCOMING_HERITAGE_EVENTS,
  HeritageNewsCategory,
  UpcomingHeritageEvent,
  OutfitConfigCode,
  OmnichannelPointEntry,
  get2DModelImageForSelection,
} from '../data/vietPhucData';
import { ResilientImage } from './ResilientImage';

interface HeritageNewsSectionProps {
  onApplyOutfitConfigToStudio: (config: OutfitConfigCode) => void;
  onAskAdvisorWithPrompt: (promptText: string) => void;
  onAwardOmnichannelPoints?: (entry: Omit<OmnichannelPointEntry, 'id' | 'timestamp'>) => void;
  onSelectHeritageOnMap?: (locationQueryOrHeritageId: string) => void;
  externalSavedEventIds?: string[];
  onToggleSaveEventExternal?: (eventId: string) => void;
  externalSavedArticleIds?: string[];
  onToggleSaveArticleExternal?: (articleId: string) => void;
}

const SAVED_EVENTS_STORAGE_KEY = 'viet_phuc_saved_events';
const SAVED_ARTICLES_STORAGE_KEY = 'viet_phuc_saved_articles';

export const HeritageNewsSection: React.FC<HeritageNewsSectionProps> = ({
  onApplyOutfitConfigToStudio,
  onAskAdvisorWithPrompt,
  onAwardOmnichannelPoints,
  onSelectHeritageOnMap,
  externalSavedEventIds,
  onToggleSaveEventExternal,
  externalSavedArticleIds,
  onToggleSaveArticleExternal,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | HeritageNewsCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(
    HERITAGE_NEWS_ARTICLES[0]?.id || null
  );
  const [eventsTab, setEventsTab] = useState<'upcoming' | 'saved'>('upcoming');

  // Saved Events State (Single Source synced with App / UserAccountMenu)
  const [internalSavedEventIds, setInternalSavedEventIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_EVENTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return ['evt-bach-hoa-thu-2026'];
  });

  // Saved Articles State (Single Source synced with App / UserAccountMenu)
  const [internalSavedArticleIds, setInternalSavedArticleIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_ARTICLES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return ['news-le-hoi-den-hung-2026', 'news-toc-viet-co-phuc-2026'];
  });

  const savedEventIds = externalSavedEventIds ?? internalSavedEventIds;
  const savedArticleIds = externalSavedArticleIds ?? internalSavedArticleIds;

  // Push Notification Simulation State
  const [pushEnabled, setPushEnabled] = useState<boolean>(true);
  const [remindBeforeDays, setRemindBeforeDays] = useState<1 | 3 | 7>(3);
  const [activePushEvent, setActivePushEvent] = useState<UpcomingHeritageEvent | null>(null);

  useEffect(() => {
    if (externalSavedEventIds !== undefined) return;
    try {
      localStorage.setItem(SAVED_EVENTS_STORAGE_KEY, JSON.stringify(internalSavedEventIds));
    } catch {
      // ignore storage errors
    }
  }, [internalSavedEventIds, externalSavedEventIds]);

  useEffect(() => {
    if (externalSavedArticleIds !== undefined) return;
    try {
      localStorage.setItem(SAVED_ARTICLES_STORAGE_KEY, JSON.stringify(internalSavedArticleIds));
    } catch {
      // ignore storage errors
    }
  }, [internalSavedArticleIds, externalSavedArticleIds]);

  const toggleSaveArticle = (articleId: string) => {
    if (onToggleSaveArticleExternal) {
      onToggleSaveArticleExternal(articleId);
      return;
    }
    setInternalSavedArticleIds((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [articleId, ...prev]
    );
  };

  const savedEvents = UPCOMING_HERITAGE_EVENTS.filter((evt) => savedEventIds.includes(evt.id));

  // Automatically trigger push notification simulation once when switching to 'saved' tab if enabled
  const triggerPushSimulation = (targetEvent?: UpcomingHeritageEvent) => {
    const evt = targetEvent || savedEvents[0] || UPCOMING_HERITAGE_EVENTS[0];
    if (!evt) return;
    setActivePushEvent(evt);

    // Optional Web Notification API if already granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`Sắp diễn ra: ${evt.title}`, {
          body: `Còn ${remindBeforeDays} ngày (${evt.dateLabel}). Hãy chuẩn bị bộ ${evt.dressCode} phù hợp nhé!`,
        });
      } catch {
        // ignore
      }
    }
  };

  const toggleSaveEvent = (eventId: string) => {
    const isCurrentlySaved = savedEventIds.includes(eventId);
    if (onToggleSaveEventExternal) {
      onToggleSaveEventExternal(eventId);
    } else {
      setInternalSavedEventIds((prev) =>
        isCurrentlySaved ? prev.filter((id) => id !== eventId) : [eventId, ...prev]
      );
    }
    if (!isCurrentlySaved) {
      const newlySaved = UPCOMING_HERITAGE_EVENTS.find((e) => e.id === eventId);
      if (newlySaved) {
        if (pushEnabled) {
          setActivePushEvent(newlySaved);
        }
        if (onAwardOmnichannelPoints) {
          onAwardOmnichannelPoints({
            source: 'CULTURAL_EVENT',
            sourceLabel: 'Sự kiện Văn hóa',
            description: `Lưu & đăng ký sự kiện "${newlySaved.title}" (+150 Điểm)`,
            points: 150,
          });
        }
      }
    }
  };

  const filteredArticles = HERITAGE_NEWS_ARTICLES.filter((article) => {
    const matchesCategory =
      activeCategory === 'all' ||
      (activeCategory === 'kham-pha'
        ? article.category === 'kham-pha' || article.category === 'tu-lieu'
        : article.category === activeCategory);
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      article.title.toLowerCase().includes(q) ||
      article.subtitle.toLowerCase().includes(q) ||
      article.relatedGarmentName.toLowerCase().includes(q) ||
      article.locationOrSource.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const featuredArticle =
    filteredArticles.find((a) => a.featured) || filteredArticles[0] || null;
  const remainingArticles = featuredArticle
    ? filteredArticles.filter((a) => a.id !== featuredArticle.id)
    : [];

  const toggleExpandArticle = (id: string) => {
    setExpandedArticleId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="tin-tuc-viet-phuc"
      className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-white border-t border-zinc-200 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Minimalist Section Header & Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950">
            Khám phá
          </h2>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm sự kiện, cổ phục, di tích..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors"
            />
          </div>
        </div>

        {/* Interactive Category Tabs (Merged 'Khám phá' & 'Tư liệu') */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-zinc-100 rounded-xl">
            {(
              [
                { id: 'all', label: 'Tất cả' },
                { id: 'su-kien', label: 'Sự kiện' },
                { id: 'kham-pha', label: 'Khám phá & Tư liệu' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-white text-zinc-950 font-semibold shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Editorial Layout: 8-Col News Stream + 4-Col "Sự kiện sắp tới" (2 Sub-Sections) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 8 COLUMNS: Featured Discovery / Event + News Articles */}
          <div className="lg:col-span-8 space-y-5">
            {/* Lead / Featured Story */}
            {featuredArticle && (
              <article className="bg-zinc-50/60 border border-zinc-200/90 rounded-2xl overflow-hidden transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-12">
                  <div className="md:col-span-5 relative min-h-[240px] md:min-h-full bg-zinc-900">
                    <ResilientImage
                      src={featuredArticle.imageUrl}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-3 bottom-3 px-2.5 py-1.5 rounded-xl bg-zinc-950/80 backdrop-blur-md border border-white/15 text-[11px] text-zinc-100 flex items-center justify-between gap-2">
                      <span className="truncate font-medium">
                        {featuredArticle.relatedGarmentName}
                      </span>
                      <span
                        className="w-3 h-3 rounded-full border border-white/40 shrink-0"
                        style={{ backgroundColor: featuredArticle.outfitConfig.outerHex }}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-zinc-900">
                            {featuredArticle.categoryLabel}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{featuredArticle.publishedDate}</span>
                          {featuredArticle.heritage_id && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="px-1.5 py-0.5 rounded bg-zinc-200/70 text-zinc-800 font-mono text-[10px] font-semibold">
                                #{featuredArticle.heritage_id}
                              </span>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSaveArticle(featuredArticle.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-colors cursor-pointer ${
                            savedArticleIds.includes(featuredArticle.id)
                              ? 'bg-zinc-950 border-zinc-950 text-white'
                              : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950'
                          }`}
                        >
                          <Bookmark
                            className={`w-3 h-3 ${
                              savedArticleIds.includes(featuredArticle.id) ? 'fill-current' : ''
                            }`}
                          />
                          <span>
                            {savedArticleIds.includes(featuredArticle.id) ? 'Đã lưu' : 'Lưu bài'}
                          </span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpandArticle(featuredArticle.id)}
                        title={`Nguồn: ${featuredArticle.locationOrSource} · Trang phục liên quan: ${featuredArticle.relatedGarmentName}`}
                        className="text-left group/ftitle cursor-pointer"
                      >
                        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 group-hover/ftitle:underline transition-colors leading-snug">
                          {featuredArticle.title}
                        </h3>
                      </button>

                      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                        {featuredArticle.subtitle}
                      </p>
                    </div>

                    {/* Festival Quick Summary (if traditional festival post) */}
                    {featuredArticle.festivalDetails && (
                      <div className="p-3 rounded-xl bg-white border border-zinc-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] font-semibold text-zinc-400 uppercase block">
                            Thời gian lễ hội
                          </span>
                          <span className="font-semibold text-zinc-900">
                            {featuredArticle.festivalDetails.lunarDate}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-zinc-400 uppercase block">
                            Không gian di sản
                          </span>
                          <span className="font-semibold text-zinc-900">
                            {featuredArticle.festivalDetails.location}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Expandable Full Article Content */}
                    {expandedArticleId === featuredArticle.id && (
                      <div className="pt-3 border-t border-zinc-200/80 space-y-3 text-xs text-zinc-700 leading-relaxed">
                        {featuredArticle.festivalDetails && (
                          <div className="bg-zinc-950 text-white rounded-xl p-3.5 space-y-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                              Hồ sơ Lễ hội Truyền thống
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-zinc-400">Thời gian: </span>
                                <span className="font-semibold text-white">
                                  {featuredArticle.festivalDetails.lunarDate}
                                </span>
                              </div>
                              <div>
                                <span className="text-zinc-400">Địa điểm: </span>
                                <span className="font-semibold text-white">
                                  {featuredArticle.festivalDetails.location}
                                </span>
                              </div>
                              <div className="sm:col-span-2">
                                <span className="text-zinc-400">Nghi thức chính: </span>
                                <span className="font-medium text-zinc-100">
                                  {featuredArticle.festivalDetails.mainRituals}
                                </span>
                              </div>
                              <div className="sm:col-span-2">
                                <span className="text-zinc-400">Danh hiệu Di sản: </span>
                                <span className="font-semibold text-amber-300">
                                  {featuredArticle.festivalDetails.heritageStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="bg-white border border-zinc-200/80 rounded-xl p-3 space-y-1.5">
                          <div className="font-bold text-zinc-950 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-zinc-800" />
                            <span>Điểm nhấn chính:</span>
                          </div>
                          <ul className="space-y-1 pl-4 list-disc text-zinc-600">
                            {featuredArticle.keyTakeaways.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        {featuredArticle.contentParagraphs.map((para, idx) => (
                          <p key={idx}>{para}</p>
                        ))}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-zinc-200/80 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExpandArticle(featuredArticle.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-zinc-950 cursor-pointer"
                      >
                        <span>
                          {expandedArticleId === featuredArticle.id ? 'Thu gọn' : 'Đọc chi tiết'}
                        </span>
                        {expandedArticleId === featuredArticle.id ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {onSelectHeritageOnMap && (
                          <button
                            type="button"
                            onClick={() =>
                              onSelectHeritageOnMap(
                                featuredArticle.location_query ||
                                  featuredArticle.heritage_id ||
                                  featuredArticle.locationOrSource
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-zinc-700" />
                            <span>🛍️ Thuê đồ gần sự kiện</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            onApplyOutfitConfigToStudio(featuredArticle.outfitConfig)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Box className="w-3.5 h-3.5" />
                          <span>🔮 Thử 3D liên quan</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* Secondary News Feed List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {remainingArticles.map((article) => {
                const isExpanded = expandedArticleId === article.id;
                const isFestivalPost = article.hasStudioTryOn === false || Boolean(article.festivalDetails);
                return (
                  <article
                    key={article.id}
                    className="bg-white border border-zinc-200/90 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-zinc-300 transition-colors"
                  >
                    <div>
                      {/* Prominent Top Image Banner */}
                      <div
                        onClick={() => toggleExpandArticle(article.id)}
                        className="relative h-44 w-full bg-zinc-900 overflow-hidden cursor-pointer group/img"
                      >
                        <ResilientImage
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md ${
                              isFestivalPost
                                ? 'bg-amber-500/95 text-zinc-950'
                                : 'bg-zinc-950/80 text-white border border-white/15'
                            }`}
                          >
                            {article.categoryLabel}
                          </span>
                        </div>
                        <div className="absolute inset-x-2.5 bottom-2.5 px-2.5 py-1 rounded-lg bg-zinc-950/75 backdrop-blur-md text-[11px] text-zinc-100 flex items-center justify-between gap-2">
                          <span className="truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">{article.locationOrSource}</span>
                          </span>
                          <span className="text-[10px] text-zinc-300 shrink-0">
                            {article.publishedDate}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-2.5">
                        <button
                          type="button"
                          onClick={() => toggleExpandArticle(article.id)}
                          title={`Nguồn: ${article.locationOrSource} · Thời lượng đọc: ${article.readTime}`}
                          className="text-left group/atitle cursor-pointer"
                        >
                          <h3 className="text-sm font-bold text-zinc-950 group-hover/atitle:underline transition-colors leading-snug">
                            {article.title}
                          </h3>
                        </button>

                        <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">
                          {article.subtitle}
                        </p>

                        {/* Compact Festival Metadata Preview on Card */}
                        {article.festivalDetails && (
                          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1 text-[11px]">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-zinc-500 shrink-0">Thời gian:</span>
                              <span className="font-semibold text-zinc-900 text-right">
                                {article.festivalDetails.lunarDate}
                              </span>
                            </div>
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-zinc-500 shrink-0">Nghi thức:</span>
                              <span className="font-medium text-zinc-700 text-right line-clamp-1">
                                {article.festivalDetails.mainRituals}
                              </span>
                            </div>
                          </div>
                        )}

                        {isExpanded && (
                          <div className="pt-2.5 border-t border-zinc-100 space-y-2.5 text-xs text-zinc-600 leading-relaxed">
                            {article.festivalDetails && (
                              <div className="p-3 rounded-xl bg-zinc-950 text-white space-y-1.5 text-[11px]">
                                <p className="font-bold text-amber-400 uppercase tracking-wide text-[10px]">
                                  Chi tiết Lễ hội Truyền thống
                                </p>
                                <p>
                                  <span className="text-zinc-400">Lịch hội: </span>
                                  <span className="font-semibold text-white">
                                    {article.festivalDetails.lunarDate}
                                  </span>
                                </p>
                                <p>
                                  <span className="text-zinc-400">Địa điểm: </span>
                                  <span className="font-semibold text-white">
                                    {article.festivalDetails.location}
                                  </span>
                                </p>
                                <p>
                                  <span className="text-zinc-400">Nghi thức chính: </span>
                                  <span className="text-zinc-100">
                                    {article.festivalDetails.mainRituals}
                                  </span>
                                </p>
                                <p>
                                  <span className="text-zinc-400">Di sản: </span>
                                  <span className="font-semibold text-amber-300">
                                    {article.festivalDetails.heritageStatus}
                                  </span>
                                </p>
                              </div>
                            )}

                            <div className="space-y-1">
                              <p className="font-bold text-zinc-900 text-[11px]">Điểm nhấn chính:</p>
                              <ul className="space-y-1 pl-4 list-disc text-zinc-700 font-medium">
                                {article.keyTakeaways.map((pt, i) => (
                                  <li key={i}>{pt}</li>
                                ))}
                              </ul>
                            </div>

                            {article.contentParagraphs.map((p, i) => (
                              <p key={i}>{p}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-4 py-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleExpandArticle(article.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-950 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Thu gọn' : 'Chi tiết'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSaveArticle(article.id)}
                          title={savedArticleIds.includes(article.id) ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-colors cursor-pointer ${
                            savedArticleIds.includes(article.id)
                              ? 'bg-zinc-950 border-zinc-950 text-white'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-950'
                          }`}
                        >
                          <Bookmark
                            className={`w-3 h-3 ${
                              savedArticleIds.includes(article.id) ? 'fill-current' : ''
                            }`}
                          />
                          <span>{savedArticleIds.includes(article.id) ? 'Đã lưu' : 'Lưu'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onSelectHeritageOnMap && (
                          <button
                            type="button"
                            onClick={() =>
                              onSelectHeritageOnMap(
                                article.location_query ||
                                  article.heritage_id ||
                                  article.locationOrSource
                              )
                            }
                            className="px-2 py-1 rounded-lg border border-zinc-200 text-[10px] font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                          >
                            🛍️ Thuê đồ gần đây
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onApplyOutfitConfigToStudio(article.outfitConfig)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 text-white text-[10px] font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <span>🔮 Thử 3D liên quan</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* RIGHT 4 COLUMNS: 2-Tab Row (Sự kiện sắp diễn ra | Sự kiện đã lưu) */}
          <aside className="lg:col-span-4 bg-zinc-50/80 border border-zinc-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
            {/* Horizontal Row Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-200/70 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setEventsTab('upcoming')}
                className={`py-2 px-2.5 rounded-lg font-semibold text-center transition-all cursor-pointer ${
                  eventsTab === 'upcoming'
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                Sự kiện sắp diễn ra
              </button>
              <button
                type="button"
                onClick={() => setEventsTab('saved')}
                className={`py-2 px-2.5 rounded-lg font-semibold text-center transition-all cursor-pointer ${
                  eventsTab === 'saved'
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                Sự kiện đã lưu ({savedEvents.length})
              </button>
            </div>

            {/* TAB 1: SỰ KIỆN SẮP DIỄN RA */}
            {eventsTab === 'upcoming' && (
              <div className="space-y-2.5">
                {UPCOMING_HERITAGE_EVENTS.map((evt) => {
                  const model2d = get2DModelImageForSelection(
                    evt.outfitConfig.gender,
                    evt.outfitConfig.garmentId
                  );
                  const isSaved = savedEventIds.includes(evt.id);

                  return (
                    <div
                      key={evt.id}
                      className="bg-white border border-zinc-200/80 rounded-xl p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                        <div>
                          <span className="font-semibold text-zinc-900">{evt.dateLabel}</span>
                          {evt.lunarDate && (
                            <span className="block text-[10px] text-zinc-400">
                              Âm lịch: {evt.lunarDate}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSaveEvent(evt.id)}
                          title={isSaved ? 'Bỏ lưu sự kiện' : 'Lưu sự kiện (+150 Điểm)'}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-colors cursor-pointer ${
                            isSaved
                              ? 'bg-zinc-950 border-zinc-950 text-white'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-950'
                          }`}
                        >
                          <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
                          <span>{isSaved ? 'Đã lưu' : 'Lưu (+150đ)'}</span>
                        </button>
                      </div>

                      <h5 className="text-xs font-bold text-zinc-950 leading-snug">{evt.title}</h5>

                      <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </span>
                        {evt.heritage_id && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono text-[9px] shrink-0">
                            #{evt.heritage_id}
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-zinc-100 space-y-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={model2d.studioUrl}
                            alt={evt.dressCode}
                            referrerPolicy="no-referrer"
                            className="w-7 h-9 rounded-md object-cover border border-zinc-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="block text-[10px] text-zinc-400">Trang phục gợi ý:</span>
                            <span className="block text-[11px] font-medium text-zinc-800 truncate">
                              {evt.dressCode}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => onApplyOutfitConfigToStudio(evt.outfitConfig)}
                            className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-zinc-950 text-white text-[10px] font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            <span>🔮 Thử 3D liên quan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onSelectHeritageOnMap &&
                              onSelectHeritageOnMap(
                                evt.location_query || evt.heritage_id || evt.location
                              )
                            }
                            className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            <span>🛍️ Thuê đồ gần sự kiện</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: SỰ KIỆN ĐÃ LƯU + PUSH NOTIFICATION SIMULATION */}
            {eventsTab === 'saved' && (
              <div className="space-y-3">
                {/* Push Notification Reminder Control Bar */}
                <div className="p-3 rounded-xl bg-white border border-zinc-200/80 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPushEnabled((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 cursor-pointer"
                    >
                      <Bell className={`w-3.5 h-3.5 ${pushEnabled ? 'text-zinc-950 fill-zinc-950' : 'text-zinc-400'}`} />
                      <span>Thông báo nhắc chuẩn bị Việt phục</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerPushSimulation()}
                      disabled={savedEvents.length === 0}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-950 text-white text-[10px] font-semibold hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
                    >
                      <BellRing className="w-3 h-3" />
                      <span>Thử thông báo</span>
                    </button>
                  </div>

                  {pushEnabled && (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 text-[11px]">
                      <span className="text-zinc-500">Thời gian nhắc trước:</span>
                      <div className="inline-flex gap-1">
                        {([1, 3, 7] as const).map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setRemindBeforeDays(days)}
                            className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer ${
                              remindBeforeDays === days
                                ? 'bg-zinc-900 text-white'
                                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-950'
                            }`}
                          >
                            {days} ngày
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {savedEvents.length === 0 ? (
                  <div className="p-4 rounded-xl bg-white border border-zinc-200/70 text-center text-xs text-zinc-400">
                    Chưa có sự kiện đã lưu.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {savedEvents.map((evt) => (
                      <div
                        key={`saved-${evt.id}`}
                        className="bg-white border border-zinc-200/80 rounded-xl p-3.5 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[11px] font-semibold text-zinc-500">{evt.dateLabel}</p>
                              {pushEnabled && (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[10px] font-medium">
                                  Nhắc trước {remindBeforeDays} ngày
                                </span>
                              )}
                            </div>
                            <h5 className="text-xs font-bold text-zinc-950 leading-snug mt-0.5">
                              {evt.title}
                            </h5>
                            <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                              {evt.location}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => triggerPushSimulation(evt)}
                              title="Mô phỏng thông báo nhắc chuẩn bị Việt phục"
                              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 cursor-pointer"
                            >
                              <BellRing className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleSaveEvent(evt.id)}
                              title="Bỏ lưu"
                              className="p-1.5 rounded-lg text-zinc-900 hover:bg-zinc-100 cursor-pointer"
                            >
                              <Bookmark className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100">
                          <span className="text-[11px] text-zinc-600 truncate">
                            {evt.dressCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => onApplyOutfitConfigToStudio(evt.outfitConfig)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-950 text-white text-[11px] font-semibold hover:bg-zinc-800 shrink-0 cursor-pointer"
                          >
                            <Box className="w-3 h-3" />
                            <span>Phòng thử</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>

        {/* FLOATING PUSH NOTIFICATION SIMULATION BANNER */}
        {activePushEvent && (
          <div
            role="status"
            aria-live="polite"
            className="fixed top-16 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl bg-white border border-zinc-200 shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2"
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
                  <BellRing className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-zinc-950">
                    Nhắc lịch sự kiện · Còn {remindBeforeDays} ngày
                  </p>
                  <p className="text-[10px] text-zinc-400">{activePushEvent.dateLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePushEvent(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-zinc-950 leading-snug">{activePushEvent.title}</p>
              <p className="text-zinc-600 leading-relaxed">
                Sự kiện tại <strong className="text-zinc-900">{activePushEvent.location}</strong> sắp
                diễn ra. Hãy chuẩn bị trang phục{' '}
                <strong className="text-zinc-900">{activePushEvent.dressCode}</strong> phù hợp nhé!
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onApplyOutfitConfigToStudio(activePushEvent.outfitConfig);
                  setActivePushEvent(null);
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Box className="w-3.5 h-3.5" />
                <span>Chuẩn bị ở Phòng thử</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onAskAdvisorWithPrompt(
                    `Sự kiện "${activePushEvent.title}" tại ${activePushEvent.location} (${activePushEvent.dateLabel}) sắp diễn ra. Gợi ý giúp mình cách chuẩn bị bộ ${activePushEvent.dressCode} và phụ kiện phù hợp.`
                  );
                  setActivePushEvent(null);
                }}
                className="py-2 px-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Tư vấn
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
