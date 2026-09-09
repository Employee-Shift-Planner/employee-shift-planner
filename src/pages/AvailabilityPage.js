import { useState } from "react";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import AvailabilityMatrix from "../components/availability/AvailabilityMatrix";
import { useAvailabilityMatrix, useSetAvailability } from "../api/availability";
import { QueryState } from "../components/ui/StateMessage";

export default function AvailabilityPage() {
  const [isEditing, setIsEditing] = useState(false);
  const matrix = useAvailabilityMatrix();
  const saveDay = useSetAvailability();

  const toggleDay = (employeeId, dayIndex) => {
    const day = matrix.data?.find((row) => row.employeeId === employeeId)?.days[dayIndex];
    if (!day) return;
    saveDay.mutate({ employeeId, dayOfWeek: day.dayOfWeek, isAvailable: !day.isAvailable,
      startTime: day.startTime, endTime: day.endTime });
  };

  return (
    <Shell
      active="Availability"
      title="Team Availability"
      copy="Review recurring availability and prevent conflicts."
      actions={
        <Button onClick={() => setIsEditing((editing) => !editing)}>
          {isEditing ? "Save availability" : "Edit availability"}
        </Button>
      }
    >
      <QueryState query={matrix} empty={{ title: "No employees yet", detail: "Add employees before setting availability." }}>
        {(rows) => <AvailabilityMatrix rows={rows} editable={isEditing && !saveDay.isPending} onToggle={toggleDay} />}
      </QueryState>
    </Shell>
  );
}
