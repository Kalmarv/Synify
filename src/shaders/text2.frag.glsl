varying vec3 vNormal;
uniform vec3 col2;

vec3 mapColors(vec3 normals) {
  float isblue = step(0.99, normals.z);
  vec3 percent = vec3(isblue);
  vec3 colors = mix(vec3(0.05), col2, percent);
  return vec3(colors);
}

void main() { gl_FragColor = vec4(mapColors(vNormal), 1.0); }

// varying vec3 vNormal;
// uniform vec3 col2;

// vec3 mapColors(vec3 normals) {
//   float isblue = step(0.99, normals.z);
//   vec3 percent = vec3(isblue);

//   float col2Totals = col2.x + col2.y + col2.z;
//   float islight = step(0.5, col2Totals);

//   vec3 colors = mix(vec3(1.0 - islight), col2, percent);
//   return vec3(colors);
// }

// void main() { gl_FragColor = vec4(mapColors(vNormal), 1.0); }