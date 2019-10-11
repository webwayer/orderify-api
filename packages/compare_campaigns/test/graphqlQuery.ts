import { compose, join, toPairs, map, ifElse, identity, is, curry, always } from 'ramda'

const appendS = curry((s2: string, s: string) => s + s2)
const prependS = curry((s2: string, s: string) => s2 + s)

const roundBrackets = compose(prependS('('), appendS(')'))
const curlyBrackets = compose(prependS('{'), appendS('}'))
const quotes = compose(prependS('"'), appendS('"'))

const queryFn = compose(prependS('query'), curlyBrackets)
const mutationFn = compose(prependS('mutation'), curlyBrackets)
const argsFn = compose(
    roundBrackets,
    join(','),
    map(join(':')),
    toPairs,
    map(ifElse(is(String), quotes, identity)),
) as unknown as (args: IArgs) => string
const fieldsFn = compose(curlyBrackets, join(',')) as (fields: string[]) => string

export const mutation = (name: string, args: IArgs, fields: string[]) =>
    mutationFn(join('', [name, ifElse(identity, argsFn, always(''))(args), fieldsFn(fields)]))

export const query = (name: string, fields: string[], args?: IArgs) =>
    queryFn(join('', [name, ifElse(identity, argsFn, always(''))(args), fieldsFn(fields)]))

interface IArgs {
    [key: string]: string | number
}
