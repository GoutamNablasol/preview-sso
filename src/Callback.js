// Callback.js
import React, { useEffect, useState } from 'react';
import { useIsAuthenticated, useMsal, useMsalAuthentication } from '@azure/msal-react';
import { graphConfig, loginRequest } from './authConfig';
import Preview from './Preview';

export async function callMsGraph(accessToken) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(graphConfig.graphMeEndpoint, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

const Callback = () => {
  const { instance, accounts } = useMsal();
  const [ responseD , setResponseData ] = useState()
  const [loading , setLoading] = useState(false)
  const { error } = useMsalAuthentication('loginRedirect', {
    scopes: loginRequest.scopes,
  });
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    setLoading(true);
    const request = {
      ...loginRequest,
      account: accounts[0],
    };

    // Silently acquires an access token which is then attached to a request for Microsoft Graph data
    instance
      .acquireTokenSilent(request)
      .then((response) => {
        callMsGraph(response.accessToken).then((response) => {
          setLoading(false)
          setResponseData(response)
        });
      })
      .catch((e) => {
        instance.acquireTokenPopup(request).then((response) => {
          callMsGraph(response.accessToken).then((response) => {
            console.log(response);
          });
        });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);


  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Render loading or other UI
  return(
    <>
    {
      false ?  <div className="loader-container">
      <div className="loader"></div>
    </div> : 
      <Preview responseD={responseD}/>
    }
    </>
  )
};

export default Callback;
