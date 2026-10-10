import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  LogIn,
  LogOut,
  Settings,
  Palette,
  Sun,
  Moon,
  ScrollText,
  Check,
  X,
  RotateCcw,
  Award,
  Bookmark,
  Stamp,
  Edit3,
  Ticket,
  Copy,
  ChevronDown,
  ChevronUp,
  Box,
  Calendar,
  BookOpen,
  Trash2,
  Ruler,
  Send,
  Code2,
} from 'lucide-react';
import {
  UnlockedStampEntry,
  OmnichannelPointEntry,
  INITIAL_OMNICHANNEL_POINT_LOGS,
  evaluateProfileHeritageBadges,
  LookbookCardData,
  OutfitConfigCode,
  UPCOMING_HERITAGE_EVENTS,
  HERITAGE_NEWS_ARTICLES,
  VIETPHUC_LOCAL_STORAGE_KEY,
  VietPhucLocalStorageV1Schema,
  initializeOrLoadVietPhucLocalStorage,
  resetVietPhucLocalStorageToSeed,
  mutateSaveOutfit3DInLocalStorage,
  mutateGpsCheckInSuccessInLocalStorage,
  mutateRedeemVoucherInLocalStorage,
  HACKATHON_PITCH_DECK_10_SLIDES,
  UserAnthropometricMeasurements,
  INITIAL_USER_MEASUREMENTS,
  BodyShapePresetCode,
  computeSuggestedSizeFromMeasurements,
  buildMandatoryAccountProfileJson,
  StudioSelection,
} from '../data/vietPhucData';

export interface UserAccountProfile {
  name: string;
  handle: string;
  email: string;
  preferredGender: 'nam' | 'nu';
}

export interface AppUISettings {
  theme: 'light' | 'warm' | 'dark';
  fontScale: 'sm' | 'md' | 'lg';
  density: 'comfortable' | 'compact';
  autoSaveLocal: boolean;
  syncStudioWithMap: boolean;
}

export interface EventVoucherItem {
  id: string;
  code: string;
  title: string;
  description: string;
  pointsCost: number;
  expiryDate: string;
  redeemedAt?: string;
}

const HERITAGE_RANK_TIERS = [
  {
    id: 'tier-1',
    title: 'Thợ Phối Tập Sự',
    minStamps: 1,
    badgeId: 'BADGE_THANG_LONG_CO_TICH',
    badgeIcon: '🏰',
    badgeName: 'Thăng Long Cổ Tích',
  },
  {
    id: 'tier-2',
    title: 'Bậc Thầy Hành Trình',
    minStamps: 3,
    badgeId: 'BADGE_CO_DO_PHONG_HOA',
    badgeIcon: '👑',
    badgeName: 'Cố Đô Phong Hoa',
  },
  {
    id: 'tier-3',
    title: 'Sứ Giả Di Sản',
    minStamps: 5,
    badgeId: 'BADGE_HOI_AN_HOAI_CO',
    badgeIcon: '🏮',
    badgeName: 'Hội An Hoài Cổ',
  },
  {
    id: 'tier-4',
    title: 'Đại Sứ Văn Hóa',
    minStamps: 7,
    badgeId: 'BADGE_DAI_SU_VIET_PHUC',
    badgeIcon: '🐉',
    badgeName: 'Đại Sứ Việt Phục',
  },
] as const;

const REDEEMABLE_EVENT_VOUCHERS: EventVoucherItem[] = [
  {
    id: 'vch-phukien-10',
    code: 'VP-PHUKIEN10',
    title: 'Giảm 10% thuê phụ kiện Cổ phục',
    description: 'Áp dụng thuê khăn xếp, quạt trầm, guốc mộc tại tiệm đối tác',
    pointsCost: 100,
    expiryDate: '31/12/2026',
  },
  {
    id: 'vch-sukien-15',
    code: 'VP-SUKIEN15',
    title: 'Giảm 15% thuê Việt phục sự kiện',
    description: 'Áp dụng cho Áo Ngũ Thân, Nhật Bình, Tứ Thân dịp lễ hội',
    pointsCost: 150,
    expiryDate: '31/12/2026',
  },
  {
    id: 'vch-maydo-100k',
    code: 'VP-MAYDO100K',
    title: 'Voucher giảm 100.000đ may đo',
    description: 'Áp dụng khi gửi số đo 3D đặt may tại các nhà may đối tác',
    pointsCost: 200,
    expiryDate: '31/12/2026',
  },
  {
    id: 'vch-workshop-250',
    code: 'VP-WORKSHOP250',
    title: 'Vé ưu tiên Workshop & Lookbook',
    description: 'Tham gia sự kiện văn hóa & trải nghiệm chụp Lookbook cổ phục',
    pointsCost: 250,
    expiryDate: '31/12/2026',
  },
];

const INITIAL_OWNED_VOUCHERS: EventVoucherItem[] = [
  {
    id: 'vch-welcome-10',
    code: 'VP-WELCOME10',
    title: 'Giảm 10% thuê Việt phục tiêu chuẩn',
    description: 'Quà tặng thành viên mới tại hệ thống đối tác VietAura',
    pointsCost: 0,
    expiryDate: '31/12/2026',
    redeemedAt: 'Thành viên mới',
  },
];

const OWNED_VOUCHERS_STORAGE_KEY = 'viet_phuc_owned_vouchers';

interface UserAccountMenuProps {
  isLoggedIn: boolean;
  userProfile: UserAccountProfile;
  uiSettings: AppUISettings;
  savedCount: number;
  stampsCount: number;
  totalSitesCount: number;
  totalPoints: number;
  unlockedStamps?: UnlockedStampEntry[];
  omnichannelLogs?: OmnichannelPointEntry[];
  pinnedBadgeId?: string;
  onSelectPinnedBadge?: (badgeId: string) => void;
  savedLookbooks?: LookbookCardData[];
  onLoadSavedLookbook?: (item: LookbookCardData) => void;
  onRemoveSavedLookbook?: (item: LookbookCardData) => void;
  savedEventIds?: string[];
  onToggleSaveEvent?: (eventId: string) => void;
  savedArticleIds?: string[];
  onToggleSaveArticle?: (articleId: string) => void;
  onApplyOutfitConfigToStudio?: (config: OutfitConfigCode) => void;
  userMeasurements?: UserAnthropometricMeasurements;
  onUpdateMeasurements?: (next: UserAnthropometricMeasurements) => void;
  onSendMeasurementsToB2BMessages?: () => void;
  studioSelection?: StudioSelection;
  onLogin: (profile: UserAccountProfile) => void;
  onLogout: () => void;
  onUpdateProfile: (profile: UserAccountProfile) => void;
  onUpdateUISettings: (settings: AppUISettings) => void;
  onResetAllData: () => void;
}

