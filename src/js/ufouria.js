let conv = function(bank, addr) {
  return bank*0x2000+addr+0x10;
}

let fightSlots = [
  ['freeonFight', conv(0x7, 0x1014), null],
  ['shadesFight', conv(0x7, 0x1060), ['swim']],
  ['gilFight', conv(0x7, 0x10ac), ['suction', 'swim']]
];

// reqs - suction, gil, bombs, ice, bopsSpecial, swim, freeon, shades
let chestSlots = [
  ['snowArea_byChimney', ['suction', 'gil']],
  ['startingArea_belowWater', ['gil']],
  ['darkArea_inPit', ['suction', 'gil', 'bombs']],
  ['westCliffsArea_floatingIslandTopCave', ['suction', 'gil', 'bombs']],
  ['lavaChallenge_acrossIce', ['gil', 'bombs', 'freeon', 'ice', 'bopsSpecial']],
  ['darkArea_pastMiniboss', ['suction', 'gil', 'bombs']],
  ['westCliffsArea_hiddenDoor', ['suction', 'swim']],
  ['startingArea_pastMiniboss', ['swim']],
  ['snowArea_deepestRoom', ['suction', 'freeon', 'gil']],
  ['belowCloudsArea_shadesHover', ['swim', 'shades']],
  ['faucetArea_pastMiniboss', ['gil']],
  ['cloudsArea_pastMiniboss', ['swim', 'shades']],
  ['startingArea_hill', null],
  ['belowCloudsArea_byLongDrop', ['swim']],
  ['caveArea_alcoveNearPool', ['swim']],
  ['caveArea_inPool', ['gil']],
  ['faucetArea_inWaterColumn', ['gil']],
  ['caveArea_pastLavaHopping', ['freeon', 'ice']],
  ['darkArea_byLight', ['suction', 'gil', 'bombs']],
  ['lavaChallenge_climbingIce', ['gil', 'bombs', 'freeon', 'ice', 'shades']],
  ['cloudsArea_startingAfterSpring', ['swim', 'shades'], ['swim', 'suction']],
  ['faucetArea_aboveFaucetCave', ['freeon', 'suction'], ['gil', 'bombs', 'suction']],
  ['westCliffsArea_inBigWaterRoom', ['suction', 'gil']],
  ['finalBossCorridor', ['suction'], ['swim']],
]

