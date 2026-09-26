import { Outlet } from "react-router"
import Footer from "./Footer/Footer"
import Header from "./Header/Header"

function Lauyout() {
   return (
       <div className="container-fluid">
        
        <div className="row">
          <div className="col">
            <Header />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Outlet />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <Footer />
          </div>
        </div>

      </div>    
   )
}

export default Lauyout