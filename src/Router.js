import { createBrowserRouter } from "react-router-dom";
import Home from './pages/Home.js';
import Details from './pages/Details.js'
import Layout from './components/Layout.js'
import NewListing from './pages/NewListing';
import Login from './pages/Login.js'
import Profile from './pages/Profile.js'

const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <Layout />,
            children: [
                {
                    path: "/",
                    element: <Home />,
                    index: true
                },
                {
                    path: "/details/:id",
                    element: <Details />
                },
                {
                    path: "/listing/new",
                    element: <NewListing/>
                },
                {
                    path: "/login",
                    element: <Login/>
                },
                {
                    path: "/profile",
                    element: <Profile/>
                }
            ]
        }
    ]
);

export default router;