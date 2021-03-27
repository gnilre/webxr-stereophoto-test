import * as THREE from './three/three.module.js';
import {VRButton} from './three/examples/jsm/webxr/VRButton.js';

main();

function main() {

    const scene = new THREE.Scene();
    const camera = createCamera();
    const renderer = createRenderer();

    camera.position.x = 0;
    camera.position.y = 1.5;
    camera.position.z = 0;
    camera.layers.enable(1);
    camera.layers.enable(2);

    const roomSize = 10;
    addRoom(scene, roomSize);
    addStereoPhotos(scene, roomSize);
    addLights(scene, roomSize);

    renderer.setAnimationLoop(function () {
        renderer.render(scene, camera);
    });

}

function addRoom(scene, roomSize) {

    const textures = loadWallTextures();
    const materials = createWallMaterials(textures);
    const geometry = new THREE.BoxGeometry(roomSize, roomSize, roomSize);
    const mesh = new THREE.Mesh(geometry, materials);

    mesh.position.set(0, roomSize / 2, 0);
    scene.add(mesh);
    return mesh;
}

function addStereoPhotos(scene, roomSize) {

    const width = roomSize * 0.50;
    const height = width / 1.333;

    const photo1 = addStereoPhoto(scene, width, height,
        'textures/stereophoto1_l.JPG', 'textures/stereophoto1_r.JPG');

    const photo2 = addStereoPhoto(scene, width, height,
        'textures/stereophoto2_l.JPG', 'textures/stereophoto2_r.JPG');

    const photo3 = addStereoPhoto(scene, width, height,
        'textures/stereophoto3_l.JPG', 'textures/stereophoto3_r.JPG');

    const photo4 = addStereoPhoto(scene, width, height,
        'textures/stereophoto4_l.JPG', 'textures/stereophoto4_r.JPG');

    const photo5 = addStereoPhoto(scene, width, height,
        'textures/stereophoto5_l.JPG', 'textures/stereophoto5_r.JPG');

    const heightAboveFloor = height / 2;
    const distanceToWall = roomSize * 0.99 / 2;
    const distanceToCeiling = roomSize * 0.99;

    photo1.position.set(0, heightAboveFloor, -distanceToWall);
    photo2.position.set(0, heightAboveFloor, distanceToWall);
    photo3.position.set(-distanceToWall, heightAboveFloor, 0);
    photo4.position.set(distanceToWall, heightAboveFloor, 0);
    photo5.position.set(0, distanceToCeiling, 0);

    photo1.rotation.y = 0;
    photo2.rotation.y = Math.PI;
    photo3.rotation.y = Math.PI / 2;
    photo4.rotation.y = -Math.PI / 2;
    photo5.rotation.x = Math.PI / 2;

}

function addStereoPhoto(scene, width, height, leftImage, rightImage) {

    const lGeometry = new THREE.PlaneGeometry(width, height);
    const lTexture = loadPhotoTexture(leftImage);
    const lMaterial = new THREE.MeshStandardMaterial({map: lTexture});
    const lMesh = new THREE.Mesh(lGeometry, lMaterial);
    lMesh.layers.set(1);

    const rGeometry = new THREE.PlaneGeometry(width, height);
    const rTexture = loadPhotoTexture(rightImage);
    const rMaterial = new THREE.MeshStandardMaterial({map: rTexture});
    const rMesh = new THREE.Mesh(rGeometry, rMaterial);
    rMesh.layers.set(2);

    const group = new THREE.Group();
    group.add(lMesh);
    group.add(rMesh);
    scene.add(group);
    return group;
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

function loadWallTextures() {
    const textures = [];

    textures[0] = loadRepeatingTexture('textures/wall1.png')
    textures[1] = loadRepeatingTexture('textures/wall2.png')
    textures[2] = loadRepeatingTexture('textures/wall3.png')
    textures[3] = loadRepeatingTexture('textures/floor.jpg')
    textures[4] = loadRepeatingTexture('textures/wall4.png')
    textures[5] = loadRepeatingTexture('textures/wall5.png')

    for (let i = 0; i < textures.length; i++) {
        textures[i].repeat.set(8, 8);
    }

    textures[3].repeat.set(10, 10);
    return textures;
}

function loadPhotoTexture(path) {
    const texture = loadTexture(path);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    return texture;
}

function loadRepeatingTexture(path) {
    const texture = loadTexture(path);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    return texture;
}

function loadTexture(path) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(path);
    texture.encoding = THREE.sRGBEncoding;
    return texture;
}

function createWallMaterials(textures) {
    const materials = [];
    for (let i = 0; i < textures.length; i++) {
        materials[i] = new THREE.MeshStandardMaterial({map: textures[i], side: THREE.BackSide});
    }
    return materials;
}

function createCamera() {
    let fov = 75;
    let aspect = window.innerWidth / window.innerHeight;
    let near = 0.1;
    let far = 1000;
    return new THREE.PerspectiveCamera(fov, aspect, near, far);
}

function createRenderer() {

    const renderer = new THREE.WebGLRenderer({antialias: true});
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