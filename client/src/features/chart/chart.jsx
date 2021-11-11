import React, { useState} from "react";
import "./chart.css";
import { useDispatch, useSelector } from "react-redux";
import { editTask, updateTask } from "../modals/modalSlice";
import { selectTile, addProjectTile } from "./projectTileSlice";
import { selectDateHeader,
  selectEmployeesSelected,selectOfficeSelected,
  selectProjectsSelected} from "../filters/filterSlice"
import { GET_EMPLOYEES } from "../../App";
import {client } from "../../index"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import { isMobile } from "react-device-detect";

var clickedRow = null;
var selectedCellValues = new Map();
var selectedCells = [];
var dateList = [];
var weekHoursEdit = 0;
var copyProject = null;


export function getCurMonday(){
  var today = new Date()
  while (today.getDay()!== 1){
    today.setDate(today.getDate()-1);
  }
  today = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
  // var date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();
  return today;
}

export function getFollowingMonday(cur,m){
  cur.setDate(cur.getDate()+7*m)
  return cur
}

export function dateToStr(date){
  return (date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate())
}

function DateCell(props) {
  let employeeNameCellClass = ["cell", `date-cell`, `row${props.rowId}` ,`col${props.colId}`];
  employeeNameCellClass = employeeNameCellClass.join(" ");
return (<div className={employeeNameCellClass}>{props.date}</div>);
}


function DateHeader(props) {
  // const lst = [...Array(props.colCount).keys()];
  const lst = props.dateArr;
  //create a list of cell component in a row
  const a = lst.map((date,index) => <DateCell key={index} empId={props.empId} rowId={props.rowId} colId={index} date = {date}/>);

  return (
    <div className="board-row date-header">
      {/* add a employee name cell at beginning of a row */}
      <EmployeeNameCell rowId={props.rowId} empId={props.empId} />
      {a}
    </div>
  );
}

function EmployeeNameCell(props) {
  const startHeader = new Date(useSelector(selectDateHeader).startDate);
  const endHeader = new Date(useSelector(selectDateHeader).endDate);
  let projects = []

  const popover = (
    <Popover id="popover-basic">
      <Popover.Content>
        <p style={{margin: 0}}><strong>Projects: </strong></p>
        {projects}
      </Popover.Content>
    </Popover>
  );
  if(props.tasks !== null && props.tasks !== undefined){
    props.tasks.forEach(task=>{
    const startDate = Date.parse(task.start_date);
    const endDate = Date.parse(task.end_date);
    if ((startDate <= startHeader && endDate >= startHeader) || (startDate >= startHeader && startDate <= endHeader )){
      projects.push(<p style={{margin: 0}}> {task.project.name}</p>)
    }
  })}
  
  let employeeNameCellClass = ["cell", `employee-cell`, `row${props.rowId}`, `col${props.colId}`];
  employeeNameCellClass = employeeNameCellClass.join(" ");
  var colors = ["red", "blue", "green", "orange"]
  var color = colors[props.office-1]
  return (<OverlayTrigger bsClass="tooltip" placement = "bottom-start" flip={true} overlay={popover}><div className={employeeNameCellClass}>
      <div style={{color: color}}>{props.rowId}</div>
    </div></OverlayTrigger>);
}

