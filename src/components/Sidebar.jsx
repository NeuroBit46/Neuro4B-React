// Navbar.jsx
import { NavLink, useLocation } from "react-router-dom";
import { Icons } from "../constants/Icons";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import React, { useRef, useEffect, useState } from "react";

export default function Navbar({ user = { name: "Usuario", avatar: 'user' }, onLogout }) {
  const nesploraQueryByLabel = {
    Resumen: "resumen",
    Planificación: "planificacion",
    "Memoria de trabajo": "memoria",
    "Flexibilidad cognitiva": "flexibilidad",
  };

  const items = [
    { name: "Archivos trabajadores", iconKey: "workers", path: "/archivos-trabajadores" },
    {
      name: "Dashboard",
      iconKey: "dashboard",
      subItems: [
        {
          name: "Nesplora Ice Cream",
          path: "/dashboard?section=Nesplora%20Ice%20Cream",
          children: ["Planificación", "Memoria de trabajo", "Flexibilidad cognitiva"],
        },
        { name: "EEG", path: "/dashboard?section=EEG" },
      ],
    },
    { name: "Generar informe", iconKey: "report", path: "/generar-informe" },
    { name: "Transformar datos", iconKey: "transform", path: "/transformar-datos" },
  ];

  const location = useLocation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // NUEVO: estado/control para Dashboard por click
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const dashboardRef = useRef(null);

  // Cierra el menú de usuario y dashboard al click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
      if (dashboardRef.current && !dashboardRef.current.contains(e.target)) {
        setDashboardOpen(false);
      }
    }
    // solo adjunta el listener cuando alguno esté abierto
    if (profileMenuOpen || dashboardOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen, dashboardOpen]);

  // Decodifica y remueve diacríticos para comparar rutas de forma estable
  const normalizedPath = (() => {
    let p = location.pathname;
    try { p = decodeURIComponent(p); } catch {}
    return p.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  })();

  function isArchivosActive(path) {
    return (
      path === "/archivos-trabajadores" ||
      path.startsWith("/anadir-trabajador")  ||
      path.startsWith("/ver-trabajador")     ||
      path.startsWith("/detalles-trabajador")||
      path.startsWith("/editar-trabajador")
    );
  }

  function isDashboardActive(loc) {
    return (
      loc.pathname === "/dashboard" ||
      loc.pathname.startsWith("/dashboard") ||
      loc.search.includes("section=Nesplora%20Ice%20Cream") ||
      loc.search.includes("section=EEG")
    );
  }

  // Lee query actual para determinar activos en el dropdown
  const qs = new URLSearchParams(location.search);
  const sectionQS = qs.get("section") || "";
  const tabQS = qs.get("tab") || "";

  // Misma lógica visual que la navbar, pero con bg-primary en lugar de blanco
  const ddItemClasses = (active) =>
    `flex flex-row items-center px-4 py-1 rounded transition-colors ${
      active
        ? "bg-primary/40"
        : "hover:bg-primary/20 focus-visible:bg-primary/40"
    }`;

  return (
    <header className="flex justify-between h-full w-full sticky top-0 z-50">
      {/* NAVIGATION MENU (LEFT) */}
      <NavigationMenu className="relative" viewport={false}>
        <NavigationMenuList className="flex gap-6 px-4">
          {items.map((item) => {
            if (!item.subItems) {
              const activeArchivos = item.name === "Archivos trabajadores" && isArchivosActive(normalizedPath);
              const isExactActive = location.pathname === item.path;

              return (
                <NavigationMenuItem key={item.name}>
                  <NavLink
                    to={item.path}
                    className={() =>
                      `flex flex-row items-center gap-2 px-4 py-2 rounded transition-colors ${
                        item.name === "Archivos trabajadores"
                          ? activeArchivos
                            ? "bg-white/60"
                            : "bg-transparent hover:bg-white/40"
                          : isExactActive
                            ? "bg-white/60"
                            : "bg-transparent hover:bg-white/40"
                      }`
                    }
                  >
                    <>
                      {Icons[item.iconKey](
                        "!text-lg shrink-0", // tamaño propio y no encogible
                        item.name === "Archivos trabajadores"
                          ? activeArchivos
                            ? "text-primary"
                            : "text-primary-bg"
                          : isExactActive
                            ? "text-primary"
                            : "text-primary-bg"
                      )}
                      <span className="text-xs">{item.name}</span> {/* tipografía pequeña solo en el texto */}
                    </>
                  </NavLink>
                </NavigationMenuItem>
              );
            }

            // Dashboard: abrir/cerrar solo con click
            return (
              <NavigationMenuItem key={item.name}>
                {/* contenedor con ref para detectar click fuera */}
                <div className="relative" ref={dashboardRef}>
                  <button
                    type="button"
                    className={`flex items-center justify-center gap-1 px-4 py-2 rounded bg-transparent font-normal transition-colors
                      ${dashboardOpen || isDashboardActive(location) ? "!bg-primary-bg/60" : "hover:!bg-primary-bg/40"}
                      focus:!bg-primary-bg/60`}
                    onClick={() => setDashboardOpen((open) => !open)}
                    aria-haspopup="true"
                    aria-expanded={dashboardOpen}
                  >
                    <span className="flex items-center gap-2">
                      {Icons["dashboard"](
                        "!text-lg shrink-0",
                        dashboardOpen || isDashboardActive(location) ? "text-primary" : "text-primary-bg"
                      )}
                      <span className="text-xs">Dashboard</span> {/* texto pequeño solo aquí */}
                    </span>
                    <span className={`transform transition-transform duration-300 ${dashboardOpen ? "rotate-180" : ""}`}>
                      {React.cloneElement(Icons.arrowDown, {
                        className: `!text-sm shrink-0 ${dashboardOpen ? "text-primary" : "text-primary-text"}`
                      })}
                    </span>
                  </button>

                  {dashboardOpen && (
                    <div className="absolute left-0 mt-2 z-50 w-64 rounded shadow-sm">
                      <div className="relative rounded overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none rounded backdrop-blur-md bg-primary-bg/85" />
                        <div className="relative z-10 p-2 text-primary-text text-sm">
                          {items.find((i) => i.name === "Dashboard")?.subItems.map((sub) => {
                            if (sub.children) {
                              const isGroupActive = sectionQS === "Nesplora Ice Cream";
                              return (
                                <div key={sub.name} className="flex flex-col gap-1">
                                  {/* Grupo (sin NavigationMenuLink) */}
                                  <NavLink
                                    to={sub.path}
                                    className={() => ddItemClasses(isGroupActive)}
                                    onClick={() => setDashboardOpen(false)}
                                  >
                                    {sub.name}
                                  </NavLink>

                                  <div className="ml-4 flex flex-col gap-1">
                                    {sub.children.map((tab) => {
                                      const tabKey = nesploraQueryByLabel[tab];
                                      const isActive = isGroupActive && tabQS === tabKey;
                                      return (
                                        // Item hijo (sin NavigationMenuLink)
                                        <NavLink
                                          key={tab}
                                          to={`/dashboard?section=Nesplora%20Ice%20Cream&tab=${tabKey}`}
                                          className={() => ddItemClasses(isActive)}
                                          onClick={() => setDashboardOpen(false)}
                                        >
                                          {tab}
                                        </NavLink>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            }

                            // EEG (sin NavigationMenuLink)
                            const isEegActive = sectionQS === "EEG";
                            return (
                              <NavLink
                                key={sub.name}
                                to={sub.path}
                                className={() => ddItemClasses(isEegActive)}
                                onClick={() => setDashboardOpen(false)}
                              >
                                {sub.name}
                              </NavLink>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>

      {/* PROFILE MENU (RIGHT) */}
      <div className="flex items-center pr-6">
        <div className="relative" ref={profileMenuRef}>
          <button
            className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-normal transition-colors
              ${profileMenuOpen ? '!bg-primary-bg/60' : 'bg-transparent hover:!bg-primary-bg/40 focus:!bg-primary-bg/60'}`}
            onClick={() => setProfileMenuOpen((open) => !open)}
            aria-haspopup="true"
            aria-expanded={profileMenuOpen}
          >
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center
                ${profileMenuOpen ? 'border-primary' : 'border-primary-bg'}`}
            >
              {React.cloneElement(Icons.user, {
                className: `!text-lg shrink-0 ${profileMenuOpen ? 'text-primary' : 'text-primary-bg'}`
              })}
            </div>
            <span className="font-medium text-xs">{user.name}</span>
            <span className={`transform transition-transform duration-300 ${profileMenuOpen ? "rotate-180" : ""}`}>
              {React.cloneElement(Icons.arrowDown, {
                className: `!text-sm shrink-0 ${profileMenuOpen ? "text-primary" : "text-primary-text"}`
              })}
            </span>
          </button>
          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-primary-bg/85 rounded shadow-lg z-50 flex flex-col">
              <button
                className={`${ddItemClasses(false)} w-full justify-start text-sm py-2`}
                onClick={() => {
                  setProfileMenuOpen(false);
                  if (onLogout) onLogout();
                }}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}