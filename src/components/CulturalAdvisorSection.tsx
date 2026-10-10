import React, { useState, useEffect, useRef } from 'react';
import {
  Wand2,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  ChevronDown,
  Cuboid,
  Archive,
  Copy,
  Check,
  Code2,
  SlidersHorizontal,
  ArrowUp,
  RotateCcw,
  Share2,
  Columns2,
  X,
  Ruler,
  Calendar,
  Search,
} from 'lucide-react';
import {
  LookbookCardData,
  CURATED_LOOKBOOKS,
  StudioSelection,
  HERITAGE_GARMENTS,
  LOOKBOOK_PALETTES,
  LOWER_GARMENT_OPTIONS,
  MOTIF_OPTIONS,
  ACCESSORY_OPTIONS,
  FOOTWEAR_OPTIONS,
  OCCASION_OPTIONS,
  WEATHER_OPTIONS,
  StylistConsultationResponse,
  StylistOptionData,
  OutfitConfigCode,
  UserAnthropometricMeasurements,
  INITIAL_USER_MEASUREMENTS,
  get2DModelImageForSelection,
  getGenderAwareGarmentInfo,
  decodeDeepLinkPayloadToSelection,
} from '../data/vietPhucData';
import { LookbookCardView } from './LookbookCardView';
import { MiniLookbookDrawer } from './MiniLookbookDrawer';
import { LookbookStudioModal } from './LookbookStudioModal';

export interface AdvisorMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  lookbookCard?: LookbookCardData;
  consultation?: StylistConsultationResponse;
  timestamp: string;
}

export type DirectContactCategory = 'ai_special' | 'tailor_business' | 'user_account';

export interface DirectChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
  attached3DOutfit?: {
    title: string;
    subtitle: string;
    config: OutfitConfigCode;
  };
  attachedMeasurements?: {
    heightCm: number;
    chestCm: number;
    waistCm: number;
    hipCm: number;
    garmentName: string;
  };
}

export interface MessagingThread {
  id: string;
  name: string;
  handle: string;
  category: DirectContactCategory;
  roleBadge: string;
  avatarText: string;
  online: boolean;
  locationAddress?: string;
  specialty?: string;
  unreadCount?: number;
  messages: DirectChatMessage[];
}

interface CulturalAdvisorSectionProps {
  studioSelection: StudioSelection;
  onApplyCardToStudio: (card: LookbookCardData) => void;
  onApplyOutfitConfigToStudio?: (config: OutfitConfigCode) => void;
  onSaveLookbook: (card: LookbookCardData) => void;
  savedIds: string[];
  allLookbooks?: LookbookCardData[];
  externalPromptTrigger: { id: number; prompt: string } | null;
  userMeasurements?: UserAnthropometricMeasurements;
  externalSendMeasurementsTrigger?: number | null;
}

