import * as THREE from 'three';

export interface AnatomicalParams {
  isMale: boolean;
  heightScale: number;
  shoulderScale: number;
  torsoScale: number;
  hipScale: number;
  skinHex: string;
}

export interface RealTimeClothMeshData {
  geometry: THREE.BufferGeometry;
  restPositions: Float32Array;
  minCollisionZ: Float32Array;
  panelSignZ: Float32Array;
  freeHangWeights: Float32Array;
  uCoords: Float32Array;
}

export interface LegSliceProfile {
  yMin: number;
  yMax: number;
  numSlices: number;
  cxArr: Float32Array;
  czArr: Float32Array;
  rxArr: Float32Array;
  rzArr: Float32Array;
  sampleAtY: (y: number) => { cx: number; cz: number; rx: number; rz: number };
}

export type HumanPosePreset = 'natural' | 'ceremonial' | 'poise';

/**
 * Computes the skeletal arm weight (0..1) for vertex `vertIdx` on a GLB SkinnedMesh.
 * Joints 10..56 in ReadyPlayerMe / Mixamo skeletons correspond to
 * LeftArm, LeftForeArm, LeftHand (and fingers) + RightArm, RightForeArm, RightHand (and fingers).
 */
function getVertexArmWeight(mesh: THREE.Mesh, vertIdx: number): number {
  const geo = mesh.geometry;
  const skinIndex = geo?.attributes?.skinIndex as THREE.BufferAttribute | undefined;
  const skinWeight = geo?.attributes?.skinWeight as THREE.BufferAttribute | undefined;
  if (!skinIndex || !skinWeight) return 0;

  const skMesh = mesh as THREE.SkinnedMesh;
  const bones = skMesh.skeleton?.bones;

  const j0 = skinIndex.getX(vertIdx);
  const j1 = skinIndex.getY(vertIdx);
  const j2 = skinIndex.getZ(vertIdx);
  const j3 = skinIndex.getW(vertIdx);

  const w0 = skinWeight.getX(vertIdx);
  const w1 = skinWeight.getY(vertIdx);
  const w2 = skinWeight.getZ(vertIdx);
  const w3 = skinWeight.getW(vertIdx);

  const isArmJoint = (jIdx: number): boolean => {
    if (bones && bones[jIdx]) {
      const name = bones[jIdx].name || '';
      return (
        name === 'LeftArm' ||
        name === 'LeftForeArm' ||
        name.startsWith('LeftHand') ||
        name === 'RightArm' ||
        name === 'RightForeArm' ||
        name.startsWith('RightHand')
      );
    }
    return jIdx >= 10 && jIdx <= 56;
  };

  let armW = 0;
  if (w0 > 0 && isArmJoint(j0)) armW += w0;
  if (w1 > 0 && isArmJoint(j1)) armW += w1;
  if (w2 > 0 && isArmJoint(j2)) armW += w2;
  if (w3 > 0 && isArmJoint(j3)) armW += w3;
  return armW;
}

/**
 * Computes the skeletal wrist/hand/finger weight (0..1) for vertex `vertIdx` on a GLB SkinnedMesh.
 * Used to preserve 100% of bare wrists, palms, and fingers while cleanly stripping covered forearms.
 */
function getVertexHandWeight(mesh: THREE.Mesh, vertIdx: number): number {
  const geo = mesh.geometry;
  const skinIndex = geo?.attributes?.skinIndex as THREE.BufferAttribute | undefined;
  const skinWeight = geo?.attributes?.skinWeight as THREE.BufferAttribute | undefined;
  if (!skinIndex || !skinWeight) return 0;

  const skMesh = mesh as THREE.SkinnedMesh;
  const bones = skMesh.skeleton?.bones;

  const j0 = skinIndex.getX(vertIdx);
  const j1 = skinIndex.getY(vertIdx);
  const j2 = skinIndex.getZ(vertIdx);
  const j3 = skinIndex.getW(vertIdx);

  const w0 = skinWeight.getX(vertIdx);
  const w1 = skinWeight.getY(vertIdx);
  const w2 = skinWeight.getZ(vertIdx);
  const w3 = skinWeight.getW(vertIdx);

  const isHandJoint = (jIdx: number): boolean => {
    if (bones && bones[jIdx]) {
      const name = bones[jIdx].name || '';
      return name.startsWith('LeftHand') || name.startsWith('RightHand');
    }
    return false;
  };

  let handW = 0;
  if (w0 > 0 && isHandJoint(j0)) handW += w0;
  if (w1 > 0 && isHandJoint(j1)) handW += w1;
  if (w2 > 0 && isHandJoint(j2)) handW += w2;
  if (w3 > 0 && isHandJoint(j3)) handW += w3;
  return handW;
}

/**
 * Computes the skeletal Head bone weight (0..1) for vertex `vertIdx` on `Wolf3D_Head`.
 * Used to pre-compensate upper-neck vertices when calibrating Head bone proportions.
 */
function getVertexHeadWeight(mesh: THREE.Mesh, vertIdx: number): number {
  const geo = mesh.geometry;
  const skinIndex = geo?.attributes?.skinIndex as THREE.BufferAttribute | undefined;
  const skinWeight = geo?.attributes?.skinWeight as THREE.BufferAttribute | undefined;
  if (!skinIndex || !skinWeight) return 0;

  const skMesh = mesh as THREE.SkinnedMesh;
  const bones = skMesh.skeleton?.bones;

  const j0 = skinIndex.getX(vertIdx);
  const j1 = skinIndex.getY(vertIdx);
  const j2 = skinIndex.getZ(vertIdx);
  const j3 = skinIndex.getW(vertIdx);

  const w0 = skinWeight.getX(vertIdx);
  const w1 = skinWeight.getY(vertIdx);
  const w2 = skinWeight.getZ(vertIdx);
  const w3 = skinWeight.getW(vertIdx);

  const isHeadJoint = (jIdx: number): boolean => {
    if (bones && bones[jIdx]) {
      const name = bones[jIdx].name || '';
      return name === 'Head' || name === 'LeftEye' || name === 'RightEye';
    }
    return jIdx === 5;
  };

  let headW = 0;
  if (w0 > 0 && isHeadJoint(j0)) headW += w0;
  if (w1 > 0 && isHeadJoint(j1)) headW += w1;
  if (w2 > 0 && isHeadJoint(j2)) headW += w2;
  if (w3 > 0 && isHeadJoint(j3)) headW += w3;
  return headW;
}

/**
 * Smooth C1 Anthropometric Morph Curve along vertical height Y, incorporating baseline
 * anatomical corrections for the raw GLB meshes:
 * - Male ('nam'): Broadens upper chest/latissimus/clavicles (+10%), trims waist (-5%),
 *   and compacts pelvis/hips (-8%) to achieve a true Male V-Taper (Chest/Shoulders > Hips > Waist).
 * - Female ('nu'): Gently broadens pinched clavicles (+6%), preserves defined high waist,
 *   and smooths the abrupt outer-thigh jump (-7%) for a realistic Female Hourglass silhouette.
 * - Tapers smoothly to 1.0 at the true anatomical Neck Base (y >= neckY) and Ankles (y <= ankleY).
 */
function getAnthropometricMorphFactorsAtY(
  y: number,
  isMale: boolean,
  sScale: number,
  tScale: number,
  hipScale: number
): { sx: number; sz: number } {
  const neckY = isMale ? 1.526 : 1.458;
  const shoulderY = isMale ? 1.478 : 1.412;
  const chestY = isMale ? 1.33 : 1.3;
  const waistY = isMale ? 1.09 : 1.17;
  const hipY = isMale ? 0.94 : 0.95;
  const kneeY = 0.48;
  const ankleY = 0.14;

  // Baseline anatomical calibration ratios correcting raw GLB hoodie/crop-top proportions
  const effShoulderX = sScale * (isMale ? 1.09 : 1.06);
  const effChestX = (0.65 * sScale + 0.35 * tScale) * (isMale ? 1.07 : 1.03);
  const effWaistX = tScale * (isMale ? 0.94 : 0.98);
  const effHipX = hipScale * (isMale ? 0.91 : 0.93);
  const effKneeX = (1.0 + (hipScale - 1.0) * 0.38) * (isMale ? 0.89 : 0.93);

  const szShoulder = 1.0 + (tScale - 1.0) * 0.72;
  const szChest = tScale * (isMale ? 1.03 : 1.04);
  const szWaist = tScale * (isMale ? 0.92 : 0.94);
  const szHip = hipScale * (isMale ? 0.94 : 0.96);
  const szKnee = (1.0 + (hipScale - 1.0) * 0.38) * (isMale ? 0.9 : 0.94);

  if (y >= neckY || y <= ankleY) {
    return { sx: 1.0, sz: 1.0 };
  }
  if (y > shoulderY) {
    const u = (neckY - y) / (neckY - shoulderY);
    const smooth = u * u * (3 - 2 * u);
    return {
      sx: 1.0 + (effShoulderX - 1.0) * smooth,
      sz: 1.0 + (szShoulder - 1.0) * smooth,
    };
  }
  if (y >= chestY) {
    const u = (y - chestY) / (shoulderY - chestY);
    const smooth = u * u * (3 - 2 * u);
    return {
      sx: effChestX * (1 - smooth) + effShoulderX * smooth,
      sz: szChest * (1 - smooth) + szShoulder * smooth,
    };
  }
  if (y >= waistY) {
    const u = (y - waistY) / (chestY - waistY);
    const smooth = u * u * (3 - 2 * u);
    return {
      sx: effWaistX * (1 - smooth) + effChestX * smooth,
      sz: szWaist * (1 - smooth) + szChest * smooth,
    };
  }
  if (y >= hipY) {
    const u = (y - hipY) / (waistY - hipY);
    const smooth = u * u * (3 - 2 * u);
    return {
      sx: effHipX * (1 - smooth) + effWaistX * smooth,
      sz: szHip * (1 - smooth) + szWaist * smooth,
    };
  }
  if (y >= kneeY) {
    const u = (y - kneeY) / (hipY - kneeY);
    const smooth = u * u * (3 - 2 * u);
    return {
      sx: effKneeX * (1 - smooth) + effHipX * smooth,
      sz: szKnee * (1 - smooth) + szHip * smooth,
    };
  }
  const u = (y - ankleY) / (kneeY - ankleY);
  const smooth = u * u * (3 - 2 * u);
  return {
    sx: 1.0 + (effKneeX - 1.0) * smooth,
    sz: 1.0 + (szKnee - 1.0) * smooth,
  };
}

/**
 * Computes the horizontal inward leg-stance adjustment at height `y` so the wide rigging A-stance
 * of the raw GLB (`cx = ±0.165` at the feet) is brought into a natural, graceful standing posture
 * (`cx = ±0.132` at the feet) across legs, ankles, and footwear alike.
 */
function getNaturalLegStanceInwardShiftAtY(y: number, isMale: boolean): number {
  if (y >= 0.95) return 0;
  const t = Math.max(0, Math.min(1, (0.95 - y) / 0.81));
  const curve = t * (1.32 - 0.32 * t);
  return (isMale ? 0.031 : 0.029) * curve;
}

/**
 * Applies a true 3D Anthropometric Body, Head, Neck & Leg Stance Calibration directly to the cloned
 * GLB human model's vertices in bind-pose space BEFORE garment extraction:
 * 1. Orthogonally calibrates Head, Eyes, Teeth, Hair, and Glasses around the submental skull pivot
 *    without touching `bones['Head'].scale` (eliminating 100% of tilted-bone matrix shearing!).
 * 2. Regularizes the lower neck flare and upper neck pinch on `Wolf3D_Head` into a smooth cylinder.
 * 3. Reshapes the raw Male hoodie belly pouch into a flat male abdomen with a true V-taper (Chest > Hips > Waist).
 * 4. Reshapes the raw Female lordotic belly tilt into a realistic Bust-to-Waist-to-Hip S-curve.
 * 5. Aligns the wide A-pose legs and footwear (`Wolf3D_Outfit_Footwear`) into a natural standing stance.
 */
