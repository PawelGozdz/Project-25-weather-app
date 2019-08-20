import axios from 'axios';
import { AxiosCalls } from '../services/axiosCalls';
import { BuildElements } from './BuildElements';

const axiosCalls = new AxiosCalls();

// Default map location
const mapOptions = {
  center: { lat: 51.07639, lng: 17.04781 },
  zoom: 6
};

function findHeartIcon(data) {
  if (!data) return;

  return document.querySelector(`i[title="${data.name}"]`);
}

async function addListenerToHeart(place) {
  if (!place) return;
  const element = await findHeartIcon(place.data);

  element.addEventListener(
    'click',
    e => {
      e.data = place.data;
      toggleFavourite(e);
    },
    true
  );
}

async function toggleFavourite(place) {
  // Prevent clicking before data comes back
  place.target.style.display = 'none';

  const favouritePlace = await new axiosCalls.callFavouritePlaceByName(place);

  if (!favouritePlace || favouritePlace.length === 0) {
    alert("Cant't fetch data!");
    place.target.style.display = 'block';
    return [];
  }

  place.target.style.display = 'block';
  const alertBox = document.querySelector('.map__alert');

  // If not logged in, display popup window
  if (favouritePlace.data.alert) {
    alertBox.textContent = favouritePlace.data.alert;
    alertBox.classList.toggle('loggedin');
    setTimeout(() => {
      alertBox.classList.toggle('loggedin');
    }, 1500);
  }
  buildFavouritesTopbar(favouritePlace);
}

export async function buildFavouritesTopbar(placesDataObj = []) {
  const favouritesTopBar = document.querySelector('.map__favourites');
  if (!favouritesTopBar) return;

  placesDataObj =
    placesDataObj.length !== 0
      ? placesDataObj
      : await axiosCalls.fetchFavourites();
  if (
    placesDataObj.data.favourites.length === 0 ||
    placesDataObj.data.favourites === undefined
  ) {
    favouritesTopBar.style.display = 'none';
    return;
  }
  favouritesTopBar.style.display = 'flex';

  // requesting all at once
  const weatherArr = [];
  placesDataObj.data.favourites.forEach(place => {
    const lat = place.location.coordinates[1];
    const lng = place.location.coordinates[0];
    const name = place.name;
    const weather = axiosCalls.getPlaceByGeo(lat, lng, name);

    weatherArr.push(weather);
  });

  const weatherDataArr = await Promise.all(weatherArr);

  favouritesTopBar.innerHTML = '';
  weatherDataArr.forEach(place => {
    const element = new BuildElements(place).buildFavourite();

    favouritesTopBar.insertAdjacentHTML('afterbegin', element);
    addListenerToHeart(place);
  });
}

async function loadPlace(map, place) {
  // defining default values for lat & lng if no argument 'place' passed
  const lat = place.geometry.location.lat() || mapOptions.center.lat;
  const lng = place.geometry.location.lng() || mapOptions.center.lng;

  const response = await axiosCalls.getPlaceByGeo(lat, lng);

  if (!response) {
    alert("Cant't fetch data!");
    return;
  }

  const bounds = new google.maps.LatLngBounds();
  const infoWindow = new google.maps.InfoWindow();
  const position = { lat, lng };
  bounds.extend(position);
  const marker = new google.maps.Marker({ map, position });

  marker.place = response;
  // assigning / overriding the weather API data with the google data, as the weather data is not really accurate;
  marker.place.data.coord.lat = lat;
  marker.place.data.coord.lon = lng;
  marker.place.data.name = place.name;
  marker.place.data.website = place.website;

  marker.addListener('click', function() {
    const html = new BuildElements(this.place).buildPopUpHtml();
    infoWindow.setContent(html);
    infoWindow.open(map, marker);
    let doc = new DOMParser().parseFromString(html, 'text/html');

    // 'domready' event make icon possible to select
    const mapReadyEvent = new google.maps.event.addListener(
      infoWindow,
      'domready',
      e => {
        addListenerToHeart(this.place);
      }
    );
  });

  map.setCenter(bounds.getCenter());
}

export function makeMap(mapDiv) {
  if (!mapDiv) return;
  // make map. 1. where in html, 2. options
  const map = new google.maps.Map(mapDiv, mapOptions);
  const input = document.querySelector('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);

  // place_changed runs event when something changes in autocomplete
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    loadPlace(map, place);
  });
}
