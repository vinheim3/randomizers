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
