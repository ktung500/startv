// export default App;
import React from 'react';
import { BrowserRouter as Router, Route, Routes, RouterProvider } from "react-router-dom";
import router from "./Router.js"
import {AuthProvider} from "./AuthContext.js"


function App() {
  return (
      <>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      </>
  )
}


export default App;