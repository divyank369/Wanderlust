// Use the token passed from show.ejs
maplibregl.accessToken = mapToken;

// Initialize the map
const map = new maplibregl.Map({
  container: 'map',
  style: `https://api.maptiler.com/maps/streets/style.json?key=${mapToken}`,
  center: coordinates,        // Correct: received from EJS
  zoom: 10
});

// Navigation controls
map.addControl(new maplibregl.NavigationControl());

// MAIN MARKER: At listing location
const marker = new maplibregl.Marker({ color: 'red' })
  .setLngLat(coordinates)        // Correct: using global `coordinates`
  .setPopup(
    new maplibregl.Popup({ offset: 25 })
      .setHTML(
        `<h3>${listingTitle}</h3>
         <p>Exact location provided after booking</p>`
      )
  )
  .addTo(map);

// (Optional) Logging for debugging
console.log("Listing coordinates:", coordinates);
