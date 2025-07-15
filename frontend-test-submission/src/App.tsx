
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ShortenerPage from './ShortenerPage';
import StatsPage from './StatsPage';
import { AppBar, Toolbar, Button } from '@mui/material';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" component={Link} to="/">Shortener</Button>
          <Button color="inherit" component={Link} to="/stats">Statistics</Button>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<ShortenerPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App
