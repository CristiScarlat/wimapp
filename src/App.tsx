import Player from "./components/player/player";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return(
        <>
            <Header/>
            <main>
                <Player />
            </main>
            <Footer/>
            <ToastContainer />
        </>
    )
}
export default App;
