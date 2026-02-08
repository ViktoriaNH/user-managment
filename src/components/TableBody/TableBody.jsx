import COLUMNS from "../../data/columns";
import { FormatDate } from "../../helpers/formatDate";

const TableBody = (props) => {
  const { users = [], selectedUsers = [], setSelectedUsers } = props;

  const toggleUserSelection = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((uid) => uid !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  // nota bene: if anything apears later, need another solution. I leave this for 3 type
  const renderCellContent = (column, value) => {
    if (column.type === "status") {
      return (
        <span className="badge rounded-pill bg-light text-dark border">
          {value}
        </span>
      );
    }

    if (column.type === "date") {
      return <span>{FormatDate(value)}</span>;
    }

    if (!column.type || column.type === "text") {
      return <span>{value ?? "-"}</span>;
    }
  };

  return (
    <tbody className="text-secondary fw-light">
      {users.map((user) => (
        <tr key={user.id} className="border-primary border-2">
          <td className="border-primary border-2">
            <input
              type="checkbox"
              checked={selectedUsers.includes(user.id)}
              onChange={() => toggleUserSelection(user.id)}
            />
          </td>

          {COLUMNS.map((column) => {
            const value = user[column.field];
            return (
              <td key={column.field} className="border-primary border-2">
                {renderCellContent(column, value)}
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  );
};

export default TableBody;
