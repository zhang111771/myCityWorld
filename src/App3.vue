<template>
    <div ref="container"></div>
    <BigScreen />
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import * as THREE from "three";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
  import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
  import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
  import gsap from "gsap";
  import CameraModule from "@/three/camera";
  import BigScreen from "@/components/BigScreen.vue";
  import renderer from "@/three/renderer";
  import ControlsModule from "@/three/controls";
  import eventHub from "./utils/eventHub";
  import { Octree } from "three/examples/jsm/math/Octree";
  import { Capsule } from "three/examples/jsm/math/Capsule";
  const scene = new THREE.Scene();
  
  // scene.add(camera);
  const helper = new THREE.AxesHelper(5);
  console.log(helper);
  
  scene.add(helper);
  
  const container = ref(null);
  // 创建一个胶囊物体
  const capsuleGeometry = new THREE.CapsuleGeometry(0.35, 1, 32);
  const capsuleMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
  });
  const capsule = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
  
  scene.add(capsule);
  //设置重力
  const grayity = -9.8;
  //玩家的速度
  const playerVelocity = new THREE.Vector3(0, 0, 0);
  //方向向量
  const playerDirection = new THREE.Vector3(0, 0, 0);
  
  
  const planeGeometry = new THREE.PlaneGeometry(5, 5, 32, 32);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xefefef,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  const worldOctree = new Octree();
  const group = new THREE.Group();
  group.add(plane);
  scene.add(group);
  worldOctree.fromGraphNode(group);
  //创建一个碰撞体
  const playerCollider = new Capsule(
    new THREE.Vector3(0, 5.35, 0),
    new THREE.Vector3(0, 6.35, 0),
    0.35
  );
  onMounted(() => {
    container.value.appendChild(renderer.domElement);
  
    animate();
  });
  
  function updatePlayer(deltaTime) {
    let damping = -0.05;
    if (playerOnfloor) {
      playerVelocity.y = 0;
      playerVelocity.addScaledVector(playerVelocity, damping);
    } else {
      playerVelocity.y += grayity * deltaTime;
    }
    //计算玩家移动的距离
    const playerMoveDistance = playerVelocity.clone().multiplyScalar(deltaTime);
    playerCollider.translate(playerMoveDistance);
    //将胶囊的位置进行设置
    playerCollider.getCenter(capsule.position);
    playerCollisions();
  }
  function resetPlayer() {
    if (capsule.position.y < -20) {
      playerCollider.start.set(0, 2.35, 0);
      playerCollider.end.set(0, 3.35, 0);
      playerCollider.radius = 0.35;
      playerVelocity.set(0, 0, 0);
      playerDirection.set(0, 0, 0);
    }
  }
  //玩家是否在地面上
  let playerOnfloor = false;
  function playerCollisions() {
    // 人物碰撞检测
    const result = worldOctree.capsuleIntersect(playerCollider);
    // console.log(result);
    playerOnfloor = false;
    if (result) {
      playerOnfloor = result.normal.y > 0;
      playerCollider.translate(result.normal.multiplyScalar(result.depth));
    }
  }
  
  const clock = new THREE.Clock();
  const animate = () => {
    const deltaTime = clock.getDelta();
    updatePlayer(deltaTime);
    resetPlayer();
    ControlsModule.controls.update();
    renderer.render(scene, CameraModule.activeCamera);
    requestAnimationFrame(animate);
  };
  </script>
  
  <style lang="scss">
  * {
    margin: 0;
    padding: 0;
  }
  ul,
  li {
    list-style: none;
  }
  
  html {
    font-size: calc(100vw / 19.2);
  }
  
  body {
    font-size: 16px;
  }
  </style>
  