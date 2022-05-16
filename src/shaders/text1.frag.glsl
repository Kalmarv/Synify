varying vec3 vNormal;
uniform vec3 col1;

vec3 mapColors(vec3 normals) {
  float isblue = step(0.99, normals.z);
  vec3 percent = vec3(isblue);
  vec3 colors = mix(vec3(0.0), col1, percent);
  return vec3(colors);
}

void main() { gl_FragColor = vec4(mapColors(vNormal), 1.0); }

// varying vec3 vNormal;
// uniform vec3 col1;

// vec3 mapColors(vec3 normals) {
//   float isblue = step(0.99, normals.z);
//   vec3 percent = vec3(isblue);

//   float col1Totals = col1.x + col1.y + col1.z;
//   float islight = step(0.5, col1Totals);

//   vec3 colors = mix(vec3(1.0 - islight), col1, percent);
//   return vec3(colors);
// }

// void main() { gl_FragColor = vec4(mapColors(vNormal), 1.0); }