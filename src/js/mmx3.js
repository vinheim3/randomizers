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

    prep(rom, rng, opts, m);
    let newSlots = itemRandomize(rom, rng, opts, m);
    paletteRandomize(rom, rng, opts, m);

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