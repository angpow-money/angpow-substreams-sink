import fs from "fs";

//import redis from "./redis.js"

const CURSOR_FILE = process.env.NODE_ENV === "production" ? "/data/cursor" : "./cursor"
console.log(CURSOR_FILE)

export const getCursor = async () => {
  try {
    //const cursor = await redis.get('cursor')
    //return cursor
    return await fs.promises.readFile(CURSOR_FILE)
  } catch (e) {
    return undefined
  }
}

// In this example, the cursor is persisted in a file.
export const writeCursor = async cursor => {
  try {
    await fs.promises.writeFile(CURSOR_FILE, cursor)
    //await redis.set('cursor', cursor).then(console.log)
  } catch (e) {
    console.error(e)
    throw new Error("COULD_NOT_COMMIT_CURSOR")
  }
}

export const removeCursor = () => {
    return fs.rmSync(CURSOR_FILE)
}
