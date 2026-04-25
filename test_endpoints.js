import fs from 'fs/promises';
async function run() {
  try {
    const urls = [
        'https://cgis.capetown.gov.za/arcgis/rest/services?f=json',
        'https://citymaps.capetown.gov.za/arcgis/rest/services?f=json',
        'https://opendata.capetown.gov.za/api/v2'
    ];
    for (let u of urls) {
        try {
            let res = await fetch(u);
            console.log(u, res.status);
            if (res.ok && u.includes('arcgis')) {
                let j = await res.json();
                console.log(j.folders);
            }
        } catch(e) {
            console.log(u, "failed");
        }
    }
  } catch (e) {}
}
run();
