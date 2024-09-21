import 'dotenv/config'
import supabase from "./supabase.js"
import redis from './redis.js'

const o = {
  evtTxHash: 'cdfaab7121eb2b4a1ff0abcdbe4986c45fe0c18f10b37c64d2d04d8b43cb9ce7',
  evtIndex: 1,
  evtBlockTime: '2024-09-20T19:07:13Z',
  evtBlockNumber: '82563569',
  donator: 'EavgMam7LXUsfTjbyyvGcqrB26Q=',
  id: '7',
  token: 'AAAAAAAAAAAAAAAAAAAAAAAAAAA=',
  tokenAmount: '10000000000000',
  quantity: '1'
}



function b64ToHex(s) {
  const b = Buffer.from(s, 'base64')
  return '0x' + b.toString('hex')
}


async function insert() {
  const p = {
    tx_hash: '0x' + o.evtTxHash,
    log_index: o.evtIndex,
    block_time: o.evtBlockTime,
    block_number: o.evtBlockNumber,
    donator: b64ToHex(o.donator),
    angpow_id: o.id,
    token: b64ToHex(o.token),
    token_amount: o.tokenAmount,
    quantity: o.quantity,
  }

  await supabase.from('event_angpow_created')
    .insert(p)
    .then(console.log)
}

async function insertReceived() {

  const o = {
    "evtTxHash": "c3f812c30bb93c1691712fc351c158beb851baee4222c92c6c947c9ac2f91cde",
    "evtIndex": 0,
    "evtBlockTime": "2024-09-21T03:25:54Z",
    "evtBlockNumber": "82668684",
    "recipient": "JhkU0RQ0vsxX3nu+jIJVG2SOUQ8=",
    "id": "1",
    "token": "AAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    "tokenAmount": "10000000000000",
    "index": "1"
  }

  const p = {
    tx_hash: '0x' + o.evtTxHash,
    log_index: o.evtIndex || 0,
    block_time: o.evtBlockTime,
    block_number: o.evtBlockNumber,
    angpow_id: o.id,
    token: b64ToHex(o.token),
    token_amount: o.tokenAmount,
    index: o.index,
  }


  await supabase.from('event_angpow_received')
    .insert(p)
    .then(console.log)
}

async function redisSetCursor() {
  //await redis.set('cursor', 'something').then(console.log)
  const cursor = await redis.get('cursor')
  console.log(cursor)
  //await redis.del('cursor').then(console.log)

}
//main()
//
//
insertReceived()
