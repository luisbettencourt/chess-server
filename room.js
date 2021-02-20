const colyseus = require("colyseus");
const { Chess } = require("./chessLogic");

class MyRoom extends colyseus.Room {
  // When room is initialized
  constructor() {
    super();
    this.app = null;
  }

  sendGameState(gameState, mirroredGameState) {
    if (this.state.white) {
      this.state.white.send("gameState", gameState);
    }
    if (this.state.black) {
      this.state.black.send("gameState", mirroredGameState);
    }
  }

  onCreate(options) {
    this.online = options.online;
    this.difficulty = options.difficulty;
    const opponentName = this.online
      ? "Waiting for an opponent"
      : "Computer Level: " + this.difficulty;
    this.app = new Chess(
      options.name,
      opponentName,
      this,
      this.online,
      this.difficulty
    );
    this.setState({});

    this.onMessage("move", (client, move) => {
      if (this.app.online) {
        if (client === this.state.white) {
          this.app.takeTurnOnline(move, "white");
        }
        if (client === this.state.black) {
          this.app.takeTurnOnline(this.app.mirrorMove(move), "black");
        }
      } else {
        this.app.takeTurn(move);
      }
    });

    this.onMessage("requestNewGame", (client, move) => {
      if (this.app.online) {
        this.app.newGameRequested =
          client === this.state.white ? "white" : "black";
      } else {
        this.app.newGame();
      }
      this.sendGameState(
        this.app.clientGameState(),
        this.app.mirrorClientGameState()
      );
    });

    this.onMessage("answerNewGame", (client, answer) => {
      if (answer) {
        this.app.newGame();
      }

      this.app.newGameRequested = undefined;

      this.sendGameState(
        this.app.clientGameState(),
        this.app.mirrorClientGameState()
      );
    });
  }

  // When client successfully join the room
  onJoin(client, options, auth) {
    if (!this.state.white) {
      this.app.name = options.name;
      this.setState({ ...this.state, white: client });
      client.send("gameState", this.app.clientGameState());
    } else if (!this.state.black) {
      this.app.opponentName = options.name;
      this.setState({ ...this.state, black: client });
      client.send("gameState", this.app.mirrorClientGameState());
    }

    if ((this.online && this.clients.length === 2) || !this.online) {
      this.lock();
      this.app.playersReady = true;
      this.sendGameState(
        this.app.clientGameState(),
        this.app.mirrorClientGameState()
      );
    }
  }
  // When a client leaves the room
  onLeave(client, consented) {
    if (this.online && this.clients.length < 2) {
      this.unlock();
      this.app.playersReady = false;
    }

    this.sendGameState(
      this.app.clientGameState(),
      this.app.mirrorClientGameState()
    );
  }

  // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
  onDispose() {}
}
exports.MyRoom = MyRoom;
