const url = "https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/SG_PlanningCadastre/MapServer/2";
fetch(`${url}/query?where=1=1&returnIdsOnly=true&f=json`)
  .then(r=>r.json())
  .then(d=>console.log(d.objectIds ? d.objectIds.length : (d.error ? d.error.message : d)))
  .catch(console.error);
