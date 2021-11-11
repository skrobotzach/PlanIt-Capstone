import { createSlice } from '@reduxjs/toolkit';

//Creating Slice Reducers and Actions for modals
// 

export const slice = createSlice({
  name: 'modal',
  initialState: {
    show: null,
    tilesList: [],
    cellClicked: [],
    taskData: []
  },
  reducers: {
    
    editTask: (state, action) => {
      state.show = 'editTask';
      if (action.payload != null){
        state.cellClicked = {...action.payload};
      }
      
    },
    updateTask: (state, action) => {
      state.show = 'updateTask';
      state.taskData = action.payload;
    },
    closeModal: state => {
      state.show = null
      state.cellClicked = null
    },

    openModal: (state,action) => {
      state.show = action.payload
    }
  },
});

// export const {  addEmployee, deleteEmployee,closeModal, editEmployee, addProject, deleteProject, editProject, editTask} = slice.actions;
export const {openModal,closeModal,editTask,updateTask} = slice.actions
export const selectModal = state => state.modal.show

// export const selectModal = state => state.modal.show;
export const selectTaskData = state => state.modal.taskData;
export const selectCell = state => state.modal.cellClicked;  // keep track of which cell was just clicked

export default slice.reducer;
