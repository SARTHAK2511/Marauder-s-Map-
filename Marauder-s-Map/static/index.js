// Initialize the map
var map = L.map('map').setView([22.7196, 75.857], 13);

// Add the OpenStreetMap_Mapnik tile layer
var OpenStreetMap_Mapnik = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Define variables for start and end coordinates
var startCoords = null;
var endCoords = null;

// Function to handle click events on the map
function onMapClick(e) {
  if (!startCoords) {
    startCoords = e.latlng;
    L.marker(startCoords).addTo(map)
      .bindPopup("<b>Start Destination</b><br>Coordinates: " + startCoords).openPopup();
  } else if (!endCoords) {
    endCoords = e.latlng;
    L.marker(endCoords).addTo(map)
      .bindPopup("<b>End Destination</b><br>Coordinates: " + endCoords).openPopup();

    // Calculate distance between start and end coordinates
    var distance = calculateDistance(startCoords.lat, startCoords.lng, endCoords.lat, endCoords.lng);
    console.log('Shortest distance between start and end points: ' + distance.toFixed(2) + ' meters');
    sendCoordinatesToFlask(startCoords, endCoords);
  }
}

// Add click event listener to the map
map.on('click', onMapClick);

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radius of Earth in meters
  const φ1 = lat1 * Math.PI / 180; // Convert degrees to radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
}

// Function to send coordinates to Flask server
function sendCoordinatesToFlask(startCoords, endCoords) {
  console.log(startCoords, endCoords);
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/process_coordinates', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      console.log(response.result);
      // Process the response as needed
    }
  };
  var data = JSON.stringify({
    start_coords: startCoords,
    end_coords: endCoords
  });
  xhr.send(data);
}

// Bind the reset function to a button or another UI element
document.getElementById('reset-btn').addEventListener('click', function() {
  // Logic to reset the map
  console.log('Resetting map...');
  resetMap(); // Assuming resetMap function is defined
});

// Function to reset the map
function resetMap() {
  // Check if startMarker exists and remove it from the map
  if (startMarker) {
    map.removeLayer(startMarker);
    startMarker = null;
    startCoords = null; // Reset startCoords if it's being used outside marker logic
  }

  // Check if endMarker exists and remove it from the map
  if (endMarker) {
    map.removeLayer(endMarker);
    endMarker = null;
    endCoords = null; // Reset endCoords if it's being used outside marker logic
  }

  // Optionally, reset the map view to a default position and zoom level
  // Change the latitude, longitude, and zoom level to your desired default values
  map.setView([22.7196, 75.857], 13);
}

// Function to handle submission of coordinates with mode selection
document.getElementById("result-btn").addEventListener("click", function() {
  var selectedOption = document.querySelector('input[name="option"]:checked');
  if (selectedOption && startCoords && endCoords) {
    var mode = selectedOption.value;
    var data = {
      'start_coords': startCoords,
      'end_coords': endCoords,
      'mode': mode
    };
    fetch('/process_coordinates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // Redirect to the home page after processing
        window.location.href = '/';
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
  } else {
    console.log('Please select mode and click start and end points on the map.');
  }
});
