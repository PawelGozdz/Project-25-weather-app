import axios from 'axios';

export class AxiosCalls {
  // constructor() {}

  async callFavouritePlaceByName(place) {
    return axios.post(`/api/favourites/${place.data.name}/place`, {
      lat: place.data.coord.lat,
      lng: place.data.coord.lon,
      website: place.data.website,
      icon: place.data.weather[0].icon
    });
  }

  async fetchFavourites() {
    return axios.get(`/api/places`);
  }

  async getPlaceByGeo(lat, lng, name) {
    const optionalName = name !== undefined || '' ? `&name=${name}` : '';
    return axios.get(
      `/api/place?lat=${lat}&lng=${lng}${
        name !== undefined ? optionalName : ''
      }`
    );
  }
}
