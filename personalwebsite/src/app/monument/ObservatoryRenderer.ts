import * as THREE from "three";
import {buildObservatory, SLATE_LAYER} from "./ObservatoryWorld";

/** Preserve connected surface shading, then assign the whole image impossible depth. */
export function createObservatoryRenderer(
  renderer: THREE.WebGLRenderer,
  world: ReturnType<typeof buildObservatory>,
  camera: THREE.OrthographicCamera,
) {
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

  return {
    resize() {
      renderer.getDrawingBufferSize(resolution);
      target.setSize(resolution.x, resolution.y);
    },
    render() {
      const mask = camera.layers.mask;
      camera.layers.set(SLATE_LAYER);
      renderer.setRenderTarget(target);
      renderer.render(world.scene, camera);
      camera.layers.mask = mask;
      renderer.setRenderTarget(null);
      // This XY plane intersects each viewing ray at a depth between the white
      // pillars. Their ordinary depth buffer masks the composite correctly.
      renderer.render(world.scene, camera);
    },
    dispose() {
      image.removeFromParent();
      geometry.dispose();
      material.dispose();
      target.dispose();
    },
  };
}
