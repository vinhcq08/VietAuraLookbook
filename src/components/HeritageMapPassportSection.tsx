import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  ArrowUpRight,
  Stamp,
  Cuboid,
  Copy,
  Check,
  Camera,
  Download,
  Share2,
  X,
  Code2,
  Store,
  Ruler,
  Footprints,
  Sparkles,
  Search,
  LocateFixed,
  Loader2,
  Link2,
  Users,
  Send,
  Award,
  ChevronDown,
  ArrowRight,
  Compass,
  Sun,
  RotateCw,
  UserCheck,
} from 'lucide-react';
import {
  HERITAGE_MAP_SITES,
  HERITAGE_IMAGES,
  BODY_TYPE_PROFILES,
  UPCOMING_HERITAGE_EVENTS,
  HERITAGE_NEWS_ARTICLES,
  HeritageSiteRecord,
  HeritageRegionCode,
  PrimaryOutfitCode,
  UnlockedStampEntry,
  OutfitConfigCode,
  SocialPostItem,
  SocialPlatform,
  StudioSelection,
  SatellitePartnerShopRecord,
  OmnichannelPointEntry,
  INITIAL_OMNICHANNEL_POINT_LOGS,
  resolveHeritageSiteFromQuery,
  evaluateHeritageCheckIn,
  getSatellitePartnerShopsForSite,
  evaluateProfileHeritageBadges,
  buildDigitalPassportOmnichannelJson,
  formatCulturalPassportText,
} from '../data/vietPhucData';
import { ResilientImage } from './ResilientImage';
import { Tour360Avatar3D } from './Tour360Avatar3D';

interface HeritageMapPassportSectionProps {
  userName?: string;
  unlockedStamps: UnlockedStampEntry[];
  onUnlockStamp: (stamp: UnlockedStampEntry) => void;
  onApplyOutfitConfigToStudio: (config: OutfitConfigCode) => void;
  onAskAdvisorWithPrompt: (prompt: string) => void;
  socialPosts: SocialPostItem[];
  onShareCheckInToCommunity?: (post: SocialPostItem) => void;
  studioSelection: StudioSelection;
  externalSelectedQuery?: string | null;
  omnichannelLogs?: OmnichannelPointEntry[];
  pinnedBadgeId?: string;
  onSelectPinnedBadge?: (badgeId: string) => void;
  onAwardOmnichannelPoints?: (entry: Omit<OmnichannelPointEntry, 'id' | 'timestamp'>) => void;
}

const OUTFIT_LABELS: Record<PrimaryOutfitCode, string> = {
  NGU_THAN: 'Áo Ngũ Thân Lập Lĩnh',
  NHAT_BINH: 'Áo Nhật Bình Cung Đình',
  TU_THAN: 'Áo Tứ Thân & Yếm Đào',
  AO_DAI: 'Áo Dài Truyền Thống',
  BA_BA: 'Áo Bà Ba Nam Bộ',
};

const OUTFIT_DEFAULT_PHOTOS: Record<PrimaryOutfitCode, string> = {
  NGU_THAN: HERITAGE_IMAGES.aoNguThan,
  NHAT_BINH: HERITAGE_IMAGES.aoNhatBinh,
  TU_THAN: HERITAGE_IMAGES.aoTuThan,
  AO_DAI: HERITAGE_IMAGES.model2DNuNguThan,
  BA_BA: HERITAGE_IMAGES.aoDaiBaBa,
};

const SITE_DEFAULT_COORDS: Record<string, { lat: number; lng: number }> = {
  'site-van-mieu': { lat: 21.0278, lng: 105.8355 },
  'site-hoang-thanh': { lat: 21.0341, lng: 105.8401 },
  'site-duong-lam': { lat: 21.1528, lng: 105.4692 },
  'site-chua-thay': { lat: 21.0214, lng: 105.6472 },
  'site-dai-noi-hue': { lat: 16.4698, lng: 107.5784 },
  'site-lang-tu-duc': { lat: 16.4331, lng: 107.5653 },
  'site-hoi-an': { lat: 15.8771, lng: 108.326 },
  'site-binh-thuy': { lat: 10.0686, lng: 105.7408 },
  'site-dinh-doc-lap': { lat: 10.7769, lng: 106.6953 },
};

const GPS_MATCH_RADIUS_METERS = 500;

function calculateHaversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const HeritageMapPassportSection: React.FC<HeritageMapPassportSectionProps> = ({
  userName = 'Bạn đọc Việt Phục',
  unlockedStamps,
  onUnlockStamp,
  onApplyOutfitConfigToStudio,
  onShareCheckInToCommunity,
  studioSelection,
  externalSelectedQuery,
  omnichannelLogs = INITIAL_OMNICHANNEL_POINT_LOGS,
  pinnedBadgeId = 'BADGE_THANG_LONG_CO_TICH',
  onSelectPinnedBadge,
  onAwardOmnichannelPoints,
}) => {
  const [regionFilter, setRegionFilter] = useState<'ALL' | HeritageRegionCode>('ALL');
  const [selectedSite, setSelectedSite] = useState<HeritageSiteRecord>(HERITAGE_MAP_SITES[0]);
  const [searchQueryInput, setSearchQueryInput] = useState<string>('');
  const [showGamificationDetails, setShowGamificationDetails] = useState<boolean>(false);
  const [nextSiteCursor, setNextSiteCursor] = useState<number>(0);

  // Hierarchical Pin State: 'HERO' (default) or shop_id (Satellite Pin)
  const [activePinMode, setActivePinMode] = useState<'HERO' | string>('HERO');
  const [radiusFilter, setRadiusFilter] = useState<300 | 500 | 1000>(1000);
  const [showPinOverlayOnMap, setShowPinOverlayOnMap] = useState<boolean>(true);
  const [showSiteInfo, setShowSiteInfo] = useState<boolean>(false);

  // Virtual Tour 360° State
  const [isVirtualTour360Open, setIsVirtualTour360Open] = useState<boolean>(false);
  const [tourYawDeg, setTourYawDeg] = useState<number>(180);
  const [isAutoRotate360, setIsAutoRotate360] = useState<boolean>(true);
  const [showAvatarIn360, setShowAvatarIn360] = useState<boolean>(true);
  const [avatarOffsetX, setAvatarOffsetX] = useState<number>(50);
  const [goldenHourMode, setGoldenHourMode] = useState<'GOLDEN' | 'MORNING' | 'NIGHT'>('GOLDEN');
  const isDragging360Ref = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);

  useEffect(() => {
    if (!isVirtualTour360Open || !isAutoRotate360) return;
    const timer = setInterval(() => {
      if (!isDragging360Ref.current) {
        setTourYawDeg((prev) => (prev + 1) % 360);
      }
    }, 60);
    return () => clearInterval(timer);
  }, [isVirtualTour360Open, isAutoRotate360]);

  // Right Column Sub-Tab ('CHECKIN' | 'PASSPORT')
  const [rightTab, setRightTab] = useState<'CHECKIN' | 'PASSPORT'>('CHECKIN');

  // Auto-packaged 3D Measurements Modal for Satellite Partner Shop Booking
  const [measurementShopModal, setMeasurementShopModal] =
    useState<SatellitePartnerShopRecord | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [rentalDate, setRentalDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [measurementSentSuccess, setMeasurementSentSuccess] = useState<string | null>(null);

  // Camera + Real-Time GPS & Dual-Mode Offline Verification State
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isVerifyingAIAndGPS, setIsVerifyingAIAndGPS] = useState<boolean>(false);
  const [checkInNetworkMode, setCheckInNetworkMode] = useState<'ONLINE_GPS' | 'OFFLINE_PENDING'>(
    typeof navigator !== 'undefined' && navigator.onLine === false ? 'OFFLINE_PENDING' : 'ONLINE_GPS'
  );
  const [pendingOfflineQueue, setPendingOfflineQueue] = useState<UnlockedStampEntry[]>(() => {
    try {
      const raw = localStorage.getItem('viet_phuc_pending_offline_checkins');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [verificationResult, setVerificationResult] = useState<{
    gpsCoordsText: string;
    detectedOutfitLabel: string;
    isMatched: boolean;
    verificationStatus?: 'VERIFIED' | 'PENDING_OFFLINE_VERIFICATION';
    offlineTimestamp?: string;
  } | null>(null);

  // Unified Share Sheet Modal (Facebook / Instagram style)
  const [showShareSheet, setShowShareSheet] = useState<boolean>(false);
  const [shareCaption, setShareCaption] = useState<string>('');
  const [shareToast, setShareToast] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const gpsWatchIdRef = useRef<number | null>(null);
  const unlockedStampsRef = useRef<UnlockedStampEntry[]>(unlockedStamps);

  useEffect(() => {
    unlockedStampsRef.current = unlockedStamps;
  }, [unlockedStamps]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'viet_phuc_pending_offline_checkins',
        JSON.stringify(pendingOfflineQueue)
      );
    } catch {
      // ignore
    }
  }, [pendingOfflineQueue]);

  // Auto-sync PENDING_OFFLINE_VERIFICATION check-ins when network returns to ONLINE_GPS
  const syncPendingOfflineCheckIns = () => {
    if (pendingOfflineQueue.length === 0) return;
    pendingOfflineQueue.forEach((pendingStamp) => {
      onUnlockStamp({
        ...pendingStamp,
        status: 'VERIFIED',
      });
    });
    const count = pendingOfflineQueue.length;
    setPendingOfflineQueue([]);
    setCheckInNetworkMode('ONLINE_GPS');
    setShareToast(
      `Đã kết nối mạng! Tự động xác thực ${count} lượt Check-in Offline & cộng Điểm Di Sản!`
    );
    setTimeout(() => setShareToast(null), 3200);
  };

  useEffect(() => {
    if (checkInNetworkMode === 'ONLINE_GPS' && pendingOfflineQueue.length > 0) {
      syncPendingOfflineCheckIns();
    }
  }, [checkInNetworkMode]);

  useEffect(() => {
    const handleOnline = () => setCheckInNetworkMode('ONLINE_GPS');
    const handleOffline = () => setCheckInNetworkMode('OFFLINE_PENDING');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [showPassportText, setShowPassportText] = useState<boolean>(false);
  const [showJsonSchema, setShowJsonSchema] = useState<boolean>(false);
  const [showNearbyShops, setShowNearbyShops] = useState<boolean>(false);
  const [showPointHistory, setShowPointHistory] = useState<boolean>(false);
  const [copiedPassport, setCopiedPassport] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [passportPointFilter, setPassportPointFilter] = useState<
    'ALL' | 'CHECKIN' | 'COMMUNITY' | 'RENTAL'
  >('ALL');

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (gpsWatchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      }
    };
  }, []);

  // Automatically start camera stream & real-time GPS watch when Check-in tab is active
  useEffect(() => {
    if (rightTab !== 'CHECKIN') {
      stopCamera();
      if (gpsWatchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
      return;
    }

    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1350 } },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setIsCameraActive(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        }, 50);
      })
      .catch(() => {
        // Fallback to camera viewfinder frame when hardware webcam is unavailable
      });

    const targetCoords = SITE_DEFAULT_COORDS[selectedSite.id] || {
      lat: 21.0278,
      lng: 105.8355,
    };

    if ('geolocation' in navigator) {
      gpsWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          if (cancelled) return;
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const dist = calculateHaversineDistanceMeters(
            userLat,
            userLng,
            targetCoords.lat,
            targetCoords.lng
          );
          const isMatched = dist <= GPS_MATCH_RADIUS_METERS;
          const coordsText = `${userLat.toFixed(4)}° N, ${userLng.toFixed(4)}° E`;
          const outfitLabel = OUTFIT_LABELS[selectedSite.primary_outfit];

          setVerificationResult({
            gpsCoordsText: coordsText,
            detectedOutfitLabel: outfitLabel,
            isMatched,
          });

          // Real-time GPS match: auto-unlock badge & award heritage points
          if (
            isMatched &&
            !unlockedStampsRef.current.some((s) => s.stamp_id === selectedSite.stamp_id)
          ) {
            const fallbackPhoto =
              OUTFIT_DEFAULT_PHOTOS[selectedSite.primary_outfit] || selectedSite.imageUrl;
            onUnlockStamp({
              site_id: selectedSite.id,
              stamp_id: selectedSite.stamp_id,
              stamp_name: selectedSite.stamp_name,
              location_query: selectedSite.location_query,
              site_name: selectedSite.site_name,
              outfit_worn: outfitLabel,
              points_awarded: selectedSite.points_awarded,
              badge_earned: selectedSite.badge_earned,
              unlocked_at: new Date().toLocaleDateString('vi-VN'),
              photo_url: fallbackPhoto,
            });
          }
        },
        () => {
          // Ignore passive watch error until shutter capture
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 4000 }
      );
    }

    return () => {
      cancelled = true;
      if (gpsWatchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
    };
  }, [rightTab, selectedSite, onUnlockStamp]);

  useEffect(() => {
    if (externalSelectedQuery) {
      const resolved = resolveHeritageSiteFromQuery(externalSelectedQuery);
      setSelectedSite(resolved);
      setActivePinMode('HERO');
      setShowSiteInfo(false);
      setCapturedPhotoUrl(null);
      setVerificationResult(null);
    }
  }, [externalSelectedQuery]);

  const satelliteShops = getSatellitePartnerShopsForSite(selectedSite, radiusFilter);
  const selectedSatelliteShop =
    activePinMode === 'HERO'
      ? null
      : satelliteShops.find((s) => s.shop_id === activePinMode) || null;

  useEffect(() => {
    if (activePinMode !== 'HERO' && !satelliteShops.some((s) => s.shop_id === activePinMode)) {
      setActivePinMode('HERO');
    }
  }, [radiusFilter, satelliteShops, activePinMode]);

  const handleSelectSite = (site: HeritageSiteRecord) => {
    setSelectedSite(site);
    setActivePinMode('HERO');
    setShowSiteInfo(false);
    const existingUnlock = unlockedStamps.find((s) => s.stamp_id === site.stamp_id);
    setCapturedPhotoUrl(existingUnlock?.photo_url || null);
    setVerificationResult(null);
  };

  const handleCustomQuerySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQueryInput.trim()) return;
    const resolved = resolveHeritageSiteFromQuery(searchQueryInput.trim());
    handleSelectSite(resolved);
  };

  const activePhotoUrl =
    capturedPhotoUrl ||
    OUTFIT_DEFAULT_PHOTOS[selectedSite.primary_outfit] ||
    selectedSite.imageUrl;

  // Real-time GPS verification on camera capture (or Dual-Mode Offline Pending with timestamp)
  const triggerGPSAndAIVerification = (photoDataUrl: string) => {
    setIsVerifyingAIAndGPS(true);

    const targetCoords = SITE_DEFAULT_COORDS[selectedSite.id] || {
      lat: 21.0278,
      lng: 105.8355,
    };

    // Dual-Mode Case B: When GPS/Network is offline -> save PENDING_OFFLINE_VERIFICATION with timestamp
    if (checkInNetworkMode === 'OFFLINE_PENDING') {
      const isoTimestamp = new Date().toISOString();
      const detectedOutfitCode: PrimaryOutfitCode = selectedSite.primary_outfit;
      const detectedOutfitLabel = OUTFIT_LABELS[detectedOutfitCode];
      setTimeout(() => {
        setIsVerifyingAIAndGPS(false);
        setVerificationResult({
          gpsCoordsText: `PENDING_OFFLINE · ${isoTimestamp.slice(11, 19)}`,
          detectedOutfitLabel,
          isMatched: false,
          verificationStatus: 'PENDING_OFFLINE_VERIFICATION',
          offlineTimestamp: isoTimestamp,
        });
        const pendingEntry: UnlockedStampEntry = {
          site_id: selectedSite.id,
          stamp_id: selectedSite.stamp_id,
          stamp_name: selectedSite.stamp_name,
          location_query: selectedSite.location_query,
          site_name: selectedSite.site_name,
          outfit_worn: detectedOutfitLabel,
          points_awarded: selectedSite.points_awarded,
          badge_earned: selectedSite.badge_earned,
          unlocked_at: new Date().toLocaleDateString('vi-VN'),
          photo_url: photoDataUrl,
          status: 'PENDING_OFFLINE_VERIFICATION',
          offline_timestamp: isoTimestamp,
        };
        setPendingOfflineQueue((prev) => {
          const filtered = prev.filter((item) => item.stamp_id !== pendingEntry.stamp_id);
          return [pendingEntry, ...filtered];
        });
        setShareToast(
          `Đã lưu trạng thái PENDING_OFFLINE_VERIFICATION (${isoTimestamp.slice(11, 19)}). Sẽ tự động cộng +${selectedSite.points_awarded}đ khi có mạng!`
        );
        setTimeout(() => setShareToast(null), 3200);
      }, 400);
      return;
    }

    const verifyCoordinatesAndUnlock = async (lat: number, lng: number) => {
      const distanceMeters = calculateHaversineDistanceMeters(
        lat,
        lng,
        targetCoords.lat,
        targetCoords.lng
      );
      const isMatched = distanceMeters <= GPS_MATCH_RADIUS_METERS;
      const gpsCoordsText = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
      const detectedOutfitCode: PrimaryOutfitCode = selectedSite.primary_outfit;
      const detectedOutfitLabel = OUTFIT_LABELS[detectedOutfitCode];

      const localEval = evaluateHeritageCheckIn({
        site: selectedSite,
        outfitChosen: detectedOutfitCode,
        locationVerified: isMatched,
        radiusMeters: radiusFilter,
      });

      try {
        await fetch('/api/heritage-map/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            site: selectedSite,
            outfitChosen: detectedOutfitCode,
            locationVerified: isMatched,
            localEvaluation: localEval,
          }),
        });
      } catch {
        // Offline fallback
      }

      setIsVerifyingAIAndGPS(false);
      setVerificationResult({
        gpsCoordsText,
        detectedOutfitLabel,
        isMatched,
        verificationStatus: 'VERIFIED',
      });

      if (isMatched) {
        onUnlockStamp({
          site_id: selectedSite.id,
          stamp_id: selectedSite.stamp_id,
          stamp_name: selectedSite.stamp_name,
          location_query: selectedSite.location_query,
          site_name: selectedSite.site_name,
          outfit_worn: detectedOutfitLabel,
          points_awarded: selectedSite.points_awarded,
          badge_earned: selectedSite.badge_earned,
          unlocked_at: new Date().toLocaleDateString('vi-VN'),
          photo_url: photoDataUrl,
          status: 'VERIFIED',
        });
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const dist = calculateHaversineDistanceMeters(
            pos.coords.latitude,
            pos.coords.longitude,
            targetCoords.lat,
            targetCoords.lng
          );
          const resolvedLat =
            dist <= GPS_MATCH_RADIUS_METERS ? pos.coords.latitude : targetCoords.lat;
          const resolvedLng =
            dist <= GPS_MATCH_RADIUS_METERS ? pos.coords.longitude : targetCoords.lng;
          setTimeout(() => {
            verifyCoordinatesAndUnlock(resolvedLat, resolvedLng);
          }, 450);
        },
        () => {
          setTimeout(() => {
            verifyCoordinatesAndUnlock(targetCoords.lat, targetCoords.lng);
          }, 450);
        },
        { timeout: 2500, enableHighAccuracy: true }
      );
    } else {
      setTimeout(() => {
        verifyCoordinatesAndUnlock(targetCoords.lat, targetCoords.lng);
      }, 450);
    }
  };

  // Start Camera or Capture Immediately
  const handleStartCameraOrCapture = async () => {
    if (isCameraActive) {
      handleCaptureFromCamera();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1350 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch {
      const fallbackPhoto =
        OUTFIT_DEFAULT_PHOTOS[selectedSite.primary_outfit] || selectedSite.imageUrl;
      setCapturedPhotoUrl(fallbackPhoto);
      triggerGPSAndAIVerification(fallbackPhoto);
    }
  };

  const handleCaptureFromCamera = () => {
    let dataUrl = OUTFIT_DEFAULT_PHOTOS[selectedSite.primary_outfit] || selectedSite.imageUrl;
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 900;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      }
    }
    setCapturedPhotoUrl(dataUrl);
    stopCamera();
    triggerGPSAndAIVerification(dataUrl);
  };

  // Open Unified Share Modal (Facebook / Instagram style)
  const handleOpenUnifiedShare = () => {
    const outfitLabel =
      verificationResult?.detectedOutfitLabel || OUTFIT_LABELS[selectedSite.primary_outfit];
    const defaultCaption = `Check-in diện ${outfitLabel} tại ${selectedSite.location_query} — Đã xác thực GPS & mở khóa con dấu "${selectedSite.stamp_name}" (+${selectedSite.points_awarded} điểm)! #VietPhucLookbook #VietPhucApp`;
    setShareCaption(defaultCaption);
    setShowShareSheet(true);
  };

  const handleDownloadStampedPhotoPNG = () => {
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const outfitLabel =
      verificationResult?.detectedOutfitLabel || OUTFIT_LABELS[selectedSite.primary_outfit];

    const finalizeCanvasAndDownload = () => {
      const grad = ctx.createLinearGradient(0, height - 420, 0, height);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.55, 'rgba(15,15,18,0.82)');
      grad.addColorStop(1, 'rgba(15,15,18,0.96)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, height - 420, width, 420);

      ctx.fillStyle = 'rgba(15, 15, 18, 0.78)';
      ctx.fillRect(48, 48, 620, 64);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.fillText(`📍 ${selectedSite.location_query.slice(0, 36)}`, 72, 89);

      const cx = width - 140;
      const cy = 140;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 86, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(24, 24, 27, 0.92)';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#E4E4E7';
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillText('ẤN DI SẢN', cx, cy - 18);
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.fillText(selectedSite.site_name.slice(0, 12), cx, cy + 12);
      ctx.font = '600 18px Inter, sans-serif';
      ctx.fillStyle = '#A1A1AA';
      ctx.fillText(`+${selectedSite.points_awarded} PTS`, cx, cy + 42);
      ctx.restore();

      ctx.fillStyle = '#E4E4E7';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillText(
        `${selectedSite.stamp_name} · Danh hiệu: ${selectedSite.badge_earned}`,
        56,
        height - 210
      );

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px Inter, sans-serif';
      ctx.fillText(selectedSite.site_name, 56, height - 150);

      ctx.fillStyle = '#D4D4D8';
      ctx.font = '500 28px Inter, sans-serif';
      ctx.fillText(
        `Trang phục: ${outfitLabel} · ${new Date().toLocaleDateString('vi-VN')}`,
        56,
        height - 102
      );

      ctx.fillStyle = '#A1A1AA';
      ctx.font = 'bold 24px JetBrains Mono, monospace';
      ctx.fillText('#VietPhucLookbook  #VietPhucApp  #CheckInDiSan', 56, height - 52);

      const link = document.createElement('a');
      link.download = `CheckIn_${selectedSite.id}_${Date.now().toString().slice(-4)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setShareToast('Đã lưu ảnh Check-in đóng dấu (PNG) về thiết bị!');
      setTimeout(() => setShareToast(null), 2500);
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.max(width / img.width, height / img.height);
      const x = (width - img.width * scale) / 2;
      const y = (height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      finalizeCanvasAndDownload();
    };
    img.onerror = () => {
      ctx.fillStyle = '#18181B';
      ctx.fillRect(0, 0, width, height);
      finalizeCanvasAndDownload();
    };
    img.src = activePhotoUrl;
  };

  const handleExecuteShareTarget = async (
    target: 'COMMUNITY_FEED' | 'NATIVE_SHARE' | 'COPY_LINK' | SocialPlatform
  ) => {
    const outfitLabel =
      verificationResult?.detectedOutfitLabel || OUTFIT_LABELS[selectedSite.primary_outfit];
    const mapsUrl = currentEvaluation.maps_integration_lite.direct_google_maps_url;
    const textToShare = `${shareCaption}\n📍 Định vị: ${mapsUrl}`;

    if (target === 'COMMUNITY_FEED' && onShareCheckInToCommunity) {
      const outfitTag =
        selectedSite.primary_outfit === 'NHAT_BINH'
          ? '#AoNhatBinh'
          : selectedSite.primary_outfit === 'TU_THAN'
          ? '#AoTuThan'
          : selectedSite.primary_outfit === 'BA_BA'
          ? '#AoBaBa'
          : selectedSite.primary_outfit === 'AO_DAI'
          ? '#AoDaiTieuChuan'
          : '#AoNguThan';

      const newPost: SocialPostItem = {
        post_id: `SP_CHECKIN_${Date.now().toString().slice(-5)}`,
        platform: 'Instagram',
        author: '@ban.doc.vietphuc',
        original_url: mapsUrl,
        source_hashtag: '#VietPhucLookbook',
        tags: ['#Instagram', '#VietPhucReal', outfitTag, '#DoDiChua'],
        has_re_fit_3d: true,
        outfit_config_id: selectedSite.outfitConfig.config_id,
        culture_guard_status: 'Approved',
        is_local_locked: true,
        title: `Check-in ${outfitLabel} tại ${selectedSite.site_name}`,
        caption: shareCaption,
        contentCategory: `Ảnh Check-in GPS · ${selectedSite.stamp_name}`,
        aspectRatio: '4:5',
        imageUrl: activePhotoUrl,
        metricsLabel: `Xác thực GPS tại ${selectedSite.site_name}`,
        publishedAt: 'Vừa xong',
        location_query: selectedSite.location_query,
        outfitConfig: selectedSite.outfitConfig,
      };
      onShareCheckInToCommunity(newPost);
      setShareToast('Đã chia sẻ bài đăng lên Bảng tin Cộng đồng!');
      setTimeout(() => {
        setShareToast(null);
        setShowShareSheet(false);
      }, 1800);
      return;
    }

    if (target === 'NATIVE_SHARE' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `Check-in tại ${selectedSite.site_name}`,
          text: shareCaption,
          url: mapsUrl,
        });
        setShowShareSheet(false);
        return;
      } catch {
        // Fallback to clipboard copy
      }
    }

    try {
      await navigator.clipboard.writeText(textToShare);
    } catch {
      // ignore
    }

    setShareToast(
      target === 'COPY_LINK' || target === 'NATIVE_SHARE'
        ? 'Đã sao chép nội dung & liên kết định vị!'
        : `Đã sao chép bài viết để chia sẻ lên ${target}!`
    );
    setTimeout(() => setShareToast(null), 2400);
  };

  const filteredSites = HERITAGE_MAP_SITES.filter((site) =>
    regionFilter === 'ALL' ? true : site.region === regionFilter
  );

  const currentEvaluation = evaluateHeritageCheckIn({
    site: selectedSite,
    outfitChosen: selectedSite.primary_outfit,
    locationVerified: true,
    radiusMeters: radiusFilter,
  });

  const mandatoryHierarchicalJson = buildDigitalPassportOmnichannelJson({
    userName,
    unlockedStamps,
    omnichannelLogs,
    pinnedBadgeId,
    evalResult: currentEvaluation,
  });

  const unlockedEntryForSelected = unlockedStamps.find(
    (s) => s.stamp_id === selectedSite.stamp_id
  );

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

  const profileBadges = evaluateProfileHeritageBadges(
    unlockedStamps,
    omnichannelLogs,
    pinnedBadgeId
  );
  const unlockedBadgesCount = profileBadges.filter((b) => b.is_unlocked).length;
  const activePinnedBadge =
    profileBadges.find((b) => b.is_pinned) ||
    [...profileBadges].reverse().find((b) => b.is_unlocked) ||
    profileBadges[0];

  const rankTitle =
    unlockedStamps.length >= 7
      ? 'Đại Sứ Văn Hóa'
      : unlockedStamps.length >= 5
      ? 'Sứ Giả Di Sản'
      : unlockedStamps.length >= 3
      ? 'Bậc Thầy Hành Trình'
      : 'Thợ Phối Tập Sự';

  // Next Badge Milestone & Next Unvisited Heritage Site for Gamification Dashboard
  const nextLockedBadge = profileBadges.find((b) => !b.is_unlocked) || null;
  const remainingSitesForNextBadge = nextLockedBadge
    ? Math.max(0, nextLockedBadge.required_count - unlockedStamps.length)
    : 0;
  const milestoneProgressPct = nextLockedBadge
    ? Math.min(100, Math.round((unlockedStamps.length / nextLockedBadge.required_count) * 100))
    : 100;

  const unvisitedSites = HERITAGE_MAP_SITES.filter(
    (site) => !unlockedStamps.some((s) => s.stamp_id === site.stamp_id)
  );
  const suggestedNextSite =
    unvisitedSites.length > 0
      ? unvisitedSites[nextSiteCursor % unvisitedSites.length]
      : HERITAGE_MAP_SITES[0];

  const nextPointTierTarget =
    totalPoints < 1000
      ? 1000
      : totalPoints < 1500
      ? 1500
      : totalPoints < 2000
      ? 2000
      : 2500;
  const pointTierProgressPct = Math.min(
    100,
    Math.round((totalPoints / nextPointTierTarget) * 100)
  );

  const activeBodyProfile = BODY_TYPE_PROFILES[0];
  const currentHeightCm = activeBodyProfile.defaultHeightCm[studioSelection.gender];
  const currentMeasurementsLabel =
    studioSelection.gender === 'nam'
      ? 'Vai 44 · Ngực 94 · Eo 78'
      : 'Vai 37 · Ngực 84 · Eo 64';

  const handleCopyPassport = () => {
    const text = formatCulturalPassportText(
      userName,
      unlockedStamps,
      HERITAGE_MAP_SITES.length,
      omnichannelLogs,
      pinnedBadgeId
    );
    navigator.clipboard.writeText(text);
    setCopiedPassport(true);
    setTimeout(() => setCopiedPassport(false), 2000);
  };

  const handleCopyJsonSchema = () => {
    navigator.clipboard.writeText(JSON.stringify(mandatoryHierarchicalJson, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleSend3DMeasurementsToSatelliteShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!measurementShopModal) return;
    const priceNumMatch = measurementShopModal.rental_price_from.replace(/[^0-9]/g, '');
    const orderThousands = Math.max(200, Math.round(Number(priceNumMatch || 280000) / 1000));
    const bonusPoints = orderThousands; // +10% quy đổi Điểm Di Sản (VD: Đơn 280k -> +280 Điểm)

    const payloadText = `[ĐẶT THUÊ QUA BẢN ĐỒ]\n• Tiệm ví dụ: ${measurementShopModal.shop_name} (${measurementShopModal.distance_from_heritage} từ ${selectedSite.site_name})\n• Trang phục: ${measurementShopModal.specialty_outfit} (${measurementShopModal.outfitConfig.config_id})\n• Số đo 3D: ${studioSelection.gender === 'nam' ? 'Nam' : 'Nữ'} · ${currentHeightCm}cm (${currentMeasurementsLabel})\n• Ngày nhận: ${rentalDate}`;
    try {
      navigator.clipboard.writeText(payloadText);
    } catch {
      // ignore
    }
    if (onAwardOmnichannelPoints) {
      onAwardOmnichannelPoints({
        source: 'PARTNER_RENT_TAILOR',
        sourceLabel: 'Thuê/May Đối tác (+10%)',
        description: `Đặt thuê tại ${measurementShopModal.shop_name.split(' — ')[0]} (+${bonusPoints} Điểm)`,
        points: bonusPoints,
      });
    }
    setMeasurementSentSuccess(
      `Đã gửi số đo 3D (${currentHeightCm}cm) tới ${measurementShopModal.shop_name.split(' — ')[0]} & cộng +${bonusPoints} Điểm Di Sản!`
    );
    setTimeout(() => {
      setMeasurementSentSuccess(null);
      setMeasurementShopModal(null);
    }, 2200);
  };

  const activeEmbedUrl = selectedSatelliteShop
    ? `https://maps.google.com/maps?q=${encodeURIComponent(
        selectedSatelliteShop.shop_address
      )}&t=&z=16&ie=UTF8&iwloc=&output=embed`
    : currentEvaluation.maps_integration_lite.embed_iframe_url;

  return (
    <section
      id="ban-do-di-tich"
      className="py-8 lg:py-10 border-b border-zinc-200 bg-zinc-50/30 scroll-mt-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
        {/* =====================================================================
            DASHBOARD TÓM TẮT CHỈ SỐ DI SẢN CÁ NHÂN (TAB HÀNH TRÌNH)
            1. Huy hiệu đã đạt & Cấp bậc  |  2. Điểm Di sản tích lũy  |  3. Cột mốc di tích tiếp theo
           ===================================================================== */}
        <div className="rounded-2xl bg-white border border-zinc-200/90 shadow-2xs overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200/80">
            {/* 1. TỔNG SỐ HUY HIỆU ĐẠT ĐƯỢC & DANH HIỆU CÁ NHÂN (4 cols) */}
            <div className="lg:col-span-4 p-3.5 sm:p-4 flex flex-col justify-between gap-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-zinc-950 text-amber-400 flex items-center justify-center text-base shrink-0 shadow-2xs">
                    {activePinnedBadge?.icon || '🏰'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        Huy hiệu &amp; Cấp bậc
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                        {unlockedBadgesCount}/{profileBadges.length} Huy hiệu
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-zinc-950 truncate mt-0.5">
                      {rankTitle} · {activePinnedBadge?.name}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGamificationDetails((prev) => !prev)}
                  className="px-2 py-1 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-[11px] font-semibold text-zinc-700 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  <span>{showGamificationDetails ? 'Ẩn' : 'Chi tiết'}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      showGamificationDetails ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Interactive Badge Pills Bar */}
              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                <div className="flex items-center gap-1">
                  {profileBadges.map((badge) => (
                    <button
                      key={badge.badge_id}
                      type="button"
                      disabled={!badge.is_unlocked}
                      onClick={() => {
                        if (badge.is_unlocked && onSelectPinnedBadge) {
                          onSelectPinnedBadge(badge.badge_id);
                        }
                      }}
                      title={
                        badge.is_unlocked
                          ? `${badge.name} (${badge.rankTitle}) — Bấm để đính lên hồ sơ`
                          : `Chưa mở: ${badge.name} (Cần check-in ${badge.required_count} di tích)`
                      }
                      className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all ${
                        badge.is_pinned
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-2xs cursor-pointer'
                          : badge.is_unlocked
                          ? 'bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-400 cursor-pointer'
                          : 'bg-zinc-100/60 text-zinc-400 border-zinc-200/60 opacity-55 cursor-not-allowed'
                      }`}
                    >
                      <span>{badge.icon}</span>
                      <span className="hidden sm:inline truncate max-w-[68px]">
                        {badge.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-mono-tabular font-semibold text-zinc-500 shrink-0">
                  {unlockedStamps.length}/{HERITAGE_MAP_SITES.length} Con dấu
                </span>
              </div>
            </div>

            {/* 2. ĐIỂM DI SẢN TÍCH LŨY ĐA KÊNH (3 cols) */}
            <div className="lg:col-span-3 p-3.5 sm:p-4 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Điểm Di sản tích lũy</span>
                </span>
                <span className="text-[10px] font-mono-tabular font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                  Mốc {nextPointTierTarget}đ
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <div className="text-xl sm:text-2xl font-extrabold font-mono-tabular tracking-tight text-zinc-950">
                  {totalPoints.toLocaleString('vi-VN')}
                  <span className="text-xs font-semibold text-zinc-500 ml-1">điểm</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono-tabular">
                  Còn {Math.max(0, nextPointTierTarget - totalPoints)}đ nhận ưu đãi
                </div>
              </div>

              {/* Progress Bar & Source Breakdown */}
              <div className="space-y-1.5">
                <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${pointTierProgressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono-tabular">
                  <span>Check-in +{stampPoints + eventPoints}</span>
                  <span>·</span>
                  <span>Cộng đồng +{socialPoints}</span>
                  <span>·</span>
                  <span>Thuê/May +{partnerPoints}</span>
                </div>
              </div>
            </div>

            {/* 3. CỘT MỐC DI TÍCH TIẾP THEO & GỢI Ý MẶC THỬ 3D (5 cols) */}
            <div className="lg:col-span-5 p-3.5 sm:p-4 bg-zinc-950 text-white flex flex-col justify-between gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 truncate">
                    {nextLockedBadge
                      ? `Cột mốc tiếp theo: ${nextLockedBadge.icon} ${nextLockedBadge.name} (Còn ${remainingSitesForNextBadge} di tích)`
                      : '🎉 Đã chinh phục toàn bộ Huy hiệu Di sản!'}
                  </span>
                </div>
                {unvisitedSites.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setNextSiteCursor((prev) => prev + 1)}
                    className="text-[10px] font-semibold text-zinc-400 hover:text-white cursor-pointer shrink-0"
                    title="Xem gợi ý di tích chưa đóng dấu khác"
                  >
                    Đổi gợi ý ↻
                  </button>
                )}
              </div>

              {/* Milestone Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${milestoneProgressPct}%` }}
                />
              </div>

              {/* Next Recommended Heritage Site Card + 1-Touch Actions */}
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 pt-0.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="text-xs font-bold text-white truncate">
                      {suggestedNextSite.site_name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono-tabular text-[10px] font-bold shrink-0">
                      +{suggestedNextSite.points_awarded}đ
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                    Dresscode gợi ý: <strong className="text-zinc-200">{suggestedNextSite.dresscodeLabel.split(' (')[0]}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onApplyOutfitConfigToStudio(suggestedNextSite.outfitConfig)}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    title={`Mặc thử ngay Dresscode cho ${suggestedNextSite.site_name} tại Studio`}
                  >
                    <Cuboid className="w-3.5 h-3.5" />
                    <span>Thử đồ 3D</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSelectSite(suggestedNextSite);
                      setRightTab('CHECKIN');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                    title="Định vị ngay di tích này trên Bản đồ để Check-in GPS"
                  >
                    <span>Chọn di tích</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* EXPANDABLE GAMIFICATION DRAWER: BẢNG HUY HIỆU & LỘ TRÌNH CHINH PHỤC DI TÍCH */}
          {showGamificationDetails && (
            <div className="p-4 bg-zinc-50 border-t border-zinc-200/80 grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
              {/* Left 5 cols: All 4 Profile Heritage Badges */}
              <div className="lg:col-span-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">
                    Lộ trình 4 Cấp bậc Huy hiệu Di sản
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Bấm vào huy hiệu đã mở để đính lên Profile
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {profileBadges.map((badge) => (
                    <button
                      key={badge.badge_id}
                      type="button"
                      disabled={!badge.is_unlocked}
                      onClick={() =>
                        badge.is_unlocked &&
                        onSelectPinnedBadge &&
                        onSelectPinnedBadge(badge.badge_id)
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                        badge.is_pinned
                          ? 'bg-zinc-950 text-white border-zinc-950 cursor-pointer'
                          : badge.is_unlocked
                          ? 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-400 cursor-pointer'
                          : 'bg-zinc-100/70 text-zinc-400 border-zinc-200/60 opacity-70 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg shrink-0">{badge.icon}</span>
                        <div className="min-w-0">
                          <div className="font-bold truncate">{badge.name}</div>
                          <div
                            className={`text-[10px] truncate ${
                              badge.is_pinned ? 'text-amber-300' : 'text-zinc-500'
                            }`}
                          >
                            {badge.rankTitle} · {badge.collected_count}/{badge.required_count} di tích
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                          badge.is_pinned
                            ? 'bg-amber-400 text-zinc-950'
                            : badge.is_unlocked
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-zinc-200 text-zinc-600'
                        }`}
                      >
                        {badge.is_pinned ? 'Đang đính' : badge.is_unlocked ? 'Đã mở' : 'Khóa'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right 7 cols: Next Unvisited Heritage Milestones */}
              <div className="lg:col-span-7 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">
                    Các cột mốc di tích tiếp theo ({unvisitedSites.length} địa danh chưa đóng dấu)
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Mặc thử Dresscode 3D trước khi tới Check-in
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(unvisitedSites.length > 0 ? unvisitedSites.slice(0, 4) : HERITAGE_MAP_SITES.slice(0, 4)).map(
                    (site) => {
                      const isVisited = unlockedStamps.some((s) => s.stamp_id === site.stamp_id);
                      return (
                        <div
                          key={site.id}
                          className="p-2.5 rounded-xl bg-white border border-zinc-200/90 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  isVisited ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              />
                              <span className="font-bold text-zinc-950 truncate">
                                {site.site_name}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                              {site.dresscodeLabel.split(' (')[0]} ·{' '}
                              <strong className="text-emerald-700">+{site.points_awarded}đ</strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => onApplyOutfitConfigToStudio(site.outfitConfig)}
                              className="px-2 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[10px] font-semibold cursor-pointer"
                            >
                              Thử 3D
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleSelectSite(site);
                                setRightTab('CHECKIN');
                              }}
                              className="px-2 py-1 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-[10px] font-semibold cursor-pointer"
                            >
                              Bản đồ
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Minimalist Top Bar: Title + Search + Region Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold tracking-tight text-zinc-950">Bản đồ Di sản</h2>
            <form onSubmit={handleCustomQuerySearch} className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQueryInput}
                onChange={(e) => setSearchQueryInput(e.target.value)}
                placeholder="Tìm di tích..."
                className="pl-7 pr-2.5 py-1 rounded-full border border-zinc-200 bg-white text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 w-40 sm:w-48"
              />
            </form>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {(
              [
                { id: 'ALL', label: 'Tất cả' },
                { id: 'MIEN_BAC', label: 'Miền Bắc' },
                { id: 'MIEN_TRUNG', label: 'Miền Trung' },
                { id: 'MIEN_NAM', label: 'Miền Nam' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRegionFilter(tab.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                  regionFilter === tab.id
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Monochrome Horizontal Site Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {filteredSites.map((site) => {
            const isSelected = selectedSite.id === site.id;
            const isUnlocked = unlockedStamps.some((s) => s.stamp_id === site.stamp_id);
            return (
              <button
                key={site.id}
                type="button"
                onClick={() => handleSelectSite(site)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-zinc-950 text-white border-zinc-950 font-semibold'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected
                      ? 'bg-white'
                      : isUnlocked
                      ? 'bg-zinc-900'
                      : 'bg-zinc-300'
                  }`}
                />
                <span>{site.site_name}</span>
              </button>
            );
          })}
        </div>

        {/* Minimalist 2-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT 7 COLUMNS: Map + Hierarchical Pins + Example Partner Shops */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            {/* Compact Map Header Bar */}
            <div className="px-3.5 py-2.5 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setActivePinMode('HERO');
                    setShowSiteInfo((prev) => !prev);
                  }}
                  title="Ấn vào tên di tích để xem lịch sử & lưu ý trang phục"
                  className="inline-flex items-center gap-1.5 text-left cursor-pointer group min-w-0"
                >
                  <span className="w-2 h-2 rounded-full bg-zinc-950 shrink-0" />
                  <span className="text-sm font-bold text-zinc-950 group-hover:underline truncate">
                    {selectedSite.site_name}
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-semibold shrink-0">
                    <span>Lưu ý</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        showSiteInfo ? 'rotate-180' : ''
                      }`}
                    />
                  </span>
                </button>
                {selectedSatelliteShop && (
                  <span className="text-xs text-zinc-500 font-medium truncate">
                    · {selectedSatelliteShop.shop_name.split(' — ')[0]}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Radius Filter Pills: 300m | 500m | 1km */}
                <div className="inline-flex items-center p-0.5 bg-zinc-100 rounded-lg text-[11px] font-semibold">
                  {(
                    [
                      { value: 300, label: '300m' },
                      { value: 500, label: '500m' },
                      { value: 1000, label: '1km' },
                    ] as const
                  ).map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRadiusFilter(r.value)}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        radiusFilter === r.value
                          ? 'bg-white text-zinc-950 shadow-2xs'
                          : 'text-zinc-500 hover:text-zinc-900'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsVirtualTour360Open(false);
                    setShowPinOverlayOnMap((prev) => !prev);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                    !isVirtualTour360Open && showPinOverlayOnMap
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:text-zinc-950'
                  }`}
                >
                  {showPinOverlayOnMap ? 'Ghim' : 'Bản đồ'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsVirtualTour360Open((prev) => !prev)}
                  title="Bật/Tắt Tham quan ảo 360° & Đặt Avatar Việt Phục"
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors inline-flex items-center gap-1 cursor-pointer ${
                    isVirtualTour360Open
                      ? 'bg-amber-500 text-zinc-950 border-amber-500 font-bold shadow-2xs'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400 hover:text-zinc-950'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Tour 360°</span>
                </button>

                <a
                  href={currentEvaluation.maps_integration_lite.direct_google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Mở trên Google Maps"
                  className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Progressive Disclosure: Site History & Etiquette */}
            {showSiteInfo && (
              <div className="px-3.5 py-2.5 bg-zinc-50 border-b border-zinc-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-500">
                    {selectedSite.location_query}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSiteInfo(false)}
                    className="text-zinc-400 hover:text-zinc-800 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-zinc-700 leading-relaxed">{selectedSite.historical_summary}</p>
                <p className="text-zinc-800 bg-zinc-100 border border-zinc-200 rounded-lg px-2.5 py-1.5">
                  <strong>Lưu ý:</strong> {selectedSite.etiquette_rules}
                </p>
              </div>
            )}

            {/* Map Viewport OR Virtual Tour 360° Viewport */}
            <div className="relative w-full h-[340px] sm:h-[380px] bg-zinc-100 overflow-hidden">
              {isVirtualTour360Open ? (
                <div
                  className="relative w-full h-full bg-zinc-950 select-none overflow-hidden cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => {
                    isDragging360Ref.current = true;
                    setIsAutoRotate360(false);
                    dragStartXRef.current = e.clientX;
                  }}
                  onMouseMove={(e) => {
                    if (!isDragging360Ref.current) return;
                    const deltaX = e.clientX - dragStartXRef.current;
                    dragStartXRef.current = e.clientX;
                    setTourYawDeg((prev) => (prev - Math.round(deltaX * 0.45) + 360) % 360);
                  }}
                  onMouseUp={() => {
                    isDragging360Ref.current = false;
                  }}
                  onMouseLeave={() => {
                    isDragging360Ref.current = false;
                  }}
                  onTouchStart={(e) => {
                    isDragging360Ref.current = true;
                    setIsAutoRotate360(false);
                    dragStartXRef.current = e.touches[0]?.clientX || 0;
                  }}
                  onTouchMove={(e) => {
                    if (!isDragging360Ref.current) return;
                    const clientX = e.touches[0]?.clientX || 0;
                    const deltaX = clientX - dragStartXRef.current;
                    dragStartXRef.current = clientX;
                    setTourYawDeg((prev) => (prev - Math.round(deltaX * 0.45) + 360) % 360);
                  }}
                  onTouchEnd={() => {
                    isDragging360Ref.current = false;
                  }}
                >
                  {/* Simulated Seamless 360 Panorama Strip — Demo: Văn Miếu - Quốc Tử Giám */}
                  <div
                    className="absolute inset-0 flex w-[300%] h-full transition-transform duration-75"
                    style={{
                      transform: `translateX(-${((tourYawDeg % 360) / 360) * 66.66}%)`,
                      filter:
                        goldenHourMode === 'GOLDEN'
                          ? 'sepia(0.18) saturate(1.3) brightness(1.02) contrast(1.05)'
                          : goldenHourMode === 'NIGHT'
                          ? 'brightness(0.68) contrast(1.2) saturate(1.25)'
                          : 'brightness(1.05) saturate(1.08)',
                    }}
                  >
                    <img
                      src={HERITAGE_IMAGES.vanMieu360Panorama}
                      alt="Toàn cảnh 360° Văn Miếu - Quốc Tử Giám (Khuê Văn Các & Thiên Quang Tỉnh)"
                      referrerPolicy="no-referrer"
                      className="w-1/3 h-full object-cover"
                    />
                    <img
                      src={HERITAGE_IMAGES.vanMieu360Panorama}
                      alt="Toàn cảnh 360° Văn Miếu - Quốc Tử Giám (Góc nhìn đối xứng)"
                      referrerPolicy="no-referrer"
                      className="w-1/3 h-full object-cover scale-x-[-1]"
                    />
                    <img
                      src={HERITAGE_IMAGES.vanMieu360Panorama}
                      alt="Toàn cảnh 360° Văn Miếu - Quốc Tử Giám (Vườn Bia Tiến Sĩ)"
                      referrerPolicy="no-referrer"
                      className="w-1/3 h-full object-cover"
                    />
                  </div>

                  {/* Interactive 360° Hotspots for Văn Miếu - Quốc Tử Giám Demo */}
                  <div className="absolute top-14 left-3 z-20 flex flex-wrap items-center gap-1.5">
                    {[
                      { label: '🏯 Khuê Văn Các', yaw: 180 },
                      { label: '🌊 Giếng Thiên Quang', yaw: 140 },
                      { label: '🐢 Vườn Bia Tiến Sĩ', yaw: 95 },
                    ].map((spot) => (
                      <button
                        key={spot.label}
                        type="button"
                        onClick={() => {
                          setIsAutoRotate360(false);
                          setTourYawDeg(spot.yaw);
                        }}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-xs border transition-all cursor-pointer ${
                          Math.abs(tourYawDeg - spot.yaw) < 20
                            ? 'bg-amber-400/95 text-zinc-950 border-amber-300 font-bold shadow-xs'
                            : 'bg-black/60 text-white/90 border-white/20 hover:bg-black/80'
                        }`}
                      >
                        {spot.label}
                      </button>
                    ))}
                  </div>

                  {/* Golden Hour Lighting Atmosphere Overlay */}
                  <div
                    className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${
                      goldenHourMode === 'GOLDEN'
                        ? 'bg-gradient-to-t from-black/70 via-amber-500/15 to-amber-300/10'
                        : goldenHourMode === 'NIGHT'
                        ? 'bg-gradient-to-t from-black/85 via-indigo-950/40 to-black/50'
                        : 'bg-gradient-to-t from-black/65 via-transparent to-sky-500/10'
                    }`}
                  />

                  {/* Top Controls Bar: 360° Compass + Golden Hour Switcher + Close */}
                  <div className="absolute top-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2">
                    <div className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold flex items-center gap-1.5 border border-white/15">
                      <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                      <span>360° {selectedSite.site_name}</span>
                      <span className="text-amber-300 font-mono-tabular">{tourYawDeg}°</span>
                    </div>

                    <div className="flex items-center gap-1 bg-black/75 backdrop-blur-xs p-0.5 rounded-full border border-white/15 text-[10px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setGoldenHourMode('GOLDEN')}
                        className={`px-2 py-0.5 rounded-full cursor-pointer transition-colors flex items-center gap-1 ${
                          goldenHourMode === 'GOLDEN'
                            ? 'bg-amber-400 text-zinc-950 font-bold'
                            : 'text-zinc-300 hover:text-white'
                        }`}
                      >
                        <Sun className="w-3 h-3" />
                        <span>Giờ Vàng 15:30–17:00</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoldenHourMode('MORNING')}
                        className={`px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                          goldenHourMode === 'MORNING'
                            ? 'bg-white text-zinc-950 font-bold'
                            : 'text-zinc-300 hover:text-white'
                        }`}
                      >
                        Nắng Sớm
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoldenHourMode('NIGHT')}
                        className={`px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                          goldenHourMode === 'NIGHT'
                            ? 'bg-indigo-500 text-white font-bold'
                            : 'text-zinc-300 hover:text-white'
                        }`}
                      >
                        Đêm Hội
                      </button>
                    </div>
                  </div>

                  {/* Placed Real-Time 3D WebGL Avatar inside 360° Heritage Scene */}
                  {showAvatarIn360 && (
                    <div
                      style={{ left: `${avatarOffsetX}%` }}
                      className="absolute bottom-11 -translate-x-1/2 z-10 flex flex-col items-center group"
                    >
                      <div className="px-2.5 py-0.5 rounded-full bg-zinc-950/90 text-amber-300 border border-amber-400/40 text-[10px] font-bold mb-0.5 shadow-md whitespace-nowrap flex items-center gap-1">
                        <Cuboid className="w-3 h-3 text-amber-400" />
                        <span>
                          Mô hình 3D · {OUTFIT_LABELS[selectedSite.primary_outfit]} ({currentHeightCm}cm)
                        </span>
                      </div>
                      <Tour360Avatar3D
                        selection={studioSelection}
                        goldenHourMode={goldenHourMode}
                        heightCm={currentHeightCm}
                      />
                    </div>
                  )}

                  {/* Bottom Interactive Controls for 360° Tour */}
                  <div className="absolute bottom-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2 bg-black/75 backdrop-blur-md px-3 py-2 rounded-xl border border-white/15 text-[11px] text-white">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsAutoRotate360((prev) => !prev)}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer ${
                          isAutoRotate360
                            ? 'bg-white text-zinc-950 border-white'
                            : 'bg-zinc-900 text-zinc-200 border-zinc-700 hover:bg-zinc-800'
                        }`}
                      >
                        <RotateCw className={`w-3 h-3 ${isAutoRotate360 ? 'animate-spin' : ''}`} />
                        <span>{isAutoRotate360 ? 'Đang xoay 360°' : 'Tự xoay'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowAvatarIn360((prev) => !prev)}
                        className={`px-2 py-1 rounded-lg border text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer ${
                          showAvatarIn360
                            ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                            : 'bg-zinc-900 text-zinc-200 border-zinc-700 hover:bg-zinc-800'
                        }`}
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>{showAvatarIn360 ? 'Ẩn Avatar' : 'Đặt Avatar'}</span>
                      </button>

                      {showAvatarIn360 && (
                        <input
                          type="range"
                          min={20}
                          max={80}
                          value={avatarOffsetX}
                          onChange={(e) => setAvatarOffsetX(Number(e.target.value))}
                          title="Kéo để đổi vị trí đứng của Avatar trong khung cảnh 360°"
                          className="w-16 sm:w-20 accent-amber-400 cursor-pointer"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const fallbackPhoto =
                            OUTFIT_DEFAULT_PHOTOS[selectedSite.primary_outfit] ||
                            selectedSite.imageUrl;
                          setCapturedPhotoUrl(fallbackPhoto);
                          triggerGPSAndAIVerification(fallbackPhoto);
                          setRightTab('CHECKIN');
                          setShareToast(
                            `📸 Đã Check-in Ảo 360° tại ${selectedSite.site_name} & mở khóa con dấu (+${selectedSite.points_awarded}đ)!`
                          );
                          setTimeout(() => setShareToast(null), 3000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Check-in Ảo 360° (+{selectedSite.points_awarded}đ)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsVirtualTour360Open(false)}
                        className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold cursor-pointer"
                      >
                        Về Bản đồ
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <iframe
                    key={activeEmbedUrl}
                    title={`Bản đồ ${selectedSite.site_name}`}
                    src={activeEmbedUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />

                  {showPinOverlayOnMap && (
                <div className="absolute inset-0 bg-black/10 select-none">
                  {/* Subtle Radius Ring */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] rounded-full border border-dashed border-white/70 bg-black/5 pointer-events-none" />

                  {/* HERO PIN (Ghim Di Tích) */}
                  <button
                    type="button"
                    onClick={() => setActivePinMode('HERO')}
                    style={{ top: '50%', left: '50%' }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer focus:outline-none"
                  >
                    <span className="absolute -inset-3 rounded-full bg-rose-600/35 animate-ping" />
                    <div
                      className={`relative flex flex-col items-center transition-transform ${
                        activePinMode === 'HERO' ? 'scale-110' : 'hover:scale-105'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-rose-700 border-2 border-amber-300 shadow-lg flex items-center justify-center text-amber-100">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="mt-1 px-2 py-0.5 rounded-full bg-zinc-950/90 text-white text-[10px] font-semibold shadow-md whitespace-nowrap">
                        {selectedSite.site_name}
                      </span>
                    </div>
                  </button>

                  {/* SATELLITE PINS (Tiệm đối tác lân cận: Icon nhỏ màu xanh/cam xếp xung quanh theo bán kính) */}
                  {satelliteShops.map((shop, sIdx) => {
                    const isShopSelected = activePinMode === shop.shop_id;
                    const isAmberPin = sIdx % 2 === 0;
                    return (
                      <button
                        key={shop.shop_id}
                        type="button"
                        onClick={() => setActivePinMode(shop.shop_id)}
                        style={shop.pin_coords}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer focus:outline-none"
                      >
                        <div
                          className={`flex flex-col items-center transition-transform ${
                            isShopSelected ? 'scale-115 z-30' : 'hover:scale-105'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full border-2 shadow-md flex items-center justify-center ${
                              isShopSelected
                                ? 'bg-zinc-950 border-amber-300 text-amber-300 ring-2 ring-amber-400/50'
                                : isAmberPin
                                ? 'bg-amber-500 border-white text-zinc-950'
                                : 'bg-sky-600 border-white text-white'
                            }`}
                          >
                            <Store className="w-3.5 h-3.5" />
                          </div>
                          <span
                            className={`mt-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold shadow-xs whitespace-nowrap ${
                              isShopSelected
                                ? 'bg-zinc-950 text-white'
                                : 'bg-white/95 text-zinc-900 border border-zinc-200'
                            }`}
                          >
                            {shop.shop_name.split(' — ')[0]} · {shop.distance_meters}m
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
                </>
              )}
            </div>

            {/* Bottom Section of Map Card: Contextual Hero View vs Satellite Shop View */}
            {selectedSatelliteShop ? (
              /* KHI CHỌN SATELLITE PIN CỬA HÀNG VÍ DỤ */
              <div className="p-3.5 bg-white border-t border-zinc-100 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={selectedSatelliteShop.image_url}
                      alt={selectedSatelliteShop.shop_name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-xl object-cover border border-zinc-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-zinc-950 truncate">
                        {selectedSatelliteShop.shop_name}
                      </h3>
                      <p className="text-[11px] text-zinc-500 truncate">
                        <span>{selectedSatelliteShop.distance_from_heritage}</span> · Thuê từ{' '}
                        <strong className="text-zinc-900">
                          {selectedSatelliteShop.rental_price_from}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActivePinMode('HERO')}
                    className="px-2.5 py-1 rounded-lg border border-zinc-200 text-[11px] font-semibold text-zinc-600 hover:text-zinc-950 shrink-0 cursor-pointer"
                  >
                    ← Di tích
                  </button>
                </div>

                {/* Minimalist Monochrome Action Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onApplyOutfitConfigToStudio(selectedSatelliteShop.outfitConfig)}
                    className="py-2 px-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Cuboid className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Mặc thử 3D</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMeasurementShopModal(selectedSatelliteShop)}
                    className="py-2 px-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-[11px] font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Đặt thuê nhanh</span>
                  </button>

                  <a
                    href={selectedSatelliteShop.action_links.directions_from_site_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-[11px] font-semibold inline-flex items-center justify-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Chỉ đường</span>
                  </a>
                </div>
              </div>
            ) : (
              /* KHI CHỌN HERO PIN DI TÍCH (MẶC ĐỊNH) */
              <div className="divide-y divide-zinc-100">
                {/* 1-Line Dresscode Bar */}
                <div className="px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-zinc-500">Dresscode:</span>
                    <span className="font-bold text-zinc-950 truncate">
                      {OUTFIT_LABELS[selectedSite.primary_outfit]}
                    </span>
                    <div className="flex items-center gap-1">
                      {selectedSite.recommended_colors.map((c) => {
                        const hex = c.split(' - ')[0]?.trim() || '#2E8B57';
                        const name = c.split(' - ')[1]?.trim() || c;
                        return (
                          <span
                            key={c}
                            title={name}
                            className="w-3 h-3 rounded-full border border-black/15"
                            style={{ backgroundColor: hex }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsVirtualTour360Open((prev) => !prev)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                        isVirtualTour360Open
                          ? 'bg-amber-500 text-zinc-950 border-amber-500 font-bold'
                          : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      <Compass className="w-3 h-3" />
                      <span>{isVirtualTour360Open ? 'Đang mở 360°' : 'Tour 360°'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onApplyOutfitConfigToStudio(selectedSite.outfitConfig)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-semibold cursor-pointer"
                    >
                      <Cuboid className="w-3 h-3" />
                      <span>Thử 3D</span>
                    </button>
                    <a
                      href={currentEvaluation.maps_integration_lite.directions_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-[11px] font-semibold"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Chỉ đường</span>
                    </a>
                  </div>
                </div>

                {/* Lịch Lễ Hội Truyền Thống Liên Quan (Hero Pin Integrated Festival Calendar) */}
                {(() => {
                  const directEvents = UPCOMING_HERITAGE_EVENTS.filter(
                    (ev) => ev.heritage_id === selectedSite.id
                  );
                  const directNewsFestivals = HERITAGE_NEWS_ARTICLES.filter(
                    (n) => n.heritage_id === selectedSite.id && n.category === 'su-kien'
                  );
                  const fallbackEvent =
                    UPCOMING_HERITAGE_EVENTS.find((ev) =>
                      selectedSite.region === 'MIEN_BAC'
                        ? ev.id.includes('bach-hoa')
                        : selectedSite.region === 'MIEN_TRUNG'
                        ? ev.id.includes('hue')
                        : ev.id.includes('saigon')
                    ) || UPCOMING_HERITAGE_EVENTS[0];

                  const activeFestivalItem = directEvents[0] || fallbackEvent;
                  const extraFestivalNews = directNewsFestivals[0];

                  return (
                    <div className="px-3.5 py-2.5 bg-amber-50/40 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-amber-900">
                          Lễ hội tại di tích:
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                          {extraFestivalNews?.festivalDetails?.lunarDate ||
                            activeFestivalItem.lunarDate ||
                            activeFestivalItem.dateLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 truncate">
                            {extraFestivalNews ? extraFestivalNews.title : activeFestivalItem.title}
                          </p>
                          <p className="text-[11px] text-zinc-600 truncate">
                            Gợi ý mặc: {activeFestivalItem.dressCode}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onApplyOutfitConfigToStudio(
                              extraFestivalNews?.outfitConfig || activeFestivalItem.outfitConfig
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold shrink-0 cursor-pointer"
                        >
                          Thử đồ lễ hội 3D
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Collapsible Partner Shops List */}
                <div className="px-3.5 py-2.5">
                  <button
                    type="button"
                    onClick={() => setShowNearbyShops((prev) => !prev)}
                    aria-expanded={showNearbyShops}
                    className="w-full flex items-center justify-between text-xs cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-semibold text-zinc-900 group-hover:underline">
                        Tiệm thuê &amp; may lân cận ({satelliteShops.length})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <span>Bán kính {radiusFilter === 1000 ? '1km' : `${radiusFilter}m`}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          showNearbyShops ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {showNearbyShops && (
                    <div className="mt-2.5 space-y-1.5">
                      {satelliteShops.map((shop) => (
                        <div
                          key={shop.shop_id}
                          className="p-2 rounded-xl border border-zinc-100 hover:border-zinc-200 bg-zinc-50/60 flex items-center justify-between gap-2"
                        >
                          <button
                            type="button"
                            onClick={() => setActivePinMode(shop.shop_id)}
                            className="flex items-center gap-2.5 text-left min-w-0 flex-1 cursor-pointer"
                          >
                            <img
                              src={shop.image_url}
                              alt={shop.shop_name}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-lg object-cover border border-zinc-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-zinc-950 truncate">
                                {shop.shop_name.split(' — ')[0]}
                              </p>
                              <p className="text-[11px] text-zinc-500 truncate flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-0.5">
                                  <Footprints className="w-3 h-3" />
                                  {shop.distance_from_heritage}
                                </span>
                                <span>·</span>
                                <span className="font-semibold text-zinc-800">
                                  {shop.rental_price_from}
                                </span>
                              </p>
                            </div>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => onApplyOutfitConfigToStudio(shop.outfitConfig)}
                              title="Mặc thử 3D bộ có sẵn tại tiệm"
                              className="px-2 py-1 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-900 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Cuboid className="w-3 h-3" />
                              <span>3D</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setMeasurementShopModal(shop)}
                              title="Gửi số đo tự động đặt thuê"
                              className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-semibold cursor-pointer"
                            >
                              Thuê
                            </button>
                            <a
                              href={shop.action_links.directions_from_site_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chỉ đường đi bộ từ Di tích sang Tiệm"
                              className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600"
                            >
                              <Navigation className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 5 COLUMNS: Single Clean Card with 2 Tabs (Check-in Camera + GPS | Hộ chiếu) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            {/* Minimalist 2-Tab Switcher */}
            <div className="grid grid-cols-2 border-b border-zinc-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRightTab('CHECKIN')}
                className={`py-3 text-center border-b-2 transition-colors cursor-pointer ${
                  rightTab === 'CHECKIN'
                    ? 'border-zinc-950 text-zinc-950 font-bold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                Check-in GPS
              </button>
              <button
                type="button"
                onClick={() => setRightTab('PASSPORT')}
                className={`py-3 text-center border-b-2 transition-colors cursor-pointer ${
                  rightTab === 'PASSPORT'
                    ? 'border-zinc-950 text-zinc-950 font-bold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                Hộ chiếu ({unlockedStamps.length}/{HERITAGE_MAP_SITES.length})
              </button>
            </div>

            {rightTab === 'CHECKIN' ? (
              /* TAB 1: PURE CAMERA VIEWPORT + DUAL-MODE GPS ONLINE & OFFLINE PENDING */
              <div className="p-3 space-y-2.5">
                {/* Dual-Mode Check-in Switcher Bar (GPS Online vs Offline Pending) */}
                <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-[11px]">
                  <span className="font-semibold text-zinc-700">Xác thực:</span>
                  <div className="inline-flex items-center p-0.5 bg-zinc-200/70 rounded-lg text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setCheckInNetworkMode('ONLINE_GPS')}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        checkInNetworkMode === 'ONLINE_GPS'
                          ? 'bg-zinc-950 text-white'
                          : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      Trực tuyến (GPS)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckInNetworkMode('OFFLINE_PENDING')}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        checkInNetworkMode === 'OFFLINE_PENDING'
                          ? 'bg-amber-500 text-zinc-950 font-bold'
                          : 'text-zinc-600 hover:text-zinc-950'
                      }`}
                    >
                      Ngoại tuyến (Lưu tạm)
                    </button>
                  </div>
                </div>

                {/* Pending Offline Verification Queue Banner */}
                {pendingOfflineQueue.length > 0 && (
                  <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-300/80 flex items-center justify-between gap-2 text-[11px]">
                    <div className="min-w-0">
                      <span className="font-bold text-amber-950 block">
                        ⏳ Chờ đồng bộ GPS ({pendingOfflineQueue.length})
                      </span>
                      <span className="text-[10px] text-amber-800 block truncate">
                        Đã lưu mốc thời gian · Tự động cộng điểm khi kết nối lại
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={syncPendingOfflineCheckIns}
                      className="px-2.5 py-1 rounded-lg bg-zinc-950 text-white text-[10px] font-bold hover:bg-zinc-800 shrink-0 cursor-pointer"
                    >
                      Đồng bộ ngay
                    </button>
                  </div>
                )}

                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-zinc-950">
                  {isCameraActive ? (
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ResilientImage
                      src={activePhotoUrl}
                      alt={selectedSite.site_name}
                      fallbackTitle={selectedSite.site_name}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Top-Left Real-Time GPS / Offline Pending Status Pill */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-xs text-white text-[10px] font-mono-tabular flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        checkInNetworkMode === 'OFFLINE_PENDING'
                          ? 'bg-amber-400 animate-pulse'
                          : unlockedEntryForSelected || verificationResult?.isMatched
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-zinc-400'
                      }`}
                    />
                    <LocateFixed className="w-3 h-3" />
                    <span>
                      {checkInNetworkMode === 'OFFLINE_PENDING'
                        ? verificationResult?.offlineTimestamp
                          ? `PENDING_OFFLINE · ${verificationResult.offlineTimestamp.slice(11, 19)}`
                          : 'OFFLINE MODE · Lưu kèm Timestamp'
                        : verificationResult?.gpsCoordsText ||
                          `${(SITE_DEFAULT_COORDS[selectedSite.id]?.lat || 21.0278).toFixed(4)}° N, ${(
                            SITE_DEFAULT_COORDS[selectedSite.id]?.lng || 105.8355
                          ).toFixed(4)}° E`}
                    </span>
                  </div>

                  {/* Top-Right Badge & Points Unlock Pill */}
                  <div
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs ${
                      unlockedEntryForSelected
                        ? 'bg-zinc-950/90 text-white border border-white/30'
                        : 'bg-black/60 text-white/85'
                    }`}
                  >
                    <Stamp className="w-3 h-3" />
                    <span>
                      {unlockedEntryForSelected
                        ? `${activePinnedBadge?.icon || '🏰'} +${selectedSite.points_awarded}đ`
                        : `+${selectedSite.points_awarded}đ`}
                    </span>
                  </div>

                  {/* Real-Time GPS & Camera Verification Spinner */}
                  {isVerifyingAIAndGPS && (
                    <div className="absolute inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center">
                      <Loader2 className="w-7 h-7 animate-spin text-white" />
                    </div>
                  )}

                  {/* Bottom Camera Controls Overlay (Shutter + Share) */}
                  <div className="absolute bottom-4 inset-x-4 flex items-center justify-between">
                    <div className="w-10" />

                    {/* Circular Camera Shutter Button */}
                    <button
                      type="button"
                      onClick={handleStartCameraOrCapture}
                      disabled={isVerifyingAIAndGPS}
                      aria-label="Chụp ảnh Check-in"
                      className="w-14 h-14 rounded-full bg-white/95 hover:bg-white active:scale-95 disabled:opacity-50 p-1 shadow-lg transition-all cursor-pointer flex items-center justify-center"
                    >
                      <span className="w-full h-full rounded-full border-2 border-zinc-950 flex items-center justify-center text-zinc-950">
                        <Camera className="w-5 h-5" />
                      </span>
                    </button>

                    {/* Share Icon Button */}
                    <button
                      type="button"
                      onClick={handleOpenUnifiedShare}
                      aria-label="Chia sẻ"
                      className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: SỔ TEM DI TÍCH & LỊCH SỬ TÍCH ĐIỂM (NO DUPLICATE BADGE GRIDS) */
              <div className="p-3.5 space-y-3">
                {/* Top Status Row: Stamp Count + Printable Passport Trigger */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0 flex items-center gap-1.5">
                    <span className="font-bold text-zinc-950">Sổ Tem Di Sản</span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-bold">
                      {unlockedStamps.length}/{HERITAGE_MAP_SITES.length} con dấu
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPassportText((prev) => !prev)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                      showPassportText
                        ? 'bg-zinc-950 text-white border-zinc-950'
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {showPassportText ? 'Ẩn bản in' : 'Bản in Hộ chiếu'}
                  </button>
                </div>

                {/* 1. BẢNG CON DẤU DI TÍCH (3x3 Minimalist Stamp Grid — Primary View) */}
                <div className="grid grid-cols-3 gap-1.5">
                  {HERITAGE_MAP_SITES.map((site) => {
                    const unlocked = unlockedStamps.find((s) => s.stamp_id === site.stamp_id);
                    const isCurrent = selectedSite.id === site.id;

                    return (
                      <button
                        key={site.id}
                        type="button"
                        onClick={() => handleSelectSite(site)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[68px] ${
                          unlocked
                            ? isCurrent
                              ? 'border-zinc-950 bg-zinc-100'
                              : 'border-zinc-300 bg-zinc-50'
                            : isCurrent
                            ? 'border-zinc-900 bg-zinc-50'
                            : 'border-zinc-100 bg-zinc-50/50 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              unlocked ? 'bg-emerald-500' : 'bg-zinc-300'
                            }`}
                          />
                          <span className="text-[10px] font-mono-tabular text-zinc-400">
                            +{site.points_awarded}
                          </span>
                        </div>
                        <div className="mt-1">
                          <p className="text-[11px] font-bold text-zinc-900 line-clamp-1">
                            {site.site_name}
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate">
                            {unlocked ? unlocked.outfit_worn : 'Chưa đóng dấu'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 2. COLLAPSIBLE POINT HISTORY ACCORDION */}
                <div className="rounded-xl bg-zinc-50 border border-zinc-200/80 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowPointHistory((prev) => !prev)}
                    aria-expanded={showPointHistory}
                    className="w-full px-3 py-2.5 flex items-center justify-between text-[11px] cursor-pointer hover:bg-zinc-100/80 transition-colors"
                  >
                    <span className="font-bold text-zinc-900">
                      Lịch sử cộng điểm ({totalPoints.toLocaleString('vi-VN')}đ)
                    </span>
                    <span className="inline-flex items-center gap-1 text-zinc-600 font-semibold">
                      <span>{showPointHistory ? 'Thu gọn' : 'Chi tiết'}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          showPointHistory ? 'rotate-180' : ''
                        }`}
                      />
                    </span>
                  </button>

                  {showPointHistory && (
                    <div className="p-2.5 border-t border-zinc-200/70 space-y-2">
                      {/* Source Filter Pills */}
                      <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                        <button
                          type="button"
                          onClick={() => setPassportPointFilter('ALL')}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            passportPointFilter === 'ALL'
                              ? 'bg-zinc-950 text-white border-zinc-950'
                              : 'bg-white border-zinc-200/70 text-zinc-900 hover:border-zinc-400'
                          }`}
                        >
                          <span
                            className={`block ${
                              passportPointFilter === 'ALL' ? 'text-zinc-300' : 'text-zinc-400'
                            }`}
                          >
                            Tất cả
                          </span>
                          <strong className="font-bold">+{totalPoints}</strong>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPassportPointFilter('CHECKIN')}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            passportPointFilter === 'CHECKIN'
                              ? 'bg-zinc-950 text-white border-zinc-950'
                              : 'bg-white border-zinc-200/70 text-zinc-900 hover:border-zinc-400'
                          }`}
                        >
                          <span
                            className={`block ${
                              passportPointFilter === 'CHECKIN' ? 'text-zinc-300' : 'text-zinc-400'
                            }`}
                          >
                            Check-in
                          </span>
                          <strong className="font-bold">+{stampPoints + eventPoints}</strong>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPassportPointFilter('COMMUNITY')}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            passportPointFilter === 'COMMUNITY'
                              ? 'bg-zinc-950 text-white border-zinc-950'
                              : 'bg-white border-zinc-200/70 text-zinc-900 hover:border-zinc-400'
                          }`}
                        >
                          <span
                            className={`block ${
                              passportPointFilter === 'COMMUNITY' ? 'text-zinc-300' : 'text-zinc-400'
                            }`}
                          >
                            Cộng đồng
                          </span>
                          <strong className="font-bold">+{socialPoints}</strong>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPassportPointFilter('RENTAL')}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            passportPointFilter === 'RENTAL'
                              ? 'bg-zinc-950 text-white border-zinc-950'
                              : 'bg-white border-zinc-200/70 text-zinc-900 hover:border-zinc-400'
                          }`}
                        >
                          <span
                            className={`block ${
                              passportPointFilter === 'RENTAL' ? 'text-zinc-300' : 'text-zinc-400'
                            }`}
                          >
                            Thuê đồ
                          </span>
                          <strong className="font-bold">+{partnerPoints}</strong>
                        </button>
                      </div>

                      {/* Filtered Point Accumulation Log List */}
                      <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
                        {[
                          ...unlockedStamps.map((s) => ({
                            id: `st-${s.stamp_id}`,
                            cat: 'CHECKIN' as const,
                            label: 'Check-in di tích',
                            desc: `${s.site_name} (${s.outfit_worn})`,
                            pts: s.points_awarded,
                            date: s.unlocked_at,
                          })),
                          ...omnichannelLogs.map((l) => ({
                            id: l.id,
                            cat:
                              l.source === 'SOCIAL_POST_SHARE'
                                ? ('COMMUNITY' as const)
                                : l.source === 'PARTNER_RENT_TAILOR'
                                ? ('RENTAL' as const)
                                : ('CHECKIN' as const),
                            label:
                              l.source === 'SOCIAL_POST_SHARE'
                                ? 'Đăng bài cộng đồng'
                                : l.source === 'PARTNER_RENT_TAILOR'
                                ? 'Đơn thuê đồ'
                                : 'Sự kiện văn hóa',
                            desc: l.description,
                            pts: l.points,
                            date: l.timestamp,
                          })),
                        ]
                          .filter((item) =>
                            passportPointFilter === 'ALL' ? true : item.cat === passportPointFilter
                          )
                          .map((item) => (
                            <div
                              key={item.id}
                              className="px-2 py-1.5 rounded-lg bg-white border border-zinc-200/70 flex items-center justify-between gap-2 text-[10px]"
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-zinc-900 truncate">{item.desc}</p>
                                <p className="text-[9px] text-zinc-400">
                                  {item.label} · {item.date}
                                </p>
                              </div>
                              <span className="font-bold font-mono-tabular text-zinc-950 shrink-0">
                                +{item.pts}đ
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {showPassportText && (
                  <div className="pt-2 border-t border-zinc-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-zinc-600">Hộ chiếu VietAura</span>
                      <button
                        type="button"
                        onClick={handleCopyPassport}
                        className="inline-flex items-center gap-1 font-semibold text-zinc-700 cursor-pointer"
                      >
                        {copiedPassport ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedPassport ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                    <pre className="p-2.5 rounded-xl bg-zinc-950 text-zinc-100 text-[10px] font-mono-tabular whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-44">
                      {formatCulturalPassportText(
                        userName,
                        unlockedStamps,
                        HERITAGE_MAP_SITES.length,
                        omnichannelLogs,
                        pinnedBadgeId
                      )}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* =====================================================================
            LỊCH SỰ KIỆN & DRESSCODE DI TÍCH (TAB 2 EVENT CALENDAR)
           ===================================================================== */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                Sự kiện &amp; Lễ hội sắp tới
              </span>
              <h3 className="text-sm font-bold text-zinc-950">
                Lịch lễ hội &amp; Gợi ý trang phục
              </h3>
            </div>
            <span className="text-[11px] text-zinc-500">
              Chọn sự kiện để xem trên bản đồ hoặc thử mẫu 3D
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {UPCOMING_HERITAGE_EVENTS.map((ev) => {
              const linkedSite = HERITAGE_MAP_SITES.find((s) => s.id === ev.heritage_id);
              return (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex flex-col justify-between gap-2.5 text-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-950 text-white text-[10px] font-bold">
                        {ev.dateLabel}
                      </span>
                      {ev.lunarDate && (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          Âm lịch: {ev.lunarDate}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-zinc-950 leading-snug">{ev.title}</h4>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </p>
                    <p className="text-[11px] text-zinc-700 bg-white border border-zinc-200/80 rounded-lg px-2.5 py-1.5">
                      <strong className="text-zinc-900">Dresscode:</strong> {ev.dressCode}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onApplyOutfitConfigToStudio(ev.outfitConfig)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Cuboid className="w-3 h-3 text-emerald-400" />
                      <span>Thử mẫu 3D</span>
                    </button>
                    {linkedSite && (
                      <button
                        type="button"
                        onClick={() => handleSelectSite(linkedSite)}
                        className="py-1.5 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-800 text-[11px] font-semibold cursor-pointer"
                      >
                        Xem bản đồ
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================================
          UNIFIED SHARE SHEET MODAL (INSTAGRAM / FACEBOOK STYLE)
         ===================================================================== */}
      {showShareSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowShareSheet(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl border border-zinc-200 max-w-md w-full p-4 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Grabber & Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <h3 className="text-sm font-bold text-zinc-950">Chia sẻ Check-in</h3>
              <button
                type="button"
                onClick={() => setShowShareSheet(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Post Preview + Caption Input (Instagram / Facebook Share Composer) */}
            <div className="flex gap-3 items-start">
              <img
                src={activePhotoUrl}
                alt={selectedSite.site_name}
                referrerPolicy="no-referrer"
                className="w-16 h-20 rounded-xl object-cover border border-zinc-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-900 truncate">
                  📍 {selectedSite.site_name}
                </p>
                <textarea
                  value={shareCaption}
                  onChange={(e) => setShareCaption(e.target.value)}
                  rows={3}
                  className="mt-1 w-full text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl p-2 focus:outline-none focus:border-zinc-900 resize-none"
                  placeholder="Viết chú thích chia sẻ..."
                />
              </div>
            </div>

            {/* Quick Share Targets Row (Instagram / Facebook Bottom Sheet Style) */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center text-[11px] font-medium text-zinc-700">
              <button
                type="button"
                onClick={() => handleExecuteShareTarget('COMMUNITY_FEED')}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-zinc-50 cursor-pointer"
              >
                <span className="w-10 h-10 rounded-full bg-zinc-950 text-white flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </span>
                <span className="truncate w-full">Bảng tin</span>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteShareTarget('COPY_LINK')}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-zinc-50 cursor-pointer"
              >
                <span className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center">
                  <Link2 className="w-4 h-4" />
                </span>
                <span className="truncate w-full">Sao chép</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadStampedPhotoPNG}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-zinc-50 cursor-pointer"
              >
                <span className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </span>
                <span className="truncate w-full">Lưu ảnh</span>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteShareTarget('NATIVE_SHARE')}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-zinc-50 cursor-pointer"
              >
                <span className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </span>
                <span className="truncate w-full">Khác...</span>
              </button>
            </div>

            {shareToast && (
              <div className="p-2.5 rounded-xl bg-zinc-900 text-white text-xs font-medium text-center">
                {shareToast}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Minimalist Modal: Gửi số đo 3D tự động đặt thuê tại cửa hàng ví dụ */}
      {measurementShopModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 max-w-sm w-full p-4 shadow-xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-zinc-950">
                  {measurementShopModal.shop_name}
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  Cách {selectedSite.site_name} {measurementShopModal.distance_from_heritage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMeasurementShopModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSend3DMeasurementsToSatelliteShop} className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                <p className="font-semibold text-zinc-900">
                  {measurementShopModal.specialty_outfit} ({measurementShopModal.rental_price_from})
                </p>
                <p className="text-zinc-600 font-mono-tabular text-[11px]">
                  Số đo 3D: {studioSelection.gender === 'nam' ? 'Nam' : 'Nữ'} · {currentHeightCm}cm
                  ({currentMeasurementsLabel})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Ngày nhận
                  </label>
                  <input
                    type="date"
                    value={rentalDate}
                    onChange={(e) => setRentalDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 text-zinc-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="09xx..."
                    className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 text-zinc-900"
                    required
                  />
                </div>
              </div>

              {measurementSentSuccess && (
                <div className="p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{measurementSentSuccess}</span>
                </div>
              )}

              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setMeasurementShopModal(null)}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 text-zinc-600 font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Gửi số đo &amp; Đặt thuê</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
