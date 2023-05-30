/*
路由处理相关操作统一放在此处。同时负责检查请求参数有效性。
 */
import {Request, Response, Router} from 'express'
import {fail, ReturnCode, ReturnMsg} from './returnType'
import {dbGetAllPapers, dbGetAllQuestionsByPaper, dbGetTest, dbMarkAnswer, dbSubmit, dbTestPaper} from './mongo'
import {request} from 'undici'
import Dispatcher from 'undici/types/dispatcher'
import {getObjectId, selfError} from './selfError'

export const send = (res: Response, data: ReturnMsg) => res.send(data) // 统一发送数据
const callApi = async (req: Dispatcher.ResponseData): Promise<ReturnMsg> => {
    // const obj = JSON.parse(await req.body.text())
    // todo debug
    const obj = {code: 200, msg: '0', data: {account: '0'}}
    // end debug
    if (!('code' in obj && 'msg' in obj && 'data' in obj)) throw new selfError('Response of api is not a ReturnMsg.')
    return obj
} // 统一访问外部接口，要求数据返回格式必须是 { code: any, msg: any, data: any }，req 参数请使用 await request(url) 构建
const getUserAccountByRequest = async (req: Request) => {
    const {code, data} = await callApi(await request(`http://localhost/api/users/getUser?cookies=${req.cookies}`)) // todo 修改 url
    if (code !== ReturnCode.OK) throw new selfError('getUser responded a failure.')
    if (!('account' in data)) throw new selfError('getUser did not responded an account.')
    if (typeof data.account !== 'string') throw new selfError('account is not a string.')
    return data.account
}
export const router = Router()

router.get('/getAllPapers', async (req, res) => {
    const {skip, limit} = req.query
    send(res, typeof skip !== 'string' || typeof limit !== 'string' ? fail('Parameters invalid to get all papers.') : await dbGetAllPapers(Number(skip), Number(limit)))
})
router.get('/getAllQuestionsByPaper', async (req, res) => {
    const {paper_id, need_answer} = req.query
    send(res, typeof paper_id !== 'string' || typeof need_answer !== 'string' || !['true', 'false'].includes(need_answer) ? fail('Parameters invalid to get all questions by paper.') : await dbGetAllQuestionsByPaper(getObjectId(paper_id), need_answer === 'true'))
})
router.get('/testPaper', async (req, res) => {
    const {paper_id} = req.query
    send(res, typeof paper_id !== 'string' ? fail('Parameters invalid to test a paper.') : await dbTestPaper(await getUserAccountByRequest(req), getObjectId(paper_id)))
})
router.get('/markAnswer', async (req, res) => {
    const {number, answer} = req.query
    send(res, typeof number !== 'string' || typeof answer !== 'string' ? fail('Parameters invalid to mark an answer.') : await dbMarkAnswer(await getUserAccountByRequest(req), Number(number), answer))
})
router.get('/submit', async (req, res) => send(res, await dbSubmit(await getUserAccountByRequest(req))))
router.get('/getTest', async (req, res) => send(res, await dbGetTest(await getUserAccountByRequest(req))))
router.get('/', async (req, res) => res.sendStatus(200))
