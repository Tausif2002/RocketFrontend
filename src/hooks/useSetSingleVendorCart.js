import { confirmAlert } from 'react-confirm-alert';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setCart, setCartCheckout, setCartProducts, setCartSubTotal } from '../model/reducer/cartReducer';
import api from '../api/api';
import * as newApi from "../api/apiCollection"


const useSingleSellerModal = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const user = useSelector(state => state.user)
    const cart = useSelector(state => state.cart)


    const handleSingleCart = async (product, variant) => {
        try {
            api.removeCart(user?.jwtToken).then((res) => res.json()).then(async (result) => {
                if (result?.status === 1) {
                    dispatch(setCart({ data: null }));
                    dispatch(setCartCheckout({ data: null }));
                    dispatch(setCartProducts({ data: [] }));
                    dispatch(setCartSubTotal({ data: 0 }));
                    const response = await newApi.addToCart({ product_id: product?.id, product_variant_id: variant?.id, qty: 1 })
                    if (response.status === 1) {
                        if (cart?.cartProducts?.find((product) => ((product?.product_id == product?.id) && (product?.product_variant_id == variant?.id)))?.qty == undefined) {
                            dispatch(setCart({ data: response }));
                            const updatedCartCount = { product_id: product?.id, product_variant_id: variant?.id, qty: 1 };
                            dispatch(setCartProducts({ data: [updatedCartCount] }));
                            dispatch(setCartSubTotal({ data: response?.sub_total }));
                        }
                    }

                }
            });

        } catch (error) {
            console.error("Error in handleSingleCart:", error);
            toast.error("An error occurred while processing the cart.");
        }
    };

    const showSingleSellerModal = (product, variant) => {
        confirmAlert({
            title: t('clear_cart_warning'),
            message: t('single_seller_warning'),
            buttons: [
                {
                    label: t("Ok"),
                    onClick: async () => {
                        await handleSingleCart(product, variant);
                    }
                },
                {
                    label: t('Cancel'),
                    onClick: () => {
                        console.log("Modal cancelled.");
                    }
                }
            ]
        });
    };

    return { showSingleSellerModal };
};

export default useSingleSellerModal;
