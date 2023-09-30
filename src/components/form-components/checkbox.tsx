"use client";
import { Observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";

const Checkbox = observer(
  ({ label, state$ }: { label: string; state$: Observable<boolean> }) => {
    return (
      <label>
        <input
          type="checkbox"
          name={label}
          value={label}
          checked={state$.get()}
          style={{ marginRight: "4px" }}
          onClick={() => state$.set(!state$.peek())}
        />
        {label}
      </label>
    );
  }
);
export default Checkbox;
