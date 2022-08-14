const layersOrder = [
    { name: 'Gender', number: 2 },
    { name: 'Background', number: 4 },
    { name: 'Skin', number: 4 },
    { name: 'Fighter', number: 5 },
    { name: 'Face', number: 4 },
    { name: 'Clothes', number: 6 },
    { name: 'Accessories', number: 4 },
    { name: 'Weapon', number: 3 },
    { name: 'Head', number: 4 },
    { name: 'Mouth', number: 4 },
    { name: 'Eyes', number: 6 },
    { name: 'Face Accessories', number: 3 },
];
  
const format = {
    width: 480,
    height: 480
};

const rarity = [
    { key: "", val: "original" },
    { key: "_r", val: "rare" },
    { key: "_sr", val: "super rare" },
];

const defaultEdition = 11;

module.exports = { layersOrder, format, rarity, defaultEdition };