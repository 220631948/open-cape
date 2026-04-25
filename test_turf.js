const turf = require("@turf/turf");
const geom = { type: "Polygon", coordinates: [[[0,0],[0,1],[1,1],[1,0],[0,0]]] };
const buffered = turf.buffer(geom, 50, { units: "meters" });
console.log(buffered != null);
