import "babel-polyfill";
import {get, isEmpty} from "lodash-es";

const file = document.querySelector("#file");

file.addEventListener("change", async (event) => {
  const fd = new FormData;

  fd.append("file", event.target.files[0]);

  const landmarkAnnotation = await fetch("http://localhost:4567/upload-image", {
    method: "POST",
    body: fd,
    headers: {"Accept": "application/json"}
  })
  .then((response) => response.json())
  .then((json) => get(json, "responses.0.landmarkAnnotations.0"));

  if (landmarkAnnotation) {
    const MarkerAnnotation = mapkit.MarkerAnnotation;
    const {latitude, longitude} = get(landmarkAnnotation, "locations.0.latLng") || {};

    if (latitude && longitude) {
      const locationCoordinate = new mapkit.Coordinate(latitude, longitude);

      mapkit.init({
        authorizationCallback: function(done) {
          fetch("http://localhost:4567/services/jwt")
            .then((response) => response.text())
            .then(done);
        },
        language: "en",
      });

      const map = new mapkit.Map("map");
      const locationAnnotation = new MarkerAnnotation(locationCoordinate, {
        color: "red",
        title: landmarkAnnotation.description,
      });
      map.showItems([locationAnnotation]);
    }
  }
});
