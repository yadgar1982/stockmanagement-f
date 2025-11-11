import {createAsyncThunk, createSlice}from '@reduxjs/toolkit';

import {http}from "../../components/Modules/http"

const API_URL=import.meta.env.VITE_API_URL

export const fetchSales = createAsyncThunk(
  "sale/fetchSales",
  async (_, { rejectWithValue }) => {
    try {
      const httpReq = http();
      const res = await httpReq.get(`${API_URL}/api/sale/get`);
          return res.data; // should be array of sale
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || "Failed to fetch sale");
    }
  }
);

const initialState={
  sale:[],
  loading:false,
  error:null,
};

const saleSlice=createSlice({
 name:"sale",
  initialState,
  reducers:{
    setSale:(state,action)=>{
      state.sale=action.payload;
    },
  },
  extraReducers:(builder)=>{
    builder
    .addCase(fetchSales.pending,(state)=>{
      state.loading=true;
      state.error=null;

    })
    .addCase(fetchSales.fulfilled,(state,action)=>{
      state.loading=false;
        state.sale = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
    })
    .addCase(fetchSales.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload|| [];
    });
  },

});

export const {setSale} =saleSlice.actions;
export default saleSlice.reducer;