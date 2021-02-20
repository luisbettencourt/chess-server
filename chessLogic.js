const jsChess = require("js-chess-engine");

exports.Chess = class Chess {
  constructor(name, opponentName, room, online = false, difficulty = 1) {
    this.computerPieces = [
      "k",
      "q",
      "b",
      "b",
      "n",
      "n",
      "r",
      "r",
      "p",
      "p",
      "p",
      "p",
      "p",
      "p",
      "p",
      "p",
    ];
    this.playerPieces = [
      "K",
      "Q",
      "B",
      "B",
      "N",
      "N",
      "R",
      "R",
      "P",
      "P",
      "P",
      "P",
      "P",
      "P",
      "P",
      "P",
    ];

    this.rows = ["1", "2", "3", "4", "5", "6", "7", "8"].reverse();
    this.columns = ["A", "B", "C", "D", "E", "F", "G", "H"];
    this.squareHeight;
    this.squareWidth;
    this.selectedPiece;
    this.movablePieces = [];
    this.name = name;
    this.opponentName = opponentName;
    this.room = room;
    this.difficulty = difficulty;
    this.online = online;

    this.newGame();
  }

  clientGameState() {
    return {
      newGameRequested: this.newGameRequested,
      playersReady: this.playersReady,
      name: this.name,
      opponentName: this.opponentName,
      draw: this.draw,
      loading: this.loading,
      movablePieces: this.movablePieces,
      lastMove: this.lastMove,
      pieces: this.pieces,
      turn: this.turn,
      check: this.check,
      checkMate: this.checkMate,
      moves: this.moves,
      castling: this.castling,
      enPassant: this.enPassant,
      halfMove: this.halfMove,
      fullMove: this.fullMove,
      isFinished: this.isFinished,
    };
  }

  mirrorClientGameState() {
    let mirroredPieces = {};
    const keysPieces = Object.keys(this.pieces);
    for (let i = 0; i < keysPieces.length; i++) {
      const newPosition = this.mirrorPosition(keysPieces[i]);
      let newPiece;
      const originalPiece = this.pieces[keysPieces[i]];
      if (originalPiece === originalPiece.toUpperCase()) {
        newPiece = originalPiece.toLowerCase();
      } else {
        newPiece = originalPiece.toUpperCase();
      }
      mirroredPieces[newPosition] = newPiece;
    }

    let mirroredMoves = {};
    const keysMoves = Object.keys(this.moves);
    for (let i = 0; i < keysMoves.length; i++) {
      const newPositionMoves = this.mirrorPosition(keysMoves[i]);
      const originalMoves = this.moves[keysMoves[i]];
      const newMoves = originalMoves.map((move) => this.mirrorPosition(move));
      mirroredMoves[newPositionMoves] = newMoves;
    }

    let mirrorLastMove = this.mirrorMove(this.lastMove);

    const mirrorMovable = this.movablePieces.map((movablePos) =>
      this.mirrorPosition(movablePos)
    );

    let mirrorTurn = "";
    if (this.turn === "white") {
      mirrorTurn = "black";
    } else {
      mirrorTurn = "white";
    }

    let mirrorNewGamerequested;
    if (this.newGameRequested) {
      mirrorNewGamerequested =
        this.newGameRequested === "white" ? "black" : "white";
    }
    return {
      newGameRequested: mirrorNewGamerequested,
      playersReady: this.playersReady,
      name: this.opponentName,
      opponentName: this.name,
      draw: this.draw,
      loading: this.loading,
      movablePieces: mirrorMovable,
      lastMove: mirrorLastMove,
      pieces: mirroredPieces,
      turn: mirrorTurn,
      check: this.check,
      checkMate: this.checkMate,
      moves: mirroredMoves,
      castling: this.castling,
      enPassant: this.enPassant,
      halfMove: this.halfMove,
      fullMove: this.fullMove,
      isFinished: this.isFinished,
    };
  }

  mirrorPosition(originalPos) {
    const originalRowIndex = this.rows.findIndex(
      (row) => row === originalPos[1]
    );
    const newPos = this.rows.reverse()[originalRowIndex];
    const newPosition = originalPos[0] + newPos;
    return newPosition;
  }

  mirrorMove(move) {
    let mirroredLastMove = {};
    const keysLastMove = Object.keys(move);
    for (let i = 0; i < keysLastMove.length; i++) {
      const originalLastMove = move[keysLastMove[i]];
      const newLastMove = this.mirrorPosition(originalLastMove);
      mirroredLastMove[keysLastMove[i]] = newLastMove;
    }
    return mirroredLastMove;
  }

  objectGameState() {
    return {
      pieces: this.pieces,
      turn: this.turn,
      check: this.check,
      checkMate: this.checkMate,
      moves: this.moves,
      castling: this.castling,
      enPassant: this.enPassant,
      halfMove: this.halfMove,
      fullMove: this.fullMove,
      isFinished: this.isFinished,
    };
  }

  newGame() {
    this.turn = "white";
    this.check = false;
    this.checkMate = false;
    this.draw = false;
    this.loading = false;
    this.isFinished = false;
    this.enPassant = null;
    this.halfMove = 0;
    this.fullMove = 0;
    this.lastMove = {};

    this.castling = {
      whiteLong: false,
      whiteShort: false,
      blackLong: false,
      blackShort: false,
    };

    this.pieces = {
      A8: this.computerPieces[6],
      A7: this.computerPieces[8],
      B8: this.computerPieces[4],
      B7: this.computerPieces[9],
      C8: this.computerPieces[2],
      C7: this.computerPieces[10],
      D8: this.computerPieces[1],
      D7: this.computerPieces[11],
      E8: this.computerPieces[0],
      E7: this.computerPieces[12],
      F8: this.computerPieces[3],
      F7: this.computerPieces[13],
      G8: this.computerPieces[5],
      G7: this.computerPieces[14],
      H8: this.computerPieces[7],
      H7: this.computerPieces[15],

      A1: this.playerPieces[6],
      A2: this.playerPieces[8],
      B1: this.playerPieces[4],
      B2: this.playerPieces[9],
      C1: this.playerPieces[2],
      C2: this.playerPieces[10],
      D1: this.playerPieces[1],
      D2: this.playerPieces[11],
      E1: this.playerPieces[0],
      E2: this.playerPieces[12],
      F1: this.playerPieces[3],
      F2: this.playerPieces[13],
      G1: this.playerPieces[5],
      G2: this.playerPieces[14],
      H1: this.playerPieces[7],
      H2: this.playerPieces[15],
    };
    this.moves = this.calcPieceMoves(this.pieces, this.turn);
    this.movablePieces = this.highlightMovablePieces(this.turn);
  }

  calcPieceMoves(board, turn, validateCheck = true) {
    let moves = {};
    const lengthObject = Object.keys(board);
    for (let i = 0; i < lengthObject.length; i++) {
      moves[lengthObject[i]] = this.piecesPossibleMoves(lengthObject[i], board);
    }
    if (validateCheck) {
      moves = this.validateCheckMoves(moves, turn);
      const kingCheck = this.kingCheckMate(board, moves, turn);
      this.check = kingCheck.check;
      this.checkMate = kingCheck.checkMate;
      this.draw = kingCheck.draw;
    }
    return moves;
  }

  validateCheckMoves(moves, turn) {
    const validatedMoves = { ...moves };
    Object.keys(validatedMoves).forEach((sourcePosition) => {
      if (this.checkPieceOwner(this.pieces[sourcePosition]) === turn) {
        let pieceMoves = validatedMoves[sourcePosition];
        pieceMoves = pieceMoves.filter((targetPosition, i) => {
          const dummyPieces = { ...this.pieces };
          let piece = dummyPieces[sourcePosition];
          dummyPieces[targetPosition] = piece;
          delete dummyPieces[sourcePosition];
          const dummyMoves = this.calcPieceMoves(dummyPieces, turn, false);
          if (this.kingCheckMate(dummyPieces, dummyMoves, turn).check) {
            return false;
          }
          return true;
        });
        validatedMoves[sourcePosition] = pieceMoves;
      }
    });
    return validatedMoves;
  }

  getPlayerMoves(playerColor, pieces, moves) {
    const lengthObject = Object.keys(pieces);
    let playerMoves = [];
    for (let i = 0; i < lengthObject.length; i++) {
      const valueBoard = pieces[lengthObject[i]];
      if (this.checkPieceOwner(valueBoard) === playerColor) {
        const playerPieceMoves = moves[lengthObject[i]];
        playerPieceMoves.forEach((move) => {
          if (!playerMoves.includes(move)) {
            playerMoves.push(move);
          }
        });
      }
    }
    return playerMoves;
  }

  squareCheck(position, turn, pieces, moves) {
    const enemyColor = turn === "white" ? "black" : "white";
    const enemyMoves = this.getPlayerMoves(enemyColor, pieces, moves);
    return enemyMoves.includes(position);
  }

  kingCheckMate(pieces, moves, turn) {
    let kingPos;
    let check = false;
    let checkMate = false;
    let draw = false;
    if (turn === "white") {
      kingPos = Object.keys(pieces).find((pos) => "K" === pieces[pos]);
    } else {
      kingPos = Object.keys(pieces).find((pos) => "k" === pieces[pos]);
    }
    if (this.squareCheck(kingPos, turn, pieces, moves)) {
      check = true;
      if (!this.getPlayerMoves(turn, pieces, moves).length) {
        checkMate = true;
      } else {
        checkMate = false;
      }
    } else {
      if (!this.getPlayerMoves(turn, pieces, moves).length) {
        draw = true;
      }
      check = false;
    }
    return { check, checkMate, draw };
  }

  getPieceCoords(position) {
    const xCoord = this.columns.findIndex((column) => column === position[0]);
    const yCoord = this.rows.findIndex((row) => row === position[1]);
    return { xCoord, yCoord };
  }

  getPiecePosition(xCoord, yCoord) {
    return this.columns[xCoord] + this.rows[yCoord];
  }

  checkPieceOwner(piece) {
    return piece === piece.toUpperCase() ? "white" : "black";
  }

  movePiece(sourcePosition, targetPosition, turn) {
    this.pawnToQueen(sourcePosition, targetPosition, turn);
    this.lastMove = { sourcePosition, targetPosition };
    let piece = this.pieces[sourcePosition];
    this.pieces[targetPosition] = piece;
    delete this.pieces[sourcePosition];
    this.turn = turn === "white" ? "black" : "white";
    this.moves = this.calcPieceMoves(this.pieces, this.turn);
    this.movablePieces = this.highlightMovablePieces(this.turn);
    this.room.sendGameState(
      this.clientGameState(),
      this.mirrorClientGameState()
    );
  }

  takeTurnOnline(move, player) {
    const sourcePosition = move.sourcePosition;
    const targetPosition = move.targetPosition;

    if (player === this.turn) {
      this.movePiece(sourcePosition, targetPosition, this.turn);
      this.fullMove++;
      this.halfMove++;
    }
  }

  takeTurn(move) {
    const sourcePosition = move.sourcePosition;
    const targetPosition = move.targetPosition;
    this.loading = true;
    if (Object.keys(this.pieces).includes(targetPosition)) {
      this.halfMove = -1;
    }

    if (this.turn === "white") {
      this.movePiece(sourcePosition, targetPosition, this.turn);
      this.fullMove++;
      this.halfMove++;
      setTimeout(() => {
        try {
          const aiMove = jsChess.aiMove(
            this.objectGameState(),
            this.difficulty
          );
          this.takeTurn(
            {
              sourcePosition: Object.keys(aiMove)[0],
              targetPosition: Object.values(aiMove)[0],
            },
            this.turn
          );
        } catch (error) {
          this.draw = true;
          //   this.drawGame(this.canvas);
        }
      }, 500);
    } else {
      this.loading = false;
      this.movePiece(sourcePosition, targetPosition, this.turn);
      this.fullMove++;
      this.halfMove++;
      this.loading = false;
    }
  }

  clickSquare(x, y) {
    const xCord = Math.floor(x / this.squareWidth);
    const yCord = Math.floor(y / this.squareHeight);
    return this.getPiecePosition(xCord, yCord);
  }

  highlightMovablePieces(turn = "white") {
    const lengthObject = Object.keys(this.pieces);
    let playerMoves = {};
    let arrayPositions = [];
    for (let i = 0; i < lengthObject.length; i++) {
      const valueBoard = this.pieces[lengthObject[i]];
      if (this.checkPieceOwner(valueBoard) === turn) {
        playerMoves[lengthObject[i]] = this.moves[lengthObject[i]];
      }
    }
    for (let i = 0; i < Object.keys(playerMoves).length; i++) {
      const position = Object.keys(playerMoves)[i];
      const arrayMoves = playerMoves[position];
      if (arrayMoves.length !== 0) {
        arrayPositions.push(position);
      }
    }
    return arrayPositions;
  }

  pawnToQueen(sourcePosition, targetPosition) {
    if (this.pieces[sourcePosition] === "p") {
      if (targetPosition[1] === this.rows[7]) {
        this.pieces[sourcePosition] = "q";
      }
    }
    if (this.pieces[sourcePosition] === "P") {
      if (targetPosition[1] === this.rows[0]) {
        this.pieces[sourcePosition] = "Q";
      }
    }
  }

  piecesPossibleMoves(position, board) {
    const cordXPiece = this.getPieceCoords(position).xCoord;
    const cordYPiece = this.getPieceCoords(position).yCoord;
    const playerColor = this.checkPieceOwner(board[position]);
    let possibleKillDirection;
    let possibleMoveDirection;
    let left = [];
    let right = [];
    let down = [];
    let up = [];
    let frontRight = [];
    let frontLeft = [];
    let sideRight = [];
    let sideLeft = [];
    let downRight = [];
    let downLeft = [];
    let anotherSideRight = [];
    let anotherSideLeft = [];
    let diagonalRightUp = [];
    let diagonalLeftUp = [];
    let diagonalRightDown = [];
    let diagonalLeftDown = [];
    let front = [];

    switch (board[position]) {
      case "P":
        possibleMoveDirection = [[[cordXPiece, cordYPiece - 1]]];
        if (position[1] === this.rows[6]) {
          possibleMoveDirection[0].push([cordXPiece, cordYPiece - 2]);
        }
        possibleKillDirection = [
          [[cordXPiece + 1, cordYPiece - 1]],
          [[cordXPiece - 1, cordYPiece - 1]],
        ];
        break;
      case "p":
        possibleMoveDirection = [[[cordXPiece, cordYPiece + 1]]];
        if (position[1] === this.rows[1]) {
          possibleMoveDirection[0].push([cordXPiece, cordYPiece + 2]);
        }
        possibleKillDirection = [
          [[cordXPiece + 1, cordYPiece + 1]],
          [[cordXPiece - 1, cordYPiece + 1]],
        ];
        break;
      case "b":
      case "B":
        for (let i = 1; i < 8; i++) {
          left.push([cordXPiece - i, cordYPiece - i]);
          right.push([cordXPiece + i, cordYPiece - i]);
          up.push([cordXPiece - i, cordYPiece + i]);
          down.push([cordXPiece + i, cordYPiece + i]);
        }
        possibleMoveDirection = [left, right, up, down];
        possibleKillDirection = [left, right, up, down];
        break;
      case "r":
      case "R":
        for (let i = 1; i < 8; i++) {
          left.push([cordXPiece - i, cordYPiece]);
          right.push([cordXPiece + i, cordYPiece]);
          up.push([cordXPiece, cordYPiece - i]);
          down.push([cordXPiece, cordYPiece + i]);
        }
        possibleMoveDirection = [left, right, up, down];
        possibleKillDirection = [left, right, up, down];
        break;
      case "n":
      case "N":
        frontRight.push([cordXPiece + 1, cordYPiece - 2]);
        frontLeft.push([cordXPiece - 1, cordYPiece - 2]);
        sideLeft.push([cordXPiece - 2, cordYPiece + 1]);
        sideRight.push([cordXPiece - 2, cordYPiece - 1]);
        anotherSideLeft.push([cordXPiece + 2, cordYPiece - 1]);
        anotherSideRight.push([cordXPiece + 2, cordYPiece + 1]);
        downLeft.push([cordXPiece + 1, cordYPiece + 2]);
        downRight.push([cordXPiece - 1, cordYPiece + 2]);

        possibleMoveDirection = [
          frontLeft,
          frontRight,
          sideLeft,
          sideRight,
          anotherSideLeft,
          anotherSideRight,
          downLeft,
          downRight,
        ];
        possibleKillDirection = [
          frontLeft,
          frontRight,
          sideLeft,
          sideRight,
          anotherSideLeft,
          anotherSideRight,
          downLeft,
          downRight,
        ];

        break;

      case "q":
      case "Q":
        for (let i = 1; i < 8; i++) {
          left.push([cordXPiece - i, cordYPiece]);
          right.push([cordXPiece + i, cordYPiece]);
          up.push([cordXPiece, cordYPiece - i]);
          down.push([cordXPiece, cordYPiece + i]);
          diagonalLeftUp.push([cordXPiece - i, cordYPiece - i]);
          diagonalRightUp.push([cordXPiece + i, cordYPiece - i]);
          diagonalLeftDown.push([cordXPiece - i, cordYPiece + i]);
          diagonalRightDown.push([cordXPiece + i, cordYPiece + i]);
        }
        possibleMoveDirection = [
          left,
          right,
          up,
          down,
          diagonalLeftDown,
          diagonalLeftUp,
          diagonalRightDown,
          diagonalRightUp,
        ];
        possibleKillDirection = [
          left,
          right,
          up,
          down,
          diagonalLeftDown,
          diagonalLeftUp,
          diagonalRightDown,
          diagonalRightUp,
        ];
        break;

      case "k":
      case "K":
        frontRight.push([cordXPiece + 1, cordYPiece - 1]);
        frontLeft.push([cordXPiece - 1, cordYPiece - 1]);
        front.push([cordXPiece, cordYPiece - 1]);
        right.push([cordXPiece + 1, cordYPiece]);
        left.push([cordXPiece - 1, cordYPiece]);
        down.push([cordXPiece, cordYPiece + 1]);
        downLeft.push([cordXPiece + 1, cordYPiece + 1]);
        downRight.push([cordXPiece - 1, cordYPiece + 1]);

        possibleMoveDirection = [
          frontLeft,
          frontRight,
          front,
          right,
          left,
          down,
          downLeft,
          downRight,
        ];
        possibleKillDirection = [
          frontLeft,
          frontRight,
          front,
          right,
          left,
          down,
          downLeft,
          downRight,
        ];
        break;
    }

    let validatedMoves = [];
    let possibleKillPos = [];
    let possibleMovePos = [];

    for (let i = 0; i < possibleMoveDirection.length; i++) {
      possibleMovePos = possibleMoveDirection[i];
      possibleMovePos = possibleMovePos
        .filter((cords) => this.columns[cords[0]] && this.rows[cords[1]])
        .map((cords) => this.columns[cords[0]] + this.rows[cords[1]]);

      for (let i = 0; i < possibleMovePos.length; i++) {
        if (!Object.keys(board).includes(possibleMovePos[i])) {
          validatedMoves.push(possibleMovePos[i]);
        } else {
          //nao vai verificar os quadrados a seguir porque tem uma peça a frente logo nao permite ir mais longe
          break;
        }
      }
    }

    for (let i = 0; i < possibleKillDirection.length; i++) {
      possibleKillPos = possibleKillDirection[i];
      possibleKillPos = possibleKillPos
        .filter((cords) => this.columns[cords[0]] && this.rows[cords[1]])
        .map((cords) => this.columns[cords[0]] + this.rows[cords[1]]);
      for (let i = 0; i < possibleKillPos.length; i++) {
        if (Object.keys(board).includes(possibleKillPos[i])) {
          if (this.checkPieceOwner(board[possibleKillPos[i]]) !== playerColor) {
            validatedMoves.push(possibleKillPos[i]);
          }
          break;
        }
      }
    }
    return validatedMoves;
  }
};
