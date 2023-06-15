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
import { Water } from "three/examples/jsm/objects/Water2";
import fireFragment from '@/three/shader/FireSprite/fireFragment1.glsl'
import lightFragment from '@/three/shader/toy/lightFragment.glsl'
import lightFragment2 from '@/three/shader/toy/lightFragment2.glsl'
import listenFragment from '@/three/shader/toy/listenFragment.glsl'
import hertFragment from '@/three/shader/toy/hertFragment.glsl'
import fireVertex from '@/three/shader/FireSprite/vertex.glsl'
import VideoPlane from '@/three/VideoPlane'
import LightCircle from '@/three/LightCircle'
import {Clouds,CloudsPlus} from "./three/Clouds";
import MeshToPoints from './three/MeshToPoints'
import SphereSky from './three/sphereSky'
const scene = new THREE.Scene();
const textureLoader=new THREE.TextureLoader()
// scene.add(camera);
const helper = new THREE.AxesHelper(5);

scene.add(helper);

const container = ref(null);
let capsule = null;

//设置重力
const grayity = -0.098;
//玩家的速度
const playerVelocity = new THREE.Vector3(0, 0, 0);
//方向向量
const playerDirection = new THREE.Vector3(0, 0, 0);
//玩家是否在地面上
let playerOnfloor = false;

