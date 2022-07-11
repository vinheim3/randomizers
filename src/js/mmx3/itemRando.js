function itemRandomize(rom, rng, opts, m) {
    let isNormal = opts.romType === 'normal';

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

    /*
    Build slots and randomize
    */

    // This is done here for the 'find'-type functions
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

    if (isNormal) {
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
    } else {
        m.addAsm(3, 0x8583, `
            jsr ZeroModAddTextThreadForStageSelect.l
            nop
            nop
        `);
        m.addAsm(3, 0x859a, `
            jsr ZeroModAddTextThreadForStageSelect.l
            nop
            nop
        `);
        m.addAsm(3, 0x85ae, `
            jsr ZeroModAddTextThreadForStageSelect.l
            nop
            nop
        `);
        m.addAsm(0x13, null, `
        ; A - text line
        ; A8 I8
        ZeroModAddTextThreadForStageSelect:
            pha

            lda $1fd1.w
            sta $0014.w
            lda $1fd4.w
            sta $0016.w
            jsr $caaa51.l
            bvs _allHealthTanksGot
        
            bra _setHealthTanksForStageSelItems
        
        _allHealthTanksGot:
            lda #$ff.b
        
        _setHealthTanksForStageSelItems:
            sta $1fd4.w
            lda $7ef418.l
            sta $1fd1.w
            jsr $caaa62.l
            ora $1fd1.w
            sta $1fd1.w

            pla
            jsr AddTextThreadForStageSelect.l
            pha

            lda $0014.w
            sta $1fd1.w
            lda $0016.w
            sta $1fd4.w

            pla
            rtl
        `);
    }
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

    return newSlots;
}