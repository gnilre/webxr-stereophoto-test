import { MpoSplitter } from './MpoSplitter.js';

class MpoImageLoader {

    async loadImages(path) {
        const self = this;
        return fetch(path)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => self.extractImages(arrayBuffer))
            .then(imagePromises => Promise.all(imagePromises));
    }

    async extractImages(arrayBuffer) {
        const self = this;
        return new MpoSplitter()
            .split(arrayBuffer)
            .map(image => self.createImage(image));
    }

    async createImage(image) {
        const buffer = image.buffer;
        const offset = image.startPosition;
        const length = image.length;
        const blob = new Blob([new Uint8Array(buffer, offset, length)], { type: "image/jpeg" });
        return createImageBitmap(blob, { imageOrientation: 'flipY' });
    }

}

export { MpoImageLoader };