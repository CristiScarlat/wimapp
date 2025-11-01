import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import Home from "./pages/home";
import Modal from "./components/modal/modal";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return(
        <>
            <Router>
                <Header/>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                </Routes>
                <Footer/>
                <ToastContainer />
            </Router>
        </>
    )
}
export default App;
