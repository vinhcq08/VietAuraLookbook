/**
 * VietAura Internationalization (i18n) Engine
 * Strict preservation of verified Vietnamese traditional costume proper nouns
 * based on research from the Vietnam National Museum of History and cultural heritage archives.
 */

export type AppLanguage = 'vi' | 'en';

export interface TranslationDictionary {
  // Navigation Tabs
  navStudio: string;
  navMap: string;
  navCommunity: string;
  navLookbook: string;
  navMessages: string;

  // Header & Brand
  appSubtitle: string;
  tagline: string;
  login: string;
  logout: string;
  account: string;

  // Account Menu Tabs
  tabProfile: string;
  tabSaved: string;
  tabVouchers: string;
  tabAppearance: string;
  tabSettings: string;

  // Language Settings
  languageSettingTitle: string;
  languageSettingDesc: string;
  langVietnamese: string;
  langEnglish: string;
  langPreserveNotice: string;

  // Appearance Settings
  themeTitle: string;
  themeLight: string;
  themeWarm: string;
  themeDark: string;
  textSizeTitle: string;
  textSmall: string;
  textStandard: string;
  textLarge: string;
  densityTitle: string;
  densityComfortable: string;
  densityCompact: string;

  // System Settings
  autoSaveTitle: string;
  syncMapTitle: string;
  localStorageManager: string;
  resetDefault: string;

  // Styling Modes
  strictHeritage: string;
  modernFusion: string;
  singleMode: string;
  coupleMode: string;
  groupMode: string;

  // Common UI actions
  common: {
    close: string;
    cancel: string;
    save: string;
    saved: string;
    copy: string;
    copied: string;
    search: string;
    filter: string;
    all: string;
    loading: string;
    success: string;
    share: string;
    viewDetails: string;
    apply: string;
    applied: string;
    download: string;
    edit: string;
    delete: string;
    send: string;
    women: string;
    men: string;
    gender: string;
    size: string;
    height: string;
    weight: string;
  };

  // Studio 3D Tab Translations
  studio: {
    stageTitle: string;
    viewportSideBySide: string;
    viewport2DOnly: string;
    viewport3DOnly: string;
    cameraFront: string;
    camera34: string;
    cameraCloseup: string;
    cameraBack: string;
    badge2D: string;
    badge3D: string;
    badgeLoading: string;
    askAiStylist: string;
    saveLookbook: string;
    b2bTailor: string;
    systemJson: string;
    displayModeMinimal: string;
    displayModeFull: string;
    garmentSelector: string;
    tabMeaning: string;
    tabStructure: string;
    paletteSelector: string;
    paletteHeritage: string;
    paletteCustom: string;
    slotPrimary: string;
    slotSecondary: string;
    slotAccent: string;
    lowerGarmentSelector: string;
    motifSelector: string;
    accessoriesSelector: string;
    footwearSelector: string;
    bodySectionTitle: string;
    bodyPresets: string;
    skinTone: string;
    heightSlider: string;
    shoulderSlider: string;
    torsoSlider: string;
    hipSlider: string;
    cultureGuardTitle: string;
    cultureGuardCompliant: string;
    cultureGuardWarning: string;
    aiAgentTitle: string;
    aiEvent: string;
    aiWeather: string;
    aiStyle: string;
    aiBudget: string;
    aiApply: string;
    b2bModalTitle: string;
    b2bModalDesc: string;
    b2bSendDirect: string;
    b2bCopyPayload: string;
  };

  // Community & Tailors Tab Translations
  community: {
    tabAll: string;
    tabMoments: string;
    tabB2BMarketplace: string;
    tabEvents: string;
    tabKnowledge: string;
    createPost: string;
    searchPlaceholder: string;
    filterGarment: string;
    filterBody: string;
    tryOn3D: string;
    viewOnMap: string;
    craftedBy: string;
    like: string;
    comment: string;
    share: string;
    tailorListTitle: string;
    tailorVerifiedBadge: string;
    tailorRequestQuote: string;
    tailorChat: string;
    tailorSendMeasurements: string;
    scanAiCompliance: string;
    publishPostBtn: string;
    newPostTitle: string;
  };

