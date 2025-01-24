// export default App;
import React from 'react';
import { BrowserRouter as Router, Route, Routes, RouterProvider } from "react-router-dom";
import router from "./Router.js"

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}


export default App;