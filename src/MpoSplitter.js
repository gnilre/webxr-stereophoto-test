class MpoSplitter {

    split(arrayBuffer, byteOffset = 0, length = arrayBuffer.length) {

        let image;
        let insideImage = false;
        const images = [];
        const dataView = new DataView(arrayBuffer, byteOffset, length);

        for (let i = 0; i < dataView.byteLength - 1; i++) {
            if (dataView.getUint8(i) == 0xFF) {
                const nextByte = dataView.getUint8(i + 1);
                if (nextByte == 0x00) {

                    // Followed by a fill byte, so not a marker

                } else if (nextByte == 0xD8) {

                    // SOI marker
                    console.debug('--- Start of Image: ' + i);
                    image = { buffer: arrayBuffer, startPosition: i + byteOffset };
                    insideImage = true;

                } else if(insideImage) {

                    if (nextByte == 0xD9) {

                        // EOI marker
                        console.debug('--- End of Image: ' + i);
                        image.length = i + 2 - image.startPosition + byteOffset;
                        images.push(image);
                        insideImage = false;

                    } else if (nextByte == 0xC0) {

                        // SOF marker
                        console.debug('Start of Frame (baseline): ' + i);
                        image.height = dataView.getUint16(i + 5);
                        image.width = dataView.getUint16(i + 7);
                        console.debug('--- Width: ' + image.width + ', Height: ' + image.height);
                        const length = dataView.getUint16(i + 2);
                        i += length;

                    } else if (nextByte == 0xC2) {

                        // SOF marker
                        console.debug('Start of Frame (progressive): ' + i);
                        image.height = dataView.getUint16(i + 5);
                        image.width = dataView.getUint16(i + 7);
                        console.debug('--- Width: ' + image.width + ', Height: ' + image.height);
                        const length = dataView.getUint16(i + 2);
                        i += length;

                    } else if (nextByte == 0xC4) {

                        // Huffman Table marker
                        console.debug('Huffman Tables: ' + i);
                        const length = dataView.getUint16(i + 2);
                        i += length;

                    } else if (nextByte == 0xDB) {

                        // Quantization Table marker
                        console.debug('Quantization Tables: ' + i);
                        const length = dataView.getUint16(i + 2);
                        i += length;

                    } else if (nextByte == 0xDD) {

                        // Restart Interval marker:
                        console.debug('Restart Interval: ' + i);
                        i += 4;

                    } else if (nextByte >= 0xD0 && nextByte <= 0xD7) {

                        // Restart marker:
                        console.debug('Restart (' + (nextByte - 0xD0) + '): ' + i);

                    } else if (nextByte == 0xDA) {

                        // SOS marker:
                        console.debug('Start of Scan: ' + i);
                        const length = dataView.getUint16(i + 2);
                        i += length;

                    } else if (nextByte >= 0xE0 && nextByte <= 0xE9) {

                        // APP# marker:
                        console.debug('APP' + (nextByte - 0xE0) + ': ' + i);
                        const length = dataView.getUint16(i + 2);
                        if (nextByte == 0xE1) {
                            // Parse thumbnail:
                            const thumbnails = this.split(arrayBuffer, byteOffset + i + 2, length);
                            if (thumbnails.length > 0) {
                                image.thumbnail = thumbnails[0];
                            }
                        }
                        i += length;

                    } else if (nextByte == 0xFE) {

                        // Comment marker:
                        console.debug('Comment: ' + i);
                        const length = dataView.getUint16(i + 2);
                        i += length;

                    }
                }
            }
        }

        return images;
    }

}

export { MpoSplitter };