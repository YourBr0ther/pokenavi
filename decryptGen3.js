const SIZE_3PARTY = 100;
const SIZE_3STORED = 80;
const SIZE_3HEADER = 32;
const SIZE_3BLOCK = 12;

function readUInt32LittleEndian(buffer) {
    return buffer.readUInt32LE(0);
}

function writeUInt32LittleEndian(buffer, value) {
    buffer.writeUInt32LE(value, 0);
}

const BlockPosition = [
    0, 1, 2, 3,
    0, 1, 3, 2,
    0, 2, 1, 3,
    0, 3, 1, 2,
    0, 2, 3, 1,
    0, 3, 2, 1,
    1, 0, 2, 3,
    1, 0, 3, 2,
    2, 0, 1, 3,
    3, 0, 1, 2,
    2, 0, 3, 1,
    3, 0, 2, 1,
    1, 2, 0, 3,
    1, 3, 0, 2,
    2, 1, 0, 3,
    3, 1, 0, 2,
    2, 3, 0, 1,
    3, 2, 0, 1,
    1, 2, 3, 0,
    1, 3, 2, 0,
    2, 1, 3, 0,
    3, 1, 2, 0,
    2, 3, 1, 0,
    3, 2, 1, 0,

    // duplicates of 0-7 to eliminate modulus
    0, 1, 2, 3,
    0, 1, 3, 2,
    0, 2, 1, 3,
    0, 3, 1, 2,
    0, 2, 3, 1,
    0, 3, 2, 1,
    1, 0, 2, 3,
    1, 0, 3, 2,
];

function shuffleArray3(data, sv) {
    const sdata = Buffer.from(data);
    const index = sv * 4;

    for (let block = 0; block < 4; block++) {
        const ofs = BlockPosition[index + block];
        const src = data.slice(SIZE_3HEADER + SIZE_3BLOCK * ofs, SIZE_3HEADER + SIZE_3BLOCK * (ofs + 1));
        const dest = sdata.slice(SIZE_3HEADER + SIZE_3BLOCK * block, SIZE_3HEADER + SIZE_3BLOCK * (block + 1));
        src.copy(dest);
    }

    return sdata;
}

function decryptArray3(ekm) {
    if (![SIZE_3PARTY, SIZE_3STORED].includes(ekm.length)) {
        throw new Error('Invalid ekm length');
    }

    const PID = readUInt32LittleEndian(ekm.slice(0, 4));
    const OID = readUInt32LittleEndian(ekm.slice(4, 8));
    const seed = PID ^ OID;

    const toEncrypt = ekm.slice(SIZE_3HEADER, SIZE_3STORED);
    for (let i = 0; i < toEncrypt.length; i += 4) {
        const chunk = readUInt32LittleEndian(toEncrypt.slice(i, i + 4));
        const update = chunk ^ seed;
        writeUInt32LittleEndian(toEncrypt.slice(i, i + 4), update);
    }
    return shuffleArray3(ekm, PID % 24);
}

// Usage example
const fs = require('fs');

fs.readFile('C:/Scripts/PokeNavi/Generate Pokemon/Pk3_Testing/CHARMANDER.pk3', (err, data) => {
    if (err) throw err;

    const decryptedData = decryptArray3(data);
    console.log('Decrypted data:', decryptedData);
    const oldData = new Uint8Array(decryptedData);
    const newSize = 100;

    const newData = new Uint8Array(newSize);
    newData.set(oldData);
    console.log(newData)
    const met = getMetLocation(newData)
    console.log(met)
});


function getMetLocation(decryptedData) {
    const metLocationOffset = 45;
    const dataView = new DataView(decryptedData.buffer);
    const metLocation = dataView.getUint16(metLocationOffset, true);
    console.log('Met location:', metLocation);
    return metLocation;
}


