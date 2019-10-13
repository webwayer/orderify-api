import { compose, join, toPairs, map, ifElse, is, curry, always, prop, when, propIs } from 'ramda'

const appendS = curry((s2: string, s: string) => s + s2)
const prependS = curry((s2: string, s: string) => s2 + s)

const roundBrackets = compose(prependS('('), appendS(')'))
const curlyBrackets = compose(prependS('{'), appendS('}'))
const quotes = compose(prependS('"'), appendS('"'))

const queryFn = compose(prependS('query'), curlyBrackets)
const mutationFn = compose(prependS('mutation'), curlyBrackets)

const argNormalize = compose(when(propIs(String, 'enum'), prop('enum')), when(is(String), quotes))
const argsFn = ifElse(is(Object), compose(
    roundBrackets,
    join(','),
    map(join(':')),
    toPairs,
    map(argNormalize),
), always(''))

const fieldsFn = ifElse(is(Array), compose(curlyBrackets, join(',')), always(''))

export const mutation = ({ name, fields, args }: IGraphQlAction) =>
    mutationFn(join('', [
        name,
        argsFn(args),
        fieldsFn(fields),
    ]))

export const query = ({ name, fields, args }: IGraphQlAction) =>
    queryFn(join('', [
        name,
        argsFn(args),
        fieldsFn(fields),
    ]))

interface IGraphQlAction {
    name: string,
    args?: { [key: string]: string | number | { enum: string } },
    fields?: string[],
}
