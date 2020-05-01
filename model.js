// Fragment shader
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform vec3 u_LightColor;\n' +
  'uniform vec3 u_LightPosition;\n' +
  'uniform sampler2D u_Sampler;\n' +
  'uniform vec3 u_AmbientLight;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec2 v_TexCoords;\n' +
  'void main() {\n' +

  '  vec3 normal = normalize(v_Normal);\n' +
  '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +

  '  vec4 TexColor = texture2D(u_Sampler, v_TexCoords);\n' +
  '  vec3 diffuse = u_LightColor * TexColor.rgb * nDotL;\n' +

  '  vec3 ambient = u_AmbientLight * TexColor.rgb;\n' +
  '  gl_FragColor = vec4(diffuse + ambient, TexColor.a);\n' +

  '}\n';

// Vertex shader
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +
  'attribute vec2 a_TexCoords;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec2 v_TexCoords;\n' +

  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_TexCoords = a_TexCoords;\n' +
  '}\n';

// Webgl variables
var gl;
var u_ModelMatrix;
var u_NormalMatrix;
var modelMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();
var g_normalMatrix = new Matrix4();

// Moving camera variables
// Adapted from:  https://sites.google.com/site/csc8820/educational/move-a-camera
var ANGLE_STEP = 1.0;
var phi = 30;
var maxPhi = 60;
var minPhi = -10;
var theta = 45;
var fov = 170;
var minFov = 100;
var maxFov = 200;

var u_Sampler;

var chairPos = 0.5;
var maxChairPos = 3;
var minChairPos = -2;

var total_loaded = 0;

var paintingCount = 0;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  gl.clearColor(0.4, 1, 0.4, 1.0);
  gl.enable(gl.DEPTH_TEST);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');

  if (!u_ModelMatrix || !u_ViewMatrix || !u_NormalMatrix ||
    !u_ProjMatrix || !u_AmbientLight || !u_LightPosition
    || !u_Sampler) {
    console.log('Failed to Get the storage locations of u_ModelMatrix, u_ViewMatrix, and/or u_ProjMatrix');
    return;
  }

  //Set constant lighting
  gl.uniform3f(u_AmbientLight, 0.23, 0.23, 0.23);

  projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 1000);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  tex_tiles = gl.createTexture();
  tex_tiles.image = new Image();
  tex_tiles.image.onload = function () { loadTexAndDraw(gl, tex_tiles) };
  tex_tiles.image.src = 'textures/tiles.jpg';

  tex_wood = gl.createTexture();
  tex_wood.image = new Image();
  tex_wood.image.onload = function () { loadTexAndDraw(gl, tex_wood) };
  tex_wood.image.src = 'textures/wood.jpg';

  tex_wall = gl.createTexture();
  tex_wall.image = new Image();
  tex_wall.image.onload = function () { loadTexAndDraw(gl, tex_wall) };
  tex_wall.image.src = 'textures/wall.jpg';

  tex_painting = gl.createTexture();
  tex_painting.image = new Image();
  tex_painting.image.onload = function () { loadTexAndDraw(gl, tex_painting) };
  tex_painting.image.src = 'textures/painting.jpg';

  tex_painting2 = gl.createTexture();
  tex_painting2.image = new Image();
  tex_painting2.image.onload = function () { loadTexAndDraw(gl, tex_painting2) };
  tex_painting2.image.src = 'textures/painting2.jpg';

  tex_tv = gl.createTexture();
  tex_tv.image = new Image();
  tex_tv.image.onload = function () { loadTexAndDraw(gl, tex_tv) };
  tex_tv.image.src = 'textures/tv.png';

  tex_walnut = gl.createTexture();
  tex_walnut.image = new Image();
  tex_walnut.image.onload = function () { loadTexAndDraw(gl, tex_walnut) };
  tex_walnut.image.src = 'textures/walnut.jpg';

  tex_sofa = gl.createTexture();
  tex_sofa.image = new Image();
  tex_sofa.image.onload = function () { loadTexAndDraw(gl, tex_sofa) };
  tex_sofa.image.src = 'textures/sofa.jpg';

  tex_stool = gl.createTexture();
  tex_stool.image = new Image();
  tex_stool.image.onload = function () { loadTexAndDraw(gl, tex_stool) };
  tex_stool.image.src = 'textures/stool.jpg';

  document.onkeydown = function (ev) {
    keydown(ev, viewMatrix, u_ViewMatrix);
  };

  setCamPosition(viewMatrix, u_ViewMatrix);

  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  gl.uniform3f(u_LightPosition, 0, 40, 0);
}

