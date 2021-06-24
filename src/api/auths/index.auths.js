const AuthsHandler = require('./handler.auths');
const routes = require('./routes.auths');

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (
    server,
    {
      authsService, usersService, tokenManager, validator,
    },
  ) => {
    const authsHandler = new AuthsHandler(
      authsService,
      usersService,
      tokenManager,
      validator,
    );
    server.route(routes(authsHandler));
  },
};
