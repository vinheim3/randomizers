const conv = function(bank, addr) {
    return bank*0x8000+(addr%0x8000);
}

const readWord = function(rom, addr) {
    return (rom[addr+1]<<8)|rom[addr];
}

const writeWord = function(rom, addr, val) {
    rom[addr] = val & 0xff;
    rom[addr+1] = val >> 8;
}

const sum = function(arr) {
    return arr.reduce((sum, entry) => sum + entry, 0);
}

const hexc = function(num) {
    return num.toString(16);
}

// MMX3

const findStageEntityData = function(rom, stageIdx, majorType, type) {
    // +0 main type
    // +1/2 Y coord
    // +3 entity ID
    // +4 sub ID
    // +5/6 X coord
    const table = conv(0x3c, 0xce4b);
    let start = conv(0x3c, readWord(rom, table + stageIdx*2));
    let lastCol = null;
    let maxLoops = 1000;
    while (maxLoops-- !== 0) {
        let col = rom[start++];
        if (col === lastCol) break;
        lastCol = col;

        let maxInnerLoops = 1000;
        while (maxInnerLoops-- !== 0) {
            if ((rom[start] !== majorType) || (rom[start+3] !== type)) {
                start += 7;
            } else {
                return start;
            }
            if ((rom[start-1] & 0x80) !== 0) break;
        }
    }
    throw new Error(`Could not find stage entity data ${stageIdx}, ${majorType}, ${hexc(type)}`);
}

const getDynamicSpriteData = function(rom, stageIdx, dynIdx, entryIdx) {
    // +0 decomp id
    // +1/2 vram dest
    // +3/4 palette id
    // +5 palette slot
    const table = conv(8, 0x8623);
    const stageOffs = readWord(rom, table+stageIdx*2);
    const dynOffs = readWord(rom, table+stageOffs+dynIdx*2);
    return table+dynOffs+entryIdx*6;
}

const getEnemyBaseData = function(enemy_idx) {
    return conv(6, 0xe28e+5*(enemy_idx-1));
}

const getWeaknessTables = function(rom, weaknessIdx, isNormal) {
    let baseTables;
    if (isNormal) {
        baseTables = [conv(6, 0xe4a5)];
    } else {
        baseTables = [conv(0x4b, 0x8000), conv(0x4b, 0x8080), conv(0x4b, 0x8100)];
    }
    let entries = [];
    for (let tableAddr of baseTables) {
        let offsOrAddr = readWord(rom, tableAddr+weaknessIdx*2);
        if (isNormal) {
            entries.push(tableAddr + offsOrAddr);
        } else {
            entries.push(conv(0x4b, offsOrAddr));
        }
    }
    return entries;
}

const getTextAddrs = function(rom, textIdx, isNormal) {
    let addrs = [];
    if (isNormal) {
        let entry = conv(0x39, 0xc1bc + textIdx * 2);
        addrs.push(conv(0x39, readWord(rom, entry)));
    } else {
        for (let bank = 0x40; bank < 0x48; bank += 2) {
            let entry = conv(bank, 0x8000 + textIdx * 2);
            addrs.push(conv(bank, readWord(rom, entry)));
        }
    }
    return addrs;
}

const replaceText = function(rom, textIdx, isNormal, text) {
    // skip 7 bytes
    let addrs = getTextAddrs(rom, textIdx, isNormal);

    for (let _start of addrs) {
        let start = _start+7;
        for (let line of text) {
            for (let ch of line) {
                rom[start++] = ch.charCodeAt(0);
            }
            rom[start++] = 0x80;
            rom[start++] = 0x80;
        }
        for (let b of [0x81, 0x80, 0x86, 0x0b, 0x87, 0x1e, 0x82]) {
            rom[start++] = b;
        }
    }
}

const setPaletteAddr = function(rom, stage, dynIdx, entryIdx, newVal) {
    let start = getDynamicSpriteData(rom, stage, dynIdx, entryIdx);
    writeWord(rom, start+1, newVal);
}

const setPaletteSlot = function(rom, stage, dynIdx, entryIdx, newVal) {
    let start = getDynamicSpriteData(rom, stage, dynIdx, entryIdx);
    rom[start+5] = newVal;
}