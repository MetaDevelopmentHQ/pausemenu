import L from "leaflet";

/**
 * GTA V world coordinate <-> map pixel (8192x8192 master image).
 * Constants measured from the axis lines of the "grid" style:
 *   X=0 line at 3755.5 px, Y=0 line at 5524.5 px, 100 game units = 66 px.
 * Verified at: Legion Square, LSIA, Chiliad summit, Paleto PD, Sandy airfield, Vinewood sign.
 */
export const MAP_SIZE = 8192;
const ORIGIN_X = 3755.5;
const ORIGIN_Y = 5524.5;
const SCALE = 0.66;

/** Leaflet CRS: pixel space (at z5 one tile = 256 px -> 1/32 scale) */
export const GTA_CRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1 / 32, 0, 1 / 32, 0),
});

export const toLatLng = (x: number, y: number): L.LatLng => L.latLng(ORIGIN_Y - SCALE * y, ORIGIN_X + SCALE * x);

export const toWorld = (ll: L.LatLng): { x: number; y: number } => ({
  x: (ll.lng - ORIGIN_X) / SCALE,
  y: (ORIGIN_Y - ll.lat) / SCALE,
});

export const MAP_BOUNDS = L.latLngBounds([0, 0], [MAP_SIZE, MAP_SIZE]);
