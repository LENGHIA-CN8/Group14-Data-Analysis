import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { render } from "react-dom";
import MapGL, { Source, Layer, Popup } from "@goongmaps/goong-map-react";

import { dataLayer, fillLayer } from "./map-style.js";
import MARKER from "../Marker.json";
import Pins from "./Pin";
import MarkerInfo from "./marker-info";

const GOONG_MAPTILES_KEY = "pUhXgHuCZYAftRhPuN8q8icCOaynIICbUTBFyrDE"; // Set your goong maptiles key here

export default function App() {
  const [viewport, setViewport] = useState({
    // zoom at launch
    latitude: 16,
    longitude: 107,
    zoom: 5.5,
    bearing: 0,
    pitch: 0,
  });
  const [querystring, setQuery] = useState(null);
  const [res, setRes] = useState(MARKER);
  const [popupInfo, setPopupInfo] = useState(null);
  const [allData, setAllData] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);

  useEffect(() => {
    /* global fetch */
    fetch(
      // "https://raw.githubusercontent.com/Vizzuality/growasia_calculator/master/public/vietnam.geojson"
      "../diaphantinhenglish.json"
    )
      .then((resp) => resp.json())
      .then((json) => setAllData(json));
  }, []);

  const querystringHandler = (findquery) => {
    setQuery(findquery);
    console.log(querystring)    
  }

  const search = (e) => {
    console.log('hey')
    e.preventDefault();
    setRes(MARKER.filter((obj) => obj.type == querystring))
  };

  const onHover = useCallback((event) => {
    const {
      features,
      srcEvent: { offsetX, offsetY },
    } = event;
    const hoveredFeature = features && features[0];

    setHoverInfo(
      hoveredFeature
        ? {
            feature: hoveredFeature,
            x: offsetX,
            y: offsetY,
          }
        : null
    );
    // console.log(hoverInfo);
  }, []);

  const data = allData;

  return (
    <>
      <MapGL
        {...viewport}
        width="100%"
        height="100%"
        mapStyle="https://tiles.goong.io/assets/goong_map_web.json"
        onViewportChange={setViewport}
        goongApiAccessToken={GOONG_MAPTILES_KEY}
        interactiveLayerIds={["data-fill", "data-line"]} // related to map-style.js
        onHover={onHover}
      >
        <Pins data={res} onClick={setPopupInfo} />
        {popupInfo && (
          <Popup
            tipSize={5}
            anchor="top"
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            closeOnClick={false}
            onClose={setPopupInfo}
          >
            <MarkerInfo info={popupInfo} />
          </Popup>
        )}

        <Source type="geojson" data={data}>
          <Layer {...fillLayer} />
          <Layer {...dataLayer} />
        </Source>
        {hoverInfo && (
          <div
            className="tooltip"
            style={{ left: hoverInfo.x, top: hoverInfo.y }}
          >
            <div>State: {hoverInfo.feature.properties.Name}</div>
            <div>Information:</div>
          </div>
        )}
        <div class="search-container">
        <form>
          <input type="text" placeholder="Search.." name="search" onChange={(e) => {querystringHandler(e.target.value)}}/>
          <button onClick={(e) => {search(e)}}>
            <i class="fa fa-search"></i>
          </button>
        </form>
      </div>
      </MapGL>
    </>
  );
}

export function renderToDom(container) {
  render(<App />, container);
}
