import { useQuery } from '@tanstack/react-query';
import { FetchAPI } from '../../api';
import useClient from './useClient';
import { useUser } from '../contexts/UserContext';

export function useUserDetails() {
  const { userData } = useUser();
  const client = useClient();
  const { userid } = userData;

  const userInfoUri = `IBIF_ex=FRAPI_GetTable_FRPUSER&USER_ID=${userid}&&CLIENT=${client}`;

  const { data: userDetails } = useQuery({
    queryKey: ["userDetail", userInfoUri, userid],
    queryFn: () => FetchAPI(userInfoUri),
    enabled: !!userid,
  });

  const firstName = userDetails?.sort_keys?.[0]?.verbs?.[0]?.USER_FNAME || "";
  const lastName = userDetails?.sort_keys?.[0]?.verbs?.[0]?.USER_LNAME || "";

  return {
    firstName,
    lastName,
    isLoading: !userDetails,
  };
}