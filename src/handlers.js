import { writeCursor } from "./cursor.js";
import supabase from "./supabase.js";
import { objectToJsonString } from "./util.js";

/*
    Handle BlockScopedData messages.
    You will receive this message whenever a new block is created in the blockchain.
*/

function b64ToHex(s) {
  const b = Buffer.from(s, 'base64')
  return '0x' + b.toString('hex')
}

const handleBlockScopedDataMessage = async (response, registry) => {
  const output = response.output?.mapOutput;
  const cursor = response.cursor;

  if (output !== undefined) {
    const message = output.unpack(registry);
    if (message === undefined) {
      throw new Error(`Failed to unpack output of type ${output.typeUrl}`);
    }

    // Cursor writing MUST happen after you have successfully processed the message. Otherwise, you risk "skipping" data.
    const outputAsJson = response.output.toJson({ typeRegistry: registry });

    let events = []
    outputAsJson.mapOutput.angpaoAngpowCreateds?.forEach(o => {

      const p = {
        tx_hash: '0x' + o.evtTxHash,
        log_index: o.evtIndex || 0,
        block_time: o.evtBlockTime,
        block_number: o.evtBlockNumber,
        donator: b64ToHex(o.donator),
        angpow_id: o.id,
        token: b64ToHex(o.token),
        token_amount: o.tokenAmount,
        quantity: o.quantity,
      }
      events.push(p)
    })

    if (events.length > 0) {
      await supabase.from('event_angpow_created')
        .insert(events)
        .then(console.log)
    }

    await writeCursor(cursor);
  }
}

/*
    Handle BlockUndoSignal messages.
    You will receive this message after a fork has happened in the blockchain.

    Because of the fork, you have probably read incorrect blocks in the "handleBlockScopedDataMessage" function,
    so you must rewind back to the last valid block.
*/
const handleBlockUndoSignalMessage = async (response) => {
  const lastValidBlock = response.lastValidBlock;
  const lastValidCursor = response.lastValidCursor;

  /* The blockchain you are streaming from undo 1 or more blocks and you must now handle that case.
     The field `response.message.<last_valid_block>` contains the last valid block, you must undo whatever
     has been done prior that (so for data where `block_number > last_valid_block`). Once undo, you must also
     write the `response.message.<last_valid_cursor>`. In this example, we just print the undo signal and write the cursor.
  */
  console.log(`Blockchain undo 1 or more blocks, returning to valid block #${lastValidBlock.num} (${lastValidBlock.id})`);

  await writeCursor(lastValidCursor);
}

export const handleResponseMessage = async (message, registry) => {
  switch (message.case) {
    case "blockScopedData":
      handleBlockScopedDataMessage(message.value, registry);
      break;

    case "blockUndoSignal":
      handleBlockUndoSignalMessage(message.value);
      break;
    case "progress":
      handleProgressMessage(message.value)
  }
}

export const handleProgressMessage = progress => {
  console.log(`Progress: ${objectToJsonString(progress)}`)
}
