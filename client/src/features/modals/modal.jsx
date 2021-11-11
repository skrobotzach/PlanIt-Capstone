import React from 'react'
import AddEmployee from './employee/addEmployee'
import DeleteEmployee from './employee/deleteEmployee'
import EditEmployee from './employee/editEmployee'
import AddProject from './project/addProject'
import DeleteProject from './project/deleteProject'
import EditProject from './project/editProject'
import EditTask from './task/editTask'
import UpdateTask from './task/updateTask'
import EditAdmin from './admin/editAdmin'
import { useSelector } from 'react-redux'
import {selectModal} from './modalSlice'

// decide which modal to popup based on state property show
function Modals() {
  const show = useSelector(selectModal)
    switch (show) {
      case "addEmployee":
        return(
          <AddEmployee/>
        )
      case "deleteEmployee":
        return(
          <DeleteEmployee/>
        )
        
      case "editEmployee":
        return(
          <EditEmployee/>
        )
      case "addProject":
        return(
          <AddProject/>
        )
      case "deleteProject":
          return(
            <DeleteProject/>
          )
      case "editProject":
        return (
          <EditProject/>
        )
      case "editTask":
        return (<EditTask/>)
      case "updateTask":
        return (<UpdateTask/>)
      case "editAdmin":
        return (<EditAdmin/>)
      default:
        return null
    }

}

export default Modals