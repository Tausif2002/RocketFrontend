import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    reorderCart: []
}

export const reorderReducer = createSlice({
    name: "reorder",
    initialState,
    reducers: {
        addToReoderCart: (state, action) => {
            state.reorderCart = action.payload.data
        },
        crearReOrderCart:(state,action)
    }
})