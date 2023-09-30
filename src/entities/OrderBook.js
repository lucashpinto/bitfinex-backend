const { ORDER_STATUSES_ENUM } = require("./Order");

/*
 * Stores in-memory the orders in two distinct arrays for asks and bids
 * Each Peer has their own instance of a OrderBook.
 */
class OrderBook {
  constructor(peerId = undefined) {
    this.asks = [];
    this.bids = [];
    this.peerId = peerId;
  }

  _prepareOrdersForProcessing() {
    // sorting to make it easier to find best matches
    this.bids.sort((a, b) => b.price - a.price);
    this.asks.sort((a, b) => a.price - b.price);
  }

  _getPendingBids() {
    return this.bids.filter(
      (order) => order.status !== ORDER_STATUSES_ENUM.FULLY_EXECUTED,
    );
  }

  _getPendingAsks() {
    return this.asks.filter(
      (order) => order.status !== ORDER_STATUSES_ENUM.FULLY_EXECUTED,
    );
  }

  processOrders() {
    /*
     * While there are pending orders (i.e: has not fully executed orders for both ask and bid), it tries to execute it
     * When there's no other order to try to execute, it stops running.
     */
    while (
      this._getPendingBids().length > 0 &&
      this._getPendingAsks().length > 0
    ) {
      const bestBid = this._getPendingBids()[0];
      const bestAsk = this._getPendingAsks()[0];

      if (bestBid.price >= bestAsk.price) {
        const matchedQuantity = Math.min(bestBid.quantity, bestAsk.quantity);
        console.log(
          `Executed order: ${matchedQuantity} ${bestAsk.symbol}(s) at $${bestAsk.price}`,
        );

        bestBid.quantity -= matchedQuantity;
        bestAsk.quantity -= matchedQuantity;

        bestBid.status =
          bestBid.quantity === 0
            ? ORDER_STATUSES_ENUM.FULLY_EXECUTED
            : ORDER_STATUSES_ENUM.PARTIALLY_EXECUTED;
        bestAsk.status =
          bestAsk.quantity === 0
            ? ORDER_STATUSES_ENUM.FULLY_EXECUTED
            : ORDER_STATUSES_ENUM.PARTIALLY_EXECUTED;
      } else {
        break;
      }
    }
  }

  /*
   * Adds an order received from the network to its own local orderbook instance, while trying to match it as well
   */
  addNewOrder(order) {
    if (order.peerId !== this.peerId) {
      console.log(
        `Adding new order received from network for peer ${this.peerId}`,
        order,
      );

      this._addOrderToLocalOrderbook(order);
      this._prepareOrdersForProcessing();
      this.processOrders();

      console.log(`Current bids for ${this.peerId}`, this.bids);
      console.log(`Current asks for ${this.peerId}`, this.asks);
    }
  }

  /*
   * Adds a order locally
   */
  placeOrder(order) {
    console.log(`Placing order for ${this.peerId}`, order);

    this._addOrderToLocalOrderbook(order);
  }

  /*
   * Private function just to avoid repeating code
   */
  _addOrderToLocalOrderbook(order) {
    if (order.type === "bid") {
      this.bids.push(order);
    } else if (order.type === "ask") {
      this.asks.push(order);
    }
  }
}

module.exports = OrderBook;
