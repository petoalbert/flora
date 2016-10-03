

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75,
                                         window.innerWidth/window.innerHeight,
                                         0.1,
                                         1000);
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z += 6;

function render() {
  requestAnimationFrame(render);
  renderer.render(scene,camera);
}

render();

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
}

var loader = new THREE.OBJLoader();

loader.load('grass.obj',loadGrass);
