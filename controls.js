// Much of the content of this file is reused from a Three.js example
// at https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html
// See the three.js licence in the threejs subdirectory of this project
var controls = {

  moveForward: false,
  moveLeft: false,
  moveBackward: false,
  moveRight: false,
  velocity: new THREE.Vector3(),
  controlsEnabled: false,

  setupPointerLock: function(controls) {
    var blocker = document.getElementById( 'blocker' );
    var instructions = document.getElementById( 'instructions' );
    var self = this;
    // http://www.html5rocks.com/en/tutorials/pointerlock/intro/
    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if ( havePointerLock ) {
      var element = document.body;
      var pointerlockchange = function ( event ) {
        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
          // controlsEnabled = true;
          controls.enabled = true;
          self.controlsEnabled = true;
          blocker.style.display = 'none';
        } else {
          controls.enabled = false;
          blocker.style.display = '-webkit-box';
          blocker.style.display = '-moz-box';
          blocker.style.display = 'box';
          instructions.style.display = '';
        }
      };
      var pointerlockerror = function ( event ) {
        instructions.style.display = '';
      };
      // Hook pointer lock state change events
      document.addEventListener( 'pointerlockchange', pointerlockchange, false );
      document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
      document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
      document.addEventListener( 'pointerlockerror', pointerlockerror, false );
      document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
      document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
      instructions.addEventListener( 'click', function ( event ) {
        instructions.style.display = 'none';
        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
      }, false );
    } else {
      instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
    }
  },

  setup: function(scene, camera) {
    var controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());
    this.setupPointerLock(controls);
    this.controls = controls;
    this.prevTime = performance.now();

    var self = this;
    var onKeyDown = function ( event ) {
      switch ( event.keyCode ) {
        case 38: // up
        case 87: // w
        self.moveForward = true;
        break;
        case 37: // left
        case 65: // a
        self.moveLeft = true; break;
        case 40: // down
        case 83: // s
        self.moveBackward = true;
        break;
        case 39: // right
        case 68: // d
        self.moveRight = true;
        break;
      }
    };
    var onKeyUp = function ( event ) {
      switch( event.keyCode ) {
        case 38: // up
        case 87: // w
        self.moveForward = false;
        break;
        case 37: // left
        case 65: // a
        self.moveLeft = false;
        break;
        case 40: // down
        case 83: // s
        self.moveBackward = false;
        break;
        case 39: // right
        case 68: // d
        self.moveRight = false;
        break;
      }
    };
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
  },

  move: function() {
    if ( this.controlsEnabled ) {
      var time = performance.now();
      var delta = ( time - this.prevTime ) / 1000;
      this.velocity.x -= this.velocity.x * 10.0 * delta;
      this.velocity.z -= this.velocity.z * 10.0 * delta;
      if ( this.moveForward ) this.velocity.z -= 200.0 * delta;
      if ( this.moveBackward ) this.velocity.z += 200.0 * delta;
      if ( this.moveLeft ) this.velocity.x -= 200.0 * delta;
      if ( this.moveRight ) this.velocity.x += 200.0 * delta;

      this.controls.getObject().translateX( this.velocity.x * delta );
      this.controls.getObject().translateZ( this.velocity.z * delta );

      this.prevTime = time;
    }
  },

  getPosition: function() {
    return this.controls.getObject().position;
  }

}
