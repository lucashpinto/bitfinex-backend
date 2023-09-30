require("dotenv").config();
const GRAPE_URL = "http://127.0.0.1:30001";

const { v4 } = require("uuid");
const OrderBook = require("./OrderBook");
const Link = require("grenache-nodejs-link");
const _ = require("lodash");
const { sleep } = require("../utils");
const { PeerRPCServer, PeerRPCClient } = require("grenache-nodejs-http");

const BROADCAST_EVENT_NAME = "orderbook:add";
const TIMEOUT_IN_MS = 1000 * 60 * 24;

/*
 * Class responsible to handle communication with other peers and communication with their own instance of the orderbook
 * A peer contains both the RPCServer and the RPCClient to make it a real peer-to-peer network
 */
class Peer {
  constructor() {
    this.peerId = v4();
    this.link = null;
    this.orderBook = new OrderBook(this.peerId);
    this.peerClient = null;
  }

  async init() {
    const link = new Link({ grape: GRAPE_URL });
    link.init();

    this.link = link;

    this._startPeerServer();
    // I'm sure theres a better way to wait until the server is ready
    await sleep(10000);
    this._startPeerClient();
  }

  placeOrder(order) {
    this.orderBook.placeOrder(order);
    this.broadcastOrder(order);
  }

  _handleReceivedOrder = (order) => {
    console.log(`Received order on ${BROADCAST_EVENT_NAME}. Order `, order);
    this.orderBook.addNewOrder(order);
  };

  _startPeerServer() {
    console.log(`Initializing server for peer ${this.peerId}`);

    const serverPeer = new PeerRPCServer(this.link, { timeout: TIMEOUT_IN_MS });
    const service = serverPeer.transport("server");

    serverPeer.init();
    service.listen(_.random(1000) + 1024);

    this.link.startAnnouncing(BROADCAST_EVENT_NAME, service.port, {
      interval: 1000,
    });

    service.on("request", (rid, key, payload, handler) => {
      if (payload.order) {
        this._handleReceivedOrder(payload.order);
      }
    });
  }

  _startPeerClient() {
    console.log(`Initializing client for peer ${this.peerId}`);

    const peerClient = new PeerRPCClient(this.link, { timeout: TIMEOUT_IN_MS });
    peerClient.init();

    this.peerClient = peerClient;
  }

  broadcastOrder = (order) => {
    console.log("Broadcasting order to other peers", order);

    // using map instead of request to make sure it goes to all peers
    this.peerClient.map(
      BROADCAST_EVENT_NAME,
      { order },
      { timeout: TIMEOUT_IN_MS },
      (err, data) => {
        if (err) {
          console.error(err);
          process.exit(-1);
        }
      },
    );
  };
}

module.exports = Peer;
