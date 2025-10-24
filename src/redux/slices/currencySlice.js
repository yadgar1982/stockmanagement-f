import {createAsyncThunk, createSlice}from '@reduxjs/toolkit';
import {http}from "../../components/Modules/http"
const API_URL=import.meta.env.VITE_API_URL

export const fetchCurrency = createAsyncThunk(
  "currencys/fetchCurrency",
  async (_, { rejectWithValue }) => {
    try {
      const httpReq = http();
      const res = await httpReq.get(`${API_URL}/api/currency/get/all`);
          return res.data; // should be array of currencys
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || "Failed to fetch currencys");
    }
  }
);

const initialState={
  currencies:[],
  loading:false,
  error:null,
};

const currencySlice=createSlice({
 name:"currencies",
  initialState,
  reducers:{
    setcurrency:(state,action)=>{
      state.currencies=action.payload;
    },
  },
  extraReducers:(builder)=>{
    builder
    .addCase(fetchCurrency.pending,(state)=>{
      state.loading=true;
      state.error=null;

    })
    .addCase(fetchCurrency.fulfilled,(state,action)=>{
      state.loading=false;
      state.currencies=action.payload || [];
    })
    .addCase(fetchCurrency.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload|| [];
    });
  },

});

export const {setcurrency} =currencySlice.actions;
export default currencySlice.reducer;