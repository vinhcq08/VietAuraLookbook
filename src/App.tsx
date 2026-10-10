import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Archive,
  Cuboid,
  MessagesSquare,
  Map,
  Users,
  BookOpen,
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
    showToast(`Xin chào ${profile.name}! Đã đăng nhập thành công.`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.setItem('viet_phuc_is_logged_in', JSON.stringify(false));
    } catch {
      // Ignore storage errors
    }
    showToast('Đã đăng xuất tài khoản');
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
    showToast('Đã cập nhật thông tin tài khoản');
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
    showToast(
      `Đã gửi Bảng Số Đo 3D (${userMeasurements.height_cm}cm · ${userMeasurements.weight_kg}kg · Size ${userMeasurements.suggested_size}) tới Tiệm May B2B!`
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
    showToast('Đã khôi phục giao diện và dữ liệu mặc định');
  };

  const handleAwardOmnichannelPoints = (
    entry: Omit<OmnichannelPointEntry, 'id' | 'timestamp'>
  ) => {
    const newEntry: OmnichannelPointEntry = {
      ...entry,
      id: `pt-${Date.now()}`,
      timestamp: new Date().toLocaleDateString('vi-VN'),
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
    showToast(`+${entry.points} Điểm Di Sản (${entry.sourceLabel})`);
  };

  const handleSelectPinnedBadge = (badgeId: string) => {
    setPinnedBadgeId(badgeId);
    try {
      localStorage.setItem('viet_phuc_pinned_badge', badgeId);
    } catch {
      // Ignore storage errors
    }
    showToast('Đã cập nhật Huy hiệu Di Sản đính trên hồ sơ!');
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

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-950">
      {/* Top Navigation Bar — Streamlined 3-Tab Architecture + Dedicated Messages Icon */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              setActiveMainTab('TAB_3_COMMUNITY_MARKETPLACE');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-zinc-950 whitespace-nowrap cursor-pointer"
          >
            VietAura
          </button>

          {/* 3 Main Tabs (1: Cộng Đồng, 2: Studio, 3: Hành Trình) */}
          <nav
            className="hidden md:flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200/80"
            aria-label="Điều hướng 3 Tab chính"
          >
            <button
              type="button"
              onClick={() => {
                setActiveMainTab('TAB_3_COMMUNITY_MARKETPLACE');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeMainTab === 'TAB_3_COMMUNITY_MARKETPLACE'
                  ? 'bg-zinc-950 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Cộng Đồng</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMainTab('TAB_1_CORE_STUDIO');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeMainTab === 'TAB_1_CORE_STUDIO'
                  ? 'bg-zinc-950 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Cuboid className="w-3.5 h-3.5" />
              <span>Studio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMainTab('TAB_2_HERITAGE_JOURNEY');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeMainTab === 'TAB_2_HERITAGE_JOURNEY'
                  ? 'bg-zinc-950 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Hành Trình</span>
            </button>
          </nav>

          {/* Dedicated Messages Tab Icon + User Account Avatar */}
          <div className="flex items-center gap-2">
            {/* Dedicated Messages Tab Icon (Left of Account Icon) */}
            <button
              type="button"
              onClick={() => {
                setActiveMainTab('TAB_MESSAGES');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Tin nhắn (AI Stylist, Tiệm may & Cá nhân)"
              aria-label="Tin nhắn"
              className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                activeMainTab === 'TAB_MESSAGES'
                  ? 'bg-zinc-950 text-white border-zinc-950 ring-2 ring-zinc-300'
                  : 'bg-zinc-100 text-zinc-800 border-zinc-200 hover:bg-zinc-200'
              }`}
            >
              <MessagesSquare className="w-4 h-4" />
              <span
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white"
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

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 text-white px-4 py-3 text-xs font-medium rounded-xl shadow-lg flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content — Streamlined 3-Tab Ecosystem + Dedicated Messages Tab */}
      <main id="top" className="flex-1">
        {/* =================================================================
            TAB 1: 👥 CỘNG ĐỒNG & B2B MARKETPLACE (Social Trends, Challenge & Tiệm May)
           ================================================================= */}
        {activeMainTab === 'TAB_3_COMMUNITY_MARKETPLACE' && (
          <SocialPostsHubSection
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

        {/* =================================================================
            TAB 2: 👗 STUDIO (PHÒNG THỬ ẢO 3D/2D & TRỢ LÝ CỐ VẤN AI)
           ================================================================= */}
        {activeMainTab === 'TAB_1_CORE_STUDIO' && (
          <VirtualFittingRoom3D
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

        {/* =================================================================
            TAB 3: 🏛️ HÀNH TRÌNH (Dashboard Di sản, Bản đồ GPS, Sổ Tem & Lễ hội)
           ================================================================= */}
        {activeMainTab === 'TAB_2_HERITAGE_JOURNEY' && (
          <HeritageMapPassportSection
            userName={isLoggedIn ? userProfile.name : 'Bạn đọc Việt Phục'}
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

        {/* =================================================================
            TAB TIN NHẮN RIÊNG (Icon Tin nhắn bên trái Icon Tài khoản)
           ================================================================= */}
        {activeMainTab === 'TAB_MESSAGES' && (
          <CulturalAdvisorSection
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

      {/* Minimalist Single-Line Footer */}
      <footer className="bg-zinc-50 border-t border-zinc-200 py-5 pb-20 md:pb-5 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-zinc-900">VietAura</span>
          <span>Cộng Đồng · Studio · Hành Trình · Tin Nhắn</span>
        </div>
      </footer>

      {/* Mobile Bottom 3-Tab Bar (1: Cộng Đồng, 2: Studio, 3: Hành Trình) */}
      <nav
        aria-label="Điều hướng di động 3 Tab"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-2 py-2 flex items-center justify-around text-[10px] font-semibold text-zinc-600"
      >
        <button
          type="button"
          onClick={() => {
            setActiveMainTab('TAB_3_COMMUNITY_MARKETPLACE');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeMainTab === 'TAB_3_COMMUNITY_MARKETPLACE'
              ? 'text-zinc-950 font-bold'
              : 'text-zinc-500'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Cộng Đồng</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMainTab('TAB_1_CORE_STUDIO');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeMainTab === 'TAB_1_CORE_STUDIO' ? 'text-zinc-950 font-bold' : 'text-zinc-500'
          }`}
        >
          <Cuboid className="w-4 h-4" />
          <span>Studio</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveMainTab('TAB_2_HERITAGE_JOURNEY');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeMainTab === 'TAB_2_HERITAGE_JOURNEY' ? 'text-zinc-950 font-bold' : 'text-zinc-500'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Hành Trình</span>
        </button>
      </nav>
    </div>
  );
}