  // Heritage Map & Passport Tab Translations
  heritageMap: {
    tabMap: string;
    tabPassport: string;
    tabTour360: string;
    tabCheckin: string;
    searchPlaceholder: string;
    filterRegion: string;
    regionAll: string;
    regionNorth: string;
    regionCentral: string;
    regionSouth: string;
    dynastyEra: string;
    recommendedGarment: string;
    tryInStudio: string;
    launchTour360: string;
    checkInAction: string;
    nearbyTailors: string;
    passportTitle: string;
    collectedStamps: string;
    honorBadges: string;
    exportPassport: string;
    arCameraTitle: string;
    capturePhoto: string;
    checkInSuccess: string;
    pointsAwarded: string;
  };

  // Messages Tab Translations
  messages: {
    title: string;
    tabAll: string;
    tabAi: string;
    tabTailors: string;
    tabPersonal: string;
    searchPlaceholder: string;
    inputPlaceholder: string;
    sendBtn: string;
    sendMeasurementsBtn: string;
    tryInStudioBtn: string;
    onlineBadge: string;
    quickPromptsTitle: string;
  };

  // Verified Garment Nomenclature (Strictly preserved proper nouns)
  garments: {
    aoNguThan: string;
    aoNhatBinh: string;
    aoTuThan: string;
    aoDai: string;
    aoBaBa: string;
  };

