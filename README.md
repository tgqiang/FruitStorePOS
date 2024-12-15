# RAiD Software Engineering Challenge

This is a simple POS web-app for a fruit store, implemented as a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

The web-app is currently deployed on `Vercel`, accessible at this [link](https://fruitstorepos.vercel.app/).

The database used by the web-app is deployed on [Neon](https://neon.tech/).

## Getting Started

This project uses the more performant `pnpm` instead of `npm` as the package manager, as recommended by `Next.js`.

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## User Stories Implemented

The following mandatory user stories are implemented:

- (1) As a customer, I want to see a list of fruits that are available to buy (complete with stock and pricing information), so that I can decide which fruits I want to buy.
- (2) As a customer, I want to keep track of the fruits and quantity that I have shortlisted (including the total amount I need to pay), so that I can adjust my purchasing decisions as I shop.
- (3) As a customer, I want to submit my order of the fruits I selected, so that I can complete my purchase when I am done shopping. Assume that payment is done separate from this POS application.
- (4) As an owner, I want to see the orders that my customers have submitted, so that I can fulfill their orders.

The following optional user stories are implemented:

- (11) As a customer, I want to be able to use the app on my phone so I can shop on the go.
- (12) As a customer, I want my order shortlist to be saved so that I can continue shopping on my device layer, even if I have not logged in.
- (15) As an owner, I do not want my customers to be able to see the whole store's order history, or amend my stocks, or perform any actions that should only be available for me.