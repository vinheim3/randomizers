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

const STAGE_BLAST_HORNET = 1;
const STAGE_BLIZZARD_BUFFALO = 2;
const STAGE_GRAVITY_BEETLE = 3;
const STAGE_TOXIC_SEAHORSE = 4;
const STAGE_VOLT_CATFISH = 5;
const STAGE_CRUSH_CRAWFISH = 6;
const STAGE_TUNNEL_RHINO = 7;
const STAGE_NEON_TIGER = 8;
const STAGE_DOPPLER_1 = 10;

const MT_ITEM = 0;
const MT_ENEMY = 3;

const ITEMID_SUBTANK = 0x05;
const ITEMID_HEART_TANK = 0x0b;
const ITEMID_RIDE_ARMOUR_ITEM = 0x17;

const ENEMYID_HANGERTER = 0x4c;
const ENEMYID_CAPSULE = 0x4d;
const ENEMYID_BLIZZARD_BUFFALO = 0x52;
const ENEMYID_BLAST_HORNET = 0x53;
const ENEMYID_CRUSH_CRAWFISH = 0x54;
const ENEMYID_TUNNEL_RHINO = 0x55;
const ENEMYID_NEON_TIGER = 0x56;
const ENEMYID_TOXIC_SEAHORSE = 0x57;
const ENEMYID_VOLT_CATFISH = 0x58;
const ENEMYID_GRAVITY_BEETLE = 0x59;

const DECOMP_DATA_IDX_RIDE_ARMOUR_ITEM = 0x3b;

// idxes into a table of $26 weakness vars
const enemyWeaknesses = {
    0x12: "Gravity Well / Spinning Blade",
    0x13: "Parasitic Bomb",
    0x14: "Ray Splasher / Parasitic Bomb",
    0x15: "Frost Shield",
    0x16: "Tornado Fang",
    0x17: "Triad Thunder",
    0x18: "Acid Burst",
    0x19: "Spinning Blade",
}

const subweapons = [
    "Acid Burst",
    "Parasitic Bomb",
    "Triad Thunder",
    "Spinning Blade",
    "Ray Splasher",
    "Gravity Well",
    "Frost Shield",
    "Tornado Fang",
];

const bossData = {
    'Blast Hornet': {
        maxHealth: conv(0x39, 0x9dc2),
        id: ENEMYID_BLAST_HORNET,
        idx: 0,
        subwepReward: conv(0x39, 0xa14c), // +1 from `sta` to point to `abs` param
        subwepCheck: conv(0x39, 0x9c86), // +1 from `bit` to point to `abs` param
        extraWeakness: [],
    },
    'Blizzard Buffalo': {
        maxHealth: conv(0x03, 0xc9cb),
        id: ENEMYID_BLIZZARD_BUFFALO,
        idx: 1,
        subwepReward: conv(0x03, 0xcd9d),
        subwepCheck: conv(0x03, 0xc8a8),
        extraWeakness: [conv(0x03, 0xcd30)], // +1 from `lda` to point to `imm` param
    },
    'Gravity Beetle': {
        maxHealth: conv(0x13, 0xf3c3),
        id: ENEMYID_GRAVITY_BEETLE,
        idx: 2,
        subwepReward: conv(0x13, 0xf7c2),
        subwepCheck: conv(0x13, 0xf280),
        extraWeakness: [conv(0x13, 0xf683), conv(0x13, 0xf778)],
    },
    'Toxic Seahorse': {
        maxHealth: conv(0x13, 0xe612),
        id: ENEMYID_TOXIC_SEAHORSE,
        idx: 3,
        subwepReward: conv(0x13, 0xe9c8),
        subwepCheck: conv(0x13, 0xe4d8),
        extraWeakness: [conv(0x13, 0xe892)],
    },
    'Volt Catfish': {
        maxHealth: conv(0x13, 0xebc0),
        id: ENEMYID_VOLT_CATFISH,
        idx: 4,
        subwepReward: conv(0x13, 0xf0bf),
        subwepCheck: conv(0x13, 0xeaac),
        extraWeakness: [conv(0x13, 0xf045)],
    },
    'Crush Crawfish': {
        maxHealth: conv(0x03, 0xd1b2),
        id: ENEMYID_CRUSH_CRAWFISH,
        idx: 5,
        subwepReward: conv(0x03, 0xd5b4),
        subwepCheck: conv(0x03, 0xd089),
        extraWeakness: [],
    },
    'Tunnel Rhino': {
        maxHealth: conv(0x3f, 0xe765),
        id: ENEMYID_TUNNEL_RHINO,
        idx: 6,
        subwepReward: conv(0x3f, 0xeb13),
        subwepCheck: conv(0x3f, 0xe62a),
        extraWeakness: [conv(0x3f, 0xe9eb), conv(0x3f, 0xeab5)],
    },
    'Neon Tiger': {
        maxHealth: conv(0x13, 0xde11),
        id: ENEMYID_NEON_TIGER,
        idx: 7,
        subwepReward: conv(0x13, 0xe3ab),
        subwepCheck: conv(0x13, 0xdce7),
        extraWeakness: [conv(0x13, 0xdf3e), conv(0x13, 0xe27d)],
    },
}

const findStageEntityData = function(rom, stageIdx, majorType, type) {
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
    const table = conv(8, 0x8623);
    const stageOffs = readWord(rom, table+stageIdx*2);
    const dynOffs = readWord(rom, table+stageOffs+dynIdx*2);
    return table+dynOffs+entryIdx*6;
}

