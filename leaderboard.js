PlayersList = new Meteor.Collection('players');


if (Meteor.isClient) {
  Meteor.subscribe("thePlayers");
  Template.leaderboard.helpers({
    player: function () {
      return PlayersList.find({}, {sort:{score:-1, name:1}});
    },
    count: function() {
      return PlayersList.find().count();
    },
    selectedClass: function() {
      var playerId = this._id;
      var selectedPlayer = Session.get("selectedPlayer");
      if (selectedPlayer == playerId)
        return "selected";
    },
    showSelectedPlayer: function() {
      var selectedPlayer = Session.get("selectedPlayer");
      return PlayersList.findOne(selectedPlayer);
    },
    isPlayerSelected: function() {
      return Session.get("selectedPlayer");
    }
  });

  Template.addPlayerForm.events({
    'submit': function (event) {
      event.preventDefault();
      var newPlayerName = event.target.new_player.value
      var newPlayerScore = parseInt(event.target.new_score.value, 10);
      Meteor.call('insertPlayerData', {name: newPlayerName, score: newPlayerScore});
      event.target.new_player.focus();
      event.target.new_player.value = "";
      event.target.new_score.value = "";
    }
  });

  Template.leaderboard.events({
    'click .player': function () {
      var playerId = this._id;
      Session.set("selectedPlayer", playerId);
    },
    'click .increment': function() {
      var selectedPlayer = Session.get("selectedPlayer");
      Meteor.call('modifyScore', {player: selectedPlayer, score:5});
    },
    'click .decrement': function() {
      var selectedPlayer = Session.get("selectedPlayer");
      Meteor.call('modifyScore', {player: selectedPlayer, score:-5});
    },
    'click .remove': function() {
      var selectedPlayer = Session.get("selectedPlayer");
      if (confirm("Do you really want to delete the selected player?")) {
        Meteor.call('removePlayer', selectedPlayer);
      } else {
        alert("Didn't think so...");
      }
    }
  });

  /*Template.leaderboard.player = function() {
    return "Some text";
  }*/
}


if (Meteor.isServer) {
  /*PlayersList.remove({});*/
  Meteor.publish('thePlayers', function() {
    var currentUserId = this.userId;
    return PlayersList.find({createdBy: currentUserId});
  });

  Meteor.methods({
    'insertPlayerData' : function(data) {
        var currentUserId = Meteor.userId();
        if (!PlayersList.findOne({name:data.name})) {
          PlayersList.insert({
            name: data.name,
            score: data.score ? data.score : 0,
            createdBy: currentUserId
          });
        }
    },

    'removePlayer' : function(selectedPlayer) {
      PlayersList.remove(selectedPlayer);
    },

    'modifyScore' : function(data) {
      PlayersList.update(data.player, {$inc:{score:data.score}});
    }
  })
}