import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportGrievance from './pages/ReportGrievance';
import AdminDashboard from './pages/AdminDashboard';
import CityMap from './pages/CityMap';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import MyEvents from './pages/MyEvents';
import Profile from './pages/Profile';
import Donations from './pages/Donations';
import DonationSuccess from './pages/DonationSuccess';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public marketing pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private App Area */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/grievances/new" element={<ReportGrievance />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/map" element={<CityMap />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/donation/success" element={<DonationSuccess />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;