function Cell(props) {
  const dispatch = useDispatch();
  
  let cellClass = ["cell", `row${props.rowId}`, `col${props.colId}`];
  cellClass = cellClass.join(" ");

  // returns a map of maps of a list of colors for a particular cell
  const p = useSelector(selectTile);
  // returns a map of maps of a list of project names for a particular cell
  // const pname = useSelector(selectProject);
  // const soldMap = useSelector(selectSold);
  
  const sdr = new Date(useSelector(selectDateHeader).startDate);
  // zero out the time of day
  var startDate = new Date(sdr.getFullYear(), sdr.getMonth(), sdr.getDate(), 0, 0, 0, 0)
  var colHead = (getFollowingMonday(startDate, props.colId));
  var colHeadStr = dateToStr(colHead)

  function onenter(e){
    e.children[1].style.boxShadow = '0 0 10px #505250';
  };

  function getPopover(ele){
    return(
      <Popover id="popover-basic">
        <Popover.Content>
          <p><strong>Employee: </strong>{props.rowId}<br/>
          <strong>Project: </strong>{ele.project}<br/>
          <strong>Hours: </strong>{ele.hours}</p>
        </Popover.Content>
      </Popover>
)
  }
    
  function processTile(ele) {
    var sold = ele.sold ? "Yes" : "No";
    var tileClass;
    if (sold === "Yes") {
      tileClass = [`projectTile`, `row${props.rowId}`, `col${props.colId}`];
    } else {
      tileClass = [`projectTileSold`, `row${props.rowId}`, `col${props.colId}`];
    }
    tileClass = tileClass.join(" ")
    var hours = (ele.hours * 50) / 40;
    var tile = (
      <OverlayTrigger
        key={ele.project+colHeadStr+'pop'}
        placement="bottom-start"
        flip={true}
        overlay={getPopover(ele)}
        onEntering={onenter}
      >
        <div
          className={tileClass+colHeadStr}
          key={ele.project+colHeadStr}
          onClick={(e) => {
            if (e.altKey){
              if (copyProject === null){
                copyProject = [ele.pid, new Date(ele.start).toISOString(), new Date(ele.end).toISOString(), ele.hours, weekTimes, props.rowId]
              }
              else{
                dispatch(editTask([props.empId, copyProject[1], copyProject[2], copyProject[4], copyProject[3], copyProject[0]]))
                copyProject = null
              }
            }
            if (e.ctrlKey || e.metaKey){
              clickedRow=null;
              dispatch(updateTask([props.empId, ele.pid, new Date(ele.start).toISOString(), new Date(ele.end).toISOString(), ele.hours, props.rowId, ele.project, weekTimes]))
            }
            if (e.shiftKey ){
              dispatch(updateTask([props.empId, ele.pid, new Date(ele.start).toISOString(), new Date(ele.end).toISOString(), ele.hours, props.rowId, ele.project, weekTimes, new Date(colHead).toISOString()]))
            }
          }} 
          style={{ height: hours, backgroundColor: ele.color }}
        />
      </OverlayTrigger>
    );
    tiles.push(tile);
  }
  
  var tiles = [];
  var weekHours = 0;
  var startWeek = null;
  var weekTimes = {};
  if (p[props.rowId] && p[props.rowId][colHeadStr]) {
    p[props.rowId][colHeadStr].forEach(processTile);
    p[props.rowId][colHeadStr].forEach(processHours);
    weekTimes[new Date(startWeek)] = weekHours;

  function processHours(ele){
    weekHours += ele.hours;
    startWeek = new Date(ele.start).toISOString();
  }
}

return (
  <div className={cellClass}
  onClick={(e) => {
    if (e.altKey && copyProject !== null && props.rowId !== copyProject[5]){
      dispatch(editTask([props.empId, copyProject[1], copyProject[2], copyProject[4], copyProject[3], copyProject[0]]))
      copyProject = null
    }
  }}
  onMouseDown={(e) => {
    const mobile = Boolean(window.navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
    if (mobile){
      return
    }
    e.persist()
    e.preventDefault();

    selectedCells.push(e.currentTarget);
    // make the overlay div visible
    e.currentTarget.childNodes[0].style.height="100px";
    clickedRow = props.rowId;
    dateList.push(colHead.toISOString())
    
    e.stopPropagation();
  }}
  onMouseEnter={(e) => {
    e.persist();
    
    if (clickedRow === null){
      return
    }
    //console.log("enter");
    if(clickedRow === props.rowId){
      dateList.push(colHead.toISOString())
      selectedCells.push(e.currentTarget);
      e.currentTarget.childNodes[0].style.height="100px"; 
    }
    e.stopPropagation();
  }}
  onMouseUp={(e) => {
    const mobile = Boolean(window.navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
    if (mobile){
      return
    }
    e.persist()
    //console.log("up");
    dateList.sort()
    const selectStart = dateList[0]
    const selectEnd = dateList[dateList.length-1]
    selectedCells.forEach(el => {
      el.childNodes[0].style.height = "0";
    }) 
    selectedCells = []
    if (e.ctrlKey || e.shiftKey || e.metaKey || e.altKey){
      clickedRow = null;
      dateList = [];
      weekHoursEdit = 0;
      return;
    }
    if (clickedRow === props.rowId){
      if (p[props.rowId] && p[props.rowId][colHeadStr]) {
        p[props.rowId][colHeadStr].forEach(ele => {
          weekHoursEdit += ele.hours;
        })
      }
      dispatch(editTask([props.empId, selectStart, selectEnd, weekHoursEdit]))
    }
    clickedRow = null;
    dateList = [];
    weekHoursEdit = 0;
    e.stopPropagation()
  }}
  >
    <div class="cell-overlay" />
    {tiles}
  </div>
);
}



function Row(props) {
  // a list of id from 0 to col count
  // const lst = [...Array(props.colCount).keys()];
  const lst = props.dateList;


  //create a list of cell component in a row
  const a = lst.map((date,index) => <Cell key={date} rowId={props.rowId} empId={props.empId} colId={index} />);

  // const a = lst.map((m) => <Cell key={m} empName={props.empName} colId={m} />);

  return (
    <div className="board-row">
      {/* add a employee name cell at beginning of a row */}
      <EmployeeNameCell rowId={props.rowId} empId={props.empId} office={props.office} tasks = {props.tasks}/>
      
      {a}
    </div>
  );
}


const getFilteredEmp = (employees, employeesSelected, officeSelected, projectsSelected,startHeader, endHeader)=>{

  let filteredArr = [...employees]
  if(employeesSelected.length !==0){
    filteredArr = filteredArr.filter(function (el) {
      return employeesSelected.includes(el.pk_employee_id)
    });
  }
  if (officeSelected.length !== 0){
    filteredArr = filteredArr.filter(function (el) {
      return officeSelected.includes(el.fk_office_id)
    });
  } 
  if (projectsSelected.length !== 0){
    filteredArr = filteredArr.filter(function (el) {
      if (el.tasks == null){
        return false
      }
      return projectsSelected.some(item => el.tasks.map(proj => proj.fk_project_id).includes(item))
    });
  }

  function compare(a,b){
    if (a.tasks === null || a.tasks.length === 0 ){
      return -1
    }
    if (b.tasks === null || b.tasks.length === 0){
      return 1

    }
    var thisWeekATask = null;
    var aHours = null;
    var thisWeekBTask = null;
    var bHours = null;
    let aSmallestStart = null
    let bSmallestStart = null


    a.tasks.forEach(task => {
      const startDate = Date.parse(task.start_date);
      const endDate = Date.parse(task.end_date);

      // check if task in the filtered date period
      if ((startDate <= startHeader && endDate >= startHeader ) || (startDate >= startHeader && startDate <= endHeader)){ 
        // compare the start date 
        if(!aSmallestStart  || startDate < aSmallestStart){
          aHours = task.hours;
          thisWeekATask = task;
          aSmallestStart = startDate
        // if startdate equal, compare hours of different tiles in a cell
        }else if (startDate === aSmallestStart){
          if (!aHours || task.hours > aHours){
            aHours = task.hours;
            thisWeekATask = task;
          }
        }
      }
    })
    b.tasks.forEach(task => {
      const startDate = Date.parse(task.start_date);
      const endDate = Date.parse(task.end_date);

      // check if task in the filtered date period
      if ((startDate <= startHeader && endDate >= startHeader) || (startDate >= startHeader && startDate <= endHeader )){ 
        // compare the start date 
        if(!bSmallestStart  || startDate < bSmallestStart){
          bHours = task.hours;
          thisWeekBTask = task;
          bSmallestStart = startDate
        
        // if startdate equal, compare hours of different tiles in a cell
        }else if (startDate === bSmallestStart){
        if (!bHours || task.hours > bHours){
          bHours = task.hours;
          thisWeekBTask = task;
        }
      }
    }
  })

    if (! thisWeekBTask){  

      return 1;

    }else if (!thisWeekATask){   

      return -1
    }
    // console.log(thisWeekATask.start_Date)

      if (thisWeekATask.project.name> thisWeekBTask.project.name){   

      return 1;

    }else if (thisWeekATask.project.name < thisWeekBTask.project.name){   

      return -1
    }else{ 
      if(Date.parse(thisWeekATask.start_date) < Date.parse(thisWeekBTask.start_date)){
        console.log("smaller")
  
        return -1
      }else if (Date.parse(thisWeekATask.start_date) > Date.parse(thisWeekBTask.start_date)){
        return 1
      }else{
        // if name equal, compare hours, employee who has more hours on this project on the top
      if (thisWeekATask.hours > thisWeekBTask.hours){
        return -1
      }else if (thisWeekATask.hours < thisWeekBTask.hours){
        return 1
      }
      return 0
    }}
      
    
    
  }
  // filteredArr.forEach(filter)
  filteredArr.sort(compare)
  return filteredArr
}

function Rows() {
  const data = client.readQuery({query:GET_EMPLOYEES});
  const Dates = useSelector(selectDateHeader) // from filterSlice
  // const employees = useSelector(selectEmployees)
  const employeesSelected = useSelector(selectEmployeesSelected)
  const officeSelected = useSelector(selectOfficeSelected)
  const projectsSelected = useSelector(selectProjectsSelected)
  const dateArr = Dates.dateArr;
  const startHeader = new Date(useSelector(selectDateHeader).startDate);
  const endHeader = new Date(useSelector(selectDateHeader).endDate);
  const filteredEmployees = getFilteredEmp(data.getEmployees,employeesSelected, officeSelected,projectsSelected,startHeader,endHeader)
  const dispatch = useDispatch();
  // getTasks(dispatch,employees)
  getTasks(dispatch,filteredEmployees)

  return (
    filteredEmployees.map((employee,index) =>
    <Row 
      rowId={employee.first_name + " " + employee.last_name} 
      empId={employee.pk_employee_id}
      dateList={dateArr}
      key={employee.pk_employee_id}
      office = {employee.fk_office_id}
      tasks = {employee.tasks}
    />)
  )
}

async function getTasks(dispatch,employees) {

  dispatch(addProjectTile(employees))
}

function Chart() {
  const Dates = useSelector(selectDateHeader) 
  const dateArr = Dates.dateArr

  return(
    <div className="board">
      <DateHeader empName={'date'} dateArr={dateArr}/>
      <Rows />
    </div>
  )

  
}
export default Chart;
