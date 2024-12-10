import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import GameDetails from "./pages/GameDetails";
import Directory from "./pages/Directory";
import Forum from "./pages/Forum";
import Greeting from "./pages/Greetings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CreateForum from "./pages/CreateForum";
import ForumDetail from "./pages/ForumDetails";
import Footer from "./components/Footer";

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}

function AppRoutes() {
  const location = useLocation();

  // Only show footer for /games and /games/:id routes
  const showFooter = location.pathname.startsWith("/games");

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Directory />} />
        <Route path="/games/:id" element={<GameDetails />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/:forumTitle" element={<ForumDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/welcome" element={<Greeting />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/create-forum" element={<CreateForum />} />
      </Routes>
      {showFooter && <Footer />}
    </>
  );
}

export default App;
