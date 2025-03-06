"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-6 py-4  border-b">
      <div className="text-xl font-bold ml-15">Iris</div>
      <div className="hidden md:flex space-x-7 text-xs ml-27 font-normal opacity-70 tracking-wide">
        <Link href="#">Product</Link>
        <Link href="#">Resources</Link>
        <Link href="#">Pricing</Link>
        <Link href="#">Customers</Link>
        <Link href="#">Blog</Link>
        <Link href="#">Contact</Link>
      </div>

      {/* Authentication Buttons */}
      <div className="flex space-x-4 text-sm mr-30">
      <Button asChild variant="default">
      <Link href="/login">
        Log in
      </Link>
      </Button>

      <Button asChild variant="secondary">
      <Link href="/signup">
        Sign up
      </Link>
      </Button>


      


      
      
      
        
        
      </div>
    </nav>
  );
};

export default Navbar;
