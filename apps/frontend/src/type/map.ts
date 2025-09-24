import type { Feature, FeatureCollection, Point } from 'geojson';

export type MapPointFeature = Feature<Point>;
export type MapClusterFeature = Feature<Point>;

export type MapPointFeatureCollection = FeatureCollection<Point>;
