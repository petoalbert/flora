var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75,
                                         window.innerWidth/window.innerHeight,
                                         0.1,
                                         1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BufferGeometry();

var vertices = new THREE.BufferAttribute(new Float32Array(9), 3);
vertices.setXYZ(0, -1, -1, 0);
vertices.setXYZ(1, 1, -1, 0);
vertices.setXYZ(2, 0, 1, 0);
geometry.addAttribute('position', vertices);

var material = new THREE.RawShaderMaterial( {
  vertexShader: document.getElementById('vertexShader').textContent,
  fragmentShader: document.getElementById('fragmentShader').textContent,
  side: THREE.DoubleSide,
});

console.log("Content!!!");
console.log(document.getElementById('vertexShader').textContent);

var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

camera.position.z += 3;

function render() {
  requestAnimationFrame(render);
  renderer.render(scene,camera);
}
render();
