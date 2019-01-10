function autocompleteForm(input, lngInput, latInput) {
  if (!input) return;
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      lngInput.value = place.geometry.location.lng();
      latInput.value = place.geometry.location.lat();
    }
  });
  input.on('keydown', e => {
    if (e.keyCode === 13) e.preventDefault();
  });
}

export default autocompleteForm;
