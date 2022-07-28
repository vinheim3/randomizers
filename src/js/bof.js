function randomize(_rom, rng, opts) {
    let rom = Uint8Array.from(_rom);

    let m = new M65816({}, {});

    // collate
    let start = conv(0xa, 0xa000)
    let end = conv(0xa, 0xa3e0);
    let addrPool = [];
    let itemPool = [];
    let roomOffs = new Set();
    for (let room = 0; start+room*2 < end; room++) {
        let offs = readWord(rom, start+room*2);
        if (offs===0) continue;
        if (roomOffs.has(offs)) continue;
        roomOffs.add(offs);
        let addr = conv(0xa, 0xa000+offs+1);
        let maxLoops = 1000;
        let entry = 0;
        while (maxLoops-- !== 0) {
            let itemVal = readWord(rom, addr+4);
            let itemType = itemVal>>12;
            if (itemType!==3) {
                addrPool.push({
                    room: room,
                    entry: entry,
                    src: addr+4,
                });
                itemPool.push(itemVal);
            }
            if (rom[addr]&1) break;
            entry++;
            addr += 6;
        }
        if (maxLoops === 0) throw new Error(`Error parsing table for ${hexc(room)}`);
    }

    // assign + mutate
    for (let i = 0; i < addrPool.length; i++) {
        let itemIdx = Math.floor(rng() * itemPool.length);
        let addrEntry = addrPool[i];
        let itemVal = itemPool[itemIdx];
        addrEntry.item = itemVal;
        itemPool.splice(itemIdx, 1);
        writeWord(rom, addrEntry.src, itemVal);
    }

    return {
        newSlots: addrPool,
        randomized_rom: rom,
    }
}