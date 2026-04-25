const https = require('https');

https.get('https://citymaps.capetown.gov.za/agsext1/rest/services/Theme_Based/Open_Data_Service/MapServer?f=json', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.layers) {
        parsed.layers.forEach(l => console.log(`${l.id}: ${l.name}`));
      } else {
        console.log('No layers found or error:', data.slice(0, 500));
      }
    } catch (e) {
      console.log('Parse error:', e.message, data.slice(0, 500));
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
