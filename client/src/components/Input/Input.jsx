import { getUID } from "bootstrap/js/dist/util/index";

const Input = (props) => {
  const { label, type, value, onChange } = props;

  const inputId = getUID("input");

  return (
    <div className="mb-3">
      <label htmlFor={inputId} className="form-label">
        {label}
      </label>

      <input
        id={inputId}
        type={type}
        className="form-control"
        required
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Input;
