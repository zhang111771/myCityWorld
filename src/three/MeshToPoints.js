import * as THREE from 'three'
import fragmentShader from '@/three/shader/bridge/fragmentShader.glsl'
import pointsFragShader from '@/three/shader/bridge/pointsFragShader.glsl'
import pointsVertexShader from '@/three/shader/bridge/pointsVertexShader.glsl'
import gsap from 'gsap'
import eventHub from '@/utils/eventHub'
export default class MeshTOPoints{
    constructor(scene,mesh){
        this.scene=scene
        this.mesh=mesh
        eventHub.on('getSunTime',(uTime)=>{
         this.pointsMaterial.uniforms.uSunTime.value=uTime
        })

        this.createPoints()
    }
    createBoxPoints(group){
      const count=group.geometry.attributes.position.count
      const boxPoints=new Float32Array(count*3)
        
      const color=new THREE.Color(
        0.5,
        0.28,
        0.86
      )
     
      const texture=new THREE.TextureLoader().load('./textures/particles/1.png')
      
      for(let i=0;i<count;i++){
        boxPoints[i*3+0]=(Math.random()*200-100)
        
        boxPoints[i*3+1]=(Math.random()*10+20)
        boxPoints[i*3+2]=(Math.random()*200-100)

      }
      

      this.boxGeometry=new THREE.BufferGeometry()
      this.boxGeometry.setAttribute('position',new THREE.BufferAttribute(boxPoints,3))
      const aPosition=new Float32Array(count*3)
      const bridgeArray=group.geometry.getAttribute('position').array
      for(let i=0;i<count;i++){
        aPosition[i*3+0]=bridgeArray[i*3+0]+group.position.x
        aPosition[i*3+1]=bridgeArray[i*3+1]+group.position.y
        aPosition[i*3+2]=bridgeArray[i*3+2]+group.position.z

      }


      this.boxGeometry.setAttribute('aPosition',new THREE.BufferAttribute(aPosition,3))

      this.pointsMaterial=new THREE.ShaderMaterial({
        vertexShader:pointsVertexShader,
        fragmentShader:pointsFragShader,
        uniforms:{
          uColor:{value:color},
          uTexture:{value:texture},
          uTime:{
            value:0
          },
          starState:{
            value:true
          },
          uSunTime:{
            value:0
          }
        },
        transparent:true,
        blending:THREE.AdditiveBlending,
        depthTest:false,
        depthWrite:false,

      })
           
       this.boxPoints=new THREE.Points(this.boxGeometry,this.pointsMaterial)
      console.log(this.boxPoints)
      return  this.boxPoints
    }
    pointsBlast(){
      gsap.to(this.mesh.material,{
        opacity:0,
        duration:2,
        onComplete:()=>{
          // this.boxPoints.visible=true
          gsap.to(this.boxPoints.material.uniforms.uTime,{
            value:0,
            duration:10
          })
        }
       
      })
    }
    backPoints(){
      gsap.to(this.pointsMaterial.uniforms.uTime,{
        value:10,
        duration:10,
        repeat:0,
        onComplete:(value)=>{
          // this.boxPoints.visible=false
          gsap.to(this.mesh.material,{
            opacity:1,
            duration:2
           
          })
        }
      })
     

    }
    createPoints(){
        if(!this.bridgePointsGroup){
          this.scene.add(this.createBoxPoints(this.mesh))
        }
      
      }
      transformPoints(object3d){
        //创建纹理图像
        const texture=new THREE.TextureLoader().load('./textures/particles/1.png')
      
        const group=new THREE.Group()
        
        const color=new THREE.Color(
           0.5,
            0.28,
            0.86
          )
          console.log(color)
          const material=new THREE.ShaderMaterial({
            vertexShader:vertexShader,
            fragmentShader:fragmentShader,
            uniforms:{
              uColor:{value:color},
              uTexture:{value:texture},
              uTime:{
                value:0
              }
            },
            transparent:true,
            blending:THREE.AdditiveBlending,
            depthTest:false,

          })

          const points=new THREE.Points(object3d.geometry,material)
          points.position.copy(object3d.position)
          points.rotation.copy(object3d.rotation)
          points.scale.copy(object3d.scale)
 
        return points
      }
      update(time,starState){
        // this.boxPoints.material.uniforms.uTime.value=time
       this.boxPoints.rotation.y=time*0.1

      }
    
}