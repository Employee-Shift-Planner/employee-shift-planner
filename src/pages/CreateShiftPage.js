import { useNavigate } from "react-router-dom";
import Shell from "../components/layout/Shell";
import Button from "../components/ui/Button";
import ShiftDetailsCard from "../components/schedule/ShiftDetailsCard";
import AssignEmployees from "../components/schedule/AssignEmployees";
import ConflictBanner from "../components/schedule/ConflictBanner";
import {
  ASSIGNMENT_CANDIDATES,
  ASSIGNMENT_CONFLICT,
  SHIFT_DRAFT,
} from "../data/shifts";
import "./CreateShiftPage.css";

export default function CreateShiftPage() {
  const navigate = useNavigate();
  const backToSchedule = () => navigate("/schedule");

  return (
    <Shell
      active="Schedule"
      title="Create shift"
      copy="Assign qualified employees and resolve conflicts before publishing."
    >
      <div className="create">
        <ShiftDetailsCard shift={SHIFT_DRAFT} />
        <div>
          <AssignEmployees candidates={ASSIGNMENT_CANDIDATES} />
          <ConflictBanner {...ASSIGNMENT_CONFLICT} />
          <div className="end">
            <Button tone="gray" onClick={backToSchedule}>
              Cancel
            </Button>
            <Button onClick={backToSchedule}>Create shift</Button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
