/*
数据库相关操作和业务逻辑统一放在此处。
数据库操作前要执行 await connectClient()，连接后才能操作。
所有导出方法请以 db 开头。
 */
import {MongoClient, ObjectId} from 'mongodb'
import {fail, ok, ReturnCode} from './returnType'

const client = new MongoClient('mongodb://localhost:27017', {serverSelectionTimeoutMS: 1000})
const collection = client.db('choice-exam')
const paper = collection.collection('paper')
const question = collection.collection('question')
const test = collection.collection('test')
const timeLimit = 7200000 // 单场测试限时，单位毫秒
const connectClient = async () => await client.connect()
export const dbGetAllPapers = async (skip: number, limit: number) => {
    await connectClient()
    return ok({papers: await paper.find().skip(skip).limit(limit).toArray()})
}
export const dbGetAllQuestionsByPaper = async (paper_id: ObjectId, need_answer: boolean) => {
    await connectClient()
    // 构建 projection
    const projection: { [key: string]: number } = {_id: 0, paper_id: 0}
    if (!need_answer) projection.answer = 0
    // 获取试卷各问题
    const result = (await paper.aggregate([{$match: {_id: paper_id}}, {
        $lookup: {
            from: 'question',
            localField: '_id',
            foreignField: 'paper_id',
            as: 'questions',
            pipeline: [{$project: projection}]
        }
    }]).toArray())[0]
    // 若试卷不存在
    if (result === undefined) return fail('There is no paper with specified id.')
    return ok({questions: result.questions})
}
export const dbTestPaper = async (account: string, paper_id: ObjectId) => {
    await connectClient()
    // 若测试中
    if (await test.countDocuments({user_identifier: account}) > 0) return fail('You are testing.')
    // 获取结果
    const result = await dbGetAllQuestionsByPaper(paper_id, false)
    // 记录测试信息
    if (result.code === ReturnCode.OK) await test.insertOne({
        paper_id,
        user_identifier: account,
        answers: {},
        start: new Date()
    })
    return result
}
export const dbMarkAnswer = async (account: string, number: number, answer: string) => {
    await connectClient()
    // 获取测试信息
    const info = (await test.aggregate([{$match: {user_identifier: account}}, {
        $lookup: {
            from: 'question',
            localField: 'paper_id',
            foreignField: 'paper_id',
            as: 'result'
        }
    }, {$set: {count: {$size: '$result'}}}, {$project: {_id: 0, answers: 1, count: 1, start: 1}}]).toArray())[0]
    // 若不在测试中
    if (info === undefined) return fail('You are not testing.')
    // info 类型检查
    if (!((info: any): info is {
        answers: { [key: number]: string },
        count: number,
        start: Date
    } => {
        info.start = new Date(info.start)
        if (!('answers' in info && 'count' in info && 'start' in info && typeof info.count === 'number' && info.start instanceof Date)) return false
        for (let key in info.answers) if (typeof info.answers[key] !== 'string') return false
        return true
    })(info)) return fail('info check failed.', {info, check: info.start instanceof Date})
    const {answers, count: questionsCount, start} = info
    // 若超时
    if (Date.now() - start.valueOf() > timeLimit) return fail("Time's up. Please submit your paper.")
    // 若所答题目号超出范围
    if (number < 1 || number > questionsCount) return fail('Number out of range.')
    // 记录答案
    answers[number] = answer
    const count = (await test.updateOne({user_identifier: account}, {$set: {answers: answers}})).modifiedCount
    // 若数据库中更新数不为 1
    if (count !== 1) return fail(`${count} document(s) modified. Expected 1.`)
    return ok()
}
export const dbSubmit = async (account: string) => {
    await connectClient()
    // 获取测试信息
    const result = (await test.aggregate([{$match: {user_identifier: account}}, {
        $lookup: {
            from: "question",
            localField: "paper_id",
            foreignField: "paper_id",
            as: "questions"
        }
    }, {$project: {answers: 1, questions: 1, _id: 0}}]).toArray())[0]
    // 若不在测试中
    if (result === undefined) return fail('You are not testing.')
    // result 类型检查
    if (!((result: any): result is {
        answers: { [key: number]: string },
        questions: [{ number: number, answer: string }]
    } => {
        if (!('answers' in result && 'questions' in result)) return false
        const {answers, questions} = result
        for (let a in answers) if (typeof answers[a] !== 'string') return false
        if (!(questions instanceof Array)) return false
        for (let q of questions) if (!('number' in q && 'answer' in q && typeof q.number === 'number' && typeof q.answer === 'string')) return false
        return true
    })(result)) return fail('result check failed.', {result})
    const {answers, questions} = result
    // 删除数据库测试信息
    await test.deleteOne({user_identifier: account})
    // 计算得分
    let score = 0
    for (let q of questions) if (answers[q.number] === q.answer) ++score
    return ok({score})
}
export const dbGetTest = async (account: string) => {
    await connectClient()
    // 获取当前测试信息
    const info = (await test.aggregate([{$match: {user_identifier: account}}, {
        $lookup: {
            from: "paper",
            localField: "paper_id",
            foreignField: "_id",
            as: "paper"
        }
    }, {
        $lookup: {
            from: "question",
            localField: "paper_id",
            foreignField: "paper_id",
            as: "questions",
            pipeline: [{$project: {_id: 0, paper_id: 0, answer: 0}}]
        }
    }, {$set: {paper_name: {$arrayElemAt: ["$paper", 0]}}}, {$set: {paper_name: "$paper_name.name"}}, {
        $project: {
            _id: 0,
            questions: 1,
            answers: 1,
            paper_name: 1,
            start: 1
        }
    }]).toArray())[0]
    // 若不在测试中
    if (info === undefined) return fail('You are not testing.')
    // info 类型检查
    if (!((info: any): info is { start: Date } => {
        return 'answers' in info && 'questions' in info && 'paper_name' in info && 'start' in info && info.start instanceof Date
    })(info)) return fail('info check failed.', {info})
    // 若超时
    if (Date.now() - info.start.valueOf() > timeLimit) return fail("Time's up. Please submit your paper.")
    return ok(info)
}
