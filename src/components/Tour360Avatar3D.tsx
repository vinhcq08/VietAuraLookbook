import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import {
  LOOKBOOK_PALETTES,
  SKIN_TONE_OPTIONS,
  StudioSelection,
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

const TOUR_GLTF_CACHE: Record<string, THREE.Group> = {};

interface Tour360Avatar3DProps {
  selection: StudioSelection;
  goldenHourMode: 'GOLDEN' | 'MORNING' | 'NIGHT';
  heightCm?: number;
}

export const Tour360Avatar3D: React.FC<Tour360Avatar3DProps> = ({
  selection,
  goldenHourMode,
  heightCm = 162,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const rotYRef = useRef<number>(0);
  const lightRef = useRef<{
    keyLight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
  } | null>(null);

  useEffect(() => {
    if (!lightRef.current) return;
    const { keyLight, ambientLight } = lightRef.current;
    if (goldenHourMode === 'GOLDEN') {
      keyLight.color.setHex(0xffedd5);
      keyLight.intensity = 2.2;
      ambientLight.color.setHex(0xfef3c7);
      ambientLight.intensity = 0.95;
    } else if (goldenHourMode === 'NIGHT') {
      keyLight.color.setHex(0xfbbf24);
      keyLight.intensity = 1.65;
      ambientLight.color.setHex(0x818cf8);
      ambientLight.intensity = 0.65;
    } else {
      keyLight.color.setHex(0xffffff);
      keyLight.intensity = 1.95;
      ambientLight.color.setHex(0xe0f2fe);
      ambientLight.intensity = 0.9;
    }
  }, [goldenHourMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 180;
    const height = container.clientHeight || 260;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
    } catch {
      return;
    }

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 30);
    const isMale = selection.gender === 'nam';
    const lookY = isMale ? 0.94 : 0.9;
    camera.position.set(0, lookY + 0.04, 2.75);
    camera.lookAt(0, lookY, 0);

    const ambientLight = new THREE.AmbientLight(0xfef3c7, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    keyLight.position.set(2.2, 3.8, 3.2);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.78);
    fillLight.position.set(-2.2, 2.0, 2.2);
    scene.add(fillLight);

    lightRef.current = { keyLight, ambientLight };

    // Transparent shadow catcher on the courtyard floor
    const shadowFloorGeo = new THREE.CircleGeometry(0.65, 32);
    const shadowFloorMat = new THREE.ShadowMaterial({ opacity: 0.38 });
    const shadowFloor = new THREE.Mesh(shadowFloorGeo, shadowFloorMat);
    shadowFloor.rotation.x = -Math.PI / 2;
    shadowFloor.position.y = 0.0;
    shadowFloor.receiveShadow = true;
    scene.add(shadowFloor);

    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    let clothDataRef: RealTimeClothMeshData | null = null;
    let cancelled = false;

    const baseGenderHeight = isMale ? 172 : 162;
    const effectiveHeightScale = Math.max(
      0.86,
      Math.min(1.14, Number((heightCm / baseGenderHeight).toFixed(3)))
    );

    const activePalette =
      LOOKBOOK_PALETTES.find((p) => p.id === selection.paletteId) || LOOKBOOK_PALETTES[0];
    const primaryHex = activePalette.swatches[0]?.hex || '#2E8B57';
    const secondaryHex = activePalette.swatches[1]?.hex || '#FAF8F5';
    const accentHex = activePalette.swatches[2]?.hex || '#D97706';

    const buildAvatarFromGLB = (rawScene: THREE.Group) => {
      if (cancelled) return;
      setLoading(false);

      const humanClone = SkeletonUtils.clone(rawScene) as THREE.Group;
      const wearingHeadwear =
        selection.accessoryIds.includes('khan-xep') ||
        selection.accessoryIds.includes('man-doi-dau') ||
        selection.accessoryIds.includes('non-quai-thao');

      avatarGroup.scale.set(1, effectiveHeightScale, 1);
      applyAnthropometricBodyMorphToGLB(
        humanClone,
        isMale,
        1.0,
        1.0,
        1.0,
        effectiveHeightScale,
        wearingHeadwear
      );

      const holdingFan = selection.accessoryIds.includes('quat-tram-huong');
      const poseForGarment =
        !isMale && selection.garmentId === 'ao-nhat-binh' ? 'ceremonial' : 'natural';

      applyNaturalHumanStandingPose(
        humanClone,
        isMale,
        poseForGarment,
        holdingFan,
        1.0,
        1.0,
        effectiveHeightScale
      );

      humanClone.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.name === 'Wolf3D_Glasses') {
            mesh.visible = false;
          }
        }
      });

      prepareCleanHumanMeshesForGarment(humanClone, isMale, true, false);
      avatarGroup.add(humanClone);

      const skinMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(SKIN_TONE_OPTIONS[1].hex),
        roughness: 0.52,
        metalness: 0.04,
      });
      const neckGeo = createAnatomicalNeckExtensionFromGLB(isMale, 1.0);
      avatarGroup.add(new THREE.Mesh(neckGeo, skinMat));

      const { calvesGeometry } = createSeamlessAnatomicalBodyFromGLB(
        humanClone,
        isMale,
        1.0,
        1.0
      );
      avatarGroup.add(new THREE.Mesh(calvesGeometry, skinMat));

      const isBrocade =
        selection.garmentId === 'ao-ngu-than' || selection.garmentId === 'ao-nhat-binh';

      const mainGarmentMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(primaryHex),
        roughness: isBrocade ? 0.36 : 0.48,
        metalness: isBrocade ? 0.06 : 0.02,
        sheen: 0.55,
        sheenRoughness: 0.35,
        sheenColor: new THREE.Color(secondaryHex),
        side: THREE.DoubleSide,
      });

      const innerWhiteMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(secondaryHex),
        roughness: 0.42,
        sheen: 0.35,
        side: THREE.DoubleSide,
      });

      const goldBrocadeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(accentHex),
        roughness: 0.26,
        metalness: 0.78,
        side: THREE.DoubleSide,
      });

      const clothData = createPhysicsConformalTaAoFromGLB(
        humanClone,
        isMale,
        selection.garmentId,
        1.0,
        1.0
      );
      const taAoMesh = new THREE.Mesh(clothData.geometry, mainGarmentMat);
      taAoMesh.castShadow = true;
      taAoMesh.receiveShadow = true;
      avatarGroup.add(taAoMesh);
      clothDataRef = clothData;

      const isWideSleeve = selection.garmentId === 'ao-nhat-binh';
      ([-1, 1] as const).forEach((side) => {
        const sleeveGeo = createConformalSleeveFromGLB(
          humanClone,
          side,
          isMale,
          isWideSleeve,
          1.0
        );
        const sleeveMesh = new THREE.Mesh(sleeveGeo, mainGarmentMat);
        sleeveMesh.castShadow = true;
        avatarGroup.add(sleeveMesh);

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
              1.0
            );
            const bandMat = new THREE.MeshStandardMaterial({
              color: new THREE.Color(bHex),
              roughness: 0.35,
              side: THREE.DoubleSide,
            });
            avatarGroup.add(new THREE.Mesh(bandGeo, bandMat));
          });
        } else if (isWideSleeve && isMale) {
          const bandGeo = createConformalNhatBinhSleeveBandFromGLB(
            humanClone,
            side,
            true,
            0.84,
            0.94,
            1.0
          );
          avatarGroup.add(new THREE.Mesh(bandGeo, goldBrocadeMat));
        }
      });

      if (!isMale && selection.garmentId === 'ao-nhat-binh') {
        const nhatBinhCollarGeo = createConformalChestOverlayFromGLB(
          humanClone,
          false,
          'nhat-binh-collar',
          1.0
        );
        avatarGroup.add(new THREE.Mesh(nhatBinhCollarGeo, goldBrocadeMat));
      } else if (selection.garmentId === 'ao-tu-than') {
        if (!isMale) {
          const yemDaoGeo = createConformalChestOverlayFromGLB(
            humanClone,
            false,
            'yem-dao',
            1.0
          );
          const yemDaoMat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#B91C1C'),
            roughness: 0.38,
            sheen: 0.5,
            side: THREE.DoubleSide,
          });
          avatarGroup.add(new THREE.Mesh(yemDaoGeo, yemDaoMat));

          const { sashGeometry } = createConformalWaistSashFromGLB(humanClone, false, 1.0);
          const greenSashMat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#15803D'),
            roughness: 0.38,
            sheen: 0.5,
            side: THREE.DoubleSide,
          });
          avatarGroup.add(new THREE.Mesh(sashGeometry, greenSashMat));
        } else {
          const innerCollarGeo = createConformalStandingCollarFromGLB(true, true, 1.0);
          avatarGroup.add(new THREE.Mesh(innerCollarGeo, innerWhiteMat));

          const { sashGeometry } = createConformalWaistSashFromGLB(humanClone, true, 1.0);
          const maleSashMat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#1E293B'),
            roughness: 0.42,
            side: THREE.DoubleSide,
          });
          avatarGroup.add(new THREE.Mesh(sashGeometry, maleSashMat));
        }
      } else if (selection.garmentId === 'ao-dai-ba-ba') {
        const btnCoords = computeConformalLapelButtonsFromGLB(humanClone, isMale, true, 1.0);
        const btnGeo = new THREE.SphereGeometry(0.0058, 10, 10);
        const btnMat = new THREE.MeshStandardMaterial({
          color: 0xfaf8f5,
          roughness: 0.3,
        });
        btnCoords.forEach(([bx, by, bz]) => {
          const bMesh = new THREE.Mesh(btnGeo, btnMat);
          bMesh.position.set(bx, by, bz);
          avatarGroup.add(bMesh);
        });
      } else {
        const innerCollarGeo = createConformalStandingCollarFromGLB(isMale, true, 1.0);
        avatarGroup.add(new THREE.Mesh(innerCollarGeo, innerWhiteMat));

        const outerCollarGeo = createConformalStandingCollarFromGLB(isMale, false, 1.0);
        avatarGroup.add(new THREE.Mesh(outerCollarGeo, mainGarmentMat));

        const vatConGeo = createConformalInnerVatConFromGLB(humanClone, isMale, 1.0);
        avatarGroup.add(new THREE.Mesh(vatConGeo, innerWhiteMat));

        const btnCoords = computeConformalLapelButtonsFromGLB(humanClone, isMale, false, 1.0);
        const btnGeo = new THREE.SphereGeometry(0.0065, 12, 12);
        btnCoords.forEach(([bx, by, bz]) => {
          const bMesh = new THREE.Mesh(btnGeo, goldBrocadeMat);
          bMesh.position.set(bx, by, bz);
          avatarGroup.add(bMesh);
        });
      }

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
        const skirtGeo = createConformalVayDupFromGLB(humanClone, isMale, isShortSkirt, 1.0);
        const skirtMesh = new THREE.Mesh(skirtGeo, lowerMat);
        skirtMesh.castShadow = true;
        avatarGroup.add(skirtMesh);
      } else {
        const trousersGeo = createConformalSilkTrousersFromGLB(humanClone, isMale, 1.0);
        const trousersMesh = new THREE.Mesh(trousersGeo, lowerMat);
        trousersMesh.castShadow = true;
        avatarGroup.add(trousersMesh);
      }

      const headwearGroup = createConformalHeadwearFromGLB(
        humanClone,
        isMale,
        selection.accessoryIds,
        mainGarmentMat,
        goldBrocadeMat,
        1.0
      );
      avatarGroup.add(headwearGroup);

      const handAccGroup = buildBoneAnchoredHandAccessoriesFromGLB(
        humanClone,
        isMale,
        selection.accessoryIds,
        accentHex
      );
      avatarGroup.add(handAccGroup);

      const footwearGroup = createConformalFootwearFromGLB(
        humanClone,
        isMale,
        selection.footwearId
      );
      avatarGroup.add(footwearGroup);
    };

    const modelPath = isMale ? '/models/male_human.glb' : '/models/female_human.glb';
    if (TOUR_GLTF_CACHE[modelPath]) {
      buildAvatarFromGLB(TOUR_GLTF_CACHE[modelPath]);
    } else {
      const loader = new GLTFLoader();
      loader.load(
        modelPath,
        (gltf) => {
          TOUR_GLTF_CACHE[modelPath] = gltf.scene;
          buildAvatarFromGLB(gltf.scene);
        },
        undefined,
        () => {
          setLoading(false);
        }
      );
    }

    // Allow dragging on the 3D Avatar itself to rotate the 3D model 360°
    let isDraggingAvatar = false;
    let prevX = 0;
    const domElem = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      e.stopPropagation();
      isDraggingAvatar = true;
      prevX = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingAvatar) return;
      e.stopPropagation();
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      rotYRef.current += dx * 0.015;
    };
    const onPointerUp = () => {
      isDraggingAvatar = false;
    };

    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      avatarGroup.rotation.y += (rotYRef.current - avatarGroup.rotation.y) * 0.16;
      if (clothDataRef) {
        updateRealTimeClothPhysics(clothDataRef, elapsed, 0.35, 1.0);
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    };
  }, [
    selection.gender,
    selection.garmentId,
    selection.paletteId,
    selection.lowerGarmentId,
    selection.accessoryIds,
    selection.footwearId,
    heightCm,
  ]);

  return (
    <div className="relative w-44 h-64 sm:w-52 sm:h-72 flex items-center justify-center">
      <div
        ref={mountRef}
        title="Kéo trên mô hình 3D để xoay nhân vật 360°"
        className="w-full h-full cursor-ew-resize"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-black/75 text-amber-300 text-[10px] font-semibold">
            Đang dựng Avatar 3D...
          </span>
        </div>
      )}
    </div>
  );
};
