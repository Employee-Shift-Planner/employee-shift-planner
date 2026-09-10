import { useEffect, useState } from "react";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import AvailabilityMatrix from "../components/availability/AvailabilityMatrix";
import { useAvailabilityMatrix, useSetAvailability } from "../api/availability";
import StateMessage, { QueryState } from "../components/ui/StateMessage";

export default function AvailabilityPage() {
  const [isEditing, setIsEditing] = useState(false);
  const matrix = useAvailabilityMatrix();
  const saveDay = useSetAvailability();
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (!isEditing) setDraft(null);
  }, [matrix.data, isEditing]);

  const beginEditing = () => {
    setDraft((matrix.data ?? []).map((row) => ({ ...row, days: row.days.map((day) => ({ ...day })) })));
    setIsEditing(true);
  };

  const toggleDay = (employeeId, dayIndex) => {
    setDraft((rows) => rows.map((row) => row.employeeId !== employeeId ? row : {
      ...row, days: row.days.map((day, index) => index === dayIndex ? { ...day, isAvailable: !day.isAvailable } : day),
    }));
  };

  const save = () => {
    const changes = [];
    draft.forEach((row) => row.days.forEach((day, index) => {
      const original = matrix.data.find((item) => item.employeeId === row.employeeId)?.days[index];
      if (original && original.isAvailable !== day.isAvailable) changes.push({ employeeId: row.employeeId, ...day });
    }));
    if (!changes.length) { setIsEditing(false); return; }
    saveDay.mutate(changes, { onSuccess: () => setIsEditing(false) });
  };

  return (
    <Shell
      active="Availability"
      title="Team Availability"
      copy="Review recurring availability and prevent conflicts."
      actions={
        isEditing ? <><Button tone="gray" disabled={saveDay.isPending} onClick={() => setIsEditing(false)}>Cancel</Button><Button disabled={saveDay.isPending} onClick={save}>{saveDay.isPending ? "Saving…" : "Save availability"}</Button></> : <Button onClick={beginEditing}>Edit availability</Button>
      }
    >
      <QueryState query={matrix} empty={{ title: "No employees yet", detail: "Add employees before setting availability." }}>
        {(rows) => <><AvailabilityMatrix rows={draft ?? rows} editable={isEditing && !saveDay.isPending} onToggle={toggleDay} />{saveDay.isError ? <StateMessage tone="error" title="Could not save availability" detail={saveDay.error?.message} /> : null}</>}
      </QueryState>
    </Shell>
  );
}
