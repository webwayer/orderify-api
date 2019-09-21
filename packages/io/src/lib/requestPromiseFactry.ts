import request, { RequestPromiseAPI } from "request-promise"

export function requestPromiseFactory() {
    return request
}

export type IRequest = RequestPromiseAPI
