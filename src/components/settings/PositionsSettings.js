import { useState } from "react";
import { useCreatePosition, usePositions } from "../../api/employees";
import Button from "../ui/Button";
import StateMessage from "../ui/StateMessage";
import "./PositionsSettings.css";

const EMPTY_POSITION = { title: "", description: "" };

export default function PositionsSettings() {
  const positions = usePositions();
  const createPosition = useCreatePosition();
  const [form, setForm] = useState(EMPTY_POSITION);
  const [createdTitle, setCreatedTitle] = useState("");

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setCreatedTitle("");
  };

  const submit = (event) => {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) return;

    createPosition.mutate(form, {
      onSuccess: () => {
        setCreatedTitle(title);
        setForm(EMPTY_POSITION);
      },
    });
  };

  return (
    <section className="positions-settings" aria-labelledby="positions-heading">
      <div className="positions-copy">
        <h2 id="positions-heading">Positions</h2>
        <p>Add the roles employees can be assigned to when building a schedule.</p>
      </div>

      <div className="positions-layout">
        <form className="card position-form" onSubmit={submit}>
          <h3>Add position</h3>
          <label htmlFor="position-title">
            Position title
            <input
              id="position-title"
              required
              maxLength="100"
              value={form.title}
              onChange={update("title")}
              placeholder="e.g. Shift supervisor"
            />
          </label>
          <label htmlFor="position-description">
            Description
            <textarea
              id="position-description"
              maxLength="500"
              rows="4"
              value={form.description}
              onChange={update("description")}
              placeholder="Describe the responsibilities for this position"
            />
            <span className="position-character-count">{form.description.length}/500</span>
          </label>

          {createPosition.isError ? (
            <StateMessage
              tone="error"
              title="Could not add position"
              detail={createPosition.error?.message}
            />
          ) : null}
          {createdTitle ? (
            <p className="position-success" role="status">{createdTitle} was added.</p>
          ) : null}

          <Button type="submit" disabled={createPosition.isPending || !form.title.trim()}>
            {createPosition.isPending ? "Adding…" : "Add position"}
          </Button>
        </form>

        <section className="card positions-list" aria-labelledby="existing-positions-heading">
          <h3 id="existing-positions-heading">Existing positions</h3>
          {positions.isPending ? <p>Loading positions…</p> : null}
          {positions.isError ? (
            <StateMessage tone="error" title="Could not load positions" detail={positions.error?.message} />
          ) : null}
          {positions.isSuccess && positions.data.length === 0 ? <p>No positions have been added yet.</p> : null}
          {positions.isSuccess && positions.data.length > 0 ? (
            <ul>
              {positions.data.map((position) => (
                <li key={position.positionId}>
                  <div>
                    <b>{position.title}</b>
                    {position.description ? <p>{position.description}</p> : null}
                  </div>
                  <span className={position.isActive ? "active" : "inactive"}>
                    {position.isActive ? "Active" : "Inactive"}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </section>
  );
}
