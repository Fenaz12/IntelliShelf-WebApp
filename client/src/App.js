import './App.css';
import Dashboard from './components/dashboard'
import Test from './components/test'
import LoginUser from './components/LoginUser'
import  {Routes, Route, Navigate} from 'react-router-dom';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate replace to="/dashboard" />} />
        <Route exact className=""  path='/dashboard' element={<Dashboard/>}/>
        <Route exact className=""  path='/login' element={<LoginUser/>}/>
      </Routes>
    </div>
  );
}

export default App;
