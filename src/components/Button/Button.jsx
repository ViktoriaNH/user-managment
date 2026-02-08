const Button = (props) => {
  const { text, onClick, variant = "primary", type = "button" } = props;

  return (
    <button type={type} className={`btn btn-${variant}`} onClick={onClick}>
      {text}
    </button>
  );
};

export default Button;
