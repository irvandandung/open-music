/* eslint-disable no-underscore-dangle */
class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const songId = await this._service.addSong(request.payload);
      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan',
        data: {
          songId,
        },
      });
      response.code(201);
      return response;
    } catch (err) {
      const response = h.response({
        status: 'fail',
        message: err.message,
      });
      response.code(err.statusCode);
      return response;
    }
  }

  async getSongsHandler() {
    const songs = await this._service.getSongs();
    // eslint-disable-next-line max-len
    const songsResult = songs.map((song) => ({ id: song.id, title: song.title, performer: song.performer }));
    return {
      status: 'success',
      data: {
        songs: songsResult,
      },
    };
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._service.getSongById(id);
      return {
        status: 'success',
        data: {
          song,
        },
      };
    } catch (err) {
      const response = h.response({
        status: 'fail',
        message: err.message,
      });
      response.code(err.statusCode);
      return response;
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { id } = request.params;
      await this._service.editSongById(id, request.payload);
      return {
        status: 'success',
        message: 'Lagu berhasil diperbarui',
      };
    } catch (err) {
      const response = h.response({
        status: 'fail',
        message: err.message,
      });
      response.code(err.statusCode);
      return response;
    }
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;

    try {
      await this._service.deleteSongById(id);
      return {
        status: 'success',
        message: 'Lagu berhasil dihapus',
      };
    } catch (err) {
      const response = h.response({
        status: 'fail',
        message: 'Lagu gagal dihapus. Id tidak ditemukan',
      });
      response.code(err.statusCode);
      return response;
    }
  }
}

module.exports = SongsHandler;
