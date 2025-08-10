import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FetchAPI } from "../../../../api"; // make sure this is correct
import useClient from "../../../hooks/useClient";

const BeginingBalance = () => {
  const { id } = useParams<{ id: string }>();
  const client = useClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['begining-balance', id],
    queryFn: () =>
      FetchAPI(`IBIF_ex=frapi_aud_begining_balance&CLIENT=${client}&IN_ID=${id}`),
    enabled: !!id && !!client,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading beginning balance data.</p>;

  return (
    <div>
      <h1>Beginning Balance Details</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default BeginingBalance;
