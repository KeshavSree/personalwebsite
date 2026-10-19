"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { buildMonument, disposeMonument, monumentAnchors, retargetStairs, type MovingParts } from "./MonumentWorld";

export type SceneName = "home" | "experience" | "projects" | "involvement" | "about";

type Pose = {
  leftX: number; leftY: number; leftZ: number; leftTurn: number;
  rightX: number; rightY: number; rightZ: number; rightTurn: number;
  galleryY: number; galleryTurn: number;
  courtY: number; courtTurn: number;
  crossingY: number; crossingTurn: number; crossingTilt: number;
};

const poses: Record<SceneName, Pose> = {
  home: { leftX: 0, leftY: 0, leftZ: 0, leftTurn: 0, rightX: 0, rightY: 0, rightZ: 0, rightTurn: 0, galleryY: 0, galleryTurn: 0, courtY: 0, courtTurn: 0, crossingY: 0, crossingTurn: 0, crossingTilt: 0 },
  experience: { leftX: -.5, leftY: .75, leftZ: 0, leftTurn: Math.PI / 2, rightX: 0, rightY: .5, rightZ: .5, rightTurn: 0, galleryY: .25, galleryTurn: 0, courtY: 0, courtTurn: 0, crossingY: .5, crossingTurn: Math.PI / 2, crossingTilt: 0 },
  projects: { leftX: -.5, leftY: -.25, leftZ: .2, leftTurn: Math.PI / 2, rightX: -.5, rightY: .75, rightZ: .5, rightTurn: Math.PI / 2, galleryY: .5, galleryTurn: Math.PI / 2, courtY: .25, courtTurn: 0, crossingY: .75, crossingTurn: 0, crossingTilt: 0 },
  involvement: { leftX: .25, leftY: .5, leftZ: -.25, leftTurn: -Math.PI / 2, rightX: .5, rightY: -.25, rightZ: -.5, rightTurn: -Math.PI / 2, galleryY: -.25, galleryTurn: 0, courtY: .5, courtTurn: 0, crossingY: -.5, crossingTurn: -Math.PI / 2, crossingTilt: 0 },
  about: { leftX: 0, leftY: 1, leftZ: .2, leftTurn: Math.PI, rightX: -.5, rightY: 1, rightZ: .25, rightTurn: Math.PI / 2, galleryY: .75, galleryTurn: Math.PI / 2, courtY: -.25, courtTurn: 0, crossingY: 1, crossingTurn: Math.PI / 2, crossingTilt: 0 },
};
const poseKeys = Object.keys(poses.home) as (keyof Pose)[];
const copyPose = (pose: Pose): Pose => ({ ...pose });
const blend = (from: Pose, to: Pose, progress: number): Pose => Object.fromEntries(poseKeys.map((key) => [key, from[key] + (to[key] - from[key]) * progress])) as Pose;

function setParts(parts: MovingParts, pose: Pose) {
  parts.leftTower.position.set(monumentAnchors.leftTower[0] + pose.leftX, monumentAnchors.leftTower[1] + pose.leftY, monumentAnchors.leftTower[2] + pose.leftZ);
  parts.leftTower.rotation.y = pose.leftTurn;
  retargetStairs(parts.leftStairs,
    [parts.leftTower.position.x, parts.leftTower.position.y + 4.5, parts.leftTower.position.z],
    [-.55, 2.25, parts.leftTower.position.z]);
  parts.rightTower.position.set(monumentAnchors.rightTower[0] + pose.rightX, monumentAnchors.rightTower[1] + pose.rightY, monumentAnchors.rightTower[2] + pose.rightZ);
  parts.rightTower.rotation.y = pose.rightTurn;
  parts.upperGallery.position.y = monumentAnchors.upperGallery[1] + pose.galleryY;
  parts.upperGallery.rotation.y = pose.galleryTurn;
  parts.lowerCourt.position.y = monumentAnchors.lowerCourt[1] + pose.courtY;
  parts.lowerCourt.rotation.y = pose.courtTurn;
  parts.crossing.position.y = monumentAnchors.crossing[1] + pose.crossingY;
  parts.crossing.rotation.y = pose.crossingTurn;
  parts.crossing.rotation.z = pose.crossingTilt;
}

