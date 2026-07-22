import Summary from "./summary";
import Hero from "./ui/hero";

import { useEffect } from "react";

import useRequest from "../hooks/useRequest";


function Dashboard() {

  const { request, data, error, loading } = useRequest();

  useEffect(() => {
    request("/cdnutz/api/dashboard").catch(() => {});
  }, []);


  return (

    <div>

      <Hero data = {data.trending ?? []}
            loading = {loading} error = {error} />

      <Summary data = {data.stats ?? []}
               loading = {loading} error = {error} />

    </div>
  );
}


export default Dashboard;