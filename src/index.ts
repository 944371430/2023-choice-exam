import express, {Application} from 'express'
import {string} from './base'

const app: Application = express()

app.listen(8000, (): void => {
    console.log(string)
})
