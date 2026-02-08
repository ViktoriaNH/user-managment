export const FormatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  return date.toLocaleString("en-US", {
    // important: we need use month in text format (Feb, Mar) for english ui
    day: "2-digit",
    month: "short",
    year: "numeric",

    // note: we use format AM/PM because this is standard for en-US locale
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};


