class Model extends Backbone.Model

    # Model keeps track of whether or not it's been fetched
    synced: false

    initialize: ->
        @on 'sync', => @synced = true

module.exports = Model
