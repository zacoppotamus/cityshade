export const renderVert = `
  #version 300 es
  precision highp float;

  uniform sampler2D tStreetPositions;
  uniform sampler2D elevation;
  uniform sampler2D satellite;

  varying vec4 vColor;

  void main() {
    float elevationScale = 0.0005;
    // vec3 pos = 100. * vec3(texture2D(tStreetPositions, position.xy).xyz);
    vec3 pos = 100. * position;
    
    vec3 rgb = texture2D(elevation, position.xy).rgb;
    // vec3 rgb = texture2D(elevation, texture2D(tStreetPositions, position.xy).xy).rgb;

    // Convert the red, green, and blue channels into an elevation.
    float e = -10000.0 + ((rgb.r * 255.0 * 256.0 * 256.0 + rgb.g * 255.0 * 256.0 + rgb.b * 255.0) * 0.1);
    pos.z = 100. + e * .3; // allow for maximum zoom without clipping
    
    // vec3 tmp= texture2D(satellite, texture2D(tStreetPositions, position.xy).xy).rgb;
    // vColor = vec4(tmp, 1.);
    vColor = vec4(texture2D(satellite, position.xy));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.);
    gl_PointSize = 1. * (200.0 / -mvPosition.z);
  }
`;

export const renderFrag = `
  #version 300 es
  precision highp float;
  precision highp int;
  out vec4 out_FragColor;

  varying vec4 vColor;
  void main() {
    // if (distance(gl_PointCoord, vec2(0.5, .5)) > .5)
    // discard;

    out_FragColor = vColor;
  }
`;
