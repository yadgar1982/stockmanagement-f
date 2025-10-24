import axios from "axios";

export const http = (isToken = null) => {
  axios.defaults.baseURL = import.meta.env.VITE_ENDPOINT;

  if (isToken) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${isToken}`;
  }
  return axios; // <-- returning the global axios function
};

//trim data coding
export const trimData = (obj) => {
  const finalObj = {};
  for (let key in obj) {
    if (obj[key] != null) {
      // not null or undefined
      if (key === "iconName") {
        finalObj[key] = String(obj[key]).trim();
      } else {
        finalObj[key] = String(obj[key]).trim().toLowerCase();
      }
    } else {
      finalObj[key] = "";
    }
  }
  return finalObj;
};

export const fetcher = async (api,) => {
  try {
    const httpReq = http();
    const { data } = await httpReq.get(api);
    return data;
  } catch (err) {
    return null;
  }
};
