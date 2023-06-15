
precision highp float;
varying vec2 vUv; 
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 vPosition;
void main(){
float s = 0.0, v = 0.0;
	vec2 uv = (vUv / uResolution.xy) * 2.0 - 1.;
    float time = (uTime-2.0)*58.0;
	vec3 col = vec3(0);
    vec3 init = vec3(sin(time * .0032)*.3, .35 - cos(time * .005)*.3, time * 0.002);
	for (int r = 0; r < 100; r++) 
	{
		vec3 p = init + s * vec3(vUv, 0.05);
		p.z = fract(p.z);
        // Thanks to Kali's little chaotic loop...
		for (int i=0; i < 10; i++)	p = abs(p * 2.04) / dot(p, p) - .9;
		v += pow(dot(p, p), .7) * .06;
		col +=  vec3(v * 0.2+.4, 12.-s*2., .1 + v * 1.) * v * 0.00003;
		s += .025;
	}
	//变为圆
	float strength=1.0-step(0.5,distance(vUv,vec2(0.5))+0.25);
	gl_FragColor = vec4(clamp(col, 0.0, 1.0), strength);
}