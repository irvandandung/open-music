const PlaylistsHandler = require('./handler.playlists');
const routes = require('./routes.playlists');

module.exports = {
  name: 'playlists',
  version: '1.2.0',
  register: async (server, { service, validator }) => {
    const playlistsHandler = new PlaylistsHandler(service, validator);
    server.route(routes(playlistsHandler));
  },
};
