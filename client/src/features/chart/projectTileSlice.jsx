import { createSlice } from "@reduxjs/toolkit";
import { dateToStr } from "./chart";


function getMonday(day){
  while (day.getDay()!== 1){
    day.setDate(day.getDate()-1);
  }
  day = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0)
  return day
}
export const slice = createSlice({
  name: "projectTile",
  initialState: {
    tilesMap: {},
    projectMap: {},
    soldMap: {},
  },
  reducers: {
    addProjectTile: (state, action) => {
      const employees = [...action.payload];
      state.tilesMap = {};

      employees.forEach((emp) => {
        var employeeName = emp.first_name + " " + emp.last_name;
        if (emp.tasks) {

          emp.tasks.forEach((task) => {
            var start = Date.parse(task.start_date);
            var end = Date.parse(task.end_date);
            var color = task.project.project_color;
            var project = task.project.name;
            var pid = task.fk_project_id;
            var sold = task.project.sold;
            var hours = task.hours;
            if (!color) {
              color = "#121212";
            }
            if (!state.tilesMap[employeeName]) {
              state.tilesMap[employeeName] = {};
            }
            var startDate = getMonday(new Date(start));
            var endDate = getMonday(new Date(end));
              for (
                var d = startDate;
                d <= endDate;
                d.setDate(d.getDate() + 7)
              ) {
                if (!state.tilesMap[employeeName][dateToStr(d)]) {
                  state.tilesMap[employeeName][dateToStr(d)] = [
                    {
                      project: project,
                      color: color,
                      sold: sold,
                      hours: hours,
                      start: start,
                      end: end,
                      pid: pid,
                    },
                  ];
                } else {
                  state.tilesMap[employeeName][dateToStr(d)].push({
                    project: project,
                    color: color,
                    sold: sold,
                    hours: hours,
                    start: start,
                    end: end,
                    pid: pid,
                  });
                }
              }
            // }
          });
        }
      });
    },
  },
});
// create the action
export const { addProjectTile } = slice.actions;
// the selector will retrieve the tilesList
export const selectTile = (state) => state.projectTile.tilesMap;
// Project names
export const selectProject = (state) => state.projectTile.projectMap;
// create the reducer
export default slice.reducer;
