import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HostPage from './pages/Host.jsx';
import BoardPage from './pages/Board.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/host" element={<HostPage />} />
        <Route path="/board" element={<BoardPage />} />
        <Route path="/*" element={<HostPage />} />
      </Routes>
    </BrowserRouter>
  );
}