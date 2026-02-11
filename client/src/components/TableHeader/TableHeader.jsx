import COLUMNS from "../../data/columns";

const TableHeader = ({ users = [], selectedUsers = [], setSelectedUsers }) => {
  const total = users.length;
  const selected = selectedUsers.length;

  const allSelected = total > 0 && selected === total; // note: check if all users selected

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = users.map((user) => user.id);
      setSelectedUsers(allIds);
    } else {
      setSelectedUsers([]);
    }
  };

  return (
    <thead className="bg-transparent">
      <tr className="border-primary border-2">
        <th scope="col" className="bg-transparent text-secondary">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
          />
        </th>

        {COLUMNS.map((column) => (
          <th
            key={column.field}
            scope="col"
            className="fw-bold bg-transparent border-primary border-2 text-muted"
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
