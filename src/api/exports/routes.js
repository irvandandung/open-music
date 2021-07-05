const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists',
    handler: handler.postExportPlaylistsHandler,
    options: {
      auth: 'openmusicapps_jwt',
    },
  },
];

module.exports = routes;
