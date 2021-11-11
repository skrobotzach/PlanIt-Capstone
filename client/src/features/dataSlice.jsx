import { createSlice } from '@reduxjs/toolkit';

export const slice = createSlice({
  name: "dataReducer",
  initialState: {
    projectMap: {}
  },
  reducers: {
    createProject: (state, action) => {
      // Here I am adding a project object to the project map
      var projectName = action.payload[0];
      state.projectMap[projectName] = {
        projectName: action.payload[0],
        clientName: action.payload[1],
        office: action.payload[2],
        color: action.payload[3],
        date: action.payload[4]
      }
      // console.log("ADDED PROJECT " + state.projectMap[projectName].office);
    }
  }
  });

  export const{createProject} = slice.actions;

  export const selectProjects = state => state.projectMap;

  export default slice.reducer;
