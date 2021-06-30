const ClientError = require('../../exceptions/ClientError');

/* eslint-disable no-underscore-dangle */
class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this);
    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    this._validator.validatePostPlaylistPayload(request.payload);
    Object.assign(request.payload, { owner });
    const playlistId = await this._service.addPlaylist(request.payload);
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: owner } = request.auth.credentials;
    const playlists = await this._service.getPlaylistsByOwner(owner);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistHandler(request) {
    const { playlistId } = request.params;
    const { id: owner } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(playlistId, owner);
    await this._service.deletePlaylistById(playlistId);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postPlaylistSongHandler(request, h) {
    const { playlistId } = request.params;
    const { id: owner } = request.auth.credentials;
    this._validator.validatePostDeletePlaylistSongPayload(request.payload);
    await this._service.verifySongId(request.payload.songId);
    Object.assign(request.payload, { playlistId });
    await this._service.verifyPlaylistOwner(playlistId, owner);
    await this._service.addSongToPlaylist(request.payload);
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan di playlist',
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsHandler(request) {
    const { playlistId } = request.params;
    const { id: owner } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(playlistId, owner);
    const songs = await this._service.getPlaylistSongsByPlaylistId(playlistId);
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async deletePlaylistSongHandler(request) {
    const { playlistId } = request.params;
    const { id: owner } = request.auth.credentials;
    this._validator.validatePostDeletePlaylistSongPayload(request.payload);
    try {
      await this._service.verifySongId(request.payload.songId);
    } catch (e) {
      throw new ClientError(e.message);
    }
    await this._service.verifyPlaylistOwner(playlistId, owner);
    Object.assign(request.payload, { playlistId });
    await this._service.deletePlaylistSong(request.payload);
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistsHandler;
