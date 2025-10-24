import {createAsyncThunk, createSlice}from '@reduxjs/toolkit';
import {http}from "../../components/Modules/http"
const API_URL=import.meta.env.VITE_API_URL

export const fetchDealer = createAsyncThunk(
  "dealers/fetchDelaer",
  async (_, { rejectWithValue }) => {
    try {
      const httpReq = http();
      const res = await httpReq.get(`${API_URL}/api/dealer/get/all`);
          return res.data; // should be array of dealers
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || "Failed to fetch dealers");
    }
  }
);

const initialState={
  dealers:[],
  loading:false,
  error:null,
};

const dealerSlice=createSlice({
 name:"dealers",
  initialState,
  reducers:{
    setdealer:(state,action)=>{
      state.dealers=action.payload;
    },
  },
  extraReducers:(builder)=>{
    builder
    .addCase(fetchDealer.pending,(state)=>{
      state.loading=true;
      state.error=null;

    })
    .addCase(fetchDealer.fulfilled,(state,action)=>{
      state.loading=false;
      state.dealers=action.payload || [];
    })
    .addCase(fetchDealer.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload|| [];
    });
  },

});

export const {setdealer} =dealerSlice.actions;
export default dealerSlice.reducer;