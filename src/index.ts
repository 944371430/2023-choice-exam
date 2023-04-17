import express, {Application} from 'express'

const app: Application = express()

app.listen(8000, (): void => {
    console.log('Hello world!')
})
