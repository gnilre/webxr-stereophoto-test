import * as THREE from './three/three.module.js';
import {VRButton} from './three/examples/jsm/webxr/VRButton.js';

const stereoPhotos = [

    {leftImageFile: 'stereophoto1_l.JPG', rightImageFile: 'stereophoto1_r.JPG'},
    {leftImageFile: 'stereophoto2_l.JPG', rightImageFile: 'stereophoto2_r.JPG'},
    {leftImageFile: 'stereophoto3_l.JPG', rightImageFile: 'stereophoto3_r.JPG'},
    {leftImageFile: 'stereophoto4_l.JPG', rightImageFile: 'stereophoto4_r.JPG'},

    {leftImageFile: 'stereophoto5_l.JPG', rightImageFile: 'stereophoto5_r.JPG'},
    {leftImageFile: 'stereophoto6_l.png', rightImageFile: 'stereophoto6_r.png'},
    {leftImageFile: 'P1030006_l.png', rightImageFile: 'P1030006_r.png'},
    {leftImageFile: 'P1030056_l.PNG', rightImageFile: 'P1030056_r.PNG'},

    {leftImageFile: 'P1030081_l.PNG', rightImageFile: 'P1030081_r.PNG'},
    {leftImageFile: 'P1030083_l.PNG', rightImageFile: 'P1030083_r.PNG'},
    {leftImageFile: 'P1030109_l.PNG', rightImageFile: 'P1030109_r.PNG'},
    {leftImageFile: 'P1030141_l.PNG', rightImageFile: 'P1030141_r.PNG'},

    {leftImageFile: 'P1030145_l.PNG', rightImageFile: 'P1030145_r.PNG'},
    {leftImageFile: 'P1030178_l.PNG', rightImageFile: 'P1030178_r.PNG'},
    {leftImageFile: 'P1030198_l.PNG', rightImageFile: 'P1030198_r.PNG'},
    {leftImageFile: 'P1030211_l.PNG', rightImageFile: 'P1030211_r.PNG'},

    {leftImageFile: 'P1030229_l.PNG', rightImageFile: 'P1030229_r.PNG'},
    {leftImageFile: 'P1030234_l.PNG', rightImageFile: 'P1030234_r.PNG'},
    {leftImageFile: 'P1030252_l.PNG', rightImageFile: 'P1030252_r.PNG'},
    {leftImageFile: 'P1030257_l.PNG', rightImageFile: 'P1030257_r.PNG'},
];

main();

function main() {

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

    const controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectend', onSelectEnd);

    renderer.setAnimationLoop(function () {
        if (!renderer.xr.isPresenting) {
            camera.rotation.y -= 0.001;
        }
        renderer.render(scene, camera);
    });

    function onSelectEnd() {
        photoStartIndex = (photoStartIndex + 4) % stereoPhotos.length;
        loadStereoPhotos(photoFrames, photoStartIndex);
    }

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

    const lGeometry = new THREE.PlaneGeometry(1, 1);
    const lMaterial = new THREE.MeshBasicMaterial();
    const lMesh = new THREE.Mesh(lGeometry, lMaterial);
    lMesh.scale.x = width;
    lMesh.scale.y = height;
    lMesh.layers.set(1);

    const rGeometry = new THREE.PlaneGeometry(1, 1);
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
        group: group
    };
}

function loadStereoPhotos(photoFrames, photoStartIndex) {
    loadStereoPhoto(photoFrames.front, stereoPhotos[photoStartIndex]);
    loadStereoPhoto(photoFrames.back, stereoPhotos[photoStartIndex + 1]);
    loadStereoPhoto(photoFrames.left, stereoPhotos[photoStartIndex + 2]);
    loadStereoPhoto(photoFrames.right, stereoPhotos[photoStartIndex + 3]);
}

function loadStereoPhoto(photoFrame, stereoPhoto) {
    loadStereoPhotoImage(photoFrame.group, photoFrame.left, stereoPhoto.leftImageFile);
    loadStereoPhotoImage(photoFrame.group, photoFrame.right, stereoPhoto.rightImageFile);
}

function loadStereoPhotoImage(group, imageFrame, imageFile) {
    loadPhotoTexture('textures/' + imageFile, texture => {

        // Update texture:
        imageFrame.material.map = texture;
        imageFrame.material.needsUpdate = true;

        // Update frame size according to the aspect ratio of the photo:
        const aspectRatio = texture.image.width / texture.image.height;
        imageFrame.scale.y = imageFrame.scale.x / aspectRatio;

        // Adjust photo frame vertical position:
        const frameHeight = imageFrame.scale.y;
        group.position.y = frameHeight / 2;

    });
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

function loadPhotoTexture(path, onComplete) {
    const texture = loadTexture(path, onComplete);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
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

function loadTexture(path, onComplete) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(path, () => {
        if (onComplete) {
            onComplete(texture);
        }
    });
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
    let fov = 65;
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
