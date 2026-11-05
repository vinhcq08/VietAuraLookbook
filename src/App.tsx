import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Archive,
  Cuboid,
  MessagesSquare,
  Map,
  Users,
  BookOpen,
  X,
  Sparkles,
} from 'lucide-react';
import {
  CURATED_LOOKBOOKS,
  INITIAL_SOCIAL_POSTS,
  INITIAL_UNLOCKED_STAMPS,
  HERITAGE_MAP_SITES,
  StudioSelection,
  LookbookCardData,
  LOOKBOOK_PALETTES,
  SocialPostItem,
  OutfitConfigCode,
  UnlockedStampEntry,
  OmnichannelPointEntry,
  ActiveSystemTab,
  MandatorySystemJsonOutputSchema,
  UserAnthropometricMeasurements,
  INITIAL_USER_MEASUREMENTS,
  INITIAL_OMNICHANNEL_POINT_LOGS,
  normalizeSelectionForGenderAndGarment,
  initializeOrLoadVietPhucLocalStorage,
  mutateSaveOutfit3DInLocalStorage,
  mutateGpsCheckInSuccessInLocalStorage,
  resetVietPhucLocalStorageToSeed,
} from './data/vietPhucData';
import { VirtualFittingRoom3D } from './components/VirtualFittingRoom3D';
import { CulturalAdvisorSection } from './components/CulturalAdvisorSection';
import { HeritageMapPassportSection } from './components/HeritageMapPassportSection';
import { SocialPostsHubSection } from './components/SocialPostsHubSection';
import { TRANSLATIONS } from './utils/i18n';
import {
  UserAccountMenu,
  UserAccountProfile,
  AppUISettings,
} from './components/UserAccountMenu';

const INITIAL_STUDIO_SELECTION: StudioSelection = {
  gender: 'nu',
  garmentId: 'ao-ngu-than',
  paletteId: 'khue-van-tri-thuc',
  lowerGarmentId: 'quan-lua-trang',
  motifId: 'am-hoa-tron',
  accessoryIds: ['khan-xep', 'quat-tram-huong'],
  footwearId: 'guoc-go-moc',
  occasionId: 'tot-nghiep',
  weatherId: 'thu-ha-noi',
};

const DEFAULT_USER_PROFILE: UserAccountProfile = {
  name: 'Nguyễn Minh Châu',
  handle: '@minhchau.vp',
  email: 'minhchau@vietphuc.vn',
  preferredGender: 'nu',
};

const DEFAULT_UI_SETTINGS: AppUISettings = {
  theme: 'light',
  fontScale: 'md',
  density: 'comfortable',
  autoSaveLocal: true,
  syncStudioWithMap: true,
  language: 'vi',
};

export type MainNavigationTab = ActiveSystemTab | 'TAB_MESSAGES';

