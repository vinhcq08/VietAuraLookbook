export interface StructuralPoint {
  id: string;
  label: string;
  detail: string;
}

export interface GarmentHeritage {
  id: string;
  accessionNumber: string;
  name: string;
  subtitle: string;
  period: string;
  origin: string;
  structure: string;
  meaning: string;
  occasions: string[];
  standardAccessories: string[];
  imageUrl: string;
  garment2DUrl: string;
  defaultPaletteId: string;
  structuralPoints: StructuralPoint[];
}

export interface ColorSwatch {
  name: string;
  hex: string;
  role: string;
}

export interface LookbookPalette {
  id: string;
  name: string;
  seasonTag: string;
  swatches: ColorSwatch[];
  fabricNote: string;
}

export type StylingMode = 'STRICT_HERITAGE' | 'MODERN_FUSION';
export type UIDisplayMode = 'MINIMAL_MODE' | 'ADVANCED_MODE';
export type ActiveSystemTab =
  | 'TAB_1_CORE_STUDIO'
  | 'TAB_2_HERITAGE_JOURNEY'
  | 'TAB_3_COMMUNITY_MARKETPLACE';
export type GroupStylingMode = 'SINGLE' | 'COUPLE' | 'GROUP';

export const VIETPHUC_LOCAL_STORAGE_KEY = 'VIETPHUC_LOCAL_STORAGE_V1' as const;

export interface LocalStorageMutationPreview {
  updated_field: string;
  new_value_summary: string;
}

export interface MandatorySystemJsonOutputSchema {
  system_state: {
    active_tab: ActiveSystemTab;
    styling_mode: StylingMode;
    ui_display_mode: UIDisplayMode;
    local_storage_key: 'VIETPHUC_LOCAL_STORAGE_V1';
  };
  outfit_3d_config: {
    outfit_id: string;
    outfit_type: 'NGU_THAN' | 'NHAT_BINH' | 'TU_THAN' | 'AO_DAI' | 'BA_BA';
    group_styling_mode: GroupStylingMode;
    palette_hex: {
      primary: string;
      secondary: string;
      accent: string;
    };
    body_measurements: {
      height_cm: number;
      weight_kg: number;
      chest_cm: number;
      waist_cm: number;
      hip_cm: number;
    };
    recommended_size: 'S' | 'M' | 'L' | 'XL';
  };
  b2b_measurement_export: {
    is_ready_for_tailor: boolean;
    formatted_measurement_payload: string;
  };
  culture_guard_result: {
    status: 'APPROVED' | 'WARNING' | 'REJECTED';
    applied_rule: string;
    culture_tip_message: string;
    auto_fix_available: boolean;
  };
  local_storage_mutation_preview?: LocalStorageMutationPreview;
  marketplace_link?: {
    is_available_for_rent: boolean;
    nearest_partner_shop_id: string | null;
    rental_price_from: string;
  };
}

export interface WeeklyStylingChallengeItem {
  id: string;
  hashtag: string;
  title: string;
  subtitle: string;
  rewardVoucherCode: string;
  rewardTitle: string;
  deadlineLabel: string;
  participantsCount: number;
  entries: Array<{
    entryId: string;
    author: string;
    outfitTitle: string;
    votes: number;
    imageUrl: string;
    outfitConfig: OutfitConfigCode;
  }>;
}

export interface CultureGuardViolation {
  ruleId: string;
  ruleTitle: string;
  severity: 'critical' | 'advisory';
  message: string;
  historicalContext: string;
  fixSuggestion: string;
  autoFixPatch: Partial<StudioSelection>;
}

export interface StudioSelection {
  gender: 'nam' | 'nu';
  garmentId: string;
  paletteId: string;
  lowerGarmentId: string;
  motifId: string;
  accessoryIds: string[];
  footwearId: string;
  occasionId: string;
  weatherId: string;
}

export interface LookbookCardData {
  id: string;
  outfitName: string;
  mainGarment: string;
  accessories: string[];
  palette: ColorSwatch[];
  occasionAndWeather: string;
  culturalMeaning: string;
  cultureGuardNote: string;
  hasViolation?: boolean;
  garmentId?: string;
  imageUrl?: string;
  styleTag?: string;
  eventTag?: string;
}

export const HERITAGE_IMAGES = {
  hero: '/src/assets/images/hero_viet_phuc_editorial_1791199781162.jpg',
  aoNguThan: '/src/assets/images/ao_ngu_than_showcase_1791199795123.jpg',
  aoNhatBinh: '/src/assets/images/ao_nhat_binh_showcase_1791199806265.jpg',
  aoTuThan: '/src/assets/images/ao_tu_than_showcase_1791199817010.jpg',
  aoDaiBaBa: '/src/assets/images/ao_dai_ba_ba_showcase_1791199827249.jpg',
  // Dedicated 2D Garment Mannequin Catalog Images
  garment2DAoNguThan: '/src/assets/images/garment_2d_ao_ngu_than_1791510639097.jpg',
  garment2DAoNhatBinh: '/src/assets/images/garment_2d_ao_nhat_binh_1791510650100.jpg',
  garment2DAoTuThan: '/src/assets/images/garment_2d_ao_tu_than_1791510663101.jpg',
  garment2DAoDaiBaBa: '/src/assets/images/garment_2d_ao_dai_ba_ba_1791510675876.jpg',
  realFemaleStudio: '/src/assets/images/ao_ngu_than_nu_green_1791612207905.jpg',
  realMaleStudio: '/src/assets/images/ao_ngu_than_nam_green_1791612194968.jpg',
  // 2D Studio Models mapped directly to 3D Models (Nam / Nu) & 3D Garments
  model2DNuNguThan: '/src/assets/images/ao_ngu_than_nu_green_1791612207905.jpg',
  model2DNuNhatBinh: '/src/assets/images/model_2d_nu_nhat_binh_1791476821168.jpg',
  model2DNuTuThan: '/src/assets/images/model_2d_nu_tu_than_1791476830177.jpg',
  model2DNuBaBa: '/src/assets/images/model_2d_nu_ba_ba_1791476841654.jpg',
  model2DNamNguThan: '/src/assets/images/ao_ngu_than_nam_green_1791612194968.jpg',
  model2DNamLePhuc: '/src/assets/images/model_2d_nam_le_phuc_1791476860919.jpg',
  model2DNamHoiXuan: '/src/assets/images/model_2d_nam_hoi_xuan_1791510686459.jpg',
  model2DNamBaBa: '/src/assets/images/model_2d_nam_ba_ba_1791476850177.jpg',
  festivalHoiLim: '/src/assets/images/le_hoi_lim_quan_ho_1791562579189.jpg',
  festivalDenHung: '/src/assets/images/le_hoi_den_hung_1791562591526.jpg',
  festivalCungDinhHue: '/src/assets/images/le_hoi_cung_dinh_hue_1791562603825.jpg',
  vanMieu360Panorama: '/src/assets/images/van_mieu_360_panorama_1791644768154.jpg',
};

export interface Model2DPhotoVariant {
  id: string;
  label: string;
  gender: 'nam' | 'nu';
  garmentId: string;
  studioUrl: string;
  garment2DUrl: string;
  editorialUrl: string;
  caption: string;
}

export const MODEL_2D_VARIANTS: Model2DPhotoVariant[] = [
  {
    id: '2d-nu-ngu-than',
    label: 'Nữ · Áo Ngũ Thân Tay Chẽn',
    gender: 'nu',
    garmentId: 'ao-ngu-than',
    studioUrl: HERITAGE_IMAGES.model2DNuNguThan,
    garment2DUrl: HERITAGE_IMAGES.garment2DAoNguThan,
    editorialUrl: HERITAGE_IMAGES.aoNguThan,
    caption: 'Mẫu Nữ 2D · Áo Ngũ Thân Lập Lĩnh 5 vạt phối quần lụa trắng & khăn vấn',
  },
  {
    id: '2d-nu-nhat-binh',
    label: 'Nữ · Áo Nhật Bình Cung Đình',
    gender: 'nu',
    garmentId: 'ao-nhat-binh',
    studioUrl: HERITAGE_IMAGES.model2DNuNhatBinh,
    garment2DUrl: HERITAGE_IMAGES.garment2DAoNhatBinh,
    editorialUrl: HERITAGE_IMAGES.aoNhatBinh,
    caption: 'Mẫu Nữ 2D · Áo Nhật Bình cổ chữ nhật, viền tay ngũ sắc, mấn & quần lụa trắng',
  },
  {
    id: '2d-nu-tu-than',
    label: 'Nữ · Áo Tứ Thân & Yếm Đào',
    gender: 'nu',
    garmentId: 'ao-tu-than',
    studioUrl: HERITAGE_IMAGES.model2DNuTuThan,
    garment2DUrl: HERITAGE_IMAGES.garment2DAoTuThan,
    editorialUrl: HERITAGE_IMAGES.aoTuThan,
    caption: 'Mẫu Nữ 2D · Áo Tứ Thân buộc vạt trước, yếm đào, váy đụp đen & nón quai thao',
  },
  {
    id: '2d-nu-ba-ba',
    label: 'Nữ · Áo Bà Ba & Tân Thời',
    gender: 'nu',
    garmentId: 'ao-dai-ba-ba',
    studioUrl: HERITAGE_IMAGES.model2DNuBaBa,
    garment2DUrl: HERITAGE_IMAGES.garment2DAoDaiBaBa,
    editorialUrl: HERITAGE_IMAGES.aoDaiBaBa,
    caption: 'Mẫu Nữ 2D · Áo Bà Ba tơ đũi xẻ tà, khăn rằn Nam Bộ & quần lụa đen',
  },
  {
    id: '2d-nam-ngu-than',
    label: 'Nam · Áo Ngũ Thân Lập Lĩnh',
    gender: 'nam',
    garmentId: 'ao-ngu-than',
    studioUrl: HERITAGE_IMAGES.model2DNamNguThan,
    garment2DUrl: HERITAGE_IMAGES.model2DNamNguThan,
    editorialUrl: HERITAGE_IMAGES.model2DNamNguThan,
    caption: 'Mẫu Nam 2D · Áo Ngũ Thân Lập Lĩnh 5 cúc, khăn xếp chữ Nhân & quần lụa trắng',
  },
  {
    id: '2d-nam-le-phuc',
    label: 'Nam · Áo Tấc (Lễ Phục Tay Thụng)',
    gender: 'nam',
    garmentId: 'ao-nhat-binh',
    studioUrl: HERITAGE_IMAGES.model2DNamLePhuc,
    garment2DUrl: HERITAGE_IMAGES.model2DNamLePhuc,
    editorialUrl: HERITAGE_IMAGES.model2DNamLePhuc,
    caption: 'Mẫu Nam 2D · Đại lễ phục Áo Tấc (Ngũ Thân Tay Thụng), cổ đứng 5 khuy đồng & khăn đóng',
  },
  {
    id: '2d-nam-dan-gian',
    label: 'Nam · Áo Tứ Thân Nam (Kinh Bắc)',
    gender: 'nam',
    garmentId: 'ao-tu-than',
    studioUrl: HERITAGE_IMAGES.model2DNamHoiXuan,
    garment2DUrl: HERITAGE_IMAGES.model2DNamHoiXuan,
    editorialUrl: HERITAGE_IMAGES.model2DNamHoiXuan,
    caption: 'Mẫu Nam 2D · Áo Tứ Thân Nam Bắc Bộ khoác ngoài áo cánh lót trắng, đai lưng & quần lụa',
  },
  {
    id: '2d-nam-ba-ba',
    label: 'Nam · Áo Bà Ba & Khăn Rằn',
    gender: 'nam',
    garmentId: 'ao-dai-ba-ba',
    studioUrl: HERITAGE_IMAGES.model2DNamBaBa,
    garment2DUrl: HERITAGE_IMAGES.model2DNamBaBa,
    editorialUrl: HERITAGE_IMAGES.model2DNamBaBa,
    caption: 'Mẫu Nam 2D · Áo Bà Ba Nam Bộ phối khăn rằn kẻ ô, quần lụa đen & guốc gỗ mộc',
  },
];

export const DYNAMIC_2D_IMAGE_MAP: Record<string, string> = {
  'ao-ngu-than-nam': '/assets/2d/ao-ngu-than-nam.png',
  'ao-ngu-than-nu': '/assets/2d/ao-ngu-than-nu.png',
  'ao-nhat-binh-nam': '/assets/2d/ao-nhat-binh-nam.png',
  'ao-nhat-binh-nu': '/assets/2d/ao-nhat-binh-nu.png',
  'ao-tu-than-nam': '/assets/2d/ao-tu-than-nam.png',
  'ao-tu-than-nu': '/assets/2d/ao-tu-than-nu.png',
  'ao-dai-ba-ba-nam': '/assets/2d/ao-dai-ba-ba-nam.png',
  'ao-dai-ba-ba-nu': '/assets/2d/ao-dai-ba-ba-nu.png',
};

export function getDynamic2DImagePath(garmentId: string, gender: 'nam' | 'nu'): string {
  const key = `${garmentId}-${gender}`;
  return DYNAMIC_2D_IMAGE_MAP[key] || `/assets/2d/${garmentId}-${gender}.png`;
}

export function get2DModelImageForSelection(
  gender: 'nam' | 'nu',
  garmentId: string,
  style: 'studio' | 'editorial' = 'studio'
): Model2DPhotoVariant {
  const matched =
    MODEL_2D_VARIANTS.find((v) => v.gender === gender && v.garmentId === garmentId) ||
    MODEL_2D_VARIANTS.find((v) => v.gender === gender) ||
    MODEL_2D_VARIANTS[0];
  return style === 'editorial'
    ? { ...matched, studioUrl: matched.editorialUrl }
    : { ...matched, studioUrl: getDynamic2DImagePath(garmentId, gender) };
}

export const HERITAGE_GARMENTS: GarmentHeritage[] = [
  {
    id: 'ao-ngu-than',
    accessionNumber: 'ACC. 1744.NT.01',
    name: 'Áo Ngũ Thân (Lập Lĩnh & Tay Chẽn)',
    subtitle: 'Quốc phục biểu trưng đạo lý Ngũ thường & Tứ thân phụ mẫu',
    period: 'Định hình 1744 (Võ Vương Nguyễn Phúc Khoát) · Quốc phục thời Minh Mạng (1820–1841)',
    origin:
      'Định hình năm 1744 dưới thời Võ Vương Nguyễn Phúc Khoát tại Đàng Trong và trở thành quốc phục toàn cõi dưới thời vua Minh Mạng (1820–1841) qua chính sách "nhất thống y quan".',
    structure:
      'Gồm 5 vạt (2 vạt trước, 2 vạt sau và 1 vạt con tỳ ẩn bên trong đại diện cho bản thân người mặc), cài 5 hạt khuy/cúc từ cổ chéo sang nách phải, cổ đứng (lập lĩnh), tay chẽn gọn gàng hoặc tay thụng lễ nghi.',
    meaning:
      'Bốn vạt lớn tượng trưng cho Tứ thân phụ mẫu (cha mẹ mình và cha mẹ người thương) ôm ấp, chở che cho vạt con bên trong; 5 hạt cúc nhắc nhở đạo Ngũ thường (Nhân, Lễ, Nghĩa, Trí, Tín); cổ áo đứng thẳng biểu thị sự chính trực, khiêm cung.',
    occasions: ['Lễ tốt nghiệp', 'Lễ nghi trang trọng', 'Cưới hỏi', 'Ngày Tết', 'Ngoại giao & Chụp ảnh di tích'],
    standardAccessories: ['Khăn xếp / Khăn vấn', 'Guốc gỗ mộc', 'Quạt xòe trầm hương', 'Quần lụa trắng'],
    imageUrl: HERITAGE_IMAGES.aoNguThan,
    garment2DUrl: HERITAGE_IMAGES.garment2DAoNguThan,
    defaultPaletteId: 'khue-van-tri-thuc',
    structuralPoints: [
      {
        id: 'co-lap-linh',
        label: 'Cổ Lập Lĩnh (Cổ Đứng)',
        detail: 'Bản cổ dựng thẳng ôm vừa vặn quanh cổ, che kín phần cổ áo lót trắng bên trong, biểu trưng cho phẩm hạnh ngay thẳng và sự tôn nghiêm.',
      },
      {
        id: 'nam-vat-ao',
        label: 'Cấu Trúc 5 Vạt Áo',
        detail: 'Hai vạt trước và hai vạt sau tượng trưng cho Tứ thân phụ mẫu; vạt thứ 5 (vạt con) nằm kín bên dưới vạt trước, tượng trưng cho người con được gia đình bao bọc.',
      },
      {
        id: 'nam-hat-khuy',
        label: '5 Hạt Khuy (Ngũ Thường)',
        detail: 'Đính theo đường lượn từ dưới cổ sang nách phải, chế tác từ đồng, bạc, ngọc hoặc gỗ, đại diện cho Nhân - Lễ - Nghĩa - Trí - Tín.',
      },
      {
        id: 'tay-chen',
        label: 'Ống Tay Chẽn',
        detail: 'Ống tay may nối vải (tiếp tụ) thuôn gọn dần về phía cổ tay, thuận tiện cho việc học tập, lao động và di chuyển thanh thoát.',
      },
    ],
  },
  {
    id: 'ao-nhat-binh',
    accessionNumber: 'ACC. 1802.NB.02',
    name: 'Áo Nhật Bình',
    subtitle: 'Lễ phục cung đình và mệnh phụ phu nhân triều Nguyễn',
    period: 'Triều Nguyễn (1802–1945)',
    origin:
      'Thường phục của Hậu phi, Công chúa, Nữ quan chốn nội cung và là lễ phục trang trọng của các bậc mệnh phụ phu nhân quan lại triều Nguyễn (1802–1945).',
    structure:
      'Cổ áo xẻ dọc to bản phía trước ngực, khi mặc cài dây buộc ghép lại tạo thành hình chữ nhật ("Nhật Bình"); ống tay áo rộng viền dải màu ngũ sắc (xanh, vàng, đỏ, trắng, đen).',
    meaning:
      'Viền tay ngũ sắc tượng trưng cho quy luật Ngũ hành tương sinh; đồ án thêu Phượng, Loan, Bát Bửu trong ô tròn (thức đoàn) thể hiện phẩm cấp cao quý và vẻ đoan trang.',
    occasions: ['Lễ cưới truyền thống', 'Chụp ảnh nghệ thuật cung đình', 'Lễ kỷ yếu trang trọng', 'Sự kiện di sản'],
    standardAccessories: ['Mấn đội đầu (Khăn vành)', 'Xuyến bạc / Kiềng cổ', 'Guốc mộc / Hài thêu', 'Quạt lụa'],
    imageUrl: HERITAGE_IMAGES.aoNhatBinh,
    garment2DUrl: HERITAGE_IMAGES.garment2DAoNhatBinh,
    defaultPaletteId: 'chu-sa-ngu-uyen',
    structuralPoints: [
      {
        id: 'co-nhat-binh',
        label: 'Cổ Áo Chữ Nhật',
        detail: 'Bản cổ to thêu họa tiết tinh xảo, khi khép hai vạt trước ngực tạo thành hình chữ "Nhật" vuông vức, uy nghi.',
      },
      {
        id: 'dai-ngu-sac',
        label: 'Viền Tay Ngũ Sắc',
        detail: 'Cổ tay áo rộng được phối 5 dải màu đại diện cho Ngũ hành (Kim, Mộc, Thủy, Hỏa, Thổ), tạo hiệu ứng thị giác rực rỡ khi chắp tay hành lễ.',
      },
      {
        id: 'hoa-van-thuc-doan',
        label: 'Đồ Án Thức Đoàn & Bát Bửu',
        detail: 'Thêu hoa văn Loan, Phượng hoặc hoa cỏ bốn mùa đan xen dải thủy ba ở gấu áo, phân định rõ thứ bậc trong điển chế.',
      },
    ],
  },
  {
    id: 'ao-tu-than',
    accessionNumber: 'ACC. 1650.TT.03',
    name: 'Áo Tứ Thân & Yếm Đào',
    subtitle: 'Tinh hoa y phục dân gian Bắc Bộ và di sản Quan họ Kinh Bắc',
    period: 'Dân gian lâu đời · Phổ biến từ thế kỷ XVII – đầu thế kỷ XX',
    origin:
      'Trang phục lao động, sinh hoạt và lễ hội dân gian lâu đời của phụ nữ miền Bắc, gắn liền mật thiết với không gian văn hóa dân ca Quan họ Bắc Ninh.',
    structure:
      'Gồm 4 vạt dài (2 vạt sau khâu liền theo sống lưng, 2 vạt trước tách rời để buông rủ hoặc buộc thắt trước bụng), mặc ngoài áo yếm (yếm đào/yếm thắm) và váy đụp đen mềm mại.',
    meaning:
      'Tôn vinh nét duyên dáng vừa kín đáo vừa phóng khoáng của người phụ nữ đồng bằng Bắc Bộ; sự phối hợp nhiều lớp màu giữa áo ngoài, yếm đào và dải lưng lụa tạo nên vẻ đẹp "mớ ba mớ bảy".',
    occasions: ['Lễ hội dân gian', 'Diễn xướng nghệ thuật', 'Du xuân trảy hội', 'Chụp ảnh kỷ niệm văn hóa Bắc Bộ'],
    standardAccessories: ['Nón ba tầm (Nón quai thao)', 'Dải thắt lưng bao', 'Guốc mộc', 'Khăn mỏ quạ'],
    imageUrl: HERITAGE_IMAGES.aoTuThan,
    garment2DUrl: HERITAGE_IMAGES.garment2DAoTuThan,
    defaultPaletteId: 'kinh-bac-dao-hoa',
    structuralPoints: [
      {
        id: 'bon-vat-ao',
        label: 'Hai Vạt Trước Buộc Thắt',
        detail: 'Hai vạt trước có thể buông thướt tha hoặc thắt nút nhẹ trước eo để lộ lớp áo yếm đào và dải lưng lụa rực rỡ bên trong.',
      },
      {
        id: 'yem-dao',
        label: 'Áo Yếm Đào & Dải Lưng Bao',
        detail: 'Yếm cổ xây hoặc cổ sẻ màu đỏ thắm/hồng đào ôm lấy lưng thon, cố định bằng dải thắt lưng lụa xanh hoặc hoa lý.',
      },
      {
        id: 'non-ba-tam',
        label: 'Nón Ba Tầm (Nón Quai Thao)',
        detail: 'Phụ kiện biểu tượng dành riêng cho nữ giới Bắc Bộ với vành nón rộng phẳng và dải quai thao tơ tằm buông mềm trước ngực.',
      },
    ],
  },
  {
    id: 'ao-dai-ba-ba',
    accessionNumber: 'ACC. 1934.AD.04',
    name: 'Áo Dài Tân Thời & Áo Bà Ba',
    subtitle: 'Bước chuyển mình hiện đại thập niên 1930 & Hồn cốt phóng khoáng phương Nam',
    period: 'Thế kỷ XIX – Thập niên 1930',
    origin:
      'Áo Dài Tân Thời (Lemur Cát Tường, Lê Phổ - thập niên 1930) cách tân từ áo ngũ thân kết hợp kỹ thuật cắt may phương Tây; trong khi Áo Bà Ba là trang phục đặc trưng của vùng sông nước Nam Bộ.',
    structure:
      'Áo Dài Tân Thời giản lược còn 2 tà, ôm nhẹ tôn đường cong hiện đại. Áo Bà Ba không cổ, xẻ tà cao hai bên hông, phối cùng quần lụa dài và khăn rằn vắt vai.',
    meaning:
      'Minh chứng cho sức sống linh hoạt của y phục Việt: từ vẻ thanh lịch đô thị giao thời (Áo Dài Tân Thời) đến tinh thần bình dị, hào sảng nơi miệt vườn Nam Bộ (Áo Bà Ba).',
    occasions: ['Dạo phố mùa thu', 'Chụp ảnh kỷ yếu hoài cổ', 'Lễ hội văn hóa phương Nam', 'Du lịch di sản'],
    standardAccessories: ['Khăn rằn Nam Bộ', 'Nón lá', 'Guốc gỗ sơn mài', 'Kiềng bạc / Ngọc trai'],
    imageUrl: HERITAGE_IMAGES.aoDaiBaBa,
    garment2DUrl: HERITAGE_IMAGES.garment2DAoDaiBaBa,
    defaultPaletteId: 'phuong-nam-binh-di',
    structuralPoints: [
      {
        id: 'ao-dai-lemur',
        label: 'Phom Dáng Tân Thời (1930s)',
        detail: 'Lược bỏ vạt con thứ 5, thu gọn phần eo và vai theo nhân trắc học phương Tây nhưng vẫn giữ trọn nét kín đáo Á Đông.',
      },
      {
        id: 'ao-ba-ba-xe-ta',
        label: 'Áo Bà Ba Xẻ Tà & Khăn Rằn',
        detail: 'Thiết kế xẻ tà hai bên hông giúp người mặc thoải mái chèo xuồng, lao động; đi liền với chiếc khăn rằn kẻ ô đen-trắng đặc trưng Nam Bộ.',
      },
    ],
  },
];

export function getGenderAwareGarmentInfo(
  garmentId: string,
  gender: 'nam' | 'nu'
): GarmentHeritage {
  const base =
    HERITAGE_GARMENTS.find((g) => g.id === garmentId) || HERITAGE_GARMENTS[0];
  if (gender !== 'nam') {
    return base;
  }

  if (garmentId === 'ao-ngu-than') {
    return {
      ...base,
      accessionNumber: 'ACC. 1744.NT.01M',
      name: 'Áo Ngũ Thân Lập Lĩnh (Nam)',
      subtitle: 'Quốc phục nam nhân nho nhã · Cổ đứng 5 khuy đồng & hộ lĩnh trắng',
      structure:
        'Gồm 5 vạt (2 vạt trước, 2 vạt sau và 1 vạt con thứ 5 ẩn bên trong), cổ đứng (lập lĩnh) có lót cổ trắng (hộ lĩnh), cài 5 khuy đồng bên phải, vai xuôi thẳng tự nhiên, ống tay chẽn gọn gàng phối cùng quần dài trắng.',
      standardAccessories: ['Khăn đóng chữ Nhân', 'Quạt xếp trầm hương', 'Guốc gỗ mộc', 'Quần lụa trắng'],
      imageUrl: HERITAGE_IMAGES.model2DNamNguThan,
      garment2DUrl: HERITAGE_IMAGES.model2DNamNguThan,
    };
  }

  if (garmentId === 'ao-nhat-binh') {
    return {
      ...base,
      accessionNumber: 'ACC. 1802.AT.02M',
      name: 'Áo Tấc · Lễ Phục Tay Thụng (Nam)',
      subtitle: 'Đại lễ phục truyền thống nam nhân · Tay thụng rộng & cổ đứng trang nghiêm',
      period: 'Định hình 1744 · Đại lễ phục triều Nguyễn (1802–1945)',
      origin:
        'Áo Tấc (Áo Ngũ Thân Tay Thụng) là đại lễ phục truyền thống của nam giới Việt Nam từ thời chúa Nguyễn sang triều Nguyễn, diện trong các dịp tế lễ, khoa cử, cưới hỏi và đại lễ triều đình.',
      structure:
        'Cổ đứng lập lĩnh cao trang nghiêm có viền hộ lĩnh trắng bên trong, cài 5 hạt khuy đồng bên phải, ống tay áo thụng rộng dài quá cổ tay, 5 vạt áo buông suông bề thế phối cùng quần lụa trắng ống rộng.',
      meaning:
        'Ống tay rộng thụng tạo phong thái khoan thai, uy nghi khi chắp tay vái lạy hành lễ; 5 vạt áo và 5 khuy đồng giữ trọn đạo lý Tứ thân phụ mẫu và Ngũ thường của bậc quân tử.',
      occasions: ['Đại lễ truyền thống', 'Lễ cưới hỏi nam nhân', 'Lễ tốt nghiệp & Vinh quy', 'Tế lễ từ đường & Di tích'],
      standardAccessories: ['Khăn đóng chữ Nhân', 'Hài thêu / Giày Gia Định', 'Quạt trầm hương', 'Quần lụa trắng'],
      imageUrl: HERITAGE_IMAGES.model2DNamLePhuc,
      garment2DUrl: HERITAGE_IMAGES.model2DNamLePhuc,
      structuralPoints: [
        {
          id: 'co-lap-linh',
          label: 'Cổ Lập Lĩnh & Hộ Lĩnh Trắng',
          detail: 'Cổ áo dựng đứng cứng cáp ôm quanh cổ nam nhân, lộ viền cổ áo lót trắng (hộ lĩnh) thanh sạch bên trong.',
        },
        {
          id: 'tay-thung-dai-le',
          label: 'Ống Tay Thụng Đại Lễ',
          detail: 'Tay áo may rộng bản (rộng tới một tấc rưỡi - hai tấc), rủ xuống uy nghi khi chắp tay hành lễ trước hương án.',
        },
        {
          id: 'nam-hat-khuy',
          label: '5 Khuy Đồng & Vạt Con Thứ 5',
          detail: 'Đính 5 hạt khuy đồng từ cổ chéo sang nách phải tượng trưng Ngũ thường, che chở vạt con thứ 5 bên trong.',
        },
      ],
    };
  }

  if (garmentId === 'ao-tu-than') {
    return {
      ...base,
      accessionNumber: 'ACC. 1650.TT.03M',
      name: 'Áo Tứ Thân Nam (Thường Phục Bắc Bộ)',
      subtitle: 'Trang phục dân gian & lễ hội nam nhân Bắc Bộ · Áo cánh lót trắng & đai lưng',
      period: 'Dân gian Bắc Bộ · Thế kỷ XVII – đầu thế kỷ XX',
      origin:
        'Trang phục thường nhật và trảy hội xuân của nam giới vùng đồng bằng Bắc Bộ và liền anh Kinh Bắc xưa (trước và song hành cùng Áo Ngũ Thân).',
      structure:
        'Gồm 4 thân áo (2 thân sau ghép liền sống lưng, 2 vạt trước khép gọn trước ngực hoặc thắt đai vải ngang eo), mặc ngoài áo cánh lụa/đũi trắng kín cổ (không mặc yếm đào như nữ giới), phối cùng quần ống rộng.',
      meaning:
        'Thể hiện vẻ đẹp mộc mạc, khỏe khoắn và nho nhã của nam nhân đất Bắc trong lao động và lễ hội đình làng; kết hợp hài hòa giữa áo tứ thân màu trầm bên ngoài và áo cánh trắng thanh lịch bên trong.',
      occasions: ['Lễ hội dân gian Bắc Bộ', 'Hội Lim & Diễn xướng', 'Du xuân đình chùa', 'Chụp ảnh văn hóa làng cổ'],
      standardAccessories: ['Khăn đóng / Khăn xếp', 'Đai lưng lụa thắt gọn', 'Quạt trầm hương', 'Guốc gỗ mộc'],
      imageUrl: HERITAGE_IMAGES.model2DNamHoiXuan,
      garment2DUrl: HERITAGE_IMAGES.model2DNamHoiXuan,
      defaultPaletteId: 'thanh-phong-nien-hoa',
      structuralPoints: [
        {
          id: 'vat-truoc-khep-gon',
          label: 'Hai Vạt Trước Khép Nghiêm Trang',
          detail: 'Khác với áo tứ thân nữ mở ngực khoe yếm đào, áo tứ thân nam khép hai vạt trước gọn gàng trên nền áo cánh trắng kín đáo.',
        },
        {
          id: 'ao-canh-lot-trang',
          label: 'Áo Cánh Lót Trắng Cổ Đứng',
          detail: 'Lớp áo cánh trắng mặc bên trong thấm hút mồ hôi và giữ vẻ lịch sự, chỉn chu cho nam giới khi dự hội làng.',
        },
        {
          id: 'dai-lung-quan-lua',
          label: 'Đai Lưng Vải & Quần Ống Rộng',
          detail: 'Thắt đai lưng vải gọn ngang eo kết hợp quần lụa trắng hoặc quần lĩnh đen ống rộng, tuyệt đối không mặc váy đụp.',
        },
      ],
    };
  }

  if (garmentId === 'ao-dai-ba-ba') {
    return {
      ...base,
      accessionNumber: 'ACC. 1934.BB.04M',
      name: 'Áo Bà Ba & Khăn Rằn (Nam)',
      subtitle: 'Trang phục truyền thống nam nhân Nam Bộ · Mộc mạc & hào sảng',
      period: 'Thế kỷ XIX – Thế kỷ XX (Văn hóa phương Nam)',
      origin:
        'Trang phục đặc trưng gắn liền với lịch sử khẩn hoang và đời sống sông nước miệt vườn của nam giới miền Tây Nam Bộ.',
      structure:
        'Áo cổ tròn không bâu, thân trước xẻ thẳng chính giữa đính hàng cúc mộc, phom suông thẳng nam tính, xẻ tà hai bên hông, đi kèm khăn rằn kẻ ô vắt vai và quần dài đen hoặc trắng.',
      meaning:
        'Biểu tượng cho tính cách phóng khoáng, trọng nghĩa tình, bình dị và bền bỉ của người đàn ông vùng đất chín rồng phương Nam.',
      occasions: ['Lễ hội văn hóa phương Nam', 'Dạo phố & Du lịch miệt vườn', 'Chụp ảnh di sản nhà cổ', 'Sinh hoạt truyền thống'],
      standardAccessories: ['Khăn rằn Nam Bộ', 'Nón lá', 'Guốc gỗ mộc'],
      imageUrl: HERITAGE_IMAGES.model2DNamBaBa,
      garment2DUrl: HERITAGE_IMAGES.model2DNamBaBa,
      structuralPoints: [
        {
          id: 'co-tron-cuc-giua',
          label: 'Cổ Tròn & Hàng Cúc Giữa',
          detail: 'Không có cổ dựng, thân trước xẻ thẳng chính giữa cài cúc gọn gàng, thoáng mát trong khí hậu nhiệt đới phương Nam.',
        },
        {
          id: 'ao-ba-ba-xe-ta',
          label: 'Phom Suông Nam & Xẻ Tà Hông',
          detail: 'Phom áo suông thẳng không chiết eo như áo nữ, xẻ tà hai bên hông giúp nam giới vận động linh hoạt.',
        },
        {
          id: 'khan-ran-nam-bo',
          label: 'Khăn Rằn Kẻ Ô Vắt Vai',
          detail: 'Chiếc khăn rằn dệt kẻ ô đen-trắng quàng cổ hoặc vắt vai là dấu ấn văn hóa không thể tách rời của nam nhân Nam Bộ.',
        },
      ],
    };
  }

  return base;
}

