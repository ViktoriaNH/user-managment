import Header from "../../components/Header/Header";
import Greeting from "./../../components/Greeting/Greeting";
import UserTable from "../../components/UserTable/UserTable";
import Toolbar from "./../../components/Toolbar/index";

import Pagination from "./../../components/Pagination/index";
import useUsers from "../../hooks/useUsers";
import Alert from "../../components/Alert";
import usePagination from "../../hooks/usePaginatiom";

const Dashboard = () => {
  const { users, selectedUsers, setSelectedUsers, handleToolbarAction, alert } =
    useUsers();
  const { currentPage, totalPages, setCurrentPage, paginatedItems } =
    usePagination(users, 5);
     console.log("Dashboard mounted");
  return (
    <>
   
      <Header />
      <main className="container">
        <Greeting />
        <Toolbar onAction={handleToolbarAction} />
        <div className="mx-auto" style={{ maxWidth: "500px" }}>
          <Alert type="danger" text={alert} />
        </div>

        <UserTable
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          users={paginatedItems}
        />
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </main>
    </>
  );
};

export default Dashboard;
