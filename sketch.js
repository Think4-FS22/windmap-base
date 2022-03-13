const bounds = {
  left: 5.641953,
  bottom: 45.644768,
  top: 47.864774,
  right: 10.7317183,
};

let geodata = [];
let weatherdata = [];
let data = [];

let projection;
let countries;

let n = 1000;
let particles = [];

const tree = d3.quadtree();

function preload() {
  geodata = loadJSON("world.geojson");
  weatherdata = loadJSON("weather-switzerland-example.json");
}

function setup() {
  createCanvas(800, 600);

  // set map projection
  projection = d3
    .geoMercator()
    .center([8.227512, 46.818188])
    .translate([width / 2, height / 2])
    .scale(10000);

  // select countries to display
  countries = geodata.features.filter(function (d) {
    return d.properties.CNTR_ID == "CH";
  });

  // create particles
  for (let i = 0; i < n; i++) {
    let x = random(0, width);
    let y = random(0, height);
    let p = new Particle(x, y);
    particles.push(p);
  }

  // fetch data from openweathermap api
  // let u = 20;
  // let v = 20;
  // let count = 0;
  // for (let i = 0; i <= u; i++) {
  //   for (let j = 0; j <= v; j++) {
  //     let lon = map(i, 0, u, bounds.left, bounds.right);
  //     let lat = map(j, 0, v, bounds.bottom, bounds.top);
  //     setTimeout(function () {
  //       fetchData(lat, lon);
  //     }, count * 400);
  //     count++;
  //   }
  // }

  // set data to loaded weather data
  data = weatherdata.data;

  tree
    .x(function (d) {
      return projection([d.coord.lon, d.coord.lat])[0];
    })
    .y(function (d) {
      return projection([d.coord.lon, d.coord.lat])[1];
    })
    .addAll(data);

  let p = tree.find(width / 2, height / 2);

  console.log("p", p);

  console.log(data);
  frameRate(30);
}

function draw() {
  background(240, 50);

  // draw map
  for (let i = 0; i < countries.length; i++) {
    let coordinates = countries[i].geometry.coordinates;
    let type = countries[i].geometry.type;

    for (let j = 0; j < coordinates.length; j++) {
      let coordinates2 = [];
      if (type == "Polygon") {
        coordinates2 = coordinates[j];
      } else if (type == "MultiPolygon") {
        coordinates2 = coordinates[j][0];
      }

      noFill();
      stroke(0);
      beginShape();
      for (let k = 0; k < coordinates2.length; k++) {
        let xy = projection(coordinates2[k]);
        vertex(xy[0], xy[1]);
      }
      endShape();
    }
  }

  // draw wind
  for (let i = 0; i < data.length; i++) {
    let wind = data[i].wind;
    let lon = data[i].coord.lon;
    let lat = data[i].coord.lat;
    let xy = projection([lon, lat]);
    let x = xy[0];
    let y = xy[1];
    let v = createVector(10, 0);
    v.setHeading(radians(wind.deg - 90 - 180));
    fill(0, 50);
    noStroke();
    ellipse(x, y, 3, 3);
    stroke(0, 50);
    line(x, y, x + v.x, y + v.y);
  }

  // draw particles
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].display();
  }
}

function keyTyped() {
  console.log(data);
  redraw();
}

class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.prevPos = createVector(x, y);
    this.speed = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.age = 0;
  }

  update() {
    // find closest weather measurement
    let weatherStation = tree.find(this.position.x, this.position.y);
    let dir = weatherStation.wind.deg;
    let speed = weatherStation.wind.speed;

    // update acceleration
    this.acc.set(1, 0);
    this.acc.setHeading(radians(dir - 90 - 180));
    this.acc.normalize();
    this.acc.mult(0.2 * speed);

    // update speed
    this.speed.add(this.acc);
    this.speed.limit(3);

    // set previous position
    this.prevPos = this.position.copy();

    // update position
    this.position.add(this.speed);

    this.age++;
    // reposition particle sometimes
    if (random(0, 1) > 0.98 || this.age > 50) {
      this.age = 0;
      this.position = createVector(random(0, width), random(0, height));
      this.prevPos = this.position.copy();
      this.speed = createVector(0, 0);
      this.acc = createVector(0, 0);
    }
  }

  display() {
    stroke(0);
    line(this.prevPos.x, this.prevPos.y, this.position.x, this.position.y);
  }
}

function fetchData(lat, lon) {
  console.log("fetchData", lat, lon);

  let url = `https://pro.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=a0e50a6cee2f3c1fd09b8b8a638f49f0`;

  d3.json(url).then(function (response) {
    console.log("response", response);
    json = response;
    console.log("wind", json.wind.deg);
    data.push(json);
    //   redraw();
  });
}
