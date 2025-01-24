import { createBrowserRouter } from "react-router-dom";
import Home from './pages/Home.js';
import Details from './pages/Details.js'
import Root from './pages/Root.js'

const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <Root />,
            children: [
                {
                    path: "/",
                    element: <Home />,
                    index: true
                },
                {
                    path: "/details/:id",
                    element: <Details />
                }
            ]
        }
    ]
);

export default router;