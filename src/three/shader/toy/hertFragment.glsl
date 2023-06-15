#define WAVES 8.0
precision highp float;
varying vec2 vUv; 
uniform float uTime;
uniform vec2 iResolution;
uniform float uFrequency;
void main( ) {
      float lightStrength =1.0 - uFrequency/100.0;
	vec2 uv = -1.0 + 2.0 *vUv .xy / iResolution.xy;

	float time = uTime * 1.0;
	
	vec3 color = vec3(0.0);

	for (float i=0.0; i<WAVES + 1.0; i++) {
		float freq = lightStrength;

		vec2 p = vec2(uv);

		p.x += i * 0.04 + freq * 0.03;
		p.y += sin(p.x * 10.0 + time) * cos(p.x * 2.0) * freq * 0.2 * ((i + 1.0) / WAVES);
		float intensity = abs(0.01 / p.y) * clamp(freq, 0.35, 2.0);
		color += vec3(1.0 * intensity * (i / 5.0), 0.5 * intensity, 1.75 * intensity) * (3.0 / WAVES);
	}

	gl_FragColor = vec4(color, 1.0);
}