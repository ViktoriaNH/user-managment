import { useEffect } from "react";
import { TOOLBAR_BUTTONS } from "./../../data/toolbar-buttons";
import initTooltips from "../../helpers/initTooltips";

const Toolbar = (props) => {
  const { onAction } = props;

  useEffect(() => {
    initTooltips();
  }, []);

  return (
    <div className="mb-4 d-flex justify-content-center gap-2 mt-3">
      {TOOLBAR_BUTTONS.map(({ id, label, title, icon }) => (
        <button
          key={id}
          type="button"
          className="btn btn-outline-primary d-flex align-items-center gap-2 px-3"
          title={title}
          data-bs-toggle="tooltip"
          onClick={() => onAction(id)}
        >
          {icon && <i className={`bi ${icon}`}></i>}
          {label && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
};

export default Toolbar;
