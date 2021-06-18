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

  postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const songId = this._service.addSong(request.payload);
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
      response.code(400);
      return response;
    }
  }

  getSongsHandler() {
    const songs = this._service.getSongs();

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = this._service.getSongById(id);
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
      response.code(404);
      return response;
    }
  }

  putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { id } = request.params;
      this._service.editSongById(id, request.payload);
      return {
        status: 'success',
        message: 'Lagu berhasil diperbarui',
      };
    } catch (err) {
      const response = h.response({
        status: 'fail',
        message: err.message,
      });
      response.code(404);
      return response;
    }
  }

  deleteSongByIdHandler(request, h) {
    const { id } = request.params;

    try {
      this._service.deleteSongById(id);
      return {
        status: 'success',
        message: 'Lagu berhasil dihapus',
      };
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: 'Lagu gagal dihapus. Id tidak ditemukan',
      });
      response.code(404);
      return response;
    }
  }
}

module.exports = SongsHandler;
