import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './components/Home';
import Form from './components/Form';
import Form2 from './components/Form2';
import Dashboard from './components/Dashboard';
import About from './components/About';
import Uniform from './components/unform';
import Resault from './components/Degrees/Resault2';
import Resault1 from './components/Degrees/Resault1';
import Math from './components/Every subject/Math';
import English from './components/Every subject/English';
import Arabic from './components/Every subject/Arabic';
import Physics from './components/Every subject/Physics';
import TCS from './components/Every subject/TCS';
import CDC from './components/Every subject/CDC';
import Capstone from './components/Every subject/Capstone';
import Socialstudies from './components/Every subject/Social studies';
import IT from './components/Every subject/IT';
import Communication from './components/Every subject/Communication';
import Communications from './components/Every subject/Communications';
import Nationalstudies from './components/Every subject/National studies';
import Networking from './components/Every subject/Networking';

import Nav from './layout/Nav';
import Footer from './layout/Footer';
import './styles/App.scss';

function App() {
  return (
    <Router>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Form" element={<Form />} />
        <Route path="/Form2" element={<Form2 />} />
        <Route path="/About" element={<About />} />
        <Route path="/unform" element={<Uniform />} />
        <Route path="/Resault" element={<Resault />} />
        <Route path="/Resault1" element={<Resault1 />} />
        <Route path="/subject/Math" element={<Math />} />
        <Route path="/subject/English" element={<English />} />
        <Route path="/subject/Arabic" element={<Arabic />} />
        <Route path="/subject/Physics" element={<Physics />} />
        <Route path="/subject/TCS" element={<TCS />} />
        <Route path="/subject/CDC" element={<CDC />} />
        <Route path="/subject/Capstone" element={<Capstone />} />
        <Route path="/subject/Social studies" element={<Socialstudies />} />
        <Route path="/subject/IT" element={<IT />} />
        <Route path="/subject/Communication" element={<Communication />} />
        <Route path="/subject/Communications" element={<Communications />} />
        <Route path="/subject/National studies" element={<Nationalstudies />} />
        <Route path="/subject/Networking" element={<Networking />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;