import {createAsyncThunk, createSlice}from '@reduxjs/toolkit';

import {http}from "../../components/Modules/http"

const API_URL=import.meta.env.VITE_API_URL

export const fetchPayment = createAsyncThunk(
  "payment/fetchPayment",
  async (_, { rejectWithValue }) => {
    try {
      const httpReq = http();
      const res = await httpReq.get(`${API_URL}/api/payment/get`);
          return res.data; // should be array of payment
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || "Failed to fetch payment");
    }
  }
);

const initialState={
  payment:[],
  loading:false,
  error:null,
};

const paymentSlice=createSlice({
 name:"payments",
  initialState,
  reducers:{
    setpayment:(state,action)=>{
      state.payment=action.payload;
    },
  },
  extraReducers:(builder)=>{
    builder
    .addCase(fetchPayment.pending,(state)=>{
      state.loading=true;
      state.error=null;

    })
    .addCase(fetchPayment.fulfilled,(state,action)=>{
      state.loading=false;
        state.payment = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
    })
    .addCase(fetchPayment.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload|| [];
    });
  },

});

export const {setpayment} =paymentSlice.actions;
export default paymentSlice.reducer;