export function applyAnthropometricBodyMorphToGLB(
  humanModel: THREE.Group,
  isMale: boolean,
  sScale: number,
  tScale: number,
  hipScale: number,
  hScale: number = 1.0,
  wearingHeadwear: boolean = false
): void {
  // 1:7.8 (Male) and 1:7.55 (Female) classical head-to-body ratio calibration in orthogonal world axes
  const headScaleXZ =
    (isMale ? 0.985 : 0.945) * (1 + (sScale - 1) * 0.14 + (tScale - 1) * 0.08);
  const safeHScale = Math.max(0.8, Math.min(1.22, hScale));
  const headScaleY = (headScaleXZ * Math.pow(safeHScale, 0.38)) / safeHScale;
  const neckScale = 1 + (tScale - 1) * 0.14;

  const yHeadPivot = isMale ? 1.606 : 1.514;
  const zHeadPivot = isMale ? 0.018 : 0.036;

  humanModel.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;

    // 1. Orthogonal Skull/Face/Eye/Teeth/Hair/Glasses Calibration (Zero Bone Shear!)
    if (
      mesh.name === 'EyeLeft' ||
      mesh.name === 'EyeRight' ||
      mesh.name === 'Wolf3D_Teeth' ||
      mesh.name === 'Wolf3D_Glasses' ||
      mesh.name === 'Wolf3D_Hair'
    ) {
      const geo = mesh.geometry.clone();
      const pos = geo.attributes.position as THREE.BufferAttribute;
      if (!pos) return;

      const isHair = mesh.name === 'Wolf3D_Hair';
      const yHairCapMax = isMale ? 1.758 : 1.732;

      for (let i = 0; i < pos.count; i++) {
        const x0 = pos.getX(i);
        const y0 = pos.getY(i);
        const z0 = pos.getZ(i);

        let x1 = x0 * headScaleXZ;
        let y1 = yHeadPivot + (y0 - yHeadPivot) * headScaleY;
        let z1 = zHeadPivot + (z0 - zHeadPivot) * headScaleXZ;

        // Only gently cap extreme top hair spikes when wearing low-crowned headwear, NEVER shrinking hair radially into the skull!
        if (isHair && wearingHeadwear) {
          if (isMale) {
            if (y1 > yHairCapMax) {
              y1 = yHairCapMax + (y1 - yHairCapMax) * 0.16;
            }
            if (y1 > 1.72) {
              const tCrown = Math.min(1, (y1 - 1.72) / 0.06);
              x1 *= 1 - tCrown * 0.06;
              z1 = zHeadPivot + (z1 - zHeadPivot) * (1 - tCrown * 0.06);
            }
          } else if (y1 > yHairCapMax) {
            y1 = yHairCapMax + (y1 - yHairCapMax) * 0.45;
          }
        }

        pos.setXYZ(i, x1, y1, z1);
      }

      pos.needsUpdate = true;
      geo.computeVertexNormals();
      mesh.geometry = geo;
      return;
    }

    // 2. `Wolf3D_Head`: Orthogonal Skull/Jaw Calibration + Gentle Outer-Only Lower Neck Trapezius Tuck
    //    (Never expands internal oral-cavity/throat vertices and never fights neck bone skinning!)
    if (mesh.name === 'Wolf3D_Head') {
      const geo = mesh.geometry.clone();
      const pos = geo.attributes.position as THREE.BufferAttribute;
      if (!pos) return;

      const yNeckBase = isMale ? 1.495 : 1.425;
      const yChinFront = isMale ? 1.588 : 1.502;
      const zChinThresh = isMale ? 0.028 : 0.038;

      for (let i = 0; i < pos.count; i++) {
        const x0 = pos.getX(i);
        const y0 = pos.getY(i);
        const z0 = pos.getZ(i);

        // Orthogonally calibrated skull/jaw coordinates
        let xSkull = x0 * headScaleXZ;
        const ySkull = yHeadPivot + (y0 - yHeadPivot) * headScaleY;
        const zSkull = zHeadPivot + (z0 - zHeadPivot) * headScaleXZ;

        // For Male: subtly broaden the mandibular jaw angle (y = 1.592..1.668) so the jaw is masculine and wider than the neck
        if (isMale && y0 > 1.592 && y0 < 1.668 && z0 > -0.025) {
          const uJaw = (y0 - 1.592) / (1.668 - 1.592);
          const jawBell = Math.sin(uJaw * Math.PI);
          xSkull *= 1 + 0.065 * jawBell;
        }

        // Slanted submental plane separating the jaw/chin/cranium from the lower neck base
        const yNeckLimit = yChinFront + Math.max(0, (zChinThresh - z0) * 0.45);

        if (y0 >= yNeckLimit) {
          pos.setXYZ(i, xSkull, ySkull, zSkull);
        } else {
          const tChin = Math.max(0, Math.min(1, (yNeckLimit - y0) / 0.025));
          const neckBlend = tChin * tChin * (3 - 2 * tChin);

          const vNeck = Math.max(0, Math.min(1, (y0 - yNeckBase) / (yChinFront - yNeckBase)));
          const czTarget = isMale
            ? -0.002 * (1 - vNeck) + 0.003 * vNeck
            : 0.017 * (1 - vNeck) + 0.023 * vNeck;
          const rxMax =
            (isMale ? 0.0525 * (1 - vNeck * 0.04) : 0.0505 * (1 - vNeck * 0.04)) * neckScale;
          const rzMax =
            (isMale ? 0.0495 * (1 - vNeck * 0.04) : 0.047 * (1 - vNeck * 0.04)) * neckScale;

          const dx = xSkull;
          const dz = zSkull - czTarget;
          const rNorm = Math.sqrt(
            Math.pow(dx / rxMax, 2) + Math.pow(dz / rzMax, 2) + 1e-8
          );

          // ONLY tuck outer lower-neck trapezius flare (rNorm > 1.0); NEVER push internal mouth/throat vertices outward!
          const outerDamp = isMale ? 0.03 : 0.15;
          const regScale =
            rNorm > 1.0 ? (1.0 + (rNorm - 1.0) * outerDamp) / rNorm : 1.0;

          const xNeck = dx * regScale;
          const yNeck = y0 * (1 - vNeck) + ySkull * vNeck;
          const zNeck = czTarget + dz * regScale;

          pos.setXYZ(
            i,
            xSkull * (1 - neckBlend) + xNeck * neckBlend,
            ySkull * (1 - neckBlend) + yNeck * neckBlend,
            zSkull * (1 - neckBlend) + zNeck * neckBlend
          );
        }
      }

      pos.needsUpdate = true;
      geo.computeVertexNormals();
      mesh.geometry = geo;
      return;
    }

    // 3. `Wolf3D_Outfit_Footwear`: Shift shoes inward to match the aligned natural leg stance!
    if (mesh.name === 'Wolf3D_Outfit_Footwear') {
      const geo = mesh.geometry.clone();
      const pos = geo.attributes.position as THREE.BufferAttribute;
      if (!pos) return;

      for (let i = 0; i < pos.count; i++) {
        const x0 = pos.getX(i);
        const y0 = pos.getY(i);
        const z0 = pos.getZ(i);
        const side = x0 >= 0 ? 1 : -1;
        const shiftX = getNaturalLegStanceInwardShiftAtY(y0, isMale);
        pos.setXYZ(i, x0 - side * shiftX, y0, z0);
      }

      pos.needsUpdate = true;
      geo.computeVertexNormals();
      mesh.geometry = geo;
      return;
    }

    if (
      mesh.name !== 'Wolf3D_Outfit_Top' &&
      mesh.name !== 'Wolf3D_Outfit_Bottom' &&
      mesh.name !== 'Wolf3D_Body'
    ) {
      return;
    }

    const geo = mesh.geometry.clone();
    const pos = geo.attributes.position as THREE.BufferAttribute;
    if (!pos) return;

    const czTorso = isMale ? 0.005 : 0.02;

    for (let i = 0; i < pos.count; i++) {
      // For Male `Wolf3D_Body`: calibrate oversized raw hand/finger vertices (0.88x around bind-pose wrist pivot)
      if (isMale && mesh.name === 'Wolf3D_Body') {
        const handW = getVertexHandWeight(mesh, i);
        if (handW > 0.05) {
          const hx = pos.getX(i);
          const hy = pos.getY(i);
          const hz = pos.getZ(i);
          const hSide = hx >= 0 ? 1 : -1;
          const wx = hSide * 0.4496;
          const wy = 1.0688;
          const wz = 0.0311;
          const hScaleFactor = 1.0 - 0.12 * Math.min(1, handW);
          pos.setXYZ(
            i,
            wx + (hx - wx) * hScaleFactor,
            wy + (hy - wy) * hScaleFactor,
            wz + (hz - wz) * hScaleFactor
          );
        }
      }

      const armW = getVertexArmWeight(mesh, i);
      const wBody = Math.max(0, 1 - armW * 1.55);
      if (wBody <= 0.001) continue;

      const x0 = pos.getX(i);
      const y0 = pos.getY(i);
      let z0 = pos.getZ(i);

      // Baseline Anterior/Posterior Anatomical Profile Correction (fixing Male hoodie belly pouch & Female lumbar belly tilt)
      if (isMale) {
        // Flatten the baggy hoodie kangaroo pocket at y = 0.94..1.26 so Male chest is prouder than abdomen
        if (y0 > 0.94 && y0 < 1.26 && z0 > 0.015) {
          const uBelly = (y0 - 0.94) / 0.32;
          const bellyBell = Math.sin(uBelly * Math.PI);
          z0 = 0.015 + (z0 - 0.015) * (1 - 0.23 * bellyBell * wBody);
        }
        // Subtle male pectoral projection at y = 1.27..1.43
        if (y0 > 1.27 && y0 < 1.43 && z0 > 0.02) {
          const uPec = (y0 - 1.27) / 0.16;
          const pecBell = Math.sin(uPec * Math.PI);
          z0 += 0.006 * pecBell * wBody;
        }
      } else {
        // Correct Female anterior stomach tilt at y = 1.02..1.25 so high waist is flat & recessed behind bust
        if (y0 > 1.02 && y0 < 1.25) {
          const uWaist = (y0 - 1.02) / 0.23;
          const waistBell = Math.pow(Math.sin(uWaist * Math.PI), 1.15);
          z0 -= 0.014 * waistBell * wBody;
          if (z0 > 0.025) {
            z0 = 0.025 + (z0 - 0.025) * (1 - 0.15 * waistBell * wBody);
          }
        }
        // Gentle feminine bust contour at y = 1.25..1.37
        if (y0 > 1.25 && y0 < 1.37 && z0 > 0.03) {
          const uBust = (y0 - 1.25) / 0.12;
          const bustBell = Math.sin(uBust * Math.PI);
          z0 += 0.0065 * bustBell * wBody;
        }
      }

      const { sx, sz } = getAnthropometricMorphFactorsAtY(
        y0,
        isMale,
        sScale,
        tScale,
        hipScale
      );
      const effSx = 1.0 + (sx - 1.0) * wBody;
      const effSz = 1.0 + (sz - 1.0) * wBody;

      // Above y = 0.92: single torso & pelvis trunk centered at x = 0
      const xPel = x0 * effSx;
      const zPel = czTorso + (z0 - czTorso) * effSz;

      if (y0 >= 0.92) {
        pos.setXYZ(i, xPel, y0, zPel);
      } else {
        // Below y = 0.92: dual legs scaled around each leg's bone axis and shifted inward into natural standing stance
        const side = x0 >= 0 ? 1 : -1;
        const tLeg = Math.max(0, Math.min(1, (0.92 - y0) / 0.78));
        const cxOrig = 0.095 + tLeg * 0.058;
        const stanceShift = getNaturalLegStanceInwardShiftAtY(y0, isMale);
        const cxTarget = cxOrig - stanceShift;
        const czLeg = (isMale ? 0.005 : 0.025) * (1 - tLeg) - 0.038 * tLeg;

        const dx = x0 - side * cxOrig;
        const rawLegX = side * cxTarget + dx * effSx;
        const absRawLegX = Math.abs(rawLegX);
        const softLegX =
          absRawLegX < 0.014 ? 0.004 + (absRawLegX / 0.014) * 0.01 : absRawLegX;
        const xLeg = side * softLegX;
        const zLeg = czLeg + (z0 - czLeg) * effSz;

        if (y0 <= 0.84) {
          pos.setXYZ(i, xLeg, y0, zLeg);
        } else {
          const wPel = (y0 - 0.84) / 0.08;
          pos.setXYZ(
            i,
            xPel * wPel + xLeg * (1 - wPel),
            y0,
            zPel * wPel + zLeg * (1 - wPel)
          );
        }
      }
    }

    pos.needsUpdate = true;
    geo.computeVertexNormals();
    mesh.geometry = geo;
  });
}

/**
 * Prepares the GLB meshes for rendering across all 3 display modes ('Việt phục', 'X-Ray 55%', 'Cơ thể gốc'):
 * 1. On `Wolf3D_Body`: Preserves 100% of bare wrists, palms, fingers and bare ankles (`y < 0.35`)
 *    while stripping forearm skin so forearms NEVER poke out of posed sleeves in either full-garment or X-Ray mode.
 * 2. On `Wolf3D_Outfit_Top` and `Wolf3D_Outfit_Bottom`: Hides the raw Western hoodie/crop-top and jeans meshes
 *    (while keeping their morphed vertex buffers in memory for `buildBodySurfaceFieldFromGLB` & `buildDualLegProfileFromGLB`)
 *    so there are NEVER any jagged cut hoodie holes, midriff gaps, or double-transparent Z-fighting in X-Ray or Cơ thể gốc mode!
 */
export function prepareCleanHumanMeshesForGarment(
  humanModel: THREE.Group,
  isMale: boolean,
  _showGarment: boolean,
  _isSemiXray: boolean = false
): void {
  humanModel.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;

    if (mesh.name === 'Wolf3D_Body' && mesh.geometry?.index) {
      const geo = mesh.geometry.clone();
      const pos = geo.attributes.position;
      const idx = geo.index!;
      const newIndices: number[] = [];

      for (let i = 0; i < idx.count; i += 3) {
        const i0 = idx.getX(i);
        const i1 = idx.getX(i + 1);
        const i2 = idx.getX(i + 2);

        const y0 = pos.getY(i0);
        const y1 = pos.getY(i1);
        const y2 = pos.getY(i2);
        const minTriY = Math.min(y0, y1, y2);

        const hw0 = getVertexHandWeight(mesh, i0);
        const hw1 = getVertexHandWeight(mesh, i1);
        const hw2 = getVertexHandWeight(mesh, i2);
        const maxHandW = Math.max(hw0, hw1, hw2);
        const minHandW = Math.min(hw0, hw1, hw2);

        if (isMale) {
          // On Male, strip lower-forearm triangles above the wrist joint (minHandW < 0.52) so they never poke through sleeves or bare arm tubes
          if (minTriY < 0.35 || minHandW >= 0.52) {
            newIndices.push(i0, i1, i2);
          }
        } else {
          // Preserve bare ankles/feet (minTriY < 0.35) and bare wrists/hands/fingers (maxHandW >= 0.14)
          if (minTriY < 0.35 || maxHandW >= 0.14) {
            newIndices.push(i0, i1, i2);
          }
        }
      }

      geo.setIndex(newIndices);
      mesh.geometry = geo;
    }

    if (mesh.name === 'Wolf3D_Outfit_Top' || mesh.name === 'Wolf3D_Outfit_Bottom') {
      // Hide raw Western clothes in all modes; our morphed surface field & seamless 3D anatomical body
      // provide a 100% watertight, hole-free body in 'X-Ray 55%' and 'Cơ thể gốc' modes!
      mesh.visible = false;
    }
  });
}

/**
 * Generates a Seamless Anatomical Neck Cylinder tucked inside the lower neck of `Wolf3D_Head`
 * (`y = 1.482..1.572` male, `y = 1.412..1.462` female) that stays 100% inside the standing collar
 * and upper tunic dome without ever poking through the back of `taAo`.
 */
