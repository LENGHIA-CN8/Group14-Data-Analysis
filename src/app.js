import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { render } from "react-dom";
import MapGL, { Source, Layer, Popup } from "@goongmaps/goong-map-react";

import { dataLayer, fillLayer } from "./map-style.js";
import MARKER from "../Marker.json";
import PROVINCE_DATA from "../data.json";
import PROVINCE_DATA_OBJECT from "../data_object.json";

import Pins from "./Pin";
import MarkerInfo from "./marker-info";
import Modal from "./Popup.js";


const GOONG_MAPTILES_KEY = "tmyyAd6dtIRTHH3RNODMx6RrrdMCT9lXELg2W7o0"; // Set your goong maptiles key here
const GOONG_KEY = "YhE9WtgV0dscaDbxy2YQ6N3dIclw1AP8zirOvWqI";

export default function App() {
  const [viewport, setViewport] = useState({
    // zoom at launch
    latitude: 16,
    longitude: 107,
    zoom: 5.5,
    bearing: 0,
    pitch: 0,
  });
  const [querystring, setQuery] = useState("cảng đồng tháp");
  const [url, setURL] = useState(null);
  const [res, setRes] = useState([]);
  // const [resfilter, setFilter] = useState([]);
  const [popupInfo, setPopupInfo] = useState(null);
  const [allData, setAllData] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickInfo, setClickInfo] = useState();

  useEffect(() => {
    /* global fetch */
    fetch("../diaphantinhenglish.json")
      .then((resp) => resp.json())
      .then((json) => setAllData(json));
  }, []);
  useEffect(() => {
    setRes([]);
    console.log(url);
    querystring &&
      fetch(url)
        .then((resp) => resp.json())
        .then((json) => json)
        .then((j) => {
          console.log(j.predictions);
          j.predictions.map((x) => {
            fetch(
              "https://rsapi.goong.io/Place/Detail?place_id=" +
                x.place_id +
                "&api_key=" +
                GOONG_KEY
            )
              .then((res) => res.json())
              .then((json) => {
                let a = {};
                a["latitude"] = json.result.geometry.location.lat;
                a["longitude"] = json.result.geometry.location.lng;
                a["name"] = json.result.name;
                a["address"] = json.result.formatted_address;
                setRes((res) => [...res, a]);
              });
            setTimeout(function () {}, 10000);
          });
          console.log("InSearching");
          filter();
        });
  }, [url]);

  const querystringHandler = (findquery) => {
    setQuery(findquery);
    console.log(querystring);
  };

  const filterstringHandler = (s) => {
    // e.preventDefault();
    console.log("EEEEEE", s);
    setRes(MARKER.filter((obj) => obj.type == s));
  };
  const filter = () => {
    const m = MARKER.filter((obj) => obj.type == querystring);
    console.log("filter");
    setRes((res) => [...res, ...m]);
    console.log(res)
  };

  const search = (e) => {
    e.preventDefault();
    // setRes(MARKER.filter((obj) => obj.type == querystring))
    setURL(
      "https://rsapi.goong.io/Place/AutoComplete?api_key="+GOONG_KEY+"&input=" +
        querystring
    );
  };

  const onHover = useCallback((event) => {
    const {
      features,
      srcEvent: { offsetX, offsetY },
    } = event;
    const hoveredFeature = features && features[0];
    const defaultInfo = {
      Name: hoveredFeature?.properties?.Name,
      // Population: "Unknown",
    };
    const provinceInfo =
      PROVINCE_DATA.Information.find(
        (data) => data.Name === hoveredFeature?.properties?.Name
      ) || defaultInfo;

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
    const {
      features,
      srcEvent: { offsetX, offsetY },
    } = event;
    const provinceName = features ? features[0].properties.Name : "";

    console.log({ features, offsetX, offsetY });
    setClickInfo(
      PROVINCE_DATA.Information.find((data) => data.Name === provinceName)
    );
    setIsModalOpen(true);
  };

  const ModalContent = ({ clickInfo }) => (
    <div>
      {clickInfo &&
        Object.entries(clickInfo).map(([key, val]) => (
          <p>{`${key}: ${val}`}</p>
        ))}
    </div>
  );

  const data = allData;
  // console.log(PROVINCE_DATA_OBJECT[`Tien Giang`]);
  return (
    <>
      {/* {console.log(res)} */}

      {isModalOpen && (
        <Modal
          content={<ModalContent clickInfo={clickInfo} />}
          handleClose={() => setIsModalOpen(false)}
        />
      )}
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
            <div>State: {hoverInfo.provinceInfo?.Name || ""}</div>
            {/* <div>Population: {hoverInfo.provinceInfo?.Population || ""}</div> */}

            {PROVINCE_DATA_OBJECT.hasOwnProperty(
              `${hoverInfo.provinceInfo?.Name}`
            ) && (
              <div>
                <div>
                  Diện tích toàn thành phố:
                  {
                    PROVINCE_DATA_OBJECT[`${hoverInfo.provinceInfo?.Name}`][
                      "dien_tich"
                    ]["toan_thanh_pho"]
                  }
                </div>
                <div>
                  Nhiệt độ trung bình:
                  {
                    PROVINCE_DATA_OBJECT[`${hoverInfo.provinceInfo?.Name}`][
                      "khi_hau"
                    ]["nhiet_do_trung_binh"]
                  }
                </div>
                <div>
                  Độ ẩm trung bình:
                  {
                    PROVINCE_DATA_OBJECT[`${hoverInfo.provinceInfo?.Name}`][
                      "khi_hau"
                    ]["do_am"]
                  }
                </div>
              </div>
            )}
          </div>
        )}
        <div className="search-container">
          <form>
            <input
              type="text"
              placeholder="Search.."
              name="search"
              onChange={(e) => {
                querystringHandler(e.target.value);
              }}
            />
            <button
              onClick={(e) => {
                search(e);
              }}
            >
              <i className="fa fa-search"></i>
            </button>
          </form>
        </div>
        <div class="custom-select">
          <select
            onChange={(e) => {
              filterstringHandler(e.target.value);
            }}
          >
            <option value={null}></option>
            <option value={"cảng"}>Cảng</option>
            <option value="điện lực">Điện lực</option>
            <option value="cấp nước">Cấp nước</option>
            <option value="xử lí nước thải">Xử lí nước thải</option>
            <option value="bưu chính">Bưu chính</option>
            <option value="khu công nghiệp">Khu công nghiệp</option>
            <option value="trường học">Trường học</option>
          </select>
        </div>
      </MapGL>
    </>
  );
}

export function renderToDom(container) {
  render(<App />, container);
}
