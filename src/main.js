require('dotenv').config();
const Hapi = require('@hapi/hapi');
const songs = require('./api/songs/index.songs');
const ClientError = require('./exceptions/ClientError');
const SongsService = require('./service/postgres/SongService.postgres');
const SongsValidator = require('./validator/songs');

const init = async () => {
  const songsService = new SongsService();
  const server = Hapi.Server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const responseError = h.response({
        status: 'fail',
        message: response.message,
      });
      responseError.code(response.statusCode);
      return responseError;
    }

    return response.continue || response;
  });

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  });

  await server.start();
  // eslint-disable-next-line no-console
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