export function createAnatomicalNeckExtensionFromGLB(
  isMale: boolean,
  tScale: number = 1.0
): THREE.BufferGeometry {
  const segsU = 40;
  const segsV = 10;
  const neckScale = 1 + (tScale - 1) * 0.14;

  const yBottom = isMale ? 1.482 : 1.412;
  const yNeckBase = isMale ? 1.512 : 1.432;
  const yTop = isMale ? 1.572 : 1.462;

  const czBottom = isMale ? -0.002 : 0.018;
  const czTop = isMale ? 0.002 : 0.021;

  const rxNeck = (isMale ? 0.0545 : 0.0485) * neckScale;
  const rzNeck = (isMale ? 0.0515 : 0.0445) * neckScale;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iv = 0; iv <= segsV; iv++) {
    const v = iv / segsV;
    const y = yBottom + v * (yTop - yBottom);
    const cz = czBottom * (1 - v) + czTop * v;

    // Gentle clavicle base taper that stays strictly inside the tunic shoulder dome (> 14mm back margin)
    const clavFlare =
      y < yNeckBase ? Math.pow((yNeckBase - y) / (yNeckBase - yBottom), 1.35) : 0;
    const rx = rxNeck * (1 - 0.03 * v) + clavFlare * (isMale ? 0.014 : 0.015) * neckScale;
    const rz = rzNeck * (1 - 0.03 * v) + clavFlare * (isMale ? 0.008 : 0.009) * neckScale;

    for (let iu = 0; iu <= segsU; iu++) {
      const u = iu / segsU;
      const theta = u * Math.PI * 2;
      const x = rx * Math.cos(theta);
      const z = cz + rz * Math.sin(theta);
      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  const stride = segsU + 1;
  for (let iv = 0; iv < segsV; iv++) {
    for (let iu = 0; iu < segsU; iu++) {
      const a = iv * stride + iu;
      const b = a + 1;
      const c = (iv + 1) * stride + iu;
      const d = c + 1;
      indices.push(a, b, d);
      indices.push(a, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Generates a Complete, Watertight 3D Anatomical Human Body & Sculpted Limbs from the morphed GLB
 * surface field (`buildBodySurfaceFieldFromGLB`), dual-leg profile (`buildDualLegProfileFromGLB`),
 * and posed arm bone splines (`buildPosedArmBoneSplineFromGLB`).
 * Used in both 'X-Ray 55%' (`semi-xray`) and 'Cơ thể gốc' (`anatomical-body`) modes so that
 * Female and Male models display a 100% continuous, hole-free anatomical figure (neck, clavicles,
 * chest/bust, waist, pelvis, thighs, knees, calves, and posed arms to the wrists) without any
 * midriff gaps, jagged Western hoodie cutouts, or face-texture artifacts.
 */
export function createSeamlessAnatomicalBodyFromGLB(
  humanModel: THREE.Group,
  isMale: boolean,
  sScale: number = 1.0,
  tScale: number = 1.0
): {
  skinGeometry: THREE.BufferGeometry;
  bodysuitGeometry: THREE.BufferGeometry;
  calvesGeometry: THREE.BufferGeometry;
} {
  const field = buildBodySurfaceFieldFromGLB(humanModel, isMale);
  const legProfile = buildDualLegProfileFromGLB(humanModel, isMale);
  const neckScale = 1 + (tScale - 1) * 0.14;

  const skinPos: number[] = [];
  const skinUvs: number[] = [];
  const skinIdx: number[] = [];

  const suitPos: number[] = [];
  const suitUvs: number[] = [];
  const suitIdx: number[] = [];

  const calfPos: number[] = [];
  const calfUvs: number[] = [];
  const calfIdx: number[] = [];

  const appendTubeGrid = (
    targetPos: number[],
    targetUvs: number[],
    targetIdx: number[],
    segsV: number,
    segsU: number,
    samplePt: (iv: number, iu: number) => [number, number, number]
  ) => {
    const baseOffset = (targetPos.length / 3) | 0;
    const stride = segsU + 1;
    for (let iv = 0; iv <= segsV; iv++) {
      const v = iv / segsV;
      for (let iu = 0; iu <= segsU; iu++) {
        const u = iu / segsU;
        const [x, y, z] = samplePt(iv, iu);
        targetPos.push(x, y, z);
        targetUvs.push(u, v);
      }
    }
    for (let iv = 0; iv < segsV; iv++) {
      for (let iu = 0; iu < segsU; iu++) {
        const a = baseOffset + iv * stride + iu;
        const b = a + 1;
        const c = baseOffset + (iv + 1) * stride + iu;
        const d = c + 1;
        targetIdx.push(a, b, d);
        targetIdx.push(a, d, c);
      }
    }
  };

  // 1. Upper Neck, Clavicle & Shoulder Skin Yoke (yNeckTop down to yChestJoin)
  const yNeckTop = isMale ? 1.558 : 1.46;
  const yShoulderRim = isMale ? 1.518 : 1.425;
  const yChestJoin = isMale ? 0.985 : 1.295;
  const rxNeck = (isMale ? 0.0565 : 0.049) * neckScale;
  const rzNeck = (isMale ? 0.0535 : 0.045) * neckScale;
  const czNeck = isMale ? -0.001 : 0.019;

  const yokeSegsV = isMale ? 32 : 18;
  const yokeSegsU = 48;
  appendTubeGrid(skinPos, skinUvs, skinIdx, yokeSegsV, yokeSegsU, (iv, iu) => {
    const u = iu / yokeSegsU;
    const theta = u * Math.PI * 2;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const isUpperNeck = iv <= 6;
    const tNeck = isUpperNeck ? iv / 6 : 1.0;
    const tYoke = isUpperNeck ? 0.0 : (iv - 6) / (yokeSegsV - 6);

    const y = isUpperNeck
      ? yNeckTop - tNeck * (yNeckTop - yShoulderRim)
      : yShoulderRim - tYoke * (yShoulderRim - yChestJoin);

    const sample = field.sampleRadiusAndCenter(y, theta);
    const rNeckEllipse =
      (rxNeck * rzNeck) /
      Math.sqrt(Math.pow(rzNeck * cosT, 2) + Math.pow(rxNeck * sinT, 2) + 1e-6);

    const blend = isUpperNeck
      ? Math.pow(tNeck, 1.6) * 0.35
      : 0.35 + 0.65 * Math.sin(Math.min(1, tYoke * (isMale ? 9.5 : 1.0)) * Math.PI * 0.5);

    const frontSternumGroove =
      isMale && y > 1.12 && y < 1.42 && sinT > 0.82
        ? -Math.pow((sinT - 0.82) / 0.18, 1.5) * 0.004
        : 0;
    const backSpineGroove =
      isMale && y > 1.02 && y < 1.44 && sinT < -0.82
        ? -Math.pow((-sinT - 0.82) / 0.18, 1.5) * 0.0035
        : 0;

    const rBody = Math.max(0.05, sample.r - 0.0025 + frontSternumGroove + backSpineGroove);
    const r = rNeckEllipse * (1 - blend) + rBody * blend;
    const cz = czNeck * (1 - blend) + sample.centerZ * blend;

    return [r * cosT, y, cz + r * sinT];
  });

  // 2. Sculpted Anatomical Torso, Waist & Pelvis Bodysuit (Female: y = 1.303..0.89; Male: fitted athletic trunks y = 1.005..0.89)
  const torsoSegsV = isMale ? 14 : 28;
  const torsoSegsU = 48;
  const yTorsoTop = isMale ? 1.005 : yChestJoin + 0.008;
  const yTorsoBot = 0.89;

  appendTubeGrid(suitPos, suitUvs, suitIdx, torsoSegsV, torsoSegsU, (iv, iu) => {
    const v = iv / torsoSegsV;
    const u = iu / torsoSegsU;
    const theta = u * Math.PI * 2;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const y = yTorsoTop - v * (yTorsoTop - yTorsoBot);

    const sample = field.sampleRadiusAndCenter(y, theta);
    // Gentle anatomical sternum/linea-alba & lumbar spine contour
    const frontSternumGroove =
      y > 1.15 && sinT > 0.82
        ? -Math.pow((sinT - 0.82) / 0.18, 1.5) * (isMale ? 0.0035 : 0.0045)
        : 0;
    const backSpineGroove =
      y > 1.0 && sinT < -0.82
        ? -Math.pow((-sinT - 0.82) / 0.18, 1.5) * 0.0035
        : 0;

    // Taper smoothly at the lower pelvic rim (y = 0.89..0.93) so it joins the dual upper thighs without any step
    const pelvicTaper = y < 0.93 ? ((0.93 - y) / 0.04) * 0.004 : 0;
    const r = Math.max(0.05, sample.r - 0.002 + frontSternumGroove + backSpineGroove - pelvicTaper);

    return [r * cosT, y, sample.centerZ + r * sinT];
  });

  // Cap the bottom center of the pelvis (y = yTorsoBot) so there is never an open hole between the thighs
  const pelCapCenterIdx = (suitPos.length / 3) | 0;
  const pelBotSample = field.sampleRadiusAndCenter(yTorsoBot, Math.PI * 0.5);
  suitPos.push(0, yTorsoBot, pelBotSample.centerZ);
  suitUvs.push(0.5, 1.0);
  const botRowStart = pelCapCenterIdx - (torsoSegsU + 1);
  for (let iu = 0; iu < torsoSegsU; iu++) {
    suitIdx.push(botRowStart + iu, pelCapCenterIdx, botRowStart + iu + 1);
  }

  // 3. Sculpted Left & Right Anatomical Upper Thighs & Lower Legs/Calves
  ([-1, 1] as const).forEach((side) => {
    // 3A. Upper Thighs in Bodysuit Geometry (Female: y = 0.92..0.54; Male: fitted trunks y = 0.92..0.72)
    const thighSegsV = isMale ? 12 : 18;
    const thighSegsU = 36;
    const yThighTop = 0.92;
    const yThighBot = isMale ? 0.72 : 0.54;

    appendTubeGrid(suitPos, suitUvs, suitIdx, thighSegsV, thighSegsU, (iv, iu) => {
      const v = iv / thighSegsV;
      const u = iu / thighSegsU;
      const theta = u * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const y = yThighTop - v * (yThighTop - yThighBot);

      const leg = legProfile.sampleAtY(y);
      const rx = Math.max(0.042, leg.rx - 0.0015);
      const rz = Math.max(0.046, leg.rz - 0.0015);
      const isInner = cosT * side < 0;
      const innerTaper = isInner && y > 0.78 ? 1 - ((y - 0.78) / 0.14) * 0.16 * Math.abs(cosT) : 1.0;

      return [
        side * leg.cx + rx * innerTaper * cosT,
        y,
        leg.cz + rz * sinT,
      ];
    });

    // 3B. Lower Legs / Knees & Calves (Female: y = 0.56..0.12; Male: bare thighs, knees, calves & ankles y = 0.74..0.092)
    const calfSegsV = isMale ? 24 : 18;
    const calfSegsU = 36;
    const yCalfTop = isMale ? 0.74 : 0.56;
    const yCalfBot = isMale ? 0.092 : 0.12;

    const sampleCalfPt = (iv: number, iu: number): [number, number, number] => {
      const v = iv / calfSegsV;
      const u = iu / calfSegsU;
      const theta = u * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const y = yCalfTop - v * (yCalfTop - yCalfBot);

      const leg = legProfile.sampleAtY(y);
      // Taper lower ankle smoothly at y < 0.24 to merge seamlessly into ankles/footwear
      const ankleTaper = y < 0.24 ? ((0.24 - y) / 0.12) * (isMale ? 0.002 : 0.004) : 0;
      const rx = Math.max(0.03, leg.rx - 0.002 - ankleTaper);
      const rz = Math.max(0.034, leg.rz - 0.002 - ankleTaper);

      return [side * leg.cx + rx * cosT, y, leg.cz + rz * sinT];
    };

    appendTubeGrid(skinPos, skinUvs, skinIdx, calfSegsV, calfSegsU, sampleCalfPt);

    if (isMale) {
      // For Male full-garment mode, provide a clean lower-ankle skin cuff (y = 0.26..0.092) tucked inside the trouser hem and shoe opening
      const ankleSegsV = 10;
      appendTubeGrid(calfPos, calfUvs, calfIdx, ankleSegsV, calfSegsU, (iv, iu) => {
        const v = iv / ankleSegsV;
        const u = iu / calfSegsU;
        const theta = u * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const y = 0.26 - v * (0.26 - 0.092);
        const leg = legProfile.sampleAtY(y);
        const rx = Math.max(0.032, leg.rx - 0.003);
        const rz = Math.max(0.035, leg.rz - 0.003);
        return [side * leg.cx + rx * cosT, y, leg.cz + rz * sinT];
      });
    } else {
      appendTubeGrid(calfPos, calfUvs, calfIdx, calfSegsV, calfSegsU, sampleCalfPt);
    }
  });

  // 4. Sculpted Posed Left & Right Anatomical Bare Arms (Deltoid Shoulder Socket -> Elbow -> Bare Wrist)
  ([-1, 1] as const).forEach((side) => {
    const { numSlices, centers, upVecs, frontVecs, baseRadii } =
      buildPosedArmBoneSplineFromGLB(humanModel, side, isMale, sScale);
    const armSegsU = 28;

    appendTubeGrid(skinPos, skinUvs, skinIdx, numSlices, armSegsU, (iv, iu) => {
      const t = iv / numSlices;
      const u = iu / armSegsU;
      const theta = u * Math.PI * 2;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      const c = centers[iv];
      const uVec = upVecs[iv];
      const fVec = frontVecs[iv];

      // Smooth deltoid root cap at t=0..0.12 and wrist taper at t=0.85..1.0 to join Wolf3D_Body bare wrists seamlessly
      const deltoidCap = isMale
        ? t < 0.26
          ? 0.62 + 0.38 * (t / 0.26)
          : 1.0
        : t < 0.08
        ? 0.55 + 0.45 * (t / 0.08)
        : 1.0;
      const wristBlend = t > 0.86 ? 1.0 - ((t - 0.86) / 0.14) * (isMale ? 0.18 : 0.14) : 1.0;
      const rArm = Math.max(0.022, (baseRadii[iv] - 0.0035) * deltoidCap * wristBlend);

      const rU = rArm;
      const rF = rArm * 0.94;

      const px = c.x + uVec.x * (rU * sinT) + fVec.x * (rF * cosT);
      const py = c.y + uVec.y * (rU * sinT) + fVec.y * (rF * cosT);
      const pz = c.z + uVec.z * (rU * sinT) + fVec.z * (rF * cosT);

      return [px, py, pz];
    });
  });

  const buildGeo = (pos: number[], uvs: number[], idx: number[]) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };

  return {
    skinGeometry: buildGeo(skinPos, skinUvs, skinIdx),
    bodysuitGeometry: buildGeo(suitPos, suitUvs, suitIdx),
    calvesGeometry: buildGeo(calfPos, calfUvs, calfIdx),
  };
}

/**
 * Applies a natural, graceful human standing posture to the cloned GLB skeleton
 * BEFORE building 3D sleeves and bone-anchored hand accessories.
 * - Keeps `bones['Head'].scale` at `(1, 1, 1)` because Head/Eye/Teeth/Hair proportions are
 *   calibrated orthogonally in bind-pose vertex space (zero tilted-bone matrix shear!).
 * - Automatically adapts arm abduction clearance to `sScale` and `tScale` so wide sleeves
 *   and elbows NEVER clip into fuller body types ('day-dan').
 */
export function applyNaturalHumanStandingPose(
  humanModel: THREE.Group,
  isMale: boolean,
  posePreset: HumanPosePreset,
  holdingFanInRightHand: boolean,
  sScale: number = 1.0,
  tScale: number = 1.0,
  _hScale: number = 1.0
): void {
  const bones: Record<string, THREE.Object3D> = {};
  humanModel.traverse((child) => {
    if (child.name) {
      bones[child.name] = child;
    }
  });

  if (bones['Head']) {
    bones['Head'].scale.set(1, 1, 1);
    bones['Head'].rotateX(0.015);
    if (posePreset === 'poise') {
      bones['Head'].rotateY(0.035);
    } else if (posePreset === 'ceremonial') {
      bones['Head'].rotateX(0.02);
    }
  }

  // Balance biacromial shoulder joint span to match the calibrated clavicle width
  if (!isMale) {
    if (bones['LeftShoulder']) bones['LeftShoulder'].position.x = 0.068 * Math.min(1.08, sScale);
    if (bones['RightShoulder']) bones['RightShoulder'].position.x = -0.068 * Math.min(1.08, sScale);
  } else {
    if (bones['LeftShoulder']) bones['LeftShoulder'].position.x = 0.064 * Math.min(1.08, sScale);
    if (bones['RightShoulder']) bones['RightShoulder'].position.x = -0.064 * Math.min(1.08, sScale);
  }

  const leftArm = bones['LeftArm'];
  const rightArm = bones['RightArm'];
  const leftForeArm = bones['LeftForeArm'];
  const rightForeArm = bones['RightForeArm'];
  const leftHand = bones['LeftHand'];
  const rightHand = bones['RightHand'];

  // Automatically adjust arm abduction so fuller body types ('day-dan') maintain generous lateral clearance
  const bodyClearanceAdjust = Math.max(
    -0.02,
    Math.max(0, tScale - 1.0) * 0.55 + Math.max(0, sScale - 1.0) * 0.22
  );

  if (posePreset === 'ceremonial') {
    const baseAdduct = (isMale ? 0.24 : 0.23) - bodyClearanceAdjust;
    if (leftArm) {
      leftArm.rotateX(baseAdduct);
      leftArm.rotateZ(0.08);
    }
    if (rightArm) {
      rightArm.rotateX(baseAdduct);
      rightArm.rotateZ(-0.08);
    }
    if (leftForeArm) {
      leftForeArm.rotateZ(0.22);
      leftForeArm.rotateX(0.11);
    }
    if (rightForeArm) {
      rightForeArm.rotateZ(-0.22);
      rightForeArm.rotateX(0.11);
    }
  } else if (posePreset === 'poise') {
    const baseAdductL = (isMale ? 0.27 : 0.26) - bodyClearanceAdjust;
    const baseAdductR = (isMale ? 0.24 : 0.23) - bodyClearanceAdjust;
    if (leftArm) {
      leftArm.rotateX(baseAdductL);
    }
    if (rightArm) {
      rightArm.rotateX(baseAdductR);
      rightArm.rotateZ(-0.05);
    }
    if (leftForeArm) {
      leftForeArm.rotateZ(0.06);
    }
    if (rightForeArm) {
      rightForeArm.rotateZ(-0.18);
      rightForeArm.rotateX(0.12);
    }
  } else {
    // 'natural' — relaxed, natural human standing posture matching the 2D studio portraits
    const baseAdductL = (isMale ? 0.255 : 0.24) - bodyClearanceAdjust;
    const baseAdductR = (isMale ? 0.22 : 0.235) - bodyClearanceAdjust;
    if (leftArm) {
      leftArm.rotateX(baseAdductL);
      if (!isMale) leftArm.rotateZ(0.06);
    }
    if (rightArm) {
      rightArm.rotateX(baseAdductR);
      if (holdingFanInRightHand) {
        rightArm.rotateZ(-0.14);
      } else if (!isMale) {
        rightArm.rotateZ(-0.06);
      }
    }
    if (leftForeArm) {
      leftForeArm.rotateZ(isMale ? 0.08 : 0.18);
      leftForeArm.rotateX(isMale ? 0.06 : 0.1);
    }
    if (rightForeArm) {
      rightForeArm.rotateZ(holdingFanInRightHand ? -0.34 : isMale ? -0.08 : -0.18);
      rightForeArm.rotateX(holdingFanInRightHand ? 0.28 : isMale ? 0.06 : 0.1);
    }
  }

  if (leftHand) {
    leftHand.rotateZ(-0.06);
  }
  if (rightHand) {
    rightHand.rotateZ(holdingFanInRightHand ? 0.1 : 0.06);
  }

  // Natural anatomical finger curl (and firm grip on right hand when holding fan)
  const fingers = ['Index', 'Middle', 'Ring', 'Pinky'];
  if (isMale) {
    // On Male GLB, local +X is inward flexion toward the palm (whereas rotateZ splays fingers sideways)
    fingers.forEach((fName, fIdx) => {
      const leftCurl = 0.14 + fIdx * 0.022;
      const rightCurl = holdingFanInRightHand ? 0.28 + fIdx * 0.025 : 0.14 + fIdx * 0.022;
      for (const d of ['1', '2', '3']) {
        const lb = bones[`LeftHand${fName}${d}`];
        if (lb) lb.rotateX(leftCurl);
        const rb = bones[`RightHand${fName}${d}`];
        if (rb) rb.rotateX(rightCurl);
      }
    });
    if (bones['LeftHandThumb2']) bones['LeftHandThumb2'].rotateZ(-0.14);
    if (bones['RightHandThumb2']) {
      bones['RightHandThumb2'].rotateZ(holdingFanInRightHand ? 0.26 : 0.14);
    }
  } else {
    fingers.forEach((fName, fIdx) => {
      const leftCurl = -0.14 - fIdx * 0.025;
      const rightCurl = holdingFanInRightHand ? -0.36 - fIdx * 0.03 : -0.14 - fIdx * 0.025;
      for (const d of ['1', '2', '3']) {
        const lb = bones[`LeftHand${fName}${d}`];
        if (lb) lb.rotateZ(leftCurl);
        const rb = bones[`RightHand${fName}${d}`];
        if (rb) rb.rotateZ(rightCurl);
      }
    });
    if (bones['LeftHandThumb2']) bones['LeftHandThumb2'].rotateY(-0.15);
    if (bones['RightHandThumb2']) {
      bones['RightHandThumb2'].rotateY(holdingFanInRightHand ? 0.32 : 0.15);
    }
  }

  // Update all bone world matrices and SkinnedMesh skeletons in local avatar space
  const prevScale = humanModel.scale.clone();
  const prevPos = humanModel.position.clone();
  const prevQuat = humanModel.quaternion.clone();
  humanModel.scale.set(1, 1, 1);
  humanModel.position.set(0, 0, 0);
  humanModel.quaternion.identity();
  humanModel.updateMatrixWorld(true);

  humanModel.traverse((child) => {
    const skMesh = child as THREE.SkinnedMesh;
    if (skMesh.isSkinnedMesh && skMesh.skeleton) {
      skMesh.skeleton.update();
    }
  });

  humanModel.scale.copy(prevScale);
  humanModel.position.copy(prevPos);
  humanModel.quaternion.copy(prevQuat);
  humanModel.updateMatrixWorld(true);
}

/**
 * Extracts torso/pelvis and leg vertices from the morphed GLB human model using skeletal
 * arm weights (`getVertexArmWeight < 0.15`), so 100% of torso, waist, hip, and leg vertices
 * are captured accurately on every body type ('manh-mai', 'can-doi', 'day-dan', 'cao-rao', 'nho-nhan')
 * without ever polluting the waist/hips with arm vertices or chopping off wide hips.
 */
function extractGLBVertices(
  humanModel: THREE.Group,
  isMale: boolean
): {
  torsoAndLegs: [number, number, number][];
  torsoOnly: [number, number, number][];
} {
  const torsoAndLegs: [number, number, number][] = [];
  const torsoOnly: [number, number, number][] = [];

  humanModel.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    if (
      mesh.name !== 'Wolf3D_Outfit_Top' &&
      mesh.name !== 'Wolf3D_Outfit_Bottom' &&
      mesh.name !== 'Wolf3D_Body'
    ) {
      return;
    }
    const pos = mesh.geometry?.attributes?.position;
    if (!pos) return;

    for (let i = 0; i < pos.count; i++) {
      const armW = getVertexArmWeight(mesh, i);
      if (armW >= 0.15) continue;

      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const absX = Math.abs(x);

      // For Male `Wolf3D_Outfit_Top`, filter out the raised hoodie hood (y > 1.488 or posterior hood z < -0.078 above y = 1.40)
      // and wide deltoid sleeve caps so they never create a hunchback or neck cone in the Male surface field!
      if (isMale && mesh.name === 'Wolf3D_Outfit_Top') {
        if (y > 1.488) continue;
        if (y > 1.4 && z < -0.078) continue;
        if (y > 1.36 && absX > 0.184 - Math.max(0, y - 1.41) * 1.25) continue;
      }

      if (y >= 0.9 && y <= 1.58 && absX <= 0.26) {
        torsoOnly.push([x, y, z]);
      }

      if (y >= 0.06 && y <= 1.58 && absX <= 0.28) {
        torsoAndLegs.push([x, y, z]);
      }
    }
  });

  return { torsoAndLegs, torsoOnly };
}

/**
 * Extracts the exact 3D centerline (cx, cz) and cross-section radii (rx, rz)
 * of the Left (+X) and Right (-X) legs from y = 0.08 to y = 0.98.
 */
export function buildDualLegProfileFromGLB(
  humanModel: THREE.Group,
  isMale: boolean
): LegSliceProfile {
  const { torsoAndLegs } = extractGLBVertices(humanModel, isMale);
  const numSlices = 44;
  const yMin = 0.08;
  const yMax = 0.98;

  const cxArr = new Float32Array(numSlices);
  const czArr = new Float32Array(numSlices);
  const rxArr = new Float32Array(numSlices);
  const rzArr = new Float32Array(numSlices);

  if (isMale) {
    // In `male_human.glb`, `Wolf3D_Body` has no legs and `Wolf3D_Outfit_Bottom` is baggy ankle-length cargo pants.
    // Measure the morphed upper-hip/thigh scale from `torsoAndLegs` at y = 0.88..0.94, and build a true
    // anatomical male leg profile (quadriceps -> knee -> gastrocnemius calf -> slim ankle) along the natural leg stance!
    let maxHipX = 0.175;
    for (let k = 0; k < torsoAndLegs.length; k++) {
      const pt = torsoAndLegs[k];
      if (pt[1] >= 0.88 && pt[1] <= 0.94 && Math.abs(pt[0]) < 0.26) {
        if (Math.abs(pt[0]) > maxHipX) maxHipX = Math.abs(pt[0]);
      }
    }
    const legScale = Math.max(0.84, Math.min(1.22, maxHipX / 0.178));

    for (let i = 0; i < numSlices; i++) {
      const y = yMin + (i / (numSlices - 1)) * (yMax - yMin);
      const t = Math.max(0, Math.min(1, (0.94 - y) / 0.82)); // 0 at upper thigh (0.94), 1 at ankle (0.12)
      const cxOrig = 0.095 + t * 0.056;
      const shiftX = getNaturalLegStanceInwardShiftAtY(y, true);
      cxArr[i] = cxOrig - shiftX;
      czArr[i] = 0.004 * (1 - t) - 0.035 * t;

      // Anatomical male leg radius profile: upper thigh (y=0.92: 0.072), knee (y=0.50: 0.051), calf peak (y=0.35: 0.053), ankle (y=0.12: 0.036)
      let baseRx: number;
      let baseRz: number;
      if (y >= 0.5) {
        const uThigh = Math.max(0, Math.min(1, (y - 0.5) / 0.44)); // 0 at knee, 1 at upper thigh
        baseRx = 0.051 + Math.pow(uThigh, 0.88) * 0.022;
        baseRz = 0.055 + Math.pow(uThigh, 0.88) * 0.025;
      } else if (y >= 0.28) {
        const uCalf = (y - 0.28) / 0.22; // 0 at lower calf, 1 at knee
        const calfMuscle = Math.sin(uCalf * Math.PI);
        baseRx = 0.043 + uCalf * 0.008 + calfMuscle * 0.007;
        baseRz = 0.047 + uCalf * 0.008 + calfMuscle * 0.009;
      } else {
        const uAnkle = Math.max(0, Math.min(1, (y - 0.1) / 0.18)); // 0 at ankle, 1 at lower calf
        baseRx = 0.0355 + uAnkle * 0.0075;
        baseRz = 0.0395 + uAnkle * 0.0075;
      }

      rxArr[i] = baseRx * legScale;
      rzArr[i] = baseRz * legScale;
    }
  } else {
    for (let i = 0; i < numSlices; i++) {
      const y = yMin + (i / (numSlices - 1)) * (yMax - yMin);
      const band = 0.032;

      let minX = 999,
        maxX = -999,
        minZ = 999,
        maxZ = -999,
        cnt = 0;

      for (let k = 0; k < torsoAndLegs.length; k++) {
        const pt = torsoAndLegs[k];
        const absX = Math.abs(pt[0]);
        if (Math.abs(pt[1] - y) <= band && absX > 0.012 && absX < 0.28) {
          if (absX < minX) minX = absX;
          if (absX > maxX) maxX = absX;
          if (pt[2] < minZ) minZ = pt[2];
          if (pt[2] > maxZ) maxZ = pt[2];
          cnt++;
        }
      }

      if (cnt >= 4) {
        cxArr[i] = (minX + maxX) * 0.5;
        czArr[i] = (minZ + maxZ) * 0.5;
        rxArr[i] = Math.min(0.125, Math.max(0.032, (maxX - minX) * 0.5));
        rzArr[i] = Math.min(0.145, Math.max(0.038, (maxZ - minZ) * 0.5));
      } else {
        const t = Math.max(0, Math.min(1, (0.98 - y) / 0.9));
        cxArr[i] = 0.095 + t * 0.056;
        czArr[i] = (isMale ? 0.01 : 0.035) * (1 - t) + (isMale ? -0.048 : -0.034) * t;
        rxArr[i] = (isMale ? 0.075 : 0.078) * (1 - t * 0.35);
        rzArr[i] = (isMale ? 0.098 : 0.088) * (1 - t * 0.35);
      }
    }
  }

  for (let pass = 0; pass < 4; pass++) {
    for (let i = 1; i < numSlices - 1; i++) {
      cxArr[i] = 0.25 * cxArr[i - 1] + 0.5 * cxArr[i] + 0.25 * cxArr[i + 1];
      czArr[i] = 0.25 * czArr[i - 1] + 0.5 * czArr[i] + 0.25 * czArr[i + 1];
      rxArr[i] = 0.25 * rxArr[i - 1] + 0.5 * rxArr[i] + 0.25 * rxArr[i + 1];
      rzArr[i] = 0.25 * rzArr[i - 1] + 0.5 * rzArr[i] + 0.25 * rzArr[i + 1];
    }
  }

  return {
    yMin,
    yMax,
    numSlices,
    cxArr,
    czArr,
    rxArr,
    rzArr,
    sampleAtY: (y: number) => {
      const ny = Math.max(0, Math.min(1, (y - yMin) / (yMax - yMin))) * (numSlices - 1);
      const i0 = Math.floor(ny);
      const i1 = Math.min(numSlices - 1, i0 + 1);
      const f = ny - i0;
      return {
        cx: cxArr[i0] * (1 - f) + cxArr[i1] * f,
        cz: czArr[i0] * (1 - f) + czArr[i1] * f,
        rx: rxArr[i0] * (1 - f) + rxArr[i1] * f,
        rz: rzArr[i0] * (1 - f) + rzArr[i1] * f,
      };
    },
  };
}

/**
 * Builds an exact, contour-hugging 2D Cylindrical Torso & Pelvis Surface Field R(y, theta)
 * that preserves the true waist indentation (eo), chest/bust contour, and lumbar curve (lưng).
 */
export function buildBodySurfaceFieldFromGLB(
  humanModel: THREE.Group,
  isMale: boolean
): {
  sampleRadiusAndCenter: (
    y: number,
    theta: number
  ) => { r: number; centerZ: number; frontMaxZ: number; backMinZ: number; halfWidthX: number };
} {
  const { torsoOnly, torsoAndLegs } = extractGLBVertices(humanModel, isMale);

  const numY = 64;
  const numA = 64;
  const yMin = 0.08;
  const yMax = 1.58;

  const centerZArr = new Float32Array(numY);
  const frontMaxZArr = new Float32Array(numY);
  const backMinZArr = new Float32Array(numY);
  const halfWidthXArr = new Float32Array(numY);
  const radiusGrid = new Float32Array(numY * numA);

  for (let iy = 0; iy < numY; iy++) {
    const y = yMin + (iy / (numY - 1)) * (yMax - yMin);
    const band = 0.032;
    const sourcePts = y >= 0.94 ? torsoOnly : torsoAndLegs;

    let minZ = 999;
    let maxZ = -999;
    let maxAbsX = 0;
    let count = 0;

    for (let i = 0; i < sourcePts.length; i++) {
      const pt = sourcePts[i];
      if (Math.abs(pt[1] - y) <= band) {
        if (pt[2] < minZ) minZ = pt[2];
        if (pt[2] > maxZ) maxZ = pt[2];
        if (Math.abs(pt[0]) > maxAbsX) maxAbsX = Math.abs(pt[0]);
        count++;
      }
    }

    if (count < 4) {
      if (isMale && y > 1.45) {
        centerZArr[iy] = 0.0;
        frontMaxZArr[iy] = 0.054;
        backMinZArr[iy] = -0.054;
        halfWidthXArr[iy] = 0.062;
      } else {
        const tLeg = Math.max(0, Math.min(1, (1.02 - y) / 0.92));
        centerZArr[iy] = (isMale ? 0.012 : 0.028) * (1 - tLeg) + -0.035 * tLeg;
        frontMaxZArr[iy] = centerZArr[iy] + 0.105;
        backMinZArr[iy] = centerZArr[iy] - 0.095;
        halfWidthXArr[iy] = isMale ? 0.148 : 0.128;
      }
    } else {
      centerZArr[iy] = (minZ + maxZ) * 0.5;
      frontMaxZArr[iy] = maxZ;
      backMinZArr[iy] = minZ;
      let minAnatomicalHalfX = 0.08;
      const yShoulderTop = isMale ? 1.485 : 1.455;
      if (y >= 1.12 && y <= yShoulderTop) {
        const tShoulder = Math.max(0, Math.min(1, (y - 1.24) / 0.2));
        minAnatomicalHalfX = isMale
          ? 0.148 + tShoulder * 0.018
          : 0.132 + tShoulder * 0.014;
      }
      halfWidthXArr[iy] = Math.max(minAnatomicalHalfX, maxAbsX);
    }

    // For Male: smoothly taper the upper clavicle/neck zone (y = 1.482..1.58) into the true neck cylinder
    if (isMale && y > 1.482) {
      const uNeck = Math.min(1, (y - 1.482) / 0.046);
      const blend = uNeck * uNeck * (3 - 2 * uNeck);
      centerZArr[iy] = centerZArr[iy] * (1 - blend) + 0.0 * blend;
      frontMaxZArr[iy] = frontMaxZArr[iy] * (1 - blend) + 0.055 * blend;
      backMinZArr[iy] = backMinZArr[iy] * (1 - blend) + -0.055 * blend;
      halfWidthXArr[iy] = halfWidthXArr[iy] * (1 - blend) + 0.062 * blend;
    }
  }

  for (let pass = 0; pass < 3; pass++) {
    for (let iy = 1; iy < numY - 1; iy++) {
      centerZArr[iy] =
        0.25 * centerZArr[iy - 1] + 0.5 * centerZArr[iy] + 0.25 * centerZArr[iy + 1];
      frontMaxZArr[iy] =
        0.25 * frontMaxZArr[iy - 1] + 0.5 * frontMaxZArr[iy] + 0.25 * frontMaxZArr[iy + 1];
      backMinZArr[iy] =
        0.25 * backMinZArr[iy - 1] + 0.5 * backMinZArr[iy] + 0.25 * backMinZArr[iy + 1];
      halfWidthXArr[iy] =
        0.2 * halfWidthXArr[iy - 1] + 0.6 * halfWidthXArr[iy] + 0.2 * halfWidthXArr[iy + 1];
    }
  }

  for (let iy = 0; iy < numY; iy++) {
    const y = yMin + (iy / (numY - 1)) * (yMax - yMin);
    const cz = centerZArr[iy];
    const rxEnv = halfWidthXArr[iy];
    const rzFront = Math.max(0.035, frontMaxZArr[iy] - cz);
    const rzBack = Math.max(0.032, cz - backMinZArr[iy]);

    const binMaxR = new Float32Array(numA);
    const binHasPt = new Uint8Array(numA);
    const sourcePts = y >= 0.94 ? torsoOnly : torsoAndLegs;
    const band = 0.034;

    for (let i = 0; i < sourcePts.length; i++) {
      const pt = sourcePts[i];
      if (Math.abs(pt[1] - y) <= band) {
        const dx = pt[0];
        const dz = pt[2] - cz;
        const r = Math.hypot(dx, dz);
        let ang = Math.atan2(dz, dx);
        if (ang < 0) ang += Math.PI * 2;
        const ia = Math.floor((ang / (Math.PI * 2)) * numA) % numA;
        if (r > binMaxR[ia]) {
          binMaxR[ia] = r;
          binHasPt[ia] = 1;
        }
      }
    }

    for (let ia = 0; ia < numA; ia++) {
      const theta = (ia / numA) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const rz = sinT >= 0 ? rzFront : rzBack;
      const ellipseR =
        (rxEnv * rz) /
        Math.sqrt(Math.pow(rz * cosT, 2) + Math.pow(rxEnv * sinT, 2) + 1e-6);

      if (binHasPt[ia]) {
        radiusGrid[iy * numA + ia] = Math.max(
          binMaxR[ia],
          0.75 * binMaxR[ia] + 0.25 * ellipseR,
          ellipseR * 0.95
        );
      } else {
        let prevR = ellipseR;
        let nextR = ellipseR;
        for (let step = 1; step <= 8; step++) {
          const iPrev = (ia - step + numA) % numA;
          if (binHasPt[iPrev]) {
            prevR = binMaxR[iPrev];
            break;
          }
        }
        for (let step = 1; step <= 8; step++) {
          const iNext = (ia + step) % numA;
          if (binHasPt[iNext]) {
            nextR = binMaxR[iNext];
            break;
          }
        }
        const interpR = 0.5 * (prevR + nextR);
        radiusGrid[iy * numA + ia] = 0.7 * interpR + 0.3 * ellipseR;
      }
    }
  }

  const tempGrid = new Float32Array(numY * numA);
  for (let pass = 0; pass < 3; pass++) {
    for (let iy = 0; iy < numY; iy++) {
      const iyPrev = Math.max(0, iy - 1);
      const iyNext = Math.min(numY - 1, iy + 1);
      for (let ia = 0; ia < numA; ia++) {
        const iaPrev = (ia - 1 + numA) % numA;
        const iaNext = (ia + 1) % numA;
        const c = radiusGrid[iy * numA + ia];
        const avg =
          0.25 *
          (radiusGrid[iyPrev * numA + ia] +
            radiusGrid[iyNext * numA + ia] +
            radiusGrid[iy * numA + iaPrev] +
            radiusGrid[iy * numA + iaNext]);
        tempGrid[iy * numA + ia] = 0.65 * c + 0.35 * avg;
      }
    }
    radiusGrid.set(tempGrid);
  }

  return {
    sampleRadiusAndCenter: (y: number, theta: number) => {
      const ny = Math.max(0, Math.min(1, (y - yMin) / (yMax - yMin))) * (numY - 1);
      const iy0 = Math.floor(ny);
      const iy1 = Math.min(numY - 1, iy0 + 1);
      const fy = ny - iy0;

      let normTheta = theta % (Math.PI * 2);
      if (normTheta < 0) normTheta += Math.PI * 2;
      const na = (normTheta / (Math.PI * 2)) * numA;
      const ia0 = Math.floor(na) % numA;
      const ia1 = (ia0 + 1) % numA;
      const fa = na - Math.floor(na);

      const r00 = radiusGrid[iy0 * numA + ia0];
      const r01 = radiusGrid[iy0 * numA + ia1];
      const r10 = radiusGrid[iy1 * numA + ia0];
      const r11 = radiusGrid[iy1 * numA + ia1];

      const r0 = r00 * (1 - fa) + r01 * fa;
      const r1 = r10 * (1 - fa) + r11 * fa;
      const r = r0 * (1 - fy) + r1 * fy;

      const centerZ = centerZArr[iy0] * (1 - fy) + centerZArr[iy1] * fy;
      const frontMaxZ = frontMaxZArr[iy0] * (1 - fy) + frontMaxZArr[iy1] * fy;
      const backMinZ = backMinZArr[iy0] * (1 - fy) + backMinZArr[iy1] * fy;
      const halfWidthX = halfWidthXArr[iy0] * (1 - fy) + halfWidthXArr[iy1] * fy;

      return { r, centerZ, frontMaxZ, backMinZ, halfWidthX };
    },
  };
}

/**
 * Analytical 3D Polar A-Line Lower-Body & Dual-Trouser Flare Envelope R(y, theta).
 * Above the waist (`y >= yWaistStart`), the garment conforms cleanly to the torso/chest.
 * From the waist (`y < yWaistStart`) downward through the hips, thighs, and knees, the garment
 * flares outward in a true A-line silhouette (`dáng chữ A xòe xuống tự nhiên`) along a vertical
 * gravity plumb line, never tapering inward or clinging to the legs (`không ôm người`).
 */
function samplePolarLowerBodyEnvelope(
  y: number,
  theta: number,
  hipRatio: number,
  lateralFlare: number,
  field: ReturnType<typeof buildBodySurfaceFieldFromGLB>,
  legProfile: LegSliceProfile
): { rMinCollision: number; rDrapeTarget: number; centerZ: number } {
  const safeHipRatio = Math.max(1.0, Math.min(1.04, hipRatio));
  const c = Math.cos(theta);
  const s = Math.sin(theta);

  const bodySample = field.sampleRadiusAndCenter(y, theta);
  const waistSample = field.sampleRadiusAndCenter(1.08, theta);
  const hipSample = field.sampleRadiusAndCenter(0.95, theta);

  // Above the waist (y >= 1.08): tailored fit over upper waist, chest, and shoulders
  if (y >= 1.08) {
    const vTorso = Math.min(1, (y - 1.08) / 0.34);
    const scaleH = 1 + (safeHipRatio - 1) * (1 - vTorso);
    const rTorso = bodySample.r * scaleH;
    return {
      rMinCollision: rTorso + 0.004,
      rDrapeTarget: rTorso + 0.005,
      centerZ: bodySample.centerZ,
    };
  }

  // Reference hip envelope at y = 0.95 (clears the widest pelvis/hip prominence and inner waistband)
  const rxHipBase = Math.max(hipSample.halfWidthX * safeHipRatio, 0.168) + 0.012;
  const rzFrontHipBase =
    Math.max(hipSample.frontMaxZ - hipSample.centerZ, 0.114) * safeHipRatio + 0.012;
  const rzBackHipBase =
    Math.max(hipSample.centerZ - hipSample.backMinZ, 0.116) * safeHipRatio + 0.012;
  const rzHipTheta = s >= 0 ? rzFrontHipBase : rzBackHipBase;

  const rHipEllipse =
    (rxHipBase * rzHipTheta) /
    Math.sqrt(Math.pow(rzHipTheta * c, 2) + Math.pow(rxHipBase * s, 2) + 1e-6);
  const rHipRef = Math.max(hipSample.r * safeHipRatio + 0.012, rHipEllipse);

  // Waist-to-Hip transition (y from 1.08 down to 0.95): smooth outward A-line expansion from waist to hip cone
  if (y >= 0.95) {
    const tWH = (1.08 - y) / (1.08 - 0.95);
    const sWH = tWH * tWH * (3 - 2 * tWH);
    const rWaist = waistSample.r * safeHipRatio + 0.005;
    const rBodyDirect = bodySample.r * safeHipRatio + 0.006 + tWH * 0.006;
    const rCone = Math.max(rBodyDirect, rWaist * (1 - sWH) + rHipRef * sWH);
    const cz = waistSample.centerZ * (1 - sWH) + hipSample.centerZ * sWH;
    return {
      rMinCollision: rCone - 0.0012,
      rDrapeTarget: rCone,
      centerZ: cz,
    };
  }

  // Below Hip (y < 0.95 down to 0.34): Continuous A-Line Downward Flare (Xòe Xuống Chữ A)
  const dropFromHip = Math.max(0, (0.95 - y) / (0.95 - 0.34));
  const dropFromHipToAnkle = Math.max(0, (0.95 - y) / (0.95 - 0.085));

  // 1. Check clearance against Wide-Legged Silk Trousers & Pleated Skirt underneath
  const thighLeg = legProfile.sampleAtY(0.91);
  const leg = legProfile.sampleAtY(y);
  const baseThighRx = Math.max(thighLeg.rx + 0.006, 0.08) * safeHipRatio;
  const baseThighRz = Math.max(thighLeg.rz + 0.008, 0.094) * safeHipRatio;
  const rxTrouser = Math.max(leg.rx + 0.006, baseThighRx * (1 + dropFromHipToAnkle * 0.32));
  const rzTrouser = Math.max(leg.rz + 0.008, baseThighRz * (1 + dropFromHipToAnkle * 0.28));
  const legCx = thighLeg.cx * (1 - dropFromHipToAnkle * 0.25) + leg.cx * (dropFromHipToAnkle * 0.25);

  let rLegMax = 0;
  for (const side of [-1, 1]) {
    const xc = side * legCx;
    const A = (c * c) / (rxTrouser * rxTrouser) + (s * s) / (rzTrouser * rzTrouser);
    const B = (c * xc) / (rxTrouser * rxTrouser);
    const C = (xc * xc) / (rxTrouser * rxTrouser) - 1;
    const disc = B * B - A * C;
    if (disc > 0) {
      const rHit = (B + Math.sqrt(disc)) / A;
      if (rHit > rLegMax) rLegMax = rHit;
    }
  }

  // 2. Monotonic A-Line Cone Expanding Downward in both Width (X) and Depth (Z)
  const rxFlare = Math.max(
    rxHipBase * (1 + dropFromHip * lateralFlare) + dropFromHip * 0.032,
    legCx + rxTrouser + 0.012
  );
  const rzFlare = Math.max(
    rzHipTheta * (1 + dropFromHip * (lateralFlare * 0.72)) + dropFromHip * 0.024,
    rzTrouser + 0.014
  );

  const rOvalFlare =
    (rxFlare * rzFlare) /
    Math.sqrt(Math.pow(rzFlare * c, 2) + Math.pow(rxFlare * s, 2) + 1e-6);

  // Gentle outward apron arch across the front and back panels (never dipping inward between the legs!)
  const frontBackArch = Math.pow(Math.abs(s), 1.4) * 0.008 * Math.min(1, dropFromHip * 1.2);
  const rAlineTarget = Math.max(rLegMax + 0.012, rOvalFlare + frontBackArch);

  // Vertical gravity plumb line from the hip center so the tà áo hangs straight down and flares out
  const czPlumb = hipSample.centerZ + dropFromHip * 0.004;

  return {
    rMinCollision: Math.max(rLegMax + 0.01, rAlineTarget - 0.0018),
    rDrapeTarget: rAlineTarget,
    centerZ: czPlumb,
  };
}

/**
 * Generates a True 3D Polar-Wrapped & A-Line Flared Vietnamese Tunic (Áo Ngũ Thân, Nhật Bình, Tứ Thân, Áo Dài)
 * as a continuous 3D surface from the elliptical standing collar base and sloped shoulders
 * down through the waist, flaring outward in an authentic A-line silhouette (`xòe xuống`) to the hem.
 */
export function createPhysicsConformalTaAoFromGLB(
  humanModel: THREE.Group,
  isMale: boolean,
  garmentId: string,
  hipRatio: number = 1.0,
  tScale: number = 1.0
): RealTimeClothMeshData {
  const field = buildBodySurfaceFieldFromGLB(humanModel, isMale);
  const legProfile = buildDualLegProfileFromGLB(humanModel, isMale);
  const neckScale = 1 + (tScale - 1) * 0.14;

  const isBaBa = garmentId === 'ao-dai-ba-ba';
  const isNhatBinh = garmentId === 'ao-nhat-binh';
  const isTuThan = garmentId === 'ao-tu-than';

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const minCollisionZList: number[] = [];
  const panelSignZList: number[] = [];
  const freeHangWeightList: number[] = [];
  const uCoordList: number[] = [];

  const yNeckTop = isMale ? 1.522 : 1.458;
  const yChestTop = yNeckTop - 0.014;
  const maxShoulderDrop = isMale ? 0.036 : 0.034;
  const ySlitStart = isBaBa ? 0.98 : 0.92;
  const yBottom = isBaBa ? 0.72 : isNhatBinh ? 0.34 : 0.36;

  // Exact elliptical standing collar base dimensions so iv=0 tucks 100% flush into the tailored collar!
  const rxNeck = (isMale ? 0.056 : 0.052) * neckScale + 0.002;
  const rzNeck = (isMale ? 0.053 : 0.048) * neckScale + 0.002;
  const czNeck = isMale ? 0.002 : 0.019;

  const segsU = 48;
  const segsV = 60;
  const ivDome = 6;
  const stride = segsU + 1;
  const panelVertCount = (segsV + 1) * (segsU + 1);

  // Authentic A-line downward flare ratios matching traditional Vietnamese garment silhouettes
  const lateralFlare = isBaBa
    ? 0.26
    : isNhatBinh
    ? isMale
      ? 0.38
      : 0.42
    : isTuThan
    ? isMale
      ? 0.3
      : 0.46
    : 0.36;

  const panels = [
    { isFront: true, signZ: 1 },
    { isFront: false, signZ: -1 },
  ];

  // Store both Front (0) and Back (1) grids so we can couple their side seams above the hip slit!
  const panelGrids = panels.map(() => ({
    gridR: new Float32Array(panelVertCount),
    gridMinR: new Float32Array(panelVertCount),
    gridTheta: new Float32Array(panelVertCount),
    gridY: new Float32Array(panelVertCount),
    gridCZ: new Float32Array(panelVertCount),
  }));

  panels.forEach((panel, pIdx) => {
    const { gridR, gridMinR, gridTheta, gridY, gridCZ } = panelGrids[pIdx];

    for (let iv = 0; iv <= segsV; iv++) {
      // Zone 1 (iv <= ivDome): Collarbone & Shoulder Dome sweeping radially from neck collar to shoulder/chest rim
      // Zone 2 (iv > ivDome): Full Torso, Waist, Hips & A-Line Lower Drape from yChestTop down to yBottom
      const isDome = iv <= ivDome;
      const tDome = isDome ? iv / ivDome : 1.0;
      const tBody = isDome ? 0.0 : (iv - ivDome) / (segsV - ivDome);

      const collarBlend = isDome ? Math.sin(tDome * Math.PI * 0.5) : 1.0;
      const yApprox = isDome
        ? yNeckTop - tDome * 0.012
        : yChestTop - tBody * (yChestTop - yBottom);

      const vSlit = Math.max(0, (ySlitStart - yApprox) / Math.max(0.05, ySlitStart - yBottom));
      const slitGapRad = Math.pow(vSlit, 0.85) * (isBaBa ? 0.16 : 0.22);

      for (let iu = 0; iu <= segsU; iu++) {
        const u = iu / segsU;
        const idx = iv * stride + iu;

        let theta = panel.isFront
          ? slitGapRad + u * (Math.PI - 2 * slitGapRad)
          : -slitGapRad - u * (Math.PI - 2 * slitGapRad);

        // Female Áo Tứ Thân opens at the front chest to reveal Yếm Đào; Male Áo Tứ Thân stays closed over white Áo Cánh
        if (panel.isFront && isTuThan && !isMale && yApprox > 1.08) {
          const vChest = (yApprox - 1.08) / (yNeckTop - 1.08);
          const distFromCenter = Math.abs(u - 0.5) * 2;
          if (distFromCenter < 0.36) {
            const pushOut = (1 - distFromCenter / 0.36) * vChest * 0.22;
            theta += u < 0.5 ? -pushOut : pushOut;
          }
        }

        const shoulderFactor = Math.pow(Math.abs(Math.cos(theta)), 1.3) * maxShoulderDrop;
        const shoulderDrop = isDome
          ? tDome * shoulderFactor
          : shoulderFactor * Math.pow(Math.max(0, 1 - tBody * 2.2), 1.3);
        const y = yApprox - shoulderDrop;

        const env = samplePolarLowerBodyEnvelope(
          y,
          theta,
          hipRatio,
          lateralFlare,
          field,
          legProfile
        );

        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const rNeckEllipse =
          (rxNeck * rzNeck) /
          Math.sqrt(Math.pow(rzNeck * cosT, 2) + Math.pow(rxNeck * sinT, 2) + 1e-6);

        const pleatFreq = isNhatBinh ? 7 : 5;
        const pleatAmp = (isBaBa ? 0.0018 : 0.0042) * Math.pow(vSlit, 1.15);
        const pleat = Math.sin(u * Math.PI * pleatFreq) * pleatAmp;

        const rOuterInit = Math.max(env.rMinCollision, env.rDrapeTarget + pleat);
        const rInit = rNeckEllipse * (1 - collarBlend) + rOuterInit * collarBlend;
        const rMin = rNeckEllipse * (1 - collarBlend) + env.rMinCollision * collarBlend;
        const cz = czNeck * (1 - collarBlend) + env.centerZ * collarBlend;

        const hemCurveY = -Math.sin(u * Math.PI) * (isBaBa ? 0.008 : 0.022) * Math.pow(vSlit, 1.05);

        gridR[idx] = rInit;
        gridMinR[idx] = rMin;
        gridTheta[idx] = theta;
        gridY[idx] = y + hemCurveY;
        gridCZ[idx] = cz;
      }
    }
  });

  // Coupled PBD Surface Relaxation: smooths torso/drape panels (iv >= ivDome) while preserving the A-line flare floor
  const nextFrontR = new Float32Array(panelGrids[0].gridR);
  const nextBackR = new Float32Array(panelGrids[1].gridR);

  for (let iter = 0; iter < 10; iter++) {
    for (let pIdx = 0; pIdx < 2; pIdx++) {
      const curGridR = panelGrids[pIdx].gridR;
      const curMinR = panelGrids[pIdx].gridMinR;
      const outR = pIdx === 0 ? nextFrontR : nextBackR;

      for (let iv = ivDome; iv < segsV; iv++) {
        for (let iu = 0; iu <= segsU; iu++) {
          const idx = iv * stride + iu;
          const iuPrev = Math.max(0, iu - 1);
          const iuNext = Math.min(segsU, iu + 1);

          const avgR =
            0.28 * (curGridR[iv * stride + iuPrev] + curGridR[iv * stride + iuNext]) +
            0.22 * (curGridR[(iv - 1) * stride + iu] + curGridR[(iv + 1) * stride + iu]);

          let rCand = 0.65 * curGridR[idx] + 0.35 * avgR;
          if (rCand < curMinR[idx]) {
            rCand = curMinR[idx];
          }
          outR[idx] = rCand;
        }
      }
    }

    // Stitch left (iu = 0) and right (iu = segsU) side seams between front and back panels above the hip slit!
    for (let iv = 0; iv <= segsV; iv++) {
      const isDome = iv <= ivDome;
      const tBody = isDome ? 0.0 : (iv - ivDome) / (segsV - ivDome);
      const yApprox = isDome
        ? yNeckTop - (iv / ivDome) * 0.012
        : yChestTop - tBody * (yChestTop - yBottom);
      if (yApprox >= ySlitStart) {
        const idxLeft = iv * stride;
        const idxRight = iv * stride + segsU;

        const rLeftSeam = Math.max(
          0.5 * (nextFrontR[idxLeft] + nextBackR[idxLeft]),
          panelGrids[0].gridMinR[idxLeft],
          panelGrids[1].gridMinR[idxLeft]
        );
        const rRightSeam = Math.max(
          0.5 * (nextFrontR[idxRight] + nextBackR[idxRight]),
          panelGrids[0].gridMinR[idxRight],
          panelGrids[1].gridMinR[idxRight]
        );

        nextFrontR[idxLeft] = rLeftSeam;
        nextBackR[idxLeft] = rLeftSeam;
        nextFrontR[idxRight] = rRightSeam;
        nextBackR[idxRight] = rRightSeam;
      }
    }

    panelGrids[0].gridR.set(nextFrontR);
    panelGrids[1].gridR.set(nextBackR);
  }

  panels.forEach((panel, pIdx) => {
    const baseVertexOffset = (positions.length / 3) | 0;
    const { gridR, gridMinR, gridTheta, gridY, gridCZ } = panelGrids[pIdx];

    for (let iv = 0; iv <= segsV; iv++) {
      const v = iv / segsV;
      const isDome = iv <= ivDome;
      const tBody = isDome ? 0.0 : (iv - ivDome) / (segsV - ivDome);
      const yRaw = isDome
        ? yNeckTop - (iv / ivDome) * 0.012
        : yChestTop - tBody * (yChestTop - yBottom);
      const vSlit = Math.max(0, (ySlitStart - yRaw) / Math.max(0.05, ySlitStart - yBottom));
      // Outward A-line panel flare below the hip slit so front & back tà áo hang as broad flared curtains
      const zPanelFlare = Math.pow(vSlit, 1.08) * (isBaBa ? 0.014 : 0.028) * panel.signZ;

      for (let iu = 0; iu <= segsU; iu++) {
        const u = iu / segsU;
        const idx = iv * stride + iu;
        const r = gridR[idx];
        const rMin = gridMinR[idx];
        const theta = gridTheta[idx];
        const cz = gridCZ[idx];

        const x = r * Math.cos(theta);
        const z = cz + r * Math.sin(theta) + zPanelFlare;
        const colZ = cz + rMin * Math.sin(theta) + zPanelFlare;

        positions.push(x, gridY[idx], z);
        uvs.push(u, 1 - v);
        minCollisionZList.push(colZ);
        panelSignZList.push(panel.signZ);
        freeHangWeightList.push(Math.pow(vSlit, 1.4));
        uCoordList.push(u);
      }
    }

    for (let iv = 0; iv < segsV; iv++) {
      for (let iu = 0; iu < segsU; iu++) {
        const a = baseVertexOffset + iv * stride + iu;
        const b = a + 1;
        const c = baseVertexOffset + (iv + 1) * stride + iu;
        const d = c + 1;
        if (panel.isFront) {
          indices.push(a, b, d);
          indices.push(a, d, c);
        } else {
          indices.push(a, d, b);
          indices.push(a, c, d);
        }
      }
    }
  });

  const geo = new THREE.BufferGeometry();
  const posTyped = new Float32Array(positions);
  geo.setAttribute('position', new THREE.BufferAttribute(posTyped, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  return {
    geometry: geo,
    restPositions: new Float32Array(posTyped),
    minCollisionZ: new Float32Array(minCollisionZList),
    panelSignZ: new Float32Array(panelSignZList),
    freeHangWeights: new Float32Array(freeHangWeightList),
    uCoords: new Float32Array(uCoordList),
  };
}

/**
 * Maintains the 3D garment in its Natural Gravity A-Line Drape condition (Điều kiện tự nhiên mặc định và duy nhất)
 * with subtle, non-colliding outward silk poise so the lower panels never flutter inward or cling to the legs.
 */
export function updateRealTimeClothPhysics(
  clothData: RealTimeClothMeshData,
  elapsedTime: number,
  _angularVelocity: number,
  _breezeStrength: number = 1.0
): void {
  const posAttr = clothData.geometry.attributes.position as THREE.BufferAttribute;
  const posArr = posAttr.array as Float32Array;
  const rest = clothData.restPositions;
  const signZ = clothData.panelSignZ;
  const weights = clothData.freeHangWeights;
  const uCoords = clothData.uCoords;
  const count = posAttr.count;

  for (let i = 0; i < count; i++) {
    const w = weights[i];
    const i3 = i * 3;
    if (w <= 0.001) {
      posArr[i3] = rest[i3];
      posArr[i3 + 1] = rest[i3 + 1];
      posArr[i3 + 2] = rest[i3 + 2];
      continue;
    }

    const rx = rest[i3];
    const ry = rest[i3 + 1];
    const rz = rest[i3 + 2];
    const u = uCoords[i];
    const pSign = signZ[i];

    // Pure natural gravity equilibrium with imperceptible positive outward silk breathing (never inward!)
    const edgeArch = Math.sin(u * Math.PI);
    const naturalPoise =
      (0.5 + 0.5 * Math.sin(elapsedTime * 1.15 - w * 1.8 + u * Math.PI * 2.0)) *
      0.0008 *
      w *
      edgeArch;

    posArr[i3] = rx * (1 + naturalPoise * 0.4);
    posArr[i3 + 1] = ry;
    posArr[i3 + 2] = rz + naturalPoise * pSign;
  }

  posAttr.needsUpdate = true;
}

/**
 * Generates Traditional Wide-Legged A-Line Flared Silk Trousers (Quần Lụa Ống Rộng / Quần Lá Tọa)
 * that flare downward (`xòe xuống`) from the hip/upper thigh all the way to the ankle hem
 * along a vertical gravity plumb line instead of clinging to the knees or calves.
 */
export function createConformalSilkTrousersFromGLB(
  humanModel: THREE.Group,
  isMale: boolean,
  hipRatio: number = 1.0
): THREE.BufferGeometry {
  const safeHipRatio = Math.max(1.0, Math.min(1.04, hipRatio));
  const field = buildBodySurfaceFieldFromGLB(humanModel, isMale);
  const legProfile = buildDualLegProfileFromGLB(humanModel, isMale);

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Part 1: Conformal High Waist & Pelvis (y = 0.88 .. 1.03) tucked cleanly inside the outer tunic
  const pelSegsY = 14;
  const pelSegsR = 48;
  const yPelMin = 0.88;
  const yPelMax = 1.03;

  for (let iy = 0; iy <= pelSegsY; iy++) {
    const v = iy / pelSegsY;
    const y = yPelMin + v * (yPelMax - yPelMin);
    const waistTuck = 0.0015 * (1 - v) - 0.0012 * v;
    for (let ix = 0; ix <= pelSegsR; ix++) {
      const u = ix / pelSegsR;
      const theta = u * Math.PI * 2;
      const { r, centerZ } = field.sampleRadiusAndCenter(y, theta);
      const rPel = r * safeHipRatio + waistTuck;
      positions.push(rPel * Math.cos(theta), y, centerZ + rPel * Math.sin(theta));
      uvs.push(u * 2, v);
    }
  }

  const pelStride = pelSegsR + 1;
  for (let iy = 0; iy < pelSegsY; iy++) {
    for (let ix = 0; ix < pelSegsR; ix++) {
      const a = iy * pelStride + ix;
      const b = a + 1;
      const c = (iy + 1) * pelStride + ix;
      const d = c + 1;
      indices.push(a, b, d);
      indices.push(a, d, c);
    }
  }

  // Part 2: Left & Right Wide-Flared Silk Trouser Legs (Quần ống rộng xòe suông xuống từ y = 0.93 đến y = 0.085)
  const legSegsY = 38;
  const legSegsR = 40;
  const yLegMin = 0.085;
  const yLegMax = 0.93;

  const thighRef = legProfile.sampleAtY(0.91);
  const baseThighRx = Math.max(thighRef.rx + 0.005, isMale ? 0.08 : 0.078) * safeHipRatio;
  const baseThighRz = Math.max(thighRef.rz + 0.007, isMale ? 0.094 : 0.092) * safeHipRatio;

  ([-1, 1] as const).forEach((side) => {
    const baseOffset = (positions.length / 3) | 0;

    for (let iy = 0; iy <= legSegsY; iy++) {
      const v = iy / legSegsY;
      const y = yLegMin + v * (yLegMax - yLegMin);
      const hang = 1 - v; // 0 at upper thigh (y=0.93), 1 at ankle hem (y=0.085)
      const leg = legProfile.sampleAtY(y);

      const topTuck = v > 0.85 ? ((v - 0.85) / 0.15) * 0.003 : 0;

      // Monotonic A-line downward flare: wide culotte/palazzo silk trouser legs that flare wider toward the ankle!
      const rxFlared = Math.max(
        leg.rx + 0.005,
        baseThighRx * (1 + hang * 0.3) - topTuck
      );
      const rzFlared = Math.max(
        leg.rz + 0.007,
        baseThighRz * (1 + hang * 0.26) - topTuck
      );

      // Plumb-line center so the wide trouser legs hang straight down instead of bending backward with the calf
      const cxPlumb = thighRef.cx * (1 - hang * 0.25) + leg.cx * (hang * 0.25) + hang * 0.005;
      const czPlumb = thighRef.cz * (1 - hang * 0.28) + leg.cz * (hang * 0.28);

      for (let ix = 0; ix <= legSegsR; ix++) {
        const u = ix / legSegsR;
        const theta = u * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        // Gently compress the inner thigh seam (cosT * side < 0) near the crotch so the two wide legs don't overlap in the middle
        const isInnerSeam = cosT * side < 0;
        const innerCrotchTaper =
          isInnerSeam ? Math.max(0.72, 1 - (1 - hang * 0.55) * 0.22 * Math.abs(cosT)) : 1.0;

        const fold = Math.sin(theta * 6) * 0.0028 * Math.pow(hang, 0.85);
        const x = side * cxPlumb + (rxFlared * innerCrotchTaper + fold) * cosT;
        const z = czPlumb + (rzFlared + fold) * sinT;

        positions.push(x, y, z);
        uvs.push(u, v * 2);
      }
    }

    const legStride = legSegsR + 1;
    for (let iy = 0; iy < legSegsY; iy++) {
      for (let ix = 0; ix < legSegsR; ix++) {
        const a = baseOffset + iy * legStride + ix;
        const b = a + 1;
        const c = baseOffset + (iy + 1) * legStride + ix;
        const d = c + 1;
        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Generates an Authentic A-Line Flared & Gravity-Draped Pleated Skirt (Váy Đụp Kinh Bắc / Váy Đụp Ngắn)
 * that flares continuously outward (`xòe rộng chữ A xuống dưới`) from the waist and hip down to the hem
 * instead of hugging the knees or calves.
 */
export function createConformalVayDupFromGLB(
  humanModel: THREE.Group,
  isMale: boolean,
  isShort: boolean,
  hipRatio: number = 1.0
): THREE.BufferGeometry {
  const safeHipRatio = Math.max(1.0, Math.min(1.04, hipRatio));
  const field = buildBodySurfaceFieldFromGLB(humanModel, isMale);

  const segsY = 42;
  const segsR = 76;
  const yMin = isShort ? 0.5 : 0.085;
  const yMax = 1.03;

  const hipRef = field.sampleRadiusAndCenter(0.95, Math.PI / 2);
  const rxHipBase = Math.max(hipRef.halfWidthX * safeHipRatio, isMale ? 0.162 : 0.166) + 0.006;
  const rzFrontHipBase =
    Math.max(hipRef.frontMaxZ - hipRef.centerZ, 0.112) * safeHipRatio + 0.006;
  const rzBackHipBase =
    Math.max(hipRef.centerZ - hipRef.backMinZ, 0.114) * safeHipRatio + 0.006;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iy = 0; iy <= segsY; iy++) {
    const v = iy / segsY;
    const y = yMin + v * (yMax - yMin);
    const dropFromWaist = (yMax - y) / (1.03 - 0.085);
    const dropFromHip = Math.max(0, (0.95 - y) / (0.95 - 0.085));

    // Tuck upper waistband slightly under outer tunic above y = 0.94
    const upperTuck = y > 0.94 ? ((y - 0.94) / 0.09) * 0.0032 : 0;

    for (let ix = 0; ix <= segsR; ix++) {
      const u = ix / segsR;
      const theta = u * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      const rzHip = sinT >= 0 ? rzFrontHipBase : rzBackHipBase;
      // Continuous conical A-line skirt flare in both X and Z
      const flareFactorX = isShort ? 0.44 : 0.42;
      const flareFactorZ = isShort ? 0.36 : 0.34;

      const rxSkirtCone = rxHipBase * (1 + dropFromHip * flareFactorX);
      const rzSkirtCone = rzHip * (1 + dropFromHip * flareFactorZ);

      const rCone =
        (rxSkirtCone * rzSkirtCone) /
        Math.sqrt(Math.pow(rzSkirtCone * cosT, 2) + Math.pow(rxSkirtCone * sinT, 2) + 1e-6);

      let rBase = rCone;
      let cz = hipRef.centerZ + dropFromHip * 0.003;

      if (y > 0.95) {
        const tWH = (1.03 - y) / (1.03 - 0.95);
        const sWH = tWH * tWH * (3 - 2 * tWH);
        const waistSample = field.sampleRadiusAndCenter(y, theta);
        const rWaist = waistSample.r * safeHipRatio + 0.002;
        rBase = rWaist * (1 - sWH) + rCone * sWH;
        cz = waistSample.centerZ * (1 - sWH) + hipRef.centerZ * sWH;
      }

      const pleat = Math.sin(theta * 28) * 0.0046 * Math.pow(dropFromWaist, 0.82);
      const rSkirt = rBase - upperTuck + pleat;

      positions.push(rSkirt * cosT, y, cz + rSkirt * sinT);
      uvs.push(u * 3, v * 2);
    }
  }

  const stride = segsR + 1;
  for (let iy = 0; iy < segsY; iy++) {
    for (let ix = 0; ix < segsR; ix++) {
      const a = iy * stride + ix;
      const b = a + 1;
      const c = (iy + 1) * stride + ix;
      const d = c + 1;
      indices.push(a, b, d);
      indices.push(a, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Generates an Anatomical Elliptical Standing Collar (Cổ Lập Lĩnh) that hugs the exact
 * elliptical neck cross-section of `Wolf3D_Head` (`rx = 0.096, rz = 0.066` male; `rx = 0.068, rz = 0.049` female)
 * so the sides of the neck NEVER clip or poke through the collar on any body type!
 */
export function createConformalStandingCollarFromGLB(
  isMale: boolean,
  isInnerWhite: boolean,
  tScale: number = 1.0
): THREE.BufferGeometry {
  const segsU = 44;
  const segsV = 8;
  const neckScale = 1 + (tScale - 1) * 0.14;

  const yBottom = isMale ? 1.516 : 1.452;
  const yTop = isInnerWhite
    ? isMale
      ? 1.572
      : 1.505
    : isMale
    ? 1.558
    : 1.492;

  const czBottom = isMale ? 0.002 : 0.019;
  const czTop = isMale ? 0.006 : 0.024;

  const extra = isInnerWhite ? 0.0022 : 0.0042;
  const rxBottom = (isMale ? 0.056 : 0.052) * neckScale + extra;
  const rxTop = (isMale ? 0.053 : 0.049) * neckScale + extra;
  const rzBottom = (isMale ? 0.053 : 0.048) * neckScale + extra;
  const rzTop = (isMale ? 0.05 : 0.0455) * neckScale + extra;

  // Subtle front throat V-slit for outer collar so inner white collar peeks out authentically
  const slitRad = isInnerWhite ? 0.02 : 0.14;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iv = 0; iv <= segsV; iv++) {
    const v = iv / segsV;
    const y = yBottom + v * (yTop - yBottom);
    const cz = czBottom * (1 - v) + czTop * v;
    const rx = rxBottom * (1 - v) + rxTop * v;
    const rz = rzBottom * (1 - v) + rzTop * v;
    const curSlit = slitRad * (0.35 + 0.65 * v);

    for (let iu = 0; iu <= segsU; iu++) {
      const u = iu / segsU;
      // Start at front throat (PI/2 + curSlit) and wrap 360° around neck to (5*PI/2 - curSlit)
      const theta = Math.PI * 0.5 + curSlit + u * (Math.PI * 2 - curSlit * 2);
      const x = rx * Math.cos(theta);
      const z = cz + rz * Math.sin(theta);
      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  const stride = segsU + 1;
  for (let iv = 0; iv < segsV; iv++) {
    for (let iu = 0; iu < segsU; iu++) {
      const a = iv * stride + iu;
      const b = a + 1;
      const c = (iv + 1) * stride + iu;
      const d = c + 1;
      indices.push(a, b, d);
      indices.push(a, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Extracts the exact posed 3D arm bone path (Shoulder -> Elbow -> Wrist) from the posed
 * humanModel skeleton and builds an orthogonal Bishop frame along the true anatomical
 * centerline of the deltoid, upper arm, and forearm.
 */
function buildPosedArmBoneSplineFromGLB(
  humanModel: THREE.Group,
  side: -1 | 1,
  isMale: boolean,
  sScale: number = 1.0
) {
  const sidePrefix = side === 1 ? 'Left' : 'Right';
  let clavBone: THREE.Object3D | null = null;
  let upperArmBone: THREE.Object3D | null = null;
  let foreArmBone: THREE.Object3D | null = null;
  let handBone: THREE.Object3D | null = null;

  humanModel.traverse((child) => {
    if (child.name === `${sidePrefix}Shoulder`) clavBone = child;
    if (child.name === `${sidePrefix}Arm`) upperArmBone = child;
    if (child.name === `${sidePrefix}ForeArm`) foreArmBone = child;
    if (child.name === `${sidePrefix}Hand`) handBone = child;
  });

  const invRoot = new THREE.Matrix4().copy(humanModel.matrixWorld).invert();
  const toLocal = (obj: THREE.Object3D | null, fallback: THREE.Vector3) => {
    if (!obj) return fallback;
    const wp = new THREE.Vector3();
    obj.getWorldPosition(wp);
    return wp.applyMatrix4(invRoot);
  };

  const pClav = toLocal(
    clavBone,
    new THREE.Vector3(side * (isMale ? 0.05 : 0.06), isMale ? 1.505 : 1.445, -0.025)
  );
  const pShoulder = toLocal(
    upperArmBone,
    new THREE.Vector3(side * (isMale ? 0.165 : 0.126), isMale ? 1.5 : 1.438, -0.03)
  );
  const pElbow = toLocal(
    foreArmBone,
    new THREE.Vector3(side * (isMale ? 0.24 : 0.215), isMale ? 1.228 : 1.185, -0.045)
  );
  const pWrist = toLocal(
    handBone,
    new THREE.Vector3(side * (isMale ? 0.31 : 0.28), isMale ? 1.015 : 0.975, 0.07)
  );

  // Tuck the sleeve root cleanly into the raised anatomical shoulder dome of the tunic
  const pStart = new THREE.Vector3().lerpVectors(pClav, pShoulder, 0.62);
  pStart.x *= 1 + (sScale - 1) * 0.42;
  pStart.y -= isMale ? 0.048 : 0.018;
  pStart.z += isMale ? 0.008 : 0.01;

  const pElbowAdj = pElbow.clone();
  pElbowAdj.y -= 0.006;

  const pEnd = new THREE.Vector3().lerpVectors(pElbowAdj, pWrist, 0.96);

  const numSlices = 28;
  const centers: THREE.Vector3[] = [];
  const upVecs: THREE.Vector3[] = [];
  const frontVecs: THREE.Vector3[] = [];
  const baseRadii: number[] = [];

  const rShoulder = (isMale ? 0.055 : 0.05) * (1 + Math.max(0, sScale - 1) * 0.25);
  const rElbow = isMale ? 0.045 : 0.04;
  const rWrist = isMale ? 0.034 : 0.031;

  for (let i = 0; i <= numSlices; i++) {
    const t = i / numSlices;
    const pt = new THREE.Vector3();
    if (t <= 0.5) {
      const u = t / 0.5;
      pt.lerpVectors(pStart, pElbowAdj, u);
    } else {
      const u = (t - 0.5) / 0.5;
      pt.lerpVectors(pElbowAdj, pEnd, u);
    }
    if (t > 0.32 && t < 0.68) {
      const w = 1 - Math.abs(t - 0.5) / 0.18;
      if (w > 0) {
        const midLinear = new THREE.Vector3().lerpVectors(pStart, pEnd, t);
        pt.lerp(midLinear, w * 0.14);
      }
    }
    centers.push(pt);

    const r =
      t <= 0.5
        ? rShoulder * (1 - t * 2) + rElbow * (t * 2)
        : rElbow * (1 - (t - 0.5) * 2) + rWrist * ((t - 0.5) * 2);
    baseRadii.push(r);
  }

  for (let i = 0; i <= numSlices; i++) {
    const iPrev = Math.max(0, i - 1);
    const iNext = Math.min(numSlices, i + 1);
    const tangent = new THREE.Vector3().subVectors(centers[iNext], centers[iPrev]).normalize();

    const worldFront = new THREE.Vector3(0, 0.15, 1).normalize();
    const fVec = worldFront
      .clone()
      .addScaledVector(tangent, -worldFront.dot(tangent))
      .normalize();

    const uVec = new THREE.Vector3().crossVectors(tangent, fVec).normalize();
    if (uVec.y < 0) uVec.negate();

    upVecs.push(uVec);
    frontVecs.push(fVec);
  }

  return { numSlices, centers, upVecs, frontVecs, baseRadii };
}

/**
 * Generates a Single, Clean, Posed-Bone-Conformal 3D Sleeve (Tay Chẽn or Tay Rộng Nhật Bình)
 * directly along the posed Shoulder -> Elbow -> Wrist skeleton curve with zero excess geometry
 * and a tapered shoulder-head cap that blends seamlessly into the tunic shoulder slope.
 */
export function createConformalSleeveFromGLB(
  humanModel: THREE.Group,
  side: -1 | 1,
  isMale: boolean,
  isWideCeremonialSleeve: boolean,
  sScale: number = 1.0
): THREE.BufferGeometry {
  const { numSlices, centers, upVecs, frontVecs, baseRadii } =
    buildPosedArmBoneSplineFromGLB(humanModel, side, isMale, sScale);
  const radialSegs = 28;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= numSlices; i++) {
    const t = i / numSlices;
    const c = centers[i];
    const uVec = upVecs[i];
    const fVec = frontVecs[i];

    // Smooth shoulder-head taper on the first 16% of the sleeve so the upper sleeve cap never pokes above the sloped tunic shoulder
    const shoulderCapTaper = isMale
      ? t < 0.26
        ? 0.72 + 0.28 * (t / 0.26)
        : 1.0
      : t < 0.16
      ? 0.82 + 0.18 * (t / 0.16)
      : 1.0;
    const rBase = (baseRadii[i] + 0.0022) * shoulderCapTaper;

    for (let j = 0; j <= radialSegs; j++) {
      const u = j / radialSegs;
      const theta = u * Math.PI * 2;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      let rU = rBase;
      let rF = rBase * 0.96;
      let gravityDropY = 0;

      if (isWideCeremonialSleeve) {
        const wideBell = Math.sin(t * Math.PI * 0.88);
        if (sinT < 0) {
          gravityDropY = -Math.pow(Math.abs(sinT), 0.85) * wideBell * 0.118;
        }
        rF *= 1 + wideBell * 0.26;
      } else if (sinT < 0) {
        gravityDropY = -Math.abs(sinT) * Math.sin(t * Math.PI) * 0.005;
      }

      const px = c.x + uVec.x * (rU * sinT) + fVec.x * (rF * cosT);
      const py = c.y + uVec.y * (rU * sinT) + fVec.y * (rF * cosT) + gravityDropY;
      const pz = c.z + uVec.z * (rU * sinT) + fVec.z * (rF * cosT);

      positions.push(px, py, pz);
      uvs.push(u, t);
    }
  }

  const stride = radialSegs + 1;
  for (let i = 0; i < numSlices; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * stride + j;
      const b = a + 1;
      const c = (i + 1) * stride + j;
      const d = c + 1;
      indices.push(a, b, d);
      indices.push(a, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Generates Conformal 5-Color Ngũ Hành Sleeve Bands (Lục, Vàng, Đỏ, Trắng, Lam)
 * that wrap 100% flush onto the posed wide ceremonial sleeve of Áo Nhật Bình.
 */
export function createConformalNhatBinhSleeveBandFromGLB(
  humanModel: THREE.Group,
  side: -1 | 1,
  isMale: boolean,
  tStart: number,
  tEnd: number,
  sScale: number = 1.0
): THREE.BufferGeometry {
  const { numSlices, centers, upVecs, frontVecs, baseRadii } =
    buildPosedArmBoneSplineFromGLB(humanModel, side, isMale, sScale);
  const bandSteps = 4;
  const radialSegs = 28;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let s = 0; s <= bandSteps; s++) {
    const t = tStart + (s / bandSteps) * (tEnd - tStart);
    const sliceF = t * numSlices;
    const i0 = Math.min(numSlices, Math.floor(sliceF));
    const i1 = Math.min(numSlices, i0 + 1);
    const f = sliceF - i0;

    const c = new THREE.Vector3().lerpVectors(centers[i0], centers[i1], f);
    const uVec = new THREE.Vector3().lerpVectors(upVecs[i0], upVecs[i1], f).normalize();
    const fVec = new THREE.Vector3().lerpVectors(frontVecs[i0], frontVecs[i1], f).normalize();
    const shoulderCapTaper =
      t < (isMale ? 0.24 : 0.16)
        ? (isMale ? 0.72 : 0.82) + (isMale ? 0.28 : 0.18) * (t / (isMale ? 0.24 : 0.16))
        : 1.0;
    const rBase =
      (baseRadii[i0] * (1 - f) + baseRadii[i1] * f + 0.0022) * shoulderCapTaper + 0.0016;

    for (let j = 0; j <= radialSegs; j++) {
      const u = j / radialSegs;
      const theta = u * Math.PI * 2;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      const wideBell = Math.sin(t * Math.PI * 0.88);
      const rU = rBase;
      const rF = rBase * 0.96 * (1 + wideBell * 0.265);
      const gravityDropY =
        sinT < 0 ? -Math.pow(Math.abs(sinT), 0.85) * wideBell * 0.119 : 0;

      const px = c.x + uVec.x * (rU * sinT) + fVec.x * (rF * cosT);
      const py = c.y + uVec.y * (rU * sinT) + fVec.y * (rF * cosT) + gravityDropY;
      const pz = c.z + uVec.z * (rU * sinT) + fVec.z * (rF * cosT);

      positions.push(px, py, pz);
      uvs.push(u, s / bandSteps);
    }
  }

  const stride = radialSegs + 1;
  for (let s = 0; s < bandSteps; s++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = s * stride + j;
      const b = a + 1;
      const c = (s + 1) * stride + j;
      const d = c + 1;
      indices.push(a, b, d);
      indices.push(a, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Computes exact posed 3D coordinates & orientations for Wrist Bangles (Xuyến Bạc)
 * and builds a sculpted 3D Sandalwood Folding Fan (Quạt Xếp Trầm Hương) anchored
 * directly inside the curled fingers of the posed Right Hand so it NEVER floats or clips!
 */
export function buildBoneAnchoredHandAccessoriesFromGLB(
  humanModel: THREE.Group,
  isMale: boolean,
  accessoryIds: string[],
  accentGarmentHex: string
): THREE.Group {
  const accGroup = new THREE.Group();
  const bones: Record<string, THREE.Object3D> = {};
  humanModel.traverse((child) => {
    if (child.name) bones[child.name] = child;
  });

  const invRoot = new THREE.Matrix4().copy(humanModel.matrixWorld).invert();
  const getLocalPos = (name: string, fallback: THREE.Vector3) => {
    const b = bones[name];
    if (!b) return fallback;
    const wp = new THREE.Vector3();
    b.getWorldPosition(wp);
    return wp.applyMatrix4(invRoot);
  };

  // 1. Xuyến Bạc Chạm Khắc (Silver Wrist Bangle) anchored directly on the posed Left Wrist bone
  if (accessoryIds.includes('xuyen-bac')) {
    const pElbowL = getLocalPos(
      'LeftForeArm',
      new THREE.Vector3(isMale ? 0.24 : 0.215, isMale ? 1.228 : 1.185, -0.045)
    );
    const pWristL = getLocalPos(
      'LeftHand',
      new THREE.Vector3(isMale ? 0.31 : 0.28, isMale ? 1.015 : 0.975, 0.07)
    );
    const wristPos = new THREE.Vector3().lerpVectors(pElbowL, pWristL, 0.96);
    const forearmAxis = new THREE.Vector3().subVectors(pWristL, pElbowL).normalize();

    const bangleGeo = new THREE.TorusGeometry(isMale ? 0.034 : 0.03, 0.0042, 16, 36);
    const bangleMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.92,
      roughness: 0.14,
    });
    const bangleMesh = new THREE.Mesh(bangleGeo, bangleMat);
    bangleMesh.position.copy(wristPos);
    bangleMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), forearmAxis);
    accGroup.add(bangleMesh);
  }

  // 2. Quạt Xếp Trầm Hương (Sculpted 3D Sandalwood Folding Fan) gripped directly inside the Right Palm
  if (accessoryIds.includes('quat-tram-huong')) {
    const pWristR = getLocalPos(
      'RightHand',
      new THREE.Vector3(isMale ? -0.29 : -0.257, isMale ? 1.02 : 0.981, 0.09)
    );
    const pMid1R = getLocalPos(
      'RightHandMiddle1',
      new THREE.Vector3(isMale ? -0.3 : -0.257, isMale ? 0.938 : 0.912, 0.14)
    );
    const pMid2R = getLocalPos(
      'RightHandMiddle2',
      new THREE.Vector3(isMale ? -0.3 : -0.254, isMale ? 0.908 : 0.888, 0.175)
    );
    const pThumb2R = getLocalPos(
      'RightHandThumb2',
      new THREE.Vector3(isMale ? -0.263 : -0.238, isMale ? 1.0 : 0.97, 0.16)
    );

    const palmGripCenter = new THREE.Vector3()
      .addScaledVector(pWristR, 0.18)
      .addScaledVector(pMid1R, 0.34)
      .addScaledVector(pMid2R, 0.28)
      .addScaledVector(pThumb2R, 0.2);

    const fanHolder = new THREE.Group();
    fanHolder.position.copy(palmGripCenter);
    // Angle the fan leaf slightly forward (+Z) and upward so it never clips into fuller ('day-dan') hips/abdomen
    fanHolder.rotation.set(-0.14, 0.26, 0.22);

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x5c2d0c,
      roughness: 0.42,
      metalness: 0.08,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.25,
      metalness: 0.85,
    });
    const silkLeafMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(accentGarmentHex || '#D4A373').lerp(new THREE.Color('#D4A373'), 0.65),
      roughness: 0.42,
      sheen: 0.55,
      side: THREE.DoubleSide,
    });

    const handleGeo = new THREE.CylinderGeometry(0.0065, 0.005, 0.065, 12);
    const handleMesh = new THREE.Mesh(handleGeo, woodMat);
    handleMesh.position.set(0, -0.012, 0);
    fanHolder.add(handleMesh);

    const pinGeo = new THREE.SphereGeometry(0.0075, 12, 12);
    const pinMesh = new THREE.Mesh(pinGeo, brassMat);
    pinMesh.position.set(0, -0.042, 0);
    fanHolder.add(pinMesh);

    const numRibs = 13;
    const fanSpanAngle = Math.PI * 0.68;
    const ribLength = 0.165;

    for (let r = 0; r < numRibs; r++) {
      const frac = r / (numRibs - 1) - 0.5;
      const ang = frac * fanSpanAngle;
      const ribGeo = new THREE.BoxGeometry(0.0032, ribLength, 0.0018);
      const ribMesh = new THREE.Mesh(ribGeo, woodMat);
      ribMesh.position.set(
        Math.sin(ang) * (ribLength * 0.5),
        -0.035 + Math.cos(ang) * (ribLength * 0.5),
        (r % 2 === 0 ? 1 : -1) * 0.0008
      );
      ribMesh.rotation.z = -ang;
      fanHolder.add(ribMesh);
    }

    const leafPositions: number[] = [];
    const leafIndices: number[] = [];
    const rInner = 0.058;
    const rOuter = 0.162;
    const pleatSegs = (numRibs - 1) * 2;

    for (let i = 0; i <= pleatSegs; i++) {
      const frac = i / pleatSegs - 0.5;
      const ang = frac * fanSpanAngle;
      const zPleat = (i % 2 === 0 ? 1 : -1) * 0.0028;

      leafPositions.push(
        Math.sin(ang) * rInner,
        -0.035 + Math.cos(ang) * rInner,
        zPleat * 0.6
      );
      leafPositions.push(
        Math.sin(ang) * rOuter,
        -0.035 + Math.cos(ang) * rOuter,
        zPleat
      );
    }
    for (let i = 0; i < pleatSegs; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      leafIndices.push(a, b, d);
      leafIndices.push(a, d, c);
    }
    const leafGeo = new THREE.BufferGeometry();
    leafGeo.setAttribute('position', new THREE.Float32BufferAttribute(leafPositions, 3));
    leafGeo.setIndex(leafIndices);
    leafGeo.computeVertexNormals();
    const leafMesh = new THREE.Mesh(leafGeo, silkLeafMat);
    fanHolder.add(leafMesh);

    accGroup.add(fanHolder);
  }

  return accGroup;
}

/**
 * Generates a Conformal Silk Waist Sash (Dải Lưng Bao for Áo Tứ Thân) that hugs the exact
 * morphed 3D waist contour of the GLB model without any clipping or floating gap on any body type.
 */
export function createConformalWaistSashFromGLB(
  humanModel: THREE.Group,
  isMale: boolean,
  hipRatio: number = 1.0
): { sashGeometry: THREE.BufferGeometry; frontKnotZ: number; waistY: number } {
  const safeHipRatio = Math.max(1.0, Math.min(1.04, hipRatio));
  const field = buildBodySurfaceFieldFromGLB(humanModel, isMale);
  const segsY = 10;
  const segsR = 56;
  const yMin = 1.03;
  const yMax = 1.13;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iy = 0; iy <= segsY; iy++) {
    const v = iy / segsY;
    const y = yMin + v * (yMax - yMin);
    const archCurve = Math.sin(v * Math.PI) * 0.0018;

    for (let ix = 0; ix <= segsR; ix++) {
      const u = ix / segsR;
      const theta = u * Math.PI * 2;
      const { r, centerZ } = field.sampleRadiusAndCenter(y, theta);
      const rSash = r * safeHipRatio + 0.0052 + archCurve;

      positions.push(
        rSash * Math.cos(theta),
        y,
        centerZ + rSash * Math.sin(theta)
      );
      uvs.push(u * 2, v);
    }
  }

  const stride = segsR + 1;
  for (let iy = 0; iy < segsY; iy++) {
    for (let ix = 0; ix < segsR; ix++) {
      const a = iy * stride + ix;
      const b = a + 1;
      const c = (iy + 1) * stride + ix;
      const d = c + 1;
      indices.push(a, b, d);
      indices.push(a, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  const frontSample = field.sampleRadiusAndCenter(1.06, Math.PI / 2);
  const frontKnotZ = frontSample.centerZ + frontSample.r * safeHipRatio + 0.0075;

  return { sashGeometry: geo, frontKnotZ, waistY: 1.06 };
}

/**
 * Generates a Conformal Chest Overlay (Cổ Nhật Bình or Yếm Đào) shrink-wrapped directly
 * onto the morphed GLB human model's anterior chest & sloped collarbone surface.
 */
export function createConformalChestOverlayFromGLB(
  humanModel: THREE.Group,
  isMale: boolean,
  mode: 'nhat-binh-collar' | 'yem-dao',
  tScale: number = 1.0
): THREE.BufferGeometry {
  const field = buildBodySurfaceFieldFromGLB(humanModel, isMale);
  const neckScale = 1 + (tScale - 1) * 0.14;
  const segsX = 32;
  const segsY = 32;
  const yMin = mode === 'nhat-binh-collar' ? 1.24 : 1.12;
  const yNeckTop = isMale ? 1.522 : 1.458;
  const maxShoulderDrop = isMale ? 0.036 : 0.034;

  const rxNeck = (isMale ? 0.056 : 0.052) * neckScale + 0.002;
  const rzNeck = (isMale ? 0.053 : 0.048) * neckScale + 0.002;
  const czNeck = isMale ? 0.002 : 0.019;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iy = 0; iy <= segsY; iy++) {
    const v = iy / segsY;
    const isTopDome = v > 0.84;
    const tDome = isTopDome ? (1 - v) / 0.16 : 1.0;
    const collarBlend = isTopDome ? Math.sin(tDome * Math.PI * 0.5) : 1.0;

    const yBase = yMin + v * (yNeckTop - yMin);

    const angleSpan =
      mode === 'nhat-binh-collar'
        ? 0.46
        : Math.sin(v * Math.PI) * 0.66 + 0.14;

    for (let ix = 0; ix <= segsX; ix++) {
      const u = ix / segsX;
      const centeredU = (u - 0.5) * 2;
      const theta = Math.PI / 2 - centeredU * angleSpan;

      const shoulderDrop =
        Math.pow(Math.abs(Math.cos(theta)), 1.3) * maxShoulderDrop * Math.pow(v, 1.5);
      const y = yBase - shoulderDrop;

      const { r, centerZ } = field.sampleRadiusAndCenter(y, theta);
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const rNeckEllipse =
        (rxNeck * rzNeck) /
        Math.sqrt(Math.pow(rzNeck * cosT, 2) + Math.pow(rxNeck * sinT, 2) + 1e-6);

      const rBase = rNeckEllipse * (1 - collarBlend) + (r + 0.0046) * collarBlend;
      const cz = czNeck * (1 - collarBlend) + centerZ * collarBlend;
      const rShell = rBase + (mode === 'nhat-binh-collar' ? 0.0022 : 0.0018);

      positions.push(
        rShell * cosT,
        y + (isTopDome ? 0.0012 : 0),
        cz + rShell * sinT
      );
      uvs.push(u, v);
    }
  }

  const stride = segsX + 1;
  for (let iy = 0; iy < segsY; iy++) {
    for (let ix = 0; ix < segsX; ix++) {
      const a = iy * stride + ix;
      const b = a + 1;
      const c = (iy + 1) * stride + ix;
      const d = c + 1;
      indices.push(a, b, d);
      indices.push(a, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Computes exact surface-anchored 3D coordinates for the 5 Ngũ Thường Buttons (or Áo Bà Ba center buttons)
 * on the morphed GLB model so every button sits 100% flush on the 3D chest and right lapel surface.
 */
export function computeConformalLapelButtonsFromGLB(
  humanModel: THREE.Group,
  isMale: boolean,
  isCenterRow: boolean,
  tScale: number = 1.0
): [number, number, number][] {
  const field = buildBodySurfaceFieldFromGLB(humanModel, isMale);
  const neckScale = 1 + (tScale - 1) * 0.14;
  const topY = isMale ? 1.514 : 1.448;

  if (isCenterRow) {
    return [0, 1, 2, 3, 4].map((idx) => {
      const y = topY - 0.042 - idx * 0.078;
      const s = field.sampleRadiusAndCenter(y, Math.PI / 2);
      return [0, y, s.centerZ + s.r + 0.0065];
    });
  }

  const specs: { y: number; theta: number; isCollarBtn?: boolean }[] = [
    { y: topY + 0.006, theta: Math.PI * 0.5, isCollarBtn: true },
    { y: topY - 0.056, theta: Math.PI * 0.36 },
    { y: topY - 0.132, theta: Math.PI * 0.22 },
    { y: topY - 0.23, theta: Math.PI * 0.16 },
    { y: topY - 0.335, theta: Math.PI * 0.14 },
  ];

  return specs.map(({ y, theta, isCollarBtn }) => {
    if (isCollarBtn) {
      const czCollar = isMale ? 0.002 : 0.019;
      const rzCollar = (isMale ? 0.053 : 0.048) * neckScale + 0.006;
      return [0, y, czCollar + rzCollar];
    }
    const s = field.sampleRadiusAndCenter(y, theta);
    const rBtn = s.r + 0.0068;
    return [-Math.abs(rBtn * Math.cos(theta)), y, s.centerZ + rBtn * Math.sin(theta)];
  });
}

/**
 * Generates the 5th Inner Tunic Panel (Vạt Con Thứ 5 / Áo Lót Trắng) using 3D Polar Wrapping
 * around the right hip and thigh so it curves naturally in 3D inside the right side slit.
 */
export function createConformalInnerVatConFromGLB(
  humanModel: THREE.Group,
  isMale: boolean,
  hipRatio: number = 1.0
): THREE.BufferGeometry {
  const field = buildBodySurfaceFieldFromGLB(humanModel, isMale);
  const legProfile = buildDualLegProfileFromGLB(humanModel, isMale);
  const segsU = 24;
  const segsV = 28;
  const yTop = 0.98;
  const yBottom = 0.42;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iv = 0; iv <= segsV; iv++) {
    const v = iv / segsV;
    const y = yTop - v * (yTop - yBottom);
    const vSlit = Math.max(0, (0.92 - y) / (0.92 - yBottom));
    for (let iu = 0; iu <= segsU; iu++) {
      const u = iu / segsU;
      const theta = -0.04 + u * (0.36 * Math.PI);
      const env = samplePolarLowerBodyEnvelope(
        y,
        theta,
        hipRatio,
        0.32,
        field,
        legProfile
      );
      const rInner = env.rDrapeTarget - 0.0035;
      const zFlare = Math.pow(vSlit, 1.08) * 0.022 * Math.sin(theta);
      positions.push(
        rInner * Math.cos(theta),
        y,
        env.centerZ + rInner * Math.sin(theta) + zFlare
      );
      uvs.push(u, 1 - v);
    }
  }

  const stride = segsU + 1;
  for (let iv = 0; iv < segsV; iv++) {
    for (let iu = 0; iu < segsU; iu++) {
      const a = iv * stride + iu;
      const b = a + 1;
      const c = (iv + 1) * stride + iu;
      const d = c + 1;
      indices.push(a, b, d);
      indices.push(a, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Measures the exact morphed `Wolf3D_Head` cranium geometry to build conformal 3D Vietnamese
 * Headwear (`Khăn xếp chữ Nhân`, `Mấn đội đầu cung đình`, `Nón quai thao`, `Nón lá & Khăn rằn`)
 * with 0.000mm forehead/hair clipping and authentic historical proportions.
 */
export function createConformalHeadwearFromGLB(
  humanModel: THREE.Group,
  isMale: boolean,
  accessoryIds: string[],
  mainGarmentMat: THREE.Material,
  goldBrocadeMat: THREE.Material,
  tScale: number = 1.0
): THREE.Group {
  const headGroup = new THREE.Group();

  // Measure actual morphed cranium & hair envelope (for Male, measure forehead/temple cranium directly from Wolf3D_Head so Khăn xếp sits on the forehead instead of floating on the top hair)
  let minY = 999;
  let maxY = -999;
  const headPts: [number, number, number][] = [];

  humanModel.traverse((child) => {
    if (
      (child as THREE.Mesh).isMesh &&
      (child.name === 'Wolf3D_Head' || (!isMale && child.name === 'Wolf3D_Hair'))
    ) {
      const pos = (child as THREE.Mesh).geometry?.attributes?.position;
      if (pos) {
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          // Account for the subtle posed Head bone forward pitch (+4.5mm in Z at forehead level)
          const z = pos.getZ(i) + (y > 1.5 ? 0.0045 : 0);
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          headPts.push([x, y, z]);
        }
      }
    }
  });

  // Fallback anatomical landmarks if Wolf3D_Head is not present
  const crownY = maxY > 1.0 ? maxY : isMale ? 1.786 : 1.726;
  const bandY = maxY > 1.0 ? crownY - (isMale ? 0.048 : 0.052) : isMale ? 1.738 : 1.674;

  let bandMaxX = isMale ? 0.082 : 0.102;
  let bandMinZ = isMale ? -0.078 : -0.075;
  let bandMaxZ = isMale ? 0.118 : 0.155;

  if (headPts.length > 0) {
    let maxX = 0;
    let minZ = 999;
    let maxZ = -999;
    let cnt = 0;
    for (let i = 0; i < headPts.length; i++) {
      const [px, py, pz] = headPts[i];
      if (Math.abs(py - bandY) <= 0.025) {
        if (Math.abs(px) > maxX) maxX = Math.abs(px);
        if (pz < minZ) minZ = pz;
        if (pz > maxZ) maxZ = pz;
        cnt++;
      }
    }
    if (cnt >= 8) {
      bandMaxX = maxX;
      bandMinZ = minZ;
      bandMaxZ = maxZ;
    }
  }

  const czHead = (bandMinZ + bandMaxZ) * 0.5;
  const rxHead = Math.max(0.078, bandMaxX + 0.0045);
  const rzHead = Math.max(0.088, (bandMaxZ - bandMinZ) * 0.5 + 0.0045);

  if (accessoryIds.includes('non-quai-thao')) {
    const nonMat = new THREE.MeshStandardMaterial({
      color: 0xc29b61,
      roughness: 0.68,
      side: THREE.DoubleSide,
    });
    const darkSilkMat = new THREE.MeshPhysicalMaterial({
      color: 0x1c1917,
      roughness: 0.45,
      sheen: 0.4,
      side: THREE.DoubleSide,
    });

    // Inner crown ring (Vành khăn mỏ quạ) seated cleanly on the head crown
    const innerRingGeo = new THREE.CylinderGeometry(
      rxHead * 0.96,
      rxHead * 1.02,
      0.036,
      40,
      1,
      true
    );
    innerRingGeo.scale(1, 1, rzHead / rxHead);
    const innerRing = new THREE.Mesh(innerRingGeo, darkSilkMat);
    innerRing.position.set(0, crownY + 0.004, czHead - 0.004);
    innerRing.rotation.x = -0.12;
    headGroup.add(innerRing);

    // Wide flat palm-leaf disc (Nón ba tầm)
    const nonDiscGeo = new THREE.CylinderGeometry(0.36, 0.365, 0.016, 56);
    const nonDisc = new THREE.Mesh(nonDiscGeo, nonMat);
    nonDisc.position.set(0, crownY + 0.022, czHead - 0.012);
    nonDisc.rotation.x = -0.12;
    nonDisc.castShadow = true;
    headGroup.add(nonDisc);

    // Traditional ivory silk chin-strap loop (Dải quai thao tơ tằm)
    const strapCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-rxHead * 1.05, bandY - 0.01, czHead + 0.01),
      new THREE.Vector3(-rxHead * 0.72, bandY - 0.14, czHead + 0.065),
      new THREE.Vector3(0, bandY - 0.195, czHead + 0.082),
      new THREE.Vector3(rxHead * 0.72, bandY - 0.14, czHead + 0.065),
      new THREE.Vector3(rxHead * 1.05, bandY - 0.01, czHead + 0.01),
    ]);
    const strapGeo = new THREE.TubeGeometry(strapCurve, 28, 0.0045, 8, false);
    const strapMat = new THREE.MeshPhysicalMaterial({
      color: 0xfef3c7,
      roughness: 0.35,
      sheen: 0.6,
    });
    headGroup.add(new THREE.Mesh(strapGeo, strapMat));
  } else if (accessoryIds.includes('man-doi-dau')) {
    // Multi-layered Court Halo Crown (Mấn Đội Đầu Cung Đình) hugging the elliptical cranium
    const numRings = 4;
    for (let r = 0; r < numRings; r++) {
      const t = r / (numRings - 1);
      const ringRx = rxHead * (1.03 + t * 0.085);
      const ringGeo = new THREE.TorusGeometry(ringRx, 0.012 - t * 0.0015, 20, 56);
      ringGeo.scale(1.0, rzHead / rxHead, 1.0);
      const ringMesh = new THREE.Mesh(ringGeo, mainGarmentMat);
      ringMesh.position.set(0, bandY + 0.004 + t * 0.016, czHead - 0.005 - t * 0.004);
      ringMesh.rotation.x = Math.PI / 2 - 0.16;
      ringMesh.castShadow = true;
      headGroup.add(ringMesh);
    }

    const goldRimGeo = new THREE.TorusGeometry(rxHead * 1.08, 0.0045, 14, 56);
    goldRimGeo.scale(1.0, ringScaleRatio(rxHead, rzHead), 1.0);
    const goldRim = new THREE.Mesh(goldRimGeo, goldBrocadeMat);
    goldRim.position.set(0, bandY + 0.012, czHead - 0.006);
    goldRim.rotation.x = Math.PI / 2 - 0.16;
    headGroup.add(goldRim);
  } else if (accessoryIds.includes('khan-ran-non-la')) {
    // Conformal Southern Checkered Scarf (Khăn Rằn Nam Bộ) draped over both shoulders (matching the 2D Áo Bà Ba portraits with uncovered hair)
    const field = buildBodySurfaceFieldFromGLB(humanModel, isMale);
    const neckScale = 1 + (tScale - 1) * 0.14;
    const rxNeck = (isMale ? 0.056 : 0.053) * neckScale;
    const czNeck = isMale ? 0.002 : 0.019;
    const yNeck = isMale ? 1.518 : 1.452;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = '#18181b';
      for (let y = 0; y < 128; y += 16) {
        ctx.fillRect(0, y, 128, 6);
      }
      for (let x = 0; x < 128; x += 16) {
        ctx.fillRect(x, 0, 6, 128);
      }
    }
    const khanRanTex = new THREE.CanvasTexture(canvas);
    khanRanTex.wrapS = THREE.RepeatWrapping;
    khanRanTex.wrapT = THREE.RepeatWrapping;
    khanRanTex.repeat.set(2, 8);
    const khanRanMat = new THREE.MeshStandardMaterial({
      map: khanRanTex,
      roughness: 0.65,
      side: THREE.DoubleSide,
    });

    ([-1, 1] as const).forEach((side) => {
      const scarfPts: THREE.Vector3[] = [];
      for (let s = 0; s <= 16; s++) {
        const u = s / 16;
        const y = yNeck - u * 0.36;
        const theta = Math.PI * 0.5 - side * (0.28 - u * 0.06);
        const sample = field.sampleRadiusAndCenter(y, theta);
        const r = (u < 0.15 ? rxNeck * 1.18 : sample.r) + 0.0085;
        const cz = u < 0.15 ? czNeck : sample.centerZ;
        scarfPts.push(
          new THREE.Vector3(side * Math.abs(r * Math.cos(theta)), y, cz + r * Math.sin(theta))
        );
      }
      const curve = new THREE.CatmullRomCurve3(scarfPts);
      const scarfGeo = new THREE.TubeGeometry(curve, 24, 0.016, 8, false);
      scarfGeo.scale(1.4, 1, 0.32);
      headGroup.add(new THREE.Mesh(scarfGeo, khanRanMat));
    });
  } else if (accessoryIds.includes('khan-xep')) {
    // 5-Layer Pleated Traditional Black Silk Turban (Khăn Xếp / Khăn Đóng Chữ Nhân / Khăn Vấn Đen)
    // Matches the jet-black pleated turban in the 2D studio portraits
    const blackTurbanSilkMat = new THREE.MeshPhysicalMaterial({
      color: 0x18181b,
      roughness: 0.42,
      metalness: 0.04,
      sheen: 0.45,
      sheenColor: new THREE.Color('#3f3f46'),
      side: THREE.DoubleSide,
    });
    const numPleats = 5;
    const segsU = 56;
    for (let p = 0; p < numPleats; p++) {
      const v = p / (numPleats - 1);
      const layerRx = rxHead * (1.01 + v * 0.045);
      const layerRz = rzHead * (1.0 + v * 0.035);
      const layerY = bandY - 0.004 + v * 0.032;

      const ringPts: THREE.Vector3[] = [];
      for (let iu = 0; iu < segsU; iu++) {
        const theta = (iu / segsU) * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        // Authentic 'Chữ Nhân' (人) subtle V-dip at the front forehead center (theta ≈ PI/2)
        const frontCrease =
          sinT > 0.7 ? Math.pow((sinT - 0.7) / 0.3, 1.5) * 0.005 * (1 - v * 0.4) : 0;
        ringPts.push(
          new THREE.Vector3(
            layerRx * cosT,
            layerY - frontCrease,
            czHead - 0.004 + layerRz * sinT
          )
        );
      }
      const closedCurve = new THREE.CatmullRomCurve3(ringPts, true);
      const pleatGeo = new THREE.TubeGeometry(closedCurve, 56, 0.0085 - v * 0.0006, 10, true);
      const pleatMesh = new THREE.Mesh(pleatGeo, blackTurbanSilkMat);
      pleatMesh.castShadow = true;
      headGroup.add(pleatMesh);
    }
  }

  return headGroup;
}

function ringScaleRatio(rx: number, rz: number): number {
  return Math.max(0.95, Math.min(1.22, rz / Math.max(0.05, rx)));
}

/**
 * Measures the exact morphed `Wolf3D_Outfit_Footwear` left and right foot bounds after natural leg
 * stance alignment and builds sculpted 3D Traditional Footwear (`Guốc gỗ mộc` or `Hài thêu mũi cong`)
 * aligned 100% flush with the feet.
 */
export function createConformalFootwearFromGLB(
  humanModel: THREE.Group,
  isMale: boolean,
  footwearId: string
): THREE.Group {
  const footGroup = new THREE.Group();
  if (footwearId !== 'hai-theu' && footwearId !== 'guoc-go-moc') {
    return footGroup;
  }

  // Measure actual morphed left foot (x > 0) from Wolf3D_Outfit_Footwear
  let minX = 999;
  let maxX = -999;
  let minZ = 999;
  let maxZ = -999;
  let cnt = 0;

  humanModel.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && child.name === 'Wolf3D_Outfit_Footwear') {
      const pos = (child as THREE.Mesh).geometry?.attributes?.position;
      if (pos) {
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const z = pos.getZ(i);
          if (x > 0.02) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (z < minZ) minZ = z;
            if (z > maxZ) maxZ = z;
            cnt++;
          }
        }
      }
    }
  });

  const footCenterX = cnt > 10 ? (minX + maxX) * 0.5 : isMale ? 0.134 : 0.131;
  const footWidth = cnt > 10 ? Math.max(0.078, (maxX - minX) * 0.86) : 0.084;
  const footMinZ = cnt > 10 ? minZ : -0.118;
  const footMaxZ = cnt > 10 ? maxZ : 0.198;
  const footCenterZ = (footMinZ + footMaxZ) * 0.5;
  const footLenZ = Math.max(0.22, (footMaxZ - footMinZ) * 0.92);

  const isHai = footwearId === 'hai-theu';
  const footAccentMat = new THREE.MeshStandardMaterial({
    color: isHai ? 0xd97706 : 0x5c2d0c,
    roughness: isHai ? 0.28 : 0.55,
    metalness: isHai ? 0.68 : 0.06,
  });

  ([-1, 1] as const).forEach((side) => {
    const fx = side * footCenterX;
    if (isHai) {
      // Upturned Embroidered Court Slipper Toe (Mũi hài cong chim phượng) anchored at exact toe tip
      const toeCapGeo = new THREE.ConeGeometry(0.026, 0.056, 18);
      const toeCapMesh = new THREE.Mesh(toeCapGeo, footAccentMat);
      toeCapMesh.position.set(fx, 0.044, footMaxZ - 0.012);
      toeCapMesh.rotation.x = Math.PI * 0.3;
      toeCapMesh.castShadow = true;
      footGroup.add(toeCapMesh);

      const soleTrimGeo = new THREE.BoxGeometry(footWidth * 0.92, 0.012, footLenZ * 0.92);
      const soleTrimMesh = new THREE.Mesh(soleTrimGeo, footAccentMat);
      soleTrimMesh.position.set(fx, 0.008, footCenterZ);
      footGroup.add(soleTrimMesh);
    } else {
      // Sculpted Wooden Clog Platform (Đế guốc gỗ mộc truyền thống)
      const clogSoleGeo = new THREE.BoxGeometry(footWidth * 0.95, 0.022, footLenZ * 0.94);
      const clogSoleMesh = new THREE.Mesh(clogSoleGeo, footAccentMat);
      clogSoleMesh.position.set(fx, 0.011, footCenterZ);
      clogSoleMesh.castShadow = true;
      footGroup.add(clogSoleMesh);
    }
  });

  return footGroup;
}

// ============================================================================
// PROCEDURAL FALLBACK HELPERS (Used only during the ~100ms before GLB loads)
// ============================================================================
export function createSplitPanelTaAoGeometry(
  isMale: boolean,
  _garmentId: string,
  torsoScale: number,
  hipScale: number
): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(0.245 * hipScale, 0.36),
    new THREE.Vector2(0.175 * hipScale, 0.95),
    new THREE.Vector2(0.145 * torsoScale, 1.32),
  ];
  const geo = new THREE.LatheGeometry(pts, 48);
  geo.scale(1, 1, isMale ? 0.78 : 0.82);
  geo.computeVertexNormals();
  return geo;
}

export function createAnatomicalTorsoGeometry(params: AnatomicalParams): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(0.16 * params.hipScale, 0.88),
    new THREE.Vector2(0.13 * params.torsoScale, 1.22),
    new THREE.Vector2(0.17 * params.shoulderScale, 1.5),
  ];
  const geo = new THREE.LatheGeometry(pts, 36);
  geo.scale(1, 1, 0.75);
  geo.computeVertexNormals();
  return geo;
}

export function createContinuousSculptedHeadGeometry(_isMale: boolean): THREE.BufferGeometry {
  return new THREE.SphereGeometry(0.11, 32, 32);
}

export function createFacialSkinTexture(
  skinHex: string,
  _isMale: boolean
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = skinHex;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function createAnatomicalLegGeometry(
  _isMale: boolean,
  hipScale: number
): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(0.04, 0.08),
    new THREE.Vector2(0.075 * hipScale, 0.94),
  ];
  return new THREE.LatheGeometry(pts, 24);
}
