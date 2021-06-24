require('dotenv').config();
const Hapi = require('@hapi/hapi');
const ClientError = require('./exceptions/ClientError');
// Note
const SongsService = require('./service/postgres/SongService.postgres');
const SongsValidator = require('./validator/songs');
const songs = require('./api/songs/index.songs');
// User
const UsersService = require('./service/postgres/UsersService.postgres');
const UsersValidator = require('./validator/users');
const users = require('./api/users/index.users');

const init = async () => {
  const songsService = new SongsService();
  const usersService = new UsersService();
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

    if (response instanceof Error) {
      // console.log(response);
      let responseError = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      if (response instanceof ClientError) {
        responseError = h.response({
          status: 'fail',
          message: response.message,
        });
      }
      responseError.code(response.statusCode);
      return responseError;
    }

    return response.continue || response;
  });

  await server.register([
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
  ]);

  await server.start();
  // eslint-disable-next-line no-console
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
