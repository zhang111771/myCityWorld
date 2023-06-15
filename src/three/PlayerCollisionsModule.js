import { Octree } from "three/examples/jsm/math/Octree";
import { Capsule } from "three/examples/jsm/math/Capsule";
import * as THREE from "three";
export default class PlayerCollisionsModule {
  constructor(worldOctree) {
  
    this.worldOctree =worldOctree;

    this.playerCollider = new Capsule(
      new THREE.Vector3(0, 0.1, 0),
      new THREE.Vector3(0, 0.11, 0),
      0.11
    );
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
    // 键盘按下事件
    this. keyStates = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    Space: false,
    isDown: false,
  };
  this.grayity=-0.098
  this. playerVelocity = new THREE.Vector3(0, 0, 0);
//方向向量
this. playerDirection = new THREE.Vector3(0, 0, 0);
this.playerOnfloor=false
  }
  playerCollisions() {
    // 人物碰撞检测
    const result = worldOctree.capsuleIntersect(this.playerCollider);
    // console.log(result);
    this.playerOnfloor = false;
    if (result) {
      this.playerOnfloor = result.normal.y > 0;
      this.playerCollider.translate(result.normal.multiplyScalar(result.depth));
    }
  }
  update(deltaTime) {
    let damping = -0.05;
    if (this.playerOnfloor) {
      this.playerVelocity.y = 0;
      this.keyStates.isDown ||
        this.playerVelocity.addScaledVector(this.playerVelocity, damping);
    } else {
      this.playerVelocity.y += this.grayity * deltaTime;
    }

    //计算玩家移动的距离
    const playerMoveDistance = this.playerVelocity.clone().multiplyScalar(deltaTime);
    this.playerCollider.translate(this.playerMoveDistance);
    //将胶囊的位置进行设置
    this.playerCollider.getCenter(this.capsule.position);
    this.playerCollisions();
  }
  // 根据键盘状态更新玩家的速度
  controlPlayer(deltaTime) {
    if (keyStates["KeyW"]) {
      this.playerDirection.z = 1;
      //获取胶囊的正前面方向
      const capsuleFront = new THREE.Vector3(0, 0, 0);
      this.capsule.getWorldDirection(capsuleFront);

      // 计算玩家的速度
      this.playerVelocity.add(capsuleFront.multiplyScalar(deltaTime * 2));
      console.log(playerVelocity);
    }
    if (keyStates["KeyS"]) {
      this.playerDirection.z = 1;
      //获取胶囊的正前面方向
      const capsuleFront = new THREE.Vector3(0, 0, 0);
      this.capsule.getWorldDirection(capsuleFront);
      // console.log(capsuleFront);
      // 计算玩家的速度
      this.playerVelocity.add(capsuleFront.multiplyScalar(-deltaTime));
    }
    if (keyStates["KeyA"]) {
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
    if (keyStates["KeyD"]) {
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
    if (keyStates["Space"]) {
      this.playerVelocity.y = 0.5;
    }
  }
  addFromGraphNode(){

  }
  addCapsule(){
    this.capsule=capsule
  }
}
