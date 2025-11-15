class Slash {
    constructor(client, options) {
      this.client = client
      this.name = options.name
      this.description = options.description
      this.description_localizations = options.description_localizations
      this.options = options.options
      this.type = options.type
    }
  }
  
  module.exports = Slash;
  