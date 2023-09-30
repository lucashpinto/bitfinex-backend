"use strict";

const Peer = require("./entities/Peer");
const { generateRandomInteger } = require("./utils");
const { Order } = require("./entities/Order");

const TIME_IN_MS_TO_ADD_NEW_MOCK_ORDER = 5000;

(async () => {
  const peer = new Peer();
  await peer.init();

  setInterval(() => {
    const mockedOrder = new Order({
      type: Math.random() > 0.5 ? "bid" : "ask",
      quantity: generateRandomInteger(1, 5),
      symbol: "BTC",
      price: generateRandomInteger(1, 3),
      peerId: peer.peerId,
    });

    peer.placeOrder(mockedOrder);
  }, TIME_IN_MS_TO_ADD_NEW_MOCK_ORDER);
})();
