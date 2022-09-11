import React from "react";
import { io } from "socket.io-client";
import { GameState } from "../domain/types";

export const socket = io(process.env.REACT_APP_SERVER_URL || "ws://localhost:8080/");
export const GameContext = React.createContext({
  context: {} as GameState,
  setContext: (v: GameState | any): void => {}
});
