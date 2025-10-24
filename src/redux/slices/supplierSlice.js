import {createAsyncThunk, createSlice}from '@reduxjs/toolkit';
import {http}from "../../components/Modules/http"
const API_URL=import.meta.env.VITE_API_URL

export const fetchSuppleirs = createAsyncThunk(
  "suppliers/fetchSuppleirs",
  async (_, { rejectWithValue }) => {
    try {
      const httpReq = http();
      const res = await httpReq.get(`${API_URL}/api/supplier/get/all`);
          return res.data; // should be array of suppliers
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || "Failed to fetch suppliers");
    }
  }
);

const initialState={
  suppliers:[],
  loading:false,
  error:null,
};

const supplierSlice=createSlice({
 name:"suppliers",
  initialState,
  reducers:{
    setSupplier:(state,action)=>{
      state.suppliers=action.payload;
    },
  },
  extraReducers:(builder)=>{
    builder
    .addCase(fetchSuppleirs.pending,(state)=>{
      state.loading=true;
      state.error=null;

    })
    .addCase(fetchSuppleirs.fulfilled,(state,action)=>{
      state.loading=false;
      state.suppliers=action.payload || [];
    })
    .addCase(fetchSuppleirs.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload|| [];
    });
  },

});

export const {setsupplier} =supplierSlice.actions;
export default supplierSlice.reducer;