import * as THREE from "three";
import {buildObservatory, SLATE_LAYER} from "./ObservatoryWorld";

/** Preserve connected surface shading, then assign the whole image impossible depth. */
export function createObservatoryRenderer(
  renderer: THREE.WebGLRenderer,
  world: ReturnType<typeof buildObservatory>,
  camera: THREE.OrthographicCamera,
) {
  // All optical passes share the same transforms. Update them explicitly when
  // geometry changes instead of traversing the entire scene on every pass.
  const automaticWorldUpdates=world.scene.matrixWorldAutoUpdate;
  world.scene.updateMatrixWorld(true);
  world.scene.matrixWorldAutoUpdate=false;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate=false;
  const shadowPass=new THREE.WebGLRenderTarget(1,1);
  const depthOnly=new THREE.MeshBasicMaterial({colorWrite:false});
  const target = new THREE.WebGLRenderTarget(1, 1, {samples: 4});
  target.texture.colorSpace = THREE.LinearSRGBColorSpace;
  const resolution = new THREE.Vector2();
  const geometry = new THREE.PlaneGeometry(100, 100);
  const material = new THREE.ShaderMaterial({
    uniforms: {picture: {value: target.texture}, resolution: {value: resolution}},
    transparent: true,
    depthWrite: false,
    vertexShader: `void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `
      uniform sampler2D picture;
      uniform vec2 resolution;
      void main(){
        vec4 color=texture2D(picture,gl_FragCoord.xy/resolution);
        if(color.a<0.0001)discard;
        // Multisample coverage was resolved against transparent black.
        // Unpremultiply before the final color conversion and alpha blend.
        color.rgb/=color.a;
        gl_FragColor=color;
        #include <colorspace_fragment>
      }`,
  });
  const image = new THREE.Mesh(geometry, material);
  image.name = "gray-frame-optical-depth-plane";
  image.position.z = world.slateDepth;
  image.renderOrder = 1000;
  world.scene.add(image);

  const liftDepth=world.root.getObjectByName("left-lift-impossible-depth")!;
  const liftDeck=world.architecture.courtyardLift.deck;
  const opticalLiftPosition=liftDepth.position.clone();
  const opticalDeckPosition=liftDeck.position.clone();
  const crownLayer=2;
  liftDeck.traverse(part=>part.layers.enable(crownLayer));

  // The courtyard shaft is optically behind the ivory path, but must hide
  // the stair where their silhouettes cross. Cut its exact silhouette out
  // of the turquoise pass, revealing the normally shaded tower underneath.
  // Keep the gazebo in its existing shared depth pass, including its openings.
  const towerMask=new THREE.Group();towerMask.name="courtyard-stair-occlusion";
  const towerMasks:{source:THREE.Mesh;mask:THREE.Mesh}[]=[];
  liftDepth.traverse(part=>{
    if(!(part instanceof THREE.Mesh))return;
    for(let parent:THREE.Object3D|null=part;parent;parent=parent.parent)
      if(parent===liftDeck)return;
    const mask=new THREE.Mesh(part.geometry,depthOnly);
    mask.layers.set(SLATE_LAYER);mask.matrixAutoUpdate=false;
    towerMask.add(mask);towerMasks.push({source:part,mask});
  });
  towerMask.visible=false;world.scene.add(towerMask);
  const maskOffset=new THREE.Vector3();
  const capRenderPosition=new THREE.Vector3(),shaftRenderPosition=new THREE.Vector3();
  const rearRenderPosition=new THREE.Vector3(),rearCrownRenderPosition=new THREE.Vector3();

  const surfaceMaterials=new Set<THREE.Material>([world.hiddenCap,world.slateMaterial]);
  world.root.traverse(part=>{
    if(part instanceof THREE.Mesh)
      for(const material of Array.isArray(part.material)?part.material:[part.material])surfaceMaterials.add(material);
  });
  const colorWrites=new Map([...surfaceMaterials].map(material=>[material,material.colorWrite]));

  // Resolve the nearest surface before fading color. Otherwise farther faces
  // blend through nearer blocks according to mesh order, outlining each piece.
  function renderFoggedLayer(includeComposite:boolean,preserveColor=false){
    image.visible=false;
    if(preserveColor){renderer.autoClear=false;renderer.clearDepth();}
    // Use the exact color-pass vertex shader and polygon offsets. A generic
    // depth shader can round moving pavilion faces differently and reject
    // their color fragments, making the walls sparkle or disappear.
    for(const material of surfaceMaterials)material.colorWrite=false;
    renderer.render(world.scene,camera);
    for(const material of surfaceMaterials)material.colorWrite=colorWrites.get(material)!;
    image.visible=includeComposite;
    renderer.autoClear=false;
    renderer.render(world.scene,camera);
    renderer.autoClear=true;
  }

  return {
    resize() {
      renderer.getDrawingBufferSize(resolution);
      target.setSize(resolution.x, resolution.y);
    },
    render() {
      const mask = camera.layers.mask;
      // Build ONE shadow map containing both geometry layers. Rebuilding for
      // each optical pass would make the other layer's shadows disappear.
      camera.layers.enableAll();
      image.visible=false;
      world.scene.overrideMaterial=depthOnly;
      renderer.shadowMap.needsUpdate=true;
      renderer.setRenderTarget(shadowPass);
      // Cast from the connected geometry, not its artificial optical depths.
      liftDepth.position.set(0,0,0);
      liftDeck.position.subScalar(opticalDeckPosition.x);
      const shadowOffset=world.homeShadowOffset.value;
      capRenderPosition.copy(world.cap.position);
      shaftRenderPosition.copy(world.frontShaft.position);
      world.cap.position.addScalar(shadowOffset);
      world.frontShaft.position.addScalar(shadowOffset);
      rearRenderPosition.copy(world.rearShaft.position);
      rearCrownRenderPosition.copy(world.rearCrown.position);
      world.rearShaft.position.addScalar(world.homeRearShadowOffset.value);
      world.rearCrown.position.addScalar(world.homeRearShadowOffset.value);
      // The hidden sleeve ends beneath the connected bridge in shadow space.
      world.rearCrown.position.y-=world.homeRearCrownShadowDrop;
      world.scene.updateMatrixWorld(true);
      renderer.render(world.scene,camera);
      world.rearShaft.position.copy(rearRenderPosition);
      world.rearCrown.position.copy(rearCrownRenderPosition);
      world.cap.position.copy(capRenderPosition);
      world.frontShaft.position.copy(shaftRenderPosition);
      liftDepth.position.copy(opticalLiftPosition);
      liftDeck.position.copy(opticalDeckPosition);
      world.scene.overrideMaterial=null;
      image.visible=true;
      world.root.updateMatrixWorld(true);
      // Move only invisible masks toward the eye along the viewing ray;
      // this preserves every projected edge and never changes cast shadows.
      camera.getWorldDirection(maskOffset).multiplyScalar(-14);
      for(const {source,mask} of towerMasks){
        mask.matrix.copy(source.matrixWorld);
        mask.matrix.elements[12]+=maskOffset.x;
        mask.matrix.elements[13]+=maskOffset.y;
        mask.matrix.elements[14]+=maskOffset.z;
        mask.matrixWorldNeedsUpdate=true;
      }
      towerMask.updateMatrixWorld(true);
      towerMask.visible=true;
      liftDeck.visible=false;
      camera.layers.set(SLATE_LAYER);
      renderer.setRenderTarget(target);
      renderFoggedLayer(false);
      towerMask.visible=false;
      // The shaft mask must never punch holes in its own gazebo base.
      // Resolve the complete crown against itself above the masked stair
      // image, so its floor and pink plinth remain one continuous solid.
      liftDeck.visible=true;
      camera.layers.set(crownLayer);
      renderFoggedLayer(false,true);
      camera.layers.mask = mask;
      renderer.setRenderTarget(null);
      // This XY plane intersects each viewing ray at a depth between the white
      // pillars. Their ordinary depth buffer masks the composite correctly.
      renderFoggedLayer(true);
    },
    dispose() {
      world.scene.matrixWorldAutoUpdate=automaticWorldUpdates;
      image.removeFromParent();
      towerMask.removeFromParent();
      liftDeck.traverse(part=>part.layers.disable(crownLayer));
      geometry.dispose();
      material.dispose();
      target.dispose();shadowPass.dispose();depthOnly.dispose();
    },
  };
}
