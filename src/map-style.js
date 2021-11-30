// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
export const dataLayer = {
  id: "data-line",
  type: "line",
  paint: {
    // "fill-outline-color": "#000",
    // "fill-color": "#fff",
    // "fill-opacity": 0.2,

    "line-width": 2,
    "line-color": "#0080ef",
  },
  // paint: {
  //   "fill-color": {
  //     property: "percentile",
  //     stops: [
  //       [0, "#3288bd"],
  //       [1, "#66c2a5"],
  //       [2, "#abdda4"],
  //       [3, "#e6f598"],
  //       [4, "#ffffbf"],
  //       [5, "#fee08b"],
  //       [6, "#fdae61"],
  //       [7, "#f46d43"],
  //       [8, "#d53e4f"],
  //     ],
  //   },
  //   "fill-opacity": 0.5,
  // },
};

export const fillLayer = {
  id: "data-fill",
  type: "fill",
  paint: {
    "fill-outline-color": "#0040c8",
    "fill-color": "#d53e4f",
    "fill-opacity": 0.2,
  },
};
