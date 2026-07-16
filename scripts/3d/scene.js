// Sdílená 3D scéna prémiových brýlí Optik Dvořák.
// Export: buildGlasses(THREE) -> {group, updateEnv(renderer,scene)}
export function buildScene(THREE, renderer, width, height, opts = {}) {
  const LIGHT = opts.light !== false;
  const scene = new THREE.Scene();

  // --- barvy palety ---
  const GOLD = 0xE7B92E;
  const paperTop = LIGHT ? '#FBF7EC' : '#26241f';
  const paperBot = LIGHT ? '#E6DCC6' : '#0c0b0a';

  // --- pozadí: teplý studiový přechod ---
  function gradTex(w, h, top, bot, radial) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d');
    let g;
    if (radial) { g = x.createRadialGradient(w/2, h*0.42, h*0.05, w/2, h*0.5, h*0.72); }
    else { g = x.createLinearGradient(0, 0, 0, h); }
    g.addColorStop(0, top); g.addColorStop(1, bot);
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  scene.background = gradTex(1024, 1024, paperTop, paperBot, true);

  // --- prostředí pro odrazy (equirekt. studio se softboxy) ---
  const envC = document.createElement('canvas'); envC.width = 1024; envC.height = 512;
  const ex = envC.getContext('2d');
  let eg = ex.createLinearGradient(0, 0, 0, 512);
  eg.addColorStop(0, '#fff6e2'); eg.addColorStop(0.45, '#b7ad96'); eg.addColorStop(1, '#2b2822');
  ex.fillStyle = eg; ex.fillRect(0, 0, 1024, 512);
  // ostré jasné softboxy → výrazné kovové lesky na zlatě
  const box = (cx, cy, w, h, col) => { ex.fillStyle = col; ex.beginPath();
    ex.ellipse(cx, cy, w, h, 0, 0, Math.PI*2); ex.fill(); };
  box(250, 120, 190, 120, '#ffffff');
  box(720, 90, 150, 80, '#ffffff');
  box(880, 240, 70, 240, '#fff7e0');     // vertikální pruh (lesk podél obruby)
  box(150, 300, 60, 200, '#ffffff');
  box(520, 430, 320, 60, 'rgba(255,255,255,0.7)');
  const envTex = new THREE.CanvasTexture(envC);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  envTex.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromEquirectangular(envTex).texture;
  scene.environment = envMap;

  // --- materiály ---
  const goldMat = new THREE.MeshPhysicalMaterial({
    color: GOLD, metalness: 1.0, roughness: 0.11,
    envMap, envMapIntensity: 2.1, clearcoat: 0.5, clearcoatRoughness: 0.12,
  });
  const goldDark = new THREE.MeshPhysicalMaterial({
    color: 0xB98D14, metalness: 1.0, roughness: 0.22, envMap, envMapIntensity: 1.5,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0.04, transmission: 1.0, ior: 1.5,
    thickness: 0.6, envMap, envMapIntensity: 1.0, transparent: true,
    clearcoat: 1.0, clearcoatRoughness: 0.06, attenuationColor: 0xfff3dc, attenuationDistance: 4,
  });

  // --- geometrie brýlí ---
  const g = new THREE.Group();
  const R = 1.0, TUBE = 0.115, GAPc = 1.16;

  function lens(sign) {
    const grp = new THREE.Group();
    grp.position.x = sign * GAPc;
    // obruba (torus)
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, TUBE, 40, 120), goldMat);
    rim.castShadow = true; grp.add(rim);
    // vnitřní jemný prstenec (bevel detail)
    const rim2 = new THREE.Mesh(new THREE.TorusGeometry(R - TUBE*0.7, TUBE*0.34, 24, 120), goldDark);
    grp.add(rim2);
    // biconvexní sklo (zploštělá koule)
    const gl = new THREE.Mesh(new THREE.SphereGeometry(R - TUBE*0.5, 96, 64), glassMat);
    gl.scale.set(1, 1, 0.12);
    grp.add(gl);
    return grp;
  }
  g.add(lens(-1)); g.add(lens(1));

  // most (ohnutá trubka mezi horními vnitřními okraji)
  const bx = GAPc - R + TUBE*0.5;
  const bridgeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-bx, 0.02, 0.02),
    new THREE.Vector3(-bx*0.5, 0.34, 0.06),
    new THREE.Vector3(bx*0.5, 0.34, 0.06),
    new THREE.Vector3(bx, 0.02, 0.02),
  ]);
  const bridge = new THREE.Mesh(new THREE.TubeGeometry(bridgeCurve, 48, TUBE*0.82, 20, false), goldMat);
  bridge.castShadow = true; g.add(bridge);

  // stranice (od vnějších okrajů dozadu + kloub s nýtem)
  function temple(sign) {
    const t = new THREE.Group();
    const jointX = sign * (GAPc + R - TUBE*0.4);
    // kloub
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(TUBE*0.9, TUBE*0.9, TUBE*1.4, 20), goldMat);
    hinge.rotation.x = Math.PI/2; hinge.position.set(jointX, 0.05, 0); t.add(hinge);
    // rameno dozadu, mírně nahoru
    const armCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(jointX, 0.05, 0),
      new THREE.Vector3(jointX + sign*0.12, 0.09, -0.55),
      new THREE.Vector3(jointX + sign*0.05, 0.16, -1.25),
      new THREE.Vector3(jointX - sign*0.02, 0.14, -1.72),
    ]);
    const arm = new THREE.Mesh(new THREE.TubeGeometry(armCurve, 40, TUBE*0.62, 16, false), goldMat);
    arm.castShadow = true; t.add(arm);
    // nýt
    const rivet = new THREE.Mesh(new THREE.SphereGeometry(TUBE*0.5, 16, 16), goldMat);
    rivet.position.set(jointX, 0.05, TUBE*0.7); t.add(rivet);
    return t;
  }
  g.add(temple(-1)); g.add(temple(1));

  // lehké natočení do 3/4 perspektivy
  g.rotation.y = -0.34;
  g.rotation.x = 0.13;
  g.rotation.z = 0.015;
  g.scale.setScalar(0.92);
  scene.add(g);

  // --- kontaktní stín (shadow-catcher) ---
  const dir = new THREE.DirectionalLight(0xffffff, 1.15);
  dir.position.set(1.4, 6.0, 2.2); dir.castShadow = true;
  dir.shadow.mapSize.set(2048, 2048);
  dir.shadow.camera.near = 1; dir.shadow.camera.far = 24;
  dir.shadow.camera.left = -5; dir.shadow.camera.right = 5;
  dir.shadow.camera.top = 5; dir.shadow.camera.bottom = -5;
  dir.shadow.radius = 14; dir.shadow.bias = -0.0006;
  scene.add(dir);
  scene.add(new THREE.DirectionalLight(0xfff0d8, 0.3).translateX(-4).translateY(1).translateZ(2));
  scene.add(new THREE.AmbientLight(0xffffff, 0.28));

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.ShadowMaterial({ opacity: LIGHT ? 0.16 : 0.42 })
  );
  ground.rotation.x = -Math.PI/2; ground.position.y = -1.35; ground.receiveShadow = true;
  scene.add(ground);

  const camera = new THREE.PerspectiveCamera(30, width/height, 0.1, 100);
  camera.position.set(0.1, 0.34, 10.7);
  camera.lookAt(0, 0.05, 0);

  return { scene, camera, glasses: g };
}
