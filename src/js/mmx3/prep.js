function prep(rom, rng, opts, m) {
    // Make the entry for Crush Crawfish take on its own palette slot, and tile data slot
    start = getDynamicSpriteData(rom, STAGE_CRUSH_CRAWFISH, 0, 3);
    writeWord(rom, start+1, 0x1400); // separate tile data dest
    rom[start+5] = 0x40;

    // Give swappable rider armour items a slot that doesn't conflict with eg health bar
    setPaletteSlot(rom, STAGE_GRAVITY_BEETLE, 5, 3, 0x30);
    setPaletteSlot(rom, STAGE_TOXIC_SEAHORSE, 4, 2, 0x30);
    setPaletteSlot(rom, STAGE_CRUSH_CRAWFISH, 0, 3, 0x30);

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
}