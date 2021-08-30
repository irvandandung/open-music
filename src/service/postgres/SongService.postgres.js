const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBtoModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();

    this._cacheService = cacheService;
  }

  async addSong(data) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: 'INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7, $7) RETURNING id',
      values: [
        id,
        data.title,
        data.year,
        data.performer,
        data.genre,
        data.duration,
        createdAt,
      ],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }
    await this._cacheService.delete('songs');
    return result.rows[0].id;
  }

  async getSongs() {
    try {
      const result = await this._cacheService.get('songs');
      return JSON.parse(result);
    } catch (err) {
      const result = await this._pool.query('SELECT id, title, performer FROM songs');
      const dataMap = result.rows.map(mapDBtoModel);
      await this._cacheService.set('songs', JSON.stringify(dataMap));
      return dataMap;
    }
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapDBtoModel)[0];
  }

  async editSongById(id, data) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
      values: [
        data.title,
        data.year,
        data.performer,
        data.genre,
        data.duration,
        updatedAt,
        id,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
    await this._cacheService.delete('songs');
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
    await this._cacheService.delete('songs');
  }
}

module.exports = SongsService;
