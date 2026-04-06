//import React, { useState } from "react";
import Login from "./pages/Login";
import Report from "./pages/scamReport";

function App() {
  return <Report />;
 /* const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {isLoggedIn ? (
        <Report />
      ) : (
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </>
  );*/

}

export default App;