export const UserAccountMenu: React.FC<UserAccountMenuProps> = ({
  isLoggedIn,
  userProfile,
  uiSettings,
  savedCount,
  stampsCount,
  totalSitesCount,
  totalPoints,
  unlockedStamps = [],
  omnichannelLogs = INITIAL_OMNICHANNEL_POINT_LOGS,
  pinnedBadgeId = 'BADGE_THANG_LONG_CO_TICH',
  onSelectPinnedBadge,
  savedLookbooks = [],
  onLoadSavedLookbook,
  onRemoveSavedLookbook,
  savedEventIds = ['evt-bach-hoa-thu-2026'],
  onToggleSaveEvent,
  savedArticleIds = ['news-le-hoi-den-hung-2026', 'news-toc-viet-co-phuc-2026'],
  onToggleSaveArticle,
  onApplyOutfitConfigToStudio,
  userMeasurements = INITIAL_USER_MEASUREMENTS,
  onUpdateMeasurements,
  onSendMeasurementsToB2BMessages,
  studioSelection,
  onLogin,
  onLogout,
  onUpdateProfile,
  onUpdateUISettings,
  onResetAllData,
}) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'profile' | 'saved' | 'voucher' | 'appearance' | 'settings'
  >('profile');
  const [savedSubTab, setSavedSubTab] = useState<'outfits' | 'events' | 'articles'>('outfits');
  const [voucherSubTab, setVoucherSubTab] = useState<'history' | 'redeem' | 'owned'>('history');
  const [pointSourceFilter, setPointSourceFilter] = useState<
    'ALL' | 'CHECKIN' | 'COMMUNITY' | 'RENTAL'
  >('ALL');
  const [pointsDetailModalOpen, setPointsDetailModalOpen] = useState<boolean>(false);
  const [localStorageModalOpen, setLocalStorageModalOpen] = useState<boolean>(false);
  const [pitchDeckModalOpen, setPitchDeckModalOpen] = useState<boolean>(false);
  const [localStorageState, setLocalStorageState] = useState<VietPhucLocalStorageV1Schema>(() =>
    initializeOrLoadVietPhucLocalStorage()
  );
  const [lastMutationSummary, setLastMutationSummary] = useState<string>(
    'Đã khởi tạo VIETPHUC_LOCAL_STORAGE_V1'
  );
  const [copiedLocalStorageJson, setCopiedLocalStorageJson] = useState<boolean>(false);
  const [showRoadmapDetails, setShowRoadmapDetails] = useState<boolean>(false);
  const [accountViewMode, setAccountViewMode] = useState<'MINIMAL_VIEW' | 'ADVANCED_EDIT'>(
    'MINIMAL_VIEW'
  );
  const [showAccountJsonSchema, setShowAccountJsonSchema] = useState<boolean>(false);
  const [copiedAccountJson, setCopiedAccountJson] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [voucherFeedback, setVoucherFeedback] = useState<string | null>(null);

  // Owned Vouchers State
  const [ownedVouchers, setOwnedVouchers] = useState<EventVoucherItem[]>(() => {
    try {
      const raw = localStorage.getItem(OWNED_VOUCHERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_OWNED_VOUCHERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(OWNED_VOUCHERS_STORAGE_KEY, JSON.stringify(ownedVouchers));
    } catch {
      // ignore storage errors
    }
  }, [ownedVouchers]);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(userProfile.name);
  const [editHandle, setEditHandle] = useState<string>(userProfile.handle);
  const [editEmail, setEditEmail] = useState<string>(userProfile.email);

  // Login form state
  const [loginName, setLoginName] = useState<string>('Nguyễn Minh Châu');
  const [loginEmail, setLoginEmail] = useState<string>('minhchau@vietphuc.vn');
  const [loginGender, setLoginGender] = useState<'nam' | 'nu'>('nu');

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setEditName(userProfile.name);
    setEditHandle(userProfile.handle);
    setEditEmail(userProfile.email);
  }, [userProfile]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const spentPoints = ownedVouchers.reduce((sum, item) => sum + (item.pointsCost || 0), 0);
  const availablePoints = Math.max(0, totalPoints - spentPoints);

  // Heritage Rank & Roadmap Calculation (Strictly by Check-in Location Count)
  const currentTierIndex =
    stampsCount >= 7 ? 3 : stampsCount >= 5 ? 2 : stampsCount >= 3 ? 1 : 0;
  const currentTier = HERITAGE_RANK_TIERS[currentTierIndex];
  const nextTier = HERITAGE_RANK_TIERS[currentTierIndex + 1] || null;
  const rankTitle = currentTier.title;

  const roadmapProgressPercent = Math.min(
    100,
    Math.round((stampsCount / Math.max(1, totalSitesCount)) * 100)
  );
  const sitesToNextTier = nextTier ? Math.max(0, nextTier.minStamps - stampsCount) : 0;

  // Omnichannel Breakdown & Profile Badges
  const stampPoints = unlockedStamps.reduce((sum, s) => sum + s.points_awarded, 0);
  const socialPoints = omnichannelLogs
    .filter((l) => l.source === 'SOCIAL_POST_SHARE')
    .reduce((sum, l) => sum + l.points, 0);
  const partnerPoints = omnichannelLogs
    .filter((l) => l.source === 'PARTNER_RENT_TAILOR')
    .reduce((sum, l) => sum + l.points, 0);
  const eventPoints = omnichannelLogs
    .filter((l) => l.source === 'CULTURAL_EVENT')
    .reduce((sum, l) => sum + l.points, 0);

  // Unified Point Accumulation History Entries
  const allPointHistoryEntries = [
    ...unlockedStamps.map((stamp) => ({
      id: `hist-stamp-${stamp.stamp_id}`,
      category: 'CHECKIN' as const,
      categoryLabel: 'Check-in di tích',
      description: `Check-in tại ${stamp.site_name} (${stamp.outfit_worn})`,
      points: stamp.points_awarded,
      timestamp: stamp.unlocked_at,
    })),
    ...omnichannelLogs.map((log) => {
      const category: 'CHECKIN' | 'COMMUNITY' | 'RENTAL' =
        log.source === 'SOCIAL_POST_SHARE'
          ? 'COMMUNITY'
          : log.source === 'PARTNER_RENT_TAILOR'
          ? 'RENTAL'
          : 'CHECKIN';
      const categoryLabel =
        category === 'COMMUNITY'
          ? 'Đăng bài cộng đồng'
          : category === 'RENTAL'
          ? 'Đơn thuê đồ'
          : 'Check-in & Sự kiện';
      return {
        id: log.id,
        category,
        categoryLabel,
        description: log.description,
        points: log.points,
        timestamp: log.timestamp,
      };
    }),
  ];

  const filteredPointHistory = allPointHistoryEntries.filter((entry) =>
    pointSourceFilter === 'ALL' ? true : entry.category === pointSourceFilter
  );

  const POINT_SOURCE_FILTER_OPTIONS = [
    { id: 'ALL' as const, label: 'Tất cả', count: allPointHistoryEntries.length },
    {
      id: 'CHECKIN' as const,
      label: 'Check-in di tích',
      count: allPointHistoryEntries.filter((e) => e.category === 'CHECKIN').length,
    },
    {
      id: 'COMMUNITY' as const,
      label: 'Đăng bài cộng đồng',
      count: allPointHistoryEntries.filter((e) => e.category === 'COMMUNITY').length,
    },
    {
      id: 'RENTAL' as const,
      label: 'Đơn thuê đồ',
      count: allPointHistoryEntries.filter((e) => e.category === 'RENTAL').length,
    },
  ];

  const profileBadges = evaluateProfileHeritageBadges(
    unlockedStamps,
    omnichannelLogs,
    pinnedBadgeId
  );
  const activePinnedBadge =
    profileBadges.find((b) => b.is_pinned) ||
    [...profileBadges].reverse().find((b) => b.is_unlocked) ||
    profileBadges[0];

  const initials =
    userProfile.name
      .trim()
      .split(/\s+/)
      .slice(-2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'VP';

  const handleRedeemVoucher = (voucher: EventVoucherItem) => {
    const alreadyOwned = ownedVouchers.some((v) => v.id === voucher.id);
    if (alreadyOwned) return;
    if (availablePoints < voucher.pointsCost) {
      setVoucherFeedback('Chưa đủ điểm sự kiện để đổi voucher này.');
      setTimeout(() => setVoucherFeedback(null), 2200);
      return;
    }

    const redeemedItem: EventVoucherItem = {
      ...voucher,
      redeemedAt: new Date().toLocaleDateString('vi-VN'),
    };
    setOwnedVouchers((prev) => [redeemedItem, ...prev]);
    const mutationRes = mutateRedeemVoucherInLocalStorage({
      voucher_code: voucher.code,
      discount_percent: 20,
      description: voucher.title,
      expiry_date: '2026-12-31',
      points_cost: voucher.pointsCost,
    });
    setLocalStorageState(mutationRes.state);
    setLastMutationSummary(mutationRes.mutation.new_value_summary);
    setVoucherFeedback(`Đã đổi thành công "${voucher.title}"!`);
    setTimeout(() => setVoucherFeedback(null), 2500);
  };

  const handleCopyVoucherCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
    } catch {
      // ignore
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const handleSaveProfileEdits = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...userProfile,
      name: editName.trim() || 'Bạn đọc Việt Phục',
      handle: editHandle.trim().startsWith('@')
        ? editHandle.trim()
        : `@${editHandle.trim() || 'vietphuc'}`,
      email: editEmail.trim() || 'user@vietphuc.vn',
    });
    setIsEditingProfile(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = loginName.trim() || 'Nguyễn Minh Châu';
    const generatedHandle =
      '@' +
      cleanName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 14) +
      '.vp';

    onLogin({
      name: cleanName,
      handle: generatedHandle,
      email: loginEmail.trim() || 'minhchau@vietphuc.vn',
      preferredGender: loginGender,
    });
    setLoginModalOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* CASE 1: NOT LOGGED IN -> Show "Đăng nhập" Button */}
      {!isLoggedIn ? (
        <button
          type="button"
          onClick={() => setLoginModalOpen(true)}
          title="Đăng nhập tài khoản"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Đăng nhập</span>
        </button>
      ) : (
        /* CASE 2: LOGGED IN -> Show Compact Account Avatar Icon */
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          title={`Tài khoản: ${userProfile.name} (${rankTitle})`}
          aria-expanded={menuOpen}
          className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer border ${
            menuOpen
              ? 'bg-zinc-950 text-white border-zinc-950 ring-2 ring-zinc-300'
              : 'bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800'
          }`}
        >
          <span>{initials}</span>
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"
            aria-hidden="true"
          />
        </button>
      )}

      {/* ACCOUNT & UI SETTINGS POPOVER (When Logged In & Clicked) */}
      {isLoggedIn && menuOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-zinc-200 shadow-xl z-50 overflow-hidden text-xs">
          {/* Top Account Header */}
          <div className="p-3.5 bg-zinc-50 border-b border-zinc-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-zinc-950 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-zinc-950 truncate text-sm">{userProfile.name}</p>
                  {activePinnedBadge && (
                    <span
                      title={`Huy hiệu đính Profile: ${activePinnedBadge.name}`}
                      className="px-1.5 py-0.5 rounded bg-zinc-200/80 text-zinc-800 text-[10px] font-semibold shrink-0"
                    >
                      {activePinnedBadge.icon} {activePinnedBadge.name}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                  {userProfile.handle} ·{' '}
                  <span className="text-zinc-900 font-semibold">{rankTitle}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 5-Tab Switcher: Tài khoản | Đã lưu (3 sub-tabs) | Voucher | Giao diện | Cài đặt */}
          <div className="grid grid-cols-5 gap-1 p-1.5 bg-zinc-100 border-b border-zinc-200/70 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`inline-flex items-center justify-center gap-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Hồ sơ</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`inline-flex items-center justify-center gap-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Bookmark className="w-3 h-3" />
              <span>Đã lưu</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('voucher')}
              className={`inline-flex items-center justify-center gap-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'voucher'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Ticket className="w-3 h-3" />
              <span>Voucher</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('appearance')}
              className={`inline-flex items-center justify-center gap-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'appearance'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Palette className="w-3 h-3" />
              <span>Giao diện</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`inline-flex items-center justify-center gap-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Settings className="w-3 h-3" />
              <span>Cài đặt</span>
            </button>
          </div>

          {/* TAB: QUẢN LÝ BỘ SƯU TẬP ĐÃ LƯU TRUNG TÂM (CENTRALIZED SAVED HUB - 3 SUB-TABS) */}
          {activeTab === 'saved' && (
            <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-950">
                  Bộ sưu tập Đã lưu Trung tâm
                </h4>
                <span className="text-[10px] text-zinc-500">
                  Tổng:{' '}
                  {savedLookbooks.length + savedEventIds.length + savedArticleIds.length} mục
                </span>
              </div>

              {/* 3 Sub-Tabs: Outfit 3D đã lưu | Sự kiện đã lưu | Bài viết đã lưu */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-xl text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => setSavedSubTab('outfits')}
                  className={`py-1.5 px-1.5 rounded-lg text-center transition-all cursor-pointer ${
                    savedSubTab === 'outfits'
                      ? 'bg-white text-zinc-950 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Outfit 3D ({savedLookbooks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSavedSubTab('events')}
                  className={`py-1.5 px-1.5 rounded-lg text-center transition-all cursor-pointer ${
                    savedSubTab === 'events'
                      ? 'bg-white text-zinc-950 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Sự kiện ({savedEventIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSavedSubTab('articles')}
                  className={`py-1.5 px-1.5 rounded-lg text-center transition-all cursor-pointer ${
                    savedSubTab === 'articles'
                      ? 'bg-white text-zinc-950 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Bài viết ({savedArticleIds.length})
                </button>
              </div>

              {/* SUB-TAB 1: OUTFIT 3D ĐÃ LƯU */}
              {savedSubTab === 'outfits' && (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
                  {savedLookbooks.length === 0 ? (
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 text-center text-zinc-400">
                      Chưa có Outfit 3D nào được lưu.
                    </div>
                  ) : (
                    savedLookbooks.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-zinc-950 truncate">
                            {item.outfitName}
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                            {item.mainGarment} · {item.occasionAndWeather}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {onLoadSavedLookbook && (
                            <button
                              type="button"
                              onClick={() => {
                                onLoadSavedLookbook(item);
                                setMenuOpen(false);
                              }}
                              className="px-2 py-1 rounded-lg bg-zinc-950 text-white text-[10px] font-semibold hover:bg-zinc-800 cursor-pointer inline-flex items-center gap-1"
                            >
                              <Box className="w-3 h-3" />
                              <span>Mở 3D</span>
                            </button>
                          )}
                          {onRemoveSavedLookbook && (
                            <button
                              type="button"
                              onClick={() => onRemoveSavedLookbook(item)}
                              title="Xóa khỏi bộ sưu tập"
                              className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* SUB-TAB 2: SỰ KIỆN ĐÃ LƯU */}
              {savedSubTab === 'events' && (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
                  {UPCOMING_HERITAGE_EVENTS.filter((e) => savedEventIds.includes(e.id)).length ===
                  0 ? (
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 text-center text-zinc-400">
                      Chưa có sự kiện văn hóa nào được lưu.
                    </div>
                  ) : (
                    UPCOMING_HERITAGE_EVENTS.filter((e) => savedEventIds.includes(e.id)).map(
                      (evt) => (
                        <div
                          key={evt.id}
                          className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-zinc-950 leading-snug">
                                {evt.title}
                              </p>
                              <p className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3 shrink-0" />
                                <span>
                                  {evt.dateLabel} · {evt.location}
                                </span>
                              </p>
                            </div>
                            {onToggleSaveEvent && (
                              <button
                                type="button"
                                onClick={() => onToggleSaveEvent(evt.id)}
                                title="Bỏ lưu sự kiện"
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60">
                            <span className="text-[10px] text-zinc-600 truncate">
                              {evt.dressCode}
                            </span>
                            {onApplyOutfitConfigToStudio && (
                              <button
                                type="button"
                                onClick={() => {
                                  onApplyOutfitConfigToStudio(evt.outfitConfig);
                                  setMenuOpen(false);
                                }}
                                className="px-2 py-1 rounded-lg bg-zinc-950 text-white text-[10px] font-semibold hover:bg-zinc-800 cursor-pointer"
                              >
                                🔮 Thử 3D
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              )}

              {/* SUB-TAB 3: BÀI VIẾT ĐÃ LƯU */}
              {savedSubTab === 'articles' && (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
                  {HERITAGE_NEWS_ARTICLES.filter((a) => savedArticleIds.includes(a.id)).length ===
                  0 ? (
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 text-center text-zinc-400">
                      Chưa có bài viết tư liệu nào được lưu.
                    </div>
                  ) : (
                    HERITAGE_NEWS_ARTICLES.filter((a) => savedArticleIds.includes(a.id)).map(
                      (art) => (
                        <div
                          key={art.id}
                          className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-zinc-950 leading-snug">
                                {art.title}
                              </p>
                              <p className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1">
                                <BookOpen className="w-3 h-3 shrink-0" />
                                <span>
                                  {art.categoryLabel} · {art.locationOrSource}
                                </span>
                              </p>
                            </div>
                            {onToggleSaveArticle && (
                              <button
                                type="button"
                                onClick={() => onToggleSaveArticle(art.id)}
                                title="Bỏ lưu bài viết"
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-zinc-200/60">
                            <span className="text-[10px] text-zinc-600 truncate">
                              {art.relatedGarmentName}
                            </span>
                            {onApplyOutfitConfigToStudio && (
                              <button
                                type="button"
                                onClick={() => {
                                  onApplyOutfitConfigToStudio(art.outfitConfig);
                                  setMenuOpen(false);
                                }}
                                className="px-2 py-1 rounded-lg bg-zinc-950 text-white text-[10px] font-semibold hover:bg-zinc-800 cursor-pointer"
                              >
                                🔮 Thử 3D
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: THÔNG TIN TÀI KHOẢN & LỘ TRÌNH DANH HIỆU 'DI SẢN' */}
          {activeTab === 'profile' && (
            <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto">
              {/* Quick Stats Row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('saved')}
                  className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-center transition-colors cursor-pointer"
                >
                  <div className="inline-flex items-center gap-1 text-zinc-500 text-[10px]">
                    <Bookmark className="w-3 h-3 text-zinc-700" />
                    <span>Đã lưu</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-950 mt-0.5">
                    {savedLookbooks.length + savedEventIds.length + savedArticleIds.length} mục
                  </p>
                </button>
                <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <div className="inline-flex items-center gap-1 text-zinc-500 text-[10px]">
                    <Stamp className="w-3 h-3 text-zinc-700" />
                    <span>Con dấu</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-950 mt-0.5">
                    {stampsCount}/{totalSitesCount}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('voucher')}
                  className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-center transition-colors cursor-pointer"
                >
                  <div className="inline-flex items-center gap-1 text-zinc-500 text-[10px]">
                    <Award className="w-3 h-3 text-zinc-800" />
                    <span>Điểm Di Sản</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-950 mt-0.5">{availablePoints}</p>
                </button>
              </div>

              {/* ===============================================================
                  MINIMALIST HERITAGE RANK & BADGE ROADMAP BY CHECK-IN COUNT
                  (Lộ trình Danh hiệu Di Sản & Huy hiệu theo số địa danh Check-in)
                 =============================================================== */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                {/* Header: Current Rank & Check-in Locations Progress */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block">
                      Danh hiệu Di Sản
                    </span>
                    <h4 className="text-xs font-bold text-zinc-950 mt-0.5">{rankTitle}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono-tabular text-zinc-950">
                      {stampsCount} / {totalSitesCount} địa danh
                    </span>
                    <span className="block text-[10px] text-zinc-500">
                      {nextTier
                        ? `Check-in thêm ${sitesToNextTier} địa danh nhận ${nextTier.badgeIcon} ${nextTier.badgeName}`
                        : 'Đã mở khóa toàn bộ huy hiệu'}
                    </span>
                  </div>
                </div>

                {/* Minimalist Progress Track + 4 Check-in Milestone Badges */}
                <div className="space-y-2">
                  <div className="h-1.5 w-full rounded-full bg-zinc-200 overflow-hidden">
                    <div
                      className="h-full bg-zinc-950 rounded-full transition-all duration-300"
                      style={{ width: `${roadmapProgressPercent}%` }}
                    />
                  </div>

                  {/* 4 Check-in Milestones (Click unlocked milestone to pin badge to Profile) */}
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    {HERITAGE_RANK_TIERS.map((tier) => {
                      const isUnlocked = stampsCount >= tier.minStamps;
                      const isPinned = activePinnedBadge?.badge_id === tier.badgeId && isUnlocked;

                      return (
                        <button
                          key={tier.id}
                          type="button"
                          disabled={!isUnlocked}
                          onClick={() => {
                            if (isUnlocked && onSelectPinnedBadge) {
                              onSelectPinnedBadge(tier.badgeId);
                            }
                          }}
                          className={`p-2 rounded-lg border text-left transition-all ${
                            isPinned
                              ? 'bg-zinc-950 border-zinc-950 text-white cursor-pointer'
                              : isUnlocked
                              ? 'bg-white border-zinc-200 text-zinc-900 hover:border-zinc-400 cursor-pointer'
                              : 'bg-zinc-100/70 border-zinc-200/50 text-zinc-400 opacity-65 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs">{tier.badgeIcon}</span>
                            <span
                              className={`text-[9px] font-mono-tabular px-1.5 py-0.5 rounded ${
                                isPinned
                                  ? 'bg-white/15 text-white'
                                  : isUnlocked
                                  ? 'bg-zinc-100 text-zinc-700 font-semibold'
                                  : 'bg-zinc-200/60 text-zinc-400'
                              }`}
                            >
                              {isPinned ? 'Đang đính' : `${tier.minStamps} địa danh`}
                            </span>
                          </div>
                          <p
                            className={`text-[10px] font-bold mt-1 leading-tight truncate ${
                              isPinned ? 'text-white' : 'text-zinc-900'
                            }`}
                          >
                            {tier.badgeName}
                          </p>
                          <p
                            className={`text-[9px] truncate mt-0.5 ${
                              isPinned ? 'text-zinc-300' : 'text-zinc-500'
                            }`}
                          >
                            {tier.title}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Expandable Omnichannel Points Breakdown (For Voucher Redemption) */}
                <div className="pt-2 border-t border-zinc-200/70">
                  <button
                    type="button"
                    onClick={() => setShowRoadmapDetails((prev) => !prev)}
                    className="w-full flex items-center justify-between text-[11px] font-semibold text-zinc-700 hover:text-zinc-950 cursor-pointer"
                  >
                    <span>Nguồn tích điểm đổi Voucher ({totalPoints} điểm)</span>
                    {showRoadmapDetails ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {showRoadmapDetails && (
                    <div className="mt-2 pt-2 border-t border-zinc-200/50">
                      <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                        <div className="p-1.5 rounded-lg bg-white border border-zinc-200/70">
                          <span className="block text-zinc-400">Check-in</span>
                          <strong className="text-zinc-900 font-bold">+{stampPoints}</strong>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white border border-zinc-200/70">
                          <span className="block text-zinc-400">Cộng đồng</span>
                          <strong className="text-zinc-900 font-bold">+{socialPoints}</strong>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white border border-zinc-200/70">
                          <span className="block text-zinc-400">Thuê/May</span>
                          <strong className="text-zinc-900 font-bold">+{partnerPoints}</strong>
                        </div>
                        <div className="p-1.5 rounded-lg bg-white border border-zinc-200/70">
                          <span className="block text-zinc-400">Sự kiện</span>
                          <strong className="text-zinc-900 font-bold">+{eventPoints}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Voucher & Points History Access inside Profile Tab */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Ticket className="w-4 h-4 text-zinc-800 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900 truncate">
                      Điểm Di Sản &amp; Voucher ({ownedVouchers.length})
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      Khả dụng: {availablePoints} điểm · {allPointHistoryEntries.length} giao dịch
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setPointsDetailModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-900 text-[11px] font-semibold cursor-pointer"
                  >
                    Lịch sử điểm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('voucher');
                      setVoucherSubTab('redeem');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-950 text-white text-[11px] font-semibold hover:bg-zinc-800 cursor-pointer"
                  >
                    Đổi điểm
                  </button>
                </div>
              </div>

              {/* ===============================================================
                  QUẢN LÝ SỐ ĐO NHÂN TRẮC HỌC CÁ NHÂN TỐI GIẢN (PROGRESSIVE DISCLOSURE)
                  - MINIMAL_VIEW (Mặc định): Chiều cao (cm) · Cân nặng (kg) · Size Chuẩn Gợi Ý
                  - ADVANCED_EDIT (Mở rộng): Ngực, Eo, Hông, Vai, Dài tay & Biểu đồ vóc dáng
                 =============================================================== */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Ruler className="w-3.5 h-3.5 text-zinc-800 shrink-0" />
                    <span className="font-bold text-zinc-950 truncate">
                      Thống kê Số đo Cá nhân 3D
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowAccountJsonSchema((prev) => !prev)}
                      title="Xem JSON Hồ sơ & Số đo"
                      className={`p-1 rounded-lg border cursor-pointer ${
                        showAccountJsonSchema
                          ? 'bg-zinc-950 text-white border-zinc-950'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:text-zinc-950'
                      }`}
                    >
                      <Code2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAccountViewMode((prev) =>
                          prev === 'MINIMAL_VIEW' ? 'ADVANCED_EDIT' : 'MINIMAL_VIEW'
                        )
                      }
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-zinc-200 text-[10px] font-semibold text-zinc-800 hover:bg-zinc-100 cursor-pointer"
                    >
                      <span>
                        {accountViewMode === 'MINIMAL_VIEW'
                          ? 'Chi tiết & Chỉnh sửa số đo'
                          : 'Thu gọn'}
                      </span>
                      {accountViewMode === 'MINIMAL_VIEW' ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronUp className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* MINIMAL_VIEW (Always visible summary card) */}
                <div className="p-2.5 rounded-xl bg-white border border-zinc-200/80 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold font-mono-tabular text-zinc-950">
                      <span>{userMeasurements.height_cm} cm</span>
                      <span className="text-zinc-300">·</span>
                      <span>{userMeasurements.weight_kg} kg</span>
                      <span className="text-zinc-300">·</span>
                      <span className="text-emerald-700">
                        Size {userMeasurements.suggested_size}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Độ vừa vặn may đo: {userMeasurements.fit_score_percent}% · Đồng bộ 2 chiều với Studio
                    </p>
                  </div>

                  {onSendMeasurementsToB2BMessages && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onSendMeasurementsToB2BMessages();
                      }}
                      title="Đóng gói tham số nhân trắc học gửi cho thợ may"
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Send className="w-3 h-3 text-emerald-400" />
                      <span>Gửi B2B</span>
                    </button>
                  )}
                </div>

                {/* ADVANCED_EDIT (Progressive Disclosure Drawer) */}
                {accountViewMode === 'ADVANCED_EDIT' && (
                  <div className="pt-2 border-t border-zinc-200/70 space-y-2.5">
                    {/* 5 Body Shape Presets */}
                    <div>
                      <span className="block text-[10px] font-semibold text-zinc-500 mb-1">
                        Dáng người chuẩn (Body Preset):
                      </span>
                      <div className="grid grid-cols-5 gap-1">
                        {(
                          [
                            { id: 'CAN_DOI', label: 'Cân đối' },
                            { id: 'MANH_MAI', label: 'Mảnh mai' },
                            { id: 'DAY_DAN', label: 'Đầy đặn' },
                            { id: 'CAO_RAO', label: 'Cao ráo' },
                            { id: 'NHO_NHAN', label: 'Nhỏ nhắn' },
                          ] as { id: BodyShapePresetCode; label: string }[]
                        ).map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              if (!onUpdateMeasurements) return;
                              const nextMap: Record<
                                BodyShapePresetCode,
                                Partial<UserAnthropometricMeasurements>
                              > = {
                                CAN_DOI: {
                                  height_cm: 162,
                                  weight_kg: 50,
                                  shoulder_width_cm: 38,
                                  chest_cm: 84,
                                  waist_cm: 64,
                                  hip_cm: 90,
                                  sleeve_length_cm: 52,
                                },
                                MANH_MAI: {
                                  height_cm: 164,
                                  weight_kg: 46,
                                  shoulder_width_cm: 36,
                                  chest_cm: 80,
                                  waist_cm: 60,
                                  hip_cm: 86,
                                  sleeve_length_cm: 53,
                                },
                                DAY_DAN: {
                                  height_cm: 160,
                                  weight_kg: 58,
                                  shoulder_width_cm: 40,
                                  chest_cm: 92,
                                  waist_cm: 72,
                                  hip_cm: 96,
                                  sleeve_length_cm: 51,
                                },
                                CAO_RAO: {
                                  height_cm: 172,
                                  weight_kg: 56,
                                  shoulder_width_cm: 40,
                                  chest_cm: 86,
                                  waist_cm: 65,
                                  hip_cm: 92,
                                  sleeve_length_cm: 56,
                                },
                                NHO_NHAN: {
                                  height_cm: 153,
                                  weight_kg: 44,
                                  shoulder_width_cm: 35,
                                  chest_cm: 78,
                                  waist_cm: 59,
                                  hip_cm: 85,
                                  sleeve_length_cm: 49,
                                },
                              };
                              const patch = nextMap[preset.id];
                              const h = patch.height_cm ?? userMeasurements.height_cm;
                              const w = patch.weight_kg ?? userMeasurements.weight_kg;
                              const c = patch.chest_cm ?? userMeasurements.chest_cm;
                              onUpdateMeasurements({
                                ...userMeasurements,
                                ...patch,
                                body_shape_preset: preset.id,
                                suggested_size: computeSuggestedSizeFromMeasurements(h, w, c),
                              });
                            }}
                            className={`py-1 px-1 rounded-md text-[10px] font-semibold border transition-colors cursor-pointer ${
                              userMeasurements.body_shape_preset === preset.id
                                ? 'bg-zinc-950 text-white border-zinc-950'
                                : 'bg-white text-zinc-600 border-zinc-200 hover:text-zinc-950'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sliders for Height, Weight, V1, V2, V3, Shoulder, Sleeve */}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {[
                        {
                          key: 'height_cm' as const,
                          label: 'Chiều cao',
                          min: 145,
                          max: 190,
                          unit: 'cm',
                        },
                        {
                          key: 'weight_kg' as const,
                          label: 'Cân nặng',
                          min: 40,
                          max: 90,
                          unit: 'kg',
                        },
                        {
                          key: 'chest_cm' as const,
                          label: 'Vòng 1 (Ngực)',
                          min: 72,
                          max: 110,
                          unit: 'cm',
                        },
                        {
                          key: 'waist_cm' as const,
                          label: 'Vòng 2 (Eo)',
                          min: 55,
                          max: 95,
                          unit: 'cm',
                        },
                        {
                          key: 'hip_cm' as const,
                          label: 'Vòng 3 (Hông)',
                          min: 78,
                          max: 112,
                          unit: 'cm',
                        },
                        {
                          key: 'shoulder_width_cm' as const,
                          label: 'Rộng vai',
                          min: 33,
                          max: 48,
                          unit: 'cm',
                        },
                        {
                          key: 'sleeve_length_cm' as const,
                          label: 'Dài tay áo',
                          min: 46,
                          max: 64,
                          unit: 'cm',
                        },
                      ].map((field) => (
                        <div
                          key={field.key}
                          className="p-2 rounded-lg bg-white border border-zinc-200/80 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-500 font-medium">{field.label}</span>
                            <strong className="font-mono-tabular text-zinc-950">
                              {userMeasurements[field.key]} {field.unit}
                            </strong>
                          </div>
                          <input
                            type="range"
                            min={field.min}
                            max={field.max}
                            value={userMeasurements[field.key]}
                            onChange={(e) => {
                              if (!onUpdateMeasurements) return;
                              const val = Number(e.target.value);
                              const nextObj = {
                                ...userMeasurements,
                                [field.key]: val,
                              };
                              nextObj.suggested_size = computeSuggestedSizeFromMeasurements(
                                nextObj.height_cm,
                                nextObj.weight_kg,
                                nextObj.chest_cm
                              );
                              onUpdateMeasurements(nextObj);
                            }}
                            className="w-full accent-zinc-950 cursor-pointer h-1"
                          />
                        </div>
                      ))}

                      {/* Visual Anthropometric Proportion Bars */}
                      <div className="p-2 rounded-lg bg-white border border-zinc-200/80 flex flex-col justify-between">
                        <span className="text-zinc-500 font-medium">Biểu đồ tỷ lệ 3 vòng</span>
                        <div className="space-y-1 mt-1">
                          {[
                            { label: 'V1', val: userMeasurements.chest_cm, max: 110 },
                            { label: 'V2', val: userMeasurements.waist_cm, max: 110 },
                            { label: 'V3', val: userMeasurements.hip_cm, max: 110 },
                          ].map((bar) => (
                            <div key={bar.label} className="flex items-center gap-1.5">
                              <span className="w-4 text-[9px] font-bold text-zinc-500">
                                {bar.label}
                              </span>
                              <div className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                                <div
                                  className="h-full bg-zinc-900 rounded-full"
                                  style={{ width: `${Math.round((bar.val / bar.max) * 100)}%` }}
                                />
                              </div>
                              <span className="text-[9px] font-mono-tabular text-zinc-700">
                                {bar.val}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* JSON Output Schema Preview for Account & Measurements */}
                {showAccountJsonSchema && (
                  <div className="pt-2 border-t border-zinc-200/70 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-zinc-700">
                        JSON Schema Hồ sơ &amp; Số đo (GLOBAL_HEADER_USER_ACCOUNT)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const schemaObj = buildMandatoryAccountProfileJson({
                            accountViewMode,
                            username: userProfile.handle.replace('@', '') || 'Nhi_CổPhục',
                            displayTitleCode:
                              stampsCount >= 7
                                ? 'DAI_SU_VAN_HOA'
                                : stampsCount >= 5
                                ? 'SU_GIA_DI_SAN'
                                : stampsCount >= 3
                                ? 'BAC_THAY_HANH_TRINH'
                                : 'THO_PHOI_TAP_SU',
                            pinnedBadgeId: activePinnedBadge?.badge_id || 'BADGE_THANG_LONG',
                            measurements: userMeasurements,
                            selection: studioSelection || {
                              gender: userProfile.preferredGender,
                              garmentId: 'ao-ngu-than',
                              paletteId: 'khue-van-tri-thuc',
                              lowerGarmentId: 'quan-lua-trang',
                              motifId: 'am-hoa-tron',
                              accessoryIds: ['khan-xep', 'quat-tram-huong'],
                              footwearId: 'guoc-go-moc',
                              occasionId: 'tot-nghiep',
                              weatherId: 'thu-ha-noi',
                            },
                          });
                          try {
                            navigator.clipboard.writeText(JSON.stringify(schemaObj, null, 2));
                            setCopiedAccountJson(true);
                            setTimeout(() => setCopiedAccountJson(false), 1800);
                          } catch {
                            // ignore
                          }
                        }}
                        className="inline-flex items-center gap-1 font-semibold text-zinc-900 hover:underline cursor-pointer"
                      >
                        {copiedAccountJson ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedAccountJson ? 'Đã chép' : 'Sao chép JSON'}</span>
                      </button>
                    </div>
                    <pre className="p-2.5 rounded-xl bg-zinc-950 text-zinc-100 text-[10px] font-mono-tabular overflow-x-auto max-h-48 leading-relaxed">
                      {JSON.stringify(
                        buildMandatoryAccountProfileJson({
                          accountViewMode,
                          username: userProfile.handle.replace('@', '') || 'Nhi_CổPhục',
                          displayTitleCode:
                            stampsCount >= 7
                              ? 'DAI_SU_VAN_HOA'
                              : stampsCount >= 5
                              ? 'SU_GIA_DI_SAN'
                              : stampsCount >= 3
                              ? 'BAC_THAY_HANH_TRINH'
                              : 'THO_PHOI_TAP_SU',
                          pinnedBadgeId: activePinnedBadge?.badge_id || 'BADGE_THANG_LONG',
                          measurements: userMeasurements,
                          selection: studioSelection || {
                            gender: userProfile.preferredGender,
                            garmentId: 'ao-ngu-than',
                            paletteId: 'khue-van-tri-thuc',
                            lowerGarmentId: 'quan-lua-trang',
                            motifId: 'am-hoa-tron',
                            accessoryIds: ['khan-xep', 'quat-tram-huong'],
                            footwearId: 'guoc-go-moc',
                            occasionId: 'tot-nghiep',
                            weatherId: 'thu-ha-noi',
                          },
                        }),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>

              {/* Profile Details or Edit Form */}
              {isEditingProfile ? (
                <form onSubmit={handleSaveProfileEdits} className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-0.5">
                      Tên hiển thị
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-0.5">
                      ID người dùng (Handle)
                    </label>
                    <input
                      type="text"
                      value={editHandle}
                      onChange={(e) => setEditHandle(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 mb-0.5">
                      Email liên kết
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-900"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 font-semibold cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-zinc-950 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Lưu</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-700">Thông tin cá nhân</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-900 hover:underline cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Chỉnh sửa</span>
                    </button>
                  </div>
                  <div className="space-y-1 text-[11px] text-zinc-600">
                    <p>
                      <span className="text-zinc-400">Họ tên:</span>{' '}
                      <strong className="text-zinc-900">{userProfile.name}</strong>
                    </p>
                    <p>
                      <span className="text-zinc-400">Email:</span>{' '}
                      <span className="text-zinc-800">{userProfile.email}</span>
                    </p>
                  </div>

                  {/* Preferred Studio Model Gender */}
                  <div className="pt-2 border-t border-zinc-200/70 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-600">
                      Mô hình thử đồ mặc định:
                    </span>
                    <div className="inline-flex p-0.5 rounded-lg bg-zinc-200/70">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateProfile({ ...userProfile, preferredGender: 'nu' })
                        }
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                          userProfile.preferredGender === 'nu'
                            ? 'bg-white text-zinc-950 shadow-2xs'
                            : 'text-zinc-600'
                        }`}
                      >
                        Nữ
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateProfile({ ...userProfile, preferredGender: 'nam' })
                        }
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                          userProfile.preferredGender === 'nam'
                            ? 'bg-white text-zinc-950 shadow-2xs'
                            : 'text-zinc-600'
                        }`}
                      >
                        Nam
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="w-full py-2 px-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất tài khoản</span>
              </button>
            </div>
          )}

          {/* TAB 2: MỤC ĐIỂM DI SẢN & VOUCHER (LỊCH SỬ TÍCH LŨY, ĐỔI ĐIỂM & VOUCHER ĐANG CÓ) */}
          {activeTab === 'voucher' && (
            <div className="p-4 space-y-3">
              {/* Points Balance Bar + Full Detail Modal Trigger */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-zinc-800" />
                    <span className="font-semibold text-zinc-700">Điểm Di Sản khả dụng</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Tổng tích lũy: {totalPoints}đ · Đã đổi: {spentPoints}đ
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-bold text-zinc-950">
                    {availablePoints} điểm
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setPointsDetailModalOpen(true);
                    }}
                    className="text-[10px] font-semibold text-zinc-900 underline hover:text-zinc-600 cursor-pointer"
                  >
                    Mở trang chi tiết ↗
                  </button>
                </div>
              </div>

              {/* 3-Tab Switcher: Lịch sử điểm | Đổi Voucher | Đang có */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-xl text-[11px]">
                <button
                  type="button"
                  onClick={() => setVoucherSubTab('history')}
                  className={`py-1.5 px-1.5 rounded-lg font-semibold text-center transition-all cursor-pointer ${
                    voucherSubTab === 'history'
                      ? 'bg-white text-zinc-950 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Lịch sử ({allPointHistoryEntries.length})
                </button>
                <button
                  type="button"
                  onClick={() => setVoucherSubTab('redeem')}
                  className={`py-1.5 px-1.5 rounded-lg font-semibold text-center transition-all cursor-pointer ${
                    voucherSubTab === 'redeem'
                      ? 'bg-white text-zinc-950 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Đổi điểm ({REDEEMABLE_EVENT_VOUCHERS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setVoucherSubTab('owned')}
                  className={`py-1.5 px-1.5 rounded-lg font-semibold text-center transition-all cursor-pointer ${
                    voucherSubTab === 'owned'
                      ? 'bg-white text-zinc-950 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Đang có ({ownedVouchers.length})
                </button>
              </div>

              {voucherFeedback && (
                <div className="px-3 py-2 rounded-xl bg-zinc-900 text-white text-[11px] font-medium flex items-center justify-between">
                  <span>{voucherFeedback}</span>
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
              )}

              {/* SUB-TAB 0: LỊCH SỬ TÍCH LŨY ĐIỂM DI SẢN KÈM BỘ LỌC NGUỒN ĐIỂM */}
              {voucherSubTab === 'history' && (
                <div className="space-y-2.5">
                  {/* Source Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                    {POINT_SOURCE_FILTER_OPTIONS.map((opt) => {
                      const isActive = pointSourceFilter === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPointSourceFilter(opt.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-zinc-950 text-white'
                              : 'bg-zinc-100 text-zinc-600 hover:text-zinc-950'
                          }`}
                        >
                          {opt.label} ({opt.count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Filtered Point Accumulation Entries */}
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-0.5">
                    {filteredPointHistory.length === 0 ? (
                      <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 text-center text-zinc-400">
                        Chưa có giao dịch tích điểm nào thuộc nguồn này.
                      </div>
                    ) : (
                      filteredPointHistory.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-zinc-200/80 text-zinc-800 text-[9px] font-semibold">
                                {item.categoryLabel}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono-tabular">
                                {item.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] font-medium text-zinc-900 mt-1 leading-snug">
                              {item.description}
                            </p>
                          </div>
                          <span className="text-xs font-bold font-mono-tabular text-zinc-950 shrink-0">
                            +{item.points}đ
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* SUB-TAB 1: ĐỔI ĐIỂM DI SẢN LẤY VOUCHER */}
              {voucherSubTab === 'redeem' && (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
                  {REDEEMABLE_EVENT_VOUCHERS.map((vch) => {
                    const isOwned = ownedVouchers.some((v) => v.id === vch.id);
                    const canAfford = availablePoints >= vch.pointsCost;

                    return (
                      <div
                        key={vch.id}
                        className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-950 leading-snug">{vch.title}</p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">{vch.description}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-zinc-200/80 text-zinc-900 font-bold text-[10px] whitespace-nowrap shrink-0">
                            {vch.pointsCost} điểm
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-zinc-200/60">
                          <span className="text-[10px] text-zinc-400">HSD: {vch.expiryDate}</span>
                          <button
                            type="button"
                            disabled={isOwned || !canAfford}
                            onClick={() => handleRedeemVoucher(vch)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                              isOwned
                                ? 'bg-zinc-200 text-zinc-500 cursor-default'
                                : canAfford
                                ? 'bg-zinc-950 text-white hover:bg-zinc-800 cursor-pointer'
                                : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                            }`}
                          >
                            {isOwned ? 'Đã đổi' : canAfford ? 'Đổi voucher' : 'Chưa đủ điểm'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SUB-TAB 2: XEM CÁC VOUCHER ĐANG CÓ */}
              {voucherSubTab === 'owned' && (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
                  {ownedVouchers.length === 0 ? (
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 text-center text-zinc-400">
                      Chưa có voucher nào.
                    </div>
                  ) : (
                    ownedVouchers.map((vch) => (
                      <div
                        key={vch.id}
                        className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-950 leading-snug">{vch.title}</p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">{vch.description}</p>
                          </div>
                          <span className="text-[10px] text-zinc-400 whitespace-nowrap shrink-0">
                            HSD: {vch.expiryDate}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-zinc-200/60">
                          <code className="px-2 py-0.5 rounded bg-white border border-zinc-200 text-[11px] font-mono font-bold text-zinc-900">
                            {vch.code}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyVoucherCode(vch.code)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 text-white text-[11px] font-semibold hover:bg-zinc-800 cursor-pointer"
                          >
                            {copiedCode === vch.code ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Sao chép mã</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ĐIỀU CHỈNH GIAO DIỆN */}
          {activeTab === 'appearance' && (
            <div className="p-4 space-y-3.5">
              {/* Surface / Color Theme */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-zinc-700">
                  1. Tông màu giao diện (Theme)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateUISettings({ ...uiSettings, theme: 'light' })}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer ${
                      uiSettings.theme === 'light'
                        ? 'border-zinc-950 bg-zinc-950 text-white font-bold'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-[11px]">Sáng chuẩn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateUISettings({ ...uiSettings, theme: 'warm' })}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer ${
                      uiSettings.theme === 'warm'
                        ? 'border-amber-800 bg-amber-900 text-white font-bold'
                        : 'border-amber-200 bg-amber-50/60 text-amber-950 hover:bg-amber-100/70'
                    }`}
                  >
                    <ScrollText className="w-4 h-4" />
                    <span className="text-[11px]">Giấy Dó ấm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateUISettings({ ...uiSettings, theme: 'dark' })}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer ${
                      uiSettings.theme === 'dark'
                        ? 'border-blue-600 bg-blue-600 text-white font-bold'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-[11px]">Tối dịu mắt</span>
                  </button>
                </div>
              </div>

              {/* Font Scale */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-zinc-700">
                  2. Cỡ chữ hiển thị (Text Size)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'sm', label: 'Nhỏ gọn' },
                      { id: 'md', label: 'Tiêu chuẩn' },
                      { id: 'lg', label: 'Lớn dễ đọc' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onUpdateUISettings({ ...uiSettings, fontScale: opt.id })}
                      className={`py-2 px-2.5 rounded-xl border text-center font-semibold cursor-pointer ${
                        uiSettings.fontScale === opt.id
                          ? 'border-zinc-950 bg-zinc-950 text-white'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Density */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-zinc-700">
                  3. Khoảng cách bố cục (Layout)
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateUISettings({ ...uiSettings, density: 'comfortable' })
                    }
                    className={`py-2 px-3 rounded-xl border font-semibold cursor-pointer ${
                      uiSettings.density === 'comfortable'
                        ? 'border-zinc-950 bg-zinc-950 text-white'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    Thoáng đãng
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateUISettings({ ...uiSettings, density: 'compact' })}
                    className={`py-2 px-3 rounded-xl border font-semibold cursor-pointer ${
                      uiSettings.density === 'compact'
                        ? 'border-zinc-950 bg-zinc-950 text-white'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    Thu gọn
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CÀI ĐẶT HỆ THỐNG (SETTINGS) */}
          {activeTab === 'settings' && (
            <div className="p-4 space-y-3">
              <label className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 cursor-pointer">
                <p className="font-semibold text-zinc-900">Tự động lưu Bộ sưu tập &amp; Con dấu</p>
                <input
                  type="checkbox"
                  checked={uiSettings.autoSaveLocal}
                  onChange={(e) =>
                    onUpdateUISettings({ ...uiSettings, autoSaveLocal: e.target.checked })
                  }
                  className="w-4 h-4 accent-zinc-950 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 cursor-pointer">
                <p className="font-semibold text-zinc-900">Đồng bộ trang phục với Bản đồ</p>
                <input
                  type="checkbox"
                  checked={uiSettings.syncStudioWithMap}
                  onChange={(e) =>
                    onUpdateUISettings({ ...uiSettings, syncStudioWithMap: e.target.checked })
                  }
                  className="w-4 h-4 accent-zinc-950 rounded cursor-pointer"
                />
              </label>

              <div className="pt-2 border-t border-zinc-100 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setLocalStorageState(initializeOrLoadVietPhucLocalStorage());
                    setLocalStorageModalOpen(true);
                    setMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>Trình quản lý VIETPHUC_LOCAL_STORAGE_V1</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPitchDeckModalOpen(true);
                    setMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ScrollText className="w-3.5 h-3.5" />
                  <span>Kịch bản Pitch Deck Hackathon (10 Slides)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOwnedVouchers(INITIAL_OWNED_VOUCHERS);
                    try {
                      localStorage.removeItem(OWNED_VOUCHERS_STORAGE_KEY);
                    } catch {
                      // ignore
                    }
                    const resetRes = resetVietPhucLocalStorageToSeed();
                    setLocalStorageState(resetRes.state);
                    onResetAllData();
                    setMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục giao diện &amp; dữ liệu mặc định</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETAILED HERITAGE POINTS HISTORY & VOUCHER REDEMPTION MODAL */}
      {pointsDetailModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPointsDetailModalOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden text-xs max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-950">
                  Lịch sử tích lũy Điểm Di Sản &amp; Quy đổi Voucher
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Theo dõi chi tiết các nguồn tích điểm và đổi ưu đãi dịch vụ Việt phục
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPointsDetailModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Top Summary Metrics Row */}
            <div className="p-4 border-b border-zinc-100 bg-white grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-zinc-950 text-white">
                <span className="text-[10px] text-zinc-400 block">Điểm khả dụng</span>
                <p className="text-base font-bold font-mono-tabular mt-0.5">
                  {availablePoints} điểm
                </p>
                <span className="text-[10px] text-zinc-400">
                  Tổng tích lũy: {totalPoints}đ
                </span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                <span className="text-[10px] text-zinc-500 block">Check-in di tích</span>
                <p className="text-sm font-bold text-zinc-950 font-mono-tabular mt-0.5">
                  +{stampPoints + eventPoints} điểm
                </p>
                <span className="text-[10px] text-zinc-400">{stampsCount} địa danh đã đóng dấu</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                <span className="text-[10px] text-zinc-500 block">Đăng bài cộng đồng</span>
                <p className="text-sm font-bold text-zinc-950 font-mono-tabular mt-0.5">
                  +{socialPoints} điểm
                </p>
                <span className="text-[10px] text-zinc-400">+20 điểm / bài hợp lệ</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
                <span className="text-[10px] text-zinc-500 block">Đơn thuê / may đồ</span>
                <p className="text-sm font-bold text-zinc-950 font-mono-tabular mt-0.5">
                  +{partnerPoints} điểm
                </p>
                <span className="text-[10px] text-zinc-400">+10% giá trị đơn hàng</span>
              </div>
            </div>

            {/* 2-Column Body: Left = Point History + Source Filter | Right = Redeemable & Owned Vouchers */}
            <div className="p-4 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* LEFT 7 COLUMNS: POINT ACCUMULATION HISTORY WITH SOURCE FILTERS */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-zinc-950">
                    Lịch sử tích lũy Điểm Di Sản ({filteredPointHistory.length})
                  </h4>
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {POINT_SOURCE_FILTER_OPTIONS.map((opt) => {
                      const isActive = pointSourceFilter === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPointSourceFilter(opt.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-zinc-950 text-white'
                              : 'bg-zinc-100 text-zinc-600 hover:text-zinc-950'
                          }`}
                        >
                          {opt.label} ({opt.count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {filteredPointHistory.length === 0 ? (
                    <div className="p-6 rounded-xl bg-zinc-50 border border-zinc-200/70 text-center text-zinc-400">
                      Chưa có lịch sử tích điểm nào trong danh mục này.
                    </div>
                  ) : (
                    filteredPointHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-800 text-[10px] font-semibold">
                              {item.categoryLabel}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono-tabular">
                              {item.timestamp}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-zinc-900 mt-1.5 leading-snug">
                            {item.description}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-950 text-white text-xs font-bold font-mono-tabular shrink-0">
                          +{item.points} điểm
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* RIGHT 5 COLUMNS: VOUCHER REDEMPTION & OWNED VOUCHERS */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-950">
                    Danh sách Voucher quy đổi ({REDEEMABLE_EVENT_VOUCHERS.length})
                  </h4>
                  <span className="text-[11px] font-semibold text-zinc-500">
                    Đang sở hữu: {ownedVouchers.length}
                  </span>
                </div>

                {voucherFeedback && (
                  <div className="px-3 py-2 rounded-xl bg-zinc-900 text-white text-[11px] font-medium flex items-center justify-between">
                    <span>{voucherFeedback}</span>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                )}

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {REDEEMABLE_EVENT_VOUCHERS.map((vch) => {
                    const isOwned = ownedVouchers.some((v) => v.id === vch.id);
                    const canAfford = availablePoints >= vch.pointsCost;

                    return (
                      <div
                        key={vch.id}
                        className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-950 leading-snug">{vch.title}</p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">{vch.description}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-zinc-200/80 text-zinc-900 font-bold text-[10px] whitespace-nowrap shrink-0">
                            {vch.pointsCost} điểm
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-zinc-200/60">
                          <span className="text-[10px] text-zinc-400">HSD: {vch.expiryDate}</span>
                          <button
                            type="button"
                            disabled={isOwned || !canAfford}
                            onClick={() => handleRedeemVoucher(vch)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                              isOwned
                                ? 'bg-zinc-200 text-zinc-500 cursor-default'
                                : canAfford
                                ? 'bg-zinc-950 text-white hover:bg-zinc-800 cursor-pointer'
                                : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                            }`}
                          >
                            {isOwned ? 'Đã quy đổi' : canAfford ? 'Quy đổi ngay' : 'Chưa đủ điểm'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Owned Vouchers Quick List */}
                <div className="pt-2 border-t border-zinc-200 space-y-2">
                  <h5 className="text-[11px] font-bold text-zinc-700">
                    Mã Voucher của bạn ({ownedVouchers.length})
                  </h5>
                  <div className="space-y-1.5 max-h-[130px] overflow-y-auto pr-1">
                    {ownedVouchers.map((vch) => (
                      <div
                        key={vch.id}
                        className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-zinc-900 truncate">
                            {vch.title}
                          </p>
                          <code className="text-[10px] font-mono text-zinc-600">{vch.code}</code>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyVoucherCode(vch.code)}
                          className="px-2 py-1 rounded-lg bg-zinc-950 text-white text-[10px] font-semibold shrink-0 cursor-pointer"
                        >
                          {copiedCode === vch.code ? 'Đã chép' : 'Sao chép'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL (When Not Logged In & User Clicks "Đăng nhập") */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden text-xs">
            <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-950">
                Đăng nhập VietAura
              </h3>
              <button
                type="button"
                onClick={() => setLoginModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Tên hiển thị của bạn
                </label>
                <input
                  type="text"
                  required
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Minh Châu"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 font-medium focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Email tài khoản
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ban@vietphuc.vn"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-zinc-900 font-medium focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">
                  Mô hình Phòng thử ưu tiên
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginGender('nu')}
                    className={`py-2 rounded-xl border font-semibold cursor-pointer ${
                      loginGender === 'nu'
                        ? 'border-zinc-950 bg-zinc-950 text-white'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    Mẫu Nữ
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginGender('nam')}
                    className={`py-2 rounded-xl border font-semibold cursor-pointer ${
                      loginGender === 'nam'
                        ? 'border-zinc-950 bg-zinc-950 text-white'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    Mẫu Nam
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLoginModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-zinc-200 text-zinc-600 font-semibold hover:bg-zinc-50 cursor-pointer"
                >
                  Để sau
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập ngay</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIETPHUC_LOCAL_STORAGE_V1 SEED & MUTATION MANAGER */}
      {localStorageModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLocalStorageModalOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden text-xs max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-950">
                  Local Storage Persistence &amp; Dummy Database ({VIETPHUC_LOCAL_STORAGE_KEY})
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Quản lý dữ liệu Client-side 100% Offline cho bản Demo Hackathon
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLocalStorageModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              {/* Mutation Triggers */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-zinc-950">
                    Thao tác Cập nhật Trạng thái Cục bộ (Local Data Mutations)
                  </span>
                  <span className="text-[11px] text-zinc-600 font-mono">
                    {lastMutationSummary}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const res = mutateSaveOutfit3DInLocalStorage({
                        outfit_id: `LOOK_00${localStorageState.local_saved_items.saved_outfits_3d.length + 1}`,
                        title: 'Nhật Bình Hoàng Kim',
                        outfit_type: 'NHAT_BINH',
                        primary_hex: '#B45309',
                      });
                      setLocalStorageState(res.state);
                      setLastMutationSummary(res.mutation.new_value_summary);
                    }}
                    className="py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold cursor-pointer text-center"
                  >
                    + Lưu Outfit 3D
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const res = mutateGpsCheckInSuccessInLocalStorage({
                        stamp_id: 'STAMP_HOANG_THANH',
                        stamp_name: 'Hoàng Thành Thăng Long',
                        new_badge_code: 'BADGE_CO_DO_PHONG_HOA',
                      });
                      setLocalStorageState(res.state);
                      setLastMutationSummary(res.mutation.new_value_summary);
                    }}
                    className="py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold cursor-pointer text-center"
                  >
                    + GPS Check-in (+100đ)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const res = mutateRedeemVoucherInLocalStorage({
                        voucher_code: 'DISCOUNT30_TAILOR',
                        discount_percent: 30,
                        description: 'Giảm 30% phí may đo Cổ phục',
                        expiry_date: '2026-12-31',
                        points_cost: 100,
                      });
                      setLocalStorageState(res.state);
                      setLastMutationSummary(res.mutation.new_value_summary);
                    }}
                    className="py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold cursor-pointer text-center"
                  >
                    - Đổi Voucher (-100đ)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const seed = resetVietPhucLocalStorageToSeed();
                      setLocalStorageState(seed.state);
                      setLastMutationSummary(seed.mutation.new_value_summary);
                    }}
                    className="py-2 px-3 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-800 font-semibold cursor-pointer text-center"
                  >
                    Reset Seed Mặc định
                  </button>
                </div>
              </div>

              {/* Live JSON Inspector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">
                    JSON Schema hiện tại trong localStorage[&quot;{VIETPHUC_LOCAL_STORAGE_KEY}&quot;]
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText(JSON.stringify(localStorageState, null, 2));
                        setCopiedLocalStorageJson(true);
                        setTimeout(() => setCopiedLocalStorageJson(false), 1800);
                      } catch {
                        // ignore
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 text-white font-semibold cursor-pointer"
                  >
                    {copiedLocalStorageJson ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Đã sao chép JSON</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép Dummy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-[11px] overflow-x-auto max-h-[420px] leading-relaxed">
                  {JSON.stringify(localStorageState, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: 10-SLIDE HACKATHON PITCH DECK STRUCTURE */}
      {pitchDeckModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPitchDeckModalOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden text-xs max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-950">
                  Kịch bản Slide Thuyết trình Pitch Deck (10 Slides Hackathon Structure)
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Title &amp; Hook ➔ Problem ➔ Solution ➔ Core Tech ➔ Live Demo (3 phút) ➔ Business Model ➔ B2B ➔ GTM ➔ Roadmap ➔ Closing Vision
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPitchDeckModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
              {HACKATHON_PITCH_DECK_10_SLIDES.map((slide) => (
                <div
                  key={slide.slide_number}
                  className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between gap-2"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-zinc-950 text-white font-bold text-[10px]">
                        SLIDE {slide.slide_number} · {slide.slide_code}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-500">
                        {slide.demo_or_metric_highlight}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-zinc-950">{slide.title}</h4>
                    <p className="text-[11px] font-medium text-zinc-600">{slide.subtitle}</p>
                    <ul className="space-y-1 text-[11px] text-zinc-700 list-disc pl-4">
                      {slide.key_points.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
