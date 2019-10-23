import { compose, join, toPairs, map, ifElse, is, curry, always, prop, when, propIs } from 'ramda'

const appendS = curry((s2: string, s: string) => s + s2)
const prependS = curry((s2: string, s: string) => s2 + s)

const roundBrackets = compose(prependS('('), appendS(')'))
const curlyBrackets = compose(prependS('{'), appendS('}'))
const squareBrackets = compose(prependS('['), appendS(']'))
const quotes = compose(prependS('"'), appendS('"'))

const arrayNormilize = compose(squareBrackets, join(','), map(when(is(String), quotes)))
const argNormalize = compose(when(is(Array), arrayNormilize), when(propIs(String, 'enum'), prop('enum')), when(is(String), quotes))
const argsFn = ifElse(is(Object), compose(
    roundBrackets,
    join(','),
    map(join(':')),
    toPairs,
    map(argNormalize),
), always(''))

const fieldsFn = ifElse(is(Array), compose(curlyBrackets, join(',')), always(''))

const actionFn = ({ name, fields, args }: IGraphQlAction) =>
    join('', [
        name,
        argsFn(args),
        fieldsFn(fields),
    ])

export const graphqlMutation = compose(prependS('mutation'), curlyBrackets, actionFn)
export const graphqlQuery = compose(prependS('query'), curlyBrackets, actionFn)

interface IGraphQlAction {
    name: string,
    args?: { [key: string]: string | number | { enum: string } | string[] | number[] },
    fields?: string[],
}
