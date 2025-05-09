import React, { useEffect, useState, useMemo } from 'react';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { toast } from 'react-toastify';
import api from '../../api/api';
import './address.css';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'react-bootstrap';
import Loader from '../loader/Loader';
import { setAddress, setSelectedAddress } from '../../model/reducer/addressReducer';
import { BiCurrentLocation } from 'react-icons/bi';


const NewAddress = (props) => {
    const dispatch = useDispatch();

    const setting = useSelector(state => (state.setting));
    const user = useSelector(state => (state.user));

    const address = useSelector((state) => state.address);
    const city = useSelector((state) => state.city);

    const [addressDetails, setaddressDetails] = useState({
        name: '',
        mobile_num: '',
        alternate_mobile_num: '',
        address: '',
        landmark: '',
        city: '',
        area: '',
        pincode: '',
        state: '',
        country: '',
        address_type: 'Home',
        is_default: false,
    });

    const handleAddnewAddress = (e) => {
        e.preventDefault();

        let address = `${addressDetails.address}, ${addressDetails.landmark}, ${addressDetails.city}, ${addressDetails.area}, ${addressDetails.state}, ${addressDetails.country} ,${addressDetails.pincode}`;
        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode({
            'address': address
        })
            .then(result => {


                setlocalLocation({
                    lat: parseFloat(result.results[0].geometry.location.lat()),
                    lng: parseFloat(result.results[0].geometry.location.lng())
                });

                api.getCity(addressDetails.city, result.results[0].geometry.location.lat(), result.results[0].geometry.location.lng())
                    .then(resp => resp.json())
                    .then(res => {
                        if (res.status === 1) {
                            setisconfirmAddress(true);
                        }
                        else {
                            setisconfirmAddress(false);
                            toast.error(res.message);
                        }
                    });
            })
            .catch(error => {
                setisconfirmAddress(false);
                toast.error(`Cann't find address!! Please enter a valid address!`);
            });
    };


    const handleConfirmAddress = () => {
        let lat = center.lat;
        let lng = center.lng;
        if (!props.isAddressSelected) {
            props.setisLoader(true);
            api.addAddress(user?.jwtToken, addressDetails.name, addressDetails.mobile_num, addressDetails.address_type, addressDetails.address, addressDetails.landmark, addressDetails.area, addressDetails.pincode, addressDetails.city, addressDetails.state, addressDetails.country, addressDetails.alternate_mobile_num, lat, lng, addressDetails.is_default)
                .then(response => response.json())
                .then(result => {
                    if (result.status === 1) {
                        toast.success('Succesfully Added Address!');
                        setaddressDetails({
                            name: '',
                            mobile_num: '',
                            alternate_mobile_num: '',
                            address: '',
                            landmark: '',
                            city: '',
                            area: '',
                            pincode: '',
                            state: '',
                            country: '',
                            address_type: 'Home',
                            is_default: false,
                        });
                        api.getAddress(user?.jwtToken)
                            .then(resp => resp.json())
                            .then(res => {
                                props.setisLoader(false);
                                if (res.status === 1) {
                                    dispatch(setAddress({ data: res.data }));
                                    // dispatch({ type: ActionTypes.SET_ADDRESS, payload: res.data });
                                }
                                if (res.data.find((element) => element.is_default == 1)) {
                                    dispatch(setSelectedAddress({ data: res.data.find((element) => element.is_default == 1) }));
                                    // dispatch({ type: ActionTypes.SET_SELECTED_ADDRESS, payload: res.data.find((element) => element.is_default == 1) });
                                }
                            })
                            .catch(error => console.log(error));

                    }
                })
                .catch(error => console.log(error));
        }
        else {
            props.setisLoader(true);
            api.updateAddress(user?.jwtToken, address.selected_address.id, addressDetails.name, addressDetails.mobile_num, addressDetails.address_type, addressDetails.address, addressDetails.landmark, addressDetails.area, addressDetails.pincode, addressDetails.city, addressDetails.state, addressDetails.country, addressDetails.alternate_mobile_num, lat, lng, addressDetails.is_default)
                .then(response => response.json())
                .then(result => {
                    if (result.status === 1) {
                        toast.success('Succesfully Updated Address!');
                        props.setIsAddressSelected(false);
                        setaddressDetails({ name: '', mobile_num: '', alternate_mobile_num: '', address: '', landmark: '', city: '', area: '', pincode: '', state: '', country: '', address_type: 'Home', is_default: false, });
                        setisconfirmAddress(false);
                        api.getAddress(user?.jwtToken)
                            .then(resp => resp.json())
                            .then(res => {
                                props.setisLoader(false);
                                if (res.status === 1) {
                                    // dispatch({ type: ActionTypes.SET_ADDRESS, payload: res.data });
                                    dispatch(setAddress({ data: res.data }));
                                }
                                if (result.data.find((element) => element.is_default == 1)) {
                                    dispatch(setSelectedAddress({ data: res.data.find((element) => element.is_default == 1) }));
                                    //dispatch({ type: ActionTypes.SET_SELECTED_ADDRESS, payload: result.data.find((element) => element.is_default == 1) });
                                }
                            })
                            .catch(error => console.log(error));

                    }
                })
                .catch(error => console.log(error));
        }

        props.setshow(false);
    };

    useEffect(() => {
        if (props.isAddressSelected && address.selected_address) {
            setaddressDetails({
                name: address.selected_address.name,
                mobile_num: address.selected_address.mobile,
                alternate_mobile_num: address.selected_address.alternate_mobile,
                address: address.selected_address.address,
                landmark: address.selected_address.landmark,
                city: address.selected_address.city,
                area: address.selected_address.area,
                pincode: address.selected_address.pincode,
                state: address.selected_address.country,
                country: address.selected_address.country,
                address_type: address.selected_address.type,
                is_default: address.selected_address.is_default === 1 ? true : false,
            });
        }
        if (!props.isAddressSelected) {
            setlocalLocation({
                lat: parseFloat(city.city ? city.city.latitude : 0),
                lng: parseFloat(city.city ? city.city.longitude : 0),
            });
        }
    }, [props.isAddressSelected, address?.selected_address]);

    const [isconfirmAddress, setisconfirmAddress] = useState(false);
    const [localLocation, setlocalLocation] = useState({
        lat: parseFloat(city.city ? city.city.latitude : 0),
        lng: parseFloat(city.city ? city.city.longitude : 0),
    });
    const [addressLoading, setaddressLoading] = useState(false);
    const center = useMemo(() => ({
        lat: localLocation.lat,
        lng: localLocation.lng,
    }), [localLocation.lat, localLocation.lng]);

    useEffect(() => {
        if (addressDetails.address !== '') {
            const geocoder = new window.google.maps.Geocoder();
            const fullAddress = `${addressDetails.address}, ${addressDetails.city}, ${addressDetails.state}, ${addressDetails.country}`;
            geocoder.geocode({ address: fullAddress }, (results, status) => {
                if (status === 'OK') {
                    const location = results[0].geometry.location;
                    setlocalLocation({ lat: location.lat(), lng: location.lng() });
                } else {
                    console.error('Geocode was not successful for the following reason:', status);
                }
            });
        }
    }, [addressDetails]);



    const onMarkerDragStart = () => {
        setaddressLoading(true);
    };

    const onMarkerDragEnd = (e) => {

        const prev_latlng = {
            lat: localLocation.lat,
            lng: localLocation.lng,
        };
        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode({
            location: {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
            }
        })
            .then(response => {
                if (response.results[0]) {
                    setlocalLocation({
                        lat: parseFloat(response.results[0].geometry.location.lat()),
                        lng: parseFloat(response.results[0].geometry.location.lng()),
                    });

                    let address = '', country = '', pincode = '', landmark = '', area = '', state_ = '', city = '';
                    response.results[0].address_components.forEach((res_add) => {
                        if (res_add.types.includes('premise') || res_add.types.includes('plus_code') || res_add.types.includes('route')) {
                            address = res_add.long_name;
                        }
                        if (res_add.types.includes("political")) {
                            landmark = res_add.long_name;
                        }
                        if (res_add.types.includes('administrative_area_level_3') || res_add.types.includes('administrative_area_level_2') || res_add.types.includes("sublocality")) {
                            area = res_add.long_name;
                        }
                        if (res_add.types.includes("administrative_area_level_1")) {
                            state_ = res_add.long_name;
                        }
                        if (res_add.types.includes('country')) {
                            country = res_add.long_name;
                        }
                        if (res_add.types.includes('postal_code')) {
                            pincode = res_add.long_name;
                        }
                        if (res_add.types.includes("locality")) {
                            city = res_add.long_name;
                        }
                    });

                    if (address === '' || area === '') {
                        setlocalLocation({
                            lat: prev_latlng.lat,
                            lng: prev_latlng.lng
                        });
                    }
                    else {
                        setaddressDetails(state => ({
                            ...state,
                            address: address,
                            landmark: landmark,
                            city: city,
                            area: area,
                            pincode: pincode,
                            country: country,
                            state: state_,
                        }));
                    }


                    setaddressLoading(false);
                }
                else {
                }
            })
            .catch(error => {
                console.log(error);
            });
    };
    const { t } = useTranslation();

    const mapContainerStyle = {
        width: "100%",
        height: window.innerWidth > 990 ? "100%" : "400px"
    };
    const handleCurrentLocationClick = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latLng = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setlocalLocation({
                    lat: parseFloat(latLng.lat),
                    lng: parseFloat(latLng.lng),
                });
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({
                    location: latLng
                }).then(response => {
                    if (response.results[0]) {
                        let address = '', country = '', pincode = '', landmark = '', area = '', state_ = '', city = '';
                        response.results[0].address_components.forEach((res_add) => {
                            if (res_add.types.includes('premise') || res_add.types.includes('plus_code') || res_add.types.includes('route')) {
                                address = res_add.long_name;
                            }
                            if (res_add.types.includes("political")) {
                                landmark = res_add.long_name;
                            }
                            if (res_add.types.includes('administrative_area_level_3') || res_add.types.includes('administrative_area_level_2') || res_add.types.includes("sublocality")) {
                                area = res_add.long_name;
                            }
                            if (res_add.types.includes("administrative_area_level_1")) {
                                state_ = res_add.long_name;
                            }
                            if (res_add.types.includes('country')) {
                                country = res_add.long_name;
                            }
                            if (res_add?.types?.includes('postal_code')) {
                                pincode = res_add?.long_name;
                            }
                            if (res_add.types.includes("locality")) {
                                city = res_add.long_name;
                            }
                        });
                        setaddressDetails(state => ({
                            ...state,
                            address: address,
                            landmark: landmark,
                            city: city,
                            area: area,
                            pincode: pincode,
                            country: country,
                            state: state_,
                        }));

                    }
                    else {
                        console.log("No result found");
                    }
                }).catch(error => {
                    console.log(error);
                });
                if (!("geolocation" in navigator)) {
                    console.log("geolocation not present in navigator");
                }
            });
    };

    return (
        <>
            <Modal
                className='new-address'
                show={props.show}
                backdrop="static"
                keyboard={true}
                size="xl"
            >

                <Modal.Header>

                    <div className="d-flex flex-row justify-content-between header w-100 align-items-center">
                        <h5>{t("new_address")}</h5>
                        <button type="button" className="" onClick={() => {
                            setaddressDetails({
                                name: '',
                                mobile_num: '',
                                alternate_mobile_num: '',
                                address: '',
                                landmark: '',
                                city: '',
                                area: '',
                                pincode: '',
                                state: '',
                                country: '',
                                address_type: 'Home',
                                is_default: false,
                            });
                            props.setshow(false);
                            setisconfirmAddress(false);
                            props.setIsAddressSelected(false);
                        }} style={{ width: "30px" }}><AiOutlineCloseCircle /></button>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div className="flex d-lg-flex flex-row gap-5">
                        <div className='w-100 mapWrapper'>
                            <button whiletap={{ scale: 0.6 }} className="current-location-button"
                                onClick={handleCurrentLocationClick}>
                                <BiCurrentLocation className='mx-3' width="40px" height="40px" />
                            </button>
                            <GoogleMap zoom={10} center={center} mapContainerStyle={mapContainerStyle} className="map-marker">
                                <MarkerF position={center} draggable={true} onDragStart={onMarkerDragStart} onDragEnd={onMarkerDragEnd}>
                                </MarkerF>
                            </GoogleMap>
                        </div>

                        {addressLoading
                            ? <div className="d-flex justify-content-center">
                                <Loader width="570px" height="675px" />
                            </div>
                            :
                            <>
                                <div className="">

                                    <form onSubmit={(e) => { e.preventDefault(); handleConfirmAddress(); }} className='address-details-wrapper'>

                                        <div className='contact-detail-container'>
                                            <h3>{t("contact_details")}</h3>
                                            <div className='contact-details'>
                                                <input type='text' style={{ width: "100%" }} placeholder={t('Name')} value={addressDetails.name} required onChange={(e) => {

                                                    setaddressDetails(state => ({ ...state, name: e.target.value }));
                                                }}></input>
                                                <input required type='number' min={1} onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()} inputMode='numeric' style={{ width: "100%" }} placeholder={t('mobile_number')} value={addressDetails.mobile_num} onChange={(e) => {
                                                    if (addressDetails?.mobile_num?.length < 16) {
                                                        setaddressDetails(state => ({ ...state, mobile_num: e.target.value }));
                                                    } else if (e.target.value?.length < addressDetails?.mobile_num?.length) {
                                                        setaddressDetails(state => ({ ...state, mobile_num: e.target.value }));

                                                    }
                                                }} />
                                                <input type='number' style={{ width: "100%" }} onKeyDown={(evt) => ["e", "E", "+", "-"].includes(evt.key) && evt.preventDefault()} placeholder={t('alt_mobile_no')} value={addressDetails.alternate_mobile_num} onChange={(e) => {
                                                    if (addressDetails?.alternate_mobile_num?.length < 16) {
                                                        setaddressDetails(state => ({ ...state, alternate_mobile_num: e.target.value }));
                                                    } else if (e.target.value?.length < addressDetails?.alternate_mobile_num?.length) {
                                                        setaddressDetails(state => ({ ...state, alternate_mobile_num: e.target.value }));

                                                    }
                                                }} ></input>
                                            </div>
                                        </div>

                                        <div className='address-detail-container'>
                                            <h3>{t("address_details")}</h3>
                                            <div className='address-details'>
                                                <input type='text' style={{ width: "100%" }} placeholder={t("address")} value={addressDetails.address} onChange={(e) => {

                                                    setaddressDetails(state => ({ ...state, address: e.target.value }));
                                                }} required></input>
                                                <input type='text' style={{ width: "100%" }} placeholder={t("enter_landmark")} value={addressDetails.landmark} onChange={(e) => {

                                                    setaddressDetails(state => ({ ...state, landmark: e.target.value }));
                                                }} required></input>
                                                <input type='text' style={{ width: "100%" }} placeholder={t('enter_area')} value={addressDetails.area} onChange={(e) => {

                                                    setaddressDetails(state => ({ ...state, area: e.target.value }));
                                                }} required></input>
                                                <input type='text' style={{ width: "100%" }} placeholder={t('enter_pincode')} value={addressDetails.pincode} onChange={(e) => {

                                                    setaddressDetails(state => ({ ...state, pincode: e.target.value }));
                                                }} required></input>
                                                <input type='text' className='' style={{ width: "100%" }} required value={addressDetails.city} placeholder={t('enter_city')} onChange={
                                                    (e) => setaddressDetails(state => ({ ...state, city: e.target.value }))
                                                }></input>
                                                <input type='text' style={{ width: "100%" }} placeholder={t('enter_state')} value={addressDetails.state} onChange={(e) => {

                                                    setaddressDetails(state => ({ ...state, state: e.target.value }));
                                                }} required></input>
                                                <input type='text' style={{ width: "100%" }} placeholder={t("enter_country")} value={addressDetails.country} onChange={(e) => {

                                                    setaddressDetails(state => ({ ...state, country: e.target.value }));
                                                }} required></input>
                                            </div>
                                        </div>

                                        <div className='address-type-container'>
                                            <h3>{t("address_type")}</h3>
                                            <div className='address-type'>
                                                <input type='radio' name='address-type' id='home-address' onChange={() => {
                                                    setaddressDetails(state => ({ ...state, address_type: 'Home' }));
                                                }} autoComplete='off' defaultChecked={true} />
                                                <label htmlFor='home-address'>{t("adress_type_home")}</label>


                                                <input type='radio' name='address-type' id='office-address' onChange={() => {
                                                    setaddressDetails(state => ({ ...state, address_type: 'Office' }));
                                                }} autoComplete='off' />
                                                <label htmlFor='office-address'>
                                                    {t("address_type_office")}
                                                </label>


                                                <input type='radio' name='address-type' id='other-address' onChange={() => {
                                                    setaddressDetails(state => ({ ...state, address_type: 'Other' }));
                                                }} autoComplete='off' />
                                                <label htmlFor='other-address'>
                                                    {t("address_type_other")}

                                                </label>
                                            </div>
                                            <div className='default-address'>
                                                <input type="checkbox" className='mx-2' defaultValue={true} onChange={() => {
                                                    setaddressDetails(state => ({ ...state, is_default: !addressDetails.is_default }));

                                                }} checked={addressDetails.is_default} />
                                                {t("set_as_default_address")}
                                            </div>
                                        </div>

                                        <button type='submit' className='confirm-address' >{t("confirm_location")}</button>


                                    </form>

                                </div>
                            </>
                        }
                    </div>

                </Modal.Body>
            </Modal>
        </>
    );
};

export default NewAddress;
