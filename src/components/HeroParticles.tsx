import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";

const COUNT = 2400;

/** A slowly turning galaxy of dust that leans toward the cursor. */
function Galaxy({ accent }: { accent: string }) {
  const points = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const a = new THREE.Color(accent);
    const b = new THREE.Color("#a78bfa");
    const c = new THREE.Color("#ffffff");
    for (let i = 0; i < COUNT; i++) {
      // Three loose spiral arms plus a sprinkle of background stars.
      const arm = i % 3;
      const r = Math.pow(Math.random(), 0.7) * 14 + 1.5;
      const angle = r * 0.45 + (arm * Math.PI * 2) / 3 + (Math.random() - 0.5) * 0.9;
      const spread = (Math.random() - 0.5) * (1.2 + r * 0.12);
      const isStar = Math.random() < 0.18;
      positions[i * 3] = isStar ? THREE.MathUtils.randFloatSpread(40) : Math.cos(angle) * r + spread;
      positions[i * 3 + 1] = isStar ? THREE.MathUtils.randFloatSpread(24) : (Math.random() - 0.5) * 1.6;
      positions[i * 3 + 2] = isStar ? THREE.MathUtils.randFloat(-20, -4) : Math.sin(angle) * r + spread;
      const col = isStar ? c : a.clone().lerp(b, Math.min(1, r / 14));
      colors.set([col.r, col.g, col.b], i * 3);
    }
    return { positions, colors };
  }, [accent]);

  useFrame(({ pointer, clock }, delta) => {
    const p = points.current;
    if (!p) return;
    p.rotation.y += delta * 0.04;
    // Lean toward the cursor with a little lag.
    p.rotation.x = THREE.MathUtils.lerp(p.rotation.x, 0.35 + pointer.y * 0.18, 0.04);
    p.rotation.z = THREE.MathUtils.lerp(p.rotation.z, -pointer.x * 0.12, 0.04);
    const s = 1 + Math.sin(clock.elapsedTime * 0.6) * 0.015;
    p.scale.setScalar(s);
  });

  return (
    <>
      <points ref={points} position={[0, -1.2, 0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

const HeroParticles = () => {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [accent, setAccent] = useState("#5eead4");

  // Stop rendering when the hero is off-screen or the tab is hidden.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Follow the theme accent (god mode turns it green).
  useEffect(() => {
    const read = () =>
      setAccent(getComputedStyle(document.documentElement).getPropertyValue("--accentColor").trim() || "#5eead4");
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  return (
    <div className="hero-particles" ref={wrap} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 2.5, 16], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        eventSource={document.body}
        eventPrefix="client"
      >
        <Galaxy accent={accent} />
        <EffectComposer enableNormalPass={false}>
          <Bloom intensity={1.1} luminanceThreshold={0.15} luminanceSmoothing={0.4} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default HeroParticles;
