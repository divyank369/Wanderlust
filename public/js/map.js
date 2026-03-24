// Use the token passed from show.ejs
// maplibregl.accessToken = mapToken; // Not needed for MapTiler

// Initialize the map
try {
  // Check if coordinates are valid before initializing
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    throw new Error(`Invalid coordinates: ${JSON.stringify(coordinates)}`);
  }

  if (!mapToken) {
    throw new Error('Map token not provided');
  }

  const map = new maplibregl.Map({
    container: 'map',
    style: `https://api.maptiler.com/maps/streets/style.json?key=${mapToken}`,
    center: coordinates,        // Correct: received from EJS [lng, lat]
    zoom: 10
  });

  // Add error handling
  map.on('error', (e) => {
    console.error('MapLibre error:', e);
    const mapEl = document.getElementById('map');
    if (mapEl) {
      mapEl.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">❌ Map failed to load. Check browser console.</p>';
    }
  });

  // Add load event to confirm map loaded
  map.on('load', () => {
    console.log('✅ Map loaded successfully at', coordinates);
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

  console.log("✅ Map initialized with coordinates:", coordinates);
} catch (err) {
  console.error('❌ Map initialization failed:', err.message);
  const mapEl = document.getElementById('map');
  if (mapEl) {
    mapEl.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">❌ ${err.message}</p>`;
  }
}
