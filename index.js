import "babel-polyfill";
import {get, isEmpty} from "lodash-es";

const file = document.querySelector("#file");
const SERVER_SIDE_URL = "http://localhost:4567";

file.addEventListener("change", async (event) => {
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

      mapkit.init({
        authorizationCallback: function(done) {
          fetch(`${SERVER_SIDE_URL}/services/jwt`)
            .then((response) => response.text())
            .then(done);
        },
        language: "en",
      });

      locationAnnotations.push(
        new MarkerAnnotation(locationCoordinate, {
          color: "transparent",
          title: landmarkAnnotation.description,
          glyphText: "🎃",
        })
      );
    }

    console.log({locationAnnotations});
  });

  const map = new mapkit.Map("map");
  map.showItems(locationAnnotations);
});
