class MpoSplitter {

    split(arrayBuffer, byteOffset = 0, length = arrayBuffer.length) {

        let image;
        const images = [];
        const dataView = new DataView(arrayBuffer, byteOffset, length);

        for (let i = 0; i < dataView.byteLength - 1; i++) {
            if (dataView.getUint8(i) == 0xFF) {
                const nextByte = dataView.getUint8(i + 1);
                if (nextByte == 0x00) {

                    // Followed by a fill byte, so not a marker

                } else if (nextByte == 0xD8) {

                    // SOI marker
                    console.log('--- Start of Image: ' + i);
                    image = { buffer: arrayBuffer, startPosition: i + byteOffset };

                } else if (nextByte == 0xD9) {

                    // EOI marker
                    console.log('--- End of Image: ' + i);
                    image.length = i + 2 - image.startPosition + byteOffset;
                    images.push(image);

                } else if (nextByte == 0xC0) {

                    // SOF marker
                    console.log('Start of Frame (baseline): ' + i);
                    image.height = dataView.getUint16(i + 5);
                    image.width = dataView.getUint16(i + 7);
                    console.log('--- Width: ' + image.width + ', Height: ' + image.height);
                    const length = dataView.getUint16(i + 2);
                    i += length;

                } else if (nextByte == 0xC2) {

                    // SOF marker
                    console.log('Start of Frame (progressive): ' + i);
                    const length = dataView.getUint16(i + 2);
                    i += length;

                } else if (nextByte == 0xC4) {

                    // Huffman Table marker
                    console.log('Huffman Tables: ' + i);
                    const length = dataView.getUint16(i + 2);
                    i += length;

                } else if (nextByte == 0xDB) {

                    // Quantization Table marker
                    console.log('Quantization Tables: ' + i);
                    const length = dataView.getUint16(i + 2);
                    i += length;

                } else if (nextByte == 0xDD) {

                    // Restart Interval marker:
                    console.log('Restart Interval: ' + i);
                    i += 4;

                } else if (nextByte >= 0xD0 && nextByte <= 0xD7) {

                    // Restart marker:
                    console.log('Restart (' + (nextByte - 0xD0) + '): ' + i);

                } else if (nextByte == 0xDA) {

                    // SOS marker:
                    console.log('Start of Scan: ' + i);
                    const length = dataView.getUint16(i + 2);
                    i += length;

                } else if (nextByte >= 0xE0 && nextByte <= 0xE9) {

                    // APP# marker:
                    console.log('APP' + (nextByte - 0xE0) + ': ' + i);
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
                    console.log('Comment: ' + i);
                    const length = dataView.getUint16(i + 2);
                    i += length;

                }
            }
        }

        return images;
    }

}

export { MpoSplitter };