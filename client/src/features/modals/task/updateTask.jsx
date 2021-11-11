import React, { useState } from "react";
import "../modals.css";
import { Form, Button } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, selectTaskData } from "../modalSlice";
import DatePicker from "react-datepicker";
import { gql, useMutation} from "@apollo/client";
import "react-datepicker/dist/react-datepicker.css";
import { GET_EMPLOYEES } from "../../../App";
import { EDIT_TASK } from "./editTask"



const UPDATE_TASK = gql`
  mutation($eid: Int, $pid: Int, $sdate: String, $edate: String, $newsdate: String, $newedate: String, $hrs: Int) {
    editTask(eid: $eid, pid: $pid, sdate: $sdate, edate: $edate, newsdate: $newsdate, newedate: $newedate, hrs: $hrs) {
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

const REMOVE_TASK = gql`
  mutation($eid: Int, $pid: Int, $sdate: String, $edate: String) {
    removeTask(eid: $eid, pid: $pid, sdate: $sdate, edate: $edate) {
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

function UpdateTaskForm(props) {

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
  var startTask = useSelector(selectTaskData); // [empName, colnum, date]
  if (startTask){
    var employeeId = parseInt(startTask[0]);
    var projectId = parseInt(startTask[1])
    var dateStarted = new Date(startTask[2]);
    var dateEnded = new Date(startTask[3]);
    var hours = startTask[4];
    var empName = startTask[5];
    var projName = startTask[6];
    var weekTimes = startTask[7];
    if (startTask[8]){
      var singWeekUpdate = new Date(startTask[8]);
    }
  }

  
  // TEMPORARY: if the drop down edit task menu is clicked, startCell = [0,0]
  if (startTask == null) {
    startTask = [0, 0, 0, 0, 0];
    employeeId = null;
    hours = 0;
    singWeekUpdate = null
  }


  const [validated, setValidated] = useState(false);
  // start date will be the cell that is selected by default
  const [startDate, setStartDate] = useState(dateStarted);
  const [endDate, setEndDate] = useState(dateEnded);
  if (singWeekUpdate && startDate.getTime() !== singWeekUpdate.getTime()){
    setStartDate(new Date(singWeekUpdate.getTime()));
    setEndDate(new Date(singWeekUpdate.getTime() + 4 * 86400000));
  }
  
  // swapped getFollowingMonday(new Date(dateHeader.startDate), startCell[1]) with dateCell
  // startCell[1] is different now
  const [startDateStr, setStartDateStr] = useState(dateFormat(dateStarted)
  );
  const [oldEndDateStr] = useState(dateFormat(dateEnded));
  const [oldEndDate] = useState(dateEnded);
  const [oldStartDate] = useState(dateStarted);
  const [oldStartDateStr] = useState(dateFormat(dateStarted)
  );
  const [endDateStr, setEndDateStr] = useState(dateFormat(dateEnded));
  const [hrs, setHrs] = useState(hours);
  const [oldHrs] = useState(hours);
  const [empid] = useState(employeeId);
  const [projid] = useState(projectId);
  const [singleWeekUpdate] = useState(singWeekUpdate);
  const [singleWeekUpdateStr] = useState(dateFormat(singWeekUpdate));

  const [editTask] = useMutation(UPDATE_TASK);
  const [createTask] = useMutation(EDIT_TASK);
  const [removeTask] = useMutation(REMOVE_TASK);

  function onStartDateSelected(date) {
    setStartDate(date);
    setStartDateStr(dateFormat(date));
  }

  function onEndDateSelected(date) {
    setEndDate(date);
    setEndDateStr(dateFormat(date));
  }

  
  var errorCheck = null;
  
  if (weekTimes[startDate] === 40 || weekTimes[endDate] === 40){
    errorCheck = (<div className="errorCheck">Employee has already been assigned 40 hours this week</div>)
  }
  else if (weekTimes[startDate] > 40 || weekTimes[endDate] > 40){
    errorCheck = (<div className="errorCheck">Employee has already been assigned more than 40 hours this week</div>)
  }

  const dispatch = useDispatch();
  function handleDelete(event){
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      if (singleWeekUpdate === null || singleWeekUpdate === undefined){
        removeTask({
          variables: {
            eid: empid,
            pid: projid,
            sdate: oldStartDateStr,
            edate: oldEndDateStr,
          },
          refetchQueries: [{query:GET_EMPLOYEES}]
          
        });
      }
      else{
        event.preventDefault();
        if (oldStartDate < singleWeekUpdate){
          editTask({
            variables: {
              eid: empid,
              pid: projid,
              sdate: oldStartDateStr,
              edate: oldEndDateStr,
              newsdate: oldStartDateStr,
              newedate: dateFormat(new Date(singleWeekUpdate.getTime() - 3 * 86400000)),      
              hrs: parseInt(oldHrs),
            },
            refetchQueries: [{query:GET_EMPLOYEES}]
            
          });
          if (new Date(singleWeekUpdate.getTime() + 4 * 86400000) < oldEndDate){
            createTask({
              variables: {
                eid: empid,
                pid: projid,
                sdate: dateFormat(new Date(singleWeekUpdate.getTime() + 7 * 86400000)),
                edate: oldEndDateStr,
                hrs: parseInt(oldHrs),
              },
              refetchQueries: [{query:GET_EMPLOYEES}]
              
            });
          }
        }
        else{
          editTask({
            variables: {
              eid: empid,
              pid: projid,
              sdate: oldStartDateStr,
              edate: oldEndDateStr,
              newsdate: dateFormat(new Date(singleWeekUpdate.getTime() + 7 * 86400000)),
              newedate: oldEndDateStr,      
              hrs: parseInt(oldHrs),
            },
            refetchQueries: [{query:GET_EMPLOYEES}]
            
          });
        }
        

      }
      dispatch(closeModal());
  
    }

    setValidated(true);
  }
  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      if (singleWeekUpdate === null || singleWeekUpdate === undefined){
        event.preventDefault();
        editTask({
          variables: {
            eid: empid,
            pid: projid,
            sdate: oldStartDateStr,
            edate: oldEndDateStr,
            newsdate: startDateStr,
            newedate: endDateStr,      
            hrs: parseInt(hrs),
          },
          refetchQueries: [{query:GET_EMPLOYEES}]
          
        });
      }
      else{
        event.preventDefault();
        if (oldStartDate < singleWeekUpdate){
          editTask({
            variables: {
              eid: empid,
              pid: projid,
              sdate: oldStartDateStr,
              edate: oldEndDateStr,
              newsdate: oldStartDateStr,
              newedate: dateFormat(new Date(singleWeekUpdate.getTime() - 3 * 86400000)),      
              hrs: parseInt(oldHrs),
            }
            
          });
          createTask({
            variables: {
              eid: empid,
              pid: projid,
              sdate: singleWeekUpdateStr,
              edate: dateFormat(new Date(singleWeekUpdate.getTime() + 4 * 86400000)),
              hrs: parseInt(hrs),
            },
            refetchQueries: [{query:GET_EMPLOYEES}]
            
          });
          if (new Date(singleWeekUpdate.getTime() + 4 * 86400000) < oldEndDate){
            createTask({
              variables: {
                eid: empid,
                pid: projid,
                sdate: dateFormat(new Date(singleWeekUpdate.getTime() + 7 * 86400000)),
                edate: oldEndDateStr,
                hrs: parseInt(oldHrs),
              },
              refetchQueries: [{query:GET_EMPLOYEES}]
              
            });
          }
        }
        else{
          createTask({
            variables: {
              eid: empid,
              pid: projid,
              sdate: singleWeekUpdateStr,
              edate: dateFormat(new Date(singleWeekUpdate.getTime() + 4 * 86400000)),
              hrs: parseInt(hrs),
            }
            
          });
          editTask({
            variables: {
              eid: empid,
              pid: projid,
              sdate: oldStartDateStr,
              edate: oldEndDateStr,
              newsdate: dateFormat(new Date(singleWeekUpdate.getTime() + 7 * 86400000)),
              newedate: oldEndDateStr,      
              hrs: parseInt(oldHrs),
            },
            refetchQueries: [{query:GET_EMPLOYEES}]
            
          });
        }

      }
      
      dispatch(closeModal());
  
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
          <h1>Update Task</h1>
        </div>
        <div className="form-main">
          <Form.Row>
            <Form.Group as={Col} md="6" controlId="validationFormik07">
              <Form.Label>EMPLOYEE</Form.Label>
              <Form.Control
                type="text"
                defaultValue={empName}
              />
            </Form.Group>

            <Form.Group as={Col} md="6" controlId="validationFormik05">
              <Form.Label>PROJECT</Form.Label>
              <Form.Control
                type="text"
                defaultValue={projName}
              />
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} md="4" controlId="validationFormik02">
              <Form.Label>HRS/WEEK</Form.Label>
              <Form.Control
                type="text"
                defaultValue={hrs}
                placeholder="HRS/Week"
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
              className="mx-3 button-delete"
              type="button"
              variant="danger"
              onClick={(e) => handleDelete(e)}
            >
              Delete{" "}
            </Button>
            <Button
              variant="secondary"
              className="mx-3 button-cancel"
              type="button"
              onClick={() => dispatch(closeModal())}
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
export default UpdateTaskForm;
