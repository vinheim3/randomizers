const getDynDecompIdxAddrs = function(rom, decomp_idx) {
    let table = conv(8, 0x8623);
    let start = conv(8, 0x8647);
    let end = conv(8, 0x8865);
    
    let dataPtrs = [];
    while (start < end) {
        dataPtrs.push(readWord(rom, start)+table);
        start += 2;
    }

    let retAddrs = [];
    for (let dataPtr of dataPtrs) {
        while (1) {
            let readDecompIdx = rom[dataPtr];
            if (readDecompIdx === 0xff) break;
            if (readDecompIdx === decomp_idx) retAddrs.push(dataPtr);
            dataPtr += 6;
        }
    }
    return retAddrs;
}

const getStageEntityDecompIdxAddrs = function(rom, entity_id) {
    let table = conv(0x3c, 0xce4b);
    let retAddrs = [];
    for (let stage = 0; stage < 0xf; stage++) {
        let start = conv(0x3c, readWord(rom, table+stage*2));

        let lastCol = null;
        let column = rom[start++];
        while (column !== lastCol) {
            lastCol = column;
            while (1) {
                if (rom[start+3]===entity_id && rom[start]==3) retAddrs.push(start);
                if (rom[start+6]&0x80) break;
                start += 7;
            }
            start += 7;
            column = rom[start++];
        }
    }
    return retAddrs;
}

function enemyRandomize(rom, rng, opts, m) {
    if (!opts.random_enemies) return;

    // Get missing details
    let fullEnemyDeets = {};
    let enemyNames = [];
    for (let [name, deets] of Object.entries(ENEMIES)) {
        enemyNames.push(name);

        let decomp_idx = deets.decomp_idx;
        let entity_id = deets.id;
        let dynAddrs = getDynDecompIdxAddrs(rom, decomp_idx);
        let entAddrs = getStageEntityDecompIdxAddrs(rom, entity_id);

        let pal_idx = deets.pal_idx;
        if (pal_idx===undefined) {
            
            let pal_idxes = new Set();
            for (let addr of dynAddrs) {
                pal_idxes.add(readWord(rom, addr+3));
            }
            if (pal_idxes.size > 1) {
                console.log('Name:', name);
                console.log('pal_idxes', [...pal_idxes].map(hexc));
                for (let addr of dynAddrs) {
                    console.log(hexc(addr), rom[addr+4]);
                }
            } else {
                pal_idx = [...pal_idxes][0];
            }
        }

        let sub_idx = deets.sub_idx;
        if (sub_idx===undefined) {
            
            let sub_idxes = new Set();
            for (let addr of entAddrs) {
                sub_idxes.add(rom[addr+4]);
            }
            if (sub_idxes.size > 1) {
                console.log('Name:', name);
                console.log('sub_idxes', [...sub_idxes].map(hexc));
                for (let addr of entAddrs) {
                    console.log(hexc(addr), rom[addr+4]);
                }
            } else {
                sub_idx = [...sub_idxes][0];
            }
        }
        if (name === 'Hamma Hamma') {
            // 2 story-related hammas + 1 that shares the same dynamic spec
            dynAddrs.splice(dynAddrs.indexOf(conv(8, 0x8c8f)), 1);
            dynAddrs.splice(dynAddrs.indexOf(conv(8, 0x8cca)), 1);
            entAddrs.splice(entAddrs.indexOf(conv(0x3c, 0xe594)), 1);
            entAddrs.splice(entAddrs.indexOf(conv(0x3c, 0xe6e6)), 1);
            entAddrs.splice(entAddrs.indexOf(conv(0x3c, 0xe71a)), 1);
        }
        fullEnemyDeets[name] = {
            ...deets, 
            pal_idx: pal_idx, 
            sub_idx: sub_idx,
            dynAddrs: dynAddrs,
            entAddrs: entAddrs,
        };
    }
    
    // Randomly associate
    for (let [name, deets] of Object.entries(fullEnemyDeets)) {
        while(1) {
            let newEnemyIdx = Math.floor(rng() * enemyNames.length);
            let newEnemyName = enemyNames[newEnemyIdx];
            if (fullEnemyDeets[newEnemyName].decomp_size <= deets.decomp_size) {
                fullEnemyDeets[name]['newEnemyName'] = newEnemyName;
                break;
            }
        }
    }

    // Mutate
    for (let [name, deets] of Object.entries(fullEnemyDeets)) {
        let newEnemy = fullEnemyDeets[deets.newEnemyName];
        for (let addr of deets.dynAddrs) {
            rom[addr] = newEnemy.decomp_idx;
            writeWord(rom, addr+3, newEnemy.pal_idx);
        }
        for (let addr of deets.entAddrs) {
            rom[addr+3] = newEnemy.id;
            rom[addr+4] = newEnemy.sub_idx;
        }
    }
}