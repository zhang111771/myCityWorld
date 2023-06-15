<template>
    <div class="main">
        <div class="left-event-container">
        
         <div class="cityEvent">
            <h1>相机控制</h1>
            <h3 @click="toggleControls('Orbit')">默认的相机视角</h3>
            <h3 @click="toggleCamera('carCamera')">设置相机追随汽车导览城市</h3>
            <h3 @click="toggleCamera('driveCarCamera')">自驾汽车相机</h3>
            <h3 @click="backPoints()">星汇聚成桥</h3>
            <h3 @click="pointsBlast()">桥变为星星</h3>



         </div>
        </div>
    </div>
 
</template>
<script setup>
import eventHub from '@/utils/eventHub';
const toggleCamera=(name)=>{
    if(name==='driveCarCamera'){  document.body.requestPointerLock()}
    eventHub.emit('toggleCamera',name)
}
const toggleControls=(name)=>{
    console.log(document.pointerLockElement)
    document.exitPointerLock()
    eventHub.emit('toggleControls',name)
}
const backPoints=()=>{
    eventHub.emit('backPoints')
}
const pointsBlast=()=>{
    eventHub.emit('pointsBlast')
}
</script>
<style lang="scss" scoped>
.main{
    .left-event-container{
        position:fixed;
        left:0;
        height: 100vh;
        width:2rem;
        top:0;
        color:#efefef;
        padding:10px;
        h3{
            line-height: 35px;
        }
    }
}
</style>