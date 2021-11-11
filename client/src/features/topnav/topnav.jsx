import React, { useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Nav from "react-bootstrap/Nav";
import { useDispatch } from "react-redux";
import logo from "./images/atomic-object.jpg"
import { Button } from 'react-bootstrap'
// import {
//   addEmployee,
//   deleteEmployee,
//   editEmployee,
//   addProject,
//   deleteProject,
//   editProject,
// } from "../modals/modalSlice";

import { openModal, editTask } from "../modals/modalSlice"
import "./topnav.css";




function Topnav() {
  const dispatch = useDispatch();
  const [filterButton, setFilterButton] = useState('Display Filters')

  function myFunction() {
    var x = document.getElementsByClassName("filters")[0];
    var board = document.getElementsByClassName("board")[0]
    if (x.style.display === "block") {
      setFilterButton("Display filters")
      x.style.display = "none";
      board.style.marginTop = "50px"

    } else {
      x.style.display = "block";
      setFilterButton("Hide filters")
      board.style.marginTop = "0"
    }
  }

  return (
    <div className="top-nav">
      <Navbar fixed="top" collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand href="#home">
          <img
            src={logo}
            alt="Atomic Object"
            className="d-inline-block align-top"
          />{" "}
        </Navbar.Brand>
        <div className="app-name">
          <p>ATOMIC</p>
          <p>PLANIT</p>
        </div>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" bg="primary" />
        <Navbar.Collapse
          id="responsive-navbar-nav"
          className="justify-content-end"
          bg="primary"
        >
          <Button onClick={myFunction} variant="outline-primary" className='toggle-button'>{filterButton}</Button>
          <Button onClick={() => dispatch(openModal('editAdmin'))} variant="outline-primary" className='toggle-button'>Admin</Button>
          <Nav>
            <NavDropdown
              title="TASKS"
              id="collasible-nav-dropdown"
              bg="primary"
            >
              <NavDropdown.Item
                href=""
                onClick={() => dispatch(editTask())}
              >
                Add A Task
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown
              title="EMPLOYEES"
              id="collasible-nav-dropdown"
              bg="primary"
            >
              <NavDropdown.Item
                href=""
                onClick={() => dispatch(openModal('addEmployee'))}

              >
                Add An Employee
              </NavDropdown.Item>
              <NavDropdown.Item
                href=""
                onClick={() => dispatch(openModal('deleteEmployee'))}


              >
                Delete An Employee
              </NavDropdown.Item>
              <NavDropdown.Item
                href=""
                onClick={() => dispatch(openModal('editEmployee'))}


              >
                Edit An Employee
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown
              title="PROJECTS"
              id="collasible-nav-dropdown"
              className="nav-jobs"
            >
              <NavDropdown.Item
                href=""
                onClick={() => dispatch(openModal('addProject'))}
              >
                Add A Project
              </NavDropdown.Item>
              <NavDropdown.Item
                href=""
                onClick={() => dispatch(openModal('deleteProject'))}
              >
                Delete A Project
              </NavDropdown.Item>
              <NavDropdown.Item
                href=""
                onClick={() => dispatch(openModal('editProject'))}
              >
                Edit A Project
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
}

export default Topnav;
