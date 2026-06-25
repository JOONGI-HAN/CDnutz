import Error404 from "./core/components/pageNotFound";
import Dashboard from "./core/components/dashboard";
import GameDetails from "./core/components/details";
import GuessTheGame from "./core/components/guessTheGame.jsx";

import CDnutz from "./core/app";
import "./index.css";

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";


const router = createBrowserRouter([
  {path : "/", element : <CDnutz />,
   children : [
     {index : true, element : <Dashboard />},
     {path  : "game/:id", element : <GameDetails />},
     {path : "guess-the-game", element : <GuessTheGame />},
   ]},
  {path : "*", element : <Error404 />}
]);

createRoot(document.getElementById("root")).render(
    <RouterProvider router = {router} />
);