  // Garment Proper Names with Academic Sub-descriptions
  garmentDescriptions: {
    aoNguThan: string;
    aoNhatBinh: string;
    aoTuThan: string;
    aoDai: string;
    aoBaBa: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, TranslationDictionary> = {
  vi: {
    navStudio: 'Phòng Thử 3D',
    navMap: 'Hành Trình',
    navCommunity: 'Cộng Đồng & Nhà May',
    navLookbook: 'Lookbook',
    navMessages: 'Tin Nhắn',

    appSubtitle: 'Hệ Sinh Thái Số Hóa Cổ Phục & Di Sản Việt Nam',
    tagline: 'Phòng thử 3D nhân trắc học · Bản đồ di tích · Kiểm duyệt văn hóa Culture Guard',
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
    account: 'Tài khoản',

    tabProfile: 'Hồ sơ',
    tabSaved: 'Đã lưu',
    tabVouchers: 'Voucher',
    tabAppearance: 'Giao diện',
    tabSettings: 'Cài đặt',

    languageSettingTitle: 'Ngôn ngữ hiển thị (Language)',
    languageSettingDesc: 'Chuyển đổi giao diện song ngữ Tiếng Việt & Tiếng Anh. Tên riêng cổ phục được giữ nguyên theo bảo chứng văn hóa.',
    langVietnamese: 'Tiếng Việt',
    langEnglish: 'English',
    langPreserveNotice: 'Bảo lưu danh pháp Cổ phục theo quy chuẩn Bảo tàng Lịch sử Quốc gia.',

    themeTitle: 'Chủ đề màu sắc (Theme)',
    themeLight: 'Giấy Dó Sáng',
    themeWarm: 'Lụa Tơ Ấm',
    themeDark: 'Mực Nho Tối',
    textSizeTitle: 'Cỡ chữ hiển thị (Text Size)',
    textSmall: 'Nhỏ gọn',
    textStandard: 'Tiêu chuẩn',
    textLarge: 'Lớn dễ đọc',
    densityTitle: 'Khoảng cách bố cục (Layout)',
    densityComfortable: 'Thoáng đãng',
    densityCompact: 'Thu gọn',

    autoSaveTitle: 'Tự động lưu Bộ sưu tập & Con dấu',
    syncMapTitle: 'Đồng bộ trang phục với Bản đồ',
    localStorageManager: 'Trình quản lý VIETPHUC_LOCAL_STORAGE_V1',
    resetDefault: 'Khôi phục giao diện & dữ liệu mặc định',

    strictHeritage: 'Cổ Chuẩn (Strict)',
    modernFusion: 'Tân Thời (Fusion)',
    singleMode: 'Đơn',
    coupleMode: 'Đôi',
    groupMode: 'Nhóm',

    common: {
      close: 'Đóng',
      cancel: 'Hủy bỏ',
      save: 'Lưu',
      saved: 'Đã lưu',
      copy: 'Sao chép',
      copied: 'Đã chép',
      search: 'Tìm kiếm',
      filter: 'Bộ lọc',
      all: 'Tất cả',
      loading: 'Đang tải...',
      success: 'Thành công',
      share: 'Chia sẻ',
      viewDetails: 'Xem chi tiết',
      apply: 'Áp dụng',
      applied: 'Đã áp dụng',
      download: 'Tải về',
      edit: 'Chỉnh sửa',
      delete: 'Xóa',
      send: 'Gửi',
      women: 'Nữ',
      men: 'Nam',
      gender: 'Giới tính',
      size: 'Cỡ áo',
      height: 'Chiều cao',
      weight: 'Cân nặng',
    },

    studio: {
      stageTitle: 'Sàn Diễn Thử Đồ 3D WebGL',
      viewportSideBySide: 'Song song 2D & 3D',
      viewport2DOnly: 'Ảnh 2D',
      viewport3DOnly: 'Mô hình 3D',
      cameraFront: 'Chính diện',
      camera34: 'Nghiêng 3/4',
      cameraCloseup: 'Cận cảnh',
      cameraBack: 'Phía sau',
      badge2D: 'Ảnh mẫu 2D',
      badge3D: 'Mô hình 3D (Kéo để xoay)',
      badgeLoading: 'Đang tải mô hình...',
      askAiStylist: 'Hỏi AI Stylist',
      saveLookbook: 'Lưu Lookbook',
      b2bTailor: 'May đo B2B',
      systemJson: 'Mã JSON',
      displayModeMinimal: 'Tối giản',
      displayModeFull: 'Chi tiết',
      garmentSelector: 'Dòng Trang Phục Cổ Truyền',
      tabMeaning: 'Ý nghĩa & Điển chế',
      tabStructure: 'Cấu trúc & May đo',
      paletteSelector: 'Bảng Phối Màu Lụa & Gấm',
      paletteHeritage: 'Bảng màu Di sản',
      paletteCustom: 'Tự phối 3 màu',
      slotPrimary: 'Thân áo chính',
      slotSecondary: 'Tà lót / Cổ áo',
      slotAccent: 'Viền & Cúc cài',
      lowerGarmentSelector: 'Y Phục Dưới (Quần / Váy)',
      motifSelector: 'Hoa Văn Dệt & Cổ Họa',
      accessoriesSelector: 'Khăn Xếp & Phụ Kiện Cung Đình',
      footwearSelector: 'Hài Thêu & Guốc Mộc',
      bodySectionTitle: 'Vóc Dáng & Số Đo Nhân Trắc Học',
      bodyPresets: '5 Dáng Người Chuẩn',
      skinTone: 'Sắc Tố Làn Da',
      heightSlider: 'Chiều cao cơ thể (cm)',
      shoulderSlider: 'Độ rộng bờ vai',
      torsoSlider: 'Vòng thân & Eo',
      hipSlider: 'Độ rộng vòng hông',
      cultureGuardTitle: 'Culture Guard™ — Giám Sát Chuẩn Mực Văn Hóa',
      cultureGuardCompliant: 'Hợp chuẩn Cổ phục di sản',
      cultureGuardWarning: 'Cảnh báo vi phạm quy chế trang phục',
      aiAgentTitle: 'Cố Vấn Phối Đồ Realtime (4 Biến Số)',
      aiEvent: 'Sự kiện / Bối cảnh',
      aiWeather: 'Thời tiết',
      aiStyle: 'Phong cách',
      aiBudget: 'Ngân sách',
      aiApply: 'Áp dụng đề xuất',
      b2bModalTitle: 'Hồ Sơ May Đo Chuẩn B2B',
      b2bModalDesc: 'Thông số nhân trắc học 3D đồng bộ với các Tiệm may Cổ phục đối tác',
      b2bSendDirect: 'Gửi đến Tiệm May B2B',
      b2bCopyPayload: 'Sao chép JSON Thông Số',
    },

    community: {
      tabAll: 'Tất cả bài viết',
      tabMoments: 'Khoảnh khắc Di sản',
      tabB2BMarketplace: 'Chợ Cổ phục B2B & Tiệm May',
      tabEvents: 'Sự kiện & Workshop',
      tabKnowledge: 'Tri thức Di sản (PGC)',
      createPost: 'Đăng Bài Mới',
      searchPlaceholder: 'Tìm kiếm bài viết, nhà may, trang phục...',
      filterGarment: 'Lọc trang phục',
      filterBody: 'Lọc vóc dáng',
      tryOn3D: 'Thử trên 3D',
      viewOnMap: 'Xem trên Bản đồ',
      craftedBy: 'Nhà may thực hiện',
      like: 'Thích',
      comment: 'Bình luận',
      share: 'Chia sẻ',
      tailorListTitle: 'Danh Sách Tiệm May & Nghệ Nhân Đối Tác',
      tailorVerifiedBadge: 'Chứng nhận Di sản',
      tailorRequestQuote: 'Nhận báo giá nhanh',
      tailorChat: 'Nhắn tin nhà may',
      tailorSendMeasurements: 'Gửi Bảng số đo 3D',
      scanAiCompliance: 'AI Culture Guard Kiểm Duyệt',
      publishPostBtn: 'Đăng bài lên Cộng đồng',
      newPostTitle: 'Chia Sẻ Khoảnh Khắc Cổ Phục',
    },

    heritageMap: {
      tabMap: 'Bản Đồ Di Tích',
      tabPassport: 'Hộ Chiếu Di Sản',
      tabTour360: 'Tour 360° Panorama',
      tabCheckin: 'Check-in GPS & AR',
      searchPlaceholder: 'Tìm kiếm di tích (Văn Miếu, Hoàng Thành, Cố Đô...)...',
      filterRegion: 'Khu vực',
      regionAll: 'Tất cả miền',
      regionNorth: 'Bắc Bộ',
      regionCentral: 'Trung Bộ',
      regionSouth: 'Nam Bộ',
      dynastyEra: 'Thời kỳ / Triều đại',
      recommendedGarment: 'Trang phục đề xuất',
      tryInStudio: 'Mặc thử trang phục tương thích',
      launchTour360: 'Mở không gian 360°',
      checkInAction: 'Check-in nhận Con Dấu',
      nearbyTailors: 'Tiệm may vệ tinh liên kết',
      passportTitle: 'Hộ Chiếu Cổ Phục Số Hóa',
      collectedStamps: 'Con dấu đã tích lũy',
      honorBadges: 'Huy hiệu Di sản',
      exportPassport: 'Xuất Hộ Chiếu PDF / Ảnh',
      arCameraTitle: 'Máy Ảnh AR Check-in Di Tích',
      capturePhoto: 'Chụp ảnh kỷ niệm',
      checkInSuccess: 'Đã đóng dấu Hộ chiếu thành công!',
      pointsAwarded: 'Điểm thưởng Di sản',
    },

    messages: {
      title: 'Hộp Thoại & Cố Vấn Văn Hóa',
      tabAll: 'Tất cả',
      tabAi: 'AI Di sản (Gemini)',
      tabTailors: 'Tiệm May B2B',
      tabPersonal: 'Cá nhân',
      searchPlaceholder: 'Tìm kiếm tin nhắn...',
      inputPlaceholder: 'Hỏi Cố vấn di sản hoặc nhắn tin với nhà may...',
      sendBtn: 'Gửi',
      sendMeasurementsBtn: 'Gửi Bảng Số Đo 3D',
      tryInStudioBtn: 'Thử bộ này trên 3D',
      onlineBadge: 'Đang hoạt động',
      quickPromptsTitle: 'Gợi ý câu hỏi phổ biến:',
    },

    // Verified Traditional Proper Nouns in Vietnamese
    garments: {
      aoNguThan: 'Áo Ngũ Thân Lập Lĩnh',
      aoNhatBinh: 'Áo Nhật Bình',
      aoTuThan: 'Áo Tứ Thân',
      aoDai: 'Áo Dài',
      aoBaBa: 'Áo Bà Ba',
    },

    garmentDescriptions: {
      aoNguThan: 'Áo Ngũ Thân Lập Lĩnh thời Nguyễn — 5 thân tượng trưng tứ thân phụ mẫu và bản thân, 5 cúc cài tượng trưng ngũ thường (Nhân - Lễ - Nghĩa - Trí - Tín).',
      aoNhatBinh: 'Áo Nhật Bình cung đình triều Nguyễn — Cổ áo hình chữ nhật viền thêu hoa văn ngũ sắc, trang phục của Hậu phi và Công chúa.',
      aoTuThan: 'Áo Tứ Thân truyền thống đồng bằng Bắc Bộ — 4 tà mềm mại, biểu tượng của người phụ nữ Kinh Bắc và nghệ thuật Dân ca Quan họ.',
      aoDai: 'Áo Dài truyền thống Việt Nam — Biểu tượng di sản thời trang tôn vinh vẻ đẹp tao nhã, thanh tao.',
      aoBaBa: 'Áo Bà Ba Nam Bộ — Trang phục mộc mạc làm từ lụa tơ, biểu trưng cho vẻ đẹp chất phác của miền Tây sông nước.',
    },
  },

  en: {
    navStudio: '3D Studio',
    navMap: 'Heritage Map',
    navCommunity: 'Community & Tailors',
    navLookbook: 'Lookbook',
    navMessages: 'Messages',

    appSubtitle: 'Vietnamese Heritage & Traditional Garment Digital Ecosystem',
    tagline: '3D Anthropometric Fitting Studio · Heritage Map · Culture Guard AI',
    login: 'Log In',
    logout: 'Log Out',
    account: 'Account',

    tabProfile: 'Profile',
    tabSaved: 'Saved',
    tabVouchers: 'Vouchers',
    tabAppearance: 'Appearance',
    tabSettings: 'Settings',

    languageSettingTitle: 'Display Language (Ngôn ngữ)',
    languageSettingDesc: 'Switch between Vietnamese and English. Traditional costume proper names are preserved following scholarly standards.',
    langVietnamese: 'Tiếng Việt',
    langEnglish: 'English',
    langPreserveNotice: 'Preserved Vietnamese costume terminology per National Museum of History records.',

    themeTitle: 'Color Theme',
    themeLight: 'Dó Paper (Light)',
    themeWarm: 'Warm Silk',
    themeDark: 'Ink Stone (Dark)',
    textSizeTitle: 'Text Size',
    textSmall: 'Compact',
    textStandard: 'Standard',
    textLarge: 'Large',
    densityTitle: 'Layout Density',
    densityComfortable: 'Comfortable',
    densityCompact: 'Compact',

    autoSaveTitle: 'Auto-save Collections & Stamps',
    syncMapTitle: 'Sync Garment with Heritage Map',
    localStorageManager: 'VIETPHUC_LOCAL_STORAGE_V1 Manager',
    resetDefault: 'Reset to Factory Defaults',

    strictHeritage: 'Strict Heritage',
    modernFusion: 'Modern Fusion',
    singleMode: 'Single',
    coupleMode: 'Couple',
    groupMode: 'Group',

    common: {
      close: 'Close',
      cancel: 'Cancel',
      save: 'Save',
      saved: 'Saved',
      copy: 'Copy',
      copied: 'Copied',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      loading: 'Loading...',
      success: 'Success',
      share: 'Share',
      viewDetails: 'View Details',
      apply: 'Apply',
      applied: 'Applied',
      download: 'Download',
      edit: 'Edit',
      delete: 'Delete',
      send: 'Send',
      women: 'Women',
      men: 'Men',
      gender: 'Gender',
      size: 'Size',
      height: 'Height',
      weight: 'Weight',
    },

    studio: {
      stageTitle: '3D WebGL Virtual Runway Stage',
      viewportSideBySide: 'Side-by-side (2D & 3D)',
      viewport2DOnly: '2D Photo',
      viewport3DOnly: '3D Model',
      cameraFront: 'Front',
      camera34: '3/4 View',
      cameraCloseup: 'Closeup',
      cameraBack: 'Back',
      badge2D: '2D Model Portrait',
      badge3D: '3D Rigged WebGL (Drag to rotate)',
      badgeLoading: 'Loading 3D model...',
      askAiStylist: 'Ask AI Stylist',
      saveLookbook: 'Save Lookbook',
      b2bTailor: 'B2B Tailor',
      systemJson: 'System JSON',
      displayModeMinimal: 'Minimal',
      displayModeFull: 'Detailed',
      garmentSelector: 'Traditional Heritage Garments',
      tabMeaning: 'Meaning & History',
      tabStructure: 'Anatomy & Tailoring',
      paletteSelector: 'Silk & Brocade Color Palette',
      paletteHeritage: 'Heritage Palettes',
      paletteCustom: 'Custom 3 Colors',
      slotPrimary: 'Primary Body Silk',
      slotSecondary: 'Inner Lining / Collar',
      slotAccent: 'Borders & Buttons',
      lowerGarmentSelector: 'Lower Garment (Trousers / Skirt)',
      motifSelector: 'Weave Motifs & Historical Patterns',
      accessoriesSelector: 'Khăn Xếp & Court Accessories',
      footwearSelector: 'Embroidered Slippers & Wooden Clogs',
      bodySectionTitle: 'Anthropometric Body Shape & Sliders',
      bodyPresets: '5 Standard Body Types',
      skinTone: 'Skin Pigment / Tone',
      heightSlider: 'Body Height (cm)',
      shoulderSlider: 'Shoulder Width',
      torsoSlider: 'Torso & Waist',
      hipSlider: 'Hip Width',
      cultureGuardTitle: 'Culture Guard™ — Heritage Protocol Inspector',
      cultureGuardCompliant: 'Heritage Protocol Compliant',
      cultureGuardWarning: 'Heritage Code Discrepancy Detected',
      aiAgentTitle: 'Realtime AI Styling Advisor (4 Variables)',
      aiEvent: 'Occasion / Event',
      aiWeather: 'Weather',
      aiStyle: 'Styling Aesthetic',
      aiBudget: 'Budget Tier',
      aiApply: 'Apply Recommendation',
      b2bModalTitle: 'Standard B2B Tailoring Specification',
      b2bModalDesc: '3D anthropometric measurements synchronized with verified Vietnamese heritage ateliers',
      b2bSendDirect: 'Send to B2B Tailor',
      b2bCopyPayload: 'Copy JSON Specification',
    },

    community: {
      tabAll: 'All Posts',
      tabMoments: 'Heritage Moments',
      tabB2BMarketplace: 'B2B Tailors & Marketplace',
      tabEvents: 'Events & Workshops',
      tabKnowledge: 'Heritage Knowledge (PGC)',
      createPost: 'Create Post',
      searchPlaceholder: 'Search posts, ateliers, garments...',
      filterGarment: 'Filter garment',
      filterBody: 'Filter body type',
      tryOn3D: 'Try on in 3D',
      viewOnMap: 'View on Map',
      craftedBy: 'Crafted by Atelier',
      like: 'Like',
      comment: 'Comment',
      share: 'Share',
      tailorListTitle: 'Verified Partner Tailors & Artisans',
      tailorVerifiedBadge: 'Heritage Certified',
      tailorRequestQuote: 'Request Instant Quote',
      tailorChat: 'Chat with Atelier',
      tailorSendMeasurements: 'Send 3D Measurements',
      scanAiCompliance: 'AI Culture Guard Verification',
      publishPostBtn: 'Publish to Community',
      newPostTitle: 'Share Your Heritage Moment',
    },

    heritageMap: {
      tabMap: 'Heritage Map',
      tabPassport: 'Digital Passport',
      tabTour360: '360° Panorama Tour',
      tabCheckin: 'GPS & AR Check-in',
      searchPlaceholder: 'Search heritage site (Temple of Literature, Imperial Citadel...)...',
      filterRegion: 'Region',
      regionAll: 'All Regions',
      regionNorth: 'Northern Region',
      regionCentral: 'Central Region',
      regionSouth: 'Southern Region',
      dynastyEra: 'Dynasty / Historical Era',
      recommendedGarment: 'Recommended Attire',
      tryInStudio: 'Try on matching attire in 3D',
      launchTour360: 'Launch 360° Virtual Tour',
      checkInAction: 'Check-in for Passport Stamp',
      nearbyTailors: 'Affiliated Satellite Tailors',
      passportTitle: 'Digital Heritage Passport',
      collectedStamps: 'Collected Stamps',
      honorBadges: 'Heritage Badges',
      exportPassport: 'Export Passport (PDF / Image)',
      arCameraTitle: 'AR Camera Heritage Check-in',
      capturePhoto: 'Capture Commemorative Photo',
      checkInSuccess: 'Passport successfully stamped!',
      pointsAwarded: 'Heritage Points Earned',
    },

    messages: {
      title: 'Conversations & Cultural Advisory',
      tabAll: 'All',
      tabAi: 'Heritage AI (Gemini)',
      tabTailors: 'B2B Tailors',
      tabPersonal: 'Personal',
      searchPlaceholder: 'Search conversations...',
      inputPlaceholder: 'Ask Cultural Advisor or message tailor atelier...',
      sendBtn: 'Send',
      sendMeasurementsBtn: 'Send 3D Measurements',
      tryInStudioBtn: 'Try this outfit in 3D',
      onlineBadge: 'Active now',
      quickPromptsTitle: 'Suggested inquiries:',
    },

    // Verified Traditional Proper Nouns in English (Strictly preserving proper names with scholarly parenthetical gloss)
    garments: {
      aoNguThan: 'Áo Ngũ Thân (Five-paneled Gown)',
      aoNhatBinh: 'Áo Nhật Bình (Square-collared Court Gown)',
      aoTuThan: 'Áo Tứ Thân (Four-part Gown)',
      aoDai: 'Áo Dài',
      aoBaBa: 'Áo Bà Ba',
    },

    garmentDescriptions: {
      aoNguThan: 'Áo Ngũ Thân (Nguyễn Dynasty Standing Collar Five-paneled Gown) — Five panels represent parents and the wearer; five buttons symbolize benevolence, righteousness, propriety, wisdom, and sincerity.',
      aoNhatBinh: 'Áo Nhật Bình (Square-collared Court Gown) — Formal court attire for empresses, consorts, and royal princesses featuring rectangular multi-colored embroidered collar.',
      aoTuThan: 'Áo Tứ Thân (Four-part Traditional Gown) — Traditional attire of the Red River Delta women, famously associated with Quan Họ Folk Culture.',
      aoDai: 'Áo Dài — Vietnam’s iconic cultural dress celebrating grace, modesty, and timeless elegance.',
      aoBaBa: 'Áo Bà Ba — Traditional Southern Vietnamese silk garment epitomizing rural charm and water-region heritage.',
    },
  },
};

/**
 * Returns the localized verified garment name
 */
export function getLocalizedGarmentName(garmentId: string, lang: AppLanguage = 'vi'): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.vi;
  switch (garmentId) {
    case 'ao-ngu-than':
      return dict.garments.aoNguThan;
    case 'ao-nhat-binh':
      return dict.garments.aoNhatBinh;
    case 'ao-tu-than':
      return dict.garments.aoTuThan;
    case 'ao-dai-ba-ba':
    case 'ao-dai':
      return dict.garments.aoDai;
    case 'ao-ba-ba':
      return dict.garments.aoBaBa;
    default:
      return 'Cổ Phục Việt Nam';
  }
}
