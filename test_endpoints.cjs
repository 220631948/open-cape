const fs = require('fs');
async function run() {
  try {
    let res = await fetch('https://citymaps.capetown.gov.za/agsext1/rest/services/Theme_Based/Open_Data_Service/MapServer?f=json');
    console.log("MapServer Status:", res.status);
    
    let res2 = await fetch('https://citymaps.capetown.gov.za/agsext1/rest/services/Theme_Based/Open_Data/MapServer?f=json');
    console.log("MapServer 2 Status:", res2.status);

    let res3 = await fetch('https://odp-cctegis.opendata.arcgis.com/api/v3/datasets');
    if (res3.ok) {
        let txt = await res3.text();
        console.log("ODP Datasets string length:", txt.length);
    }
  } catch (e) {
    console.error(e);
  }
}
run();