export default function App() {
  const [activeMainTab, setActiveMainTab] = useState<MainNavigationTab>(
    'TAB_3_COMMUNITY_MARKETPLACE'
  );
  const [b2bMeasurementPayload, setB2bMeasurementPayload] =
    useState<MandatorySystemJsonOutputSchema | null>(null);
  const [openB2BMarketplaceTrigger, setOpenB2BMarketplaceTrigger] = useState<number | null>(null);

  const [studioSelection, setStudioSelection] = useState<StudioSelection>(INITIAL_STUDIO_SELECTION);
  const [lookbooks, setLookbooks] = useState<LookbookCardData[]>(CURATED_LOOKBOOKS);
  const [socialPosts, setSocialPosts] = useState<SocialPostItem[]>(INITIAL_SOCIAL_POSTS);
  const [savedIds, setSavedIds] = useState<string[]>(['lb-khue-van-tri-thuc']);
  const [savedEventIds, setSavedEventIds] = useState<string[]>(['evt-bach-hoa-thu-2026']);
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>([
    'news-le-hoi-den-hung-2026',
    'news-toc-viet-co-phuc-2026',
  ]);
  const [unlockedStamps, setUnlockedStamps] =
    useState<UnlockedStampEntry[]>(INITIAL_UNLOCKED_STAMPS);
  const [omnichannelLogs, setOmnichannelLogs] = useState<OmnichannelPointEntry[]>(
    INITIAL_OMNICHANNEL_POINT_LOGS
  );
  const [pinnedBadgeId, setPinnedBadgeId] = useState<string>('BADGE_THANG_LONG_CO_TICH');
  const [externalMapQuery, setExternalMapQuery] = useState<string | null>(null);
  const [externalPromptTrigger, setExternalPromptTrigger] = useState<{
    id: number;
    prompt: string;
  } | null>(null);
  const [openFittingCollectionTrigger, setOpenFittingCollectionTrigger] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Account & UI Settings State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserAccountProfile>(DEFAULT_USER_PROFILE);
  const [uiSettings, setUiSettings] = useState<AppUISettings>(DEFAULT_UI_SETTINGS);
  const [userMeasurements, setUserMeasurements] = useState<UserAnthropometricMeasurements>(
    INITIAL_USER_MEASUREMENTS
  );
  const [externalSendMeasurementsTrigger, setExternalSendMeasurementsTrigger] = useState<
    number | null
  >(null);
  const [stylingMode, setStylingMode] = useState<'STRICT_HERITAGE' | 'MODERN_FUSION'>(
    'STRICT_HERITAGE'
  );
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);

  useEffect(() => {
    try {
      initializeOrLoadVietPhucLocalStorage();
      const rawSaved = localStorage.getItem('viet_phuc_saved_ids');
      if (rawSaved) {
        setSavedIds(JSON.parse(rawSaved));
      }
      const rawStamps = localStorage.getItem('viet_phuc_unlocked_stamps');
      if (rawStamps) {
        setUnlockedStamps(JSON.parse(rawStamps));
      }
      const rawAuth = localStorage.getItem('viet_phuc_is_logged_in');
      if (rawAuth !== null) {
        setIsLoggedIn(JSON.parse(rawAuth));
      }
      const rawProfile = localStorage.getItem('viet_phuc_user_profile');
      if (rawProfile) {
        setUserProfile(JSON.parse(rawProfile));
      }
      const rawUi = localStorage.getItem('viet_phuc_ui_settings');
      if (rawUi) {
        setUiSettings(JSON.parse(rawUi));
      }
      const rawLogs = localStorage.getItem('viet_phuc_omnichannel_logs');
      if (rawLogs) {
        setOmnichannelLogs(JSON.parse(rawLogs));
      }
      const rawBadge = localStorage.getItem('viet_phuc_pinned_badge');
      if (rawBadge) {
        setPinnedBadgeId(rawBadge);
      }
      const rawEvents = localStorage.getItem('viet_phuc_saved_events');
      if (rawEvents) {
        const parsedEvents = JSON.parse(rawEvents);
        if (Array.isArray(parsedEvents)) setSavedEventIds(parsedEvents);
      }
      const rawArticles = localStorage.getItem('viet_phuc_saved_articles');
      if (rawArticles) {
        const parsedArticles = JSON.parse(rawArticles);
        if (Array.isArray(parsedArticles)) setSavedArticleIds(parsedArticles);
      }
      const rawMeasurements = localStorage.getItem('viet_phuc_user_measurements');
      if (rawMeasurements) {
        const parsedMeasurements = JSON.parse(rawMeasurements);
        if (parsedMeasurements && typeof parsedMeasurements === 'object') {
          setUserMeasurements({
            ...INITIAL_USER_MEASUREMENTS,
            ...parsedMeasurements,
          });
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Apply UI Settings to root <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-ui-theme', uiSettings.theme);
    root.setAttribute('data-ui-scale', uiSettings.fontScale);
    root.setAttribute('data-ui-density', uiSettings.density);
  }, [uiSettings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const scrollToSection = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = (profile: UserAccountProfile) => {
    setIsLoggedIn(true);
    setUserProfile(profile);
    setStudioSelection((prev) =>
      normalizeSelectionForGenderAndGarment(
        prev,
        profile.preferredGender,
        prev.garmentId,
        prev.paletteId
      )
    );
    try {
      localStorage.setItem('viet_phuc_is_logged_in', JSON.stringify(true));
      localStorage.setItem('viet_phuc_user_profile', JSON.stringify(profile));
    } catch {
      // Ignore storage errors
    }
    const isEn = (uiSettings.language || 'vi') === 'en';
    showToast(
      isEn
        ? `Welcome ${profile.name}! Signed in successfully.`
        : `Xin chào ${profile.name}! Đã đăng nhập thành công.`
    );
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.setItem('viet_phuc_is_logged_in', JSON.stringify(false));
    } catch {
      // Ignore storage errors
    }
    const isEn = (uiSettings.language || 'vi') === 'en';
    showToast(isEn ? 'Signed out successfully' : 'Đã đăng xuất tài khoản');
  };

  const handleUpdateProfile = (profile: UserAccountProfile) => {
    setUserProfile(profile);
    setStudioSelection((prev) =>
      normalizeSelectionForGenderAndGarment(
        prev,
        profile.preferredGender,
        prev.garmentId,
        prev.paletteId
      )
    );
    try {
      localStorage.setItem('viet_phuc_user_profile', JSON.stringify(profile));
    } catch {
      // Ignore storage errors
    }
    const isEn = (uiSettings.language || 'vi') === 'en';
    showToast(isEn ? 'Account profile updated' : 'Đã cập nhật thông tin tài khoản');
  };

  const handleUpdateUISettings = (nextSettings: AppUISettings) => {
    setUiSettings(nextSettings);
    try {
      localStorage.setItem('viet_phuc_ui_settings', JSON.stringify(nextSettings));
    } catch {
      // Ignore storage errors
    }
  };

  const handleUpdateUserMeasurements = (nextMeasurements: UserAnthropometricMeasurements) => {
    setUserMeasurements(nextMeasurements);
    try {
      localStorage.setItem('viet_phuc_user_measurements', JSON.stringify(nextMeasurements));
    } catch {
      // Ignore storage errors
    }
  };

  const handleSendMeasurementsToB2BMessages = () => {
    setActiveMainTab('TAB_MESSAGES');
    setExternalSendMeasurementsTrigger(Date.now());
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const isEn = (uiSettings.language || 'vi') === 'en';
    showToast(
      isEn
        ? `Sent 3D Body Specs (${userMeasurements.height_cm}cm · ${userMeasurements.weight_kg}kg · Size ${userMeasurements.suggested_size}) to B2B Tailor!`
        : `Đã gửi Bảng Số Đo 3D (${userMeasurements.height_cm}cm · ${userMeasurements.weight_kg}kg · Size ${userMeasurements.suggested_size}) tới Tiệm May B2B!`
    );
  };

  const handleResetAllData = () => {
    setUiSettings(DEFAULT_UI_SETTINGS);
    setStudioSelection(INITIAL_STUDIO_SELECTION);
    setSavedIds(['lb-khue-van-tri-thuc']);
    setUnlockedStamps(INITIAL_UNLOCKED_STAMPS);
    setOmnichannelLogs(INITIAL_OMNICHANNEL_POINT_LOGS);
    setPinnedBadgeId('BADGE_THANG_LONG_CO_TICH');
    try {
      resetVietPhucLocalStorageToSeed();
      localStorage.removeItem('viet_phuc_saved_ids');
      localStorage.removeItem('viet_phuc_unlocked_stamps');
      localStorage.removeItem('viet_phuc_ui_settings');
      localStorage.removeItem('viet_phuc_omnichannel_logs');
      localStorage.removeItem('viet_phuc_pinned_badge');
    } catch {
      // Ignore storage errors
    }
    const isEn = (uiSettings.language || 'vi') === 'en';
    showToast(isEn ? 'Reset UI settings and restored default data' : 'Đã khôi phục giao diện và dữ liệu mặc định');
  };

  const handleAwardOmnichannelPoints = (
    entry: Omit<OmnichannelPointEntry, 'id' | 'timestamp'>
  ) => {
    const isEn = (uiSettings.language || 'vi') === 'en';
    const newEntry: OmnichannelPointEntry = {
      ...entry,
      id: `pt-${Date.now()}`,
      timestamp: new Date().toLocaleDateString(isEn ? 'en-US' : 'vi-VN'),
    };
    setOmnichannelLogs((prev) => {
      const next = [newEntry, ...prev];
      if (uiSettings.autoSaveLocal) {
        try {
          localStorage.setItem('viet_phuc_omnichannel_logs', JSON.stringify(next));
        } catch {
          // Ignore storage errors
        }
      }
      return next;
    });
    showToast(
      isEn
        ? `+${entry.points} Heritage Points (${entry.sourceLabel})`
        : `+${entry.points} Điểm Di Sản (${entry.sourceLabel})`
    );
  };

  const handleSelectPinnedBadge = (badgeId: string) => {
    setPinnedBadgeId(badgeId);
    try {
      localStorage.setItem('viet_phuc_pinned_badge', badgeId);
    } catch {
      // Ignore storage errors
    }
    const isEn = (uiSettings.language || 'vi') === 'en';
    showToast(isEn ? 'Updated pinned Heritage Badge on profile!' : 'Đã cập nhật Huy hiệu Di Sản đính trên hồ sơ!');
  };

  const handleUnlockStamp = (stamp: UnlockedStampEntry) => {
    mutateGpsCheckInSuccessInLocalStorage({
      stamp_id: stamp.stamp_id,
      stamp_name: stamp.stamp_name,
      new_badge_code: 'BADGE_CO_DO_PHONG_HOA',
    });
    setUnlockedStamps((prev) => {
      const exists = prev.some((s) => s.stamp_id === stamp.stamp_id);
      const next = exists
        ? prev.map((s) => (s.stamp_id === stamp.stamp_id ? stamp : s))
        : [stamp, ...prev];
      if (uiSettings.autoSaveLocal) {
        try {
          localStorage.setItem('viet_phuc_unlocked_stamps', JSON.stringify(next));
        } catch {
          // Ignore storage errors
        }
      }
      if (!exists) {
        const count = next.length;
        const milestoneBadge =
          count === 7
            ? 'BADGE_DAI_SU_VIET_PHUC'
            : count === 5
            ? 'BADGE_HOI_AN_HOAI_CO'
            : count === 3
            ? 'BADGE_CO_DO_PHONG_HOA'
            : count === 1
            ? 'BADGE_THANG_LONG_CO_TICH'
            : null;
        if (milestoneBadge) {
          setPinnedBadgeId(milestoneBadge);
          try {
            localStorage.setItem('viet_phuc_pinned_badge', milestoneBadge);
          } catch {
            // Ignore storage errors
          }
        }
      }
      return next;
    });
    showToast(
      `Đã đóng dấu "${stamp.stamp_name}" (+${stamp.points_awarded} điểm) vào Bộ sưu tập!`
    );
  };

  const handleSelectLocationOnMap = (locationQuery: string) => {
    setActiveMainTab('TAB_2_HERITAGE_JOURNEY');
    setExternalMapQuery(locationQuery);
    setTimeout(() => scrollToSection('ban-do-di-tich'), 60);
    showToast(`Đã định vị "${locationQuery}" trên Bản đồ Hành Trình Di Sản (Tab 2)`);
  };

  const handleSelectForStudio = (
    garmentId: string,
    paletteId: string,
    targetSection = 'phong-thu-3d'
  ) => {
    setActiveMainTab('TAB_1_CORE_STUDIO');
    setStudioSelection((prev) =>
      normalizeSelectionForGenderAndGarment(prev, prev.gender, garmentId, paletteId)
    );
    setTimeout(() => scrollToSection(targetSection), 60);
    showToast('Đã nạp trang phục vào Phòng thử Ảo (Tab 1)');
  };

  const handleApplyOutfitConfigToStudio = (config: OutfitConfigCode) => {
    const rawSelection: StudioSelection = {
      gender: config.gender || 'nu',
      garmentId: config.garmentId || 'ao-ngu-than',
      paletteId: config.paletteId || 'khue-van-tri-thuc',
      lowerGarmentId: config.lowerGarmentId || 'quan-lua-trang',
      motifId: config.motifId || 'am-hoa-tron',
      accessoryIds: Array.isArray(config.accessoryIds)
        ? config.accessoryIds
        : ['khan-xep', 'quat-tram-huong'],
      footwearId: config.footwearId || 'guoc-go-moc',
      occasionId: config.occasionId || 'tot-nghiep',
      weatherId: config.weatherId || 'thu-ha-noi',
    };
    setActiveMainTab('TAB_1_CORE_STUDIO');
    setStudioSelection(
      normalizeSelectionForGenderAndGarment(
        rawSelection,
        rawSelection.gender,
        rawSelection.garmentId,
        rawSelection.paletteId
      )
    );
    setTimeout(() => scrollToSection('phong-thu-3d'), 60);
    showToast(`Đã nạp Mã Cấu Hình (${config.config_id}) vào Phòng thử Ảo (Tab 1)`);
  };

  const handleSendMeasurementsToB2B = (jsonOutput: MandatorySystemJsonOutputSchema) => {
    setB2bMeasurementPayload(jsonOutput);
    setActiveMainTab('TAB_3_COMMUNITY_MARKETPLACE');
    setOpenB2BMarketplaceTrigger(Date.now());
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(
      `Đã đóng gói Số đo 3D (Size ${jsonOutput.outfit_3d_config.recommended_size}) sang Sàn Tiệm May B2B (Tab 3)`
    );
  };

  const handleAddSocialPost = (post: SocialPostItem) => {
    setSocialPosts((prev) => [post, ...prev]);
    handleAwardOmnichannelPoints({
      source: 'SOCIAL_POST_SHARE',
      sourceLabel: 'Cộng đồng (+20đ)',
      description: `Chia sẻ bài đăng ${post.platform} (${post.post_id})`,
      points: 20,
    });
  };

  const handleApplyCardToStudio = (card: LookbookCardData) => {
    const matchedPalette =
      LOOKBOOK_PALETTES.find((p) =>
        card.palette.some((sw) => sw.hex.toLowerCase() === p.swatches[0]?.hex.toLowerCase())
      ) || LOOKBOOK_PALETTES[0];

    const targetGarmentId = card.garmentId || 'ao-ngu-than';
    handleSelectForStudio(targetGarmentId, matchedPalette.id, 'phong-thu-3d');
  };

  const handleSaveLookbook = (card: LookbookCardData) => {
    setLookbooks((prev) => {
      const exists = prev.some((item) => item.id === card.id);
      return exists ? prev : [card, ...prev];
    });

    setSavedIds((prev) => {
      const alreadySaved = prev.includes(card.id);
      const next = alreadySaved ? prev.filter((id) => id !== card.id) : [...prev, card.id];
      if (!alreadySaved) {
        const outfitTypeMap: Record<string, 'NGU_THAN' | 'NHAT_BINH' | 'TU_THAN' | 'AO_DAI' | 'BA_BA'> = {
          'ao-ngu-than': 'NGU_THAN',
          'ao-nhat-binh': 'NHAT_BINH',
          'ao-tu-than': 'TU_THAN',
          'ao-dai-ba-ba': 'AO_DAI',
        };
        mutateSaveOutfit3DInLocalStorage({
          outfit_id: card.id.toUpperCase(),
          title: card.outfitName,
          outfit_type: outfitTypeMap[card.garmentId || 'ao-ngu-than'] || 'NGU_THAN',
          primary_hex: card.palette[0]?.hex || '#2E8B57',
        });
      }
      if (uiSettings.autoSaveLocal) {
        try {
          localStorage.setItem('viet_phuc_saved_ids', JSON.stringify(next));
        } catch {
          // Ignore storage errors
        }
      }
      showToast(
        alreadySaved
          ? `Đã bỏ lưu "${card.outfitName}" khỏi Bộ sưu tập`
          : `Đã lưu "${card.outfitName}" vào Bộ sưu tập`
      );
      return next;
    });
  };

  const handleToggleSaveEvent = (eventId: string) => {
    setSavedEventIds((prev) => {
      const exists = prev.includes(eventId);
      const next = exists ? prev.filter((id) => id !== eventId) : [eventId, ...prev];
      try {
        localStorage.setItem('viet_phuc_saved_events', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleToggleSaveArticle = (articleId: string) => {
    setSavedArticleIds((prev) => {
      const exists = prev.includes(articleId);
      const next = exists ? prev.filter((id) => id !== articleId) : [articleId, ...prev];
      try {
        localStorage.setItem('viet_phuc_saved_articles', JSON.stringify(next));
      } catch {
        // ignore
      }
      showToast(exists ? 'Đã bỏ lưu bài viết tư liệu' : 'Đã lưu bài viết vào Bộ sưu tập');
      return next;
    });
  };

  const savedLookbookItems = lookbooks.filter((lb) => savedIds.includes(lb.id));

  const handleAskAdvisorWithBodyProfile = (promptText: string) => {
    setActiveMainTab('TAB_MESSAGES');
    setExternalPromptTrigger({ id: Date.now(), prompt: promptText });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const stampPoints = unlockedStamps.reduce((sum, s) => sum + s.points_awarded, 0);
  const omnichannelExtraPoints = omnichannelLogs.reduce((sum, l) => sum + l.points, 0);
  const totalPoints = stampPoints + omnichannelExtraPoints;
  const currentLang = uiSettings.language || 'vi';
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.vi;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-stone-900 selection:bg-[#9A3412]/15 selection:text-[#9A3412]">
      {/* Apple-style Translucent Header Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-2xl border-b border-[#E8E2D6] px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">
          {/* Brand Wordmark with Heritage Touch */}
          <button
            type="button"
            onClick={() => {
              setActiveMainTab('TAB_3_COMMUNITY_MARKETPLACE');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#9A3412] text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform duration-150">
              VA
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-stone-950 whitespace-nowrap">
              VietAura
            </span>
          </button>

          {/* Apple iOS Segmented Control (3 Main Tabs) */}
          <nav
            className="hidden md:flex items-center p-1 bg-[#EBE5D8]/80 rounded-full border border-[#DFD7C7]/70 shadow-inner"
            aria-label={currentLang === 'en' ? 'Apple-style segmented navigation' : 'Điều hướng phân đoạn kiểu Apple'}
          >
            <button
              type="button"
              onClick={() => {
                setActiveMainTab('TAB_3_COMMUNITY_MARKETPLACE');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer active:scale-95 ${
                activeMainTab === 'TAB_3_COMMUNITY_MARKETPLACE'
                  ? 'bg-[#9A3412] text-white shadow-xs font-bold'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.navCommunity}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMainTab('TAB_1_CORE_STUDIO');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer active:scale-95 ${
                activeMainTab === 'TAB_1_CORE_STUDIO'
                  ? 'bg-[#9A3412] text-white shadow-xs font-bold'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              <Cuboid className="w-3.5 h-3.5" />
              <span>{t.navStudio}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMainTab('TAB_2_HERITAGE_JOURNEY');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer active:scale-95 ${
                activeMainTab === 'TAB_2_HERITAGE_JOURNEY'
                  ? 'bg-[#9A3412] text-white shadow-xs font-bold'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>{t.navMap}</span>
            </button>
          </nav>

          {/* Dedicated Messages Icon + Language Switcher + User Account Menu */}
          <div className="flex items-center gap-2">
            {/* Quick Bilingual Language Switcher Pill */}
            <button
              type="button"
              onClick={() => {
                const nextLang = (uiSettings.language || 'vi') === 'vi' ? 'en' : 'vi';
                handleUpdateUISettings({ ...uiSettings, language: nextLang });
                showToast(
                  nextLang === 'en'
                    ? 'Switched language to English (Traditional costume names preserved)'
                    : 'Đã chuyển sang Tiếng Việt (Bảo lưu danh pháp Cổ phục)'
                );
              }}
              title={uiSettings.language === 'en' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
              className="px-2.5 py-1 rounded-full text-xs font-bold border border-[#E8E2D6] bg-stone-100 hover:bg-stone-200 text-stone-800 transition-all cursor-pointer active:scale-95 flex items-center gap-1 shadow-2xs"
            >
              <span>{(uiSettings.language || 'vi') === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMainTab('TAB_MESSAGES');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title={uiSettings.language === 'en' ? 'Messages' : 'Tin nhắn (AI Stylist, Tiệm may & Cá nhân)'}
              aria-label="Tin nhắn"
              className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer border active:scale-95 ${
                activeMainTab === 'TAB_MESSAGES'
                  ? 'bg-[#9A3412] text-white border-[#9A3412] shadow-xs'
                  : 'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200'
              }`}
            >
              <MessagesSquare className="w-4 h-4" />
              <span
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#D97706] border-2 border-white animate-pulse"
                aria-hidden="true"
              />
            </button>

            <UserAccountMenu
              isLoggedIn={isLoggedIn}
              userProfile={userProfile}
              uiSettings={uiSettings}
              savedCount={savedIds.length}
              stampsCount={unlockedStamps.length}
              totalSitesCount={HERITAGE_MAP_SITES.length}
              totalPoints={totalPoints}
              unlockedStamps={unlockedStamps}
              omnichannelLogs={omnichannelLogs}
              pinnedBadgeId={pinnedBadgeId}
              onSelectPinnedBadge={handleSelectPinnedBadge}
              savedLookbooks={savedLookbookItems}
              onLoadSavedLookbook={handleApplyCardToStudio}
              onRemoveSavedLookbook={handleSaveLookbook}
              savedEventIds={savedEventIds}
              onToggleSaveEvent={handleToggleSaveEvent}
              savedArticleIds={savedArticleIds}
              onToggleSaveArticle={handleToggleSaveArticle}
              onApplyOutfitConfigToStudio={handleApplyOutfitConfigToStudio}
              userMeasurements={userMeasurements}
              onUpdateMeasurements={handleUpdateUserMeasurements}
              onSendMeasurementsToB2BMessages={handleSendMeasurementsToB2BMessages}
              studioSelection={studioSelection}
              onLogin={handleLogin}
              onLogout={handleLogout}
              onUpdateProfile={handleUpdateProfile}
              onUpdateUISettings={handleUpdateUISettings}
              onResetAllData={handleResetAllData}
            />
          </div>
        </div>
      </header>

      {/* Apple Dynamic Island Top-Dropping Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-0 mx-auto max-w-md z-50 px-4 pointer-events-none">
          <div className="pointer-events-auto bg-[#1C1917]/95 text-white backdrop-blur-2xl px-4 py-2.5 text-xs font-medium rounded-full shadow-2xl border border-stone-800 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-[#D97706] shrink-0" />
              <span className="truncate">{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-full text-stone-400 hover:text-white cursor-pointer active:scale-95 transition-transform"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content — Streamlined Ecosystem Tabs */}
      <main id="top" className="flex-1 pb-16 md:pb-0">
        {/* TAB 1: 👥 CỘNG ĐỒNG & B2B MARKETPLACE */}
        {activeMainTab === 'TAB_3_COMMUNITY_MARKETPLACE' && (
          <SocialPostsHubSection
            language={currentLang}
            posts={socialPosts}
            onAddPost={handleAddSocialPost}
            onApplyOutfitConfigTo3D={handleApplyOutfitConfigToStudio}
            studioSelection={studioSelection}
            onSelectLocationOnMap={handleSelectLocationOnMap}
            onAwardOmnichannelPoints={handleAwardOmnichannelPoints}
            b2bMeasurementPayload={b2bMeasurementPayload}
            externalOpenB2BTrigger={openB2BMarketplaceTrigger}
          />
        )}

        {/* TAB 2: 👗 STUDIO 3D */}
        {activeMainTab === 'TAB_1_CORE_STUDIO' && (
          <VirtualFittingRoom3D
            language={currentLang}
            selection={studioSelection}
            onChangeSelection={setStudioSelection}
            onSaveLookbook={handleSaveLookbook}
            onAskAdvisorWithBodyProfile={handleAskAdvisorWithBodyProfile}
            allLookbooks={lookbooks}
            savedIds={savedIds}
            onApplyCardToStudio={handleApplyCardToStudio}
            externalOpenCollectionTrigger={openFittingCollectionTrigger}
            activeSystemTab="TAB_1_CORE_STUDIO"
            onSendMeasurementsToB2B={handleSendMeasurementsToB2B}
            userMeasurements={userMeasurements}
            onUpdateMeasurements={handleUpdateUserMeasurements}
          />
        )}

        {/* TAB 3: 🏛️ HÀNH TRÌNH DI SẢN */}
        {activeMainTab === 'TAB_2_HERITAGE_JOURNEY' && (
          <HeritageMapPassportSection
            language={currentLang}
            userName={isLoggedIn ? userProfile.name : (currentLang === 'en' ? 'Heritage Explorer' : 'Bạn đọc Việt Phục')}
            unlockedStamps={unlockedStamps}
            onUnlockStamp={handleUnlockStamp}
            onApplyOutfitConfigToStudio={handleApplyOutfitConfigToStudio}
            onAskAdvisorWithPrompt={handleAskAdvisorWithBodyProfile}
            socialPosts={socialPosts}
            onShareCheckInToCommunity={handleAddSocialPost}
            studioSelection={studioSelection}
            externalSelectedQuery={externalMapQuery}
            omnichannelLogs={omnichannelLogs}
            pinnedBadgeId={pinnedBadgeId}
            onSelectPinnedBadge={handleSelectPinnedBadge}
            onAwardOmnichannelPoints={handleAwardOmnichannelPoints}
          />
        )}

        {/* TAB 4: 💬 TIN NHẮN & CỐ VẤN AI */}
        {activeMainTab === 'TAB_MESSAGES' && (
          <CulturalAdvisorSection
            language={currentLang}
            studioSelection={studioSelection}
            onApplyCardToStudio={handleApplyCardToStudio}
            onApplyOutfitConfigToStudio={handleApplyOutfitConfigToStudio}
            onSaveLookbook={handleSaveLookbook}
            allLookbooks={lookbooks}
            savedIds={savedIds}
            externalPromptTrigger={externalPromptTrigger}
            userMeasurements={userMeasurements}
            externalSendMeasurementsTrigger={externalSendMeasurementsTrigger}
          />
        )}
      </main>

      {/* Minimalist Editorial Footer */}
      <footer className="bg-[#FAF8F5] border-t border-[#E8E2D6] py-5 pb-24 md:pb-5 px-4 sm:px-6 lg:px-8 text-xs text-stone-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900">VietAura</span>
            <span className="text-stone-400">·</span>
            <span>{currentLang === 'en' ? 'Vietnamese Heritage & Traditional Garment Digital Ecosystem' : 'Hệ sinh thái Công nghệ Thời trang Di sản'}</span>
          </div>
          <span>{currentLang === 'en' ? 'Community · 3D Studio · Heritage Map · AI Advisory' : 'Cộng Đồng · Studio 3D · Hành Trình · Cố Vấn AI'}</span>
        </div>
      </footer>

      {/* Apple-style Floating Translucent Bottom Tab Bar for Mobile & Tablet */}
      <nav
        aria-label={currentLang === 'en' ? 'iPhone-style mobile navigation' : 'Điều hướng di động kiểu iPhone'}
        className="md:hidden fixed bottom-4 inset-x-4 max-w-sm mx-auto z-40 bg-[#FAF8F5]/92 backdrop-blur-2xl border border-[#DFD7C7]/90 shadow-2xl shadow-stone-900/15 rounded-full px-3 py-1.5 flex items-center justify-around text-[10px] font-semibold text-stone-600 pb-safe"
      >
        <button
          type="button"
          onClick={() => {
            setActiveMainTab('TAB_3_COMMUNITY_MARKETPLACE');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full cursor-pointer transition-all duration-150 active:scale-90 ${
            activeMainTab === 'TAB_3_COMMUNITY_MARKETPLACE'
              ? 'bg-[#9A3412] text-white shadow-xs font-bold'
              : 'text-stone-600 hover:text-stone-950'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t.navCommunity}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMainTab('TAB_1_CORE_STUDIO');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full cursor-pointer transition-all duration-150 active:scale-90 ${
            activeMainTab === 'TAB_1_CORE_STUDIO'
              ? 'bg-[#9A3412] text-white shadow-xs font-bold'
              : 'text-stone-600 hover:text-stone-950'
          }`}
        >
          <Cuboid className="w-4 h-4" />
          <span>{t.navStudio}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMainTab('TAB_2_HERITAGE_JOURNEY');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full cursor-pointer transition-all duration-150 active:scale-90 ${
            activeMainTab === 'TAB_2_HERITAGE_JOURNEY'
              ? 'bg-[#9A3412] text-white shadow-xs font-bold'
              : 'text-stone-600 hover:text-stone-950'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>{t.navMap}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMainTab('TAB_MESSAGES');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full cursor-pointer transition-all duration-150 active:scale-90 relative ${
            activeMainTab === 'TAB_MESSAGES'
              ? 'bg-[#9A3412] text-white shadow-xs font-bold'
              : 'text-stone-600 hover:text-stone-950'
          }`}
        >
          <MessagesSquare className="w-4 h-4" />
          <span>{t.navMessages}</span>
        </button>
      </nav>
    </div>
  );
}

