let conv = function(bank, addr) {
    return bank*0x4000+addr+0x10;
}

function splice(obj, offset, ...vals) {
    for (let i = 0; i < vals.length; i++) {
        obj[offset+i] = vals[i];
    }
}

let noFlashAddresses = [
    conv(5, 0x2c77),
    conv(5, 0x33ea),
    conv(6, 0x0874),
    conv(6, 0x0882),
    conv(6, 0x0a38),
    conv(6, 0x0b37),
    conv(6, 0x0b45),
    conv(6, 0x0dd4),
    conv(6, 0x0e02),
    conv(6, 0x2f3b),
    conv(6, 0x2f49),
    conv(6, 0x2f70),
    conv(6, 0x2f7e),
    conv(6, 0x3a50),
    conv(7, 0x21e1),
    conv(7, 0x220f),
    conv(7, 0x2242),
    conv(7, 0x229b),
    conv(7, 0x392e),
    conv(7, 0x3945),
    conv(7, 0x39e6),
    conv(7, 0x39fa)
]

let globalFlags = {
    GF_UPGRADED_WING_SWORD: 0x03,
    // GF_LONG_SWORD: 0x18,
    GF_BATTLE_SWORD: 0x19,
    GF_FLAME_SWORD: 0x1a,
    GF_DRAGON_SWORD: 0x1b,
    GF_WING_SWORD: 0x1c,
    GF_DEVIL_EYE_SWORD: 0x1d,
    GF_KAISER_SWORD: 0x1e,
    GF_WONDER_SWORD: 0x1f,
    GF_WOOD_SHIELD: 0x20,
    GF_SMALL_SHIELD: 0x21,
    GF_GOLD_SHIELD: 0x22,
    GF_DRAGON_SHIELD: 0x23,
    GF_METAL_SHIELD: 0x24,
    GF_TAIL_SHIELD: 0x25,
    GF_BATTLE_SHIELD: 0x26,
    GF_FURY_SHIELD: 0x27,
    GF_ACORN_MAGIC: 0x28,
    GF_BOMBARD_MAGIC: 0x29,
    GF_RENEW_MAGIC: 0x2a,
    GF_THUNDER_MAGIC: 0x2b,
    GF_FIREFLOR_MAGIC: 0x2c,
    GF_CANE_MAGIC: 0x2d,
    GF_TERSTORM_MAGIC: 0x2e,
    GF_HEALMACE_MAGIC: 0x30,
    GF_OCARINA_MAGIC: 0x31,
    GF_FLEET_MAGIC: 0x32,
    GF_SPECTER_MAGIC: 0x33,
    // GF_HEALBALL_MAGIC: 0x34,
    GF_STATUE_ITEM: 0x38,
    GF_RING_ITEM: 0x39,
    GF_HERBS_ITEM: 0x3a,
    GF_SCALE_ITEM: 0x3b,
    GF_BRACELET_ITEM: 0x3c,
    GF_HANDCUFFS_KEY_ITEM: 0x3d,
    GF_FLUTE_ITEM: 0x3e,
    GF_RED_CRYSTAL_ITEM: 0x3f,
    GF_BLUE_CRYSTAL_ITEM: 0x40,
    GF_CREST_ITEM: 0x41,
    GF_WAKKA_ITEM: 0x42,
    GF_NOCKMAAR_KEY_ITEM: 0x43,
    GF_NECKLACE_ITEM: 0x44,
    GF_POWDER_ITEM: 0x45,
    GF_SHOES_ITEM: 0x46
}

function asc(str) {
    let vals = [];
    for (let i = 0; i < str.length; i++)
        vals.push(str[i].charCodeAt())
    return vals;
}

