var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL(){
   canvas = document.getElementById('webgl');

   gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
   if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
   }

   gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
   if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
       console.log('Failed to intialize shaders.');
       return;
   }

   a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   if (a_Position < 0) {
       console.log('Failed to get the storage location of a_Position');
       return;
   }

   u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
   if (!u_FragColor) {
       console.log('Failed to get u_FragColor');
       return;
   }

   u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
   if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
   }

   u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
   if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
   }

   var identityM = new Matrix4();
   gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

const POINT = 0;

let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_globalAngle=0;
let g_legAnimation=false;
let g_footAngle1=0;
let g_footAngle2=0;
let g_legAngle1=0;
let g_legAngle2=0;
let g_legAngle3=0;
let g_legAngle4=0;
let g_mouthAngle=-49;
let g_tailAngle=0;
let g_tailAnimation=false;
// let g_mouthAnimation=false;
let crazyAnimation=false;
let g_lastX = null;

function addActionsForHtmlUI(){

    document.getElementById('legAnimationOnButton').onclick = function() { g_legAnimation = true;};
    document.getElementById('legAnimationOffButton').onclick  = function() { g_legAnimation = false;};

    document.getElementById('animationTailOnButton').onclick = function() { g_tailAnimation = true;};
    document.getElementById('animationTailOffButton').onclick  = function() { g_tailAnimation = false;};

    let log = document.querySelector("#log");
    document.addEventListener("click", logKey);

    function logKey(e) {
        if (e.shiftKey == true) {
            crazyAnimation=true;
        }
    }

    // document.getElementById('animationMouthOnButton').onclick = function() { g_mouthAnimation = true;};
    // document.getElementById('animationMouthOffButton').onclick  = function() { g_mouthAnimation = false;};

    document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
    angleSlide = document.getElementById('angleSlide');
    document.getElementById('footSlide1').addEventListener('mousemove', function() { g_footAngle1 = this.value; renderAllShapes();});
    document.getElementById('footSlide2').addEventListener('mousemove', function() { g_footAngle2 = this.value; renderAllShapes();});
    document.getElementById('legSlide1').addEventListener('mousemove', function() { g_legAngle1 = this.value; renderAllShapes();});
    document.getElementById('legSlide2').addEventListener('mousemove', function() { g_legAngle2 = this.value; renderAllShapes();});
    document.getElementById('legSlide3').addEventListener('mousemove', function() { g_legAngle3 = this.value; renderAllShapes();});
    document.getElementById('legSlide4').addEventListener('mousemove', function() { g_legAngle4 = this.value; renderAllShapes();});

    document.getElementById('mouthSlide').addEventListener('mousemove', function() { g_mouthAngle = this.value; renderAllShapes();});

    document.getElementById('tailSlide').addEventListener('mousemove', function() { g_tailAngle = this.value; renderAllShapes();});
 
 }

function main() {
   setupWebGL();
   connectVariablesToGLSL();
   addActionsForHtmlUI();

   canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
   gl.clearColor(0.0, 0.0, 0.0, 1.0);
   requestAnimationFrame(tick);
}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

function tick() {
    g_seconds=performance.now()/1000.0-g_startTime;
    updateAnimationAngles();

    renderAllShapes();

    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_legAnimation) {
        g_legAngle1 = (30*Math.sin((g_seconds*5)));
        g_footAngle1 = (30*Math.sin((g_seconds*5)));
        g_legAngle2 = (30*Math.sin((g_seconds)+3));
        g_footAngle2 = (30*Math.sin((g_seconds*5)+3));
        g_legAngle3 = (30*Math.sin((g_seconds*5)));
        g_legAngle4 = (30*Math.sin((g_seconds*5)+2));
    }

    if (g_tailAnimation) {
        g_tailAngle = (45*Math.sin(g_seconds));
    }

    // if (g_mouthAnimation) {
    //     g_mouthAngle = (0.1*Math.sin(g_seconds));
    // }

    if (crazyAnimation) {
        g_tailAngle = (360*Math.sin((g_seconds*10)));
        g_legAngle1 = (30*Math.sin((g_seconds*10)));
        g_footAngle1 = (30*Math.sin((g_seconds*10)));
        g_legAngle2 = (30*Math.sin(((g_seconds*10)+3)));
        g_footAngle2 = (30*Math.sin((g_seconds*10)+3));
        g_legAngle3 = (30*Math.sin((g_seconds*10)));
        g_legAngle4 = (30*Math.sin((g_seconds*10)+2)); 
    } 
}

