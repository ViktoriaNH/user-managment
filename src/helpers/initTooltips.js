import { Tooltip } from "bootstrap";

const initTooltips = () => {
  const elements = document.querySelectorAll('[data-bs-toggle="tooltip"]');

  [...elements].forEach((el) => new Tooltip(el));
};

export default initTooltips;
