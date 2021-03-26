const config = require("../config/config")
const stripe = require('stripe')(config.stripeSK)

const getBalance = async (accountId) => {
  try {
    const balance = await stripe.balance.retrieve(function(err, balance) {
      
    });

    return balance;

  } catch(err) {
    console.log('StripeService getBalance error: ', err.message);
    throw new Error(err.message || "An error has occured while fetching Stripe balance.");
  }
};

const createLoginLink = async (accountId) => {
  console.log('Called createLoginLink for Stripe Express Dashbaord');
  try {
    const link = await stripe.accounts.createLoginLink(accountId);
    console.log('Login links=: ', link);
    return link;
  } catch(err) {
    console.log('StripeService createLoginLink error: ', err.message);
    throw new Error(err.message || "An error has occured while fetching login link from Stripe.");
  }
};

const createStripeAccountLink = async (accountId) => {
  console.log('Called createStripeAccountLink private function')

  try {
    const accountLinks = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: 'https://scoutd.com/reauth',
      return_url: 'https://scoutd.com/return',
      type: 'account_onboarding',
    });
    console.log('Account links: ', accountLinks);
    return accountLinks;
  } catch(err) {
    console.log('StripeService createStripeAccountLink error: ', err.message);
    throw new Error(err.message || "An error has occured while fetching account links from Stripe.");
  }
};

const createStripeAccount = async (email) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: email
    });

    console.log('Account from create new stripe account: ', JSON.stringify(account));
    console.log('Account from create new stripe account payouts enabled: ', account.payouts_enabled);
    return account;
  } catch(err) {
    console.log('StripeService createStripeAccount error: ', err.message);
    throw new Error(err.message || "An error has occured while creating Stripe account.");
  }
}
 
const getStripeAccountDetails = async (accountId) => {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    console.log('Account: ', JSON.stringify(account));
    return account;
  } catch(err) {
    console.log('StripeService getStripeAccountDetails error: ', err.message);
    throw new Error(err.message || "An error has occured while fetching stripe account");
  }
};

const createPayouts = async (amount, accountId) => {
  try {
    const payout = await stripe.payouts.create({
      amount: amount,
      currency: 'usd',
    }, {
      stripeAccount: accountId,
    });
    return payout;
  } catch(err) {
    console.log('StripeService createPayouts error: ', err.message);
    throw new Error(err.message || "An error has occured while creating Stripe payouts");
  }
};

const createTransferForPhotographer = async (missionId, amount, accountId) => {
  try {
    const transfer = await stripe.transfers.create({
      amount: amount,
      currency: 'usd',
      destination: accountId,
      transfer_group: 'Mission Id ' + missionId,
    });
    return transfer;
  } catch(err) {
    console.log('StripeService createPayouts error: ', err.message);
    throw new Error(err.message || "An error has occured while creating Stripe payouts");
  }
};

/* ==========================================================================
    Exports
    ========================================================================== */

module.exports = {
  getBalance,
  createLoginLink,
  createStripeAccountLink,
  createStripeAccount,
  getStripeAccountDetails,
  createPayouts,
  createTransferForPhotographer
};