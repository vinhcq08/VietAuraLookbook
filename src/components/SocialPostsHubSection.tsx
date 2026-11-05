import React, { useState, useEffect } from 'react';
import {
  Cuboid,
  Code2,
  Copy,
  Check,
  Sparkles,
  ArrowUpRight,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  X,
  MapPin,
  Shirt,
  Ruler,
  Calendar,
  Star,
  Store,
  RefreshCw,
  Upload,
  Link2,
  ThumbsUp,
  AlignLeft,
  Share2,
  LayoutDashboard,
  Rows3,
  PenLine,
  Layers,
  Search,
  ChevronDown,
} from 'lucide-react';
import {
  SocialPostItem,
  SocialPlatform,
  OutfitConfigCode,
  StudioSelection,
  HERITAGE_IMAGES,
  BODY_TYPE_PROFILES,
  BodyTypeProfile,
  CommunityTabType,
  VerifiedPartnerVendorItem,
  VERIFIED_PARTNER_VENDORS,
  OmnichannelPointEntry,
  MandatorySystemJsonOutputSchema,
  CulturalKnowledgeCardPGC,
  PGC_CULTURAL_KNOWLEDGE_CARDS,
  buildSocialTabMandatoryJson,
  buildPartnerTabMandatoryJson,
  scanSocialPostByAI,
  getLocalizedKnowledgeCard,
  getLocalizedSocialPost,
  getLocalizedPartner,
  formatLocalizedMetrics,
  formatLocalizedPublishedAt,
} from '../data/vietPhucData';
import { ResilientImage } from './ResilientImage';
import { AppLanguage, TRANSLATIONS, getLocalizedGarmentName } from '../utils/i18n';

interface SocialPostsHubSectionProps {
  posts: SocialPostItem[];
  onAddPost: (post: SocialPostItem) => void;
  onApplyOutfitConfigTo3D: (config: OutfitConfigCode) => void;
  studioSelection: StudioSelection;
  onSelectLocationOnMap?: (locationQuery: string) => void;
  onAwardOmnichannelPoints?: (entry: Omit<OmnichannelPointEntry, 'id' | 'timestamp'>) => void;
  b2bMeasurementPayload?: MandatorySystemJsonOutputSchema | null;
  externalOpenB2BTrigger?: number | null;
  language?: AppLanguage;
}

const PARTNER_STORAGE_KEY = 'vp_verified_partners_v1';

const GARMENT_DEFAULTS: Record<
  OutfitConfigCode['garmentId'],
  {
    label: string;
    tag: string;
    image: string;
    config: OutfitConfigCode;
  }
> = {
  'ao-ngu-than': {
    label: 'Áo Ngũ Thân Lập Lĩnh',
    tag: '#AoNguThan',
    image: HERITAGE_IMAGES.aoNguThan,
    config: {
      config_id: 'CFG_CUSTOM_NGUTHAN',
      gender: 'nu',
      garmentId: 'ao-ngu-than',
      paletteId: 'khue-van-tri-thuc',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'am-hoa-tron',
      accessoryIds: ['khan-xep', 'quat-tram-huong'],
      footwearId: 'guoc-go-moc',
      occasionId: 'tot-nghiep',
      weatherId: 'thu-ha-noi',
      outerHex: '#2E8B57',
      innerHex: '#FFFFF0',
      lowerHex: '#FFFFF0',
    },
  },
  'ao-nhat-binh': {
    label: 'Áo Nhật Bình Cung Đình',
    tag: '#AoNhatBinh',
    image: HERITAGE_IMAGES.aoNhatBinh,
    config: {
      config_id: 'CFG_CUSTOM_NHATBINH',
      gender: 'nu',
      garmentId: 'ao-nhat-binh',
      paletteId: 'chu-sa-ngu-uyen',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'phuong-vu-bat-buu',
      accessoryIds: ['man-doi-dau', 'xuyen-bac'],
      footwearId: 'hai-theu',
      occasionId: 'cuoi-hoi',
      weatherId: 'xuan-am-ap',
      outerHex: '#9A3412',
      innerHex: '#D97706',
      lowerHex: '#FAF8F5',
    },
  },
  'ao-tu-than': {
    label: 'Áo Tứ Thân & Yếm Đào',
    tag: '#AoTuThan',
    image: HERITAGE_IMAGES.aoTuThan,
    config: {
      config_id: 'CFG_CUSTOM_TUTHAN',
      gender: 'nu',
      garmentId: 'ao-tu-than',
      paletteId: 'kinh-bac-dao-hoa',
      lowerGarmentId: 'vay-dup-den',
      motifId: 'tu-quy-lien-hoa',
      accessoryIds: ['non-quai-thao', 'dai-lung-bao'],
      footwearId: 'guoc-go-moc',
      occasionId: 'le-hoi-dan-gian',
      weatherId: 'xuan-am-ap',
      outerHex: '#78350F',
      innerHex: '#B91C1C',
      lowerHex: '#1C1917',
    },
  },
  'ao-dai-ba-ba': {
    label: 'Áo Bà Ba & Áo Dài',
    tag: '#AoBaBa',
    image: HERITAGE_IMAGES.aoDaiBaBa,
    config: {
      config_id: 'CFG_CUSTOM_BABA',
      gender: 'nu',
      garmentId: 'ao-dai-ba-ba',
      paletteId: 'phuong-nam-binh-di',
      lowerGarmentId: 'quan-lua-den',
      motifId: 'am-hoa-tron',
      accessoryIds: ['khan-ran-non-la'],
      footwearId: 'guoc-go-moc',
      occasionId: 'dao-pho',
      weatherId: 'ha-nang-vang',
      outerHex: '#D6CEBE',
      innerHex: '#27272A',
      lowerHex: '#27272A',
    },
  },
};

const AUTO_CRAWL_SAMPLES: Array<{
  title: string;
  url: string;
  caption: string;
  imageUrl: string;
}> = [
  {
    title: 'Biến hình Áo Ngũ Thân Lam Cổ Điển nhận bằng tốt nghiệp đại học',
    url: 'https://www.tiktok.com/@hoangthanh.cophuc/video/74899120341',
    caption:
      'Chụp bộ ảnh tốt nghiệp tại Văn Miếu - Quốc Tử Giám. Mẫu 3D: https://vietphuc.app/3d/CFG_NGUTHAN_01 · Link thuê đồ: https://vietphuc.app/rent/y-van-hien #VietPhucApp',
    imageUrl: HERITAGE_IMAGES.aoNguThan,
  },
  {
    title: 'Tư liệu hoa văn Phượng Vũ Bát Bửu trên Áo Nhật Bình cổ',
    url: 'https://www.facebook.com/groups/yphucdaiviet/posts/992817263',
    caption:
      'Ghi chép tư liệu tại Đại Nội Huế cùng bản dựng 3D tham khảo: https://vietphuc.app/3d/CFG_NHATBINH_02 #VietPhucStylist',
    imageUrl: HERITAGE_IMAGES.aoNhatBinh,
  },
  {
    title: 'Một chiều thu dạo phố Hội An trong tà Áo Bà Ba lụa tơ tằm',
    url: 'https://www.instagram.com/p/C9xHoiAnLookbook/',
    caption:
      'Kỷ niệm chuyến đi Phố cổ Hội An cùng chiếc Áo Bà Ba tự may nhẹ nhàng. #VietPhucLookbook',
    imageUrl: HERITAGE_IMAGES.model2DNuBaBa,
  },
];

// Platform Filters (Nền tảng)
const PLATFORM_FILTERS: Array<{ id: 'ALL' | SocialPlatform; label: string }> = [
  { id: 'ALL', label: 'Tất cả nền tảng' },
  { id: 'TikTok', label: 'TikTok' },
  { id: 'Instagram', label: 'Instagram' },
  { id: 'Facebook', label: 'Facebook' },
];

// Featured Garment Filters (Trang phục nổi bật)
const FEATURED_GARMENT_FILTERS = [
  { id: 'ALL', label: 'Tất cả trang phục' },
  { id: 'ao-ngu-than', label: 'Áo Ngũ Thân' },
  { id: 'ao-nhat-binh', label: 'Áo Nhật Bình' },
  { id: 'ao-tu-than', label: 'Áo Tứ Thân' },
  { id: 'ao-dai-ba-ba', label: 'Áo Bà Ba & Áo Dài' },
] as const;

type FeaturedGarmentFilterId = (typeof FEATURED_GARMENT_FILTERS)[number]['id'];

