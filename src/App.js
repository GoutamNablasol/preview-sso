// App.js
import React, { useState, useEffect } from 'react';
import Callback from './Callback';
import Header from './Header';
import msLogo from './ms-logo.png'
import { useIsAuthenticated, useMsal } from '@azure/msal-react';

const App = () => {
  const isAuthenticated = useIsAuthenticated();
  const [authCheck, setAuthCheck] = useState();

  const SsoLogin = () => {
    const { instance } = useMsal();
    function handleLogin(instance) {
      instance
        .loginRedirect("https://login.microsoftonline.com/f32f94fa-61a1-4605-a7d9-3e9048460448")
    }
    return (
      <>
        <div className="centered-card">
          <div className="ms-btn-card">
            <div ><img className="ms-logo" src={msLogo} alt="ms_logo" /></div>
            <button className="microsoft-button" onClick={() => handleLogin(instance)}>Sign in with Microsoft</button>
          </div>
        </div>
      </>
    );
  };

  console.log("isAuthenticated", isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      setAuthCheck(true);
    } else {
      setAuthCheck(false);
    }
  }, [isAuthenticated, authCheck]);

  return (
    <>
      <Header />
      {
        authCheck ? <Callback /> : <SsoLogin />
      }
    </>
  );
};

export default App;
