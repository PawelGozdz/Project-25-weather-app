import '../sass/style.scss';

import { makeMap, buildInitialListOfFavorites } from './modules/map';


makeMap( document.querySelector('#map__background') );

// .map__favorites div exists only if User is logged in
if ( document.querySelector('.map__favorites') ) {
  buildInitialListOfFavorites();
}

