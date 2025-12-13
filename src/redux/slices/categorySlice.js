import {createAsyncThunk, createSlice}from '@reduxjs/toolkit';
import {http}from "../../components/Modules/http"
const API_URL=import.meta.env.VITE_API_URL

export const fetchCategory = createAsyncThunk(
  "category/fetchCategory",
  async (_, { rejectWithValue }) => {
    try {
      const httpReq = http();
      const res = await httpReq.get(`${API_URL}/api/category/get/all`);
          return res.data; // should be array of category
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || "Failed to fetch category");
    }
  }
);

const initialState={
  category:[],
  loading:false,
  error:null,
};

const categorySlice=createSlice({
 name:"category",
  initialState,
  reducers:{
    setcategory:(state,action)=>{
      state.category=action.payload;
    },
  },
  extraReducers:(builder)=>{
    builder
    .addCase(fetchCategory.pending,(state)=>{
      state.loading=true;
      state.error=null;

    })
    .addCase(fetchCategory.fulfilled,(state,action)=>{
      state.loading=false;
      state.category=action.payload || [];
    })
    .addCase(fetchCategory.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload|| [];
    });
  },

});

export const {setCategory} =categorySlice.actions;
export default categorySlice.reducer;