// import React, { useState } from 'react';
// import './App.css';

// function App() {
//   const [activeTab, setActiveTab] = useState(0);
//   const [showMenu, setShowMenu] = useState(false);

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 0:
//         return <div>Welcome to Tab 1 content!</div>;
//       case 1:
//         return <div>Here is the content for Tab 2!</div>;
//       case 2:
//         return <div>Explore Tab 3's content here!</div>;
//       default:
//         return null;
//     }
//   };

//   const toggleMenu = () => setShowMenu(!showMenu);

//   return (
//     <div className="App">
//       <header className="tabs-header">
//         <div className="tabs">
//           <button
//             className={activeTab === 0 ? 'active' : ''}
//             onClick={() => setActiveTab(0)}
//           >
//             Tab 1
//           </button>
//           <button
//             className={activeTab === 1 ? 'active' : ''}
//             onClick={() => setActiveTab(1)}
//           >
//             Tab 2
//           </button>
//           <button
//             className={activeTab === 2 ? 'active' : ''}
//             onClick={() => setActiveTab(2)}
//           >
//             Tab 3
//           </button>
//         </div>
//         <div className="profile-avatar" onClick={toggleMenu}>
//           <img
//             src="https://via.placeholder.com/40"
//             alt="User Avatar"
//             className="avatar"
//           />
//           {showMenu && (
//             <div className="dropdown-menu">
//               <button>Profile</button>
//               <button>Settings</button>
//               <button>Logout</button>
//             </div>
//           )}
//         </div>
//       </header>
//       <main className="tab-content">{renderTabContent()}</main>
//     </div>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

const App = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;