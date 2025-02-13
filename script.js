// script.js
document.addEventListener('DOMContentLoaded', () => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYW5kcmVzZ2F2aWxhbiIsImEiOiJja2wyd2Z3dXcwZDE3MnVwMTlhcnNieDhxIn0.f_iLJPAJJUyEXEkm7itrZw'; // Replace with your Mapbox access token

// Initialize the map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/andresgavilan/cm6h3b8x6002d01sderoi6une',
    center: [-35.221901, 27.616228], // Default center
    zoom: 2.5,
});

// Fetch GeoJSON data
async function loadGeoJSON() {
    const response = await fetch('CVMAP.geojson');
    const data = await response.json();
    return data;

}

// Add markers and populate listings
async function initializeMap() {
    try {
        const geojson = await loadGeoJSON();

        // Add markers and listings
        addMarkersAndListings(geojson);

        // Initialize map interactions
        setupMapInteractions(geojson);
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Add markers to the map and listings to the sidebar
function addMarkersAndListings(geojson) {
    const listings = document.getElementById('listings');

    // Sort features by date (newest first)
    geojson.features.sort((a, b) => {
        const dateA = new Date(a.properties.Date);
        const dateB = new Date(b.properties.Date);
        return dateB - dateA;
    });

    geojson.features.forEach((feature) => {

        // Add marker to the map
        const marker = addMarker(feature);

        // Add listing to the sidebar
        const listing = createListing(feature);
        listings.appendChild(listing);

        // Add click event to listing
        listing.addEventListener('click', () => {
            flyToStore(feature);
            marker.togglePopup();
            highlightListing(listing);
        });
    });
}

function formatDescription(description) {
    // Split the description into sentences based on periods
    const sentences = description.split('. ');

    // Format each sentence with a bullet point and a period
    const formattedSentences = sentences.map(sentence => {
        if (sentence.trim() !== '') {
            return `<li>${sentence.trim()}.</li>`;
        }
    }).join('');

    return `<ul>${formattedSentences}</ul>`;
}


// Add a marker to the map
function addMarker(feature) {
    // Create a div element for the custom marker
    const el = document.createElement('div');
    el.className = 'marker'; // Add a class for styling (optional)
    el.style.backgroundImage = `url('marker.png')`; // Path to your custom marker image
    el.style.width = '30px'; // Set the width of the marker
    el.style.height = '30px'; // Set the height of the marker
    el.style.backgroundSize = 'cover'; // Ensure the image covers the div

    // Create a marker using the custom element
    const marker = new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .addTo(map);

    // Create and attach a popup to the marker
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h3>${feature.properties.Title}</h3>
         <p>${feature.properties.Description}</p>`
    );
    marker.setPopup(popup);

    return marker;
}

// function addMarkerAndPopup(feature) {
    // Create a marker using the custom element
    // Create a div element for the custom marker
   // const el = document.createElement('div');
   // el.className = 'marker'; // Add a class for styling (optional)
    //el.style.backgroundImage = `url('marker.png')`; // Path to your custom marker image
    //el.style.width = '30px'; // Set the width of the marker
    //el.style.height = '30px'; // Set the height of the marker
    //el.style.backgroundSize = 'cover'; // Ensure the image covers the div

    // Create a marker using the custom element
    //const marker = new mapboxgl.Marker(el)
      //  .setLngLat(feature.geometry.coordinates)
        //.addTo(map);

    // Format the description
    //const formattedDescription = formatDescription(feature.properties.Description);

    // Create and attach a popup to the marker
    //const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
      //  `<h3>${feature.properties.Title}</h3>
        // ${formattedDescription}`
    //);

    //marker.setPopup(popup);

    //return marker;
//}

// Create a listing for the sidebar
function createListing(feature) {
    const item = document.createElement('div');
    item.className = 'item';
    item.id = `listing-${feature.properties.id}`;
    item.innerHTML = `
        <div class="title">${feature.properties.Title}</div>
        <small>${feature.properties.City}</small>
        <small>${feature.properties.Date}</small>
    `;
    return item;
}

// Fly to the store location
function flyToStore(feature) {
    map.flyTo({
        center: feature.geometry.coordinates,
        zoom: 15
    });
}

// Highlight the active listing
function highlightListing(activeListing) {
    const activeItem = document.getElementsByClassName('active');
    if (activeItem[0]) {
        activeItem[0].classList.remove('active');
    }
    activeListing.classList.add('active');
}

// Setup map interactions
function setupMapInteractions(geojson) {
    const listings = document.getElementById('listings');

    // Sync map with scroll position
    listings.addEventListener('scroll', () => {
        const scrollTop = listings.scrollTop;
        const scrollHeight = listings.scrollHeight;
        const clientHeight = listings.clientHeight;

        // Calculate the visible area and adjust map accordingly
        const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
        const featureIndex = Math.floor(geojson.features.length * scrollPercentage);
        const feature = geojson.features[featureIndex];

        if (feature) {
            map.flyTo({
                center: feature.geometry.coordinates,
                zoom: 14
            });
        }
    });
}

// Initialize the map and load data
initializeMap();

// Menu toggle functionality
const menuToggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');

menuToggle.addEventListener('click', () => {
    menu.classList.toggle('show');
    });
});