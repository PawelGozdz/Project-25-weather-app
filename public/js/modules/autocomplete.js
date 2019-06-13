function autocomplete(input, latInput, lngInput) {
  // Return when no input
  if (!input) return;
  const dropdown = new google.maps.places.Autocomplete(input);

  // place_changed - event
  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
    console.log(place);
  });

  // Jeżeli ktoś wciśnie enter, to zapobiegami submitowaniu formy
  input.on('keydown', (e) => {
    if (e.keyCode === 13) e.preventDefault();
  });
}

export default autocomplete;
