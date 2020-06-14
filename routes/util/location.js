const axios =require('axios');

function getCoordsForAddress() {
return {
    lat: 40.7484474,
    lng: -73.9871516,
  }
}
module.exports= getCoordsForAddress; 
  //code in case having api key
  /*
  async function getCoordsForAddress() {

  const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?${encodeURIComponent(address)}&key=${api_key}`)


const data = response.data;

if(!data || data.status === 'ZERO_RESULTS'){
    const error = new HttpError('could not find specified locatoion',404);
    throw error
}
const coordinates = data.results[0].geometry.location
return coordinates
}

module.exports = getCoordForAddress;

*/