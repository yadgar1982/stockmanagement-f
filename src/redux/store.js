import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlice"
import customerReducer from "./slices/customerSlice"
import supplierReducer from "./slices/supplierSlice"
import companyReducer from "./slices/companySlice"
import stockReducer from "./slices/stockSlice"
import dealerReducer from "./slices/dealerSlice"
import currencyReducer from "./slices/currencySlice"
import brandingReducer from "./slices/brandingSlice"


export const store=configureStore({
  reducer:{
    products:productReducer,
    customers:customerReducer,
    suppliers:supplierReducer,
    company:companyReducer,
    stocks:stockReducer,
    dealers:dealerReducer,
    currencies:currencyReducer,
    brandings:brandingReducer,

  }
});