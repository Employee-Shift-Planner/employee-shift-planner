import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import "./EmailPreview.css";

/** Preview of the email an employee receives when their shift changes. */
export default function EmailPreview({ preview }) {
  const navigate = useNavigate();

  return (
    <section className="card email">
      <h2>Email preview</h2>
      <p>{preview.subject}</p>
      <p>{preview.body}</p>
      <Button onClick={() => navigate("/schedule")}>{preview.action}</Button>
    </section>
  );
}
