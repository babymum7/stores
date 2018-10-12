import axios from 'axios';
import { $ } from './bind';

function loadPlaces(
  map,
  lat = 21.0031177,
  lng = 105.82014079999999,
  infoWindow,
  topStore
) {
  infoWindow.close();
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`).then(res => {
    const places = res.data;
    if (!places.length) {
      alert('no places found!');
      return;
    }
    const bounds = new google.maps.LatLngBounds();

    const markers = places.map(place => {
      const [placeLng, placeLat] = place.location.coordinates;
      const position = { lat: placeLat, lng: placeLng };
      bounds.extend(position);
      const marker = new google.maps.Marker({ map, position });
      marker.place = place;
      return marker;
    });
    const html = marker => `
            <div class="popup">
              <a href="/store/${marker.place.slug}">
                <img src="/images/uploads/${marker.place.photo ||
                  'store.png'}" alt="${marker.place.name}" />
                <p>${marker.place.name} - ${marker.place.location.address}</p>
              </a>
            </div>
          `;
    markers.forEach(marker =>
      marker.addListener('click', function() {
        infoWindow.setContent(html(marker));
        infoWindow.open(map, this);
      })
    );
    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);
    if (topStore) {
      map.setCenter({ lat, lng });
      infoWindow.setContent(html(markers[0]));
      infoWindow.open(map, markers[0]);
    }
  });
}

function makeMap(mapDiv) {
  if (!mapDiv) return;
  axios
    .get('/api/coortopstore')
    .then(res => {
      const [placeLng, placeLat] = res.data;
      const map = new google.maps.Map(mapDiv, {
        center: { lat: placeLat, lng: placeLng },
        zoom: 12
      });
      const infoWindow = new google.maps.InfoWindow();
      loadPlaces(map, placeLat, placeLng, infoWindow, true);
      const input = $('[name="geolocate"]');
      const autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          loadPlaces(
            map,
            place.geometry.location.lat(),
            place.geometry.location.lng(),
            infoWindow
          );
        }
      });
      $('#findPlacesNearYou').on('click', () => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            loadPlaces(map, latitude, longitude, infoWindow);
          });
        } else {
          alert('Your brower dose not support that feature');
        }
      });

      $('#getLocationStore').on('click', () => {
        loadPlaces(map, placeLat, placeLng, infoWindow, true);
      });
    })
    .catch(console.log);
}

export default makeMap;
