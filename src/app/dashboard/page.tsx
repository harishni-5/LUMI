import Navbar from "./components/navbar";




export default function Dashboard() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar should be placed outside of the grid to avoid unwanted spacing */}
              <Navbar/>
              
    </div>
      
    );
  }
  