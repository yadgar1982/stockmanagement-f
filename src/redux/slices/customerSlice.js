import {createAsyncThunk, createSlice}from '@reduxjs/toolkit';
import {http}from "../../components/Modules/http"
const API_URL=import.meta.env.VITE_API_URL

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const httpReq = http();
      const res = await httpReq.get(`${API_URL}/api/customer/get/all`);
          return res.data; // should be array of customers
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || "Failed to fetch customers");
    }
  }
);

const initialState={
  customers:[],
  loading:false,
  error:null,
};

const customerSlice=createSlice({
 name:"customers",
  initialState,
  reducers:{
    setCustomer:(state,action)=>{
      state.customers=action.payload;
    },
  },
  extraReducers:(builder)=>{
    builder
    .addCase(fetchCustomers.pending,(state)=>{
      state.loading=true;
      state.error=null;

    })
    .addCase(fetchCustomers.fulfilled,(state,action)=>{
      state.loading=false;
      state.customers=action.payload || [];
    })
    .addCase(fetchCustomers.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload|| [];
    });
  },

});

export const {setCustomer} =customerSlice.actions;
export default customerSlice.reducer;