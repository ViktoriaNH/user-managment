export const isSelfIncluded = (currentUserId, selectedUsers = []) =>
  Boolean(
    currentUserId &&
    selectedUsers.some((id) => String(id) === String(currentUserId)),
  );
