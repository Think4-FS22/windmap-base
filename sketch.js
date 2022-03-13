const bounds = {
  left: 5.641953,
  bottom: 45.644768,
  top: 47.864774,
  right: 10.7317183,
};

let geodata = [];

function preload() {
  geodata = loadJSON("world.geojson");
}

function setup() {
  createCanvas(800, 600);
}

function draw() {
  background(250);
}

function fetchData(lat, lon) {
  console.log("fetchData", lat, lon);

  let url = `https://pro.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=a0e50a6cee2f3c1fd09b8b8a638f49f0`;

  d3.json(url).then(function (response) {
    console.log("response", response);
    json = response;
    console.log("wind", json.wind.deg);
    data.push(json);
  });
}
