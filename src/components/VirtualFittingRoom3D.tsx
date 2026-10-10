import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import {
  RotateCw,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Wand2,
  ChevronDown,
  X,
  Check,
  Bookmark,
  Share2,
  Columns2,
  Code2,
  Copy,
  Box,
  Image as ImageIcon,
  Users,
  Ruler,
  Bot,
  Send,
} from 'lucide-react';
import {
  HERITAGE_GARMENTS,
  LOOKBOOK_PALETTES,
  LOWER_GARMENT_OPTIONS,
  MOTIF_OPTIONS,
  ACCESSORY_OPTIONS,
  FOOTWEAR_OPTIONS,
  BODY_TYPE_PROFILES,
  SKIN_TONE_OPTIONS,
  StudioSelection,
  StylingMode,
  UIDisplayMode,
  ActiveSystemTab,
  GroupStylingMode,
  MandatorySystemJsonOutputSchema,
  UserAnthropometricMeasurements,
  computeSuggestedSizeFromMeasurements,
  LookbookCardData,
  DeepLinkPayload,
  evaluateCultureGuard,
  buildMandatorySystemJsonOutput,
  getDynamic2DImagePath,
  get2DModelImageForSelection,
  getGenderAwareGarmentInfo,
  normalizeSelectionForGenderAndGarment,
  decodeDeepLinkPayloadToSelection,
} from '../data/vietPhucData';
import {
  RealTimeClothMeshData,
  applyAnthropometricBodyMorphToGLB,
  applyNaturalHumanStandingPose,
  prepareCleanHumanMeshesForGarment,
  createAnatomicalNeckExtensionFromGLB,
  createSeamlessAnatomicalBodyFromGLB,
  createPhysicsConformalTaAoFromGLB,
  updateRealTimeClothPhysics,
  createConformalSilkTrousersFromGLB,
  createConformalVayDupFromGLB,
  createConformalStandingCollarFromGLB,
  createConformalSleeveFromGLB,
  createConformalNhatBinhSleeveBandFromGLB,
  buildBoneAnchoredHandAccessoriesFromGLB,
  createConformalWaistSashFromGLB,
  createConformalChestOverlayFromGLB,
  computeConformalLapelButtonsFromGLB,
  createConformalInnerVatConFromGLB,
  createConformalHeadwearFromGLB,
  createConformalFootwearFromGLB,
} from '../utils/anatomicalHuman3D';
import { MiniLookbookDrawer } from './MiniLookbookDrawer';
import { LookbookStudioModal } from './LookbookStudioModal';

interface VirtualFittingRoom3DProps {
  selection: StudioSelection;
  onChangeSelection: (next: StudioSelection) => void;
  onSaveLookbook: (card: LookbookCardData) => void;
  onAskAdvisorWithBodyProfile: (promptText: string) => void;
  externalOpenHeritageTrigger?: number | null;
  allLookbooks?: LookbookCardData[];
  savedIds?: string[];
  onApplyCardToStudio?: (card: LookbookCardData) => void;
  externalOpenCollectionTrigger?: number | null;
  activeSystemTab?: ActiveSystemTab;
  onSendMeasurementsToB2B?: (jsonOutput: MandatorySystemJsonOutputSchema) => void;
  userMeasurements?: UserAnthropometricMeasurements;
  onUpdateMeasurements?: (next: UserAnthropometricMeasurements) => void;
}

type ViewportDisplayMode = 'side-by-side' | '2d-only' | '3d-only';

const GLOBAL_GLTF_CACHE: Record<string, THREE.Group> = {};
const PROTECTED_GLTF_GEOS = new WeakSet<THREE.BufferGeometry>();
const PROTECTED_GLTF_MATS = new WeakSet<THREE.Material>();

function markGltfSceneProtected(scene: THREE.Group) {
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) PROTECTED_GLTF_GEOS.add(mesh.geometry);
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((m) => PROTECTED_GLTF_MATS.add(m));
      } else if (mesh.material) {
        PROTECTED_GLTF_MATS.add(mesh.material);
      }
    }
  });
}

function clearAndDisposeGroup(group: THREE.Group) {
  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry && !PROTECTED_GLTF_GEOS.has(mesh.geometry)) {
        mesh.geometry.dispose();
      }
      const disposeMat = (mat: THREE.Material) => {
        if (PROTECTED_GLTF_MATS.has(mat)) return;
        const stdMat = mat as THREE.MeshStandardMaterial;
        if (stdMat.map && stdMat.map instanceof THREE.CanvasTexture) {
          stdMat.map.dispose();
        }
        mat.dispose();
      };
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(disposeMat);
      } else if (mesh.material) {
        disposeMat(mesh.material);
      }
    }
  });
  while (group.children.length > 0) {
    group.remove(group.children[0]);
  }
}