let treasures = [
  {
    name: 'freeon',
    text: 0x01,
    globalFlag: 0x08,
    chrBank: null,
    spriteSpecIdx: 0x30,
    palettesIdx: 0x01
  },
  {
    name: 'shades',
    text: 0x03,
    globalFlag: 0x09,
    chrBank: null,
    spriteSpecIdx: 0x30,
    palettesIdx: 0x01
  },
  {
    name: 'gil',
    text: 0x05,
    globalFlag: 0x0a,
    chrBank: null,
    spriteSpecIdx: 0x30,
    palettesIdx: 0x01
  },
  {
    name: 'heartContainer1',
    text: 0x16,
    globalFlag: 0x10,
    chrBank: 0x78,
    spriteSpecIdx: 0x2c,
    palettesIdx: 0x02
  },
  {
    name: 'heartContainer2',
    text: 0x16,
    globalFlag: 0x11,
    chrBank: 0x78,
    spriteSpecIdx: 0x2c,
    palettesIdx: 0x02
  },
  {
    name: 'heartContainer3',
    text: 0x16,
    globalFlag: 0x12,
    chrBank: 0x78,
    spriteSpecIdx: 0x2c,
    palettesIdx: 0x02
  },
  {
    name: 'heartContainer4',
    text: 0x16,
    globalFlag: 0x13,
    chrBank: 0x78,
    spriteSpecIdx: 0x2c,
    palettesIdx: 0x02
  },
  {
    name: 'blueKey',
    text: 0x20,
    globalFlag: 0x05,
    chrBank: 0x78,
    spriteSpecIdx: 0x33,
    palettesIdx: 0x06
  },
  {
    name: 'greenKey',
    text: 0x21,
    globalFlag: 0x06,
    chrBank: 0x78,
    spriteSpecIdx: 0x33,
    palettesIdx: 0x05
  },
  {
    name: 'redKey',
    text: 0x22,
    globalFlag: 0x07,
    chrBank: 0x78,
    spriteSpecIdx: 0x33,
    palettesIdx: 0x04
  },
  {
    name: 'bopsSpecial',
    text: 0x18,
    globalFlag: 0x39,
    chrBank: 0x78,
    spriteSpecIdx: 0x2d,
    palettesIdx: 0x00
  },
  {
    name: 'ice',
    text: 0x1e,
    globalFlag: 0x01,
    chrBank: 0x79,
    spriteSpecIdx: 0x2e,
    palettesIdx: 0x00
  },
  {
    name: 'shadesSpecial',
    text: 0x1d,
    globalFlag: 0x02,
    chrBank: 0x7b,
    spriteSpecIdx: 0x2d,
    palettesIdx: 0x02
  },
  {
    name: 'bombs',
    text: 0x1f,
    globalFlag: 0x03,
    chrBank: 0x79,
    spriteSpecIdx: 0x2d,
    palettesIdx: 0x03
  },
  {
    name: 'suction',
    text: 0x17,
    globalFlag: 0x04,
    chrBank: 0x7b,
    spriteSpecIdx: 0x2c,
    palettesIdx: 0x00
  },
  {
    name: 'saveCrystal',
    text: 0x13,
    globalFlag: 0x30,
    chrBank: 0x7a,
    spriteSpecIdx: 0x2d,
    palettesIdx: 0x00
  },
  {
    name: 'map',
    text: 0x14,
    globalFlag: 0x31,
    chrBank: 0x7a,
    spriteSpecIdx: 0x2c,
    palettesIdx: 0x03
  },
  {
    name: 'compass',
    text: 0x15,
    globalFlag: 0x32,
    chrBank: 0x7a,
    spriteSpecIdx: 0x2f,
    palettesIdx: 0x02
  },
  {
    name: 'powerRing1',
    text: 0x19,
    globalFlag: 0x33,
    chrBank: 0x78,
    spriteSpecIdx: 0x32,
    palettesIdx: 0x06
  },
  {
    name: 'powerRing2',
    text: 0x19,
    globalFlag: 0x34,
    chrBank: 0x78,
    spriteSpecIdx: 0x32,
    palettesIdx: 0x05
  },
  {
    name: 'powerRing3',
    text: 0x19,
    globalFlag: 0x35,
    chrBank: 0x78,
    spriteSpecIdx: 0x32,
    palettesIdx: 0x04
  },
  {
    name: 'potion0',
    text: 0x1a,
    globalFlag: 0x36,
    chrBank: 0x78,
    spriteSpecIdx: 0x2f,
    palettesIdx: 0x06
  },
  {
    name: 'waterOfLife',
    text: 0x1b,
    globalFlag: 0x37,
    chrBank: 0x78,
    spriteSpecIdx: 0x2f,
    palettesIdx: 0x04
  },
  {
    name: 'insight',
    text: 0x1c,
    globalFlag: 0x38,
    chrBank: 0x78,
    spriteSpecIdx: 0x31,
    palettesIdx: 0x06
  },
  {
    name: 'potion1',
    text: 0x1a,
    globalFlag: 0x36,
    chrBank: 0x78,
    spriteSpecIdx: 0x2f,
    palettesIdx: 0x06
  },
  {
    name: 'potion2',
    text: 0x1a,
    globalFlag: 0x36,
    chrBank: 0x78,
    spriteSpecIdx: 0x2f,
    palettesIdx: 0x06
  },
  {
    name: 'potion3',
    text: 0x1a,
    globalFlag: 0x36,
    chrBank: 0x78,
    spriteSpecIdx: 0x2f,
    palettesIdx: 0x06
  },
]

let textPageContinuesToReplace = [
  conv(0x01, 0x0fa4), // seeing freeon
  conv(0x01, 0x1047), // beating freeon
  conv(0x01, 0x10d3), // seeing shades
  conv(0x01, 0x114c), // beating shades
  conv(0x01, 0x11f8), // seeing gil
  conv(0x01, 0x12b1), // beating gil
  conv(0x01, 0x1577), // save crystal
  conv(0x01, 0x15c9), // map
  conv(0x01, 0x1613), // compass
  conv(0x01, 0x165a), // heart container
  conv(0x01, 0x16be), // suction cup
  conv(0x01, 0x1727), // bop's special
  conv(0x01, 0x1794), // power ring
  conv(0x01, 0x17e3), // medicine
  conv(0x01, 0x182c), // water of life
  conv(0x01, 0x188b), // insight
  conv(0x01, 0x18e9), // shade's special
  conv(0x01, 0x1964), // freeon's special
  conv(0x01, 0x19d6), // gil's special
]

