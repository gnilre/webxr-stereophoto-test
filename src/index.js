import * as THREE from './three/build/three.module.js';
import { VRButton } from './three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from './three/examples/jsm/webxr/XRControllerModelFactory.js';
import { MpoTextureLoader } from './MpoTextureLoader.js';

const texturePath = 'textures/';

const stereoPhotos = [

    { imageFile: 'P1000057.MPO' },
    { imageFile: 'P1000057.MPO' },
    { imageFile: 'P1000057.MPO' },
    { imageFile: 'P1000057.MPO' },

    { leftImageFile: 'P1030842_l.JPG', rightImageFile: 'P1030842_r.JPG', scale: 0.8 },
    { leftImageFile: 'P1030485_l.JPG', rightImageFile: 'P1030485_r.JPG' },
    { leftImageFile: 'P1030674_l.JPG', rightImageFile: 'P1030674_r.JPG' },
    { leftImageFile: 'P1030754_l.JPG', rightImageFile: 'P1030754_r.JPG' },

    { leftImageFile: 'P1030745_l.JPG', rightImageFile: 'P1030745_r.JPG', scale: 0.8 },
    { leftImageFile: 'P1000829_l.png', rightImageFile: 'P1000829_r.png', scale: 0.5 },
    { leftImageFile: 'P1030006_l.png', rightImageFile: 'P1030006_r.png' },
    { leftImageFile: 'P1030056_l.PNG', rightImageFile: 'P1030056_r.PNG' },

    { leftImageFile: 'P1030081_l.PNG', rightImageFile: 'P1030081_r.PNG', scale: 0.5 },
    { leftImageFile: 'P1030083_l.PNG', rightImageFile: 'P1030083_r.PNG', scale: 0.5 },
    { leftImageFile: 'P1030109_l.PNG', rightImageFile: 'P1030109_r.PNG' },
    { leftImageFile: 'P1030141_l.PNG', rightImageFile: 'P1030141_r.PNG', scale: 0.8 },

    { leftImageFile: 'P1030145_l.PNG', rightImageFile: 'P1030145_r.PNG' },
    { leftImageFile: 'P1030178_l.PNG', rightImageFile: 'P1030178_r.PNG' },
    { leftImageFile: 'P1030198_l.PNG', rightImageFile: 'P1030198_r.PNG', scale: 0.8 },
    { leftImageFile: 'P1030211_l.PNG', rightImageFile: 'P1030211_r.PNG' },

    { leftImageFile: 'P1030229_l.PNG', rightImageFile: 'P1030229_r.PNG', scale: 0.8 },
    { leftImageFile: 'P1030234_l.PNG', rightImageFile: 'P1030234_r.PNG', scale: 0.7 },
    { leftImageFile: 'P1030252_l.PNG', rightImageFile: 'P1030252_r.PNG' },
    { leftImageFile: 'P1030257_l.PNG', rightImageFile: 'P1030257_r.PNG' },

    { leftImageFile: 'DSCF4009_l.PNG', rightImageFile: 'DSCF4009_r.PNG' },
    { leftImageFile: 'DSCF4014_l.PNG', rightImageFile: 'DSCF4014_r.PNG' },
    { leftImageFile: 'DSCF4019_l.PNG', rightImageFile: 'DSCF4019_r.PNG' },
    { leftImageFile: 'DSCF4035_l.PNG', rightImageFile: 'DSCF4035_r.PNG' },

    { leftImageFile: 'DSCF4039_l.PNG', rightImageFile: 'DSCF4039_r.PNG' },
    { leftImageFile: 'DSCF4041_l.PNG', rightImageFile: 'DSCF4041_r.PNG' },
    { leftImageFile: 'DSCF4044_l.PNG', rightImageFile: 'DSCF4044_r.PNG' },
    { leftImageFile: 'DSCF4045_l.PNG', rightImageFile: 'DSCF4045_r.PNG' },
];

main();

async function main() {

    const roomSize = 10;
    const scene = new THREE.Scene();
    const camera = createCamera();
    const renderer = createRenderer();

    camera.position.x = 0;
    camera.position.y = 1.5;
    camera.position.z = 0;

    camera.layers.enable(1);
    camera.layers.enable(2);

    addRoom(scene, roomSize);
    addLights(scene, roomSize);

    let photoStartIndex = 0;
    const photoFrames = addPhotoFrames(scene, roomSize);
    loadStereoPhotos(photoFrames, photoStartIndex);

    // Controllers

    const controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectend', onSelectEnd);
    scene.add(controller1);

    const controller2 = renderer.xr.getController(1);
    controller2.addEventListener('selectend', onSelectEnd);
    scene.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();

    const controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene.add(controllerGrip1);

    const controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    scene.add(controllerGrip2);

    // Laser pointers

    const laserVertices = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1),
    ];
    const laserMaterial = new THREE.LineBasicMaterial({ color: 0xaaffaa });
    const laserGeometry = new THREE.BufferGeometry().setFromPoints(laserVertices);

    const laser1 = new THREE.Line(laserGeometry, laserMaterial);
    laser1.scale.z = 5;
    controller1.add(laser1);

    const laser2 = new THREE.Line(laserGeometry, laserMaterial);
    laser2.scale.z = 5;
    controller2.add(laser2);

    // Mouse input

    let mouseDown = false;
    let clickX;
    let clickY;
    let clickRotation;
    document.addEventListener('mousedown', event => {
        mouseDown = true;
        clickX = event.clientX;
        clickY = event.clientY;
        clickRotation = camera.rotation.y;
    });
    document.addEventListener('mouseup', () => mouseDown = false);
    document.addEventListener('mousemove', event => {
        if (mouseDown && !renderer.xr.isPresenting) {
            const x = (event.clientX - clickX) / window.innerWidth;
            camera.rotation.y = clickRotation + x * Math.PI;
        }
    });

    window.addEventListener('resize', () => {
        if (!renderer.xr.isPresenting) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    });

    renderer.setAnimationLoop(function () {
        renderer.render(scene, camera);
    });

    function onSelectEnd() {
        photoStartIndex = (photoStartIndex + 4) % stereoPhotos.length;
        loadStereoPhotos(photoFrames, photoStartIndex);
    }

}

