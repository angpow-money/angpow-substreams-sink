import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: 'https://safe-ostrich-20766.upstash.io',
  token: process.env.REDIS_TOKEN,
})

export default redis
