const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
const helper = new THREE.CameraHelper( camera );
scene.add( helper );

const camera2 = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 10000 );

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//const controls = new THREE.OrbitControls( camera, renderer.domElement );

camera.position.set( 0, 0, 5 );
camera2.position.set( 0, 0, 10 );
const controls = new THREE.OrbitControls( camera2, renderer.domElement );
controls.update();

const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambientLight );

const light = new THREE.PointLight(0xffffff, 1000)
light.position.set(10, 10, 10)
scene.add(light)

const geometry = new THREE.BoxGeometry( window.innerWidth/window.innerHeight, window.innerHeight/window.innerHeight, 1 );
const material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( window.innerWidth, window.innerHeight );
}

/*setTimeout(async()=> {
    Promise.all([
        await window.navigator.permissions.query({ name: "accelerometer" }),
        await window.navigator.permissions.query({ name: "gyroscope" }),
    ]).then((results) => {
        if (results.every((result) => result.state === "granted")) {
            //sensor.start();
            console.log("Granted");

        } else {
            console.log("No permissions to use RelativeOrientationSensor.");
        }
    });
}, 5000);*/

function permission () {
    if ( typeof( DeviceMotionEvent ) !== "undefined" && typeof( DeviceMotionEvent.requestPermission ) === "function" ) {
        // (optional) Do something before API request prompt.
        DeviceMotionEvent.requestPermission()
            .then( response => {
            // (optional) Do something after API prompt dismissed.
            if ( response == "granted" ) {
                document.getElementById("motionButton").remove();
                window.addEventListener( "devicemotion", handleMotion)
            }
        })
            .catch( console.error )
    } else {
        alert( "DeviceMotionEvent is not defined" );
    }
    if ( typeof( DeviceOrientationEvent ) !== "undefined" && typeof( DeviceOrientationEvent.requestPermission ) === "function" ) {
        // (optional) Do something before API request prompt.
        DeviceOrientationEvent.requestPermission()
            .then( response => {
            // (optional) Do something after API prompt dismissed.
            if ( response == "granted" ) {
                window.addEventListener( "deviceorientation", handleOrientation)
            }
        })
            .catch( console.error )
    } else {
        alert( "DeviceOrientationEvent is not defined" );
    }
}

let quaternion;

function handleMotion (event) {
    console.log(event);
}

function handleOrientation (event) {
    let alpha = (event.alpha * Math.PI) / 180;
    let beta = (event.beta * Math.PI) / 180;
    let gamma = (event.gamma * Math.PI) / 180;

    let screenOrientation = window.orientation || screen.orientation.angle || 0;
    
    let euler = new THREE.Euler();

    //let order = "ZYX";
    let order = "ZYX";
    
    if (screenOrientation === 0) {
        // Portrait mode (default)
        euler.set(-beta, gamma, alpha, order);
    } else if (screenOrientation === 90) {
        // Landscape mode (rotated 90 degrees clockwise)
        euler.set(-gamma, -beta, -alpha, order);
    } else if (screenOrientation === -90 || screenOrientation === 270) {
        // Landscape mode (rotated 90 degrees counterclockwise)
        euler.set(-gamma, beta, -alpha, order);
    } else if (screenOrientation === 180) {
        // Upside-down portrait mode
        euler.set(beta, -gamma, -alpha, order);
    }

    quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(euler);

    cube.quaternion.copy(quaternion);

    //x=ρsinφ cosθ 
    //y=ρsinφsinθ 
    //z=ρcosφ 

    let distance = 1;

    let position = new THREE.Vector3(0, 0, distance);
    position.applyQuaternion(quaternion);
    camera.quaternion.copy(quaternion);

    camera.position.copy(position);
}

document.getElementById("motionButton").addEventListener("click", permission);

function animate() {
    controls.update();

	renderer.render( scene, camera2 );
}
renderer.setAnimationLoop( animate );