const worldOctree = new Octree();
const group = new THREE.Group();
//创建一个碰撞体
const playerCollider = new Capsule(
  new THREE.Vector3(0, 0.1, 0),
  new THREE.Vector3(0, 0.11, 0),
  0.11
);
//星星状态
let starState=true
// 键盘按下事件
const keyStates = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
  Space: false,
  isDown: false,
};
let pointQiao
onMounted(() => {

  //创建音频
  let listener=new THREE.AudioListener()
  let sound=new THREE.PositionalAudio(listener)
  let audioLoader=new THREE.AudioLoader()
  let  analyser 
  //水池
  let poor
  //桥
  
  audioLoader.load('./audio/gnzw.mp3',(buffer)=>{
    sound.setBuffer(buffer)
    sound.setRefDistance(3)
    sound.setLoop(true)
    sound.play()
  })
  //围墙光幕材质
  const wallShaderMaterial=new THREE.ShaderMaterial({
    fragmentShader:listenFragment,
    vertexShader:fireVertex,
    side:THREE.DoubleSide,
    transparent:true,
    opacity:0.5,
    blending:THREE.AdditiveBlending,
    depthWrite:false,
    depthTest:false,
    uniforms:{
      uTime:{
        value:0
      },
      iResolution:{
        value:new THREE.Vector2(1,1)
      },
      uFrequency:{
        value:0
      }
    }
  })
  //喷泉处材质
  const fireShaderMaterial=new THREE.ShaderMaterial({
    fragmentShader:fireFragment,
    vertexShader:`
    uniform float rotation;
      uniform vec2 center;
      varying vec2 vUv;
      void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
          vec2 scale;
          scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
          scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
          scale *= - mvPosition.z;
          
          vec2 alignedPosition = -( position.xy - ( center - vec2( 0.5,0.5 ) ) ) * scale/mvPosition.z;
          vec2 rotatedPosition;
          rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
          rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
          mvPosition.xy += rotatedPosition;
          gl_Position = projectionMatrix * mvPosition;
        
          
      }
    `,
    side:THREE.DoubleSide,
    transparent:true,
    opacity:0.5,
    blending:THREE.AdditiveBlending,
    depthWrite:false,
    uniforms:{
      uTime:{
        value:0
      },
      iResolution:{
        value:new THREE.Vector2(1,1)
      },
      uFrequency:{
        value:0
      }
 
    }
  })
 //喷泉平面

  const FireSprite=new THREE.Sprite(fireShaderMaterial)
  FireSprite.position.set(0,0.5,-0.5)


  //平行光
  const directionalLight=new THREE.DirectionalLight(0xfffffff,0.1)
  directionalLight.position.set(40,5,0)
  directionalLight.castShadow=true
  scene.add(directionalLight)

  const waterPlane = new THREE.PlaneGeometry(300, 300);
  const water = new Water(waterPlane, {
    textureHeight: 1024,
    textureWidth: 1024,
    flowSpeed: 0.003,
    // color:0x08dbea
  });
  water.rotation.x = -Math.PI / 2;
  scene.add(water);
  const rgbeLoader = new RGBELoader();
  rgbeLoader.loadAsync("./textures/hdr/sky.hdr").then((texture) => {
    
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
    const sphereSky=new SphereSky(180,texture,renderer)
    scene.add(sphereSky.mesh)
  });
  const dracoLoader = new DRACOLoader();
  const gltfLoader = new GLTFLoader();




  dracoLoader.setDecoderPath("./draco/");
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load("./models/city2.glb", (gltf) => {
    const city = gltf.scene;

    // city.scale.set(50, 50, 50);
    let line = null;
    //根据点创建曲线
    const points = [];
    const curveProgress = {
      value: 0,
    };
    let car = null;
    let curve = null;
    city.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow  = true;

      }
     
        if (child.name === "汽车轨迹") {
          line = child;
          line.visible = false;
          for (let i = 0; i < line.geometry.attributes.position.count; i++) {
            points.push(
              new THREE.Vector3(
                line.geometry.attributes.position.getX(i),
                line.geometry.attributes.position.getY(i),
                line.geometry.attributes.position.getZ(i)
              )
            );
          }

          curve = new THREE.CatmullRomCurve3(points);
        }
        if (child.name === "carGroup") {
          car = child;

          capsule = car.clone();
          capsule.position.set(0, -1, 0);
          capsule.add(CameraModule.driveCarCamera);
          scene.add(capsule);

          car.add(CameraModule.carCamera);
        }

        if (
          child.name === "平面" ||
          child.name === "平面001" ||
          child.name === "平面002" ||
          child.name === "踏月桥"
        ) {
          if(child.name==='平面001'){
            
          }
          group.add(child.clone());
          
        }
        if(child.name==='水池001'||child.name==='水池009'){
     
          child.add(FireSprite.clone())
          // const videoPlane=new VideoPlane('./video/MP4-001.mp4')
          // videoPlane.mesh.rotation.x=-Math.PI/2
          // videoPlane.mesh.position.set(0,-0.7,0)
          // child.add(videoPlane.mesh.clone())
          const lightCircle=new LightCircle('./video/zp2.mp4',child)
          const texture=textureLoader.load('./textures/Marble062_Flat.jpg')
          child.material.map=texture
  
  
        }

        if(child.name==='踏月桥'){
          poor=child
          poor.material.transparent=true

          poor.material.opacity=0
          sound.position.set(0,-2,0)
          child.add(sound)
          ControlsModule.controls.target=child.position
         analyser = new THREE.AudioAnalyser(sound, 32);
        pointQiao=new MeshToPoints(child,child,scene)

   
        }
        if(child.name==='光幕墙右'||child.name==='光幕墙左'){
       
          child.material=wallShaderMaterial
        }
    });
    scene.add(group);
    worldOctree.fromGraphNode(group);
    gsap.to(curveProgress, {
      value: 0.99999,
      duration: 50,
      repeat: -1,
      onUpdate: () => {
        const point = curve.getPoint(curveProgress.value);

        car.position.set(point.x, point.y, point.z);
        if (curveProgress.value + 0.00001 < 1) {
          const nextPoint = curve.getPoint(curveProgress.value + 0.00001);
          car.lookAt(nextPoint);
          if (CameraModule.activeCamera.name === "carCamera") {
            CameraModule.activeCamera.lookAt(car.position);
          }
          if (CameraModule.activeCamera.name === "driveCarCamera") {
            CameraModule.driveCarCamera.lookAt(capsule.position);
          }
        }
      },
    });
    const clouds=new CloudsPlus().mesh
    scene.add(clouds)
    scene.add(city);
    console.log(renderer.info)
  });
  const clock = new THREE.Clock();
