# The BFX Challenge
#### Author: [Lucas Pinto](https://linkedin.com/in/lucashenriquepinto)

## Architecture decisions

### Peer

In order to make sure the solution implements a real distributed network architecture, 
a Peer object contains both the RPCServer and RPCClient on it, allowing it to communicate to other nodes without the
need of a server that acts like a middleware.

### Orderbook

Each Peer has their own instance of the Orderbook.

Everytime that a new Order is added to the Orderbook, it will be first added locally to the 
instance's orderbook, then broadcasted to all other Peers connected to the network

The state of the Orderbook is not sync'ed among Peers. Sync'ing it during initialization would probably be a good idea
if I had more time to do it.

### Order

A Order can either be a 'bid' or a 'ask' -- after it's fully executed, it will have quantity = 0 and status = Fully Executed.
 
By design, a order won't be removed from the Orderbook once it's fully executed, this was on purpose
to allow extending the capabilities easily in the future (allowing a soft-delete while also being able to have the information
for audit and debug purposes, among other things).

## How to run

First, install dependencies

```
npm install
```

Then run a few grape servers

```
grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```

Then just run index.js using Node.

For each Peer that you want to connect to the network:

```
node index.js
```

Then, every 5 seconds a new order will be added by each Peer and you can see the processing of the orders in the console.
## Limitations

### Architecture

At first I tried implementing a Pub/Sub pattern, which is supposed to be supported by Grenache, 
but after trying many different approaches it became clear that Grenache Pub/Sub is not mature enough to be used.

Also, the underlying socket implementation could probably be improved as apparently the socket hangs randomly.

### Documentation

Documentation is pretty sparse for Grenache, so I had to look too much in the code instead of reading the documentation.

Also, a few things like the difference between `client.map()` and `client.request()` is not clear at all, not even in the code.

### Things I'd implement if I had more time

My next effort would be to implement a proper lock mechanism to avoid race conditions and adding more events so that the Peers would be 
notified of transactions that happened on other peers -- this would avoid a Peer being able to execute a order that another
Peer already executed, for instance.

Then I would add tests and run some stress test to make sure the solution is scalable.

After that, some smoke testing, and possibly changing a bit the way I'm using Grenache to avoid random issues such as socket hanging
, including trying to use a custom version based of grenache-node-base, which would give me more flexibility to try some different approaches to bypass some limitations.
