import '../sass/style.scss';

import { makeMap, buildFavouritesTopbar } from './map/map';

makeMap(document.querySelector('#map__background'));

if (document.querySelector('.map__favourites')) {
  buildFavouritesTopbar();
  // Refresh
  setInterval(() => {
    buildFavouritesTopbar();
  }, 360000);
}
