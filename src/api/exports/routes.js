const routes = (handler) => [
  {
    method: 'POST',
    path: '/exports/playlists/{playlistId}',
    handler: handler.postExportPlaylistsHandler,
    options: {
      auth: 'openmusicapps_jwt',
    },
  },
];

module.exports = routes;
