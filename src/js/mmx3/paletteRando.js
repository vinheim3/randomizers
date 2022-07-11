const snes2rgb = function(snesCol) {
    let r = snesCol & 0x1f;
    let g = (snesCol>>5) & 0x1f;
    let b = (snesCol>>10) & 0x1f;
    return [r/0x1f, g/0x1f, b/0x1f];
}

const rgb2snes = function(r, g, b) {
    return ((b & 0x1f) << 10) + ((g & 0x1f) << 5) + (r & 0x1f);
}

const rgb2hsl = function(r, g, b) {
    let maxColVal = Math.max(r, g, b);
    let minColVal = Math.min(r, g, b);
    let maxCol = 'r';
    if (g == maxCol) maxCol = 'g';
    if (b == maxCol) maxCol = 'b';
    let delta = maxColVal - minColVal;

    let lightness = (maxColVal + minColVal) / 2;
    let saturation = 0;
    if (delta !== 0) {
        saturation = delta / (1 - Math.abs(2 * lightness - 1));
    }
    let hue;
    if (delta === 0) {
        hue = 0;
    } else if (maxCol === 'r') {
        hue = 60 * (((g - b) / delta) % 6);
    } else if (maxCol === 'g') {
        hue = 60 * (((b - r) / delta) + 2);
    } else {
        hue = 60 * (((r - g) / delta) + 4);
    }
    if (hue < 360) hue += 360;
    return [hue, saturation, lightness];
}

const hsl2rgb = function(h, s, l) {
    let C = (1 - Math.abs(2 * l - 1)) * s;
    let X = C * (1 - Math.abs( ((h / 60) % 2) - 1 ));
    let m = l - C/2;
    let r, g, b;
    if (h < 60) {r = C, g = X, b = 0}
    else if (h < 120) {r = X, g = C, b = 0}
    else if (h < 180) {r = 0, g = C, b = X}
    else if (h < 240) {r = 0, g = X, b = C}
    else if (h < 300) {r = X, g = 0, b = C}
    else {r = C, g = 0, b = X}
    return [
        (r+m) * 0x1f,
        (g+m) * 0x1f,
        (b+m) * 0x1f,
    ];
}

function paletteRandomize(rom, rng, opts, m) {
    // Randomize palettes
    if (opts.chaos_palettes) {
        let newPalettes = new Array(palAddrs.length);
        let palPool = [];
        for (let addr of palAddrs) {
            let start = conv(0xc, addr);
            palPool.push(rom.slice(start, start+0x20));
        }
        let unassignedPals = [];
        for (let i = 0; i < palAddrs.length; i++) unassignedPals.push(i);
        while (unassignedPals.length !== 0) {
            let slotIdx = Math.floor(rng() * unassignedPals.length);
            let palsIdx = Math.floor(rng() * palPool.length);
            newPalettes[unassignedPals[slotIdx]] = palPool[palsIdx];
            unassignedPals.splice(slotIdx, 1);
            palPool.splice(palsIdx, 1);
        }
        // mutate
        for (let i = 0; i < palAddrs.length; i++) {
            let palAddr = palAddrs[i];
            let start = conv(0xc, palAddr);
            let pals = newPalettes[i];
            for (let j = 0; j < 0x20; j++) {
                rom[start++] = pals[j];
            }
        }
    }

    if (opts.hsl_palettes) {
        for (let palAddr of palAddrs) {
            let start = conv(0xc, palAddr);
            let hOffs = rng() * 360;
            let sMult = rng()+0.5;
            let lMult = rng()+0.5;
            for (let i = 0; i < 0x20; i += 2) {
                let snesCol = readWord(rom, start+i);
                let [h, s, l] = rgb2hsl(...snes2rgb(snesCol));
                h = (h + hOffs) % 360;
                s *= sMult;
                l *= lMult;
                let newSnesCol = rgb2snes(...hsl2rgb(h, s, l));
                writeWord(rom, start+i, newSnesCol);
            }
        }
    }
}