import { parsePlaceRow } from './bq-place-row.parser';

const base = {
  id: 'p1',
  geometry: { value: 'POINT(145.1 -37.7)' },
  names: { primary: 'Monty Cafe' },
  confidence: '0.9',
  bbox: { xmin: 145.1, xmax: 145.1, ymin: -37.7, ymax: -37.7 },
};

describe('parsePlaceRow categories', () => {
  it('reads the 2026-09 `taxonomy` field into the `categories` shape', () => {
    const place = parsePlaceRow({
      ...base,
      taxonomy: { primary: 'cafe', alternates: { list: [{ element: 'coffee_shop' }] } },
    });
    expect(place.categories).toEqual({ primary: 'cafe', alternate: ['coffee_shop'] });
  });

  it('still reads the old `categories` field', () => {
    const place = parsePlaceRow({
      ...base,
      categories: { primary: 'bakery', alternate: { list: [{ element: 'cafe' }] } },
    });
    expect(place.categories).toEqual({ primary: 'bakery', alternate: ['cafe'] });
  });
});
