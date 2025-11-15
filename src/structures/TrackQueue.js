const { DefaultQueue } = require('vulkava');

module.exports = class extends DefaultQueue {
  constructor() {
    super();
  }

  peek() {
    return this.tracks[0];
  }

  addToBeginning(track) {
    this.tracks.unshift(track)
  }

  areAllTracksFromUser(user) {
    for (const m of this.tracks) {
      if (m.requester !== user) return false;
    }
    return true;
  }

  removeTrackAt(index) {
    this.tracks.splice(index, 1);
  }

  getTrackAt(index) {
    return this.tracks[index];
  }

  getSongDetails(pos, pos2) {
    const data = [];

    for (; pos < pos2 && this.tracks[pos]; pos++) {
      const req = this.tracks[pos].requester;
      data.push(`${pos + 1}º - \`${this.tracks[pos].title}\` (Requisitado por \`${req.username}#${req.discriminator}\`)`)
    }
    return data.join('\n');
  }
}