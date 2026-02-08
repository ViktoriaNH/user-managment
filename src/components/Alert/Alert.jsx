const Alert = (props) => {
  const { type, text } = props;

  return text && <div className={`alert alert-${type}`}>{text}</div>;
};
export default Alert;
