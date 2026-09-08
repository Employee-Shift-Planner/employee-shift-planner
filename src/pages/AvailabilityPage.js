import { useState } from "react";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import AvailabilityMatrix from "../components/availability/AvailabilityMatrix";
import { TEAM_AVAILABILITY } from "../data/availability";

export default function AvailabilityPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [rows, setRows] = useState(TEAM_AVAILABILITY);

  const toggleDay = (employeeId, dayIndex) => {
    setRows((current) =>
      current.map((row) =>
        row.employeeId === employeeId
          ? {
              ...row,
              days: row.days.map((day, index) =>
                index === dayIndex ? !day : day
              ),
            }
          : row
      )
    );
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
      <AvailabilityMatrix
        rows={rows}
        editable={isEditing}
        onToggle={toggleDay}
      />
    </Shell>
  );
}
