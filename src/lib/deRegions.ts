import iso3166 from "iso-3166-2";

export type RegionOption = { code: string; name: string };

export function getGermanStates(): RegionOption[] {
  const de = (iso3166 as any).country("DE"); // { name, code, sub: {...} }  :contentReference[oaicite:2]{index=2}
  const sub = de?.sub ?? {};

  return Object.entries(sub)
    // Germany states are DE-XX (two letters). Filter out anything unexpected.
    .filter(([code]) => /^DE-[A-Z]{2}$/.test(code))
    .map(([code, v]: any) => ({ code, name: String(v?.name ?? code) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
