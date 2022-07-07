import 'dotenv/config'
import { createVendiaClient } from '@vendia/client'
import { defer, from, mergeAll } from 'rxjs'

const client = createVendiaClient({
    apiUrl: process.env.GRAPHQL_URL,
    websocketsUrl: process.env.GRAPHQL_WEBSOCKETS_URL,
    apiKey: process.env.API_KEY,
})

const { entities } = client

const SHAPES = [
    {
        name: 'square',
        num_sides: 4,
    },
    {
        name: 'circle',
        num_sides: 1,
    },
    {
        name: 'triangle',
        num_sides: 3,
    },
]

const COLORS = [
    'green',
    'blue',
    'yellow',
    'red',
]

const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
  }

const createShape = () => {
    const shape = SHAPES[getRandomInt(SHAPES.length)]
    shape.color = COLORS[getRandomInt(COLORS.length)]

    return entities.shape.add(shape).catch(e => {
        console.error(e)
        throw e
    })
}

const run = async () => {
    const requests = []
    let counter = 0;

    for (let i = 0; i < process.env.TRANSACTIONS_TO_GENERATE; i++) {
        requests.push(defer(() => { 
            console.log(counter);
            counter++
            return from(createShape())
        }))
    }

    from(requests)
        .pipe(mergeAll(process.env.CONCURRENCY))
        .subscribe()
}

run()