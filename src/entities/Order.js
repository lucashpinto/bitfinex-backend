const { v4 } = require("uuid");

const ORDER_STATUSES_ENUM = {
  NEW: "New",
  PARTIALLY_EXECUTED: "Partially Executed",
  PROCESSED: "Processed",
  FULLY_EXECUTED: "Fully Executed",
};

class Order {
  constructor({ type, price, quantity, peerId, symbol }) {
    this.id = v4();
    this.type = type;
    this.price = price;
    this.quantity = quantity;
    this.peerId = peerId;
    this.symbol = symbol;

    this.status = ORDER_STATUSES_ENUM.NEW;
  }
}

module.exports = {
  Order,
  ORDER_STATUSES_ENUM,
};
