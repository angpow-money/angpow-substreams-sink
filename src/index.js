import 'dotenv/config'
import {
  createRequest,
  streamBlocks,
  createAuthInterceptor,
  createRegistry,
  fetchSubstream
} from '@substreams/core';
import { createConnectTransport } from "@connectrpc/connect-node";
import { getCursor } from "./cursor.js";
import { isErrorRetryable } from "./error.js";
import { handleResponseMessage } from "./handlers.js"
import fs from 'fs'
import { Package } from '@substreams/core/proto';

const TOKEN = process.env.SUBSTREAMS_API_TOKEN
//const ENDPOINT = "https://mainnet.eth.streamingfast.io"
const ENDPOINT = "https://arbsepolia.substreams.pinax.network:443"
//const SPKG = "https://spkg.io/streamingfast/ethereum-explorer-v0.1.2.spkg"
const SPKG = "./angpao.spkg"
const MODULE = "map_events"
const START_BLOCK = '82565015'
//const STOP_BLOCK = '+1'
const STOP_BLOCK = undefined

/*
    Entrypoint of the application.
    Because of the long-running connection, Substreams will disconnect from time to time.
    The application MUST handle disconnections and commit the provided cursor to avoid missing information.
*/
const main = async () => {
  const pkg = await fetchPackage()
  const registry = createRegistry(pkg);

  const transport = createConnectTransport({
    baseUrl: ENDPOINT,
    interceptors: [createAuthInterceptor(TOKEN)],
    useBinaryFormat: true,
    jsonOptions: {
      typeRegistry: registry,
    },
  });

  // The infite loop handles disconnections. Every time an disconnection error is thrown, the loop will automatically reconnect
  // and start consuming from the latest commited cursor.
  while (true) {
    try {
      await stream(pkg, registry, transport);

      // Break out of the loop when the stream is finished
      break;
    } catch (e) {
      if (!isErrorRetryable(e)) {
        console.log(`A fatal error occurred: ${e}`)
        throw e
      }
      console.log(`A retryable error occurred (${e}), retrying after backoff`)
      console.log(e)
      // Add backoff from a an easy to use library
    }
  }
}

const fetchPackage = async () => {
  const b = fs.readFileSync(SPKG)
  return Package.fromBinary(b)
  //return await fetchSubstream(SPKG)
}

const stream = async (pkg, registry, transport) => {
  const request = createRequest({
    substreamPackage: pkg,
    outputModule: MODULE,
    productionMode: false,
    startBlockNum: Number(START_BLOCK),
    stopBlockNum: STOP_BLOCK,
    startCursor: await getCursor() ?? undefined
  });

  // Stream the blocks
  for await (const response of streamBlocks(transport, request)) {
    /*
        Decode the response and handle the message.
        There different types of response messages that you can receive. You can read more about the response message in the docs:
        https://substreams.streamingfast.io/documentation/consume/reliability-guarantees#the-response-format
    */
    await handleResponseMessage(response.message, registry);
  }
}

main()