const getEnemyBaseData = function(enemy_idx) {
    return conv(6, 0xe28e+5*(enemy_idx-1));
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

const setPaletteSlot = function(rom, stage, dynIdx, entryIdx, newVal) {
    let start = getDynamicSpriteData(rom, stage, dynIdx, entryIdx);
    rom[start+5] = newVal;
}

function randomize(_rom, rng, opts) {
    /*
    Initial rom changes
    */

    let rom = Uint8Array.from(_rom);

    let start;
    let isNormal = opts.romType === 'normal';

    let m = new M65816({
        wStageIdx: 0x1fae,
        wChipsAndRideArmoursGottenBitfield: 0x1fd7,
        Enemy_y: 0x08,
        Enemy_type: 0x0a,
        Enemy_subType: 0x0b,
        Enemy_sizeof: 0x40,
        wEnemyEntities: 0xd18,
        wBeatenStageIdx: 0xd4f,
        wTextRowVramAddr: 0x6a,
    }, {
        0x03: isNormal ? 0xfa74 : 0xfa79,
        0x05: 0xfbee,
        0x06: isNormal ? 0xfb83 : 0xff78,
        0x13: 0xfa6e,
        0x4a: 0xc0a6,
    });

    const ENT_RIDE_ARMOUR_HOLDER = [MT_ENEMY, ENEMYID_HANGERTER];
    const ENT_CAPSULE = [MT_ENEMY, ENEMYID_CAPSULE];
    const ENT_RIDE_ARMOUR_ITEM = [MT_ITEM, ITEMID_RIDE_ARMOUR_ITEM];
    const ENT_HEART_TANK = [MT_ITEM, ITEMID_HEART_TANK];
    const ENT_SUBTANK = [MT_ITEM, ITEMID_SUBTANK];

    // Make the entry for Crush Crawfish take on its own palette slot, and tile data slot
    start = getDynamicSpriteData(rom, STAGE_CRUSH_CRAWFISH, 0, 3);
    writeWord(rom, start+1, 0x1400); // separate tile data dest
    rom[start+5] = 0x40;

    // Replace the rider armour holder enemy dynamic sprites with the chimera rider armour item
    start = findStageEntityData(rom, STAGE_BLAST_HORNET, ...ENT_RIDE_ARMOUR_HOLDER);
    rom[start+0] = MT_ITEM;
    writeWord(rom, start+1, 0x790);
    rom[start+3] = ITEMID_RIDE_ARMOUR_ITEM;
    rom[start+4] = 0x01;
    start = getDynamicSpriteData(rom, STAGE_BLAST_HORNET, 6, 3);
    rom[start] = DECOMP_DATA_IDX_RIDE_ARMOUR_ITEM;
    writeWord(rom, start+3, 0x1c);

    // Give swappable rider armour items a slot that doesn't conflict with eg health bar
    setPaletteSlot(rom, STAGE_GRAVITY_BEETLE, 5, 3, 0x30);
    setPaletteSlot(rom, STAGE_TOXIC_SEAHORSE, 4, 2, 0x30);
    setPaletteSlot(rom, STAGE_CRUSH_CRAWFISH, 0, 3, 0x30);

    // Move capsule locations down to the ground
    // (6:ccbe - 3c:xxxx data)
    for (let [stage, offset] of [
        [STAGE_BLAST_HORNET, 0x272-0x260],
        [STAGE_BLIZZARD_BUFFALO, 0x282-0x280],
        [STAGE_GRAVITY_BEETLE, 0x482-0x490],
        [STAGE_TOXIC_SEAHORSE, 0x262-0x262],
        [STAGE_VOLT_CATFISH, 0x282-0x290],
        [STAGE_CRUSH_CRAWFISH, 0x782-0x790],
        [STAGE_TUNNEL_RHINO, 0x282-0x2a0],
        [STAGE_NEON_TIGER, 0x182-0x1c0],
        [STAGE_DOPPLER_1, 0x692-0x680],
    ]) {
        start = findStageEntityData(rom, stage, ...ENT_CAPSULE);
        let y = readWord(rom, start+1);
        writeWord(rom, start+1, y+offset+0x20);
    }
    
    // Give the capsules their new subtypes
    for (let [stage, newSubType] of [
        [STAGE_TUNNEL_RHINO, 0x01],
        [STAGE_NEON_TIGER, 0x02],
        [STAGE_VOLT_CATFISH, 0x04],
        [STAGE_BLIZZARD_BUFFALO, 0x08],
        [STAGE_DOPPLER_1, 0xff],
    ]) {
        start = findStageEntityData(rom, stage, ...ENT_CAPSULE);
        rom[start+4] = newSubType;
    }

    // Separate capsules palette slots from Dr. Light
    for (let [stage, regionIdx, capsuleSpecOffs] of [
        [STAGE_BLAST_HORNET, 3, 0],
        [STAGE_BLIZZARD_BUFFALO, 6, 0],
        [STAGE_CRUSH_CRAWFISH, 3, 0],
        [STAGE_DOPPLER_1, 8, 0],
        [STAGE_GRAVITY_BEETLE, 10, 0],
        [STAGE_NEON_TIGER, 2, 0],
        [STAGE_TOXIC_SEAHORSE, 7, 0],
        [STAGE_TUNNEL_RHINO, 7, 1],
        [STAGE_VOLT_CATFISH, 4, 1],
    ]) {
        setPaletteSlot(rom, stage, regionIdx, capsuleSpecOffs, 0x60);
    }

    // Make capsule text shorter
    for (let [textIdx, text] of [
        [0x40, "Head chip"],
        [0x0b, "Leg upgrade"],
        [0x42, "Arm chip"],
        [0x43, "Leg chip"],
        [0x0d, "Body upgrade"],
        [0x41, "Body chip"],
        [0x0c, "Helmet upgrade"],
        [0x0e, "Arm upgrade"],
        [0x46, "Hyper chip"],
    ]) {
        replaceText(rom, textIdx, isNormal, ["You got the", text]);
    }

    // Randomize boss health
    if (opts.random_boss_hp) {
        for (let [bossName, deets] of Object.entries(bossData)) {
            let healthAddr = deets.maxHealth;
            if (rom[healthAddr-1] !== 0xc9 || rom[healthAddr] !== 0x20)
                throw new Error(`Boss ${bossName} health address is wrong`);
            let health = Math.floor(rng() * 20) + 0x10;
            rom[healthAddr] = health;
            bossData[bossName].newHealth = health;
        }
    }

    // Randomize boss weakness
    if (opts.random_boss_weakness) {
        for (let [bossName, deets] of Object.entries(bossData)) {
            let tableEntry = getEnemyBaseData(deets.id);
            let weakness = Math.floor(rng() * 8) + 0x12;
            rom[tableEntry+4] = weakness;
            for (let addr of deets.extraWeakness) {
                if (rom[addr-1] !== 0xa9)
                    throw new Error(`Boss weakness is wrong ${hexc(addr)}`);
                rom[addr] = weakness;
            }
            bossData[bossName].newWeakness = enemyWeaknesses[weakness];
        }
    }

    // Randomize boss drops
    if (opts.random_boss_drop) {
        let subweaponPool = [0,1,2,3,4,5,6,7];
        let subwepToStage = {
            0: 3,
            1: 0,
            2: 4,
            3: 5,
            4: 7,
            5: 2,
            6: 1,
            7: 6,
        };
        for (let [bossName, deets] of Object.entries(bossData)) {
            if (isNormal) {
                // Sanity check
                if (rom[deets.subwepCheck-1] !== 0x2c) // bit abs.w
                    throw new Error(`Subweapon check failed for ${bossName}`);
                if (rom[deets.subwepReward-1] !== 0x8d) // sta abs.w
                    throw new Error(`Subweapon reward failed for ${bossName}`);
            }
        }

        // This and the called routine, make sure to properly display the
        // weapon-giving screen, animations, and actual given weapon
        if (isNormal) {
            m.addAsm(0, 0xa67e, `
                jsr StageRemappedForSubWepRewardAccu16.l
            `);

            m.addAsm(0, 0xa6a2, `
                nop
                nop
                nop
            `);

            m.addAsm(0x13, null, `
            ; A - stage idx in lower byte
            ; Return new stage idx in X
            StageRemappedForSubWepRewardAccu16:
                and #$00ff.w
                sep #$30.b
                tax
                lda StageForSubwepRemapping.w, X
                sta wBeatenStageIdx.w
                rep #$30.b
                tax
                rtl
            `);

            m.addAsm(0x06, null, `
            StageForSubwepRemapping:
                nop ; stages are idxed from 1
            `);
        } else {
            m.addAsm(0, 0xa69f, `
                jsr StageRemappedForSubWepRewardAccu16.l
                nop
                nop
            `);

            m.addAsm(0x13, null, `
            StageRemappedForSubWepRewardAccu16:
                lda wStageIdx.w
                tax
                lda StageForSubwepRemapping.l, X
                sta wBeatenStageIdx.w
                rtl
            `);

            m.addAsm(0x48, 0x975b, `
            StageForSubwepRemapping:
            `);
        }        

        for (let [bossName, deets] of Object.entries(bossData)) {
            let subwepIdx = Math.floor(rng() * subweaponPool.length);
            let subwepId = subweaponPool[subwepIdx];
            subweaponPool.splice(subwepIdx, 1);
            bossData[bossName].newDrop = subweapons[subwepId];

            if (isNormal) {
                // Stage->subweapon given
                rom[conv(0x06, m.bankEnds[0x06]+deets.idx)] = subwepToStage[subwepId];
                // SubweaponsStatusToAssociatedStage
                rom[conv(0x06, 0x9c5e+subwepId)] = deets.idx+1;
                writeWord(rom, deets.subwepReward, 0x1fbc+subwepId*2);
                writeWord(rom, deets.subwepCheck, 0x1fbc+subwepId*2);
            } else {
                // Stage->subweapon given
                rom[conv(0x48, 0x975c+deets.idx)] = subwepToStage[subwepId]+1;
            }
        }
        m.bankEnds[0x06] += 8;
    }

    /*
    Build slots and randomize
    */

    let slots = [
        {
            name: "Blast Hornet Capsule",
            stageIdx: STAGE_BLAST_HORNET,
            itemName: "Head Chip",
            entityEntry: findStageEntityData(rom, STAGE_BLAST_HORNET, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLAST_HORNET, 3, 0),
            minimapMarkerEntry: 0,
            textIdx: 0x5d,
        },
        {
            name: "Blast Hornet Chimera Ride Armour",
            stageIdx: STAGE_BLAST_HORNET,
            entityEntry: findStageEntityData(rom, STAGE_BLAST_HORNET, ...ENT_RIDE_ARMOUR_ITEM),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLAST_HORNET, 6, 3),
            minimapMarkerEntry: 2,
            textIdx: 0x28,
        },
        {
            name: "Blast Hornet Heart Tank",
            stageIdx: STAGE_BLAST_HORNET,
            entityEntry: findStageEntityData(rom, STAGE_BLAST_HORNET, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLAST_HORNET, 9, 0),
            minimapMarkerEntry: 1,
            textIdx: 0x24,
        },
        {
            name: "Blizzard Buffalo Capsule",
            stageIdx: STAGE_BLIZZARD_BUFFALO,
            itemName: "Leg Upgrade",
            entityEntry: findStageEntityData(rom, STAGE_BLIZZARD_BUFFALO, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLIZZARD_BUFFALO, 6, 0),
            minimapMarkerEntry: 2,
            textIdx: 0x61,
        },
        {
            name: "Blizzard Buffalo Heart Tank",
            stageIdx: STAGE_BLIZZARD_BUFFALO,
            entityEntry: findStageEntityData(rom, STAGE_BLIZZARD_BUFFALO, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLIZZARD_BUFFALO, 1, 0),
            tileDataOffset: 0x1e00,
            minimapMarkerEntry: 0,
            textIdx: 0x24,
        },
        {
            name: "Blizzard Buffalo Subtank",
            stageIdx: STAGE_BLIZZARD_BUFFALO,
            entityEntry: findStageEntityData(rom, STAGE_BLIZZARD_BUFFALO, ...ENT_SUBTANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLIZZARD_BUFFALO, 5, 3),
            minimapMarkerEntry: 1,
            textIdx: 0x55,
        },
        {
            name: "Crush Crawfish Capsule",
            stageIdx: STAGE_CRUSH_CRAWFISH,
            itemName: "Body Chip",
            entityEntry: findStageEntityData(rom, STAGE_CRUSH_CRAWFISH, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_CRUSH_CRAWFISH, 3, 0),
            minimapMarkerEntry: 1,
            textIdx: 0x5d,
        },
        {
            name: "Crush Crawfish Hawk Ride Armour",
            stageIdx: STAGE_CRUSH_CRAWFISH,
            entityEntry: findStageEntityData(rom, STAGE_CRUSH_CRAWFISH, ...ENT_RIDE_ARMOUR_ITEM),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_CRUSH_CRAWFISH, 0, 3),
            minimapMarkerEntry: 0,
            textIdx: 0x5b,
        },
        // TODO: tile limitations prevent this
        // {
        //     name: "Crush Crawfish Heart Tank",
        //     stageIdx: STAGE_CRUSH_CRAWFISH,
        //     entityEntry: findStageEntityData(rom, STAGE_CRUSH_CRAWFISH, ...ENT_HEART_TANK),
        //     dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_CRUSH_CRAWFISH, 2, 2),
        //     minimapMarkerEntry: 2,
        //     textIdx: 0x24,
        // },
        {
            name: "Doppler 1 Capsule",
            itemName: "Hyper Armour",
            stageIdx: STAGE_DOPPLER_1,
            entityEntry: findStageEntityData(rom, STAGE_DOPPLER_1, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_DOPPLER_1, 8, 0),
            textIdx: 0x5d,
        },
        {
            name: "Gravity Beetle Capsule",
            stageIdx: STAGE_GRAVITY_BEETLE,
            itemName: "Arm Chip",
            entityEntry: findStageEntityData(rom, STAGE_GRAVITY_BEETLE, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_GRAVITY_BEETLE, 10, 0),
            minimapMarkerEntry: 2,
            textIdx: 0x5d,
        },
        {
            name: "Gravity Beetle Frog Ride Armour",
            stageIdx: STAGE_GRAVITY_BEETLE,
            entityEntry: findStageEntityData(rom, STAGE_GRAVITY_BEETLE, ...ENT_RIDE_ARMOUR_ITEM),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_GRAVITY_BEETLE, 5, 3),
            minimapMarkerEntry: 1,
            textIdx: 0x57,
        },
        {
            name: "Gravity Beetle Heart Tank",
            stageIdx: STAGE_GRAVITY_BEETLE,
            entityEntry: findStageEntityData(rom, STAGE_GRAVITY_BEETLE, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_GRAVITY_BEETLE, 0, 3),
            minimapMarkerEntry: 0,
            textIdx: 0x24,
        },
        {
            name: "Neon Tiger Capsule",
            stageIdx: STAGE_NEON_TIGER,
            itemName: "Arm Upgrade",
            entityEntry: findStageEntityData(rom, STAGE_NEON_TIGER, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_NEON_TIGER, 2, 0),
            minimapMarkerEntry: 1,
            textIdx: 0x67,
        },
        {
            name: "Neon Tiger Heart Tank",
            stageIdx: STAGE_NEON_TIGER,
            entityEntry: findStageEntityData(rom, STAGE_NEON_TIGER, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_NEON_TIGER, 8, 0),
            minimapMarkerEntry: 2,
            textIdx: 0x24,
        },
        {
            name: "Neon Tiger Subtank",
            stageIdx: STAGE_NEON_TIGER,
            entityEntry: findStageEntityData(rom, STAGE_NEON_TIGER, ...ENT_SUBTANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_NEON_TIGER, 0, 3),
            minimapMarkerEntry: 0,
            textIdx: 0x55,
        },
        {
            name: "Toxic Seahorse Capsule",
            stageIdx: STAGE_TOXIC_SEAHORSE,
            itemName: "Leg Chip",
            entityEntry: findStageEntityData(rom, STAGE_TOXIC_SEAHORSE, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TOXIC_SEAHORSE, 7, 0),
            minimapMarkerEntry: 2,
            textIdx: 0x5d,
        },
        {
            name: "Toxic Seahorse Heart Tank",
            stageIdx: STAGE_TOXIC_SEAHORSE,
            entityEntry: findStageEntityData(rom, STAGE_TOXIC_SEAHORSE, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TOXIC_SEAHORSE, 1, 3),
            minimapMarkerEntry: 0,
            textIdx: 0x24,
        },
        {
            name: "Toxic Seahorse Kangaroo Ride Armour",
            stageIdx: STAGE_TOXIC_SEAHORSE,
            entityEntry: findStageEntityData(rom, STAGE_TOXIC_SEAHORSE, ...ENT_RIDE_ARMOUR_ITEM),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TOXIC_SEAHORSE, 4, 2),
            minimapMarkerEntry: 1,
            textIdx: 0x59,
        },
        {
            name: "Tunnel Rhino Capsule",
            stageIdx: STAGE_TUNNEL_RHINO,
            itemName: "Helmet Upgrade",
            entityEntry: findStageEntityData(rom, STAGE_TUNNEL_RHINO, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TUNNEL_RHINO, 7, 1),
            minimapMarkerEntry: 2,
            textIdx: 0x65,
        },
        {
            name: "Tunnel Rhino Heart Tank",
            stageIdx: STAGE_TUNNEL_RHINO,
            entityEntry: findStageEntityData(rom, STAGE_TUNNEL_RHINO, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TUNNEL_RHINO, 2, 0),
            tileDataOffset: 0x1600,
            minimapMarkerEntry: 0,
            textIdx: 0x24,
        },
        {
            name: "Tunnel Rhino Subtank",
            stageIdx: STAGE_TUNNEL_RHINO,
            entityEntry: findStageEntityData(rom, STAGE_TUNNEL_RHINO, ...ENT_SUBTANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TUNNEL_RHINO, 4, 0),
            minimapMarkerEntry: 1,
            textIdx: 0x55,
        },
        {
            name: "Volt Catfish Capsule",
            stageIdx: STAGE_VOLT_CATFISH,
            itemName: "Body Upgrade",
            entityEntry: findStageEntityData(rom, STAGE_VOLT_CATFISH, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_VOLT_CATFISH, 4, 1),
            minimapMarkerEntry: 0,
            textIdx: 0x63,
        },
        {
            name: "Volt Catfish Heart Tank",
            stageIdx: STAGE_VOLT_CATFISH,
            entityEntry: findStageEntityData(rom, STAGE_VOLT_CATFISH, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_VOLT_CATFISH, 3, 0),
            minimapMarkerEntry: 1,
            textIdx: 0x24,
        },
        {
            name: "Volt Catfish Subtank",
            stageIdx: STAGE_VOLT_CATFISH,
            entityEntry: findStageEntityData(rom, STAGE_VOLT_CATFISH, ...ENT_SUBTANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_VOLT_CATFISH, 8, 0),
            minimapMarkerEntry: 2,
            textIdx: 0x55,
        },
    ]

    // points to stage1 of this table, $13 bytes per stage, 6 bytes per entry
    let minimapMarkerTable = conv(6, 0xb01c);

    let items = [];
    for (let slot of slots) {
        let ramByteLowToCheck;
        let ramBitToCheck;
        if (slot.minimapMarkerEntry !== undefined) {
            let minimapMarkerEntry = minimapMarkerTable +
                0x13 * (slot.stageIdx-1) + 6 * slot.minimapMarkerEntry;
            ramByteLowToCheck = rom[minimapMarkerEntry+3];
            ramBitToCheck = rom[minimapMarkerEntry+5];
        } else {
            // Doppler 1
            ramByteLowToCheck = 0xd7;
            ramBitToCheck = 0xf0;
        }

        items.push({
            name: slot.itemName || slot.name,
            majorType: rom[slot.entityEntry+0],
            type: rom[slot.entityEntry+3],
            subType: rom[slot.entityEntry+4],
            decompIdx: rom[slot.dynamicSpriteEntry+0],
            paletteId: readWord(rom, slot.dynamicSpriteEntry+3),
            ramByteLowToCheck: ramByteLowToCheck,
            ramBitToCheck: ramBitToCheck,
            textIdx: slot.textIdx,
        })
    }

    let newSlots = [];

    // randomly fill slots with items
    let available_items = [...items];
    let available_slots = [...slots];
    for (let i = 0; i < slots.length; i += 1) {
      let chosen_item = Math.floor(rng() * available_items.length);
      let chosen_slot = Math.floor(rng() * available_slots.length);
      newSlots.push({
        item: available_items[chosen_item],
        slot: available_slots[chosen_slot],
      })
      available_items.splice(chosen_item, 1);
      available_slots.splice(chosen_slot, 1);
    }

    // Prevent volt catfish heart tank having a capsule
    for (let assignedSlot of newSlots) {
        if (assignedSlot.slot.name !== "Volt Catfish Heart Tank") continue;
        if (assignedSlot.item.name.indexOf("Capsule") === -1) break;

        for (let assignedSlot2 of newSlots) {
            if (assignedSlot2.slot.name === assignedSlot.slot.name) continue;
            if (assignedSlot2.item.name.indexOf("Capsule") !== -1) continue;

            let temp = assignedSlot.item;
            assignedSlot.item = assignedSlot2.item;
            assignedSlot2.item = temp;
            break;
        }
        break;
    }

    /*
    Mutate
    */

    // 4 bytes: flag, ram addr, text idx
    // per 3 texts per 8 stages
    let stageSelItemFlagAddrText = new Array(3 * 4 * 8);

    // mutate slots
    for (let assignedSlot of newSlots) {
        let slot = assignedSlot.slot;
        let item = assignedSlot.item;
        rom[slot.entityEntry+0] = item.majorType;
        rom[slot.entityEntry+3] = item.type;
        rom[slot.entityEntry+4] = item.subType;
        rom[slot.dynamicSpriteEntry+0] = item.decompIdx;
        if (slot.tileDataOffset !== undefined) {
            writeWord(rom, slot.dynamicSpriteEntry+1, slot.tileDataOffset);
        }
        writeWord(rom, slot.dynamicSpriteEntry+3, item.paletteId);

        // Change minimap marker entry details
        let minimapMarkerEntry = minimapMarkerTable +
            0x13 * (slot.stageIdx-1) + 6 * slot.minimapMarkerEntry;
        rom[minimapMarkerEntry+3] = item.ramByteLowToCheck;
        rom[minimapMarkerEntry+5] = item.ramBitToCheck;

        if (slot.minimapMarkerEntry !== undefined) {
            let base = (slot.stageIdx-1) * 4*3 + slot.minimapMarkerEntry * 4;
            stageSelItemFlagAddrText[base] = item.ramBitToCheck;
            stageSelItemFlagAddrText[base+1] = item.ramByteLowToCheck;
            stageSelItemFlagAddrText[base+2] = 0x1f;
            stageSelItemFlagAddrText[base+3] = item.textIdx;
        }
    }

    // Cater to Crush Crawfish Heart Tank (3rd entry)
    let base = (STAGE_CRUSH_CRAWFISH-1) * 4*3 + 2 * 4;
    stageSelItemFlagAddrText[base] = 0x20;
    stageSelItemFlagAddrText[base+1] = 0xd4;
    stageSelItemFlagAddrText[base+2] = 0x1f;
    stageSelItemFlagAddrText[base+3] = 0x24;

    m.addAsm(0x13, null, `
    StageSelItemFlagAddrText:
    `);
    start = conv(0x13, m.bankEnds[0x13]);
    for (let i = 0; i < stageSelItemFlagAddrText.length; i++) {
        rom[start+i] = stageSelItemFlagAddrText[i];
    }
    
    m.bankEnds[0x13] += stageSelItemFlagAddrText.length;

    // qol - skip intro stage (by pianohombre)
    if (opts.skip_intro) {
        m.addAsm(0, 0x99bd, `
            ldx #$04.b
            nop
            stx $1fd3.w
        `);
        m.addAsm(0, 0x9a21, `
            ldx #$01.b
            nop
            stx wStageIdx.w
        `);
    }

    // qol - show items in stage select
    if (opts.stage_sel_show_items) {
        m.addAsm(3, 0x84b6, `
            nop
            nop
        `);
    }

    // qol - no damage in most scenarios
    if (opts.zero_damage) {
        m.addAsm(4, 0xce01, `
            nop
            nop
            nop
        `);
        m.addAsm(4, 0xd095, `
            sbc #$00.b
            nop
        `);
    }

    // qol - non knockback
    if (opts.no_knockback) {
        m.addAsm(4, 0xcb56, `
            jmp $cb6f.w
        `);
    }

    // qol - small enemies spawn with 1hp
    if (opts.enemies_1hp) {
        m.addAsm(2, 0xe184, `
            lda #$01.b
            nop
        `);
    }

    // qol - minimap marker can cater to hyper armour
    m.addAsm(4, 0x9080, `
    ; Return zflag set to display marker
        jsr CheckMinimapMarkerForHyperArmour.l
        nop
    `);
    m.addAsm(0x13, null, `
    CheckMinimapMarkerForHyperArmour:
        lda $000a.w
        cmp #$f0.b
        bne _normalMinimapMarkerCheck

        lda ($10)
        and #$f0.b
        cmp #$f0.b
        beq _gotHyperArmour

        sep #$02.b
        rtl

    _gotHyperArmour:
        rep #$02.b
        rtl

    _normalMinimapMarkerCheck:
        lda ($10)
        bit $000a.w
        rtl
    `);

    // qol - stage select shows correct items
    for (let _textIdx of [
            0x24, 0x28, 0x55, 0x57, 0x59, 0x5b, 
            0x5d, 0x61, 0x63, 0x65, 0x67]) {

        for (let textIdx of [_textIdx, _textIdx+1]) {
            let textAddrs = getTextAddrs(rom, textIdx, isNormal);

            for (let textAddr of textAddrs) {
                if (rom[textAddr] != 0x89) 
                    throw new Error(`Stage select text byte 0 not $89: ${hexc(textIdx)}`);
                let palByte = rom[textAddr+3];
                if ((palByte&0xf0) !== 0xc0) 
                    throw new Error(`Stage select text 4th byte not a palette: ${hexc(textIdx)}`);
                rom[textAddr] = palByte;
                rom[textAddr+1] = palByte;
                rom[textAddr+2] = palByte;
            }
        }
    }
    m.addAsm(3, 0x8583, `
        jsr AddTextThreadForStageSelect.l
        nop
        nop
    `);
    m.addAsm(3, 0x859a, `
        jsr AddTextThreadForStageSelect.l
        nop
        nop
    `);
    m.addAsm(3, 0x85ae, `
        jsr AddTextThreadForStageSelect.l
        nop
        nop
    `);
    m.addAsm(0x13, null, `
    ; A - text line
    ; A8 I8
    AddTextThreadForStageSelect:
        pha

    ; $9c0c = StageSelectLocationsData.w+8 - valid stage idx selected
        ldx $36.b
        lda $9c0c.w, X
        rep #$10.b
        ldy #$0942.w
        cmp #$01.b
        beq _setStageSelText

        cmp #$03.b
        beq _setStageSelText

        cmp #$05.b
        beq _setStageSelText

        cmp #$07.b
        beq _setStageSelText

        ldy #$0956.w

    _setStageSelText:
        sty wTextRowVramAddr.w

    ; Y = stage idx selected, X = text line
        tay
        lda #$00.b
        xba
        pla
        inc a
        tax

    ; Re-use some dp vars
        lda $37.b
        pha
        lda $38.b
        pha
        lda $39.b
        pha

    ; Stage * 12
        dey
        tya
        asl a
        asl a
        sta $37.b
        asl a
        clc
        adc $37.b

        rep #$20.b

    ; 4 bytes per minimap marker entry
    _nextMinMapEntryForStageSelHud:
        dex
        beq _afterMinMapEntryForStageSelHud
        clc
        adc #4.w

        pha
        lda wTextRowVramAddr.w
        clc
        adc #$40.w
        sta wTextRowVramAddr.w
        pla
        bra _nextMinMapEntryForStageSelHud

    _afterMinMapEntryForStageSelHud:
        tax
        sep #$20.b

        lda StageSelItemFlagAddrText.l,X
        sta $39.b
        inx
        lda StageSelItemFlagAddrText.l,X
        sta $37.b
        inx
        lda StageSelItemFlagAddrText.l,X
        sta $38.b
        inx

        lda ($37)
        bit $39.b
        bne _keepStageSelText

        pla
        sta $39.b
        pla
        sta $38.b
        pla
        sta $37.b
        lda StageSelItemFlagAddrText.l,X
        inc a
        sep #$10.b
        rtl

    _keepStageSelText:
        pla
        sta $39.b
        pla
        sta $38.b
        pla
        sta $37.b
        lda StageSelItemFlagAddrText.l,X
        sep #$10.b
        rtl
    `);

    // Can use ride armour even if no chimera
    if (isNormal) {
        m.addAsm(3, 0xd75f, `
            and #$0f.b
        `);
    }

    // Start on the 1st available ride armour
    m.addAsm(3, 0xd879, `
        jsr StartAt1stRideArmourGotten.w
        nop
    `);
    m.addAsm(3, null, `
    StartAt1stRideArmourGotten:
    ; From replaced code
        sta $35.b

    ; Set entity var to X (0-3) based on 1st lower nybble bit set
        lda wChipsAndRideArmoursGottenBitfield.w
        ldx #$00.b
        bit #$01.b
        bne _setInitialRideArmour

        inx
        bit #$02.b
        bne _setInitialRideArmour

        inx
        bit #$04.b
        bne _setInitialRideArmour

        inx

    _setInitialRideArmour:
        stx $34.b
        rts
    `);

    // Get the right text idx for Dr Light
    m.addAsm(2, 0xfd02, `
        jsr SetCapsuleItemGiverTextIdx.l
        nop
        nop
    `);
    m.addAsm(2, 0xd58a, `
    SetCarryIfEntityWayOutOfView:
    `);
    m.addAsm(5, null, `
    SetCapsuleItemGiverTextIdx:
        phd
        phx

        pea wEnemyEntities.w
        pld
        ldx #$00.w

    _nextEntity:
        lda Enemy_type.b
        cmp #$4d.b
        bne _toNextEntity

        jsr SetCarryIfEntityWayOutOfView.l
        bcc _exitLoop

    _toNextEntity:
        rep #$20.b
        tdc
        clc
        adc #Enemy_sizeof.w
        tcd
        cmp #$10d8.w
        sep #$20.b
        beq _noCapsule

        bra _nextEntity

    _noCapsule:
        lda $0008.w
        bra _setTextIdx

    _exitLoop:
        lda Enemy_subType.b

        ldy #$0c.w
        cmp #$01.b
        beq _setCapsuleTextIdx

        ldy #$0e.w
        cmp #$02.b
        beq _setCapsuleTextIdx

        ldy #$0d.w
        cmp #$04.b
        beq _setCapsuleTextIdx

        ldy #$0b.w
        cmp #$08.b
        beq _setCapsuleTextIdx

        ldy #$40.w
        cmp #$10.b
        beq _setCapsuleTextIdx

        ldy #$42.w
        cmp #$20.b
        beq _setCapsuleTextIdx

        ldy #$41.w
        cmp #$40.b
        beq _setCapsuleTextIdx

        ldy #$43.w
        cmp #$80.b
        beq _setCapsuleTextIdx

        ldy #$46.w

    _setCapsuleTextIdx:
        tya

    _setTextIdx:
        plx
        sta $0006.w, X

        pld
        rtl

    `);

    // Prevent additional texts due to chip descripts/reqs not filled
    if (isNormal)
        rom[conv(5, 0xc8ed)] = 0x80; // bra

    // Prevent Dr. Light from being drawn
    rom[conv(5, 0xc89d)] = 0x80 // bra

    // Prevent movement animation after getting a capsule item
    start = conv(6, 0xcd09);
    for (let i = 0; i < 12; i++) {
        rom[start+i] = 0x15;
    }

    // Allow randomizing capsules
    // remove all camera snapping data from capsules
    start = conv(6, 0xcd9f);
    for (let i = 0; i < 15*4; i++) {
        rom[start+i] = 0;
    }
    // Skip Doppler capsule check so it's always displayed
    m.addAsm(0x13, isNormal ? 0xc011 : 0xc019, `
        jmp InitialCapsuleCheck.w
    `);
    // various hooks to use subtype to determine item, rather than stage
    m.addAsm(0x13, isNormal ? 0xc031 : 0xc034, `
    InitialCapsuleCheck:
        jsr ConvertNewCapsuleParamToCapsuleItemGivingEntityParam.w
        tay
        nop
        nop
    `);
    m.addAsm(0x13, 0xc37d, `
        jsr ConvertNewCapsuleParamToCapsuleItemGivingEntityParam.w
    `);
    if (isNormal) {
        m.addAsm(0x13, 0xc3b1, `
            jsr ConvertNewCapsuleParamToCapsuleItemGivingEntityParam.w
        `);
    }
    m.addAsm(0x13, 0xc510, `
        jsr ConvertNewCapsuleParamToCapsuleItemGivingEntityParam.w
    `);
    if (isNormal) {
        m.addAsm(0x13, 0xc54b, `
            jsr ConvertNewCapsuleParamToCapsuleItemGivingEntityParam.w
        `);
    } else {
        m.addAsm(0x4a, 0x92da, `
            jsr FarConvertNewCapsuleParamToCapsuleItemGivingEntityParam.l
            nop
            nop
        `);
        m.addAsm(0x13, null, `
        FarConvertNewCapsuleParamToCapsuleItemGivingEntityParam:
            jsr ConvertNewCapsuleParamToCapsuleItemGivingEntityParam.w
            and #$00ff.w
            rtl
        `);
    }
    m.addAsm(0x13, 0xc5c0, `
        jsr ConvertNewCapsuleParamToCapsuleItemGivingEntityParam.w
    `);
    m.addAsm(0x13, null, `
        AdjustCapsuleBaseTileIdx:
            lda $18.b
            sec
            sbc #$40.b
            sta $18.b
            rts

        SetCapsuleNonFlipForcedAttrs:
            lda $11.b
            ora #$30.b
            sta $11.b
            rts

        ConvertNewCapsuleParamToCapsuleItemGivingEntityParam:
        ; this will utterly fail if subtype is 0
        ; acc or idx can be 8/16
            pha
            phx
            php

            sep #$30.b
            ldy #$08.b
            lda Enemy_subType.b
            cmp #$ff.b
            bne _startNonHyper
            bra _returnYasA

        _startNonHyper:
            ldy #$00.b
        _nonHyperLoop:
            lsr
            bcs _returnYasA
            iny
            bra _nonHyperLoop

        _returnYasA:
            plp
            plx
            pla

            tya
            rts
    `);

    // Make capsule tile offset not fixed
    m.addAsm(0x13, isNormal ? 0xc075 : 0xc06e, `
        jsr AdjustCapsuleBaseTileIdx.w
        nop
    `);

    // Make capsule tile attr not fixed, except for setting max obj priority
    m.addAsm(0x13, isNormal ? 0xc07b : 0xc074, `
        jsr SetCapsuleNonFlipForcedAttrs.w
        nop
    `);

    // Adjust capsule to be level with the floor
    m.addAsm(0x13, isNormal ? 0xc09e : 0xc097, `
        lda Enemy_y.b
        sec
        sbc #$0018.w
        sta Enemy_y.b
        nop
        nop
    `);

    m.compile(rom);

    // set checksum
    let checksum = sum(rom) - readWord(rom, 0x7fdc) - readWord(rom, 0x7fde);
    checksum = checksum & 0xffff;
    writeWord(rom, 0x7fdc, 0x10000-checksum);
    writeWord(rom, 0x7fde, checksum);

    let bossDetails = [];
    for (let [bossName, deets] of Object.entries(bossData)) {
        bossDetails.push([bossName, deets.newHealth, deets.newWeakness, deets.newDrop]);
    }

    for (let [label, deets] of Object.entries(m.labels)) {
        let [blockName, offs] = deets;
        let romOffs = m.asm[blockName].placement + offs;
        console.log(`Label ${label} at rom offset ${hexc(romOffs)}`);
    }

    return {
        newSlots: newSlots,
        bossDetails: bossDetails,
        randomized_rom: rom,
    }
}