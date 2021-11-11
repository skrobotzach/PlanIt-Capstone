import React, { useState } from "react";
import "../modals.css";
import { Form, Button } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, selectCell } from "../modalSlice";
import DatePicker from "react-datepicker";
import { DisplayEmployees } from "../employee/deleteEmployee";
import { DisplayProjects } from "../project/deleteProject";
import { gql, useMutation} from "@apollo/client";
import "react-datepicker/dist/react-datepicker.css";
import { GET_EMPLOYEES } from "../../../App";



const EDIT_TASK = gql`
  mutation($eid: Int, $pid: Int, $sdate: String, $edate: String, $hrs: Int) {
    createTask(eid: $eid, pid: $pid, sdate: $sdate, edate: $edate, hrs: $hrs) {
      hours
      end_date
      fk_project_id
      start_date
      project{
        name
        project_color
        sold
      }
    }
  }
`;



const dateFormat = (dateObj) => {
  if (dateObj){
    var month = dateObj.getUTCMonth() + 1; //months from 1-12
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();
    var formatDate = month + "/" + day + "/" + year;
  }
  
  return formatDate;
};

function AssignTaskForm(props) {

  // console.log(Date.parse(dateHeader.startDate))
  const isMonday = (date) => {
    const day = date.getDay();
    return day === 1;
  };
  const isFriday = (date) => {
    const day = date.getDay();
    return day === 5;
  };

  // cell clicked on timeline
  var startCell = useSelector(selectCell); // [empName, colnum, date]
  if (startCell !== null){
    var employeeId = startCell[0]
    var start = new Date(startCell[1])
    var end = new Date(startCell[2])
    var weekTimes = startCell[3];
    if (startCell[4]){
      var hours = startCell[4]
      var projectId = startCell[5];
    }

  }
  else {
    projectId = null
    employeeId = null
    start = new Date()
    end = new Date()
    hours = null
  }

  const [validated, setValidated] = useState(false);
  // start date will be the cell that is selected by default
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);
  // swapped getFollowingMonday(new Date(dateHeader.startDate), startCell[1]) with dateCell
  // startCell[1] is different now
  
  const [startDateStr, setStartDateStr] = useState(dateFormat(start));
  const [endDateStr, setEndDateStr] = useState(dateFormat(end));
  const [hrs, setHrs] = useState(hours);
  const [empid, setEmpID] = useState(employeeId);
  const [projid, setProjid] = useState(projectId);
  const [empValidate, setEmpValidate] = useState(null)
  const [projValidate, setProjValidate] = useState(null)
  const [createTask] = useMutation(EDIT_TASK);

  function onEmployeeSelected(target) {
    setEmpID(parseInt(target.value));
  }

  function onProjectSelected(target) {
    setProjid(parseInt(target.value));
  }

  function onStartDateSelected(date) {
    setStartDate(date);
    setStartDateStr(dateFormat(date));
  }

  function onEndDateSelected(date) {
    setEndDate(date);
    setEndDateStr(dateFormat(date));
  }

  var errorCheck = null;
  if (weekTimes === 40){
    errorCheck = (<div className="errorCheck">Employee has already been assigned 40 hours this week</div>)
  }
  else if (weekTimes > 40){
    errorCheck = (<div className="errorCheck">Employee has already been assigned more than 40 hours this week</div>)
  }

  const dispatch = useDispatch();
  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false || !empid || projid===undefined) {
      if(!empid){
        setEmpValidate((<p style={{color:"#dc3545", fontSize:"80%"}}>Please select an employee.</p>));
      }
      if(projid===undefined){
        setProjValidate((<p style={{color:"#dc3545", fontSize:"80%"}}>Please select a project.</p>));
      }
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      createTask({
        variables: {
          eid: empid,
          pid: projid,
          sdate: startDateStr,
          edate: endDateStr,
          hrs: parseInt(hrs),
        },
        refetchQueries: [{query:GET_EMPLOYEES}]
        
      });
      dispatch(closeModal());

      // the cell to be filled will change if the start date changed
      //startCell = [startCell[0], getCol(startDate, dateHeader)];


      // send employeeName, startDate, endDate
      // dispatch(addProjectTile([employeeName, startDate.toISOString(), endDate.toISOString()]));
    }

    setValidated(true);
  };


  return (
    <div className="form-container">
      <Form
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
        className={"popup-form"}
      >
        <div className="form-title">
          <h1>Assign A Task</h1>
        </div>
        <div className="form-main">
          <Form.Row>
            <Form.Group as={Col} md="6" controlId="validationFormik07">
              <Form.Label>EMPLOYEE</Form.Label>
              <DisplayEmployees defaultEmployee = {empid} onEmployeeSelected={onEmployeeSelected} />
              {empValidate}
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md="6" controlId="validationFormik05">
              <Form.Label>PROJECT</Form.Label>
              <DisplayProjects defaultProject={projid} onProjectSelected={onProjectSelected} />

              {projValidate}
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} md="4" controlId="validationFormik02">
              <Form.Label>HRS/WEEK</Form.Label>
              <Form.Control
                type="text"
                placeholder="HRS/Week"
                defaultValue={hrs}
                onChange={(e) => setHrs(e.target.value)}
                required
              />

              <Form.Control.Feedback type="invalid">
                Please provide a valid task.
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="4" controlId="validationFormikUsername">
              <Form.Label>FROM</Form.Label>
              <InputGroup>
                <DatePicker
                  className="form-control"
                  selected={startDate}
                  // onChange={date => setStartDate(date)}
                  onChange={onStartDateSelected}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  filterDate={isMonday}
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a valid start date.
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            <Form.Group as={Col} md="4" controlId="validationFormik03">
              <Form.Label>TO</Form.Label>
              <InputGroup>
                <DatePicker
                  className="form-control"
                  selected={endDate}
                  onChange={onEndDateSelected}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  filterDate={isFriday}
                />

                <Form.Control.Feedback type="invalid">
                  Please provide a valid end date.
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          {errorCheck}
          </Form.Row>

          <div className="buttons">
            <Button
              className="mx-3 button-submit"
              type="submit"
              variant="primary"
            >
              Submit{" "}
            </Button>
            <Button
              variant="secondary"
              className="mx-3 button-cancel"
              type="button"
              onClick={()=>{dispatch(closeModal())}}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
/*
function getCol(d, dateHeader) {
  // given a date, return the column number associated with the date

  if (d == null) {
    return false;
  }

  // FIX ASAP 30 is an arbitrary limit. Need to reference chart.colCount
  // replace 30 with the length of date header
  for (var i = 0; i < dateHeader.dateArr.length; i++) {
    // replcae curmonday with the start monday of the date header
    var d2 = getFollowingMonday(new Date(dateHeader.startDate), i);

    if (
      d.getDate() === d2.getDate() &&
      d.getMonth() === d2.getMonth() &&
      d.getYear() === d2.getYear()
    ) {
      return i;
    }
  }
  return false;
  
}
*/
export default AssignTaskForm;
export {EDIT_TASK};
