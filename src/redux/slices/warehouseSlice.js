import {createAsyncThunk, createSlice}from '@reduxjs/toolkit';

import {http}from "../../components/Modules/http"

const API_URL=import.meta.env.VITE_API_URL

export const fetchWarehouse = createAsyncThunk(
  "warehouse/fetchWarehouse",
  async (_, { rejectWithValue }) => {
    try {
      const httpReq = http();
      const res = await httpReq.get(`${API_URL}/api/warehouse/get`);
          return res.data; // should be array of warehiouse
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || "Failed to fetch warehouse");
    }
  }
);

const initialState={
  warehouse:[],
  loading:false,
  error:null,
};

const warehouesSlice=createSlice({
 name:"warehouse",
  initialState,
  reducers:{
    setBranding:(state,action)=>{
      state.warehouse=action.payload;
    },
  },
  extraReducers:(builder)=>{
    builder
    .addCase(fetchWarehouse.pending,(state)=>{
      state.loading=true;
      state.error=null;

    })
    .addCase(fetchWarehouse.fulfilled,(state,action)=>{
      state.loading=false;
        state.warehouse = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
    })
    .addCase(fetchWarehouse.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload|| [];
    });
  },

});

export const {setWarehouse} =warehouesSlice.actions;
export default warehouesSlice.reducer;