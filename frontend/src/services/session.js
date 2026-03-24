let token = null;
let currentUser = null;

export const setSession = ({ authToken, user }) => {
  token = authToken;
  currentUser = user;
};

export const setCurrentUser = user => {
  currentUser = user;
};

export const clearSession = () => {
  token = null;
  currentUser = null;
};

export const getToken = () => token;
export const getCurrentUser = () => currentUser;