export default function MonumentArtwork({ scene }: { scene: SceneName }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<SceneName>(scene);
  const [failed, setFailed] = useState(false);
  targetRef.current = scene;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0xffffff, 0);
    renderer.domElement.className = "mv-three-canvas";
    host.appendChild(renderer.domElement);

    const { scene: world, parts } = buildMonument();
    const camera = new THREE.OrthographicCamera(-5.5, 5.5, 8.2, -8.2, .1, 100);
    const lookAt = new THREE.Vector3(0, .9, 0);
    camera.position.copy(lookAt).add(new THREE.Vector3(12.5, 12.5, 12.5));
    camera.lookAt(lookAt);
    const cameraRay = new THREE.Vector3().subVectors(camera.position, lookAt).normalize();
    const root = parts.crossing.parent as THREE.Group;
    const worldEnd = new THREE.Vector3();
    const projectedLanding = new THREE.Vector3();
    const travelerPoint = new THREE.Vector3();
    const from = copyPose(poses[targetRef.current]);
    const current = copyPose(from);
    let destination = copyPose(from);
    let start = 0;
    let moving = false;
    let hasTransition = false;
    let dirty = true;
    let disposed = false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resize = () => {
      const width = host.clientWidth || 1;
      const height = host.clientHeight || 1;
      renderer.setSize(width, height, false);
      const aspect = width / height;
      camera.left = -8.2 * aspect;
      camera.right = 8.2 * aspect;
      camera.top = 8.2;
      camera.bottom = -8.2;
      camera.updateProjectionMatrix();
      dirty = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const tick = (time: number) => {
      if (disposed || document.hidden) return;
      const next = poses[targetRef.current];
      if (poseKeys.some((key) => next[key] !== destination[key])) {
        Object.assign(from, current);
        destination = copyPose(next);
        start = time;
        hasTransition = true;
        moving = !reduceMotion.matches;
        if (!moving) Object.assign(current, destination);
        dirty = true;
      }
      let progress = 1;
      if (moving) {
        progress = Math.min(1, (time - start) / 1600);
        const eased = progress * progress * (3 - 2 * progress);
        Object.assign(current, blend(from, destination, eased));
        if (progress >= 1) moving = false;
        dirty = true;
      }
      const travelTime = time - start;
      const walking = hasTransition && targetRef.current !== "home" && travelTime > 1600 && travelTime < 2750;
      if (walking) dirty = true;
      if (!dirty) return;
      setParts(parts, current);
      root.updateMatrixWorld(true);
      parts.crossingEnd.getWorldPosition(worldEnd);
      // This landing lies on the same camera ray as the bridge endpoint,
      // but is physically 1.35 world units away. Only the fixed view joins
      // them. During motion, a sideways detour opens the route visibly.
      projectedLanding.copy(worldEnd).addScaledVector(cameraRay, 1.35);
      root.worldToLocal(projectedLanding);
      if (moving) projectedLanding.x += .34 * Math.sin(progress * Math.PI);
      parts.impossibleLanding.position.copy(projectedLanding);
      if (!hasTransition || targetRef.current === "home" || travelTime <= 1600) {
        travelerPoint.set(0, .03, 0);
        parts.crossing.localToWorld(travelerPoint);
        root.worldToLocal(travelerPoint);
      } else if (travelTime < 2600) {
        const walk = Math.min(1, (travelTime - 1600) / 1000);
        travelerPoint.set(1.76 * walk, .03, 0);
        parts.crossing.localToWorld(travelerPoint);
        root.worldToLocal(travelerPoint);
      } else {
        // The avatar changes world depth at the screen-space join. Its pixel
        // remains continuous because the two places share one camera ray.
        travelerPoint.copy(parts.impossibleLanding.position);
        travelerPoint.y += .03;
      }
      parts.traveler.position.copy(travelerPoint);
      renderer.render(world, camera);
      dirty = false;
    };
    renderer.setAnimationLoop(tick);
    const visible = () => { dirty = true; };
    document.addEventListener("visibilitychange", visible);

    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      document.removeEventListener("visibilitychange", visible);
      observer.disconnect();
      disposeMonument(world);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="mv-artwork" ref={hostRef} role="img" aria-label={`Three-dimensional impossible pink monument configured for ${scene}`}>
    {failed && <><span className="sr-only">3D view unavailable; the portfolio sections remain accessible.</span>{/* eslint-disable-next-line @next/next/no-img-element */}<img className="mv-art-image" src="/monument-valley-art/fold.png" alt="" /></>}
  </div>;
}
