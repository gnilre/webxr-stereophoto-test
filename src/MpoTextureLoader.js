import { MpoImageLoader } from './MpoImageLoader.js';
import { Texture, RGBFormat, sRGBEncoding } from './three/build/three.module.js';

class MpoTextureLoader {

    load(path, onComplete) {
        const leftTexture = this.createTexture();
        const rightTexture = this.createTexture();

        new MpoImageLoader().loadImages(path)
            .then(images => {
                this.updateTexture(leftTexture, images[0]);
                this.updateTexture(rightTexture, images[1]);
                if (onComplete) {
                    onComplete([leftTexture, rightTexture]);
                }
            });

        return [leftTexture, rightTexture];
    }

    createTexture() {
        const texture = new Texture();
        texture.encoding = sRGBEncoding;
        return texture;
    }

    updateTexture(texture, image) {
        texture.image = image;
        texture.format = RGBFormat;
        texture.needsUpdate = true;
    }

}

export { MpoTextureLoader };