import React  from 'react';
import { Helmet } from 'react-helmet';

import L from 'leaflet';
import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map';

import {locations} from 'data/locations' ;


const LOCATION = {
  lat: 20.4072,
  lng: -89.0369,
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;




/**
 * MapEffect
 * @description This is an example of creating an effect used to zoom in and set a popup on load
 */

// const MapEffect = ({ markerRef }) => {
//   const map = useMap();

//   useEffect(() => {
//     if ( !markerRef.current || !map ) return;

//     ( async function run() {
     
//     })();
//   }, [map, markerRef]);

//   return null;
// };

const IndexPage = () => {
  console.log('location',locations)
  async function mapEffect({leafletElement}= {}){
    if(!leafletElement) return;
    leafletElement.eachLayer((layer)=> leafletElement.removeLayer(layer));

    const tripPoint = createTripPointsGeoJson({locations});
    const tripLines = createTripLinesGeoJson({locations});

    const tripPointsGeoJsonLayers = new L.geoJSON(tripPoint,{pointToLayer: tripStopPointToLayer});
    const tripLinesGeoJsonLayers = new L.geoJSON(tripLines);

    tripPointsGeoJsonLayers.addTo(leafletElement);
    tripLinesGeoJsonLayers.addTo(leafletElement);

    const bounds = tripPointsGeoJsonLayers.getBounds();
    leafletElement.fitBounds(bounds);
  }
  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <Map {...mapSettings} />
        

      <Container type="content" className="text-center home-start">
        <h2>Still Getting Started?</h2>
        <p>Run the following in your terminal!</p>
        <pre>
          <code>gatsby new [directory] https://github.com/colbyfayock/gatsby-starter-leaflet</code>

          </pre>
        <p className="note">Note: Gatsby CLI required globally for the above command</p>
      </Container>
    </Layout>
  );
};

function createTripPointsGeoJson({ locations } = {}) {
  return {
    "type": "FeatureCollection",
    "features": locations.map(({ placename, location = {}, image, date, todo = [] } = {}) => {
      const { lat, lng } = location;
      return {
        "type": "Feature",
        "properties": {
          placename,
          todo,
          date,
          image
        },
        "geometry": {
          "type": "Point",
          "coordinates": [ lng, lat ]
        }
      }
    })
  }
}

function createTripLinesGeoJson({ locations } = {}) {
  return {
    "type": "FeatureCollection",
    "features": locations.map((stop = {}, index) => {
      const prevStop = locations[index - 1];

      if ( !prevStop ) return [];

      const { placename, location = {}, date, todo = [] } = stop;
      const { lat, lng } = location;
      const properties = {
        placename,
        todo,
        date
      };

      const { location: prevLocation = {} } = prevStop;
      const { lat: prevLat, lng: prevLng } = prevLocation;

      return {
        type: 'Feature',
        properties,
        geometry: {
          type: 'LineString',
          coordinates: [
            [ prevLng, prevLat ],
            [ lng, lat ]
          ]
        }
      }
    })
  }
}

function tripStopPointToLayer( feature = {}, latlng ) {
  const { properties = {} } = feature;
  const { placename, todo = [], image, date } = properties;

  const list = todo.map(what => `<li>${ what }</li>`);
  let listString = '';
  let imageString = '';

  if ( Array.isArray(list) && list.length > 0 ) {
    listString = list.join('');
    listString = `
      <p>Things we will or have done…</p>
      <ul>${listString}</ul>
    `
  }

  if ( image ) {
    imageString = `
      <span class=“trip-stop-image” style=“background-image: url(${image})”>${placename}</span>
    `;
  }

  const text = `
    <div class=“trip-stop”>
      ${ imageString }
      <div class=“trip-stop-content”>
        <h2>${placename}</h2>
        <p class=“trip-stop-date”>${date}</p>
        ${ listString }
      </div>
    </div>
  `;

  const popup = L.popup({
    maxWidth: 400
  }).setContent(text);

  const layer = L.marker( latlng, {
    icon: L.divIcon({
      className: 'icon',
      html: `<span class=“icon-trip-stop”></span>`,
      iconSize: 20
    }),
    riseOnHover: true
  }).bindPopup(popup);

  return layer;
}
export default IndexPage;