function loadTexAndDraw(gl, texture) {

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.image);

  gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  total_loaded += 1;

  if (total_loaded == 9) {
    draw(gl, u_ModelMatrix, u_NormalMatrix);
  }
}

function keydown(ev, viewMatrix, u_ViewMatrix) {

  switch (ev.keyCode) {
    case 40: // Down arrow key 
      ev.preventDefault();
      phi = Math.max(minPhi, (phi - ANGLE_STEP) % 360);
      setCamPosition(viewMatrix, u_ViewMatrix);
      break;
    case 38: // Up arrow key
      ev.preventDefault();
      phi = Math.min(maxPhi, (phi + ANGLE_STEP) % 360);
      setCamPosition(viewMatrix, u_ViewMatrix);
      break;
    case 39: // Right arrow key
      theta = (theta - ANGLE_STEP) % 360;
      setCamPosition(viewMatrix, u_ViewMatrix)
      break;
    case 37: // Left arrow key
      theta = (theta + ANGLE_STEP) % 360;
      setCamPosition(viewMatrix, u_ViewMatrix)
      break;
    case 88: // X key: increase field of view
      fov = Math.min(maxFov, fov + 5);
      setCamPosition(viewMatrix, u_ViewMatrix);
      break;
    case 90: // Z key: decrease field of view
      fov = Math.max(minFov, fov - 5);
      setCamPosition(viewMatrix, u_ViewMatrix);
      break;
    case 87: // W key: pull chairs out
      chairPos = Math.min(maxChairPos, chairPos + 0.3);
      break;
    case 83: // S key: push chairs in
      chairPos = Math.max(minChairPos, chairPos - 0.3);
      break;
    case 65: // A key: spin painting
      paintingCount++;
      break;
    case 68: // D key: spin painting
      paintingCount--;
      break;

    default:
      return;
  }

  draw(gl, u_ModelMatrix, u_NormalMatrix);
}

function rad(deg) {
  return deg * (Math.PI / 180);
}



function setCamPosition(viewMatrix, u_ViewMatrix) {

  // Formulae used: https://community.khronos.org/t/moving-the-camera-using-spherical-coordinates/49549

  var x = fov * Math.cos(rad(theta)) * Math.cos(rad(phi));
  var y = fov * Math.sin(rad(phi));
  var z = fov * Math.cos(rad(phi)) * Math.sin(rad(theta));

  // Camera looks at the origin
  viewMatrix.setLookAt(x, y, z, 0, 0, 0, 0, 1, 0);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
}

function initCubeVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([   // Coords
    1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1,
    1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1,
    1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, 1,
    -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1,
    -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1,
    1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, -1
  ]);

  var normals = new Float32Array([    // Normal
    0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
  ]);

  // Indices of the vertices
  var indices = new Uint8Array([
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // right
    8, 9, 10, 8, 10, 11,    // up
    12, 13, 14, 12, 14, 15,    // left
    16, 17, 18, 16, 18, 19,    // down
    20, 21, 22, 20, 22, 23     // back
  ]);

  // Writing the vertex properties to buffers
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, attribute, data, num) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object.');
    return false;
  }

  // Write data into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  var FSIZE = data.BYTES_PER_ELEMENT;

  // Assign buffer object to the attribute variable

  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, gl.FLOAT, false, FSIZE * num, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}

var g_matrixStack = []; // Array for storing a matrix

function pushMatrix(m) { // Store the specified matrix to the array
  var m2 = new Matrix4(m);
  g_matrixStack.push(m2);
}

function popMatrix() { // Retrieve the matrix from the array
  return g_matrixStack.pop();
}

// Helper function for drawing all objects
function drawObj(gl, u_ModelMatrix, u_NormalMatrix, n) {

  pushMatrix(modelMatrix);

  gl.uniformMatrix4fv(u_ModelMatrix, 0, modelMatrix.elements);
  g_normalMatrix.setInverseOf(modelMatrix);
  g_normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, 0, g_normalMatrix.elements);
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  modelMatrix = popMatrix();
}

