import { sortUsersByCreatedAt } from "../../helpers/sortUsersByCreatedAt";
import TableBody from "../TableBody";
import TableHeader from "../TableHeader/TableHeader";

const UserTable = ({ users = [], selectedUsers, setSelectedUsers }) => {
  if (!users.length) {
    return <p className="text-center mt-5 text-muted">No users found</p>;
  }

  const sortedUsers = sortUsersByCreatedAt(users);

  return (
    <div className="table-responsive">
      <table className="table table-hover table-bordered border-primary shadow mb-0">
        <TableHeader
          users={users}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
        />
        <TableBody
          users={sortedUsers}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
        />
      </table>
    </div>
  );
};

export default UserTable;
