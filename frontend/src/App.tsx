import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/SignUp';
import NotFound from './components/NotFound';
import Onboarding from './components/Onboarding';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';
import { BrowserRouter, Routes, Route } from 'react-router-dom'


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
        <Route path='/' element={<Home/>}/>
          <Route path='*' element={<NotFound/>}/>
          <Route path='/login/' element={<Login/>}/>
          <Route path='/signup/' element={<Signup/>}/>
          <Route path='/welcome/' element={<Onboarding/>}/>
          <Route path='/forgot/' element={<ForgotPassword/>}/>
          <Route path='/reset/:token/' element={<ResetPassword/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;