async function addRoom(scene, roomSize) {

    const g = createWall(roomSize, roomSize, await loadRepeatingTexture('wall_ground.jpg', 10));
    const c = createWall(roomSize, roomSize, await loadRepeatingTexture('wall_ceiling.png', 8));
    const f = createWall(roomSize, roomSize, await loadRepeatingTexture('wall_front.png', 8));
    const b = createWall(roomSize, roomSize, await loadRepeatingTexture('wall_back.png', 8));
    const l = createWall(roomSize, roomSize, await loadRepeatingTexture('wall_left.png', 8));
    const r = createWall(roomSize, roomSize, await loadRepeatingTexture('wall_right.png', 8));

    g.position.set(0, 0, 0);
    c.position.set(0, roomSize, 0);
    f.position.set(0, roomSize / 2, -roomSize / 2);
    b.position.set(0, roomSize / 2, roomSize / 2);
    l.position.set(-roomSize / 2, roomSize / 2, 0);
    r.position.set(roomSize / 2, roomSize / 2, 0);

    g.rotation.x = -Math.PI / 2;
    c.rotation.x = Math.PI / 2;
    f.rotation.y = 0;
    b.rotation.y = Math.PI;
    l.rotation.y = Math.PI / 2;
    r.rotation.y = -Math.PI / 2;

    g.name = 'ground';
    c.name = 'ceiling';
    f.name = 'wall';
    b.name = 'wall';
    l.name = 'wall';
    r.name = 'wall';

    scene.add(g);
    scene.add(c);
    scene.add(f);
    scene.add(b);
    scene.add(l);
    scene.add(r);

}

function createWall(width, height, texture) {
    const groundGeometry = new THREE.PlaneBufferGeometry(width, height);
    const groundMaterial = new THREE.MeshStandardMaterial({ map: texture });
    return new THREE.Mesh(groundGeometry, groundMaterial);
}

function addPhotoFrames(scene, roomSize) {

    const width = roomSize * 0.50;
    const height = width / 1.333;

    const frame1 = addPhotoFrame(scene, width, height);
    const frame2 = addPhotoFrame(scene, width, height);
    const frame3 = addPhotoFrame(scene, width, height);
    const frame4 = addPhotoFrame(scene, width, height);

    const heightAboveFloor = height / 2;
    const distanceToWall = roomSize * 0.98 / 2;

    frame1.group.position.set(0, heightAboveFloor, -distanceToWall);
    frame2.group.position.set(0, heightAboveFloor, distanceToWall);
    frame3.group.position.set(-distanceToWall, heightAboveFloor, 0);
    frame4.group.position.set(distanceToWall, heightAboveFloor, 0);

    frame1.group.rotation.y = 0;
    frame2.group.rotation.y = Math.PI;
    frame3.group.rotation.y = Math.PI / 2;
    frame4.group.rotation.y = -Math.PI / 2;

    return {
        front: frame1,
        back: frame2,
        left: frame3,
        right: frame4
    };
}

function addPhotoFrame(scene, width, height) {

    const lGeometry = new THREE.PlaneBufferGeometry(1, 1);
    const lMaterial = new THREE.MeshBasicMaterial();
    const lMesh = new THREE.Mesh(lGeometry, lMaterial);
    lMesh.scale.x = width;
    lMesh.scale.y = height;
    lMesh.layers.set(1);

    const rGeometry = new THREE.PlaneBufferGeometry(1, 1);
    const rMaterial = new THREE.MeshBasicMaterial();
    const rMesh = new THREE.Mesh(rGeometry, rMaterial);
    rMesh.scale.x = width;
    rMesh.scale.y = height;
    rMesh.layers.set(2);

    const group = new THREE.Group();
    group.add(lMesh);
    group.add(rMesh);
    scene.add(group);
    return {
        left: lMesh,
        right: rMesh,
        group: group,
        width: width
    };
}

