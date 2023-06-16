import { Octree } from "three/examples/jsm/math/Octree";
import { Capsule } from "three/examples/jsm/math/Capsule";
import * as THREE from "three";
import CameraModule from "@/three/camera";
export default class PlayerCollisionsModule {
  constructor(worldOctree) {
    this.mixer=null
    this.actions={}
    this.activeAction=null
    this.worldOctree =worldOctree;

    this.playerCollider = new Capsule(
      new THREE.Vector3(0, 0.1, 0),
      new THREE.Vector3(0, 0.11, 0),
      0.05
    );
    this.playerCollider.translate(new THREE.Vector3(30,10,0))
    // 根据鼠标在屏幕移动，来旋转胶囊
    window.addEventListener(
      "mousemove",
      (event) => {
        if (this.capsule && CameraModule.activeCamera.name === "driveCarCamera") {
          this.capsule.rotation.y -= event.movementX * 0.005;
        }
      },
      false
    );
    // 键盘按下事件
    this.keyStates = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    Space: false,
    isDown: false,
  };
  this.grayity=-0.98
  this. playerVelocity = new THREE.Vector3(0, 0, 0);
//方向向量
this. playerDirection = new THREE.Vector3(0, 0, 0);
this.playerOnfloor=false
document.addEventListener(
  "keydown",
  (event) => {
    this.keyStates[event.code] = true;
    this.keyStates.isDown = true;
  },
  false
);
document.addEventListener(
  "keyup",
  (event) => {
    this.keyStates[event.code] = false;
    this.keyStates.isDown = false;
    this.playerVelocity=new THREE.Vector3(0,0,0 )
  },
  false
);
  }
  playerCollisions() {
    // 人物碰撞检测
    const result = this.worldOctree.capsuleIntersect(this.playerCollider);

    this.playerOnfloor = false;
    if (result) {
      this.playerOnfloor = result.normal.y > 0;
      this.playerCollider.translate(result.normal.multiplyScalar(result.depth));

    }
       // 如果有水平的运动，则设置运动的动作
   if (
        Math.abs(this.playerVelocity.x) + Math.abs(this.playerVelocity.z) >
        0
      ) {
        this.fadeToAction("run");
      } else {
        this.fadeToAction("idle");
      }
  }
  controlPlayerCollider(deltaTime) {

    let damping = -0.005;
    if (this.playerOnfloor) {
      this.playerVelocity.y = 0;
      // this.keyStates.isDown ||
      //   this.playerVelocity.addScaledVector(this.playerVelocity, damping);
    } else {
      this.playerVelocity.y += this.grayity * deltaTime;
    }


    //计算玩家移动的距离
    this.playerMoveDistance = this.playerVelocity.clone().multiplyScalar(deltaTime);

    this.playerCollider.translate(this.playerMoveDistance);
    //将胶囊的位置进行设置
    this.playerCollider.getCenter(this.capsule.position);
    
    this.playerCollisions();
  }
  // 根据键盘状态更新玩家的速度
  controlPlayer(deltaTime) {
    if (this.keyStates["KeyW"]) {
      this.playerDirection.z = 1;
      //获取胶囊的正前面方向
      const capsuleFront = new THREE.Vector3(0, 0, 0);
      this.capsule.getWorldDirection(capsuleFront);
     

      // 计算玩家的速度
      this.playerVelocity.add(capsuleFront.multiplyScalar(deltaTime * 2));

    }
    if (this.keyStates["KeyS"]) {
      this.playerDirection.z = 1;
      //获取胶囊的正前面方向
      const capsuleFront = new THREE.Vector3(0, 0, 0);
      this.capsule.getWorldDirection(capsuleFront);
      // console.log(capsuleFront);
      // 计算玩家的速度
      this.playerVelocity.add(capsuleFront.multiplyScalar(-deltaTime));
    }
    if (this.keyStates["KeyA"]) {
      this.playerDirection.x = 1;
      //获取胶囊的正前面方向
      const capsuleFront = new THREE.Vector3(0, 0, 0);
      this.capsule.getWorldDirection(capsuleFront);

      // 侧方的方向，正前面的方向和胶囊的正上方求叉积，求出侧方的方向
      capsuleFront.cross(this.capsule.up);
      // console.log(capsuleFront);
      // 计算玩家的速度
      this.playerVelocity.add(capsuleFront.multiplyScalar(-deltaTime));
    }
    if (this.keyStates["KeyD"]) {
      this.playerDirection.x = 1;
      //获取胶囊的正前面方向
      const capsuleFront = new THREE.Vector3(0, 0, 0);
      this.capsule.getWorldDirection(capsuleFront);

      // 侧方的方向，正前面的方向和胶囊的正上方求叉积，求出侧方的方向
      capsuleFront.cross(this.capsule.up);
      // console.log(capsuleFront);
      // 计算玩家的速度
      this.playerVelocity.add(capsuleFront.multiplyScalar(deltaTime));
    }
   
    if (this.keyStates["Space"]) {
     
     if(this.playerOnfloor){
    
      this.playerVelocity.y = 15;
          //计算玩家移动的距离
    this.playerMoveDistance = this.playerVelocity.clone().multiplyScalar(deltaTime);
    this.playerCollider.translate(this.playerMoveDistance);
    console.log(this.playerMoveDistance)
      if( Math.abs(this.playerVelocity.x) + Math.abs(this.playerVelocity.z) >
      0){
        this.fadeToAction('jump_running')
      }else{
        this.fadeToAction('jump_idle')
      }
     }
    
 
      
    }

  }
  update(deltaTime){
    this.controlPlayerCollider(deltaTime)
    this.controlPlayer(deltaTime)
    this.resetPlayer()
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }
  addFromGraphNode(){

  }
  addCapsule(gltf){
    this.capsule=gltf.scene
    console.log(gltf)
    this.mixer=new THREE.AnimationMixer( this.capsule)
    this.animations=gltf.animations
    for (let i = 0; i < this.animations.length; i++) {
      let name = this.animations[i].name;
      this.actions[name] = this.mixer.clipAction(this.animations[i]);
      if (name == "idle" || name == "run") {
        this.actions[name].clampWhenFinished = false;
        this.actions[name].loop = THREE.LoopRepeat;
      } else {
        this.actions[name].clampWhenFinished = true;
        this.actions[name].loop = THREE.LoopOnce;
      }
    }
   
    this.activeAction=this.actions["idle"]
    this.activeAction.play()
  }
  fadeToAction(actionName) {
    this.prevAction = this.activeAction;
    this.activeAction = this.actions[actionName];
 
    if (this.prevAction != this.activeAction) {
      this.prevAction.fadeOut(0.3);
      this.activeAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(0.3)
        .play();

      this.mixer.addEventListener("finished", (e) => {
        this.prevAction = activeAction;
        this.activeAction = this.actions["idle"];
        console.log( this.activeAction )
        this.prevAction.fadeOut(0.3);
        this.activeAction
          .reset()
          .setEffectiveTimeScale(1)
          .setEffectiveWeight(1)
          .fadeIn(0.3)
          .play();
      });
    }
  }
  resetPlayer() {
    if (this.capsule.position.y < -5) {
      this.playerCollider.start.set(0, 0.1, 0);
      this.playerCollider.end.set(0, 0.11, 0);
      this.playerCollider.radius = 0.05;
      this.playerVelocity.set(0, 0 , 0);
      this.playerDirection.set(0, 0, 0);
      this.playerCollider.translate(new THREE.Vector3(30,10,0))
    }
  }
}
