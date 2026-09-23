export interface ClientLogoData {
  id: string;
  name: string;
  initials: string;
  bg: string;
  light: boolean;
}

/** Static fallback shown until the dashboard's Client Logos list has entries. */
export const STATIC_CLIENT_LOGOS: ClientLogoData[] = [
  { id: "po-marinas", name: "P&O Marinas", initials: "P&O", bg: "#c0d4ec", light: false },
  { id: "monili-jewellers", name: "Monili Jewellers", initials: "MJ", bg: "#d9d4cd", light: false },
  { id: "scandinavian-physio", name: "Scandinavian Physiotherapy", initials: "SPC", bg: "#bcd9ee", light: false },
  { id: "rocky-real-estate", name: "Rocky Real Estate", initials: "RRE", bg: "#d5d2cd", light: false },
  { id: "nuraya-properties", name: "Nuraya Properties", initials: "NP", bg: "#ddd9c0", light: false },
  { id: "althea-diamonds", name: "Althea Diamonds", initials: "AD", bg: "#e2ded8", light: false },
  { id: "vijit-pillai-art", name: "Vijit Pillai Art", initials: "VPA", bg: "#ddd8d0", light: false },
  { id: "tip2gether", name: "Tip2Gether", initials: "T2G", bg: "#1e4832", light: true },
];
