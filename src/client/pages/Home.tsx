import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { makeEmptyGrid } from "../../domain/grid";
import { GameAction, GameId, GameState, GridState, Player, PlayerColor, PlayerId } from "../../domain/types";
import { generateGameId, generatePlayerId } from "../../shared/helpers/uuid";
import Puissance4 from "../components/Puissance4";
import { SocketContext } from "../context/socket";

const Home = () => {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const [gameId, setGameId] = useState<string>();
  const [joinCode, setJoinCode] = useState<string>('');
  const [state, setState] = useState<GameState>({
    gameId: '' as GameId,
    players: [] as Player[],
    currentPlayer: {} as Player,
    grid: makeEmptyGrid(6)(7)
  });


  useEffect(() => {

    socket.on(GameAction.GAME_UPDATE, (data: typeof state) => {
      setState(data);
    });

    return () => {
      socket.disconnect(true);
    }
  }, []);

  const handleChangeCode = (e: ChangeEvent<HTMLInputElement>) => setJoinCode(e.target.value);

  const emit = (ev: GameAction, state: any) => {
    socket.emit(ev, state);
  }

  const createGame = (): void => {
    const gameId = generateGameId();
    setGameId(gameId);
    const currentPlayer = { id: generatePlayerId(), playerColor: PlayerColor.RED };
    const currentState = {
      ...state,
      gameId,
      currentPlayer,
      players: [currentPlayer]
    };
    setState(currentState);
    socket.emit(GameAction.CREATE_GAME, currentState);
    navigate(`/game/${gameId}`, { replace: true });
  };

  const joinGame = (): void => {
    const currentState = {
      ...state,
      gameId: joinCode,
      playerId: generatePlayerId(),
      playerColor: PlayerColor.YELLOW
    };
    socket.emit(GameAction.JOIN, currentState);
  }

  const updateGrid = (grid: GridState): void => {
    const currentState = {
      ...state,
      currentPlayer: state.players.find(s => s.id !== state.currentPlayer.id)!,
      grid
    };
    setState(currentState);
    socket.emit(GameAction.GAME_UPDATE, currentState);
  }

  return (
    <>
      <div className="container mx-auto flex flex-col justify-center">
        <button onClick={createGame} className="w-1/4 text-white bg-blue-700 hover:bg-blue-800 rounded-lg p-2">
          Créer partie
        </button>

        <p>
          gameId = {gameId}
        </p>

        <div>
          <input
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2" type="text"
            placeholder={'Entrer le code de la partie'}
            value={joinCode}
            onChange={handleChangeCode}
          />
          <button onClick={joinGame} className="text-white bg-blue-700 hover:bg-blue-800 rounded-lg p-2">
            Rejoindre partie
          </button>
        </div>
      </div>

      {/*<button onClick={dropToken}>poser un jeton</button>*/}
      <hr/>
      <Puissance4
        gameData={state.grid}
        updateGrid={updateGrid}
        playerColor={state.currentPlayer?.playerColor}
      />
      <pre>{JSON.stringify(state, null, 2)}</pre>

      {/*</div>*/}
    </>
  );
}

export default Home;
