import React from "react";
import { useState } from 'react';
import { Link } from "react-router-dom";
import '../css/Navbar.css';
import useGlobalStateStore from "../js/globalStateStore";
function Navbar() {
    const [ activeLocation, setActiveLocation ] = useState(null);
    const [ processActtive ] = useGlobalStateStore(state => [ state.processActive ]);
    const routes = [
        { path: '/', name: 'library' },
        { path: '/create', name: 'create' },
        { path: '/settings', name: 'settings' }
    ];
    return (
        <div className={`navbar-wrapper ${processActtive ? 'collapsed' : ''}`}>
            <ul className="navbar-views">
                {routes.map(route => {
                    return (
                        <Link key={route.name} to={route.path} className={`navbar-item navbar-link btn ${activeLocation == route.name ? 'active-location' : ''}`} onClick={() => { setActiveLocation(route.name); console.log(activeLocation == route.name) }}>{route.name}</Link>
                    )
                })}
            </ul>
        </div>
    )
}
export default Navbar;