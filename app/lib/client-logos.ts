export interface ClientLogoData {
  id: string;
  name: string;
  /** Uploaded logo image URL. Empty until the dashboard's Client Logos list has real entries. */
  logoUrl: string;
}

/** Static fallback shown until the dashboard's Client Logos list has entries. */
export const STATIC_CLIENT_LOGOS: ClientLogoData[] = [
  { id: "po-marinas", name: "P&O Marinas", logoUrl: "" },
  { id: "monili-jewellers", name: "Monili Jewellers", logoUrl: "" },
  { id: "scandinavian-physio", name: "Scandinavian Physiotherapy", logoUrl: "" },
  { id: "rocky-real-estate", name: "Rocky Real Estate", logoUrl: "" },
  { id: "nuraya-properties", name: "Nuraya Properties", logoUrl: "" },
  { id: "althea-diamonds", name: "Althea Diamonds", logoUrl: "" },
  { id: "vijit-pillai-art", name: "Vijit Pillai Art", logoUrl: "" },
  { id: "tip2gether", name: "Tip2Gether", logoUrl: "" },
];
