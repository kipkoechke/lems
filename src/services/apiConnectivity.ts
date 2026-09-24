/**
 * The shared equipment connectivity card.
 *
 * The same four numbers appear on all three dashboards — `admin`
 * (`counts.equipment_connectivity`), `vendor` and `facility`
 * (`equipment.by_connectivity`) — so the type and the component that renders
 * them live in one place.
 *
 * The figures are deliberately **not** mutually exclusive: `live` is a subset
 * of `linked`, and `linked + never_connected` is the total. `linked` keeps the
 * meaning it has as a filter on the equipment listings — "has reported at
 * least once" — rather than "is reachable now".
 */
export interface EquipmentConnectivity {
  /** Connected right now. */
  live: number;
  /** Has reported at least once (`last_seen_at` set). */
  linked: number;
  /** Never heard from — the un-pingable units. */
  never_connected: number;
  /** `linked + never_connected`. */
  total: number;
}
