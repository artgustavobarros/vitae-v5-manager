import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'

import { protegerHttp } from './server/seguranca-http'

const executar = createStartHandler(defaultStreamHandler)

export default {
  fetch: (request: Request) => protegerHttp(request, executar, !import.meta.env.DEV),
}