// start with 0xf7, 0x35 for '"YOU HAVE THE ', then name below
// with presets 0x16 - sword, 0x20 - shield, 0x14 - magic, 0x5c - crystal
// finish with setting global flag, 0x29 for >, then 0xff
let swordPreset = [0xf7, 0x16];
let shieldPreset = [0xf7, 0x20];
let magicPreset = [0xf7, 0x14];
let crystalPreset = [0xf7, 0x5c];
let shortenedText = {
    GF_UPGRADED_WING_SWORD: [...asc("UPGRADED WING "), ...swordPreset],
    GF_LONG_SWORD: [...asc("LONG "), ...swordPreset],
    GF_BATTLE_SWORD: [...asc("BATTLE "), ...swordPreset],
    GF_FLAME_SWORD: [...asc("FLAME "), ...swordPreset],
    GF_DRAGON_SWORD: [...asc("DRAGON "), ...swordPreset],
    GF_WING_SWORD: [...asc("WING "), ...swordPreset],
    GF_DEVIL_EYE_SWORD: [...asc("DEVIL EYE "), ...swordPreset],
    GF_KAISER_SWORD: [...asc("KAISER "), ...swordPreset],
    GF_WONDER_SWORD: [...asc("WONDER "), ...swordPreset],
    GF_WOOD_SHIELD: [...asc("WOOD "), ...shieldPreset],
    GF_SMALL_SHIELD: [...asc("SMALL "), ...shieldPreset],
    GF_GOLD_SHIELD: [...asc("GOLD "), ...shieldPreset],
    GF_DRAGON_SHIELD: [...asc("DRAGON "), ...shieldPreset],
    GF_METAL_SHIELD: [...asc("METAL "), ...shieldPreset],
    GF_TAIL_SHIELD: [...asc("TAIL "), ...shieldPreset],
    GF_BATTLE_SHIELD: [...asc("BATTLE "), ...shieldPreset],
    GF_FURY_SHIELD: [...asc("FURY "), ...shieldPreset],
    GF_ACORN_MAGIC: [...asc("ACORN "), ...magicPreset],
    GF_BOMBARD_MAGIC: [...asc("BOMBARD "), ...magicPreset],
    GF_RENEW_MAGIC: [...asc("RENEW "), ...magicPreset],
    GF_THUNDER_MAGIC: [...asc("THUNDER "), ...magicPreset],
    GF_FIREFLOR_MAGIC: [...asc("FLOWING FIRE "), ...magicPreset],
    GF_CANE_MAGIC: asc('CANE'),
    GF_TERSTORM_MAGIC: [...asc("TERSTORM "), ...magicPreset],
    GF_HEALMACE_MAGIC: [...asc("HEALMACE "), ...magicPreset],
    GF_OCARINA_MAGIC: asc('OCARINA'),
    GF_FLEET_MAGIC: [...asc("FLEET "), ...magicPreset],
    GF_SPECTER_MAGIC: [...asc("SPECTER "), ...magicPreset],
    GF_HEALBALL_MAGIC: [...asc("HEALBALL "), ...magicPreset],
    GF_STATUE_ITEM: asc('STATUE'),
    GF_RING_ITEM: asc('RING'),
    GF_HERBS_ITEM: asc('HERBS'),
    GF_SCALE_ITEM: asc('SCALE'),
    GF_BRACELET_ITEM: asc('BRACELET'),
    GF_HANDCUFFS_KEY_ITEM: asc('HANDCUFFS KEY'),
    GF_FLUTE_ITEM: asc('FLUTE'),
    GF_RED_CRYSTAL_ITEM: [...asc("RED "), ...crystalPreset],
    GF_BLUE_CRYSTAL_ITEM: [...asc("BLUE "), ...crystalPreset],
    GF_CREST_ITEM: asc('CREST'),
    GF_WAKKA_ITEM: asc('WAKKA SEED'),
    GF_NOCKMAAR_KEY_ITEM: asc('NOCKMAAR KEY'),
    GF_NECKLACE_ITEM: asc('NECKLACE'),
    GF_POWDER_ITEM: asc('POWDER'),
    GF_SHOES_ITEM: asc('SHOES'),
}

