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
import PlayerCollisions from "./three/PlayerCollisions";
import Stats from 'three/examples/jsm/libs/stats.module'
const scene = new THREE.Scene();
const textureLoader=new THREE.TextureLoader()
// scene.add(camera);
const helper = new THREE.AxesHelper(5);

scene.add(helper);

const container = ref(null);

let capsule = null;
let boxman
// //设置重力
// const grayity = -0.098;
// //玩家的速度
// const playerVelocity = new THREE.Vector3(0, 0, 0);
// //方向向量
// const playerDirection = new THREE.Vector3(0, 0, 0);
// //玩家是否在地面上
// let playerOnfloor = false;

const worldOctree = new Octree();
const playerCollisions=new PlayerCollisions(worldOctree)
const group = new THREE.Group();
//创建一个碰撞体
// const playerCollider = new Capsule(
//   new THREE.Vector3(0, 0.1, 0),
//   new THREE.Vector3(0, 0.11, 0),
//   0.11
// );
//星星状态
let starState=true
// 键盘按下事件
// const keyStates = {
//   KeyW: false,
//   KeyA: false,
//   KeyS: false,
//   KeyD: false,
//   Space: false,
//   isDown: false,
// };
let pointQiao
//是否旋转星空
let isRotationStar=false

let sphereSky
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
  directionalLight.shadow.camera.near = 0.01;
			directionalLight.shadow.camera.far = 500;
			directionalLight.shadow.camera.right = 30;
			directionalLight.shadow.camera.left = - 30;
			directionalLight.shadow.camera.top	= 30;
			directionalLight.shadow.camera.bottom = - 30;
			directionalLight.shadow.mapSize.width = 1024;
			directionalLight.shadow.mapSize.height = 1024;
			directionalLight.shadow.radius = 4;
			directionalLight.shadow.bias = - 0.00006;
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
     sphereSky=new SphereSky(180,texture,renderer)
    scene.add(sphereSky.mesh)
  });
  const dracoLoader = new DRACOLoader();
  const gltfLoader = new GLTFLoader();




  dracoLoader.setDecoderPath("./draco/");
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load('./models/boxman.glb',(gltf)=>{
    gltf.castShadow=true
    gltf.receiveShadow=true
    boxman=gltf.scene
    boxman.add(CameraModule.driveCarCamera)
    CameraModule.driveCarCamera.lookAt(boxman.position);
    scene.add(boxman)
    playerCollisions.addCapsule(gltf)
        
 

  })

  
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
    if(car){
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

        }
      },
    });
    }

    const clouds=new CloudsPlus().mesh
    scene.add(clouds)
    scene.add(city);
    console.log(renderer.info)
  });
  eventHub.on('rotationStar',()=>{
    isRotationStar=!isRotationStar
  })
  eventHub.on('dayToNight',()=>{

    sphereSky.setDayToNight()
  })
  
  const clock = new THREE.Clock();
  
const animate = () => {
  const deltaTime = clock.getDelta();
  FireSprite.material.uniforms.uTime.value=clock.getElapsedTime()
  wallShaderMaterial.uniforms.uTime.value=clock.getElapsedTime()
  if (playerCollisions.capsule) {
    // updateCar(deltaTime);
    // controlPlayer(deltaTime);
    playerCollisions.update(deltaTime)
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
  if(isRotationStar){
    pointQiao&&pointQiao.update(clock.getElapsedTime(),starState)
  }
  stats.update();
  requestAnimationFrame(animate);
};
  container.value.appendChild(renderer.domElement);
  const stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '10px';
			stats.domElement.style.right = '0px';
			stats.domElement.style.left = 'auto';


			container.value.appendChild( stats.domElement );
  animate();
});

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
