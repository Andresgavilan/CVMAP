mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kcmVzZ2F2aWxhbiIsImEiOiJja2wyd2Z3dXcwZDE3MnVwMTlhcnNieDhxIn0.f_iLJPAJJUyEXEkm7itrZw';
/**
 * Add the map to the page
 */
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/andresgavilan/cm6h3b8x6002d01sderoi6une',
  center: [-35.221901, 27.616228],
  zoom: 2.5,
  scrollZoom: true
});

// Fetch the GeoJSON data from the server
fetch('Dataprocess/CVMAP.geojson')
  .then(response => response.json())
  .then(trabajos => {
    // Sort the features array by Date in descending order
    trabajos.features.sort((a, b) => parseInt(b.properties.Date) - parseInt(a.properties.Date));
    /**
     * Assign a unique id to each store. You'll use this `id`
     * later to associate each point on the map with a listing
     * in the sidebar.
     */
    trabajos.features.forEach((trabajo, i) => {
      trabajo.properties.id = i;
    });

    /**
     * Wait until the map loads to make changes to the map.
     */
    map.on('load', () => {
      /**
       * This is where your '.addLayer()' used to be, instead
       * add only the source without styling a layer
       */
      map.addSource('places', {
        "type": 'geojson',
        "data": trabajos
      });

      /**
       * Add all the things to the page:
       * - The location listings on the side of the page
       * - The markers onto the map
       */
      buildLocationList(trabajos);
      addMarkers(trabajos);
    });
  })
  .catch(error => console.error('Error loading GeoJSON data:', error));

function addMarkers(trabajos) {
  /* For each feature in the GeoJSON object above: */
  for (const marker of trabajos.features) {
    /* Create a div element for the marker. */
    const el = document.createElement('div');
    /* Assign a unique `id` to the marker. */
    el.id = `marker-${marker.properties.id}`;
    /* Assign the `marker` class to each marker for styling. */
    el.className = 'marker';

    /**
     * Create a marker using the div element
     * defined above and add it to the map.
     **/
    new mapboxgl.Marker(el, { offset: [0, -23] })
      .setLngLat(marker.geometry.coordinates)
      .addTo(map);
    /**
     * Listen to the element and when it is clicked, do three things:
     * 1. Fly to the point
     * 2. Close all other popups and display popup for clicked store
     * 3. Highlight listing in sidebar (and remove highlight for all other listings)
     **/
    el.addEventListener('click', (e) => {
      /* Fly to the point */
      flyToStore(marker);
      /* Close all other popups and display popup for clicked store */
      createPopUp(marker);
      /* Highlight listing in sidebar */
      const activeItem = document.getElementsByClassName('active');
      e.stopPropagation();
      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }
      const listing = document.getElementById(
        `listing-${marker.properties.id}`
      );
      listing.classList.add('active');
      listings.classList.remove('open');
      toggleButton.style.display = 'block';
    });
  }
}
/**
 * Add a listing for each store to the sidebar.
 **/
function buildLocationList(trabajos) {
  for (const trabajo of trabajos.features) {
    /* Add a new listing section to the sidebar. */
    const listings = document.getElementById('listings');
    const listing = listings.appendChild(document.createElement('div'));
    /* Assign a unique `id` to the listing. */
    listing.id = `listing-${trabajo.properties.id}`;
    /* Assign the `item` class to each listing for styling. */
    listing.className = 'item';

    /* Add the link to the individual listing created above. */
    const link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'title';
    link.id = `link-${trabajo.properties.id}`;
    link.innerHTML = `${trabajo.properties.Title}`;

    /* Add details to the individual listing. */
    const details = listing.appendChild(document.createElement('div'));
    details.innerHTML = `${trabajo.properties.Where}`;
    if (trabajo.properties.Subtitle) {
      details.innerHTML += ` &middot; ${trabajo.properties.City}`;
      details.innerHTML += ` &middot; ${trabajo.properties.Date}`;
    }

    /**
     * Listen to the element and when it is clicked, do four things:
     * 1. Update the `currentFeature` to the store associated with the clicked link
     * 2. Fly to the point
     * 3. Close all other popups and display popup for clicked store
     * 4. Highlight listing in sidebar (and remove highlight for all other listings)
     **/
    link.addEventListener('click', function () {
      for (const feature of trabajos.features) {
        if (this.id === `link-${feature.properties.id}`) {
          flyToStore(feature);
          createPopUp(feature);
        }
      }
      const activeItem = document.getElementsByClassName('active');
      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }
      this.parentNode.classList.add('active');
      // Hide the listings container
      listings.classList.remove('open');
      toggleButton.style.display = 'block';
    });
  }
}

/**
 * Use Mapbox GL JS's `flyTo` to move the camera smoothly
 * a given center point.
 **/
function flyToStore(currentFeature) {
  map.flyTo({
    center: currentFeature.geometry.coordinates,
    zoom: 12
  });
}

/**
 * Create a Mapbox GL JS `Popup`.
 **/
function createPopUp(currentFeature) {
  const popUps = document.getElementsByClassName('mapboxgl-popup');
  if (popUps[0]) popUps[0].remove();
  const popup = new mapboxgl.Popup({ closeOnClick: false })
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML(
      `<h3><Strong>${currentFeature.properties.Where}</Strong></h3>
      <ul>${currentFeature.properties.Description.split('. ').map(sentence => `<li>${sentence}</li>`).join('')}</ul>`
    )
    .addTo(map);
}

const toggleButton = document.getElementById('toggle-listings');
const listing = document.getElementById('listing');

toggleButton.addEventListener('click', () => {
  listings.classList.toggle('open');
  toggleButton.style.display = listing.classList.contains('open') ? 'none' : 'block';
});
// Add event listeners to open links in a new window
document.getElementById('publications').addEventListener('click', () => {
  window.open('https://www.researchgate.net/profile/Andres-Gavilan-2?ev=hdr_xprf', '_blank');
});

document.getElementById('linkedin').addEventListener('click', () => {
  window.open('https://www.linkedin.com/in/andres-gavilan/', '_blank');
});

document.getElementById('listening').addEventListener('click', () => {
  window.open('https://music.apple.com/profile/pipegavilan', '_blank');
});