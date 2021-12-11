import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { render } from "react-dom";
import MapGL, { Source, Layer, Popup } from "@goongmaps/goong-map-react";

import { dataLayer, fillLayer } from "./map-style.js";
import MARKER from "../Marker.json";
import PROVINCE_DATA from "../data.json";
import Pins from "./Pin";
import MarkerInfo from "./marker-info";
import Modal from "./Popup.js";


const GOONG_MAPTILES_KEY = "pUhXgHuCZYAftRhPuN8q8icCOaynIICbUTBFyrDE"; // Set your goong maptiles key here
const GOONG_KEY = "gpfhyElUCPDsvyc9ZN7qGiH60hsqHDrZLqyIHuSq";

export default function App() {
  const [viewport, setViewport] = useState({
    // zoom at launch
    latitude: 16,
    longitude: 107,
    zoom: 5.5,
    bearing: 0,
    pitch: 0,
  });
  const [querystring, setQuery] = useState('cảng đồng tháp');
  const [url, setURL] = useState(null);
  const [res, setRes] = useState([]);
  const [popupInfo, setPopupInfo] = useState(null);
  const [allData, setAllData] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickInfo, setClickInfo] = useState();

  useEffect(() => {
    /* global fetch */
    fetch(
      // "https://raw.githubusercontent.com/Vizzuality/growasia_calculator/master/public/vietnam.geojson"
      "../diaphantinhenglish.json"
    )
      .then((resp) => resp.json())
      .then((json) => setAllData(json));
  }, []);
  useEffect(() => {
      setRes([])
      console.log(url)
      querystring && fetch(
        url
      )
      .then((resp) => resp.json())
      .then((json) => json)
      .then((j) => {
        console.log(j.predictions)
        j.predictions.map((x) => {
          fetch("https://rsapi.goong.io/Place/Detail?place_id="+x.place_id+"&api_key="+GOONG_KEY)
          .then((res) => res.json())
          .then((json) => setRes(res => [...res,json.result]))
          setTimeout(function(){
          }, 1000); 
        })
      });
  //     setplaceid(result)
  }, [url]);

  const querystringHandler = (findquery) => {
    setQuery(findquery);
    console.log(querystring)
  }

  const search = (e) => {
    console.log('InSearching')
    e.preventDefault();
    // setRes(MARKER.filter((obj) => obj.type == querystring))
    setURL("https://rsapi.goong.io/Place/AutoComplete?api_key=gpfhyElUCPDsvyc9ZN7qGiH60hsqHDrZLqyIHuSq&input="+querystring)
  };

  const onHover = useCallback((event) => {
    const {
      features,
      srcEvent: { offsetX, offsetY },
    } = event;
    const hoveredFeature = features && features[0];
    const defaultInfo = {
      Name: hoveredFeature.properties.Name,
      Population: 'Unknown'
    }
    const provinceInfo = PROVINCE_DATA.Information.find(data => data.Name === hoveredFeature.properties.Name) || defaultInfo;

    setHoverInfo(
      hoveredFeature
        ? {
          provinceInfo,
          x: offsetX,
          y: offsetY,
        }
        : null
    );
  }, []);

  const handleOnProvinceClick = (event) => {
    const { features, srcEvent: { offsetX, offsetY } } = event;
    const provinceName = features ? features[0].properties.Name : ''

    console.log({ features, offsetX, offsetY });
    setClickInfo(PROVINCE_DATA.Information.find(data => data.Name === provinceName));
    setIsModalOpen(true);
  }

  const ModalContent = ({ clickInfo }) => (
    <div>
      {
        clickInfo
        && Object.entries(clickInfo).map(([key, val]) => (
          <p>{`${key}: ${val}`}</p>
        ))
      }
    </div>
  );

  const data = allData;

  return (
    <>
    {/* {console.log(res)} */}
      {
        isModalOpen
        && (
          <Modal
            content={
              <ModalContent clickInfo={clickInfo} />
            }
            handleClose={() => setIsModalOpen(false)}
          />
        )
      }
      <MapGL
        {...viewport}
        width="100%"
        height="100%"
        mapStyle="https://tiles.goong.io/assets/goong_map_web.json"
        onViewportChange={setViewport}
        goongApiAccessToken={GOONG_MAPTILES_KEY}
        interactiveLayerIds={["data-fill", "data-line"]} // related to map-style.js
        onHover={onHover}
        onClick={handleOnProvinceClick}
      >
        <Pins data={res} onClick={setPopupInfo} />
        {popupInfo && (
          <Popup
            tipSize={5}
            anchor="top"
            longitude={popupInfo.geometry.location.lng}
            latitude={popupInfo.geometry.location.lat}
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
          <div className="tooltip" style={{ left: hoverInfo.x, top: hoverInfo.y }}>

            <div>State: {hoverInfo.provinceInfo?.Name || ''}</div>
            <div>Population: {hoverInfo.provinceInfo?.Population || ''}</div>
          </div>
        )}
        <div class="search-container">
          <form>
            <input type="text" placeholder="Search.." name="search" onChange={(e) => { querystringHandler(e.target.value) }} />
            <button onClick={(e) => { search(e) }}>
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