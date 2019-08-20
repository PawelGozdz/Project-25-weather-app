export class BuildElements {
  constructor(place) {
    this.place = place;
  }

  buildPopUpHtml() {
    return `
        <article class="map__popup">
          <h3 class='map__place'>${this.place.data.name.substring(0, 30)}</h3>
          <img src='http://openweathermap.org/img/w/${
            this.place.data.weather[0].icon
          }.png' class='map__img' alt='${
      this.place.data.weather[0].description
    }' title='${this.place.data.weather[0].description}'>
          <p>${this.place.data.weather[0].main}</p>
          <p>${this.place.data.weather[0].description}</p>
          <p>${Math.round(this.place.data.main.temp - 273.15)} &#8451;</p>
          <i class='icon-heart map__heart place-${this.place.data.name.toLowerCase()}' title='${
      this.place.data.name
    }'></i>
        </article>
      `;
  }

  buildFavourite() {
    return `
        <article class='map__favourite'>
          <img src='http://openweathermap.org/img/w/${
            this.place.data.weather[0].icon
          }.png' class='map__img' alt='${this.place.data.name}' title='${
      this.place.data.name
    }'>
          <span class='map__temp'>${Math.round(
            this.place.data.main.temp - 273.15
          )}</span>
          <h5>${this.place.data.name}</h5>
          <i class='icon-heart map__heart place-${this.place.data.name.toLowerCase()}' title='${
      this.place.data.name
    }'></i>
        </article>
        `;
  }
}
