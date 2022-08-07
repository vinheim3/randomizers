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
        wJoy1CurrButtonsHeld: 0xa8,
        wJoy1CurrBtnsPressed: 0xac,
        wCurrHealth: 0x9ff,
        wNumLives: 0x1fb4,
        wFrameCounter: 0x9cf,
        wSubTanksAndUpgradesGottenBitfield: 0x1fd1,
        wMaxHealth: 0x1fd2,
        wHealthTanksGottenBitfield: 0x1fd4,
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
    enemyRandomize(rom, rng, opts, m);

    // Clear some ram vars
    m.addAsm(0, isNormal ? 0x800e : 0xff9b, `
        jsr ClearRandoRamVars.l
    `);
    m.addAsm(null, null, `
    ClearRandoRamVars:
        sta $7effff.l
        sta $${hexc(gotHyperArmour)}.l
        rtl
    `);

    if (opts.enemy_multipliers !== '1') {
        let mult = parseFloat(opts.enemy_multipliers);

        // start with enemy table
        start = conv(6, 0xe28e);        
        for (let enemyId = 0; enemyId <= 0x6a; enemyId++) {
            if (enemyId != 9) {
                if (rom[start+2]!==0) {
                    let newDmgDealt = Math.max(1, Math.floor(rom[start+2]*mult));
                    rom[start+2] = newDmgDealt;
                }
                if (rom[start+3]!==0) {
                    let newHealth = Math.max(1, rom[start+3]*mult);
                    rom[start+3] = newHealth;
                }
            }
            start += 5;
        }

        // then boss health
        for (let [bossName, deets] of Object.entries(bossData)) {
            let healthAddr = deets.maxHealth;
            if (rom[healthAddr-1] !== 0xc9 || rom[healthAddr] !== 0x20)
                throw new Error(`Boss ${bossName} health address is wrong`);

            let health = Math.floor(rom[healthAddr]*mult);
            rom[healthAddr] = health;
            bossData[bossName].newHealth = health;
        }

        // ride armour goliath cross-charge table
        start = conv(6, 0xf353);
        for (let i = 0; i < 4; i++) {
            let dmg = Math.max(1, Math.floor(rom[start+i]*mult));
            rom[start+i] = dmg;
        }

        // then misc `lda/adc #xx.b`
        for (let addr of [
            conv(0x3, 0xcb21),
            conv(0x3, 0xcb47),
            conv(0x3, 0xcbb0),
            conv(0x3, 0xcc9f),
            conv(0x3, 0xd0f5),
            conv(0x3, 0xd31e),
            conv(0x3, 0xd39d),
            conv(0x4, 0xc8dd),
            conv(0x4, 0xe407),
            conv(0x4, 0xe441),
            conv(0x4, 0xe48e),
            conv(0x4, 0xe501),
            conv(0x4, 0xe553),
            conv(0x4, 0xe578),
            conv(0x4, 0xeabd),
            conv(0x4, 0xec22),
            conv(0x4, 0xeda3),
            conv(0x4, 0xef17),
            conv(0x4, 0xf058),
            conv(0x4, 0xf26a),
            conv(0x4, 0xf643),
            conv(0x4, 0xf911),
            conv(0x4, 0xfb81),
            conv(0x5, 0x8ba4),
            conv(0x5, 0x8e9c),
            conv(0x5, 0x99c6),
            conv(0x5, 0xb230),
            conv(0x5, 0xb267),
            conv(0x5, 0xb39c),
            conv(0x5, 0xb3d3),
            conv(0x5, 0xb561),
            conv(0x5, 0xb5a5),
            conv(0x5, 0xca3b),
            conv(0x7, 0x859e),
            conv(0x7, 0x8e78),
            conv(0x7, 0xc48a),
            conv(0x7, 0xf73d),
            conv(0x7, 0xfe75),
            conv(0x8, 0x9a50),
            conv(0x8, 0x9a90),
            conv(0x8, 0x9b83),
            conv(0x8, 0x9d32),
            conv(0x8, 0x9d67),
            conv(0x8, 0xa16f),
            conv(0x8, 0xa1c8),
            conv(0x8, 0xa61b),
            conv(0x8, 0xa635),
            conv(0x8, 0xa657),
            conv(0x8, 0xaa07),
            conv(0x8, 0xaad9),
            conv(0x8, 0xab0f),
            conv(0x8, 0xaf04),
            conv(0x8, 0xaf3a),
            conv(0x8, 0xaf7d),
            conv(0x8, 0xaf91),
            conv(0x8, 0xb62f),
            conv(0x8, 0xb6e5),
            conv(0x8, 0xbcdc),
            conv(0x8, 0xbe9b),
            conv(0x8, 0xbed3),
            conv(0x8, 0xc098),
            conv(0x8, 0xc0c0),
            conv(0x8, 0xc775),
            conv(0x8, 0xca03),
            conv(0x13, 0xd2e5),
            conv(0x13, 0xd2f6),
            conv(0x13, 0xd30d),
            conv(0x13, 0xd44b),
            conv(0x13, 0xdd4e),
            conv(0x13, 0xe53f),
            conv(0x13, 0xe7bc),
            conv(0x13, 0xe898),
            conv(0x13, 0xeaff),
            conv(0x13, 0xf01c),
            conv(0x13, 0xf040),
            conv(0x13, 0xf2f2),
            conv(0x13, 0xf5e3),
            conv(0x32, 0xf313),
            conv(0x32, 0xf331),
            conv(0x32, 0xf371),
            conv(0x39, 0x9cd5),
            conv(0x39, 0x9ef6),
            conv(0x39, 0x9f0f),
            conv(0x39, 0xa590),
            conv(0x39, 0xa5bf),
            conv(0x39, 0xa5f0),
            conv(0x39, 0xac93),
            conv(0x39, 0xacf9),
            conv(0x39, 0xae86),
            conv(0x39, 0xaf4a),
            conv(0x39, 0xb0d5),
            conv(0x39, 0xb394),
            conv(0x3a, 0xf998),
            conv(0x3c, 0xbf59),
            conv(0x3d, 0xfd60),
            conv(0x3d, 0xfda9),
            conv(0x3f, 0xe6a7),
            conv(0x3f, 0xe957),
            conv(0x3f, 0xe9e6),
            conv(0x3f, 0xeadd),
            conv(0x3f, 0xeff6),
        ]) {
            if (rom[addr] === 0xea) continue;
            if (rom[addr] !== 0xa9 && rom[addr] !== 0x69)
                throw new Error(`Enemy misc dmg invalid ${hexc(addr)}`);
            let newDmg = Math.max(1, Math.floor(rom[addr+1]*mult));
            rom[addr+1] = newDmg;
        }
    }

    // Scavenger hunt: num subweapons required
    if (opts.new_game_mode === 'doppler_subwep_locked' || opts.new_game_mode === 'doppler_upgrades_locked') {
        let num_required = opts.new_game_mode === 'doppler_subwep_locked' ? opts.subweps_required : opts.upgrades_required;
        if (isNormal) {
            for (let addr of [
                conv(3, 0x8076),
                conv(0, 0xc255),
                conv(0, 0xc307),
                conv(0, 0xc420),
                conv(0, 0xc459),
                conv(0, 0xc491),
            ]) {
                // `cmp #$08.b`
                if (rom[addr-1] !== 0xc9) throw new Error(`Invalid num subweapon check ${hexc(addr)}`);
                rom[addr] = num_required;
            }

            rom[conv(0, 0xc2d0)] = 0xb0; // bcs instead of beq after 3:8076
            rom[conv(0, 0xc421)] = 0x90; // bcc instead of bne after 0:c420
            rom[conv(0, 0xc492)] = 0x90; // bcc instead of bne after 0:c491

            if (opts.new_game_mode === 'doppler_upgrades_locked') {
                m.addAsm(3, 0x8065, `
                    jsr DopplerUpgradeLockCheck.w
                    jmp $8073.w
                `);
                m.addAsm(3, null, `
                DopplerUpgradeLockCheck:
                    lda wSubTanksAndUpgradesGottenBitfield.w
                    stz $2c.b
                    ldx #$04.b
                _nextUpdateLockCheck:
                    lsr
                    bcc _afterUpgradeLockCheck
                    inc $2c.b
                _afterUpgradeLockCheck:
                    dex
                    bne _nextUpdateLockCheck
                    lda $2c.b
                    rts
                `);
            }
        } else {
            m.addAsm(3, 0x806c, `
                jsr ZeroModCheckGotSufficientSubweapons.l
            `);
            if (opts.new_game_mode === 'doppler_upgrades_locked') {
                m.addAsm(null, null, `
                ; Set A to $ff if got sufficient subweapons
                ZeroModCheckGotSufficientSubweapons:
                    php
                    sep #$30.b
                    lda #$00.b
                    pha
                    lda $7ef4e2.l
                    ldx #$07.b

                _nextWepInSubwepScavenger:
                    asl a
                    bcc _toNextWepInSubwepScavenger

                    pla
                    inc a
                    pha

                _toNextWepInSubwepScavenger:
                    dex
                    bpl _nextWepInSubwepScavenger

                    pla
                    cmp #$0${num_required}.b
                    bcs _sufficientSubweapons

                    plp
                    lda #$00.b
                    rtl

                _sufficientSubweapons:
                    plp
                    lda #$ff.b
                    rtl
                `);
            } else {
                m.addAsm(null, null, `
                ZeroModCheckGotSufficientSubweapons:
                    php
                    sep #$30.b
                    lda wSubTanksAndUpgradesGottenBitfield.w
                    pha

                    lda $7ef418.l
                    sta wSubTanksAndUpgradesGottenBitfield.w
                    jsr $caaa62.l
                    ora wSubTanksAndUpgradesGottenBitfield.w
                    sta wSubTanksAndUpgradesGottenBitfield.w

                ; Copied from normal mode

                    lda wSubTanksAndUpgradesGottenBitfield.w
                    stz $2c.b
                    ldx #$04.b
                _nextUpdateLockCheck:
                    lsr
                    bcc _afterUpgradeLockCheck
                    inc $2c.b
                _afterUpgradeLockCheck:
                    dex
                    bne _nextUpdateLockCheck
                    lda $2c.b

                ; End of copy

                    cmp #$0${num_required}.b
                    bcs _sufficientSubweapons

                    pla
                    sta wSubTanksAndUpgradesGottenBitfield.w
                    plp
                    lda #$00.b
                    rtl

                _sufficientSubweapons:
                    pla
                    sta wSubTanksAndUpgradesGottenBitfield.w
                    plp
                    lda #$ff.b
                    rtl
                `);
            }
        }
    }

    // Randomize boss health
    if (opts.random_boss_hp) {
        for (let [bossName, deets] of Object.entries(bossData)) {
            let healthAddr = deets.maxHealth;
            if (rom[healthAddr-1] !== 0xc9 || rom[healthAddr] !== 0x20)
                throw new Error(`Boss ${bossName} health address is wrong`);

            let minHp = opts.min_boss_hp;
            let maxHp = opts.max_boss_hp+1;
            let health = Math.floor(rng() * (maxHp-minHp)) + minHp;
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

            m.addAsm(null, null, `
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

            m.addAsm(null, null, `
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

    if (opts.random_player_hp) {
        m.addAsm(0, 0xa1cb, `
            jsr RandoPlayerHealth.l
            nop
        `);
        m.addAsm(null, null, `
        RandoPlayerHealth:
            lda wFrameCounter.w
            and #$0f.b
            clc
            adc #$08.b
            ora #$80.b
            sta wCurrHealth.w
            rtl
        `);
        // prevent health being capped, nops for zero mod
        m.addAsm(3, 0x9074, `
            nop
            nop
            nop
            sta wCurrHealth.w
        `);
    }

    // Add randomizer text + version
    m.addAsm(0, 0x8ef8, `
        jsr AddTmAndRandoDetails.l
        nop
    `);
    
    let text = `Randomizer v${MAJOR_VERSION}.${MINOR_VERSION}.${PATCH_VERSION}`;
    m.addAsm(null, null, `
    RandomizerText:
    `);
    let chosenBank = m.getLabelBank('RandomizerText');
    m.addBytes(chosenBank, text.split('').map(ch=>ch.charCodeAt(0)), rom);
    m.addBytes(chosenBank, [0], rom);

    m.addAsm(null, null, `
    AddTmAndRandoDetails:
    ; From prev code, but with a far call
        lda #$04.b
        jsr $868d.l ; FarCopySimpleSetsOfTiles

        ldx $a5.b ; mini dma struct
        lda #$80.b
        sta $600.w,X ; vmain
        inx
        lda #$cb.b
        sta $600.w,X ; vram lo
        inx
        lda #$09.b
        sta $600.w,X ; vram hi
        inx
        lda #${text.length*2}.b
        sta $600.w,X ; num bytes
        inx
        txy
        ldx #$00.b
    _nextRandomizerTextChar:
        lda RandomizerText.l,X
        beq _endRandomizerText

        sta $600.w,Y
        iny
        lda #$20.b
        sta $600.w,Y
        iny
        inx
        bra _nextRandomizerTextChar

    _endRandomizerText:
        tyx
        stx $a5.b
        rtl
    `);

    // qol - quicker leg upgrade shot
    rom[conv(0x3f, 0xd251)] = 3;

    // qol - exit stage anytime
    m.addAsm(8, 0x8604, `
        jsr CheckSoftReset.l
    `);
    m.addAsm(null, null, `
    CheckSoftReset:
    ; From overwritten code
        and wJoy1CurrButtonsHeld.b
        sta wJoy1CurrBtnsPressed.b

    ; B+Select
        lda wJoy1CurrButtonsHeld.b
        cmp #$a000.w
        bne _endSoftResetCheck

        sep #$20.b
        lda #$00.b
        sta wCurrHealth.w
        sta wNumLives.w
        rep #$20.b

    _endSoftResetCheck:
        rtl
    `);

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

    // qol - more subweapons breaks walls/ice that's normally for Tornado Fang
    if (opts.fragile_walls) {
        let wallWeaknessEntries = getWeaknessTables(rom, 0x0e, isNormal);
        for (let tableAddr of wallWeaknessEntries) {
            for (let i = 0; i < 8; i++) {
                rom[tableAddr+7+i] = 2;
            }
        }
    }

    // qol - no damage in most scenarios
    if (opts.zero_damage) {
        m.addAsm(4, 0xce01, `
            nop
            nop
            nop
        `);
        m.addAsm(4, 0xc8dd, `
            lda #$00.b
        `);
        // earth commander roller
        m.addAsm(7, 0x9c54, `
            nop
            nop
        `);
        // caterkiller charged
        m.addAsm(4, 0xedc8, `
            nop
            nop
        `);
        // kaiser sigma light
        m.addAsm(5, 0x8da1, `
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
        // loading from enemy table
        m.addAsm(2, 0xe184, `
            lda #$01.b
            nop
        `);
        // Shurikein
        m.addAsm(0x3c, 0xbf4e, `
            lda #$01.b
        `);
        // bosses
        for (let [bossName, deets] of Object.entries(bossData)) {
            let healthAddr = deets.maxHealth;
            rom[healthAddr] = 1;
            bossData[bossName].newHealth = 1;
        }
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
        // console.log(`Label ${label} at rom offset ${hexc(romOffs)}`);
    }

    return {
        newSlots: newSlots,
        bossDetails: bossDetails,
        randomized_rom: rom,
    }
}