let reqDefs = {
    bogarda_cave: [
        'GF_STATUE_ITEM'
    ],
    death_forest: [
        'GF_OCARINA_MAGIC',
        'bogarda_cave'
    ],
    daikini: [
        'GF_OCARINA_MAGIC',
        ['death_forest', 'GF_BRACELET_ITEM']
    ],
    lake_area: [
        ['death_forest', 'GF_WAKKA_ITEM'],
        ['mountains', 'GF_CREST_ITEM']
    ],
    muzh: [
        ['lake_area', 'GF_FLUTE_ITEM']
    ],
    mountains: [
        ['lake_area', 'GF_CREST_ITEM'],
        ['nockmaar', 'GF_POWDER_ITEM'],
        ['river_cave', 'GF_SPECTER_MAGIC']
    ],
    nockmaar: [
        ['GF_OCARINA_MAGIC', 'GF_SPECTER_MAGIC'],
        ['mountains', 'GF_POWDER_ITEM', 'GF_SPECTER_MAGIC']
    ],
    river_cave: [
        ['mountains', 'GF_SPECTER_MAGIC'],
        ['tir_asleen', 'GF_SHOES_ITEM']
    ],
    tir_asleen: [
        'GF_OCARINA_MAGIC',
        ['river_cave', 'GF_SHOES_ITEM'],
        ['nockmaar', 'GF_POWDER_ITEM']
    ],
    win: [
        ['nockmaar', 'GF_NOCKMAAR_KEY_ITEM', 'GF_CANE_MAGIC']
    ]
}

