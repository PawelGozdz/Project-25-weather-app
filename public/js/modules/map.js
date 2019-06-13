import axios from 'axios';

// Default map location
const mapOptions = {
  center: { lat: 51.076390, lng: 17.047810 },
  zoom: 6
};

// catch icons in popup window or in favour section
function catchHeartIcons () {
  const icons = document.querySelectorAll('.map__heart');
  return icons;
};

function addListenerToInfoWindow(data) {
  const markers = catchHeartIcons();
  markers.forEach(marker => marker.addEventListener('click', function(e) {
    e.data = data;
    toggleFavorite(e);
  }));
}

function toggleFavorite(place) {
  place.target.style.display = 'none';

  // Prevent clicking before data comes back
  axios.post(`/api/place/favorite`,
    { lat: place.data.coord.lat, 
      lng: place.data.coord.lon, 
      name: place.data.name, 
      website: place.data.website,
      icon: place.data.weather[0].icon
    })
    .then(returnedData => {
      if (!returnedData) {
        alert('Cant\'t fetch data!');
        return;
      }
      
      place.target.style.display = 'block';
      const alertBox = document.querySelector('.map__alert');

      // If not logged in, display popup window
      if (returnedData.data.alert) {
        alertBox.textContent = returnedData.data.alert;
        alertBox.classList.toggle('loggedin');
        setTimeout(() => {
          alertBox.classList.toggle('loggedin');
        }, 1500);
      }

      buildInitialListOfFavorites();
    })
}

async function fetchInitialListOfFavorites() {
  let fetchedPlaces = [];

  const favoritePlaces = await axios.get(`/api/places`);
  const getWeather = await favoritePlaces.data.map(async pl => {
    const weather = await axios.get(`/api/place?lat=${pl.location.coordinates[0]}&lng=${pl.location.coordinates[1]}`);
    pl.icon = weather.data.weather[0].icon;
    pl.main = weather.data.weather[0].main;
    pl.temp = weather.data.main.temp;
    fetchedPlaces.push(pl);
  });

  return fetchedPlaces;
}

export async function buildInitialListOfFavorites() {
  // if no .map__favorites, it means that no index page or no user logged in
  const favorites = document.querySelector('.map__favorites') || [];
  
  if (favorites === undefined) return;

  // Couldn't solve issue with data coming back. It has, but as an empty array, however a few miliseconds later, that array is clickable and the data is there.

  const favoriteToDisplay = (await fetchInitialListOfFavorites() || []);
  let html = '';
  console.log('--> This data must be printed as user favorites', favoriteToDisplay);

  // if favoriteToDisplay.length === 0, you can't see the data coming back
  if (favoriteToDisplay.length !== 0) {
    console.log('pusta', favoriteToDisplay.length);
    favorites.style.display = 'none';
    return;
  }
  
  // This should prepare html for injection to .map__favourits section
  favoriteToDisplay.forEach(place => {
      html += `
        <article class='map__favorite'>
          <h3>${place.data.name}</h3>
          <img src='http://openweathermap.org/img/w/${place.data.icon}.png' class='map__img' alt='${place.data.name}' title='${place.data.name}'>
          <span class='map__temp'>${place.data.temp - 273.15}</span>
          <i class='icon-heart map__heart'></i>
        </article>
      `;
    });
    favorites.innerHTML = html;
}

function loadPlaces(map, place) {
  // defining default values for lat & lng if no argument 'place' passed
  const lat = ( place.geometry.location.lat() || mapOptions.center.lat ); 
  const lng = ( place.geometry.location.lng() || mapOptions.center.lng );

  axios.get(`/api/place?lat=${lat}&lng=${lng}`)
    .then(res => {
      if (!res) {
        alert('Cant\'t fetch data!');
        return;
      }

      const bounds = new google.maps.LatLngBounds();
      const infoWindow = new google.maps.InfoWindow();
      const position = { lat, lng };
      bounds.extend(position);
      const marker = new google.maps.Marker({ map, position });

      marker.place = res;
      // assigning / overriding the weather API data with the google data, as the weather data is not really accurate;
      marker.place.data.coord.lat = lat;
      marker.place.data.coord.lon = lng;
      marker.place.data.name = place.name;
      marker.place.data.website = place.website;

      marker.addListener('click', function() {
        const html = `
          <article class="map__popup">
            <h3 class='map__place'>${this.place.data.name.substring(0, 30)}</h3>
            <img src='http://openweathermap.org/img/w/${this.place.data.weather[0].icon}.png' class='map__img' alt='${this.place.data.weather[0].description}' title='${this.place.data.weather[0].description}'>
            <p>${this.place.data.weather[0].main}</p>
            <p>${this.place.data.weather[0].description}</p>
            <p>${ Math.round(this.place.data.main.temp - 273.15) } &#8451;</p>
            <i class='icon-heart map__heart'></i>
            
          </article>
        `;
        
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
        
        // 'domready' event make icon possible to select
        const mapReadyEvent = new google.maps.event.addListener(infoWindow, 'domready', (e) => {
          addListenerToInfoWindow(this.place.data);
        });
      });
      
      map.setCenter(bounds.getCenter());
    })
}

export function makeMap(mapDiv) {
  if(!mapDiv) return;
  // make map. 1. where in html, 2. options
  const map = new google.maps.Map(mapDiv, mapOptions);
  const input = document.querySelector('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);
  
  // place_changed runs event when something changes in autocomplete
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    loadPlaces(map, place);
  });
};
