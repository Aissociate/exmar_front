import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import PlaisancePage from './pages/PlaisancePage';
import PechePage from './pages/PechePage';
import CommercePage from './pages/CommercePage';
import ExpertPage from './pages/ExpertPage';
import ContactPage from './pages/ContactPage';

function SiteLayout() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/plaisance" element={<PlaisancePage />} />
        <Route path="/peche" element={<PechePage />} />
        <Route path="/commerce-industrie" element={<CommercePage />} />
        <Route path="/l-expert" element={<ExpertPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<SiteLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
