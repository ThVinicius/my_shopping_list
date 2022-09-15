import supertest from 'supertest'
import app from '../src/app'
import { prisma } from '../src/database'

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE items CASCADE;`
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Testa POST /items ', () => {
  it('Deve retornar 201, se cadastrado um item no formato correto', async () => {
    const body = {
      title: 'IPhone',
      url: 'https://google.com',
      description: 'celular caro',
      amount: 123
    }

    const result = await supertest(app).post('/items').send(body)
    expect(result.status).toEqual(201)
  })

  it('Deve retornar 409, ao tentar cadastrar um item que exista', async () => {
    const body = {
      title: 'IPhone',
      url: 'https://google.com',
      description: 'celular caro',
      amount: 123
    }

    await supertest(app).post('/items').send(body)

    const result = await supertest(app).post('/items').send(body)
    expect(result.status).toEqual(409)
  })
})

describe('Testa GET /items ', () => {
  it('Deve retornar status 200 e o body no formato de Array', async () => {
    const items = await supertest(app).get('/items')

    expect(items.status).toEqual(200)

    expect(Array.isArray(items.body)).toBe(true)
  })
})

describe('Testa GET /items/:id ', () => {
  it('Deve retornar status 200 e um objeto igual a o item cadastrado', async () => {
    const body = {
      title: 'IPhone',
      url: 'https://google.com',
      description: 'celular caro',
      amount: 123
    }

    await supertest(app).post('/items').send(body)

    const item = await prisma.items.findUnique({ where: { title: body.title } })

    delete item.id

    expect(item).toMatchObject(body)
  })
  it('Deve retornar status 404 caso não exista um item com esse id', async () => {
    const id = +Infinity

    const result = await supertest(app).post(`/items/${id}`).send()
    expect(result.status).toEqual(404)
  })
})
