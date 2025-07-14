import type GeoJSON from 'geojson';

interface MapPointProps {
  all_responses: string;
  first_response: number;
  cluster_color: string; 
}

interface MapClusterProps extends MapPointProps {
  cluster_id: number;
}

export type MapPointFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  MapPointProps
>;

export type MapPointFeature = GeoJSON.Feature<GeoJSON.Point, MapPointProps>;
export type MapClusterFeature = GeoJSON.Feature<GeoJSON.Point, MapClusterProps>;
