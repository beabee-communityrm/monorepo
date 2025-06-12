import { isMapBounds } from '@beabee/beabee-common';

import { describe, expect, test } from 'vitest';

describe('isMapBounds', () => {
  test('valid map bounds', () => {
    expect(
      isMapBounds([
        [0, 0],
        [180, 90],
      ])
    ).toBe(true);
  });

  test('valid map bounds with negative values', () => {
    expect(
      isMapBounds([
        [-180, -90],
        [180, 90],
      ])
    ).toBe(true);
  });

  test('invalid map bounds - not an array', () => {
    expect(isMapBounds('not an array')).toBe(false);
  });

  test('invalid map bounds - array with wrong length', () => {
    expect(isMapBounds([[0, 0]])).toBe(false);
  });

  test('invalid map bounds - array with wrong element type', () => {
    expect(isMapBounds([[0, 0], 'not a lnglat'])).toBe(false);
  });

  test('invalid map bounds - array with lnglat out of bounds', () => {
    expect(
      isMapBounds([
        [0, 0],
        [181, 90],
      ])
    ).toBe(false);
  });
});
