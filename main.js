init();
render();

var scene, camera, renderer, controls;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75,
                                          window.innerWidth/window.innerHeight,
                                          0.1,
                                          1000);
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.z += 6;

  controls = new THREE.TrackballControls( camera );
  controls.rotateSpeed = 5.0;
  controls.zoomSpeed = 5.0;
  controls.panSpeed = 5.0;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;
  controls.keys = [ 65, 83, 68 ];
  //controls.addEventListener( 'change', render );

  var loader = new THREE.OBJLoader();
  loader.load('grass.obj',loadGrass);
}

function render() {
  requestAnimationFrame(render);
  controls.update();
  renderer.render(scene,camera);
}


function loadGrass(object) {
  var vertices = object.children[0].geometry.getAttribute("position");
  var geometry = new THREE.BufferGeometry();
  geometry.addAttribute('position',vertices);

  var material = new THREE.RawShaderMaterial( {
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    side: THREE.DoubleSide,
  });

  var mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  render();
}