// text assumed to be in bank 1
// dont randomize long sword or healball chest
let slots = [
    // { // GF_LONG_SWORD - start with sword
    //     name: 'Nelwyn top-left house',
    //     reqs: [],
    //     textAddress: 0x0309,
    //     globalFlagReplacements: [conv(6, 0x2530)],
    // },
    { // GF_ACORN_MAGIC
        name: 'Nelwyn bottom-right house',
        reqs: [],
        textAddress: 0x019f,
        globalFlagReplacements: [conv(6, 0x2544)],
    },
    { // GF_WOOD_SHIELD
        name: 'Dew bottom-left house',
        reqs: [],
        textAddress: 0x07cf,
        globalFlagReplacements: [conv(6, 0x2562)],
    },
    { // GF_HEALMACE_MAGIC - replaced flags
        name: 'Dew Mayor\'s house',
        reqs: ['GF_WOOD_SHIELD'],
        textAddress: 0x05dc, // 0f
        globalFlagReplacements: [conv(6, 0x254c)], // 0a
    },
    { // GF_DRAGON_SWORD - replaced flags
        name: 'Dew bottom-right house 1',
        reqs: ['GF_SCALE_ITEM'],
        textAddress: 0x332d, // 6a
        globalFlagReplacements: [conv(6, 0x255a)], // 0d
    },
    { // GF_DRAGON_SHIELD
        name: 'Dew bottom-right house 2',
        reqs: ['GF_SCALE_ITEM'],
        textAddress: 0x332d,
        globalFlagReplacements: [conv(6, 0x255a)],
    },
    { // GF_SMALL_SHIELD
        name: 'Dew side cave',
        reqs: [],
        textAddress: 0x0d4c, // 26
        globalFlagReplacements: [conv(6, 0x25d4)], // 2f
    },
    { // GF_STATUE_ITEM
        name: 'Bogarda Forest',
        reqs: [],
        textAddress: 0x0bab, // 23
        globalFlagReplacements: [conv(6, 0x25d0)], // 2e
    },
    { // GF_BATTLE_SWORD
        name: 'Bogarda cave middle',
        reqs: ['bogarda_cave'],
        textAddress: 0x0b6f, // 22
        globalFlagReplacements: [conv(6, 0x25cc)], // 2d
    },
    { // GF_RING_ITEM
        name: 'Bogarda cave right',
        reqs: ['bogarda_cave'],
        textAddress: 0x0b3e, // 21
        globalFlagReplacements: [conv(6, 0x25c8)], // 2c
    },
    { // GF_FIREFLOR_MAGIC
        name: 'Bogarda boss',
        reqs: ['bogarda_cave'],
        textAddress: 0x0c71, // 25 (+2 due to setting bogarda flag)
        globalFlagReplacements: [conv(6, 0x25d8)], // 30
    },
    { // GF_HERBS_ITEM - replaced flags
        name: 'Death Forest',
        reqs: ['death_forest'],
        textAddress: 0x0f9c, // 2a
        globalFlagReplacements: [conv(6, 0x2584)], // 17
    },
    { // GF_FLAME_SWORD
        name: 'Mountain cave middle',
        reqs: ['death_forest'],
        textAddress: 0x12f5, // 30
        globalFlagReplacements: [conv(6, 0x25e8)], // 35
    },
    { // GF_SCALE_ITEM
        name: 'Mountain cave bottom',
        reqs: ['death_forest'],
        textAddress: 0x12d4, // 2f
        globalFlagReplacements: [conv(6, 0x25e4)], // 34
    },
    { // GF_GOLD_SHIELD
        name: 'Mountain cave double room',
        reqs: ['death_forest'],
        textAddress: 0x10bb, // 2c
        globalFlagReplacements: [conv(6, 0x25de)], // 32
    },
    { // GF_BRACELET_ITEM
        name: 'Mountain cave dragon',
        reqs: ['death_forest'],
        textAddress: 0x1333, // 31
        globalFlagReplacements: [conv(6, 0x258a)], // 18
    },
    { // GF_OCARINA_MAGIC
        name: 'Mountain cave Po',
        reqs: ['death_forest', 'GF_HERBS_ITEM'],
        textAddress: 0x1120, // 2d
        globalFlagReplacements: [conv(5, 0x2011)],
    },
    { // GF_CANE_MAGIC
        name: 'Entering Daikini',
        reqs: ['daikini'],
        textAddress: 0x146d, // 33
        globalFlagReplacements: [conv(7, 0x1ffb)],
    },
    { // GF_DEVIL_EYE_SWORD
        name: 'Daikini center',
        reqs: ['daikini'],
        textAddress: 0x2959, // 53
        globalFlagReplacements: [conv(6, 0x2626)], // 48
    },
    { // GF_HANDCUFFS_KEY_ITEM
        name: 'Daikini bottom left',
        reqs: ['daikini'],
        textAddress: 0x1698, // 35
        globalFlagReplacements: [conv(6, 0x25f2)], // 38
    },
    { // GF_NECKLACE_ITEM
        name: 'Daikini handcuffed guy',
        reqs: ['daikini', 'GF_HANDCUFFS_KEY_ITEM'],
        textAddress: 0x16bd, // 36
        globalFlagReplacements: [conv(5, 0x1f59)],
    },
    { // GF_WAKKA_ITEM - replaced flags
        name: 'Daikini wakka seed',
        reqs: ['daikini', 'GF_NECKLACE_ITEM'],
        textAddress: 0x1f80, // 43
        globalFlagReplacements: [conv(5, 0x1f1c)],
    },
    { // GF_FLUTE_ITEM
        name: 'Lake Bridge',
        reqs: ['lake_area'],
        textAddress: 0x1ee6, // 42
        globalFlagReplacements: [conv(7, 0x1fe6)],
    },
    { // GF_FLEET_MAGIC
        name: 'Confusing caves spiral',
        reqs: ['lake_area'],
        textAddress: 0x22fc, // 45
        globalFlagReplacements: [conv(6, 0x2608)], // 3f
    },
    { // GF_METAL_SHIELD
        name: 'Confusing caves middle',
        reqs: ['lake_area'],
        textAddress: 0x1b6b, // 3b
        globalFlagReplacements: [conv(6, 0x25f6)], // 39
    },
    { // GF_RENEW_MAGIC
        name: 'Confusing caves bottom',
        reqs: ['lake_area'],
        textAddress: 0x1c8f, // 3d
        globalFlagReplacements: [conv(6, 0x25fc)], // 3b
    },
    { // GF_TERSTORM_MAGIC
        name: 'Confusing caves right',
        reqs: ['lake_area'],
        textAddress: 0x1ce7, // 3e
        globalFlagReplacements: [conv(6, 0x2600)], // 3c
    },
    { // GF_BOMBARD_MAGIC
        name: 'Muzh boss',
        reqs: ['muzh'],
        textAddress: 0x1fe1, // 44 (+2 to set muzh flag)
        globalFlagReplacements: [conv(7, 0x36f7)],
    },
    { // GF_BLUE_CRYSTAL_ITEM
        name: 'Towers right',
        reqs: ['muzh'],
        textAddress: 0x246e, // 48
        globalFlagReplacements: [conv(5, 0x2099)],
    },
    { // GF_RED_CRYSTAL_ITEM
        name: 'Towers left',
        reqs: ['muzh', 'GF_BLUE_CRYSTAL_ITEM'],
        textAddress: 0x256c, // 49
        globalFlagReplacements: [conv(5, 0x20aa)],
    },
    { // GF_CREST_ITEM - replaced flags
        name: 'Towers crest',
        reqs: ['muzh', 'GF_RED_CRYSTAL_ITEM'],
        textAddress: 0x2644, // 4a
        globalFlagReplacements: [],
    },
    { // GF_SPECTER_MAGIC
        name: 'Mountains top-left',
        reqs: ['mountains'],
        textAddress: 0x2836, // 4d
        globalFlagReplacements: [conv(6, 0x2610)], // 42
    },
    { // GF_TAIL_SHIELD
        name: 'Mountains top-right',
        reqs: ['mountains'],
        textAddress: 0x28fa, // 50
        globalFlagReplacements: [conv(6, 0x261a)], // 45
    },
    // { // GF_HEALBALL_MAGIC
    //     name: 'Mountains blocking chest',
    //     reqs: ['mountains'],
    //     textAddress: 0x2890, // 4e
    //     globalFlagReplacements: [conv(6, 0x2614)], // 43
    // },
    { // GF_THUNDER_MAGIC - replaced flags
        name: 'Mountains house',
        reqs: ['mountains'],
        textAddress: 0x27bb, // 4b
        globalFlagReplacements: [conv(6, 0x25a4)], // 1e
    },
    { // GF_SHOES_ITEM
        name: 'River cave man',
        reqs: ['river_cave'],
        textAddress: 0x2a57, // 55
        globalFlagReplacements: [conv(6, 0x258e)], // 19
    },
    { // GF_WING_SWORD
        name: 'Bridge cave',
        reqs: ['river_cave'],
        textAddress: 0x1ba0, // 3c
        globalFlagReplacements: [conv(5, 0x2027)],
    },
    { // GF_NOCKMAAR_KEY_ITEM
        name: 'Tir Asleen old woman house',
        reqs: ['nockmaar'],
        textAddress: 0x2cf0, // 5c
        globalFlagReplacements: [conv(6, 0x2568)], // 10
    },
    { // GF_KAISER_SWORD
        name: 'Tir Asleen Castle before boss',
        reqs: ['tir_asleen'],
        textAddress: 0x2d99, // 60
        globalFlagReplacements: [conv(5, 0x1f8a)],
    },
    { // GF_POWDER_ITEM
        name: 'Tir Asleen Castle after boss',
        reqs: ['tir_asleen'],
        textAddress: 0x2f95, // 64
        globalFlagReplacements: [conv(6, 0x043b), conv(6, 0x0456)],
    },
    { // GF_WONDER_SWORD
        name: 'Tir Asleen Castle top left',
        reqs: ['tir_asleen'],
        textAddress: 0x292e, // 51
        globalFlagReplacements: [conv(6, 0x261e)], // 46
    },
    { // GF_BATTLE_SHIELD
        name: 'Tir Asleen Castle top right',
        reqs: ['tir_asleen'],
        textAddress: 0x2948, // 52
        globalFlagReplacements: [conv(6, 0x2622)], // 47
    },
    { // GF_FURY_SHIELD
        name: 'Cave between Tir Asleen and Nockmaar',
        reqs: ['nockmaar'],
        textAddress: 0x28c3, // 4f
        globalFlagReplacements: [conv(6, 0x2644)], // 55
    },
    { // GF_UPGRADED_WING_SWORD
        name: 'Nockmaar Castle Abang',
        reqs: ['nockmaar', 'GF_WING_SWORD'],
        textAddress: 0x322b, // 69
        globalFlagReplacements: [conv(5, 0x2042)],
    },
]

