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
                {/* <Modal title="">
                    <h1>V3 will be ready soon, please come back to enjoy over 50000 radio stations.</h1>
                    </Modal> */}
            </Router>
        </>
    )
}
export default App;
