import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const SYSTEM_INSTRUCTION = `Bạn là Trợ lý Trí tuệ Nhân tạo Chuyên gia kiêm Core Logic Engine Backend cho ứng dụng "VietAura" – Hệ sinh thái công nghệ thời trang di sản (Fashion-Tech Ecosystem) kết hợp 3D, AI, Mạng xã hội, Bản đồ di tích, Sàn dịch vụ và Gamification dành cho giới trẻ.

Nhiệm vụ của bạn là vận hành và xử lý dữ liệu chuyên sâu cho 6 Module cốt lõi:
1. PHÒNG THỬ ĐỒ ẢO 3D/2D & MIX-MATCH STUDIO (Tích hợp 2 Chế độ phối & UI Tối giản)
2. TRỢ LÝ PHỐI ĐỒ AI STYLIST & BỘ LỌC VĂN HÓA (CULTURE GUARD AI - Ưu tiên phân cấp Mode)
3. CỘNG ĐỒNG (2 TAB CON: MẠNG XÃ HỘI & NỀN TẢNG ĐỐI TÁC THUÊ/MAY)
4. BẢN ĐỒ DI TÍCH PHÂN CẤP, CAMERA CHECK-IN GPS & HỘ CHIẾU CỔ PHỤC
5. KHÁM PHÁ VĂN HÓA, QUẢN LÝ SỰ KIỆN & TÍCH ĐIỂM SỰ KIỆN (Dữ liệu đồng bộ Single Source)
6. TRÌNH TẠO LOOKBOOK DEEP LINK & QUẢN LÝ TÀI KHOẢN / VOUCHER / BỘ SƯU TẬP ĐÃ LƯU

I. CƠ CHẾ DUMMY DATABASE & LOCAL STORAGE PERSISTENCE (CLIENT-SIDE DATA)
Khởi tạo và lưu trữ cấu trúc Local Storage dưới key duy nhất VIETPHUC_LOCAL_STORAGE_V1 giúp ứng dụng hoạt động mượt mà 100% Offline/Client-side trong các buổi Demo Hackathon.
Logic Cập Nhật Trạng Thái Dữ Liệu Cục Bộ (Local Data Mutations):
- Lưu Outfit 3D: Thêm bản ghi mới vào local_saved_items.saved_outfits_3d.
- GPS Check-in Thành Công: Chuyển is_unlocked trong dummy_passport_stamps thành true, cộng +100 vào loyalty_points_balance, và thêm Huy hiệu mới vào unlocked_badges.
- Đổi Voucher: Trừ số điểm tương ứng ở loyalty_points_balance và đẩy mã voucher mới vào my_vouchers.

II. KỊCH BẢN SLIDE THUYẾT TRÌNH PITCH DECK (10 SLIDES HACKATHON STRUCTURE)
Khi người dùng yêu cầu kịch bản thuyết trình, xuất ra 10 Slides chuẩn: Title & Hook ➔ Problem ➔ Solution ➔ Core Tech Innovation ➔ Live User Demo (3 phút) ➔ Business Model ➔ B2B Partnerships ➔ Go-To-Market ➔ Roadmap ➔ Closing Vision.

III. KHO TRI THỨC DI SẢN & BỘ LỌC CẢNH BÁO VĂN HÓA PHÂN CẤP (CULTURE GUARD ENGINE)
1. Tri thức cốt lõi về Trang phục (Knowledge Base):
   - Áo Ngũ Thân (Lập Lĩnh / Tay Chẽn / Tay Thụt): 5 vạt, 5 cúc. Tượng trưng Ngũ Thường, Tứ Thân Phụ Mẫu. Dùng cho Lễ nghi, Tốt nghiệp, Tết, Cưới hỏi. Phụ kiện: Khăn xếp, guốc gỗ, quạt trầm.
   - Áo Tứ Thân & Yếm: 4 vạt, mặc cùng áo Yếm, váy đụp đen. Phù hợp lễ hội dân gian, diễn xướng. Phụ kiện: Nón ba tầm (nón quai thao), thắt lưng bao, guốc mộc.
   - Áo Nhật Bình: Cổ xẻ dọc chữ nhật, viền ngũ sắc ở tay. Thường phục triều đình/Hậu phi. Phù hợp cưới hỏi, di tích, kỷ yếu. Phụ kiện: Mấn, xuyến bạc, guốc mộc.
   - Áo Bà Ba / Áo Dài Tân Thời: Phù hợp dạo phố, học đường, phong cách thường nhật (Casual / Streetwear).
2. Quy tắc Phân cấp Kiểm duyệt theo Chế Độ Phối (Styling Mode Logic):
   - NẾU styling_mode == "STRICT_HERITAGE" (Cổ Chuẩn):
     + Kích hoạt cảnh báo ĐỎ (🔴 REJECTED/WARNING) cho các vi phạm quy chuẩn: Nón quai thao với Ngũ thân nam; Rồng 5 móng trên thường phục; Áo Nhật Bình phối quần jeans/váy ngắn.
     + Hỗ trợ nút [Auto-Fix 1-Touch] tự động chuyển trang phục/phụ kiện về chuẩn cổ lệ.
   - NẾU styling_mode == "MODERN_FUSION" (Tân Thời / Streetwear):
     + Chấp nhận các sự kết hợp hiện đại (Giày Sneaker, Quần Jeans, Kính mát).
     + Hạ cấp cảnh báo đỏ thành Nhãn Cam (🟠 CULTURE_TIP): Đưa ra lời khuyên nhẹ nhàng về bối cảnh mặc (phù hợp dạo phố, đi cafe; tránh mặc đi lễ chùa/nơi linh thiêng).

II. MODULE 1: PHÒNG THỬ 3D & TRỢ LÝ PHỐI ĐỒ AI STYLIST
1. Giao diện Phân cấp (Progressive Disclosure):
   - Default Mode (MINIMAL_MODE): Tối giản giao diện, chỉ hiển thị Mô hình 3D + Thanh chọn áo/quần chân trang.
   - Custom Mode (ADVANCED_MODE): Mở rộng các thanh trượt Nhân trắc học (Chiều cao 145-190cm, Cân nặng, Ngực/Eo/Hông) và Bảng cấu trúc giải phẫu áo.
2. Tư vấn AI Stylist theo 4 biến ngữ cảnh (Sự kiện, Thời tiết, Phong cách, Ngân sách):
   - Xuất ra Báo cáo 3 Phần: Tổng quan bối cảnh -> 3 Phương án Lookbook 3D (Option 1, 2, 3) -> Trạng thái Culture Guard AI.

III. MODULE 2: CỘNG ĐỒNG (COMMUNITY HUB WITH 2 SUB-TABS)
- TAB 1: MẠNG XÃ HỘI (Social Trends): Bài đăng hashtag (#VietPhucLookbook, #VietPhucReal, #VietPhucStreetwear), lọc AI 3 cấp độ, Nút xem bài gốc & Magic Re-Fit 3D. Đăng bài hợp lệ +20 Điểm.
- TAB 2: NỀN TẢNG ĐỐI TÁC THUÊ/MAY (Verified Marketplace): Danh mục tiệm cho thuê/may đối tác, vị trí Google Maps lân cận, bảng giá, Nút đặt thuê & Nút gửi số đo may đo tự động. Đơn thuê/may hoàn tất +10% giá trị thành Điểm Di Sản.

IV. MODULE 3: BẢN ĐỒ DI TÍCH PHÂN CẤP, CHECK-IN OFFLINE & HỘ CHIẾU
1. Phân cấp Ghim Bản đồ (Map Pin Hierarchy):
   - HERO PIN (Di tích): Tâm điểm màu đỏ/vàng cổ phong, kích thước lớn.
   - SATELLITE PINS (Tiệm đối tác lân cận): Icon nhỏ màu xanh/cam xếp xung quanh theo bán kính (300m, 500m, 1km), kèm khoảng cách đi bộ và nút đặt thuê/mặc thử 3D.
2. Xác thực Check-in Dual-Mode (GPS & Offline Pending):
   - Khi có GPS online: Tọa độ khớp di tích (<500m) + Ảnh chụp có Việt phục -> Mở khóa ngay Con dấu 3D + Cộng +50 đến +100 Điểm.
   - Khi mất GPS/Mạng: Lưu trạng thái PENDING_OFFLINE_VERIFICATION đính kèm timestamp. Tự động xác thực và cộng điểm khi thiết bị kết nối mạng trở lại.
3. Huy hiệu Profile & Danh hiệu (Profile Heritage Badges):
   - Mở khóa Huy hiệu đính Profile theo mốc check-in: 1 di tích (🏰 Thăng Long Cổ Tích), 3 di tích (👑 Cố Đô Phong Hoa), 5 di tích (🏮 Hội An Hoài Cổ), 7 di tích (🐉 Đại Sứ Việt Phục).

V. MODULE 4 & 5: KHÁM PHÁ VĂN HÓA, SỰ KIỆN & QUẢN LÝ TÀI KHOẢN
1. Đồng bộ Dữ liệu Lễ hội / Di tích (Single Source Entity):
   - Bài viết Tin tức, Sự kiện sắp diễn ra và Ghim Bản đồ dùng chung mã định danh heritage_id để đảm bảo thống nhất ngày Âm/Dương lịch và địa điểm. Tích hợp nút [🔮 Thử 3D liên quan] và [🛍️ Thuê đồ gần sự kiện]. Lưu sự kiện +150 Điểm.
2. Quản lý Bộ sưu tập Đã lưu Trung tâm (Centralized Saved Hub):
   - Gom toàn bộ nội dung đã lưu về mục Tài khoản, chia thành 3 tab phụ: Outfit 3D đã lưu, Sự kiện đã lưu, Bài viết đã lưu.
   - Kho Voucher 2 tab: Đổi điểm Loyalty Points & Mã Voucher đang sở hữu.

VI. QUY CHUẨN CẤU TRÚC DỮ LIỆU ĐẦU RA JSON (JSON OUTPUT SCHEMA)
Khi xử lý cấu hình Phòng thử đồ hoặc Phản hồi Hệ thống, BẮT BUỘC xuất dữ liệu theo định dạng JSON chuẩn mực:
{
  "system_state": {
    "styling_mode": "STRICT_HERITAGE | MODERN_FUSION",
    "ui_display_mode": "MINIMAL_MODE | ADVANCED_MODE",
    "local_storage_key": "VIETPHUC_LOCAL_STORAGE_V1"
  },
  "outfit_3d_config": {
    "outfit_id": "STRING_ID",
    "outfit_type": "NGU_THAN | NHAT_BINH | TU_THAN | AO_DAI | BA_BA",
    "palette_hex": { "primary": "#HEX", "secondary": "#HEX", "accent": "#HEX" },
    "body_measurements": { "height_cm": INTEGER, "weight_kg": INTEGER, "chest_cm": INTEGER, "waist_cm": INTEGER, "hip_cm": INTEGER },
    "recommended_size": "S | M | L | XL"
  },
  "culture_guard_result": {
    "status": "APPROVED | WARNING | REJECTED",
    "applied_rule": "STRING_RULE_NAME",
    "culture_tip_message": "STRING_MESSAGE_FOR_USER",
    "auto_fix_available": BOOLEAN
  },
  "marketplace_link": {
    "is_available_for_rent": BOOLEAN,
    "nearest_partner_shop_id": "STRING_OR_NULL",
    "rental_price_from": "STRING_PRICE"
  },
  "local_storage_mutation_preview": {
    "updated_field": "STRING_FIELD_NAME_OR_NONE",
    "new_value_summary": "STRING_SUMMARY"
  }
}`;

