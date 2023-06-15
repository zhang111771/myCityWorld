<template>
  <div ref="container"></div>
  <BigScreen/>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import gsap from "gsap";
import CameraModule from '@/three/camera'
import BigScreen from '@/components/BigScreen.vue'
import renderer from '@/three/renderer'
import ControlsModule from '@/three/controls'
import eventHub from "./utils/eventHub"
import {Octree} from 'three/examples/jsm/math/Octree'
import {Capsule} from 'three/examples/jsm/math/Capsule'
const scene = new THREE.Scene();

// scene.add(camera);
const helper = new THREE.AxesHelper(5);
console.log(helper);

scene.add(helper);



const container = ref(null);
const capsule=new THREE.Object3D() 

scene.add(capsule)
  //设置重力
  const grayity=-0.009
  //玩家的速度
  const playerVelocity=new THREE.Vector3(0,0,0)
  //方向向量
  const playerDirection=new THREE.Vector3(0,0,0)
  //玩家是否在地面上
  let playerOnfloor=false

  const worldOctree=new Octree()
  const group=new THREE.Group()
    //创建一个碰撞体
    const playerCollider=new Capsule(
    new THREE.Vector3(0,0.35,0),
    new THREE.Vector3(0,1.35,0),
  0.35
  )
onMounted(() => {
  

  const rgbeLoader = new RGBELoader();
  rgbeLoader.loadAsync("./textures/hdr/sky.hdr").then((texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  });
  const dracoLoader = new DRACOLoader();
  const gltfLoader = new GLTFLoader();

  dracoLoader.setDecoderPath("./draco/");
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load("./models/city.glb", (gltf) => {
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
      if (child.name === "汽车轨迹") {
        line = child;
        line.visible=false
        console.log( line.geometry.attributes.position)
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
        car = child
      
        const newCar=car.clone()
        newCar.position.set(0,0,0)
          capsule.add(newCar)
          // capsule.position.set(0,0,0)
        
        car.add(CameraModule.carCamera)
        
      }
      if(child.name==='平面'){

          group.add(child)
          scene.add(group)
          worldOctree.fromGraphNode(group)
      }
    });
    gsap.to(curveProgress, {
      value: 0.99999,
      duration: 50,
      repeat:-1,
      onUpdate: () => {

        const point = curve.getPoint(curveProgress.value);
       
        car.position.set(point.x, point.y, point.z);
        if (curveProgress.value + 0.00001 < 1) {
      
          const nextPoint = curve.getPoint(curveProgress.value + 0.00001);
          car.lookAt(nextPoint);
          if(CameraModule.activeCamera.name==='carCamera'){
            CameraModule.activeCamera.lookAt(car.position)
          }
         
        }
      },
    });

    scene.add(city);
  });
  container.value.appendChild(renderer.domElement);

  animate();
});
function updateCar(deltaTime){
    let damping=-0.05
      if(playerOnfloor){
        playerVelocity.y=0
       playerVelocity.addScaledVector(playerVelocity,damping)
      }else{
        playerVelocity.y+=grayity*deltaTime
      
        
      }
        //计算玩家移动的距离
        const playerMoveDistance=playerVelocity.clone().multiplyScalar(deltaTime)
    playerCollider.translate(playerMoveDistance)
    //将胶囊的位置进行设置
    playerCollider.getCenter(capsule.position)

      //进行碰撞检测
      playerCollisions()
  }
  
  function playerCollisions(){
    //人物碰撞检测
    const result=worldOctree.capsuleIntersect(playerCollider)
   
    playerOnfloor=false
    if(result){
      playerOnfloor=result.normal.y>0
     
      playerCollider.translate(result.normal.multiplyScalar(result.depth))
    }

  }
const clock=new THREE.Clock()
const animate = () => {
  const deltaTime=clock.getDelta()
  updateCar(deltaTime)
  ControlsModule.controls.update()
  renderer.render(scene,CameraModule.activeCamera);
  requestAnimationFrame(animate);
};

</script>

<style lang="scss">

*{
  margin: 0;
  padding: 0;
}
ul,li{
  list-style: none;
}

 html{
  font-size:calc(100vw / 19.2);
}

body{
  font-size: 16px;
}
</style>
