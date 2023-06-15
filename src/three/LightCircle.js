import * as THREE from 'three'
import gsap from 'gsap'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

export default class LightCircle{
    constructor(videoSrc,scene,position=new THREE.Vector3(0,-0.5,0)){
        this.video=document.createElement('video')
        this.video.src=videoSrc
        this.video.muted=true
        this.video.loop=true
        this.video.play()
        const dracoLoader = new DRACOLoader();
        const gltfLoader = new GLTFLoader();
      
        dracoLoader.setDecoderPath("./draco/");
        gltfLoader.setDRACOLoader(dracoLoader);
        gltfLoader.load('./models/lightCircle.glb',(gltf)=>{
            const texture=new THREE.VideoTexture(this.video)
            texture.repeat.set(9/16,1)
            texture.offset.set((1-9/16)/2,0)
            //创建一个平面
            this.mesh=gltf.scene.children[0]
            this.mesh.material=new THREE.MeshBasicMaterial({
                color:0xffffff,
                side:THREE.DoubleSide,
                transparent:true,
                blending:THREE.AdditiveBlending,
                depthWrite:false,
                map:texture,
                alphaMap:texture
            })

            this.mesh.position.copy(position)
            this.mesh.scale.set(0.5,0.5,0.5)
            scene.add(this.mesh)
        })
      

    }
}