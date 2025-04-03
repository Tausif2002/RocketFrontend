import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    status: 'loading', //fulfill
    setting: null,
    payment_setting: null,
    settingsFetchedTime: new Date(),
    paymentSettingsFetchTime: new Date(),
    isPopUpView: false
};
export const settingReducer = createSlice({
    name: "setting",
    initialState,
    reducers: {
        setSetting: (state, action) => {
            state.status = "fulfilled";
            state.setting = action.payload.data;
            state.settingsFetchedTime = new Date();
        },
        setPaymentSetting: (state, action) => {
            state.status = "fulfill";
            state.payment_setting = action.payload.data;
            state.paymentSettingsFetchTime = new Date();
        },
        setPopUpScene: (state, action) => {
            state.isPopUpView = action.payload.data
        }
    }
});
export const { setSetting, setPaymentSetting, setPopUpScene } = settingReducer.actions;
export default settingReducer.reducer;