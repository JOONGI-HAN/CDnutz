import { CircleEllipsis } from 'lucide-react';

import DetailsHero from "./ui/detailsHero";
import ActionsModal from "./ui/duplicate/actionsModal";
import Spinner from "./ui/duplicate/spinner";

import { useParams } from "react-router";
import { useEffect, useState } from "react";

import useWindowSizeListener from "../hooks/useWindowSizeListener";
import useRequest from "../hooks/useRequest";
import {Breakpoints} from "../enums.js";

function GameDetails() {

  const { request, data, error, loading } = useRequest();

  const [modalOpen, setModalOpen]     = useState(false);

  const { id } = useParams();

  useEffect(
    () => {
        request(`/cdnutz/api/game/${id}`).catch(() => {});
    },
    [id]
  )

  useWindowSizeListener({ query: Breakpoints.SM, actionFN: setModalOpen, matchState: false });

  return (
    <div className = {`text-white ${(loading || error) && "flex items-center justify-center"}`}>

      {loading && (
        <Spinner color = "var(--accent-bright)" size = {50} />
      )}

      {!loading && !error && (
        <>
          <DetailsHero data = {data} />

          <button className = "hidden max-sm:block fixed bottom-4 right-4 p-4 bg-[var(--accent-bright)] rounded-full"
                  onClick = {() => setModalOpen(true)}>
            <CircleEllipsis className = "w-8 h-8"/>
          </button>

          <ActionsModal open = {modalOpen} toggle = {setModalOpen} />
        </>
      )}
    </div>
  );
}


export default GameDetails;