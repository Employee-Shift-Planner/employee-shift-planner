import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import NextShiftCard from "../components/mobile/NextShiftCard";
import MobileShiftRow from "../components/mobile/MobileShiftRow";
import { MOBILE_GREETING, MOBILE_WEEK, NEXT_SHIFT } from "../data/mobile";
import "./MobilePage.css";

/** Employee-facing mobile view of their own schedule. */
export default function MobilePage() {
  const navigate = useNavigate();

  return (
    <div className="mobile">
      <header>
        <b>SHIFTLY</b>
        <h1>Hi, {MOBILE_GREETING.name}</h1>
        <p>{MOBILE_GREETING.date}</p>
      </header>
      <main>
        <h4>Your next shift</h4>
        <NextShiftCard shift={NEXT_SHIFT} />
        <Button onClick={() => navigate("/schedule")}>View details</Button>
        <h2>This week</h2>
        {MOBILE_WEEK.map((shift) => (
          <MobileShiftRow key={shift.id} {...shift} />
        ))}
      </main>
    </div>
  );
}
