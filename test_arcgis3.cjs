const url = "https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/SG_PlanningCadastre/MapServer/2";
fetch(`${url}/query?objectIds=1,2,3&outFields=*&outSR=4326&f=geojson`)
  .then(r=>r.json())
  .then(d=>console.log(d.features ? d.features.length : (d.error ? d.error.message : d)))
  .catch(console.error);
