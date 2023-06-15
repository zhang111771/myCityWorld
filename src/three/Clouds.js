import * as THREE from "three";
import gsap from "gsap";
export class Clouds {
  constructor(
    height = 10,
    num = 300,
    size = 15,
    scale = 10,
    autoRotate = true
  ) {
    const textureLoader = new THREE.TextureLoader();

    const map1 = textureLoader.load("./textures/cloud/cloud1.jfif");
    const map2 = textureLoader.load("./textures/cloud/cloud2.jfif");
    const map3 = textureLoader.load("./textures/cloud/cloud3.jpg");

    const spriteMaterial1 = new THREE.SpriteMaterial({
      map: map1,
      side: THREE.DoubleSide,
      depthTest: false,
      depthTest: false,
      alphaMap: map2,
      transparent: true,
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
    });
    const spriteMaterial2 = new THREE.SpriteMaterial({
      map: map2,
      side: THREE.DoubleSide,
      depthTest: false,
      depthTest: false,
      alphaMap: map3,
      transparent: true,
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
    });

    const spriteMaterial3 = new THREE.SpriteMaterial({
      map: map3,
      side: THREE.DoubleSide,
      depthTest: false,
      depthTest: false,
      alphaMap: map1,
      transparent: true,
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
    });
    this.materials = [spriteMaterial1, spriteMaterial2, spriteMaterial3];
    this.mesh = new THREE.Group();
    for (let i = 0; i < num; i++) {
      let index = Math.floor(Math.random() * 3);
      let material = this.materials[index];
      let sprite = new THREE.Sprite(material);
      let randomSize = Math.random() * size;
      sprite.scale.set(randomSize, randomSize, randomSize);
      let randomX = (Math.random() - 0.5) * 2 * scale;
      let randomY = Math.random() * (height / 2) + height;
      let randomZ = (Math.random() - 0.5) * 2 * scale;
      sprite.position.set(randomX, randomY, randomZ);
      this.mesh.add(sprite);
    }

    if (autoRotate) {
      this.animate();
    }
  }
  animate() {
    gsap.to(this.mesh.rotation, {
      duration: 120,
      repeat: -1,
      y: Math.PI * 2,
    });
  }
}
export class CloudsPlus {
  constructor(
    height = 10,
    num = 100,
    size = 15,
    scale = 10,
    autoRotate = true
  ) {
    this.height=height
    this.num=num
    this.size=size
    this.scale=scale
    this.autoRotate=autoRotate
    const textureLoader = new THREE.TextureLoader();

    const map1 = textureLoader.load("./textures/cloud/cloud1.jfif");
    const map2 = textureLoader.load("./textures/cloud/cloud2.jfif");
    const map3 = textureLoader.load("./textures/cloud/cloud3.jpg");

   
    let materials = [];

    const spriteMaterial1 = new THREE.PointsMaterial({
      map: map1,
      side: THREE.DoubleSide,
      depthTest: false,
      depthTest: false,
      alphaMap: map2,
      transparent: true,
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      size: 0.2 * size,
    });
    const spriteMaterial2 = new THREE.PointsMaterial({
      map: map2,
      side: THREE.DoubleSide,
      depthTest: false,
      depthTest: false,
      alphaMap: map3,
      transparent: true,
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      size: 0.5 * size,
    });

    const spriteMaterial3 = new THREE.PointsMaterial({
      map: map3,
      side: THREE.DoubleSide,
      depthTest: false,
      depthTest: false,
      alphaMap: map1,
      transparent: true,
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      size: 0.8 * size,
    });
    const spriteMaterial4 = new THREE.PointsMaterial({
      map: map2,
      side: THREE.DoubleSide,
      depthTest: false,
      depthTest: false,
      alphaMap: map1,
      transparent: true,
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      size: 1 * size,
    });

    materials.push(
      spriteMaterial1,
      spriteMaterial2,
      spriteMaterial3,
      spriteMaterial4
    );
    this.mesh = new THREE.Group();
    for (let i = 0; i < materials.length; i++) {
      let material = materials[i];
      let geometry=this.generateGeometry(this.num)
      let points = new THREE.Points(geometry, material);
      this.mesh.add(points);
    }
    if (autoRotate) {
        this.animate();
      }
  }
  generateGeometry(num=300){
    const vertices = [];
    //创建点位置
    for (let i = 0; i < num; i++) {
      //随机设置精灵的位置
      let randomX = (Math.random() - 0.5) * 2 * this.scale;
      let randomY = Math.random() * (this.height / 2) + this.height;
      let randomZ = (Math.random() - 0.5) * 2 * this.scale;
      vertices.push(randomX, randomY, randomZ);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    )
    return geometry
  }
  animate(){
    gsap.to(this.mesh.rotation, {
        duration: 120,
        repeat: -1,
        y: Math.PI * 2,
      });
  }
}
