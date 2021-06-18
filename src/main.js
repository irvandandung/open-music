const Hapi = require('@hapi/hapi');
const songs = require('./api/songs');
const SongsService = require('./service/inMemory/SongsService');

const init = async () => {
  const songsService = new SongsService();
  const server = Hapi.Server({
    port: 1000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
    },
  });

  await server.start();
  // eslint-disable-next-line no-console
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
