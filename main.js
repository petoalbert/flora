init();
render();

var scene, camera, renderer;
var container, stats;

var params;
var mesh;
var clock;
var sky;
var ground;

function init() {
  container = document.getElementById("container");

  scene = new THREE.Scene();

  params = {
    curveFactor: 1,
    spreadFactor: 1,
    newWind: false,
    spread: 60,
    windSpeed: 20,
    windRiseTime: 0.75,
    windSettlingTime: 2.0,
    windStartTime: -100,
    windMaxInterval: 10,
    fogColor: new THREE.Color(0xaaaaee),
    groundColor: new THREE.Color(0x18780A),
    instances: 10000
  };
  params.fogFar = params.spread/2;
  params.fogNear = params.spread/4;

  camera = new THREE.PerspectiveCamera(75,
                                          window.innerWidth/window.innerHeight,
                                          0.1,
                                          10000);
  renderer = new THREE.WebGLRenderer();
  if ( renderer.extensions.get( 'ANGLE_instanced_arrays' ) === false ) {
	 //document.getElementById( "notSupported" ).style.display = "";
   console.log("Error");
	 return;
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls.setup(scene,camera);

  var skyGeometry = new THREE.SphereBufferGeometry(params.spread*20, 32, 32);
  var skyMaterial = new THREE.MeshBasicMaterial( {color: params.fogColor, fog: false } );
  skyMaterial.side = THREE.DoubleSide;
  sky = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(sky);

  var groundGeometry = new THREE.CircleGeometry(params.spread/2, 32);
  var groundMaterial = new THREE.MeshBasicMaterial({color: params.groundColor});
  groundMaterial.side = THREE.DoubleSide;
  ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotateX(Math.PI/2);
  scene.add(ground);

  var loader = new THREE.OBJLoader();
  loader.load('grass.obj',loadGrass);

  stats = new Stats();
  container.appendChild(stats.dom);

  clock = new THREE.Clock()
}

function render() {
  requestAnimationFrame(render);
  stats.update();
  controls.move();

  // Move the ground and sky with the player
  var pos = controls.getPosition().clone();
  ground.position.set(pos.x,0,pos.z);
  sky.position.set(pos.x,0,pos.z);

  if (mesh != undefined) {
    mesh.material.uniforms.time.value = clock.getElapsedTime();
    mesh.material.uniforms.curveFactor.value = params.curveFactor;
    mesh.material.uniforms.spreadFactor.value = params.spreadFactor;
    mesh.material.uniforms.time.value = clock.getElapsedTime();
    if (params.newWind) {
      params.windStartTime = clock.getElapsedTime();
      mesh.material.uniforms.windStartTime.value = params.windStartTime;
      mesh.material.uniforms.windAngle.value = Math.random()*2*Math.PI;
      mesh.material.uniforms.windStart.value = controls.getPosition();
      params.newWind = false;
    }
  }
  renderer.render(scene,camera);
}

function wind() {
  // Iterate 30 times per second
  setTimeout(wind, 1000/30);
  var windLength = (params.windRiseTime + params.windSettlingTime+params.spread/params.windSpeed)*1.2;
  // Only start new wind if the previous one has finished
  if (clock.getElapsedTime() - params.windStartTime > windLength) {
    params.newWind = true;
  }
}

function onWindowResize( event ) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function loadGrass(object) {
  var instances = params.instances;

  var vertices = object.children[0].geometry.getAttribute("position");
  var geometry = new THREE.InstancedBufferGeometry();
  // Start with only half of the maximum instances for low-performance computers
  geometry.maxInstancedCount = instances;
  geometry.addAttribute('position',vertices);

  var offsets = new THREE.InstancedBufferAttribute(new Float32Array(instances*3),3,1);
  for (var i=0; i<offsets.count; i++) {
      var x = Math.random()*params.spread-params.spread/2;
      var z = Math.random()*params.spread-params.spread/2;
      offsets.setXYZ(i, x, 0, z);
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
      windAngle: {value: 0},
      windStart: {value: new THREE.Vector3(0,0,0)},
      windSpeed: {value: params.windSpeed},
      windRiseTime: {value: params.windRiseTime},
      windSettlingTime: {value: params.windSettlingTime},
      playerPosition: {value: controls.getPosition()},
      fogFar: {value: params.fogFar},
      fogNear: {value: params.fogNear},
      fogColor: {value: params.fogColor}
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    side: THREE.DoubleSide,
    transparent: true
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);
  render();
  wind();
}
