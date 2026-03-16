import { callAPi } from '../http-common';

/**
 * Payoff Offer Service (Customer)
 * Handles payoff offers for customer installments.
 * Endpoints: /api/installments/*
 */

const getPayoffOffer = () => callAPi.get(`/api/installments/payoff-offers`);

const acceptPayoffOffer = (loanApplicationId: string) =>
  callAPi.post(`/api/installments/accept-payoff`, { loanApplicationId });

const payoffOfferService = {
  getPayoffOffer,
  acceptPayoffOffer,
};

export default payoffOfferService;
