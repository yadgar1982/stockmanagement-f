import {createAsyncThunk, createSlice}from '@reduxjs/toolkit';

import {http}from "../../components/Modules/http"

const API_URL=import.meta.env.VITE_API_URL

export const fetchBranding = createAsyncThunk(
  "brandings/fetchBranding",
  async (_, { rejectWithValue }) => {
    try {
      const httpReq = http();
      const res = await httpReq.get(`${API_URL}/api/branding/get/all`);
          return res.data; // should be array of branding
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || "Failed to fetch branding");
    }
  }
);

const initialState={
  brandings:[],
  loading:false,
  error:null,
};

const brandingSlice=createSlice({
 name:"brandings",
  initialState,
  reducers:{
    setBranding:(state,action)=>{
      state.brandings=action.payload;
    },
  },
  extraReducers:(builder)=>{
    builder
    .addCase(fetchBranding.pending,(state)=>{
      state.loading=true;
      state.error=null;

    })
    .addCase(fetchBranding.fulfilled,(state,action)=>{
      state.loading=false;
        state.brandings = Array.isArray(action.payload) ? action.payload : action.payload.data || [];
    })
    .addCase(fetchBranding.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload|| [];
    });
  },

});

export const {setBranding} =brandingSlice.actions;
export default brandingSlice.reducer;