import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadUsers } from "../services/users";
import { handleActionEvent } from "../utils/handleActionEvent";
import { runUserAction } from "../utils/runUserActions";
import { checkStatusAndRedirect } from "../utils/checkStatusAndRedirect";
import { checkUserStatus } from "../utils/checkUserStatus";

const useUsers = (delay = 2000) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  // note: reload user list
  const reload = useCallback(async () => {
    try {
      const data = await loadUsers();
      setUsers(data);
    } catch (error) {
      setAlert?.("Failed to load list");
    }
  }, [setAlert]);

  // note: initial load
  useEffect(() => {
    reload();
  }, [reload]);

  // note: auto-hide alert after delay
  useEffect(() => {
    if (!alert) return;
    const id = setTimeout(() => setAlert(null), delay);
    return () => clearTimeout(id);
  }, [alert]);

  // note: handle toolbar actions like block/unblock/delete
  const handleToolbarAction = async (actionId) => {
    let event = null;

    const check = await checkUserStatus();

    if (!check.ok) {
      checkStatusAndRedirect(navigate, setAlert);
      return;
    }

    try {
      // note: runUserAction handles the actual action and returns event
      event = await runUserAction({
        selectedUsers,
        reload,
        navigate,
        setAlert,
      })(actionId, selectedUsers);
    } catch (err) {
      setAlert("Error");
    }

    // note: clear selection after action
    setSelectedUsers([]);

    if (event) {
      // note: show alert or redirect if needed
      await handleActionEvent(event, setAlert);
    }
  };

  return { users, selectedUsers, setSelectedUsers, handleToolbarAction, alert };
};

export default useUsers;
