const getUser = (users, id) => users.find((user) => user.id === id);

module.exports = getUser;
