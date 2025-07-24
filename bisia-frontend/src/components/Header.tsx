import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between">
      <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">Home</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demo/form/signup">Signup Form</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demo/form/login">Login Form</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demo/form/phone">Phone Login</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demo/form/email">Email Login</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demo/form/gmail">Google Login</Link>
        </div>

        {/* <div className="px-2 font-bold">
          <Link to="/demo/form/simple">Simple Form</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demo/form/address">Address Form</Link>
        </div>

        <div className="px-2 font-bold">
          <Link to="/demo/tanstack-query">TanStack Query</Link>
        </div> */}
      </nav>
    </header>
  );
}
