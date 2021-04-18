import { MpoSplitter } from './MpoSplitter.js';

class MpoImageLoader {

    async loadImages(path, xOffset, yOffset) {
        const self = this;
        return fetch(path)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => self.extractImages(arrayBuffer, xOffset, yOffset))
            .then(imagePromises => Promise.all(imagePromises));
    }

    async extractImages(arrayBuffer, xOffset, yOffset) {
        const images = new MpoSplitter().split(arrayBuffer);
        const imageBitmaps = [];

        imageBitmaps[0] = this.createImage(
            images[0],
            xOffset >= 0 ? xOffset : 0,
            yOffset >= 0 ? yOffset : 0,
            images[0].width - Math.abs(xOffset),
            images[0].height - Math.abs(yOffset)
        );

        imageBitmaps[1] = this.createImage(
            images[1],
            xOffset < 0 ? -xOffset : 0,
            yOffset < 0 ? -yOffset : 0,
            images[0].width - Math.abs(xOffset),
            images[0].height - Math.abs(yOffset)
        );

        return imageBitmaps;
    }

    async createImage(image, sx, sy, sw, sh) {
        const buffer = image.buffer;
        const offset = image.startPosition;
        const length = image.length;
        const blob = new Blob([new Uint8Array(buffer, offset, length)], { type: "image/jpeg" });
        return createImageBitmap(blob, sx, sy, sw, sh, { imageOrientation: 'flipY' });
    }

}

export { MpoImageLoader };