const INITIAL_CONSULTATION: StylistConsultationResponse = {
  part1Summary: {
    event: 'Lễ tốt nghiệp',
    weather: 'Mùa thu / Cool',
    style: 'Cổ điển trang trọng',
    budget: 'Tiết kiệm (Sinh viên)',
    overviewText:
      'Gợi ý 3 phương án Lookbook 3D cho Lễ tốt nghiệp mùa thu Hà Nội theo phong cách cổ điển trang trọng, tối ưu ngân sách sinh viên.',
  },
  part2Options: [
    {
      optionNumber: 1,
      outfitName: 'Khuê Văn Tri Thức — Ngũ Thân Tay Chẽn',
      styleLabel: 'Cổ điển trang trọng',
      budgetTier: 'Tiết kiệm',
      mainGarment:
        'Áo Ngũ Thân tay chẽn vải tơ đũi Xanh Ngọc Lam, áo lót cổ đứng trắng ngà phối quần lụa trắng ống rộng.',
      accessories: ['Khăn xếp đồng bộ', 'Guốc gỗ mộc', 'Quạt xếp trầm hương'],
      palette: [
        { name: 'Xanh Ngọc Lam', hex: '#2E8B57', role: 'Áo ngoài' },
        { name: 'Trắng Ngà', hex: '#FFFFF0', role: 'Áo lót & Quần' },
        { name: 'Gỗ Trầm', hex: '#8B4513', role: 'Guốc & Quạt' },
      ],
      culturalMeaning:
        'Định hình năm 1744; 5 vạt áo tượng trưng cho Tứ thân phụ mẫu chở che người con, 5 hạt khuy đại diện cho Ngũ Thường (Nhân, Lễ, Nghĩa, Trí, Tín).',
      outfitConfigCode: {
        config_id: 'CFG_OPT1_NGUTHAN_NU',
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
      optionNumber: 2,
      outfitName: 'Thanh Phong Niên Hoa — Ngũ Thân Lam Cổ Điển',
      styleLabel: 'Tối giản thanh lịch',
      budgetTier: 'Phổ thông',
      mainGarment:
        'Áo Ngũ Thân lụa nha xá màu Lam Cổ Điển dệt hoa chìm Liên Hoa, mặc ngoài áo lót trắng và quần lụa ngà.',
      accessories: ['Khăn xếp lam thẫm', 'Quạt xếp nan trúc', 'Guốc gỗ mộc'],
      palette: [
        { name: 'Lam Cổ Điển', hex: '#1E3A8A', role: 'Áo ngoài' },
        { name: 'Thanh Trúc', hex: '#4D7C0F', role: 'Điểm nhấn' },
        { name: 'Ngà Lụa', hex: '#F5F5DC', role: 'Áo lót & Quần' },
      ],
      culturalMeaning:
        'Giữ trọn quy chuẩn cổ lập lĩnh 5 khuy thời Minh Mạng với sắc lam trầm tĩnh tại, tôn vinh vẻ đẹp trí thức trẻ trung.',
      outfitConfigCode: {
        config_id: 'CFG_OPT2_THANHPHONG_NU',
        gender: 'nu',
        garmentId: 'ao-ngu-than',
        paletteId: 'thanh-phong-nien-hoa',
        lowerGarmentId: 'quan-lua-trang',
        motifId: 'tu-quy-lien-hoa',
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
      optionNumber: 3,
      outfitName: 'Chu Sa Ngự Uyển — Nhật Bình Kỷ Yếu',
      styleLabel: 'Cổ điển lộng lẫy',
      budgetTier: 'Cao cấp',
      mainGarment:
        'Áo Nhật Bình gấm Đỏ Chu Sa thêu Loan Phượng, tay rộng viền dải ngũ sắc Ngũ Hành phối quần lụa trắng Bạch Ngọc.',
      accessories: ['Mấn đội đầu cung đình', 'Xuyến bạc chạm khắc', 'Hài thêu mũi cong'],
      palette: [
        { name: 'Đỏ Chu Sa', hex: '#9A3412', role: 'Áo Nhật Bình' },
        { name: 'Hoàng Kim', hex: '#D97706', role: 'Viền ngũ sắc' },
        { name: 'Bạch Ngọc', hex: '#FAF8F5', role: 'Quần lụa' },
      ],
      culturalMeaning:
        'Thường phục Hậu phi, Công chúa triều Nguyễn; cổ chữ nhật uy nghi kết hợp 5 sắc màu Kim - Mộc - Thủy - Hỏa - Thổ nơi cổ tay.',
      outfitConfigCode: {
        config_id: 'CFG_OPT3_NHATBINH_NU',
        gender: 'nu',
        garmentId: 'ao-nhat-binh',
        paletteId: 'chu-sa-ngu-uyen',
        lowerGarmentId: 'quan-lua-trang',
        motifId: 'phuong-vu-bat-buu',
        accessoryIds: ['man-doi-dau', 'xuyen-bac'],
        footwearId: 'hai-theu',
        occasionId: 'tot-nghiep',
        weatherId: 'thu-ha-noi',
        outerHex: '#9A3412',
        innerHex: '#D97706',
        lowerHex: '#FAF8F5',
      },
    },
  ],
  part3CultureGuard: {
    status: 'Approved',
    statusLabel: '🟢 Đã kiểm duyệt (Approved)',
    hasViolation: false,
    violatedRule: null,
    detailNote:
      'Cả 3 phương án đều tuân thủ nghiêm ngặt cổ lệ: Phụ kiện đúng giới tính (Rule 1), Hoa văn đúng phẩm cấp không dùng Rồng 5 móng (Rule 2), Quần lụa ống rộng & Guốc mộc đồng bộ (Rule 3).',
  },
  formattedMarkdownReport: `----------------------------------------------------------------------
[PHẦN 1: TỔNG QUAN PHÂN TÍCH BỞI AI STYLIST]
• Sự kiện: Lễ tốt nghiệp · Thời tiết: Mùa thu / Cool · Phong cách: Cổ điển trang trọng · Ngân sách: Tiết kiệm (Sinh viên)
• Nhận định: Gợi ý 3 phương án Lookbook 3D cho Lễ tốt nghiệp mùa thu Hà Nội theo phong cách cổ điển trang trọng, tối ưu ngân sách sinh viên.

[PHẦN 2: 3 PHƯƠNG ÁN LOOKBOOK GỢI Ý]

🌟 OPTION 1: "Khuê Văn Tri Thức — Ngũ Thân Tay Chẽn"
• Trang phục chính: Áo Ngũ Thân tay chẽn vải tơ đũi Xanh Ngọc Lam, áo lót cổ đứng trắng ngà phối quần lụa trắng ống rộng.
• Phụ kiện quy chuẩn: Khăn xếp đồng bộ, Guốc gỗ mộc, Quạt xếp trầm hương
• Bảng màu (Palette): Xanh Ngọc Lam (#2E8B57 - Áo ngoài) · Trắng Ngà (#FFFFF0 - Áo lót & Quần) · Gỗ Trầm (#8B4513 - Guốc & Quạt)
• Ý nghĩa văn hóa & Lịch sử: Định hình năm 1744; 5 vạt áo tượng trưng cho Tứ thân phụ mẫu chở che người con, 5 hạt khuy đại diện cho Ngũ Thường (Nhân, Lễ, Nghĩa, Trí, Tín).
• Mã Cấu Hình 3D (Outfit Config Code): {"config_id":"CFG_OPT1_NGUTHAN_NU","gender":"nu","garmentId":"ao-ngu-than","paletteId":"khue-van-tri-thuc","lowerGarmentId":"quan-lua-trang","motifId":"am-hoa-tron","accessoryIds":["khan-xep","quat-tram-huong"],"footwearId":"guoc-go-moc","occasionId":"tot-nghiep","weatherId":"thu-ha-noi","outerHex":"#2E8B57","innerHex":"#FFFFF0","lowerHex":"#FFFFF0"}
----------------------------------------------------------------------`,
  lookbookCard: CURATED_LOOKBOOKS[0],
};

const INITIAL_MESSAGES: AdvisorMessage[] = [
  {
    id: 'msg-few-shot-user',
    role: 'user',
    text: 'Gợi ý Việt phục chụp ảnh tốt nghiệp mùa thu Hà Nội, trang trọng, ngân sách sinh viên?',
    timestamp: 'Mẫu câu hỏi',
  },
  {
    id: 'msg-few-shot-assistant',
    role: 'assistant',
    text: INITIAL_CONSULTATION.part1Summary.overviewText,
    lookbookCard: CURATED_LOOKBOOKS[0],
    consultation: INITIAL_CONSULTATION,
    timestamp: 'AI Stylist',
  },
];

const INITIAL_DIRECT_THREADS: MessagingThread[] = [
  {
    id: 'tailor-y-van-hien',
    name: 'Ỷ Vân Hiên',
    handle: '@yvanhien.atelier',
    category: 'tailor_business',
    roleBadge: 'Tiệm may & cho thuê',
    avatarText: 'Ỷ',
    online: true,
    locationAddress: '36 Hàng Gai, Hoàn Kiếm, Hà Nội',
    specialty: 'May đo 3D & Cho thuê Áo Ngũ Thân, Nhật Bình',
    unreadCount: 1,
    messages: [
      {
        id: 'yvh-1',
        sender: 'them',
        text: 'Xin chào! Ỷ Vân Hiên hiện có sẵn các mẫu Áo Ngũ Thân Tay Chẽn lụa nha xá cho mùa kỷ yếu & tốt nghiệp (từ 250.000đ/ngày).',
        timestamp: '09:15',
      },
      {
        id: 'yvh-2',
        sender: 'them',
        text: 'Bạn có thể gửi số đo 3D hoặc đính kèm mẫu đang thử ở Phòng thử 3D để tiệm báo giá may đo hoặc giữ lịch thuê ngay nhé!',
        timestamp: '09:16',
      },
    ],
  },
  {
    id: 'tailor-hoang-cung-hue',
    name: 'Cổ Trang Hoàng Cung Huế',
    handle: '@hoangcunghue.tailor',
    category: 'tailor_business',
    roleBadge: 'Nhà may cung đình',
    avatarText: 'H',
    online: true,
    locationAddress: '23 Lê Huân, Thuận Hòa, TP. Huế',
    specialty: 'Chuyên Áo Nhật Bình thêu tay & Mấn kim hoàn',
    messages: [
      {
        id: 'hch-1',
        sender: 'me',
        text: 'Chào tiệm, thời gian hoàn thiện một bộ Áo Nhật Bình Chu Sa theo số đo 3D là bao lâu ạ?',
        timestamp: 'Hôm qua',
      },
      {
        id: 'hch-2',
        sender: 'them',
        text: 'Dạ với phom Nhật Bình gấm thêu theo số đo 3D cá nhân, xưởng hoàn thiện trong 7–10 ngày. Nếu cần gấp, tiệm có sẵn size chuẩn để thuê liền ạ.',
        timestamp: 'Hôm qua',
      },
    ],
  },
  {
    id: 'tailor-dong-phong',
    name: 'Đông Phong Studio',
    handle: '@dongphong.saigon',
    category: 'tailor_business',
    roleBadge: 'Tiệm may & cho thuê',
    avatarText: 'Đ',
    online: false,
    locationAddress: '115 Nguyễn Thái Bình, Quận 1, TP.HCM',
    specialty: 'Áo Ngũ Thân, Áo Tứ Thân & Cổ phục',
    messages: [
      {
        id: 'dp-1',
        sender: 'them',
        text: 'Đông Phong Studio vừa cập nhật bảng màu lụa tơ đũi mới. Bạn cần tư vấn size thuê hay đặt may riêng cứ nhắn tiệm nhé!',
        timestamp: 'Thứ 3',
      },
    ],
  },
  {
    id: 'user-linh-chi',
    name: 'Linh Chi',
    handle: '@linhchi.cophuc',
    category: 'user_account',
    roleBadge: 'Thành viên',
    avatarText: 'L',
    online: true,
    unreadCount: 1,
    messages: [
      {
        id: 'lc-1',
        sender: 'me',
        text: 'Chi ơi bộ Áo Ngũ Thân Xanh Ngọc Lam bạn mặc chụp tốt nghiệp ở Văn Miếu đẹp quá!',
        timestamp: '10:20',
      },
      {
        id: 'lc-2',
        sender: 'them',
        text: 'Cảm ơn bạn nha! Mình gửi mã cấu hình 3D dưới đây, bạn bấm thử lên người mẫu được luôn đó!',
        timestamp: '10:22',
        attached3DOutfit: {
          title: 'Khuê Văn Tri Thức — Ngũ Thân Tay Chẽn',
          subtitle: 'Xanh Ngọc Lam (#2E8B57) · Quần lụa trắng',
          config: INITIAL_CONSULTATION.part2Options[0].outfitConfigCode,
        },
      },
    ],
  },
  {
    id: 'user-minh-khoi',
    name: 'Minh Khôi',
    handle: '@minhkhoi.heritage',
    category: 'user_account',
    roleBadge: 'Thành viên',
    avatarText: 'M',
    online: false,
    messages: [
      {
        id: 'mk-1',
        sender: 'them',
        text: 'Cuối tuần này nhóm mình có buổi chụp tư liệu Áo Ngũ Thân tại Hoàng Thành, bạn rảnh thì tham gia cùng nhé!',
        timestamp: '2 ngày',
      },
    ],
  },
  {
    id: 'user-bao-tram',
    name: 'Bảo Trâm Analog',
    handle: '@baotram.analog',
    category: 'user_account',
    roleBadge: 'Nhiếp ảnh',
    avatarText: 'B',
    online: true,
    messages: [
      {
        id: 'bt-1',
        sender: 'them',
        text: 'Chụp cổ phục bằng máy phim nhớ chọn khung giờ 15h30–17h00 để lên độ bóng của lụa đẹp nhất nha.',
        timestamp: '3 ngày',
      },
    ],
  },
];

const QUICK_PROMPTS = [
  {
    label: 'Tốt nghiệp thu Hà Nội',
    prompt:
      'Mình muốn tìm một bộ Việt phục đi chụp ảnh tốt nghiệp vào mùa thu ở Hà Nội, vừa trang trọng vừa hợp túi tiền sinh viên thì nên chọn gì?',
    isCultureGuardTest: false,
  },
  {
    label: 'Hội xuân Quan họ',
    prompt:
      'Mình là nữ, muốn mặc cổ phục đi trảy hội mùa xuân ở Bắc Ninh và chụp ảnh diễn xướng dân gian thì nên phối bộ nào?',
    isCultureGuardTest: false,
  },
  {
    label: 'Lễ cưới cung đình',
    prompt:
      'Mình sắp tổ chức lễ ăn hỏi và chụp ảnh cưới truyền thống, muốn tìm 3 phương án lễ phục cung đình rực rỡ.',
    isCultureGuardTest: false,
  },
  {
    label: 'Quy tắc 1: Nam đội Nón quai thao',
    prompt:
      'Mình là nam sinh viên, định mặc Áo Ngũ Thân phối với Nón quai thao đi chụp kỷ yếu cho độc lạ thì có hợp văn hóa không?',
    isCultureGuardTest: true,
  },
  {
    label: 'Quy tắc 2: Thêu Rồng 5 móng',
    prompt:
      'Mình muốn đặt may Áo Ngũ Thân thêu họa tiết Rồng 5 móng để mặc đi du xuân ngày Tết có được không?',
    isCultureGuardTest: true,
  },
  {
    label: 'Quy tắc 3: Nhật Bình + Quần jeans',
    prompt:
      'Mình định mặc Áo Nhật Bình phối cùng chân váy đụp ngắn trên gối hoặc quần jeans và giày sneaker cho năng động thì sao?',
    isCultureGuardTest: true,
  },
];

export const CulturalAdvisorSection: React.FC<CulturalAdvisorSectionProps> = ({
  studioSelection,
  onApplyCardToStudio,
  onApplyOutfitConfigToStudio,
  onSaveLookbook,
  savedIds,
  allLookbooks = CURATED_LOOKBOOKS,
  externalPromptTrigger,
  userMeasurements = INITIAL_USER_MEASUREMENTS,
  externalSendMeasurementsTrigger,
}) => {
  const [activeThreadId, setActiveThreadId] = useState<string>('tailor-y-van-hien');
  const [inboxFilter, setInboxFilter] = useState<'ALL' | 'tailor_business' | 'user_account'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Direct Threads State
  const [directThreads, setDirectThreads] = useState<MessagingThread[]>(INITIAL_DIRECT_THREADS);
  const [directInput, setDirectInput] = useState<string>('');

  // Special Sub-Module: AI Stylist State
  const [messages, setMessages] = useState<AdvisorMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 4 Input Variables for AI Stylist
  const [stepEvent, setStepEvent] = useState('Lễ tốt nghiệp');
  const [stepWeather, setStepWeather] = useState('Mùa thu (Mát mẻ)');
  const [stepStyle, setStepStyle] = useState('Cổ điển trang trọng');
  const [stepBudget, setStepBudget] = useState('Tiết kiệm (Sinh viên)');

  // Popovers & Drawers inside AI Stylist
  const [quizPopoverOpen, setQuizPopoverOpen] = useState<boolean>(false);
  const [promptsOpen, setPromptsOpen] = useState<boolean>(false);
  const [rulesDrawerOpen, setRulesDrawerOpen] = useState<boolean>(false);
  const [collectionDrawerOpen, setCollectionDrawerOpen] = useState<boolean>(false);
  const [lookbookModalOpen, setLookbookModalOpen] = useState<boolean>(false);
  const [lookbookModalTab, setLookbookModalTab] = useState<'export' | 'compare'>('export');
  const [compareIds, setCompareIds] = useState<[string, string] | undefined>(undefined);

  // Per-message active Option tab (1 | 2 | 3) & extendable drawers
  const [activeOptionByMsg, setActiveOptionByMsg] = useState<Record<string, 1 | 2 | 3>>({});
  const [expandedDetailsByMsg, setExpandedDetailsByMsg] = useState<Record<string, boolean>>({});
  const [expandedCodeByMsg, setExpandedCodeByMsg] = useState<Record<string, boolean>>({});
  const [expandedGuardByMsg, setExpandedGuardByMsg] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const lastHandledTriggerRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const directChatEndRef = useRef<HTMLDivElement | null>(null);

  const getActiveOption = (msgId: string): 1 | 2 | 3 => activeOptionByMsg[msgId] || 1;

  const setActiveOption = (msgId: string, optNum: 1 | 2 | 3) => {
    setActiveOptionByMsg((prev) => ({ ...prev, [msgId]: optNum }));
  };

  const toggleDetails = (msgId: string) => {
    setExpandedDetailsByMsg((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const toggleCode = (msgId: string) => {
    setExpandedCodeByMsg((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const toggleGuard = (msgId: string) => {
    setExpandedGuardByMsg((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const convertOptionToLookbookCard = (
    opt: StylistOptionData,
    consultation: StylistConsultationResponse
  ): LookbookCardData => ({
    id: `ai-opt-${opt.outfitConfigCode.config_id}`,
    outfitName: opt.outfitName,
    mainGarment: opt.mainGarment,
    accessories: opt.accessories,
    palette: opt.palette,
    occasionAndWeather: `${consultation.part1Summary.event} · ${consultation.part1Summary.weather}`,
    culturalMeaning: opt.culturalMeaning,
    cultureGuardNote: `${consultation.part3CultureGuard.statusLabel} — ${consultation.part3CultureGuard.detailNote}`,
    hasViolation: consultation.part3CultureGuard.hasViolation,
    garmentId: opt.outfitConfigCode.garmentId,
    imageUrl: get2DModelImageForSelection(
      opt.outfitConfigCode.gender,
      opt.outfitConfigCode.garmentId,
      'studio'
    ).studioUrl,
  });

  const buildCurrentStudioConfig = (): {
    title: string;
    subtitle: string;
    config: OutfitConfigCode;
  } => {
    const garment = getGenderAwareGarmentInfo(studioSelection.garmentId, studioSelection.gender);
    const palette = LOOKBOOK_PALETTES.find((p) => p.id === studioSelection.paletteId);
    const lower = LOWER_GARMENT_OPTIONS.find((l) => l.id === studioSelection.lowerGarmentId);
    return {
      title: `${garment?.name || 'Việt Phục'} — ${palette?.name || 'Cổ Điển'}`,
      subtitle: `${studioSelection.gender === 'nam' ? 'Nam' : 'Nữ'} · ${lower?.label || 'Quần lụa'}`,
      config: {
        config_id: `CFG_CHAT_${Date.now().toString().slice(-4)}`,
        gender: studioSelection.gender,
        garmentId: studioSelection.garmentId as OutfitConfigCode['garmentId'],
        paletteId: studioSelection.paletteId,
        lowerGarmentId: studioSelection.lowerGarmentId,
        motifId: studioSelection.motifId,
        accessoryIds: studioSelection.accessoryIds,
        footwearId: studioSelection.footwearId,
        occasionId: studioSelection.occasionId,
        weatherId: studioSelection.weatherId,
        outerHex: palette?.swatches[0]?.hex || '#2E8B57',
        innerHex: palette?.swatches[1]?.hex || '#FFFFF0',
        lowerHex: palette?.swatches[2]?.hex || '#FFFFF0',
      },
    };
  };

  const handleSendDirectMessage = (
    customText?: string,
    options?: {
      attach3D?: boolean;
      attachMeasurements?: boolean;
    }
  ) => {
    const targetThread = directThreads.find((t) => t.id === activeThreadId);
    if (!targetThread) return;

    const textToSend = (customText ?? directInput).trim();
    if (!textToSend && !options?.attach3D && !options?.attachMeasurements) return;

    const currentStudio = buildCurrentStudioConfig();
    const measurementStats = {
      heightCm: userMeasurements.height_cm,
      chestCm: userMeasurements.chest_cm,
      waistCm: userMeasurements.waist_cm,
      hipCm: userMeasurements.hip_cm,
    };

    const newMsg: DirectChatMessage = {
      id: `dm-${Date.now()}`,
      sender: 'me',
      text:
        textToSend ||
        (options?.attachMeasurements
          ? `Mình gửi Bảng Số Đo 3D (Cao ${userMeasurements.height_cm}cm · Nặng ${userMeasurements.weight_kg}kg · Size ${userMeasurements.suggested_size} · Vai ${userMeasurements.shoulder_width_cm}cm · Dài tay ${userMeasurements.sleeve_length_cm}cm) và mẫu trang phục để tiệm tư vấn may đo ạ.`
          : 'Mình chia sẻ mẫu trang phục 3D đang phối, xem thử nhé!'),
      timestamp: 'Vừa xong',
      attached3DOutfit: options?.attach3D ? currentStudio : undefined,
      attachedMeasurements: options?.attachMeasurements
        ? {
            ...measurementStats,
            garmentName: `${currentStudio.title} (Size ${userMeasurements.suggested_size})`,
          }
        : undefined,
    };

    const replyText =
      targetThread.category === 'tailor_business'
        ? options?.attachMeasurements
          ? `Cảm ơn bạn! ${targetThread.name} đã nhận số đo 3D (${measurementStats.heightCm}cm · ${measurementStats.chestCm}-${measurementStats.waistCm}-${measurementStats.hipCm}cm) cho mẫu "${currentStudio.title}". Xưởng sẵn sàng lên rập may cho bạn!`
          : options?.attach3D
          ? `${targetThread.name} đã nhận mẫu 3D "${currentStudio.title}". Mẫu này đang có sẵn tại tiệm, bạn muốn đặt thuê hay may mới ạ?`
          : `Dạ ${targetThread.name} đã nhận được tin nhắn. Tiệm sẽ kiểm tra lịch và phản hồi bạn ngay nhé!`
        : options?.attach3D
        ? `Phối màu bộ "${currentStudio.title}" đẹp quá! Để mình bấm Thử 3D xem thử nha.`
        : `Mình nhận được tin nhắn rồi nha! Hôm nào đi chụp cổ phục nhớ rủ mình nhé.`;

    setDirectThreads((prev) =>
      prev.map((thread) =>
        thread.id === activeThreadId
          ? {
              ...thread,
              unreadCount: 0,
              messages: [
                ...thread.messages,
                newMsg,
                {
                  id: `dm-reply-${Date.now()}`,
                  sender: 'them',
                  text: replyText,
                  timestamp: 'Vừa xong',
                },
              ],
            }
          : thread
      )
    );

    if (!customText) {
      setDirectInput('');
    }
  };

  const sendPromptToAdvisor = async (
    promptText: string,
    explicitQuizInputs?: { event: string; weather: string; style: string; budget: string }
  ) => {
    const trimmed = promptText.trim();
    if (!trimmed || isLoading) return;

    setActiveThreadId('ai-stylist');

    const userMsg: AdvisorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: 'Vừa xong',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setQuizPopoverOpen(false);
    setPromptsOpen(false);
    setIsLoading(true);

    try {
      const garment = getGenderAwareGarmentInfo(studioSelection.garmentId, studioSelection.gender);
      const palette = LOOKBOOK_PALETTES.find((p) => p.id === studioSelection.paletteId);
      const lower = LOWER_GARMENT_OPTIONS.find((l) => l.id === studioSelection.lowerGarmentId);
      const motif = MOTIF_OPTIONS.find((m) => m.id === studioSelection.motifId);
      const footwear = FOOTWEAR_OPTIONS.find((f) => f.id === studioSelection.footwearId);
      const occasion = OCCASION_OPTIONS.find((o) => o.id === studioSelection.occasionId);
      const weather = WEATHER_OPTIONS.find((w) => w.id === studioSelection.weatherId);
      const accessories = studioSelection.accessoryIds
        .map((id) => ACCESSORY_OPTIONS.find((a) => a.id === id)?.label)
        .filter(Boolean);

      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          quizInputs: explicitQuizInputs || {
            event: stepEvent,
            weather: stepWeather,
            style: stepStyle,
            budget: stepBudget,
          },
          studioContext: {
            gender: studioSelection.gender === 'nam' ? 'Nam giới' : 'Nữ giới',
            garmentName: garment?.name,
            paletteName: palette?.name,
            lowerGarment: lower?.label,
            motif: motif?.label,
            accessories,
            footwear: footwear?.label,
            occasion: occasion?.label,
            weather: weather?.label,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể kết nối AI Smart Stylist');
      }

      const data = await response.json();

      const lookbookCard: LookbookCardData | undefined = data.lookbookCard
        ? {
            id: `ai-lb-${Date.now()}`,
            outfitName: data.lookbookCard.outfitName || 'Khuê Văn Tri Thức',
            mainGarment: data.lookbookCard.mainGarment,
            accessories: Array.isArray(data.lookbookCard.accessories)
              ? data.lookbookCard.accessories
              : ['Khăn xếp đồng bộ', 'Guốc gỗ mộc'],
            palette: Array.isArray(data.lookbookCard.palette)
              ? data.lookbookCard.palette
              : [
                  { name: 'Xanh Ngọc Lam', hex: '#2E8B57', role: 'Áo ngoài' },
                  { name: 'Trắng Ngà', hex: '#FFFFF0', role: 'Áo lót & Quần' },
                  { name: 'Gỗ Mộc', hex: '#8B4513', role: 'Phụ kiện' },
                ],
            occasionAndWeather: data.lookbookCard.occasionAndWeather,
            culturalMeaning: data.lookbookCard.culturalMeaning,
            cultureGuardNote: data.lookbookCard.cultureGuardNote,
            hasViolation: Boolean(data.lookbookCard.hasViolation),
            garmentId: data.lookbookCard.garmentId || 'ao-ngu-than',
          }
        : undefined;

      const consultation: StylistConsultationResponse | undefined =
        data.part1Summary && Array.isArray(data.part2Options) && data.part3CultureGuard
          ? {
              part1Summary: data.part1Summary,
              part2Options: data.part2Options,
              part3CultureGuard: data.part3CultureGuard,
              formattedMarkdownReport: data.formattedMarkdownReport || '',
              lookbookCard: lookbookCard || CURATED_LOOKBOOKS[0],
            }
          : undefined;

      const aiMsgId = `ai-${Date.now()}`;
      if (consultation?.part3CultureGuard.hasViolation) {
        setExpandedGuardByMsg((prev) => ({ ...prev, [aiMsgId]: true }));
      }

      const aiMsg: AdvisorMessage = {
        id: aiMsgId,
        role: 'assistant',
        text:
          data.replyIntro ||
          consultation?.part1Summary.overviewText ||
          'Dưới đây là 3 phương án Lookbook 3D tối ưu:',
        lookbookCard,
        consultation,
        timestamp: 'AI Stylist',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: AdvisorMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        text: INITIAL_CONSULTATION.part1Summary.overviewText,
        lookbookCard: CURATED_LOOKBOOKS[0],
        consultation: INITIAL_CONSULTATION,
        timestamp: 'AI Stylist',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      externalPromptTrigger &&
      externalPromptTrigger.id !== lastHandledTriggerRef.current
    ) {
      lastHandledTriggerRef.current = externalPromptTrigger.id;
      setActiveThreadId('ai-stylist');
      sendPromptToAdvisor(externalPromptTrigger.prompt);
    }
  }, [externalPromptTrigger]);

  useEffect(() => {
    if (externalSendMeasurementsTrigger) {
      setActiveThreadId('tailor-y-van-hien');
      handleSendDirectMessage(undefined, { attachMeasurements: true, attach3D: true });
    }
  }, [externalSendMeasurementsTrigger]);

  useEffect(() => {
    if (activeThreadId === 'ai-stylist') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      directChatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isLoading, directThreads, activeThreadId]);

  const handleGuidedSubmit = () => {
    const builtPrompt = `Tư vấn 3 phương án cho: ${stepEvent} · ${stepWeather} · ${stepStyle} · ${stepBudget}`;
    sendPromptToAdvisor(builtPrompt, {
      event: stepEvent,
      weather: stepWeather,
      style: stepStyle,
      budget: stepBudget,
    });
  };

  const handleSendCurrent3DOutfit = () => {
    const garment = HERITAGE_GARMENTS.find((g) => g.id === studioSelection.garmentId);
    const palette = LOOKBOOK_PALETTES.find((p) => p.id === studioSelection.paletteId);
    const prompt = `Kiểm duyệt văn hóa và gợi ý 3 phương án phối đồ dựa trên bộ ${
      garment?.name || 'Việt phục'
    } (${palette?.name || ''}) mình đang mặc trong Phòng thử.`;
    sendPromptToAdvisor(prompt);
  };

  const filteredDirectThreads = directThreads.filter((thread) => {
    if (inboxFilter !== 'ALL' && thread.category !== inboxFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        thread.name.toLowerCase().includes(q) ||
        thread.handle.toLowerCase().includes(q) ||
        (thread.specialty && thread.specialty.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeDirectThread = directThreads.find((t) => t.id === activeThreadId) || null;
  const isAIStylistActive = activeThreadId === 'ai-stylist';

  return (
    <section id="co-van-ai" className="py-8 lg:py-12 border-b border-zinc-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* INSTAGRAM DIRECT-INSPIRED UNIFIED SPLIT CONTAINER */}
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden grid grid-cols-1 md:grid-cols-12 md:h-[620px]">
          {/* =============================================================== */}
          {/* LEFT PANE: MINIMALIST INBOX LIST                                */}
          {/* =============================================================== */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col h-full bg-white">
            {/* Top Inbox Title + Search */}
            <div className="px-4 pt-3.5 pb-2.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold tracking-tight text-zinc-950">Tin nhắn</h2>
                <button
                  type="button"
                  onClick={() => setActiveThreadId('ai-stylist')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                    isAIStylistActive
                      ? 'bg-zinc-950 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  <Wand2 className="w-3 h-3 text-amber-500" />
                  <span>AI Stylist</span>
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-100 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Minimal Underline Tabs (Tất cả / Tiệm may / Cá nhân) */}
            <div className="grid grid-cols-3 border-b border-zinc-200 text-xs font-semibold">
              {(
                [
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'tailor_business', label: 'Tiệm may' },
                  { id: 'user_account', label: 'Cá nhân' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setInboxFilter(tab.id)}
                  className={`py-2 text-center border-b-2 transition-colors cursor-pointer ${
                    inboxFilter === tab.id
                      ? 'border-zinc-950 text-zinc-950'
                      : 'border-transparent text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Thread List */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 max-h-[260px] md:max-h-none">
              {/* Pinned Special Sub-Item: AI Stylist */}
              <button
                type="button"
                onClick={() => setActiveThreadId('ai-stylist')}
                className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 cursor-pointer ${
                  isAIStylistActive ? 'bg-zinc-100/90' : 'hover:bg-zinc-50'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-zinc-950 text-amber-400 flex items-center justify-center">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-zinc-950 truncate">AI Stylist</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                      AI
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">Trợ lý phối đồ</p>
                </div>
              </button>

              {/* Direct Threads (Tailor Businesses & User Accounts) */}
              {filteredDirectThreads.map((thread) => {
                const isSelected = activeThreadId === thread.id;
                const lastMsg = thread.messages[thread.messages.length - 1];
                const hasUnread = Boolean(thread.unreadCount);

                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      setDirectThreads((prev) =>
                        prev.map((t) => (t.id === thread.id ? { ...t, unreadCount: 0 } : t))
                      );
                    }}
                    className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 cursor-pointer ${
                      isSelected ? 'bg-zinc-100/90' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          thread.category === 'tailor_business'
                            ? 'bg-zinc-800'
                            : 'bg-zinc-600'
                        }`}
                      >
                        {thread.avatarText}
                      </div>
                      {thread.online && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs truncate ${
                            hasUnread ? 'font-bold text-zinc-950' : 'font-semibold text-zinc-900'
                          }`}
                        >
                          {thread.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 shrink-0">
                          {lastMsg?.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p
                          className={`text-xs truncate ${
                            hasUnread ? 'font-semibold text-zinc-900' : 'text-zinc-500'
                          }`}
                        >
                          {lastMsg
                            ? `${lastMsg.sender === 'me' ? 'Bạn: ' : ''}${lastMsg.text}`
                            : thread.roleBadge}
                        </p>
                        {hasUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =============================================================== */}
          {/* RIGHT PANE: ACTIVE CHAT WINDOW                                  */}
          {/* =============================================================== */}
          <div className="md:col-span-8 flex flex-col h-[520px] md:h-full bg-white">
            {isAIStylistActive ? (
              <>
                {/* Minimal Chat Header for AI Stylist */}
                <div className="h-14 px-4 border-b border-zinc-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-950 text-amber-400 flex items-center justify-center shrink-0">
                      <Wand2 className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-zinc-950">AI Stylist</h3>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                        AI
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCollectionDrawerOpen((prev) => !prev)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                        collectionDrawerOpen
                          ? 'bg-zinc-900 text-white'
                          : 'text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Đã lưu ({savedIds.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRulesDrawerOpen((prev) => !prev)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                        rulesDrawerOpen
                          ? 'bg-zinc-900 text-white'
                          : 'text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">Quy tắc</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMessages(INITIAL_MESSAGES)}
                      title="Làm mới"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Optional Compact Drawers */}
                {collectionDrawerOpen && (
                  <div className="p-3 bg-zinc-50 border-b border-zinc-200 shrink-0">
                    <MiniLookbookDrawer
                      lookbooks={allLookbooks}
                      savedIds={savedIds}
                      onApplyCard={onApplyCardToStudio}
                      onToggleSave={onSaveLookbook}
                      onClose={() => setCollectionDrawerOpen(false)}
                      title="Bộ sưu tập đã lưu"
                      onSaveCurrentOutfit={() => {
                        const lastConsultMsg = [...messages]
                          .reverse()
                          .find((m) => m.role === 'assistant' && m.consultation);
                        if (lastConsultMsg?.consultation) {
                          const optNum = getActiveOption(lastConsultMsg.id);
                          const opt =
                            lastConsultMsg.consultation.part2Options.find(
                              (o) => o.optionNumber === optNum
                            ) || lastConsultMsg.consultation.part2Options[0];
                          onSaveLookbook(
                            convertOptionToLookbookCard(opt, lastConsultMsg.consultation)
                          );
                        }
                      }}
                    />
                  </div>
                )}

                {rulesDrawerOpen && (
                  <div className="p-3 bg-zinc-50 border-b border-zinc-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] shrink-0">
                    <div className="p-2 rounded-lg bg-white border border-zinc-200/80">
                      <strong className="text-zinc-900 block">1. Giới tính &amp; Phụ kiện</strong>
                      <span className="text-zinc-500">Không phối Nón quai thao với Ngũ Thân nam.</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-zinc-200/80">
                      <strong className="text-zinc-900 block">2. Rồng 5 Móng</strong>
                      <span className="text-zinc-500">Không dùng Rồng 5 móng cho thường phục.</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-zinc-200/80">
                      <strong className="text-zinc-900 block">3. Nhật Bình</strong>
                      <span className="text-zinc-500">Mặc cùng quần lụa &amp; hài, không phối quần jeans.</span>
                    </div>
                  </div>
                )}

                {/* AI Stylist Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const consult = msg.consultation;
                    const activeOptNum = getActiveOption(msg.id);
                    const isDetailsExpanded = Boolean(expandedDetailsByMsg[msg.id]);
                    const isCodeExpanded = Boolean(expandedCodeByMsg[msg.id]);
                    const isGuardExpanded = Boolean(expandedGuardByMsg[msg.id]);

                    if (msg.role === 'user') {
                      return (
                        <div key={msg.id} className="flex justify-end">
                          <div className="max-w-md px-3.5 py-2 text-xs sm:text-sm bg-zinc-900 text-white rounded-2xl rounded-br-xs">
                            {msg.text}
                          </div>
                        </div>
                      );
                    }

                    if (!consult) {
                      return (
                        <div key={msg.id} className="space-y-2">
                          <div className="max-w-lg px-3.5 py-2 text-xs sm:text-sm bg-zinc-100 text-zinc-900 rounded-2xl rounded-bl-xs">
                            {msg.text}
                          </div>
                          {msg.lookbookCard && (
                            <LookbookCardView
                              card={msg.lookbookCard}
                              onApplyToStudio={onApplyCardToStudio}
                              onSaveLookbook={onSaveLookbook}
                              isSaved={savedIds.includes(msg.lookbookCard.id)}
                            />
                          )}
                        </div>
                      );
                    }

                    const currentOpt =
                      consult.part2Options.find((o) => o.optionNumber === activeOptNum) ||
                      consult.part2Options[0];
                    const currentCard = convertOptionToLookbookCard(currentOpt, consult);
                    const isCurrentSaved = savedIds.includes(currentCard.id);

                    return (
                      <div key={msg.id} className="space-y-2 max-w-xl">
                        {/* Simple Chat Bubble Intro */}
                        <div className="px-3.5 py-2 rounded-2xl rounded-bl-xs bg-zinc-100 text-zinc-900 text-xs sm:text-sm flex items-center justify-between gap-2">
                          <span>{consult.part1Summary.overviewText}</span>
                          <button
                            type="button"
                            onClick={() => toggleGuard(msg.id)}
                            className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer ${
                              consult.part3CultureGuard.hasViolation
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {consult.part3CultureGuard.hasViolation ? (
                              <ShieldAlert className="w-3 h-3" />
                            ) : (
                              <ShieldCheck className="w-3 h-3" />
                            )}
                            <span>
                              {consult.part3CultureGuard.hasViolation ? 'Lưu ý' : 'Chuẩn'}
                            </span>
                          </button>
                        </div>

                        {isGuardExpanded && (
                          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
                            {consult.part3CultureGuard.detailNote}
                          </div>
                        )}

                        {/* Compact 3-Option Card Attachment */}
                        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                          <div className="px-3 py-1.5 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {consult.part2Options.map((opt) => (
                                <button
                                  key={opt.optionNumber}
                                  type="button"
                                  onClick={() => setActiveOption(msg.id, opt.optionNumber)}
                                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                                    activeOptNum === opt.optionNumber
                                      ? 'bg-zinc-900 text-white'
                                      : 'text-zinc-500 hover:text-zinc-900'
                                  }`}
                                >
                                  Phương án {opt.optionNumber}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const card1 = convertOptionToLookbookCard(
                                    consult.part2Options[0],
                                    consult
                                  );
                                  const card2 = convertOptionToLookbookCard(
                                    consult.part2Options[1] || consult.part2Options[0],
                                    consult
                                  );
                                  onSaveLookbook(card1);
                                  onSaveLookbook(card2);
                                  setCompareIds([card1.id, card2.id]);
                                  setLookbookModalTab('compare');
                                  setLookbookModalOpen(true);
                                }}
                                title="So sánh"
                                className="p-1 rounded text-zinc-500 hover:text-zinc-900 cursor-pointer"
                              >
                                <Columns2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setLookbookModalTab('export');
                                  setLookbookModalOpen(true);
                                }}
                                title="Xuất Lookbook"
                                className="p-1 rounded text-zinc-500 hover:text-zinc-900 cursor-pointer"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleCode(msg.id)}
                                title="Mã JSON"
                                className="p-1 rounded text-zinc-500 hover:text-zinc-900 cursor-pointer"
                              >
                                <Code2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="p-3 space-y-2.5">
                            <div className="flex items-start gap-3">
                              <img
                                src={
                                  get2DModelImageForSelection(
                                    currentOpt.outfitConfigCode.gender,
                                    currentOpt.outfitConfigCode.garmentId,
                                    'studio'
                                  ).studioUrl
                                }
                                alt={currentOpt.outfitName}
                                referrerPolicy="no-referrer"
                                className="w-12 h-16 rounded-lg object-cover border border-zinc-200 bg-zinc-900 shrink-0"
                              />

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="text-xs sm:text-sm font-bold text-zinc-950 truncate">
                                    {currentOpt.outfitName}
                                  </h4>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {currentOpt.palette.map((sw, i) => (
                                      <span
                                        key={`${sw.hex}-${i}`}
                                        className="w-3 h-3 rounded-full border border-zinc-300"
                                        style={{ backgroundColor: sw.hex }}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-xs text-zinc-600 line-clamp-2 mt-0.5">
                                  {currentOpt.mainGarment}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                              <button
                                type="button"
                                onClick={() => toggleDetails(msg.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 cursor-pointer"
                              >
                                <span>{isDetailsExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết'}</span>
                                <ChevronDown
                                  className={`w-3 h-3 transition-transform ${
                                    isDetailsExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onApplyOutfitConfigToStudio) {
                                      onApplyOutfitConfigToStudio(currentOpt.outfitConfigCode);
                                    } else {
                                      onApplyCardToStudio(currentCard);
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 text-white text-xs font-semibold cursor-pointer"
                                >
                                  <Cuboid className="w-3 h-3 text-emerald-400" />
                                  <span>Thử 3D</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onSaveLookbook(currentCard)}
                                  className={`p-1 rounded-lg border cursor-pointer ${
                                    isCurrentSaved
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                                  }`}
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {isDetailsExpanded && (
                              <div className="p-2.5 rounded-xl bg-zinc-50 text-[11px] text-zinc-600 space-y-1">
                                <p>
                                  <strong className="text-zinc-900">Phụ kiện:</strong>{' '}
                                  {currentOpt.accessories.join(' · ')}
                                </p>
                                <p>
                                  <strong className="text-zinc-900">Ý nghĩa:</strong>{' '}
                                  {currentOpt.culturalMeaning}
                                </p>
                              </div>
                            )}

                            {isCodeExpanded && (
                              <div className="space-y-1.5 pt-1">
                                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono-tabular">
                                  <span>{currentOpt.outfitConfigCode.config_id}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyText(
                                        `${msg.id}-cfg`,
                                        JSON.stringify(currentOpt.outfitConfigCode, null, 2)
                                      )
                                    }
                                    className="text-zinc-600 hover:text-zinc-950 font-sans cursor-pointer"
                                  >
                                    {copiedId === `${msg.id}-cfg` ? (
                                      <Check className="w-3 h-3 text-emerald-600 inline" />
                                    ) : (
                                      <Copy className="w-3 h-3 inline" />
                                    )}
                                  </button>
                                </div>
                                <pre className="p-2 rounded-lg bg-zinc-950 text-zinc-100 text-[10px] font-mono-tabular overflow-x-auto">
                                  {JSON.stringify(currentOpt.outfitConfigCode, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang phân tích...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Minimal Pill Composer for AI Stylist */}
                <div className="p-3 border-t border-zinc-100 space-y-2 shrink-0">
                  {quizPopoverOpen && (
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900">Chọn ngữ cảnh phối đồ</span>
                        <button
                          type="button"
                          onClick={() => setQuizPopoverOpen(false)}
                          className="text-zinc-400 hover:text-zinc-900 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <select
                          value={stepEvent}
                          onChange={(e) => setStepEvent(e.target.value)}
                          className="px-2 py-1 bg-white rounded-lg border border-zinc-200"
                        >
                          <option value="Lễ tốt nghiệp">Lễ tốt nghiệp</option>
                          <option value="Đi cưới">Đi cưới</option>
                          <option value="Đi chùa / Di tích">Đi chùa / Di tích</option>
                          <option value="Chụp ảnh kỷ yếu">Chụp ảnh kỷ yếu</option>
                          <option value="Dạo phố">Dạo phố</option>
                        </select>
                        <select
                          value={stepWeather}
                          onChange={(e) => setStepWeather(e.target.value)}
                          className="px-2 py-1 bg-white rounded-lg border border-zinc-200"
                        >
                          <option value="Mùa thu (Mát mẻ)">Mùa thu</option>
                          <option value="Mùa hè (Nắng ấm)">Mùa hè</option>
                          <option value="Mùa đông (Se lạnh)">Mùa đông</option>
                        </select>
                        <select
                          value={stepStyle}
                          onChange={(e) => setStepStyle(e.target.value)}
                          className="px-2 py-1 bg-white rounded-lg border border-zinc-200"
                        >
                          <option value="Cổ điển trang trọng">Cổ điển</option>
                          <option value="Tối giản thanh lịch">Tối giản</option>
                          <option value="Phá cách hiện đại">Phá cách</option>
                        </select>
                        <select
                          value={stepBudget}
                          onChange={(e) => setStepBudget(e.target.value)}
                          className="px-2 py-1 bg-white rounded-lg border border-zinc-200"
                        >
                          <option value="Tiết kiệm (Sinh viên)">Sinh viên</option>
                          <option value="Phổ thông">Phổ thông</option>
                          <option value="Cao cấp">Cao cấp</option>
                        </select>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleGuidedSubmit}
                          className="px-3 py-1 rounded-lg bg-zinc-950 text-white font-semibold cursor-pointer"
                        >
                          Tạo 3 phương án
                        </button>
                      </div>
                    </div>
                  )}

                  {promptsOpen && (
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                      {QUICK_PROMPTS.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => sendPromptToAdvisor(item.prompt)}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-full border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 shrink-0 cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendPromptToAdvisor(input);
                    }}
                    className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setQuizPopoverOpen((prev) => !prev);
                        setPromptsOpen(false);
                      }}
                      title="Chọn dịp & ngân sách"
                      className={`p-1.5 rounded-full cursor-pointer ${
                        quizPopoverOpen ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPromptsOpen((prev) => !prev);
                        setQuizPopoverOpen(false);
                      }}
                      title="Câu hỏi gợi ý"
                      className={`p-1.5 rounded-full cursor-pointer ${
                        promptsOpen ? 'bg-amber-500 text-zinc-950' : 'text-zinc-500 hover:bg-zinc-100'
                      }`}
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleSendCurrent3DOutfit}
                      title="Gửi bộ đang thử"
                      className="p-1.5 rounded-full text-zinc-500 hover:bg-zinc-100 cursor-pointer"
                    >
                      <Cuboid className="w-3.5 h-3.5 text-emerald-600" />
                    </button>

                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Nhắn tin cho AI Stylist..."
                      className="flex-1 text-xs sm:text-sm bg-transparent text-zinc-900 placeholder:text-zinc-400 focus:outline-none px-1"
                    />

                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="w-7 h-7 rounded-full bg-zinc-950 text-white flex items-center justify-center cursor-pointer disabled:opacity-30 shrink-0"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* =============================================================== */
              /* DIRECT CHAT WITH TAILOR BUSINESS OR USER ACCOUNT                */
              /* =============================================================== */
              activeDirectThread && (
                <>
                  {/* Minimal Direct Chat Header */}
                  <div className="h-14 px-4 border-b border-zinc-200 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {activeDirectThread.avatarText}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <h3 className="text-xs sm:text-sm font-bold text-zinc-950 truncate">
                            {activeDirectThread.name}
                          </h3>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {activeDirectThread.locationAddress || activeDirectThread.roleBadge}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveThreadId('ai-stylist')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-semibold cursor-pointer"
                    >
                      <Wand2 className="w-3 h-3 text-amber-600" />
                      <span>AI Stylist</span>
                    </button>
                  </div>

                  {/* Direct Message Stream */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {activeDirectThread.messages.map((dm) => {
                      const isMe = dm.sender === 'me';
                      return (
                        <div
                          key={dm.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-md px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2 ${
                              isMe
                                ? 'bg-zinc-900 text-white rounded-br-xs'
                                : 'bg-zinc-100 text-zinc-900 rounded-bl-xs'
                            }`}
                          >
                            <p>{dm.text}</p>

                            {dm.attachedMeasurements && (
                              <div className="p-2 rounded-xl bg-black/20 text-xs space-y-0.5">
                                <div className="flex items-center gap-1 font-bold text-amber-300">
                                  <Ruler className="w-3 h-3" />
                                  <span>Số đo 3D: {dm.attachedMeasurements.garmentName}</span>
                                </div>
                                <p className="text-[11px] font-mono-tabular opacity-90">
                                  Cao {dm.attachedMeasurements.heightCm}cm ·{' '}
                                  {dm.attachedMeasurements.chestCm}-
                                  {dm.attachedMeasurements.waistCm}-
                                  {dm.attachedMeasurements.hipCm}cm
                                </p>
                              </div>
                            )}

                            {dm.attached3DOutfit && (
                              <div
                                className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2.5 ${
                                  isMe
                                    ? 'bg-zinc-800 border-zinc-700 text-white'
                                    : 'bg-white border-zinc-200 text-zinc-900'
                                }`}
                              >
                                <div className="min-w-0">
                                  <p className="font-bold truncate">{dm.attached3DOutfit.title}</p>
                                  <p className="text-[11px] opacity-70 truncate">
                                    {dm.attached3DOutfit.subtitle}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onApplyOutfitConfigToStudio?.(dm.attached3DOutfit!.config)
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-[11px] shrink-0 cursor-pointer"
                                >
                                  Thử 3D
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={directChatEndRef} />
                  </div>

                  {/* Minimal Pill Composer for Direct Chat */}
                  <div className="p-3 border-t border-zinc-100 shrink-0">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendDirectMessage();
                      }}
                      className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 bg-white"
                    >
                      {activeDirectThread.category === 'tailor_business' && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleSendDirectMessage(
                                'Mình gửi số đo 3D và mẫu Việt phục đang thử để đặt may / giữ size ạ.',
                                { attachMeasurements: true, attach3D: true }
                              )
                            }
                            title="Gửi số đo 3D đặt may"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-medium shrink-0 cursor-pointer"
                          >
                            <Ruler className="w-3 h-3 text-amber-600" />
                            <span className="hidden sm:inline">Số đo 3D</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleSendDirectMessage(
                                'Cho mình hỏi mẫu này còn lịch thuê cuối tuần không ạ?',
                                { attach3D: true }
                              )
                            }
                            title="Hỏi lịch thuê"
                            className="p-1.5 rounded-full text-zinc-500 hover:bg-zinc-100 shrink-0 cursor-pointer"
                          >
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleSendDirectMessage(
                            'Mình chia sẻ cấu hình bộ cổ phục 3D đang phối, xem thử nhé!',
                            { attach3D: true }
                          )
                        }
                        title="Đính kèm mẫu 3D đang mặc"
                        className="p-1.5 rounded-full text-zinc-500 hover:bg-zinc-100 shrink-0 cursor-pointer"
                      >
                        <Cuboid className="w-3.5 h-3.5 text-emerald-600" />
                      </button>

                      <input
                        type="text"
                        value={directInput}
                        onChange={(e) => setDirectInput(e.target.value)}
                        placeholder={`Nhắn tin cho ${activeDirectThread.name}...`}
                        className="flex-1 text-xs sm:text-sm bg-transparent text-zinc-900 placeholder:text-zinc-400 focus:outline-none px-1"
                      />

                      <button
                        type="submit"
                        disabled={!directInput.trim()}
                        className="w-7 h-7 rounded-full bg-zinc-950 text-white flex items-center justify-center cursor-pointer disabled:opacity-30 shrink-0"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </>
              )
            )}
          </div>
        </div>

        {/* Lookbook Generator, Deep Link Engine & Comparison Engine Modal */}
        <LookbookStudioModal
          isOpen={lookbookModalOpen}
          initialTab={lookbookModalTab}
          selection={studioSelection}
          allLookbooks={allLookbooks}
          initialCompareIds={compareIds}
          onClose={() => setLookbookModalOpen(false)}
          onApplyCardToStudio={onApplyCardToStudio}
          onApplyDeepLinkPayload={(payload) => {
            const nextSel = decodeDeepLinkPayloadToSelection(payload, studioSelection);
            if (onApplyOutfitConfigToStudio) {
              onApplyOutfitConfigToStudio({
                config_id: `DL_${payload.base_outfit}`,
                gender: nextSel.gender,
                garmentId: nextSel.garmentId as
                  | 'ao-ngu-than'
                  | 'ao-nhat-binh'
                  | 'ao-tu-than'
                  | 'ao-dai-ba-ba',
                paletteId: nextSel.paletteId,
                lowerGarmentId: nextSel.lowerGarmentId,
                motifId: nextSel.motifId,
                accessoryIds: nextSel.accessoryIds,
                footwearId: nextSel.footwearId,
                occasionId: nextSel.occasionId,
                weatherId: nextSel.weatherId,
                outerHex: payload.colors.outer_hex,
                innerHex: payload.colors.inner_hex,
                lowerHex: payload.colors.lower_hex,
              });
            }
          }}
        />
      </div>
    </section>
  );
};