async function loadStereoPhotos(photoFrames, photoStartIndex) {
    loadStereoPhoto(photoFrames.front, stereoPhotos[photoStartIndex]);
    loadStereoPhoto(photoFrames.back, stereoPhotos[photoStartIndex + 1]);
    loadStereoPhoto(photoFrames.left, stereoPhotos[photoStartIndex + 2]);
    loadStereoPhoto(photoFrames.right, stereoPhotos[photoStartIndex + 3]);
}

async function loadStereoPhoto(photoFrame, stereoPhoto) {
    hideImageFromFrame(photoFrame.left);
    hideImageFromFrame(photoFrame.right);
    loadPhotoTextures(stereoPhoto, textures => {
        showImageInFrame(photoFrame, photoFrame.left, textures[0], stereoPhoto.scale);
        showImageInFrame(photoFrame, photoFrame.right, textures[1], stereoPhoto.scale);
    });
}

function hideImageFromFrame(imageFrame) {
    imageFrame.material.color.setHex(0x080808);
    if (imageFrame.material.map) {
        imageFrame.material.map.dispose();
        imageFrame.material.map = null;
    }
    imageFrame.material.needsUpdate = true;
}

function showImageInFrame(photoFrame, imageFrame, texture, scale = 1.0) {

    // Update texture:
    imageFrame.material.map = texture;
    imageFrame.material.color.setHex(0xffffff);
    imageFrame.material.needsUpdate = true;

    // Update frame size according to the aspect ratio of the photo:
    const aspectRatio = texture.image.width / texture.image.height;
    imageFrame.scale.x = photoFrame.width * scale;
    imageFrame.scale.y = imageFrame.scale.x / aspectRatio;

    // Adjust photo frame vertical position:
    const frameHeight = imageFrame.scale.y;
    photoFrame.group.position.y = frameHeight / 2;

}

function addLights(scene, roomSize) {

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
    scene.add(ambientLight);

    const spotHeight = roomSize * 0.5;
    const targetHeight = 0;
    const spotDistance = roomSize / 4;
    const wallDistance = roomSize / 2;

    // Front
    const spot1 = createSpotLight();
    spot1.position.set(0, spotHeight, -spotDistance);
    spot1.target.position.set(0, targetHeight, -wallDistance);
    scene.add(spot1.target);
    scene.add(spot1);

    // Back
    const spot2 = createSpotLight();
    spot2.position.set(0, spotHeight, spotDistance);
    spot2.target.position.set(0, targetHeight, wallDistance);
    scene.add(spot2.target);
    scene.add(spot2);

    // Left
    const spot3 = createSpotLight();
    spot3.position.set(-spotDistance, spotHeight, 0);
    spot3.target.position.set(-wallDistance, targetHeight, 0);
    scene.add(spot3.target);
    scene.add(spot3);

    // Right
    const spot4 = createSpotLight();
    spot4.position.set(spotDistance, spotHeight, 0);
    spot4.target.position.set(wallDistance, targetHeight, 0);
    scene.add(spot4.target);
    scene.add(spot4);

    // Ceiling
    const spot5 = createSpotLight();
    spot5.position.set(0, roomSize * 0.75, 0);
    spot5.target.position.set(0, roomSize, 0);
    scene.add(spot5.target);
    scene.add(spot5);

}

function createSpotLight() {
    return new THREE.SpotLight(0xffffcc, 1.75, 100, Math.PI / 3, 0.75, 2);
}

function loadPhotoTextures(stereoPhoto, onComplete) {
    if (stereoPhoto.imageFile) {
        loadMpoTextures(stereoPhoto.imageFile, onComplete);
    }
    else if (stereoPhoto.leftImageFile) {
        loadTextures([stereoPhoto.leftImageFile, stereoPhoto.rightImageFile], onComplete);
    }
    else {
        console.error('No image path specified: ' + stereoPhoto);
    }
}

async function loadRepeatingTexture(path, numRepeats) {
    const texture = await loadTexture(path);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.repeat.set(numRepeats, numRepeats);
    return texture;
}

function loadMpoTextures(path, onComplete) {
    const textureLoader = new MpoTextureLoader();
    textureLoader.load(texturePath + path, onComplete);
}

function loadTextures(paths, onComplete) {
    const promises = [];
    const textureLoader = new THREE.TextureLoader();
    for (let i = 0; i < paths.length; i++) {
        promises.push(new Promise((resolve) => {
            const texture = textureLoader.load(texturePath + paths[i], (t) => resolve(t));
            texture.encoding = THREE.sRGBEncoding;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearMipMapLinearFilter;
        }));
    }
    Promise.all(promises).then((textures) => onComplete(textures));
}

async function loadTexture(path, onComplete) {
    const textureLoader = new THREE.TextureLoader();
    return await new Promise(resolve => {
        textureLoader.load(texturePath + path, texture => {
            texture.encoding = THREE.sRGBEncoding;
            resolve(texture);
        });
    });
}

function createCamera() {
    let fov = 65;
    let aspect = window.innerWidth / window.innerHeight;
    let near = 0.1;
    let far = 1000;
    return new THREE.PerspectiveCamera(fov, aspect, near, far);
}

function createRenderer() {

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.xr.enabled = true;

    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);

    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));

    return renderer;
}