function randomize(rom, rng, opts) {
  // build slots to mutate
  let r_slots = {};

  for (let i = 0; i < 3; i += 1) {
    r_slots[fightSlots[i][0]] = {
      text: conv(0xa, 0x11d1+i),
      globalFlag: [conv(0xa, 0x120a+i), fightSlots[i][1]],

      treasure: null,
      reqs: fightSlots[i].slice(2)
    }
  }

  for (let i = 0; i < chestSlots.length; i += 1) {
    r_slots[chestSlots[i][0]] = {
      text: conv(0xa, 0x1dbb+i),
      globalFlag: [conv(0x7, 0x048e+i*2)],

      chrBank: conv(0x7, 0x048f+i*2),
      spriteSpecIdx: conv(0xa, 0x1d76+i*2),
      palettesIdx: conv(0xa, 0x1d77+i*2),

      treasure: null,
      reqs: chestSlots[i].slice(1)
    }
  }

  // get treasure details and names
  let treasureMap = {};
  let treasureNames = [];
  for (let i = 0; i < treasures.length; i += 1) {
    treasureMap[treasures[i].name] = treasures[i];
    treasureNames.push(treasures[i].name);
  }

  // loop until rom randomized
  let spheres = [];
  let unobtainable = [];

  while (true) {
    // clear current attached treasures
    for (let [k, v] of Object.entries(r_slots)) {
      r_slots[k].treasure = null;
    }

    // randomly fill slots with treasure
    let available_treasures = [...treasureNames];
    let available_slots = Object.keys(r_slots);
    for (let i = 0; i < treasureNames.length; i += 1) {
      let chosen_treasure = Math.floor(rng() * available_treasures.length);
      let chosen_slot = Math.floor(rng() * available_slots.length);
      r_slots[available_slots[chosen_slot]].treasure = available_treasures[chosen_treasure];
      available_treasures.splice(chosen_treasure, 1);
      available_slots.splice(chosen_slot, 1);
    }

    // validate logic
    let outstanding_places = Object.keys(r_slots);
    let gotten_items = [];
    spheres = [];

    // loop until all items gotten, or none reached
    while (true) {
      let reached_locations_this_sphere = [];

      // loop through outstanding places this sphere
      for (let i = 0; i < outstanding_places.length; i += 1) {
        let place_reqs = r_slots[outstanding_places[i]].reqs;

        // loop through 1 of many possible reqs
        for (let j = 0; j < place_reqs.length; j += 1) {
          let curr_req = place_reqs[j];
          let meet_all_curr_reqs = true;

          // loop through items required
          if (curr_req !== null) {
            for (let k = 0; k < curr_req.length; k += 1) {
              if (gotten_items.indexOf(curr_req[k]) === -1) {
                meet_all_curr_reqs = false;
                break;
              }
            }
          }

          if (meet_all_curr_reqs) {
            reached_locations_this_sphere.push(outstanding_places[i]);
            break;
          }
        }
      }

      // copy reached items to gotten items, or bail if nothing reachable this sphere
      if (reached_locations_this_sphere.length === 0) {
        break;
      } else {
        // add sphere details
        let sphere_locs = [];
        for (let i = 0; i < reached_locations_this_sphere.length; i += 1)
          sphere_locs.push([reached_locations_this_sphere[i], r_slots[reached_locations_this_sphere[i]].treasure]);
        sphere_locs.sort((a, b) => (a[0] > b[0]) ? 1 : -1);
        spheres.push(sphere_locs);

        for (let i = 0; i < reached_locations_this_sphere.length; i += 1) {
          let place = reached_locations_this_sphere[i];
          outstanding_places.splice(outstanding_places.indexOf(place), 1);
          let gotten_item = r_slots[place].treasure;
          if (gotten_item === 'freeon' || gotten_item === 'gil')
            gotten_items.push('swim');
          gotten_items.push(gotten_item);
        }
      }
    }

    // success condition
    let successfully_randomized = false;
    if (gotten_items.indexOf('blueKey') !== -1 &&
      gotten_items.indexOf('greenKey') !== -1 &&
      gotten_items.indexOf('redKey') !== -1 &&
      (gotten_items.indexOf('freeon') !== -1 || gotten_items.indexOf('suction') !== -1))
      successfully_randomized = true;

    if (!successfully_randomized)
      continue;

    // gen unobtainable sphere
    for (let i = 0; i < outstanding_places.length; i += 1) {
      unobtainable.push([outstanding_places[i], r_slots[outstanding_places[i]].treasure]);
    }
    unobtainable.sort((a, b) => (a[0] > b[0]) ? 1 : -1);
    break;
  }

  // mutate slots
  for (let [k, v] of Object.entries(r_slots)) {
    let slot_treasure = treasureMap[r_slots[k].treasure];
    rom[v.text] = slot_treasure.text;
    for (let i = 0; i < v.globalFlag.length; i += 1)
      rom[v.globalFlag[i]] = slot_treasure.globalFlag;
    if (v.chrBank !== undefined) {
      if (slot_treasure.chrBank !== null)
        rom[v.chrBank] = slot_treasure.chrBank;
      rom[v.spriteSpecIdx] = slot_treasure.spriteSpecIdx;
      rom[v.palettesIdx] = slot_treasure.palettesIdx;
    }
  }

  // mutate qol - shorter text
  if (opts.romType !== 'JP') {
    for (let i = 0; i < textPageContinuesToReplace.length; i += 1)
      rom[textPageContinuesToReplace[i]] = 0xff;
  }

  // todo: mutate qol - no dialog entities
  // bug: this prevents platforms from appearing
  // rom[conv(0x0b, 0x0ffd)] = 0x60;

  // return spheres with loc + items details, and rom
  return [spheres, unobtainable, rom];
}