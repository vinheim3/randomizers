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

const ENT_RIDE_ARMOUR_HOLDER = [MT_ENEMY, ENEMYID_HANGERTER];
const ENT_CAPSULE = [MT_ENEMY, ENEMYID_CAPSULE];
const ENT_RIDE_ARMOUR_ITEM = [MT_ITEM, ITEMID_RIDE_ARMOUR_ITEM];
const ENT_HEART_TANK = [MT_ITEM, ITEMID_HEART_TANK];
const ENT_SUBTANK = [MT_ITEM, ITEMID_SUBTANK];

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
