const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const console = require("console");
const { layersOrder, format, rarity } = require("./config.js");

const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");

if (!process.env.PWD) {
  process.env.PWD = process.cwd();
}

const testStatus = "test";

const buildDir =
  testStatus == "test"
    ? `${process.env.PWD}/test-build`
    : `${process.env.PWD}/build`;
const jsonDir =
  testStatus == "test"
    ? `${process.env.PWD}/test-json`
    : `${process.env.PWD}/json`;
const metDataFile = "_metadata.json";
const layersDir =
  testStatus == "test"
    ? `${process.env.PWD}/test-layers/layers-male`
    : `${process.env.PWD}/layers/layers-male`;

let metadata = [];
let attributes = [];
let hash = [];
let decodedHash = [];
let gender = 1; //1:male, 2:female
const Exists = new Map();

const addRarity = (_str) => {
  let itemRarity;

  rarity.forEach((r) => {
    if (_str.includes(r.key)) {
      itemRarity = r.val;
    }
  });

  return itemRarity;
};

const cleanName = (_str) => {
  let name = _str.slice(0, -4);
  rarity.forEach((r) => {
    name = name.replace(r.key, "");
  });
  return name;
};

const getElements = (path) => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      return {
        id: index + 1,
        name: cleanName(i),
        fileName: i,
        rarity: addRarity(i),
      };
    });
};

const layersSetup = (layersOrder) => {
  const layers = layersOrder.map((layerObj, index) => ({
    id: index,
    name: layerObj.name,
    location: `${layersDir}/${layerObj.name}/`,
    elements: getElements(`${layersDir}/${layerObj.name}/`),
    position: { x: 0, y: 0 },
    size: { width: format.width, height: format.height },
    number: layerObj.number,
  }));

  return layers;
};

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  if (fs.existsSync(jsonDir)) {
    fs.rmdirSync(jsonDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
  fs.mkdirSync(jsonDir);
};

const saveLayer = (_canvas, _edition) => {
  fs.writeFileSync(
    `${buildDir}/${_edition}.png`,
    _canvas.toBuffer("image/png")
  );
};

const saveJson = (_content, _edition) => {
  fs.writeFileSync(
    `${jsonDir}/${_edition}.json`,
    JSON.stringify(_content, null, 2)
  );
};

const addMetadata = (_edition) => {
  let dateTime = Date.now();
  let tempGender = [
    {
      id: gender,
      layer: "gender",
      name: gender == 1 ? "male" : "female",
      rarity: "original",
    },
  ];
  let tempMetadata = {
    hash: hash.join(""),
    decodedHash: decodedHash,
    edition: _edition,
    date: dateTime,
    attributes: [...tempGender, ...attributes],
  };
  metadata.push(tempMetadata);
  attributes = [];
  hash = [];
  decodedHash = [];
};

const addAttributes = (_element, _layer) => {
  let tempAttr = {
    id: _element.id,
    layer: _layer.name,
    name: _element.name,
    rarity: _element.rarity,
  };
  attributes.push(tempAttr);
  hash.push(_layer.id);
  hash.push(_element.id);
  decodedHash.push({ [_layer.id]: _element.id });
};

const drawLayer = async (_layer, _edition) => {
  const rand = Math.random();
  gender = Math.ceil((rand * 2) % 2);

  let element = _layer.elements[Math.floor(rand * _layer.number)]
    ? _layer.elements[Math.floor(rand * _layer.number)]
    : null;

  gender == 2
    ? _layer.location.replace("layers-male", "layers-female")
    : _layer.location;

  if (element) {
    addAttributes(element, _layer);
    const image = await loadImage(`${_layer.location}${element.fileName}`);

    ctx.drawImage(
      image,
      _layer.position.x,
      _layer.position.y,
      _layer.size.width,
      _layer.size.height
    );
    saveLayer(canvas, _edition);
  }
};

const createFiles = async (edition) => {
  const layers = layersSetup(layersOrder.slice(1, edition));

  let numDupes = 0;
  for (let i = 0; i < edition; i++) {
    await layers.forEach(async (layer) => {
      await drawLayer(layer, i);
    });

    let key = hash.toString();
    if (Exists.has(key)) {
      console.log(
        `Duplicate creation for edition ${i}. Same as edition ${Exists.get(
          key
        )}`
      );
      numDupes++;
      if (numDupes > edition) break; //prevents infinite loop if no more unique items can be created
      i--;
    } else {
      Exists.set(key, i);
      addMetadata(i);
      console.log("Creating edition " + i);
    }
  }
};

const createMetaData = () => {
  metadata.map(async (item, index) => {
    await saveJson(item, index);
    console.log("Creating Json", index);
  });
};

module.exports = { buildSetup, createFiles, createMetaData };
