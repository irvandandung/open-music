require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const ClientError = require('./exceptions/ClientError');
// Note
const SongsService = require('./service/postgres/SongService.postgres');
const SongsValidator = require('./validator/songs');
const songs = require('./api/songs/index.songs');
// Playlist
const PlaylistsService = require('./service/postgres/PlaylistService.postgres');
const PlaylistsValidator = require('./validator/playlists');
const playlists = require('./api/playlists/index.playlists');
// User
const UsersService = require('./service/postgres/UserService.postgres');
const UsersValidator = require('./validator/users');
const users = require('./api/users/index.users');
// Collaboration
const CollaborationsService = require('./service/postgres/CollaborationsService.postgre');
const CollaborationsValidator = require('./validator/collaborations');
const collaborations = require('./api/collaborations/index.collab');
// Auths
const authentications = require('./api/auths/index.auths');
const AuthsService = require('./service/postgres/AuthService.postgres');
const TokenManager = require('./tokenize/TokenManager');
const AuthsValidator = require('./validator/auths');

const init = async () => {
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authsService = new AuthsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);

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

  await server.register([
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
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
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
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