export function normalizeSelectionForGenderAndGarment(
  current: StudioSelection,
  nextGender: 'nam' | 'nu',
  nextGarmentId: string,
  nextPaletteId?: string
): StudioSelection {
  const gInfo = getGenderAwareGarmentInfo(nextGarmentId, nextGender);
  const resolvedPalette = nextPaletteId || gInfo.defaultPaletteId || current.paletteId;

  if (nextGender === 'nam') {
    const nextLower =
      nextGarmentId === 'ao-dai-ba-ba' ? 'quan-lua-den' : 'quan-lua-trang';
    const nextAcc =
      nextGarmentId === 'ao-dai-ba-ba'
        ? ['khan-ran-non-la']
        : nextGarmentId === 'ao-tu-than'
        ? ['khan-xep', 'dai-lung-bao']
        : ['khan-xep', 'quat-tram-huong'];
    const nextFootwear =
      nextGarmentId === 'ao-nhat-binh' ? 'hai-theu' : 'guoc-go-moc';
    const nextMotif =
      nextGarmentId === 'ao-nhat-binh' ? 'tu-quy-lien-hoa' : 'am-hoa-tron';

    return {
      ...current,
      gender: 'nam',
      garmentId: nextGarmentId,
      paletteId: resolvedPalette,
      lowerGarmentId: nextLower,
      motifId: nextMotif,
      accessoryIds: nextAcc,
      footwearId: nextFootwear,
    };
  }

  // Nữ giới ('nu')
  const nextLower =
    nextGarmentId === 'ao-tu-than'
      ? 'vay-dup-den'
      : nextGarmentId === 'ao-dai-ba-ba'
      ? 'quan-lua-den'
      : 'quan-lua-trang';
  const nextAcc =
    nextGarmentId === 'ao-nhat-binh'
      ? ['man-doi-dau', 'xuyen-bac']
      : nextGarmentId === 'ao-tu-than'
      ? ['non-quai-thao', 'dai-lung-bao']
      : nextGarmentId === 'ao-dai-ba-ba'
      ? ['khan-ran-non-la']
      : ['khan-xep', 'quat-tram-huong'];
  const nextFootwear =
    nextGarmentId === 'ao-nhat-binh' ? 'hai-theu' : 'guoc-go-moc';
  const nextMotif =
    nextGarmentId === 'ao-nhat-binh' ? 'phuong-vu-bat-buu' : 'am-hoa-tron';

  return {
    ...current,
    gender: 'nu',
    garmentId: nextGarmentId,
    paletteId: resolvedPalette,
    lowerGarmentId: nextLower,
    motifId: nextMotif,
    accessoryIds: nextAcc,
    footwearId: nextFootwear,
  };
}

export const LOOKBOOK_PALETTES: LookbookPalette[] = [
  {
    id: 'khue-van-tri-thuc',
    name: 'Khuê Văn Tri Thức',
    seasonTag: 'Thu Hà Nội · Thanh lịch & Học thuật',
    fabricNote: 'Vải tơ sống / đũi dệt nhẹ thoáng khí, lót lụa tơ tằm trắng ngà',
    swatches: [
      { name: 'Xanh Ngọc Lam', hex: '#2E8B57', role: 'Áo ngoài' },
      { name: 'Trắng Ngà', hex: '#FFFFF0', role: 'Áo lót & Quần lụa' },
      { name: 'Gỗ Mộc', hex: '#8B4513', role: 'Guốc & Quạt' },
    ],
  },
  {
    id: 'chu-sa-ngu-uyen',
    name: 'Chu Sa Ngự Uyển',
    seasonTag: 'Lễ Cưới & Đại Lễ · Trang trọng & Rực rỡ',
    fabricNote: 'Gấm dệt hoa nổi truyền thống phối viền ngũ sắc Kim - Mộc - Thủy - Hỏa - Thổ',
    swatches: [
      { name: 'Đỏ Chu Sa', hex: '#9A3412', role: 'Áo chính' },
      { name: 'Hoàng Kim', hex: '#D97706', role: 'Họa tiết & Viền' },
      { name: 'Bạch Ngọc', hex: '#FAF8F5', role: 'Quần lụa' },
    ],
  },
  {
    id: 'kinh-bac-dao-hoa',
    name: 'Kinh Bắc Đào Hoa',
    seasonTag: 'Hội Xuân & Diễn Xướng · Duyên dáng & Dân gian',
    fabricNote: 'Lụa tơ đũi màu trầm bên ngoài tôn sắc yếm đào thắm bên trong',
    swatches: [
      { name: 'Nâu Quế Trầm', hex: '#78350F', role: 'Áo tứ thân ngoài' },
      { name: 'Đỏ Yếm Đào', hex: '#B91C1C', role: 'Yếm lót trong' },
      { name: 'Đen Huyền', hex: '#1C1917', role: 'Váy đụp lụa' },
    ],
  },
  {
    id: 'thanh-phong-nien-hoa',
    name: 'Thanh Phong Niên Hoa',
    seasonTag: 'Xuân Hạ Giao Thời · Trẻ trung & Tối giản',
    fabricNote: 'Lụa nha xá hoặc tơ tằm mỏng nhẹ, bắt sáng tự nhiên khi dạo phố',
    swatches: [
      { name: 'Lam Cổ Điển', hex: '#1E3A8A', role: 'Áo ngoài' },
      { name: 'Thanh Trúc', hex: '#4D7C0F', role: 'Phụ kiện nhấn' },
      { name: 'Ngà Lụa', hex: '#F5F5DC', role: 'Áo lót & Quần' },
    ],
  },
  {
    id: 'phuong-nam-binh-di',
    name: 'Phương Nam Bình Dị',
    seasonTag: 'Nắng Phương Nam · Mộc mạc & Phóng khoáng',
    fabricNote: 'Lụa satin mờ hoặc bà ba tơ chuối thoáng mát, thấm hút tốt',
    swatches: [
      { name: 'Be Cát Trắng', hex: '#D6CEBE', role: 'Áo Bà Ba' },
      { name: 'Đen Khăn Rằn', hex: '#27272A', role: 'Quần & Khăn rằn' },
      { name: 'Vàng Lá Nón', hex: '#A16207', role: 'Nón lá & Guốc' },
    ],
  },
];

export const LOWER_GARMENT_OPTIONS = [
  { id: 'quan-lua-trang', label: 'Quần lụa trắng truyền thống', standardFor: ['ao-ngu-than', 'ao-nhat-binh', 'ao-dai-ba-ba'] },
  { id: 'quan-lua-do', label: 'Quần lụa đỏ lễ phục', standardFor: ['ao-nhat-binh'] },
  { id: 'vay-dup-den', label: 'Váy đụp đen truyền thống Bắc Bộ', standardFor: ['ao-tu-than', 'ao-ngu-than'] },
  { id: 'quan-lua-den', label: 'Quần lụa đen Nam Bộ', standardFor: ['ao-dai-ba-ba', 'ao-ngu-than'] },
  { id: 'vay-dup-ngan', label: 'Váy đụp ngắn cách tân (Trên gối)', isModernVariant: true },
  { id: 'quan-jeans', label: 'Quần Jeans hiện đại', isModernVariant: true },
];

export const MOTIF_OPTIONS = [
  { id: 'am-hoa-tron', label: 'Dệt hoa chìm (Ám hoa / Trơn nhã nhặn)', description: 'Chuẩn mực cho học sinh, sinh viên, lễ tốt nghiệp và thường phục' },
  { id: 'tu-quy-lien-hoa', label: 'Hoa văn Tứ Quý & Liên Hoa (Sen)', description: 'Thanh tao, gắn liền với tri thức và vẻ đẹp thuần Việt' },
  { id: 'phuong-vu-bat-buu', label: 'Loan Phượng & Bát Bửu (Lễ phục)', description: 'Dành cho Áo Nhật Bình hoặc lễ cưới truyền thống trang trọng' },
  { id: 'rong-5-mong', label: 'Họa tiết Rồng 5 Móng (Long Bào)', description: 'Đồ án đặc quyền tối cao của Hoàng đế triều Nguyễn', isRestrictedImperial: true },
];

export const ACCESSORY_OPTIONS = [
  { id: 'khan-xep', label: 'Khăn xếp / Khăn vấn đồng bộ' },
  { id: 'man-doi-dau', label: 'Mấn đội đầu (Khăn vành)' },
  { id: 'non-quai-thao', label: 'Nón ba tầm (Nón quai thao)' },
  { id: 'quat-tram-huong', label: 'Quạt giấy / Quạt trầm hương' },
  { id: 'xuyen-bac', label: 'Xuyến bạc / Kiềng cổ truyền thống' },
  { id: 'dai-lung-bao', label: 'Dải thắt lưng bao lụa đào' },
  { id: 'khan-ran-non-la', label: 'Khăn rằn & Nón lá Nam Bộ' },
  { id: 'kinh-mat-hien-dai', label: 'Kính mát hiện đại (Streetwear Fusion)' },
];

export const FOOTWEAR_OPTIONS = [
  { id: 'guoc-go-moc', label: 'Guốc gỗ mộc truyền thống' },
  { id: 'hai-theu', label: 'Hài thêu cung đình / Mũi nhọn đơn sắc' },
  { id: 'sneaker-ham-ho', label: 'Giày thể thao hầm hố (Chunky Sneaker)' },
];

export const OCCASION_OPTIONS = [
  { id: 'tot-nghiep', label: 'Lễ Tốt Nghiệp & Kỷ Yếu Di Tích' },
  { id: 'cuoi-hoi', label: 'Lễ Cưới Hỏi Truyền Thống' },
  { id: 'ngay-tet', label: 'Du Xuân Ngày Tết & Đi Chùa' },
  { id: 'le-hoi-dan-gian', label: 'Lễ Hội Dân Gian & Diễn Xướng' },
  { id: 'dao-pho', label: 'Dạo Phố & Chụp Ảnh Nghệ Thuật' },
];

export const WEATHER_OPTIONS = [
  { id: 'thu-ha-noi', label: 'Mùa Thu Mát Mẻ (Hà Nội / Huế · 20–25°C)' },
  { id: 'xuan-am-ap', label: 'Mùa Xuân Dịu Nhẹ (Mưa bụi nhẹ · 18–23°C)' },
  { id: 'ha-nang-vang', label: 'Mùa Hạ Nắng Vàng (Nhiệt đới · 28–34°C)' },
  { id: 'dong-se-lanh', label: 'Mùa Đông Se Lạnh (Miền Bắc · 14–18°C)' },
];

export function evaluateCultureGuard(
  selection: StudioSelection,
  stylingMode: StylingMode = 'STRICT_HERITAGE',
  showModernGlasses: boolean = false
): CultureGuardViolation[] {
  const violations: CultureGuardViolation[] = [];

  // QUY TẮC 1: Giới tính & Phụ kiện
  // KHÔNG phối Nón quai thao / Nón ba tầm với Áo Ngũ thân nam giới
  if (
    selection.gender === 'nam' &&
    selection.garmentId === 'ao-ngu-than' &&
    selection.accessoryIds.includes('non-quai-thao')
  ) {
    violations.push({
      ruleId: 'RULE_01_GENDER_ACCESSORY',
      ruleTitle: 'Quy tắc 1 · Giới tính & Phụ kiện',
      severity: 'critical',
      message:
        'KHÔNG phối Nón quai thao (Nón ba tầm) với Áo Ngũ Thân nam giới. Nón quai thao là phụ kiện truyền thống dành riêng cho nữ giới vùng Kinh Bắc.',
      historicalContext:
        'Trong điển chế và tập tục trang phục cổ truyền, nam giới mặc Áo Ngũ Thân luôn đội Khăn vấn (Khăn xếp) chữ Nhân hoặc chữ Nhất, kết hợp quạt xếp hoặc nón Gò Găng/nón Dứa chứ không đội Nón ba tầm của các liền chị.',
      fixSuggestion: 'Thay Nón ba tầm bằng Khăn xếp / Khăn vấn đồng bộ và Quạt giấy trầm hương.',
      autoFixPatch: {
        accessoryIds: [
          ...selection.accessoryIds.filter((id) => id !== 'non-quai-thao'),
          ...(selection.accessoryIds.includes('khan-xep') ? [] : ['khan-xep']),
        ],
      },
    });
  } else if (selection.gender === 'nam' && selection.accessoryIds.includes('non-quai-thao')) {
    violations.push({
      ruleId: 'RULE_01_GENDER_ACCESSORY',
      ruleTitle: 'Quy tắc 1 · Giới tính & Phụ kiện',
      severity: 'critical',
      message:
        'Nón quai thao (Nón ba tầm) là phụ kiện đặc trưng riêng của nữ giới miền Bắc (đi cùng Áo Tứ Thân / Năm Thân nữ), không phù hợp cho trang phục nam giới.',
      historicalContext:
        'Nam giới truyền thống sử dụng khăn đóng, khăn vấn hoặc khăn rằn (Nam Bộ) tùy theo loại trang phục.',
      fixSuggestion: 'Chuyển sang phụ kiện Khăn xếp / Khăn đóng hoặc Quạt trầm hương.',
      autoFixPatch: {
        accessoryIds: selection.accessoryIds.filter((id) => id !== 'non-quai-thao').concat(['khan-xep']),
      },
    });
  }

  // QUY TẮC 1B: Giới tính Nam & Váy đụp / Mấn nữ
  if (
    selection.gender === 'nam' &&
    (selection.lowerGarmentId === 'vay-dup-den' ||
      selection.lowerGarmentId === 'vay-dup-ngan' ||
      selection.accessoryIds.includes('man-doi-dau') ||
      selection.accessoryIds.includes('xuyen-bac'))
  ) {
    violations.push({
      ruleId: 'RULE_01B_MALE_LOWER_AND_HEADWEAR',
      ruleTitle: 'Quy tắc 1B · Chuẩn mực Trang phục Nam giới',
      severity: 'critical',
      message:
        'Mô hình Nam KHÔNG mặc Váy đụp Bắc Bộ hoặc đội Mấn cung đình / đeo Xuyến bạc của nữ giới. Nam nhân truyền thống mặc Quần lụa trắng/đen ống rộng và đội Khăn đóng chữ Nhân.',
      historicalContext:
        'Trong cổ phục Việt Nam, váy đụp lĩnh đen và mấn vành/kiềng xuyến là trang phục dành riêng cho nữ giới. Nam giới diện Áo Ngũ Thân, Áo Tấc hoặc Áo Tứ Thân Nam đều phối cùng quần dài ống rộng và khăn đóng.',
      fixSuggestion: 'Đổi sang Quần lụa trắng truyền thống và Khăn đóng chữ Nhân.',
      autoFixPatch: {
        lowerGarmentId: selection.garmentId === 'ao-dai-ba-ba' ? 'quan-lua-den' : 'quan-lua-trang',
        accessoryIds: [
          ...selection.accessoryIds.filter(
            (id) => id !== 'man-doi-dau' && id !== 'xuyen-bac' && id !== 'non-quai-thao'
          ),
          ...(selection.accessoryIds.includes('khan-xep') ? [] : ['khan-xep']),
        ],
      },
    });
  }

  // QUY TẮC 2: Họa tiết & Phân cấp
  // KHÔNG dùng họa tiết Rồng 5 móng cho trang phục dân gian hoặc thường phục
  if (selection.motifId === 'rong-5-mong') {
    violations.push({
      ruleId: 'RULE_02_IMPERIAL_MOTIF',
      ruleTitle: 'Quy tắc 2 · Họa tiết & Phân cấp Điển chế',
      severity: 'critical',
      message:
        'KHÔNG sử dụng họa tiết Rồng 5 móng (Ngũ trảo kim long) cho trang phục dân gian, lễ tốt nghiệp hoặc thường phục. Rồng 5 móng là đặc quyền tối cao của Hoàng đế triều Nguyễn.',
      historicalContext:
        'Theo Khâm định Đại Nam hội điển sự lệ, họa tiết Rồng 5 móng chỉ xuất hiện trên Long bào, Hoàng bào của Vua. Sử dụng trên thường phục Áo Ngũ Thân, Tứ Thân hay Nhật Bình dân dụng là sai lệch nghiêm trọng về phân cấp lịch sử.',
      fixSuggestion:
        'Chọn họa tiết Dệt hoa chìm (Ám hoa), Tứ Quý - Liên Hoa cho thường phục/tốt nghiệp, hoặc Loan Phượng cho Áo Nhật Bình.',
      autoFixPatch: {
        motifId: selection.garmentId === 'ao-nhat-binh' ? 'phuong-vu-bat-buu' : 'am-hoa-tron',
      },
    });
  }

  // QUY TẮC 3: Đồng bộ Lễ phục
  // Áo Nhật bình phải đi cùng quần trắng/đỏ và hài/guốc mộc quy chuẩn, KHÔNG phối với váy đụp ngắn hay quần jeans hiện đại
  if (
    selection.garmentId === 'ao-nhat-binh' &&
    (selection.lowerGarmentId === 'vay-dup-ngan' ||
      selection.lowerGarmentId === 'quan-jeans' ||
      selection.footwearId === 'sneaker-ham-ho')
  ) {
    violations.push({
      ruleId: 'RULE_03_CEREMONIAL_HARMONY',
      ruleTitle: 'Quy tắc 3 · Đồng bộ Lễ phục Cung đình',
      severity: 'critical',
      message:
        'Áo Nhật Bình / Áo Tấc là lễ phục cung đình trang trọng, PHẢI đi cùng quần lụa trắng/đỏ và hài thêu hoặc guốc mộc quy chuẩn; KHÔNG phối với váy đụp ngắn, quần jeans hiện đại hay giày thể thao hầm hố.',
      historicalContext:
        'Phom dáng đối xứng uy nghi của lễ phục đòi hỏi độ rủ thướt tha của quần lụa ống rộng cùng bước đi khoan thai trên hài hoặc guốc gỗ.',
      fixSuggestion: 'Đổi sang Quần lụa trắng/đỏ truyền thống và Guốc gỗ mộc hoặc Hài thêu.',
      autoFixPatch: {
        lowerGarmentId: 'quan-lua-trang',
        footwearId: 'hai-theu',
      },
    });
  }

  // QUY TẮC 4: Phân cấp Kiểm duyệt theo Chế độ Phối (STRICT_HERITAGE vs MODERN_FUSION)
  const hasModernFusionItem =
    selection.footwearId === 'sneaker-ham-ho' ||
    selection.lowerGarmentId === 'quan-jeans' ||
    selection.lowerGarmentId === 'vay-dup-ngan' ||
    selection.accessoryIds.includes('kinh-mat-hien-dai') ||
    showModernGlasses;

  if (selection.garmentId !== 'ao-nhat-binh' && hasModernFusionItem) {
    if (stylingMode === 'STRICT_HERITAGE') {
      violations.push({
        ruleId: 'RULE_04_STRICT_HERITAGE_MISMATCH',
        ruleTitle: 'Quy tắc 4 · Chế độ Cổ Chuẩn (Strict Heritage)',
        severity: 'critical',
        message:
          '🔴 CẢNH BÁO CỔ CHUẨN (STRICT_HERITAGE): Bạn đang bật chế độ "Cổ Chuẩn" nhưng phối kèm phụ kiện/trang phục hiện đại (Quần Jeans, Váy ngắn, Sneaker hoặc Kính mát). Vui lòng bấm [Auto-Fix 1-Touch] để chuẩn hóa về cổ lệ hoặc chuyển sang chế độ "Tân Thời (Modern Fusion)".',
        historicalContext:
          'Ở chế độ Cổ Chuẩn (STRICT_HERITAGE), hệ thống yêu cầu đồng bộ 100% quần lụa/váy đụp truyền thống và hài/guốc mộc theo đúng điển chế lịch sử.',
        fixSuggestion:
          'Bấm [Auto-Fix 1-Touch] để khôi phục Quần lụa trắng / Váy đụp đen và Guốc gỗ mộc truyền thống.',
        autoFixPatch: {
          lowerGarmentId:
            selection.gender === 'nu' && selection.garmentId === 'ao-tu-than'
              ? 'vay-dup-den'
              : selection.garmentId === 'ao-dai-ba-ba'
              ? 'quan-lua-den'
              : 'quan-lua-trang',
          footwearId: 'guoc-go-moc',
          accessoryIds: selection.accessoryIds.filter((id) => id !== 'kinh-mat-hien-dai'),
        },
      });
    } else {
      violations.push({
        ruleId: 'RULE_04_MODERN_FUSION_CULTURE_TIP',
        ruleTitle: '🟠 CULTURE_TIP · Chế độ Tân Thời (Modern Fusion)',
        severity: 'advisory',
        message:
          '🟠 CULTURE_TIP (MODERN_FUSION): Hệ thống chấp nhận sự kết hợp hiện đại (Giày Sneaker, Quần Jeans, Kính mát). Bộ phối mang tinh thần Streetwear trẻ trung — rất hợp dạo phố, đi cafe, chụp ảnh đương đại; lưu ý tránh mặc đi lễ chùa hoặc nơi thờ tự linh thiêng.',
        historicalContext:
          'Phong trào Việt phục ứng dụng (Modern Fusion / Streetwear) giúp giới trẻ đưa cổ phục vào đời sống thường nhật năng động mà vẫn giữ được phom áo truyền thống.',
        fixSuggestion: 'Đổi sang Quần lụa trắng / Váy đụp đen và Guốc gỗ mộc nếu đi lễ chùa hoặc dự nghi lễ.',
        autoFixPatch: {
          lowerGarmentId:
            selection.gender === 'nu' && selection.garmentId === 'ao-tu-than'
              ? 'vay-dup-den'
              : 'quan-lua-trang',
          footwearId: 'guoc-go-moc',
          accessoryIds: selection.accessoryIds.filter((id) => id !== 'kinh-mat-hien-dai'),
        },
      });
    }
  }

  return violations;
}

export function buildMandatorySystemJsonOutput(params: {
  selection: StudioSelection;
  activeTab?: ActiveSystemTab;
  groupStylingMode?: GroupStylingMode;
  stylingMode: StylingMode;
  uiDisplayMode: UIDisplayMode;
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
  heightCm: number;
  shoulderMod: number;
  torsoMod: number;
  hipMod?: number;
  showModernGlasses?: boolean;
  mutationPreview?: LocalStorageMutationPreview;
}): MandatorySystemJsonOutputSchema {
  const {
    selection,
    activeTab = 'TAB_1_CORE_STUDIO',
    groupStylingMode = 'SINGLE',
    stylingMode,
    uiDisplayMode,
    primaryHex,
    secondaryHex,
    accentHex,
    heightCm,
    shoulderMod,
    torsoMod,
    hipMod = torsoMod,
    showModernGlasses = false,
    mutationPreview,
  } = params;

  const isMale = selection.gender === 'nam';
  const baseWeight = isMale
    ? Math.round((heightCm - 105) * ((shoulderMod + torsoMod) / 2))
    : Math.round((heightCm - 112) * ((shoulderMod + torsoMod) / 2));
  const chestCm = Math.round((isMale ? 94 : 84) * ((shoulderMod + torsoMod) / 2));
  const waistCm = Math.round((isMale ? 78 : 64) * torsoMod);
  const hipCm = Math.round((isMale ? 94 : 90) * hipMod);
  const armLengthCm = Math.round(heightCm * 0.34 * shoulderMod);
  const garmentLengthCm = Math.round(heightCm * 0.68);

  const recommendedSize: 'S' | 'M' | 'L' | 'XL' =
    heightCm < 158 || chestCm < 82
      ? 'S'
      : heightCm <= 168 && chestCm <= 92
      ? 'M'
      : heightCm <= 177 && chestCm <= 100
      ? 'L'
      : 'XL';

  const outfitType: MandatorySystemJsonOutputSchema['outfit_3d_config']['outfit_type'] =
    selection.garmentId === 'ao-nhat-binh'
      ? 'NHAT_BINH'
      : selection.garmentId === 'ao-tu-than'
      ? 'TU_THAN'
      : selection.garmentId === 'ao-dai-ba-ba'
      ? isMale
        ? 'BA_BA'
        : 'AO_DAI'
      : 'NGU_THAN';

  const violations = evaluateCultureGuard(selection, stylingMode, showModernGlasses);
  const criticalViolation = violations.find((v) => v.severity === 'critical');
  const advisoryViolation = violations.find((v) => v.severity === 'advisory');

  const cgStatus: 'APPROVED' | 'WARNING' | 'REJECTED' = criticalViolation
    ? criticalViolation.ruleId === 'RULE_02_IMPERIAL_MOTIF' ||
      criticalViolation.ruleId === 'RULE_01_GENDER_ACCESSORY'
      ? 'REJECTED'
      : 'WARNING'
    : advisoryViolation
    ? 'WARNING'
    : 'APPROVED';

  const appliedRule = criticalViolation
    ? criticalViolation.ruleId
    : advisoryViolation
    ? advisoryViolation.ruleId
    : 'ALL_HERITAGE_RULES_PASSED';

  const cultureTipMessage = criticalViolation
    ? criticalViolation.message
    : advisoryViolation
    ? advisoryViolation.message
    : stylingMode === 'MODERN_FUSION'
    ? '🟠 CULTURE_TIP: Trang phục đạt chuẩn giao thoa Tân Thời (Modern Fusion) — hài hòa thẩm mỹ đương đại, phù hợp dạo phố/cafe; lưu ý tránh mặc đi lễ chùa hoặc nơi linh thiêng.'
    : 'Trang phục tuân thủ 100% quy chuẩn Cổ Chuẩn (Strict Heritage): đúng giới tính, đúng phẩm cấp hoa văn và đồng bộ phụ kiện cổ lệ.';

  const shopByGarment =
    selection.garmentId === 'ao-nhat-binh'
      ? { id: 'VENDOR_HOA_NIEN_HUE', price: '380.000đ/ngày' }
      : selection.garmentId === 'ao-tu-than'
      ? { id: 'VENDOR_DONG_PHONG_BN', price: '220.000đ/ngày' }
      : selection.garmentId === 'ao-dai-ba-ba'
      ? { id: 'VENDOR_LUA_PHUONG_NAM_SG', price: '200.000đ/ngày' }
      : { id: 'VENDOR_Y_VAN_HIEN_HN', price: '280.000đ/ngày' };

  const shortHash = Math.abs(
    `${selection.gender}-${selection.garmentId}-${primaryHex}-${heightCm}-${groupStylingMode}`
      .split('')
      .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 17)
  )
    .toString(36)
    .toUpperCase()
    .slice(0, 5);

  const outfitId = `OUTFIT_3D_${outfitType}_${shortHash}`;

  const formattedMeasurementPayload = JSON.stringify({
    b2b_schema: 'VIETPHUC_TAILOR_3D_V1',
    outfit_id: outfitId,
    outfit_type: outfitType,
    gender: selection.gender === 'nam' ? 'MALE' : 'FEMALE',
    group_mode: groupStylingMode,
    recommended_size: recommendedSize,
    palette_hex: {
      primary: primaryHex.toUpperCase(),
      secondary: secondaryHex.toUpperCase(),
      accent: accentHex.toUpperCase(),
    },
    measurements_cm: {
      height_cm: Math.round(heightCm),
      weight_kg: baseWeight,
      shoulder_scale_pct: Math.round(shoulderMod * 100),
      chest_cm: chestCm,
      waist_cm: waistCm,
      hip_cm: hipCm,
      arm_length_cm: armLengthCm,
      garment_length_cm: garmentLengthCm,
    },
  });

  return {
    system_state: {
      active_tab: activeTab,
      styling_mode: stylingMode,
      ui_display_mode: uiDisplayMode,
      local_storage_key: 'VIETPHUC_LOCAL_STORAGE_V1',
    },
    outfit_3d_config: {
      outfit_id: outfitId,
      outfit_type: outfitType,
      group_styling_mode: groupStylingMode,
      palette_hex: {
        primary: primaryHex.toUpperCase(),
        secondary: secondaryHex.toUpperCase(),
        accent: accentHex.toUpperCase(),
      },
      body_measurements: {
        height_cm: Math.round(heightCm),
        weight_kg: baseWeight,
        chest_cm: chestCm,
        waist_cm: waistCm,
        hip_cm: hipCm,
      },
      recommended_size: recommendedSize,
    },
    b2b_measurement_export: {
      is_ready_for_tailor: cgStatus !== 'REJECTED',
      formatted_measurement_payload: formattedMeasurementPayload,
    },
    culture_guard_result: {
      status: cgStatus,
      applied_rule: appliedRule,
      culture_tip_message: cultureTipMessage,
      auto_fix_available: violations.length > 0,
    },
    local_storage_mutation_preview: mutationPreview || {
      updated_field: 'local_saved_items.saved_outfits_3d & user_profile.measurements',
      new_value_summary: `Sẵn sàng đồng bộ ${outfitId} (${outfitType}, ${primaryHex.toUpperCase()}, Size ${recommendedSize} · ${Math.round(heightCm)}cm/${baseWeight}kg) vào VIETPHUC_LOCAL_STORAGE_V1`,
    },
    marketplace_link: {
      is_available_for_rent: true,
      nearest_partner_shop_id: shopByGarment.id,
      rental_price_from: shopByGarment.price,
    },
  };
}

export const CURATED_LOOKBOOKS: LookbookCardData[] = [
  {
    id: 'lb-khue-van-tri-thuc',
    outfitName: 'Khuê Văn Tri Thức',
    mainGarment:
      'Áo Ngũ Thân tay chẽn vải tơ/đũi nhẹ màu xanh ngọc lam (ngoài), áo lót trắng bên trong phối cùng quần lụa trắng.',
    accessories: ['Khăn vấn dệt mỏng cùng tông màu', 'Guốc gỗ mộc truyền thống', 'Quạt giấy trầm hương'],
    palette: [
      { name: 'Xanh Ngọc Lam', hex: '#2E8B57', role: 'Áo ngoài' },
      { name: 'Trắng Ngà', hex: '#FFFFF0', role: 'Áo lót & Quần' },
      { name: 'Gỗ Mộc', hex: '#8B4513', role: 'Phụ kiện' },
    ],
    occasionAndWeather: 'Lễ tốt nghiệp, chụp ảnh di tích (Văn Miếu, Hoàng Thành), thời tiết thu mát mẻ.',
    culturalMeaning:
      'Áo Ngũ thân tượng trưng cho đạo đức người quân tử (Ngũ thường) và lòng biết ơn bậc phụ mẫu (Tứ thân phụ mẫu), vô cùng ý nghĩa cho cột mốc đánh dấu sự trưởng thành.',
    cultureGuardNote:
      'Lưu ý chọn guốc mộc hoặc giày cao gót mũi nhọn đơn sắc, tránh phối cùng giày thể thao quá hầm hố để giữ trọn vẻ thanh lịch của áo!',
    garmentId: 'ao-ngu-than',
    imageUrl: HERITAGE_IMAGES.aoNguThan,
    styleTag: 'Cổ điển',
    eventTag: 'tot-nghiep',
  },
  {
    id: 'lb-chu-sa-vuong-phi',
    outfitName: 'Chu Sa Vương Phi — Nhật Bình Lễ Cưới',
    mainGarment:
      'Áo Nhật Bình gấm đỏ chu sa thêu Loan Phượng và dải ngũ sắc ở cổ tay, phối cùng quần lụa trắng bạch ngọc.',
    accessories: ['Mấn đội đầu (Khăn vành) đồng bộ', 'Xuyến bạc chạm hoa mai', 'Hài thêu mũi cong truyền thống'],
    palette: [
      { name: 'Đỏ Chu Sa', hex: '#9A3412', role: 'Áo Nhật Bình' },
      { name: 'Hoàng Kim', hex: '#D97706', role: 'Viền & Thêu' },
      { name: 'Bạch Ngọc', hex: '#FAF8F5', role: 'Quần lụa' },
    ],
    occasionAndWeather: 'Lễ cưới truyền thống, lễ hằng thuận, chụp ảnh kỷ yếu cung đình vào mùa xuân - thu.',
    culturalMeaning:
      'Áo Nhật Bình vốn là lễ phục của Hậu phi, Công chúa và mệnh phụ phu nhân triều Nguyễn; dải ngũ sắc nơi tay áo tượng trưng cho Ngũ hành tương sinh, cầu chúc hạnh phúc viên mãn.',
    cultureGuardNote:
      'Quy tắc 3: Áo Nhật Bình bắt buộc đi cùng quần lụa trắng/đỏ và hài/guốc mộc quy chuẩn; tuyệt đối không phối cùng váy đụp ngắn hay quần jeans hiện đại.',
    garmentId: 'ao-nhat-binh',
    imageUrl: HERITAGE_IMAGES.aoNhatBinh,
    styleTag: 'Cổ điển',
    eventTag: 'cuoi-hoi',
  },
  {
    id: 'lb-kinh-bac-dao-nguyen',
    outfitName: 'Kinh Bắc Đào Nguyên — Tứ Thân Trảy Hội',
    mainGarment:
      'Áo Tứ Thân vải đũi tơ màu nâu quế trầm buông thắt duyên dáng bên ngoài, áo yếm đào đỏ thắm bên trong và váy đụp lụa đen.',
    accessories: ['Nón ba tầm (Nón quai thao)', 'Dải thắt lưng bao xanh lục', 'Guốc mộc quai ngang'],
    palette: [
      { name: 'Nâu Quế Trầm', hex: '#78350F', role: 'Áo ngoài' },
      { name: 'Đỏ Yếm Đào', hex: '#B91C1C', role: 'Yếm đào' },
      { name: 'Đen Huyền', hex: '#1C1917', role: 'Váy đụp' },
    ],
    occasionAndWeather: 'Lễ hội dân gian mùa xuân, diễn xướng nghệ thuật, đi chùa và chụp ảnh văn hóa Bắc Bộ.',
    culturalMeaning:
      'Gắn liền với di sản dân ca Quan họ Bắc Ninh, bộ trang phục tôn vinh nét duyên "mớ ba mớ bảy" vừa mộc mạc vừa tình tứ của người phụ nữ Việt xưa.',
    cultureGuardNote:
      'Quy tắc 1: Nón ba tầm (nón quai thao) là phụ kiện đặc trưng riêng của nữ giới với Áo Tứ Thân/Năm Thân nữ, không sử dụng cho trang phục nam giới.',
    garmentId: 'ao-tu-than',
    imageUrl: HERITAGE_IMAGES.aoTuThan,
    styleTag: 'Cổ điển',
    eventTag: 'le-hoi-dan-gian',
  },
  {
    id: 'lb-thanh-phong-nien-hoa',
    outfitName: 'Thanh Phong Niên Hoa — Ngũ Thân Dạo Phố',
    mainGarment:
      'Áo Ngũ Thân tay chẽn lụa nha xá màu lam cổ điển dệt hoa chìm, mặc ngoài áo lót trắng và quần lụa ngà.',
    accessories: ['Khăn xếp lam thẫm', 'Quạt xếp nan tre', 'Guốc gỗ mộc tối giản'],
    palette: [
      { name: 'Lam Cổ Điển', hex: '#1E3A8A', role: 'Áo ngoài' },
      { name: 'Thanh Trúc', hex: '#4D7C0F', role: 'Điểm nhấn' },
      { name: 'Ngà Lụa', hex: '#F5F5DC', role: 'Áo trong & Quần' },
    ],
    occasionAndWeather: 'Du xuân ngày Tết, dạo phố cổ, đi lễ chùa đầu năm trong tiết trời xuân ấm áp.',
    culturalMeaning:
      'Giữ trọn chuẩn mực cổ đứng 5 khuy thời Minh Mạng nhưng ứng dụng chất liệu lụa nhẹ và bảng màu tối giản, giúp Gen Z tự tin diện Việt phục trong đời sống đương đại.',
    cultureGuardNote:
      'Quy tắc 2: Chọn hoa văn dệt chìm (Ám hoa) hoặc chữ Thọ/Liên hoa thanh nhã; tuyệt đối tránh họa tiết Rồng 5 móng (vốn là đặc quyền của Hoàng đế).',
    garmentId: 'ao-ngu-than',
    imageUrl: HERITAGE_IMAGES.hero,
    styleTag: 'Tối giản',
    eventTag: 'ngay-tet',
  },
  {
    id: 'lb-nam-bo-phong-khoang',
    outfitName: 'Phương Nam Bình Dị — Bà Ba & Tân Thời Giao Hòa',
    mainGarment:
      'Áo Bà Ba lụa tơ màu be cát trắng xẻ tà hai bên thoáng mát, phối cùng quần lụa đen truyền thống.',
    accessories: ['Khăn rằn Nam Bộ kẻ ô đen trắng', 'Nón lá chằm tay', 'Guốc mộc truyền thống'],
    palette: [
      { name: 'Be Cát Trắng', hex: '#D6CEBE', role: 'Áo chính' },
      { name: 'Đen Khăn Rằn', hex: '#27272A', role: 'Quần & Khăn' },
      { name: 'Vàng Lá Nón', hex: '#A16207', role: 'Nón lá & Guốc' },
    ],
    occasionAndWeather: 'Dạo phố, lễ hội văn hóa phương Nam, chụp ảnh ngoại cảnh mùa hạ nắng vàng.',
    culturalMeaning:
      'Áo Bà Ba cùng chiếc khăn rằn là biểu tượng cho tâm hồn hào sảng, chất phác và sức sống bền bỉ của con người vùng đất phương Nam.',
    cultureGuardNote:
      'Thời tiết mùa hạ nóng ẩm nên ưu tiên vải tơ tằm hoặc đũi tự nhiên thoáng khí, giữ phom áo vừa vặn lịch sự.',
    garmentId: 'ao-dai-ba-ba',
    imageUrl: HERITAGE_IMAGES.aoDaiBaBa,
    styleTag: 'Hiện đại',
    eventTag: 'dao-pho',
  },
];

