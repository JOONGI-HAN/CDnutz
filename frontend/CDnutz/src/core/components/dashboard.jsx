import Summary from "./summary";
import Hero from "./ui/hero";

import { useEffect, useState } from "react";


function Dashboard() {

  const [data,        setData]        = useState({});
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  useEffect(() => {

    fetch("/cdnutz/api/dashboard/")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();

      })
      .then(data => {
        setData(data);
        setLoading(false);

      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
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
