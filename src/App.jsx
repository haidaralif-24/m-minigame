import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LobbyPage from './pages/Lobby.jsx';
import HostPage from './pages/Host.jsx';
import BoardPage from './pages/Board.jsx';
import PlayPage from './pages/Play.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/host" element={<HostPage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/*" element={<LobbyPage />} />
      </Routes>
    </BrowserRouter>
  );
}