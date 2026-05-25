import { Link } from "react-router-dom";
import logoImg from "../../public/assets/logoW&OO.png";

export function Header_Holiday() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 w-full max-w-[1400px] mx-auto border-b border-white/10">
      
      {/* Logo */}
      <div className="shrink-0 flex items-center mr-8">
        <Link to="/">
          <img src={logoImg} alt="Plumtrips Logo" className="h-16 w-auto object-contain cursor-pointer" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-wrap justify-end items-center gap-x-4 gap-y-2 text-[#e5e5e5] text-[13px] font-medium tracking-wide">
        <Link to="/vietnam-personal"><span className="cursor-pointer hover:text-white transition-colors whitespace-nowrap">Vietnam</span></Link>
        <Link to="/thailand-personal"><span className="cursor-pointer hover:text-white transition-colors whitespace-nowrap">Thailand</span></Link>
        <Link to="/japan-personal"><span className="cursor-pointer hover:text-white transition-colors whitespace-nowrap">Japan</span></Link>
        <Link to="/bali-personal"><span className="cursor-pointer hover:text-white transition-colors whitespace-nowrap">Bali</span></Link>
        <Link to="/thailand-corporate"><span className="cursor-pointer hover:text-white transition-colors whitespace-nowrap">Teams</span></Link>
        <Link to="/vietnam-corporate"><span className="cursor-pointer hover:text-white transition-colors whitespace-nowrap">Vietnam for Teams</span></Link>
        <Link to="/thailand-corporate"><span className="cursor-pointer hover:text-white transition-colors whitespace-nowrap">Thailand for Teams</span></Link>
        <Link to="/japan-corporate"><span className="cursor-pointer hover:text-white transition-colors whitespace-nowrap">Japan for Teams</span></Link>
        <Link to="/bali-corporate"><span className="cursor-pointer hover:text-white transition-colors whitespace-nowrap">Bali for Teams</span></Link>
      </nav>
      
    </header>
  );
}

