import * as THREE from 'three'
import eventHub from '@/utils/eventHub'

const camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000)
camera.position.set(20,5,-5)
camera.name='default'
//导览汽车相机 
const carCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  carCamera.name='carCamera'
  carCamera.position.set(0, 1, -2);
  //自驾汽车相机 
const driveCarCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  driveCarCamera.name='driveCarCamera'
  driveCarCamera.position.set(0, 1, -2);
class CameraModule{
    constructor(){
        this.carCamera=carCamera
        this.activeCamera=camera 
        this.driveCarCamera=driveCarCamera
        this.collection={
            default:camera,
            carCamera:carCamera,
            driveCarCamera:driveCarCamera
        }
        eventHub.on('toggleCamera',(name)=>{
            console.log(name)
            this.setActive(name)
        })

    }
    add(name,camera){
        this.collection[name]=camera

    }
    setActive(name){
        this.activeCamera=this.collection[name]
    }
}
export default new CameraModule()