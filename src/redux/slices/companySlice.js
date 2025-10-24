import {createAsyncThunk, createSlice}from '@reduxjs/toolkit';
import {http}from "../../components/Modules/http"
const API_URL=import.meta.env.VITE_API_URL

export const fetchCompany = createAsyncThunk(
  "companys/fetchCompany",
  async (_, { rejectWithValue }) => {
    try {
      const httpReq = http();
      const res = await httpReq.get(`${API_URL}/api/company/get/all`);
          return res.data; // should be array of companys
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || "Failed to fetch companys");
    }
  }
);

const initialState={
  companys:[],
  loading:false,
  error:null,
};

const companySlice=createSlice({
 name:"companys",
  initialState,
  reducers:{
    setcompany:(state,action)=>{
      state.companys=action.payload;
    },
  },
  extraReducers:(builder)=>{
    builder
    .addCase(fetchCompany.pending,(state)=>{
      state.loading=true;
      state.error=null;

    })
    .addCase(fetchCompany.fulfilled,(state,action)=>{
      state.loading=false;
      state.companys=action.payload || [];
    })
    .addCase(fetchCompany.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload|| [];
    });
  },

});

export const {setcompany} =companySlice.actions;
export default companySlice.reducer;