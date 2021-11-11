import { createSlice } from '@reduxjs/toolkit';
import {getCurMonday, getFollowingMonday} from '../chart/chart'

function getMonday(date){
  while (date.getDay()!== 1){
    date.setDate(date.getDate()-1);
  }
  // var date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
  return date;
}

function getDateArr(start, end){
  let startMonday = getMonday(new Date(start))
  let endMonday = getMonday(new Date(end))
  let dateArr = [startMonday.toDateString().substring(4,10)]
  while (startMonday.toDateString() !== endMonday.toDateString(4,10)){
    
    startMonday = getFollowingMonday(startMonday,1)
    dateArr.push(startMonday.toDateString().substring(4,10))
  }
  return dateArr
}

export const slice = createSlice({
  name: "filters",
  initialState: {
    dateHeader: {
      dateArr: getDateArr(new Date().toISOString(), getFollowingMonday(getCurMonday(new Date()), 14).toISOString()),  // array of dates in dateHeader
      startDate: getCurMonday(new Date()).toISOString(),
      endDate: getFollowingMonday(getCurMonday(new Date()), 14).toISOString()
    },
    employees: [],
    employeesSelected: [],
    officeSelected:[],
    projectsSelected:[]

  },
  reducers: {
    updateDateHeader: (state, action) => {
      var startDate = action.payload[0];
      var endDate = action.payload[1];
      state.dateHeader.startDate = startDate
      state.dateHeader.endDate = endDate
      state.dateHeader.dateArr = getDateArr(action.payload[0],action.payload[1])
    },
    updateEmployees: (state,action) => {
      state.employees = action.payload
    },
    filterEmployees: (state,action) => {
      state.employeesSelected = action.payload
    },
    filterOffices: (state,action) => {
      state.officeSelected = action.payload
    },
    filterProjects: (state,action) => {
      state.projectsSelected = action.payload
    }
  }
  });


export const { updateDateHeader, updateEmployees, filterEmployees,filterOffices, filterProjects } = slice.actions;
// the selector will retrieve the tilesList
export const selectDateHeader = state => state.filters.dateHeader;
export const selectEmployees = state => state.filters.employees;
export const selectEmployeesSelected = state => state.filters.employeesSelected;
export const selectOfficeSelected = state => state.filters.officeSelected;
export const selectProjectsSelected = state => state.filters.projectsSelected;




// create the reducer
export default slice.reducer; 

