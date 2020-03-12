export const renderVert = `
  uniform sampler2D positions;
  void main() {
    vec3 pos = 100. * vec3(texture2D(positions, position.xy).xyz);
    // vec3 pos = vec3(
    //   position.x * 100.,
    //   position.y * 100.,
    //   // 50.
    // (100. * texture2D(heights, position.xy).r)
    // );

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    gl_PointSize = .1;
  }
`;

export const renderFrag = `
void main() {
  gl_FragColor = vec4(1.);
}
`;
