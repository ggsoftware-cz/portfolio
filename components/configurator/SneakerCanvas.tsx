'use client';

import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {GLTFLoader, type GLTF} from 'three/addons/loaders/GLTFLoader.js';
import type {Colorway} from '@/lib/configurator/shop';

type Props = {colorway: Colorway; motion: boolean; turn: number; reset: number; onStatus: (status: 'ready' | 'unavailable') => void};
type Controller = {variant: (value: Colorway) => void; animate: (value: boolean) => void; turn: (value: number) => void; reset: () => void};

export default function SneakerCanvas({colorway, motion, turn, reset, onStatus}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<Controller | null>(null);
  const current = useRef({colorway, motion, turn, reset});
  useEffect(() => {current.current = {colorway, motion, turn, reset}; controllerRef.current?.variant(colorway); controllerRef.current?.animate(motion);}, [colorway, motion, turn, reset]);
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
    let disposed = false, loaded = false, visible = false, frame = 0, time = 0, previousTime = 0;
    let yaw = .4, pitch = .12, auto = current.current.motion, dragging = false, lastX = 0, lastY = 0, lastTurn = current.current.turn;
    let materials: THREE.Material[] = [];
    let gltf: GLTF | undefined;
    const draw = () => {
      if (disposed || !loaded) return;
      pivot.rotation.set(pitch, yaw, -.3);
      pivot.position.y = auto && !reduced.matches && !dragging ? Math.sin(time * .7) * .045 : 0;
      renderer.render(scene, camera);
    };
    const shouldAnimate = () => loaded && visible && auto && !reduced.matches && !document.hidden && !dragging;
    const tick = (now: number) => {
      if (!shouldAnimate() || disposed) {frame = 0; return;}
      const elapsed = Math.min((now - previousTime) / 1000, .05);
      previousTime = now; time += elapsed;
      // A gentle turntable movement keeps the silhouette readable.
      yaw += elapsed * .13;
      draw(); frame = requestAnimationFrame(tick);
    };
    const refresh = () => {cancelAnimationFrame(frame); frame = 0; draw(); if (shouldAnimate()) {previousTime = performance.now(); frame = requestAnimationFrame(tick);}};
    const variant = (value: Colorway) => {
      const material = materials[{midnight: 0, beach: 1, street: 2}[value]];
      if (material) pivot.traverse(object => {if (object instanceof THREE.Mesh) object.material = material;});
      draw();
    };
    controllerRef.current = {
      variant,
      animate: value => {auto = value; refresh();},
      turn: value => {yaw += (value - lastTurn) * Math.PI / 6; lastTurn = value; refresh();},
      reset: () => {yaw = .4; pitch = .12; time = 0; refresh();}
    };
    const resize = new ResizeObserver(([entry]) => {
      const {width, height} = entry.contentRect;
      if (!width || !height) return;
      renderer.setSize(width, height, false); camera.aspect = width / height;
      // Keep the entire product inside the portrait phone viewport.
      camera.position.z = camera.aspect < 1.5 ? 4.1 : 3.2;
      camera.updateProjectionMatrix(); draw();
    });
    resize.observe(host);
    const intersection = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; refresh();});
    intersection.observe(canvas);
    const down = (event: PointerEvent) => {if (event.button !== 0) return; dragging = true; lastX = event.clientX; lastY = event.clientY; canvas.setPointerCapture(event.pointerId); refresh();};
    const move = (event: PointerEvent) => {if (!dragging) return; yaw += (event.clientX - lastX) * .009; pitch = THREE.MathUtils.clamp(pitch + (event.clientY - lastY) * .005, -.75, .75); lastX = event.clientX; lastY = event.clientY; draw();};
    const up = () => {dragging = false; refresh();};
    const lost = (event: Event) => {event.preventDefault(); auto = false; cancelAnimationFrame(frame); onStatus('unavailable');};
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('lostpointercapture', up);
    canvas.addEventListener('webglcontextlost', lost);
    reduced.addEventListener('change', refresh); document.addEventListener('visibilitychange', refresh);
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
        const response = await fetch('/templates/shift/sneaker.glb', {signal: abort.signal});
        if (!response.ok) throw new Error('Model unavailable');
        gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), '/templates/shift/');
        materials = await Promise.all([0, 1, 2].map(index => gltf!.parser.getDependency('material', index)));
        if (disposed) {disposeModel(); return;}
        const bounds = new THREE.Box3().setFromObject(gltf.scene);
        const size = bounds.getSize(new THREE.Vector3()), center = bounds.getCenter(new THREE.Vector3());
        const scale = 2.2 / Math.max(size.x, size.y, size.z);
        gltf.scene.position.copy(center).multiplyScalar(-scale);
        gltf.scene.scale.setScalar(scale);
        pivot.add(gltf.scene); loaded = true;
        variant(current.current.colorway); onStatus('ready'); refresh();
      } catch {if (!disposed) onStatus('unavailable');}
    })();
    return () => {
      disposed = true; abort.abort(); cancelAnimationFrame(frame); controllerRef.current = null;
      resize.disconnect(); intersection.disconnect();
      reduced.removeEventListener('change', refresh); document.removeEventListener('visibilitychange', refresh);
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); canvas.removeEventListener('lostpointercapture', up);
      canvas.removeEventListener('webglcontextlost', lost);
      disposeModel(); renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
    };
  }, [onStatus]);

  return <div ref={hostRef} style={{width: '100%', height: '100%'}} />;
}
