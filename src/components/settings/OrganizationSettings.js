import { useEffect, useRef, useState } from "react";
import { isAdministrator } from "../../api/auth";
import { useOrganizationSettings, useSaveOrganizationSettings } from "../../api/organization";
import Button from "../ui/Button";
import StateMessage from "../ui/StateMessage";
import SaveFeedback from "../ui/SaveFeedback";
import "./OrganizationSettings.css";

const CURRENCIES = { JM:"JMD", US:"USD", CA:"CAD", GB:"GBP", TT:"TTD", BB:"BBD", BS:"BSD", KY:"KYD", AU:"AUD", NZ:"NZD", IN:"INR", JP:"JPY", CN:"CNY", DE:"EUR", FR:"EUR", ES:"EUR", IT:"EUR", NL:"EUR" };
const ZONE_COUNTRIES = { "America/Jamaica":"JM", "America/New_York":"US", "America/Toronto":"CA", "Europe/London":"GB", "Asia/Kolkata":"IN", "Asia/Tokyo":"JP", "Australia/Sydney":"AU" };
const localeCountry = () => {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale || navigator.language || "";
  return locale.match(/[-_]([A-Z]{2})\b/i)?.[1]?.toUpperCase();
};
const locate = () => new Promise(resolve => {
  if (!navigator.geolocation) return resolve({ latitude:null, longitude:null });
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => resolve({ latitude:coords.latitude, longitude:coords.longitude }),
    () => resolve({ latitude:null, longitude:null }),
    { enableHighAccuracy:false, timeout:8000, maximumAge:3600000 });
});
const detectedSettings = async () => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Jamaica";
  const countryCode = ZONE_COUNTRIES[timeZone] || localeCountry() || "JM";
  const coordinates = await locate();
  return { locationName:coordinates.latitude == null ? countryCode : `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`,
    countryCode, regionCode:null, timeZone, currency:CURRENCIES[countryCode] || "USD", ...coordinates };
};

export default function OrganizationSettings() {
  const administrator = isAdministrator();
  const settings = useOrganizationSettings();
  const save = useSaveOrganizationSettings();
  const [form, setForm] = useState(null);
  const detectionStarted = useRef(false);

  useEffect(() => { if (settings.data) setForm({ ...settings.data, regionCode:settings.data.regionCode ?? "" }); }, [settings.data]);
  useEffect(() => {
    if (!administrator || !settings.data || settings.data.isConfigured || detectionStarted.current) return;
    detectionStarted.current = true;
    detectedSettings().then(value => { setForm(value); save.mutate(value); });
  }, [administrator, settings.data]); // eslint-disable-line react-hooks/exhaustive-deps
  const change = field => event => { save.reset(); setForm(value => ({ ...value, [field]:event.target.value })); };
  const submit = event => { event.preventDefault(); save.mutate({ ...form, countryCode:form.countryCode.toUpperCase(), currency:form.currency.toUpperCase(), regionCode:form.regionCode || null }); };

  if (settings.isPending || !form) return <section className="card organization-settings"><p>Loading organization settings…</p></section>;
  if (settings.isError) return <StateMessage tone="error" title="Could not load organization settings" detail={settings.error?.message} />;
  return <section className="organization-settings" aria-labelledby="organization-settings-heading">
    <div><h2 id="organization-settings-heading">Organization defaults</h2><p>Location, timezone and currency used by scheduling, holidays and reports.</p></div>
    {!form.isConfigured && administrator ? <p className="organization-detection">Detecting your location and regional defaults… Your browser may request location permission.</p> : null}
    {!administrator ? <p className="organization-readonly">Only administrators can change these organization-wide settings.</p> : null}
    <form className="card organization-form" onSubmit={submit}>
      <label>Location<input required maxLength="120" disabled={!administrator || save.isPending} value={form.locationName} onChange={change("locationName")} placeholder="Kingston office" /></label>
      <label>Country code<input required minLength="2" maxLength="2" disabled={!administrator || save.isPending} value={form.countryCode} onChange={change("countryCode")} /></label>
      <label>Region code<input maxLength="20" disabled={!administrator || save.isPending} value={form.regionCode} onChange={change("regionCode")} placeholder="Optional" /></label>
      <label>Timezone<input required maxLength="100" disabled={!administrator || save.isPending} value={form.timeZone} onChange={change("timeZone")} placeholder="America/Jamaica" /></label>
      <label>Currency<input required minLength="3" maxLength="3" disabled={!administrator || save.isPending} value={form.currency} onChange={change("currency")} placeholder="JMD" /></label>
      {form.latitude != null ? <small>Detected coordinates: {Number(form.latitude).toFixed(4)}, {Number(form.longitude).toFixed(4)}</small> : null}
      {administrator ? <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save organization defaults"}</Button> : null}
    </form>
    <SaveFeedback mutation={save} success="Organization defaults saved." />
  </section>;
}
