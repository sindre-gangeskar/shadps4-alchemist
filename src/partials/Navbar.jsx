import React from "react";
import { Link } from "react-router-dom";
import '../css/Navbar.css';

function Navbar() {
    const routes = [ { path: '/', name: 'home' }, { path: '/install', name: 'install' }, { path: '/create', name: 'create' } ];
    return (
        <>
            <div className="navbar-wrapper">
                <ul className="navbar-views">
                    {routes.map(route => {
                        return (
                            <Link to={route.path} className="navbar-item navbar-link btn">{route.name}</Link>
                        )
                    })}
                </ul>
            </div>
        </>
    )
}
export default Navbar;