export interface BodyTypeProfile {
  id: 'can-doi' | 'manh-mai' | 'day-dan' | 'cao-rao' | 'nho-nhan';
  label: string;
  subtitle: string;
  defaultHeightCm: { nam: number; nu: number };
  shoulderScale: number;
  torsoWidthScale: number;
  hipWidthScale: number;
  heightScale: number;
  tailoringAdvice: string;
  recommendedGarmentIds: string[];
  recommendedPaletteIds: string[];
}

export interface SkinToneOption {
  id: string;
  label: string;
  hex: string;
  recommendedPaletteIds: string[];
}

export const BODY_TYPE_PROFILES: BodyTypeProfile[] = [
  {
    id: 'can-doi',
    label: 'Tiêu Chuẩn (Cân Đối)',
    subtitle: 'Tỷ lệ nhân trắc học Việt Nam tiêu chuẩn, vai và hông hài hòa',
    defaultHeightCm: { nam: 172, nu: 162 },
    shoulderScale: 1.0,
    torsoWidthScale: 1.0,
    hipWidthScale: 1.0,
    heightScale: 1.0,
    tailoringAdvice:
      'Phù hợp với hầu hết các phom cổ phục. Nên may Áo Ngũ Thân tay chẽn dài qua gối 5–7 cm để bước đi thanh thoát, cổ lập lĩnh cao 3.8–4.2 cm.',
    recommendedGarmentIds: ['ao-ngu-than', 'ao-nhat-binh'],
    recommendedPaletteIds: ['khue-van-tri-thuc', 'chu-sa-ngu-uyen'],
  },
  {
    id: 'manh-mai',
    label: 'Mảnh Mai (Thanh Thoát)',
    subtitle: 'Khung xương nhỏ, vai thon, dáng người thanh mảnh',
    defaultHeightCm: { nam: 170, nu: 160 },
    shoulderScale: 0.91,
    torsoWidthScale: 0.86,
    hipWidthScale: 0.89,
    heightScale: 1.0,
    tailoringAdvice:
      'Ưu tiên chất liệu gấm dệt, tơ sống hoặc phối nhiều lớp (Áo Tứ Thân mớ ba mớ bảy, Áo Ngũ Thân có áo lót trắng dày dặn) cùng bảng màu sáng để tạo độ đầy đặn, tôn khí chất thư sinh / khuê các.',
    recommendedGarmentIds: ['ao-tu-than', 'ao-ngu-than'],
    recommendedPaletteIds: ['khue-van-tri-thuc', 'phuong-nam-binh-di'],
  },
  {
    id: 'day-dan',
    label: 'Đầy Đặn (Phúc Hậu)',
    subtitle: 'Khung ngực và hông tròn đầy, phong thái đĩnh đạc, phúc hậu',
    defaultHeightCm: { nam: 168, nu: 158 },
    shoulderScale: 1.08,
    torsoWidthScale: 1.2,
    hipWidthScale: 1.18,
    heightScale: 0.98,
    tailoringAdvice:
      'Cổ phục truyền thống (đặc biệt là Áo Ngũ Thân và Áo Nhật Bình) vốn cắt phẳng, không chiết eo bó sát nên cực kỳ tôn dáng đầy đặn. Chọn lụa rủ mềm màu trầm hoặc trung tính (Lam cổ điển, Nâu quế trầm) giúp dáng người thon gọn và uy nghi.',
    recommendedGarmentIds: ['ao-nhat-binh', 'ao-ngu-than'],
    recommendedPaletteIds: ['thanh-phong-nien-hoa', 'kinh-bac-dao-hoa'],
  },
  {
    id: 'cao-rao',
    label: 'Cao Ráo (Người Mẫu)',
    subtitle: 'Chiều cao nổi bật, lưng dài, sải tay rộng',
    defaultHeightCm: { nam: 180, nu: 170 },
    shoulderScale: 1.05,
    torsoWidthScale: 0.95,
    hipWidthScale: 0.96,
    heightScale: 1.07,
    tailoringAdvice:
      'Lợi thế tuyệt vời khi diện Áo Nhật Bình tay rộng hoặc Áo Ngũ Thân phối khăn vấn cao. Nên chọn bảng màu tương phản rõ nét giữa áo ngoài và quần lụa trắng để tạo điểm nhấn thị giác.',
    recommendedGarmentIds: ['ao-nhat-binh', 'ao-ngu-than'],
    recommendedPaletteIds: ['chu-sa-ngu-uyen', 'thanh-phong-nien-hoa'],
  },
  {
    id: 'nho-nhan',
    label: 'Nhỏ Nhắn (Petite)',
    subtitle: 'Chiều cao khiêm tốn, vóc người nhỏ gọn, linh hoạt',
    defaultHeightCm: { nam: 162, nu: 152 },
    shoulderScale: 0.9,
    torsoWidthScale: 0.9,
    hipWidthScale: 0.92,
    heightScale: 0.92,
    tailoringAdvice:
      'Nên chọn Áo Ngũ Thân tay chẽn hoặc Áo Dài Tân Thời / Bà Ba có tà dài vừa chạm gối, kết hợp khăn vấn gọn và guốc gỗ mộc đế cao 5 cm để kéo dài tỷ lệ đôi chân.',
    recommendedGarmentIds: ['ao-ngu-than', 'ao-dai-ba-ba'],
    recommendedPaletteIds: ['khue-van-tri-thuc', 'phuong-nam-binh-di'],
  },
];

export const SKIN_TONE_OPTIONS: SkinToneOption[] = [
  {
    id: 'sang-hong',
    label: 'Da Sáng Hồng / Lạnh',
    hex: '#F3D6C6',
    recommendedPaletteIds: ['thanh-phong-nien-hoa', 'chu-sa-ngu-uyen'],
  },
  {
    id: 'tu-nhien',
    label: 'Da Tự Nhiên Á Đông (Trung tính)',
    hex: '#E5B89B',
    recommendedPaletteIds: ['khue-van-tri-thuc', 'chu-sa-ngu-uyen'],
  },
  {
    id: 'ngam-am',
    label: 'Da Bánh Mật / Ngăm Ấm',
    hex: '#C68E68',
    recommendedPaletteIds: ['kinh-bac-dao-hoa', 'phuong-nam-binh-di', 'khue-van-tri-thuc'],
  },
];

// ============================================================================
// CORE LOGIC I & IV: SOCIAL POSTS HUB (BẢNG TIN XU HƯỚNG TỰ ĐỘNG KHÓA CỤC BỘ)
// ============================================================================
export type SocialPlatform = 'TikTok' | 'Instagram' | 'Facebook';
export type ExclusiveHashtag = '#VietPhucLookbook' | '#VietPhucApp' | '#VietPhucStylist';
export type SocialPlatformTag = '#TikTok' | '#Instagram' | '#Facebook';
export type SocialTypeTag = '#VietPhucReal' | '#VietPhuc3D' | '#VietPhucStreetwear';
export type SocialOutfitTag =
  | '#AoNguThan'
  | '#AoNhatBinh'
  | '#AoTuThan'
  | '#AoDaiTieuChuan'
  | '#AoBaBa';
export type SocialEventTag =
  | '#DoDiTotNghiep'
  | '#DoDiChua'
  | '#DoDiCuoi'
  | '#KyYeu'
  | '#DaoPho';

export interface MarketplaceVendorInfo {
  vendor_id: string | null;
  vendor_name: string;
  google_maps_location: string;
  rental_price_per_day: string;
  tailoring_available: boolean;
}

export interface MarketplaceActionLinks {
  magic_refit_3d: boolean;
  rent_now_url: string;
  send_measurements_to_tailor_url: string;
}

export interface MarketplaceIntegrationSchema {
  is_shoppable: boolean;
  vendor_info: MarketplaceVendorInfo;
  action_links: MarketplaceActionLinks;
}

export interface SocialModerationSchema {
  ai_spam_score: number;
  culture_guard_status: 'APPROVED' | 'WARNING' | 'REJECTED';
  admin_approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface MandatoryCommunityPostJsonSchema {
  post_id: string;
  platform: SocialPlatform;
  author: {
    username: string;
    avatar_url: string;
    profile_link: string;
  };
  content: {
    caption: string;
    media_type: 'VIDEO' | 'IMAGE_CAROUSEL';
    embed_url: string;
  };
  metadata: {
    hashtags_detected: string[];
    smart_tags: string[];
    is_app_generated_3d: boolean;
    outfit_config_id: string | null;
  };
  moderation: SocialModerationSchema;
  marketplace_integration: MarketplaceIntegrationSchema;
}

export interface OutfitConfigCode {
  config_id: string;
  gender: 'nam' | 'nu';
  garmentId: 'ao-ngu-than' | 'ao-nhat-binh' | 'ao-tu-than' | 'ao-dai-ba-ba';
  paletteId: string;
  lowerGarmentId: string;
  motifId: string;
  accessoryIds: string[];
  footwearId: string;
  occasionId: string;
  weatherId: string;
  outerHex: string;
  innerHex: string;
  lowerHex: string;
}

/**
 * Exact JSON Output Schema for Social Posts Hub (Automated Hashtag Ingestion & Local Lock)
 */
export interface SocialPostSchema {
  post_id: string;
  platform: SocialPlatform;
  author: string;
  original_url: string;
  source_hashtag?: ExclusiveHashtag;
  tags: string[]; // Strictly 4 required tag groups: [PlatformTag, TypeTag, OutfitTag, EventTag]
  has_re_fit_3d: boolean;
  outfit_config_id: string | null;
  culture_guard_status?: 'Approved' | 'Warning' | 'Rejected';
  is_local_locked?: boolean;
  location_query?: string;
  moderation?: SocialModerationSchema;
  marketplace_integration?: MarketplaceIntegrationSchema;
}

export interface SocialPostItem extends SocialPostSchema {
  title: string;
  caption: string;
  contentCategory: string;
  aspectRatio: '9:16' | '4:5' | '16:9';
  imageUrl: string;
  metricsLabel: string;
  publishedAt: string;
  is_shoppable?: boolean;
  post_badge_note?: string;
  detected_3d_link?: string;
  detected_shop_link?: string;
  outfitConfig?: OutfitConfigCode;
  festivalDetails?: {
    lunarDate: string;
    location: string;
    mainRituals: string;
    heritageStatus: string;
    highlights: string[];
  };
}

export interface AIScannedPostMetadata {
  platform: SocialPlatform;
  author: string;
  location_query?: string;
  has_re_fit_3d: boolean;
  detected_3d_link?: string;
  outfit_config_id: string | null;
  outfitConfig?: OutfitConfigCode;
  is_shoppable: boolean;
  detected_shop_link?: string;
  tags: string[];
  culture_guard_status: 'Approved' | 'Warning' | 'Rejected';
  violatedRule?: string;
}

export function scanSocialPostByAI(input: {
  title: string;
  caption: string;
  originalUrl: string;
}): AIScannedPostMetadata {
  const rawUrl = (input.originalUrl || '').trim();
  const urlLower = rawUrl.toLowerCase();
  const combinedText = `${input.title || ''} ${input.caption || ''}`;
  const textLower = combinedText.toLowerCase();

  // 1. Detect Platform & Author from Link
  let platform: SocialPlatform = 'Instagram';
  if (urlLower.includes('tiktok.com')) {
    platform = 'TikTok';
  } else if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) {
    platform = 'Facebook';
  } else if (urlLower.includes('instagram.com')) {
    platform = 'Instagram';
  }

  let author =
    platform === 'Facebook' ? 'Thành Viên Cộng Đồng Việt Phục' : '@vietphuc.creator';
  const handleMatch =
    rawUrl.match(/@([a-zA-Z0-9._-]+)/) || combinedText.match(/@([a-zA-Z0-9._-]+)/);
  if (handleMatch) {
    author = `@${handleMatch[1]}`;
  } else if (urlLower.includes('/groups/')) {
    const grpMatch = rawUrl.match(/\/groups\/([^/?#]+)/i);
    if (grpMatch) {
      author = `Cộng đồng ${grpMatch[1]}`;
    }
  }

  // 2. Scan for Heritage Location in Title + Caption
  let location_query: string | undefined = undefined;
  if (
    textLower.includes('văn miếu') ||
    textLower.includes('quốc tử giám') ||
    textLower.includes('khuê văn các')
  ) {
    location_query = 'Văn Miếu - Quốc Tử Giám, Hà Nội';
  } else if (textLower.includes('hoàng thành') || textLower.includes('thăng long')) {
    location_query = 'Hoàng thành Thăng Long, Hà Nội';
  } else if (
    textLower.includes('đại nội') ||
    textLower.includes('hoàng cung huế') ||
    textLower.includes('cố đô huế')
  ) {
    location_query = 'Đại Nội Huế, Thừa Thiên Huế';
  } else if (textLower.includes('lăng tự đức') || textLower.includes('khiêm lăng')) {
    location_query = 'Lăng Tự Đức, Thừa Thiên Huế';
  } else if (textLower.includes('hội an')) {
    location_query = 'Phố cổ Hội An, Quảng Nam';
  } else if (textLower.includes('chùa thầy')) {
    location_query = 'Chùa Thầy, Hà Nội';
  } else if (textLower.includes('đường lâm')) {
    location_query = 'Làng cổ Đường Lâm, Hà Nội';
  } else if (textLower.includes('bình thủy') || textLower.includes('cần thơ')) {
    location_query = 'Nhà cổ Bình Thủy, Cần Thơ';
  } else if (
    textLower.includes('dinh độc lập') ||
    textLower.includes('sài gòn') ||
    textLower.includes('tp.hcm')
  ) {
    location_query = 'Dinh Độc Lập, TP.HCM';
  }

  // 3. Detect Garment Type & Event Tag
  let garmentId: OutfitConfigCode['garmentId'] = 'ao-ngu-than';
  let outfitTag = '#AoNguThan';
  if (textLower.includes('nhật bình')) {
    garmentId = 'ao-nhat-binh';
    outfitTag = '#AoNhatBinh';
  } else if (textLower.includes('tứ thân') || textLower.includes('yếm')) {
    garmentId = 'ao-tu-than';
    outfitTag = '#AoTuThan';
  } else if (textLower.includes('bà ba')) {
    garmentId = 'ao-dai-ba-ba';
    outfitTag = '#AoBaBa';
  } else if (textLower.includes('áo dài')) {
    garmentId = 'ao-dai-ba-ba';
    outfitTag = '#AoDaiTieuChuan';
  }

  let eventTag = '#DaoPho';
  let occasionId = 'dao-pho';
  if (textLower.includes('tốt nghiệp') || textLower.includes('nhận bằng')) {
    eventTag = '#DoDiTotNghiep';
    occasionId = 'tot-nghiep';
  } else if (textLower.includes('cưới') || textLower.includes('vu quy')) {
    eventTag = '#DoDiCuoi';
    occasionId = 'cuoi-hoi';
  } else if (
    textLower.includes('chùa') ||
    textLower.includes('lễ hội') ||
    textLower.includes('trảy hội')
  ) {
    eventTag = '#DoDiChua';
    occasionId = 'le-hoi-dan-gian';
  } else if (
    textLower.includes('kỷ yếu') ||
    textLower.includes('sinh viên') ||
    textLower.includes('nghiên cứu') ||
    textLower.includes('điển chế')
  ) {
    eventTag = '#KyYeu';
    occasionId = 'tot-nghiep';
  }

  // 4. Scan for 3D Model Link in Caption
  const link3DMatch =
    combinedText.match(/https?:\/\/[^\s]*(?:\/3d\/|config=|cfg_)[^\s,)]*/i) ||
    combinedText.match(/vietphuc(?:\.app|lookbook\.app)\/3d\/[^\s,)]+/i) ||
    combinedText.match(/\b(CFG_[A-Z0-9_]+)\b/);

  const has_re_fit_3d = Boolean(link3DMatch);
  const detected_3d_link = link3DMatch
    ? link3DMatch[0].startsWith('http')
      ? link3DMatch[0]
      : link3DMatch[0].startsWith('CFG_')
      ? `https://vietphuc.app/3d/${link3DMatch[0]}`
      : `https://${link3DMatch[0]}`
    : undefined;

  const isStreetwearFusion =
    textLower.includes('sneaker') ||
    textLower.includes('kính mát') ||
    textLower.includes('kính râm') ||
    textLower.includes('streetwear');

  const configId = has_re_fit_3d
    ? link3DMatch?.[0]?.match(/CFG_[A-Z0-9_]+/i)?.[0]?.toUpperCase() ||
      `CFG_SCAN_${Date.now().toString().slice(-4)}`
    : null;

  const outfitConfig: OutfitConfigCode | undefined = has_re_fit_3d
    ? {
        config_id: configId!,
        gender: textLower.includes('nam') || textLower.includes('áo tấc') ? 'nam' : 'nu',
        garmentId,
        paletteId:
          garmentId === 'ao-nhat-binh'
            ? 'chu-sa-ngu-uyen'
            : garmentId === 'ao-tu-than'
            ? 'kinh-bac-dao-hoa'
            : garmentId === 'ao-dai-ba-ba'
            ? 'phuong-nam-binh-di'
            : 'khue-van-tri-thuc',
        lowerGarmentId: isStreetwearFusion
          ? 'quan-jeans'
          : garmentId === 'ao-tu-than'
          ? 'vay-dup-den'
          : 'quan-lua-trang',
        motifId: garmentId === 'ao-nhat-binh' ? 'phuong-vu-bat-buu' : 'am-hoa-tron',
        accessoryIds: isStreetwearFusion
          ? ['kinh-mat-hien-dai']
          : garmentId === 'ao-nhat-binh'
          ? ['man-doi-dau', 'xuyen-bac']
          : garmentId === 'ao-tu-than'
          ? ['non-quai-thao', 'dai-lung-bao']
          : garmentId === 'ao-dai-ba-ba'
          ? ['khan-ran-non-la']
          : ['khan-xep', 'quat-tram-huong'],
        footwearId: isStreetwearFusion
          ? 'giay-sneaker'
          : garmentId === 'ao-nhat-binh'
          ? 'hai-theu'
          : 'guoc-go-moc',
        occasionId,
        weatherId: 'thu-ha-noi',
        outerHex:
          garmentId === 'ao-nhat-binh'
            ? '#9A3412'
            : garmentId === 'ao-tu-than'
            ? '#78350F'
            : '#2E8B57',
        innerHex: '#FFFFF0',
        lowerHex: garmentId === 'ao-tu-than' ? '#1C1917' : '#FFFFF0',
      }
    : undefined;

  // 5. Scan for Rental / Tailoring Link in Caption
  const shopLinkMatch =
    combinedText.match(
      /https?:\/\/[^\s]*(?:\/rent\/|\/tailor\/|\/marketplace\/|\/thue\/|\/may\/)[^\s,)]*/i
    ) ||
    combinedText.match(
      /vietphuc(?:\.app|lookbook\.app)\/(?:rent|tailor|marketplace)\/[^\s,)]+/i
    );

  const is_shoppable = Boolean(shopLinkMatch);
  const detected_shop_link = shopLinkMatch
    ? shopLinkMatch[0].startsWith('http')
      ? shopLinkMatch[0]
      : `https://${shopLinkMatch[0]}`
    : undefined;

  // 6. Culture Guard Check
  let culture_guard_status: 'Approved' | 'Warning' | 'Rejected' = 'Approved';
  let violatedRule: string | undefined = undefined;
  if (
    textLower.includes('ngũ thân nam') &&
    (textLower.includes('nón quai thao') || textLower.includes('nón ba tầm'))
  ) {
    culture_guard_status = 'Rejected';
    violatedRule = 'RULE 1: Không phối Nón quai thao/Nón ba tầm với Áo Ngũ Thân nam giới.';
  } else if (textLower.includes('rồng 5 móng') && textLower.includes('dân gian')) {
    culture_guard_status = 'Rejected';
    violatedRule = 'RULE 2: Không dùng họa tiết Rồng 5 móng cho thường phục dân gian.';
  } else if (
    textLower.includes('nhật bình') &&
    (textLower.includes('jeans rách') || textLower.includes('váy đụp ngắn'))
  ) {
    culture_guard_status = 'Rejected';
    violatedRule = 'RULE 3: Áo Nhật Bình không phối với quần jeans rách hay váy đụp ngắn.';
  } else if (isStreetwearFusion) {
    culture_guard_status = 'Warning';
  }

  const platformTag = `#${platform}`;
  const typeTag = isStreetwearFusion
    ? '#VietPhucStreetwear'
    : has_re_fit_3d
    ? '#VietPhuc3D'
    : '#VietPhucReal';

  return {
    platform,
    author,
    location_query,
    has_re_fit_3d,
    detected_3d_link,
    outfit_config_id: configId,
    outfitConfig,
    is_shoppable,
    detected_shop_link,
    tags: [platformTag, typeTag, outfitTag, eventTag],
    culture_guard_status,
    violatedRule,
  };
}

export const EXCLUSIVE_HASHTAGS: ExclusiveHashtag[] = [
  '#VietPhucLookbook',
  '#VietPhucApp',
  '#VietPhucStylist',
];

export const SMART_TAG_GROUPS = {
  exclusive: EXCLUSIVE_HASHTAGS,
  platform: ['#TikTok', '#Instagram', '#Facebook'] as SocialPlatformTag[],
  type: ['#VietPhucReal', '#VietPhuc3D', '#VietPhucStreetwear'] as SocialTypeTag[],
  outfit: [
    '#AoNguThan',
    '#AoNhatBinh',
    '#AoTuThan',
    '#AoDaiTieuChuan',
    '#AoBaBa',
  ] as SocialOutfitTag[],
  event: [
    '#DoDiTotNghiep',
    '#DoDiChua',
    '#DoDiCuoi',
    '#KyYeu',
    '#DaoPho',
  ] as SocialEventTag[],
};

export const HERITAGE_MARKETPLACE_VENDORS: Record<string, MarketplaceVendorInfo> = {
  'ao-ngu-than': {
    vendor_id: 'VENDOR_Y_VAN_HIEN_HN',
    vendor_name: 'Ỷ Vân Hiên — Cổ Phục Kinh Kỳ',
    google_maps_location: 'Văn Miếu - Quốc Tử Giám, Hà Nội',
    rental_price_per_day: '280.000đ/ngày',
    tailoring_available: true,
  },
  'ao-nhat-binh': {
    vendor_id: 'VENDOR_HOA_NIEN_HUE',
    vendor_name: 'Hoa Niên — Cổ Phục Cung Đình Huế',
    google_maps_location: 'Đại Nội Huế, Thừa Thiên Huế',
    rental_price_per_day: '380.000đ/ngày',
    tailoring_available: true,
  },
  'ao-tu-than': {
    vendor_id: 'VENDOR_DONG_PHONG_BN',
    vendor_name: 'Đông Phong Atelier — Y Phục Kinh Bắc',
    google_maps_location: 'Làng cổ Đường Lâm, Sơn Tây, Hà Nội',
    rental_price_per_day: '220.000đ/ngày',
    tailoring_available: true,
  },
  'ao-dai-ba-ba': {
    vendor_id: 'VENDOR_LUA_PHUONG_NAM_SG',
    vendor_name: 'Tiệm Lụa Phương Nam — Sài Gòn',
    google_maps_location: 'Dinh Độc Lập, Quận 1, TP.HCM',
    rental_price_per_day: '200.000đ/ngày',
    tailoring_available: true,
  },
};

export type CommunityTabType = 'TAB_1_SOCIAL_TRENDS' | 'TAB_2_PARTNER_MARKETPLACE';
export type PlatformOrShopType =
  | 'TikTok'
  | 'Instagram'
  | 'Facebook'
  | 'VERIFIED_RENTAL_SHOP'
  | 'VERIFIED_TAILOR';

export interface CommunityHubDualTabSchema {
  community_tab: CommunityTabType;
  post_id: string;
  content: {
    title_or_caption: string;
    author_or_vendor_name: string;
    platform_or_shop_type: PlatformOrShopType;
    embed_or_image_url: string;
  };
  metadata: {
    smart_tags: string[];
    outfit_config_id: string | null;
  };
  moderation: {
    culture_guard_status: 'APPROVED' | 'WARNING' | 'REJECTED';
    admin_approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  };
  tab_1_social_actions: {
    original_post_url: string;
    has_magic_refit: boolean;
  };
  tab_2_marketplace_actions: {
    vendor_google_maps_address: string;
    rental_price_per_day: string | null;
    tailoring_available: boolean;
    rent_now_link: string | null;
    send_measurements_to_tailor_link: string | null;
  };
}

export interface VerifiedPartnerVendorItem {
  vendor_id: string;
  post_id: string;
  vendor_name: string;
  shop_type: 'VERIFIED_RENTAL_SHOP' | 'VERIFIED_TAILOR';
  shop_type_label: string;
  region: 'MIEN_BAC' | 'MIEN_TRUNG' | 'MIEN_NAM';
  region_label: string;
  specialty_title: string;
  description: string;
  google_maps_address: string;
  rental_price_per_day: string;
  tailoring_price_from: string;
  tailoring_available: boolean;
  rating: number;
  reviews_count: number;
  image_url: string;
  smart_tags: string[];
  outfit_config_id: string;
  outfitConfig: OutfitConfigCode;
}

