import { configureStore } from '@reduxjs/toolkit'
import modalReducer from '../features/modals/modalSlice'
import projectTileReducer from '../features/chart/projectTileSlice.jsx'
import dataReducer from '../features/dataSlice'
import filtersReducer from '../features/filters/filterSlice'

export default configureStore({
  reducer: {
    modal: modalReducer,
    projectTile: projectTileReducer,
    data: dataReducer,
    filters: filtersReducer
  }
})
