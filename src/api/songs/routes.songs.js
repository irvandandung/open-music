const routes = (handler) => [
  {
    method: 'POST',
    path: '/songs',
    handler: handler.postSongHandler,
    options: {
      auth: 'openmusicapps_jwt',
    },
  },
  {
    method: 'GET',
    path: '/songs',
    handler: handler.getSongsHandler,
    options: {
      auth: 'openmusicapps_jwt',
    },
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    handler: handler.getSongByIdHandler,
    options: {
      auth: 'openmusicapps_jwt',
    },
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: handler.putSongByIdHandler,
    options: {
      auth: 'openmusicapps_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    handler: handler.deleteSongByIdHandler,
    options: {
      auth: 'openmusicapps_jwt',
    },
  },
];

module.exports = routes;
