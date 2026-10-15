import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * CinematicStage3D
 * 
 * Recreates the concert stage environment from Reference Image 1:
 * - Reflective dark stage floor with specular highlights
 * - Undulating electric-cyan and neon-magenta floor energy ribbons / optic cables
 * - Dual angled volumetric overhead spotlights illuminating the stage
 * - Lateral stage walls with glowing neon strip lighting
 * - Atmospheric rolling stage haze and floating cyan dust motes
 * - 3D holographic orbital rings rotating on independent gimbal axes
 * - 6 recognizable 3D event equipment models in orbit:
 *    1. Line-Array Speaker module
 *    2. Moving-Head Stage Spotlight
 *    3. Wireless Stage Microphone
 *    4. 4K Event Projector
 *    5. LED Video Wall Panel (dynamic live waveform texture)
 *    6. Triangular Aluminum Stage Truss
 */
export function CinematicStage3D({ isExiting, prefersReducedMotion }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020204, 0.018);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 16.5);

    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // Track disposables for clean memory management
    const disposables = [];
    const registerDisposable = (item) => {
      if (item) disposables.push(item);
      return item;
    };

    // --- 2. Lighting System ---
    const ambientLight = new THREE.AmbientLight(0x06101c, 1.2);
    scene.add(ambientLight);

    // Left Overhead Cyan Spotlight
    const spotLeft = new THREE.SpotLight(0x38bdf8, 28, 40, Math.PI / 5.5, 0.45, 1.2);
    spotLeft.position.set(-11, 11, -4);
    const spotLeftTarget = new THREE.Object3D();
    spotLeftTarget.position.set(-1.5, -3.5, 0);
    scene.add(spotLeftTarget);
    spotLeft.target = spotLeftTarget;
    scene.add(spotLeft);

    // Right Overhead Ice-Blue / White Spotlight
    const spotRight = new THREE.SpotLight(0x7de7ff, 28, 40, Math.PI / 5.5, 0.45, 1.2);
    spotRight.position.set(11, 11, -4);
    const spotRightTarget = new THREE.Object3D();
    spotRightTarget.position.set(1.5, -3.5, 0);
    scene.add(spotRightTarget);
    spotRight.target = spotRightTarget;
    scene.add(spotRight);

    // Center Backstage Rim/Accent Light
    const rimLight = new THREE.PointLight(0x00f0ff, 4.5, 25);
    rimLight.position.set(0, 1.5, -9);
    scene.add(rimLight);

    // Warm Magenta Stage Floor Accent Light
    const magentaFloorLight = new THREE.PointLight(0xff2a8d, 2.8, 18);
    magentaFloorLight.position.set(3, -3.8, 2);
    scene.add(magentaFloorLight);

    // --- 3. Stage Floor with Wet Specular Reflections ---
    const floorGeo = registerDisposable(new THREE.PlaneGeometry(55, 45, 32, 32));
    const floorMat = registerDisposable(
      new THREE.MeshStandardMaterial({
        color: 0x020409,
        roughness: 0.16,
        metalness: 0.88,
        fog: true,
      })
    );
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -4.5;
    scene.add(floor);

    // Subtle stage floor grid / joint lines
    const gridHelper = registerDisposable(new THREE.GridHelper(55, 36, 0x1e3a5f, 0x0a1626));
    gridHelper.position.y = -4.48;
    scene.add(gridHelper);

    // --- 4. Volumetric Spotlight Beams (Reference Image 1) ---
    // Helper to create a volumetric cone of light
    const createVolumetricBeam = (origin, target, colorHex, baseRadius, tipRadius) => {
      const dir = new THREE.Vector3().subVectors(target, origin);
      const len = dir.length();
      const geom = registerDisposable(
        new THREE.CylinderGeometry(tipRadius, baseRadius, len, 32, 1, true)
      );
      geom.translate(0, -len / 2, 0);
      geom.rotateX(-Math.PI / 2);

      const mat = registerDisposable(
        new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.16,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(origin);
      mesh.lookAt(target);

      // Lens flare source at fixture apex
      const flareGeo = registerDisposable(new THREE.SphereGeometry(0.35, 16, 16));
      const flareMat = registerDisposable(
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
        })
      );
      const flare = new THREE.Mesh(flareGeo, flareMat);
      flare.position.copy(origin);
      scene.add(flare);

      scene.add(mesh);
      return { mesh, mat, flare, flareMat };
    };

    const leftBeam = createVolumetricBeam(
      new THREE.Vector3(-11, 11, -4),
      new THREE.Vector3(-1.5, -4.5, 0),
      0x38bdf8,
      3.4,
      0.25
    );

    const rightBeam = createVolumetricBeam(
      new THREE.Vector3(11, 11, -4),
      new THREE.Vector3(1.5, -4.5, 0),
      0x7de7ff,
      3.4,
      0.25
    );

    // Mid Secondary Beams
    const midLeftBeam = createVolumetricBeam(
      new THREE.Vector3(-6, 9.5, -7),
      new THREE.Vector3(-4, -4.5, -2),
      0x00f0ff,
      2.2,
      0.15
    );

    const midRightBeam = createVolumetricBeam(
      new THREE.Vector3(6, 9.5, -7),
      new THREE.Vector3(4, -4.5, -2),
      0xff2a8d,
      2.2,
      0.15
    );

    // --- 5. Stage Floor Energy Cables / Neon Ribbons (Reference Image 1) ---
    const ribbonGroup = new THREE.Group();
    scene.add(ribbonGroup);

    const createFloorEnergyCable = (points, colorHex, tubeRadius = 0.05) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const geom = registerDisposable(new THREE.TubeGeometry(curve, 80, tubeRadius, 8, false));
      const mat = registerDisposable(
        new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
        })
      );
      const mesh = new THREE.Mesh(geom, mat);
      ribbonGroup.add(mesh);

      // Add a secondary wider outer glow tube
      const glowGeom = registerDisposable(new THREE.TubeGeometry(curve, 60, tubeRadius * 2.8, 8, false));
      const glowMat = registerDisposable(
        new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.22,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      const glowMesh = new THREE.Mesh(glowGeom, glowMat);
      ribbonGroup.add(glowMesh);

      return { mesh, glowMesh, curve };
    };

    // Electric Cyan Cable strands sweeping across left floor
    const cyanCables = [
      createFloorEnergyCable([
        new THREE.Vector3(-9.5, -4.42, 6.0),
        new THREE.Vector3(-6.5, -4.42, 2.5),
        new THREE.Vector3(-4.0, -4.42, 0.0),
        new THREE.Vector3(-2.2, -4.42, -2.5),
        new THREE.Vector3(-1.0, -4.42, -5.5),
        new THREE.Vector3(0.0, -4.42, -9.0),
      ], 0x00f0ff, 0.05),

      createFloorEnergyCable([
        new THREE.Vector3(-8.8, -4.43, 6.5),
        new THREE.Vector3(-5.8, -4.43, 3.0),
        new THREE.Vector3(-3.4, -4.43, 0.4),
        new THREE.Vector3(-1.6, -4.43, -2.2),
        new THREE.Vector3(-0.4, -4.43, -5.2),
        new THREE.Vector3(0.5, -4.43, -9.0),
      ], 0x38bdf8, 0.035),

      createFloorEnergyCable([
        new THREE.Vector3(-10.2, -4.43, 5.5),
        new THREE.Vector3(-7.2, -4.43, 2.0),
        new THREE.Vector3(-4.8, -4.43, -0.6),
        new THREE.Vector3(-2.9, -4.43, -3.0),
        new THREE.Vector3(-1.6, -4.43, -6.0),
        new THREE.Vector3(-0.8, -4.43, -9.0),
      ], 0x7de7ff, 0.04),
    ];

    // Neon Magenta / Pink Cable strands sweeping across right floor
    const magentaCables = [
      createFloorEnergyCable([
        new THREE.Vector3(9.5, -4.42, 6.0),
        new THREE.Vector3(6.5, -4.42, 2.5),
        new THREE.Vector3(4.0, -4.42, 0.0),
        new THREE.Vector3(2.2, -4.42, -2.5),
        new THREE.Vector3(1.0, -4.42, -5.5),
        new THREE.Vector3(0.0, -4.42, -9.0),
      ], 0xff2a8d, 0.05),

      createFloorEnergyCable([
        new THREE.Vector3(8.8, -4.43, 6.5),
        new THREE.Vector3(5.8, -4.43, 3.0),
        new THREE.Vector3(3.4, -4.43, 0.4),
        new THREE.Vector3(1.6, -4.43, -2.2),
        new THREE.Vector3(0.4, -4.43, -5.2),
        new THREE.Vector3(-0.5, -4.43, -9.0),
      ], 0xff59b3, 0.035),

      createFloorEnergyCable([
        new THREE.Vector3(10.2, -4.43, 5.5),
        new THREE.Vector3(7.2, -4.43, 2.0),
        new THREE.Vector3(4.8, -4.43, -0.6),
        new THREE.Vector3(2.9, -4.43, -3.0),
        new THREE.Vector3(1.6, -4.43, -6.0),
        new THREE.Vector3(0.8, -4.43, -9.0),
      ], 0xff2a8d, 0.04),
    ];

    // Travelling energy pulse orbs along cables
    const pulseOrbs = [];
    const pulseOrbGeo = registerDisposable(new THREE.SphereGeometry(0.12, 12, 12));
    const cyanPulseMat = registerDisposable(
      new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending })
    );
    const magentaPulseMat = registerDisposable(
      new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending })
    );

    for (let i = 0; i < 4; i++) {
      const orbCyan = new THREE.Mesh(pulseOrbGeo, cyanPulseMat);
      scene.add(orbCyan);
      pulseOrbs.push({ mesh: orbCyan, curve: cyanCables[i % cyanCables.length].curve, offset: i * 0.25 });

      const orbMagenta = new THREE.Mesh(pulseOrbGeo, magentaPulseMat);
      scene.add(orbMagenta);
      pulseOrbs.push({ mesh: orbMagenta, curve: magentaCables[i % magentaCables.length].curve, offset: i * 0.25 + 0.12 });
    }

    // --- 6. Lateral Stage Side Walls & Neon Rail Glow ---
    const createSideBarrier = (isLeft) => {
      const barrierGroup = new THREE.Group();
      const xPos = isLeft ? -13.5 : 13.5;
      const angle = isLeft ? Math.PI / 8 : -Math.PI / 8;
      const colorHex = isLeft ? 0x00f0ff : 0xff2a8d;

      // Dark angled wall panel
      const wallGeo = registerDisposable(new THREE.BoxGeometry(0.6, 3.2, 24));
      const wallMat = registerDisposable(
        new THREE.MeshStandardMaterial({
          color: 0x0a111d,
          roughness: 0.35,
          metalness: 0.8,
        })
      );
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(xPos, -2.8, -2);
      wall.rotation.y = angle;
      barrierGroup.add(wall);

      // Horizontal Neon Rails on the Barrier
      const railGeo = registerDisposable(new THREE.CylinderGeometry(0.04, 0.04, 24, 8));
      const railMat = registerDisposable(
        new THREE.MeshBasicMaterial({
          color: colorHex,
          blending: THREE.AdditiveBlending,
        })
      );

      const railTop = new THREE.Mesh(railGeo, railMat);
      railTop.rotation.x = Math.PI / 2;
      railTop.rotation.z = angle;
      railTop.position.set(xPos + (isLeft ? 0.35 : -0.35), -1.8, -2);
      barrierGroup.add(railTop);

      const railBottom = new THREE.Mesh(railGeo, railMat);
      railBottom.rotation.x = Math.PI / 2;
      railBottom.rotation.z = angle;
      railBottom.position.set(xPos + (isLeft ? 0.35 : -0.35), -3.2, -2);
      barrierGroup.add(railBottom);

      scene.add(barrierGroup);
    };

    createSideBarrier(true);
    createSideBarrier(false);

    // --- 7. Atmospheric Rolling Stage Haze Clouds ---
    const hazeGroup = new THREE.Group();
    scene.add(hazeGroup);

    // Create 12 soft cloud planes near the floor
    const hazeGeo = registerDisposable(new THREE.PlaneGeometry(8, 4.5));
    const hazeCanvas = document.createElement('canvas');
    hazeCanvas.width = 128;
    hazeCanvas.height = 128;
    const hctx = hazeCanvas.getContext('2d');
    const hgrad = hctx.createRadialGradient(64, 64, 5, 64, 64, 60);
    hgrad.addColorStop(0, 'rgba(125, 231, 255, 0.24)');
    hgrad.addColorStop(0.45, 'rgba(56, 189, 248, 0.12)');
    hgrad.addColorStop(0.8, 'rgba(10, 17, 29, 0.04)');
    hgrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    hctx.fillStyle = hgrad;
    hctx.fillRect(0, 0, 128, 128);

    const hazeTexture = registerDisposable(new THREE.CanvasTexture(hazeCanvas));
    const hazeMat = registerDisposable(
      new THREE.MeshBasicMaterial({
        map: hazeTexture,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );

    const hazePlanes = [];
    for (let i = 0; i < 9; i++) {
      const hp = new THREE.Mesh(hazeGeo, hazeMat);
      hp.position.set(
        (Math.random() - 0.5) * 16,
        -3.5 + Math.random() * 1.8,
        -6 + Math.random() * 8
      );
      hp.rotation.z = Math.random() * Math.PI;
      hazeGroup.add(hp);
      hazePlanes.push({ mesh: hp, speedX: 0.003 + Math.random() * 0.004, baseZ: hp.rotation.z });
    }

    // Floating Illuminated Dust Particles / Motes
    const particleCount = 260;
    const particleGeo = registerDisposable(new THREE.BufferGeometry());
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 22;
      particlePositions[i + 1] = -3.8 + Math.random() * 10;
      particlePositions[i + 2] = -8 + Math.random() * 14;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = registerDisposable(
      new THREE.PointsMaterial({
        color: 0x7de7ff,
        size: 0.12,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      })
    );
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- 8. The Centerpiece: 3D Holographic Gimbal Rings & Equipment Orbit ---
    const orbitCenterGroup = new THREE.Group();
    orbitCenterGroup.position.set(0, 1.2, 0); // Positioned in upper center
    scene.add(orbitCenterGroup);

    // Inner Glowing Hologram Brand Core (soundwave aperture)
    const coreApertureGeo = registerDisposable(new THREE.TorusGeometry(1.2, 0.04, 16, 64));
    const coreApertureMat = registerDisposable(
      new THREE.MeshBasicMaterial({
        color: 0x7de7ff,
        blending: THREE.AdditiveBlending,
      })
    );
    const coreAperture = new THREE.Mesh(coreApertureGeo, coreApertureMat);
    orbitCenterGroup.add(coreAperture);

    // Multiple 3D Orbital Rings tilted on independent gimbal axes
    const createOrbitalRing = (radius, tube, tiltX, tiltY, tiltZ, colorHex, dashed = false) => {
      const ringGroup = new THREE.Group();
      ringGroup.rotation.set(tiltX, tiltY, tiltZ);

      const torusGeo = registerDisposable(new THREE.TorusGeometry(radius, tube, 16, 128));
      const torusMat = registerDisposable(
        new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: dashed ? 0.45 : 0.75,
          blending: THREE.AdditiveBlending,
        })
      );
      const ringMesh = new THREE.Mesh(torusGeo, torusMat);
      ringGroup.add(ringMesh);

      // Add peripheral tick marks along the ring
      const tickCount = 16;
      for (let t = 0; t < tickCount; t++) {
        const theta = (t / tickCount) * Math.PI * 2;
        const tickGeo = registerDisposable(new THREE.BoxGeometry(0.04, 0.22, 0.04));
        const tickMat = registerDisposable(
          new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending })
        );
        const tick = new THREE.Mesh(tickGeo, tickMat);
        tick.position.set(Math.cos(theta) * radius, Math.sin(theta) * radius, 0);
        tick.rotation.z = theta;
        ringGroup.add(tick);
      }

      orbitCenterGroup.add(ringGroup);
      return ringGroup;
    };

    // 3 Distinct Orbital Gimbal Rings
    const ringOuter = createOrbitalRing(6.6, 0.035, 0.55, 0.25, -0.15, 0x38bdf8);
    const ringMiddle = createOrbitalRing(5.2, 0.03, -0.4, 0.65, 0.35, 0x7de7ff, true);
    const ringInner = createOrbitalRing(3.8, 0.025, 0.25, -0.5, 0.5, 0x00f0ff);

    // --- 9. Realistic 3D Physical Event Equipment Models ---

    // 1. Line Array PA Speaker Module
    const createLineArraySpeaker = () => {
      const group = new THREE.Group();
      // Main trapezoidal cabinet
      const cabinetGeo = registerDisposable(new THREE.BoxGeometry(1.6, 0.9, 1.2));
      const cabinetMat = registerDisposable(
        new THREE.MeshStandardMaterial({ color: 0x111622, roughness: 0.4, metalness: 0.6 })
      );
      const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
      group.add(cabinet);

      // Front acoustic grille with dual horn waveguides
      const grilleGeo = registerDisposable(new THREE.BoxGeometry(1.5, 0.8, 0.08));
      const grilleMat = registerDisposable(
        new THREE.MeshStandardMaterial({ color: 0x070c14, roughness: 0.8, metalness: 0.3 })
      );
      const grille = new THREE.Mesh(grilleGeo, grilleMat);
      grille.position.z = 0.62;
      group.add(grille);

      // Dual High-Frequency acoustic horns
      [-0.45, 0.45].forEach((xOff) => {
        const hornGeo = registerDisposable(new THREE.ConeGeometry(0.28, 0.3, 16));
        const hornMat = registerDisposable(
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 })
        );
        const horn = new THREE.Mesh(hornGeo, hornMat);
        horn.rotation.x = Math.PI / 2;
        horn.position.set(xOff, 0, 0.62);
        group.add(horn);
      });

      // Aluminum rigging side plates
      [-0.82, 0.82].forEach((xOff) => {
        const pinPlateGeo = registerDisposable(new THREE.BoxGeometry(0.08, 0.95, 0.3));
        const pinPlateMat = registerDisposable(
          new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.2, metalness: 0.9 })
        );
        const plate = new THREE.Mesh(pinPlateGeo, pinPlateMat);
        plate.position.set(xOff, 0, 0);
        group.add(plate);
      });

      // Cyan status LED
      const ledGeo = registerDisposable(new THREE.SphereGeometry(0.05, 8, 8));
      const ledMat = registerDisposable(
        new THREE.MeshBasicMaterial({ color: 0x00f0ff, blending: THREE.AdditiveBlending })
      );
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(0.65, 0.35, 0.66);
      group.add(led);

      return group;
    };

    // 2. Moving Head Stage Spotlight
    const createMovingHeadLight = () => {
      const group = new THREE.Group();

      // Heavy base
      const baseGeo = registerDisposable(new THREE.CylinderGeometry(0.7, 0.8, 0.35, 16));
      const baseMat = registerDisposable(
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.7 })
      );
      const base = new THREE.Mesh(baseGeo, baseMat);
      group.add(base);

      // Rotating U-Yoke arms
      const yokeGroup = new THREE.Group();
      yokeGroup.position.y = 0.35;
      group.add(yokeGroup);

      const yokeBottomGeo = registerDisposable(new THREE.BoxGeometry(1.2, 0.15, 0.4));
      const yokeArmMat = registerDisposable(
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 })
      );
      const yokeBottom = new THREE.Mesh(yokeBottomGeo, yokeArmMat);
      yokeGroup.add(yokeBottom);

      [-0.55, 0.55].forEach((xOff) => {
        const armGeo = registerDisposable(new THREE.BoxGeometry(0.16, 0.8, 0.35));
        const arm = new THREE.Mesh(armGeo, yokeArmMat);
        arm.position.set(xOff, 0.45, 0);
        yokeGroup.add(arm);
      });

      // Spherical fixture head
      const headGeo = registerDisposable(new THREE.CylinderGeometry(0.45, 0.5, 0.75, 16));
      const headMat = registerDisposable(
        new THREE.MeshStandardMaterial({ color: 0x0a101d, roughness: 0.3, metalness: 0.7 })
      );
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 0.45;
      head.rotation.x = Math.PI / 3.5;
      yokeGroup.add(head);

      // Optical cyan lens emitting light
      const lensGeo = registerDisposable(new THREE.SphereGeometry(0.38, 16, 16));
      const lensMat = registerDisposable(
        new THREE.MeshBasicMaterial({ color: 0x7de7ff, blending: THREE.AdditiveBlending })
      );
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.position.set(0, 0.8, 0.4);
      yokeGroup.add(lens);

      // Mini spotlight beam cone originating from the lens
      const miniBeamGeo = registerDisposable(new THREE.CylinderGeometry(0.35, 1.8, 4.0, 16, 1, true));
      miniBeamGeo.translate(0, 2.0, 0);
      const miniBeamMat = registerDisposable(
        new THREE.MeshBasicMaterial({
          color: 0x00f0ff,
          transparent: true,
          opacity: 0.25,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      const miniBeam = new THREE.Mesh(miniBeamGeo, miniBeamMat);
      miniBeam.position.set(0, 0.8, 0.4);
      miniBeam.rotation.x = Math.PI / 3.5;
      yokeGroup.add(miniBeam);

      return group;
    };

    // 3. Professional Wireless Stage Microphone
    const createStageMicrophone = () => {
      const group = new THREE.Group();

      // Main handle
      const handleGeo = registerDisposable(new THREE.CylinderGeometry(0.12, 0.16, 1.4, 16));
      const handleMat = registerDisposable(
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.8 })
      );
      const handle = new THREE.Mesh(handleGeo, handleMat);
      group.add(handle);

      // Cyan accent ring
      const ringGeo = registerDisposable(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 16));
      const ringMat = registerDisposable(
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, blending: THREE.AdditiveBlending })
      );
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.55;
      group.add(ring);

      // Metallic mesh capsule grille
      const grilleGeo = registerDisposable(new THREE.SphereGeometry(0.26, 16, 16));
      const grilleMat = registerDisposable(
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.95 })
      );
      const grille = new THREE.Mesh(grilleGeo, grilleMat);
      grille.position.y = 0.85;
      group.add(grille);

      // Wireless antenna cap at bottom
      const antennaGeo = registerDisposable(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 12));
      const antennaMat = registerDisposable(
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.4 })
      );
      const antenna = new THREE.Mesh(antennaGeo, antennaMat);
      antenna.position.y = -0.8;
      group.add(antenna);

      return group;
    };

    // 4. 4K Event Projector
    const createStageProjector = () => {
      const group = new THREE.Group();

      // Main projector chassis
      const bodyGeo = registerDisposable(new THREE.BoxGeometry(1.6, 0.65, 1.3));
      const bodyMat = registerDisposable(
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.75 })
      );
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      // Large optical projection lens
      const lensOuterGeo = registerDisposable(new THREE.CylinderGeometry(0.32, 0.38, 0.4, 24));
      const lensOuterMat = registerDisposable(
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.2, metalness: 0.9 })
      );
      const lensOuter = new THREE.Mesh(lensOuterGeo, lensOuterMat);
      lensOuter.rotation.x = Math.PI / 2;
      lensOuter.position.set(0.35, 0, 0.7);
      group.add(lensOuter);

      // Glowing lens element
      const lensGlassGeo = registerDisposable(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 24));
      const lensGlassMat = registerDisposable(
        new THREE.MeshBasicMaterial({ color: 0x7de7ff, blending: THREE.AdditiveBlending })
      );
      const lensGlass = new THREE.Mesh(lensGlassGeo, lensGlassMat);
      lensGlass.rotation.x = Math.PI / 2;
      lensGlass.position.set(0.35, 0, 0.88);
      group.add(lensGlass);

      // Ventilation louvers
      [-0.3, 0, 0.3].forEach((zOff) => {
        const ventGeo = registerDisposable(new THREE.BoxGeometry(0.05, 0.4, 0.2));
        const ventMat = registerDisposable(
          new THREE.MeshBasicMaterial({ color: 0x020617 })
        );
        const vent = new THREE.Mesh(ventGeo, ventMat);
        vent.position.set(-0.81, 0, zOff);
        group.add(vent);
      });

      return group;
    };

    // 5. LED Video Wall Panel with Dynamic Animated Canvas Texture
    const createVideoWallPanel = () => {
      const group = new THREE.Group();

      // Frame
      const frameGeo = registerDisposable(new THREE.BoxGeometry(1.5, 1.5, 0.12));
      const frameMat = registerDisposable(
        new THREE.MeshStandardMaterial({ color: 0x0a101d, roughness: 0.4, metalness: 0.8 })
      );
      const frame = new THREE.Mesh(frameGeo, frameMat);
      group.add(frame);

      // Dynamic Canvas for Live Cybernetic Waveform Graphic
      const screenCanvas = document.createElement('canvas');
      screenCanvas.width = 256;
      screenCanvas.height = 256;
      const sctx = screenCanvas.getContext('2d');

      const screenTexture = registerDisposable(new THREE.CanvasTexture(screenCanvas));
      const screenGeo = registerDisposable(new THREE.PlaneGeometry(1.38, 1.38));
      const screenMat = registerDisposable(
        new THREE.MeshBasicMaterial({
          map: screenTexture,
          blending: THREE.AdditiveBlending,
        })
      );
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.z = 0.07;
      group.add(screen);

      return { group, screenCanvas, sctx, screenTexture };
    };

    // 6. Triangular Aluminum Stage Truss Segment
    const createStageTruss = () => {
      const group = new THREE.Group();
      const length = 2.4;
      const tubeRadius = 0.045;
      const trussRadius = 0.42;

      const metalMat = registerDisposable(
        new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.18, metalness: 0.95 })
      );

      // 3 Main Longitudinal Chords arranged in an equilateral triangle
      const chords = [];
      for (let i = 0; i < 3; i++) {
        const theta = (i / 3) * Math.PI * 2;
        const chordGeo = registerDisposable(new THREE.CylinderGeometry(tubeRadius, tubeRadius, length, 12));
        const chord = new THREE.Mesh(chordGeo, metalMat);
        chord.position.set(Math.cos(theta) * trussRadius, 0, Math.sin(theta) * trussRadius);
        group.add(chord);
        chords.push(chord.position);
      }

      // Diagonal Cross-Braces
      const braceCount = 7;
      const braceMat = registerDisposable(
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.9 })
      );
      for (let b = 0; b < braceCount; b++) {
        const yStart = -length / 2 + (b / braceCount) * length;
        const yEnd = yStart + length / braceCount;

        for (let side = 0; side < 3; side++) {
          const p1 = chords[side];
          const p2 = chords[(side + 1) % 3];

          const start = new THREE.Vector3(p1.x, yStart, p1.z);
          const end = new THREE.Vector3(p2.x, yEnd, p2.z);
          const dir = new THREE.Vector3().subVectors(end, start);
          const dist = dir.length();

          const braceGeo = registerDisposable(new THREE.CylinderGeometry(0.025, 0.025, dist, 8));
          braceGeo.translate(0, dist / 2, 0);
          braceGeo.rotateX(Math.PI / 2);

          const brace = new THREE.Mesh(braceGeo, braceMat);
          brace.position.copy(start);
          brace.lookAt(end);
          group.add(brace);
        }
      }

      return group;
    };

    // Instantiate the 6 Equipment Models
    const speakerModel = createLineArraySpeaker();
    const movingHeadModel = createMovingHeadLight();
    const micModel = createStageMicrophone();
    const projectorModel = createStageProjector();
    const videoWallObj = createVideoWallPanel();
    const trussModel = createStageTruss();

    const equipmentItems = [
      { mesh: speakerModel, radius: 5.6, speed: 0.35, offset: 0, tilt: [0.2, 0, 0] },
      { mesh: movingHeadModel, radius: 5.4, speed: 0.35, offset: (Math.PI * 2) / 6, tilt: [-0.3, 0.4, 0] },
      { mesh: micModel, radius: 5.2, speed: 0.35, offset: (Math.PI * 4) / 6, tilt: [0.5, 0, -0.4] },
      { mesh: projectorModel, radius: 5.5, speed: 0.35, offset: (Math.PI * 6) / 6, tilt: [0, 0.2, 0.1] },
      { mesh: videoWallObj.group, radius: 5.3, speed: 0.35, offset: (Math.PI * 8) / 6, tilt: [0.15, -0.2, 0] },
      { mesh: trussModel, radius: 5.5, speed: 0.35, offset: (Math.PI * 10) / 6, tilt: [0.4, 0.3, -0.2] },
    ];

    equipmentItems.forEach((item) => {
      orbitCenterGroup.add(item.mesh);
    });

    // --- 10. Interactive Parallax & Mouse Sway ---
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handlePointerMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetMouseX = x * 0.9;
      targetMouseY = y * 0.4;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // --- 11. Responsive Resize Handler ---
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // --- 12. Main 60 FPS Animation Loop ---
    let animationFrameId = null;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      const motionScale = prefersReducedMotion ? 0.25 : 1.0;

      // Parallax smooth interpolation
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      camera.position.x = currentMouseX * 1.5;
      camera.position.y = 1.8 + currentMouseY * 0.8;
      camera.lookAt(0, 0.6, 0);

      // Rotate Gimbal Rings on their 3D axes
      ringOuter.rotation.z += 0.003 * motionScale;
      ringMiddle.rotation.z -= 0.005 * motionScale;
      ringInner.rotation.z += 0.007 * motionScale;

      // Pulse Central Hologram Aperture
      const coreScale = 1 + Math.sin(elapsedTime * 3) * 0.04;
      coreAperture.scale.set(coreScale, coreScale, coreScale);

      // Animate 6 Equipment Models traveling along their 3D orbits
      equipmentItems.forEach((item, idx) => {
        const angle = elapsedTime * item.speed * motionScale + item.offset;
        const x = Math.cos(angle) * item.radius;
        const z = Math.sin(angle) * item.radius * 0.55; // Elliptical depth
        const y = Math.sin(angle * 2 + idx) * 0.4; // Undulating vertical float

        item.mesh.position.set(x, y, z);

        // Self-rotation and facing direction
        item.mesh.rotation.y = -angle + Math.PI / 2 + item.tilt[1];
        item.mesh.rotation.x = item.tilt[0] + Math.sin(elapsedTime + idx) * 0.08;
        item.mesh.rotation.z = item.tilt[2] + Math.cos(elapsedTime + idx) * 0.08;
      });

      // Update LED Video Wall dynamic texture
      if (videoWallObj && videoWallObj.sctx) {
        const { sctx, screenTexture } = videoWallObj;
        sctx.fillStyle = '#020617';
        sctx.fillRect(0, 0, 256, 256);

        // Cybernetic grid lines
        sctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
        sctx.lineWidth = 1;
        for (let g = 0; g < 256; g += 32) {
          sctx.beginPath();
          sctx.moveTo(0, g);
          sctx.lineTo(256, g);
          sctx.stroke();
          sctx.beginPath();
          sctx.moveTo(g, 0);
          sctx.lineTo(g, 256);
          sctx.stroke();
        }

        // Live Audio/Spectrum Waveform
        sctx.strokeStyle = '#38bdf8';
        sctx.lineWidth = 3;
        sctx.beginPath();
        for (let px = 0; px < 256; px += 4) {
          const py =
            128 +
            Math.sin(px * 0.08 + elapsedTime * 6) * 35 * Math.sin(elapsedTime * 2) +
            Math.cos(px * 0.04 - elapsedTime * 4) * 20;
          if (px === 0) sctx.moveTo(px, py);
          else sctx.lineTo(px, py);
        }
        sctx.stroke();

        // Secondary Magenta Harmonic Wave
        sctx.strokeStyle = '#ff2a8d';
        sctx.lineWidth = 2;
        sctx.beginPath();
        for (let px = 0; px < 256; px += 6) {
          const py = 128 + Math.cos(px * 0.1 - elapsedTime * 5) * 25;
          if (px === 0) sctx.moveTo(px, py);
          else sctx.lineTo(px, py);
        }
        sctx.stroke();

        screenTexture.needsUpdate = true;
      }

      // Animate Floor Cable Energy Pulse Orbs
      pulseOrbs.forEach((orb) => {
        const t = (elapsedTime * 0.35 + orb.offset) % 1;
        const pos = orb.curve.getPointAt(t);
        orb.mesh.position.copy(pos);
      });

      // Drift Atmospheric Stage Haze
      hazePlanes.forEach((hp) => {
        hp.mesh.position.x += hp.speedX * motionScale;
        if (hp.mesh.position.x > 12) hp.mesh.position.x = -12;
        hp.mesh.rotation.z = hp.baseZ + Math.sin(elapsedTime * 0.5) * 0.1;
      });

      // Drift Floating Sparkle Particles
      const posAttr = particleGeo.attributes.position;
      for (let i = 1; i < particleCount * 3; i += 3) {
        posAttr.array[i] += 0.008 * motionScale;
        if (posAttr.array[i] > 6.5) {
          posAttr.array[i] = -3.8;
        }
      }
      posAttr.needsUpdate = true;

      // Volumetric spotlight gentle sway and breath
      leftBeam.mat.opacity = 0.15 + Math.sin(elapsedTime * 1.8) * 0.04;
      rightBeam.mat.opacity = 0.15 + Math.cos(elapsedTime * 2.1) * 0.04;
      midLeftBeam.mat.opacity = 0.12 + Math.sin(elapsedTime * 1.5) * 0.03;
      midRightBeam.mat.opacity = 0.12 + Math.cos(elapsedTime * 1.7) * 0.03;

      // Cinematic Exit Contraction & Intensification
      if (isExiting) {
        // Contract the center orbit
        orbitCenterGroup.scale.lerp(new THREE.Vector3(0.65, 0.65, 0.65), 0.08);
        // Intensify spotlights
        spotLeft.intensity = THREE.MathUtils.lerp(spotLeft.intensity, 60, 0.1);
        spotRight.intensity = THREE.MathUtils.lerp(spotRight.intensity, 60, 0.1);
        leftBeam.mat.opacity = THREE.MathUtils.lerp(leftBeam.mat.opacity, 0.45, 0.1);
        rightBeam.mat.opacity = THREE.MathUtils.lerp(rightBeam.mat.opacity, 0.45, 0.1);
        midLeftBeam.mat.opacity = THREE.MathUtils.lerp(midLeftBeam.mat.opacity, 0.35, 0.1);
        midRightBeam.mat.opacity = THREE.MathUtils.lerp(midRightBeam.mat.opacity, 0.35, 0.1);
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- 13. Comprehensive Teardown on Unmount ---
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      // Clean up all allocated geometries, materials, and textures
      disposables.forEach((item) => {
        if (item && typeof item.dispose === 'function') {
          item.dispose();
        }
      });

      if (renderer) {
        renderer.dispose();
        if (renderer.forceContextLoss) {
          renderer.forceContextLoss();
        }
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, [isExiting, prefersReducedMotion]);

  return (
    <div
      ref={mountRef}
      className="aura-stage-canvas-wrap"
      aria-hidden="true"
    />
  );
}

export default CinematicStage3D;
