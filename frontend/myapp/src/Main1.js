import React from 'react';
import {BrowserRouter as Router,Route,Routes} from "react-router-dom";
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Portfolio from './pages/Portfolio';
import FinancialTools from './pages/FinancialTools';
import MutualFunds from './pages/MutualFunds';
import StockMarket from './pages/StockMarket';
import Chatbot from './pages/Chatbot';
import Prediction from './pages/Prediction';
import FinancialNews from './pages/FinancialNews';
import MutualFundDetails from './pages/MutualFundDetails';
import Verify from './Verify';
import VerifyPhone from './VerifyPhone';
import Nopage from './Nopage';


function Main1() {
return (
<div >
<Router>
{/* <div className='main-route'>
<ul>
<li><Link to="/">Register</Link></li>
<li><Link to="/Login">Login</Link></li>
</ul>
</div> */}
<Routes>
<Route path="*" element={<Nopage/>}/>
<Route path="/Register" element={<Register/>}/>
<Route path="/Verify" element={<Verify/>}/>
<Route path="/VerifyPhone" element={<VerifyPhone/>}/>
<Route path="/Login" element={<Login/>}/>

{/* Dashboard Routes */}
<Route path="/" element={<Dashboard><Home /></Dashboard>}/>
<Route path="/Profile" element={<Dashboard><Profile /></Dashboard>}/>
<Route path="/Portfolio" element={<Dashboard><Portfolio /></Dashboard>}/>
<Route path="/FinancialTools" element={<Dashboard><FinancialTools /></Dashboard>}/>
<Route path="/MutualFunds" element={<Dashboard><MutualFunds /></Dashboard>}/>
<Route path="/StockMarket" element={<Dashboard><StockMarket /></Dashboard>}/>
<Route path="/Chatbot" element={<Dashboard><Chatbot /></Dashboard>}/>
<Route path="/Prediction" element={<Dashboard><Prediction /></Dashboard>}/>
<Route path="/FinancialNews" element={<Dashboard><FinancialNews /></Dashboard>}/>
<Route path="/MutualFunds/:id" element={<Dashboard><MutualFundDetails /></Dashboard>}/>

</Routes>
</Router>
</div>
);
}
export default Main1