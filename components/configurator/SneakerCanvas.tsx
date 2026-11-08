'use client';

import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {GLTFLoader, type GLTF} from 'three/addons/loaders/GLTFLoader.js';
import {productTints, type Colorway} from '@/lib/configurator/shop';
import {heroPose} from '@/lib/configurator/motion';

type Props = {colorway: Colorway; motion: boolean; turn: number; reset: number; onStatus: (status: 'ready' | 'unavailable') => void};
type Controller = {variant: (value: Colorway) => void; animate: (value: boolean) => void; turn: (value: number) => void; reset: () => void};

export default function SneakerCanvas({colorway, motion, turn, reset, onStatus}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<Controller | null>(null);
  const current = useRef({colorway, motion, turn, reset});
  useEffect(() => {current.current = {colorway, motion, turn, reset};}, [colorway, motion, turn, reset]);
  useEffect(() => {controllerRef.current?.variant(colorway);}, [colorway]);
  useEffect(() => {controllerRef.current?.animate(motion);}, [motion]);
  useEffect(() => {controllerRef.current?.turn(turn);}, [turn]);
  useEffect(() => {controllerRef.current?.reset();}, [reset]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // Own the canvas for this effect lifetime; Strict Mode can replay effects.
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {width: '100%', height: '100%', display: 'block', touchAction: 'pan-y', cursor: 'grab'});
    host.appendChild(canvas);
    let renderer: THREE.WebGLRenderer;
    try {
      const context = canvas.getContext('webgl2', {alpha: true, antialias: true, powerPreference: 'low-power'});
      if (!context || context.isContextLost()) {canvas.remove(); onStatus('unavailable'); return;}
      renderer = new THREE.WebGLRenderer({canvas, context, alpha: true, antialias: true});
    } catch {canvas.remove(); onStatus('unavailable'); return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, .1, 100);
    camera.position.set(0, .15, 4.2);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x72766a, 2.8));
    const key = new THREE.DirectionalLight(0xffffff, 3.5); key.position.set(2, 4, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0xe1eaff, 2); fill.position.set(-3, 1, -1); scene.add(fill);
    const pivot = new THREE.Group(); scene.add(pivot);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const abort = new AbortController();
    let disposed = false, loaded = false, visible = false, frame = 0, selectionPulse = 0;
    const hero = host.closest<HTMLElement>('[data-shift-hero]');
    let progress = Number(hero?.dataset.progress || 0);
    let activeColor: Colorway | null = null;
    let yaw = -.55, pitch = .18, scrollMotion = current.current.motion, dragging = false, lastX = 0, lastY = 0, lastTurn = current.current.turn;
    let materials: THREE.MeshStandardMaterial[] = [];
    const baseColors = new Map<THREE.Material, THREE.Color>();
    let gltf: GLTF | undefined;
    const draw = () => {
      if (disposed || !loaded || !visible || document.hidden) return;
      const pose = heroPose(scrollMotion && !reduced.matches ? progress : 0);
      pivot.rotation.set(pitch + pose.pitch, yaw + pose.yaw + selectionPulse * .2, -.24 + pose.roll);
      pivot.position.y = pose.lift + selectionPulse * .025;
      pivot.scale.setScalar(pose.scale * (1 - selectionPulse * .07));
      renderer.render(scene, camera);
    };
    const targetColors = (value: Colorway) => materials.map(material => baseColors.get(material)!.clone().multiply(new THREE.Color(productTints[value])));
    const settle = () => {
      cancelAnimationFrame(frame); frame = 0; selectionPulse = 0;
      if (activeColor) {const colors = targetColors(activeColor); materials.forEach((material, index) => material.color.copy(colors[index]));}
      draw();
    };
    const variant = (value: Colorway) => {
      if (!materials.length || value === activeColor) return;
      const first = activeColor === null;
      const from = materials.map(material => material.color.clone()), to = targetColors(value);
      activeColor = value;
      cancelAnimationFrame(frame); frame = 0; selectionPulse = 0;
      if (first || !scrollMotion || reduced.matches || !visible || document.hidden) {settle(); return;}
      const start = performance.now();
      const transition = (now: number) => {
        if (disposed || !visible || document.hidden || reduced.matches || !scrollMotion) {settle(); return;}
        const p = Math.min(1, (now - start) / 460);
        const eased = 1 - (1 - p) ** 3;
        materials.forEach((material, index) => material.color.copy(from[index]).lerp(to[index], eased));
        selectionPulse = Math.sin(p * Math.PI); draw();
        if (p < 1) frame = requestAnimationFrame(transition);
        else {frame = 0; selectionPulse = 0;}
      };
      frame = requestAnimationFrame(transition);
    };
    const onScroll = (event: Event) => {progress = (event as CustomEvent<number>).detail; draw();};
    hero?.addEventListener('shift:scroll', onScroll);
    controllerRef.current = {
      variant,
      animate: value => {scrollMotion = value; settle();},
      turn: value => {yaw += (value - lastTurn) * Math.PI / 6; lastTurn = value; draw();},
      reset: () => {yaw = -.55; pitch = .18; settle();}
    };
    const resize = new ResizeObserver(([entry]) => {
      const {width, height} = entry.contentRect;
      if (!width || !height) return;
      renderer.setSize(width, height, false); camera.aspect = width / height;
      // Keep the entire product inside the portrait phone viewport.
      camera.position.z = camera.aspect < 1.5 ? 4.1 : 3.8;
      camera.updateProjectionMatrix(); draw();
    });
    resize.observe(host);
    const intersection = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; settle();});
    intersection.observe(canvas);
    const down = (event: PointerEvent) => {if (event.button !== 0) return; dragging = true; lastX = event.clientX; lastY = event.clientY; canvas.setPointerCapture(event.pointerId); settle();};
    const move = (event: PointerEvent) => {if (!dragging) return; yaw += (event.clientX - lastX) * .009; pitch = THREE.MathUtils.clamp(pitch + (event.clientY - lastY) * .005, -.75, .75); lastX = event.clientX; lastY = event.clientY; draw();};
    const up = () => {dragging = false; draw();};
    const lost = (event: Event) => {event.preventDefault(); scrollMotion = false; cancelAnimationFrame(frame); onStatus('unavailable');};
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('lostpointercapture', up);
    canvas.addEventListener('webglcontextlost', lost);
    reduced.addEventListener('change', settle); document.addEventListener('visibilitychange', settle);
    const disposeModel = () => {
      const textures = new Set<THREE.Texture>();
      gltf?.scene.traverse(object => {if (object instanceof THREE.Mesh) object.geometry.dispose();});
      for (const material of materials) {
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
        material.dispose();
      }
      for (const texture of textures) {texture.dispose(); if (typeof ImageBitmap !== 'undefined' && texture.image instanceof ImageBitmap) texture.image.close();}
    };
    (async () => {
      try {
        const response = await fetch('/templates/shift/air-jordan-1.glb', {signal: abort.signal});
        if (!response.ok) throw new Error('Model unavailable');
        gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), '/templates/shift/');
        const unique = new Set<THREE.MeshStandardMaterial>();
        gltf.scene.traverse(object => {
          if (object instanceof THREE.Mesh) for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            if (material instanceof THREE.MeshStandardMaterial) unique.add(material);
          }
        });
        materials = [...unique];
        materials.forEach(material => baseColors.set(material, material.color.clone()));
        if (disposed) {disposeModel(); return;}
        // The downloaded model's long axis is Z. Present its outside profile.
        gltf.scene.rotation.y = Math.PI / 2;
        const bounds = new THREE.Box3().setFromObject(gltf.scene);
        const size = bounds.getSize(new THREE.Vector3()), center = bounds.getCenter(new THREE.Vector3());
        const scale = 2.2 / Math.max(size.x, size.y, size.z);
        gltf.scene.position.copy(center).multiplyScalar(-scale);
        gltf.scene.scale.setScalar(scale);
        pivot.add(gltf.scene); loaded = true;
        variant(current.current.colorway); onStatus('ready'); draw();
      } catch {if (!disposed) onStatus('unavailable');}
    })();
    return () => {
      disposed = true; abort.abort(); cancelAnimationFrame(frame); controllerRef.current = null;
      resize.disconnect(); intersection.disconnect();
      reduced.removeEventListener('change', settle); document.removeEventListener('visibilitychange', settle);
      hero?.removeEventListener('shift:scroll', onScroll);
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); canvas.removeEventListener('lostpointercapture', up);
      canvas.removeEventListener('webglcontextlost', lost);
      disposeModel(); renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
    };
  }, [onStatus]);

  return <div ref={hostRef} style={{width: '100%', height: '100%'}} />;
}
