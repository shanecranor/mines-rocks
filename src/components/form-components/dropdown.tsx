import { Observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";

const Dropdown = observer(
  ({ options, state$ }: { options: string[] | readonly string[]; state$: Observable<string> }) => {
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      state$.set(e.target.value);
    };

    return (
      <select
        value={state$.get()}
        onChange={handleSelectChange}
        style={{ marginRight: "4px" }}
      >
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }
);

export default Dropdown;