function renderAllShapes() {

    var startTime = performance.now();
 
    var globalRotMat=new Matrix4().rotate(g_globalAngle,0,1,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT );


    // Leg Joint 1
    var foot1leg = new Cube();
    foot1leg.color = [0.29, 0.29, 0.29, 1.0];
    foot1leg.matrix.translate(0.1, -0.43, -.11);
    foot1leg.matrix.rotate(180,1,0,0);
    foot1leg.matrix.rotate(g_legAngle1,1,0,0);
    var leg1CoordintesMat=new Matrix4(foot1leg.matrix);
    foot1leg.matrix.scale(0.08, .3, .1);
    foot1leg.render();

    var foot1 = new Cube();
    foot1.color = [0.58, 0.565, 0.565, 1.0];
    foot1.matrix = leg1CoordintesMat;
    foot1.matrix.translate(-0.02, 0.21, -0.005);
    foot1.matrix.rotate(360,1,0,0);
    foot1.matrix.rotate(g_footAngle1,1,0,0);
    foot1.matrix.scale(0.12, .12, .11);
    foot1.render();


    // Leg Joint 2
    var foot2leg = new Cube();
    foot2leg.color = [0.29, 0.29, 0.29, 1.0];
    foot2leg.matrix.translate(-0.25, -0.45, -.11);
    foot2leg.matrix.rotate(180,1,0,0);
    foot2leg.matrix.rotate(g_legAngle2,1,0,0);
    var leg2CoordintesMat=new Matrix4(foot2leg.matrix);
    foot2leg.matrix.scale(0.08, .3, .1);
    foot2leg.render();

    var foot2 = new Cube();
    foot2.color = [0.58, 0.565, 0.565, 1.0];
    foot2.matrix = leg2CoordintesMat;
    foot2.matrix.translate(-0.01, 0.19, -0.005);
    foot2.matrix.rotate(360,1,0,0);
    foot2.matrix.rotate(g_footAngle2,1,0,0);
    foot2.matrix.scale(0.12, .12, .11);
    foot2.render();
    

    // Leg Joint 3
    var foot3leg = new Cube();
    foot3leg.color = [0.29, 0.29, 0.29, 1.0];
    foot3leg.matrix.translate(0.1, -0.45, 0.33);
    foot3leg.matrix.rotate(180,1,0,0);
    foot3leg.matrix.rotate(g_legAngle3,1,0,0);
    var leg3CoordintesMat=new Matrix4(foot3leg.matrix);
    foot3leg.matrix.scale(0.08, .3, .1);
    foot3leg.render();

    var foot3 = new Cube();
    foot3.color = [0.58, 0.565, 0.565, 1.0];
    foot3.matrix = leg3CoordintesMat;
    foot3.matrix.translate(-0.01, 0.19, -0.005);
    foot3.matrix.rotate(360,1,0,0);
    foot3.matrix.scale(0.12, .12, .11);
    foot3.render();


    // Leg Joint 4
    var foot4leg = new Cube();
    foot4leg.color = [0.29, 0.29, 0.29, 1.0];
    foot4leg.matrix.translate(-0.25, -0.45, 0.33);
    foot4leg.matrix.rotate(180,1,0,0);
    foot4leg.matrix.rotate(g_legAngle4,1,0,0);
    var leg4CoordintesMat=new Matrix4(foot4leg.matrix);
    foot4leg.matrix.scale(0.08, .3, .1);
    foot4leg.render();

    var foot4 = new Cube();
    foot4.color = [0.58, 0.565, 0.565, 1.0];
    foot4.matrix = leg4CoordintesMat;
    foot4.matrix.translate(-0.01, 0.19, -0.01);
    foot4.matrix.rotate(0,1,0,0);
    foot4.matrix.scale(0.12, .12, .11);
    foot4.render();


    // Cat Body
    var body = new Cube();
    body.color = [0.58, 0.565, 0.565, 1.0];
    body.matrix = leg2CoordintesMat;
    body.matrix.translate(-0.05, -2.9, -4);
    body.matrix.rotate(0,1,0,0);
    var bodyCoordinatesMat=new Matrix4(body.matrix);
    body.matrix.scale(4, 2, 5);
    body.render();


    // Cat Head
    var head = new Cube();
    head.color = [0.58, 0.565, 0.565, 1.0];
    head.matrix.translate(-0.3, -0.3, -0.3);
    head.matrix.rotate(0,1,0,0);
    head.matrix.scale(0.55, 0.4, 0.35);
    head.render();
    

    // Snout Area
    var snoutRect = new Cube();
    snoutRect.color = [0.831, 0.831, 0.831, 1.0];
    snoutRect.matrix.translate(-0.17, -0.25, -0.35);
    snoutRect.matrix.rotate(0,1,0,0);
    snoutRect.matrix.scale(0.3, 0.1, 0.05);
    snoutRect.render();

    var snoutSq1 = new Cube();
    snoutSq1.color = [0.831, 0.831, 0.831, 1.0];
    snoutSq1.matrix.translate(-0.17, -0.28, -0.35);
    snoutSq1.matrix.rotate(0,1,0,0);
    snoutSq1.matrix.scale(0.12, 0.12, 0.05);
    snoutSq1.render();

    var snoutSq2 = new Cube();
    snoutSq2.color = [0.831, 0.831, 0.831, 1.0];
    snoutSq2.matrix.translate(0.01, -0.28, -0.35);
    snoutSq2.matrix.rotate(0,1,0,0);
    snoutSq2.matrix.scale(0.12, 0.12, 0.05);
    snoutSq2.render();

    var mouth = new Cube();
    mouth.color = [0.831, 0.831, 0.831, 1.0];
    var mouthOffset = -0.1 + (g_mouthAngle - (-40)) * (0.2 / (-31 - (-40)));
    mouth.matrix.translate(-0.08, mouthOffset, -0.35);
    mouth.matrix.rotate(0,1,0,0);
    mouth.matrix.scale(0.12, 0.03, 0.05);
    mouth.render();


    // Nose
    var noseBridge = new Cube();
    noseBridge.color = [0.29, 0.29, 0.29, 1.0];
    noseBridge.matrix.translate(-0.08, -0.15, -0.35);
    noseBridge.matrix.rotate(0,1,0,0);
    noseBridge.matrix.scale(0.12, 0.04, 0.05);
    noseBridge.render();

    var noseRect1 = new Cube();
    noseRect1.color = [0.831, 0.62, 0.588, 1.0];
    noseRect1.matrix.translate(-0.055, -0.17, -0.4);
    noseRect1.matrix.rotate(0,1,0,0);
    noseRect1.matrix.scale(0.07, 0.04, 0.05);
    noseRect1.render();

    var noseRect2 = new Cube();
    noseRect2.color = [0.831, 0.62, 0.588, 1.0];
    noseRect2.matrix.translate(-0.001, -0.2, -0.4);
    noseRect2.matrix.rotate(90,0,0,1);
    noseRect2.matrix.scale(0.07, 0.04, 0.05);
    noseRect2.render();


    // Eyes
    var leftEye = new Cube();
    leftEye.color = [0.0, 0.0, 0.0, 1.0];
    leftEye.matrix.translate(-0.13, -0.15, -0.32);
    leftEye.matrix.rotate(0,1,0,0);
    leftEye.matrix.scale(0.08, 0.13, 0.05);
    leftEye.render();

    var rightEye = new Cube();
    rightEye.color = [0.0, 0.0, 0.0, 1.0];
    rightEye.matrix.translate(0.008, -0.15, -0.32);
    rightEye.matrix.rotate(0,1,0,0);
    rightEye.matrix.scale(0.08, 0.13, 0.05);
    rightEye.render();

    var whiteLeftEye = new Cube();
    whiteLeftEye.color = [1.0, 1.0, 1.0, 1.0];
    whiteLeftEye.matrix.translate(-0.15, -0.15, -0.31);
    whiteLeftEye.matrix.rotate(0,1,0,0);
    whiteLeftEye.matrix.scale(0.12, 0.15, 0.05);
    whiteLeftEye.render();
    
    var whiteRightEye = new Cube();
    whiteRightEye.color = [1.0, 1.0, 1.0, 1.0];
    whiteRightEye.matrix.translate(-0.01, -0.15, -0.31);
    whiteRightEye.matrix.rotate(0,1,0,0);
    whiteRightEye.matrix.scale(0.12, 0.15, 0.05);
    whiteRightEye.render();

    var glintLeftEye = new Cube();
    glintLeftEye.color = [1.0, 1.0, 1.0, 1.0];
    glintLeftEye.matrix.translate(-0.11, -0.07, -0.322);
    glintLeftEye.matrix.rotate(0,1,0,0);
    glintLeftEye.matrix.scale(0.02, 0.02, 0.05);
    glintLeftEye.render();

    var glintRightEye = new Cube();
    glintRightEye.color = [1.0, 1.0, 1.0, 1.0];
    glintRightEye.matrix.translate(0.03, -0.07, -0.322);
    glintRightEye.matrix.rotate(0,1,0,0);
    glintRightEye.matrix.scale(0.02, 0.02, 0.05);
    glintRightEye.render();


    // Tail
    var bottomTail = new Cube();
    bottomTail.color = [0.29, 0.29, 0.29, 1.0];
    bottomTail.matrix = bodyCoordinatesMat;
    bottomTail.matrix.translate(1.5, 0.5, 1.2);
    bottomTail.matrix.rotate(180,1,0,0);
    bottomTail.matrix.rotate(g_tailAngle,0,0,1);
    var bottomTailCoordinatesMat=new Matrix4(bottomTail.matrix);
    bottomTail.matrix.scale(1, 4, 1);
    bottomTail.render();

    var topTail = new Cube();
    topTail.color = [0.58, 0.565, 0.565, 1.0];
    topTail.matrix = bottomTailCoordinatesMat;
    topTail.matrix.translate(-0.001, 0.2, 0.1);
    topTail.matrix.rotate(0,1,0,0);
    topTail.matrix.scale(0.08, .28, .1);
    topTail.render();

    var cubePrism = new CubePrism();
    cubePrism.color = [0.29, 0.29, 0.29, 1.0];
    cubePrism.matrix.translate(0.05, 0.1, -0.2);
    cubePrism.matrix.rotate(0,1,0,0);
    cubePrism.matrix.scale(0.2, 0.2, 0.1);
    cubePrism.render();

    var cubePrism = new CubePrism();
    cubePrism.color = [.831, 0.62, 0.588, 1.0];
    cubePrism.matrix.translate(0.09, 0.1, -0.2);
    cubePrism.matrix.rotate(0,1,0,0);
    cubePrism.matrix.scale(0.12, 0.12, 0.05);
    cubePrism.render();

    var cubePrism = new CubePrism();
    cubePrism.color = [0.29, 0.29, 0.29, 1.0];
    cubePrism.matrix.translate(-0.3, 0.1, -0.2);
    cubePrism.matrix.rotate(0,1,0,0);
    cubePrism.matrix.scale(0.2, 0.2, 0.1);
    cubePrism.render();

    var cubePrism = new CubePrism();
    cubePrism.color = [.831, 0.62, 0.588, 1.0];
    cubePrism.matrix.translate(-0.26, 0.1, -0.2);
    cubePrism.matrix.rotate(0,1,0,0);
    cubePrism.matrix.scale(0.12, 0.12, 0.05);
    cubePrism.render();

    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration/10), "numdot");
 }
   
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
   }

