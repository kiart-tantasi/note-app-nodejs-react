import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Nav.module.css";

export default function Header() {
  return (
    <div className={styles["main-nav"]}>

      {/* /POSTS */}
      <NavLink
        className={({ isActive }) => (isActive ? styles["route-active"] : styles.route)}
        to="/posts"
      >
        โพสต์อิท
      </NavLink>

      {/* /ACCOUNT */}
      <NavLink
        className={({ isActive }) => (isActive ? styles["route-active"] : styles.route)}
        to="/account"
      >
        บัญชี
      </NavLink>

    </div>
  );
}