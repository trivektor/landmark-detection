import "babel-polyfill";
import {get, isEmpty} from "lodash-es";

const file = document.querySelector("#file");
const loadingIndicator = document.querySelector("#loading-indicator");
const SERVER_SIDE_URL = "http://b25fa54a.ngrok.io";

mapkit.init({
  authorizationCallback: function(done) {
    fetch(`${SERVER_SIDE_URL}/services/jwt`)
      .then((response) => response.text())
      .then(done);
  },
  language: "en",
});

file.addEventListener("change", async (event) => {
  loadingIndicator.style.visibility = "visible";

  const fd = new FormData;

  fd.append("file", event.target.files[0]);

  const landmarkAnnotations = await fetch(`${SERVER_SIDE_URL}/upload-image`, {
    method: "POST",
    body: fd,
    headers: {"Accept": "application/json"}
  })
  .then((response) => response.json())
  .then((json) => get(json, "responses.0.landmarkAnnotations") || []);

  const locationAnnotations = [];

  landmarkAnnotations.forEach((landmarkAnnotation) => {
    const MarkerAnnotation = mapkit.MarkerAnnotation;
    const {latitude, longitude} = get(landmarkAnnotation, "locations.0.latLng") || {};

    if (latitude && longitude) {
      const locationCoordinate = new mapkit.Coordinate(latitude, longitude);

      locationAnnotations.push(
        new MarkerAnnotation(locationCoordinate, {
          color: "#FF4B2B",
          title: landmarkAnnotation.description,
        })
      );
    }

    console.log({locationAnnotations});
  });

  const map = new mapkit.Map("map");
  map.showItems(locationAnnotations);

  loadingIndicator.style.visibility = "hidden";
});
