import { Config } from 'prisma'

export default {
  skills: {
    agents: ['claude', 'cursor', 'agents', 'devin'],
  },
  orm: {
    adapter: {
      name: '@prisma/adapter-pg',
    },
    family: {
      name: 'postgres',
    },
    target: {
      name: 'ts',
    },
  },
} satisfies Config