function randomize(rom, rng, opts) {
    let r_slots;
    let spheres;
    let unobtainable = [];

    // randomize slots
    while (true) {
        r_slots = {};
        for (let i = 0; i < slots.length; i++) {
            if (opts.ocarina_start && slots[i].name === 'Mountain cave Po')
                continue;
            r_slots[slots[i].name] = slots[i];
        }

        // randomly fill slots with treasure
        let globalFlagList = Object.keys(globalFlags);
        let available_treasures = Object.keys(globalFlags);
        if (opts.ocarina_start) {
            globalFlagList.splice(globalFlagList.indexOf('GF_OCARINA_MAGIC'), 1);
            available_treasures.splice(available_treasures.indexOf('GF_OCARINA_MAGIC'), 1)
        }

        let available_slots = Object.keys(r_slots);
        for (let i = 0; i < globalFlagList.length; i += 1) {
            let chosen_treasure = Math.floor(rng() * available_treasures.length);
            let chosen_slot = Math.floor(rng() * available_slots.length);
            r_slots[available_slots[chosen_slot]].treasure = available_treasures[chosen_treasure];
            available_treasures.splice(chosen_treasure, 1);
            available_slots.splice(chosen_slot, 1);
        }

        // validate logic
        let outstanding_places = Object.keys(r_slots);
        let outstanding_misc_reqs = Object.keys(reqDefs);
        let gotten_items = [];
        if (opts.ocarina_start)
            gotten_items.push('GF_OCARINA_MAGIC');
        spheres = [];

        while (true) {
            let reached_locations_this_sphere = [];
            let reached_misc;

            while (true) {
                reached_misc = [];
                for (let i = 0; i < outstanding_misc_reqs.length; i += 1) {
                    let place_reqs = reqDefs[outstanding_misc_reqs[i]];
                    if (place_reqs.length === 0) {
                        reached_locations_this_sphere.push(outstanding_misc_reqs[i]);
                        continue;
                    }
            
                    // loop through 1 of many possible reqs
                    for (let j = 0; j < place_reqs.length; j += 1) {
                        let curr_req = place_reqs[j];
                        let meet_all_curr_reqs = true;
                
                        // loop through items required
                        if (typeof curr_req === 'string') {
                            if (gotten_items.indexOf(curr_req) === -1)
                            meet_all_curr_reqs = false;
                        } else if (curr_req !== null) {
                            for (let k = 0; k < curr_req.length; k += 1) {
                                if (gotten_items.indexOf(curr_req[k]) === -1) {
                                    meet_all_curr_reqs = false;
                                    break;
                                }
                            }
                        }
                
                        if (meet_all_curr_reqs) {
                            gotten_items.push(outstanding_misc_reqs[i]);
                            reached_misc.push(outstanding_misc_reqs[i]);
                            break;
                        }
                    }
                }
                if (reached_misc.length === 0)
                    break;
                for (let i = 0; i < reached_misc.length; i++)
                    outstanding_misc_reqs.splice(outstanding_misc_reqs.indexOf(reached_misc[i]), 1);
            }

            for (let i = 0; i < outstanding_places.length; i += 1) {
                let place_reqs = r_slots[outstanding_places[i]].reqs;

                let fulfills_reqs = true;
        
                // loop through reqs
                if (place_reqs.length > 0) {
                    for (let j = 0; j < place_reqs.length; j += 1) {
                        if (gotten_items.indexOf(place_reqs[j]) === -1) {
                            fulfills_reqs = false;
                            break;
                        }
                    }
                }
        
                if (fulfills_reqs)
                    reached_locations_this_sphere.push(outstanding_places[i]);
            }

            // copy reached items to gotten items, or bail if nothing reachable this sphere
            if (reached_locations_this_sphere.length === 0) {
                break;
            } else {
                // add sphere details
                let sphere_locs = [];
                for (let i = 0; i < reached_locations_this_sphere.length; i += 1) {
                    if (r_slots[reached_locations_this_sphere[i]] !== undefined)
                        sphere_locs.push([reached_locations_this_sphere[i], r_slots[reached_locations_this_sphere[i]].treasure]);
                }
                sphere_locs.sort((a, b) => (a[0] > b[0]) ? 1 : -1);
                spheres.push(sphere_locs);

                for (let i = 0; i < reached_locations_this_sphere.length; i += 1) {
                    let place = reached_locations_this_sphere[i];
                    if (r_slots[place] !== undefined) {
                        outstanding_places.splice(outstanding_places.indexOf(place), 1);
                        let gotten_item = r_slots[place].treasure;
                        gotten_items.push(gotten_item);
                    }
                }
            }
        }

        // success condition
        if (gotten_items.indexOf('win') !== -1) {
            for (let i = 0; i < outstanding_places.length; i += 1) {
                unobtainable.push([outstanding_places[i], r_slots[outstanding_places[i]].treasure]);
              }
              unobtainable.sort((a, b) => (a[0] > b[0]) ? 1 : -1);
            break;
        }
    }

    // shorten some complex npc flag checking first
    splice(rom, conv(6, 0x254b), 2, globalFlags.GF_HEALMACE_MAGIC, 0x10, globalFlags.GF_WOOD_SHIELD, 0x0f, 0x0e); // 0a
    splice(rom, conv(6, 0x2559), 2, globalFlags.GF_DRAGON_SWORD, 0x3a, globalFlags.GF_SCALE_ITEM, 0x6a, 0x6f); // 0d
    splice(rom, conv(6, 0x2579), 2, globalFlags.GF_CREST_ITEM, 0x72, globalFlags.GF_RED_CRYSTAL_ITEM, 0x4a, 0x46); // 16
    splice(rom, conv(6, 0x2583), 1, globalFlags.GF_HERBS_ITEM, 0x1b, 0x2a); // 17
    splice(rom, conv(6, 0x259b), 2, globalFlags.GF_WAKKA_ITEM, 0x39, globalFlags.GF_NECKLACE_ITEM, 0x38, 0x37); // 1d
    splice(rom, conv(6, 0x25a3), 1, globalFlags.GF_THUNDER_MAGIC, 0x4c, 0x4b); // 1e
    
    // mutate based on placement
    for (let [k, v] of Object.entries(r_slots)) {
        if (k === 'Dew bottom-right house 2')
            continue;

        // global flag replacements
        let globalFlag = globalFlags[v.treasure];
        for (let i = 0; i < v.globalFlagReplacements.length; i++) {
            rom[v.globalFlagReplacements[i]] = globalFlag;
        }

        // setrooms
        let text_extras = [];
        if (k === 'Bogarda boss')
            text_extras = [0xf5, 0x02, 0x02];
        if (k === 'Tir Asleen Castle after boss')
            text_extras = [0xf5, 0x1c, 0x02];
        if (k === 'Towers crest')
            text_extras = [0xf5, 0x1e, 0x1c];

        // text replacements
        if (k === 'Dew bottom-right house 1') {
            let text_replacement1 = shortenedText[v.treasure];
            let text_replacement2 = shortenedText[r_slots['Dew bottom-right house 2'].treasure];
            let globalFlag2 = globalFlags[r_slots['Dew bottom-right house 2'].treasure];
            splice(
                rom, conv(1, v.textAddress), 0xf7, 0x35, 0xfe, ...text_replacement1, ...asc(" AND"), 
                0xfe, ...text_replacement2, 0x29, 0xfa, globalFlag, 0xfa, globalFlag2, 0xfb, 0xff);
        } else {
            let text_replacement = shortenedText[v.treasure];
            splice(rom, conv(1, v.textAddress), 0xf7, 0x35, 0xfe, ...text_replacement, 0x29, 0xfa, globalFlag, 0xfb, ...text_extras, 0xff);
        }
    }

    // replace level requirements
    let expOffset = conv(7, 0x121b);
    for (let i = 0; i < 16; i++) {
        let levelOffset = expOffset + i*5;
        let expReq = rom[levelOffset]*10000 + rom[levelOffset+1]*1000 + rom[levelOffset+2]*100 + rom[levelOffset+3]*10 + rom[levelOffset+4];
        let newExpReq = parseFloat(opts.exp_multiplier) * expReq;
        rom[levelOffset] = Math.trunc(newExpReq/10000);
        rom[levelOffset+1] = Math.trunc((newExpReq/1000)%10);
        rom[levelOffset+2] = Math.trunc((newExpReq/100)%10);
        rom[levelOffset+3] = Math.trunc((newExpReq/10)%10);
        rom[levelOffset+4] = Math.trunc((newExpReq)%10);
    }

    // replace for no flash hack
    if (opts.no_flash) {
        for (let i = 0; i < noFlashAddresses.length; i ++)
            splice(rom, noFlashAddresses[i], 0xea, 0xea, 0xea);
    }

    // replace for fast text
    if (opts.fast_text) {
        splice(rom, conv(6, 0x285c), 0x4c, 0x66, 0xa8); // jmp $a866, 6:2866
    }

    // replace for fast movement
    if (opts.fast_movement) {
        splice(
            rom, conv(6, 0x06e6),
            0x34, 0x06, 0x00, 0xfa, 0xcc, 0xfa, 0x00, 0x06, 0x11, 0xef,
            0xfd, 0xfe, 0x00, 0x01, 0x02, 0x01, 0x00, 0xfe, 0x03, 0xfc,
            0x00, 0xfa, 0xcc, 0xfa, 0x00, 0x06, 0x34, 0x06, 0x60, 0xa0,
            0x00, 0x01, 0x02, 0x01, 0x00, 0xfe, 0xfd, 0xfe, 0x03, 0xfc
        )
    }

    // starting ocarina
    if (opts.ocarina_start) {
        splice(rom, conv(7, 0x1e8a), 0x20, 0x00, 0xbf); // jsr $bf00, 6:3f00
        splice(
            rom, conv(6, 0x3f00), 
            0xa9, 0x02, // lda #$02
            0x8d, 0x06, 0x06, // sta $0606
            0xa9, 0xe0, // lda #$e0
            0x8d, 0x00, 0x06, // sta $0600
            0xa9, 0x07, // lda #$07
            0x8d, 0x01, 0x06, // sta $0601
            0x4c, 0xb2, 0xde // jmp $deb2
        );
    }

    // dont remove crest item
    rom[conv(1, 0x2ee8)] = 0xff;

    // dont set crest when beating kael
    rom[conv(1, 0x377e)] = 0x05;

    // set global flag - bogarda beat and muzh beat
    splice(rom, conv(1, 0xc6f), 0xfa, 0x4e);
    splice(rom, conv(1, 0x1fdf), 0xfa, 0x4f);

    // check global flag - bogarda and muzh bosses
    rom[conv(7, 0x3678)] = 0x4e;
    rom[conv(7, 0x36f7)] = 0x4f;

    // never hide the old woman above tir asleen
    splice(rom, conv(5, 0x1fd9), 0xed, 0x9e);

    // replace bogarda bridge and muzh wall requirement
    rom[conv(6, 0x05a7)] = 0x4e; // 4e is new bogarda flag
    rom[conv(6, 0x049e)] = 0x4f; // 4f is new muzh flag

    return [spheres, unobtainable, rom]
}