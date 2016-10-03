init();
render();

var scene, camera, renderer, controls;
var container, stats;

var gui;
var params;
var mesh;

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
    spreadFactor: 1
  };
  gui = new dat.GUI();
  gui.add(params, "curveFactor", 0,4);
  gui.add(params, "spreadFactor", 1,10);
}

function render() {
  requestAnimationFrame(render);
  controls.update();
  stats.update();
  if (mesh != undefined) {
    mesh.material.uniforms.curveFactor.value = params.curveFactor;
    mesh.material.uniforms.spreadFactor.value = params.spreadFactor;
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
  var spread = 40;

  var vertices = object.children[0].geometry.getAttribute("position");
  var geometry = new THREE.InstancedBufferGeometry();
  geometry.maxInstancedCount = instances;
  gui.add(geometry, 'maxInstancedCount',1,instances);
  geometry.addAttribute('position',vertices);

  var offsets = new THREE.InstancedBufferAttribute(new Float32Array(instances*3),3,1);
  for (var i=0; i<offsets.count; i++) {
      offsets.setXYZ(i, Math.random()*spread-spread/2, 0, Math.random()*spread-spread/2);
  }
  geometry.addAttribute('offset', offsets);

  var colors = new THREE.InstancedBufferAttribute(new Float32Array(instances*3),3,1);
  for (var i=0; i<colors.count; i++) {
    colors.setXYZ(i,Math.random()*0.2,0.4+Math.random()*0.6,Math.random()*0.1);
  }
  geometry.addAttribute('color', colors);

  var angles = new THREE.InstancedBufferAttribute(new Float32Array(instances),1,1);
  for (var i=0; i<angles.count; i++) {
    angles.setX(i,Math.random()*Math.PI);
  }
  geometry.addAttribute('angle', angles);

  var heights = new THREE.InstancedBufferAttribute(new Float32Array(instances),1,1);
  for (var i=0; i<heights.count; i++) {
    heights.setX(i,Math.random()+1);
  }
  geometry.addAttribute('height', heights);

  var widths = new THREE.InstancedBufferAttribute(new Float32Array(instances),1,1);
  for (var i=0; i<widths.count; i++) {
    widths.setX(i,Math.random()+1);
  }
  geometry.addAttribute('width', widths);

  var curves = new THREE.InstancedBufferAttribute(new Float32Array(instances),1,1);
  for (var i=0; i<curves.count; i++) {
    curves.setX(i,Math.random()*0.3);
  }
  geometry.addAttribute('curve', curves);

  var material = new THREE.RawShaderMaterial( {
    uniforms: {
      curveFactor: {value: 1},
      spreadFactor: {value: 1}
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
