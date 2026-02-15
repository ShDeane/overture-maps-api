import { Place, PlaceWithBuilding } from "../../places/interfaces/place.interface"
import { parsePointToGeoJSON, parseWKTToGeoJSON } from "../../utils/geojson"

/**
 * Search the sources and external_ids arrays for a matching dataset/source key.
 * Does NOT look at top-level aliases — callers handle scoped fields (brand.wikidata etc.) directly.
 */
const findIdInArrays = (row: any, datasetKey: string): string | undefined => {
  const k = datasetKey.toLowerCase();

  // Check external_ids array: BQ shape {list: [{element: {side, value}}]} or flat array
  const externalIds = row.external_ids;
  if (externalIds) {
    const items = Array.isArray(externalIds) ? externalIds : (externalIds.list || []);
    const match = items.find((i: any) => {
      const item = i.element || i;
      return (item.side || item.source || '').toLowerCase() === k;
    });
    const el = match?.element || match;
    if (el?.value) return el.value;
  }

  // Check sources array for matching dataset
  const sources = row.sources;
  if (sources) {
    const items = Array.isArray(sources) ? sources : (sources.list || []);
    const match = items.find((i: any) => {
      const item = i.element || i;
      return (item.dataset || '').toLowerCase() === k;
    });
    const el = match?.element || match;
    if (el?.record_id) return el.record_id;
  }

  return undefined;
};

export const parsePlaceRow = (row: any): Place => {

  return {
    id: row.id,
    geometry: parsePointToGeoJSON(row.geometry.value),
    bbox: {
      xmin: parseFloat(row.bbox.xmin),
      xmax: parseFloat(row.bbox.xmax),
      ymin: parseFloat(row.bbox.ymin),
      ymax: parseFloat(row.bbox.ymax),
    },
    version: row.version,
    sources: row.sources?.list ? row.sources.list.map((source: any) => ({
      property: source.element.property,
      dataset: source.element.dataset,
      record_id: source.element.record_id,
      update_time: source.element.update_time,
      confidence: source.element.confidence ? parseFloat(source.element.confidence) : null,
    })) : (Array.isArray(row.sources) ? row.sources.map((s: any) => ({
      property: s.property,
      dataset: s.dataset,
      record_id: s.record_id,
      update_time: s.update_time,
      confidence: s.confidence ? parseFloat(s.confidence) : null,
    })) : []),
    names: {
      primary: row.names.primary,
      common: row.names.common,
      rules: row.names.rules,
    },
    categories: {
      primary: row.categories?.primary,
      alternate: row.categories?.alternate?.list
        ? row.categories.alternate.list.map((a: any) => a.element)
        : (Array.isArray(row.categories?.alternate) ? row.categories.alternate
        : (row.categories?.alternate?.split ? row.categories.alternate.split(',') : [])),
    },
    confidence: parseFloat(row.confidence),
    websites: row.websites?.split ? row.websites.split(',') : [],
    socials: row.socials?.list ? row.socials.list.map((social: any) => social.element) : (Array.isArray(row.socials) ? row.socials : []),
    emails: row.emails?.split ? row.emails.split(',') : [],
    phones: row.phones?.list ? row.phones.list.map((phone: any) => phone.element) : (Array.isArray(row.phones) ? row.phones : []),
    brand: row.brand ? {
      names: {
        primary: row.brand?.names?.primary,
        common: row.brand?.names?.common,
        rules: row.brand?.names?.rules,
      },
      external_ids: {
        wikidata: row.brand?.wikidata || row.brand_wikidata || undefined,
      },
    } : undefined,
    addresses: row.addresses?.list ? row.addresses?.list.map((address: any) => ({
      freeform: address.element?.freeform,
      locality: address.element?.locality,
      postcode: address.element?.postcode,
      region: address.element?.region,
      country: address.element?.country,
    })) : (Array.isArray(row.addresses) ? row.addresses.map((a: any) => ({
      freeform: a.freeform,
      locality: a.locality,
      postcode: a.postcode,
      region: a.region,
      country: a.country,
    })) : []),
    ext_distance: parseFloat(row.ext_distance),
    operating_status: row.operating_status || undefined,
    basic_category: row.basic_category || undefined,
    external_ids: {
      wikidata: row.wikidata || findIdInArrays(row, 'wikidata') || undefined,
      wikipedia: row.wikipedia || findIdInArrays(row, 'wikipedia') || undefined,
      osm: findIdInArrays(row, 'osm') || undefined,
      google_places: findIdInArrays(row, 'google') || undefined,
    },
    taxonomy: row.taxonomy ? {
      primary: row.taxonomy.primary || undefined,
      hierarchy: row.taxonomy?.hierarchy?.list?.map((h: any) => h.element) || (Array.isArray(row.taxonomy?.hierarchy) ? row.taxonomy.hierarchy : []),
      alternates: row.taxonomy?.alternates?.list?.map((a: any) => a.element) || (Array.isArray(row.taxonomy?.alternates) ? row.taxonomy.alternates : []),
    } : undefined,
  }
}

export const parsePlaceWithBuildingRow = (row: any): PlaceWithBuilding => {

  const place = parsePlaceRow(row)
  const building = {
    id: row.building_id,
    distance: parseFloat(row.distance_to_nearest_building),
    geometry: parseWKTToGeoJSON(row.building_geometry.value),

  }
  return {
    ...place,
    building,
  }
}