export const SocialPostsHubSection: React.FC<SocialPostsHubSectionProps> = ({
  posts,
  onAddPost,
  onApplyOutfitConfigTo3D,
  studioSelection,
  onSelectLocationOnMap,
  onAwardOmnichannelPoints,
  b2bMeasurementPayload,
  externalOpenB2BTrigger,
  language = 'vi',
}) => {
  const lang = language || 'vi';
  const isEn = lang === 'en';
  const tDict = TRANSLATIONS[lang] || TRANSLATIONS.vi;
  const tCommunity = tDict.community;
  const tCommon = tDict.common;

  // 2 SUB-TABS: TAB_1_SOCIAL_TRENDS (Bảng tin) | TAB_2_PARTNER_MARKETPLACE (B2B Thuê & May)
  const [activeCommunityTab, setActiveCommunityTab] =
    useState<CommunityTabType>('TAB_1_SOCIAL_TRENDS');

  // Dynamic Partner Vendors List (with localStorage persistence)
  const [partners, setPartners] = useState<VerifiedPartnerVendorItem[]>(() => {
    try {
      const saved = localStorage.getItem(PARTNER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return VERIFIED_PARTNER_VENDORS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(partners));
    } catch {
      // ignore storage errors
    }
  }, [partners]);

  useEffect(() => {
    if (externalOpenB2BTrigger) {
      setActiveCommunityTab('TAB_2_PARTNER_MARKETPLACE');
      if (b2bMeasurementPayload?.outfit_3d_config?.body_measurements?.height_cm) {
        setTailorHeightCm(b2bMeasurementPayload.outfit_3d_config.body_measurements.height_cm);
      }
    }
  }, [externalOpenB2BTrigger, b2bMeasurementPayload]);

  // Feed Filters: Platform + Featured Garment + Search Query & Layout Mode ('feed' | 'grid')
  const [activePlatformFilter, setActivePlatformFilter] = useState<'ALL' | SocialPlatform>('ALL');
  const [activeGarmentFilter, setActiveGarmentFilter] = useState<FeaturedGarmentFilterId>('ALL');
  const [feedSearchQuery, setFeedSearchQuery] = useState<string>('');
  const [feedLayout, setFeedLayout] = useState<'feed' | 'grid'>('feed');

  // AI-Powered Dynamic Feed Classification & Moderation State
  const [aiClassifiedFeed, setAiClassifiedFeed] = useState<SocialPostItem[]>(posts);
  const [isClassifyingAI, setIsClassifyingAI] = useState<boolean>(false);
  const [aiClassificationMeta, setAiClassificationMeta] = useState<{
    smart_tags: string[];
    ai_spam_score: number;
    culture_guard_status: string;
    classified_garment?: string;
  } | null>(null);
  // Edutainment Strategy (Phương án B): 80% UGC / 20% PGC Short-form Cultural Knowledge Cards
  const [edutainmentFeedMode, setEdutainmentFeedMode] = useState<
    'MIX_80_20' | 'UGC_ONLY' | 'PGC_ONLY'
  >('MIX_80_20');
  const [quizAnswersByCardId, setQuizAnswersByCardId] = useState<Record<string, number>>({});
  const [savedPgcCardIds, setSavedPgcCardIds] = useState<Record<string, boolean>>({});

  // Interactive Likes State (Instagram Heart)
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({
    SP_TIKTOK_2026_001: true,
    SP_INSTA_2026_003: true,
  });

  // TAB 2: Minimal Filters
  const [partnerShopFilter, setPartnerShopFilter] = useState<
    'ALL' | 'VERIFIED_RENTAL_SHOP' | 'VERIFIED_TAILOR'
  >('ALL');
  const [partnerRegionFilter, setPartnerRegionFilter] = useState<
    'ALL' | 'MIEN_BAC' | 'MIEN_TRUNG' | 'MIEN_NAM'
  >('ALL');

  // Per-item expandable states
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [expandedPgcIds, setExpandedPgcIds] = useState<Record<string, boolean>>({});
  const [showPlatformFilterBar, setShowPlatformFilterBar] = useState<boolean>(false);
  const [openJsonIds, setOpenJsonIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // =========================================================================
  // MODAL 1: CREATE NEW SOCIAL POST (ONLY 4 INPUTS + AI AUTO SCANNER)
  // =========================================================================
  const [createPostModalOpen, setCreatePostModalOpen] = useState<boolean>(false);
  const [newPostTitle, setNewPostTitle] = useState<string>('');
  const [newPostUrl, setNewPostUrl] = useState<string>(
    'https://www.instagram.com/p/C9xVietPhuc/'
  );
  const [newPostCaption, setNewPostCaption] = useState<string>('');
  const [newPostCustomImage, setNewPostCustomImage] = useState<string | null>(null);

  const liveAIScan = scanSocialPostByAI({
    title: newPostTitle,
    caption: newPostCaption,
    originalUrl: newPostUrl,
  });

  // =========================================================================
  // MODAL 2: REGISTER PARTNER / RENTAL VENDOR
  // =========================================================================
  const [registerPartnerModalOpen, setRegisterPartnerModalOpen] = useState<boolean>(false);
  const [regVendorName, setRegVendorName] = useState<string>('');
  const [regShopType, setRegShopType] = useState<'VERIFIED_RENTAL_SHOP' | 'VERIFIED_TAILOR'>(
    'VERIFIED_RENTAL_SHOP'
  );
  const [regRegion, setRegRegion] = useState<'MIEN_BAC' | 'MIEN_TRUNG' | 'MIEN_NAM'>('MIEN_BAC');
  const [regAddress, setRegAddress] = useState<string>('');
  const [regGarmentId, setRegGarmentId] = useState<OutfitConfigCode['garmentId']>('ao-ngu-than');
  const [regSpecialtyTitle, setRegSpecialtyTitle] = useState<string>('');
  const [regDescription, setRegDescription] = useState<string>('');
  const [regRentalPrice, setRegRentalPrice] = useState<string>('240.000đ/ngày');
  const [regTailoringAvailable, setRegTailoringAvailable] = useState<boolean>(true);
  const [regTailoringPrice, setRegTailoringPrice] = useState<string>('2.000.000đ/bộ');
  const [regCustomImage, setRegCustomImage] = useState<string | null>(null);

  // =========================================================================
  // MODAL 3: PARTNER ACTION ("Đặt thuê" & "May theo số đo 3D")
  // =========================================================================
  const [activePartnerModal, setActivePartnerModal] = useState<{
    partner: VerifiedPartnerVendorItem;
    mode: 'rent' | 'tailor';
  } | null>(null);
  const [rentalDays, setRentalDays] = useState<number>(2);
  const [rentalDate, setRentalDate] = useState<string>('2026-10-15');
  const [selectedBodyProfileId, setSelectedBodyProfileId] =
    useState<BodyTypeProfile['id']>('can-doi');
  const [tailorHeightCm, setTailorHeightCm] = useState<number>(162);
  const [tailorNote, setTailorNote] = useState<string>('');
  const [partnerActionSuccess, setPartnerActionSuccess] = useState<string | null>(null);

  // Hashtag / AI Ingestion State
  const [sampleCursor, setSampleCursor] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pipelineLog, setPipelineLog] = useState<{
    status: 'approved' | 'rejected';
    message: string;
  } | null>(null);

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleJsonView = (id: string) => {
    setOpenJsonIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopySocialSchema = (post: SocialPostItem) => {
    const schemaPayload = buildSocialTabMandatoryJson(post);
    navigator.clipboard.writeText(JSON.stringify(schemaPayload, null, 2));
    setCopiedId(post.post_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyPartnerSchema = (partner: VerifiedPartnerVendorItem) => {
    const schemaPayload = buildPartnerTabMandatoryJson(partner);
    navigator.clipboard.writeText(JSON.stringify(schemaPayload, null, 2));
    setCopiedId(partner.post_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (dataUrl: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Compute 3D body measurements
  const currentBodyProfile =
    BODY_TYPE_PROFILES.find((b) => b.id === selectedBodyProfileId) || BODY_TYPE_PROFILES[0];
  const heightRatio = tailorHeightCm / 162;
  const computedChestCm = Math.round(84 * currentBodyProfile.torsoWidthScale * heightRatio);
  const computedWaistCm = Math.round(66 * currentBodyProfile.torsoWidthScale * heightRatio);
  const computedHipCm = Math.round(90 * currentBodyProfile.hipWidthScale * heightRatio);
  const computedArmLengthCm = Math.round(54 * heightRatio);
  const computedGarmentLengthCm = Math.round(112 * heightRatio);

  // Asynchronous Gemini API Post Classification & Moderation (/api/social-hub/classify)
  useEffect(() => {
    let active = true;
    const runAIClassification = async () => {
      setIsClassifyingAI(true);
      try {
        const samplePost = posts[0];
        const res = await fetch('/api/social-hub/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchQuery: feedSearchQuery,
            caption: feedSearchQuery ? `Tìm kiếm: ${feedSearchQuery}` : samplePost?.caption || 'Việt Phục',
            mediaInfo: samplePost?.original_url || 'https://instagram.com/p/vietphuc',
            hashtags: [
              activeGarmentFilter !== 'ALL' ? `#${activeGarmentFilter}` : '',
              '#VietPhucReal',
              '#VietPhuc3D',
            ].filter(Boolean),
            platformHint: activePlatformFilter !== 'ALL' ? activePlatformFilter : undefined,
          }),
        });

        if (res.ok && active) {
          const aiData = await res.json();
          setAiClassificationMeta({
            smart_tags: Array.isArray(aiData.smart_tags) ? aiData.smart_tags : ['#VietPhucReal', '#VietPhuc3D'],
            ai_spam_score: typeof aiData.ai_spam_score === 'number' ? aiData.ai_spam_score : 0.02,
            culture_guard_status: aiData.culture_guard_status || 'Approved',
            classified_garment: aiData.classified_garment,
          });

          const smartTags: string[] = aiData.smart_tags || [];
          const classifiedGarment = aiData.classified_garment;

          const updated = posts
            .map((p) => ({
              ...p,
              tags: Array.from(new Set([...p.tags, ...smartTags.slice(0, 2)])),
              culture_guard_status:
                p.culture_guard_status === 'Rejected'
                  ? 'Rejected'
                  : (aiData.culture_guard_status as any) || p.culture_guard_status,
            }))
            .filter((p) => {
              if (activePlatformFilter !== 'ALL' && p.platform !== activePlatformFilter) {
                return false;
              }
              if (p.culture_guard_status === 'Rejected') return false;
              if (aiData.ai_spam_score > 0.8) return false;

              if (activeGarmentFilter !== 'ALL') {
                const targetGarment = classifiedGarment || activeGarmentFilter;
                const matchesGarment =
                  p.outfitConfig?.garmentId === targetGarment ||
                  p.tags.some((t) =>
                    t.toLowerCase().includes(targetGarment.replace(/-/g, ''))
                  );
                if (!matchesGarment) return false;
              }

              const q = feedSearchQuery.trim().toLowerCase();
              if (q) {
                const inSmartTags = smartTags.some((t) => t.toLowerCase().includes(q));
                const inTitle = p.title.toLowerCase().includes(q);
                const inCaption = p.caption.toLowerCase().includes(q);
                const inAuthor = p.author.toLowerCase().includes(q);
                const inTags = p.tags.some((t) => t.toLowerCase().includes(q));
                if (!inSmartTags && !inTitle && !inCaption && !inAuthor && !inTags) {
                  return false;
                }
              }

              return true;
            });

          setAiClassifiedFeed(updated);
        }
      } catch (err) {
        console.warn('AI social hub classification failed:', err);
        setAiClassifiedFeed(posts);
      } finally {
        if (active) setIsClassifyingAI(false);
      }
    };

    const timer = setTimeout(runAIClassification, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [posts, feedSearchQuery, activeGarmentFilter, activePlatformFilter]);

  const filteredPosts = aiClassifiedFeed;

  // Filter PGC Cultural Knowledge Cards by garment & search query
  const filteredPgcCards = PGC_CULTURAL_KNOWLEDGE_CARDS.filter((card) => {
    if (activeGarmentFilter !== 'ALL' && card.relatedGarmentId !== activeGarmentFilter) {
      return false;
    }
    const q = feedSearchQuery.trim().toLowerCase();
    if (q) {
      const inTitle = card.title.toLowerCase().includes(q);
      const inHook = card.fun_fact_hook.toLowerCase().includes(q);
      const inSummary = card.short_summary.toLowerCase().includes(q);
      const inExpert = card.author_expert.toLowerCase().includes(q);
      if (!inTitle && !inHook && !inSummary && !inExpert) return false;
    }
    return true;
  });

  // Build 80% UGC / 20% PGC Interleaved Edutainment Stream (4 UGC posts : 1 PGC Knowledge Card)
  type EdutainmentStreamItem =
    | { itemType: 'UGC_POST'; post: SocialPostItem }
    | { itemType: 'PGC_CARD'; card: CulturalKnowledgeCardPGC };

  const edutainmentStream: EdutainmentStreamItem[] = (() => {
    if (edutainmentFeedMode === 'UGC_ONLY') {
      return filteredPosts.map((post) => ({ itemType: 'UGC_POST', post }));
    }
    if (edutainmentFeedMode === 'PGC_ONLY') {
      return filteredPgcCards.map((card) => ({ itemType: 'PGC_CARD', card }));
    }
    // Default MIX_80_20: Interleave 1 PGC card after every 4 UGC posts (80% UGC / 20% PGC)
    const result: EdutainmentStreamItem[] = [];
    let pgcCursor = 0;
    filteredPosts.forEach((post, idx) => {
      result.push({ itemType: 'UGC_POST', post });
      if ((idx + 1) % 4 === 0 && pgcCursor < filteredPgcCards.length) {
        result.push({ itemType: 'PGC_CARD', card: filteredPgcCards[pgcCursor] });
        pgcCursor += 1;
      }
    });
    // Ensure at least one PGC card appears if there are fewer than 4 UGC posts or remaining PGC cards
    while (pgcCursor < filteredPgcCards.length && result.length > 0 && pgcCursor < 2) {
      result.push({ itemType: 'PGC_CARD', card: filteredPgcCards[pgcCursor] });
      pgcCursor += 1;
    }
    return result;
  })();

  const handleAnswerPgcQuiz = (card: CulturalKnowledgeCardPGC, optionIdx: number) => {
    if (quizAnswersByCardId[card.card_id] !== undefined) return;
    setQuizAnswersByCardId((prev) => ({ ...prev, [card.card_id]: optionIdx }));
    if (optionIdx === card.mini_quiz.correctIndex) {
      onAwardOmnichannelPoints?.({
        source: 'SOCIAL_POST_SHARE',
        sourceLabel: `Thẻ Tri Thức PGC (+${card.mini_quiz.pointsReward}đ)`,
        description: `Trả lời đúng Fun Fact "${card.title}"`,
        points: card.mini_quiz.pointsReward,
      });
      setPipelineLog({
        status: 'approved',
        message: `Chính xác! Bạn nhận +${card.mini_quiz.pointsReward} Điểm Di Sản từ Thẻ Kiến Thức Chuyên Gia.`,
      });
    }
  };

  const filteredPartners = partners.filter((partner) => {
    if (partnerShopFilter !== 'ALL' && partner.shop_type !== partnerShopFilter) return false;
    if (partnerRegionFilter !== 'ALL' && partner.region !== partnerRegionFilter) return false;
    return true;
  });

  // Core AI Post Scanner & Publisher
  const publishPostWithAIScanner = async (input: {
    title: string;
    originalUrl: string;
    caption: string;
    imageUrl?: string | null;
  }) => {
    if (isSyncing) return false;
    setIsSyncing(true);
    setPipelineLog(null);

    try {
      let scanned: any;
      try {
        const hashtags = input.caption.match(/#[A-Za-z0-9_]+/g) || ['#VietPhucLookbook'];
        const res = await fetch('/api/social-hub/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: input.title,
            caption: input.caption,
            url: input.originalUrl,
            mediaInfo: input.originalUrl || input.imageUrl,
            hashtags,
          }),
        });
        if (res.ok) {
          scanned = await res.json();
        } else {
          scanned = scanSocialPostByAI({
            title: input.title,
            caption: input.caption,
            originalUrl: input.originalUrl,
          });
        }
      } catch {
        scanned = scanSocialPostByAI({
          title: input.title,
          caption: input.caption,
          originalUrl: input.originalUrl,
        });
      }

      if (scanned.culture_guard_status === 'Rejected') {
        setPipelineLog({
          status: 'rejected',
          message: scanned.violatedRule || 'Bài viết bị từ chối bởi bộ lọc văn hóa Culture Guard (Gemini AI).',
        });
        return false;
      }

      const defaultGarmentImg =
        scanned.tags.includes('#AoNhatBinh')
          ? HERITAGE_IMAGES.aoNhatBinh
          : scanned.tags.includes('#AoTuThan')
          ? HERITAGE_IMAGES.aoTuThan
          : scanned.tags.includes('#AoBaBa') || scanned.tags.includes('#AoDaiTieuChuan')
          ? HERITAGE_IMAGES.aoDaiBaBa
          : HERITAGE_IMAGES.aoNguThan;

      const resolvedUrl =
        input.originalUrl.trim() ||
        `https://www.${scanned.platform.toLowerCase()}.com/vietphuc/${Date.now()}`;

      const newPost: SocialPostItem = {
        post_id: `SP_${scanned.platform.toUpperCase()}_${Date.now().toString().slice(-5)}`,
        platform: scanned.platform,
        author: scanned.author,
        original_url: resolvedUrl,
        source_hashtag: '#VietPhucLookbook',
        tags: scanned.tags,
        has_re_fit_3d: scanned.has_re_fit_3d,
        is_shoppable: scanned.is_shoppable,
        detected_3d_link: scanned.detected_3d_link,
        detected_shop_link: scanned.detected_shop_link,
        outfit_config_id: scanned.outfit_config_id,
        culture_guard_status: scanned.culture_guard_status,
        is_local_locked: true,
        title: input.title.trim() || input.caption.trim().slice(0, 72),
        caption: input.caption.trim(),
        contentCategory: `Quét tự động bởi AI · ${scanned.platform}`,
        aspectRatio:
          scanned.platform === 'TikTok'
            ? '9:16'
            : scanned.platform === 'Instagram'
            ? '4:5'
            : '16:9',
        imageUrl: input.imageUrl || defaultGarmentImg,
        metricsLabel: `Liên kết từ ${scanned.platform}`,
        publishedAt: 'Vừa xong',
        location_query: scanned.location_query,
        outfitConfig: scanned.outfitConfig,
      };

      onAddPost(newPost);

      const detectedSummaryParts: string[] = [];
      if (scanned.location_query) detectedSummaryParts.push(`📍 ${scanned.location_query}`);
      if (scanned.has_re_fit_3d) detectedSummaryParts.push('🧊 Có link 3D');
      if (scanned.is_shoppable) detectedSummaryParts.push('🛍️ Có link thuê/may');

      setPipelineLog({
        status: 'approved',
        message: `Đã đăng bài mới (+20 Điểm Di Sản) · ${
          detectedSummaryParts.length > 0
            ? detectedSummaryParts.join(' · ')
            : 'Bài chia sẻ ảnh'
        }`,
      });
      return true;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAutoCrawlNext = () => {
    const sample = AUTO_CRAWL_SAMPLES[sampleCursor % AUTO_CRAWL_SAMPLES.length];
    setSampleCursor((prev) => prev + 1);
    publishPostWithAIScanner({
      title: sample.title,
      originalUrl: sample.url,
      caption: sample.caption,
      imageUrl: sample.imageUrl,
    });
  };

  // Handle Create Post Form Submit
  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() && !newPostCaption.trim()) return;

    const ok = await publishPostWithAIScanner({
      title: newPostTitle,
      originalUrl: newPostUrl,
      caption: newPostCaption,
      imageUrl: newPostCustomImage,
    });

    if (ok) {
      setNewPostTitle('');
      setNewPostCaption('');
      setNewPostCustomImage(null);
      setCreatePostModalOpen(false);
      setActiveCommunityTab('TAB_1_SOCIAL_TRENDS');
    }
  };

  // Handle Partner / Rental Registration Submit
  const handleRegisterPartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regVendorName.trim()) return;

    const garmentMeta = GARMENT_DEFAULTS[regGarmentId] || GARMENT_DEFAULTS['ao-ngu-than'];
    const regionLabelMap: Record<'MIEN_BAC' | 'MIEN_TRUNG' | 'MIEN_NAM', string> = {
      MIEN_BAC: 'Miền Bắc',
      MIEN_TRUNG: 'Miền Trung',
      MIEN_NAM: 'Miền Nam',
    };

    const newVendorId = `VENDOR_PARTNER_${Date.now().toString().slice(-5)}`;
    const newConfigId = `CFG_PARTNER_${Date.now().toString().slice(-5)}`;
    const cleanAddress =
      regAddress.trim() ||
      (regRegion === 'MIEN_BAC'
        ? 'Văn Miếu - Quốc Tử Giám, Hà Nội'
        : regRegion === 'MIEN_TRUNG'
        ? 'Đại Nội Huế, Thừa Thiên Huế'
        : 'Dinh Độc Lập, Quận 1, TP.HCM');

    const newPartner: VerifiedPartnerVendorItem = {
      vendor_id: newVendorId,
      post_id: `MP_PARTNER_${Date.now().toString().slice(-6)}`,
      vendor_name: regVendorName.trim(),
      shop_type: regShopType,
      shop_type_label:
        regShopType === 'VERIFIED_TAILOR'
          ? 'Nhà may đo & Cho thuê cổ phục'
          : 'Tiệm cho thuê cổ phục',
      region: regRegion,
      region_label: `${cleanAddress.split(',')[0]} · ${regionLabelMap[regRegion]}`,
      specialty_title:
        regSpecialtyTitle.trim() || `Chuyên ${garmentMeta.label} & Phụ kiện đồng bộ`,
      description:
        regDescription.trim() ||
        `Đối tác cung cấp dịch vụ ${
          regShopType === 'VERIFIED_TAILOR' ? 'may đo theo số đo 3D và cho thuê' : 'cho thuê'
        } ${garmentMeta.label} chuẩn quy chuẩn văn hóa.`,
      google_maps_address: cleanAddress,
      rental_price_per_day: regRentalPrice.trim() || '240.000đ/ngày',
      tailoring_price_from: regTailoringAvailable
        ? regTailoringPrice.trim() || '2.000.000đ/bộ'
        : 'Chỉ cho thuê',
      tailoring_available: regTailoringAvailable,
      rating: 5.0,
      reviews_count: 1,
      image_url: regCustomImage || garmentMeta.image,
      smart_tags: ['#VietPhucReal', '#VietPhuc3D', garmentMeta.tag, '#KyYeu'],
      outfit_config_id: newConfigId,
      outfitConfig: {
        ...garmentMeta.config,
        config_id: newConfigId,
      },
    };

    setPartners((prev) => [newPartner, ...prev]);
    setRegVendorName('');
    setRegSpecialtyTitle('');
    setRegDescription('');
    setRegAddress('');
    setRegCustomImage(null);
    setRegisterPartnerModalOpen(false);
    setActiveCommunityTab('TAB_2_PARTNER_MARKETPLACE');
    setPipelineLog({
      status: 'approved',
      message: `Đã thêm cửa hàng "${newPartner.vendor_name}" vào mục Cửa hàng Thuê & May!`,
    });
  };

  return (
    <section id="social-hub" className="py-10 lg:py-14 border-b border-zinc-200 bg-zinc-50/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TOP BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200">
          {/* Left: Clean Brand & Sub-Tab Switcher */}
          <div className="flex items-center gap-6">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950">
              {isEn ? 'Community & Tailor Boutiques' : 'Cộng đồng & Tiệm Thuê May'}
            </h2>

            <div className="flex items-center gap-1 bg-zinc-200/70 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveCommunityTab('TAB_1_SOCIAL_TRENDS')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCommunityTab === 'TAB_1_SOCIAL_TRENDS'
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isEn ? 'Community Feed' : 'Bảng tin Cộng đồng'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCommunityTab('TAB_2_PARTNER_MARKETPLACE')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCommunityTab === 'TAB_2_PARTNER_MARKETPLACE'
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>
                  {isEn
                    ? `Rent & Tailor (${partners.length})`
                    : `Thuê & May (${partners.length})`}
                </span>
              </button>
            </div>
          </div>

          {/* Right: Create Post & Partner Registration */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCreatePostModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>{tCommunity.createPost}</span>
            </button>

            <button
              type="button"
              onClick={() => setRegisterPartnerModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'en' ? 'Register Atelier' : 'Đăng ký tiệm'}</span>
            </button>
          </div>
        </div>

        {/* Compact Toast Notification */}
        {pipelineLog && (
          <div
            className={`mt-3 px-3.5 py-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${
              pipelineLog.status === 'approved'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {pipelineLog.status === 'approved' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{pipelineLog.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setPipelineLog(null)}
              className="p-1 opacity-60 hover:opacity-100 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 1: BẢNG TIN (LỌC THEO NỀN TẢNG, TRANG PHỤC NỔI BẬT & TÌM KIẾM) */}
        {/* =================================================================== */}
        {activeCommunityTab === 'TAB_1_SOCIAL_TRENDS' && (
          <div>
            {/* Streamlined Filter Controls: Single Clean Primary Bar + Collapsible Extra Filters */}
            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-[240px]">
                  {/* Search Input */}
                  <div className="relative w-full sm:w-56">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={feedSearchQuery}
                      onChange={(e) => setFeedSearchQuery(e.target.value)}
                      placeholder={tCommunity.searchPlaceholder}
                      className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900"
                    />
                    {feedSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setFeedSearchQuery('')}
                        aria-label="Xóa tìm kiếm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Garment Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {FEATURED_GARMENT_FILTERS.map((garment) => {
                      const isActive = activeGarmentFilter === garment.id;
                      return (
                        <button
                          key={garment.id}
                          type="button"
                          onClick={() =>
                            setActiveGarmentFilter((prev) =>
                              prev === garment.id && garment.id !== 'ALL' ? 'ALL' : garment.id
                            )
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                            isActive
                              ? 'bg-zinc-950 text-white'
                              : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-950'
                          }`}
                        >
                          {garment.id === 'ALL' ? (isEn ? 'All Costumes' : 'Tất cả trang phục') : garment.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Content Type + Extra Filter Toggle + Layout Switcher */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="inline-flex items-center bg-zinc-200/70 p-0.5 rounded-lg text-[11px] font-semibold">
                    {(
                      [
                        { id: 'MIX_80_20', label: isEn ? 'All' : 'Tất cả' },
                        { id: 'UGC_ONLY', label: isEn ? 'Community' : 'Cộng đồng' },
                        { id: 'PGC_ONLY', label: isEn ? 'Knowledge' : 'Kiến thức' },
                      ] as const
                    ).map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setEdutainmentFeedMode(mode.id)}
                        className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          edutainmentFeedMode === mode.id
                            ? 'bg-white text-zinc-950 shadow-2xs font-bold'
                            : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPlatformFilterBar((prev) => !prev)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                      showPlatformFilterBar || activePlatformFilter !== 'ALL'
                        ? 'bg-zinc-950 text-white border-zinc-950'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <span>{activePlatformFilter === 'ALL' ? (lang === 'en' ? 'Source' : 'Nguồn') : activePlatformFilter}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        showPlatformFilterBar ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div className="flex items-center bg-zinc-200/70 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setFeedLayout('feed')}
                      title={lang === 'en' ? 'Card view mode' : 'Chế độ thẻ chi tiết'}
                      className={`p-1.5 rounded-md cursor-pointer ${
                        feedLayout === 'feed'
                          ? 'bg-white text-zinc-950 shadow-2xs'
                          : 'text-zinc-500 hover:text-zinc-900'
                      }`}
                    >
                      <Rows3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedLayout('grid')}
                      title={lang === 'en' ? 'Grid view mode' : 'Chế độ lưới ảnh'}
                      className={`p-1.5 rounded-md cursor-pointer ${
                        feedLayout === 'grid'
                          ? 'bg-white text-zinc-950 shadow-2xs'
                          : 'text-zinc-500 hover:text-zinc-900'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Platform Filter & Sync Row */}
              {showPlatformFilterBar && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-zinc-200/80 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-zinc-500 mr-1">
                      {lang === 'en' ? 'Filter by platform:' : 'Lọc theo mạng xã hội:'}
                    </span>
                    {PLATFORM_FILTERS.map((item) => {
                      const isActive = activePlatformFilter === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setActivePlatformFilter((prev) =>
                              prev === item.id && item.id !== 'ALL' ? 'ALL' : item.id
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-zinc-950 text-white'
                              : 'bg-zinc-100 text-zinc-600 hover:text-zinc-950'
                          }`}
                        >
                          {item.id === 'ALL' ? (isEn ? 'All Platforms' : 'Tất cả nền tảng') : item.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={handleAutoCrawlNext}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-[11px] font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    <span>{isEn ? 'Load Sample Posts' : 'Tải thêm bài mẫu'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Real-Time Gemini AI Classification & Moderation Banner */}
            {(isClassifyingAI || aiClassificationMeta) && (
              <div className="mt-3 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1 text-amber-800 font-bold text-[11px]">
                    {isClassifyingAI ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>Gemini AI Smart Tags:</span>
                  </div>
                  {aiClassificationMeta?.smart_tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 font-mono text-[10px] font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {aiClassificationMeta && (
                  <div className="flex items-center gap-3 text-[11px] text-zinc-600 font-mono-tabular">
                    <span>
                      Spam score:{' '}
                      <strong className="text-zinc-900 font-bold">
                        {aiClassificationMeta.ai_spam_score.toFixed(2)}
                      </strong>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-zinc-300" />
                    <span>
                      Culture Guard:{' '}
                      <strong
                        className={`font-bold ${
                          aiClassificationMeta.culture_guard_status === 'Approved'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {aiClassificationMeta.culture_guard_status}
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            )}

            {edutainmentStream.length === 0 ? (
              <div className="mt-4 p-8 rounded-2xl bg-white border border-zinc-200 text-center space-y-2">
                <p className="text-xs font-semibold text-zinc-700">
                  {isEn
                    ? 'No posts or Knowledge Cards match the selected filters.'
                    : 'Không tìm thấy bài đăng hoặc Thẻ Kiến Thức phù hợp với bộ lọc hiện tại.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActivePlatformFilter('ALL');
                    setActiveGarmentFilter('ALL');
                    setEdutainmentFeedMode('MIX_80_20');
                    setFeedSearchQuery('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-950 text-white text-xs font-semibold cursor-pointer"
                >
                  {isEn ? 'Reset Filters' : 'Đặt lại bộ lọc'}
                </button>
              </div>
            ) : feedLayout === 'grid' ? (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                {filteredPosts.map((rawPost) => {
                  const post = getLocalizedSocialPost(rawPost, isEn);
                  return (
                    <div
                      key={post.post_id}
                      className="group relative aspect-square bg-zinc-100 overflow-hidden rounded-lg"
                    >
                      <ResilientImage
                        src={post.imageUrl}
                        alt={post.title}
                        fallbackTitle={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Subtle top-right badge showing 3D / Shop / Festival availability */}
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        {post.festivalDetails && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-500 text-zinc-950 text-[9px] font-bold">
                            {isEn ? 'Festival' : 'Lễ hội'}
                          </span>
                        )}
                        {post.has_re_fit_3d && (
                          <span className="p-1 rounded-md bg-black/60 text-white backdrop-blur-xs">
                            <Cuboid className="w-3 h-3 text-emerald-400" />
                          </span>
                        )}
                        {post.is_shoppable && (
                          <span className="p-1 rounded-md bg-black/60 text-white backdrop-blur-xs">
                            <Shirt className="w-3 h-3 text-amber-400" />
                          </span>
                        )}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold truncate">{post.author.replace('@', '')}</span>
                          <span className="opacity-80">{post.platform}</span>
                        </div>

                        <p className="text-xs font-medium line-clamp-2 leading-snug">{post.title}</p>

                        <div className="flex items-center gap-1.5">
                          {post.festivalDetails && (
                            <button
                              type="button"
                              onClick={() => {
                                setFeedLayout('feed');
                                setExpandedIds((prev) => ({ ...prev, [post.post_id]: true }));
                              }}
                              className="px-2 py-1 rounded bg-amber-400 text-zinc-950 text-[10px] font-bold cursor-pointer"
                            >
                              {isEn ? 'Festival Details' : 'Chi tiết lễ hội'}
                            </button>
                          )}
                          {post.has_re_fit_3d && post.outfitConfig && (
                            <button
                              type="button"
                              onClick={() => onApplyOutfitConfigTo3D(post.outfitConfig!)}
                              className="px-2 py-1 rounded bg-white text-zinc-950 text-[10px] font-bold cursor-pointer"
                            >
                              {isEn ? 'Try 3D' : 'Thử 3D'}
                            </button>
                          )}
                          {post.is_shoppable && (
                            <button
                              type="button"
                              onClick={() => setActiveCommunityTab('TAB_2_PARTNER_MARKETPLACE')}
                              className="px-2 py-1 rounded bg-amber-500 text-zinc-950 text-[10px] font-bold cursor-pointer"
                            >
                              {isEn ? 'Rent/Tailor' : 'Thuê/May'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* FEED CARDS VIEW (80% UGC / 20% PGC INTERLEAVED STREAM) */
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                {edutainmentStream.map((streamItem) => {
                  if (streamItem.itemType === 'PGC_CARD') {
                    const rawCard = streamItem.card;
                    const card = getLocalizedKnowledgeCard(rawCard, isEn);
                    const selectedAnswer = quizAnswersByCardId[card.card_id];
                    const isSaved = Boolean(savedPgcCardIds[card.card_id]);
                    const isPgcExpanded = Boolean(expandedPgcIds[card.card_id]);
                    return (
                      <article
                        key={card.card_id}
                        className="bg-zinc-950 text-white rounded-2xl border-2 border-amber-500/70 overflow-hidden flex flex-col shadow-sm"
                      >
                        {/* PGC Expert Header */}
                        <div className="px-3.5 py-2.5 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-zinc-950 text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                              {isEn ? 'Knowledge Card' : 'Thẻ Kiến Thức'}
                            </span>
                            <span className="text-[11px] font-bold text-amber-300 truncate">
                              {card.category_tag}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setSavedPgcCardIds((prev) => ({
                                ...prev,
                                [card.card_id]: !prev[card.card_id],
                              }))
                            }
                            className={`text-[11px] font-bold cursor-pointer shrink-0 ${
                              isSaved ? 'text-amber-400' : 'text-zinc-400 hover:text-white'
                            }`}
                          >
                            {isSaved ? (isEn ? '★ Saved' : '★ Đã lưu') : (isEn ? '☆ Save' : '☆ Lưu')}
                          </button>
                        </div>

                        {/* Visual + 1-Touch 3D Try-On */}
                        <div className="relative aspect-16/10 w-full bg-zinc-900 overflow-hidden">
                          <ResilientImage
                            src={card.imageUrl}
                            alt={card.title}
                            fallbackTitle={card.title}
                            className="w-full h-full object-cover opacity-90"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                            <div>
                              <p className="text-[11px] font-semibold text-amber-300">
                                {card.author_expert} · {card.expert_role}
                              </p>
                              <h4 className="text-sm font-bold text-white leading-snug">
                                {card.title}
                              </h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => onApplyOutfitConfigTo3D(card.outfitConfig)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-[11px] font-bold shrink-0 cursor-pointer"
                            >
                              <Cuboid className="w-3.5 h-3.5" />
                              <span>{isEn ? 'Try 3D' : 'Thử 3D'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Short-form Fun Fact + Progressive Disclosure for Details & Quiz */}
                        <div className="p-3.5 space-y-2.5 text-xs">
                          <p className="font-bold text-amber-300 leading-snug">
                            💡 {card.fun_fact_hook}
                          </p>
                          <p className="text-zinc-300 leading-relaxed text-[11px]">
                            {card.short_summary}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedPgcIds((prev) => ({
                                ...prev,
                                [card.card_id]: !prev[card.card_id],
                              }))
                            }
                            aria-expanded={isPgcExpanded}
                            className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-[11px] font-semibold flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <span>
                              {isPgcExpanded
                                ? (isEn ? 'Collapse details & quiz' : 'Thu gọn chi tiết & đố vui')
                                : (isEn ? `View details & Quiz (+${card.mini_quiz.pointsReward} pts)` : `Xem chi tiết & Đố vui (+${card.mini_quiz.pointsReward}đ)`)}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-amber-400 transition-transform duration-200 ${
                                isPgcExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {isPgcExpanded && (
                            <div className="space-y-2.5 pt-1">
                              <ul className="space-y-1 pt-1 border-t border-zinc-800 text-[11px] text-zinc-200">
                                {card.bullet_points.map((bullet: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-amber-400 font-bold">•</span>
                                    <span>{bullet}</span>
                                  </li>
                                ))}
                              </ul>

                              {/* Mini-Quiz "Học mà Chơi" */}
                              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                    {isEn ? '🎯 Knowledge Quiz' : '🎯 Đố vui nhận điểm'}
                                  </span>
                                  <span className="text-[10px] font-bold text-amber-300">
                                    +{card.mini_quiz.pointsReward} {isEn ? 'Heritage Points' : 'Điểm Di Sản'}
                                  </span>
                                </div>
                                <p className="text-[11px] font-semibold text-white">
                                  {card.mini_quiz.question}
                                </p>
                                <div className="space-y-1">
                                  {card.mini_quiz.options.map((opt: string, idx: number) => {
                                    const isChosen = selectedAnswer === idx;
                                    const isCorrect = idx === card.mini_quiz.correctIndex;
                                    const showResult = selectedAnswer !== undefined;
                                    return (
                                      <button
                                        key={idx}
                                        type="button"
                                        disabled={showResult}
                                        onClick={() => handleAnswerPgcQuiz(card, idx)}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                                          showResult
                                            ? isCorrect
                                              ? 'bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 font-bold'
                                              : isChosen
                                              ? 'bg-rose-950/80 border border-rose-500/60 text-rose-200'
                                              : 'bg-zinc-950/60 text-zinc-500'
                                            : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800'
                                        }`}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                                {selectedAnswer !== undefined && (
                                  <p className="text-[11px] text-amber-200/90 pt-1 border-t border-zinc-800">
                                    {card.mini_quiz.explanation}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  }

                  const rawPost = streamItem.post;
                  const post = getLocalizedSocialPost(rawPost, isEn);
                  const isExpanded = Boolean(expandedIds[post.post_id]);
                  const isJsonOpen = Boolean(openJsonIds[post.post_id]);
                  const isLiked = Boolean(likedPosts[post.post_id]);
                  const jsonOutputSchema = buildSocialTabMandatoryJson(post);
                  const cleanUsername = post.author.replace('@', '');

                  return (
                    <article
                      key={post.post_id}
                      className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden flex flex-col shadow-2xs"
                    >
                      {/* 1. POST HEADER: Clean Avatar + Username + Location Sub-line */}
                      <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                            {cleanUsername.slice(0, 1).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-zinc-950 truncate">
                                {cleanUsername}
                              </span>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="text-[10px] text-zinc-400">· {post.platform}</span>
                            </div>

                            {post.location_query && (
                              <button
                                type="button"
                                onClick={() => onSelectLocationOnMap?.(post.location_query!)}
                                className="text-[11px] text-zinc-500 hover:text-zinc-900 truncate flex items-center gap-0.5 cursor-pointer"
                              >
                                <MapPin className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                <span className="truncate">
                                  {post.location_query.split(',')[0]}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        <a
                          href={post.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={isEn ? `Open original on ${post.platform}` : `Mở bài gốc trên ${post.platform}`}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      </div>

                      {/* 2. SQUARE PHOTO FRAME */}
                      <div
                        onDoubleClick={() => toggleLike(post.post_id)}
                        className="relative aspect-square w-full bg-zinc-100 overflow-hidden select-none"
                      >
                        <ResilientImage
                          src={post.imageUrl}
                          alt={post.title}
                          fallbackTitle={post.title}
                          className="w-full h-full object-cover"
                        />

                        {/* Top-left badge for Traditional Festival posts */}
                        {post.festivalDetails && (
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/95 text-zinc-950 text-[10px] font-bold shadow-xs">
                              {isEn ? 'Traditional Festival' : 'Lễ hội truyền thống'}
                            </span>
                          </div>
                        )}

                        {/* Bottom-Left 3D / Rental / Festival Details Tag Buttons */}
                        {(post.has_re_fit_3d || post.is_shoppable || post.festivalDetails) && (
                          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                            {post.festivalDetails && (
                              <button
                                type="button"
                                onClick={() => toggleExpand(post.post_id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black text-white text-[11px] font-semibold backdrop-blur-xs cursor-pointer"
                              >
                                <AlignLeft className="w-3 h-3 text-amber-400" />
                                <span>{isExpanded ? (isEn ? 'Hide details' : 'Ẩn chi tiết') : (isEn ? 'Festival details' : 'Chi tiết lễ hội')}</span>
                              </button>
                            )}

                            {post.has_re_fit_3d && post.outfitConfig && (
                              <button
                                type="button"
                                onClick={() => onApplyOutfitConfigTo3D(post.outfitConfig!)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-white text-[11px] font-semibold backdrop-blur-xs cursor-pointer"
                              >
                                <Cuboid className="w-3 h-3 text-emerald-400" />
                                <span>{isEn ? 'Try 3D' : 'Thử 3D'}</span>
                              </button>
                            )}

                            {post.is_shoppable && (
                              <button
                                type="button"
                                onClick={() => setActiveCommunityTab('TAB_2_PARTNER_MARKETPLACE')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-white text-[11px] font-semibold backdrop-blur-xs cursor-pointer"
                              >
                                <Shirt className="w-3 h-3 text-amber-400" />
                                <span>{isEn ? 'Rent / Tailor' : 'Thuê / May'}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 3. ACTION BAR (ThumbsUp, AlignLeft, Share2 + Right Code2) */}
                      <div className="px-3.5 pt-3 pb-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3.5">
                            <button
                              type="button"
                              onClick={() => toggleLike(post.post_id)}
                              className="cursor-pointer transition-transform active:scale-125"
                              aria-label={isEn ? 'Like post' : 'Yêu thích bài viết'}
                            >
                              <ThumbsUp
                                className={`w-4 h-4 ${
                                  isLiked
                                    ? 'fill-amber-500 text-amber-600'
                                    : 'text-zinc-700 hover:text-zinc-950'
                                }`}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleExpand(post.post_id)}
                              className="text-zinc-700 hover:text-zinc-950 cursor-pointer"
                              aria-label={isEn ? 'Expand caption' : 'Mở rộng nội dung chú thích'}
                            >
                              <AlignLeft className="w-4 h-4" />
                            </button>

                            <a
                              href={post.original_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-700 hover:text-zinc-950"
                              aria-label={isEn ? 'Share / Open original' : 'Chia sẻ / Mở bài gốc'}
                            >
                              <Share2 className="w-4 h-4" />
                            </a>
                          </div>

                           <button
                            type="button"
                            onClick={() => toggleExpand(post.post_id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 cursor-pointer"
                          >
                            <span>{isExpanded ? (isEn ? 'Collapse' : 'Thu gọn') : (isEn ? 'Details' : 'Chi tiết')}</span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {/* Likes / Views metric */}
                        <p className="font-bold text-zinc-950 text-[11px]">{post.metricsLabel}</p>

                        {/* Compact Festival Preview on Card */}
                        {post.festivalDetails && !isExpanded && (
                          <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 text-[11px] space-y-0.5">
                            <p className="text-zinc-700">
                              <span className="font-semibold text-zinc-900">{isEn ? 'Date: ' : 'Thời gian: '}</span>
                              {post.festivalDetails.lunarDate}
                            </p>
                            <p className="text-zinc-600 truncate">
                              <span className="font-semibold text-zinc-900">{isEn ? 'Rituals: ' : 'Nghi thức: '}</span>
                              {post.festivalDetails.mainRituals}
                            </p>
                          </div>
                        )}

                        {/* Instagram Inline Username + Title + "... xem thêm" */}
                        <div className="text-zinc-800 leading-relaxed">
                          <span className="font-bold text-zinc-950 mr-1.5">{cleanUsername}</span>
                          <span className="font-medium text-zinc-900">{post.title}</span>

                          {!isExpanded ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(post.post_id)}
                              className="ml-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                            >
                              {isEn ? '... view details' : '... xem chi tiết'}
                            </button>
                          ) : (
                            <div className="mt-2 space-y-2 text-zinc-600">
                              {post.festivalDetails && (
                                <div className="p-3 rounded-xl bg-zinc-950 text-white space-y-1.5 text-[11px]">
                                  <p className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                                    {isEn ? 'Traditional Festival Information' : 'Thông tin Lễ hội Truyền thống'}
                                  </p>
                                  <p>
                                    <span className="text-zinc-400">{isEn ? 'Date: ' : 'Thời gian: '}</span>
                                    <span className="font-semibold text-white">
                                      {post.festivalDetails.lunarDate}
                                    </span>
                                  </p>
                                  <p>
                                    <span className="text-zinc-400">{isEn ? 'Location: ' : 'Địa điểm: '}</span>
                                    <span className="font-semibold text-white">
                                      {post.festivalDetails.location}
                                    </span>
                                  </p>
                                  <p>
                                    <span className="text-zinc-400">{isEn ? 'Main Rituals: ' : 'Nghi thức chính: '}</span>
                                    <span className="text-zinc-100">
                                      {post.festivalDetails.mainRituals}
                                    </span>
                                  </p>
                                  <p>
                                    <span className="text-zinc-400">{isEn ? 'Heritage: ' : 'Di sản: '}</span>
                                    <span className="font-semibold text-amber-300">
                                      {post.festivalDetails.heritageStatus}
                                    </span>
                                  </p>
                                  <ul className="space-y-1 pl-4 list-disc text-zinc-200 pt-1 border-t border-white/10">
                                    {post.festivalDetails.highlights.map((item, idx) => (
                                      <li key={idx}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <p>{post.caption}</p>
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {post.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="text-blue-600 font-medium text-[11px]"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleExpand(post.post_id)}
                                className="text-[11px] text-zinc-400 hover:text-zinc-700 cursor-pointer block"
                              >
                                {isEn ? 'Collapse' : 'Thu gọn'}
                              </button>
                            </div>
                          )}
                        </div>

                        <p className="text-[10px] text-zinc-400 uppercase tracking-wide">
                          {post.publishedAt}
                        </p>

                        {isJsonOpen && (
                          <div className="pt-2 border-t border-zinc-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-mono-tabular text-zinc-400">
                                JSON · TAB_1_SOCIAL_TRENDS
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopySocialSchema(post)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-950 cursor-pointer"
                              >
                                {copiedId === post.post_id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>{isEn ? 'Copied' : 'Đã chép'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>{isEn ? 'Copy Schema' : 'Chép mã'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-2 rounded-xl bg-zinc-950 text-zinc-100 text-[10px] font-mono-tabular overflow-x-auto max-h-44">
                              {JSON.stringify(jsonOutputSchema, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: CỬA HÀNG ĐỐI TÁC (INSTAGRAM SHOP INSPIRED)                   */}
        {/* =================================================================== */}
        {activeCommunityTab === 'TAB_2_PARTNER_MARKETPLACE' && (
          <div className="mt-4 space-y-4">
            {/* Simple Horizontal Category Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { id: 'ALL', label: isEn ? 'All Boutiques' : 'Tất cả tiệm' },
                    { id: 'VERIFIED_RENTAL_SHOP', label: isEn ? 'Rental' : 'Cho thuê' },
                    { id: 'VERIFIED_TAILOR', label: isEn ? 'Tailors' : 'Nhà may' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPartnerShopFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      partnerShopFilter === tab.id
                        ? 'bg-zinc-950 text-white'
                        : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-950'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                {(
                  [
                    { id: 'ALL', label: isEn ? 'Nationwide' : 'Toàn quốc' },
                    { id: 'MIEN_BAC', label: isEn ? 'North' : 'Miền Bắc' },
                    { id: 'MIEN_TRUNG', label: isEn ? 'Central' : 'Miền Trung' },
                    { id: 'MIEN_NAM', label: isEn ? 'South' : 'Miền Nam' },
                  ] as const
                ).map((reg) => (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => setPartnerRegionFilter(reg.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      partnerRegionFilter === reg.id
                        ? 'bg-zinc-200 text-zinc-950 font-bold'
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CẦU NỐI GỬI SỐ ĐO MAY ĐO 1-TOUCH (B2B MEASUREMENT BRIDGE FROM TAB 1) */}
            <div className="mb-4 p-3.5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Ruler className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">
                    {isEn ? 'Sync 3D Measurements for Fast Tailoring' : 'Đồng bộ Số đo 3D đặt may nhanh'}
                  </div>
                  <div className="text-[11px] text-zinc-300 mt-0.5">
                    {isEn ? 'Current 3D metrics:' : 'Thông số 3D hiện tại:'}{' '}
                    <strong className="text-emerald-400">
                      {isEn ? 'Height' : 'Cao'} {b2bMeasurementPayload?.outfit_3d_config.body_measurements.height_cm || tailorHeightCm}cm ·{' '}
                      {isEn ? 'Bust-Waist-Hips' : '3 vòng'} {b2bMeasurementPayload?.outfit_3d_config.body_measurements.chest_cm || computedChestCm}-
                      {b2bMeasurementPayload?.outfit_3d_config.body_measurements.waist_cm || computedWaistCm}-
                      {b2bMeasurementPayload?.outfit_3d_config.body_measurements.hip_cm || computedHipCm}cm ·{' '}
                      Size {b2bMeasurementPayload?.outfit_3d_config.recommended_size || 'M'}
                    </strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const firstTailor =
                    filteredPartners.find((p) => p.tailoring_available) || partners[0];
                  if (firstTailor) {
                    setActivePartnerModal({ partner: firstTailor, mode: 'tailor' });
                    setPartnerActionSuccess(null);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>{isEn ? 'Send Measurements to Tailor' : 'Gửi số đo đặt may'}</span>
              </button>
            </div>

            {/* Instagram Shop-Style Partner Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
              {filteredPartners.map((partner) => {
                const localizedPartner = getLocalizedPartner(partner, isEn);
                const isExpanded = Boolean(expandedIds[partner.vendor_id]);
                const isJsonOpen = Boolean(openJsonIds[partner.post_id]);
                const partnerSchema = buildPartnerTabMandatoryJson(partner);

                return (
                  <article
                    key={partner.vendor_id}
                    className="bg-white rounded-2xl border border-zinc-200/90 overflow-hidden flex flex-col shadow-2xs"
                  >
                    {/* Shop Header */}
                    <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {localizedPartner.vendor_name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => toggleExpand(partner.vendor_id)}
                              className="text-xs font-bold text-zinc-950 hover:text-blue-600 truncate cursor-pointer"
                            >
                              {localizedPartner.vendor_name}
                            </button>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          </div>
                          <button
                            type="button"
                            onClick={() => onSelectLocationOnMap?.(partner.google_maps_address)}
                            className="text-[11px] text-zinc-500 hover:text-zinc-900 truncate flex items-center gap-0.5 cursor-pointer"
                          >
                            <MapPin className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                            <span className="truncate">
                              {localizedPartner.region_label.split(' · ')[0]}
                            </span>
                          </button>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span>{partner.rating}</span>
                      </span>
                    </div>

                    {/* Square Product / Atelier Photo */}
                    <div className="relative aspect-[4/3] w-full bg-zinc-100 overflow-hidden">
                      <ResilientImage
                        src={partner.image_url}
                        alt={localizedPartner.vendor_name}
                        fallbackTitle={localizedPartner.vendor_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-black/75 text-white text-[11px] font-bold backdrop-blur-xs">
                          {isEn ? 'Rent' : 'Thuê'}: {localizedPartner.rental_price_per_day}
                        </span>
                        <button
                          type="button"
                          onClick={() => onApplyOutfitConfigTo3D(partner.outfitConfig)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/95 hover:bg-white text-zinc-950 text-[11px] font-bold shadow-xs cursor-pointer"
                        >
                          <Cuboid className="w-3 h-3 text-emerald-600" />
                          <span>{isEn ? 'Try 3D' : 'Thử 3D'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Shop Info & Clean Action Buttons */}
                    <div className="p-3.5 space-y-3 text-xs">
                      <div>
                        <p className="font-bold text-zinc-900 line-clamp-1">
                          {localizedPartner.specialty_title}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {partner.tailoring_available
                            ? isEn
                              ? `3D Bespoke Tailoring: ${localizedPartner.tailoring_price_from}`
                              : `May theo số đo 3D: Từ ${partner.tailoring_price_from}`
                            : isEn
                            ? 'Costume & accessory rental services'
                            : 'Dịch vụ cho thuê trang phục & phụ kiện'}
                        </p>

                        {isExpanded && (
                          <div className="mt-2 p-2.5 rounded-xl bg-zinc-50 text-zinc-600 text-[11px] space-y-1">
                            <p>{localizedPartner.description}</p>
                            <p className="text-zinc-500">📍 {partner.google_maps_address}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActivePartnerModal({ partner, mode: 'rent' });
                            setPartnerActionSuccess(null);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Shirt className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isEn ? 'Book Rental' : 'Đặt thuê'}</span>
                        </button>

                        {partner.tailoring_available && (
                          <button
                            type="button"
                            onClick={() => {
                              setActivePartnerModal({ partner, mode: 'tailor' });
                              setPartnerActionSuccess(null);
                            }}
                            className="flex-1 py-2 px-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Ruler className="w-3.5 h-3.5 text-blue-600" />
                            <span>{isEn ? 'Tailor 3D' : 'May 3D'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleExpand(partner.vendor_id)}
                          title={isEn ? 'View atelier details' : 'Xem chi tiết cửa hàng'}
                          className="p-2 rounded-xl border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 cursor-pointer"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MODAL 1: ĐĂNG BÀI MỚI (4 MỤC NHẬP + AI TỰ QUÉT)                     */}
        {/* =================================================================== */}
        {createPostModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden text-xs max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-950">
                  {isEn ? 'Create New Community Post' : 'Tạo bài viết mới'}
                </h3>
                <button
                  type="button"
                  onClick={() => setCreatePostModalOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePostSubmit} className="p-4 space-y-3.5 overflow-y-auto">
                {/* 1. TIÊU ĐỀ */}
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    {isEn ? '1. Title *' : '1. Tiêu đề *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder={
                      isEn
                        ? 'e.g. Wearing Áo Ngũ Thân at Temple of Literature...'
                        : 'VD: Diện Áo Ngũ Thân nhận bằng tại Văn Miếu...'
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white font-medium"
                  />
                </div>

                {/* 2. ĐĂNG ẢNH */}
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    {isEn ? '2. Upload Photo' : '2. Đăng ảnh'}
                  </label>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                    <span className="text-zinc-500 truncate">
                      {newPostCustomImage
                        ? isEn
                          ? 'Photo selected from device'
                          : 'Đã chọn ảnh từ máy'
                        : isEn
                        ? 'Auto-generate photo if left empty'
                        : 'Tự động lấy ảnh nếu để trống'}
                    </span>
                    <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 font-semibold shrink-0 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Choose photo' : 'Chọn ảnh'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileUpload(e, setNewPostCustomImage)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* 3. LINK TỪ NỀN TẢNG KHÁC */}
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    {isEn
                      ? '3. Original Post Link (TikTok / Instagram / Facebook) *'
                      : '3. Link bài gốc (TikTok / Instagram / Facebook) *'}
                  </label>
                  <div className="relative">
                    <Link2 className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      required
                      value={newPostUrl}
                      onChange={(e) => setNewPostUrl(e.target.value)}
                      placeholder="https://www.instagram.com/p/..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-zinc-200 bg-white font-mono-tabular text-[11px]"
                    />
                  </div>
                </div>

                {/* 4. PHẦN CHÚ THÍCH */}
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    {isEn ? '4. Caption *' : '4. Chú thích *'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newPostCaption}
                    onChange={(e) => setNewPostCaption(e.target.value)}
                    placeholder={
                      isEn
                        ? 'Share your thoughts, location, 3D outfit link or rental/tailor link...'
                        : 'Viết cảm nhận, tên địa điểm, link mẫu 3D hoặc link thuê/may...'
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white leading-relaxed"
                  />

                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-zinc-400">
                      {isEn ? 'Quick insert:' : 'Gợi ý chèn:'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setNewPostCaption((prev) => `${prev} tại Văn Miếu - Quốc Tử Giám.`.trim())
                      }
                      className="px-2 py-0.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-medium cursor-pointer"
                    >
                      {isEn ? '+ Location' : '+ Địa điểm'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewPostCaption((prev) =>
                          `${prev} https://vietphuc.app/3d/CFG_${studioSelection.garmentId
                            .replace(/-/g, '_')
                            .toUpperCase()}`.trim()
                        )
                      }
                      className="px-2 py-0.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-medium cursor-pointer"
                    >
                      {isEn ? '+ 3D Model' : '+ Link mẫu 3D'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewPostCaption((prev) =>
                          `${prev} https://vietphuc.app/rent/y-van-hien`.trim()
                        )
                      }
                      className="px-2 py-0.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-medium cursor-pointer"
                    >
                      {isEn ? '+ Rental/Tailor' : '+ Link thuê/may'}
                    </button>
                  </div>
                </div>

                {/* Compact Live AI Detection Summary */}
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-zinc-800 inline-flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isEn ? 'AI auto-detected from post:' : 'AI tự nhận diện từ bài viết:'}</span>
                    </span>
                    <span className="text-zinc-500">{liveAIScan.platform}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        liveAIScan.location_query
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-zinc-200/70 text-zinc-500'
                      }`}
                    >
                      📍 {liveAIScan.location_query ? liveAIScan.location_query.split(',')[0] : (isEn ? 'No location' : 'Chưa có địa điểm')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        liveAIScan.has_re_fit_3d
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-zinc-200/70 text-zinc-500'
                      }`}
                    >
                      🧊 {liveAIScan.has_re_fit_3d ? (isEn ? 'Has 3D Model' : 'Có mẫu 3D') : (isEn ? 'No 3D link' : 'Không có link 3D')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        liveAIScan.is_shoppable
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-zinc-200/70 text-zinc-500'
                      }`}
                    >
                      🛍️ {liveAIScan.is_shoppable ? (isEn ? 'Has Rental Link' : 'Có link thuê/may') : (isEn ? 'No rental link' : 'Không có link thuê')}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {liveAIScan.tags.map((tag) => (
                      <span key={tag} className="text-[11px] text-blue-600 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSyncing}
                  className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {isEn ? 'Share Post' : 'Chia sẻ bài viết'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MODAL 2: ĐĂNG KÝ TIỆM ĐỐI TÁC / CHO THUÊ                            */}
        {/* =================================================================== */}
        {registerPartnerModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden text-xs max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-950">
                  {isEn ? 'Register Atelier / Rental Shop' : 'Đăng ký Cửa hàng / Cho thuê'}
                </h3>
                <button
                  type="button"
                  onClick={() => setRegisterPartnerModalOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRegisterPartnerSubmit} className="p-4 space-y-3 overflow-y-auto">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    {isEn ? 'Shop / Atelier Name *' : 'Tên tiệm / Thương hiệu *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={regVendorName}
                    onChange={(e) => setRegVendorName(e.target.value)}
                    placeholder={
                      isEn ? 'e.g. Lac Viet Traditional Costume Studio' : 'VD: Lạc Việt Cổ Phục Studio'
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      {isEn ? 'Service' : 'Dịch vụ'}
                    </label>
                    <select
                      value={regShopType}
                      onChange={(e) =>
                        setRegShopType(
                          e.target.value as 'VERIFIED_RENTAL_SHOP' | 'VERIFIED_TAILOR'
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white font-medium"
                    >
                      <option value="VERIFIED_RENTAL_SHOP">
                        {isEn ? 'Rental Shop' : 'Tiệm cho thuê'}
                      </option>
                      <option value="VERIFIED_TAILOR">
                        {isEn ? 'Tailor & Rental' : 'Nhà may & Cho thuê'}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      {isEn ? 'Region' : 'Khu vực'}
                    </label>
                    <select
                      value={regRegion}
                      onChange={(e) =>
                        setRegRegion(e.target.value as 'MIEN_BAC' | 'MIEN_TRUNG' | 'MIEN_NAM')
                      }
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white font-medium"
                    >
                      <option value="MIEN_BAC">{isEn ? 'Northern Vietnam' : 'Miền Bắc'}</option>
                      <option value="MIEN_TRUNG">{isEn ? 'Central Vietnam' : 'Miền Trung'}</option>
                      <option value="MIEN_NAM">{isEn ? 'Southern Vietnam' : 'Miền Nam'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    {isEn ? 'Shop Address (Google Maps) *' : 'Địa chỉ cửa hàng (Google Maps) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder={
                      isEn ? 'e.g. 36 Hang Gai, Hoan Kiem, Hanoi' : 'VD: 36 Hàng Gai, Hoàn Kiếm, Hà Nội'
                    }
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      {isEn ? 'Primary Garment' : 'Trang phục chính'}
                    </label>
                    <select
                      value={regGarmentId}
                      onChange={(e) =>
                        setRegGarmentId(e.target.value as OutfitConfigCode['garmentId'])
                      }
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white font-medium"
                    >
                      <option value="ao-ngu-than">Áo Ngũ Thân</option>
                      <option value="ao-nhat-binh">Áo Nhật Bình</option>
                      <option value="ao-tu-than">Áo Tứ Thân</option>
                      <option value="ao-dai-ba-ba">Áo Bà Ba &amp; Áo Dài</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      {isEn ? 'Rental Price / Day *' : 'Giá thuê / ngày *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={regRentalPrice}
                      onChange={(e) => setRegRentalPrice(e.target.value)}
                      placeholder={isEn ? '240,000 VND/day' : '240.000đ/ngày'}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white font-semibold text-emerald-700"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <label className="flex items-center justify-between gap-2 cursor-pointer">
                    <span className="font-semibold text-zinc-800">
                      {isEn ? 'Accept Tailoring with 3D Measurements' : 'Nhận may theo số đo 3D'}
                    </span>
                    <input
                      type="checkbox"
                      checked={regTailoringAvailable}
                      onChange={(e) => setRegTailoringAvailable(e.target.checked)}
                      className="w-4 h-4 accent-zinc-900"
                    />
                  </label>

                  {regTailoringAvailable && (
                    <input
                      type="text"
                      value={regTailoringPrice}
                      onChange={(e) => setRegTailoringPrice(e.target.value)}
                      placeholder={
                        isEn
                          ? 'Tailoring price from (e.g. 2,000,000 VND/set)'
                          : 'Giá may từ (VD: 2.000.000đ/bộ)'
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <span className="text-zinc-500">
                    {regCustomImage
                      ? isEn
                        ? 'Profile photo selected'
                        : 'Đã chọn ảnh đại diện'
                      : isEn
                      ? 'Default profile photo'
                      : 'Ảnh đại diện mặc định'}
                  </span>
                  <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 font-semibold cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Upload Photo' : 'Tải ảnh'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, setRegCustomImage)}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold cursor-pointer"
                >
                  {isEn ? 'Complete Registration' : 'Hoàn tất đăng ký'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MODAL 3: ĐẶT THUÊ & MAY ĐO THEO SỐ ĐO 3D                            */}
        {/* =================================================================== */}
        {activePartnerModal && (() => {
          const { partner, mode } = activePartnerModal;
          const localizedPartner = getLocalizedPartner(partner, isEn);

          return (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-md rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden text-xs">
                <div className="p-4 border-b border-zinc-100 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950">{localizedPartner.vendor_name}</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      📍 {partner.google_maps_address}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePartnerModal(null)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1 p-1.5 bg-zinc-100">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePartnerModal({ partner, mode: 'rent' });
                      setPartnerActionSuccess(null);
                    }}
                    className={`py-1.5 rounded-lg font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                      mode === 'rent' ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-600'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isEn ? 'Book Rental' : 'Đặt lịch thuê'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePartnerModal({ partner, mode: 'tailor' });
                      setPartnerActionSuccess(null);
                    }}
                    className={`py-1.5 rounded-lg font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                      mode === 'tailor' ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-600'
                    }`}
                  >
                    <Ruler className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isEn ? 'Send 3D Measurements' : 'Gửi số đo 3D'}</span>
                  </button>
                </div>

                {mode === 'rent' ? (
                  <div className="p-4 space-y-3">
                    <div className="p-3 rounded-xl bg-zinc-50 flex items-center justify-between">
                      <span className="text-zinc-600">{localizedPartner.specialty_title}</span>
                      <strong className="text-emerald-700 font-bold shrink-0 ml-2">
                        {localizedPartner.rental_price_per_day}
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-medium text-zinc-600 mb-1">
                          {isEn ? 'Pickup Date' : 'Ngày nhận'}
                        </label>
                        <input
                          type="date"
                          value={rentalDate}
                          onChange={(e) => setRentalDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-zinc-600 mb-1">
                          {isEn ? 'Rental Duration' : 'Số ngày thuê'}
                        </label>
                        <select
                          value={rentalDays}
                          onChange={(e) => setRentalDays(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium"
                        >
                          <option value={1}>{isEn ? '1 day' : '1 ngày'}</option>
                          <option value={2}>{isEn ? '2 days (-10%)' : '2 ngày (-10%)'}</option>
                          <option value={3}>{isEn ? '3 days (Combo)' : '3 ngày (Combo)'}</option>
                        </select>
                      </div>
                    </div>

                    {partnerActionSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                        {partnerActionSuccess}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const basePriceDigits = partner.rental_price_per_day.replace(/[^0-9]/g, '');
                        const dailyThousands = Math.max(
                          200,
                          Math.round(Number(basePriceDigits || 300000) / 1000)
                        );
                        const earnedPoints = dailyThousands * rentalDays;
                        if (onAwardOmnichannelPoints) {
                          onAwardOmnichannelPoints({
                            source: 'PARTNER_RENT_TAILOR',
                            sourceLabel: isEn ? 'Partner Rental/Tailoring (+10%)' : 'Thuê/May Đối tác (+10%)',
                            description: isEn
                              ? `Book ${rentalDays}-day rental at ${partner.vendor_name} (+${earnedPoints} Pts)`
                              : `Đặt thuê ${rentalDays} ngày tại ${partner.vendor_name} (+${earnedPoints} Điểm)`,
                            points: earnedPoints,
                          });
                        }
                        setPartnerActionSuccess(
                          isEn
                            ? `Reserved ${rentalDays}-day rental (pickup: ${rentalDate}) at ${partner.vendor_name} · Added +${earnedPoints} Heritage Points!`
                            : `Đã giữ lịch thuê ${rentalDays} ngày (nhận ${rentalDate}) tại ${partner.vendor_name} · Cộng +${earnedPoints} Điểm Di Sản!`
                        );
                      }}
                      className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold cursor-pointer"
                    >
                      {isEn ? 'Confirm Rental Booking' : 'Xác nhận đặt lịch thuê'}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-medium text-zinc-600 mb-1">
                          {isEn ? '3D Body Shape' : 'Vóc dáng 3D'}
                        </label>
                        <select
                          value={selectedBodyProfileId}
                          onChange={(e) =>
                            setSelectedBodyProfileId(e.target.value as BodyTypeProfile['id'])
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white font-medium"
                        >
                          {BODY_TYPE_PROFILES.map((b) => (
                            <option key={b.id} value={b.id}>
                              {isEn
                                ? b.id === 'can-doi'
                                  ? 'Balanced (Standard)'
                                  : b.id === 'cao-rao'
                                  ? 'Tall & Slender'
                                  : b.id === 'day-dan'
                                  ? 'Curvy / Fuller'
                                  : b.id === 'manh-mai'
                                  ? 'Slim / Lean'
                                  : b.id === 'nho-nhan'
                                  ? 'Petite'
                                  : b.label
                                : b.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-medium text-zinc-600 mb-1">
                          {isEn ? 'Height:' : 'Chiều cao:'} <strong>{tailorHeightCm} cm</strong>
                        </label>
                        <input
                          type="range"
                          min={148}
                          max={188}
                          value={tailorHeightCm}
                          onChange={(e) => setTailorHeightCm(Number(e.target.value))}
                          className="w-full accent-zinc-900 mt-1.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/70 text-center">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">
                          {isEn ? 'Bust' : 'Ngực'}
                        </span>
                        <strong className="font-mono-tabular text-zinc-950">
                          {computedChestCm}cm
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">
                          {isEn ? 'Waist' : 'Eo'}
                        </span>
                        <strong className="font-mono-tabular text-zinc-950">
                          {computedWaistCm}cm
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">
                          {isEn ? 'Hips' : 'Hông'}
                        </span>
                        <strong className="font-mono-tabular text-zinc-950">
                          {computedHipCm}cm
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">
                          {isEn ? 'Garment/Sleeve' : 'Dài áo/tay'}
                        </span>
                        <strong className="font-mono-tabular text-zinc-950">
                          {computedGarmentLengthCm}/{computedArmLengthCm}
                        </strong>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={tailorNote}
                      onChange={(e) => setTailorNote(e.target.value)}
                      placeholder={
                        isEn
                          ? 'Notes on fabric, occasion (optional)...'
                          : 'Ghi chú chất liệu vải, dịp mặc (tùy chọn)...'
                      }
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 bg-white"
                    />

                    {partnerActionSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                        {partnerActionSuccess}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const earnedPoints = 500;
                        if (onAwardOmnichannelPoints) {
                          onAwardOmnichannelPoints({
                            source: 'PARTNER_RENT_TAILOR',
                            sourceLabel: isEn ? 'Partner Rental/Tailoring (+10%)' : 'Thuê/May Đối tác (+10%)',
                            description: isEn
                              ? `Submitted 3D tailoring measurements to ${partner.vendor_name} (+${earnedPoints} Pts)`
                              : `Gửi số đo may đo 3D tại ${partner.vendor_name} (+${earnedPoints} Điểm)`,
                            points: earnedPoints,
                          });
                        }
                        setPartnerActionSuccess(
                          isEn
                            ? `Sent 3D measurements (${tailorHeightCm}cm · ${computedChestCm}-${computedWaistCm}-${computedHipCm}cm) to ${partner.vendor_name} · Added +${earnedPoints} Heritage Points!`
                            : `Đã gửi số đo 3D (${tailorHeightCm}cm · ${computedChestCm}-${computedWaistCm}-${computedHipCm}cm) tới ${partner.vendor_name} · Cộng +${earnedPoints} Điểm Di Sản!`
                        );
                      }}
                      className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isEn ? 'Send 3D Measurement Profile' : 'Gửi hồ sơ số đo 3D'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};
