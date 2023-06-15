
precision highp float;
varying vec2 vUv; 
uniform float uTime;
uniform float uFrequency;
uniform vec2 iResolution;
float hash(float p) { p = fract(p * 0.011); p *= p + 7.5; p *= p + p; return fract(p); }
float hash(vec2 p) {vec3 p3 = fract(vec3(p.xyx) * 0.13); p3 += dot(p3, p3.yzx + 3.333); return fract((p3.x + p3.y) * p3.z); }

float noise(vec3 x) {
    const vec3 step = vec3(110, 241, 171);

    vec3 i = floor(x);
    vec3 f = fract(x);
 
    // For performance, compute the base input to a 1D hash from the integer part of the argument and the 
    // incremental change to the 1D based on the 3D -> 1D wrapping
    float n = dot(i, step);

    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
               mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
}
void main(){
     float lightStrength =1.0 - uFrequency/100.0;
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = vUv/iResolution.xy;
 
    vec3 col = vec3(0.0);
    float pinch = uv.x*(1.0-uv.x);
    
    float masterheight = (uv.y-0.5)*15.0-sin(uTime*2.0+uv.x*10.0)-sin(uTime*10.0+uv.x*25.0)*0.8+-sin(uTime*7.0+uv.x*45.0)*0.6;
    masterheight *= pow(abs(pinch),0.1)*-0.02;
    
    for(int i = 0; i<3; i++) {
        float noiseofs = noise(vec3(uv.x*35.0, uTime*15.0, float(i)*10.0))*2.0-1.0;

        float offset = 0.5;
        offset+=noiseofs*0.1*pinch;

        float invHeight = 15.0*lightStrength;
        invHeight /= pow(pinch,3.0);

        float func = (uv.y-offset+masterheight)*invHeight-sin(uTime*6.0+uv.x*20.0+float(i)*4.0);
        func *= 3.0;

        float blue = 3.0/(pow(abs(func),0.4));

        col.b += blue*0.4;
        col.g += blue*0.2;
    }
    // if(!gl_FrontFacing){
    //     gl_FragColor = vec4(col,1.0);
    // }else{
    //     gl_FragColor = vec4(1.0,1.0,1.0,1.0);
    // }
 gl_FragColor = vec4(col, (1.0-vUv.y)*2.0*(1.0-vUv.x)*2.0*vUv.y*2.0*vUv.x*2.0);
   
}