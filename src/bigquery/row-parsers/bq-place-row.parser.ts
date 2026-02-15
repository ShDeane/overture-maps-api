import { Place, PlaceWithBuilding } from "../../places/interfaces/place.interface"
import { parsePointToGeoJSON, parsePolygonToGeoJSON, parseWKTToGeoJSON } from "../../utils/geojson"

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
    sources: row.sources.list.map((source: any) => ({
      property: source.element.property,
      dataset: source.element.dataset,
      record_id: source.element.record_id,
      update_time: source.element.update_time,
      confidence: source.element.confidence ? parseFloat(source.element.confidence) : null,
    })),
    names: {
      primary: row.names.primary,
      common: row.names.common,
      rules: row.names.rules,
    },
    categories: {
      primary: row.categories?.primary,
      alternate: row.categories?.alternate?.split ? row.categories?.alternate?.split(',') : [],
    },
    confidence: parseFloat(row.confidence),
    websites: row.websites?.split ? row.websites.split(',') : [],
    socials: row.socials?.list ? row.socials.list.map((social: any) => social.element) : [],
    emails: row.emails?.split ? row.emails.split(',') : [],
    phones: row.phones?.list ? row.phones.list.map((phone: any) => phone.element) : [],
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
    })) : [],
    ext_distance: parseFloat(row.ext_distance),
    operating_status: row.operating_status || undefined,
    basic_category: row.basic_category || undefined,
    external_ids: {
      wikidata: row.external_ids?.list?.find((s: any) => s.element?.side?.toLowerCase() === 'wikidata' || s.element?.source?.toLowerCase() === 'wikidata')?.element?.value ||
        row.wikidata ||
        row.taxonomy?.wikidata ||
        row.tax_wikidata ||
        row.sources?.list?.find((s: any) => s.element?.dataset?.toLowerCase() === 'wikidata')?.element?.record_id ||
        undefined,
      wikipedia: row.external_ids?.list?.find((s: any) => s.element?.side?.toLowerCase() === 'wikipedia' || s.element?.source?.toLowerCase() === 'wikipedia')?.element?.value ||
        row.wikipedia ||
        row.taxonomy?.wikipedia ||
        row.tax_wikipedia ||
        row.sources?.list?.find((s: any) => s.element?.dataset?.toLowerCase() === 'wikipedia')?.element?.record_id ||
        undefined,
      osm: row.external_ids?.list?.find((s: any) => s.element?.side?.toLowerCase() === 'osm' || s.element?.source?.toLowerCase() === 'osm')?.element?.value ||
        row.sources?.list?.find((s: any) => s.element?.dataset?.toLowerCase() === 'osm')?.element?.record_id ||
        undefined,
      google_places: row.external_ids?.list?.find((s: any) => s.element?.side?.toLowerCase() === 'google' || s.element?.source?.toLowerCase() === 'google')?.element?.value ||
        row.sources?.list?.find((s: any) => s.element?.dataset?.toLowerCase() === 'google')?.element?.record_id ||
        undefined,
    },
    taxonomy: row.taxonomy ? {
      primary: row.taxonomy.primary || undefined,
      hierarchy: row.taxonomy?.hierarchy?.list?.map((h: any) => h.element) || [],
      alternates: row.taxonomy?.alternates?.list?.map((a: any) => a.element) || [],
      external_ids: {
        wikidata: row.taxonomy.wikidata || undefined,
      }
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