interface OutfitConfigPayload {
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

interface StylistOptionPayload {
  optionNumber: 1 | 2 | 3;
  outfitName: string;
  styleLabel: string;
  budgetTier: string;
  mainGarment: string;
  accessories: string[];
  palette: { name: string; hex: string; role: string }[];
  culturalMeaning: string;
  outfitConfigCode: OutfitConfigPayload;
}

interface StylistEngineResult {
  replyIntro: string;
  part1Summary: {
    event: string;
    weather: string;
    style: string;
    budget: string;
    overviewText: string;
  };
  part2Options: StylistOptionPayload[];
  part3CultureGuard: {
    status: 'Approved' | 'Warning';
    statusLabel: string;
    hasViolation: boolean;
    violatedRule: string | null;
    detailNote: string;
  };
  formattedMarkdownReport: string;
  lookbookCard: {
    outfitName: string;
    mainGarment: string;
    accessories: string[];
    palette: { name: string; hex: string; role: string }[];
    occasionAndWeather: string;
    culturalMeaning: string;
    cultureGuardNote: string;
    hasViolation: boolean;
    garmentId: string;
  };
}

function formatMandatoryStylistResponse(
  part1: StylistEngineResult['part1Summary'],
  options: StylistOptionPayload[],
  part3: StylistEngineResult['part3CultureGuard'],
  language: 'vi' | 'en' = 'vi'
): string {
  const isEn = language === 'en';
  const lines: string[] = isEn
    ? [
        '----------------------------------------------------------------------',
        '[PART 1: AI STYLIST CONTEXT & ANALYSIS]',
        `• Occasion: ${part1.event} · Weather: ${part1.weather} · Style: ${part1.style} · Budget: ${part1.budget}`,
        `• Overview: ${part1.overviewText}`,
        '',
        '[PART 2: 3 RECOMMENDED 3D LOOKBOOK OPTIONS]',
      ]
    : [
        '----------------------------------------------------------------------',
        '[PHẦN 1: TỔNG QUAN PHÂN TÍCH BỞI AI STYLIST]',
        `• Sự kiện: ${part1.event} · Thời tiết: ${part1.weather} · Phong cách: ${part1.style} · Ngân sách: ${part1.budget}`,
        `• Nhận định: ${part1.overviewText}`,
        '',
        '[PHẦN 2: 3 PHƯƠNG ÁN LOOKBOOK GỢI Ý]',
      ];

  for (const opt of options) {
    const paletteStr = opt.palette.map((p) => `${p.name} (${p.hex} - ${p.role})`).join(' · ');
    if (isEn) {
      lines.push(
        '',
        `🌟 OPTION ${opt.optionNumber}: "${opt.outfitName}"`,
        `• Main Garment: ${opt.mainGarment}`,
        `• Standard Accessories: ${opt.accessories.join(', ')}`,
        `• Color Palette: ${paletteStr}`,
        `• Cultural & Historical Meaning: ${opt.culturalMeaning}`,
        `• 3D Outfit Config Code: ${JSON.stringify(opt.outfitConfigCode)}`
      );
    } else {
      lines.push(
        '',
        `🌟 OPTION ${opt.optionNumber}: "${opt.outfitName}"`,
        `• Trang phục chính: ${opt.mainGarment}`,
        `• Phụ kiện quy chuẩn: ${opt.accessories.join(', ')}`,
        `• Bảng màu (Palette): ${paletteStr}`,
        `• Ý nghĩa văn hóa & Lịch sử: ${opt.culturalMeaning}`,
        `• Mã Cấu Hình 3D (Outfit Config Code): ${JSON.stringify(opt.outfitConfigCode)}`
      );
    }
  }

  if (isEn) {
    lines.push(
      '',
      '[PART 3: CULTURE GUARD VERIFICATION & HERITAGE NOTES]',
      `• Status: ${part3.statusLabel}`,
      `• Detail Note: ${part3.detailNote}`,
      '----------------------------------------------------------------------'
    );
  } else {
    lines.push(
      '',
      '[PHẦN 3: XÁC THỰC CULTURE GUARD & LƯU Ý VĂN HÓA]',
      `• Trạng thái: ${part3.statusLabel}`,
      `• Chi tiết lưu ý: ${part3.detailNote}`,
      '----------------------------------------------------------------------'
    );
  }

  return lines.join('\n');
}

function buildIntelligentCulturalFallback(
  userPrompt: string,
  quizInputs?: { event?: string; weather?: string; style?: string; budget?: string; gender?: string },
  language: 'vi' | 'en' = 'vi'
): StylistEngineResult {
  const isEn = language === 'en';
  const lower = userPrompt.toLowerCase();
  const isMale =
    quizInputs?.gender === 'nam' ||
    lower.includes('nam sinh') ||
    lower.includes('nam giới') ||
    lower.includes('bạn nam') ||
    lower.includes('con trai') ||
    lower.includes('male') ||
    lower.includes('man') ||
    lower.includes('boy');

  const detectedEvent =
    quizInputs?.event ||
    (lower.includes('cưới') || lower.includes('ăn hỏi') || lower.includes('wedding')
      ? isEn ? 'Traditional Wedding & Engagement' : 'Lễ cưới hỏi truyền thống'
      : lower.includes('chùa') || lower.includes('lễ hội') || lower.includes('quan họ') || lower.includes('temple') || lower.includes('festival')
      ? isEn ? 'Temple Visit & Heritage Festival' : 'Đi chùa / Lễ hội di tích'
      : lower.includes('kỷ yếu') || lower.includes('yearbook')
      ? isEn ? 'Yearbook Photoshoot' : 'Chụp ảnh kỷ yếu'
      : lower.includes('dạo phố') || lower.includes('street') || lower.includes('walk') || lower.includes('casual')
      ? isEn ? 'City Walk & Casual Shoot' : 'Dạo phố & Chụp ảnh ngoại cảnh'
      : isEn ? 'Graduation Ceremony & Heritage Yearbook' : 'Lễ tốt nghiệp & Kỷ yếu di tích');

  const detectedWeather =
    quizInputs?.weather ||
    (lower.includes('hè') || lower.includes('nóng') || lower.includes('hạ') || lower.includes('summer') || lower.includes('hot')
      ? isEn ? 'Summer / Warm (28–34°C · Breathable raw silk recommended)' : 'Mùa hè / Hot (28–34°C · Cần vải đũi/tơ thoáng khí)'
      : lower.includes('đông') || lower.includes('lạnh') || lower.includes('winter') || lower.includes('cold')
      ? isEn ? 'Winter / Chilly (14–18°C · Double-layer woven brocade recommended)' : 'Mùa đông / Cold (14–18°C · Ưu tiên gấm dệt / lụa dày 2 lớp)'
      : isEn ? 'Autumn / Cool (20–25°C · Ideal crisp weather)' : 'Mùa thu / Cool (20–25°C · Tiết trời se mát lý tưởng)');

  const detectedStyle =
    quizInputs?.style ||
    (lower.includes('tối giản') || lower.includes('minimal')
      ? isEn ? 'Minimalist & Elegant' : 'Tối giản thanh lịch'
      : lower.includes('hiện đại') || lower.includes('phá cách') || lower.includes('fusion') || lower.includes('modern')
      ? isEn ? 'Modern Fusion' : 'Phá cách hiện đại'
      : isEn ? 'Traditional Formal' : 'Cổ điển trang trọng');

  const detectedBudget =
    quizInputs?.budget ||
    (lower.includes('cao cấp') || lower.includes('luxury') || lower.includes('high')
      ? isEn ? 'Luxury / Tailored Handmade Brocade' : 'Cao cấp (May đo gấm/tơ tằm thủ công)'
      : lower.includes('phổ thông') || lower.includes('standard')
      ? isEn ? 'Standard (Selected silk rental/tailoring)' : 'Phổ thông (Thuê/May lụa tơ chọn lọc)'
      : isEn ? 'Student Friendly / Economical' : 'Tiết kiệm (Học sinh / Sinh viên)');

  // Check Culture Guard Violations (RULE 1, RULE 2, RULE 3, RULE 4)
  const rule1Violation =
    (lower.includes('nón quai thao') || lower.includes('nón ba tầm') || lower.includes('quai thao')) &&
    (isMale || lower.includes('nam') || lower.includes('ngũ thân nam') || lower.includes('male'));
  const rule2Violation =
    lower.includes('rồng 5 móng') || lower.includes('ngũ trảo') || lower.includes('long bào') || lower.includes('5-claw dragon') || lower.includes('five-claw');
  const rule3Violation =
    (lower.includes('nhật bình') || lower.includes('nhat binh')) &&
    (lower.includes('váy ngắn') ||
      lower.includes('váy đụp ngắn') ||
      lower.includes('jean') ||
      lower.includes('sneaker') ||
      lower.includes('short skirt'));
  const rule4FusionTip =
    !rule3Violation &&
    (lower.includes('sneaker') ||
      lower.includes('jean') ||
      lower.includes('kính mát') ||
      lower.includes('sunglasses') ||
      lower.includes('streetwear'));

  const hasViolation = rule1Violation || rule2Violation || rule3Violation || rule4FusionTip;
  const violatedRule = rule1Violation
    ? 'RULE_1'
    : rule2Violation
    ? 'RULE_2'
    : rule3Violation
    ? 'RULE_3'
    : rule4FusionTip
    ? 'RULE_4'
    : null;

  const statusLabel = hasViolation
    ? isEn ? '🔴 Warning (Adjustment Needed)' : '🔴 Cảnh báo (Cần điều chỉnh)'
    : isEn ? '🟢 Approved (Heritage Compliant)' : '🟢 Đã kiểm duyệt (Approved)';

  const detailNote = rule1Violation
    ? isEn
      ? 'RULE 1 VIOLATION (Gender & Accessories): DO NOT pair Nón Quai Thao with male Áo Ngũ Thân (Nón Quai Thao is exclusively for Northern females). The system automatically standardized to Khăn Xếp and agarwood folding fan in the 3 3D options above.'
      : 'VI PHẠM RULE 1 (Giới tính & Phụ kiện): KHÔNG phối Nón quai thao / Nón ba tầm với Áo Ngũ Thân nam giới (Nón quai thao dành riêng cho nữ giới miền Bắc). Hệ thống đã tự động chuẩn hóa sang Khăn xếp chữ Nhân và Quạt xếp trầm hương trong 3 phương án 3D bên trên.'
    : rule2Violation
    ? isEn
      ? 'RULE 2 VIOLATION (Motifs & Ranking): DO NOT use 5-claw dragon motifs on folk or everyday garments (5-claw dragons were reserved exclusively for the Nguyễn Dynasty Emperor). The system adjusted to standard woven Lotus & Four Seasons motifs.'
      : 'VI PHẠM RULE 2 (Họa tiết & Phân cấp): KHÔNG dùng họa tiết Rồng 5 móng cho trang phục dân gian/thường phục (Rồng 5 móng là đặc quyền tối cao của Hoàng đế triều Nguyễn). Hệ thống đã chuyển sang họa tiết Ám hoa Liên Hoa & Tứ Quý chuẩn mực.'
    : rule3Violation
    ? isEn
      ? 'RULE 3 VIOLATION (Ceremonial Coherence): DO NOT pair Áo Nhật Bình with short skirts or modern jeans. The system standardized to wide-leg White Jade silk trousers and imperial embroidered Hài Thêu.'
      : 'VI PHẠM RULE 3 (Đồng bộ Lễ phục): KHÔNG phối Áo Nhật Bình với váy đụp ngắn hoặc quần jeans hiện đại. Hệ thống đã chuẩn hóa sang Quần lụa trắng Bạch Ngọc ống rộng và Hài thêu cung đình.'
    : rule4FusionTip
    ? isEn
      ? 'RULE 4 NOTE (Culture Tip · Modern Fusion): Combining traditional garments (Áo Ngũ Thân / Áo Bà Ba / Áo Dài) with modern items (jeans, sneakers, sunglasses) offers a trendy Streetwear flair—great for cafes, casual strolls, or outdoor shoots. For sacred temples or solemn ceremonies, please switch to traditional white silk trousers and Guốc Mộc.'
      : 'LƯU Ý RULE 4 (Culture Tip · Streetwear / Modern Fusion): Khi phối trang phục truyền thống (Áo Ngũ Thân / Áo Bà Ba / Áo Dài) cùng đồ hiện đại (Quần Jeans, Sneaker, Kính mát), bộ trang phục mang hơi thở Streetwear cá tính — rất phù hợp để đi cafe, dạo phố hoặc chụp ảnh ngoại cảnh đương đại. Nếu đi chùa, đền miếu hay dự lễ nghi trang nghiêm, bạn nên đổi sang quần lụa trắng và guốc mộc truyền thống.'
    : isEn
    ? 'All 3 3D Lookbook options strictly adhere to Vietnamese heritage guidelines (Rule 1: Gender-appropriate accessories; Rule 2: Rank-appropriate motifs; Rule 3: Coordinated silk trousers/skirts with Guốc Mộc or Hài Thêu).'
    : 'Cả 3 phương án Lookbook 3D đều tuân thủ nghiêm ngặt quy chuẩn cổ lệ Việt Nam (Rule 1: Phụ kiện đúng giới tính; Rule 2: Hoa văn Ám hoa/Tứ Quý/Loan Phượng đúng phẩm cấp; Rule 3: Quần lụa/Váy đụp & Guốc mộc/Hài thêu đồng bộ phom dáng).';

  const option1: StylistOptionPayload = {
    optionNumber: 1,
    outfitName: isEn
      ? isMale ? 'Khuê Văn Scholar — Áo Ngũ Thân Standing Collar' : 'Khuê Văn Intellect — Áo Ngũ Thân Tay Chẽn'
      : isMale ? 'Khuê Văn Quân Tử — Ngũ Thân Lập Lĩnh' : 'Khuê Văn Tri Thức — Ngũ Thân Tay Chẽn',
    styleLabel: isEn ? 'Traditional Formal' : 'Cổ điển trang trọng',
    budgetTier: isEn ? 'Student Friendly' : 'Tiết kiệm (Học sinh/Sinh viên)',
    mainGarment: isEn
      ? 'Áo Ngũ Thân Tay Chẽn in Jade Cyan raw silk, ivory standing collar inner shirt paired with wide-leg white silk trousers.'
      : 'Áo Ngũ Thân tay chẽn vải tơ đũi màu Xanh Ngọc Lam (ngoài), áo lót cổ đứng trắng ngà bên trong phối cùng quần lụa trắng ống rộng xòe tự nhiên.',
    accessories: isEn
      ? ['Matching Khăn Xếp', 'Traditional Guốc Mộc', 'Agarwood folding fan']
      : ['Khăn xếp (Khăn vấn) đồng bộ', 'Guốc gỗ mộc truyền thống', 'Quạt xếp trầm hương'],
    palette: [
      { name: isEn ? 'Jade Cyan' : 'Xanh Ngọc Lam', hex: '#2E8B57', role: isEn ? 'Outer robe' : 'Áo ngoài' },
      { name: isEn ? 'Ivory White' : 'Trắng Ngà', hex: '#FFFFF0', role: isEn ? 'Inner & trousers' : 'Áo lót & Quần lụa' },
      { name: isEn ? 'Agarwood' : 'Gỗ Trầm', hex: '#8B4513', role: isEn ? 'Guốc & Fan' : 'Guốc & Quạt' },
    ],
    culturalMeaning: isEn
      ? 'Standardized in 1744 under Lord Nguyễn Phúc Khoát; the 5 panels symbolize parents protecting their child, and the 5 buttons embody the Five Constant Virtues (Benevolence, Righteousness, Propriety, Wisdom, Fidelity).'
      : 'Định hình năm 1744 thời Võ Vương Nguyễn Phúc Khoát, 5 vạt áo tượng trưng cho Tứ thân phụ mẫu chở che người con (vạt con thứ 5), 5 hạt khuy đại diện cho Ngũ Thường (Nhân, Lễ, Nghĩa, Trí, Tín).',
    outfitConfigCode: {
      config_id: isMale ? 'CFG_OPT1_NGUTHAN_NAM' : 'CFG_OPT1_NGUTHAN_NU',
      gender: isMale ? 'nam' : 'nu',
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
  };

  const option2: StylistOptionPayload =
    !isMale && (lower.includes('cưới') || lower.includes('nhật bình') || lower.includes('kỷ yếu') || lower.includes('wedding') || rule3Violation)
      ? {
          optionNumber: 2,
          outfitName: isEn ? 'Chu Sa Imperial Garden — Áo Nhật Bình Royal Attire' : 'Chu Sa Ngự Uyển — Nhật Bình Cung Đình',
          styleLabel: isEn ? 'Regal & Magnificent' : 'Cổ điển lộng lẫy',
          budgetTier: isEn ? 'Luxury / Ceremonial' : 'Cao cấp / Lễ phục',
          mainGarment: isEn
            ? 'Áo Nhật Bình in Cinnabar Red silk brocade embroidered with Phoenix & Eight Treasures, wide sleeves bordered with Five Elements bands, paired with White Jade silk trousers.'
            : 'Áo Nhật Bình gấm tơ tằm màu Đỏ Chu Sa thêu Loan Phượng & Bát Bửu, tay rộng viền dải ngũ sắc Ngũ Hành phối cùng quần lụa trắng Bạch Ngọc.',
          accessories: isEn
            ? ['Imperial Mấn Đội Đầu', 'Engraved silver bangles', 'Traditional curved-toe Hài Thêu']
            : ['Mấn đội đầu cung đình', 'Xuyến bạc chạm khắc', 'Hài thêu mũi cong truyền thống'],
          palette: [
            { name: isEn ? 'Cinnabar Red' : 'Đỏ Chu Sa', hex: '#9A3412', role: isEn ? 'Áo Nhật Bình' : 'Áo Nhật Bình' },
            { name: isEn ? 'Imperial Gold' : 'Hoàng Kim', hex: '#D97706', role: isEn ? 'Five elements border' : 'Viền ngũ sắc & Thêu' },
            { name: isEn ? 'White Jade' : 'Bạch Ngọc', hex: '#FAF8F5', role: isEn ? 'Silk trousers' : 'Quần lụa' },
          ],
          culturalMeaning: isEn
            ? 'Everyday attire for Imperial Empresses and Princesses during the Nguyễn Dynasty (1802–1945); dignified rectangular collar with Five Elements (Metal, Wood, Water, Fire, Earth) bands on sleeves.'
            : 'Thường phục của Hậu phi, Công chúa và lễ phục mệnh phụ phu nhân triều Nguyễn (1802–1945); cổ chữ nhật uy nghi kết hợp 5 sắc màu Kim - Mộc - Thủy - Hỏa - Thổ nơi cổ tay.',
          outfitConfigCode: {
            config_id: 'CFG_OPT2_NHATBINH_NU',
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
        }
      : {
          optionNumber: 2,
          outfitName: isEn ? 'Thanh Phong Classic Indigo — Áo Ngũ Thân' : 'Thanh Phong Niên Hoa — Ngũ Thân Lam Cổ Điển',
          styleLabel: isEn ? 'Minimalist & Elegant' : 'Tối giản thanh lịch',
          budgetTier: isEn ? 'Standard' : 'Phổ thông',
          mainGarment: isEn
            ? 'Áo Ngũ Thân in Nha Xá silk in Classic Indigo with subtle woven Lotus motifs, worn over white inner shirt and natural ivory silk trousers.'
            : 'Áo Ngũ Thân lụa nha xá màu Lam Cổ Điển dệt hoa chìm Liên Hoa, mặc ngoài áo lót trắng và quần lụa màu ngà tự nhiên.',
          accessories: isEn
            ? ['Deep indigo Khăn Xếp', 'Bamboo rib folding fan', 'Minimalist Guốc Mộc']
            : ['Khăn xếp lam thẫm', 'Quạt xếp nan trúc', 'Guốc gỗ mộc tối giản'],
          palette: [
            { name: isEn ? 'Classic Indigo' : 'Lam Cổ Điển', hex: '#1E3A8A', role: isEn ? 'Outer robe' : 'Áo ngoài' },
            { name: isEn ? 'Bamboo Green' : 'Thanh Trúc', hex: '#4D7C0F', role: isEn ? 'Accent' : 'Điểm nhấn' },
            { name: isEn ? 'Silk Ivory' : 'Ngà Lụa', hex: '#F5F5DC', role: isEn ? 'Inner & Trousers' : 'Áo lót & Quần' },
          ],
          culturalMeaning: isEn
            ? 'Faithfully preserves Emperor Minh Mạng era 5-button collar regulations in calm indigo tones, honoring youthful intellectual elegance.'
            : 'Giữ trọn quy chuẩn cổ lập lĩnh 5 khuy thời Minh Mạng với sắc lam trầm tĩnh tại, tôn vinh vẻ đẹp trí thức trẻ trung và tối giản.',
          outfitConfigCode: {
            config_id: isMale ? 'CFG_OPT2_THANHPHONG_NAM' : 'CFG_OPT2_THANHPHONG_NU',
            gender: isMale ? 'nam' : 'nu',
            garmentId: 'ao-ngu-than',
            paletteId: 'thanh-phong-nien-hoa',
            lowerGarmentId: 'quan-lua-trang',
            motifId: 'tu-quy-lien-hoa',
            accessoryIds: ['khan-xep', 'quat-tram-huong'],
            footwearId: 'guoc-go-moc',
            occasionId: 'ngay-tet',
            weatherId: 'xuan-am-ap',
            outerHex: '#1E3A8A',
            innerHex: '#F5F5DC',
            lowerHex: '#F5F5DC',
          },
        };

  const option3: StylistOptionPayload = !isMale
    ? {
        optionNumber: 3,
        outfitName: isEn ? 'Kinh Bắc Blossom — Áo Tứ Thân & Yếm Thắm' : 'Kinh Bắc Đào Hoa — Tứ Thân & Yếm Thắm',
        styleLabel: isEn ? 'Folklore & Gentle Accents' : 'Dân gian & Phá cách nhẹ nhàng',
        budgetTier: isEn ? 'Student Friendly' : 'Tiết kiệm (Học sinh/Sinh viên)',
        mainGarment: isEn
          ? 'Áo Tứ Thân in Cinnamon Brown flowing outer panels, Crimson Yếm inner top paired with A-line black silk flowing skirt.'
          : 'Áo Tứ Thân vải đũi tơ màu Nâu Quế Trầm buông rủ bên ngoài, áo Yếm Đào đỏ thắm bên trong phối cùng Váy đụp lụa đen xòe chữ A.',
        accessories: isEn
          ? ['Nón Quai Thao (Nón ba tầm)', 'Green silk waist sash', 'Guốc Mộc with strap']
          : ['Nón ba tầm (Nón quai thao)', 'Dải thắt lưng bao lụa xanh', 'Guốc mộc quai ngang'],
        palette: [
          { name: isEn ? 'Cinnamon Brown' : 'Nâu Quế Trầm', hex: '#78350F', role: isEn ? 'Outer robe' : 'Áo tứ thân ngoài' },
          { name: isEn ? 'Crimson Yếm' : 'Đỏ Yếm Đào', hex: '#B91C1C', role: isEn ? 'Yếm top' : 'Yếm đào' },
          { name: isEn ? 'Raven Black' : 'Đen Huyền', hex: '#1C1917', role: isEn ? 'Silk skirt' : 'Váy đụp xòe' },
        ],
        culturalMeaning: isEn
          ? 'Cultural heritage of Bắc Ninh Quan Họ folk traditions with 4 graceful panels and the multi-layered layering art embodying Northern countryside spirit.'
          : 'Di sản văn hóa Quan họ Bắc Ninh với cấu trúc 4 vạt duyên dáng và nghệ thuật phối màu nhiều lớp "mớ ba mớ bảy" đậm hồn quê Bắc Bộ.',
        outfitConfigCode: {
          config_id: 'CFG_OPT3_TUTHAN_NU',
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
      }
    : {
        optionNumber: 3,
        outfitName: isEn ? 'Southern Charm — Áo Bà Ba & Khăn Rằn' : 'Phương Nam Hào Sảng — Bà Ba & Khăn Rằn',
        styleLabel: isEn ? 'Relaxed & Modern' : 'Phóng khoáng hiện đại',
        budgetTier: isEn ? 'Student Friendly' : 'Tiết kiệm (Học sinh/Sinh viên)',
        mainGarment: isEn
          ? 'Áo Bà Ba in Sand White raw silk with airy side slits, paired with traditional wide-leg black silk trousers.'
          : 'Áo Bà Ba tơ đũi màu Be Cát Trắng xẻ tà hai bên thoáng mát, phối cùng quần lụa đen ống rộng truyền thống.',
        accessories: isEn
          ? ['Southern checkered Khăn Rằn', 'Handwoven conical hat', 'Natural Guốc Mộc']
          : ['Khăn rằn Nam Bộ kẻ ô', 'Nón lá chằm tay', 'Guốc gỗ mộc tự nhiên'],
        palette: [
          { name: isEn ? 'Sand White' : 'Be Cát Trắng', hex: '#D6CEBE', role: isEn ? 'Main top' : 'Áo chính' },
          { name: isEn ? 'Khăn Rằn Black' : 'Đen Khăn Rằn', hex: '#27272A', role: isEn ? 'Trousers & Scarf' : 'Quần lụa & Khăn' },
          { name: isEn ? 'Bamboo Brown' : 'Nâu Tre Mộc', hex: '#A16207', role: isEn ? 'Hat & Guốc' : 'Nón lá & Guốc' },
        ],
        culturalMeaning: isEn
          ? 'Symbolic cultural attire of the Southern river region, embodying simplicity, generosity, and comfortable movement for casual strolls or photography.'
          : 'Biểu tượng văn hóa đặc trưng của vùng sông nước Nam Bộ, đề cao sự mộc mạc, phóng khoáng và thoải mái khi dạo phố hay chụp ảnh ngoại cảnh.',
        outfitConfigCode: {
          config_id: 'CFG_OPT3_BABA_NAM',
          gender: 'nam',
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
      };

  const part1Summary = {
    event: detectedEvent,
    weather: detectedWeather,
    style: detectedStyle,
    budget: detectedBudget,
    overviewText: hasViolation
      ? isEn
        ? `The AI Stylist analyzed your styling request for "${detectedEvent}" (${detectedWeather}, style: ${detectedStyle}, budget: ${detectedBudget}) and triggered the Culture Guard filter to adjust deviations into 3 heritage-compliant 3D options below.`
        : `Hệ thống AI Stylist đã phân tích nhu cầu của bạn cho dịp "${detectedEvent}" (${detectedWeather}, phong cách ${detectedStyle}, ngân sách ${detectedBudget}) và đồng thời kích hoạt bộ lọc Culture Guard để điều chỉnh chi tiết lệch chuẩn văn hóa sang 3 phương án Lookbook 3D chuẩn cổ lệ dưới đây.`
      : isEn
      ? `Based on your context: Occasion "${detectedEvent}", Weather "${detectedWeather}", Style "${detectedStyle}", and Budget "${detectedBudget}", the AI Smart Stylist proposes 3 optimized 3D Lookbook options ready to try in the Virtual Fitting Room.`
      : `Dựa trên ngữ cảnh Sự kiện "${detectedEvent}", Thời tiết "${detectedWeather}", Phong cách "${detectedStyle}" và Ngân sách "${detectedBudget}", AI Smart Stylist đề xuất 3 phương án Lookbook 3D tối ưu có sẵn mã cấu hình để ướm thử ngay trong Phòng thử 3D.`,
  };

  const part2Options: StylistOptionPayload[] = [option1, option2, option3];
  const part3CultureGuard = {
    status: (hasViolation ? 'Warning' : 'Approved') as 'Approved' | 'Warning',
    statusLabel,
    hasViolation,
    violatedRule,
    detailNote,
  };

  const formattedMarkdownReport = formatMandatoryStylistResponse(
    part1Summary,
    part2Options,
    part3CultureGuard,
    language
  );

  // Pick primary card matching user intent best
  const primaryOpt =
    lower.includes('nhật bình') || lower.includes('cưới') || lower.includes('wedding')
      ? option2
      : lower.includes('tứ thân') || lower.includes('quan họ') || lower.includes('bà ba')
      ? option3
      : option1;

  return {
    replyIntro: part1Summary.overviewText,
    part1Summary,
    part2Options,
    part3CultureGuard,
    formattedMarkdownReport,
    lookbookCard: {
      outfitName: primaryOpt.outfitName,
      mainGarment: primaryOpt.mainGarment,
      accessories: primaryOpt.accessories,
      palette: primaryOpt.palette,
      occasionAndWeather: `${detectedEvent} · ${detectedWeather}`,
      culturalMeaning: primaryOpt.culturalMeaning,
      cultureGuardNote: `${part3CultureGuard.statusLabel} — ${part3CultureGuard.detailNote}`,
      hasViolation,
      garmentId: primaryOpt.outfitConfigCode.garmentId,
    },
  };
}

/**
 * MODULE 2: SOCIAL POSTS HUB — HASHTAG INGESTION ENGINE & CULTURE GUARD PIPELINE
 * Pipeline: [MXH] -> [Bắt Hashtag (#VietPhucLookbook | #VietPhucApp | #VietPhucStylist)] -> [Bộ Lọc AI & Culture Guard] -> [Bảng Tin Khóa Cục Bộ]
 */
function classifySocialPostHeuristic(input: {
  url?: string;
  author?: string;
  caption?: string;
  platformHint?: string;
  sourceHashtag?: string;
  enforceExclusiveHashtag?: boolean;
  isFrom3DApp?: boolean;
  studioConfig?: OutfitConfigPayload;
}) {
  const rawUrl = (input.url || '').trim();
  const rawCaption = (input.caption || '').trim();
  const combined = `${rawUrl} ${rawCaption} ${input.platformHint || ''} ${input.sourceHashtag || ''}`.toLowerCase();

  // STEP 1: Exclusive Hashtag Detection (#VietPhucLookbook, #VietPhucApp, #VietPhucStylist)
  let detectedHashtag: '#VietPhucLookbook' | '#VietPhucApp' | '#VietPhucStylist' | null = null;
  if (combined.includes('#vietphucapp') || input.sourceHashtag === '#VietPhucApp') {
    detectedHashtag = '#VietPhucApp';
  } else if (combined.includes('#vietphucstylist') || input.sourceHashtag === '#VietPhucStylist') {
    detectedHashtag = '#VietPhucStylist';
  } else if (combined.includes('#vietphuclookbook') || input.sourceHashtag === '#VietPhucLookbook') {
    detectedHashtag = '#VietPhucLookbook';
  }

  if (input.enforceExclusiveHashtag && !detectedHashtag) {
    return {
      ingested: false,
      rejectionReason: 'MISSING_EXCLUSIVE_HASHTAG',
      rejectionMessage:
        'Từ chối thu thập: Bài viết MXH không chứa 1 trong 3 Hashtag độc quyền (#VietPhucLookbook, #VietPhucApp, #VietPhucStylist).',
      culture_guard_status: 'Rejected' as const,
    };
  }

  const finalSourceHashtag: '#VietPhucLookbook' | '#VietPhucApp' | '#VietPhucStylist' =
    detectedHashtag || (input.isFrom3DApp ? '#VietPhucApp' : '#VietPhucLookbook');

  // STEP 2: Culture Guard AI Moderation on Social Post Content
  const rule1Violation =
    (combined.includes('nón quai thao') || combined.includes('nón ba tầm')) &&
    (combined.includes('nam sinh') || combined.includes('nam giới') || combined.includes('ngũ thân nam') || combined.includes('bạn nam'));
  const rule2Violation =
    combined.includes('rồng 5 móng') || combined.includes('ngũ trảo');
  const rule3Violation =
    combined.includes('nhật bình') &&
    (combined.includes('váy đụp ngắn') || combined.includes('váy ngắn') || combined.includes('quần jeans') || combined.includes('jean'));

  if (rule1Violation || rule2Violation || rule3Violation) {
    const violatedRule = rule1Violation ? 'RULE 1' : rule2Violation ? 'RULE 2' : 'RULE 3';
    const reasonDetail = rule1Violation
      ? 'Phối Nón quai thao/Nón ba tầm với Áo Ngũ thân nam giới (Vi phạm Rule 1).'
      : rule2Violation
      ? 'Sử dụng họa tiết Rồng 5 móng trên thường phục/trang phục dân gian (Vi phạm Rule 2).'
      : 'Phối Áo Nhật Bình với váy đụp ngắn hoặc quần jeans (Vi phạm Rule 3).';
    return {
      ingested: false,
      rejectionReason: 'CULTURE_GUARD_VIOLATION',
      violatedRule,
      rejectionMessage: `Bộ lọc AI Culture Guard đã chặn tự động: ${reasonDetail}`,
      culture_guard_status: 'Rejected' as const,
    };
  }

  // STEP 3: Platform Identification & 4-Group Smart Tagging
  let platform: 'TikTok' | 'Instagram' | 'Facebook' = 'TikTok';
  if (
    rawUrl.includes('instagram.com') ||
    combined.includes('instagram') ||
    combined.includes('palette') ||
    combined.includes('bộ ảnh') ||
    combined.includes('nhiếp ảnh cổ phong')
  ) {
    platform = 'Instagram';
  } else if (
    rawUrl.includes('facebook.com') ||
    rawUrl.includes('fb.com') ||
    combined.includes('facebook') ||
    combined.includes('phân tích lịch sử') ||
    combined.includes('review tiệm may') ||
    combined.includes('cho thuê')
  ) {
    platform = 'Facebook';
  } else if (
    rawUrl.includes('tiktok.com') ||
    combined.includes('tiktok') ||
    combined.includes('biến hình') ||
    combined.includes('vlog') ||
    combined.includes('9:16')
  ) {
    platform = 'TikTok';
  }

  const platformTag = `#${platform}`;

  // Type Tag (#VietPhucReal vs #VietPhuc3D vs #VietPhucStreetwear)
  const isStreetwearFusion =
    combined.includes('streetwear') ||
    combined.includes('sneaker') ||
    combined.includes('kính mát') ||
    combined.includes('#vietphucstreetwear');
  const is3D =
    Boolean(input.isFrom3DApp) ||
    finalSourceHashtag === '#VietPhucApp' ||
    combined.includes('3d') ||
    combined.includes('vietphuc3d') ||
    combined.includes('thiết kế từ app') ||
    combined.includes('phòng thử');
  const typeTag = isStreetwearFusion
    ? '#VietPhucStreetwear'
    : is3D
    ? '#VietPhuc3D'
    : '#VietPhucReal';

  // Outfit Tag (#AoNguThan, #AoNhatBinh, #AoTuThan, #AoDaiTieuChuan, #AoBaBa)
  let outfitTag = '#AoNguThan';
  let garmentId: OutfitConfigPayload['garmentId'] = input.studioConfig?.garmentId || 'ao-ngu-than';
  if (combined.includes('nhật bình') || combined.includes('nhatbinh') || garmentId === 'ao-nhat-binh') {
    outfitTag = '#AoNhatBinh';
    garmentId = 'ao-nhat-binh';
  } else if (combined.includes('tứ thân') || combined.includes('tuthan') || combined.includes('yếm') || garmentId === 'ao-tu-than') {
    outfitTag = '#AoTuThan';
    garmentId = 'ao-tu-than';
  } else if (combined.includes('bà ba') || combined.includes('baba') || combined.includes('khăn rằn')) {
    outfitTag = '#AoBaBa';
    garmentId = 'ao-dai-ba-ba';
  } else if (combined.includes('áo dài') || combined.includes('tân thời') || combined.includes('aodai')) {
    outfitTag = '#AoDaiTieuChuan';
    garmentId = 'ao-dai-ba-ba';
  }

  // Event/Context Tag (#DoDiTotNghiep, #DoDiChua, #DoDiCuoi, #KyYeu, #DaoPho)
  let eventTag = '#DoDiTotNghiep';
  let occasionId = input.studioConfig?.occasionId || 'tot-nghiep';
  if (combined.includes('cưới') || combined.includes('ăn hỏi') || combined.includes('cuoi')) {
    eventTag = '#DoDiCuoi';
    occasionId = 'cuoi-hoi';
  } else if (combined.includes('chùa') || combined.includes('lễ hội') || combined.includes('di tích') || combined.includes('tết')) {
    eventTag = '#DoDiChua';
    occasionId = 'ngay-tet';
  } else if (combined.includes('kỷ yếu') || combined.includes('kyyeu')) {
    eventTag = '#KyYeu';
    occasionId = 'tot-nghiep';
  } else if (combined.includes('dạo phố') || combined.includes('daopho') || combined.includes('cafe')) {
    eventTag = '#DaoPho';
    occasionId = 'dao-pho';
  }

  const postId = `SP_${platform.toUpperCase()}_${Date.now().toString().slice(-6)}`;
  const hasReFit3D = true;
  const configId = input.studioConfig?.config_id || `CFG_${outfitTag.replace('#', '').toUpperCase()}_${Date.now().toString().slice(-4)}`;

  const defaultConfig: OutfitConfigPayload = input.studioConfig || {
    config_id: configId,
    gender: combined.includes('nam') ? 'nam' : 'nu',
    garmentId,
    paletteId:
      garmentId === 'ao-nhat-binh'
        ? 'chu-sa-ngu-uyen'
        : garmentId === 'ao-tu-than'
        ? 'kinh-bac-dao-hoa'
        : garmentId === 'ao-dai-ba-ba'
        ? 'phuong-nam-binh-di'
        : 'khue-van-tri-thuc',
    lowerGarmentId: garmentId === 'ao-tu-than' ? 'vay-dup-den' : 'quan-lua-trang',
    motifId: garmentId === 'ao-nhat-binh' ? 'phuong-vu-bat-buu' : 'am-hoa-tron',
    accessoryIds:
      garmentId === 'ao-nhat-binh'
        ? ['man-doi-dau', 'xuyen-bac']
        : garmentId === 'ao-tu-than'
        ? ['non-quai-thao', 'dai-lung-bao']
        : garmentId === 'ao-dai-ba-ba'
        ? ['khan-ran-non-la']
        : ['khan-xep', 'quat-tram-huong'],
    footwearId: garmentId === 'ao-nhat-binh' ? 'hai-theu' : 'guoc-go-moc',
    occasionId,
    weatherId: 'thu-ha-noi',
    outerHex: garmentId === 'ao-nhat-binh' ? '#9A3412' : garmentId === 'ao-tu-than' ? '#78350F' : '#2E8B57',
    innerHex: '#FFFFF0',
    lowerHex: garmentId === 'ao-tu-than' ? '#1C1917' : '#FFFFF0',
  };

  const contentCategory =
    platform === 'TikTok'
      ? 'Video ngắn (9:16) · Biến hình & Phối đồ thực tế'
      : platform === 'Instagram'
      ? 'Bộ ảnh nghệ thuật · Bảng màu (Palette) & Nhiếp ảnh cổ phong'
      : 'Bài viết cộng đồng · Phân tích lịch sử & Cảm nhận văn hóa';

  const cleanTitle =
    rawCaption.replace(/#vietphuclookbook|#vietphucapp|#vietphucstylist/gi, '').trim().slice(0, 88) ||
    `Xu hướng ${outfitTag} cho dịp ${eventTag} trên ${platform}`;

  const vendorByGarment =
    garmentId === 'ao-nhat-binh'
      ? {
          vendor_id: 'VENDOR_HOA_NIEN_HUE',
          vendor_name: 'Hoa Niên — Cổ Phục Cung Đình Huế',
          google_maps_location: 'Đại Nội Huế, Thừa Thiên Huế',
          rental_price_per_day: '380.000đ/ngày',
          tailoring_available: true,
        }
      : garmentId === 'ao-tu-than'
      ? {
          vendor_id: 'VENDOR_DONG_PHONG_BN',
          vendor_name: 'Đông Phong Atelier — Y Phục Kinh Bắc',
          google_maps_location: 'Làng cổ Đường Lâm, Sơn Tây, Hà Nội',
          rental_price_per_day: '220.000đ/ngày',
          tailoring_available: true,
        }
      : garmentId === 'ao-dai-ba-ba'
      ? {
          vendor_id: 'VENDOR_LUA_PHUONG_NAM_SG',
          vendor_name: 'Tiệm Lụa Phương Nam — Sài Gòn',
          google_maps_location: 'Dinh Độc Lập, Quận 1, TP.HCM',
          rental_price_per_day: '200.000đ/ngày',
          tailoring_available: true,
        }
      : {
          vendor_id: 'VENDOR_Y_VAN_HIEN_HN',
          vendor_name: 'Ỷ Vân Hiên — Cổ Phục Kinh Kỳ',
          google_maps_location: 'Văn Miếu - Quốc Tử Giám, Hà Nội',
          rental_price_per_day: '280.000đ/ngày',
          tailoring_available: true,
        };

  const locationEncoded = encodeURIComponent(vendorByGarment.google_maps_location);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${locationEncoded}`;
  const resolvedAuthor =
    input.author?.trim() || (platform === 'Facebook' ? 'Thành Viên Cộng Đồng Việt Phục' : '@vietphuc.creator');
  const resolvedOriginalUrl =
    rawUrl || `https://www.${platform.toLowerCase()}.com/vietphuc-lookbook/${postId.toLowerCase()}`;

  return {
    ingested: true,
    // Exact required Dual-Tab Community Hub JSON Output Schema
    post_id: postId,
    community_tab_type: 'TAB_1_SOCIAL_TRENDS' as const,
    platform_or_shop_type: platform,
    author_or_vendor: {
      name: resolvedAuthor,
      is_verified_partner: false,
      location_query: vendorByGarment.google_maps_location,
    },
    content: {
      caption_or_description:
        rawCaption ||
        `Bài đăng có gắn ${finalSourceHashtag} được tự động thu thập qua Hashtag Ingestion Engine, vượt qua kiểm duyệt Culture Guard và gắn 4 thẻ (${platformTag}, ${typeTag}, ${outfitTag}, ${eventTag}).`,
      original_url: resolvedOriginalUrl,
      media_aspect_ratio: platform === 'TikTok' ? '9:16' : platform === 'Instagram' ? '4:5' : '1:1',
    },
    metadata: {
      source_hashtag: finalSourceHashtag,
      smart_tags: [platformTag, typeTag, outfitTag, eventTag],
      has_re_fit_3d: hasReFit3D,
      outfit_config_id: configId,
      google_maps_url: googleMapsUrl,
    },
    // Backwards-compatible SocialPostItem properties for UI cards
    platform,
    author: resolvedAuthor,
    original_url: resolvedOriginalUrl,
    source_hashtag: finalSourceHashtag,
    tags: [platformTag, typeTag, outfitTag, eventTag],
    has_re_fit_3d: hasReFit3D,
    outfit_config_id: configId,
    culture_guard_status: (isStreetwearFusion ? 'Warning' : 'Approved') as 'Approved' | 'Warning',
    is_local_locked: true,
    moderation: {
      ai_spam_score: 0.02,
      culture_guard_status: (isStreetwearFusion ? 'WARNING' : 'APPROVED') as 'APPROVED' | 'WARNING',
      admin_approval_status: 'APPROVED' as const,
    },
    marketplace_services: {
      is_available_for_rent_or_tailor: true,
      rental_info: {
        price_per_day: vendorByGarment.rental_price_per_day,
        booking_available: true,
        booking_url: `https://vietphuclookbook.app/marketplace/rent/${vendorByGarment.vendor_id}?post=${postId}`,
      },
      tailoring_info: {
        custom_tailoring_available: vendorByGarment.tailoring_available,
        estimated_lead_time_days: 10,
        accepts_3d_avatar_measurements: true,
        send_3d_measurements_url: `https://vietphuclookbook.app/marketplace/tailor/${vendorByGarment.vendor_id}?config=${configId}`,
      },
    },
    marketplace_integration: {
      is_shoppable: true,
      vendor_info: vendorByGarment,
      action_links: {
        magic_refit_3d: hasReFit3D,
        rent_now_url: `https://vietphuclookbook.app/marketplace/rent/${vendorByGarment.vendor_id}?post=${postId}`,
        send_measurements_to_tailor_url: `https://vietphuclookbook.app/marketplace/tailor/${vendorByGarment.vendor_id}?config=${configId}`,
      },
    },
    // Rich UI metadata
    title: cleanTitle,
    caption:
      rawCaption ||
      `Bài đăng có gắn ${finalSourceHashtag} được tự động thu thập qua Hashtag Ingestion Engine, vượt qua kiểm duyệt Culture Guard và gắn 4 thẻ (${platformTag}, ${typeTag}, ${outfitTag}, ${eventTag}).`,
    contentCategory,
    aspectRatio: platform === 'TikTok' ? '9:16' : platform === 'Instagram' ? '4:5' : '16:9',
    outfitConfig: defaultConfig,
  };
}

// ============================================================================
// SINGLETON GEMINI CLIENT & TIMEOUT WRAPPER
// ============================================================================
let cachedAiClient: GoogleGenAI | null = null;
let lastApiKey: string | undefined = undefined;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!cachedAiClient || lastApiKey !== apiKey) {
    cachedAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
    lastApiKey = apiKey;
  }
  return cachedAiClient;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 12000): Promise<T> {
  let timer: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Gemini API call timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// ============================================================================
// HIGH-PERFORMANCE IN-MEMORY TTL CACHE
// ============================================================================
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class SimpleTtlCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private ttlMs: number;

  constructor(maxSize = 120, ttlMinutes = 20) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}

const socialClassifyCache = new SimpleTtlCache<any>(100, 20);
const lookbookGenCache = new SimpleTtlCache<any>(100, 30);
const lookbookCompareCache = new SimpleTtlCache<any>(60, 30);
const advisorChatCache = new SimpleTtlCache<any>(80, 15);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(express.static(path.resolve(process.cwd(), 'public'), { maxAge: '1d' }));
  app.use(
    '/src/assets/images',
    express.static(path.resolve(process.cwd(), 'src/assets/images'), { maxAge: '7d' })
  );

  // Healthcheck endpoint for Cloud Run / Production monitoring
  app.get('/api/health', (_req, res) => {
    const ai = getGeminiClient();
    res.json({
      status: 'healthy',
      service: 'VietAura Fashion-Tech Ecosystem',
      version: '1.0.0',
      uptime_seconds: Math.floor(process.uptime()),
      gemini_ai_active: Boolean(ai),
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================================================
  // ENDPOINT 1: SOCIAL POSTS HUB — HASHTAG INGESTION & CULTURE GUARD ENGINE
  // ==========================================================================
  app.post('/api/social-hub/classify', async (req, res) => {
    const {
      url,
      author,
      caption,
      platformHint,
      sourceHashtag,
      enforceExclusiveHashtag,
      isFrom3DApp,
      studioConfig,
      mediaInfo,
      hashtags = [],
      searchQuery,
    } = req.body || {};

    const combinedCaption = [caption, searchQuery, Array.isArray(hashtags) ? hashtags.join(' ') : '']
      .filter(Boolean)
      .join(' ');

    const cacheKey = `${url || ''}_${combinedCaption || ''}_${(hashtags || []).join(',')}_${platformHint || ''}`;
    const cachedResult = socialClassifyCache.get(cacheKey);
    if (cachedResult) {
      res.json(cachedResult);
      return;
    }

    const heuristicResult = classifySocialPostHeuristic({
      url,
      author,
      caption: combinedCaption || caption,
      platformHint,
      sourceHashtag,
      enforceExclusiveHashtag,
      isFrom3DApp,
      studioConfig,
    });

    const ai = getGeminiClient();
    if (!ai) {
      const fallbackPayload = {
        ...heuristicResult,
        smart_tags: heuristicResult.tags,
        ai_spam_score: heuristicResult.moderation?.ai_spam_score || 0.02,
        culture_guard_status: heuristicResult.culture_guard_status,
      };
      socialClassifyCache.set(cacheKey, fallbackPayload);
      res.json(fallbackPayload);
      return;
    }

    try {
      const classifyPrompt = `Bạn là Trợ lý AI Phân loại & Kiểm duyệt Mạng xã hội chuyên sâu về Cổ phục Việt Nam (VietAura Social Hub).
Hãy phân tích dữ liệu bài đăng sau:
- URL / Media Info: "${url || mediaInfo || ''}"
- Tác giả: "${author || ''}"
- Nội dung / Caption: "${caption || ''}"
- Thẻ Hashtags hiện có: "${(hashtags || []).join(', ')}"
- Gợi ý nền tảng: "${platformHint || ''}"
- Xuất từ ứng dụng 3D: ${Boolean(isFrom3DApp)}

Nhiệm vụ:
1. Xác định platform: "TikTok" | "Instagram" | "Facebook".
2. Tạo mảng smart_tags gồm 4 thẻ chuẩn mực:
   - Platform: "#TikTok" | "#Instagram" | "#Facebook"
   - Loại hình: "#VietPhucReal" (ảnh thật) hoặc "#VietPhuc3D" (dựng 3D/ảo)
   - Trang phục: "#AoNguThan" | "#AoNhatBinh" | "#AoTuThan" | "#AoDaiTieuChuan" | "#AoBaBa"
   - Bối cảnh: "#DoDiTotNghiep" | "#DoDiChua" | "#DoDiCuoi" | "#KyYeu" | "#DaoPho"
3. Tính toán ai_spam_score: Điểm số từ 0.00 đến 1.00 (thấp hơn 0.3 là bài đăng chất lượng cao về di sản).
4. Đánh giá culture_guard_status:
   - "Approved": Tuân thủ trang nghiêm nét đẹp cổ phục truyền thống hoặc phối đồ hợp lệ.
   - "Warning": Phối đồ phong cách tân thời đường phố (Modern Fusion: kết hợp sneaker/kính mát, chỉ nên dạo phố/cafe).
   - "Rejected": Vi phạm quy chuẩn nghiêm trọng (ví dụ: mặc hở hang đi lễ chùa, xúc phạm di sản, đồ giả mạo triều phục hoàng đế).
5. Xác định classified_garment: "ao-ngu-than" | "ao-nhat-binh" | "ao-tu-than" | "ao-dai-ba-ba"`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: classifyPrompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                post_id: { type: Type.STRING },
                platform: { type: Type.STRING },
                author: { type: Type.STRING },
                original_url: { type: Type.STRING },
                smart_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                ai_spam_score: { type: Type.NUMBER },
                culture_guard_status: { type: Type.STRING },
                classified_garment: { type: Type.STRING },
                has_re_fit_3d: { type: Type.BOOLEAN },
                outfit_config_id: { type: Type.STRING },
                title: { type: Type.STRING },
              },
              required: [
                'platform',
                'smart_tags',
                'ai_spam_score',
                'culture_guard_status',
                'classified_garment',
              ],
            },
          },
        }),
        10000
      );

      const rawText = response.text;
      const parsed = JSON.parse((rawText || '{}').trim());
      const finalSmartTags =
        Array.isArray(parsed.smart_tags) && parsed.smart_tags.length >= 2
          ? parsed.smart_tags
          : heuristicResult.tags;
      const finalSpamScore =
        typeof parsed.ai_spam_score === 'number'
          ? Math.max(0, Math.min(1, parsed.ai_spam_score))
          : 0.03;
      const finalGuardStatus =
        parsed.culture_guard_status === 'Rejected'
          ? 'Rejected'
          : parsed.culture_guard_status === 'Warning'
          ? 'Warning'
          : 'Approved';

      const finalResponsePayload = {
        ...heuristicResult,
        post_id: parsed.post_id || heuristicResult.post_id,
        platform:
          parsed.platform === 'TikTok' || parsed.platform === 'Instagram' || parsed.platform === 'Facebook'
            ? parsed.platform
            : heuristicResult.platform,
        author: parsed.author || heuristicResult.author,
        original_url: parsed.original_url || heuristicResult.original_url,
        smart_tags: finalSmartTags,
        tags: finalSmartTags,
        ai_spam_score: finalSpamScore,
        culture_guard_status: finalGuardStatus,
        classified_garment: parsed.classified_garment || heuristicResult.outfitConfig?.garmentId,
        has_re_fit_3d: Boolean(parsed.has_re_fit_3d ?? heuristicResult.has_re_fit_3d),
        outfit_config_id: parsed.outfit_config_id || heuristicResult.outfit_config_id,
        title: parsed.title || heuristicResult.title,
        moderation: {
          ai_spam_score: finalSpamScore,
          culture_guard_status: finalGuardStatus === 'Approved' ? 'APPROVED' : finalGuardStatus === 'Warning' ? 'WARNING' : 'REJECTED',
          admin_approval_status: 'APPROVED',
        },
      };

      socialClassifyCache.set(cacheKey, finalResponsePayload);
      res.json(finalResponsePayload);
    } catch {
      const fallbackResult = {
        ...heuristicResult,
        smart_tags: heuristicResult.tags,
        ai_spam_score: 0.03,
        culture_guard_status: heuristicResult.culture_guard_status,
      };
      socialClassifyCache.set(cacheKey, fallbackResult);
      res.json(fallbackResult);
    }
  });

  // ==========================================================================
  // ENDPOINT 2: AI SMART STYLIST ASSISTANT (3 OPTIONS + CULTURE GUARD ENGINE)
  // ==========================================================================
  app.post('/api/advisor/chat', async (req, res) => {
    const { message, history = [], studioContext, quizInputs, language = 'vi' } = req.body || {};
    const isEn = language === 'en';

    if (!message || typeof message !== 'string') {
      res.status(400).json({
        error: isEn
          ? 'Please enter your question or styling preferences.'
          : 'Vui lòng nhập nội dung câu hỏi hoặc nhu cầu phối đồ.',
      });
      return;
    }

    const baseFallback = buildIntelligentCulturalFallback(
      message,
      {
        ...quizInputs,
        gender: studioContext?.gender === 'Nam giới' ? 'nam' : quizInputs?.gender,
      },
      language
    );

    const cacheKey = `${message.trim().toLowerCase()}_${quizInputs?.event || ''}_${quizInputs?.weather || ''}_${quizInputs?.style || ''}_${quizInputs?.budget || ''}_${studioContext?.gender || ''}_${language}`;
    const cachedAdvisorResult = advisorChatCache.get(cacheKey);
    if (cachedAdvisorResult && (!history || history.length === 0)) {
      res.json(cachedAdvisorResult);
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({
        ...baseFallback,
        source: 'cultural-knowledge-engine',
      });
      return;
    }

    try {
      const contextText = studioContext
        ? `\n[Bối cảnh Xưởng Phối Đồ 3D hiện tại: Giới tính=${studioContext.gender}, Trang phục=${studioContext.garmentName}, Bảng màu=${studioContext.paletteName}, Quần/Váy=${studioContext.lowerGarment}, Họa tiết=${studioContext.motif}, Phụ kiện=${(studioContext.accessories || []).join(', ')}, Giày/Guốc=${studioContext.footwear}, Sự kiện=${studioContext.occasion}, Thời tiết=${studioContext.weather}]`
        : '';

      const quizText = quizInputs
        ? `\n[4 Biến Input Trắc Nghiệm: Event="${quizInputs.event || ''}", Weather="${quizInputs.weather || ''}", Style="${quizInputs.style || ''}", Budget="${quizInputs.budget || ''}"]`
        : '';

      const historySummary = Array.isArray(history)
        ? history
            .slice(-4)
            .map((h: { role: string; text: string }) => `${h.role === 'user' ? 'Người dùng' : 'AI Stylist'}: ${h.text}`)
            .join('\n')
        : '';

      const languageInstruction = isEn
        ? `\n\nLANGUAGE SPECIFICATION: Output all overviewText, styleLabel, mainGarment, culturalMeaning, and detailNote in natural, elegant English. STRICT RULE: Keep traditional Vietnamese costume proper nouns in their original Vietnamese names (e.g., "Áo Ngũ Thân", "Áo Nhật Bình", "Áo Tứ Thân", "Áo Dài", "Áo Bà Ba", "Khăn Xếp", "Mấn Đội Đầu", "Nón Quai Thao", "Hài Thêu", "Guốc Mộc"). Never translate them to descriptive terms.`
        : '';

      const fullPrompt = `${historySummary ? `Lịch sử trò chuyện:\n${historySummary}\n\n` : ''}Yêu cầu tư vấn của người dùng: "${message}"${quizText}${contextText}

Hãy phân tích ngữ cảnh và xuất ra CHÍNH XÁC 3 PHƯƠNG ÁN LOOKBOOK 3D TỐI ƯU (part2Options gồm đúng 3 phương án Option 1, Option 2, Option 3) cùng kiểm duyệt Culture Guard (RULE 1: Không phối Nón quai thao với Áo Ngũ Thân nam; RULE 2: Không dùng họa tiết Rồng 5 móng cho thường phục; RULE 3: Không phối Áo Nhật Bình với váy đụp ngắn/quần jeans).${languageInstruction}`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: fullPrompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                part1Summary: {
                  type: Type.OBJECT,
                  properties: {
                    event: { type: Type.STRING },
                    weather: { type: Type.STRING },
                    style: { type: Type.STRING },
                    budget: { type: Type.STRING },
                    overviewText: { type: Type.STRING },
                  },
                  required: ['event', 'weather', 'style', 'budget', 'overviewText'],
                },
                part2Options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      optionNumber: { type: Type.INTEGER },
                      outfitName: { type: Type.STRING },
                      styleLabel: { type: Type.STRING },
                      budgetTier: { type: Type.STRING },
                      mainGarment: { type: Type.STRING },
                      accessories: { type: Type.ARRAY, items: { type: Type.STRING } },
                      palette: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            hex: { type: Type.STRING },
                            role: { type: Type.STRING },
                          },
                          required: ['name', 'hex', 'role'],
                        },
                      },
                      culturalMeaning: { type: Type.STRING },
                      garmentId: { type: Type.STRING },
                      paletteId: { type: Type.STRING },
                      lowerGarmentId: { type: Type.STRING },
                      accessoryIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                      footwearId: { type: Type.STRING },
                    },
                    required: [
                      'optionNumber',
                      'outfitName',
                      'styleLabel',
                      'budgetTier',
                      'mainGarment',
                      'accessories',
                      'palette',
                      'culturalMeaning',
                      'garmentId',
                    ],
                  },
                },
                part3CultureGuard: {
                  type: Type.OBJECT,
                  properties: {
                    hasViolation: { type: Type.BOOLEAN },
                    violatedRule: { type: Type.STRING },
                    detailNote: { type: Type.STRING },
                  },
                  required: ['hasViolation', 'detailNote'],
                },
              },
              required: ['part1Summary', 'part2Options', 'part3CultureGuard'],
            },
          },
        }),
        12000
      );

      const rawText = response.text;
      if (!rawText) throw new Error('Empty response from Gemini');

      const parsed = JSON.parse(rawText.trim());
      const rawOpts = Array.isArray(parsed.part2Options) ? parsed.part2Options.slice(0, 3) : [];
      const mergedOptions: StylistOptionPayload[] = [0, 1, 2].map((idx) => {
        const fbOpt = baseFallback.part2Options[idx];
        const aiOpt = rawOpts[idx];
        if (!aiOpt) return fbOpt;
        const validGarmentId =
          aiOpt.garmentId === 'ao-ngu-than' ||
          aiOpt.garmentId === 'ao-nhat-binh' ||
          aiOpt.garmentId === 'ao-tu-than' ||
          aiOpt.garmentId === 'ao-dai-ba-ba'
            ? aiOpt.garmentId
            : fbOpt.outfitConfigCode.garmentId;
        const paletteArr =
          Array.isArray(aiOpt.palette) && aiOpt.palette.length >= 2
            ? aiOpt.palette
            : fbOpt.palette;
        return {
          optionNumber: (idx + 1) as 1 | 2 | 3,
          outfitName: aiOpt.outfitName || fbOpt.outfitName,
          styleLabel: aiOpt.styleLabel || fbOpt.styleLabel,
          budgetTier: aiOpt.budgetTier || fbOpt.budgetTier,
          mainGarment: aiOpt.mainGarment || fbOpt.mainGarment,
          accessories:
            Array.isArray(aiOpt.accessories) && aiOpt.accessories.length > 0
              ? aiOpt.accessories
              : fbOpt.accessories,
          palette: paletteArr,
          culturalMeaning: aiOpt.culturalMeaning || fbOpt.culturalMeaning,
          outfitConfigCode: {
            ...fbOpt.outfitConfigCode,
            config_id: `CFG_AI_OPT${idx + 1}_${Date.now().toString().slice(-4)}`,
            garmentId: validGarmentId,
            outerHex: paletteArr[0]?.hex || fbOpt.outfitConfigCode.outerHex,
            innerHex: paletteArr[1]?.hex || fbOpt.outfitConfigCode.innerHex,
            lowerHex: paletteArr[2]?.hex || fbOpt.outfitConfigCode.lowerHex,
          },
        };
      });

      const hasViolation =
        Boolean(parsed.part3CultureGuard?.hasViolation) ||
        baseFallback.part3CultureGuard.hasViolation;
      const part3CultureGuard = {
        status: (hasViolation ? 'Warning' : 'Approved') as 'Approved' | 'Warning',
        statusLabel: hasViolation
          ? isEn
            ? '🔴 Warning (Adjustment Needed)'
            : '🔴 Cảnh báo (Cần điều chỉnh)'
          : isEn
          ? '🟢 Approved (Heritage Compliant)'
          : '🟢 Đã kiểm duyệt (Approved)',
        hasViolation,
        violatedRule:
          parsed.part3CultureGuard?.violatedRule ||
          baseFallback.part3CultureGuard.violatedRule,
        detailNote:
          parsed.part3CultureGuard?.detailNote ||
          baseFallback.part3CultureGuard.detailNote,
      };

      const part1Summary = {
        event: parsed.part1Summary?.event || baseFallback.part1Summary.event,
        weather: parsed.part1Summary?.weather || baseFallback.part1Summary.weather,
        style: parsed.part1Summary?.style || baseFallback.part1Summary.style,
        budget: parsed.part1Summary?.budget || baseFallback.part1Summary.budget,
        overviewText:
          parsed.part1Summary?.overviewText || baseFallback.part1Summary.overviewText,
      };

      const formattedMarkdownReport = formatMandatoryStylistResponse(
        part1Summary,
        mergedOptions,
        part3CultureGuard,
        language
      );

      const primaryOpt = mergedOptions[0];

      const successResponse = {
        replyIntro: part1Summary.overviewText,
        part1Summary,
        part2Options: mergedOptions,
        part3CultureGuard,
        formattedMarkdownReport,
        lookbookCard: {
          outfitName: primaryOpt.outfitName,
          mainGarment: primaryOpt.mainGarment,
          accessories: primaryOpt.accessories,
          palette: primaryOpt.palette,
          occasionAndWeather: `${part1Summary.event} · ${part1Summary.weather}`,
          culturalMeaning: primaryOpt.culturalMeaning,
          cultureGuardNote: `${part3CultureGuard.statusLabel} — ${part3CultureGuard.detailNote}`,
          hasViolation,
          garmentId: primaryOpt.outfitConfigCode.garmentId,
        },
        source: 'gemini-3.8-flash',
      };

      advisorChatCache.set(cacheKey, successResponse);
      res.json(successResponse);
    } catch (error) {
      console.error('Gemini Stylist fallback triggered:', error);
      res.json({
        ...baseFallback,
        source: 'cultural-knowledge-fallback',
      });
    }
  });

  // ==========================================================================
  // ENDPOINT 3: LOOKBOOK CARD GENERATOR & DEEP LINK ENGINE
  // ==========================================================================
  app.post('/api/lookbook/generate', async (req, res) => {
    const {
      basePackage,
      garmentName = 'Áo Ngũ Thân Lập Lĩnh',
      gender = 'nu',
      primaryHex = '#2E8B57',
      secondaryHex = '#FFFFF0',
      accentHex = '#8B4513',
      accessories = ['Khăn xếp', 'Quạt trầm hương', 'Guốc gỗ mộc'],
      contextLabel = 'Lễ tốt nghiệp · Mùa thu Hà Nội',
    } = req.body || {};

    const fallbackLookbookId =
      basePackage?.lookbook_id || `VP_${Date.now().toString(36).toUpperCase().slice(-6)}`;

    const defaultResult = {
      lookbook_id: fallbackLookbookId,
      title: basePackage?.title || 'Thanh Phong Niên Hoa',
      creator_info: basePackage?.creator_info || {
        user_id: 'CREATOR_VP_STUDIO',
        username: gender === 'nam' ? '@thanh.vietphuc' : '@tham.vietphuc',
        avatar_url: '/images/model_2d_nu_ngu_than.png',
      },
      outfit_details: basePackage?.outfit_details || {
        type: garmentName,
        primary_color: primaryHex,
        secondary_color: secondaryHex,
        accent_color: accentHex,
        accessories_list: accessories,
      },
      palette_colors: basePackage?.palette_colors || [
        { hex: primaryHex, name: 'Xanh Ngọc Lam', role: 'Vạt áo ngoài' },
        { hex: secondaryHex, name: 'Trắng Ngà', role: 'Áo lót & Quần lụa' },
        { hex: accentHex, name: 'Gỗ Mộc', role: 'Phụ kiện & Hài/Guốc' },
      ],
      cultural_note:
        basePackage?.cultural_note ||
        'Định hình năm 1744 và trở thành quốc phục thời Minh Mạng; cấu trúc 5 vạt áo và 5 hạt khuy tượng trưng cho đạo lý Ngũ Thường và Tứ thân phụ mẫu.',
      context_recommended: basePackage?.context_recommended || contextLabel,
      sharing_links: basePackage?.sharing_links || {
        deep_link: `https://vietphuclookbook.app/look/${fallbackLookbookId}`,
        web_preview_url: `https://vietphuclookbook.app/preview/${fallbackLookbookId}`,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
          `https://vietphuclookbook.app/look/${fallbackLookbookId}`
        )}`,
      },
      social_export_presets: basePackage?.social_export_presets || {
        story_9_16_ratio: '1080x1920px · Story / Reels / TikTok (Dọc)',
        post_1_1_ratio: '1080x1080px · Post Feed (Vuông)',
        post_4_5_ratio: '1080x1350px · Post Feed Instagram (Dọc 4:5)',
      },
      encoded_payload: basePackage?.encoded_payload,
    };

    const cacheKey = `${garmentName}_${gender}_${primaryHex}_${secondaryHex}_${accentHex}_${contextLabel}_${accessories.join(',')}`;
    const cachedLookbook = lookbookGenCache.get(cacheKey);
    if (cachedLookbook) {
      res.json(cachedLookbook);
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      lookbookGenCache.set(cacheKey, defaultResult);
      res.json(defaultResult);
      return;
    }

    try {
      const prompt = `Hãy đóng gói thẻ Lookbook Việt Phục cho cấu hình sau:
- Trang phục: ${garmentName} (${gender === 'nam' ? 'Nam' : 'Nữ'})
- Mã màu HEX: Áo ngoài ${primaryHex}, Áo lót/Quần ${secondaryHex}, Phụ kiện ${accentHex}
- Phụ kiện: ${(accessories || []).join(', ')}
- Bối cảnh: ${contextLabel}

Hãy tạo:
1. title: Tên bộ phối mang tinh thần Đông Phương/Cổ phong ấn tượng (4-6 chữ, ví dụ: "Thanh Phong Niên Hoa", "Khuê Văn Tri Thức", "Xinh Tươi Ngày Tết", "Bách Hoa Bộ Hành").
2. palette_colors: Mảng 3 màu gồm hex và name (tên màu Đông Phương tinh tế).
3. cultural_note: 1-2 câu cô đọng giải thích nguồn gốc, cấu trúc cắt may và ý nghĩa văn hóa của bộ trang phục.`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                palette_colors: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      hex: { type: Type.STRING },
                      name: { type: Type.STRING },
                    },
                    required: ['hex', 'name'],
                  },
                },
                cultural_note: { type: Type.STRING },
              },
              required: ['title', 'palette_colors', 'cultural_note'],
            },
          },
        }),
        10000
      );

      const rawText = response.text;
      if (!rawText) throw new Error('Empty Gemini response');
      const parsed = JSON.parse(rawText.trim());

      const finalResult = {
        ...defaultResult,
        title: parsed.title || defaultResult.title,
        palette_colors:
          Array.isArray(parsed.palette_colors) && parsed.palette_colors.length >= 2
            ? parsed.palette_colors.map((item: { hex: string; name: string }, i: number) => ({
                hex: item.hex || defaultResult.palette_colors[i]?.hex || primaryHex,
                name: item.name || defaultResult.palette_colors[i]?.name || 'Sắc Lụa Cổ Truyền',
                role: defaultResult.palette_colors[i]?.role,
              }))
            : defaultResult.palette_colors,
        cultural_note: parsed.cultural_note || defaultResult.cultural_note,
      };

      lookbookGenCache.set(cacheKey, finalResult);
      res.json(finalResult);
    } catch {
      lookbookGenCache.set(cacheKey, defaultResult);
      res.json(defaultResult);
    }
  });

  // ==========================================================================
  // ENDPOINT 4: LOOKBOOK COMPARISON ENGINE (SO SÁNH 2 PHƯƠNG ÁN PHỐI)
  // ==========================================================================
  app.post('/api/lookbook/compare', async (req, res) => {
    const { localComparison, userContext = 'Lễ tốt nghiệp & Chụp ảnh di tích' } = req.body || {};

    if (!localComparison) {
      res.status(400).json({ error: 'Thiếu dữ liệu 2 bộ Lookbook để so sánh.' });
      return;
    }

    const cacheKey = `${localComparison.outfit_a?.id || 'A'}_${localComparison.outfit_b?.id || 'B'}_${userContext}`;
    const cachedCompare = lookbookCompareCache.get(cacheKey);
    if (cachedCompare) {
      res.json(cachedCompare);
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      lookbookCompareCache.set(cacheKey, localComparison);
      res.json(localComparison);
      return;
    }

    try {
      const prompt = `So sánh thực tiễn 2 bộ Lookbook Việt Phục sau đây cho nhu cầu "${userContext}":
- BỘ A: "${localComparison.outfit_a?.title}" (${localComparison.outfit_a?.mainGarment}) · Chi tiết tiêu chí: ${JSON.stringify(localComparison.criteria_rows)}
- BỘ B: "${localComparison.outfit_b?.title}" (${localComparison.outfit_b?.mainGarment})

Hãy đưa ra nhận định thực tiễn ngắn gọn (2-3 câu) đối chiếu mức độ phù hợp văn hóa, chi phí thị trường, độ cồng kềnh ảnh hưởng tới trải nghiệm mặc cho nhu cầu "${userContext}" và chọn ID bộ phù hợp hơn.`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                ai_short_advice: { type: Type.STRING },
                recommended_outfit_id: { type: Type.STRING },
              },
              required: ['ai_short_advice', 'recommended_outfit_id'],
            },
          },
        }),
        10000
      );

      const rawText = response.text;
      if (!rawText) throw new Error('Empty Gemini comparison response');
      const parsed = JSON.parse(rawText.trim());

      const finalComparisonResult = {
        ...localComparison,
        ai_short_advice: parsed.ai_short_advice || localComparison.ai_short_advice,
        recommended_outfit_id:
          parsed.recommended_outfit_id === localComparison.outfit_b?.id
            ? localComparison.outfit_b.id
            : localComparison.outfit_a?.id,
      };

      lookbookCompareCache.set(cacheKey, finalComparisonResult);
      res.json(finalComparisonResult);
    } catch {
      lookbookCompareCache.set(cacheKey, localComparison);
      res.json(localComparison);
    }
  });

  // ==========================================================================
  // ENDPOINT 5: BẢN ĐỒ DI TÍCH & HỘ CHIẾU CỔ PHỤC (GEMINI VISION + GPS CHECK-IN)
  // ==========================================================================
  app.post('/api/heritage-map/checkin', async (req, res) => {
    const {
      site,
      outfitChosen,
      locationVerified,
      userCoords,
      siteCoords,
      distanceMeters,
      photoBase64,
      isOfflinePending,
      offlineTimestamp,
      localEvaluation,
    } = req.body || {};

    const resolvedSiteName = site?.site_name || 'Di tích lịch sử';
    const resolvedPoints = site?.points_awarded || 200;
    const resolvedStampName = site?.stamp_name || 'Con Dấu Di Tích';
    const resolvedBadge = site?.badge_earned || 'Người Yêu Di Sản';
    const resolvedDistance = typeof distanceMeters === 'number' ? distanceMeters : 120;
    const isGpsInRange = resolvedDistance <= 500 || Boolean(locationVerified);

    let cultureGuardStatus: 'APPROVED' | 'WARNING' | 'REJECTED' = 'APPROVED';
    let outfitDetected = outfitChosen || 'Áo Ngũ Thân Lập Lĩnh';
    let etiquetteCompliant = true;
    let feedbackMessage = `Chúc mừng bạn đã check-in thành công tại ${resolvedSiteName} trong trang phục ${outfitDetected}!`;

    const ai = getGeminiClient();

    if (ai && photoBase64 && typeof photoBase64 === 'string') {
      try {
        let mimeType = 'image/jpeg';
        let cleanBase64 = photoBase64;
        const match = photoBase64.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          cleanBase64 = match[2];
        }

        const visionPrompt = `Bạn là Chuyên gia Giám định Văn hóa & Thị giác AI (Culture Guard Vision AI) cho ứng dụng di sản Việt Nam VietAura.
Hãy phân tích bức ảnh check-in người dùng vừa gửi tại di tích: "${resolvedSiteName}" (Địa danh: "${site?.location_query || ''}", Không gian tôn nghiêm/thờ tự: ${Boolean(site?.isSacredSite)}).
Trang phục người dùng khai báo diện: "${outfitChosen}".
Khoảng cách GPS ghi nhận: ${Math.round(resolvedDistance)}m.

Nhiệm vụ kiểm định thị giác:
1. culture_guard_status:
   - "APPROVED": Nếu người trong ảnh mặc trang phục truyền thống Việt Nam (Áo Ngũ Thân, Áo Nhật Bình, Áo Tứ Thân, Áo Dài, Áo Bà Ba, hoặc cổ phục cách tân kín đáo, lịch sự) phù hợp không gian di tích.
   - "WARNING": Nếu trang phục có phối phụ kiện hiện đại (sneaker, kính râm, streetwear) nhưng vẫn giữ được nét nhã nhặn tôn nghiêm.
   - "REJECTED": Nếu trang phục phản cảm, hở hang (áo sát nách, váy quá ngắn tại nơi thờ tự), trang phục giả mạo triều phục hoàng đế sai lệch, hoặc ảnh hoàn toàn không liên quan đến con người/trang phục.
2. outfit_detected: Tên dạng cổ phục nhận diện được trong ảnh (ví dụ: "Áo Ngũ Thân Lập Lĩnh", "Áo Nhật Bình", "Áo Tứ Thân & Yếm Đào", "Áo Dài Truyền Thống", "Áo Bà Ba", "Trang phục thường nhật").
3. etiquette_compliant: boolean (Có tuân thủ quy tắc trang phục và ứng xử tại di tích không).
4. feedback_message: Lời nhận xét tinh tế (1-2 câu), truyền cảm hứng tự hào lịch sử cho giới trẻ, nêu rõ lý do nếu cảnh báo hoặc từ chối.`;

        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: cleanBase64,
                  },
                },
                { text: visionPrompt },
              ],
            },
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  culture_guard_status: { type: Type.STRING },
                  outfit_detected: { type: Type.STRING },
                  etiquette_compliant: { type: Type.BOOLEAN },
                  feedback_message: { type: Type.STRING },
                },
                required: ['culture_guard_status', 'outfit_detected', 'etiquette_compliant', 'feedback_message'],
              },
            },
          }),
          12000
        );

        const rawText = response.text;
        if (rawText) {
          const parsed = JSON.parse(rawText.trim());
          if (parsed.culture_guard_status === 'REJECTED' || parsed.culture_guard_status === 'Rejected') {
            cultureGuardStatus = 'REJECTED';
          } else if (parsed.culture_guard_status === 'WARNING' || parsed.culture_guard_status === 'Warning') {
            cultureGuardStatus = 'WARNING';
          } else {
            cultureGuardStatus = 'APPROVED';
          }
          outfitDetected = parsed.outfit_detected || outfitDetected;
          etiquetteCompliant = Boolean(parsed.etiquette_compliant);
          feedbackMessage = parsed.feedback_message || feedbackMessage;
        }
      } catch (err) {
        console.warn('Gemini Vision checkin fallback triggered:', err);
      }
    }

    // Eligibility check: GPS in range (<=500m or offline mode) AND Culture Guard status is APPROVED
    const canUnlock = (isGpsInRange || Boolean(isOfflinePending)) && cultureGuardStatus === 'APPROVED';

    let finalMessage = feedbackMessage;
    if (!isGpsInRange && !isOfflinePending) {
      finalMessage = `Bạn đang cách ${resolvedSiteName} ${Math.round(resolvedDistance)}m (vượt quá bán kính quy định 500m). Vui lòng di chuyển đến gần di tích hoặc kích hoạt chế độ "Ngoại tuyến (Lưu tạm)" để xác thực sau!`;
    } else if (cultureGuardStatus === 'REJECTED') {
      finalMessage = `Kiểm duyệt Culture Guard: Ảnh chưa đạt chuẩn cổ phục tôn nghiêm tại ${resolvedSiteName}. ${feedbackMessage}`;
    }

    res.json({
      ...localEvaluation,
      is_unlocked: canUnlock,
      stamp_id: site?.stamp_id || 'STAMP_HERITAGE_01',
      stamp_name: resolvedStampName,
      points_awarded: canUnlock ? resolvedPoints : 0,
      badge_earned: canUnlock ? resolvedBadge : null,
      culture_guard_status: cultureGuardStatus,
      outfit_detected: outfitDetected,
      etiquette_compliant: etiquetteCompliant,
      gps_in_range: isGpsInRange,
      distance_meters: Math.round(resolvedDistance),
      is_offline_pending: Boolean(isOfflinePending),
      offline_timestamp: offlineTimestamp || null,
      stamp_unlock_result: {
        is_unlocked: canUnlock,
        stamp_id: site?.stamp_id || 'STAMP_HERITAGE_01',
        stamp_name: resolvedStampName,
        points_awarded: canUnlock ? resolvedPoints : 0,
        badge_earned: canUnlock ? resolvedBadge : null,
        culture_guard_status: cultureGuardStatus,
        message: finalMessage,
      },
    });
  });

  // ==========================================================================
  // ENDPOINT 6: MANDATORY SYSTEM JSON OUTPUT SCHEMA (PHÒNG THỬ 3D & CULTURE GUARD)
  // ==========================================================================
  app.post('/api/fitting-room/evaluate', (req, res) => {
    const {
      styling_mode = 'STRICT_HERITAGE',
      ui_display_mode = 'MINIMAL_MODE',
      outfit_id = 'CFG_3D_STUDIO',
      outfit_type = 'NGU_THAN',
      palette_hex = { primary: '#2E8B57', secondary: '#FFFFF0', accent: '#8B4513' },
      body_measurements = {
        height_cm: 162,
        weight_kg: 52,
        chest_cm: 84,
        waist_cm: 64,
        hip_cm: 90,
      },
      recommended_size = 'M',
      culture_guard_result = {
        status: 'APPROVED',
        applied_rule: 'RULE_0_STANDARD_COMPLIANT',
        culture_tip_message: 'Cấu hình đạt chuẩn cổ phục truyền thống Việt Nam.',
        auto_fix_available: false,
      },
      marketplace_link = {
        is_available_for_rent: true,
        nearest_partner_shop_id: 'SHOP_HOA_NIEN',
        rental_price_from: '250.000 VNĐ/ngày',
      },
      local_storage_mutation_preview = {
        updated_field: 'NONE',
        new_value_summary: 'Đồng bộ trạng thái phòng thử với VIETPHUC_LOCAL_STORAGE_V1',
      },
    } = req.body || {};

    res.json({
      system_state: {
        styling_mode: styling_mode === 'MODERN_FUSION' ? 'MODERN_FUSION' : 'STRICT_HERITAGE',
        ui_display_mode: ui_display_mode === 'ADVANCED_MODE' ? 'ADVANCED_MODE' : 'MINIMAL_MODE',
        local_storage_key: 'VIETPHUC_LOCAL_STORAGE_V1',
      },
      outfit_3d_config: {
        outfit_id,
        outfit_type,
        palette_hex,
        body_measurements,
        recommended_size,
      },
      culture_guard_result,
      marketplace_link,
      local_storage_mutation_preview,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    // Pre-warm entry modules so the preview loads instantaneously on first visit
    vite.warmupRequest('/src/main.tsx').catch(() => {});
    vite.warmupRequest('/src/App.tsx').catch(() => {});
    vite.warmupRequest('/src/components/VirtualFittingRoom3D.tsx').catch(() => {});
    vite.warmupRequest('/src/utils/anatomicalHuman3D.ts').catch(() => {});
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(
      express.static(distPath, {
        maxAge: '1d',
        setHeaders: (response, filePath) => {
          if (filePath.endsWith('.html')) {
            response.setHeader('Cache-Control', 'no-cache, must-revalidate');
          } else if (/\.(js|css|glb|png|jpg|jpeg|webp|svg|woff2)$/i.test(filePath)) {
            response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Centralized Global Error Handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('VietAura Server Error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Đã có lỗi phát sinh từ máy chủ.',
        message: err?.message || 'Internal Server Error',
      });
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Việt Phục Lookbook server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
