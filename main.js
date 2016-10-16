init();
render();

var scene, camera, renderer, controls;
var container, stats;

var gui;
var params;
var mesh;
var clock;

function init() {
  container = document.getElementById("container");

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75,
                                          window.innerWidth/window.innerHeight,
                                          0.1,
                                          1000);
  renderer = new THREE.WebGLRenderer();
  if ( renderer.extensions.get( 'ANGLE_instanced_arrays' ) === false ) {
	 //document.getElementById( "notSupported" ).style.display = "";
   console.log("Error");
	 return;
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.z += 30;
  camera.position.y += 30;

  controls = new THREE.TrackballControls( camera, renderer.domElement );
  controls.rotateSpeed = 5.0;
  controls.zoomSpeed = 1.0;
  controls.panSpeed = 5.0;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;
  controls.keys = [ 65, 83, 68 ];
  //controls.addEventListener( 'change', render );

  var loader = new THREE.OBJLoader();
  loader.load('grass.obj',loadGrass);

  stats = new Stats();
  container.appendChild(stats.dom);

  params = {
    curveFactor: 1,
    spreadFactor: 1,
    newWind: false,
    spread: 40,
    wind: function() {params.newWind = true;}
  };
  gui = new dat.GUI();
  gui.add(params, "curveFactor", 0.1,1.5);
  gui.add(params, "spreadFactor", 1,10);
  gui.add(params, "wind");

  clock = new THREE.Clock()
}

function render() {
  requestAnimationFrame(render);
  controls.update();
  stats.update();
  if (mesh != undefined) {
    mesh.material.uniforms.time.value = clock.getElapsedTime();
    mesh.material.uniforms.curveFactor.value = params.curveFactor;
    mesh.material.uniforms.spreadFactor.value = params.spreadFactor;
    mesh.material.uniforms.time.value = clock.getElapsedTime();
    if (params.newWind) {
      mesh.material.uniforms.windStartTime.value = clock.getElapsedTime();
      mesh.material.uniforms.windAngle.value = Math.random()*2*Math.PI;
      params.newWind = false;
    }
  }
  renderer.render(scene,camera);
}

function onWindowResize( event ) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function loadGrass(object) {
  var instances = 20000;

  var vertices = object.children[0].geometry.getAttribute("position");
  var geometry = new THREE.InstancedBufferGeometry();
  // Start with only half of the maximum instances for low-performance computers
  geometry.maxInstancedCount = instances/2;
  gui.add(geometry, 'maxInstancedCount',1,instances);
  geometry.addAttribute('position',vertices);

  var offsets = new THREE.InstancedBufferAttribute(new Float32Array(instances*3),3,1);
  for (var i=0; i<offsets.count; i++) {
      var r = Math.random()*params.spread-params.spread/2;
      var a = Math.random()*Math.PI*2;
      offsets.setXYZ(i, Math.cos(a)*r, 0, Math.sin(a)*r);
  }
  geometry.addAttribute('offset', offsets);

  var colors = new THREE.InstancedBufferAttribute(new Float32Array(instances*3),3,1);
  for (var i=0; i<colors.count; i++) {
    colors.setXYZ(i,Math.random()*0.2,0.4+Math.random()*0.6,Math.random()*0.1);
  }
  geometry.addAttribute('color', colors);

  var angles = new THREE.InstancedBufferAttribute(new Float32Array(instances),1,1);
  for (var i=0; i<angles.count; i++) {
    angles.setX(i,Math.random()*2*Math.PI);
  }
  geometry.addAttribute('angle', angles);

  var heights = new THREE.InstancedBufferAttribute(new Float32Array(instances),1,1);
  for (var i=0; i<heights.count; i++) {
    heights.setX(i,Math.random()+1);
  }
  geometry.addAttribute('heightCoefficient', heights);

  var widths = new THREE.InstancedBufferAttribute(new Float32Array(instances),1,1);
  for (var i=0; i<widths.count; i++) {
    widths.setX(i,Math.random()+1);
  }
  geometry.addAttribute('widthCoefficient', widths);

  var curves = new THREE.InstancedBufferAttribute(new Float32Array(instances),1,1);
  for (var i=0; i<curves.count; i++) {
    // Set the tip of the pieces to an angle between 0 and approx. 40 degrees
    curves.setX(i,Math.random()*0.7);
  }
  geometry.addAttribute('curve', curves);

  var frequencies = new THREE.InstancedBufferAttribute(new Float32Array(instances),1,1);
  for (var i=0; i<frequencies.count; i++) {
    frequencies.setX(i,Math.random()/2 + 0.5);
  }
  geometry.addAttribute('stiffness', frequencies);

  var material = new THREE.RawShaderMaterial( {
    uniforms: {
      time: {value: clock.getElapsedTime()},
      curveFactor: {value: 1},
      spreadFactor: {value: 1},
      time: {value: clock.getElapsedTime()},
      windStartTime: {value: clock.getElapsedTime()-100},
      spread: {value: params.spread},
      windAngle: {value: 0}
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    side: THREE.DoubleSide,
    transparent: true
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  render();
}
