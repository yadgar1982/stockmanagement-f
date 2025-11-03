import {createAsyncThunk, createSlice}from '@reduxjs/toolkit';

import {http}from "../../components/Modules/http"

const API_URL=import.meta.env.VITE_API_URL

export const fetchPurchase = createAsyncThunk(
  "purchase/fetchPurchase",
  async (_, { rejectWithValue }) => {
    try {
      const httpReq = http();
      const res = await httpReq.get(`${API_URL}/api/purchase/get`);
          return res.data; // should be array of purchase
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || "Failed to fetch purchase");
    }
  }
);

const initialState={
  purchase:[],
  loading:false,
  error:null,
};

const purchaseSlice=createSlice({
 name:"purchase",
  initialState,
  reducers:{
    setPurchase:(state,action)=>{
      state.purchase=action.payload;
    },
  },
  extraReducers:(builder)=>{
    builder
    .addCase(fetchPurchase.pending,(state)=>{
      state.loading=true;
      state.error=null;

    })
    .addCase(fetchPurchase.fulfilled,(state,action)=>{
      state.loading=false;
        state.purchase = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
    })
    .addCase(fetchPurchase.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload|| [];
    });
  },

});

export const {setPurchase} =purchaseSlice.actions;
export default purchaseSlice.reducer;