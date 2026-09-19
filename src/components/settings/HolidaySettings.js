import { useEffect, useState } from "react";
import { useCreateHoliday, useDeleteHoliday, useHolidaySettings, useHolidays, useImportHolidays, useSaveHolidaySettings } from "../../api/holidays";
import Button from "../ui/Button";
import StateMessage from "../ui/StateMessage";
import "./HolidaySettings.css";

const year = new Date().getFullYear();
const emptyHoliday = { date: `${year}-01-01`, name: "", schedulingPolicy: "Warning" };

export default function HolidaySettings() {
  const settings = useHolidaySettings();
  const holidays = useHolidays(`${year}-01-01`, `${year + 1}-12-31`);
  const save = useSaveHolidaySettings();
  const importHolidays = useImportHolidays();
  const create = useCreateHoliday();
  const remove = useDeleteHoliday();
  const [location, setLocation] = useState({ countryCode: "JM", regionCode: "", autoImportEnabled: true });
  const [holiday, setHoliday] = useState(emptyHoliday);
  const [importYear, setImportYear] = useState(year);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (settings.data) setLocation({ ...settings.data, regionCode: settings.data.regionCode ?? "" });
  }, [settings.data]);

  const changeLocation = (field) => (event) => setLocation((value) => ({ ...value, [field]: event.target.type === "checkbox" ? event.target.checked : event.target.value.toUpperCase() }));
  const changeHoliday = (field) => (event) => setHoliday((value) => ({ ...value, [field]: event.target.value }));
  const saveLocation = (event) => {
    event.preventDefault();
    save.mutate(location, {
      onSuccess: () => {
        setMessage("Holiday location saved.");
        if (location.autoImportEnabled) importHolidays.mutate(importYear, { onSuccess: (result) => setMessage(`Location saved. Imported ${result.imported} holidays for ${result.year}.`) });
      },
    });
  };
  const addHoliday = (event) => {
    event.preventDefault();
    create.mutate(holiday, { onSuccess: () => { setHoliday(emptyHoliday); setMessage("Holiday added."); } });
  };
  const error = settings.error ?? holidays.error ?? save.error ?? importHolidays.error ?? create.error ?? remove.error;
  const busy = save.isPending || importHolidays.isPending || create.isPending || remove.isPending;

  return <section className="holiday-settings" aria-labelledby="holiday-settings-heading">
    <div className="holiday-settings-copy"><h2 id="holiday-settings-heading">Holidays and closures</h2><p>Import official public holidays by country and region, then add company or local dates manually.</p></div>
    {error ? <StateMessage tone="error" title="Could not manage holidays" detail={error.message} /> : null}
    {message ? <p className="holiday-settings-message" role="status">{message}</p> : null}
    <div className="holiday-settings-layout">
      <form className="card holiday-form" onSubmit={saveLocation}>
        <h3>Holiday location</h3>
        <label>Country code<input required minLength="2" maxLength="2" value={location.countryCode} onChange={changeLocation("countryCode")} placeholder="JM" /></label>
        <label>Region code (optional)<input maxLength="20" value={location.regionCode} onChange={changeLocation("regionCode")} placeholder="JM-01" /></label>
        <label className="holiday-checkbox"><input type="checkbox" checked={location.autoImportEnabled} onChange={changeLocation("autoImportEnabled")} /> Import when location is saved</label>
        <div className="holiday-import-row"><label>Year<input type="number" min="2000" max={year + 5} value={importYear} onChange={(event) => setImportYear(Number(event.target.value))} /></label><Button type="button" tone="gray" disabled={busy} onClick={() => importHolidays.mutate(importYear, { onSuccess: (result) => setMessage(`Imported ${result.imported} holidays for ${result.year}.`) })}>Import year</Button></div>
        <Button type="submit" disabled={busy}>{save.isPending ? "Saving…" : "Save location"}</Button>
      </form>
      <form className="card holiday-form" onSubmit={addHoliday}>
        <h3>Add a local holiday</h3>
        <label>Date<input required type="date" value={holiday.date} onChange={changeHoliday("date")} /></label>
        <label>Name<input required value={holiday.name} onChange={changeHoliday("name")} placeholder="Company closure" /></label>
        <label>Scheduling policy<select value={holiday.schedulingPolicy} onChange={changeHoliday("schedulingPolicy")}><option value="Warning">Warn planners</option><option value="Closed">Closed (confirm override)</option><option value="Normal">Information only</option></select></label>
        <Button type="submit" disabled={busy}>{create.isPending ? "Adding…" : "Add holiday"}</Button>
      </form>
    </div>
    <section className="card holiday-list"><h3>{year}–{year + 1} holidays</h3>{holidays.isPending ? <p>Loading holidays…</p> : null}{holidays.isSuccess && !holidays.data.length ? <p>No holidays configured.</p> : null}<ul>{(holidays.data ?? []).map((item) => <li key={item.id}><div><b>{item.date} · {item.name}</b><p>{item.schedulingPolicy} · {item.source}{item.regionCode ? ` · ${item.regionCode}` : ""}</p></div><button type="button" disabled={busy} onClick={() => window.confirm(`Delete ${item.name}?`) && remove.mutate(item.id)}>Delete</button></li>)}</ul></section>
  </section>;
}
