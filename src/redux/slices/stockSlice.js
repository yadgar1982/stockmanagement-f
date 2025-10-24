import {createAsyncThunk, createSlice}from '@reduxjs/toolkit';
import {http}from "../../components/Modules/http"
const API_URL=import.meta.env.VITE_API_URL

export const fetchStock = createAsyncThunk(
  "stocks/fetchStock",
  async (_, { rejectWithValue }) => {
    try {
      const httpReq = http();
      const res = await httpReq.get(`${API_URL}/api/stock/get/all`);
          return res.data; // should be array of stocks
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || "Failed to fetch stocks");
    }
  }
);

const initialState={
  stocks:[],
  loading:false,
  error:null,
};

const stockSlice=createSlice({
 name:"stocks",
  initialState,
  reducers:{
    setStock:(state,action)=>{
      state.stocks=action.payload;
    },
  },
  extraReducers:(builder)=>{
    builder
    .addCase(fetchStock.pending,(state)=>{
      state.loading=true;
      state.error=null;

    })
    .addCase(fetchStock.fulfilled,(state,action)=>{
      state.loading=false;
      state.stocks=action.payload || [];
    })
    .addCase(fetchStock.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload|| [];
    });
  },

});

export const {setStock} =stockSlice.actions;
export default stockSlice.reducer;