export const VERIFIED_PARTNER_VENDORS: VerifiedPartnerVendorItem[] = [
  {
    vendor_id: 'VENDOR_Y_VAN_HIEN_HN',
    post_id: 'MP_PARTNER_2026_001',
    vendor_name: 'Ỷ Vân Hiên — Cổ Phục Kinh Kỳ',
    shop_type: 'VERIFIED_TAILOR',
    shop_type_label: 'Nhà may đo & Cho thuê chuẩn điển chế',
    region: 'MIEN_BAC',
    region_label: 'Hà Nội · Miền Bắc',
    specialty_title: 'Áo Ngũ Thân Lập Lĩnh Tay Chẽn & Lễ Phục Tốt Nghiệp',
    description:
      'Chuyên phục dựng, may đo theo số đo nhân trắc học và cho thuê Áo Ngũ Thân tay chẽn, Áo Tấc lụa tơ đũi Nha Xá chuẩn cổ lệ năm 1744.',
    google_maps_address: 'Văn Miếu - Quốc Tử Giám, Đống Đa, Hà Nội',
    rental_price_per_day: '280.000đ/ngày',
    tailoring_price_from: '2.400.000đ/bộ',
    tailoring_available: true,
    rating: 4.9,
    reviews_count: 328,
    image_url: HERITAGE_IMAGES.aoNguThan,
    smart_tags: ['#VietPhucReal', '#VietPhuc3D', '#AoNguThan', '#DoDiTotNghiep'],
    outfit_config_id: 'CFG_PARTNER_YVANHIEN_01',
    outfitConfig: {
      config_id: 'CFG_PARTNER_YVANHIEN_01',
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
  {
    vendor_id: 'VENDOR_HOA_NIEN_HUE',
    post_id: 'MP_PARTNER_2026_002',
    vendor_name: 'Hoa Niên — Cổ Phục Cung Đình Huế',
    shop_type: 'VERIFIED_RENTAL_SHOP',
    shop_type_label: 'Tiệm cho thuê & Chế tác cung đình',
    region: 'MIEN_TRUNG',
    region_label: 'Cố đô Huế · Miền Trung',
    specialty_title: 'Áo Nhật Bình Gấm Đỏ Chu Sa & Cổ Phục Hoàng Cung',
    description:
      'Tiệm cổ phục ngay sát Đại Nội Huế chuyên cho thuê chụp ảnh di tích, lễ cưới truyền thống và nhận đặt thêu tay dải ngũ sắc Áo Nhật Bình.',
    google_maps_address: 'Đại Nội Huế, TP. Huế, Thừa Thiên Huế',
    rental_price_per_day: '380.000đ/ngày',
    tailoring_price_from: '3.800.000đ/bộ',
    tailoring_available: true,
    rating: 4.9,
    reviews_count: 412,
    image_url: HERITAGE_IMAGES.aoNhatBinh,
    smart_tags: ['#VietPhucReal', '#VietPhuc3D', '#AoNhatBinh', '#DoDiCuoi'],
    outfit_config_id: 'CFG_PARTNER_HOANIEN_02',
    outfitConfig: {
      config_id: 'CFG_PARTNER_HOANIEN_02',
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
  {
    vendor_id: 'VENDOR_DONG_PHONG_BN',
    post_id: 'MP_PARTNER_2026_003',
    vendor_name: 'Đông Phong Atelier — Y Phục Kinh Bắc',
    shop_type: 'VERIFIED_RENTAL_SHOP',
    shop_type_label: 'Tiệm cho thuê & Phục dựng dân gian',
    region: 'MIEN_BAC',
    region_label: 'Hà Nội & Bắc Ninh · Miền Bắc',
    specialty_title: 'Áo Tứ Thân Mớ Ba Mớ Bảy, Yếm Đào & Nón Ba Tầm',
    description:
      'Không gian cho thuê trọn bộ Áo Tứ Thân đũi tơ tằm, váy đụp lụa đen và Nón quai thao thủ công phục vụ trảy hội mùa xuân, chụp ảnh đình chùa.',
    google_maps_address: 'Làng cổ Đường Lâm, Sơn Tây, Hà Nội',
    rental_price_per_day: '220.000đ/ngày',
    tailoring_price_from: '1.850.000đ/bộ',
    tailoring_available: true,
    rating: 4.8,
    reviews_count: 215,
    image_url: HERITAGE_IMAGES.aoTuThan,
    smart_tags: ['#VietPhucReal', '#VietPhuc3D', '#AoTuThan', '#DoDiChua'],
    outfit_config_id: 'CFG_PARTNER_DONGPHONG_03',
    outfitConfig: {
      config_id: 'CFG_PARTNER_DONGPHONG_03',
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
  {
    vendor_id: 'VENDOR_VAN_THIEN_Y_HN',
    post_id: 'MP_PARTNER_2026_004',
    vendor_name: 'Vạn Thiên Y — Xưởng May Cổ Phục Nam & Kỷ Yếu',
    shop_type: 'VERIFIED_TAILOR',
    shop_type_label: 'Nhà may đo cá nhân hóa theo dáng 3D',
    region: 'MIEN_BAC',
    region_label: 'Hà Nội · Miền Bắc',
    specialty_title: 'Áo Ngũ Thân Nam Lập Lĩnh Lam Cổ Điển & Khăn Xếp',
    description:
      'Chuyên nhận số đo 3D trực tuyến từ ứng dụng để cắt rập Áo Ngũ Thân nam/nữ chuẩn tỷ lệ vai - ngực - eo (148–188cm), ưu đãi riêng cho sinh viên.',
    google_maps_address: 'Hoàng thành Thăng Long, Ba Đình, Hà Nội',
    rental_price_per_day: '260.000đ/ngày',
    tailoring_price_from: '2.250.000đ/bộ',
    tailoring_available: true,
    rating: 4.9,
    reviews_count: 194,
    image_url: HERITAGE_IMAGES.realMaleStudio,
    smart_tags: ['#VietPhucReal', '#VietPhuc3D', '#AoNguThan', '#KyYeu'],
    outfit_config_id: 'CFG_PARTNER_VANTHIENY_04',
    outfitConfig: {
      config_id: 'CFG_PARTNER_VANTHIENY_04',
      gender: 'nam',
      garmentId: 'ao-ngu-than',
      paletteId: 'thanh-phong-nien-hoa',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'am-hoa-tron',
      accessoryIds: ['khan-xep', 'quat-tram-huong'],
      footwearId: 'guoc-go-moc',
      occasionId: 'tot-nghiep',
      weatherId: 'thu-ha-noi',
      outerHex: '#1E3A8A',
      innerHex: '#F5F5DC',
      lowerHex: '#F5F5DC',
    },
  },
  {
    vendor_id: 'VENDOR_HOI_AN_SILK',
    post_id: 'MP_PARTNER_2026_005',
    vendor_name: 'Cổ Phong Hội An — Tiệm Thuê & May Nhanh 24h',
    shop_type: 'VERIFIED_RENTAL_SHOP',
    shop_type_label: 'Tiệm cho thuê & May lấy nhanh phố cổ',
    region: 'MIEN_TRUNG',
    region_label: 'Hội An · Miền Trung',
    specialty_title: 'Áo Ngũ Thân Tơ Tằm & Việt Phục Dạo Phố Đèn Lồng',
    description:
      'Cho thuê theo giờ/ngày và nhận may đo nhanh trong 24h tại phố cổ Hội An; chất liệu tơ sống, đũi mát nhẹ phù hợp dạo phố và thả hoa đăng.',
    google_maps_address: 'Phố cổ Hội An, Quảng Nam',
    rental_price_per_day: '240.000đ/ngày',
    tailoring_price_from: '2.100.000đ/bộ',
    tailoring_available: true,
    rating: 4.8,
    reviews_count: 276,
    image_url: HERITAGE_IMAGES.hero,
    smart_tags: ['#VietPhucReal', '#VietPhuc3D', '#AoNguThan', '#DaoPho'],
    outfit_config_id: 'CFG_PARTNER_HOIAN_05',
    outfitConfig: {
      config_id: 'CFG_PARTNER_HOIAN_05',
      gender: 'nu',
      garmentId: 'ao-ngu-than',
      paletteId: 'khue-van-tri-thuc',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'tu-quy-lien-hoa',
      accessoryIds: ['khan-xep', 'quat-tram-huong'],
      footwearId: 'guoc-go-moc',
      occasionId: 'dao-pho',
      weatherId: 'xuan-am-ap',
      outerHex: '#2E8B57',
      innerHex: '#FFFFF0',
      lowerHex: '#FFFFF0',
    },
  },
  {
    vendor_id: 'VENDOR_LUA_PHUONG_NAM_SG',
    post_id: 'MP_PARTNER_2026_006',
    vendor_name: 'Tiệm Lụa Phương Nam — Sài Gòn',
    shop_type: 'VERIFIED_TAILOR',
    shop_type_label: 'Nhà may đo & Cho thuê Việt phục Nam Bộ',
    region: 'MIEN_NAM',
    region_label: 'TP.HCM & Cần Thơ · Miền Nam',
    specialty_title: 'Áo Bà Ba Tơ Chuối, Lãnh Mỹ A & Áo Dài Tân Thời',
    description:
      'Chuyên may đo Áo Bà Ba cổ tim/cổ tròn, Áo Dài Lemur/Lê Phổ và cho thuê phụ kiện khăn rằn, nón lá, guốc mộc chụp ảnh tại Dinh Độc Lập, Bình Thủy.',
    google_maps_address: 'Dinh Độc Lập, Quận 1, TP.HCM',
    rental_price_per_day: '200.000đ/ngày',
    tailoring_price_from: '1.650.000đ/bộ',
    tailoring_available: true,
    rating: 4.9,
    reviews_count: 305,
    image_url: HERITAGE_IMAGES.aoDaiBaBa,
    smart_tags: ['#VietPhucReal', '#VietPhuc3D', '#AoBaBa', '#DaoPho'],
    outfit_config_id: 'CFG_PARTNER_PHUONGNAM_06',
    outfitConfig: {
      config_id: 'CFG_PARTNER_PHUONGNAM_06',
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
];

export function buildSocialTabMandatoryJson(post: SocialPostItem): CommunityHubDualTabSchema {
  const isShoppable = post.is_shoppable !== false;
  const garmentKey = post.outfitConfig?.garmentId || 'ao-ngu-than';
  const matchedPartner =
    VERIFIED_PARTNER_VENDORS.find((v) => v.outfitConfig.garmentId === garmentKey) ||
    VERIFIED_PARTNER_VENDORS[0];

  const guardStatusUpper: 'APPROVED' | 'WARNING' | 'REJECTED' =
    post.moderation?.culture_guard_status ||
    (post.culture_guard_status === 'Rejected'
      ? 'REJECTED'
      : post.culture_guard_status === 'Warning' || post.tags.includes('#VietPhucStreetwear')
      ? 'WARNING'
      : 'APPROVED');

  return {
    community_tab: 'TAB_1_SOCIAL_TRENDS',
    post_id: post.post_id,
    content: {
      title_or_caption: post.caption || post.title,
      author_or_vendor_name: post.author,
      platform_or_shop_type: post.platform,
      embed_or_image_url: post.original_url,
    },
    metadata: {
      smart_tags: post.tags.filter((t) => !['#TikTok', '#Instagram', '#Facebook'].includes(t)),
      outfit_config_id: post.outfit_config_id,
    },
    moderation: {
      culture_guard_status: guardStatusUpper,
      admin_approval_status: 'APPROVED',
    },
    tab_1_social_actions: {
      original_post_url: post.original_url,
      has_magic_refit: Boolean(post.has_re_fit_3d),
    },
    tab_2_marketplace_actions: {
      vendor_google_maps_address:
        post.location_query || (isShoppable ? matchedPartner.google_maps_address : ''),
      rental_price_per_day: isShoppable ? matchedPartner.rental_price_per_day : null,
      tailoring_available: isShoppable ? matchedPartner.tailoring_available : false,
      rent_now_link: isShoppable
        ? `https://vietphuclookbook.app/marketplace/rent/${matchedPartner.vendor_id}?ref=${post.post_id}`
        : null,
      send_measurements_to_tailor_link: isShoppable
        ? `https://vietphuclookbook.app/marketplace/tailor/${matchedPartner.vendor_id}?config=${post.outfit_config_id || 'DEFAULT'}`
        : null,
    },
  };
}

export function buildPartnerTabMandatoryJson(
  partner: VerifiedPartnerVendorItem
): CommunityHubDualTabSchema {
  return {
    community_tab: 'TAB_2_PARTNER_MARKETPLACE',
    post_id: partner.post_id,
    content: {
      title_or_caption: `${partner.specialty_title} — ${partner.description}`,
      author_or_vendor_name: partner.vendor_name,
      platform_or_shop_type: partner.shop_type,
      embed_or_image_url: partner.image_url,
    },
    metadata: {
      smart_tags: partner.smart_tags,
      outfit_config_id: partner.outfit_config_id,
    },
    moderation: {
      culture_guard_status: 'APPROVED',
      admin_approval_status: 'APPROVED',
    },
    tab_1_social_actions: {
      original_post_url: `https://vietphuclookbook.app/partners/${partner.vendor_id}`,
      has_magic_refit: true,
    },
    tab_2_marketplace_actions: {
      vendor_google_maps_address: partner.google_maps_address,
      rental_price_per_day: partner.rental_price_per_day,
      tailoring_available: partner.tailoring_available,
      rent_now_link: `https://vietphuclookbook.app/marketplace/rent/${partner.vendor_id}`,
      send_measurements_to_tailor_link: `https://vietphuclookbook.app/marketplace/tailor/${partner.vendor_id}?config=${partner.outfit_config_id}`,
    },
  };
}

export const INITIAL_SOCIAL_POSTS: SocialPostItem[] = [
  {
    post_id: 'SP_TIKTOK_2026_001',
    platform: 'TikTok',
    author: '@linhchi.cophuc',
    original_url: 'https://www.tiktok.com/@linhchi.cophuc/video/74829103841',
    source_hashtag: '#VietPhucApp',
    tags: ['#TikTok', '#VietPhuc3D', '#AoNguThan', '#DoDiTotNghiep'],
    has_re_fit_3d: true,
    is_shoppable: true,
    detected_3d_link: 'https://vietphuc.app/3d/CFG_NGUTHAN_TOTNGHIEP_01',
    detected_shop_link: 'https://vietphuc.app/rent/y-van-hien',
    outfit_config_id: 'CFG_NGUTHAN_TOTNGHIEP_01',
    culture_guard_status: 'Approved',
    is_local_locked: true,
    title: 'Biến hình Áo Ngũ Thân Tay Chẽn nhận bằng tốt nghiệp tại Văn Miếu',
    caption:
      'Biến hình từ bản thiết kế 3D ra đời thật tại Văn Miếu - Quốc Tử Giám. Mẫu 3D: https://vietphuc.app/3d/CFG_NGUTHAN_TOTNGHIEP_01 · Link thuê/may: https://vietphuc.app/rent/y-van-hien #VietPhucApp',
    contentCategory: 'Video ngắn (9:16) · Biến hình & Vlog di tích',
    aspectRatio: '9:16',
    imageUrl: HERITAGE_IMAGES.aoNguThan,
    metricsLabel: '142.8K lượt xem trên TikTok',
    publishedAt: '2 giờ trước',
    location_query: 'Văn Miếu - Quốc Tử Giám, Hà Nội',
    outfitConfig: {
      config_id: 'CFG_NGUTHAN_TOTNGHIEP_01',
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
  {
    post_id: 'SP_FB_2026_002',
    platform: 'Facebook',
    author: '@di.san.le.hoi.viet',
    original_url: 'https://www.facebook.com/groups/daivietcophong/posts/918273645',
    source_hashtag: '#VietPhucLookbook',
    tags: ['#Facebook', '#VietPhucReal', '#AoNguThan', '#DoDiChua'],
    has_re_fit_3d: false,
    is_shoppable: false,
    outfit_config_id: null,
    culture_guard_status: 'Approved',
    is_local_locked: true,
    title: 'Lễ hội Đền Hùng: Nghi thức rước kiệu Bách Gia Trăm Họ & Tín ngưỡng thờ cúng Hùng Vương',
    caption:
      'Toàn cảnh đoàn rước kiệu sơn son thếp vàng và nghi thức dâng hương Quốc Tổ Hùng Vương ngày Mùng 10 tháng 3 Âm lịch tại núi Nghĩa Lĩnh, Phú Thọ. Lễ hội quy tụ hàng chục cỗ kiệu Bát Cống truyền thống, cờ hội ngũ sắc cùng trình diễn Hát Xoan cổ tại các đình làng vùng Đất Tổ. #VietPhucLookbook',
    contentCategory: 'Lễ hội truyền thống · Di sản Văn hóa Phi vật thể UNESCO',
    aspectRatio: '16:9',
    imageUrl: HERITAGE_IMAGES.festivalDenHung,
    metricsLabel: '18.6K lượt chia sẻ trên Facebook',
    publishedAt: '5 giờ trước',
    location_query: 'Khu Di tích Đền Hùng, Phú Thọ',
    festivalDetails: {
      lunarDate: 'Mùng 1 – 10 tháng 3 Âm lịch (Chính hội 10/3)',
      location: 'Núi Nghĩa Lĩnh, Hy Cương, TP. Việt Trì, Phú Thọ',
      mainRituals: 'Rước kiệu Bát Cống, Dâng hương Đền Thượng, Đánh trống đồng & Hát Xoan cổ',
      heritageStatus: 'Di sản Văn hóa Phi vật thể Đại diện của Nhân loại (UNESCO 2012)',
      highlights: [
        'Đoàn rước kiệu Bát Cống sơn son thếp vàng từ các xã vùng ven hội tụ dưới chân núi Nghĩa Lĩnh.',
        'Lễ phẩm truyền thống gồm Bánh Chưng, Bánh Giầy tượng trưng cho quan niệm Trời tròn – Đất vuông.',
        'Trình diễn Hát Xoan cổ tại miếu Lãi Lèn và đình Hùng Lô kết hợp hội thi gói bánh, giã bánh giầy.',
      ],
    },
  },
  {
    post_id: 'SP_INSTA_2026_003',
    platform: 'Instagram',
    author: '@hue.imperial.atelier',
    original_url: 'https://www.instagram.com/p/C8vNhatBinhHue/',
    source_hashtag: '#VietPhucLookbook',
    tags: ['#Instagram', '#VietPhucReal', '#AoNhatBinh', '#DoDiCuoi'],
    has_re_fit_3d: false,
    is_shoppable: true,
    detected_shop_link: 'https://vietphuc.app/rent/hoa-nien-hue',
    outfit_config_id: null,
    culture_guard_status: 'Approved',
    is_local_locked: true,
    title: 'Bộ ảnh cổ phong Chu Sa Ngự Uyển & Bảng màu gấm cung đình Huế',
    caption:
      'Lookbook nhiếp ảnh Áo Nhật Bình lễ cưới chụp thực tế tại Đại Nội Huế. Link đặt thuê & may đo lễ phục: https://vietphuc.app/rent/hoa-nien-hue #VietPhucLookbook',
    contentCategory: 'Bộ ảnh nghệ thuật · Nhiếp ảnh cổ phong',
    aspectRatio: '4:5',
    imageUrl: HERITAGE_IMAGES.aoNhatBinh,
    metricsLabel: '29.6K lượt thích trên Instagram',
    publishedAt: '1 ngày trước',
    location_query: 'Đại Nội Huế, Thừa Thiên Huế',
  },
  {
    post_id: 'SP_TIKTOK_2026_004',
    platform: 'TikTok',
    author: '@kinhbac.quanho.heritage',
    original_url: 'https://www.tiktok.com/@kinhbac.quanho.heritage/video/74830918273',
    source_hashtag: '#VietPhucLookbook',
    tags: ['#TikTok', '#VietPhucReal', '#AoTuThan', '#DoDiChua'],
    has_re_fit_3d: false,
    is_shoppable: false,
    outfit_config_id: null,
    culture_guard_status: 'Approved',
    is_local_locked: true,
    title: 'Hội Lim Kinh Bắc: Hát đối đáp Quan họ trên thuyền rồng & phong tục trảy hội mùa xuân',
    caption:
      'Khung cảnh liền anh liền chị trong trang phục Áo Tứ Thân mớ ba mớ bảy, nón ba tầm hát đối đáp Quan họ cổ trên thuyền rồng tại hồ nước đình Lim (Tiên Du, Bắc Ninh) ngày 13 tháng Giêng. #VietPhucLookbook',
    contentCategory: 'Lễ hội truyền thống · Văn hóa Quan họ Kinh Bắc',
    aspectRatio: '9:16',
    imageUrl: HERITAGE_IMAGES.festivalHoiLim,
    metricsLabel: '96.4K lượt xem trên TikTok',
    publishedAt: '2 ngày trước',
    location_query: 'Đồi Lim, Tiên Du, Bắc Ninh',
    festivalDetails: {
      lunarDate: '12 – 13 tháng Giêng Âm lịch hàng năm',
      location: 'Đồi Lim & Sông Tiêu Tương, huyện Tiên Du, Bắc Ninh',
      mainRituals: 'Lễ rước sắc phong, Hát Quan họ trên thuyền rồng, Mời trầu cánh phượng & Đánh đu tiên',
      heritageStatus: 'Dân ca Quan họ Bắc Ninh — Di sản Văn hóa Phi vật thể UNESCO (2009)',
      highlights: [
        'Hát đối đáp Quan họ cổ truyền trên thuyền rồng và tại các lán trại quanh đồi Lim.',
        'Nghi thức mời trầu têm cánh phượng kết chạ giữa các làng Quan họ gốc vùng Kinh Bắc.',
        'Trò chơi dân gian truyền thống mùa xuân: đánh đu đôi, cờ người, vật truyền thống và dệt cửi.',
      ],
    },
  },
  {
    post_id: 'SP_INSTA_2026_005',
    platform: 'Instagram',
    author: '@hue.festival.archive',
    original_url: 'https://www.instagram.com/p/C8vDemHoangCungHue/',
    source_hashtag: '#VietPhucApp',
    tags: ['#Instagram', '#VietPhucReal', '#AoNhatBinh', '#DoDiChua'],
    has_re_fit_3d: false,
    is_shoppable: false,
    outfit_config_id: null,
    culture_guard_status: 'Approved',
    is_local_locked: true,
    title: 'Lễ hội Đêm Hoàng Cung Huế: Nhã nhạc cung đình & ngàn ánh đèn lồng trước Ngọ Môn',
    caption:
      'Tái hiện đêm lễ hội cung đình triều Nguyễn tại Đại Nội Huế với nghi thức Đổi gác, trình diễn Đại nhạc – Tiểu nhạc và vũ khúc Lục Cúng Hoa Đăng dưới ánh sáng của hàng ngàn chiếc đèn lồng lụa. #VietPhucApp',
    contentCategory: 'Lễ hội truyền thống · Di sản Cung đình Huế',
    aspectRatio: '4:5',
    imageUrl: HERITAGE_IMAGES.festivalCungDinhHue,
    metricsLabel: '34.8K lượt thích trên Instagram',
    publishedAt: '3 ngày trước',
    location_query: 'Đại Nội Huế, Thừa Thiên Huế',
    festivalDetails: {
      lunarDate: 'Kỳ Festival Huế & Các đêm lễ hội Hoàng cung định kỳ',
      location: 'Ngọ Môn – Điện Thái Hòa – Thế Miếu, Đại Nội Huế',
      mainRituals: 'Lễ Đổi gác cung đình, Trình diễn Nhã nhạc, Múa Lục Cúng Hoa Đăng & Rước đèn lồng',
      heritageStatus: 'Nhã nhạc cung đình Huế — Di sản Truyền khẩu và Phi vật thể UNESCO (2003)',
      highlights: [
        'Trục kiến trúc Ngọ Môn – Điện Thái Hòa rực sáng dưới hàng ngàn lồng đèn lụa truyền thống xứ Huế.',
        'Biểu diễn Đại nhạc, Tiểu nhạc và các vũ khúc cung đình cổ truyền (Lục Cúng Hoa Đăng, Bát Tiên Hiến Thọ).',
        'Trải nghiệm thưởng trà sen Tịnh Tâm, nghệ thuật Pháp lam và trò chơi Đầu hồ trong Hoàng cung.',
      ],
    },
  },
  {
    post_id: 'SP_FB_2026_006',
    platform: 'Facebook',
    author: '@hoiquan.cophuc.sv',
    original_url: 'https://www.facebook.com/groups/aodaisinhvien/posts/837465912',
    source_hashtag: '#VietPhucStylist',
    tags: ['#Facebook', '#VietPhuc3D', '#AoTuThan', '#DoDiChua'],
    has_re_fit_3d: true,
    is_shoppable: true,
    detected_3d_link: 'https://vietphuc.app/3d/CFG_TUTHAN_CHUA_06',
    detected_shop_link: 'https://vietphuc.app/rent/dong-phong',
    outfit_config_id: 'CFG_TUTHAN_CHUA_06',
    culture_guard_status: 'Approved',
    is_local_locked: true,
    title: 'Trảy hội Chùa Thầy diện Áo Tứ Thân mớ ba mớ bảy & Nón ba tầm',
    caption:
      'Nhóm sinh viên chúng mình check-in hội xuân tại Chùa Thầy, Hà Nội. Link mẫu 3D: https://vietphuc.app/3d/CFG_TUTHAN_CHUA_06 · Link thuê đồ lễ hội: https://vietphuc.app/rent/dong-phong #VietPhucStylist',
    contentCategory: 'Bài viết cộng đồng · Review thuê đồ lễ hội',
    aspectRatio: '16:9',
    imageUrl: HERITAGE_IMAGES.aoTuThan,
    metricsLabel: '5.4K cảm xúc trên Facebook',
    publishedAt: '4 ngày trước',
    location_query: 'Chùa Thầy, Hà Nội',
    outfitConfig: {
      config_id: 'CFG_TUTHAN_CHUA_06',
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
];

// ============================================================================
// CORE LOGIC II & III: AI SMART STYLIST 3-OPTION CONSULTATION SCHEMAS
// ============================================================================
export interface StylistOptionData {
  optionNumber: 1 | 2 | 3;
  outfitName: string;
  styleLabel: string;
  budgetTier: string;
  mainGarment: string;
  accessories: string[];
  palette: ColorSwatch[];
  culturalMeaning: string;
  outfitConfigCode: OutfitConfigCode;
}

export interface StylistConsultationResponse {
  part1Summary: {
    event: string;
    weather: string;
    style: string;
    budget: string;
    overviewText: string;
  };
  part2Options: StylistOptionData[]; // Strictly 3 Lookbook 3D Options
  part3CultureGuard: {
    status: 'Approved' | 'Warning';
    statusLabel: string;
    hasViolation: boolean;
    violatedRule: string | null;
    detailNote: string;
  };
  formattedMarkdownReport: string;
  lookbookCard: LookbookCardData;
}

// ============================================================================
// CORE LOGIC V: HERITAGE NEWS & TRADITIONAL EVENTS (BẢN TIN DI SẢN VIỆT PHỤC)
// ============================================================================
export type HeritageNewsCategory = 'su-kien' | 'kham-pha' | 'tu-lieu';

export interface HeritageNewsArticle {
  id: string;
  heritage_id?: string;
  location_query?: string;
  nearest_partner_shop_id?: string;
  category: HeritageNewsCategory;
  categoryLabel: string;
  title: string;
  subtitle: string;
  publishedDate: string;
  locationOrSource: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
  hasStudioTryOn?: boolean;
  festivalDetails?: {
    lunarDate: string;
    location: string;
    mainRituals: string;
    heritageStatus: string;
  };
  keyTakeaways: string[];
  contentParagraphs: string[];
  relatedGarmentId: string;
  relatedGarmentName: string;
  outfitConfig: OutfitConfigCode;
  aiPromptSuggestion: string;
}

export interface UpcomingHeritageEvent {
  id: string;
  heritage_id?: string;
  location_query?: string;
  nearest_partner_shop_id?: string;
  lunarDate?: string;
  title: string;
  dateLabel: string;
  location: string;
  dressCode: string;
  summary: string;
  outfitConfig: OutfitConfigCode;
  aiPromptSuggestion: string;
}

export const HERITAGE_NEWS_ARTICLES: HeritageNewsArticle[] = [
  {
    id: 'news-kham-pha-nhat-binh-2026',
    heritage_id: 'HERITAGE_DAI_NOI_HUE',
    location_query: 'Đại Nội Huế, Thừa Thiên Huế',
    nearest_partner_shop_id: 'VENDOR_HOA_NIEN_HUE',
    category: 'kham-pha',
    categoryLabel: 'Khám phá & Tư liệu',
    title:
      'Giải mã kỹ thuật thêu kim tuyến phẳng và dải ngũ sắc trên hiện vật Áo Nhật Bình cuối thế kỷ XIX',
    subtitle:
      'Nhóm nghiên cứu di sản dệt may vừa công bố bản phân tích vi cấu trúc sợi tơ se kim tuyến và tỷ lệ vàng của cổ áo chữ nhật trên hiện vật Áo Nhật Bình cung đình Huế mới được bảo tồn.',
    publishedDate: '08 Tháng 10, 2026',
    locationOrSource: 'Trung tâm Bảo tồn Di tích Cố đô Huế',
    readTime: '4 phút đọc',
    imageUrl: HERITAGE_IMAGES.aoNhatBinh,
    featured: true,
    keyTakeaways: [
      'Cổ áo hình chữ nhật to bản khi cài khuy tạo thành chữ "Nhật" (日) chuẩn tỷ lệ 1:1.62 giúp tôn phần xương quai xanh.',
      'Dải ngũ sắc ở cổ tay tuân thủ nghiêm ngặt thứ tự tương sinh Ngũ Hành: Lục – Đỏ – Vàng – Trắng – Chàm.',
      'Sợi kim tuyến cổ được quấn thủ công từ lá bạc mạ vàng mỏng quanh lõi tơ tằm giúp bề mặt thêu bắt sáng mà vẫn giữ độ rủ tự nhiên của thân áo.',
    ],
    contentParagraphs: [
      'Qua quá trình soi chiếu hiển vi trên hiện vật Áo Nhật Bình thuộc thời kỳ Đồng Khánh – Thành Thái, các chuyên gia phục dựng cổ phục đã ghi nhận kỹ thuật "thêu đâm xô kết hợp釘 kim tuyến" cực kỳ tinh xảo ở đồ án Loan Phượng và Bát Bửu.',
      'Điểm đáng chú ý nhất trong đợt khảo cứu lần này là cấu trúc rập tay áo và tà áo: dù mang nhiều lớp thêu nổi trên nền sa dệt hoa, phần tà dưới vẫn giữ được độ rủ tự nhiên theo dáng chữ A nhờ cách bố trí trọng lượng chỉ kim tuyến tập trung ở viền cổ và dải ngũ sắc cổ tay.',
      'Phát hiện này giúp các xưởng chế tác Việt phục đương đại hiệu chỉnh lại định lượng vải sa, gấm và lụa lót, mang lại trải nghiệm mặc nhẹ nhàng, thoáng mát hơn cho người trẻ trong các dịp lễ cưới hỏi và chụp ảnh di tích.',
    ],
    relatedGarmentId: 'ao-nhat-binh',
    relatedGarmentName: 'Áo Nhật Bình (Cổ Khuyếp · Dải Ngũ Sắc)',
    outfitConfig: {
      config_id: 'NEWS_CFG_NHATBINH_01',
      gender: 'nu',
      garmentId: 'ao-nhat-binh',
      paletteId: 'chu-sa-ngu-uyen',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'phuong-vu-bat-buu',
      accessoryIds: ['man-doi-dau', 'xuyen-bac'],
      footwearId: 'hai-theu',
      occasionId: 'cuoi-hoi',
      weatherId: 'thu-ha-noi',
      outerHex: '#9A3412',
      innerHex: '#D97706',
      lowerHex: '#FAF8F5',
    },
    aiPromptSuggestion:
      'Tư vấn cho mình bộ Áo Nhật Bình theo chuẩn khám phá mới về dải ngũ sắc và họa tiết Loan Phượng để chụp ảnh tại di tích.',
  },
  {
    id: 'news-le-hoi-den-hung-phu-tho',
    heritage_id: 'HERITAGE_HOANG_THANH_HN',
    location_query: 'Hoàng Thành Thăng Long, Hà Nội',
    nearest_partner_shop_id: 'VENDOR_Y_VAN_HIEN_HN',
    category: 'su-kien',
    categoryLabel: 'Lễ hội truyền thống',
    title:
      'Lễ hội Đền Hùng — Nghi thức rước kiệu Bách Gia Trăm Họ và Tín ngưỡng thờ cúng Hùng Vương',
    subtitle:
      'Hành trình về nguồn tại núi Nghĩa Lĩnh (Phú Thọ) với nghi thức rước kiệu sơn son thếp vàng, cờ hội ngũ sắc và tiếng trống đồng âm vang giữa rừng cọ đồi chè.',
    publishedDate: '06 Tháng 10, 2026',
    locationOrSource: 'Khu Di tích Lịch sử Đền Hùng · Phú Thọ',
    readTime: '4 phút đọc',
    imageUrl: HERITAGE_IMAGES.festivalDenHung,
    hasStudioTryOn: false,
    festivalDetails: {
      lunarDate: 'Mùng 1 – Mùng 10 tháng 3 Âm lịch (Chính hội 10/3)',
      location: 'Núi Nghĩa Lĩnh, xã Hy Cương, TP. Việt Trì, Phú Thọ',
      mainRituals:
        'Lễ rước kiệu các xã vùng ven, Lễ dâng hương tưởng niệm tại Đền Thượng, Đánh trống đồng & Hát Xoan cổ',
      heritageStatus: 'Di sản Văn hóa Phi vật thể Đại diện của Nhân loại (UNESCO 2012)',
    },
    keyTakeaways: [
      'Đoàn rước kiệu truyền thống gồm hàng chục cỗ kiệu Bát Cống sơn son thếp vàng từ các làng xã quanh chân núi Nghĩa Lĩnh hội tụ về Đền Hùng.',
      'Lễ vật dâng cúng Quốc Tổ gồm Bánh Chưng, Bánh Giầy (tượng trưng Trời tròn – Đất vuông) cùng hương hoa, phẩm vật địa phương.',
      'Phần hội sôi nổi với trình diễn Hát Xoan Phú Thọ tại miếu Lãi Lèn, thi gói bánh chưng, giã bánh giầy và đánh trống đồng cổ.',
    ],
    contentParagraphs: [
      'Lễ hội Đền Hùng (còn gọi là Quốc giỗ) là một trong những lễ hội truyền thống lớn và thiêng liêng bậc nhất của dân tộc Việt Nam, thể hiện đạo lý "Uống nước nhớ nguồn" gắn kết cộng đồng người Việt qua hàng thiên niên kỷ.',
      'Từ sáng sớm ngày chính hội Mùng 10 tháng 3 Âm lịch, trong làn sương mờ trên đỉnh núi Nghĩa Lĩnh, đội hình rước kiệu truyền thống trong trang phục tế lễ cổ truyền rực rỡ sắc đỏ - vàng cùng cờ hội ngũ sắc tiến bước qua hàng trăm bậc đá cổ kính lên Đền Hạ, Đền Trung và Đền Thượng.',
      'Bên cạnh phần lễ trang nghiêm theo nghi thức truyền thống, du khách thập phương còn được hòa mình vào không gian diễn xướng Hát Xoan cổ tại các đình làng vùng Đất Tổ và chiêm ngưỡng nghệ thuật chạm khắc kiệu gỗ tinh xảo được lưu giữ qua nhiều thế hệ.',
    ],
    relatedGarmentId: 'ao-ngu-than',
    relatedGarmentName: 'Lễ hội Quốc giỗ Đền Hùng',
    outfitConfig: {
      config_id: 'NEWS_CFG_DENHUNG_02',
      gender: 'nam',
      garmentId: 'ao-ngu-than',
      paletteId: 'thanh-phong-nien-hoa',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'am-hoa-tron',
      accessoryIds: ['khan-xep', 'quat-tram-huong'],
      footwearId: 'guoc-go-moc',
      occasionId: 'le-nghi',
      weatherId: 'xuan-am-ap',
      outerHex: '#1E3A8A',
      innerHex: '#F5F5DC',
      lowerHex: '#F5F5DC',
    },
    aiPromptSuggestion:
      'Tìm hiểu chi tiết nghi thức văn hóa và lưu ý trang phục tôn nghiêm khi hành hương dự Lễ hội Đền Hùng.',
  },
  {
    id: 'news-tu-lieu-sac-du-1744-minh-mang',
    heritage_id: 'HERITAGE_VAN_MIEU_HN',
    location_query: 'Văn Miếu - Quốc Tử Giám, Hà Nội',
    nearest_partner_shop_id: 'VENDOR_Y_VAN_HIEN_HN',
    category: 'kham-pha',
    categoryLabel: 'Khám phá & Tư liệu',
    title:
      'Tư liệu mới công bố về cải cách y phục năm 1744 của Võ Vương Nguyễn Phúc Khoát và điển chế Minh Mạng',
    subtitle:
      'Từ sắc dụ định hình quy chuẩn Áo Ngũ Thân tại Đàng Trong năm Giáp Tý (1744) đến cuộc thống nhất trang phục toàn quốc dưới triều vua Minh Mạng (1820–1841).',
    publishedDate: '01 Tháng 10, 2026',
    locationOrSource: 'Viện Nghiên cứu Hán Nôm & Lưu trữ Quốc gia',
    readTime: '5 phút đọc',
    imageUrl: HERITAGE_IMAGES.realMaleStudio,
    hasStudioTryOn: true,
    keyTakeaways: [
      'Cấu trúc 5 thân (4 thân ngoài tượng trưng Tứ thân phụ mẫu, 1 thân con bên trong tượng trưng cho bản thân người mặc).',
      '5 hạt khuy (kim hoàn, ngọc hoặc gỗ) cài từ cổ xuống nách phải biểu trưng cho Ngũ Thường: Nhân – Nghĩa – Lễ – Trí – Tín.',
      'Phom áo cắt phẳng, nách rộng vừa phải giúp tà áo buông rủ tự nhiên theo hình chữ A, che khuyết điểm hình thể và giữ phong thái đoan trang.',
    ],
    contentParagraphs: [
      'Bản dịch công bố mới từ châu bản và sử liệu triều Nguyễn làm rõ hơn lý do vì sao Áo Ngũ Thân Lập Lĩnh trở thành biểu tượng thẩm mỹ xuyên suốt hơn hai thế kỷ: mọi đường kim mũi chỉ đều gắn liền với đạo lý làm người của người Việt.',
      'Đường khâu nối chính giữa sống lưng và ngực áo (đường trung phùng) luôn được giữ thẳng tắp từ chân cổ xuống gấu áo, nhắc nhở người quân tử giữ tâm ngay thẳng. Bên trong luôn có lớp áo lót trắng (áo trung đơn) nhằm giữ vệ sinh cho lớp gấm lụa bên ngoài và tạo hiệu ứng chuyển lớp thanh nhã ở cổ và cổ tay.',
    ],
    relatedGarmentId: 'ao-ngu-than',
    relatedGarmentName: 'Áo Ngũ Thân Nam (Lập Lĩnh & Lễ Phục)',
    outfitConfig: {
      config_id: 'NEWS_CFG_NGUTHAN_NAM_03',
      gender: 'nam',
      garmentId: 'ao-ngu-than',
      paletteId: 'thanh-phong-nien-hoa',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'am-hoa-tron',
      accessoryIds: ['khan-xep', 'quat-tram-huong'],
      footwearId: 'guoc-go-moc',
      occasionId: 'le-nghi',
      weatherId: 'thu-ha-noi',
      outerHex: '#1E3A8A',
      innerHex: '#F5F5DC',
      lowerHex: '#F5F5DC',
    },
    aiPromptSuggestion:
      'Tư vấn bộ Áo Ngũ Thân nam chuẩn điển chế 1744 / Minh Mạng cho dịp lễ tốt nghiệp và nghi lễ truyền thống.',
  },
  {
    id: 'news-le-hoi-lim-quan-ho-kinh-bac',
    heritage_id: 'HERITAGE_CHUA_THAY_HN',
    location_query: 'Chùa Thầy, Sài Sơn, Quốc Oai, Hà Nội',
    nearest_partner_shop_id: 'VENDOR_DONG_PHONG_BN',
    category: 'su-kien',
    categoryLabel: 'Lễ hội truyền thống',
    title:
      'Hội Lim Kinh Bắc: Không gian hát Quan họ trên thuyền rồng và phong tục trảy hội mùa xuân',
    subtitle:
      'Khám phá nét đẹp văn hóa vùng Kinh Bắc tại đồi Lim và sông Tiêu Tương, nơi các liền anh liền chị ngân vang làn điệu Quan họ cổ truyền bên mái đình cổ kính.',
    publishedDate: '27 Tháng 09, 2026',
    locationOrSource: 'Đồi Lim, Tiên Du · Bắc Ninh',
    readTime: '4 phút đọc',
    imageUrl: HERITAGE_IMAGES.festivalHoiLim,
    hasStudioTryOn: false,
    festivalDetails: {
      lunarDate: '12 – 13 tháng Giêng Âm lịch hàng năm',
      location: 'Thị trấn Lim, huyện Tiên Du, tỉnh Bắc Ninh',
      mainRituals:
        'Lễ rước sắc phong tại Lăng Hồng Vân, Hát đối đáp Quan họ trên thuyền rồng, Dệt cửi & Trò chơi dân gian (Đánh đu, Cờ người)',
      heritageStatus: 'Dân ca Quan họ Bắc Ninh — Di sản Văn hóa Phi vật thể UNESCO (2009)',
    },
    keyTakeaways: [
      'Nghi thức hát Quan họ không nhạc đệm tại nhà chứa và hát đối đáp trên thuyền rồng giữa hồ nước trước đình làng.',
      'Phong tục mời trầu cánh phượng — biểu tượng của lòng hiếu khách, sự tinh tế và duyên dáng mở đầu mỗi canh hát.',
      'Hội tụ các trò chơi dân gian truyền thống Bắc Bộ: đánh đu tiên, vật truyền thống, đập niêu, nấu cơm thi và dệt cửi.',
    ],
    contentParagraphs: [
      'Hội Lim từ lâu đã trở thành biểu tượng văn hóa đặc sắc của vùng đất Kinh Bắc mỗi độ xuân về. Tâm điểm của lễ hội là các canh hát Quan họ cổ truyền được tổ chức tại lán trại trên đồi Lim, trong sân đình và đặc biệt là trên những chiếc thuyền rồng lững lờ trôi giữa hồ sen.',
      'Theo lệ cổ, các làng Quan họ kết chạ (anh hai, chị hai) giao lưu với nhau bằng sự trọng thị và lễ nghĩa sâu sắc: từ lời chào hỏi, miếng trầu têm cánh phượng cho đến những làn điệu Lề lối, Giọng vặt, Giã bạn ngân nga suốt ngày hội.',
      'Không gian Hội Lim còn tái hiện bức tranh sinh hoạt làng xã đồng bằng Bắc Bộ sống động với cờ hội ngũ sắc tung bay, tiếng trống chèo và các nghề thủ công truyền thống như dệt lụa, làm nón quai thao, khắc gỗ dân gian.',
    ],
    relatedGarmentId: 'ao-tu-than',
    relatedGarmentName: 'Không gian Văn hóa Quan họ Kinh Bắc',
    outfitConfig: {
      config_id: 'NEWS_CFG_TUTHAN_04',
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
    aiPromptSuggestion:
      'Giới thiệu chi tiết về phong tục trảy Hội Lim Bắc Ninh và văn hóa hát Quan họ trên thuyền rồng.',
  },
  {
    id: 'news-le-hoi-dem-hoang-cung-hue',
    heritage_id: 'HERITAGE_DAI_NOI_HUE',
    location_query: 'Đại Nội Huế, Thừa Thiên Huế',
    nearest_partner_shop_id: 'VENDOR_HOA_NIEN_HUE',
    category: 'su-kien',
    categoryLabel: 'Lễ hội truyền thống',
    title:
      'Lễ hội Đêm Hoàng Cung Huế: Nhã nhạc cung đình và ngàn ánh đèn lồng trước Ngọ Môn Quan',
    subtitle:
      'Tái hiện không gian lễ nhạc triều Nguyễn giữa lòng Đại Nội Huế với nghi thức Đổi gác, trình diễn Đại nhạc – Tiểu nhạc và nghệ thuật đèn lồng truyền thống.',
    publishedDate: '20 Tháng 09, 2026',
    locationOrSource: 'Đại Nội Huế · Thừa Thiên Huế',
    readTime: '4 phút đọc',
    imageUrl: HERITAGE_IMAGES.festivalCungDinhHue,
    hasStudioTryOn: false,
    festivalDetails: {
      lunarDate: 'Kỳ Festival Huế & Các đêm lễ hội Hoàng cung định kỳ',
      location: 'Quảng trường Ngọ Môn – Điện Thái Hòa – Thế Miếu, Đại Nội Huế',
      mainRituals:
        'Lễ Đổi gác cung đình, Trình diễn Nhã nhạc cung đình Huế, Múa Lục Cúng Hoa Đăng & Lễ rước đèn lồng',
      heritageStatus:
        'Nhã nhạc cung đình Huế — Kiệt tác Di sản Truyền khẩu và Phi vật thể UNESCO (2003)',
    },
    keyTakeaways: [
      'Không gian Ngọ Môn – lầu Ngũ Phụng rực sáng dưới hàng ngàn chiếc đèn lồng lụa thủ công truyền thống xứ Huế.',
      'Trình diễn Đại nhạc và Tiểu nhạc cung đình cùng các vũ khúc cổ như Lục Cúng Hoa Đăng, Bát Tiên Hiến Thọ, Lân Mẫu Xuất Lân Nhi.',
      'Tái hiện các hoạt động văn hóa cung đình xưa: thưởng trà ngự, trò chơi Đầu hồ và thư pháp Hán Nôm tại sân Điện Thái Hòa.',
    ],
    contentParagraphs: [
      'Đêm Hoàng Cung là điểm nhấn văn hóa đặc sắc nhất trong chuỗi lễ hội truyền thống tại Cố đô Huế, đưa công chúng ngược dòng thời gian trở về không gian lễ nghi và nghệ thuật đỉnh cao của triều đại nhà Nguyễn thế kỷ XIX.',
      'Khi màn đêm buông xuống trên Kinh thành, toàn bộ trục kiến trúc từ cổng Ngọ Môn, cầu Trung Đạo qua hồ Thái Dịch đến Điện Thái Hòa được thắp sáng bởi hàng ngàn chiếc đèn lồng lụa. Tiếng trống cái, kèn bóp và đàn tỳ bà của dàn Nhã nhạc vang lên trang trọng, mở màn cho lễ Đổi gác của đội cấm vệ quân và đoàn cung nữ cầm lồng đèn.',
      'Du khách tham dự lễ hội không chỉ được thưởng thức các kiệt tác âm nhạc cung đình mà còn được trực tiếp trải nghiệm văn hóa thưởng trà sen Tịnh Tâm, xem chế tác pháp lam và tìm hiểu ý nghĩa các đồ án Bát Bửu, Tứ Linh trên kiến trúc gỗ sơn son thếp vàng.',
    ],
    relatedGarmentId: 'ao-nhat-binh',
    relatedGarmentName: 'Di sản Lễ nhạc Cung đình Huế',
    outfitConfig: {
      config_id: 'NEWS_CFG_CUNGDINH_05',
      gender: 'nu',
      garmentId: 'ao-nhat-binh',
      paletteId: 'chu-sa-ngu-uyen',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'phuong-vu-bat-buu',
      accessoryIds: ['man-doi-dau', 'xuyen-bac'],
      footwearId: 'hai-theu',
      occasionId: 'le-nghi',
      weatherId: 'thu-ha-noi',
      outerHex: '#9A3412',
      innerHex: '#D97706',
      lowerHex: '#FAF8F5',
    },
    aiPromptSuggestion:
      'Giới thiệu các nghi thức văn hóa và kinh nghiệm tham quan Lễ hội Đêm Hoàng Cung tại Đại Nội Huế.',
  },
];

export const UPCOMING_HERITAGE_EVENTS: UpcomingHeritageEvent[] = [
  {
    id: 'evt-bach-hoa-thu-2026',
    heritage_id: 'HERITAGE_HOANG_THANH_HN',
    location_query: 'Hoàng Thành Thăng Long, Hà Nội',
    nearest_partner_shop_id: 'VENDOR_Y_VAN_HIEN_HN',
    lunarDate: '08 – 09 Tháng 9 Âm lịch',
    title: 'Ngày hội Cổ phục Bách Hoa Bộ Hành — Thu Hà Nội',
    dateLabel: '18 – 19 Tháng 10, 2026',
    location: 'Hoàng thành Thăng Long & Phố đi bộ Hồ Gươm, Hà Nội',
    dressCode: 'Áo Ngũ Thân Tay Chẽn / Áo Tấc / Áo Nhật Bình / Áo Tứ Thân',
    summary:
      'Diễu hành Việt phục qua các di tích lịch sử, giao lưu cùng các xưởng may cổ phục và workshop thắt khăn vấn, nhận diện điển chế trang phục.',
    outfitConfig: {
      config_id: 'EVT_CFG_NGUTHAN_01',
      gender: 'nu',
      garmentId: 'ao-ngu-than',
      paletteId: 'khue-van-tri-thuc',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'am-hoa-tron',
      accessoryIds: ['khan-xep', 'quat-tram-huong'],
      footwearId: 'guoc-go-moc',
      occasionId: 'le-nghi',
      weatherId: 'thu-ha-noi',
      outerHex: '#2E8B57',
      innerHex: '#FFFFF0',
      lowerHex: '#FAF8F5',
    },
    aiPromptSuggestion:
      'Tư vấn cho mình bộ Việt phục phù hợp tham gia Ngày hội Cổ phục Bách Hoa Bộ Hành tại Hoàng thành Thăng Long.',
  },
  {
    id: 'evt-tuan-le-co-phuc-hue-2026',
    heritage_id: 'HERITAGE_DAI_NOI_HUE',
    location_query: 'Đại Nội Huế, Thừa Thiên Huế',
    nearest_partner_shop_id: 'VENDOR_HOA_NIEN_HUE',
    lunarDate: '23 – 29 Tháng 9 Âm lịch',
    title: 'Tuần lễ Di sản Y phục Cung đình Huế & Đêm Hoàng Cung',
    dateLabel: '02 – 08 Tháng 11, 2026',
    location: 'Đại Nội Huế & Cung An Định, TP. Huế',
    dressCode: 'Áo Nhật Bình / Áo Ngũ Thân Lễ Phục + Hài thêu hoặc Guốc mộc',
    summary:
      'Triển lãm hiện vật Áo Nhật Bình, Áo Tấc triều Nguyễn kết hợp đêm trình diễn ánh sáng và trải nghiệm mặc thử cổ phục trong không gian Đại Nội.',
    outfitConfig: {
      config_id: 'EVT_CFG_NHATBINH_02',
      gender: 'nu',
      garmentId: 'ao-nhat-binh',
      paletteId: 'chu-sa-ngu-uyen',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'phuong-vu-bat-buu',
      accessoryIds: ['man-doi-dau', 'xuyen-bac'],
      footwearId: 'hai-theu',
      occasionId: 'cuoi-hoi',
      weatherId: 'thu-ha-noi',
      outerHex: '#9A3412',
      innerHex: '#D97706',
      lowerHex: '#FAF8F5',
    },
    aiPromptSuggestion:
      'Gợi ý bộ Áo Nhật Bình hoặc Áo Ngũ Thân lễ phục để tham dự Đêm Hoàng Cung tại Đại Nội Huế.',
  },
  {
    id: 'evt-trien-lam-lua-viet-saigon',
    heritage_id: 'HERITAGE_DINH_DOC_LAP_SG',
    location_query: 'Dinh Độc Lập, Quận 1, TP.HCM',
    nearest_partner_shop_id: 'VENDOR_LUA_PHUONG_NAM_SG',
    lunarDate: '12 – 16 Tháng 10 Âm lịch',
    title: 'Triển lãm "Sợi Tơ Nghìn Năm" — Lụa & Việt Phục Ứng Dụng',
    dateLabel: '21 – 25 Tháng 11, 2026',
    location: 'Bảo tàng Mỹ thuật TP.HCM',
    dressCode: 'Áo Dài Tân Thời / Áo Bà Ba lụa tơ tằm / Áo Ngũ Thân tối giản',
    summary:
      'Trưng bày 80 mẫu dệt Lĩnh, Sa, Xuyến, Đũi và Lãnh Mỹ A từ các làng nghề truyền thống cùng talkshow ứng dụng Việt phục cho giới trẻ.',
    outfitConfig: {
      config_id: 'EVT_CFG_BABA_03',
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
    aiPromptSuggestion:
      'Tư vấn bộ Áo Bà Ba hoặc Áo Dài Tân Thời thanh lịch để đi xem triển lãm Sợi Tơ Nghìn Năm tại Bảo tàng Mỹ thuật.',
  },
];

// ============================================================================
// MODULE: TRÌNH TẠO & CHIA SẺ LOOKBOOK VIỆT PHỤC (LOOKBOOK GENERATOR & DEEP LINK ENGINE)
// & TÍNH NĂNG SO SÁNH LOOKBOOK (LOOKBOOK COMPARISON ENGINE)
// ============================================================================

export interface DeepLinkPayload {
  base_outfit: 'NGU_THAN_NAM' | 'NGU_THAN_NU' | 'NHAT_BINH' | 'TU_THAN' | 'AO_DAI_BA_BA';
  colors: {
    outer_hex: string;
    inner_hex: string;
    lower_hex: string;
    accent_hex: string;
  };
  accessories: string[];
  context: string;
  creator_id: string;
}

export interface LookbookExportSchema {
  lookbook_id: string;
  title: string;
  creator_info: {
    user_id: string;
    username: string;
    avatar_url: string;
  };
  outfit_details: {
    type: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    accessories_list: string[];
  };
  palette_colors: {
    hex: string;
    name: string;
    role?: string;
  }[];
  cultural_note: string;
  context_recommended: string;
  sharing_links: {
    deep_link: string;
    web_preview_url: string;
    qr_code_url: string;
  };
  social_export_presets: {
    story_9_16_ratio: string;
    post_1_1_ratio: string;
    post_4_5_ratio?: string;
  };
  encoded_payload?: DeepLinkPayload;
  encoded_query_string?: string;
  location_query?: string;
  maps_integration_lite?: MapsIntegrationLite;
}

export interface LookbookComparisonCriteriaRow {
  criterion: string;
  outfit_a_value: string;
  outfit_b_value: string;
}

export interface GarmentPracticalMetrics {
  garmentTypeLabel: string;
  fabricAndCut: string;
  marketCost: string;
  rentalPriceRange: string;
  tailorPriceRange: string;
  bulkinessLevel: string;
  bulkinessAndComfort: string;
  prepAndCare: string;
}

export const GARMENT_PRACTICAL_METRICS: Record<string, GarmentPracticalMetrics> = {
  'ao-ngu-than': {
    garmentTypeLabel: 'Áo Ngũ Thân Tay Chẽn',
    fabricAndCut: 'Lụa nha xá / Tơ đũi dệt hoa chìm · Cổ đứng 5 khuy, 5 vạt nối sống trung phùng',
    marketCost: 'Thuê: 250.000–350.000đ/ngày · May đo: 1.800.000–3.200.000đ/bộ',
    rentalPriceRange: '250.000–350.000đ/ngày',
    tailorPriceRange: '1,8 – 3,2 triệu đ',
    bulkinessLevel: 'Thấp – Trung bình (~450g, 2 lớp)',
    bulkinessAndComfort:
      'Gọn gàng (2 lớp: áo trung đơn lót + áo ngoài ~450g). Tay chẽn ôm vừa cổ tay giúp cử động tay linh hoạt, dễ bước đi, ngồi lễ tốt nghiệp hoặc di chuyển ngoài trời cả ngày.',
    prepAndCare:
      'Mặc nhanh ~5 phút (cài 5 khuy + đội khăn đóng). Ít nhăn trên nền vải đũi tơ, dễ gấp gọn mang theo.',
  },
  'ao-nhat-binh': {
    garmentTypeLabel: 'Áo Nhật Bình Cung Đình',
    fabricAndCut: 'Sa / Gấm thêu kim tuyến Loan Phượng · Cổ chữ nhật to bản, tay rộng dải ngũ sắc',
    marketCost: 'Thuê: 380.000–650.000đ/ngày · May đo: 3.500.000–7.500.000đ/bộ',
    rentalPriceRange: '380.000–650.000đ/ngày',
    tailorPriceRange: '3,5 – 7,5 triệu đ',
    bulkinessLevel: 'Khá cao (~900g – 1,2kg, tay rộng + mấn)',
    bulkinessAndComfort:
      'Độ cồng kềnh khá cao (~900g–1,2kg do gấm thêu kim tuyến, tay áo rộng và mấn đội đầu). Tạo khí chất uy nghi lộng lẫy khi đứng chụp ảnh/lễ cưới, nhưng cần di chuyển khoan thai và hạn chế vận động mạnh.',
    prepAndCare:
      'Thời gian mặc ~15–20 phút (cố định mấn, dây buộc cổ áo, kiềng xuyến). Cần treo thẳng, tránh gấp nếp lên phần thêu kim tuyến.',
  },
  'ao-tu-than': {
    garmentTypeLabel: 'Áo Tứ Thân & Yếm Đào',
    fabricAndCut: 'Đũi tơ mộc nhẹ rủ · 4 vạt buông/buộc trước, phối yếm đào & váy đụp lụa đen',
    marketCost: 'Thuê: 180.000–280.000đ/ngày · May đo: 1.400.000–2.500.000đ/bộ',
    rentalPriceRange: '180.000–280.000đ/ngày',
    tailorPriceRange: '1,4 – 2,5 triệu đ',
    bulkinessLevel: 'Trung bình (Nhẹ ~500g nhưng vướng Nón ba tầm)',
    bulkinessAndComfort:
      'Thân áo nhẹ và thoáng mát (~500g), váy đụp rộng dễ bước đi trảy hội/múa hát; lưu ý phụ kiện Nón ba tầm (đường kính ~70–80cm) khá cồng kềnh khi đi xe hoặc chỗ đông người.',
    prepAndCare:
      'Thời gian mặc ~10–12 phút (buộc dây yếm, thắt đai lưng bao và vạt trước). Nón quai thao cần cầm tay hoặc treo riêng tránh móp vành.',
  },
  'ao-dai-ba-ba': {
    garmentTypeLabel: 'Áo Bà Ba / Áo Dài Tân Thời',
    fabricAndCut: 'Lụa tơ tằm / Đũi tự nhiên 1 lớp · Xẻ tà hai bên, phom gọn hiện đại',
    marketCost: 'Thuê: 150.000–220.000đ/ngày · May đo: 950.000–1.800.000đ/bộ',
    rentalPriceRange: '150.000–220.000đ/ngày',
    tailorPriceRange: '950 nghìn – 1,8 triệu đ',
    bulkinessLevel: 'Rất thấp (~280g, 1 lớp thoáng khí)',
    bulkinessAndComfort:
      'Siêu nhẹ (~280g, chỉ 1 lớp vải lụa/đũi thoáng khí), không vướng víu. Mang lại trải nghiệm mặc thoải mái nhất khi dạo phố, ngồi cafe, đi bộ đường dài hoặc thời tiết nắng ấm.',
    prepAndCare:
      'Mặc cực nhanh ~2–3 phút. Dễ giặt ủi, gấp gọn trong túi xách cá nhân mà không lo mất phom.',
  },
};

export interface LookbookComparisonResult {
  comparison_id: string;
  user_context: string;
  outfit_a: {
    id: string;
    title: string;
    garmentCategory: string;
    fabricAndCut: string;
    mainGarment: string;
    accessories: string[];
    style: string;
    palette: { name: string; hex: string; role: string }[];
    occasionAndWeather: string;
    cultureGuardStatus: string;
    cultureGuardNote: string;
    hasViolation: boolean;
    imageUrl: string;
  };
  outfit_b: {
    id: string;
    title: string;
    garmentCategory: string;
    fabricAndCut: string;
    mainGarment: string;
    accessories: string[];
    style: string;
    palette: { name: string; hex: string; role: string }[];
    occasionAndWeather: string;
    cultureGuardStatus: string;
    cultureGuardNote: string;
    hasViolation: boolean;
    imageUrl: string;
  };
  criteria_rows: LookbookComparisonCriteriaRow[];
  ai_short_advice: string;
  recommended_outfit_id: string;
}

export const POETIC_OUTFIT_TITLES: Record<string, string[]> = {
  'ao-ngu-than': [
    'Khuê Văn Tri Thức',
    'Thanh Phong Niên Hoa',
    'Bách Hoa Bộ Hành',
    'Thư Hương Cổ Vận',
    'Ngọc Lập Kinh Kỳ',
  ],
  'ao-nhat-binh': [
    'Chu Sa Ngự Uyển',
    'Phượng Vũ Nghê Thường',
    'Hoàng Kim Nội Điện',
    'Cẩm Tú Cung Đình',
    'Xinh Tươi Ngày Tết',
  ],
  'ao-tu-than': [
    'Kinh Bắc Đào Hoa',
    'Du Xuân Trảy Hội',
    'Liền Chị Quan Họ',
    'Nắng Ấm Sân Đinh',
    'Xinh Tươi Ngày Tết',
  ],
  'ao-dai-ba-ba': [
    'Phương Nam Bình Dị',
    'Nắng Sớm Sài Gòn',
    'Tơ Lụa Dạo Phố',
    'Thanh Lịch Học Đường',
    'Bách Hoa Bộ Hành',
  ],
};

export function mapGarmentToBaseOutfitCode(
  garmentId: string,
  gender: 'nam' | 'nu' = 'nu'
): DeepLinkPayload['base_outfit'] {
  if (garmentId === 'ao-nhat-binh') return 'NHAT_BINH';
  if (garmentId === 'ao-tu-than') return 'TU_THAN';
  if (garmentId === 'ao-dai-ba-ba') return 'AO_DAI_BA_BA';
  return gender === 'nam' ? 'NGU_THAN_NAM' : 'NGU_THAN_NU';
}

export function mapAccessoryIdToCode(accId: string): string {
  const map: Record<string, string> = {
    'khan-xep': 'KHAN_XEP',
    'non-quai-thao': 'NON_BA_TAM',
    'man-doi-dau': 'MAN_CUNG_DINH',
    'quat-tram-huong': 'QUAT_TRAM',
    'xuyen-bac': 'XUYEN_BAC',
    'dai-lung-bao': 'DAI_LUNG_BAO',
    'khan-ran-non-la': 'KHAN_RAN_NON_LA',
    'guoc-go-moc': 'GUOC_MOC',
    'hai-theu': 'HAI_THEU',
  };
  return map[accId] || accId.toUpperCase().replace(/-/g, '_');
}

export function mapOccasionIdToContextCode(occasionId: string): string {
  const map: Record<string, string> = {
    'tot-nghiep': 'TOT_NGHIEP',
    'cuoi-hoi': 'LE_CUOI',
    'le-hoi-dan-gian': 'DI_CHUA',
    'le-nghi': 'LE_NGHI_TET',
    'dao-pho': 'DAO_PHO',
  };
  return map[occasionId] || 'TOT_NGHIEP';
}

export function buildLookbookExportFromSelection(
  selection: StudioSelection,
  customPrimaryHex?: string | null,
  customTitle?: string,
  locationQuery?: string
): LookbookExportSchema {
  const garment = getGenderAwareGarmentInfo(selection.garmentId, selection.gender);
  const palette =
    LOOKBOOK_PALETTES.find((p) => p.id === selection.paletteId) || LOOKBOOK_PALETTES[0];
  const lower =
    LOWER_GARMENT_OPTIONS.find((l) => l.id === selection.lowerGarmentId) ||
    LOWER_GARMENT_OPTIONS[0];
  const footwear =
    FOOTWEAR_OPTIONS.find((f) => f.id === selection.footwearId) || FOOTWEAR_OPTIONS[0];
  const occasion =
    OCCASION_OPTIONS.find((o) => o.id === selection.occasionId) || OCCASION_OPTIONS[0];
  const weather =
    WEATHER_OPTIONS.find((w) => w.id === selection.weatherId) || WEATHER_OPTIONS[0];

  const primaryHex = (customPrimaryHex || palette.swatches[0]?.hex || '#2E8B57').toUpperCase();
  const secondaryHex = (palette.swatches[1]?.hex || '#FFFFF0').toUpperCase();
  const accentHex = (palette.swatches[2]?.hex || '#8B4513').toUpperCase();

  const titlesForGarment = POETIC_OUTFIT_TITLES[garment.id] || POETIC_OUTFIT_TITLES['ao-ngu-than'];
  const defaultTitle =
    customTitle ||
    `${palette.name.split(' (')[0]} — ${garment.name.split(' (')[0]}`;

  const accessoryNames = selection.accessoryIds
    .map((id) => ACCESSORY_OPTIONS.find((a) => a.id === id)?.label.split(' (')[0])
    .filter(Boolean) as string[];
  const fullAccessories = [...accessoryNames, footwear.label.split(' (')[0]];

  const shortHash = Math.abs(
    `${selection.gender}-${garment.id}-${primaryHex}-${selection.occasionId}`
      .split('')
      .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 7)
  )
    .toString(36)
    .toUpperCase()
    .slice(0, 6);

  const lookbookId = `VP_${shortHash}`;

  const encodedPayload: DeepLinkPayload = {
    base_outfit: mapGarmentToBaseOutfitCode(garment.id, selection.gender),
    colors: {
      outer_hex: primaryHex,
      inner_hex: secondaryHex,
      lower_hex: lower.id.includes('den') ? '#1C1917' : secondaryHex,
      accent_hex: accentHex,
    },
    accessories: [
      ...selection.accessoryIds.map(mapAccessoryIdToCode),
      mapAccessoryIdToCode(footwear.id),
    ],
    context: mapOccasionIdToContextCode(selection.occasionId),
    creator_id: 'CREATOR_VP_STUDIO',
  };

  const compactQuery = encodeURIComponent(JSON.stringify(encodedPayload));

  return {
    lookbook_id: lookbookId,
    title: defaultTitle || titlesForGarment[0],
    creator_info: {
      user_id: 'CREATOR_VP_STUDIO',
      username: selection.gender === 'nam' ? '@thanh.vietphuc' : '@tham.vietphuc',
      avatar_url: get2DModelImageForSelection(selection.gender, garment.id, 'studio').studioUrl,
    },
    outfit_details: {
      type: `${garment.name} (${selection.gender === 'nam' ? 'Nam giới' : 'Nữ giới'}) · ${
        lower.label.split(' (')[0]
      }`,
      primary_color: primaryHex,
      secondary_color: secondaryHex,
      accent_color: accentHex,
      accessories_list: fullAccessories,
    },
    palette_colors: [
      {
        hex: primaryHex,
        name: customPrimaryHex ? 'Sắc Lụa Tùy Chỉnh' : palette.swatches[0]?.name || 'Xanh Ngọc Lam',
        role: 'Vạt áo ngoài',
      },
      {
        hex: secondaryHex,
        name: palette.swatches[1]?.name || 'Trắng Ngà',
        role: 'Áo lót / Yếm & Quần',
      },
      {
        hex: accentHex,
        name: palette.swatches[2]?.name || 'Gỗ Mộc',
        role: 'Phụ kiện & Hài/Guốc',
      },
    ],
    cultural_note: `${garment.origin} ${garment.meaning}`,
    context_recommended: `${occasion.label} · ${weather.label}`,
    sharing_links: {
      deep_link: `https://vietphuclookbook.app/look/${lookbookId}?p=${compactQuery}`,
      web_preview_url: `https://vietphuclookbook.app/preview/${lookbookId}?p=${compactQuery}`,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        `https://vietphuclookbook.app/look/${lookbookId}`
      )}`,
    },
    social_export_presets: {
      story_9_16_ratio: '1080x1920px · Story / Reels / TikTok (Full-body + Palette + QR)',
      post_1_1_ratio: '1080x1080px · Instagram / Facebook Square Feed',
      post_4_5_ratio: '1080x1350px · Instagram Portrait Lookbook',
    },
    encoded_payload: encodedPayload,
    encoded_query_string: compactQuery,
    location_query: locationQuery || 'Văn Miếu - Quốc Tử Giám, Hà Nội',
    maps_integration_lite: buildGoogleMapsLiteUrls(
      locationQuery || 'Văn Miếu - Quốc Tử Giám, Hà Nội'
    ),
  };
}

export function decodeDeepLinkPayloadToSelection(
  payload: DeepLinkPayload,
  currentSelection: StudioSelection
): StudioSelection {
  const gender: 'nam' | 'nu' = payload.base_outfit === 'NGU_THAN_NAM' ? 'nam' : 'nu';
  const garmentId =
    payload.base_outfit === 'NHAT_BINH'
      ? 'ao-nhat-binh'
      : payload.base_outfit === 'TU_THAN'
      ? 'ao-tu-than'
      : payload.base_outfit === 'AO_DAI_BA_BA'
      ? 'ao-dai-ba-ba'
      : 'ao-ngu-than';

  const matchedPalette =
    LOOKBOOK_PALETTES.find(
      (p) => p.swatches[0]?.hex.toLowerCase() === payload.colors.outer_hex.toLowerCase()
    ) || LOOKBOOK_PALETTES[0];

  const revAccMap: Record<string, string> = {
    KHAN_XEP: 'khan-xep',
    NON_BA_TAM: 'non-quai-thao',
    MAN_CUNG_DINH: 'man-doi-dau',
    QUAT_TRAM: 'quat-tram-huong',
    XUYEN_BAC: 'xuyen-bac',
    DAI_LUNG_BAO: 'dai-lung-bao',
    KHAN_RAN_NON_LA: 'khan-ran-non-la',
  };

  const decodedAccs = (payload.accessories || [])
    .map((code) => revAccMap[code])
    .filter(Boolean);

  const footwearId = (payload.accessories || []).includes('HAI_THEU')
    ? 'hai-theu'
    : 'guoc-go-moc';

  const occasionId =
    payload.context === 'LE_CUOI'
      ? 'cuoi-hoi'
      : payload.context === 'DI_CHUA'
      ? 'le-hoi-dan-gian'
      : payload.context === 'DAO_PHO'
      ? 'dao-pho'
      : 'tot-nghiep';

  return {
    ...currentSelection,
    gender,
    garmentId,
    paletteId: matchedPalette.id,
    lowerGarmentId:
      gender === 'nam'
        ? garmentId === 'ao-dai-ba-ba'
          ? 'quan-lua-den'
          : 'quan-lua-trang'
        : garmentId === 'ao-tu-than'
        ? 'vay-dup-den'
        : 'quan-lua-trang',
    accessoryIds: decodedAccs.length > 0 ? decodedAccs : ['khan-xep', 'quat-tram-huong'],
    footwearId,
    occasionId,
  };
}

export function compareTwoLookbooksLocal(
  cardA: LookbookCardData,
  cardB: LookbookCardData,
  userContext = 'Lễ tốt nghiệp & Chụp ảnh di tích'
): LookbookComparisonResult {
  const gIdA = cardA.garmentId || 'ao-ngu-than';
  const gIdB = cardB.garmentId || 'ao-ngu-than';

  const metricsA = GARMENT_PRACTICAL_METRICS[gIdA] || GARMENT_PRACTICAL_METRICS['ao-ngu-than'];
  const metricsB = GARMENT_PRACTICAL_METRICS[gIdB] || GARMENT_PRACTICAL_METRICS['ao-ngu-than'];

  const thumbA =
    cardA.imageUrl ||
    (gIdA === 'ao-nhat-binh'
      ? HERITAGE_IMAGES.model2DNuNhatBinh
      : gIdA === 'ao-tu-than'
      ? HERITAGE_IMAGES.model2DNuTuThan
      : gIdA === 'ao-dai-ba-ba'
      ? HERITAGE_IMAGES.model2DNuBaBa
      : HERITAGE_IMAGES.model2DNuNguThan);

  const thumbB =
    cardB.imageUrl ||
    (gIdB === 'ao-nhat-binh'
      ? HERITAGE_IMAGES.model2DNuNhatBinh
      : gIdB === 'ao-tu-than'
      ? HERITAGE_IMAGES.model2DNuTuThan
      : gIdB === 'ao-dai-ba-ba'
      ? HERITAGE_IMAGES.model2DNuBaBa
      : HERITAGE_IMAGES.model2DNuNguThan);

  const styleA = cardA.styleTag || metricsA.garmentTypeLabel;
  const styleB = cardB.styleTag || metricsB.garmentTypeLabel;

  const guardStatusA = cardA.hasViolation
    ? 'Cảnh báo lệch chuẩn cổ lệ'
    : 'Đạt chuẩn điển chế (Approved)';
  const guardStatusB = cardB.hasViolation
    ? 'Cảnh báo lệch chuẩn cổ lệ'
    : 'Đạt chuẩn điển chế (Approved)';

  const lowerContext = userContext.toLowerCase();
  let recommendedId = cardA.id;
  let advice = '';

  if (cardA.hasViolation && !cardB.hasViolation) {
    recommendedId = cardB.id;
    advice = `Ưu tiên "${cardB.outfitName}" vì đạt chuẩn điển chế văn hóa, chi phí hợp lý (${metricsB.rentalPriceRange}) và tránh được lỗi phối phụ kiện của "${cardA.outfitName}".`;
  } else if (cardB.hasViolation && !cardA.hasViolation) {
    recommendedId = cardA.id;
    advice = `Ưu tiên "${cardA.outfitName}" vì tuân thủ chuẩn mực văn hóa cho dịp ${userContext}, đồng thời tối ưu trải nghiệm mặc (${metricsA.bulkinessLevel}).`;
  } else if (lowerContext.includes('cưới') || lowerContext.includes('hoàng cung')) {
    recommendedId = gIdA === 'ao-nhat-binh' ? cardA.id : cardB.id;
    const chosen = recommendedId === cardA.id ? cardA : cardB;
    const chosenMetrics = recommendedId === cardA.id ? metricsA : metricsB;
    advice = `Với "${userContext}", "${chosen.outfitName}" nổi bật về tính lễ nghi cung đình. Dù độ cồng kềnh (${chosenMetrics.bulkinessLevel}) và chi phí (${chosenMetrics.rentalPriceRange}) cao hơn, hiệu ứng thị giác khi lên hình lễ cưới/cố đô vượt trội.`;
  } else if (lowerContext.includes('dạo phố') || lowerContext.includes('ngoại cảnh')) {
    recommendedId =
      gIdA === 'ao-dai-ba-ba' || gIdA === 'ao-ngu-than' ? cardA.id : cardB.id;
    const chosen = recommendedId === cardA.id ? cardA : cardB;
    const chosenMetrics = recommendedId === cardA.id ? metricsA : metricsB;
    advice = `Với "${userContext}", "${chosen.outfitName}" tối ưu hơn về trải nghiệm mặc (${chosenMetrics.bulkinessLevel}), dễ di chuyển cả ngày và tiết kiệm chi phí thị trường (${chosenMetrics.rentalPriceRange}).`;
  } else {
    recommendedId = cardA.id;
    advice = `Với nhu cầu "${userContext}", "${cardA.outfitName}" cân bằng tốt nhất giữa chuẩn mực văn hóa, chi phí thị trường (${metricsA.rentalPriceRange}) và độ gọn nhẹ khi mặc thực tế (${metricsA.bulkinessLevel}).`;
  }

  return {
    comparison_id: `CMP_${Date.now().toString(36).toUpperCase()}`,
    user_context: userContext,
    outfit_a: {
      id: cardA.id,
      title: cardA.outfitName,
      garmentCategory: metricsA.garmentTypeLabel,
      fabricAndCut: metricsA.fabricAndCut,
      mainGarment: cardA.mainGarment,
      accessories: cardA.accessories,
      style: styleA,
      palette: cardA.palette,
      occasionAndWeather: cardA.occasionAndWeather,
      cultureGuardStatus: guardStatusA,
      cultureGuardNote: cardA.cultureGuardNote,
      hasViolation: Boolean(cardA.hasViolation),
      imageUrl: thumbA,
    },
    outfit_b: {
      id: cardB.id,
      title: cardB.outfitName,
      garmentCategory: metricsB.garmentTypeLabel,
      fabricAndCut: metricsB.fabricAndCut,
      mainGarment: cardB.mainGarment,
      accessories: cardB.accessories,
      style: styleB,
      palette: cardB.palette,
      occasionAndWeather: cardB.occasionAndWeather,
      cultureGuardStatus: guardStatusB,
      cultureGuardNote: cardB.cultureGuardNote,
      hasViolation: Boolean(cardB.hasViolation),
      imageUrl: thumbB,
    },
    criteria_rows: [
      {
        criterion: 'Phù hợp văn hóa & Điển chế',
        outfit_a_value: `${guardStatusA} — ${cardA.cultureGuardNote}`,
        outfit_b_value: `${guardStatusB} — ${cardB.cultureGuardNote}`,
      },
      {
        criterion: 'Chi phí thị trường (Thuê & May)',
        outfit_a_value: metricsA.marketCost,
        outfit_b_value: metricsB.marketCost,
      },
      {
        criterion: 'Độ cồng kềnh & Trải nghiệm mặc',
        outfit_a_value: metricsA.bulkinessAndComfort,
        outfit_b_value: metricsB.bulkinessAndComfort,
      },
      {
        criterion: 'Tính ứng dụng & Bối cảnh thực tế',
        outfit_a_value: cardA.occasionAndWeather,
        outfit_b_value: cardB.occasionAndWeather,
      },
      {
        criterion: 'Thời gian chuẩn bị & Bảo quản',
        outfit_a_value: metricsA.prepAndCare,
        outfit_b_value: metricsB.prepAndCare,
      },
    ],
    ai_short_advice: advice,
    recommended_outfit_id: recommendedId,
  };
}

// ============================================================================
// MODULE: BẢN ĐỒ DI TÍCH & HỘ CHIẾU CỔ PHỤC TÍCH HỢP GOOGLE MAPS LITE
// (Zero-API Key Google Maps Integration & Cultural Passport Engine)
// ============================================================================

export type HeritageRegionCode = 'MIEN_BAC' | 'MIEN_TRUNG' | 'MIEN_NAM';
export type PrimaryOutfitCode = 'NGU_THAN' | 'NHAT_BINH' | 'TU_THAN' | 'AO_DAI' | 'BA_BA';
export type StampCultureGuardStatus = 'APPROVED' | 'WARNING' | 'REJECTED';

export interface MapsIntegrationLite {
  location_query: string;
  embed_iframe_url: string;
  direct_google_maps_url: string;
  directions_url: string;
}

export interface HeritageSiteInfo {
  site_name: string;
  region: HeritageRegionCode;
  historical_summary: string;
  etiquette_rules: string;
}

export interface DresscodeRecommendations {
  primary_outfit: PrimaryOutfitCode;
  recommended_colors: string[];
  accessories_suggested: string[];
  config_code_3d: string;
}

export interface StampUnlockResult {
  is_unlocked: boolean;
  stamp_id: string;
  stamp_name: string;
  points_awarded: number;
  badge_earned: string | null;
  culture_guard_status: StampCultureGuardStatus;
  message: string;
}

/**
 * Satellite Partner Shop Schema (Ghim Tiệm Đối Tác Vệ Tinh quanh Di tích)
 */
export interface SatellitePartnerShopSchema {
  shop_id: string;
  shop_name: string;
  pin_type: 'SATELLITE_PARTNER_PIN';
  distance_from_heritage: string;
  rental_price_from: string;
  action_links: {
    magic_refit_shop_outfit: string;
    directions_from_site_url: string;
    send_3d_measurements_url: string;
  };
}

export interface SatellitePartnerShopRecord extends SatellitePartnerShopSchema {
  distance_meters: number;
  shop_address: string;
  specialty_outfit: string;
  pin_color: 'emerald' | 'amber';
  pin_coords: { top: string; left: string };
  outfitConfig: OutfitConfigCode;
  image_url: string;
  rating: number;
}

/**
 * Exact Required JSON Output Schema for Hierarchical Map & Marketplace Lite (Section IV)
 */
export interface HierarchicalMapOutputSchema {
  maps_integration_lite: MapsIntegrationLite;
  hero_heritage_site: {
    site_name: string;
    region: HeritageRegionCode;
    pin_type: 'HERO_RED_GOLD_PIN';
    historical_summary: string;
    etiquette_rules: string;
    dresscode_recommendations: {
      primary_outfit: PrimaryOutfitCode;
      recommended_colors: string[];
      config_code_3d: string;
    };
  };
  satellite_partner_shops: SatellitePartnerShopSchema[];
  stamp_unlock_result: {
    is_unlocked: boolean;
    stamp_id: string;
    stamp_name: string;
    points_awarded: number;
  };
}

export interface NoApiMapsSiteOutputSchema extends HierarchicalMapOutputSchema {
  site_info: HeritageSiteInfo;
  dresscode_recommendations: DresscodeRecommendations;
  stamp_unlock_result: StampUnlockResult;
}

export interface HeritageSiteRecord {
  id: string;
  heritage_id: string;
  site_name: string;
  location_query: string;
  region: HeritageRegionCode;
  regionLabel: string;
  isSacredSite: boolean;
  historical_summary: string;
  etiquette_rules: string;
  primary_outfit: PrimaryOutfitCode;
  dresscodeLabel: string;
  accessoriesLabel: string;
  recommended_colors: string[];
  accessories_suggested: string[];
  stamp_id: string;
  stamp_name: string;
  points_awarded: number;
  badge_earned: string;
  imageUrl: string;
  outfitConfig: OutfitConfigCode;
}

export interface UnlockedStampEntry {
  site_id: string;
  stamp_id: string;
  stamp_name: string;
  location_query: string;
  site_name: string;
  outfit_worn: string;
  points_awarded: number;
  badge_earned: string;
  unlocked_at: string;
  photo_url?: string;
  verification_status?: 'VERIFIED_GPS_ONLINE' | 'PENDING_OFFLINE_VERIFICATION';
  status?: 'VERIFIED' | 'PENDING_OFFLINE_VERIFICATION';
  offline_timestamp?: string;
}

/**
 * 1. & 2. & 3. Zero-API Key Google Maps Lite URL Generator
 * Generates Embed Iframe URL, Direct Search Deep Link, and Directions Deep Link
 */
export function buildGoogleMapsLiteUrls(locationQuery: string): MapsIntegrationLite {
  const cleanQuery = (locationQuery || 'Văn Miếu - Quốc Tử Giám, Hà Nội').trim();
  const encoded = encodeURIComponent(cleanQuery);
  return {
    location_query: cleanQuery,
    embed_iframe_url: `https://maps.google.com/maps?q=${encoded}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
    direct_google_maps_url: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    directions_url: `https://www.google.com/maps/dir/?api=1&destination=${encoded}`,
  };
}

export const HERITAGE_MAP_SITES: HeritageSiteRecord[] = [
  {
    id: 'site-van-mieu',
    heritage_id: 'HERITAGE_VAN_MIEU_HN',
    site_name: 'Văn Miếu - Quốc Tử Giám',
    location_query: 'Văn Miếu - Quốc Tử Giám, Hà Nội',
    region: 'MIEN_BAC',
    regionLabel: 'Miền Bắc · Hà Nội',
    isSacredSite: true,
    historical_summary:
      'Trường đại học đầu tiên của Việt Nam được khởi dựng từ năm 1070 thời vua Lý Thánh Tông. Quần thể Khuê Văn Các và vườn bia Tiến sĩ là biểu tượng thiêng liêng của truyền thống hiếu học và đạo lý Tôn sư trọng đạo.',
    etiquette_rules:
      'Không gian thờ Tiên thánh & Nho học trang nghiêm: Ưu tiên Áo Ngũ Thân cổ đứng (lập lĩnh) cài đủ 5 khuy kín đáo, đi nhẹ nói khẽ, tuyệt đối không mặc trang phục hở lưng, xẻ tà quá cao hoặc thiếu áo ngoài.',
    primary_outfit: 'NGU_THAN',
    dresscodeLabel: 'Áo Ngũ Thân Lập Lĩnh (Tay Chẽn / Tay Thụt)',
    accessoriesLabel: 'Khăn xếp, guốc mộc, quạt trầm, nón ba tầm',
    recommended_colors: ['#2E8B57 - Xanh Ngọc Lam', '#FFFFF0 - Trắng Ngà', '#8B4513 - Gỗ Mộc'],
    accessories_suggested: ['KHAN_XEP', 'GUOC_MOC', 'QUAT_TRAM', 'NON_BA_TAM'],
    stamp_id: 'STAMP_KHUE_VAN_01',
    stamp_name: 'Ấn Chương Khuê Văn Các',
    points_awarded: 200,
    badge_earned: 'Khuê Văn Tri Thức',
    imageUrl: HERITAGE_IMAGES.aoNguThan,
    outfitConfig: {
      config_id: 'MAP_CFG_VANMIEU_01',
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
  {
    id: 'site-hoang-thanh',
    heritage_id: 'HERITAGE_HOANG_THANH_HN',
    site_name: 'Hoàng thành Thăng Long',
    location_query: 'Hoàng thành Thăng Long, Hà Nội',
    region: 'MIEN_BAC',
    regionLabel: 'Miền Bắc · Hà Nội',
    isSacredSite: true,
    historical_summary:
      'Di sản văn hóa thế giới gắn liền với lịch sử kinh đô Thăng Long suốt hơn 10 thế kỷ từ thời Lý - Trần - Lê đến Nguyễn. Trục Đoan Môn và nền Điện Kính Thiên mang vẻ đẹp trầm mặc, uy nghi của bậc đế đô.',
    etiquette_rules:
      'Khu vực Điện Kính Thiên có tính lễ仪 cao: Nên mặc Việt phục cổ đứng chỉnh tề (Áo Ngũ Thân hoặc Áo Tấc), giữ gìn vệ sinh và không leo trèo lên thềm rồng đá cổ.',
    primary_outfit: 'NGU_THAN',
    dresscodeLabel: 'Áo Ngũ Thân Lập Lĩnh (Tay Chẽn / Tay Thụt)',
    accessoriesLabel: 'Khăn xếp, quạt trầm hương, guốc gỗ mộc',
    recommended_colors: ['#1E3A8A - Lam Cổ Điển', '#F5F5DC - Ngà Lụa', '#4D7C0F - Thanh Trúc'],
    accessories_suggested: ['KHAN_XEP', 'QUAT_TRAM', 'GUOC_MOC'],
    stamp_id: 'STAMP_DOAN_MON_02',
    stamp_name: 'Ấn Tín Đoan Môn Thăng Long',
    points_awarded: 200,
    badge_earned: 'Ngọc Lập Kinh Kỳ',
    imageUrl: HERITAGE_IMAGES.realMaleStudio,
    outfitConfig: {
      config_id: 'MAP_CFG_HOANGTHANH_02',
      gender: 'nam',
      garmentId: 'ao-ngu-than',
      paletteId: 'thanh-phong-nien-hoa',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'tu-quy-lien-hoa',
      accessoryIds: ['khan-xep', 'quat-tram-huong'],
      footwearId: 'guoc-go-moc',
      occasionId: 'le-nghi',
      weatherId: 'thu-ha-noi',
      outerHex: '#1E3A8A',
      innerHex: '#F5F5DC',
      lowerHex: '#F5F5DC',
    },
  },
  {
    id: 'site-duong-lam',
    heritage_id: 'HERITAGE_DUONG_LAM_HN',
    site_name: 'Làng cổ Đường Lâm',
    location_query: 'Làng cổ Đường Lâm, Sơn Tây, Hà Nội',
    region: 'MIEN_BAC',
    regionLabel: 'Miền Bắc · Xứ Đoài',
    isSacredSite: false,
    historical_summary:
      'Ngôi làng cổ đầu tiên ở Việt Nam được trao bằng Di tích lịch sử văn hóa quốc gia với tường đá ong vàng óng, cổng làng Mông Phụ, cây đa, bến nước và đình làng Bắc Bộ nguyên bản.',
    etiquette_rules:
      'Khi vào Đình Mông Phụ hoặc Chùa Mía trong làng cần buông vạt áo kín đáo, bỏ nón khi vào gian thờ chính và tôn trọng sinh hoạt của người dân địa phương.',
    primary_outfit: 'TU_THAN',
    dresscodeLabel: 'Áo Tứ Thân & Yếm Đào, Áo Ngũ Thân',
    accessoriesLabel: 'Nón ba tầm, dải lưng bao, guốc mộc, quạt trầm',
    recommended_colors: ['#78350F - Nâu Quế Trầm', '#B91C1C - Đỏ Yếm Đào', '#1C1917 - Đen Huyền'],
    accessories_suggested: ['NON_BA_TAM', 'DAI_LUNG_BAO', 'GUOC_MOC'],
    stamp_id: 'STAMP_DUONG_LAM_03',
    stamp_name: 'Con Dấu Cổng Làng Mông Phụ',
    points_awarded: 180,
    badge_earned: 'Kinh Bắc Đào Hoa',
    imageUrl: HERITAGE_IMAGES.aoTuThan,
    outfitConfig: {
      config_id: 'MAP_CFG_DUONGLAM_03',
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
  {
    id: 'site-chua-thay',
    heritage_id: 'HERITAGE_CHUA_THAY_HN',
    site_name: 'Chùa Thầy (Thiên Phúc Tự)',
    location_query: 'Chùa Thầy, Quốc Oai, Hà Nội',
    region: 'MIEN_BAC',
    regionLabel: 'Miền Bắc · Xứ Đoài',
    isSacredSite: true,
    historical_summary:
      'Danh lam cổ tự dưới chân núi Sài Sơn gắn với Thiền sư Từ Đạo Hạnh và nghệ thuật múa rối nước truyền thống tại Thủy Đình giữa hồ Long Chiểu.',
    etiquette_rules:
      'Nơi cửa Phật thanh tịnh: BẮT BUỘC mặc trang phục kín cổ (Áo Ngũ Thân lập lĩnh hoặc Áo Tứ Thân khoác kín bên ngoài yếm), tuyệt đối KHÔNG mặc nguyên áo yếm hở lưng vào chánh điện.',
    primary_outfit: 'NGU_THAN',
    dresscodeLabel: 'Áo Ngũ Thân Lập Lĩnh / Áo Tứ Thân khoác ngoài kín đáo',
    accessoriesLabel: 'Khăn xếp, guốc mộc, quạt trầm, nón ba tầm',
    recommended_colors: ['#2E8B57 - Xanh Ngọc Lam', '#78350F - Nâu Trầm', '#FFFFF0 - Trắng Ngà'],
    accessories_suggested: ['KHAN_XEP', 'GUOC_MOC', 'QUAT_TRAM'],
    stamp_id: 'STAMP_CHUA_THAY_04',
    stamp_name: 'Ấn Liên Hoa Thủy Đình',
    points_awarded: 200,
    badge_earned: 'Thanh Tịnh Cổ Tự',
    imageUrl: HERITAGE_IMAGES.model2DNuNguThan,
    outfitConfig: {
      config_id: 'MAP_CFG_CHUATHAY_04',
      gender: 'nu',
      garmentId: 'ao-ngu-than',
      paletteId: 'khue-van-tri-thuc',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'tu-quy-lien-hoa',
      accessoryIds: ['khan-xep', 'quat-tram-huong'],
      footwearId: 'guoc-go-moc',
      occasionId: 'le-hoi-dan-gian',
      weatherId: 'xuan-am-ap',
      outerHex: '#2E8B57',
      innerHex: '#FFFFF0',
      lowerHex: '#FFFFF0',
    },
  },
  {
    id: 'site-dai-noi-hue',
    heritage_id: 'HERITAGE_DAI_NOI_HUE',
    site_name: 'Đại Nội Huế (Hoàng Thành Huế)',
    location_query: 'Đại Nội Huế, Thừa Thiên Huế',
    region: 'MIEN_TRUNG',
    regionLabel: 'Miền Trung & Huế',
    isSacredSite: true,
    historical_summary:
      'Trung tâm hành chính và lễ nghi tối cao của triều đại nhà Nguyễn (1802–1945) với Ngọ Môn, Điện Thái Hòa, Thế Tổ Miếu và hệ thống trường lang son thếp vàng tráng lệ.',
    etiquette_rules:
      'Quy định trang phục tham quan Hoàng cung & Thế Miếu: Trang phục lịch sự, cổ kín đáo; khi mặc Áo Nhật Bình hoặc Áo Ngũ Thân cần phối cùng quần lụa dài chuẩn điển chế, không phối váy ngắn trên gối.',
    primary_outfit: 'NHAT_BINH',
    dresscodeLabel: 'Áo Nhật Bình (cho nữ), Áo Ngũ Thân tay thụt/tay chẽn',
    accessoriesLabel: 'Mấn thêu hoa văn, xuyến bạc, quạt vả, guốc gỗ / hài thêu',
    recommended_colors: ['#9A3412 - Đỏ Chu Sa', '#D97706 - Hoàng Kim', '#FAF8F5 - Bạch Ngọc'],
    accessories_suggested: ['MAN_CUNG_DINH', 'XUYEN_BAC', 'HAI_THEU', 'QUAT_TRAM'],
    stamp_id: 'STAMP_NGO_MON_05',
    stamp_name: 'Kim Ấn Ngọ Môn Quan',
    points_awarded: 250,
    badge_earned: 'Cung Đình Hoài Cổ',
    imageUrl: HERITAGE_IMAGES.aoNhatBinh,
    outfitConfig: {
      config_id: 'MAP_CFG_DAINOI_05',
      gender: 'nu',
      garmentId: 'ao-nhat-binh',
      paletteId: 'chu-sa-ngu-uyen',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'phuong-vu-bat-buu',
      accessoryIds: ['man-doi-dau', 'xuyen-bac'],
      footwearId: 'hai-theu',
      occasionId: 'cuoi-hoi',
      weatherId: 'thu-ha-noi',
      outerHex: '#9A3412',
      innerHex: '#D97706',
      lowerHex: '#FAF8F5',
    },
  },
  {
    id: 'site-lang-tu-duc',
    heritage_id: 'HERITAGE_LANG_TU_DUC_HUE',
    site_name: 'Lăng Tự Đức (Khiêm Lăng)',
    location_query: 'Lăng Tự Đức, Thành phố Huế',
    region: 'MIEN_TRUNG',
    regionLabel: 'Miền Trung & Huế',
    isSacredSite: true,
    historical_summary:
      'Quần thể kiến trúc sơn thủy hữu tình bậc nhất cố đô Huế với hồ Lưu Khiêm, Xung Khiêm Tạ và Dụ Khiêm Tạ mang đậm hồn thơ và triết lý Nho nhã thời vua Tự Đức.',
    etiquette_rules:
      'Khu vực lăng tẩm và điện thờ Hòa Khiêm: Ưu tiên Việt phục màu sắc nhã nhặn hoặc cổ điển (Lam, Ngọc, Chu Sa trầm), giữ trật tự và trang nghiêm tại khu vực tẩm điện.',
    primary_outfit: 'NGU_THAN',
    dresscodeLabel: 'Áo Ngũ Thân tay thụt/tay chẽn, Áo Nhật Bình',
    accessoriesLabel: 'Mấn thêu hoa văn, khăn xếp, quạt vả, guốc gỗ',
    recommended_colors: ['#1E3A8A - Lam Cổ Điển', '#9A3412 - Đỏ Chu Sa', '#F5F5DC - Ngà Lụa'],
    accessories_suggested: ['KHAN_XEP', 'MAN_CUNG_DINH', 'QUAT_TRAM', 'GUOC_MOC'],
    stamp_id: 'STAMP_KHIEM_LANG_06',
    stamp_name: 'Ấn Chương Xung Khiêm Tạ',
    points_awarded: 200,
    badge_earned: 'Thư Hương Cố Đô',
    imageUrl: HERITAGE_IMAGES.model2DNuNhatBinh,
    outfitConfig: {
      config_id: 'MAP_CFG_LANGTUDUC_06',
      gender: 'nu',
      garmentId: 'ao-nhat-binh',
      paletteId: 'chu-sa-ngu-uyen',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'phuong-vu-bat-buu',
      accessoryIds: ['man-doi-dau', 'xuyen-bac'],
      footwearId: 'guoc-go-moc',
      occasionId: 'le-nghi',
      weatherId: 'thu-ha-noi',
      outerHex: '#9A3412',
      innerHex: '#D97706',
      lowerHex: '#FAF8F5',
    },
  },
  {
    id: 'site-hoi-an',
    heritage_id: 'HERITAGE_HOI_AN_QN',
    site_name: 'Phố cổ Hội An & Chùa Cầu',
    location_query: 'Phố cổ Hội An, Quảng Nam',
    region: 'MIEN_TRUNG',
    regionLabel: 'Miền Trung · Quảng Nam',
    isSacredSite: false,
    historical_summary:
      'Thương cảng quốc tế sầm uất thế kỷ XVII–XVIII tại Đàng Trong — nơi giao thoa văn hóa Đông - Tây và là cái nôi hình thành sắc lệnh cải cách trang phục năm 1744 thời Võ Vương Nguyễn Phúc Khoát.',
    etiquette_rules:
      'Phù hợp dạo phố di sản và chụp ảnh bên sông Hoài; khi ghé thăm Chùa Cầu hoặc các Hội quán cổ cần giữ trang phục lịch sự, kín đáo.',
    primary_outfit: 'NGU_THAN',
    dresscodeLabel: 'Áo Ngũ Thân tay chẽn, Áo Nhật Bình, Áo Dài',
    accessoriesLabel: 'Khăn vấn, quạt xếp, xuyến bạc, guốc gỗ',
    recommended_colors: ['#D97706 - Vàng Phố Cổ', '#9A3412 - Đỏ Đèn Lồng', '#FAF8F5 - Trắng Lụa'],
    accessories_suggested: ['KHAN_XEP', 'XUYEN_BAC', 'QUAT_TRAM', 'GUOC_MOC'],
    stamp_id: 'STAMP_CHUA_CAU_07',
    stamp_name: 'Con Dấu Lai Viễn Kiều (Chùa Cầu)',
    points_awarded: 180,
    badge_earned: 'Bách Hoa Bộ Hành',
    imageUrl: HERITAGE_IMAGES.aoNguThan,
    outfitConfig: {
      config_id: 'MAP_CFG_HOIAN_07',
      gender: 'nu',
      garmentId: 'ao-ngu-than',
      paletteId: 'khue-van-tri-thuc',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'am-hoa-tron',
      accessoryIds: ['khan-xep', 'quat-tram-huong'],
      footwearId: 'guoc-go-moc',
      occasionId: 'dao-pho',
      weatherId: 'xuan-am-ap',
      outerHex: '#2E8B57',
      innerHex: '#FFFFF0',
      lowerHex: '#FFFFF0',
    },
  },
  {
    id: 'site-binh-thuy',
    heritage_id: 'HERITAGE_BINH_THUY_CT',
    site_name: 'Nhà cổ Bình Thủy',
    location_query: 'Nhà cổ Bình Thủy, Cần Thơ',
    region: 'MIEN_NAM',
    regionLabel: 'Miền Nam · Cần Thơ',
    isSacredSite: false,
    historical_summary:
      'Ngôi nhà cổ năm gian hai chái của gia tộc họ Dương được xây dựng từ năm 1870 tại Cần Thơ, nổi tiếng với kiến trúc giao thoa Pháp - Việt và không gian gia đường truyền thống Nam Bộ.',
    etiquette_rules:
      'Không gian gia từ và di tích kiến trúc: Khuyến khích diện Áo Bà Ba lụa đũi hoặc Áo Dài Tân Thời nhã nhặn, không tự ý chạm vào đồ thờ tự cổ trong gian chính.',
    primary_outfit: 'BA_BA',
    dresscodeLabel: 'Áo Bà Ba, Áo Dài Tân Thời (Lemur / Lê Phổ)',
    accessoriesLabel: 'Khăn rằn, nón lá, guốc mộc, túi mây tre đan',
    recommended_colors: ['#D6CEBE - Be Cát Trắng', '#27272A - Đen Lãnh Mỹ A', '#A16207 - Nâu Mây Tre'],
    accessories_suggested: ['KHAN_RAN_NON_LA', 'GUOC_MOC'],
    stamp_id: 'STAMP_BINH_THUY_08',
    stamp_name: 'Ấn Ký Gia Trang Bình Thủy',
    points_awarded: 180,
    badge_earned: 'Phương Nam Hào Sảng',
    imageUrl: HERITAGE_IMAGES.aoDaiBaBa,
    outfitConfig: {
      config_id: 'MAP_CFG_BINHTHUY_08',
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
  {
    id: 'site-dinh-doc-lap',
    heritage_id: 'HERITAGE_DINH_DOC_LAP_SG',
    site_name: 'Dinh Độc Lập (Hội trường Thống Nhất)',
    location_query: 'Dinh Độc Lập, Quận 1, TP.HCM',
    region: 'MIEN_NAM',
    regionLabel: 'Miền Nam · TP.HCM',
    isSacredSite: false,
    historical_summary:
      'Di tích quốc gia đặc biệt giữa trung tâm Sài Gòn do kiến trúc sư Ngô Viết Thụ thiết kế, kết hợp triết lý phương Đông (chữ Cát, chữ Khẩu, rèm hoa đá hình đốt trúc) với kiến trúc hiện đại.',
    etiquette_rules:
      'Di tích lịch sử cấp Quốc gia: Trang phục lịch sự, kín đáo; Áo Dài Tân Thời, Áo Bà Ba hoặc Áo Ngũ Thân tay chẽn rất tôn dáng trước bức rèm hoa đá đốt trúc.',
    primary_outfit: 'AO_DAI',
    dresscodeLabel: 'Áo Dài Tân Thời (Lemur / Lê Phổ), Áo Bà Ba',
    accessoriesLabel: 'Nón lá, guốc mộc, túi mây tre đan, khăn rằn',
    recommended_colors: ['#FAF8F5 - Trắng Tinh Khôi', '#D6CEBE - Be Tơ Đũi', '#2E8B57 - Xanh Ngọc'],
    accessories_suggested: ['KHAN_RAN_NON_LA', 'GUOC_MOC'],
    stamp_id: 'STAMP_DINH_DOC_LAP_09',
    stamp_name: 'Con Dấu Hội Trường Thống Nhất',
    points_awarded: 180,
    badge_earned: 'Thanh Lịch Sài Gòn',
    imageUrl: HERITAGE_IMAGES.model2DNuBaBa,
    outfitConfig: {
      config_id: 'MAP_CFG_DINHDOCLAP_09',
      gender: 'nu',
      garmentId: 'ao-dai-ba-ba',
      paletteId: 'phuong-nam-binh-di',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'am-hoa-tron',
      accessoryIds: ['khan-ran-non-la'],
      footwearId: 'guoc-go-moc',
      occasionId: 'tot-nghiep',
      weatherId: 'ha-nang-vang',
      outerHex: '#D6CEBE',
      innerHex: '#FFFFF0',
      lowerHex: '#FFFFF0',
    },
  },
];

/**
 * 4. Regional Dresscode Lookup from any Search Query or Site Record
 */
export function resolveHeritageSiteFromQuery(query: string): HeritageSiteRecord {
  const q = (query || '').trim().toLowerCase();
  const exactMatch = HERITAGE_MAP_SITES.find(
    (s) =>
      s.heritage_id.toLowerCase() === q ||
      s.id.toLowerCase() === q ||
      s.location_query.toLowerCase() === q ||
      s.site_name.toLowerCase() === q ||
      q.includes(s.site_name.toLowerCase())
  );
  if (exactMatch) return exactMatch;

  // Detect region from query keywords
  const isMienTrung =
    q.includes('huế') ||
    q.includes('hue') ||
    q.includes('đại nội') ||
    q.includes('lăng') ||
    q.includes('hội an') ||
    q.includes('đà nẵng') ||
    q.includes('quảng nam') ||
    q.includes('tháp chàm') ||
    q.includes('nha trang') ||
    q.includes('miền trung');

  const isMienNam =
    q.includes('tp.hcm') ||
    q.includes('sài gòn') ||
    q.includes('cần thơ') ||
    q.includes('bình thủy') ||
    q.includes('dinh độc lập') ||
    q.includes('chợ nổi') ||
    q.includes('nam bộ') ||
    q.includes('miền nam') ||
    q.includes('an giang') ||
    q.includes('đồng tháp');

  const isSacred =
    q.includes('chùa') ||
    q.includes('đền') ||
    q.includes('miếu') ||
    q.includes('lăng') ||
    q.includes('điện') ||
    q.includes('phủ') ||
    q.includes('tự');

  const cleanName = query.trim() || 'Văn Miếu - Quốc Tử Giám, Hà Nội';
  const shortHash = Math.abs(
    cleanName.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 13)
  )
    .toString(36)
    .toUpperCase()
    .slice(0, 4);

  if (isMienTrung) {
    return {
      ...HERITAGE_MAP_SITES[4], // Đại Nội Huế template
      id: `custom-${shortHash.toLowerCase()}`,
      site_name: cleanName.split(',')[0].trim(),
      location_query: cleanName,
      region: 'MIEN_TRUNG',
      regionLabel: 'Miền Trung & Huế',
      isSacredSite: isSacred,
      historical_summary: `Địa danh văn hóa & di tích tại khu vực Miền Trung (${cleanName}). Không gian mang đậm dấu ấn kiến trúc di sản Đàng Trong và cố đô.`,
      stamp_id: `STAMP_TRUNG_${shortHash}`,
      stamp_name: `Ấn Chương ${cleanName.split(',')[0].trim()}`,
    };
  }

  if (isMienNam) {
    return {
      ...HERITAGE_MAP_SITES[7], // Bình Thủy template
      id: `custom-${shortHash.toLowerCase()}`,
      site_name: cleanName.split(',')[0].trim(),
      location_query: cleanName,
      region: 'MIEN_NAM',
      regionLabel: 'Miền Nam',
      isSacredSite: isSacred,
      historical_summary: `Địa danh văn hóa & du lịch di sản tại khu vực Miền Nam (${cleanName}), nổi bật với nét đẹp phóng khoáng, giao thoa truyền thống và hiện đại.`,
      stamp_id: `STAMP_NAM_${shortHash}`,
      stamp_name: `Ấn Ký ${cleanName.split(',')[0].trim()}`,
    };
  }

  return {
    ...HERITAGE_MAP_SITES[0], // Văn Miếu Miền Bắc template
    id: `custom-${shortHash.toLowerCase()}`,
    site_name: cleanName.split(',')[0].trim(),
    location_query: cleanName,
    region: 'MIEN_BAC',
    regionLabel: 'Miền Bắc',
    isSacredSite: isSacred,
    historical_summary: `Không gian di sản văn hóa & lịch sử tiêu biểu tại khu vực Miền Bắc (${cleanName}), lưu giữ nét đẹp cổ kính ngàn năm văn hiến.`,
    stamp_id: `STAMP_BAC_${shortHash}`,
    stamp_name: `Ấn Chương ${cleanName.split(',')[0].trim()}`,
  };
}

/**
 * Generate Satellite Partner Shops surrounding a Hero Heritage Site within 300m / 500m / 1km radius
 */
export function getSatellitePartnerShopsForSite(
  site: HeritageSiteRecord,
  maxRadiusMeters: 300 | 500 | 1000 = 1000
): SatellitePartnerShopRecord[] {
  const encodedOrigin = encodeURIComponent(site.location_query);

  const buildShop = (params: {
    shop_id: string;
    shop_name: string;
    distance_meters: number;
    distance_from_heritage: string;
    rental_price_from: string;
    shop_address: string;
    specialty_outfit: string;
    pin_color: 'emerald' | 'amber';
    pin_coords: { top: string; left: string };
    outfitConfig: OutfitConfigCode;
    image_url: string;
    rating: number;
  }): SatellitePartnerShopRecord => {
    const encodedDest = encodeURIComponent(params.shop_address);
    const configStr = JSON.stringify(params.outfitConfig);
    return {
      shop_id: params.shop_id,
      shop_name: params.shop_name,
      pin_type: 'SATELLITE_PARTNER_PIN',
      distance_meters: params.distance_meters,
      distance_from_heritage: params.distance_from_heritage,
      rental_price_from: params.rental_price_from,
      shop_address: params.shop_address,
      specialty_outfit: params.specialty_outfit,
      pin_color: params.pin_color,
      pin_coords: params.pin_coords,
      outfitConfig: params.outfitConfig,
      image_url: params.image_url,
      rating: params.rating,
      action_links: {
        magic_refit_shop_outfit: configStr,
        directions_from_site_url: `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDest}`,
        send_3d_measurements_url: `https://vietphuclookbook.app/marketplace/tailor-rent/${params.shop_id}?site=${encodeURIComponent(
          site.site_name
        )}&config=${params.outfitConfig.config_id}`,
      },
    };
  };

  let allSatellites: SatellitePartnerShopRecord[] = [];

  if (site.region === 'MIEN_TRUNG') {
    allSatellites = [
      buildShop({
        shop_id: `SHOP_DEMO_MT_${site.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_01`,
        shop_name: 'Tiệm Cổ Phục Ví Dụ 01 — Chi nhánh Cố Đô',
        distance_meters: 220,
        distance_from_heritage: '220m (3 phút đi bộ)',
        rental_price_from: '280.000đ/ngày',
        shop_address: `Khu vực cổng chính cạnh ${site.site_name}`,
        specialty_outfit: 'Áo Nhật Bình Đỏ Chu Sa & Áo Ngũ Thân Tay Thụt',
        pin_color: 'emerald',
        pin_coords: { top: '26%', left: '68%' },
        outfitConfig: {
          ...site.outfitConfig,
          config_id: 'CFG_SAT_DEMO_MT_300M',
          garmentId: 'ao-nhat-binh',
          paletteId: 'chu-sa-ngu-uyen',
          outerHex: '#9A3412',
          innerHex: '#D97706',
          lowerHex: '#FAF8F5',
        },
        image_url: HERITAGE_IMAGES.aoNhatBinh,
        rating: 4.9,
      }),
      buildShop({
        shop_id: `SHOP_DEMO_MT_${site.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_02`,
        shop_name: 'Xưởng May Mẫu 02 — Việt Phục Di Sản',
        distance_meters: 450,
        distance_from_heritage: '450m (6 phút đi bộ)',
        rental_price_from: '240.000đ/ngày',
        shop_address: `Tuyến phố lân cận cách ${site.site_name} 450m`,
        specialty_outfit: 'Áo Ngũ Thân Lập Lĩnh Lam Cổ Điển & Khăn Xếp',
        pin_color: 'amber',
        pin_coords: { top: '68%', left: '28%' },
        outfitConfig: {
          ...site.outfitConfig,
          config_id: 'CFG_SAT_DEMO_MT_500M',
          garmentId: 'ao-ngu-than',
          paletteId: 'thanh-phong-nien-hoa',
          outerHex: '#1E3A8A',
          innerHex: '#F5F5DC',
          lowerHex: '#F5F5DC',
        },
        image_url: HERITAGE_IMAGES.aoNguThan,
        rating: 4.8,
      }),
      buildShop({
        shop_id: `SHOP_DEMO_MT_${site.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_03`,
        shop_name: 'Studio Thuê Đồ Mẫu 03 — Lễ Phục Truyền Thống',
        distance_meters: 820,
        distance_from_heritage: '820m (10 phút đi bộ)',
        rental_price_from: '350.000đ/ngày',
        shop_address: `Khu phố văn hóa cách ${site.site_name} 820m`,
        specialty_outfit: 'Áo Nhật Bình Hoàng Kim & Hài Thêu Thủ Công',
        pin_color: 'emerald',
        pin_coords: { top: '72%', left: '74%' },
        outfitConfig: {
          ...site.outfitConfig,
          config_id: 'CFG_SAT_DEMO_MT_1KM',
          garmentId: 'ao-nhat-binh',
          paletteId: 'chu-sa-ngu-uyen',
          outerHex: '#D97706',
          innerHex: '#9A3412',
          lowerHex: '#FAF8F5',
        },
        image_url: HERITAGE_IMAGES.model2DNuNhatBinh,
        rating: 4.9,
      }),
    ];
  } else if (site.region === 'MIEN_NAM') {
    allSatellites = [
      buildShop({
        shop_id: `SHOP_DEMO_MN_${site.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_01`,
        shop_name: 'Tiệm Cổ Phục Ví Dụ 01 — Chi nhánh Phương Nam',
        distance_meters: 240,
        distance_from_heritage: '240m (3 phút đi bộ)',
        rental_price_from: '200.000đ/ngày',
        shop_address: `Ngay cổng chính ${site.site_name}`,
        specialty_outfit: 'Áo Bà Ba Lụa Lãnh Mỹ A & Áo Dài Tân Thời',
        pin_color: 'emerald',
        pin_coords: { top: '28%', left: '70%' },
        outfitConfig: {
          ...site.outfitConfig,
          config_id: 'CFG_SAT_DEMO_MN_300M',
          garmentId: 'ao-dai-ba-ba',
          paletteId: 'phuong-nam-binh-di',
          outerHex: '#D6CEBE',
          innerHex: '#27272A',
          lowerHex: '#27272A',
        },
        image_url: HERITAGE_IMAGES.aoDaiBaBa,
        rating: 4.9,
      }),
      buildShop({
        shop_id: `SHOP_DEMO_MN_${site.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_02`,
        shop_name: 'Xưởng May Mẫu 02 — Áo Ngũ Thân & Áo Dài',
        distance_meters: 460,
        distance_from_heritage: '460m (6 phút đi bộ)',
        rental_price_from: '250.000đ/ngày',
        shop_address: `Cách ${site.site_name} 460m`,
        specialty_outfit: 'Áo Ngũ Thân Tay Chẽn Xanh Ngọc & Guốc Mộc',
        pin_color: 'amber',
        pin_coords: { top: '66%', left: '26%' },
        outfitConfig: {
          ...site.outfitConfig,
          config_id: 'CFG_SAT_DEMO_MN_500M',
          garmentId: 'ao-ngu-than',
          paletteId: 'khue-van-tri-thuc',
          outerHex: '#2E8B57',
          innerHex: '#FFFFF0',
          lowerHex: '#FFFFF0',
        },
        image_url: HERITAGE_IMAGES.aoNguThan,
        rating: 4.8,
      }),
      buildShop({
        shop_id: `SHOP_DEMO_MN_${site.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_03`,
        shop_name: 'Studio Thuê Đồ Mẫu 03 — Cổ Phục Nam Bộ',
        distance_meters: 860,
        distance_from_heritage: '860m (11 phút đi bộ)',
        rental_price_from: '190.000đ/ngày',
        shop_address: `Khu trung tâm gần ${site.site_name}`,
        specialty_outfit: 'Áo Bà Ba Tơ Đũi & Khăn Rằn Nam Bộ',
        pin_color: 'emerald',
        pin_coords: { top: '72%', left: '73%' },
        outfitConfig: {
          ...site.outfitConfig,
          config_id: 'CFG_SAT_DEMO_MN_1KM',
          garmentId: 'ao-dai-ba-ba',
          paletteId: 'phuong-nam-binh-di',
          outerHex: '#D6CEBE',
          innerHex: '#FFFFF0',
          lowerHex: '#27272A',
        },
        image_url: HERITAGE_IMAGES.model2DNuBaBa,
        rating: 4.7,
      }),
    ];
  } else {
    // MIEN_BAC default
    allSatellites = [
      buildShop({
        shop_id: `SHOP_DEMO_MB_${site.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_01`,
        shop_name: 'Tiệm Cổ Phục Ví Dụ 01 — Chi nhánh Di tích',
        distance_meters: 250,
        distance_from_heritage: '250m (3 phút đi bộ)',
        rental_price_from: '280.000đ/ngày',
        shop_address: `Phố văn hóa cạnh ${site.site_name}`,
        specialty_outfit: 'Áo Ngũ Thân Lập Lĩnh Tay Chẽn & Khăn Xếp',
        pin_color: 'emerald',
        pin_coords: { top: '26%', left: '68%' },
        outfitConfig: {
          ...site.outfitConfig,
          config_id: 'CFG_SAT_DEMO_MB_300M',
          garmentId: 'ao-ngu-than',
          paletteId: 'khue-van-tri-thuc',
          outerHex: '#2E8B57',
          innerHex: '#FFFFF0',
          lowerHex: '#FFFFF0',
        },
        image_url: HERITAGE_IMAGES.aoNguThan,
        rating: 4.9,
      }),
      buildShop({
        shop_id: `SHOP_DEMO_MB_${site.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_02`,
        shop_name: 'Xưởng May Mẫu 02 — Y Phục Truyền Thống',
        distance_meters: 440,
        distance_from_heritage: '440m (5 phút đi bộ)',
        rental_price_from: '220.000đ/ngày',
        shop_address: `Cách cổng chính ${site.site_name} 440m`,
        specialty_outfit: 'Áo Tứ Thân Mớ Ba Mớ Bảy, Yếm Đào & Nón Ba Tầm',
        pin_color: 'amber',
        pin_coords: { top: '66%', left: '26%' },
        outfitConfig: {
          ...site.outfitConfig,
          config_id: 'CFG_SAT_DEMO_MB_500M',
          garmentId: 'ao-tu-than',
          paletteId: 'kinh-bac-dao-hoa',
          outerHex: '#78350F',
          innerHex: '#B91C1C',
          lowerHex: '#1C1917',
        },
        image_url: HERITAGE_IMAGES.aoTuThan,
        rating: 4.8,
      }),
      buildShop({
        shop_id: `SHOP_DEMO_MB_${site.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_03`,
        shop_name: 'Studio Thuê Đồ Mẫu 03 — Cổ Phục & Kỷ Yếu',
        distance_meters: 780,
        distance_from_heritage: '780m (9 phút đi bộ)',
        rental_price_from: '260.000đ/ngày',
        shop_address: `Tuyến phố cách ${site.site_name} 780m`,
        specialty_outfit: 'Áo Ngũ Thân Nam/Nữ Lam Cổ Điển & Quạt Trầm',
        pin_color: 'emerald',
        pin_coords: { top: '72%', left: '74%' },
        outfitConfig: {
          ...site.outfitConfig,
          config_id: 'CFG_SAT_DEMO_MB_1KM',
          gender: 'nam',
          garmentId: 'ao-ngu-than',
          paletteId: 'thanh-phong-nien-hoa',
          outerHex: '#1E3A8A',
          innerHex: '#F5F5DC',
          lowerHex: '#F5F5DC',
        },
        image_url: HERITAGE_IMAGES.realMaleStudio,
        rating: 4.9,
      }),
    ];
  }

  return allSatellites.filter((shop) => shop.distance_meters <= maxRadiusMeters);
}

/**
 * Build Exact Mandatory JSON Output for Hierarchical Map & Marketplace Lite (Section IV)
 */
export function buildMandatoryHierarchicalMapJson(
  evalResult: NoApiMapsSiteOutputSchema
): HierarchicalMapOutputSchema {
  return {
    maps_integration_lite: evalResult.maps_integration_lite,
    hero_heritage_site: evalResult.hero_heritage_site,
    satellite_partner_shops: evalResult.satellite_partner_shops,
    stamp_unlock_result: {
      is_unlocked: evalResult.stamp_unlock_result.is_unlocked,
      stamp_id: evalResult.stamp_unlock_result.stamp_id,
      stamp_name: evalResult.stamp_unlock_result.stamp_name,
      points_awarded: evalResult.stamp_unlock_result.points_awarded,
    },
  };
}

/**
 * II. 3-Step Check-in Moderation & Hierarchical Map + Heritage Stamp Unlocking Engine
 */
export function evaluateHeritageCheckIn(params: {
  site: HeritageSiteRecord;
  outfitChosen: PrimaryOutfitCode | 'YEM_HO_LUNG' | 'THUONG_PHUC_HIEN_DAI';
  locationVerified: boolean;
  radiusMeters?: 300 | 500 | 1000;
}): NoApiMapsSiteOutputSchema {
  const { site, outfitChosen, locationVerified, radiusMeters = 1000 } = params;
  const mapsLite = buildGoogleMapsLiteUrls(site.location_query);
  const configCode3D = JSON.stringify(site.outfitConfig);

  const heroHeritageSite: HierarchicalMapOutputSchema['hero_heritage_site'] = {
    site_name: site.site_name,
    region: site.region,
    pin_type: 'HERO_RED_GOLD_PIN',
    historical_summary: site.historical_summary,
    etiquette_rules: site.etiquette_rules,
    dresscode_recommendations: {
      primary_outfit: site.primary_outfit,
      recommended_colors: site.recommended_colors,
      config_code_3d: configCode3D,
    },
  };

  const satellitePartnerShops: SatellitePartnerShopSchema[] = getSatellitePartnerShopsForSite(
    site,
    radiusMeters
  ).map((s) => ({
    shop_id: s.shop_id,
    shop_name: s.shop_name,
    pin_type: 'SATELLITE_PARTNER_PIN',
    distance_from_heritage: s.distance_from_heritage,
    rental_price_from: s.rental_price_from,
    action_links: s.action_links,
  }));

  // Step 1: Location Verification
  if (!locationVerified) {
    return {
      maps_integration_lite: mapsLite,
      hero_heritage_site: heroHeritageSite,
      satellite_partner_shops: satellitePartnerShops,
      site_info: {
        site_name: site.site_name,
        region: site.region,
        historical_summary: site.historical_summary,
        etiquette_rules: site.etiquette_rules,
      },
      dresscode_recommendations: {
        primary_outfit: site.primary_outfit,
        recommended_colors: site.recommended_colors,
        accessories_suggested: site.accessories_suggested,
        config_code_3d: configCode3D,
      },
      stamp_unlock_result: {
        is_unlocked: false,
        stamp_id: site.stamp_id,
        stamp_name: site.stamp_name,
        points_awarded: 0,
        badge_earned: null,
        culture_guard_status: 'REJECTED',
        message: `Chưa thể mở khóa "${site.stamp_name}": Vị trí check-in hiện tại chưa khớp với tọa độ địa danh "${site.location_query}". Vui lòng có mặt tại di tích để đóng dấu!`,
      },
    };
  }

  // Step 2A: Culture Guard Vision — Check if wearing Việt phục
  if (outfitChosen === 'THUONG_PHUC_HIEN_DAI') {
    return {
      maps_integration_lite: mapsLite,
      hero_heritage_site: heroHeritageSite,
      satellite_partner_shops: satellitePartnerShops,
      site_info: {
        site_name: site.site_name,
        region: site.region,
        historical_summary: site.historical_summary,
        etiquette_rules: site.etiquette_rules,
      },
      dresscode_recommendations: {
        primary_outfit: site.primary_outfit,
        recommended_colors: site.recommended_colors,
        accessories_suggested: site.accessories_suggested,
        config_code_3d: configCode3D,
      },
      stamp_unlock_result: {
        is_unlocked: false,
        stamp_id: site.stamp_id,
        stamp_name: site.stamp_name,
        points_awarded: 0,
        badge_earned: null,
        culture_guard_status: 'REJECTED',
        message: `Culture Guard Vision: Ảnh check-in tại "${site.site_name}" chưa nhận diện được Việt phục truyền thống (Ngũ thân, Nhật bình, Tứ thân, Áo dài, Bà ba). Hãy diện Việt phục để mở khóa Con Dấu Di Sản 3D nhé!`,
      },
    };
  }

  // Step 2B: Etiquette Alert at Sacred/Spiritual Sites (Chùa, Đền, Miếu, Lăng, Hoàng cung)
  if (outfitChosen === 'YEM_HO_LUNG' && site.isSacredSite) {
    return {
      maps_integration_lite: mapsLite,
      hero_heritage_site: heroHeritageSite,
      satellite_partner_shops: satellitePartnerShops,
      site_info: {
        site_name: site.site_name,
        region: site.region,
        historical_summary: site.historical_summary,
        etiquette_rules: site.etiquette_rules,
      },
      dresscode_recommendations: {
        primary_outfit: site.primary_outfit,
        recommended_colors: site.recommended_colors,
        accessories_suggested: site.accessories_suggested,
        config_code_3d: configCode3D,
      },
      stamp_unlock_result: {
        is_unlocked: false,
        stamp_id: site.stamp_id,
        stamp_name: site.stamp_name,
        points_awarded: 0,
        badge_earned: null,
        culture_guard_status: 'WARNING',
        message: `Cảnh báo Ứng xử Văn hóa (Etiquette Alert): "${site.site_name}" là không gian thờ tự/tâm linh tôn nghiêm. Trang phục Yếm đào không khoác áo ngoài (hoặc xẻ tà quá cao/hở lưng) chưa phù hợp quy chuẩn tôn nghiêm. Gợi ý: Khoác thêm Áo Tứ Thân hoặc chọn Áo Ngũ Thân cổ lập lĩnh kín đáo để mở khóa con dấu!`,
      },
    };
  }

  // Step 3: Approved — Unlock 3D Heritage Stamp + Loyalty Points + Badge
  const outfitNameMap: Record<string, string> = {
    NGU_THAN: 'Áo Ngũ Thân Lập Lĩnh',
    NHAT_BINH: 'Áo Nhật Bình Cung Đình',
    TU_THAN: 'Áo Tứ Thân & Yếm Đào',
    AO_DAI: 'Áo Dài Tân Thời',
    BA_BA: 'Áo Bà Ba Nam Bộ',
    YEM_HO_LUNG: 'Áo Tứ Thân & Yếm Đào (Lễ hội)',
  };

  return {
    maps_integration_lite: mapsLite,
    hero_heritage_site: heroHeritageSite,
    satellite_partner_shops: satellitePartnerShops,
    site_info: {
      site_name: site.site_name,
      region: site.region,
      historical_summary: site.historical_summary,
      etiquette_rules: site.etiquette_rules,
    },
    dresscode_recommendations: {
      primary_outfit: site.primary_outfit,
      recommended_colors: site.recommended_colors,
      accessories_suggested: site.accessories_suggested,
      config_code_3d: configCode3D,
    },
    stamp_unlock_result: {
      is_unlocked: true,
      stamp_id: site.stamp_id,
      stamp_name: site.stamp_name,
      points_awarded: site.points_awarded,
      badge_earned: site.badge_earned,
      culture_guard_status: 'APPROVED',
      message: `Chúc mừng! Bạn đã check-in hợp lệ cùng ${
        outfitNameMap[outfitChosen] || 'Việt phục chuẩn mực'
      } tại "${site.site_name}". Đã mở khóa Con Dấu 3D "${site.stamp_name}", cộng +${
        site.points_awarded
      } Loyalty Points và nhận danh hiệu "${site.badge_earned}"!`,
    },
  };
}

export const INITIAL_UNLOCKED_STAMPS: UnlockedStampEntry[] = [
  {
    site_id: 'site-van-mieu',
    stamp_id: 'STAMP_KHUE_VAN_01',
    stamp_name: 'Ấn Chương Khuê Văn Các',
    location_query: 'Văn Miếu - Quốc Tử Giám, Hà Nội',
    site_name: 'Văn Miếu - Quốc Tử Giám',
    outfit_worn: 'Áo Ngũ Thân Lập Lĩnh',
    points_awarded: 200,
    badge_earned: 'Khuê Văn Tri Thức',
    unlocked_at: '08/10/2026',
    photo_url: HERITAGE_IMAGES.aoNguThan,
  },
  {
    site_id: 'site-dai-noi-hue',
    stamp_id: 'STAMP_NGO_MON_05',
    stamp_name: 'Kim Ấn Ngọ Môn Quan',
    location_query: 'Đại Nội Huế, Thừa Thiên Huế',
    site_name: 'Đại Nội Huế (Hoàng Thành Huế)',
    outfit_worn: 'Áo Nhật Bình Cung Đình',
    points_awarded: 250,
    badge_earned: 'Cung Đình Hoài Cổ',
    unlocked_at: '09/10/2026',
    photo_url: HERITAGE_IMAGES.aoNhatBinh,
  },
];

/**
 * ============================================================================
 * PROFILE HERITAGE BADGES & OMNICHANNEL POINTS ENGINE (SYSTEM OVERRIDE)
 * ============================================================================
 */
export type OmnichannelPointSource =
  | 'HERITAGE_CHECKIN'
  | 'SOCIAL_POST_SHARE'
  | 'PARTNER_RENT_TAILOR'
  | 'CULTURAL_EVENT';

export interface OmnichannelPointEntry {
  id: string;
  source: OmnichannelPointSource;
  sourceLabel: string;
  description: string;
  points: number;
  timestamp: string;
}

export interface ProfileHeritageBadgeDefinition {
  badge_id: string;
  icon: string;
  name: string;
  rankTitle: string;
  requiredCheckinCount: number;
  region: 'MIEN_BAC' | 'MIEN_TRUNG' | 'MIEN_NAM' | 'ALL';
  conditionLabel: string;
  requiredSiteIds: string[];
}

export interface ProfileHeritageBadgeStatus extends ProfileHeritageBadgeDefinition {
  is_unlocked: boolean;
  is_pinned: boolean;
  collected_count: number;
  required_count: number;
}

export const PROFILE_HERITAGE_BADGES: ProfileHeritageBadgeDefinition[] = [
  {
    badge_id: 'BADGE_THANG_LONG_CO_TICH',
    icon: '🏰',
    name: 'Thăng Long Cổ Tích',
    rankTitle: 'Thợ Phối Tập Sự',
    requiredCheckinCount: 1,
    region: 'MIEN_BAC',
    conditionLabel: 'Check-in từ 1 địa danh di tích',
    requiredSiteIds: ['site-van-mieu'],
  },
  {
    badge_id: 'BADGE_CO_DO_PHONG_HOA',
    icon: '👑',
    name: 'Cố Đô Phong Hoa',
    rankTitle: 'Bậc Thầy Hành Trình',
    requiredCheckinCount: 3,
    region: 'MIEN_TRUNG',
    conditionLabel: 'Check-in đủ 3 địa danh di tích',
    requiredSiteIds: ['site-van-mieu', 'site-dai-noi-hue', 'site-hoang-thanh'],
  },
  {
    badge_id: 'BADGE_PHUONG_NAM_HAO_SANG',
    icon: '🏮',
    name: 'Hội An Hoài Cổ',
    rankTitle: 'Sứ Giả Di Sản',
    requiredCheckinCount: 5,
    region: 'MIEN_TRUNG',
    conditionLabel: 'Check-in đủ 5 địa danh di tích',
    requiredSiteIds: [
      'site-van-mieu',
      'site-dai-noi-hue',
      'site-hoang-thanh',
      'site-hoi-an',
      'site-binh-thuy',
    ],
  },
  {
    badge_id: 'BADGE_DAI_SU_VIET_PHUC',
    icon: '🐉',
    name: 'Đại Sứ Việt Phục',
    rankTitle: 'Đại Sứ Văn Hóa',
    requiredCheckinCount: 7,
    region: 'ALL',
    conditionLabel: 'Check-in đủ 7 địa danh di tích',
    requiredSiteIds: [
      'site-van-mieu',
      'site-dai-noi-hue',
      'site-hoang-thanh',
      'site-chua-thay',
      'site-lang-tu-duc',
      'site-hoi-an',
      'site-binh-thuy',
    ],
  },
];

export function getHeritageRankByCheckinCount(checkinCount: number): string {
  if (checkinCount >= 7) return 'Đại Sứ Văn Hóa';
  if (checkinCount >= 5) return 'Sứ Giả Di Sản';
  if (checkinCount >= 3) return 'Bậc Thầy Hành Trình';
  return 'Thợ Phối Tập Sự';
}

export const INITIAL_OMNICHANNEL_POINT_LOGS: OmnichannelPointEntry[] = [
  {
    id: 'pt-partner-300k',
    source: 'PARTNER_RENT_TAILOR',
    sourceLabel: 'Thuê/May Đối tác (+10%)',
    description: 'Hoàn tất đơn thuê Áo Ngũ Thân (Đơn 300.000đ -> +300 Điểm)',
    points: 300,
    timestamp: '08/10/2026',
  },
  {
    id: 'pt-event-bachhoa',
    source: 'CULTURAL_EVENT',
    sourceLabel: 'Sự kiện Văn hóa',
    description: 'Đăng ký tham gia sự kiện Bách Hoa Bộ Hành',
    points: 150,
    timestamp: '09/10/2026',
  },
  {
    id: 'pt-social-share-01',
    source: 'SOCIAL_POST_SHARE',
    sourceLabel: 'Cộng đồng (+20đ)',
    description: 'Đăng bài chia sẻ Lookbook #VietPhucLookbook hợp lệ',
    points: 20,
    timestamp: '09/10/2026',
  },
];

export function evaluateProfileHeritageBadges(
  unlockedStamps: UnlockedStampEntry[],
  _omnichannelLogs: OmnichannelPointEntry[],
  pinnedBadgeId: string
): ProfileHeritageBadgeStatus[] {
  const checkinCount = unlockedStamps.length;

  return PROFILE_HERITAGE_BADGES.map((badge) => {
    const requiredCount = badge.requiredCheckinCount;
    const isUnlocked = checkinCount >= requiredCount;

    return {
      ...badge,
      is_unlocked: isUnlocked,
      is_pinned: badge.badge_id === pinnedBadgeId && isUnlocked,
      collected_count: Math.min(checkinCount, requiredCount),
      required_count: requiredCount,
    };
  });
}

export function buildDigitalPassportOmnichannelJson(params: {
  userName: string;
  unlockedStamps: UnlockedStampEntry[];
  omnichannelLogs: OmnichannelPointEntry[];
  pinnedBadgeId: string;
  evalResult: NoApiMapsSiteOutputSchema;
}) {
  const { userName, unlockedStamps, omnichannelLogs, pinnedBadgeId, evalResult } = params;
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
  const totalPoints = stampPoints + socialPoints + partnerPoints + eventPoints;

  const badges = evaluateProfileHeritageBadges(unlockedStamps, omnichannelLogs, pinnedBadgeId);
  const pinnedBadge =
    badges.find((b) => b.is_pinned) ||
    [...badges].reverse().find((b) => b.is_unlocked) ||
    badges[0];

  const rankTitle = getHeritageRankByCheckinCount(unlockedStamps.length);

  return {
    digital_passport_omnichannel: {
      holder_name: userName,
      rank_title: rankTitle,
      pinned_profile_badge: pinnedBadge
        ? `${pinnedBadge.icon} ${pinnedBadge.name}`
        : '🏰 Thăng Long Cổ Tích',
      stamps_progress: `${unlockedStamps.length}/${HERITAGE_MAP_SITES.length}`,
      total_heritage_points: totalPoints,
      points_breakdown: {
        heritage_checkin_points: stampPoints,
        social_post_share_points: socialPoints,
        partner_rent_tailor_points: partnerPoints,
        cultural_event_points: eventPoints,
      },
      omnichannel_rules: {
        rank_and_badge_rule:
          'Mở khóa Danh hiệu & Huy hiệu Profile theo số lượng địa danh đã Check-in (1, 3, 5, 7 địa danh)',
        social_trends_post: '+20 Điểm Di Sản / bài đăng hợp lệ',
        verified_marketplace_order: '+10% giá trị đơn hàng thành Điểm Di Sản (VD: 300k -> +300 Điểm)',
        heritage_site_checkin: '+180 đến +250 Điểm Di Sản / con dấu di tích',
        cultural_event_checkin: '+150 Điểm Di Sản / sự kiện tham gia',
      },
      profile_badges: badges.map((b) => ({
        badge_id: b.badge_id,
        badge_name: `${b.icon} ${b.name}`,
        rank_milestone: b.rankTitle,
        required_checkins: b.requiredCheckinCount,
        is_unlocked: b.is_unlocked,
        is_pinned_on_profile: b.is_pinned,
        checkin_progress: `${unlockedStamps.length}/${b.required_count} địa danh`,
      })),
    },
    maps_integration_lite: evalResult.maps_integration_lite,
    hero_heritage_site: evalResult.hero_heritage_site,
    satellite_partner_shops: evalResult.satellite_partner_shops,
    stamp_unlock_result: {
      is_unlocked: evalResult.stamp_unlock_result.is_unlocked,
      stamp_id: evalResult.stamp_unlock_result.stamp_id,
      stamp_name: evalResult.stamp_unlock_result.stamp_name,
      points_awarded: evalResult.stamp_unlock_result.points_awarded,
    },
  };
}

/**
 * IV. Format Cultural Passport & Omnichannel Points Text Summary
 */
export function formatCulturalPassportText(
  userName: string,
  unlockedStamps: UnlockedStampEntry[],
  totalSitesCount: number = HERITAGE_MAP_SITES.length,
  omnichannelLogs: OmnichannelPointEntry[] = INITIAL_OMNICHANNEL_POINT_LOGS,
  pinnedBadgeId: string = 'BADGE_THANG_LONG_CO_TICH'
): string {
  const count = unlockedStamps.length;
  const stampPoints = unlockedStamps.reduce((sum, s) => sum + s.points_awarded, 0);
  const extraPoints = omnichannelLogs.reduce((sum, l) => sum + l.points, 0);
  const totalPoints = stampPoints + extraPoints;

  const badges = evaluateProfileHeritageBadges(unlockedStamps, omnichannelLogs, pinnedBadgeId);
  const pinnedBadge =
    badges.find((b) => b.is_pinned) ||
    [...badges].reverse().find((b) => b.is_unlocked) ||
    badges[0];
  const unlockedBadgesText = badges
    .filter((b) => b.is_unlocked)
    .map((b) => `${b.icon} ${b.name}${b.is_pinned ? ' [Đang đính Profile]' : ''}`)
    .join(', ');

  const rankTitle = getHeritageRankByCheckinCount(count);

  const stampLines =
    unlockedStamps.length > 0
      ? unlockedStamps
          .map(
            (s) =>
              `  - 🔴 [${s.stamp_name}] - 📍 ${s.location_query} (${s.outfit_worn}) [+$${s.points_awarded}đ]`.replace(
                '+$',
                '+'
              )
          )
          .join('\n')
      : '  - (Chưa có con dấu nào được mở khóa)';

  return [
    '----------------------------------------------------------------------',
    `📜 HỘ CHIẾU CỔ PHỤC & TÍCH ĐIỂM ĐA KÊNH - ${userName}`,
    `• Danh hiệu (theo địa danh Check-in): ${rankTitle} | Huy hiệu Profile: ${pinnedBadge.icon} ${pinnedBadge.name}`,
    `• Huy hiệu Di sản đã mở khóa: ${unlockedBadgesText || 'Chưa có'}`,
    `• Địa danh đã Check-in: ${count} / ${totalSitesCount}`,
    stampLines,
    `• Điểm Di Sản đổi Voucher: ${totalPoints} Điểm (Check-in: ${stampPoints}đ | Cộng đồng/Thuê may/Sự kiện: ${extraPoints}đ)`,
    '----------------------------------------------------------------------',
  ].join('\n');
}

// ============================================================================
// I. CƠ CHẾ DUMMY DATABASE & LOCAL STORAGE PERSISTENCE (VIETPHUC_LOCAL_STORAGE_V1)
// ============================================================================

export interface SavedOutfit3DSeedItem {
  outfit_id: string;
  title: string;
  outfit_type: 'NGU_THAN' | 'NHAT_BINH' | 'TU_THAN' | 'AO_DAI' | 'BA_BA';
  primary_hex: string;
  date_saved: string;
}

export interface MyVoucherSeedItem {
  voucher_code: string;
  discount_percent: number;
  description: string;
  expiry_date: string;
}

export interface DummyPostCommunityItem {
  post_id: string;
  author: string;
  caption: string;
  platform: 'Instagram' | 'TikTok' | 'Facebook';
  likes_count: number;
  outfit_config_id: string;
  has_magic_refit: boolean;
}

export interface DummyMarketplaceVendorItem {
  shop_id: string;
  shop_name: string;
  address: string;
  distance_meters: string;
  rental_price_from: string;
  rating_stars: number;
}

export interface DummyPassportStampItem {
  stamp_id: string;
  stamp_name: string;
  is_unlocked: boolean;
  unlocked_date: string | null;
}

export interface VietPhucLocalStorageV1Schema {
  user_profile: {
    user_id: string;
    username: string;
    avatar_url: string;
    display_title: string;
    loyalty_points_balance: number;
    unlocked_badges: string[];
    pinned_badge: string;
    measurements: {
      height_cm: number;
      weight_kg: number;
      chest_cm: number;
      waist_cm: number;
      hip_cm: number;
      suggested_size: 'S' | 'M' | 'L' | 'XL';
    };
  };
  local_saved_items: {
    saved_outfits_3d: SavedOutfit3DSeedItem[];
    saved_events: string[];
    saved_articles: string[];
    my_vouchers: MyVoucherSeedItem[];
  };
  dummy_posts_community: DummyPostCommunityItem[];
  dummy_marketplace_vendors: DummyMarketplaceVendorItem[];
  dummy_passport_stamps: DummyPassportStampItem[];
}

export const DEFAULT_VIETPHUC_LOCAL_STORAGE_SEED: VietPhucLocalStorageV1Schema = {
  user_profile: {
    user_id: 'USR_DEMO_001',
    username: 'Nhi_CổPhục',
    avatar_url: 'https://vietphuclookbook.app/assets/demo_avatar.png',
    display_title: 'THO_PHOI_TAP_SU',
    loyalty_points_balance: 380,
    unlocked_badges: ['BADGE_THANG_LONG'],
    pinned_badge: 'BADGE_THANG_LONG',
    measurements: {
      height_cm: 162,
      weight_kg: 50,
      chest_cm: 84,
      waist_cm: 64,
      hip_cm: 90,
      suggested_size: 'M',
    },
  },
  local_saved_items: {
    saved_outfits_3d: [
      {
        outfit_id: 'LOOK_001',
        title: 'Khuê Văn Tri Thức',
        outfit_type: 'NGU_THAN',
        primary_hex: '#2E8B57',
        date_saved: '2026-10-10',
      },
    ],
    saved_events: ['EVT_BACH_HOA_2026'],
    saved_articles: ['ART_DISCOVERY_01'],
    my_vouchers: [
      {
        voucher_code: 'DISCOUNT20_RENT',
        discount_percent: 20,
        description: 'Giảm 20% phí thuê tại Tiệm Hoa Niên',
        expiry_date: '2026-12-31',
      },
    ],
  },
  dummy_posts_community: [
    {
      post_id: 'POST_01',
      author: 'Minh_Anh_99',
      caption:
        'Check-in Văn Miếu mừng lễ tốt nghiệp với chiếc Áo Ngũ Thân xanh ngọc #VietPhucLookbook #VietPhucReal',
      platform: 'Instagram',
      likes_count: 142,
      outfit_config_id: 'CONFIG_NGU_THAN_GREEN',
      has_magic_refit: true,
    },
  ],
  dummy_marketplace_vendors: [
    {
      shop_id: 'SHOP_HOA_NIEN',
      shop_name: 'Tiệm Cổ Phục Hoa Niên',
      address: '24 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội',
      distance_meters: '350m từ Văn Miếu',
      rental_price_from: '250.000 VNĐ/ngày',
      rating_stars: 4.9,
    },
  ],
  dummy_passport_stamps: [
    {
      stamp_id: 'STAMP_VAN_MIEU',
      stamp_name: 'Văn Miếu Thăng Long',
      is_unlocked: true,
      unlocked_date: '2026-10-10',
    },
    {
      stamp_id: 'STAMP_HOANG_THANH',
      stamp_name: 'Hoàng Thành Thăng Long',
      is_unlocked: false,
      unlocked_date: null,
    },
  ],
};

export function initializeOrLoadVietPhucLocalStorage(): VietPhucLocalStorageV1Schema {
  if (typeof window === 'undefined') {
    return DEFAULT_VIETPHUC_LOCAL_STORAGE_SEED;
  }
  try {
    const raw = window.localStorage.getItem(VIETPHUC_LOCAL_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(
        VIETPHUC_LOCAL_STORAGE_KEY,
        JSON.stringify(DEFAULT_VIETPHUC_LOCAL_STORAGE_SEED)
      );
      return DEFAULT_VIETPHUC_LOCAL_STORAGE_SEED;
    }
    const parsed = JSON.parse(raw) as VietPhucLocalStorageV1Schema;
    if (!parsed || !parsed.user_profile || !parsed.local_saved_items) {
      window.localStorage.setItem(
        VIETPHUC_LOCAL_STORAGE_KEY,
        JSON.stringify(DEFAULT_VIETPHUC_LOCAL_STORAGE_SEED)
      );
      return DEFAULT_VIETPHUC_LOCAL_STORAGE_SEED;
    }
    return parsed;
  } catch {
    return DEFAULT_VIETPHUC_LOCAL_STORAGE_SEED;
  }
}

export function saveVietPhucLocalStorage(
  nextState: VietPhucLocalStorageV1Schema
): VietPhucLocalStorageV1Schema {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(VIETPHUC_LOCAL_STORAGE_KEY, JSON.stringify(nextState));
    } catch {
      // Ignore quota errors
    }
  }
  return nextState;
}

export function resetVietPhucLocalStorageToSeed(): {
  state: VietPhucLocalStorageV1Schema;
  mutation: LocalStorageMutationPreview;
} {
  const cloned = JSON.parse(
    JSON.stringify(DEFAULT_VIETPHUC_LOCAL_STORAGE_SEED)
  ) as VietPhucLocalStorageV1Schema;
  saveVietPhucLocalStorage(cloned);
  return {
    state: cloned,
    mutation: {
      updated_field: 'VIETPHUC_LOCAL_STORAGE_V1 (Full Seed Reset)',
      new_value_summary:
        'Đã khôi phục bộ dữ liệu mồi mặc định (USR_DEMO_001 · Nhi_CổPhục · 380 Điểm Di Sản · LOOK_001)',
    },
  };
}

/**
 * Mutation 1: Khi thực hiện hành động "Lưu Outfit 3D":
 * Thêm bản ghi mới vào `local_saved_items.saved_outfits_3d`.
 */
export function mutateSaveOutfit3DInLocalStorage(outfit: {
  outfit_id: string;
  title: string;
  outfit_type: 'NGU_THAN' | 'NHAT_BINH' | 'TU_THAN' | 'AO_DAI' | 'BA_BA';
  primary_hex: string;
}): {
  state: VietPhucLocalStorageV1Schema;
  mutation: LocalStorageMutationPreview;
} {
  const current = initializeOrLoadVietPhucLocalStorage();
  const exists = current.local_saved_items.saved_outfits_3d.some(
    (item) => item.outfit_id === outfit.outfit_id || item.title === outfit.title
  );

  const dateSaved = new Date().toISOString().slice(0, 10);
  const nextOutfits = exists
    ? current.local_saved_items.saved_outfits_3d.filter(
        (item) => item.outfit_id !== outfit.outfit_id && item.title !== outfit.title
      )
    : [
        {
          outfit_id: outfit.outfit_id,
          title: outfit.title,
          outfit_type: outfit.outfit_type,
          primary_hex: outfit.primary_hex,
          date_saved: dateSaved,
        },
        ...current.local_saved_items.saved_outfits_3d,
      ];

  const nextState: VietPhucLocalStorageV1Schema = {
    ...current,
    local_saved_items: {
      ...current.local_saved_items,
      saved_outfits_3d: nextOutfits,
    },
  };

  saveVietPhucLocalStorage(nextState);
  return {
    state: nextState,
    mutation: {
      updated_field: 'local_saved_items.saved_outfits_3d',
      new_value_summary: exists
        ? `Đã bỏ lưu "${outfit.title}" (${outfit.outfit_id}) · Tổng còn ${nextOutfits.length} outfit`
        : `Đã thêm "${outfit.title}" (${outfit.outfit_type}, ${outfit.primary_hex}) vào saved_outfits_3d (${nextOutfits.length} mục)`,
    },
  };
}

/**
 * Mutation 2: Khi thực hiện hành động "GPS Check-in Thành Công":
 * Chuyển `is_unlocked` trong `dummy_passport_stamps` thành `true`,
 * cộng `+100` vào `loyalty_points_balance`, và thêm Huy hiệu mới vào `unlocked_badges`.
 */
export function mutateGpsCheckInSuccessInLocalStorage(params: {
  stamp_id: string;
  stamp_name: string;
  new_badge_code?: string;
}): {
  state: VietPhucLocalStorageV1Schema;
  mutation: LocalStorageMutationPreview;
} {
  const current = initializeOrLoadVietPhucLocalStorage();
  const today = new Date().toISOString().slice(0, 10);

  const existingIdx = current.dummy_passport_stamps.findIndex(
    (s) => s.stamp_id === params.stamp_id
  );
  const nextStamps = [...current.dummy_passport_stamps];
  if (existingIdx >= 0) {
    nextStamps[existingIdx] = {
      ...nextStamps[existingIdx],
      is_unlocked: true,
      unlocked_date: today,
    };
  } else {
    nextStamps.push({
      stamp_id: params.stamp_id,
      stamp_name: params.stamp_name,
      is_unlocked: true,
      unlocked_date: today,
    });
  }

  const nextPoints = current.user_profile.loyalty_points_balance + 100;
  const badgeToUnlock = params.new_badge_code || 'BADGE_CO_DO_PHONG_HOA';
  const nextBadges = current.user_profile.unlocked_badges.includes(badgeToUnlock)
    ? current.user_profile.unlocked_badges
    : [...current.user_profile.unlocked_badges, badgeToUnlock];

  const nextState: VietPhucLocalStorageV1Schema = {
    ...current,
    user_profile: {
      ...current.user_profile,
      loyalty_points_balance: nextPoints,
      unlocked_badges: nextBadges,
    },
    dummy_passport_stamps: nextStamps,
  };

  saveVietPhucLocalStorage(nextState);
  return {
    state: nextState,
    mutation: {
      updated_field:
        'dummy_passport_stamps.is_unlocked, user_profile.loyalty_points_balance (+100), user_profile.unlocked_badges',
      new_value_summary: `Mở khóa con dấu "${params.stamp_name}" (${params.stamp_id}=true), cộng +100 điểm (Số dư mới: ${nextPoints}đ), mở khóa huy hiệu ${badgeToUnlock}`,
    },
  };
}

/**
 * Mutation 3: Khi thực hiện hành động "Đổi Voucher":
 * Trừ số điểm tương ứng ở `loyalty_points_balance` và đẩy mã voucher mới vào `my_vouchers`.
 */
export function mutateRedeemVoucherInLocalStorage(params: {
  voucher_code: string;
  discount_percent: number;
  description: string;
  expiry_date: string;
  points_cost: number;
}): {
  state: VietPhucLocalStorageV1Schema;
  mutation: LocalStorageMutationPreview;
} {
  const current = initializeOrLoadVietPhucLocalStorage();
  const nextBalance = Math.max(0, current.user_profile.loyalty_points_balance - params.points_cost);
  const alreadyHas = current.local_saved_items.my_vouchers.some(
    (v) => v.voucher_code === params.voucher_code
  );
  const nextVouchers = alreadyHas
    ? current.local_saved_items.my_vouchers
    : [
        {
          voucher_code: params.voucher_code,
          discount_percent: params.discount_percent,
          description: params.description,
          expiry_date: params.expiry_date,
        },
        ...current.local_saved_items.my_vouchers,
      ];

  const nextState: VietPhucLocalStorageV1Schema = {
    ...current,
    user_profile: {
      ...current.user_profile,
      loyalty_points_balance: nextBalance,
    },
    local_saved_items: {
      ...current.local_saved_items,
      my_vouchers: nextVouchers,
    },
  };

  saveVietPhucLocalStorage(nextState);
  return {
    state: nextState,
    mutation: {
      updated_field: 'user_profile.loyalty_points_balance & local_saved_items.my_vouchers',
      new_value_summary: `Trừ -${params.points_cost} điểm (Còn ${nextBalance}đ) & thêm voucher ${params.voucher_code} (${params.description})`,
    },
  };
}

// ============================================================================
// II. KỊCH BẢN SLIDE THUYẾT TRÌNH PITCH DECK (10 SLIDES HACKATHON STRUCTURE)
// ============================================================================

export interface HackathonPitchDeckSlide {
  slide_number: number;
  slide_code: string;
  title: string;
  subtitle: string;
  key_points: string[];
  demo_or_metric_highlight: string;
}

export const HACKATHON_PITCH_DECK_10_SLIDES: HackathonPitchDeckSlide[] = [
  {
    slide_number: 1,
    slide_code: 'SLIDE_01_TITLE_HOOK',
    title: '1. Title & Hook — VietAura',
    subtitle: 'Hệ sinh thái Fashion-Tech đánh thức di sản Việt phục ngàn năm cho thế hệ Gen Z',
    key_points: [
      'Hook: "Sẽ ra sao nếu mỗi bạn trẻ Việt Nam có thể ướm thử Áo Ngũ Thân, Nhật Bình chuẩn điển chế lên chính vóc dáng 3D của mình chỉ trong 3 giây?"',
      'Định vị: Nền tảng All-in-One kết hợp Phòng thử 3D/2D, AI Stylist kiểm duyệt văn hóa, Bản đồ di tích GPS & Sàn dịch vụ Thuê/May cổ phục.',
    ],
    demo_or_metric_highlight: '100% Client-Side Offline-Ready (VIETPHUC_LOCAL_STORAGE_V1) + AI Engine',
  },
  {
    slide_number: 2,
    slide_code: 'SLIDE_02_PROBLEM',
    title: '2. Problem — Rào cản khiến giới trẻ ngại diện Việt phục',
    subtitle: '3 nỗi sợ lớn của người trẻ và sự phân mảnh của thị trường cổ phục hiện tại',
    key_points: [
      'Nỗi sợ mặc sai cổ lệ (Cultural Misappropriation): Dễ phối nhầm phụ kiện khác giới tính hoặc dùng nhầm họa tiết Rồng 5 móng của Hoàng đế.',
      'Khó hình dung phom dáng & chi phí cao: Không biết chiều cao, cân nặng của mình mặc Áo Tấc hay Nhật Bình có bị cồng kềnh không.',
      'Thị trường phân mảnh: Tìm tiệm thuê/may uy tín gần các di tích lịch sử (Văn Miếu, Đại Nội Huế) mất nhiều thời gian.',
    ],
    demo_or_metric_highlight: '78% sinh viên khảo sát muốn mặc Việt phục dịp tốt nghiệp nhưng sợ phối sai quy chuẩn',
  },
  {
    slide_number: 3,
    slide_code: 'SLIDE_03_SOLUTION',
    title: '3. Solution — Hệ sinh thái 6 Module khép kín',
    subtitle: 'Từ ướm thử 3D -> Tư vấn AI -> Thuê/May tại chỗ -> Check-in Di tích tích điểm',
    key_points: [
      'Phòng thử 3D/2D & Mix-Match Studio tùy biến nhân trắc học (145–190cm) kèm chế độ Tối giản / Chuyên sâu.',
      'Trợ lý AI Stylist & Bộ lọc Culture Guard 2 chế độ (Cổ Chuẩn Strict Heritage vs. Tân Thời Modern Fusion).',
      'Bản đồ Di tích phân cấp (Hero Pins & Satellite Partner Pins) kết hợp Hộ chiếu Cổ phục & Sàn đối tác.',
    ],
    demo_or_metric_highlight: 'Vòng lặp trải nghiệm O2O (Online-to-Offline) hoàn chỉnh đầu tiên cho cổ phục Việt',
  },
  {
    slide_number: 4,
    slide_code: 'SLIDE_04_CORE_TECH',
    title: '4. Core Tech Innovation — Công nghệ lõi đột phá',
    subtitle: 'WebGL 3D Parametric Morphing + Hierarchical Culture Guard AI + Dual-Mode Offline Sync',
    key_points: [
      '3D Anthropometric Calibration: Tự động tính toán số đo 3 vòng và gợi ý Size (S/M/L/XL) theo chiều cao & khung xương.',
      'Culture Guard AI Engine: Kiểm duyệt tự động Rule 1 (Giới tính & Phụ kiện), Rule 2 (Rồng 5 móng), Rule 3 (Đồng bộ lễ phục) với nút [Auto-Fix 1-Touch].',
      'Local Storage Persistence (VIETPHUC_LOCAL_STORAGE_V1) & Offline Check-in Queue: Hoạt động mượt mà ngay cả khi mất mạng tại di tích.',
    ],
    demo_or_metric_highlight: 'Phản hồi <50ms ở Client-side · Đồng bộ JSON Schema chuẩn hóa toàn hệ thống',
  },
  {
    slide_number: 5,
    slide_code: 'SLIDE_05_LIVE_DEMO',
    title: '5. Live User Demo (3 Phút) — Hành trình của "Nhi_CổPhục"',
    subtitle: 'Kịch bản trình diễn trực tiếp trên dữ liệu mồi VIETPHUC_LOCAL_STORAGE_V1',
    key_points: [
      'Phút 1 (Phòng thử 3D & Culture Guard): Chọn Áo Ngũ Thân xanh ngọc (#2E8B57), thử bật lỗi phụ kiện và bấm [Auto-Fix 1-Touch], sau đó bấm [Lưu Outfit 3D].',
      'Phút 2 (So sánh thực tiễn & AI Stylist): Mở Bảng so sánh Bộ A vs Bộ B theo 5 tiêu chí thực tiễn (văn hóa, chi phí thị trường, độ cồng kềnh).',
      'Phút 3 (Bản đồ GPS Check-in & Đổi Voucher): Check-in Hoàng Thành Thăng Long mở khóa con dấu (+100 điểm lên 480đ) và đổi Voucher giảm 20% tại Tiệm Hoa Niên.',
    ],
    demo_or_metric_highlight: '3 Mutations trực tiếp trên Local Storage: Lưu Outfit -> Check-in +100đ -> Đổi Voucher',
  },
  {
    slide_number: 6,
    slide_code: 'SLIDE_06_BUSINESS_MODEL',
    title: '6. Business Model — Mô hình doanh thu đa luồng',
    subtitle: 'Kết hợp hoa hồng giao dịch sàn O2O, gói SaaS cho xưởng may và tài trợ du lịch văn hóa',
    key_points: [
      'Marketplace Commission (8–12%): Hoa hồng trên mỗi đơn đặt thuê Việt phục và đơn gửi số đo 3D may đo thành công.',
      'B2B Partner Subscription: Gói hiển thị Satellite Pin nổi bật quanh di tích & công cụ nhận số đo 3D tự động cho nhà may.',
      'Branded Cultural Campaigns: Hợp tác quảng bá lễ hội di sản, trường đại học mùa kỷ yếu và studio nhiếp ảnh.',
    ],
    demo_or_metric_highlight: 'AOV thuê: 280.000đ/đơn · AOV may đo: 2.500.000đ/đơn · CAC thấp nhờ lan tỏa Deep Link',
  },
  {
    slide_number: 7,
    slide_code: 'SLIDE_07_B2B_PARTNERSHIPS',
    title: '7. B2B Partnerships — Hệ sinh thái Đối tác & Di tích',
    subtitle: 'Liên kết chặt chẽ giữa Nhà may cổ phục, Ban quản lý Di tích và Cộng đồng sáng tạo',
    key_points: [
      'Đối tác Tiệm May & Cho Thuê (Ỷ Vân Hiên, Hoa Niên, Đông Phong...): Chuẩn hóa bảng size và nhận đơn may đo từ thông số 3D.',
      'Ban Quản lý Di tích (Văn Miếu, Hoàng Thành, Đại Nội Huế): Thúc đẩy du lịch trải nghiệm qua Hộ chiếu Cổ phục & Con dấu 3D.',
      'CLB Văn hóa & Nhiếp ảnh Sinh viên: Cung cấp kho tư liệu Single Source `heritage_id` chính xác.',
    ],
    demo_or_metric_highlight: 'Kết nối sẵn hệ thống Hero Pins (Di tích) và Satellite Pins (Tiệm đối tác bán kính 300m–1km)',
  },
  {
    slide_number: 8,
    slide_code: 'SLIDE_08_GO_TO_MARKET',
    title: '8. Go-To-Market — Chiến lược chiếm lĩnh thị trường trẻ',
    subtitle: 'Đánh trúng mùa Kỷ yếu – Tốt nghiệp, Lễ hội Mùa xuân và trào lưu #VietPhucLookbook',
    key_points: [
      'Chiến dịch Viral Deep Link & Magic Re-Fit 3D: Chia sẻ thẻ Lookbook 9:16 lên TikTok/Instagram kèm mã QR thử đồ 1 chạm.',
      'Gamification & Loyalty Loop: Tích điểm đa kênh (+20đ đăng bài, +100đ check-in, +10% đơn thuê) đổi voucher thực tế.',
      'Đồng hành cùng các sự kiện lớn: Bách Hoa Bộ Hành, Tuần lễ Cổ phục Huế, Mùa kỷ yếu tại các trường Đại học.',
    ],
    demo_or_metric_highlight: 'Viral Loop: 1 bài đăng #VietPhucLookbook -> Kéo 5 lượt thử Magic Re-Fit 3D mới',
  },
  {
    slide_number: 9,
    slide_code: 'SLIDE_09_ROADMAP',
    title: '9. Roadmap — Lộ trình phát triển sản phẩm',
    subtitle: 'Từ bản MVP Hackathon hoàn chỉnh đến nền tảng Di sản Số toàn quốc',
    key_points: [
      'Q4/2026 (Phase 1 - MVP & Pilot): Ra mắt 6 Module cốt lõi, vận hành tại Hà Nội & Huế với 15 tiệm cổ phục đối tác.',
      'Q1–Q2/2027 (Phase 2 - AR Try-On & AI Cloth Physics): Nâng cấp WebAR thử đồ qua camera thời gian thực và mở rộng vào TP.HCM, Hội An.',
      'Q3–Q4/2027 (Phase 3 - ASEAN Heritage Hub): Mở rộng kho dữ liệu trang phục các triều đại Lý – Trần – Lê và xuất khẩu mô hình du lịch di sản số.',
    ],
    demo_or_metric_highlight: 'Mục tiêu 100.000 người dùng Gen Z & 50+ xưởng cổ phục đối tác trong 12 tháng đầu',
  },
  {
    slide_number: 10,
    slide_code: 'SLIDE_10_CLOSING_VISION',
    title: '10. Closing Vision — Khi Di sản sống cùng Hơi thở Thời đại',
    subtitle: 'Đưa Việt phục từ tủ kính bảo tàng bước vào nhịp sống tự hào của thế hệ trẻ Việt Nam',
    key_points: [
      'VietAura không chỉ là một ứng dụng thử đồ — đó là chiếc cầu nối công nghệ để người trẻ hiểu đúng, mặc đẹp và tự hào về bản sắc Việt.',
      'Mỗi bộ cổ phục được khoác lên mình tại di tích là một lần lịch sử được tiếp nối sống động.',
    ],
    demo_or_metric_highlight: '"VietAura — Mặc Di Sản, Chạm Tương Lai"',
  },
];

export const WEEKLY_STYLING_CHALLENGES: WeeklyStylingChallengeItem[] = [
  {
    id: 'challenge-ngu-than-xuong-pho',
    hashtag: '#NgũThânXuốngPhố',
    title: 'Tuần 1: Ngũ Thân Xuống Phố Đương Đại',
    subtitle: 'Phối Áo Ngũ Thân tay chẽn ứng dụng dạo phố mùa thu, hài hòa giữa cổ lệ và nhịp sống trẻ.',
    rewardVoucherCode: 'VOUCHER_NGUTHAN_15',
    rewardTitle: 'Voucher Giảm 15% Thuê/May tại Ỷ Vân Hiên & Đông Phong',
    deadlineLabel: 'Còn 3 ngày bình chọn',
    participantsCount: 142,
    entries: [
      {
        entryId: 'entry-nt-01',
        author: '@minhchau.vp',
        outfitTitle: 'Ngũ Thân Ngọc Lam · Dạo phố Thu Hà Nội',
        votes: 318,
        imageUrl: HERITAGE_IMAGES.model2DNuNguThan,
        outfitConfig: {
          config_id: 'CFG_CHALLENGE_NGUTHAN_01',
          gender: 'nu',
          garmentId: 'ao-ngu-than',
          paletteId: 'khue-van-tri-thuc',
          lowerGarmentId: 'quan-lua-trang',
          motifId: 'am-hoa-tron',
          accessoryIds: ['khan-xep', 'quat-tram-huong'],
          footwearId: 'guoc-go-moc',
          occasionId: 'dao-pho',
          weatherId: 'thu-ha-noi',
          outerHex: '#2E8B57',
          innerHex: '#FFFFF0',
          lowerHex: '#FAF8F5',
        },
      },
      {
        entryId: 'entry-nt-02',
        author: '@hoangnam.cophuc',
        outfitTitle: 'Ngũ Thân Lam Cổ Điển · Thư Sinh Tràng An',
        votes: 284,
        imageUrl: HERITAGE_IMAGES.realMaleStudio,
        outfitConfig: {
          config_id: 'CFG_CHALLENGE_NGUTHAN_02',
          gender: 'nam',
          garmentId: 'ao-ngu-than',
          paletteId: 'thanh-phong-nien-hoa',
          lowerGarmentId: 'quan-lua-trang',
          motifId: 'chu-tho-trien',
          accessoryIds: ['khan-xep', 'quat-tram-huong'],
          footwearId: 'guoc-go-moc',
          occasionId: 'dao-pho',
          weatherId: 'thu-ha-noi',
          outerHex: '#1E3A8A',
          innerHex: '#FAF8F5',
          lowerHex: '#FAF8F5',
        },
      },
      {
        entryId: 'entry-nt-03',
        author: '@linhdan.heritage',
        outfitTitle: 'Nhật Bình Chu Sa · Cổ Đô Mùa Lễ Hội',
        votes: 259,
        imageUrl: HERITAGE_IMAGES.model2DNuNhatBinh,
        outfitConfig: {
          config_id: 'CFG_CHALLENGE_NHATBINH_03',
          gender: 'nu',
          garmentId: 'ao-nhat-binh',
          paletteId: 'chu-sa-ngu-uyen',
          lowerGarmentId: 'quan-lua-trang',
          motifId: 'phuong-vu-bat-buu',
          accessoryIds: ['man-doi-dau', 'xuyen-bac'],
          footwearId: 'hai-theu',
          occasionId: 'le-hoi-dan-gian',
          weatherId: 'xuan-am-ap',
          outerHex: '#9A3412',
          innerHex: '#D97706',
          lowerHex: '#FAF8F5',
        },
      },
    ],
  },
  {
    id: 'challenge-sac-mau-tot-nghiep',
    hashtag: '#SắcMàuTốtNghiệp',
    title: 'Tuần 2: Sắc Màu Kỷ Yếu & Tốt Nghiệp tại Văn Miếu',
    subtitle: 'Tôn vinh đạo học ngàn năm với bộ phối Áo Ngũ Thân Lập Lĩnh & Áo Tấc trang nghiêm.',
    rewardVoucherCode: 'VOUCHER_KYYEU_20',
    rewardTitle: 'Voucher Giảm 20% Combo Thuê Nhóm Kỷ Yếu (3+ người)',
    deadlineLabel: 'Còn 5 ngày bình chọn',
    participantsCount: 98,
    entries: [
      {
        entryId: 'entry-ky-01',
        author: '@thanhvien.ftu',
        outfitTitle: 'Áo Tấc Lễ Nghi · Tân Khoa Văn Miếu',
        votes: 412,
        imageUrl: HERITAGE_IMAGES.aoNhatBinh,
        outfitConfig: {
          config_id: 'CFG_CHALLENGE_AOTAC_01',
          gender: 'nam',
          garmentId: 'ao-nhat-binh',
          paletteId: 'thanh-phong-nien-hoa',
          lowerGarmentId: 'quan-lua-trang',
          motifId: 'chu-tho-trien',
          accessoryIds: ['khan-xep', 'quat-tram-huong'],
          footwearId: 'hai-theu',
          occasionId: 'tot-nghiep',
          weatherId: 'thu-ha-noi',
          outerHex: '#1E3A8A',
          innerHex: '#D97706',
          lowerHex: '#FAF8F5',
        },
      },
      {
        entryId: 'entry-ky-02',
        author: '@thaoanh.neu',
        outfitTitle: 'Tứ Thân Kinh Bắc · Hội Xuân Sinh Viên',
        votes: 245,
        imageUrl: HERITAGE_IMAGES.model2DNuTuThan,
        outfitConfig: {
          config_id: 'CFG_CHALLENGE_TUTHAN_02',
          gender: 'nu',
          garmentId: 'ao-tu-than',
          paletteId: 'kinh-bac-dao-hoa',
          lowerGarmentId: 'vay-dup-den',
          motifId: 'tu-quy-lien-hoa',
          accessoryIds: ['non-quai-thao', 'dai-lung-bao'],
          footwearId: 'guoc-go-moc',
          occasionId: 'tot-nghiep',
          weatherId: 'xuan-am-ap',
          outerHex: '#78350F',
          innerHex: '#B91C1C',
          lowerHex: '#18181B',
        },
      },
    ],
  },
];

// ============================================================================
// EDUTAINMENT STRATEGY (PHƯƠNG ÁN B - HỌC MÀ CHƠI):
// THẺ KIẾN THỨC DI SẢN SHORT-FORM (PGC CULTURAL KNOWLEDGE CARDS - 20% FEED)
// ============================================================================

export interface CulturalKnowledgeCardPGC {
  card_id: string;
  author_expert: string;
  expert_role: string;
  category_tag: string;
  fun_fact_hook: string;
  title: string;
  short_summary: string;
  bullet_points: string[];
  mini_quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    pointsReward: number;
  };
  imageUrl: string;
  location_query: string;
  relatedGarmentId: 'ao-ngu-than' | 'ao-nhat-binh' | 'ao-tu-than' | 'ao-dai-ba-ba';
  outfitConfig: OutfitConfigCode;
}

export const PGC_CULTURAL_KNOWLEDGE_CARDS: CulturalKnowledgeCardPGC[] = [
  {
    card_id: 'pgc-card-ngu-than-1744',
    author_expert: 'Viện Hán Nôm & Sử Học Y Phục',
    expert_role: 'Chuyên gia Điển chế · PGC Verified',
    category_tag: 'Bí Mật Cổ Lệ 1744',
    fun_fact_hook: 'Bạn có biết vì sao Áo Ngũ Thân luôn có đúng 5 vạt áo và 5 hạt cúc?',
    title: 'Mật mã đạo lý ẩn sau 5 vạt áo và đường sống lưng "Trung Phùng"',
    short_summary:
      'Không chỉ là thời trang, sắc dụ năm 1744 của Võ Vương Nguyễn Phúc Khoát đã biến chiếc Áo Ngũ Thân thành bài học đạo đức mặc trên người.',
    bullet_points: [
      '4 vạt thân ngoài tượng trưng cho Tứ Thân Phụ Mẫu (cha mẹ đẻ và cha mẹ vợ/chồng), vạt con thứ 5 bên trong tượng trưng cho chính bản thân người mặc.',
      '5 hạt khuy cài từ cổ xuống nách phải đại diện cho Ngũ Thường: Nhân – Nghĩa – Lễ – Trí – Tín.',
      'Đường khâu nối sống lưng (Trung Phùng) chạy thẳng tắp nhắc nhở người mặc luôn giữ tâm tính ngay thẳng.',
    ],
    mini_quiz: {
      question: '5 hạt khuy trên Áo Ngũ Thân Lập Lĩnh tượng trưng cho triết lý nào?',
      options: [
        'Ngũ Thường (Nhân, Nghĩa, Lễ, Trí, Tín)',
        'Ngũ Hành (Kim, Mộc, Thủy, Hỏa, Thổ)',
        'Ngũ Phúc Lâm Môn',
      ],
      correctIndex: 0,
      explanation:
        'Chính xác! 5 hạt khuy (kim hoàn, ngọc hoặc gỗ) nhắc nhở người quân tử giữ trọn 5 phẩm chất Nhân – Nghĩa – Lễ – Trí – Tín.',
      pointsReward: 15,
    },
    imageUrl: HERITAGE_IMAGES.realMaleStudio,
    location_query: 'Văn Miếu - Quốc Tử Giám, Hà Nội',
    relatedGarmentId: 'ao-ngu-than',
    outfitConfig: {
      config_id: 'PGC_CFG_NGUTHAN_01',
      gender: 'nam',
      garmentId: 'ao-ngu-than',
      paletteId: 'thanh-phong-nien-hoa',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'am-hoa-tron',
      accessoryIds: ['khan-xep', 'quat-tram-huong'],
      footwearId: 'guoc-go-moc',
      occasionId: 'le-nghi',
      weatherId: 'thu-ha-noi',
      outerHex: '#1E3A8A',
      innerHex: '#F5F5DC',
      lowerHex: '#F5F5DC',
    },
  },
  {
    card_id: 'pgc-card-nhat-binh-ngu-sac',
    author_expert: 'Trung Tâm Bảo Tồn Di Tích Cố Đô Huế',
    expert_role: 'Nghiên cứu Y phục Cung đình · PGC Verified',
    category_tag: 'Giải Phẫu Cung Đình',
    fun_fact_hook: 'Tại sao cổ áo Nhật Bình lại có hình chữ nhật và dải 5 màu ở cổ tay?',
    title: 'Giải mã Áo Nhật Bình: Từ Phi tần Nội cung đến Lễ phục Cưới hiện đại',
    short_summary:
      'Tên gọi "Nhật Bình" bắt nguồn từ khi cài dây buộc trước ngực, hai vạt cổ xẻ dọc ghép lại tạo thành hình chữ Nhật (日)端 trang.',
    bullet_points: [
      'Cổ áo chữ nhật to bản thêu hoa văn Loan Phượng, Bát Bửu phân định rõ phẩm cấp Hoàng hậu, Công chúa, Phi tần.',
      'Dải ngũ sắc (Lục – Hoàng – Lam – Bạch – Hồng) nơi tay áo biểu trưng cho mây ngũ sắc chốn cung đình.',
      'Khi ứng dụng hiện đại: Tuyệt đối tránh phối cùng quần Jeans/váy ngắn tại di tích tôn nghiêm (Quy tắc Culture Guard).',
    ],
    mini_quiz: {
      question: 'Tên gọi "Nhật Bình" bắt nguồn từ đặc điểm cấu trúc nào của áo?',
      options: [
        'Cổ áo khi ghép lại tạo thành hình chữ Nhật (日)',
        'Áo chỉ được mặc vào ban ngày khi có ánh mặt trời',
        'Hoa văn mặt trời thêu ở lưng áo',
      ],
      correctIndex: 0,
      explanation:
        'Chuẩn xác! Cổ áo đối khố bản rộng khi khép trước ngực tạo thành hình chữ Nhật (日) vuông vức, uy nghi.',
      pointsReward: 15,
    },
    imageUrl: HERITAGE_IMAGES.aoNhatBinh,
    location_query: 'Đại Nội Huế, Thừa Thiên Huế',
    relatedGarmentId: 'ao-nhat-binh',
    outfitConfig: {
      config_id: 'PGC_CFG_NHATBINH_02',
      gender: 'nu',
      garmentId: 'ao-nhat-binh',
      paletteId: 'chu-sa-ngu-uyen',
      lowerGarmentId: 'quan-lua-trang',
      motifId: 'phuong-vu-bat-buu',
      accessoryIds: ['man-doi-dau', 'xuyen-bac'],
      footwearId: 'hai-theu',
      occasionId: 'cuoi-hoi',
      weatherId: 'thu-ha-noi',
      outerHex: '#9A3412',
      innerHex: '#D97706',
      lowerHex: '#FAF8F5',
    },
  },
  {
    card_id: 'pgc-card-tu-than-kinh-bac',
    author_expert: 'Hội Di Sản Dân Ca Quan Họ Bắc Ninh',
    expert_role: 'Cố vấn Văn hóa Dân gian · PGC Verified',
    category_tag: 'Văn Hóa Kinh Bắc',
    fun_fact_hook: 'Nón Ba Tầm (Quai Thao) chỉ dành cho Liền Chị — Vì sao Nam giới không đội?',
    title: 'Nghệ thuật phối lớp "Mớ Ba Mớ Bảy" và quy tắc phụ kiện Quan Họ',
    short_summary:
      'Trong diễn xướng dân gian Bắc Bộ, trang phục Liền Anh (Áo Ngũ thân + Khăn xếp) và Liền Chị (Áo Tứ thân + Nón quai thao) có quy ước phân biệt rõ ràng.',
    bullet_points: [
      'Áo Tứ Thân gồm 2 vạt sau khâu liền và 2 vạt trước tách rời, buộc thắt nhẹ tôn lên lớp Yếm đào và Đai lưng bao lụa.',
      'Nón Ba Tầm (đường kính ~75cm, gắn tua thao tơ) là phụ kiện đặc trưng của nữ giới vùng Kinh Bắc, không phối với Áo Ngũ Thân nam.',
      'Váy đụp lụa đen buông rủ giúp bước chân uyển chuyển khi hát đối đáp trên thuyền rồng Hội Lim.',
    ],
    mini_quiz: {
      question: 'Theo bộ lọc Culture Guard, lỗi phối đồ nào sau đây vi phạm quy chuẩn Cổ Chuẩn?',
      options: [
        'Đội Nón Quai Thao với Áo Ngũ Thân Nam',
        'Phối Áo Tứ Thân với Yếm Đào và Váy Đụp Đen',
        'Đội Khăn Xếp với Áo Ngũ Thân Tay Chẽn',
      ],
      correctIndex: 0,
      explanation:
        'Chính xác! Nón Quai Thao là phụ kiện nữ giới đi cùng Áo Tứ Thân; Áo Ngũ Thân nam chuẩn mực đi cùng Khăn đóng/Khăn xếp.',
      pointsReward: 15,
    },
    imageUrl: HERITAGE_IMAGES.festivalHoiLim,
    location_query: 'Chùa Thầy, Sài Sơn, Quốc Oai, Hà Nội',
    relatedGarmentId: 'ao-tu-than',
    outfitConfig: {
      config_id: 'PGC_CFG_TUTHAN_03',
      gender: 'nu',
      garmentId: 'ao-tu-than',
      paletteId: 'kinh-bac-dao-hoa',
      lowerGarmentId: 'vay-dup-den',
      motifId: 'tu-quy-lien-hoa',
      accessoryIds: ['non-quai-thao', 'dai-lung-bao'],
      footwearId: 'guoc-go-moc',
      occasionId: 'le-nghi',
      weatherId: 'xuan-am-ap',
      outerHex: '#78350F',
      innerHex: '#B91C1C',
      lowerHex: '#18181B',
    },
  },
];

// ============================================================================
// GLOBAL HEADER UTILITIES: QUẢN LÝ SỐ ĐO TÀI KHOẢN TỐI GIẢN (PROGRESSIVE DISCLOSURE)
// & MANDATORY ACCOUNT PROFILE JSON OUTPUT SCHEMA
// ============================================================================

export type BodyShapePresetCode =
  | 'CAN_DOI'
  | 'MANH_MAI'
  | 'DAY_DAN'
  | 'CAO_RAO'
  | 'NHO_NHAN';

export interface UserAnthropometricMeasurements {
  height_cm: number;
  weight_kg: number;
  suggested_size: 'S' | 'M' | 'L' | 'XL';
  shoulder_width_cm: number;
  chest_cm: number;
  waist_cm: number;
  hip_cm: number;
  sleeve_length_cm: number;
  body_shape_preset: BodyShapePresetCode;
  fit_score_percent: number;
}

export const INITIAL_USER_MEASUREMENTS: UserAnthropometricMeasurements = {
  height_cm: 162,
  weight_kg: 50,
  suggested_size: 'M',
  shoulder_width_cm: 38,
  chest_cm: 84,
  waist_cm: 64,
  hip_cm: 90,
  sleeve_length_cm: 52,
  body_shape_preset: 'CAN_DOI',
  fit_score_percent: 96,
};

export function computeSuggestedSizeFromMeasurements(
  heightCm: number,
  weightKg: number,
  chestCm: number
): 'S' | 'M' | 'L' | 'XL' {
  if (heightCm < 156 || (weightKg < 46 && chestCm <= 80)) return 'S';
  if (heightCm <= 165 && weightKg <= 55 && chestCm <= 88) return 'M';
  if (heightCm <= 174 && weightKg <= 68 && chestCm <= 96) return 'L';
  return 'XL';
}

export interface MandatoryAccountProfileJsonSchema {
  system_state: {
    active_tab: 'GLOBAL_HEADER_USER_ACCOUNT';
    account_view_mode: 'MINIMAL_VIEW' | 'ADVANCED_EDIT';
    styling_mode: 'STRICT_HERITAGE' | 'MODERN_FUSION';
    local_storage_key: 'VIETPHUC_LOCAL_STORAGE_V1';
  };
  user_account_profile: {
    user_id: string;
    username: string;
    display_title: string;
    pinned_badge: string;
    minimal_measurement_summary: {
      height_cm: number;
      weight_kg: number;
      suggested_size: 'S' | 'M' | 'L' | 'XL';
    };
    advanced_anthropometric_details: {
      shoulder_width_cm: number;
      chest_cm: number;
      waist_cm: number;
      hip_cm: number;
      sleeve_length_cm: number;
      body_shape_preset: BodyShapePresetCode;
    };
  };
  b2b_messaging_payload: {
    is_measurement_export_ready: boolean;
    formatted_measurement_payload: string;
  };
  culture_guard_result: {
    status: 'APPROVED' | 'WARNING' | 'REJECTED';
    applied_rule: string;
    culture_tip_message: string;
    auto_fix_available: boolean;
  };
}

export function buildMandatoryAccountProfileJson(params: {
  accountViewMode: 'MINIMAL_VIEW' | 'ADVANCED_EDIT';
  stylingMode?: 'STRICT_HERITAGE' | 'MODERN_FUSION';
  username?: string;
  displayTitleCode?: string;
  pinnedBadgeId?: string;
  measurements: UserAnthropometricMeasurements;
  selection: StudioSelection;
}): MandatoryAccountProfileJsonSchema {
  const {
    accountViewMode,
    stylingMode = 'STRICT_HERITAGE',
    username = 'Nhi_CổPhục',
    displayTitleCode = 'THO_PHOI_TAP_SU',
    pinnedBadgeId = 'BADGE_THANG_LONG',
    measurements,
    selection,
  } = params;

  const violations = evaluateCultureGuard(selection, stylingMode, false);
  const firstViolation = violations[0];
  const guardStatus: 'APPROVED' | 'WARNING' | 'REJECTED' = !firstViolation
    ? 'APPROVED'
    : firstViolation.severity === 'critical'
    ? 'REJECTED'
    : 'WARNING';

  const b2bCompactPayload = JSON.stringify({
    size: measurements.suggested_size,
    height_cm: measurements.height_cm,
    weight_kg: measurements.weight_kg,
    shoulder_cm: measurements.shoulder_width_cm,
    chest_cm: measurements.chest_cm,
    waist_cm: measurements.waist_cm,
    hip_cm: measurements.hip_cm,
    sleeve_cm: measurements.sleeve_length_cm,
    preset: measurements.body_shape_preset,
  });

  return {
    system_state: {
      active_tab: 'GLOBAL_HEADER_USER_ACCOUNT',
      account_view_mode: accountViewMode,
      styling_mode: stylingMode,
      local_storage_key: 'VIETPHUC_LOCAL_STORAGE_V1',
    },
    user_account_profile: {
      user_id: 'USR_DEMO_001',
      username,
      display_title: displayTitleCode,
      pinned_badge: pinnedBadgeId,
      minimal_measurement_summary: {
        height_cm: measurements.height_cm,
        weight_kg: measurements.weight_kg,
        suggested_size: measurements.suggested_size,
      },
      advanced_anthropometric_details: {
        shoulder_width_cm: measurements.shoulder_width_cm,
        chest_cm: measurements.chest_cm,
        waist_cm: measurements.waist_cm,
        hip_cm: measurements.hip_cm,
        sleeve_length_cm: measurements.sleeve_length_cm,
        body_shape_preset: measurements.body_shape_preset,
      },
    },
    b2b_messaging_payload: {
      is_measurement_export_ready: true,
      formatted_measurement_payload: b2bCompactPayload,
    },
    culture_guard_result: {
      status: guardStatus,
      applied_rule: firstViolation
        ? firstViolation.title
        : 'RULE_ALL_PASSED (Đạt chuẩn cổ lệ Việt phục)',
      culture_tip_message: firstViolation
        ? firstViolation.message
        : 'Bộ phối hiện tại hoàn toàn tuân thủ quy chuẩn cổ lệ và đồng bộ số đo nhân trắc học 3D.',
      auto_fix_available: Boolean(firstViolation),
    },
  };
}










