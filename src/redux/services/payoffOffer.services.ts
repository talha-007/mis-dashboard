import { callAPi } from "./http-common";

const getPayoffOffer = () => callAPi.get(`/api/installments/payoff-offers`);

const acceptPayoffOffer = (loanApplicationId: string) => callAPi.post(`/api/installments/accept-payoff`, { loanApplicationId });

const payoffOfferService = {
  getPayoffOffer,
  acceptPayoffOffer,
};

export default payoffOfferService;