// Main draw function
function draw(gl, u_ModelMatrix, u_NormalMatrix) {

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var n = initCubeVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Floor

  var texCoords = new Float32Array([
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v1-v2-v3 front
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,  // v0-v3-v4-v5 right
    4.0, 0.0, 4.0, 4.0, 0.0, 4.0, 0.0, 0.0,  // v0-v5-v6-v1 up
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v1-v6-v7-v2 left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,  // v7-v4-v3-v2 down
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0   // v4-v7-v6-v5 back
  ]);
  if (!initArrayBuffer(gl, 'a_TexCoords', texCoords, 2)) return -1;
  gl.bindTexture(gl.TEXTURE_2D, tex_tiles);

  pushMatrix(modelMatrix);
  modelMatrix.translate(0, -0.25, 0);
  modelMatrix.scale(50, 0.5, 50);
  drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Walls

  var texCoords = new Float32Array([
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v1-v2-v3 front
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,  // v0-v3-v4-v5 right
    1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,  // v0-v5-v6-v1 up
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v1-v6-v7-v2 left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,  // v7-v4-v3-v2 down
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0   // v4-v7-v6-v5 back
  ]);
  if (!initArrayBuffer(gl, 'a_TexCoords', texCoords, 2)) return -1;
  gl.bindTexture(gl.TEXTURE_2D, tex_wall);

  pushMatrix(modelMatrix);
  modelMatrix.translate(-50, 19.25, 0);
  modelMatrix.scale(0.5, 20, 50);
  drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  pushMatrix(modelMatrix);
  modelMatrix.translate(0, 19.25, -50);
  modelMatrix.scale(50, 20, 0.5);
  drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  pushMatrix(modelMatrix);

  // Table
  var texCoords = new Float32Array([
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v1-v2-v3 front
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,  // v0-v3-v4-v5 right
    1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,  // v0-v5-v6-v1 up
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v1-v6-v7-v2 left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,  // v7-v4-v3-v2 down
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0   // v4-v7-v6-v5 back
  ]);
  if (!initArrayBuffer(gl, 'a_TexCoords', texCoords, 2)) return -1;
  gl.bindTexture(gl.TEXTURE_2D, tex_wood);

  modelMatrix.translate(-25, 12, 25);
  pushMatrix(modelMatrix);
  modelMatrix.scale(10, 0.5, 20);
  drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  for (var i = -1; i < 2; i += 2) {
    for (var j = -1; j < 2; j += 2) {
      pushMatrix(modelMatrix);
      modelMatrix.translate(5 * i, -6, 15 * j);
      // modelMatrix.translate(10 * i, 0, 20 * j);
      // modelMatrix.translate(5 * -i, 0, 5 * -j);
      modelMatrix.scale(0.75, 6, 0.75);
      drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
      modelMatrix = popMatrix();
    }
  }

  for (var i = -1; i < 2; i += 2) {
    for (var j = -1; j < 2; j += 2) {
      pushMatrix(modelMatrix);
      modelMatrix.translate((10 + chairPos) * i, -3, 7 * j);
      if (i == 1) {
        modelMatrix.rotate(180, 0, 1, 0);
      }
      drawChair(gl, u_ModelMatrix, u_NormalMatrix, n);
      modelMatrix = popMatrix();

    }
  }
  modelMatrix = popMatrix();

  // Painting
  pushMatrix(modelMatrix);
  modelMatrix.translate(15, 25, -49.5);
  modelMatrix.rotate(paintingCount * 3.6, 0, 0, 1);
  drawPainting(gl, u_ModelMatrix, u_NormalMatrix, n, 0);
  modelMatrix = popMatrix();

  pushMatrix(modelMatrix);
  modelMatrix.translate(-15, 25, -49.5);
  modelMatrix.rotate(paintingCount * 3.6, 0, 0, 1);
  drawPainting(gl, u_ModelMatrix, u_NormalMatrix, n, 1);
  modelMatrix = popMatrix();

  //Sideboard

  var texCoords = new Float32Array([
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v1-v2-v3 front
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,  // v0-v3-v4-v5 right
    1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,  // v0-v5-v6-v1 up
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v1-v6-v7-v2 left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,  // v7-v4-v3-v2 down
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0   // v4-v7-v6-v5 back
  ]);
  if (!initArrayBuffer(gl, 'a_TexCoords', texCoords, 2)) return -1;
  gl.bindTexture(gl.TEXTURE_2D, tex_walnut);

  pushMatrix(modelMatrix);
  modelMatrix.translate(45, 4, 0);
  modelMatrix.scale(4, 4, 20);
  drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  //Stool

  var texCoords = new Float32Array([
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v1-v2-v3 front
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,  // v0-v3-v4-v5 right
    1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,  // v0-v5-v6-v1 up
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v1-v6-v7-v2 left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,  // v7-v4-v3-v2 down
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0   // v4-v7-v6-v5 back
  ]);
  if (!initArrayBuffer(gl, 'a_TexCoords', texCoords, 2)) return -1;
  gl.bindTexture(gl.TEXTURE_2D, tex_stool);

  pushMatrix(modelMatrix);
  modelMatrix.translate(45, 4, 45);
  modelMatrix.scale(4, 4, 4);
  drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Television

  var texCoords = new Float32Array([
    4.0, 4.0, 0.0, 4.0, 0.0, 0.0, 4.0, 0.0,  // v0-v1-v2-v3 front
    0.0, 4.0, 0.0, 0.0, 4.0, 0.0, 4.0, 4.0,  // v0-v3-v4-v5 right
    1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,  // v0-v5-v6-v1 up
    4.0, 4.0, 0.0, 4.0, 0.0, 0.0, 4.0, 0.0,  // v1-v6-v7-v2 left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,  // v7-v4-v3-v2 down
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0   // v4-v7-v6-v5 back
  ]);
  if (!initArrayBuffer(gl, 'a_TexCoords', texCoords, 2)) return -1;
  gl.bindTexture(gl.TEXTURE_2D, tex_tv);

  pushMatrix(modelMatrix);
  modelMatrix.translate(45, 18, 0);
  drawTelevision(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();

  // Sofa

  var texCoords = new Float32Array([
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v1-v2-v3 front
    0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,  // v0-v3-v4-v5 right
    1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,  // v0-v5-v6-v1 up
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v1-v6-v7-v2 left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,  // v7-v4-v3-v2 down
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0   // v4-v7-v6-v5 back
  ]);
  if (!initArrayBuffer(gl, 'a_TexCoords', texCoords, 2)) return -1;
  gl.bindTexture(gl.TEXTURE_2D, tex_sofa);

  pushMatrix(modelMatrix);
  modelMatrix.translate(20, 3, 0);
  drawSofa(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}

function drawChair(gl, u_ModelMatrix, u_NormalMatrix, n) {
  pushMatrix(modelMatrix);
  modelMatrix.scale(5, 0.5, 5);
  drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  for (var k = -1; k < 2; k += 2) {
    for (var l = -1; l < 2; l += 2) {
      pushMatrix(modelMatrix);
      modelMatrix.translate(3.5 * k, -4.5, 3.5 * l);
      modelMatrix.scale(0.6, 4.5, 0.6);
      drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
      modelMatrix = popMatrix();
    }
  }
  for (var l = -1; l < 2; l += 1) {
    pushMatrix(modelMatrix);
    modelMatrix.translate(-3.5, 5, 3.5 * l);
    modelMatrix.scale(0.6, 5, 0.6);
    drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
    modelMatrix = popMatrix();
  }
  pushMatrix(modelMatrix);
  modelMatrix.translate(-3.5, 10, 0);
  modelMatrix.scale(0.6, 0.6, 5);
  drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}

function drawPainting(gl, u_ModelMatrix, u_NormalMatrix, n, index) {
  var texCoords = new Float32Array([
    1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0,  // v0-v1-v2-v3 front
    0.0, 4.0, 0.0, 0.0, 4.0, 0.0, 4.0, 4.0,  // v0-v3-v4-v5 right
    1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,  // v0-v5-v6-v1 up
    1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v1-v6-v7-v2 left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,  // v7-v4-v3-v2 down
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0   // v4-v7-v6-v5 back
  ]);
  if (!initArrayBuffer(gl, 'a_TexCoords', texCoords, 2)) return -1;
  if (index) {
    gl.bindTexture(gl.TEXTURE_2D, tex_painting);
  } else {
    gl.bindTexture(gl.TEXTURE_2D, tex_painting2);
  }

  pushMatrix(modelMatrix);
  modelMatrix.scale(8, 8, 0.5);
  drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}

function drawTelevision(gl, u_ModelMatrix, u_NormalMatrix, n) {
  pushMatrix(modelMatrix);
  modelMatrix.scale(0.25, 9, 16);
  drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0, -10, 0);
  modelMatrix.scale(2, 0.75, 4);
  drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
}

function drawSofa(gl, u_ModelMatrix, u_NormalMatrix, n) {
  pushMatrix(modelMatrix);
  modelMatrix.scale(10, 3, 20);
  drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0, 4, 16);
  modelMatrix.scale(10, 2, 4);
  drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  pushMatrix(modelMatrix);
  modelMatrix.translate(0, 4, -16);
  modelMatrix.scale(10, 2, 4);
  drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
  modelMatrix = popMatrix();
  modelMatrix.translate(-6, 6, 0);
  modelMatrix.scale(4, 4, 20);
  drawObj(gl, u_ModelMatrix, u_NormalMatrix, n);
}
