// important: need sort by data, NOT by ALREADY formatted data
// note: many users cant login, so we sort by registration date

export const sortUsersByCreatedAt = (users = []) => {
  return [...users].sort((a, b) => {
    // nota bene: always use copy of array, React state must be immutable
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};


