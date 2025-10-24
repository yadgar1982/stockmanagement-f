import {createAsyncThunk, createSlice}from '@reduxjs/toolkit';
import {http}from "../../components/Modules/http"
const API_URL=import.meta.env.VITE_API_URL

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const httpReq = http();
      const res = await httpReq.get(`${API_URL}/api/product/get/all`);
          return res.data; // should be array of products
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || "Failed to fetch products");
    }
  }
);

const initialState={
  products:[],
  loading:false,
  error:null,
};

const productSlice=createSlice({
 name:"products",
  initialState,
  reducers:{
    setproduct:(state,action)=>{
      state.products=action.payload;
    },
  },
  extraReducers:(builder)=>{
    builder
    .addCase(fetchProducts.pending,(state)=>{
      state.loading=true;
      state.error=null;

    })
    .addCase(fetchProducts.fulfilled,(state,action)=>{
      state.loading=false;
      state.products=action.payload || [];
    })
    .addCase(fetchProducts.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.payload|| [];
    });
  },

});

export const {setproduct} =productSlice.actions;
export default productSlice.reducer;