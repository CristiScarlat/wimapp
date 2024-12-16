import Player from "./components/player/player";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import MobileFooter from "./components/mobileFooter/mobileFooter";

function App() {
    return(
        <>
            <Header/>
            <main>
                <Player />
            </main>
            <Footer/>
        </>
    )
}
export default App;
