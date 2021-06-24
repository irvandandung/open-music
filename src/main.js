require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const ClientError = require('./exceptions/ClientError');
// Note
const SongsService = require('./service/postgres/SongService.postgres');
const SongsValidator = require('./validator/songs');
const songs = require('./api/songs/index.songs');
// User
const UsersService = require('./service/postgres/UserService.postgres');
const UsersValidator = require('./validator/users');
const users = require('./api/users/index.users');
// Auths
const authentications = require('./api/auths/index.auths');
const AuthsService = require('./service/postgres/AuthService.postgres');
const TokenManager = require('./tokenize/TokenManager');
const AuthsValidator = require('./validator/auths');

const init = async () => {
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authsService = new AuthsService();

  const server = Hapi.Server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('openmusicapps_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // console.log(response);
      let responseError = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      responseError.code(500);
      if (response instanceof ClientError) {
        responseError = h.response({
          status: 'fail',
          message: response.message,
        });
        responseError.code(response.statusCode);
      }

      if (response.output) {
        return response;
      }

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
    {
      plugin: authentications,
      options: {
        authsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthsValidator,
      },
    },
  ]);

  await server.start();
  // eslint-disable-next-line no-console
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
