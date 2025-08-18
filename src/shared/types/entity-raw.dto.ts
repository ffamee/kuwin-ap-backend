interface RawEntity {
  entity_id: number;
  entity_name: string;
  building_id: number | null;
  building_name: string | null;
  location_id: number | null;
  location_name: string | null;
  configuration_id: number | null;
  created_at: string | null;
  last_seen_at: string | null;
  status: string | null;
  client_24: number | null;
  client_5: number | null;
  client_6: number | null;
  rx: bigint | null;
  tx: bigint | null;
  accesspoint_id: number | null;
  accesspoint_name: string | null;
  ip_id: number | null;
  ip_address: string | null;
}

interface OutputEntity {
  id: number;
  name: string;
  buildings: {
    id: number;
    name: string;
    configurations: {
      id: number;
      createdAt: string;
      lastSeenAt: string;
      status: string | null;
      client24: number | null;
      client5: number | null;
      client6: number | null;
      rx: bigint | null;
      tx: bigint | null;
      accesspoint: {
        id: number;
        name: string;
      } | null;
      ip: {
        id: number;
        ip: string;
      } | null;
      location: {
        id: number;
        name: string;
      } | null;
    }[];
  }[];
}
export { RawEntity, OutputEntity };
