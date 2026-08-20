import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LobbyPage from './pages/Lobby.jsx';
import HostPage from './pages/Host.jsx';
import PlayPage from './pages/Play.jsx';

export default function App() {
  return <BrowserRouter><Routes>
    <Route path="/" element={<LobbyPage />} />
    <Route path="/lobby" element={<LobbyPage />} />
    <Route path="/host" element={<HostPage />} />
    <Route path="/board" element={<HostPage />} />
    <Route path="/play" element={<PlayPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
