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

const ENEMYID_RIDE_ARMOUR_HOLDER = 0x4c;
const ENEMYID_CAPSULE = 0x4d;

const DECOMP_DATA_IDX_RIDE_ARMOUR_ITEM = 0x3b;

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
    throw new Error(`Could not find stage entity data ${stageIdx}, ${majorType}, ${type.toString(16)}`);
}

const getDynamicSpriteData = function(rom, stageIdx, dynIdx, entryIdx) {
    const table = conv(8, 0x8623);
    const stageOffs = readWord(rom, table+stageIdx*2);
    const dynOffs = readWord(rom, table+stageOffs+dynIdx*2);
    return table+dynOffs+entryIdx*6;
}

const replaceText = function(rom, textIdx, text) {
    let entry = conv(0x39, 0xc1bc + textIdx * 2);
    // skip 7 bytes
    let start = conv(0x39, readWord(rom, entry) + 7);
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

function randomize(rom, rng, opts) {
    /*
    Initial rom changes
    */

    let start;
    let isNormal = opts.romType === 'normal';

    const ENT_RIDE_ARMOUR_HOLDER = [MT_ENEMY, ENEMYID_RIDE_ARMOUR_HOLDER];
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
        start = getDynamicSpriteData(rom, stage, regionIdx, capsuleSpecOffs);
        rom[start+5] = 0x60;
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
        replaceText(rom, textIdx, ["You got the", text]);
    }

    /*
    Build slots and randomize
    */

    let slots = [
        {
            name: "Blast Hornet Capsule",
            entityEntry: findStageEntityData(rom, STAGE_BLAST_HORNET, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLAST_HORNET, 3, 0),
        },
        {
            name: "Blast Hornet Chimera Ride Armour",
            entityEntry: findStageEntityData(rom, STAGE_BLAST_HORNET, ...ENT_RIDE_ARMOUR_ITEM),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLAST_HORNET, 6, 3),
        },
        {
            name: "Blast Hornet Heart Tank",
            entityEntry: findStageEntityData(rom, STAGE_BLAST_HORNET, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLAST_HORNET, 9, 0),
        },
        {
            name: "Blizzard Buffalo Capsule",
            entityEntry: findStageEntityData(rom, STAGE_BLIZZARD_BUFFALO, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLIZZARD_BUFFALO, 6, 0),
        },
        {
            name: "Blizzard Buffalo Heart Tank",
            entityEntry: findStageEntityData(rom, STAGE_BLIZZARD_BUFFALO, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLIZZARD_BUFFALO, 1, 0),
            tileDataOffset: 0x1e00,
        },
        {
            name: "Blizzard Buffalo Subtank",
            entityEntry: findStageEntityData(rom, STAGE_BLIZZARD_BUFFALO, ...ENT_SUBTANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLIZZARD_BUFFALO, 5, 3),
        },
        {
            name: "Crush Crawfish Capsule",
            entityEntry: findStageEntityData(rom, STAGE_CRUSH_CRAWFISH, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_CRUSH_CRAWFISH, 3, 0),
        },
        {
            name: "Crush Crawfish Hawk Ride Armour",
            entityEntry: findStageEntityData(rom, STAGE_CRUSH_CRAWFISH, ...ENT_RIDE_ARMOUR_ITEM),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_CRUSH_CRAWFISH, 0, 3),
        },
        // TODO: tile limitations prevent this
        // {
        //     name: "Crush Crawfish Heart Tank",
        //     entityEntry: findStageEntityData(rom, STAGE_CRUSH_CRAWFISH, ...ENT_HEART_TANK),
        //     dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_CRUSH_CRAWFISH, 2, 2),
        // },
        {
            name: "Doppler 1 Capsule",
            entityEntry: findStageEntityData(rom, STAGE_DOPPLER_1, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_DOPPLER_1, 8, 0),
        },
        {
            name: "Gravity Beetle Capsule",
            entityEntry: findStageEntityData(rom, STAGE_GRAVITY_BEETLE, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_GRAVITY_BEETLE, 10, 0),
        },
        {
            name: "Gravity Beetle Frog Ride Armour",
            entityEntry: findStageEntityData(rom, STAGE_GRAVITY_BEETLE, ...ENT_RIDE_ARMOUR_ITEM),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_GRAVITY_BEETLE, 5, 3),
        },
        {
            name: "Gravity Beetle Heart Tank",
            entityEntry: findStageEntityData(rom, STAGE_GRAVITY_BEETLE, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_GRAVITY_BEETLE, 0, 3),
        },
        {
            name: "Neon Tiger Capsule",
            entityEntry: findStageEntityData(rom, STAGE_NEON_TIGER, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_NEON_TIGER, 2, 0),
        },
        {
            name: "Neon Tiger Heart Tank",
            entityEntry: findStageEntityData(rom, STAGE_NEON_TIGER, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_NEON_TIGER, 8, 0),
        },
        {
            name: "Neon Tiger Subtank",
            entityEntry: findStageEntityData(rom, STAGE_NEON_TIGER, ...ENT_SUBTANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_NEON_TIGER, 0, 3),
        },
        {
            name: "Toxic Seahorse Capsule",
            entityEntry: findStageEntityData(rom, STAGE_TOXIC_SEAHORSE, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TOXIC_SEAHORSE, 7, 0),
        },
        {
            name: "Toxic Seahorse Heart Tank",
            entityEntry: findStageEntityData(rom, STAGE_TOXIC_SEAHORSE, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TOXIC_SEAHORSE, 1, 3),
        },
        {
            name: "Toxic Seahorse Kangaroo Ride Armour",
            entityEntry: findStageEntityData(rom, STAGE_TOXIC_SEAHORSE, ...ENT_RIDE_ARMOUR_ITEM),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TOXIC_SEAHORSE, 4, 2),
        },
        {
            name: "Tunnel Rhino Capsule",
            entityEntry: findStageEntityData(rom, STAGE_TUNNEL_RHINO, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TUNNEL_RHINO, 7, 1),
        },
        {
            name: "Tunnel Rhino Heart Tank",
            entityEntry: findStageEntityData(rom, STAGE_TUNNEL_RHINO, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TUNNEL_RHINO, 2, 0),
            tileDataOffset: 0x1600,
        },
        {
            name: "Tunnel Rhino Subtank",
            entityEntry: findStageEntityData(rom, STAGE_TUNNEL_RHINO, ...ENT_SUBTANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TUNNEL_RHINO, 4, 0),
        },
        {
            name: "Volt Catfish Capsule",
            entityEntry: findStageEntityData(rom, STAGE_VOLT_CATFISH, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_VOLT_CATFISH, 4, 1),
        },
        {
            name: "Volt Catfish Heart Tank",
            entityEntry: findStageEntityData(rom, STAGE_VOLT_CATFISH, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_VOLT_CATFISH, 3, 0),
        },
        {
            name: "Volt Catfish Subtank",
            entityEntry: findStageEntityData(rom, STAGE_VOLT_CATFISH, ...ENT_SUBTANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_VOLT_CATFISH, 8, 0),
        },
    ]

    let items = [];
    for (let slot of slots) {
        items.push({
            name: slot.name,
            majorType: rom[slot.entityEntry+0],
            type: rom[slot.entityEntry+3],
            subType: rom[slot.entityEntry+4],
            decompIdx: rom[slot.dynamicSpriteEntry+0],
            paletteId: readWord(rom, slot.dynamicSpriteEntry+3),
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

    /*
    Mutate
    */

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
    }

    let m = new M65816({
        wStageIdx: 0x1fae,
        wChipsAndRideArmoursGottenBitfield: 0x1fd7,
        Func_13_c1b4: conv(0x13, 0xc1b4),
        Enemy_y: 0x08,
        Enemy_type: 0x0a,
        Enemy_subType: 0x0b,
        Enemy_sizeof: 0x40,
        wEnemyEntities: 0xd18,
    }, {
        0x03: isNormal ? 0xfa74 : 0xfa79,
        0x05: 0xfbee,
        0x13: 0xfa6e,
        0x4a: 0xc0a6,
    });

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

    // qol - remove capsule initial cutscene
    // prevent player freezing when touching a capsule
    // m.addAsm(0x13, 0xc173, `
    //     nop
    //     nop
    //     nop
    //     nop
    // `);
    // prevent camera snapping in on capsule (as it requires text to snap back)
    // unnecessary, as we clear camera snapping data below
    // m.addAsm(0x13, 0xc19e, `
    //     bra Func_13_c1b4
    //     nop
    // `);
    // prevent old guy, and text, from spawning
    // m.addAsm(0x13, 0xc20c, `
    //     rts
    //     nop
    //     nop
    // `);

    // Get the right text idx for Dr Light
    m.addAsm(2, 0xfd02, `
        jsr SetCapsuleItemGiverTextIdx.l
        nop
        nop
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
        beq _exitLoop

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
    // subtype now helps determine if Hyper Armour (rather than stage)
    m.addAsm(0x13, 0xc011, `
        lda Enemy_subType.b
        nop
        cmp #$ff.b
    `);
    // various hooks to use subtype to determine item, rather than stage
    m.addAsm(0x13, isNormal ? 0xc031 : 0xc034, `
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

    return [newSlots, rom];
}