export const VirtualFittingRoom3D: React.FC<VirtualFittingRoom3DProps> = ({
  selection,
  onChangeSelection,
  onSaveLookbook,
  onAskAdvisorWithBodyProfile,
  allLookbooks = [],
  savedIds = [],
  onApplyCardToStudio,
  externalOpenCollectionTrigger,
  activeSystemTab = 'TAB_1_CORE_STUDIO',
  onSendMeasurementsToB2B,
  userMeasurements,
  onUpdateMeasurements,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [viewportMode, setViewportMode] = useState<ViewportDisplayMode>('side-by-side');
  const [groupStylingMode, setGroupStylingMode] = useState<GroupStylingMode>('SINGLE');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [glbLoadedStatus, setGlbLoadedStatus] = useState<'loading' | 'ready' | 'fallback'>(
    'loading'
  );
  const [webglError, setWebglError] = useState<boolean>(false);

  // Floating Realtime AI Agent state (4 Context Variables: Sự kiện, Thời tiết, Phong cách, Ngân sách)
  const [floatingAiOpen, setFloatingAiOpen] = useState<boolean>(false);
  const [aiEventVar, setAiEventVar] = useState<'tot-nghiep' | 'cuoi-hoi' | 'ngay-tet' | 'dao-pho'>(
    'tot-nghiep'
  );
  const [aiWeatherVar, setAiWeatherVar] = useState<
    'thu-ha-noi' | 'xuan-am-ap' | 'ha-nang-vang' | 'dong-se-lanh'
  >('thu-ha-noi');
  const [aiStyleVar, setAiStyleVar] = useState<'STRICT_HERITAGE' | 'MODERN_FUSION'>(
    'STRICT_HERITAGE'
  );
  const [aiBudgetVar, setAiBudgetVar] = useState<'sinh-vien' | 'tieu-chuan' | 'may-do'>(
    'sinh-vien'
  );
  const [b2bModalOpen, setB2bModalOpen] = useState<boolean>(false);
  const [copiedB2bPayload, setCopiedB2bPayload] = useState<boolean>(false);

  const [collectionDrawerOpen, setCollectionDrawerOpen] = useState<boolean>(false);
  const [lookbookModalOpen, setLookbookModalOpen] = useState<boolean>(false);
  const [lookbookModalTab, setLookbookModalTab] = useState<'export' | 'compare'>('export');
  const [activeDeepLinkBanner, setActiveDeepLinkBanner] = useState<{
    payload: DeepLinkPayload;
    mode: 'app-installed' | 'web-preview';
  } | null>(null);

  const [stylingMode, setStylingMode] = useState<StylingMode>('STRICT_HERITAGE');
  const [uiDisplayMode, setUiDisplayMode] = useState<UIDisplayMode>('MINIMAL_MODE');
  const [showSystemJsonModal, setShowSystemJsonModal] = useState<boolean>(false);
  const [copiedSystemJson, setCopiedSystemJson] = useState<boolean>(false);
  const [customPrimaryHex, setCustomPrimaryHex] = useState<string | null>(null);
  const [customSecondaryHex, setCustomSecondaryHex] = useState<string | null>(null);
  const [customAccentHex, setCustomAccentHex] = useState<string | null>(null);
  const [showCustomPaletteEditor, setShowCustomPaletteEditor] = useState<boolean>(false);
  const [activeColorSlot, setActiveColorSlot] = useState<'primary' | 'secondary' | 'accent'>(
    'primary'
  );
  const [savedCustomPalettes, setSavedCustomPalettes] = useState<
    Array<{ id: string; swatches: [string, string, string] }>
  >(() => {
    try {
      const raw = localStorage.getItem('vietphuc_custom_palettes_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item): item is { id: string; swatches: [string, string, string] } =>
              Boolean(
                item &&
                  typeof item.id === 'string' &&
                  Array.isArray(item.swatches) &&
                  item.swatches.length >= 3 &&
                  typeof item.swatches[0] === 'string' &&
                  typeof item.swatches[1] === 'string' &&
                  typeof item.swatches[2] === 'string'
              )
          );
        }
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });
  const [showExtraAccessories, setShowExtraAccessories] = useState<boolean>(false);
  const [showGarmentDetails, setShowGarmentDetails] = useState<boolean>(false);
  const [garmentInfoTab, setGarmentInfoTab] = useState<'meaning' | 'structure'>('meaning');
  const [showBodySection, setShowBodySection] = useState<boolean>(false);
  const [showCultureGuardNotes, setShowCultureGuardNotes] = useState<boolean>(false);

  // Body Shape & Anthropometric Customization State
  const [bodyProfileId, setBodyProfileId] = useState<string>(BODY_TYPE_PROFILES[0].id);
  const [skinToneId, setSkinToneId] = useState<string>(SKIN_TONE_OPTIONS[1].id);
  const [customHeightCm, setCustomHeightCm] = useState<number>(
    userMeasurements?.height_cm || (selection.gender === 'nam' ? 172 : 162)
  );
  const [shoulderMod, setShoulderMod] = useState<number>(1.0);
  const [torsoMod, setTorsoMod] = useState<number>(1.0);
  const [hipMod, setHipMod] = useState<number>(1.0);

  useEffect(() => {
    if (userMeasurements?.height_cm && userMeasurements.height_cm !== customHeightCm) {
      setCustomHeightCm(userMeasurements.height_cm);
    }
  }, [userMeasurements?.height_cm]);

  const activeGarment = getGenderAwareGarmentInfo(selection.garmentId, selection.gender);
  const activePalette =
    LOOKBOOK_PALETTES.find((p) => p.id === selection.paletteId) || LOOKBOOK_PALETTES[0];
  const activeBodyProfile =
    BODY_TYPE_PROFILES.find((b) => b.id === bodyProfileId) || BODY_TYPE_PROFILES[0];
  const activeSkinTone =
    SKIN_TONE_OPTIONS.find((s) => s.id === skinToneId) || SKIN_TONE_OPTIONS[1];
  const activeLower =
    LOWER_GARMENT_OPTIONS.find((l) => l.id === selection.lowerGarmentId) ||
    LOWER_GARMENT_OPTIONS[0];
  const activeFootwear =
    FOOTWEAR_OPTIONS.find((f) => f.id === selection.footwearId) || FOOTWEAR_OPTIONS[0];

  const baseGenderHeight = selection.gender === 'nam' ? 172 : 162;
  const effectiveHeightScale = Math.max(
    0.84,
    Math.min(1.16, Number((customHeightCm / baseGenderHeight).toFixed(3)))
  );

  // Sync default height when gender changes while keeping chosen body profile ratios
  useEffect(() => {
    const profile =
      BODY_TYPE_PROFILES.find((b) => b.id === bodyProfileId) || BODY_TYPE_PROFILES[0];
    setCustomHeightCm(profile.defaultHeightCm[selection.gender]);
  }, [selection.gender, bodyProfileId]);

  const handleSelectBodyProfile = (profileId: string) => {
    const profile =
      BODY_TYPE_PROFILES.find((b) => b.id === profileId) || BODY_TYPE_PROFILES[0];
    setBodyProfileId(profile.id);
    setCustomHeightCm(profile.defaultHeightCm[selection.gender]);
    setShoulderMod(profile.shoulderScale);
    setTorsoMod(profile.torsoWidthScale);
    setHipMod(profile.hipWidthScale);
  };

  const primaryGarmentHex = customPrimaryHex || activePalette.swatches[0]?.hex || '#2E8B57';
  const secondaryGarmentHex = customSecondaryHex || activePalette.swatches[1]?.hex || '#FFFFF0';
  const accentGarmentHex = customAccentHex || activePalette.swatches[2]?.hex || '#8B4513';

  // Dynamically mapped 2D studio image path: `/assets/2d/${selection.garmentId}-${selection.gender}.png`
  const mapped2DImagePath = getDynamic2DImagePath(selection.garmentId, selection.gender);
  const active2DModelVariant = get2DModelImageForSelection(
    selection.gender,
    selection.garmentId,
    'studio'
  );

  // Check if user selected a palette different from the garment's default 2D studio palette
  const isCustomPaletteOverride = Boolean(
    customPrimaryHex || customSecondaryHex || customAccentHex
  );
  const isCustomPaletteSelected =
    isCustomPaletteOverride || selection.paletteId !== activeGarment.defaultPaletteId;

  const violations = evaluateCultureGuard(selection, stylingMode, false);
  const hasViolation = violations.length > 0;
  const hasCriticalViolation = violations.some((v) => v.severity === 'critical');
  const hasAdvisoryTipOnly = hasViolation && !hasCriticalViolation;

  const mandatorySystemJson = buildMandatorySystemJsonOutput({
    selection,
    activeTab: activeSystemTab,
    groupStylingMode,
    stylingMode,
    uiDisplayMode,
    primaryHex: primaryGarmentHex,
    secondaryHex: secondaryGarmentHex,
    accentHex: accentGarmentHex,
    heightCm: customHeightCm,
    shoulderMod,
    torsoMod,
    hipMod,
    showModernGlasses: false,
  });

  // Realtime 4-Variable AI Recommendation (Sự kiện, Thời tiết, Phong cách, Ngân sách)
  const aiRealtimeRecommendation = (() => {
    const garmentId =
      aiEventVar === 'cuoi-hoi'
        ? 'ao-nhat-binh'
        : aiEventVar === 'dao-pho' && aiWeatherVar === 'ha-nang-vang'
        ? 'ao-dai-ba-ba'
        : aiEventVar === 'ngay-tet' && selection.gender === 'nu' && aiStyleVar === 'STRICT_HERITAGE'
        ? 'ao-tu-than'
        : 'ao-ngu-than';

    const paletteId =
      aiEventVar === 'cuoi-hoi'
        ? 'chu-sa-ngu-uyen'
        : aiWeatherVar === 'thu-ha-noi'
        ? 'khue-van-tri-thuc'
        : aiWeatherVar === 'ha-nang-vang'
        ? 'nam-bo-phong-khoang'
        : 'thanh-phong-nien-hoa';

    const gInfo = getGenderAwareGarmentInfo(garmentId, selection.gender);
    const budgetText =
      aiBudgetVar === 'sinh-vien'
        ? 'Thuê ~200.000đ – 280.000đ/ngày (Ưu đãi Sinh viên)'
        : aiBudgetVar === 'tieu-chuan'
        ? 'Thuê ~320.000đ – 450.000đ/ngày (Gấm/Lụa cao cấp)'
        : 'May đo cá nhân hóa 3D từ 1.850.000đ – 3.200.000đ/bộ';

    return {
      garmentId,
      paletteId,
      garmentName: gInfo.name,
      budgetText,
      fabricAdvice:
        aiWeatherVar === 'ha-nang-vang'
          ? 'Vải tơ tằm / đũi tự nhiên thoáng khí, thấm hút tốt'
          : aiWeatherVar === 'dong-se-lanh'
          ? 'Vải gấm dệt dày hai lớp giữ ấm chuẩn phom'
          : 'Lụa Nha Xá / Gấm mềm rủ tự nhiên theo chuyển động',
    };
  })();

  const handleApplyAiRealtimeRecommendation = () => {
    setStylingMode(aiStyleVar);
    setCustomPrimaryHex(null);
    setCustomSecondaryHex(null);
    setCustomAccentHex(null);
    const nextSel = normalizeSelectionForGenderAndGarment(
      {
        ...selection,
        occasionId: aiEventVar,
        weatherId: aiWeatherVar,
      },
      selection.gender,
      aiRealtimeRecommendation.garmentId,
      aiRealtimeRecommendation.paletteId
    );
    onChangeSelection(nextSel);
  };

  const computedMeasurements = mandatorySystemJson.outfit_3d_config.body_measurements;
  const computedSize = mandatorySystemJson.outfit_3d_config.recommended_size;

  // Sync studio anthropometric changes back to global userMeasurements
  useEffect(() => {
    if (!onUpdateMeasurements || !userMeasurements) return;
    if (
      userMeasurements.height_cm !== computedMeasurements.height_cm ||
      userMeasurements.chest_cm !== computedMeasurements.chest_cm ||
      userMeasurements.waist_cm !== computedMeasurements.waist_cm ||
      userMeasurements.hip_cm !== computedMeasurements.hip_cm
    ) {
      onUpdateMeasurements({
        ...userMeasurements,
        height_cm: computedMeasurements.height_cm,
        weight_kg: computedMeasurements.weight_kg,
        chest_cm: computedMeasurements.chest_cm,
        waist_cm: computedMeasurements.waist_cm,
        hip_cm: computedMeasurements.hip_cm,
        suggested_size: computeSuggestedSizeFromMeasurements(
          computedMeasurements.height_cm,
          computedMeasurements.weight_kg,
          computedMeasurements.chest_cm
        ),
      });
    }
  }, [
    computedMeasurements.height_cm,
    computedMeasurements.weight_kg,
    computedMeasurements.chest_cm,
    computedMeasurements.waist_cm,
    computedMeasurements.hip_cm,
  ]);

  useEffect(() => {
    setCustomPrimaryHex(null);
    setCustomSecondaryHex(null);
    setCustomAccentHex(null);
  }, [selection.paletteId]);

  const handleSaveCustomPaletteToGrid = () => {
    const newEntry: { id: string; swatches: [string, string, string] } = {
      id: `custom-pal-${Date.now()}`,
      swatches: [primaryGarmentHex, secondaryGarmentHex, accentGarmentHex],
    };
    const updated = [...savedCustomPalettes, newEntry];
    setSavedCustomPalettes(updated);
    try {
      localStorage.setItem('vietphuc_custom_palettes_v1', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleDeleteCustomPalette = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedCustomPalettes.filter((p) => p.id !== id);
    setSavedCustomPalettes(updated);
    try {
      localStorage.setItem('vietphuc_custom_palettes_v1', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (externalOpenCollectionTrigger) {
      setCollectionDrawerOpen(true);
    }
  }, [externalOpenCollectionTrigger]);

  // ============================================================================
  // 3D ENGINE: SYNCHRONIZED 1:1 WITH THE 2D STUDIO PORTRAITS
  // ============================================================================
  const sceneStateRef = useRef({
    autoRotate,
    rotationY: 0.04,
    targetZoom: 2.95,
    isMale: selection.gender === 'nam',
  });

  useEffect(() => {
    sceneStateRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  const webglContextRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    avatarGroup: THREE.Group;
    animRefs: {
      clothData: RealTimeClothMeshData | null;
    };
  } | null>(null);

  const buildSynchronizedFabricTexture = (
    baseHex: string,
    motifId: string,
    isBrocadeGarment: boolean
  ): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, 512, 512);

      // Subtle silk weave micro-texture matching the studio photography fabric sheen
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let y = 0; y < 512; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Woven brocade medallions (Thức đoàn / Ám hoa) matching the 2D studio garments
      if (isBrocadeGarment || motifId !== 'am-hoa-tron') {
        ctx.save();
        ctx.strokeStyle =
          motifId === 'rong-5-mong' || motifId === 'phuong-vu-bat-buu'
            ? 'rgba(217, 119, 6, 0.48)'
            : 'rgba(255, 255, 240, 0.16)';
        ctx.lineWidth = 1.6;
        for (let row = 48; row < 512; row += 96) {
          for (let col = 48; col < 512; col += 96) {
            const offset = (row / 96) % 2 === 0 ? 0 : 48;
            const cx = (col + offset) % 512;
            ctx.beginPath();
            ctx.arc(cx, row, 20, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, row, 10, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        ctx.restore();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 3);
    tex.needsUpdate = true;
    return tex;
  };

  // Mount / Unmount WebGL Canvas when 3D view is visible
  useEffect(() => {
    if (viewportMode === '2d-only') {
      return;
    }
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 520;
    const height = container.clientHeight || 620;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      setWebglError(false);
    } catch {
      setWebglError(true);
      return;
    }

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#18181B');

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 50);
    camera.position.set(0, 0.96, 2.95);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.95);
    keyLight.position.set(2.2, 3.8, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.82);
    fillLight.position.set(-2.5, 2.0, 2.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfef3c7, 0.75);
    rimLight.position.set(0, 2.8, -2.8);
    scene.add(rimLight);

    // Subtle dark studio pedestal matching the 2D studio floor
    const floorGeo = new THREE.CircleGeometry(1.15, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x121215,
      roughness: 0.85,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0.0;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    webglContextRef.current = {
      renderer,
      scene,
      camera,
      avatarGroup,
      animRefs: {
        clothData: null,
      },
    };

    // Pointer drag to rotate 3D model
    let isDragging = false;
    let prevX = 0;
    const domElem = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      sceneStateRef.current.rotationY += dx * 0.01;
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      if (!container || !webglContextRef.current) return;
      const w = container.clientWidth || 520;
      const h = container.clientHeight || 620;
      webglContextRef.current.camera.aspect = w / h;
      webglContextRef.current.camera.updateProjectionMatrix();
      webglContextRef.current.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const ctx = webglContextRef.current;
      if (!ctx) return;

      const elapsed = clock.getElapsedTime();
      if (sceneStateRef.current.autoRotate && !isDragging) {
        sceneStateRef.current.rotationY += 0.0065;
      }

      ctx.avatarGroup.rotation.y +=
        (sceneStateRef.current.rotationY - ctx.avatarGroup.rotation.y) * 0.14;

      if (ctx.animRefs.clothData) {
        updateRealTimeClothPhysics(ctx.animRefs.clothData, elapsed, 0, 1.0);
      }

      const lookY = sceneStateRef.current.isMale ? 0.94 : 0.9;
      ctx.camera.position.set(0, lookY + 0.04, sceneStateRef.current.targetZoom);
      ctx.camera.lookAt(0, lookY, 0);

      ctx.renderer.render(ctx.scene, ctx.camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      clearAndDisposeGroup(avatarGroup);
      renderer.dispose();
      webglContextRef.current = null;
    };
  }, [viewportMode]);

  // Rebuild 3D Human + Conformal Garment whenever selection or palette changes
  useEffect(() => {
    if (viewportMode === '2d-only') return;
    const ctx = webglContextRef.current;
    if (!ctx) return;

    let cancelled = false;
    const isMale = selection.gender === 'nam';
    sceneStateRef.current.isMale = isMale;

    const modelPath = isMale ? '/models/male_human.glb' : '/models/female_human.glb';

    const buildAvatarWithHumanScene = (rawScene: THREE.Group) => {
      if (cancelled || !webglContextRef.current) return;
      const { avatarGroup, animRefs } = webglContextRef.current;
      clearAndDisposeGroup(avatarGroup);

      sceneStateRef.current.targetZoom =
        groupStylingMode === 'GROUP' ? 3.85 : groupStylingMode === 'COUPLE' ? 3.45 : 2.95;

      const buildSingleAvatarNode = (
        xOffset: number,
        rotYOffset: number,
        recordPhysicsCloth: boolean
      ) => {
        const personNode = new THREE.Group();
        personNode.position.x = xOffset;
        personNode.rotation.y = rotYOffset;

        const humanClone = SkeletonUtils.clone(rawScene) as THREE.Group;

        const wearingHeadwear =
          selection.accessoryIds.includes('khan-xep') ||
          selection.accessoryIds.includes('man-doi-dau') ||
          selection.accessoryIds.includes('non-quai-thao');

        // 1. Calibrate anthropometric proportions (Shoulder, Torso/Waist, Hip, Height)
        avatarGroup.scale.set(1, effectiveHeightScale, 1);
        applyAnthropometricBodyMorphToGLB(
          humanClone,
          isMale,
          shoulderMod,
          torsoMod,
          hipMod,
          effectiveHeightScale,
          wearingHeadwear
        );

        // 2. Apply natural standing pose synchronized with the 2D portraits:
        const holdingFan = selection.accessoryIds.includes('quat-tram-huong');
        const poseForGarment =
          !isMale && selection.garmentId === 'ao-nhat-binh' ? 'ceremonial' : 'natural';

        applyNaturalHumanStandingPose(
          humanClone,
          isMale,
          poseForGarment,
          holdingFan,
          shoulderMod,
          torsoMod,
          effectiveHeightScale
        );

        const skinTintTarget = new THREE.Color(activeSkinTone.hex);
        const defaultSkinHex = SKIN_TONE_OPTIONS[1].hex;
        const shouldTintSkin = activeSkinTone.hex !== defaultSkinHex;

        humanClone.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.name === 'Wolf3D_Glasses') {
              mesh.visible = false;
            } else if (
              shouldTintSkin &&
              (mesh.name === 'Wolf3D_Head' || mesh.name === 'Wolf3D_Body') &&
              mesh.material
            ) {
              const clonedMat = (mesh.material as THREE.MeshStandardMaterial).clone();
              clonedMat.color = new THREE.Color(0xffffff).lerp(skinTintTarget, 0.35);
              mesh.material = clonedMat;
            }
          }
        });

        prepareCleanHumanMeshesForGarment(humanClone, isMale, true, false);
        personNode.add(humanClone);

        // 3. Seamless neck & lower ankle skin
        const skinMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(activeSkinTone.hex),
          roughness: 0.52,
          metalness: 0.04,
        });
        const neckGeo = createAnatomicalNeckExtensionFromGLB(isMale, torsoMod);
        personNode.add(new THREE.Mesh(neckGeo, skinMat));

        const { calvesGeometry } = createSeamlessAnatomicalBodyFromGLB(
          humanClone,
          isMale,
          shoulderMod,
          torsoMod
        );
        personNode.add(new THREE.Mesh(calvesGeometry, skinMat));

        // 4. Build Garment Materials synchronized with the 2D studio portrait colors
        const isBrocade =
          selection.garmentId === 'ao-ngu-than' || selection.garmentId === 'ao-nhat-binh';
        const fabricTex = buildSynchronizedFabricTexture(
          primaryGarmentHex,
          selection.motifId,
          isBrocade
        );

        const mainGarmentMat = new THREE.MeshPhysicalMaterial({
          map: fabricTex,
          roughness: isBrocade ? 0.36 : 0.48,
          metalness: isBrocade ? 0.06 : 0.02,
          sheen: 0.55,
          sheenRoughness: 0.35,
          sheenColor: new THREE.Color(secondaryGarmentHex),
          side: THREE.DoubleSide,
        });

        const innerWhiteMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(customSecondaryHex || '#FAF8F5'),
          roughness: 0.42,
          sheen: 0.35,
          side: THREE.DoubleSide,
        });

        const goldBrocadeMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(customAccentHex || '#D97706'),
          roughness: 0.26,
          metalness: 0.78,
          side: THREE.DoubleSide,
        });

        // 5. Outer Tunic (Tà Áo)
        const clothData = createPhysicsConformalTaAoFromGLB(
          humanClone,
          isMale,
          selection.garmentId,
          shoulderMod,
          torsoMod
        );
        const taAoMesh = new THREE.Mesh(clothData.geometry, mainGarmentMat);
        taAoMesh.castShadow = true;
        taAoMesh.receiveShadow = true;
        personNode.add(taAoMesh);
        if (recordPhysicsCloth) {
          animRefs.clothData = clothData;
        }

        // 6. Sleeves
        const isWideSleeve = selection.garmentId === 'ao-nhat-binh';
        ([-1, 1] as const).forEach((side) => {
          const sleeveGeo = createConformalSleeveFromGLB(
            humanClone,
            side,
            isMale,
            isWideSleeve,
            shoulderMod
          );
          const sleeveMesh = new THREE.Mesh(sleeveGeo, mainGarmentMat);
          sleeveMesh.castShadow = true;
          personNode.add(sleeveMesh);

          if (isWideSleeve && !isMale) {
            const bandColors = ['#15803d', '#eab308', '#dc2626', '#f8fafc', '#1d4ed8'];
            bandColors.forEach((bHex, idx) => {
              const t0 = 0.62 + idx * 0.062;
              const t1 = t0 + 0.058;
              const bandGeo = createConformalNhatBinhSleeveBandFromGLB(
                humanClone,
                side,
                false,
                t0,
                t1,
                shoulderMod
              );
              const bandMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(bHex),
                roughness: 0.35,
                side: THREE.DoubleSide,
              });
              personNode.add(new THREE.Mesh(bandGeo, bandMat));
            });
          } else if (isWideSleeve && isMale) {
            const bandGeo = createConformalNhatBinhSleeveBandFromGLB(
              humanClone,
              side,
              true,
              0.84,
              0.94,
              shoulderMod
            );
            personNode.add(new THREE.Mesh(bandGeo, goldBrocadeMat));
          }
        });

        // 7. Collar, Inner Shirt / Yếm Đào & Buttons
        if (!isMale && selection.garmentId === 'ao-nhat-binh') {
          const nhatBinhCollarGeo = createConformalChestOverlayFromGLB(
            humanClone,
            false,
            'nhat-binh-collar',
            torsoMod
          );
          personNode.add(new THREE.Mesh(nhatBinhCollarGeo, goldBrocadeMat));
        } else if (selection.garmentId === 'ao-tu-than') {
          if (!isMale) {
            const yemDaoGeo = createConformalChestOverlayFromGLB(
              humanClone,
              false,
              'yem-dao',
              torsoMod
            );
            const yemDaoMat = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(customSecondaryHex || '#B91C1C'),
              roughness: 0.38,
              sheen: 0.5,
              side: THREE.DoubleSide,
            });
            personNode.add(new THREE.Mesh(yemDaoGeo, yemDaoMat));

            const { sashGeometry } = createConformalWaistSashFromGLB(humanClone, false, torsoMod);
            const greenSashMat = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(customAccentHex || '#15803D'),
              roughness: 0.38,
              sheen: 0.5,
              side: THREE.DoubleSide,
            });
            personNode.add(new THREE.Mesh(sashGeometry, greenSashMat));
          } else {
            const innerCollarGeo = createConformalStandingCollarFromGLB(true, true, torsoMod);
            personNode.add(new THREE.Mesh(innerCollarGeo, innerWhiteMat));

            const { sashGeometry } = createConformalWaistSashFromGLB(humanClone, true, torsoMod);
            const maleSashMat = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(customAccentHex || '#1E293B'),
              roughness: 0.42,
              side: THREE.DoubleSide,
            });
            personNode.add(new THREE.Mesh(sashGeometry, maleSashMat));
          }
        } else if (selection.garmentId === 'ao-dai-ba-ba') {
          const btnCoords = computeConformalLapelButtonsFromGLB(humanClone, isMale, true, torsoMod);
          const btnGeo = new THREE.SphereGeometry(0.0058, 12, 12);
          const btnMat = new THREE.MeshStandardMaterial({
            color: 0xfaf8f5,
            roughness: 0.3,
          });
          btnCoords.forEach(([bx, by, bz]) => {
            const bMesh = new THREE.Mesh(btnGeo, btnMat);
            bMesh.position.set(bx, by, bz);
            personNode.add(bMesh);
          });
        } else {
          const innerCollarGeo = createConformalStandingCollarFromGLB(isMale, true, torsoMod);
          personNode.add(new THREE.Mesh(innerCollarGeo, innerWhiteMat));

          const outerCollarGeo = createConformalStandingCollarFromGLB(isMale, false, torsoMod);
          personNode.add(new THREE.Mesh(outerCollarGeo, mainGarmentMat));

          const vatConGeo = createConformalInnerVatConFromGLB(humanClone, isMale, torsoMod);
          personNode.add(new THREE.Mesh(vatConGeo, innerWhiteMat));

          const btnCoords = computeConformalLapelButtonsFromGLB(humanClone, isMale, false, torsoMod);
          const btnGeo = new THREE.SphereGeometry(0.0065, 14, 14);
          btnCoords.forEach(([bx, by, bz]) => {
            const bMesh = new THREE.Mesh(btnGeo, goldBrocadeMat);
            bMesh.position.set(bx, by, bz);
            personNode.add(bMesh);
          });
        }

        // 8. Lower Garment
        const isSkirt = selection.lowerGarmentId.startsWith('vay-dup');
        const isShortSkirt = selection.lowerGarmentId === 'vay-dup-ngan';
        const lowerColorHex =
          selection.lowerGarmentId === 'quan-lua-do'
            ? '#991B1B'
            : selection.lowerGarmentId === 'quan-jeans'
            ? '#1E3A8A'
            : selection.lowerGarmentId === 'quan-lua-den' || isSkirt
            ? '#18181B'
            : '#FAF8F5';

        const lowerMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(lowerColorHex),
          roughness: 0.45,
          sheen: 0.35,
          side: THREE.DoubleSide,
        });

        if (isSkirt) {
          const skirtGeo = createConformalVayDupFromGLB(humanClone, isMale, isShortSkirt, torsoMod);
          const skirtMesh = new THREE.Mesh(skirtGeo, lowerMat);
          skirtMesh.castShadow = true;
          personNode.add(skirtMesh);
        } else {
          const trousersGeo = createConformalSilkTrousersFromGLB(humanClone, isMale, torsoMod);
          const trousersMesh = new THREE.Mesh(trousersGeo, lowerMat);
          trousersMesh.castShadow = true;
          personNode.add(trousersMesh);
        }

        // 9. Headwear
        const headwearGroup = createConformalHeadwearFromGLB(
          humanClone,
          isMale,
          selection.accessoryIds,
          mainGarmentMat,
          goldBrocadeMat,
          torsoMod
        );
        personNode.add(headwearGroup);

        // 10. Hand Accessories & Footwear
        const handAccGroup = buildBoneAnchoredHandAccessoriesFromGLB(
          humanClone,
          isMale,
          selection.accessoryIds,
          accentGarmentHex
        );
        personNode.add(handAccGroup);

        const footwearGroup = createConformalFootwearFromGLB(
          humanClone,
          isMale,
          selection.footwearId
        );
        personNode.add(footwearGroup);

        return personNode;
      };

      if (groupStylingMode === 'COUPLE') {
        avatarGroup.add(buildSingleAvatarNode(-0.28, 0.08, true));
        avatarGroup.add(buildSingleAvatarNode(0.28, -0.08, false));
      } else if (groupStylingMode === 'GROUP') {
        avatarGroup.add(buildSingleAvatarNode(0, 0, true));
        avatarGroup.add(buildSingleAvatarNode(-0.46, 0.12, false));
        avatarGroup.add(buildSingleAvatarNode(0.46, -0.12, false));
      } else {
        avatarGroup.add(buildSingleAvatarNode(0, 0, true));
      }
    };

    const cachedScene = GLOBAL_GLTF_CACHE[modelPath];
    if (cachedScene) {
      setGlbLoadedStatus('ready');
      buildAvatarWithHumanScene(cachedScene);
    } else {
      setGlbLoadedStatus('loading');
      const loader = new GLTFLoader();
      loader.load(
        modelPath,
        (gltf) => {
          if (cancelled) return;
          markGltfSceneProtected(gltf.scene);
          GLOBAL_GLTF_CACHE[modelPath] = gltf.scene;
          setGlbLoadedStatus('ready');
          buildAvatarWithHumanScene(gltf.scene);
        },
        undefined,
        () => {
          if (!cancelled) {
            setGlbLoadedStatus('fallback');
          }
        }
      );
    }

    return () => {
      cancelled = true;
    };
  }, [
    viewportMode,
    selection.gender,
    selection.garmentId,
    selection.paletteId,
    selection.lowerGarmentId,
    selection.motifId,
    selection.accessoryIds,
    selection.footwearId,
    primaryGarmentHex,
    secondaryGarmentHex,
    accentGarmentHex,
    customSecondaryHex,
    customAccentHex,
    groupStylingMode,
    activeSkinTone.hex,
    effectiveHeightScale,
    shoulderMod,
    torsoMod,
    hipMod,
  ]);

  const handleCopySystemJson = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(mandatorySystemJson, null, 2));
      setCopiedSystemJson(true);
      setTimeout(() => setCopiedSystemJson(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleAutoFixCultureGuard = () => {
    let patched = { ...selection };
    for (const v of violations) {
      patched = { ...patched, ...v.autoFixPatch };
    }
    onChangeSelection(patched);
  };

  const toggleAccessory = (accId: string) => {
    const exists = selection.accessoryIds.includes(accId);
    const nextAcc = exists
      ? selection.accessoryIds.filter((id) => id !== accId)
      : [...selection.accessoryIds, accId];
    onChangeSelection({
      ...selection,
      accessoryIds: nextAcc,
    });
  };

  const handleSaveCurrentLook = () => {
    const newCard: LookbookCardData = {
      id: `studio-2d-${Date.now()}`,
      outfitName: `${activeGarment.name.split(' (')[0]} · ${activePalette.name}`,
      mainGarment: `${activeGarment.name} (${
        selection.gender === 'nam' ? 'Nam giới' : 'Nữ giới'
      }) màu ${primaryGarmentHex}, phối cùng ${activeLower.label.toLowerCase()}.`,
      accessories: [
        ...selection.accessoryIds
          .map((id) => ACCESSORY_OPTIONS.find((a) => a.id === id)?.label)
          .filter((l): l is string => Boolean(l)),
        activeFootwear.label,
      ],
      palette: [
        {
          name: customPrimaryHex ? 'Màu Chủ Đạo Tùy Chỉnh' : activePalette.swatches[0]?.name || 'Màu Áo Chính',
          hex: primaryGarmentHex,
          role: 'Áo ngoài',
        },
        {
          name: customSecondaryHex ? 'Màu Phối Phụ Tùy Chỉnh' : activePalette.swatches[1]?.name || 'Màu Phối Phụ',
          hex: secondaryGarmentHex,
          role: 'Áo lót & Cổ',
        },
        {
          name: customAccentHex ? 'Màu Điểm Nhấn Tùy Chỉnh' : activePalette.swatches[2]?.name || 'Màu Điểm Nhấn',
          hex: accentGarmentHex,
          role: 'Đai & Phụ kiện',
        },
      ],
      occasionAndWeather: `Phù hợp lễ hội văn hóa, chụp ảnh di tích, kỷ yếu & sự kiện truyền thống`,
      culturalMeaning: activeGarment.meaning,
      cultureGuardNote: hasViolation
        ? violations.map((v) => v.message).join(' | ')
        : activeBodyProfile.tailoringAdvice,
      garmentId: activeGarment.id,
      imageUrl: mapped2DImagePath,
      styleTag: 'Cổ điển',
      eventTag: 'di-tich',
    };
    onSaveLookbook(newCard);
  };

  return (
    <section id="phong-thu-3d" className="py-8 lg:py-10 border-b border-zinc-200 bg-zinc-50/60">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-5">
          <div>
            <p className="text-xs font-medium text-zinc-500">
              Đồng bộ thời gian thực Ảnh 2D &amp; Mô hình 3D
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 mt-0.5">
              Phòng thử Việt Phục
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleSaveCurrentLook}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lưu bộ đồ</span>
            </button>

            <button
              type="button"
              onClick={() => setCollectionDrawerOpen((prev) => !prev)}
              aria-expanded={collectionDrawerOpen}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                collectionDrawerOpen
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              <span>Tủ đồ ({savedIds.length})</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  collectionDrawerOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => {
                setLookbookModalTab('export');
                setLookbookModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Xuất &amp; So sánh</span>
            </button>
          </div>
        </div>

        {/* Deep Link Banner */}
        {activeDeepLinkBanner && (
          <div className="mb-4 p-3.5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Wand2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white">
                  Deep Link Lookbook · Magic Re-Fit 1-Touch
                </span>
                <span className="text-zinc-400 ml-2 font-mono-tabular">
                  ({activeDeepLinkBanner.payload.base_outfit} ·{' '}
                  {activeDeepLinkBanner.payload.colors.outer_hex})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveDeepLinkBanner(null)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bộ Sưu Tập Drawer */}
        {collectionDrawerOpen && (
          <div className="mb-5">
            <MiniLookbookDrawer
              lookbooks={allLookbooks}
              savedIds={savedIds}
              onApplyCard={(card) => {
                if (onApplyCardToStudio) {
                  onApplyCardToStudio(card);
                }
              }}
              onToggleSave={onSaveLookbook}
              onClose={() => setCollectionDrawerOpen(false)}
              title="Bộ sưu tập trong Phòng thử"
              onSaveCurrentOutfit={handleSaveCurrentLook}
            />
          </div>
        )}

        {/* =====================================================================
            MAIN FITTING ROOM LAYOUT:
            Left (7 cols): 2D & 3D Synchronized Stage (Side-by-Side / 2D Only / 3D Only)
            Right (5 cols): Streamlined Parameter Selector (Gender, Garment, Palette)
           ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: 2D & 3D Synchronized Viewport Stage */}
          <div className="lg:col-span-7 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200/90 shadow-sm flex flex-col relative">
            {/* Minimal Top Stage Bar: Switch between [Song song 2D & 3D], [Ảnh 2D], [Mô hình 3D] + Group Mode [Đơn/Đôi/Nhóm] */}
            <div className="bg-zinc-950 text-zinc-100 border-b border-zinc-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/40 shrink-0"
                  style={{ backgroundColor: primaryGarmentHex }}
                />
                <span className="font-semibold text-zinc-100 truncate">
                  {activeGarment.name.split(' (')[0]} ·{' '}
                  {groupStylingMode === 'COUPLE'
                    ? 'Đôi (Nam & Nữ)'
                    : groupStylingMode === 'GROUP'
                    ? 'Nhóm (3 Avatar)'
                    : selection.gender === 'nam'
                    ? 'Nam'
                    : 'Nữ'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* Couple & Group 3D Studio Mode Selector (SINGLE | COUPLE | GROUP) */}
                <div className="inline-flex items-center p-0.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                  {(
                    [
                      { id: 'SINGLE' as const, label: 'Đơn' },
                      { id: 'COUPLE' as const, label: 'Đôi' },
                      { id: 'GROUP' as const, label: 'Nhóm' },
                    ]
                  ).map((gm) => (
                    <button
                      key={gm.id}
                      type="button"
                      onClick={() => setGroupStylingMode(gm.id)}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                        groupStylingMode === gm.id
                          ? 'bg-amber-400 text-zinc-950 font-bold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      title={`Chế độ phối đồ: ${gm.label}`}
                    >
                      <Users className="w-3 h-3" />
                      <span>{gm.label}</span>
                    </button>
                  ))}
                </div>

                <div className="inline-flex items-center p-0.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setViewportMode('side-by-side')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                      viewportMode === 'side-by-side'
                        ? 'bg-white text-zinc-950 font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Columns2 className="w-3 h-3" />
                    <span>2D &amp; 3D</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewportMode('2d-only')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                      viewportMode === '2d-only'
                        ? 'bg-white text-zinc-950 font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>Ảnh 2D</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewportMode('3d-only')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                      viewportMode === '3d-only'
                        ? 'bg-white text-zinc-950 font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Box className="w-3 h-3" />
                    <span>Mô hình 3D</span>
                  </button>
                </div>

                {viewportMode !== '2d-only' && (
                  <button
                    type="button"
                    onClick={() => setAutoRotate((prev) => !prev)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-colors cursor-pointer ${
                      autoRotate
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-semibold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                    }`}
                    title="Tự động xoay mô hình 3D"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>360°</span>
                  </button>
                )}
              </div>
            </div>

            {/* Stage Content */}
            <div
              className={`p-4 sm:p-5 bg-[#18181B] min-h-[540px] sm:min-h-[620px] grid gap-4 items-center relative ${
                viewportMode === 'side-by-side'
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1'
              }`}
            >
              {/* 2D IMAGE PANEL (Supports SINGLE, COUPLE, and GROUP tone-sur-tone portraits) */}
              {viewportMode !== '3d-only' && (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-[400px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 border border-white/10">
                    {groupStylingMode === 'SINGLE' ? (
                      <img
                        key={`${selection.garmentId}-${selection.gender}`}
                        src={mapped2DImagePath}
                        alt={`${activeGarment.name} - ${
                          selection.gender === 'nam' ? 'Nam' : 'Nữ'
                        }`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const fallback = active2DModelVariant.studioUrl;
                          if (e.currentTarget.src !== fallback) {
                            e.currentTarget.src = fallback;
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : groupStylingMode === 'COUPLE' ? (
                      <div className="w-full h-full grid grid-cols-2 gap-0.5 bg-zinc-900">
                        {(['nam', 'nu'] as const).map((gdr) => {
                          const couplePath = getDynamic2DImagePath(selection.garmentId, gdr);
                          const coupleFallback = get2DModelImageForSelection(
                            gdr,
                            selection.garmentId,
                            'studio'
                          ).studioUrl;
                          return (
                            <img
                              key={`couple-${selection.garmentId}-${gdr}`}
                              src={couplePath}
                              alt={`${activeGarment.name} - ${gdr}`}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                if (e.currentTarget.src !== coupleFallback) {
                                  e.currentTarget.src = coupleFallback;
                                }
                              }}
                              className="w-full h-full object-cover"
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="w-full h-full grid grid-cols-3 gap-0.5 bg-zinc-900">
                        {(['nu', 'nam', 'nu'] as const).map((gdr, idx) => {
                          const groupPath = getDynamic2DImagePath(selection.garmentId, gdr);
                          const groupFallback = get2DModelImageForSelection(
                            gdr,
                            selection.garmentId,
                            'studio'
                          ).studioUrl;
                          return (
                            <img
                              key={`group-${selection.garmentId}-${gdr}-${idx}`}
                              src={groupPath}
                              alt={`${activeGarment.name} - ${gdr}`}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                if (e.currentTarget.src !== groupFallback) {
                                  e.currentTarget.src = groupFallback;
                                }
                              }}
                              className="w-full h-full object-cover"
                            />
                          );
                        })}
                      </div>
                    )}
                    {/* Subtle Garment-Region Color Sync Overlay when user picks a non-default palette */}
                    {isCustomPaletteSelected && (
                      <div
                        className="absolute inset-0 pointer-events-none mix-blend-color opacity-55 transition-colors duration-300"
                        style={{
                          background: `radial-gradient(ellipse 68% 52% at 50% 54%, ${primaryGarmentHex} 0%, ${primaryGarmentHex} 62%, transparent 100%)`,
                        }}
                      />
                    )}
                    <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-zinc-950/80 backdrop-blur-md border border-white/10 text-[11px] text-zinc-200 font-medium">
                      {groupStylingMode === 'COUPLE'
                        ? 'Ảnh mẫu 2D · Phối Đôi (Nam & Nữ)'
                        : groupStylingMode === 'GROUP'
                        ? 'Ảnh mẫu 2D · Phối Nhóm (3 Avatar)'
                        : 'Ảnh mẫu 2D'}
                    </div>
                  </div>
                </div>
              )}

              {/* 3D MODEL PANEL */}
              {viewportMode !== '2d-only' && (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-[400px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 border border-white/10">
                    {!webglError ? (
                      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
                    ) : (
                      <img
                        src={mapped2DImagePath}
                        alt={activeGarment.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-zinc-950/80 backdrop-blur-md border border-white/10 text-[11px] text-zinc-200 font-medium flex items-center gap-1.5">
                      <span>
                        {groupStylingMode === 'COUPLE'
                          ? '3D Đôi Tone-sur-Tone (Kéo xoay)'
                          : groupStylingMode === 'GROUP'
                          ? '3D Nhóm 3 Avatar (Kéo xoay)'
                          : 'Mô hình 3D (Kéo để xoay)'}
                      </span>
                      {glbLoadedStatus === 'loading' && (
                        <span className="text-zinc-400 text-[10px]">(Đang tải...)</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* FLOATING AI AGENT BUBBLE & REALTIME 4-VARIABLE CONTEXT PANEL */}
              <div className="absolute bottom-3 right-3 z-20 flex flex-col items-end">
                {floatingAiOpen && (
                  <div className="mb-2.5 w-[310px] sm:w-[340px] rounded-2xl bg-zinc-950/95 backdrop-blur-md border border-zinc-700 shadow-2xl p-3.5 text-xs text-zinc-100 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-white">
                          Cố Vấn Phối Đồ AI
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFloatingAiOpen(false)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* 4 Context Variables Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">1. Sự kiện</label>
                        <select
                          value={aiEventVar}
                          onChange={(e) =>
                            setAiEventVar(
                              e.target.value as 'tot-nghiep' | 'cuoi-hoi' | 'ngay-tet' | 'dao-pho'
                            )
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100"
                        >
                          <option value="tot-nghiep">Tốt nghiệp / Kỷ yếu</option>
                          <option value="cuoi-hoi">Cưới hỏi / Lễ nghi</option>
                          <option value="ngay-tet">Lễ Tết / Chùa chiền</option>
                          <option value="dao-pho">Dạo phố / Cafe</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">
                          2. Thời tiết
                        </label>
                        <select
                          value={aiWeatherVar}
                          onChange={(e) =>
                            setAiWeatherVar(
                              e.target.value as
                                | 'thu-ha-noi'
                                | 'xuan-am-ap'
                                | 'ha-nang-vang'
                                | 'dong-se-lanh'
                            )
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100"
                        >
                          <option value="thu-ha-noi">Thu mát mẻ (22°C)</option>
                          <option value="xuan-am-ap">Xuân ấm áp (24°C)</option>
                          <option value="ha-nang-vang">Hạ nắng vàng (32°C)</option>
                          <option value="dong-se-lanh">Đông se lạnh (16°C)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">
                          3. Phong cách
                        </label>
                        <select
                          value={aiStyleVar}
                          onChange={(e) => setAiStyleVar(e.target.value as StylingMode)}
                          className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100"
                        >
                          <option value="STRICT_HERITAGE">Cổ Chuẩn (Strict)</option>
                          <option value="MODERN_FUSION">Tân Thời (Fusion)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-400 mb-0.5">
                          4. Ngân sách
                        </label>
                        <select
                          value={aiBudgetVar}
                          onChange={(e) =>
                            setAiBudgetVar(
                              e.target.value as 'sinh-vien' | 'tieu-chuan' | 'may-do'
                            )
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100"
                        >
                          <option value="sinh-vien">Sinh viên (~220k)</option>
                          <option value="tieu-chuan">Tiêu chuẩn (~380k)</option>
                          <option value="may-do">May đo riêng (&gt;1.8tr)</option>
                        </select>
                      </div>
                    </div>

                    {/* Realtime AI Output Summary */}
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1 text-[11px]">
                      <div className="font-bold text-emerald-400">
                        Đề xuất: {aiRealtimeRecommendation.garmentName}
                      </div>
                      <div className="text-zinc-300">{aiRealtimeRecommendation.fabricAdvice}</div>
                      <div className="text-amber-300 font-medium">
                        {aiRealtimeRecommendation.budgetText}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleApplyAiRealtimeRecommendation}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Áp dụng mẫu 3D</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFloatingAiOpen(false);
                          onAskAdvisorWithBodyProfile(
                            `Mình cần tư vấn Việt phục cho dịp ${aiEventVar}, thời tiết ${aiWeatherVar}, phong cách ${aiStyleVar}, ngân sách ${aiBudgetVar}.`
                          );
                        }}
                        className="py-2 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-[11px] cursor-pointer"
                        title="Mở khung chat AI chuyên sâu"
                      >
                        Chat sâu
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setFloatingAiOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-xl border border-emerald-300 transition-transform hover:scale-105 cursor-pointer"
                >
                  <Bot className="w-4 h-4" />
                  <span>{floatingAiOpen ? 'Thu gọn' : 'Cố vấn AI'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Simple Parameter Control Panel (Gender, Garment, Palette) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/90 shadow-xs p-5 space-y-5">
            {/* 1. Gender Selector (selection.gender) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                1. Người mẫu
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    const gInfo = getGenderAwareGarmentInfo(selection.garmentId, 'nam');
                    onChangeSelection(
                      normalizeSelectionForGenderAndGarment(
                        selection,
                        'nam',
                        selection.garmentId,
                        gInfo.defaultPaletteId
                      )
                    );
                  }}
                  className={`py-2.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    selection.gender === 'nam'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Mẫu Nam (Thành)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const gInfo = getGenderAwareGarmentInfo(selection.garmentId, 'nu');
                    onChangeSelection(
                      normalizeSelectionForGenderAndGarment(
                        selection,
                        'nu',
                        selection.garmentId,
                        gInfo.defaultPaletteId
                      )
                    );
                  }}
                  className={`py-2.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    selection.gender === 'nu'
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  Mẫu Nữ (Thắm)
                </button>
              </div>
            </div>

            {/* 2. Garment Selector (selection.garmentId) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                2. Dòng cổ phục
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HERITAGE_GARMENTS.map((rawGarment) => {
                  const g = getGenderAwareGarmentInfo(rawGarment.id, selection.gender);
                  const isSelected = g.id === selection.garmentId;
                  const thumbPath = getDynamic2DImagePath(g.id, selection.gender);
                  const fallbackThumb = get2DModelImageForSelection(
                    selection.gender,
                    g.id,
                    'studio'
                  ).studioUrl;

                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() =>
                        onChangeSelection(
                          normalizeSelectionForGenderAndGarment(
                            selection,
                            selection.gender,
                            g.id,
                            g.defaultPaletteId
                          )
                        )
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                          : 'bg-zinc-50/80 text-zinc-800 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      <img
                        src={thumbPath}
                        alt={g.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          if (e.currentTarget.src !== fallbackThumb) {
                            e.currentTarget.src = fallbackThumb;
                          }
                        }}
                        className="w-9 h-12 rounded-lg object-cover border border-zinc-300/50 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">
                          {g.name.split(' (')[0]}
                        </div>
                        <div
                          className={`text-[11px] truncate ${
                            isSelected ? 'text-zinc-300' : 'text-zinc-500'
                          }`}
                        >
                          {g.period}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Collapsible Wrapper 1: Thông tin Trang phục */}
              <div className="mt-2.5 rounded-xl border border-zinc-200/90 bg-zinc-50/70 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowGarmentDetails((prev) => !prev)}
                  aria-expanded={showGarmentDetails}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-zinc-100/80 transition-colors cursor-pointer select-none"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-900">
                        Thông tin Trang phục
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-zinc-200/80 text-zinc-700 text-[10px] font-semibold truncate">
                        {activeGarment.name.split(' (')[0]} · {activeGarment.structuralPoints.length} lớp
                      </span>
                    </div>
                    {!showGarmentDetails && (
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {activeGarment.subtitle}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 shrink-0">
                    <span>{showGarmentDetails ? 'Thu gọn' : 'Xem thêm'}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        showGarmentDetails ? 'rotate-180' : ''
                      }`}
                    />
                  </span>
                </button>

                {showGarmentDetails && (
                  <div className="px-3.5 pb-3.5 pt-2.5 border-t border-zinc-200/70 bg-white space-y-2.5 text-xs">
                    {/* Sub-tabs inside Thông tin Trang phục */}
                    <div className="grid grid-cols-2 gap-1 p-0.5 bg-zinc-100 rounded-lg text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setGarmentInfoTab('meaning')}
                        className={`py-1.5 rounded-md transition-colors cursor-pointer ${
                          garmentInfoTab === 'meaning'
                            ? 'bg-white text-zinc-950 shadow-2xs'
                            : 'text-zinc-500 hover:text-zinc-900'
                        }`}
                      >
                        Ý nghĩa &amp; Dịp mặc
                      </button>
                      <button
                        type="button"
                        onClick={() => setGarmentInfoTab('structure')}
                        className={`py-1.5 rounded-md transition-colors cursor-pointer ${
                          garmentInfoTab === 'structure'
                            ? 'bg-white text-zinc-950 shadow-2xs'
                            : 'text-zinc-500 hover:text-zinc-900'
                        }`}
                      >
                        Cấu trúc lớp áo ({activeGarment.structuralPoints.length})
                      </button>
                    </div>

                    {garmentInfoTab === 'meaning' ? (
                      <div className="space-y-2 text-[11px] leading-relaxed text-zinc-600">
                        <p className="text-zinc-800 font-medium">{activeGarment.subtitle}</p>
                        <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/60 space-y-1.5">
                          <p>
                            <strong className="text-zinc-900">Giá trị văn hóa:</strong>{' '}
                            {activeGarment.meaning}
                          </p>
                          <p>
                            <strong className="text-zinc-900">Bối cảnh &amp; Dịp mặc:</strong>{' '}
                            {(activeGarment.occasions || []).join(', ')}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          <span className="text-[10px] font-bold text-zinc-500 mr-1">
                            Phụ kiện chuẩn:
                          </span>
                          {(activeGarment.standardAccessories || []).map((accName) => (
                            <span
                              key={accName}
                              className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[10px] font-medium"
                            >
                              {accName}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {activeGarment.structuralPoints.map((sp) => (
                          <div
                            key={sp.id}
                            className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/70 text-[11px] leading-relaxed"
                          >
                            <strong className="text-zinc-900">{sp.label}:</strong>{' '}
                            <span className="text-zinc-600">{sp.detail}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Minimalist Palette Swatches + Custom Palette Builder */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                  3. Bảng màu phối
                </label>
                <span className="text-[11px] text-zinc-500 font-medium truncate">
                  {isCustomPaletteOverride ? 'Màu tự phối' : activePalette.name}
                </span>
              </div>

              {/* Swatch-Only Grid (No Palette Names Displayed) */}
              <div className="flex flex-wrap items-center gap-2">
                {LOOKBOOK_PALETTES.map((pal) => {
                  const isSelected = pal.id === selection.paletteId && !isCustomPaletteOverride;
                  const isDefaultForGarment = pal.id === activeGarment.defaultPaletteId;
                  return (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => {
                        setCustomPrimaryHex(null);
                        setCustomSecondaryHex(null);
                        setCustomAccentHex(null);
                        onChangeSelection({ ...selection, paletteId: pal.id });
                      }}
                      aria-label={`Bộ màu ${pal.swatches.map((s) => s.hex).join(' - ')}`}
                      className={`group relative p-1.5 rounded-full border transition-all cursor-pointer flex items-center ${
                        isSelected
                          ? 'bg-zinc-950 border-zinc-950 ring-2 ring-zinc-950/20 shadow-xs scale-105'
                          : 'bg-zinc-50/90 border-zinc-200 hover:border-zinc-400 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center -space-x-1.5">
                        {pal.swatches.slice(0, 3).map((sw, idx) => (
                          <span
                            key={`${pal.id}-${sw.hex}-${idx}`}
                            className="w-6 h-6 rounded-full border-2 border-white shadow-2xs block"
                            style={{ backgroundColor: sw.hex }}
                          />
                        ))}
                      </div>
                      {isDefaultForGarment && (
                        <span
                          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"
                          title="Màu chuẩn đồng bộ 2D/3D"
                        />
                      )}
                    </button>
                  );
                })}

                {/* User-Saved Custom 3-Color Palettes (Also Swatch-Only) */}
                {savedCustomPalettes.map((cp) => {
                  const isSelected =
                    isCustomPaletteOverride &&
                    primaryGarmentHex.toLowerCase() === cp.swatches[0].toLowerCase() &&
                    secondaryGarmentHex.toLowerCase() === cp.swatches[1].toLowerCase() &&
                    accentGarmentHex.toLowerCase() === cp.swatches[2].toLowerCase();

                  return (
                    <div key={cp.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomPrimaryHex(cp.swatches[0]);
                          setCustomSecondaryHex(cp.swatches[1]);
                          setCustomAccentHex(cp.swatches[2]);
                        }}
                        aria-label={`Bộ màu tùy chỉnh ${cp.swatches.join(' - ')}`}
                        className={`p-1.5 rounded-full border transition-all cursor-pointer flex items-center ${
                          isSelected
                            ? 'bg-zinc-950 border-zinc-950 ring-2 ring-zinc-950/20 shadow-xs scale-105'
                            : 'bg-zinc-50/90 border-zinc-200 hover:border-zinc-400 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center -space-x-1.5">
                          {cp.swatches.map((hex, idx) => (
                            <span
                              key={`${cp.id}-${idx}`}
                              className="w-6 h-6 rounded-full border-2 border-white shadow-2xs block"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCustomPalette(cp.id, e)}
                        title="Xóa bộ màu này"
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] cursor-pointer hover:bg-red-600"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}

                {/* Quick '+' Capsule Button to Toggle Custom Palette Builder */}
                <button
                  type="button"
                  onClick={() => setShowCustomPaletteEditor((prev) => !prev)}
                  title="Tùy chỉnh bộ màu mới"
                  className={`h-9 px-3 rounded-full border border-dashed text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    showCustomPaletteEditor
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-300 hover:border-zinc-900 hover:text-zinc-950'
                  }`}
                >
                  <span>+</span>
                  <span className="text-[11px]">Tùy chỉnh</span>
                </button>
              </div>

              {/* Custom 3-Color Palette Editor Panel */}
              {showCustomPaletteEditor && (
                <div className="mt-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/90 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                      Phối 3 lớp màu (Áo · Cổ/Yếm · Đai)
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isCustomPaletteOverride && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomPrimaryHex(null);
                            setCustomSecondaryHex(null);
                            setCustomAccentHex(null);
                          }}
                          className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
                        >
                          Đặt lại
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveCustomPaletteToGrid}
                        className="px-2.5 py-1 rounded-lg bg-zinc-950 text-white text-[11px] font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        + Lưu màu
                      </button>
                    </div>
                  </div>

                  {/* 3 Color Slots Selector + Native Color Input */}
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        {
                          slot: 'primary' as const,
                          label: '1. Áo ngoài',
                          hex: primaryGarmentHex,
                          onChange: (val: string) => setCustomPrimaryHex(val),
                        },
                        {
                          slot: 'secondary' as const,
                          label: '2. Cổ / Yếm',
                          hex: secondaryGarmentHex,
                          onChange: (val: string) => setCustomSecondaryHex(val),
                        },
                        {
                          slot: 'accent' as const,
                          label: '3. Đai / Viền',
                          hex: accentGarmentHex,
                          onChange: (val: string) => setCustomAccentHex(val),
                        },
                      ]
                    ).map((item) => {
                      const isSlotActive = activeColorSlot === item.slot;
                      return (
                        <div
                          key={item.slot}
                          onClick={() => setActiveColorSlot(item.slot)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                            isSlotActive
                              ? 'bg-white border-zinc-950 ring-1 ring-zinc-950 shadow-2xs'
                              : 'bg-white/70 border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-semibold text-zinc-800 truncate">
                              {item.label}
                            </span>
                            <label
                              className="relative w-5 h-5 rounded-full border border-zinc-300 overflow-hidden shrink-0 cursor-pointer shadow-2xs"
                              style={{ backgroundColor: item.hex }}
                              title="Chọn mã màu bất kỳ"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="color"
                                value={item.hex}
                                onChange={(e) => {
                                  setActiveColorSlot(item.slot);
                                  item.onChange(e.target.value);
                                }}
                                className="opacity-0 inset-0 absolute w-full h-full cursor-pointer"
                              />
                            </label>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">
                            {item.hex}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Heritage Pigment Swatches for the Active Slot */}
                  <div>
                    <div className="text-[10px] text-zinc-500 mb-1.5">
                      Chọn nhanh sắc màu truyền thống cho ô{' '}
                      <strong className="text-zinc-800">
                        {activeColorSlot === 'primary'
                          ? '1. Áo ngoài'
                          : activeColorSlot === 'secondary'
                          ? '2. Cổ / Yếm'
                          : '3. Đai / Viền'}
                      </strong>
                      :
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        '#9A3412',
                        '#B91C1C',
                        '#D97706',
                        '#2E8B57',
                        '#15803D',
                        '#1E3A8A',
                        '#312E81',
                        '#581C87',
                        '#78350F',
                        '#D6CEBE',
                        '#FAF8F5',
                        '#18181B',
                      ].map((pigmentHex) => {
                        const currentSlotHex =
                          activeColorSlot === 'primary'
                            ? primaryGarmentHex
                            : activeColorSlot === 'secondary'
                            ? secondaryGarmentHex
                            : accentGarmentHex;
                        const isPicked =
                          currentSlotHex.toLowerCase() === pigmentHex.toLowerCase();

                        return (
                          <button
                            key={pigmentHex}
                            type="button"
                            onClick={() => {
                              if (activeColorSlot === 'primary') {
                                setCustomPrimaryHex(pigmentHex);
                              } else if (activeColorSlot === 'secondary') {
                                setCustomSecondaryHex(pigmentHex);
                              } else {
                                setCustomAccentHex(pigmentHex);
                              }
                            }}
                            className={`w-6 h-6 rounded-full border transition-transform cursor-pointer ${
                              isPicked
                                ? 'border-zinc-950 scale-115 ring-2 ring-zinc-950/30'
                                : 'border-zinc-300 hover:scale-110'
                            }`}
                            style={{ backgroundColor: pigmentHex }}
                            aria-label={`Chọn màu ${pigmentHex}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Body Shape & Anthropometric Customization (Collapsible Section) */}
            <div className="border-t border-zinc-200/80 pt-3">
              <button
                type="button"
                onClick={() => setShowBodySection((prev) => !prev)}
                aria-expanded={showBodySection}
                className="w-full flex items-center justify-between gap-2 text-left cursor-pointer group"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 group-hover:text-zinc-950">
                  4. Vóc dáng &amp; Số đo 3D
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-800 text-[11px] font-semibold">
                    {customHeightCm}cm · Size {computedSize}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                      showBodySection ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {showBodySection && (
                <div className="mt-3 space-y-2.5">
                  {/* 5 Preset Vóc Dáng */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {BODY_TYPE_PROFILES.map((bp) => {
                      const isSelected = bp.id === bodyProfileId;
                      return (
                        <button
                          key={bp.id}
                          type="button"
                          onClick={() => handleSelectBodyProfile(bp.id)}
                          className={`px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                              : 'bg-zinc-50/80 text-zinc-800 border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          <div className="text-xs font-semibold truncate">
                            {bp.label.split(' (')[0]}
                          </div>
                          <div
                            className={`text-[10px] truncate ${
                              isSelected ? 'text-zinc-300' : 'text-zinc-500'
                            }`}
                          >
                            {bp.defaultHeightCm[selection.gender]}cm · Vai {Math.round(bp.shoulderScale * 100)}%
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Calculated Anthropometric Summary Bar + Advanced Sliders Trigger */}
                  <div className="px-3 py-2 rounded-xl bg-zinc-100/90 border border-zinc-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-700">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>
                        Cao: <strong className="text-zinc-950">{customHeightCm}cm</strong>
                      </span>
                      <span>·</span>
                      <span>
                        Nặng: <strong className="text-zinc-950">~{computedMeasurements.weight_kg}kg</strong>
                      </span>
                      <span>·</span>
                      <span>
                        3 vòng:{' '}
                        <strong className="text-zinc-950">
                          {computedMeasurements.chest_cm}-{computedMeasurements.waist_cm}-
                          {computedMeasurements.hip_cm}cm
                        </strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setUiDisplayMode((prev) =>
                          prev === 'ADVANCED_MODE' ? 'MINIMAL_MODE' : 'ADVANCED_MODE'
                        )
                      }
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      {uiDisplayMode === 'ADVANCED_MODE' ? 'Ẩn thanh trượt' : 'Chỉnh chi tiết'}
                    </button>
                  </div>

                  {/* Custom Anthropometric Sliders & Skin Tone Selector (ADVANCED_MODE) */}
                  {uiDisplayMode === 'ADVANCED_MODE' && (
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2.5 text-xs">
                      {/* Chiều cao (145 - 190 cm) */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-medium text-zinc-700">Chiều cao (145–190 cm)</span>
                          <span className="font-bold text-zinc-950">{customHeightCm} cm</span>
                        </div>
                        <input
                          type="range"
                          min={145}
                          max={190}
                          step={1}
                          value={customHeightCm}
                          onChange={(e) => setCustomHeightCm(Number(e.target.value))}
                          className="w-full accent-zinc-950 cursor-pointer"
                        />
                      </div>

                      {/* Độ rộng Vai (shoulderMod) */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-medium text-zinc-700">Độ rộng Vai &amp; Tay áo</span>
                          <span className="font-bold text-zinc-950">
                            {Math.round(shoulderMod * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.85}
                          max={1.18}
                          step={0.01}
                          value={shoulderMod}
                          onChange={(e) => setShoulderMod(Number(e.target.value))}
                          className="w-full accent-zinc-950 cursor-pointer"
                        />
                      </div>

                      {/* Khung Ngực & Eo (torsoMod) */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-medium text-zinc-700">
                            Khung Ngực &amp; Eo ({computedMeasurements.chest_cm} /{' '}
                            {computedMeasurements.waist_cm} cm)
                          </span>
                          <span className="font-bold text-zinc-950">
                            {Math.round(torsoMod * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.84}
                          max={1.25}
                          step={0.01}
                          value={torsoMod}
                          onChange={(e) => setTorsoMod(Number(e.target.value))}
                          className="w-full accent-zinc-950 cursor-pointer"
                        />
                      </div>

                      {/* Khung Hông & Độ nở Tà (hipMod) */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-medium text-zinc-700">
                            Khung Hông &amp; Tà dưới ({computedMeasurements.hip_cm} cm)
                          </span>
                          <span className="font-bold text-zinc-950">
                            {Math.round(hipMod * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0.86}
                          max={1.24}
                          step={0.01}
                          value={hipMod}
                          onChange={(e) => setHipMod(Number(e.target.value))}
                          className="w-full accent-zinc-950 cursor-pointer"
                        />
                      </div>

                      {/* Tông màu da (Skin Tone) */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="font-medium text-zinc-700">Tông màu da 3D:</span>
                          <button
                            type="button"
                            onClick={() => handleSelectBodyProfile(bodyProfileId)}
                            className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                          >
                            Đặt lại mặc định
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {SKIN_TONE_OPTIONS.map((st) => {
                            const selected = st.id === skinToneId;
                            return (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => setSkinToneId(st.id)}
                                className={`px-2 py-1.5 rounded-lg border text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  selected
                                    ? 'bg-zinc-950 text-white border-zinc-950 font-semibold'
                                    : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                                }`}
                              >
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-zinc-400 shrink-0"
                                  style={{ backgroundColor: st.hex }}
                                />
                                <span className="truncate">{st.label.split(' /')[0].split(' (')[0]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Single Clean B2B Measurement Handoff Button */}
                  {onSendMeasurementsToB2B && (
                    <button
                      type="button"
                      onClick={() => onSendMeasurementsToB2B(mandatorySystemJson)}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5 text-amber-400" />
                      <span>Gửi số đo đặt may (Size {computedSize})</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Collapsible Wrapper 2: Lựa chọn Phụ kiện */}
            <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/70 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowExtraAccessories((prev) => !prev)}
                aria-expanded={showExtraAccessories}
                className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-zinc-100/80 transition-colors cursor-pointer select-none"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-900">
                      Lựa chọn Phụ kiện
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-zinc-200/80 text-zinc-700 text-[10px] font-semibold truncate">
                      {activeLower.label.split(' (')[0]} · {selection.accessoryIds.length} món
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 shrink-0">
                  <span>{showExtraAccessories ? 'Thu gọn' : 'Tùy chỉnh'}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      showExtraAccessories ? 'rotate-180' : ''
                    }`}
                  />
                </span>
              </button>

              {showExtraAccessories && (
                <div className="px-3.5 pb-3.5 pt-2.5 border-t border-zinc-200/70 bg-white space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                        Quần / Váy đi kèm:
                      </label>
                      <select
                        value={selection.lowerGarmentId}
                        onChange={(e) =>
                          onChangeSelection({ ...selection, lowerGarmentId: e.target.value })
                        }
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 text-xs text-zinc-900 cursor-pointer"
                      >
                        {LOWER_GARMENT_OPTIONS.map((lg) => (
                          <option key={lg.id} value={lg.id}>
                            {lg.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                        Hoa văn trên vải:
                      </label>
                      <select
                        value={selection.motifId}
                        onChange={(e) =>
                          onChangeSelection({ ...selection, motifId: e.target.value })
                        }
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 text-xs text-zinc-900 cursor-pointer"
                      >
                        {MOTIF_OPTIONS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-medium text-zinc-500 mb-1.5">
                      Phụ kiện đội đầu &amp; cầm tay 3D:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ACCESSORY_OPTIONS.map((acc) => {
                        const selected = selection.accessoryIds.includes(acc.id);
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => toggleAccessory(acc.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                              selected
                                ? 'bg-zinc-950 text-white border-zinc-950 font-medium'
                                : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                            }`}
                          >
                            {selected && <Check className="w-3 h-3 shrink-0" />}
                            <span>{acc.label.split(' (')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                      Giày / Guốc đi kèm:
                    </label>
                    <select
                      value={selection.footwearId}
                      onChange={(e) =>
                        onChangeSelection({ ...selection, footwearId: e.target.value })
                      }
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 text-xs text-zinc-900 cursor-pointer"
                    >
                      {FOOTWEAR_OPTIONS.map((fw) => (
                        <option key={fw.id} value={fw.id}>
                          {fw.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Culture Guard AI Status Box (Compact by default, auto-expands on violation) */}
            <div className="p-3 rounded-xl bg-zinc-950 text-zinc-100 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowCultureGuardNotes((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-left cursor-pointer"
                >
                  {hasCriticalViolation ? (
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : hasAdvisoryTipOnly ? (
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span
                    className={
                      hasCriticalViolation
                        ? 'text-rose-400'
                        : hasAdvisoryTipOnly
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }
                  >
                    {hasCriticalViolation
                      ? '🔴 Lệch quy chuẩn Cổ lệ'
                      : hasAdvisoryTipOnly
                      ? '🟠 Lưu ý phối Tân thời'
                      : '🟢 Chuẩn quy tắc Cổ phục'}
                  </span>
                  {!hasViolation && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
                        showCultureGuardNotes ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>

                <div className="inline-flex items-center p-0.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => setStylingMode('STRICT_HERITAGE')}
                    className={`px-2 py-0.5 rounded-md cursor-pointer ${
                      stylingMode === 'STRICT_HERITAGE'
                        ? 'bg-emerald-500 text-zinc-950 font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Cổ Chuẩn
                  </button>
                  <button
                    type="button"
                    onClick={() => setStylingMode('MODERN_FUSION')}
                    className={`px-2 py-0.5 rounded-md cursor-pointer ${
                      stylingMode === 'MODERN_FUSION'
                        ? 'bg-amber-400 text-zinc-950 font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Tân Thời
                  </button>
                </div>
              </div>

              {hasViolation ? (
                <div className="space-y-2 text-[11px] text-zinc-300 pt-1 border-t border-zinc-800">
                  {violations.map((v) => (
                    <p key={v.ruleId}>
                      <strong
                        className={
                          v.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'
                        }
                      >
                        {v.ruleTitle}:
                      </strong>{' '}
                      {v.message}
                    </p>
                  ))}
                  <button
                    type="button"
                    onClick={handleAutoFixCultureGuard}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold cursor-pointer"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Tự động chỉnh chuẩn</span>
                  </button>
                </div>
              ) : (
                showCultureGuardNotes && (
                  <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-800 leading-relaxed">
                    {activeBodyProfile.tailoringAdvice}
                  </p>
                )
              )}
            </div>
          </div>
        </div>

        {/* Mandatory System JSON Output Drawer */}
        {showSystemJsonModal && (
          <div className="mt-5 rounded-2xl bg-zinc-950 border border-zinc-800 p-4 text-xs text-zinc-100 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">
                  Quy chuẩn Cấu trúc Dữ liệu Đầu ra JSON (System Output Schema)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySystemJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold cursor-pointer"
                >
                  {copiedSystemJson ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã sao chép JSON</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép JSON</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSystemJsonModal(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <pre className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-emerald-300 font-mono overflow-x-auto max-h-64">
              {JSON.stringify(mandatorySystemJson, null, 2)}
            </pre>
          </div>
        )}

        {/* Lookbook Generator, Deep Link Engine & Comparison Engine Modal */}
        <LookbookStudioModal
          isOpen={lookbookModalOpen}
          initialTab={lookbookModalTab}
          selection={selection}
          customPrimaryHex={customPrimaryHex}
          allLookbooks={allLookbooks}
          onClose={() => setLookbookModalOpen(false)}
          onApplyCardToStudio={(card) => {
            if (onApplyCardToStudio) {
              onApplyCardToStudio(card);
            }
          }}
          onApplyDeepLinkPayload={(payload, mode) => {
            const nextSel = decodeDeepLinkPayloadToSelection(payload, selection);
            onChangeSelection(nextSel);
            setCustomPrimaryHex(payload.colors.outer_hex);
            setActiveDeepLinkBanner({ payload, mode });
          }}
        />

        {/* B2B Measurement 1-Touch Export & Tailor Order Modal */}
        {b2bModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white border border-zinc-200 shadow-2xl overflow-hidden text-xs">
              <div className="p-4 border-b border-zinc-100 flex items-center justify-between gap-2 bg-zinc-950 text-white">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold">
                    Hồ Sơ Số Đo 3D &amp; Đặt May
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setB2bModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Dòng trang phục:</span>
                    <strong className="text-zinc-950">{activeGarment.name}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Chế độ phối &amp; Size gợi ý:</span>
                    <strong className="text-emerald-700">
                      {groupStylingMode} · Size {computedSize}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Thông số 3D (Cao / Nặng / 3 vòng):</span>
                    <strong className="text-zinc-950 font-mono">
                      {computedMeasurements.height_cm}cm · {computedMeasurements.weight_kg}kg ·{' '}
                      {computedMeasurements.chest_cm}-{computedMeasurements.waist_cm}-
                      {computedMeasurements.hip_cm}cm
                    </strong>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-zinc-700">
                      Payload JSON/QR chuẩn B2B Nhà may:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          mandatorySystemJson.b2b_measurement_export.formatted_measurement_payload
                        );
                        setCopiedB2bPayload(true);
                        setTimeout(() => setCopiedB2bPayload(false), 2000);
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      {copiedB2bPayload ? 'Đã sao chép!' : 'Sao chép mã số đo'}
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-xl bg-zinc-950 text-emerald-300 font-mono text-[10px] overflow-x-auto max-h-36">
                    {JSON.stringify(
                      JSON.parse(
                        mandatorySystemJson.b2b_measurement_export.formatted_measurement_payload
                      ),
                      null,
                      2
                    )}
                  </pre>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {onSendMeasurementsToB2B && (
                    <button
                      type="button"
                      onClick={() => {
                        setB2bModalOpen(false);
                        onSendMeasurementsToB2B(mandatorySystemJson);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>Chọn Nhà May Đối Tác (Tab 3)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setB2bModalOpen(false)}
                    className="py-2.5 px-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
