// context.tsx
"use client";
import React, { createContext, useReducer, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

const MaterialTailwindContext = createContext(null);
MaterialTailwindContext.displayName = "MaterialTailwindContext";

function reducer(state, action) {
  switch (action.type) {
    case "OPEN_SIDENAV":
      return { ...state, openSidenav: action.value };
    case "SIDENAV_TYPE":
      return { ...state, sidenavType: action.value };
    case "SIDENAV_COLOR":
      return { ...state, sidenavColor: action.value };
    case "TRANSPARENT_NAVBAR":
      return { ...state, transparentNavbar: action.value };
    case "FIXED_NAVBAR":
      return { ...state, fixedNavbar: action.value };
    case "OPEN_CONFIGURATOR":
      return { ...state, openConfigurator: action.value };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

function MaterialTailwindControllerProvider({ children }) {
  const initialState = {
    openSidenav: false,
    sidenavColor: "dark",
    sidenavType: "white",
    transparentNavbar: true,
    fixedNavbar: false,
    openConfigurator: false,
  };

  const [controller, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => [controller, dispatch], [controller]);

  return (
    <MaterialTailwindContext.Provider value={value}>
      {children}
    </MaterialTailwindContext.Provider>
  );
}

function useMaterialTailwindController() {
  const context = useContext(MaterialTailwindContext);
  if (!context) {
    throw new Error(
      "useMaterialTailwindController should be used inside the MaterialTailwindControllerProvider."
    );
  }
  return context;
}

MaterialTailwindControllerProvider.displayName = "MaterialTailwindControllerProvider";

MaterialTailwindControllerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const setOpenSidenav = (dispatch, value) =>
  dispatch({ type: "OPEN_SIDENAV", value });
const setSidenavType = (dispatch, value) =>
  dispatch({ type: "SIDENAV_TYPE", value });
const setSidenavColor = (dispatch, value) =>
  dispatch({ type: "SIDENAV_COLOR", value });
const setTransparentNavbar = (dispatch, value) =>
  dispatch({ type: "TRANSPARENT_NAVBAR", value });
const setFixedNavbar = (dispatch, value) =>
  dispatch({ type: "FIXED_NAVBAR", value });
const setOpenConfigurator = (dispatch, value) =>
  dispatch({ type: "OPEN_CONFIGURATOR", value });

export {
  MaterialTailwindContext,
  MaterialTailwindControllerProvider,
  useMaterialTailwindController,
  setOpenSidenav,
  setSidenavType,
  setSidenavColor,
  setTransparentNavbar,
  setFixedNavbar,
  setOpenConfigurator,
};