const animate = () => {
  const deltaTime = clock.getDelta();
  FireSprite.material.uniforms.uTime.value=clock.getElapsedTime()
  wallShaderMaterial.uniforms.uTime.value=clock.getElapsedTime()
  if (capsule) {
    updateCar(deltaTime);
    controlPlayer(deltaTime);
  }
  if(poor){
  //将相机转换为世界坐标
    let position=CameraModule.activeCamera.localToWorld(new THREE.Vector3(0,0,0))
//计算相机位置和声音的位置
  let distanceSquared=position.distanceToSquared(poor.position)
    //根据距离设置音量
  sound.setVolume((1 / distanceSquared) * 50); 
  //分析音频数据
  let frequency = analyser.getAverageFrequency();

  wallShaderMaterial.uniforms.uFrequency.value=frequency
  FireSprite.material.uniforms.uFrequency.value=frequency
  
  }
 
  ControlsModule.controls.update();
  renderer.render(scene, CameraModule.activeCamera);
  pointQiao&&pointQiao.update(clock.getElapsedTime(),starState)
  requestAnimationFrame(animate);
};
  container.value.appendChild(renderer.domElement);

  animate();
});
function updateCar(deltaTime) {
  let damping = -0.05;
  if (playerOnfloor) {
    playerVelocity.y = 0;
    keyStates.isDown || playerVelocity.addScaledVector(playerVelocity, damping);
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
// 根据键盘按下的键来更新键盘的状态
document.addEventListener(
  "keydown",
  (event) => {
    keyStates[event.code] = true;
    keyStates.isDown = true;
  },
  false
);
document.addEventListener(
  "keyup",
  (event) => {
    keyStates[event.code] = false;
    keyStates.isDown = false;
  },
  false
);
// document.addEventListener(
//   "mousedown",
//   (event) => {
//     // 锁定鼠标指针
//     if(CameraModule.activeCamera.name==='driveCarCamera'){
//       document.body.requestPointerLock();
//     }

//   },
//   false
// );
// 根据键盘状态更新玩家的速度
function controlPlayer(deltaTime) {
  if (keyStates["KeyW"]) {
    playerDirection.z = 1;
    //获取胶囊的正前面方向
    const capsuleFront = new THREE.Vector3(0, 0, 0);
    capsule.getWorldDirection(capsuleFront);
   
    // 计算玩家的速度
    playerVelocity.add(capsuleFront.multiplyScalar(deltaTime*2));
    console.log(playerVelocity);

  }
  if (keyStates["KeyS"]) {
    playerDirection.z = 1;
    //获取胶囊的正前面方向
    const capsuleFront = new THREE.Vector3(0, 0, 0);
    capsule.getWorldDirection(capsuleFront);
    // console.log(capsuleFront);
    // 计算玩家的速度
    playerVelocity.add(capsuleFront.multiplyScalar(-deltaTime));
  }
  if (keyStates["KeyA"]) {
    playerDirection.x = 1;
    //获取胶囊的正前面方向
    const capsuleFront = new THREE.Vector3(0, 0, 0);
    capsule.getWorldDirection(capsuleFront);

    // 侧方的方向，正前面的方向和胶囊的正上方求叉积，求出侧方的方向
    capsuleFront.cross(capsule.up);
    // console.log(capsuleFront);
    // 计算玩家的速度
    playerVelocity.add(capsuleFront.multiplyScalar(-deltaTime));
  }
  if (keyStates["KeyD"]) {
    playerDirection.x = 1;
    //获取胶囊的正前面方向
    const capsuleFront = new THREE.Vector3(0, 0, 0);
    capsule.getWorldDirection(capsuleFront);

    // 侧方的方向，正前面的方向和胶囊的正上方求叉积，求出侧方的方向
    capsuleFront.cross(capsule.up);
    // console.log(capsuleFront);
    // 计算玩家的速度
    playerVelocity.add(capsuleFront.multiplyScalar(deltaTime));
  }
  if (keyStates["Space"]) {
    playerVelocity.y = 0.5;
  }
}
// 根据鼠标在屏幕移动，来旋转胶囊
window.addEventListener(
  "mousemove",
  (event) => {
    if (capsule && CameraModule.activeCamera.name === "driveCarCamera") {
      capsule.rotation.y -= event.movementX * 0.005;
    }
  },
  false
);
eventHub.on('backPoints',()=>{

    pointQiao.backPoints()

})
eventHub.on('pointsBlast',()=>{
 
    pointQiao.pointsBlast()

})
window.addEventListener('resize',()=>{
  CameraModule.activeCamera.updateProjectionMatrix()
  CameraModule.activeCamera.aspect=window.innerWidth/window.innerHeight
  renderer.setSize(window.innerWidth,window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
})
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
