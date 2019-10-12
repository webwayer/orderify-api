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
) as unknown as (args: IGraphQlAction['args']) => string
const fieldsFn = compose(curlyBrackets, join(',')) as (fields: IGraphQlAction['fields']) => string

export const mutation = ({ name, fields, args }: IGraphQlAction) =>
    mutationFn(join('', [
        name,
        ifElse(identity, argsFn, always(''))(args),
        ifElse(identity, fieldsFn, always(''))(fields),
    ]))

export const query = ({ name, fields, args }: IGraphQlAction) =>
    queryFn(join('', [
        name,
        ifElse(identity, argsFn, always(''))(args),
        ifElse(identity, fieldsFn, always(''))(fields),
    ]))

interface IGraphQlAction {
    name: string,
    args?: { [key: string]: string | number },
    fields?: string[],
}
